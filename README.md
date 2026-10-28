# dsh-antigravity

<p align="center">
  <img src="./assets/images/chat-model-picker.png" alt="dsh-antigravity" width="100%" />
</p>

English | [Русский](./README.ru.md) | [简体中文](./README.zh.md)

Google Antigravity / Cloud Code Assist model provider plugin crafted for [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) (DSH).

Access Google Cloud Code Assist's robust suite of coding models directly through Google OAuth with no API key required, featuring large context windows and advanced reasoning.

> **This is a fork** of [WiseXin/dsh-antigravity](https://github.com/WiseXin/dsh-antigravity) that adds outbound proxy support. See [What's changed in this fork](#-whats-changed-in-this-fork).

---

## 🆕 What's Changed in This Fork

Compared to upstream [`WiseXin/dsh-antigravity@6e04394`](https://github.com/WiseXin/dsh-antigravity/commit/6e04394):

- **HTTP / HTTPS / SOCKS5 proxy support** for every request to Google: OAuth token exchange, quota, model discovery and chat streaming. See [Proxy](#-proxy-http--https--socks5).
  - `http://` and `https://` proxies via `CONNECT` tunnel, `socks5://` (local DNS) and `socks5h://` (proxy-side DNS), with optional `user:pass@` authentication.
  - Zero new dependencies: implemented on top of Node's built-in `net` / `tls` / `http` in [`lib/proxy.js`](./lib/proxy.js); with no proxy configured the native `fetch` is used unchanged.
  - Resolution order: `ANTIGRAVITY_PROXY` env → Settings UI → `HTTPS_PROXY` / `HTTP_PROXY` / `ALL_PROXY` (with `NO_PROXY`). `direct` forces a direct connection.
- **Russian UI and a language switcher**: the settings page is available in English, Russian and Chinese. A 🌐 selector in the page header picks Auto / English / Русский / 简体中文 (stored per browser). Auto follows the DSH language, and since DSH has no Russian UI, a Russian system language switches the plugin to Russian. Quota groups, bucket names, descriptions and reset countdowns are now localized too (upstream always showed them in Chinese).
- **New "Network Proxy" card** in **Settings > Antigravity**, backed by a new `GET/POST /antigravity/api/proxy` endpoint. The value is stored in `antigravity-settings.json` and applied without restart.
- **CLI login helper** (`antigravity-login`) also honours the saved proxy.
- **Quota strip under the chat input** (v0.2.0): compact pills showing the remaining quota of each pool (Gemini / Claude & GPT) with a mini progress bar and a reset-time tooltip, refreshed automatically.
- **Russian README** (this file's [Русский](./README.ru.md) version).

---

## ✨ Features

- **Day-One Gemini 3.8 Flash Support**: Full native support for Google's latest `gemini-3.8-flash-tiered` with 1M context window, direct model targeting, and configurable thinking levels (Low / Medium / High), defaulting to helpful low-level reasoning.
- **Intelligent Endpoint Auto-Failover & 429 Resilience**:
  - **Three-Tier Endpoint Chain (Daily → Sandbox → PROD)**: `daily-cloudcode-pa.googleapis.com` (the official IDE native primary endpoint) is now the default first choice with zero extra round-trip latency, followed by the `daily-cloudcode-pa.sandbox.googleapis.com` sandbox, and the legacy `cloudcode-pa.googleapis.com` as last-resort fallback. Pin a single endpoint with `ANTIGRAVITY_BASE_URL`.
  - **Accurate 429 Classification**: Only responses that genuinely indicate exhausted account quota (`RESOURCE_EXHAUSTED` quota wording) surface a live reset countdown. Endpoint-level rate limiting is handled by backoff and endpoint progression instead of being misreported as "quota exhausted".
  - **Upstream Timeout Guard**: A 45-second upstream timeout ships by default (tunable via `ANTIGRAVITY_UPSTREAM_TIMEOUT_MS`). When Google lacks capacity it may hold the connection open instead of returning an error, which otherwise leaves requests loading forever.
- **Live Model Catalog Filtering**: While listing models, availability is probed in parallel across endpoints via `fetchAvailableModels`, pruning whole families Google has retired (3.7 series currently returns 404 upstream) so broken models never appear in the picker. If probing itself fails (e.g. rate limited), the full catalog is preserved rather than silently shrinking; results cache for 5 minutes.
- **Repaired Fallback Chain**: Since the 3.7 / 3.6 series has been retired upstream, their fallback target now resolves to the verified `gemini-3-flash` instead of another non-existent model, and non-quota 429s no longer abort the remaining candidates.
- **Official-Client Wire Fingerprint**: Request headers match the official Antigravity client fingerprint format (pinned to the current stable official version, with `os_type` / `arch` mapped from the runtime), request envelopes use the upstream key order plus a dynamic `requestId`, and `requestType` is injected only when tools are present.
- **Robust Multi-Account Credentials & Quota Persistence**:
  - Resolved OAuth token refresh deserialization sync flaws to prevent token rollback and 401 loops.
  - Supports multi-account rotation and real-time quota tracking.
- **Modernized DSH-Native UI**:
  - Seamless dark and light theme adaptability following DSH theme tokens;
  - Distinct live quota bars for Gemini (Emerald) and Claude & GPT (Violet/Cyan);
  - Filter tabs (All, Gemini, Claude & GPT, Enabled).
- **Clean Model Catalog**: Pruned legacy and broken variants, focusing on the 5 core flagship models.
- **Dual-ID Compatibility**: Registers both `dsh-antigravity` and `@wisexin/dsh-antigravity` to ensure 100% activation success across marketplace, GitHub, and local tarball installations.

---

## 📦 Installation

### Option 1: DSH Marketplace
Search `antigravity` in the DSH Plugin Marketplace and click Install. This installs the upstream version, without proxy support.

### Option 2: From GitHub
```sh
# this fork (with proxy support)
dsh plugin --profile web add github:HeagBoKaT/dsh-antigravity
# upstream
dsh plugin --profile web add github:WiseXin/dsh-antigravity
```
Use `--profile desktop` for DSH Desktop.

### Option 3: From Local Tarball
```sh
npm run pack:dist
dsh plugin --profile web add ./dist/wisexin-dsh-antigravity-0.2.0.tgz
```

Restart DSH:
```sh
dsh web
```

---

## 🔐 Authentication

1. Open **Settings > Antigravity** in DSH;
2. Click **Sign in with Google** to complete standard browser OAuth;
3. Once signed in, live quota pools and reset countdowns will display automatically:
   - **Gemini Models Pool**: Shared among Gemini 3.8 Flash, 3.7 Flash, etc.
   - **Claude & GPT Models Pool**: Independent pool for Claude Opus 4.6, Claude Sonnet 4.6, and GPT-OSS 120B.
4. Select **Antigravity** in your chat model picker and start coding.

> On headless servers where the browser cannot be launched automatically, run the CLI login helper on the same machine:
> ```sh
> node "$DSH_HOME/profiles/web/node_modules/dsh-antigravity/bin/antigravity-login.mjs"
> ```

---

## 🌐 Proxy (HTTP / HTTPS / SOCKS5)

All outbound requests to Google (OAuth token exchange, quota, model discovery and chat streaming) can be routed through a proxy. No extra dependencies are needed.

| Scheme | Behaviour |
|---|---|
| `http://host:port` | HTTP `CONNECT` tunnel |
| `https://host:port` | HTTP `CONNECT` tunnel over TLS to the proxy |
| `socks5://host:port` | SOCKS5, target hostname resolved locally |
| `socks5h://host:port` (or `socks://`) | SOCKS5, target hostname resolved by the proxy |

Credentials are supported in every scheme: `socks5h://user:pass@127.0.0.1:1080` (URL-encode special characters, e.g. `@` → `%40`).

The proxy is picked in this order (first non-empty wins):

1. `ANTIGRAVITY_PROXY` environment variable;
2. **Settings > Antigravity > Network Proxy** (saved to `antigravity-settings.json`, applied immediately);
3. `HTTPS_PROXY` / `HTTP_PROXY` / `ALL_PROXY` (upper or lower case), honouring `NO_PROXY`.

Use the value `direct` at levels 1 or 2 to force a direct connection even when system proxy variables are set.

```sh
ANTIGRAVITY_PROXY=socks5h://127.0.0.1:1080 dsh web
```

PowerShell:
```powershell
$env:ANTIGRAVITY_PROXY = "socks5h://127.0.0.1:1080"; dsh web
```

---

## 📋 Model Catalog

| Model ID | Display Name | Provider | Features | Default |
|---|---|---|---|---|
| `gemini-3.8-flash` | Gemini 3.8 Flash | Google | 🧠 Thinking (Low/Med/High) · 👁️ Vision · 1M Context | **Enabled** |
| `gemini-3.7-flash` | Gemini 3.7 Flash | Google | 🧠 Thinking (Low/Med/High) · 👁️ Vision · 1M Context | **Enabled** |
| `claude-sonnet-4-6` | Claude Sonnet 4.6 | Anthropic | 🧠 Thinking · 👁️ Vision · 200k Context | **Enabled** |
| `claude-opus-4-6` | Claude Opus 4.6 | Anthropic | 🧠 Flagship Large · 👁️ Vision · 250k Context | **Enabled** |
| `gpt-oss-120b` | GPT-OSS 120B | OpenAI | Open Weight Model · 131k Context | **Enabled** |

> Note: Google's model supply changes over time. Retired models are hidden from the catalog automatically, and requests targeting them fall back to a verified model in the same family — no manual switching required.

---

## ⚖️ Disclaimers & Acknowledgments

- **Disclaimer**: Unofficial community integration. Not affiliated with or endorsed by Google, Anthropic, or OpenAI.
- **Acknowledgment**: Derived and enhanced from the open-source community project [LiZhenNet/dsh-antigravity](https://github.com/LiZhenNet/dsh-antigravity).

## 📄 License

[MIT License](./LICENSE)
