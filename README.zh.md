# dsh-antigravity

<p align="center">
  <img src="./assets/images/chat-model-picker.png" alt="dsh-antigravity" width="100%" />
</p>

[English](./README.md) | 简体中文

专为 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) (DSH) 打造的 Google Antigravity / Cloud Code Assist 旗舰模型提供商插件。

无需配置昂贵的 API Key，通过 Google OAuth 授权直接接入 Google Cloud Code Assist 强大的 AI 编程模型池，畅享超大上下文与深度推理。

---

## ✨ 核心特性

- **首发原生支持 Gemini 3.8 Flash**：完整适配 Google 最新一代 `gemini-3.8-flash-tiered`，100 万超大上下文，支持思维链推理强度（Thinking Level）自由调节。
- **精准配额感知与防误报机制**：
  - 智能识别 Google 429 `RESOURCE_EXHAUSTED` 配额耗尽，直接展示精准倒计时；
  - 移除了无效沙箱端点回退，彻底根除“配额耗尽却提示模型不存在 (404)”的伪报错。
- **全新现代化 UI 交互**：
  - 完美融入 DSH 原生主题系统，支持深色（Dark Mode）与浅色模式无缝自适应；
  - 翡翠绿（Gemini）与科技紫青（Claude/GPT）双池独立实时额度看板；
  - 新增「全部 / Gemini / Claude & GPT / 已启用」分类过滤 Tabs 与「仅保留推荐」一键重置。
- **纯净旗舰模型库**：剔除所有内部调试、测试及已下线的冗余变体（如 3.1-flash-image 等），保留最核心的可用旗舰。
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
dsh plugin --profile web add ./dist/wisexin-dsh-antigravity-0.1.2.tgz
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

## 📋 精选模型清单

| 模型 ID | 模型全称 | 厂商 | 特性 | 默认状态 |
|---|---|---|---|---|
| `gemini-3.8-flash` | Gemini 3.8 Flash | Google | 💭 思考链 · 🖼️ 多模态 · 1M 上下文 | **默认启用** |
| `gemini-3.7-flash` | Gemini 3.7 Flash | Google | 💭 思考链 · 🖼️ 多模态 · 1M 上下文 | **默认启用** |
| `gemini-3.1-pro` | Gemini 3.1 Pro | Google | 🧠 复杂推理 · 🖼️ 多模态 · 1M 上下文 | **默认启用** |
| `claude-sonnet-4-6` | Claude Sonnet 4.6 | Anthropic | 💭 深度思考 · 🖼️ 多模态 · 200k 上下文 | **默认启用** |
| `claude-opus-4-6` | Claude Opus 4.6 | Anthropic | 🏆 旗舰超大模型 · 🖼️ 多模态 · 250k 上下文 | **默认启用** |
| `gemini-3.6-flash` | Gemini 3.6 Flash | Google | ⚡ 均衡高效 · 🖼️ 多模态 | 可选启用 |
| `gemini-3.5-flash` | Gemini 3.5 Flash | Google | ⚡ 快速响应 · 🖼️ 多模态 | 可选启用 |
| `gemini-3-flash` | Gemini 3 Flash | Google | ⚡ 高速推理 · 🖼️ 多模态 | 可选启用 |
| `gemini-2.5-pro` | Gemini 2.5 Pro | Google | 🧠 经典 Pro 模型 · 🖼️ 多模态 | 可选启用 |
| `gpt-oss-120b` | GPT-OSS 120B | OpenAI | 开放权重大模型 · 131k 上下文 | 可选启用 |

---

## ⚖️ 声明与致谢

- **免责声明**：本项目为非官方开源集成插件，与 Google、Anthropic 或 OpenAI 无关，亦未获得官方认可。请仅在合规授权的个人账号与服务范围内使用。
- **致谢**：本项目基于开源社区项目 [LiZhenNet/dsh-antigravity](https://github.com/LiZhenNet/dsh-antigravity) 演进，在此对其先驱探索表示感谢。

## 📄 许可证

[MIT License](./LICENSE)
