/**
 * Zero-dependency outbound proxy support for the Antigravity adapter.
 *
 * Supported proxy schemes:
 *   http://[user:pass@]host:port     HTTP CONNECT tunnel
 *   https://[user:pass@]host:port    HTTP CONNECT tunnel over TLS to the proxy
 *   socks5://[user:pass@]host:port   SOCKS5, target hostname resolved locally
 *   socks5h://[user:pass@]host:port  SOCKS5, target hostname resolved by the proxy
 *   socks://...                      alias of socks5h
 *
 * Resolution order (first non-empty wins):
 *   1. ANTIGRAVITY_PROXY / NOAGY_PROXY environment variable
 *   2. Proxy saved in Settings > Antigravity (setConfiguredProxy)
 *   3. HTTPS_PROXY / HTTP_PROXY / ALL_PROXY (upper or lower case), honouring NO_PROXY
 *
 * The literal values "direct" / "none" / "off" disable proxying at that level.
 * With no proxy resolved, `proxyFetch` simply delegates to the global fetch.
 */
import { request as httpRequest } from "node:http";
import { connect as netConnect } from "node:net";
import { connect as tlsConnect } from "node:tls";
import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import { Readable } from "node:stream";
import { createBrotliDecompress, createGunzip, createInflate } from "node:zlib";

const DIRECT_VALUES = new Set(["direct", "none", "off", "false", "0"]);
const SUPPORTED_PROTOCOLS = new Set(["http:", "https:", "socks:", "socks5:", "socks5h:"]);
const DEFAULT_PROXY_PORTS = { "http:": 80, "https:": 443, "socks:": 1080, "socks5:": 1080, "socks5h:": 1080 };
const MAX_REDIRECTS = 10;
const NULL_BODY_STATUSES = new Set([101, 204, 205, 304]);

let configuredProxy = "";

/** Parses and validates a proxy URL. Returns undefined for empty / "direct" values. */
export function parseProxyUrl(raw) {
  const value = typeof raw === "string" ? raw.trim() : "";
  if (!value || DIRECT_VALUES.has(value.toLowerCase())) return undefined;
  let url;
  try {
    url = new URL(value.includes("://") ? value : `http://${value}`);
  } catch {
    throw new Error(`Invalid proxy URL: ${redactProxyUrl(value)}`);
  }
  const protocol = url.protocol.toLowerCase();
  if (!SUPPORTED_PROTOCOLS.has(protocol)) {
    throw new Error(`Unsupported proxy scheme "${protocol}". Use http://, https://, socks5:// or socks5h://`);
  }
  if (!url.hostname) throw new Error(`Proxy URL has no host: ${redactProxyUrl(value)}`);
  const port = url.port ? Number(url.port) : DEFAULT_PROXY_PORTS[protocol];
  return {
    protocol: protocol === "socks:" ? "socks5h:" : protocol,
    host: url.hostname.replace(/^\[|\]$/g, ""),
    port,
    username: url.username ? decodeURIComponent(url.username) : "",
    password: url.password ? decodeURIComponent(url.password) : "",
  };
}

/** Hides credentials so proxy URLs can be logged or shown in the UI. */
export function redactProxyUrl(raw) {
  if (typeof raw !== "string") return "";
  return raw.replace(/\/\/([^/@]*)@/, (_, auth) => (auth ? "//***@" : "//"));
}

/** Validates and normalizes a proxy string for persistence ("" means none). */
export function normalizeProxySetting(raw) {
  const value = typeof raw === "string" ? raw.trim() : "";
  if (!value) return "";
  if (DIRECT_VALUES.has(value.toLowerCase())) return "direct";
  parseProxyUrl(value);
  return value.includes("://") ? value : `http://${value}`;
}

export function setConfiguredProxy(raw) {
  configuredProxy = typeof raw === "string" ? raw.trim() : "";
}

export function getConfiguredProxy() {
  return configuredProxy;
}

