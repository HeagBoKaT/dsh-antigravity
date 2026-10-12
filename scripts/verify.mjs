import { readFileSync } from "node:fs";
const pkg = JSON.parse(readFileSync("package.json", "utf8"));
const clientPath = (pkg.exports?.["./client"] ?? "").replace(/^\.\//, "");
if (!clientPath) throw new Error(`${pkg.name}: package.json exports["./client"] is not declared`);
const source = readFileSync(clientPath, "utf8");
const id = source.match(/__ModuleLoader__\.load\(\s*\{\s*id:\s*["\x27]([^"\x27]+)["\x27]/)?.[1];
if (!id) throw new Error(`${clientPath}: no window.__ModuleLoader__.load({ id }) registration found`);
if (id !== pkg.name) throw new Error(`${clientPath}: client id "${id}" must equal package name "${pkg.name}"`);
console.log(`client id ok: ${id}`);
