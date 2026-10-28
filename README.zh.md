# dsh-antigravity

<p align="center">
  <img src="./assets/images/chat-model-picker.png" alt="dsh-antigravity" width="100%" />
</p>

[English](./README.md) | [Русский](./README.ru.md) | 简体中文

> **本仓库是 [WiseXin/dsh-antigravity](https://github.com/WiseXin/dsh-antigravity) 的分支（fork）**，新增 HTTP / HTTPS / SOCKS5 代理支持，详见下方「网络代理」章节及 [English README 的变更说明](./README.md#-whats-changed-in-this-fork)。

专为 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) (DSH) 打造的 Google Antigravity / Cloud Code Assist 旗舰模型提供商插件。

无需配置昂贵的 API Key，通过 Google OAuth 授权直接接入 Google Cloud Code Assist 强大的 AI 编程模型池，畅享超大上下文与深度推理。

---

## ✨ 核心特性

- **首发原生支持 Gemini 3.8 Flash**：完整适配 Google 最新一代 `gemini-3.8-flash-tiered`，100 万超大上下文，直发对应运行时模型，支持思维链推理等级（Low / Medium / High）自由调节，默认保留轻度思考。
- **智能端点容灾与 429 自动故障转移（Auto-Failover）**：
  - **三级端点链路 Daily → Sandbox → PROD**：默认首选 `daily-cloudcode-pa.googleapis.com`（官方 IDE 原生主力端点，一次命中，零额外时延），其次 `daily-cloudcode-pa.sandbox.googleapis.com` 沙箱备用，末位 `cloudcode-pa.googleapis.com` 历史端点兜底。可用 `ANTIGRAVITY_BASE_URL` 锁定到指定单端点；
  - **429 语义分流**：只有响应体明确判定为账号配额耗尽（`RESOURCE_EXHAUSTED` 配额文案）才展示精准重置倒计时；端点级限流则交给退避重试与端点顺延，不再被误报成"额度已用尽"；
  - **上游超时保护**：默认 45 秒上游超时（可用 `ANTIGRAVITY_UPSTREAM_TIMEOUT_MS` 调整）。Google 对容量不足的模型会以"挂起连接"代替错误码返回，缺少超时会让请求永久停留在加载状态。
- **模型目录实时过滤**：拉取模型列表时用 `fetchAvailableModels` 并行探测各端点，按系列剔除 Google 侧已下线的模型（如 3.7 系列实测返回 404），让用户在下拉里就选不到坏模型；探测失败（如遭遇频率限制）时保留完整清单，不因探测故障缩小选择范围；探测结果缓存 5 分钟。
- **模型降级链修复**：3.7 / 3.6 系列被 Google 下线后，降级终点统一落到实测可用的 `gemini-3-flash`，避免降级链指向不存在的模型；同时非配额类 429 不再中断备用模型的尝试。
- **出站请求指纹对齐官方客户端**：请求头对齐官方 Antigravity 客户端的指纹格式（版本号固定为当前官方稳定版，`os_type` / `arch` 按运行环境动态映射），请求信封按键序与动态 `requestId` 生成，`requestType` 仅在携带工具时注入。
- **高可靠凭据持久化与多账号管理**：
  - 修复 OAuth Token 刷新落盘时的顶层与账号多层字段同步问题，杜绝 Token 回滚与 401 刷新循环；
  - 支持多账号多凭据无缝轮询与配额切换。
- **全新现代化 UI 交互**：
  - 完美融入 DSH 原生主题系统，支持深色（Dark Mode）与浅色模式无缝自适应；
  - 翡翠绿（Gemini）与科技紫青（Claude/GPT）双池独立实时额度看板；
  - 新增「全部 / Gemini / Claude & GPT / 已启用」分类过滤 Tabs；
  - 聊天输入框下方新增紧凑额度条（v0.2.0），实时显示各额度池剩余比例与重置时间。
- **纯净旗舰模型库**：剔除所有内部调试、测试及过旧的模型变体，聚焦精选 5 大主流旗舰模型。
- **双模块标识无缝兼容**：同时注册 `dsh-antigravity` 与 `@wisexin/dsh-antigravity`，无论在 DSH 插件市场一键安装、GitHub 安装还是离线安装，均能 100% 顺滑激活，杜绝加载失败。

---

## 🚀 安装指南

### 方式一：从 DSH 插件市场一键安装
在 DSH 插件市场搜索 `antigravity`，点击安装即可。

### 方式二：直接从 GitHub 安装
```sh
dsh plugin --profile web add github:WiseXin/dsh-antigravity
```