function envValue(...names) {
  for (const name of names) {
    const value = process.env[name] ?? process.env[name.toLowerCase()];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return undefined;
}

function bypassedByNoProxy(target) {
  const raw = envValue("NO_PROXY");
  if (!raw) return false;
  const host = target.hostname.toLowerCase().replace(/^\[|\]$/g, "");
  const port = target.port || (target.protocol === "https:" ? "443" : "80");
  for (const entry of raw.split(/[\s,]+/)) {
    if (!entry) continue;
    if (entry === "*") return true;
    let [pattern, patternPort] = entry.toLowerCase().split(/:(?=\d+$)/);
    if (patternPort && patternPort !== port) continue;
    pattern = pattern.replace(/^\*?\./, "");
    if (host === pattern || host.endsWith(`.${pattern}`)) return true;
  }
  return false;
}

/** Describes where the active proxy setting comes from (for diagnostics / UI). */
export function describeProxy() {
  const describe = (source, raw) => {
    const isDirect = DIRECT_VALUES.has(raw.toLowerCase());
    return { source, url: isDirect ? "" : redactProxyUrl(raw) };
  };
  const fromEnv = envValue("ANTIGRAVITY_PROXY", "NOAGY_PROXY");
  if (fromEnv) return describe("env:ANTIGRAVITY_PROXY", fromEnv);
  if (configuredProxy) return describe("settings", configuredProxy);
  const system = envValue("HTTPS_PROXY", "HTTP_PROXY", "ALL_PROXY");
  if (system) return { source: "env:HTTPS_PROXY", url: redactProxyUrl(system) };
  return { source: "none", url: "" };
}

/** Returns the parsed proxy to use for `target` (a URL), or undefined for a direct connection. */
export function resolveProxyFor(target) {
  const explicit = envValue("ANTIGRAVITY_PROXY", "NOAGY_PROXY") ?? (configuredProxy || undefined);
  if (explicit) return parseProxyUrl(explicit);
  if (bypassedByNoProxy(target)) return undefined;
  const system =
    target.protocol === "https:"
      ? envValue("HTTPS_PROXY", "ALL_PROXY")
      : envValue("HTTP_PROXY", "ALL_PROXY");
  return parseProxyUrl(system);
}

function abortError(signal) {
  return signal?.reason ?? new DOMException("This operation was aborted", "AbortError");
}

/**
 * Reads from `socket` until `predicate(buffer)` returns a byte count >= 0 (consumed length).
 * Uses paused-mode "readable" reads so the socket never switches to flowing mode and can be
 * handed to tls.connect / http.request afterwards without losing bytes.
 */
function readUntil(socket, predicate, signal) {
  return new Promise((resolve, reject) => {
    let buffer = Buffer.alloc(0);
    const cleanup = () => {
      socket.off("readable", onReadable);
      socket.off("error", onError);
      socket.off("close", onClose);
      signal?.removeEventListener("abort", onAbort);
    };
    const onReadable = () => {
      let chunk;
      while ((chunk = socket.read()) !== null) {
        buffer = Buffer.concat([buffer, chunk]);
        let consumed;
        try {
          consumed = predicate(buffer);
        } catch (error) {
          cleanup();
          reject(error);
          return;
        }
        if (consumed >= 0) {
          cleanup();
          const rest = buffer.subarray(consumed);
          if (rest.length) socket.unshift(rest);
          resolve(buffer.subarray(0, consumed));
          return;
        }
      }
    };
    const onError = (error) => {
      cleanup();
      reject(error);
    };
    const onClose = () => {
      cleanup();
      reject(new Error("Proxy closed the connection during handshake"));
    };
    const onAbort = () => {
      cleanup();
      socket.destroy();
      reject(abortError(signal));
    };
    socket.on("readable", onReadable);
    socket.once("error", onError);
    socket.once("close", onClose);
    signal?.addEventListener("abort", onAbort, { once: true });
    onReadable();
  });
}

function waitForConnect(socket, event, signal) {
  return new Promise((resolve, reject) => {
    const cleanup = () => {
      socket.off(event, onConnect);
      socket.off("error", onError);
      signal?.removeEventListener("abort", onAbort);
    };
    const onConnect = () => {
      cleanup();
      resolve(socket);
    };
    const onError = (error) => {
      cleanup();
      reject(error);
    };
    const onAbort = () => {
      cleanup();
      socket.destroy();
      reject(abortError(signal));
    };
    socket.once(event, onConnect);
    socket.once("error", onError);
    signal?.addEventListener("abort", onAbort, { once: true });
  });
}

async function openProxySocket(proxy, signal) {
  if (proxy.protocol === "https:") {
    const socket = tlsConnect({
      host: proxy.host,
      port: proxy.port,
      servername: isIP(proxy.host) ? undefined : proxy.host,
      ALPNProtocols: ["http/1.1"],
    });
    return waitForConnect(socket, "secureConnect", signal);
  }
  const socket = netConnect({ host: proxy.host, port: proxy.port });
  return waitForConnect(socket, "connect", signal);
}

function basicAuth(proxy) {
  return `Basic ${Buffer.from(`${proxy.username}:${proxy.password}`).toString("base64")}`;
}

function formatHostPort(host, port) {
  return isIP(host) === 6 ? `[${host}]:${port}` : `${host}:${port}`;
}

async function httpConnectTunnel(socket, proxy, host, port, signal) {
  const authority = formatHostPort(host, port);
  const lines = [`CONNECT ${authority} HTTP/1.1`, `Host: ${authority}`];
  if (proxy.username || proxy.password) lines.push(`Proxy-Authorization: ${basicAuth(proxy)}`);
  socket.write(`${lines.join("\r\n")}\r\n\r\n`);
  const head = await readUntil(
    socket,
    (buffer) => {
      const index = buffer.indexOf("\r\n\r\n");
      if (index < 0 && buffer.length > 64 * 1024) throw new Error("Proxy CONNECT response too large");
      return index < 0 ? -1 : index + 4;
    },
    signal,
  );
  const statusLine = head.toString("latin1").split("\r\n", 1)[0];
  const status = Number(statusLine.split(" ")[1]);
  if (status !== 200) {
    socket.destroy();
    const hint = status === 407 ? " (proxy authentication required)" : "";
    throw new Error(`Proxy CONNECT to ${authority} failed: ${statusLine}${hint}`);
  }
  return socket;
}

const SOCKS5_ERRORS = {
  1: "general SOCKS server failure",
  2: "connection not allowed by ruleset",
  3: "network unreachable",
  4: "host unreachable",
  5: "connection refused",
  6: "TTL expired",
  7: "command not supported",
  8: "address type not supported",
};

async function socks5Tunnel(socket, proxy, host, port, signal) {
  const wantsAuth = Boolean(proxy.username || proxy.password);
  socket.write(Buffer.from(wantsAuth ? [0x05, 0x02, 0x00, 0x02] : [0x05, 0x01, 0x00]));
  const greeting = await readUntil(socket, (buffer) => (buffer.length >= 2 ? 2 : -1), signal);
  if (greeting[0] !== 0x05) throw new Error("Proxy is not a SOCKS5 server");
  const method = greeting[1];
  if (method === 0x02) {
    if (!wantsAuth) throw new Error("SOCKS5 proxy requires username/password authentication");
    const user = Buffer.from(proxy.username);
    const pass = Buffer.from(proxy.password);
    if (user.length > 255 || pass.length > 255) throw new Error("SOCKS5 username/password too long");
    socket.write(Buffer.concat([Buffer.from([0x01, user.length]), user, Buffer.from([pass.length]), pass]));
    const auth = await readUntil(socket, (buffer) => (buffer.length >= 2 ? 2 : -1), signal);
    if (auth[1] !== 0x00) throw new Error("SOCKS5 authentication failed");
  } else if (method !== 0x00) {
    throw new Error("SOCKS5 proxy rejected all offered authentication methods");
  }

  let address = host;
  if (proxy.protocol === "socks5:" && !isIP(host)) {
    address = (await lookup(host)).address;
  }
  let addressPart;
  const family = isIP(address);
  if (family === 4) {
    addressPart = Buffer.from([0x01, ...address.split(".").map(Number)]);
  } else if (family === 6) {
    addressPart = Buffer.concat([Buffer.from([0x04]), ipv6ToBuffer(address)]);
  } else {
    const name = Buffer.from(address);
    if (name.length > 255) throw new Error("Target hostname too long for SOCKS5");
    addressPart = Buffer.concat([Buffer.from([0x03, name.length]), name]);
  }
  const portPart = Buffer.alloc(2);
  portPart.writeUInt16BE(port);
  socket.write(Buffer.concat([Buffer.from([0x05, 0x01, 0x00]), addressPart, portPart]));

  await readUntil(
    socket,
    (buffer) => {
      if (buffer.length < 5) return -1;
      if (buffer[0] !== 0x05) throw new Error("Invalid SOCKS5 reply");
      if (buffer[1] !== 0x00) {
        throw new Error(`SOCKS5 connect to ${formatHostPort(host, port)} failed: ${SOCKS5_ERRORS[buffer[1]] || `code ${buffer[1]}`}`);
      }
      const atyp = buffer[3];
      const addrLength = atyp === 0x01 ? 4 : atyp === 0x04 ? 16 : atyp === 0x03 ? 1 + buffer[4] : -1;
      if (addrLength < 0) throw new Error("Invalid SOCKS5 reply address type");
      const total = 4 + addrLength + 2;
      return buffer.length >= total ? total : -1;
    },
    signal,
  );
  return socket;
}

function ipv6ToBuffer(address) {
  const [head, tail = ""] = address.split("::");
  const headParts = head ? head.split(":") : [];
  const tailParts = tail ? tail.split(":") : [];
  const expand = (parts) => parts.flatMap((part) => {
    if (part.includes(".")) {
      const [a, b, c, d] = part.split(".").map(Number);
      return [((a << 8) | b).toString(16), ((c << 8) | d).toString(16)];
    }
    return [part];
  });
  const h = expand(headParts);
  const t = expand(tailParts);
  const groups = address.includes("::") ? [...h, ...Array(8 - h.length - t.length).fill("0"), ...t] : h;
  const buffer = Buffer.alloc(16);
  groups.forEach((group, index) => buffer.writeUInt16BE(parseInt(group, 16) || 0, index * 2));
  return buffer;
}

/** Opens a raw socket to host:port through the proxy (tunnel established, no TLS to target yet). */
export async function openTunnel(proxy, host, port, signal) {
  const socket = await openProxySocket(proxy, signal);
  try {
    if (proxy.protocol === "socks5:" || proxy.protocol === "socks5h:") {
      return await socks5Tunnel(socket, proxy, host, port, signal);
    }
    return await httpConnectTunnel(socket, proxy, host, port, signal);
  } catch (error) {
    socket.destroy();
    throw error;
  }
}

async function encodeBody(body, headers) {
  if (body === undefined || body === null) return undefined;
  if (typeof body === "string") {
    if (!headers.has("content-type")) headers.set("content-type", "text/plain;charset=UTF-8");
    return Buffer.from(body);
  }
  if (body instanceof URLSearchParams) {
    if (!headers.has("content-type")) headers.set("content-type", "application/x-www-form-urlencoded;charset=UTF-8");
    return Buffer.from(body.toString());
  }
  if (Buffer.isBuffer(body)) return body;
  if (body instanceof ArrayBuffer) return Buffer.from(body);
  if (ArrayBuffer.isView(body)) return Buffer.from(body.buffer, body.byteOffset, body.byteLength);
  // Blob / FormData / streams: let the Request class serialize it.
  const request = new Request("http://localhost/", { method: "POST", body, duplex: "half" });
  if (!headers.has("content-type") && request.headers.get("content-type")) {
    headers.set("content-type", request.headers.get("content-type"));
  }
  return Buffer.from(await request.arrayBuffer());
}

function decodeStream(response) {
  const encoding = String(response.headers["content-encoding"] || "").trim().toLowerCase();
  if (encoding === "gzip" || encoding === "x-gzip") return response.pipe(createGunzip());
  if (encoding === "deflate") return response.pipe(createInflate());
  if (encoding === "br") return response.pipe(createBrotliDecompress());
  return response;
}

function sendThroughProxy(target, proxy, method, headers, payload, signal) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(abortError(signal));
      return;
    }
    const isHttps = target.protocol === "https:";
    const port = Number(target.port) || (isHttps ? 443 : 80);
    const host = target.hostname.replace(/^\[|\]$/g, "");
    // Plain-http targets behind an HTTP(S) proxy use absolute-form requests; everything else is tunneled.
    const absoluteForm = !isHttps && (proxy.protocol === "http:" || proxy.protocol === "https:");

    const outgoing = Object.fromEntries(headers);
    if (!("accept-encoding" in outgoing)) outgoing["accept-encoding"] = "gzip, deflate, br";
    if (!("accept" in outgoing)) outgoing.accept = "*/*";
    if (!("user-agent" in outgoing)) outgoing["user-agent"] = "node";
    if (payload) outgoing["content-length"] = String(payload.length);
    if (absoluteForm && (proxy.username || proxy.password)) outgoing["proxy-authorization"] = basicAuth(proxy);

    let settled = false;
    let req;
    const fail = (error) => {
      if (settled) return;
      settled = true;
      signal?.removeEventListener("abort", onAbort);
      req?.destroy();
      reject(error);
    };
    const onAbort = () => fail(abortError(signal));
    signal?.addEventListener("abort", onAbort, { once: true });

    const connect = absoluteForm
      ? openProxySocket(proxy, signal)
      : openTunnel(proxy, host, port, signal).then((socket) => {
          if (!isHttps) return socket;
          const secure = tlsConnect({
            socket,
            servername: isIP(host) ? undefined : host,
            ALPNProtocols: ["http/1.1"],
          });
          return waitForConnect(secure, "secureConnect", signal);
        });

    connect.then(
      (socket) => {
        if (settled) {
          socket.destroy();
          return;
        }
        req = httpRequest({
          method,
          host,
          port,
          path: absoluteForm ? target.href : `${target.pathname}${target.search}`,
          headers: { host: target.host, ...outgoing },
          // No agent: with `agent` unset, http.request uses createConnection for this one request.
          createConnection: () => socket,
        });
        // Keep listening: errors after the response arrived surface through the body stream instead.
        req.on("error", fail);
        req.once("response", (res) => {
          if (settled) {
            res.destroy();
            return;
          }
          settled = true;
          const onStreamAbort = () => res.destroy(abortError(signal));
          signal?.removeEventListener("abort", onAbort);
          signal?.addEventListener("abort", onStreamAbort, { once: true });
          res.once("close", () => {
            signal?.removeEventListener("abort", onStreamAbort);
            socket.destroy();
          });
          resolve(res);
        });
        req.end(payload);
      },
      fail,
    );
  });
}

