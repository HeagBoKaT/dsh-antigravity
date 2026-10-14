# dsh-antigravity

<p align="center">
  <img src="./assets/images/chat-model-picker.png" alt="dsh-antigravity" width="100%" />
</p>

English | [简体中文](./README.zh.md)

Google Antigravity / Cloud Code Assist model provider plugin crafted for [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) (DSH).

Access Google Cloud Code Assist's robust suite of coding models directly through Google OAuth with no API key required, featuring large context windows and advanced reasoning.

---

## ✨ Features

- **Day-One Gemini 3.8 Flash Support**: Full native support for Google's latest `gemini-3.8-flash-tiered` with 1M context window, direct model targeting, and configurable thinking levels (Low / Medium / High), defaulting to helpful low-level reasoning.
- **Intelligent Endpoint Auto-Failover & 429 Resilience**:
  - Multi-tier endpoint failover: Automatically promotes healthy sandbox endpoints when primary Google Cloud Code Assist endpoints are throttled, maximizing uptime.
  - Seamless 429 recovery: Progresses through fallback endpoints upon 429 rate limits without prematurely aborting valid fallback streams.
  - Accurate Google 429 `RESOURCE_EXHAUSTED` quota detection with friendly live reset countdowns.
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
Search `antigravity` in the DSH Plugin Marketplace and click Install.

### Option 2: From GitHub
```sh
dsh plugin --profile web add github:WiseXin/dsh-antigravity
```

### Option 3: From Local Tarball
```sh
npm run pack:dist
dsh plugin --profile web add ./dist/wisexin-dsh-antigravity-0.1.3.tgz
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

---

## 📋 Model Catalog

| Model ID | Display Name | Provider | Features | Default |
|---|---|---|---|---|
| `gemini-3.8-flash` | Gemini 3.8 Flash | Google | 🧠 Thinking (Low/Med/High) · 👁️ Vision · 1M Context | **Enabled** |
| `gemini-3.7-flash` | Gemini 3.7 Flash | Google | 🧠 Thinking (Low/Med/High) · 👁️ Vision · 1M Context | **Enabled** |
| `claude-sonnet-4-6` | Claude Sonnet 4.6 | Anthropic | 🧠 Thinking · 👁️ Vision · 200k Context | **Enabled** |
| `claude-opus-4-6` | Claude Opus 4.6 | Anthropic | 🧠 Flagship Large · 👁️ Vision · 250k Context | **Enabled** |
| `gpt-oss-120b` | GPT-OSS 120B | OpenAI | Open Weight Model · 131k Context | **Enabled** |

> Note: Due to upstream sandbox endpoint capabilities, if you experience 404/429 with 3.7 models, `gemini-3.8-flash` is strongly recommended as the daily driver.

---

## ⚖️ Disclaimers & Acknowledgments

- **Disclaimer**: Unofficial community integration. Not affiliated with or endorsed by Google, Anthropic, or OpenAI.
- **Acknowledgment**: Derived and enhanced from the open-source community project [LiZhenNet/dsh-antigravity](https://github.com/LiZhenNet/dsh-antigravity).

## 📄 License

[MIT License](./LICENSE)