### 方式三：通过本地 Release 包安装
```sh
npm run pack:dist
dsh plugin --profile web add ./dist/wisexin-dsh-antigravity-0.2.0.tgz
```

### 方式四：手动复制部署
```sh
mkdir -p "$DSH_HOME/profiles/web/node_modules/dsh-antigravity"
cp -R * "$DSH_HOME/profiles/web/node_modules/dsh-antigravity/"
```

重启 DSH 后即可生效：
```sh
dsh web
```

---

## 🔑 登录与使用

1. 打开 DSH 界面中的 **设置（Settings）> Antigravity**；
2. 点击 **登录（Sign in with Google）**，在弹出的浏览器中完成 Google OAuth 授权；
3. 授权成功后，设置页面将自动展示双配额池的实时剩余比例与重置倒计时：
   - **Gemini Models 池**：Gemini 3.8 Flash / 3.7 Flash / 3.1 Pro 等模型共享；
   - **Claude & GPT models 池**：Claude Opus 4.6 / Claude Sonnet 4.6 / GPT-OSS 120B 共享独立的 3P 额度池；
4. 在聊天界面的模型选择器中切换至 **Antigravity**，即可畅快对话。

> 如在服务器无头环境下无法自动唤起浏览器，可在同机器终端运行命令行登录助手：
> ```sh
> node "$DSH_HOME/profiles/web/node_modules/dsh-antigravity/bin/antigravity-login.mjs"
> ```

---

## 🌐 网络代理（HTTP / HTTPS / SOCKS5）

所有发往 Google 的请求（OAuth 换取 Token、配额、模型发现与对话流）都可以经由代理转发，无需额外依赖。

| 协议 | 行为 |
|---|---|
| `http://host:port` | HTTP `CONNECT` 隧道 |
| `https://host:port` | 通过 TLS 连接代理后建立 `CONNECT` 隧道 |
| `socks5://host:port` | SOCKS5，目标域名在本地解析 |
| `socks5h://host:port`（或 `socks://`） | SOCKS5，目标域名由代理解析 |

所有协议均支持认证：`socks5h://user:pass@127.0.0.1:1080`（特殊字符需 URL 编码，如 `@` → `%40`）。

代理按以下优先级选取（第一个非空值生效）：

1. 环境变量 `ANTIGRAVITY_PROXY`；
2. **设置 > Antigravity > 网络代理**（保存到 `antigravity-settings.json`，即时生效）；
3. `HTTPS_PROXY` / `HTTP_PROXY` / `ALL_PROXY`（大小写均可），遵循 `NO_PROXY`。

在第 1、2 级填写 `direct` 可在存在系统代理变量时强制直连。

```sh
ANTIGRAVITY_PROXY=socks5h://127.0.0.1:1080 dsh web
```

---

## 📋 精选模型清单

| 模型 ID | 模型全称 | 厂商 | 特性 | 默认状态 |
|---|---|---|---|---|
| `gemini-3.8-flash` | Gemini 3.8 Flash | Google | 🧠 思考链（Low/Med/High） · 👁️ 多模态 · 1M 上下文 | **默认启用** |
| `gemini-3.7-flash` | Gemini 3.7 Flash | Google | 🧠 思考链（Low/Med/High） · 👁️ 多模态 · 1M 上下文 | **默认启用** |
| `claude-sonnet-4-6` | Claude Sonnet 4.6 | Anthropic | 🧠 深度思考 · 👁️ 多模态 · 200k 上下文 | **默认启用** |
| `claude-opus-4-6` | Claude Opus 4.6 | Anthropic | 🧠 旗舰超大模型 · 👁️ 多模态 · 250k 上下文 | **默认启用** |
| `gpt-oss-120b` | GPT-OSS 120B | OpenAI | 开放权重大模型 · 131k 上下文 | **默认启用** |

> 注：Google 会动态调整模型供给。已被下线的模型会自动从上述列表中隐藏，请求时也会自动降级到同系列实测可用的模型，无需手动切换。

---

## ⚖️ 声明与致谢

- **免责声明**：本项目为非官方开源集成插件，与 Google、Anthropic 或 OpenAI 无关，亦未获得官方认可。请仅在合规授权的个人账号与服务范围内使用。
- **致谢**：本项目基于开源社区项目 [LiZhenNet/dsh-antigravity](https://github.com/LiZhenNet/dsh-antigravity) 演进，在此对其先驱探索表示感谢。

## 📄 许可证

[MIT License](./LICENSE)