function toWebResponse(res, method) {
  const headers = new Headers();
  for (let i = 0; i < res.rawHeaders.length; i += 2) {
    headers.append(res.rawHeaders[i], res.rawHeaders[i + 1]);
  }
  const status = res.statusCode || 0;
  const hasBody = method !== "HEAD" && !NULL_BODY_STATUSES.has(status);
  let body = null;
  if (hasBody) {
    const stream = decodeStream(res);
    if (stream !== res) res.once("error", (error) => stream.destroy(error));
    body = Readable.toWeb(stream);
  } else {
    res.resume();
  }
  return new Response(body, { status, statusText: res.statusMessage || "", headers });
}

/**
 * Drop-in replacement for the global `fetch` that routes requests through the
 * configured proxy. Falls back to the native fetch for direct connections.
 */
export async function proxyFetch(input, init = {}) {
  const target = new URL(input instanceof Request ? input.url : String(input));
  const proxy = resolveProxyFor(target);
  if (!proxy) return fetch(input, init);

  let method = String(init.method || (input instanceof Request ? input.method : "GET")).toUpperCase();
  let headers = new Headers(init.headers ?? (input instanceof Request ? input.headers : undefined));
  let payload = await encodeBody(init.body ?? (input instanceof Request && input.body ? await input.arrayBuffer() : undefined), headers);
  const signal = init.signal ?? (input instanceof Request ? input.signal : undefined);
  const redirect = init.redirect || "follow";

  let current = target;
  for (let hop = 0; ; hop += 1) {
    const activeProxy = hop === 0 ? proxy : resolveProxyFor(current);
    if (!activeProxy) return fetch(current, { method, headers, body: payload, signal, redirect });
    const res = await sendThroughProxy(current, activeProxy, method, headers, payload, signal);
    const status = res.statusCode || 0;
    const location = res.headers.location;
    if (redirect !== "follow" || ![301, 302, 303, 307, 308].includes(status) || !location) {
      if (redirect === "error" && [301, 302, 303, 307, 308].includes(status)) {
        res.destroy();
        throw new TypeError("fetch failed: unexpected redirect");
      }
      return toWebResponse(res, method);
    }
    res.resume();
    if (hop >= MAX_REDIRECTS) throw new TypeError("fetch failed: too many redirects");
    const next = new URL(location, current);
    if (status === 303 || ((status === 301 || status === 302) && method === "POST")) {
      method = method === "HEAD" ? "HEAD" : "GET";
      payload = undefined;
      headers.delete("content-type");
      headers.delete("content-length");
    }
    if (next.origin !== current.origin) {
      headers = new Headers(headers);
      headers.delete("authorization");
      headers.delete("cookie");
    }
    current = next;
  }
}
