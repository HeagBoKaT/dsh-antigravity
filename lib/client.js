(function() {
  function factory(require) {
    const React = require("react");
    const { useCallback, useEffect, useMemo, useRef, useState } = React;

    const STYLE_ID = "dsh-antigravity-settings-style";
    const API = "/antigravity/api";
    const NS = "dsh-antigravity";
    const ANTIGRAVITY_SVG_PATH =
      "M89.6992 93.695C94.3659 97.195 101.366 94.8617 94.9492 88.445C75.6992 69.7783 79.7825 18.445 55.8659 18.445C31.9492 18.445 36.0325 69.7783 16.7825 88.445C9.78251 95.445 17.3658 97.195 22.0325 93.695C40.1159 81.445 38.9492 59.8617 55.8659 59.8617C72.7825 59.8617 71.6159 81.445 89.6992 93.695Z";

    const RECOMMENDED_DEFAULT_IDS = [
      "gemini-3.8-flash",
      "gemini-3.7-flash",
      "gemini-3.1-pro",
      "claude-sonnet-4-6",
      "claude-opus-4-6",
      "gemini-2.5-pro",
      "gemini-2.5-flash",
      "gemini-2.5-flash-thinking",
      "claude-3-7-sonnet",
      "claude-3-5-haiku",
    ];

    const zh = {
      pageDesc: "Google Antigravity / Cloud Code Assist 深度集成。实时同步额度，按需启用旗舰模型。",
      currentAccount: "授权账号与配额",
      login: "登录 Google 账号",
      loggingIn: "正在唤起登录...",
      waitingAuth: "等待浏览器授权中...",
      cancel: "取消",
      loginTimeout: "登录超时，请重试",
      popupBlocked: "浏览器拦截了登录弹窗，请允许弹出窗口后重试",
      refresh: "刷新配额",
      refreshing: "刷新中...",
      logout: "退出登录",
      loggingOut: "退出中...",
      loading: "加载中...",
      notSignedIn: "未登录",
      notSignedInDesc: "点击右侧登录按钮，在浏览器中完成 Google OAuth 授权。登录后将实时显示各模型池的剩余额度与重置倒计时。",
      noQuotaDesc: "暂未拉取到配额信息，点击「刷新配额」进行同步。",
      fetchingQuota: "正在同步最新配额...",
      quota: "共享配额池",
      resetPrefix: "{time} 后重置",
      resetUnavailable: "重置时间未知",
      resetNow: "即将重置",
      timeDayHour: "{days}天 {hours}小时",
      timeHourMin: "{hours}h {minutes}m",
      timeMin: "{minutes}分钟",
      stripFiveHour: "5小时",
      updatedAt: "配额更新于 {time}",
      modelSelector: "模型库管理",
      modelSelectorDesc: "勾选启用的模型将出现在 DSH 聊天界面的模型选择器中。已剔除废弃与不可用模型。",
      selectAll: "全选",
      unselectAll: "全不选",
      resetRecommended: "仅保留推荐 (5)",
      filterAll: "全部",
      filterGemini: "Gemini 系列",
      filter3P: "Claude & GPT",
      filterEnabled: "已启用 ({count})",
      loadingModels: "正在获取可用模型列表...",
      modelSelectorNote: "✨ 提示：修改勾选会自动实时保存。返回对话窗口重新打开模型下拉框即可使用新模型。",
      quotaLabel: "剩余 {percent}%",
      loginFailed: "登录授权失败，请重试",
      oauthRecommendedTitle: "推荐方式",
      oauthRecommendedDesc: "将打开默认浏览器进行 Google 登录授权，自动获取并保存 Token。",
      startOAuth: "开始 OAuth 授权",
      authLinkLabel: "授权链接",
      copyAuthLink: "复制授权链接",
      copySuccess: "已复制",
      alreadyAuthorized: "我已授权，继续",
      manualFallback: "浏览器没有自动跳转？请在此处粘贴回调链接或 AUTHORIZATION CODE：",
      pastePlaceholder: "粘贴回调链接或 Code...",
      submit: "提交",
      submitting: "提交中...",
      thinkingBadge: "思考链",
      visionBadge: "多模态",
      savedAuto: "✨ 已自动保存",
      savingChanges: "正在保存...",
      multiAccountsTitle: "授权账号池",
      multiAccountsDesc: "管理已绑定的 Google 账号。可自由切换当前使用账号，或开启 429 自动故障转移实现静默容灾轮询。",
      accountCount: "共 {count} 个账号",
      addAccount: "+ 添加 Google 账号",
      switchAccount: "切换使用",
      currentActive: "当前使用中",
      deleteAccount: "移除",
      confirmDeleteAccount: "确定要移除账号 {email} 吗？",
      autoFailover: "429 自动故障转移",
      autoFailoverDesc: "当主账号遇到 HTTP 429 配额耗尽时，静默轮询账号池中下一个可用账号继续服务，保障对话不中断。",
      switchingAccount: "切换中...",
      deletingAccount: "移除中...",
      switchSuccess: "已切换至 {email}",
      deleteSuccess: "已移除 {email}",
      proxyTitle: "网络代理",
      proxyDesc: "所有发往 Google 的请求（OAuth、配额、模型对话）都会经过该代理。支持 http://、https://、socks5://、socks5h://，可带 user:pass@。留空则使用 HTTPS_PROXY / ALL_PROXY 环境变量，填 direct 强制直连。",
      proxyPlaceholder: "socks5h://user:pass@127.0.0.1:1080",
      proxySave: "保存",
      proxySaving: "保存中...",
      proxySaved: "✨ 代理已保存",
      proxyActive: "当前生效：{url}（来源：{source}）",
      proxyNone: "当前未使用代理（直连）",
      langLabel: "语言",
      langAuto: "自动",
      quotaWindow_weekly: "周限额剩余",
      quotaWindow_fiveHour: "5 小时限额剩余",
      quotaWindow_generic: "配额剩余",
      quotaSlot_current: "（当前窗口）",
      quotaSlot_carry: "（结转）",
      quotaGeminiGroup: "Gemini 模型",
      quotaGeminiGroupDesc: "本组包含模型：{count} 个 Gemini 变体，共享同一配额池",
    };

    const en = {
      pageDesc: "Google Antigravity / Cloud Code Assist integration. Real-time quota tracking and curated model selection.",
      currentAccount: "Account & Quotas",
      login: "Sign in with Google",
      loggingIn: "Signing in...",
      waitingAuth: "Waiting for authorization...",
      cancel: "Cancel",
      loginTimeout: "Login timed out, please retry",
      popupBlocked: "Browser blocked popup window, please allow popups and retry",
      refresh: "Refresh Quotas",
      refreshing: "Refreshing...",
      logout: "Sign out",
      loggingOut: "Signing out...",
      loading: "Loading...",
      notSignedIn: "Not signed in",
      notSignedInDesc: "Click Sign in to complete Google OAuth in your browser. Live pool quotas and countdowns will appear once authenticated.",
      noQuotaDesc: "No quota data yet. Click Refresh Quotas to sync.",
      fetchingQuota: "Syncing latest quotas...",
      quota: "Shared Quota Pools",
      resetPrefix: "Resets in {time}",
      resetUnavailable: "Reset unavailable",
      resetNow: "now",
      timeDayHour: "{days}d {hours}h",
      timeHourMin: "{hours}h {minutes}m",
      timeMin: "{minutes}m",
      stripFiveHour: "5h",
      updatedAt: "Updated at {time}",
      modelSelector: "Model Catalog",
      modelSelectorDesc: "Enabled models will appear in DSH's chat model picker. Obsolete and broken models have been purged.",
      selectAll: "Select all",
      unselectAll: "Clear all",
      resetRecommended: "Curated only (5)",
      filterAll: "All",
      filterGemini: "Gemini",
      filter3P: "Claude & GPT",
      filterEnabled: "Enabled ({count})",
      loadingModels: "Loading available models...",
      modelSelectorNote: "✨ Changes are saved automatically. Reopen the model picker in chat to start using updated models.",
      quotaLabel: "{percent}% left",
      loginFailed: "Login failed, please retry",
      oauthRecommendedTitle: "Recommended",
      oauthRecommendedDesc: "Open your default browser to authorize Google, then automatically fetch and save the token.",
      startOAuth: "Start OAuth Authorization",
      authLinkLabel: "Authorization link",
      copyAuthLink: "Copy link",
      copySuccess: "Copied",
      alreadyAuthorized: "I have authorized, continue",
      manualFallback: "Browser did not redirect? Paste the callback URL or AUTHORIZATION CODE here:",
      pastePlaceholder: "Paste callback URL or Code...",
      submit: "Submit",
      submitting: "Submitting...",
      thinkingBadge: "Thinking",
      visionBadge: "Vision",
      savedAuto: "✨ Saved automatically",
      savingChanges: "Saving...",
      multiAccountsTitle: "Authorized Account Pool",
      multiAccountsDesc: "Manage authorized Google accounts. Switch active accounts freely, or enable 429 auto-failover for silent failover.",
      accountCount: "{count} accounts",
      addAccount: "+ Add Google Account",
      switchAccount: "Switch",
      currentActive: "Active",
      deleteAccount: "Remove",
      confirmDeleteAccount: "Are you sure you want to remove account {email}?",
      autoFailover: "429 Auto-Failover",
      autoFailoverDesc: "Silently retries using the next healthy account in the pool when the active account encounters HTTP 429 quota exhaustion.",
      switchingAccount: "Switching...",
      deletingAccount: "Removing...",
      switchSuccess: "Switched to {email}",
      deleteSuccess: "Removed {email}",
      proxyTitle: "Network Proxy",
      proxyDesc: "All requests to Google (OAuth, quotas, chat) go through this proxy. Supports http://, https://, socks5:// and socks5h://, optionally with user:pass@. Leave empty to use HTTPS_PROXY / ALL_PROXY env vars; enter direct to force a direct connection.",
      proxyPlaceholder: "socks5h://user:pass@127.0.0.1:1080",
      proxySave: "Save",
      proxySaving: "Saving...",
      proxySaved: "✨ Proxy saved",
      proxyActive: "Active: {url} (source: {source})",
      proxyNone: "No proxy in use (direct connection)",
      langLabel: "Language",
      langAuto: "Auto",
      quotaWindow_weekly: "Weekly limit remaining",
      quotaWindow_fiveHour: "5-hour limit remaining",
      quotaWindow_generic: "Quota remaining",
      quotaSlot_current: "(current window)",
      quotaSlot_carry: "(carry-over)",
      quotaGeminiGroup: "Gemini models",
      quotaGeminiGroupDesc: "Models in this group: {count} Gemini variants sharing one quota pool",
    };

    const ru = {
      pageDesc: "Интеграция Google Antigravity / Cloud Code Assist. Квоты в реальном времени и подборка флагманских моделей.",
      currentAccount: "Аккаунт и квоты",
      login: "Войти через Google",
      loggingIn: "Выполняется вход...",
      waitingAuth: "Ожидание авторизации...",
      cancel: "Отмена",
      loginTimeout: "Время входа истекло, попробуйте ещё раз",
      popupBlocked: "Браузер заблокировал всплывающее окно — разрешите всплывающие окна и повторите",
      refresh: "Обновить квоты",
      refreshing: "Обновление...",
      logout: "Выйти",
      loggingOut: "Выход...",
      loading: "Загрузка...",
      notSignedIn: "Вход не выполнен",
      notSignedInDesc: "Нажмите «Войти через Google» и завершите авторизацию в браузере. После входа здесь появятся остатки квот и время до их сброса.",
      noQuotaDesc: "Данных о квотах пока нет. Нажмите «Обновить квоты».",
      fetchingQuota: "Загрузка актуальных квот...",
      quota: "Общие пулы квот",
      resetPrefix: "Сброс через {time}",
      resetUnavailable: "Время сброса неизвестно",
      resetNow: "сейчас",
      timeDayHour: "{days} д {hours} ч",
      timeHourMin: "{hours} ч {minutes} мин",
      timeMin: "{minutes} мин",
      stripFiveHour: "5ч",
      updatedAt: "Обновлено в {time}",
      modelSelector: "Каталог моделей",
      modelSelectorDesc: "Включённые модели появятся в списке моделей в чате DSH. Устаревшие и неработающие модели убраны.",
      selectAll: "Выбрать все",
      unselectAll: "Снять все",
      resetRecommended: "Только рекомендуемые (5)",
      filterAll: "Все",
      filterGemini: "Gemini",
      filter3P: "Claude и GPT",
      filterEnabled: "Включённые ({count})",
      loadingModels: "Загрузка списка моделей...",
      modelSelectorNote: "✨ Изменения сохраняются автоматически. Откройте список моделей в чате заново, чтобы увидеть обновления.",
      quotaLabel: "осталось {percent}%",
      loginFailed: "Не удалось войти, попробуйте ещё раз",
      oauthRecommendedTitle: "Рекомендуется",
      oauthRecommendedDesc: "Откроется браузер по умолчанию для входа в Google, после чего токен будет получен и сохранён автоматически.",
      startOAuth: "Начать авторизацию",
      authLinkLabel: "Ссылка для авторизации",
      copyAuthLink: "Скопировать ссылку",
      copySuccess: "Скопировано",
      alreadyAuthorized: "Я авторизовался, продолжить",
      manualFallback: "Браузер не перенаправил обратно? Вставьте сюда ссылку возврата или AUTHORIZATION CODE:",
      pastePlaceholder: "Вставьте ссылку возврата или код...",
      submit: "Отправить",
      submitting: "Отправка...",
      thinkingBadge: "Рассуждение",
      visionBadge: "Изображения",
      savedAuto: "✨ Сохранено автоматически",
      savingChanges: "Сохранение...",
      multiAccountsTitle: "Пул авторизованных аккаунтов",
      multiAccountsDesc: "Управление подключёнными аккаунтами Google. Переключайте активный аккаунт или включите автопереключение при 429.",
      accountCount: "Аккаунтов: {count}",
      addAccount: "+ Добавить аккаунт Google",
      switchAccount: "Переключить",
      currentActive: "Активен",
      deleteAccount: "Удалить",
      confirmDeleteAccount: "Удалить аккаунт {email}?",
      autoFailover: "Автопереключение при 429",
      autoFailoverDesc: "Когда у активного аккаунта заканчивается квота (HTTP 429), запрос автоматически повторяется со следующим доступным аккаунтом из пула.",
      switchingAccount: "Переключение...",
      deletingAccount: "Удаление...",
      switchSuccess: "Активен аккаунт {email}",
      deleteSuccess: "Аккаунт {email} удалён",
      proxyTitle: "Сетевой прокси",
      proxyDesc: "Все запросы к Google (вход, квоты, чат) идут через этот прокси. Поддерживаются http://, https://, socks5:// и socks5h://, можно с user:pass@. Оставьте пустым, чтобы использовать переменные HTTPS_PROXY / ALL_PROXY; введите direct для прямого подключения.",
      proxyPlaceholder: "socks5h://user:pass@127.0.0.1:1080",
      proxySave: "Сохранить",
      proxySaving: "Сохранение...",
      proxySaved: "✨ Прокси сохранён",
      proxyActive: "Используется: {url} (источник: {source})",
      proxyNone: "Прокси не используется (прямое подключение)",
      langLabel: "Язык",
      langAuto: "Авто",
      quotaWindow_weekly: "Остаток недельного лимита",
      quotaWindow_fiveHour: "Остаток 5-часового лимита",
      quotaWindow_generic: "Остаток квоты",
      quotaSlot_current: "(текущее окно)",
      quotaSlot_carry: "(перенос)",
      quotaGeminiGroup: "Модели Gemini",
      quotaGeminiGroupDesc: "Модели в группе: вариантов Gemini — {count}, общий пул квоты",
    };

    // Google 下发的配额文案是英文；俄语界面下按规则翻译，未命中的保持英文原文
    const QUOTA_TEXT_RU = {
      "weekly limit remaining": "Остаток недельного лимита",
      "weekly limit": "Остаток недельного лимита",
      "five hour limit remaining": "Остаток 5-часового лимита",
      "5 hour limit remaining": "Остаток 5-часового лимита",
      "quota remaining": "Остаток квоты",
      "gemini models": "Модели Gemini",
      "claude and gpt models": "Модели Claude и GPT",
      "claude & gpt models": "Модели Claude и GPT",
    };

    const QUOTA_DESC_RULES_RU = [
      [/^Models within this group:?\s*/i, "Модели в этой группе: "],
      [/^You have used some of your weekly limit,?\s*/i, "Вы израсходовали часть недельного лимита, "],
      [/^You have used all of your weekly limit,?\s*/i, "Недельный лимит исчерпан, "],
      [/^You have used some of your 5-hour limit,?\s*/i, "Вы израсходовали часть 5-часового лимита, "],
      [/^You have used all of your 5-hour limit,?\s*/i, "5-часовой лимит исчерпан, "],
      [/^You have used some of your limit,?\s*/i, "Вы израсходовали часть лимита, "],
    ];

    const QUOTA_TOP_DESC_RU =
      "Модели одной группы делят общий недельный и 5-часовой лимиты. Квота списывается пропорционально стоимости токенов, поэтому чем короче задачи и экономичнее модель, тем дольше хватает лимита. 5-часовой лимит сглаживает пики нагрузки и честно распределяет мощности между пользователями, а недельный зависит от вашего тарифа.";

    function durationRu(span) {
      return String(span)
        .replace(/(\d+)\s*days?/gi, "$1 д")
        .replace(/(\d+)\s*hours?/gi, "$1 ч")
        .replace(/(\d+)\s*minutes?/gi, "$1 мин")
        .replace(/,\s*/g, " ")
        .trim();
    }

    function quotaTextRu(text) {
      if (typeof text !== "string" || !text) return text;
      return QUOTA_TEXT_RU[text.trim().toLowerCase()] || text;
    }

    function quotaDescriptionRu(text) {
      if (typeof text !== "string" || !text.trim()) return text;
      const raw = text.trim();
      if (/^Within each group, models share/i.test(raw)) return QUOTA_TOP_DESC_RU;
      let out = raw;
      for (const [pattern, value] of QUOTA_DESC_RULES_RU) out = out.replace(pattern, value);
      out = out.replace(/it will fully refresh in\s+([^.]+)\.?/gi, (_m, span) => `полностью восстановится через ${durationRu(span)}`);
      out = out.replace(/it will refresh in\s+([^.]+)\.?/gi, (_m, span) => `восстановится через ${durationRu(span)}`);
      return out;
    }

    // 配额条目/分组的显示文案：zh 用服务端中文；en / ru 优先用结构化 i18n，其次 Google 英文原文
    function quotaRowLabel(row, t) {
      const fallback = row.label || row.displayName || row.id || t("quota");
      if (t.lang === "zh") return fallback;
      if (row.i18n && row.i18n.window) {
        const base = t(`quotaWindow_${row.i18n.window}`);
        return row.i18n.slot ? `${base} ${t(`quotaSlot_${row.i18n.slot}`)}` : base;
      }
      if (row.labelEn) return t.lang === "ru" ? quotaTextRu(row.labelEn) : row.labelEn;
      return fallback;
    }

    function quotaGroupTitle(group, t) {
      const fallback = group.displayName || t("quota");
      if (t.lang === "zh") return fallback;
      if (group.i18n && group.i18n.key === "geminiGroup") return t("quotaGeminiGroup");
      if (group.displayNameEn) return t.lang === "ru" ? quotaTextRu(group.displayNameEn) : group.displayNameEn;
      return fallback;
    }

    function quotaGroupDescription(group, t) {
      if (t.lang === "zh") return group.description;
      if (group.i18n && group.i18n.key === "geminiGroup") return t("quotaGeminiGroupDesc", { count: group.i18n.count });
      if (group.descriptionEn) return t.lang === "ru" ? quotaDescriptionRu(group.descriptionEn) : group.descriptionEn;
      return group.description;
    }

    const DICTS = { zh, en, ru };
    const LANG_STORAGE_KEY = "dsh-antigravity.lang";

    function normalizeLang(code) {
      const value = String(code || "").toLowerCase();
      if (value.startsWith("ru")) return "ru";
      if (value.startsWith("zh")) return "zh";
      if (value.startsWith("en")) return "en";
      return "";
    }

    // 插件页语言覆盖（auto = 空字符串），仅保存在当前浏览器
    function readLangOverride() {
      try {
        return normalizeLang(window.localStorage.getItem(LANG_STORAGE_KEY));
      } catch (_) {
        return "";
      }
    }

    function writeLangOverride(lang) {
      try {
        if (lang) window.localStorage.setItem(LANG_STORAGE_KEY, lang);
        else window.localStorage.removeItem(LANG_STORAGE_KEY);
      } catch (_) {}
    }

    function detectLang(ctx) {
      const active = (ctx && ctx.locale && typeof ctx.locale.getLocale === "function")
        ? ctx.locale.getLocale()?.active
        : null;
      const dshLang = normalizeLang(active);
      const browserLang = typeof navigator !== "undefined" ? normalizeLang(navigator.language) : "";
      if (dshLang === "zh" || dshLang === "ru") return dshLang;
      // DSH 本身没有俄语界面：系统 / 浏览器语言为俄语时优先俄语，而不是 DSH 默认的英语
      if (browserLang === "ru") return "ru";
      return dshLang || browserLang || "en";
    }

    function createTranslator(ctx, override) {
      const lang = override || detectLang(ctx);
      const dict = DICTS[lang] || en;
      function t(key, params) {
        let text = dict[key] || en[key] || key;
        if (params && typeof params === "object") {
          for (const [k, v] of Object.entries(params)) {
            text = text.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
          }
        }
        return text;
      }
      t.lang = lang;
      return t;
    }

    function patchNavIconScoped() {
      try {
        const panel = document.querySelector(".VOzbGW_panel, [data-shortcut-modal='settings'], .dsh-settings-modal");
        const root = panel || document;
        const spans = root.querySelectorAll("span");
        for (const span of spans) {
          if (span.textContent && span.textContent.trim() === "Antigravity") {
            const btn = span.closest("button");
            if (btn) {
              const svg = btn.querySelector("svg");
              if (svg) {
                svg.setAttribute("viewBox", "0 0 110 113");
                svg.setAttribute("width", "16");
                svg.setAttribute("height", "16");
                svg.setAttribute("fill", "none");
                const path = svg.querySelector("path");
                if (!path || path.getAttribute("d") !== ANTIGRAVITY_SVG_PATH) {
                  svg.innerHTML = `<path d="${ANTIGRAVITY_SVG_PATH}" fill="currentColor"/>`;
                }
              }
            }
          }
        }
      } catch (_) {}
    }

    function installStyle() {
      if (document.getElementById(STYLE_ID)) return;
      const style = document.createElement("style");
      style.id = STYLE_ID;
      style.textContent = `
.dsha-wrap {
  box-sizing: border-box;
  width: 100%;
  padding: 0 0 32px;
  color: var(--dsha-text-main);
  --dsha-bg-surface: var(--dsw-alias-bg-layer-1, #ffffff);
  --dsha-bg-subtle: var(--dsw-alias-bg-layer-2, #f8fafc);
  --dsha-bg-card: var(--dsw-alias-bg-base, #ffffff);
  --dsha-border-card: var(--dsw-alias-border-l3, rgba(0, 0, 0, 0.08));
  --dsha-border-subtle: var(--dsw-alias-border-l4, rgba(0, 0, 0, 0.05));
  --dsha-text-main: var(--dsw-alias-label-primary, #0f172a);
  --dsha-text-secondary: var(--dsw-alias-label-secondary, #475569);
  --dsha-text-muted: var(--dsw-alias-label-tertiary, #94a3b8);
  --dsha-hover-bg: var(--dsw-alias-interactive-bg-hover, rgba(0, 0, 0, 0.04));
  --dsha-brand-color: var(--dsw-alias-brand-primary, #3964fe);
  --dsha-btn-primary-bg: var(--dsw-alias-button-primary-fill, #3964fe);
  --dsha-btn-primary-hover: var(--dsw-alias-button-primary-hover, #2b53e6);
}

@media (prefers-color-scheme: dark) {
  .dsha-wrap {
    --dsha-bg-surface: var(--dsw-alias-bg-layer-1, #18181b);
    --dsha-bg-subtle: var(--dsw-alias-bg-layer-2, #202024);
    --dsha-bg-card: var(--dsw-alias-bg-base, #131316);
    --dsha-border-card: var(--dsw-alias-border-l3, rgba(255, 255, 255, 0.1));
    --dsha-border-subtle: var(--dsw-alias-border-l4, rgba(255, 255, 255, 0.06));
    --dsha-text-main: var(--dsw-alias-label-primary, #f4f4f5);
    --dsha-text-secondary: var(--dsw-alias-label-secondary, #a1a1aa);
    --dsha-text-muted: var(--dsw-alias-label-tertiary, #71717a);
    --dsha-hover-bg: var(--dsw-alias-interactive-bg-hover, rgba(255, 255, 255, 0.05));
    --dsha-brand-color: var(--dsw-alias-brand-primary, #3964fe);
    --dsha-btn-primary-bg: var(--dsw-alias-button-primary-fill, #3964fe);
    --dsha-btn-primary-hover: var(--dsw-alias-button-primary-hover, #2b53e6);
  }
}

body[data-ds-dark-theme] .dsha-wrap {
  --dsha-bg-surface: var(--dsw-alias-bg-layer-1, #18181b);
  --dsha-bg-subtle: var(--dsw-alias-bg-layer-2, #202024);
  --dsha-bg-card: var(--dsw-alias-bg-base, #131316);
  --dsha-border-card: var(--dsw-alias-border-l3, rgba(255, 255, 255, 0.1));
  --dsha-border-subtle: var(--dsw-alias-border-l4, rgba(255, 255, 255, 0.06));
  --dsha-text-main: var(--dsw-alias-label-primary, #f4f4f5);
  --dsha-text-secondary: var(--dsw-alias-label-secondary, #a1a1aa);
  --dsha-text-muted: var(--dsw-alias-label-tertiary, #71717a);
  --dsha-hover-bg: var(--dsw-alias-interactive-bg-hover, rgba(255, 255, 255, 0.05));
  --dsha-brand-color: var(--dsw-alias-brand-primary, #3964fe);
  --dsha-btn-primary-bg: var(--dsw-alias-button-primary-fill, #3964fe);
  --dsha-btn-primary-hover: var(--dsw-alias-button-primary-hover, #2b53e6);
}

.dsha-page-head {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 6px;
}
.dsha-lang-picker {
  margin-left: auto;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--dsha-text-muted);
}
.dsha-lang-select {
  background: var(--dsha-bg-subtle);
  color: var(--dsha-text-main);
  border: 1px solid var(--dsha-border-subtle);
  border-radius: 8px;
  padding: 4px 8px;
  font-size: 12.5px;
  cursor: pointer;
}
.dsha-brand-icon {
  color: var(--dsha-brand-color);
  flex-shrink: 0;
}
.dsha-page-title {
  margin: 0;
  color: var(--dsha-text-main);
  font-size: 22px;
  font-weight: 700;
  letter-spacing: -0.02em;
}
.dsha-version-tag {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 999px;
  background: rgba(57, 100, 254, 0.1);
  color: var(--dsha-brand-color);
  border: 1px solid rgba(57, 100, 254, 0.2);
}
.dsha-page-desc {
  margin: 0 0 20px;
  color: var(--dsha-text-muted);
  font-size: 13px;
  line-height: 20px;
}

.dsha-card {
  background: var(--dsha-bg-surface);
  border: 1px solid var(--dsha-border-card);
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.03), 0 1px 2px -1px rgba(0, 0, 0, 0.02);
  margin-bottom: 18px;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.dsha-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 16px;
}
.dsha-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 16px;
  font-weight: 650;
  color: var(--dsha-text-main);
  letter-spacing: -0.01em;
}
.dsha-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  align-items: center;
}

.dsha-card-header {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
}
.dsha-card-header-main {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.dsha-card-desc {
  color: var(--dsha-text-muted);
  font-size: 13px;
  line-height: 19px;
}
.dsha-card-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
}

.dsha-btn {
  border: 1px solid var(--dsha-border-card);
  background: var(--dsha-bg-subtle);
  color: var(--dsha-text-main);
  border-radius: 10px;
  padding: 7px 14px;
  font-size: 13px;
  font-weight: 550;
  line-height: 18px;
  cursor: pointer;
  transition: all 0.15s ease;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
}
.dsha-btn:hover:not(:disabled) {
  background: var(--dsha-hover-bg);
  border-color: var(--dsha-text-muted);
}
.dsha-btn:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}
.dsha-btn-primary {
  border-color: transparent;
  background: var(--dsha-btn-primary-bg, var(--dsha-brand-color));
  color: #ffffff;
  box-shadow: 0 1px 2px rgba(57, 100, 254, 0.25);
}
.dsha-btn-primary:hover:not(:disabled) {
  background: var(--dsha-btn-primary-hover, #2b53e6);
  opacity: 0.95;
  transform: translateY(-1px);
  box-shadow: 0 3px 6px rgba(57, 100, 254, 0.3);
}

.dsha-spinner {
  display: inline-block;
  width: 12px;
  height: 12px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: dshaSpin 0.8s linear infinite;
  vertical-align: middle;
}
@keyframes dshaSpin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.dsha-save-saved {
  font-size: 12px;
  font-weight: 600;
  color: #10b981;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  animation: dshaFadeIn 0.2s ease;
}
.dsha-save-saving {
  font-size: 12px;
  font-weight: 500;
  color: var(--dsha-brand-color);
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
@keyframes dshaFadeIn {
  from { opacity: 0; transform: translateY(-2px); }
  to { opacity: 1; transform: translateY(0); }
}

.dsha-account-box {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 14px 16px;
  border: 1px solid var(--dsha-border-subtle);
  border-radius: 12px;
  background: var(--dsha-bg-subtle);
  margin-bottom: 16px;
}
.dsha-email {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  font-weight: 600;
  min-width: 0;
  flex: 1 1 auto;
  color: var(--dsha-text-main);
}
.dsha-avatar-circle {
  width: 28px;
  height: 28px;
  border-radius: 999px;
  background: linear-gradient(135deg, #4285f4, #34a853);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-size: 13px;
  font-weight: 700;
  flex-shrink: 0;
}
.dsha-email-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.dsha-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border-radius: 999px;
  background: rgba(57, 100, 254, 0.1);
  color: var(--dsha-brand-color);
  border: 1px solid rgba(57, 100, 254, 0.25);
  padding: 4px 10px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  flex-shrink: 0;
}

.dsha-badge-counter {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 999px;
  background: var(--dsha-bg-subtle);
  color: var(--dsha-text-muted);
  border: 1px solid var(--dsha-border-subtle);
}

.dsha-account-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 14px;
}

.dsha-account-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 12px 16px;
  border: 1px solid var(--dsha-border-card);
  border-radius: 12px;
  background: var(--dsha-bg-surface);
  transition: all 0.15s ease;
}

.dsha-account-item:hover {
  border-color: var(--dsha-text-muted);
}

.dsha-account-item-active {
  border-color: var(--dsha-brand-color);
  background: rgba(57, 100, 254, 0.03);
  box-shadow: 0 0 0 1px var(--dsha-brand-color);
}

body[data-ds-dark-theme] .dsha-account-item-active {
  background: rgba(57, 100, 254, 0.08);
}

.dsha-account-item-left {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
  flex: 1 1 auto;
}

.dsha-account-avatar {
  width: 32px;
  height: 32px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-size: 14px;
  font-weight: 700;
  flex-shrink: 0;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.12);
}

.dsha-account-details {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  flex: 1 1 auto;
  flex-wrap: wrap;
}

.dsha-account-email {
  font-size: 13.5px;
  font-weight: 600;
  color: var(--dsha-text-main);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 320px;
}

.dsha-account-tag-active {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 650;
  background: rgba(16, 185, 129, 0.12);
  color: #10b981;
  border: 1px solid rgba(16, 185, 129, 0.25);
  flex-shrink: 0;
}

.dsha-account-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.dsha-btn-danger {
  color: #ef4444;
  background: transparent;
  border-color: transparent;
  padding: 6px 10px;
}

.dsha-btn-danger:hover:not(:disabled) {
  background: rgba(239, 68, 68, 0.1);
  border-color: rgba(239, 68, 68, 0.2);
}

.dsha-failover-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 16px;
  border: 1px solid var(--dsha-border-subtle);
  border-radius: 12px;
  background: var(--dsha-bg-subtle);
  margin-top: 14px;
  margin-bottom: 6px;
  transition: all 0.2s ease;
}

.dsha-failover-info {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
  flex: 1 1 auto;
}

.dsha-failover-title {
  font-size: 13.5px;
  font-weight: 650;
  color: var(--dsha-text-main);
  display: flex;
  align-items: center;
  gap: 6px;
}

.dsha-failover-desc {
  font-size: 12px;
  color: var(--dsha-text-muted);
  line-height: 18px;
}

.dsha-switch {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
  flex-shrink: 0;
  cursor: pointer;
}

.dsha-switch input {
  opacity: 0;
  width: 0;
  height: 0;
  margin: 0;
  position: absolute;
}

.dsha-switch-slider {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--dsha-border-card);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 999px;
  border: 1px solid var(--dsha-border-subtle);
}

.dsha-switch-slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 2px;
  bottom: 2px;
  background-color: #ffffff;
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 50%;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.dsha-switch input:checked + .dsha-switch-slider {
  background-color: var(--dsha-brand-color);
  border-color: var(--dsha-brand-color);
}

.dsha-switch input:checked + .dsha-switch-slider:before {
  transform: translateX(20px);
}

.dsha-switch input:disabled + .dsha-switch-slider {
  opacity: 0.55;
  cursor: not-allowed;
}

.dsha-quota-title {
  margin: 20px 0 10px;
  color: var(--dsha-text-main);
  font-size: 14px;
  font-weight: 650;
  display: flex;
  align-items: center;
  gap: 6px;
}
.dsha-quota-group {
  margin-top: 12px;
  padding: 16px 18px;
  background: var(--dsha-bg-subtle);
  border: 1px solid var(--dsha-border-card);
  border-radius: 12px;
  transition: all 0.2s ease;
}
.dsha-group-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}
.dsha-group-title {
  font-size: 14px;
  font-weight: 650;
  color: var(--dsha-text-main);
  display: flex;
  align-items: center;
  gap: 6px;
}
.dsha-group-desc {
  font-size: 12px;
  color: var(--dsha-text-muted);
}
.dsha-row {
  padding: 10px 0;
  border-top: 1px solid var(--dsha-border-subtle);
}
.dsha-row:first-of-type {
  border-top: 0;
  padding-top: 0;
}
.dsha-rowtop {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  min-width: 0;
  font-size: 13px;
  font-weight: 550;
  color: var(--dsha-text-secondary);
}
.dsha-row-name {
  min-width: 0;
  flex: 1 1 auto;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.dsha-metrics {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
  font-size: 12px;
  color: var(--dsha-text-muted);
}
.dsha-percent-chip {
  padding: 2px 8px;
  border-radius: 6px;
  font-weight: 700;
  font-size: 12px;
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}
.dsha-percent-chip-cyan {
  background: rgba(6, 182, 212, 0.1);
  color: #06b6d4;
}
.dsha-percent-chip-warn {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
}
.dsha-percent-chip-alert {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}
.dsha-bar {
  height: 7px;
  margin-top: 8px;
  border-radius: 999px;
  background: var(--dsha-border-card);
  overflow: hidden;
  position: relative;
}
.dsha-fill {
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, #10b981, #059669);
  transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}
.dsha-fill-cyan {
  background: linear-gradient(90deg, #3964fe, #06b6d4);
}
.dsha-fill-warn {
  background: linear-gradient(90deg, #f59e0b, #d97706);
}
.dsha-fill-alert {
  background: linear-gradient(90deg, #ef4444, #dc2626);
}

.dsha-empty {
  border: 1px dashed var(--dsha-border-card);
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  color: var(--dsha-text-muted);
  background: var(--dsha-bg-subtle);
  font-size: 13px;
  line-height: 22px;
}
.dsha-error {
  margin-top: 14px;
  color: #ef4444;
  background: rgba(239, 68, 68, 0.08);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 10px;
  padding: 12px 14px;
  font-size: 13px;
  white-space: pre-wrap;
}
.dsha-note {
  margin-top: 14px;
  color: var(--dsha-text-muted);
  font-size: 12px;
  line-height: 18px;
}
/* OAuth 手动兜底面板（复制授权链接 + 粘贴回调链接/CODE） */
.dsha-oauth-manual {
  margin-top: 16px;
  border: 1px solid var(--dsha-border-card);
  border-radius: 12px;
  background: var(--dsha-bg-subtle);
  padding: 16px;
}
.dsha-oauth-manual-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 8px;
}
.dsha-oauth-manual-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--dsha-text-main);
}
.dsha-oauth-link {
  display: block;
  width: 100%;
  box-sizing: border-box;
  background: var(--dsha-bg-card, #ffffff);
  border: 1px solid var(--dsha-border-card);
  border-radius: 8px;
  padding: 10px 12px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 12px;
  line-height: 18px;
  color: var(--dsha-text-muted);
  word-break: break-all;
  white-space: pre-wrap;
  max-height: 96px;
  overflow: auto;
}
.dsha-oauth-manual-hint {
  margin: 12px 0 8px;
  font-size: 12px;
  line-height: 18px;
  color: var(--dsha-text-muted);
}
.dsha-oauth-manual-row {
  display: flex;
  gap: 8px;
  align-items: center;
}
.dsha-input {
  flex: 1 1 auto;
  min-width: 0;
  box-sizing: border-box;
  background: var(--dsha-bg-card, #ffffff);
  border: 1px solid var(--dsha-border-card);
  border-radius: 8px;
  padding: 8px 10px;
  font-size: 13px;
  color: var(--dsha-text-main);
  outline: none;
}
.dsha-input:focus {
  border-color: var(--dsha-brand-color);
  box-shadow: 0 0 0 2px rgba(57, 100, 254, 0.15);
}
.dsha-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.dsha-btn-small {
  padding: 6px 10px;
  font-size: 12px;
}
.dsha-btn-link {
  margin-top: 12px;
  padding: 4px 0;
  background: transparent;
  border: none;
  color: var(--dsha-brand-color);
  font-size: 12px;
  font-weight: 550;
  cursor: pointer;
}
.dsha-btn-link:hover:not(:disabled) {
  text-decoration: underline;
  background: transparent;
}

.dsha-filter-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin: 14px 0 12px;
  flex-wrap: wrap;
}
.dsha-tabs {
  display: flex;
  gap: 6px;
  background: var(--dsha-bg-subtle);
  padding: 4px;
  border-radius: 10px;
  border: 1px solid var(--dsha-border-subtle);
  overflow-x: auto;
  flex-wrap: nowrap;
  scrollbar-width: none;
  -ms-overflow-style: none;
  max-width: 100%;
}
.dsha-tabs::-webkit-scrollbar {
  display: none;
}
.dsha-tab-btn {
  border: 0;
  background: transparent;
  color: var(--dsha-text-muted);
  padding: 5px 11px;
  font-size: 12px;
  font-weight: 550;
  border-radius: 7px;
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;
  flex-shrink: 0;
}
.dsha-tab-btn:hover {
  color: var(--dsha-text-main);
}
.dsha-tab-btn-active {
  background: var(--dsha-bg-surface);
  color: var(--dsha-text-main);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
  font-weight: 650;
}

.dsha-model-list {
  border: 1px solid var(--dsha-border-card);
  border-radius: 14px;
  overflow: hidden;
  background: var(--dsha-bg-surface);
}
.dsha-model-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 12px 16px;
  background: var(--dsha-bg-surface);
  border-top: 1px solid var(--dsha-border-subtle);
  cursor: pointer;
  transition: background 0.15s ease;
  user-select: none;
}
.dsha-model-row:first-child {
  border-top: 0;
}
.dsha-model-row:hover {
  background: var(--dsha-hover-bg);
}
.dsha-model-row-left {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
  flex: 1 1 auto;
}
.dsha-custom-checkbox {
  width: 18px;
  height: 18px;
  border-radius: 5px;
  border: 1.5px solid var(--dsha-text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.15s ease;
  background: var(--dsha-bg-surface);
}
.dsha-custom-checkbox-checked {
  background: var(--dsha-brand-color);
  border-color: var(--dsha-brand-color);
}
.dsha-custom-checkbox-checked svg {
  display: block;
}
.dsha-model-info {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.dsha-model-top {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.dsha-model-name {
  font-size: 14px;
  font-weight: 650;
  color: var(--dsha-text-main);
  line-height: 18px;
}
.dsha-provider-tag {
  font-size: 10px;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 4px;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}
.dsha-provider-google {
  background: rgba(66, 133, 244, 0.1);
  color: #4285f4;
  border: 1px solid rgba(66, 133, 244, 0.2);
}
.dsha-provider-anthropic {
  background: rgba(217, 119, 6, 0.1);
  color: #d97706;
  border: 1px solid rgba(217, 119, 6, 0.2);
}
.dsha-provider-openai {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
  border: 1px solid rgba(16, 185, 129, 0.2);
}
.dsha-feature-pills {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: var(--dsha-text-muted);
}
.dsha-pill {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 1px 6px;
  border-radius: 4px;
  background: var(--dsha-bg-subtle);
  border: 1px solid var(--dsha-border-subtle);
  font-size: 11px;
}
.dsha-model-quota-tag {
  font-size: 12px;
  font-weight: 600;
  color: var(--dsha-text-muted);
  white-space: nowrap;
  flex-shrink: 0;
}
.dsha-qs {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 20px;
  font-size: 12px;
  line-height: 16px;
  color: var(--dsw-alias-label-secondary, #a1a1aa);
  white-space: nowrap;
  user-select: none;
  cursor: default;
  font-variant-numeric: tabular-nums;
}
.dsha-qs-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #10b981;
  box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.18);
  flex-shrink: 0;
}
.dsha-qs-dot-cyan { background: #a78bfa; box-shadow: 0 0 0 2px rgba(167, 139, 250, 0.2); }
.dsha-qs-dot-warn { background: #f59e0b; box-shadow: 0 0 0 2px rgba(245, 158, 11, 0.2); }
.dsha-qs-dot-alert { background: #ef4444; box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.22); }
.dsha-qs-bar {
  width: 32px;
  height: 3px;
  border-radius: 999px;
  background: rgba(127, 127, 127, 0.25);
  overflow: hidden;
  flex-shrink: 0;
}
.dsha-qs-fill {
  display: block;
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, #10b981, #34d399);
  transition: width 0.4s ease;
}
.dsha-qs-fill-cyan { background: linear-gradient(90deg, #8b5cf6, #c4b5fd); }
.dsha-qs-fill-warn { background: linear-gradient(90deg, #d97706, #fbbf24); }
.dsha-qs-fill-alert { background: linear-gradient(90deg, #dc2626, #f87171); }
.dsha-qs-pct { font-weight: 600; }
.dsha-qs-pct-warn { color: #f59e0b; }
.dsha-qs-pct-alert { color: #ef4444; }
.dsha-qs-sep { opacity: 0.5; }
`;
      document.head.append(style);
    }

    async function api(path, options) {
      const response = await fetch(`${API}${path}`, {
        ...options,
        headers: {
          "content-type": "application/json",
          ...(options && options.headers ? options.headers : {}),
        },
      });
      const body = await response.json().catch(() => ({ ok: false, error: "invalid-json" }));
      if (!response.ok || !body.ok) {
        throw new Error(body.error || `HTTP ${response.status}`);
      }
      return body.value;
    }

    function AntigravityIcon({ size = 20, className = "" }) {
      return React.createElement(
        "svg",
        {
          viewBox: "0 0 110 113",
          width: size,
          height: size,
          fill: "none",
          className,
          style: { flexShrink: 0, display: "inline-block", verticalAlign: "middle" },
          xmlns: "http://www.w3.org/2000/svg",
          "aria-hidden": "true",
        },
        React.createElement("path", {
          d: ANTIGRAVITY_SVG_PATH,
          fill: "currentColor",
        }),
      );
    }

    const AVATAR_GRADIENTS = [
      "linear-gradient(135deg, #4f46e5, #3b82f6)",
      "linear-gradient(135deg, #059669, #10b981)",
      "linear-gradient(135deg, #7c3aed, #8b5cf6)",
      "linear-gradient(135deg, #db2777, #ec4899)",
      "linear-gradient(135deg, #d97706, #f59e0b)",
      "linear-gradient(135deg, #0891b2, #06b6d4)",
      "linear-gradient(135deg, #2563eb, #60a5fa)",
      "linear-gradient(135deg, #ea580c, #f97316)",
    ];

    function getAvatarBackground(email) {
      let hash = 0;
      const str = String(email || "");
      for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) - hash) + str.charCodeAt(i);
      }
      return AVATAR_GRADIENTS[Math.abs(hash) % AVATAR_GRADIENTS.length];
    }

    function CheckIcon({ size = 12, stroke = "#ffffff" } = {}) {
      return React.createElement(
        "svg",
        {
          width: size,
          height: size,
          viewBox: "0 0 12 12",
          fill: "none",
          xmlns: "http://www.w3.org/2000/svg",
        },
        React.createElement("path", {
          d: "M2.5 6.5L4.8 8.8L9.5 3.5",
          stroke,
          strokeWidth: "2",
          strokeLinecap: "round",
          strokeLinejoin: "round",
        }),
      );
    }

    function TrashIcon({ size = 13 } = {}) {
      return React.createElement(
        "svg",
        {
          width: size,
          height: size,
          viewBox: "0 0 16 16",
          fill: "none",
          stroke: "currentColor",
          strokeWidth: "1.5",
          strokeLinecap: "round",
          strokeLinejoin: "round",
          xmlns: "http://www.w3.org/2000/svg",
        },
        React.createElement("path", {
          d: "M2.5 4h11M5.5 4V2.5a1 1 0 011-1h3a1 1 0 011 1V4M12.5 4v9.5a1 1 0 01-1 1h-7a1 1 0 01-1-1V4M6.5 7.5v4M9.5 7.5v4",
        }),
      );
    }

    function extractModelVersion(model) {
      const name = String(model && model.name ? model.name : "");
      const id = String(model && model.id ? model.id : "");
      const idMatch = id.match(/(?:gemini|claude|gpt)[-_ ]*v?(\d+(?:\.\d+)*)/i)
        || id.match(/\b(\d+(?:\.\d+)+)\b/);
      if (idMatch) return idMatch[1].split(".").map((num) => parseInt(num, 10) || 0);

      const nameMatch = name.match(/(?:gemini|claude|gpt)[-_ ]*v?(\d+(?:\.\d+)*)/i)
        || name.match(/\b(\d+(?:\.\d+)+)\b/);
      if (nameMatch) return nameMatch[1].split(".").map((num) => parseInt(num, 10) || 0);

      return [0];
    }

    function compareVersionsDesc(v1, v2) {
      const len = Math.max(v1.length, v2.length);
      for (let i = 0; i < len; i++) {
        const num1 = v1[i] !== undefined ? v1[i] : 0;
        const num2 = v2[i] !== undefined ? v2[i] : 0;
        if (num1 !== num2) return num2 - num1;
      }
      return 0;
    }

    function getFamilyOrder(model) {
      const text = `${model && model.id ? model.id : ""} ${model && model.name ? model.name : ""}`.toLowerCase();
      if (text.includes("gemini")) return 1;
      if (text.includes("claude")) return 2;
      if (text.includes("gpt")) return 3;
      return 4;
    }

    function getVariantScore(model) {
      const text = `${model && model.name ? model.name : ""} ${model && model.id ? model.id : ""}`.toLowerCase();
      if (text.includes("ultra")) return 1;
      if (text.includes("pro") && !text.includes("lite")) return 2;
      if (text.includes("flash") && !text.includes("lite") && !text.includes("thinking") && !text.includes("image")) return 3;
      if (text.includes("flash") && text.includes("thinking") && !text.includes("lite")) return 4;
      if (text.includes("lite") && !text.includes("thinking")) return 6;
      if (text.includes("lite") && text.includes("thinking")) return 7;
      return 10;
    }

    function compareAntigravityModels(a, b) {
      const famA = getFamilyOrder(a);
      const famB = getFamilyOrder(b);
      if (famA !== famB) return famA - famB;

      const verA = extractModelVersion(a);
      const verB = extractModelVersion(b);
      const verComp = compareVersionsDesc(verA, verB);
      if (verComp !== 0) return verComp;

      const variantA = getVariantScore(a);
      const variantB = getVariantScore(b);
      if (variantA !== variantB) return variantA - variantB;

      return (a.name || a.id || "").localeCompare(b.name || b.id || "") || (a.id || "").localeCompare(b.id || "");
    }

    function formatPlanBadge(plan) {
      if (!plan) return "PRO";
      const lower = String(plan).toLowerCase();
      if (lower.includes("ultra")) return "ULTRA";
      if (lower.includes("pro")) return "PRO";
      if (lower.includes("free")) return "FREE";
      const clean = plan.replace(/\s*\([^)]*\)/g, "").trim();
      return clean.length > 12 ? clean.slice(0, 12).trim() : clean || "PRO";
    }

    function formatReset(resetTime, t) {
      if (!resetTime) return t ? t("resetUnavailable") : "n/a";
      const timestamp = Date.parse(resetTime);
      if (!Number.isFinite(timestamp)) return resetTime;
      const delta = timestamp - Date.now();
      if (delta <= 0) return t ? t("resetNow") : "now";
      const totalMinutes = Math.round(delta / 60000);
      const days = Math.floor(totalMinutes / (60 * 24));
      const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
      const minutes = totalMinutes % 60;
      if (days > 0) return t ? t("timeDayHour", { days, hours }) : `${days}d ${hours}h`;
      if (hours > 0) return t ? t("timeHourMin", { hours, minutes }) : `${hours}h ${minutes}m`;
      return t ? t("timeMin", { minutes }) : `${minutes}m`;
    }

    function resetText(row, t) {
      // resetTime 在前端按当前界面语言格式化；服务端 resetLabel 固定为中文，仅作兜底
      if (row && row.resetTime && Number.isFinite(Date.parse(row.resetTime))) {
        return t ? t("resetPrefix", { time: formatReset(row.resetTime, t) }) : `Reset: ${formatReset(row.resetTime, t)}`;
      }
      if (row && row.resetLabel) return t ? t("resetPrefix", { time: row.resetLabel }) : `Reset: ${row.resetLabel}`;
      return t ? t("resetUnavailable") : "Reset: n/a";
    }

    function percentOf(row) {
      if (typeof row.remainingPercent === "number") return row.remainingPercent;
      if (typeof row.remainingFraction === "number") return Math.round(row.remainingFraction * 1000) / 10;
      return 0;
    }

    function QuotaRow({ row, accent, t }) {
      const percent = percentOf(row);
      const width = Math.max(0, Math.min(100, percent));
      const isWarn = percent <= 20 && percent > 5;
      const isAlert = percent <= 5;

      const fillClass = isAlert
        ? "dsha-fill-alert"
        : isWarn
          ? "dsha-fill-warn"
          : accent === "cyan"
            ? "dsha-fill-cyan"
            : "";

      const chipClass = isAlert
        ? "dsha-percent-chip-alert"
        : isWarn
          ? "dsha-percent-chip-warn"
          : accent === "cyan"
            ? "dsha-percent-chip-cyan"
            : "";

      const label = quotaRowLabel(row, t);

      return React.createElement("div", { className: "dsha-row" },
        React.createElement("div", { className: "dsha-rowtop" },
          React.createElement("span", { className: "dsha-row-name", title: label }, label),
          React.createElement("div", { className: "dsha-metrics" },
            React.createElement("span", null, `⏱️ ${resetText(row, t)}`),
            React.createElement("span", { className: `dsha-percent-chip ${chipClass}` }, `${percent}%`),
          ),
        ),
        React.createElement("div", { className: "dsha-bar" },
          React.createElement("div", {
            className: `dsha-fill ${fillClass}`,
            style: { width: `${width}%` },
          }),
        ),
      );
    }

    function QuotaGroup({ group, accent, t }) {
      const buckets = Array.isArray(group && group.buckets) ? group.buckets : [];
      const description = quotaGroupDescription(group, t);
      return React.createElement("div", { className: "dsha-quota-group" },
        React.createElement("div", { className: "dsha-group-head" },
          React.createElement("span", { className: "dsha-group-title" },
            accent === "cyan" ? "🟣 " : "🟢 ",
            quotaGroupTitle(group, t),
          ),
          description && React.createElement("span", { className: "dsha-group-desc" }, description),
        ),
        buckets.map((bucket, index) => React.createElement(QuotaRow, {
          key: bucket.id || bucket.bucketId || bucket.label || bucket.displayName || index,
          row: bucket,
          accent,
          t,
        })),
      );
    }

    // 输入框下方统计行中的当前模型 5 小时额度 / current model's 5h quota in the composer stats row
    const QUOTA_STRIP_TTL = 60_000;
    let quotaStripCache = { at: 0, value: null, pending: null };

    function loadStripQuota(force) {
      if (!force && quotaStripCache.value && Date.now() - quotaStripCache.at < QUOTA_STRIP_TTL) {
        return Promise.resolve(quotaStripCache.value);
      }
      if (quotaStripCache.pending) return quotaStripCache.pending;
      quotaStripCache.pending = api("/quota", { method: "POST" })
        .then((value) => {
          quotaStripCache = { at: Date.now(), value, pending: null };
          return value;
        })
        .catch((error) => {
          quotaStripCache.pending = null;
          throw error;
        });
      return quotaStripCache.pending;
    }

    const EMPTY_DIRECTORY_STATE = {};
    const noopSubscribe = () => () => {};

    function isCyanGroup(group) {
      return /claude|gpt|3p|openai|anthropic/i.test(`${group.displayName || ""} ${group.displayNameEn || ""} ${group.description || ""}`);
    }

    function pickModelGroup(groups, modelId) {
      const list = groups.filter((group) => Array.isArray(group && group.buckets) && group.buckets.length);
      const wantGemini = /gemini/i.test(modelId || "");
      return list.find((group) => (wantGemini ? !isCyanGroup(group) : isCyanGroup(group))) || list[0];
    }

    function pickFiveHourBucket(buckets) {
      const now = Date.now();
      const resetIn = (row) => {
        const ms = Date.parse(row.resetTime || "");
        return Number.isFinite(ms) ? ms - now : Infinity;
      };
      const isFiveHour = (row) =>
        (row.i18n && row.i18n.window === "fiveHour") ||
        /five[\s-]*hour|5[\s-]*h(ou)?r?\b|5 小时/i.test(`${row.labelEn || ""} ${row.label || ""}`) ||
        (resetIn(row) > 0 && resetIn(row) <= 6 * 3600000);
      const fiveHour = buckets.filter(isFiveHour);
      const pool = fiveHour.length ? fiveHour : buckets;
      return pool.reduce((best, row) => (resetIn(row) < resetIn(best) ? row : best), pool[0]);
    }

    function QuotaStrip({ ctx, directory }) {
      const [localeRev, setLocaleRev] = useState(0);
      useEffect(() => {
        if (!ctx || !ctx.locale || typeof ctx.locale.subscribe !== "function") return;
        return ctx.locale.subscribe(() => {
          setLocaleRev((r) => r + 1);
        });
      }, [ctx]);
      const t = useMemo(() => createTranslator(ctx, readLangOverride()), [ctx, localeRev]);

      const modelState = React.useSyncExternalStore(
        directory ? (fn) => directory.subscribe(fn) : noopSubscribe,
        directory ? () => directory.getSnapshot() : () => EMPTY_DIRECTORY_STATE,
      );
      const current = modelState && modelState.current;
      const isAntigravity = !directory || (current && current.provider === "antigravity");
      const modelId = current ? current.model : "";

      const [quota, setQuota] = useState(quotaStripCache.value);
      const [, setTick] = useState(0);
      useEffect(() => {
        if (!isAntigravity) return;
        let alive = true;
        const load = (force) => {
          loadStripQuota(force)
            .then((value) => {
              if (alive) setQuota(value);
            })
            .catch(() => {});
        };
        load(false);
        // 每分钟刷新额度并重绘倒计时
        const timer = setInterval(() => {
          load(false);
          setTick((n) => n + 1);
        }, QUOTA_STRIP_TTL);
        const onFocus = () => load(true);
        window.addEventListener("focus", onFocus);
        return () => {
          alive = false;
          clearInterval(timer);
          window.removeEventListener("focus", onFocus);
        };
      }, [isAntigravity, modelId]);

      // 统计行是 flex 容器：把本条目排到上下文占用圆环之后
      const rootRef = useRef(null);
      React.useLayoutEffect(() => {
        let node = rootRef.current;
        while (node && node.parentElement && !node.parentElement.hasAttribute("data-composer-dock")) {
          node = node.parentElement;
        }
        if (node && node.parentElement) node.style.order = "1";
      });

      if (!isAntigravity || !quota) return null;
      const groups = Array.isArray(quota.groups) ? quota.groups : [];
      const group = pickModelGroup(groups, modelId);
      if (!group) return null;
      const row = pickFiveHourBucket(group.buckets);
      if (!row) return null;

      const percent = Math.round(percentOf(row));
      const accent = isCyanGroup(group) ? "cyan" : "";
      const state = percent <= 5 ? "alert" : percent <= 20 ? "warn" : accent;
      const reset = resetText(row, t);
      const tooltip = [
        modelId ? `${modelId} · ${quotaGroupTitle(group, t)}` : quotaGroupTitle(group, t),
        ...group.buckets.map((bucket) => `${quotaRowLabel(bucket, t)}: ${Math.round(percentOf(bucket))}% · ${resetText(bucket, t)}`),
      ].join("\n");

      return React.createElement("span", { ref: rootRef, className: "dsha-qs", title: tooltip, "data-composer-stat": "antigravity-quota" },
        React.createElement("span", { className: `dsha-qs-dot${state ? ` dsha-qs-dot-${state}` : ""}` }),
        React.createElement("span", null, t("stripFiveHour")),
        React.createElement("span", { className: "dsha-qs-bar" },
          React.createElement("span", {
            className: `dsha-qs-fill${state ? ` dsha-qs-fill-${state}` : ""}`,
            style: { width: `${Math.max(0, Math.min(100, percent))}%` },
          }),
        ),
        React.createElement("span", { className: `dsha-qs-pct${state === "warn" || state === "alert" ? ` dsha-qs-pct-${state}` : ""}` }, `${percent}%`),
        React.createElement("span", { className: "dsha-qs-sep", "aria-hidden": true }, "·"),
        React.createElement("span", null, reset),
      );
    }

    function ModelOptionRow({ option, checked, onToggle, t }) {
      const isChecked = Boolean(checked);
      const id = (option.id || "").toLowerCase();
      const isAnthropic = id.includes("claude");
      const isOpenAI = id.includes("gpt");
      const isGoogle = !isAnthropic && !isOpenAI;

      const providerLabel = isAnthropic ? "Anthropic" : isOpenAI ? "OpenAI" : "Google";
      const providerClass = isAnthropic ? "dsha-provider-anthropic" : isOpenAI ? "dsha-provider-openai" : "dsha-provider-google";

      const hasThinking = Array.isArray(option.reasoningEfforts) && option.reasoningEfforts.length > 0;
      const hasVision = Array.isArray(option.inputModalities) && option.inputModalities.includes("image");

      return React.createElement("div", {
        className: "dsha-model-row",
        onClick: () => onToggle(option.id, !isChecked),
      },
        React.createElement("div", { className: "dsha-model-row-left" },
          React.createElement("div", {
            className: `dsha-custom-checkbox ${isChecked ? "dsha-custom-checkbox-checked" : ""}`,
          },
            isChecked && React.createElement(CheckIcon, null),
          ),
          React.createElement("div", { className: "dsha-model-info" },
            React.createElement("div", { className: "dsha-model-top" },
              React.createElement("span", { className: "dsha-model-name" }, option.name || option.id),
              React.createElement("span", { className: `dsha-provider-tag ${providerClass}` }, providerLabel),
            ),
            React.createElement("div", { className: "dsha-feature-pills" },
              hasThinking && React.createElement("span", { className: "dsha-pill" }, `💭 ${t("thinkingBadge")}`),
              hasVision && React.createElement("span", { className: "dsha-pill" }, `🖼️ ${t("visionBadge")}`),
              React.createElement("span", { className: "dsha-pill" }, option.contextWindow ? `${Math.round(option.contextWindow / 1000)}k` : "1M"),
            ),
          ),
        ),
        typeof option.remainingPercent === "number" && React.createElement("div", { className: "dsha-model-quota-tag" },
          t ? t("quotaLabel", { percent: option.remainingPercent }) : `${option.remainingPercent}%`,
        ),
      );
    }

    function AntigravitySettings({ ctx }) {
      const [localeRev, setLocaleRev] = useState(0);
      useEffect(() => {
        if (!ctx || !ctx.locale || typeof ctx.locale.subscribe !== "function") return;
        return ctx.locale.subscribe(() => {
          setLocaleRev((r) => r + 1);
        });
      }, [ctx]);

      const [langOverride, setLangOverride] = useState(readLangOverride);
      const changeLang = useCallback((value) => {
        const next = normalizeLang(value);
        writeLangOverride(next);
        setLangOverride(next);
      }, []);

      const tr = useMemo(() => createTranslator(ctx, langOverride), [ctx, langOverride, localeRev]);

      const [status, setStatus] = useState({ loading: true });
      const [quota, setQuota] = useState(undefined);
      const [modelConfig, setModelConfig] = useState(undefined);
      const [optimisticModelIds, setOptimisticModelIds] = useState([]);
      const [saveStatus, setSaveStatus] = useState("idle"); // "idle" | "saving" | "saved"

      const [isLoggingIn, setIsLoggingIn] = useState(false);
      const [isRefreshingQuota, setIsRefreshingQuota] = useState(false);
      const [isLoggingOut, setIsLoggingOut] = useState(false);

      const [switchingEmail, setSwitchingEmail] = useState(null);
      const [deletingEmail, setDeletingEmail] = useState(null);
      const [isTogglingFailover, setIsTogglingFailover] = useState(false);

      const [authError, setAuthError] = useState("");
      const [accountActionError, setAccountActionError] = useState("");
      const [modelError, setModelError] = useState("");
      const [activeFilter, setActiveFilter] = useState("all");

      // OAuth 手动兜底状态：授权链接展示、复制反馈、手动输入 code/回调链接
      const [authUrl, setAuthUrl] = useState("");
      const [copied, setCopied] = useState(false);
      const [manualInput, setManualInput] = useState("");
      const [isSubmittingManual, setIsSubmittingManual] = useState(false);

      // 代理设置
      const [proxyInfo, setProxyInfo] = useState(undefined);
      const [proxyInput, setProxyInput] = useState("");
      const [proxyStatus, setProxyStatus] = useState("idle"); // "idle" | "saving" | "saved"
      const [proxyError, setProxyError] = useState("");

      useEffect(() => {
        let cancelled = false;
        api("/proxy")
          .then((value) => {
            if (cancelled) return;
            setProxyInfo(value);
            setProxyInput(value.proxyUrl || "");
          })
          .catch((err) => {
            if (!cancelled) setProxyError(err instanceof Error ? err.message : String(err));
          });
        return () => {
          cancelled = true;
        };
      }, []);

      const saveProxy = useCallback(async () => {
        if (proxyStatus === "saving") return;
        setProxyStatus("saving");
        setProxyError("");
        try {
          const value = await api("/proxy", {
            method: "POST",
            body: JSON.stringify({ proxyUrl: proxyInput.trim() }),
          });
          setProxyInfo(value);
          setProxyInput(value.proxyUrl || "");
          setProxyStatus("saved");
          setTimeout(() => setProxyStatus("idle"), 2000);
        } catch (err) {
          setProxyStatus("idle");
          setProxyError(err instanceof Error ? err.message : String(err));
        }
      }, [proxyInput, proxyStatus]);

      const pollRef = useRef(undefined);
      const loginStartTimeRef = useRef(0);
      const debounceSaveTimerRef = useRef(undefined);
      const savedTimerRef = useRef(undefined);
      const modelConfigRef = useRef(modelConfig);

      // 60s 心跳定时器驱动动态重置时间自减
      const [, setTick] = useState(0);
      useEffect(() => {
        const timer = setInterval(() => setTick((v) => v + 1), 60000);
        return () => clearInterval(timer);
      }, []);

      // 定向图标补丁微任务检查
      useEffect(() => {
        const timer = setTimeout(patchNavIconScoped, 0);
        return () => clearTimeout(timer);
      }, []);

      // 卸载时清理定时器
      useEffect(() => {
        return () => {
          if (pollRef.current !== undefined) {
            clearInterval(pollRef.current);
            pollRef.current = undefined;
          }
          if (debounceSaveTimerRef.current !== undefined) {
            clearTimeout(debounceSaveTimerRef.current);
            debounceSaveTimerRef.current = undefined;
          }
          if (savedTimerRef.current !== undefined) {
            clearTimeout(savedTimerRef.current);
            savedTimerRef.current = undefined;
          }
        };
      }, []);

      // 服务端配置更新时同步本地状态（仅在非防抖保存中）
      useEffect(() => {
        modelConfigRef.current = modelConfig;
        if (modelConfig && Array.isArray(modelConfig.enabledModelIds)) {
          if (debounceSaveTimerRef.current === undefined && saveStatus === "idle") {
            setOptimisticModelIds(modelConfig.enabledModelIds);
          }
        }
      }, [modelConfig, saveStatus]);

      const refreshStatus = useCallback(async () => {
        const value = await api("/status");
        setStatus({ loading: false, ...value });
        if (value.quota) setQuota(value.quota);
        if (value.models) setModelConfig(value.models);
        return value;
      }, []);

      const refreshQuota = useCallback(async () => {
        setIsRefreshingQuota(true);
        setAuthError("");
        try {
          const value = await api("/quota", { method: "POST" });
          setQuota(value);
          if (value.models) setModelConfig(value.models);
          await refreshStatus();
        } catch (err) {
          setAuthError(err instanceof Error ? err.message : String(err));
        } finally {
          setIsRefreshingQuota(false);
        }
      }, [refreshStatus]);

      useEffect(() => {
        installStyle();
        let cancelled = false;
        void refreshStatus()
          .then((value) => {
            if (!cancelled && value.authenticated) void refreshQuota();
          })
          .catch((err) => {
            if (!cancelled) {
              setStatus({ loading: false, authenticated: false });
              setAuthError(err instanceof Error ? err.message : String(err));
            }
          });
        return () => {
          cancelled = true;
        };
      }, [refreshQuota, refreshStatus]);

      const cancelLogin = useCallback(() => {
        if (pollRef.current !== undefined) {
          clearInterval(pollRef.current);
          pollRef.current = undefined;
        }
        setIsLoggingIn(false);
      }, []);

      const startLogin = useCallback(async () => {
        if (isLoggingIn || isLoggingOut) return;
        setIsLoggingIn(true);
        setAuthError("");
        setManualInput("");
        setCopied(false);
        try {
          const value = await api("/login", { method: "POST" });
          if (value.authUrl) {
            setAuthUrl(value.authUrl);
            // 优先尝试自动弹窗；如果被浏览器拦截，用户仍可复制下方链接去授权
            const popup = window.open(value.authUrl, "_blank", "noopener,noreferrer");
            if (!popup) {
              setAuthError(tr("popupBlocked"));
            }
          }
          if (pollRef.current !== undefined) {
            clearInterval(pollRef.current);
            pollRef.current = undefined;
          }
          loginStartTimeRef.current = Date.now();
          pollRef.current = window.setInterval(async () => {
            if (Date.now() - loginStartTimeRef.current >= 120000) {
              if (pollRef.current !== undefined) {
                clearInterval(pollRef.current);
                pollRef.current = undefined;
              }
              // 不再 setIsLoggingIn(false)，保留授权卡片让用户可以手动粘贴 code
              setAuthError(tr("loginTimeout"));
              return;
            }
            try {
              const next = await refreshStatus();
              if (next.login && next.login.status === "complete") {
                if (pollRef.current !== undefined) {
                  clearInterval(pollRef.current);
                  pollRef.current = undefined;
                }
                setIsLoggingIn(false);
                await refreshQuota();
              } else if (next.login && next.login.status === "error") {
                if (pollRef.current !== undefined) {
                  clearInterval(pollRef.current);
                  pollRef.current = undefined;
                }
                setIsLoggingIn(false);
                setAuthError(next.login.error || tr("loginFailed"));
              }
            } catch (err) {
              if (pollRef.current !== undefined) {
                clearInterval(pollRef.current);
                pollRef.current = undefined;
              }
              setIsLoggingIn(false);
              setAuthError(err instanceof Error ? err.message : String(err));
            }
          }, 2000);
        } catch (err) {
          setIsLoggingIn(false);
          setAuthError(err instanceof Error ? err.message : String(err));
        }
      }, [isLoggingIn, isLoggingOut, refreshQuota, refreshStatus, tr]);

      // 复制授权链接到剪贴板（含老浏览器 execCommand 兜底）
      const copyAuthLink = useCallback(async () => {
        if (!authUrl) return;
        const writeClipboard = async () => {
          if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(authUrl);
            return;
          }
          throw new Error("clipboard unavailable");
        };
        try {
          await writeClipboard();
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch {
          try {
            const ta = document.createElement("textarea");
            ta.value = authUrl;
            ta.style.position = "fixed";
            ta.style.top = "-1000px";
            ta.style.opacity = "0";
            document.body.appendChild(ta);
            ta.focus();
            ta.select();
            document.execCommand("copy");
            document.body.removeChild(ta);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          } catch {
            setCopied(false);
          }
        }
      }, [authUrl]);

      // 手动粘贴回调链接或 AUTHORIZATION CODE，完成 OAuth 授权
      const submitManualLogin = useCallback(async () => {
        const input = manualInput.trim();
        if (!input || isSubmittingManual) return;
        setIsSubmittingManual(true);
        setAuthError("");
        try {
          await api("/login/callback", {
            method: "POST",
            body: JSON.stringify({ callbackUrl: input }),
          });
          if (pollRef.current !== undefined) {
            clearInterval(pollRef.current);
            pollRef.current = undefined;
          }
          setIsLoggingIn(false);
          setManualInput("");
          await refreshStatus();
          await refreshQuota();
        } catch (err) {
          setAuthError(err instanceof Error ? err.message : String(err));
        } finally {
          setIsSubmittingManual(false);
        }
      }, [manualInput, isSubmittingManual, refreshStatus, refreshQuota]);

      // “我已授权，继续”：立即拉取一次登录状态（自动回调场景下的手动兜底）
      const checkNow = useCallback(async () => {
        if (!isLoggingIn) return;
        try {
          await refreshStatus();
        } catch (err) {
          setAuthError(err instanceof Error ? err.message : String(err));
        }
      }, [isLoggingIn, refreshStatus]);

      const logout = useCallback(async () => {
        if (isLoggingOut || isLoggingIn) return;
        setIsLoggingOut(true);
        setAuthError("");
        if (debounceSaveTimerRef.current !== undefined) {
          clearTimeout(debounceSaveTimerRef.current);
          debounceSaveTimerRef.current = undefined;
        }
        if (savedTimerRef.current !== undefined) {
          clearTimeout(savedTimerRef.current);
          savedTimerRef.current = undefined;
        }
        if (pollRef.current !== undefined) {
          clearInterval(pollRef.current);
          pollRef.current = undefined;
        }
        setSaveStatus("idle");
        try {
          const value = await api("/logout", { method: "POST" });
          setStatus({ loading: false, ...value });
          setQuota(undefined);
          setModelConfig(undefined);
          setOptimisticModelIds([]);
        } catch (err) {
          setAuthError(err instanceof Error ? err.message : String(err));
        } finally {
          setIsLoggingOut(false);
        }
      }, [isLoggingIn, isLoggingOut]);

      const switchAccount = useCallback(async (targetEmail) => {
        if (switchingEmail || deletingEmail) return;
        setSwitchingEmail(targetEmail);
        setAccountActionError("");
        try {
          const value = await api("/accounts/switch", {
            method: "POST",
            body: JSON.stringify({ email: targetEmail }),
          });
          setStatus((prev) => ({ ...prev, ...value, loading: false }));
          if (value.quota) setQuota(value.quota);
          if (value.models) setModelConfig(value.models);
          void refreshQuota();
        } catch (err) {
          setAccountActionError(err instanceof Error ? err.message : String(err));
        } finally {
          setSwitchingEmail(null);
        }
      }, [switchingEmail, deletingEmail, refreshQuota]);

      const deleteAccount = useCallback(async (targetEmail) => {
        if (switchingEmail || deletingEmail) return;
        const ok = window.confirm(tr("confirmDeleteAccount", { email: targetEmail }));
        if (!ok) return;
        setDeletingEmail(targetEmail);
        setAccountActionError("");
        try {
          const value = await api("/accounts/delete", {
            method: "POST",
            body: JSON.stringify({ email: targetEmail }),
          });
          setStatus((prev) => ({ ...prev, ...value, loading: false }));
          if (value.authenticated) {
            if (value.quota) setQuota(value.quota);
            if (value.models) setModelConfig(value.models);
            void refreshQuota();
          } else {
            setQuota(undefined);
            setModelConfig(undefined);
            setOptimisticModelIds([]);
          }
        } catch (err) {
          setAccountActionError(err instanceof Error ? err.message : String(err));
        } finally {
          setDeletingEmail(null);
        }
      }, [switchingEmail, deletingEmail, refreshQuota, tr]);

      const toggleFailover = useCallback(async (enabled) => {
        if (isTogglingFailover) return;
        setIsTogglingFailover(true);
        setAccountActionError("");
        setStatus((prev) => ({ ...prev, autoFailover: enabled }));
        try {
          const value = await api("/accounts/failover", {
            method: "POST",
            body: JSON.stringify({ enabled }),
          });
          setStatus((prev) => ({ ...prev, ...value, loading: false }));
        } catch (err) {
          setStatus((prev) => ({ ...prev, autoFailover: !enabled }));
          setAccountActionError(err instanceof Error ? err.message : String(err));
        } finally {
          setIsTogglingFailover(false);
        }
      }, [isTogglingFailover]);

      // 300ms 防抖持久化协调器
      const triggerDebouncedSave = useCallback((targetIds) => {
        if (debounceSaveTimerRef.current !== undefined) {
          clearTimeout(debounceSaveTimerRef.current);
        }
        if (savedTimerRef.current !== undefined) {
          clearTimeout(savedTimerRef.current);
          savedTimerRef.current = undefined;
        }
        debounceSaveTimerRef.current = setTimeout(async () => {
          debounceSaveTimerRef.current = undefined;
          setSaveStatus("saving");
          setModelError("");
          try {
            const value = await api("/models", {
              method: "POST",
              body: JSON.stringify({ enabledModelIds: targetIds }),
            });
            setModelConfig(value);
            modelConfigRef.current = value;
            setSaveStatus("saved");
            savedTimerRef.current = setTimeout(() => {
              setSaveStatus("idle");
              savedTimerRef.current = undefined;
            }, 2000);
          } catch (err) {
            setSaveStatus("idle");
            if (modelConfigRef.current && Array.isArray(modelConfigRef.current.enabledModelIds)) {
              setOptimisticModelIds(modelConfigRef.current.enabledModelIds);
            }
            setModelError(err instanceof Error ? err.message : String(err));
          }
        }, 300);
      }, []);

      const toggleModel = useCallback((modelId, nextEnabled) => {
        setOptimisticModelIds((prev) => {
          const set = new Set(prev);
          if (nextEnabled) {
            set.add(modelId);
          } else {
            set.delete(modelId);
          }
          const next = [...set];
          triggerDebouncedSave(next);
          return next;
        });
      }, [triggerDebouncedSave]);

      const setAllModels = useCallback((enabled) => {
        const next = enabled && modelConfig && Array.isArray(modelConfig.options)
          ? modelConfig.options.map((option) => option.id)
          : [];
        setOptimisticModelIds(next);
        triggerDebouncedSave(next);
      }, [modelConfig, triggerDebouncedSave]);

      const setRecommendedOnly = useCallback(() => {
        const availableSet = new Set(
          modelConfig && Array.isArray(modelConfig.options)
            ? modelConfig.options.map((o) => o.id)
            : []
        );
        const target = RECOMMENDED_DEFAULT_IDS.filter((id) => availableSet.has(id));
        const next = target.length ? target : RECOMMENDED_DEFAULT_IDS.slice(0, 5);
        setOptimisticModelIds(next);
        triggerDebouncedSave(next);
      }, [modelConfig, triggerDebouncedSave]);

      const optimisticSet = useMemo(() => new Set(optimisticModelIds), [optimisticModelIds]);

      const quotaGroups = useMemo(() => {
        if (!quota) return [];
        if (Array.isArray(quota.groups) && quota.groups.length > 0) {
          return quota.groups;
        }
        if (Array.isArray(quota.bucketRows) && quota.bucketRows.length > 0) {
          const map = new Map();
          for (const b of quota.bucketRows) {
            const grp = b.group || "Quota";
            if (!map.has(grp)) map.set(grp, []);
            map.get(grp).push(b);
          }
          return [...map.entries()].map(([displayName, buckets]) => ({ displayName, buckets }));
        }
        return [];
      }, [quota]);

      const fallbackModelRows = useMemo(() => {
        if (quotaGroups.length > 0) return [];
        if (!quota || !Array.isArray(quota.modelRows)) return [];
        return quota.modelRows.filter((row) => typeof row.remainingFraction === "number");
      }, [quota, quotaGroups]);

      const allOptions = useMemo(() => {
        const options = modelConfig && Array.isArray(modelConfig.options) ? modelConfig.options : [];
        return options
          .filter((o) => {
            const id = (o.id || "").toLowerCase();
            if (id.startsWith("gemini-")) {
              return id.startsWith("gemini-3.7") || id.startsWith("gemini-3.8");
            }
            return !id.startsWith("gemini-2.") && id !== "gemini-3.1-flash-image" && id !== "gemini-3.8-flash-tiered";
          })
          .sort((a, b) => {
            const aEnabled = optimisticSet.has(a.id);
            const bEnabled = optimisticSet.has(b.id);
            if (aEnabled !== bEnabled) return aEnabled ? -1 : 1;
            return compareAntigravityModels(a, b);
          });
      }, [modelConfig, optimisticSet]);

      const enabledCount = useMemo(() => {
        return allOptions.filter((o) => optimisticSet.has(o.id)).length;
      }, [allOptions, optimisticSet]);

      const filteredOptions = useMemo(() => {
        if (activeFilter === "gemini") {
          return allOptions.filter((o) => (o.id || "").toLowerCase().includes("gemini"));
        }
        if (activeFilter === "3p") {
          return allOptions.filter((o) => {
            const lower = (o.id || "").toLowerCase();
            return lower.includes("claude") || lower.includes("gpt");
          });
        }
        if (activeFilter === "enabled") {
          return allOptions.filter((o) => optimisticSet.has(o.id));
        }
        return allOptions;
      }, [allOptions, activeFilter, optimisticSet]);

      const plan = quota && quota.planLabel ? quota.planLabel : "";
      const rawAccounts = Array.isArray(status.accounts) ? status.accounts : [];
      const accounts = rawAccounts.length > 0
        ? rawAccounts
        : (status.authenticated && (status.activeEmail || status.email)
            ? [{ email: status.activeEmail || status.email, active: true, planLabel: plan }]
            : []);

      const autoFailover = typeof status.autoFailover === "boolean" ? status.autoFailover : true;

      const saveNotice = saveStatus === "saved"
        ? React.createElement("span", { className: "dsha-save-saved" }, tr("savedAuto"))
        : saveStatus === "saving"
          ? React.createElement("span", { className: "dsha-save-saving" },
              React.createElement("span", { className: "dsha-spinner", style: { borderTopColor: "var(--dsha-brand-color)" } }),
              " ",
              tr("savingChanges"),
            )
          : null;

      return React.createElement("div", { className: "dsha-wrap" },
        React.createElement("div", { className: "dsha-page-head" },
          React.createElement(AntigravityIcon, { size: 26, className: "dsha-brand-icon" }),
          React.createElement("h2", { className: "dsha-page-title" }, "Antigravity"),
          React.createElement("span", { className: "dsha-version-tag" }, "v0.2.0"),
          React.createElement("label", { className: "dsha-lang-picker", title: tr("langLabel") },
            "🌐",
            React.createElement("select", {
              className: "dsha-lang-select",
              "aria-label": tr("langLabel"),
              value: langOverride,
              onChange: (e) => changeLang(e.target.value),
            },
              React.createElement("option", { value: "" }, `${tr("langAuto")} (${tr.lang.toUpperCase()})`),
              React.createElement("option", { value: "en" }, "English"),
              React.createElement("option", { value: "ru" }, "Русский"),
              React.createElement("option", { value: "zh" }, "简体中文"),
            ),
          ),
        ),
        React.createElement("p", { className: "dsha-page-desc" }, tr("pageDesc")),

        React.createElement("section", { className: "dsha-card" },
          React.createElement("div", { className: "dsha-head" },
            React.createElement("div", { className: "dsha-title" },
              React.createElement(AntigravityIcon, { size: 18, className: "dsha-brand-icon" }),
              React.createElement("span", null, tr("multiAccountsTitle")),
              accounts.length > 0 && React.createElement("span", { className: "dsha-badge-counter" }, tr("accountCount", { count: accounts.length })),
            ),
            React.createElement("div", { className: "dsha-actions" },
              !status.authenticated && !isLoggingIn && React.createElement("button", {
                className: "dsha-btn dsha-btn-primary",
                onClick: startLogin,
              }, tr("login")),
              isLoggingIn && React.createElement(React.Fragment, null,
                React.createElement("button", {
                  className: "dsha-btn dsha-btn-primary",
                  disabled: true,
                },
                  React.createElement("span", { className: "dsha-spinner" }),
                  " ",
                  tr("waitingAuth"),
                ),
                React.createElement("button", {
                  className: "dsha-btn",
                  onClick: cancelLogin,
                }, tr("cancel")),
              ),
              status.authenticated && !isLoggingIn && React.createElement("button", {
                className: "dsha-btn dsha-btn-primary",
                disabled: isRefreshingQuota || isLoggingOut || Boolean(switchingEmail || deletingEmail),
                onClick: startLogin,
              }, tr("addAccount")),
              status.authenticated && React.createElement("button", {
                className: "dsha-btn",
                disabled: isRefreshingQuota || isLoggingOut || isLoggingIn || Boolean(switchingEmail || deletingEmail),
                onClick: refreshQuota,
              }, isRefreshingQuota ? tr("refreshing") : tr("refresh")),
              status.authenticated && React.createElement("button", {
                className: "dsha-btn",
                disabled: isRefreshingQuota || isLoggingOut || isLoggingIn || Boolean(switchingEmail || deletingEmail),
                onClick: logout,
              }, isLoggingOut ? tr("loggingOut") : tr("logout")),
            ),
          ),

          isLoggingIn && authUrl && React.createElement("div", { className: "dsha-oauth-manual" },
            React.createElement("div", { className: "dsha-oauth-manual-head" },
              React.createElement("span", { className: "dsha-oauth-manual-label" }, tr("authLinkLabel")),
              React.createElement("button", {
                className: "dsha-btn dsha-btn-small",
                onClick: copyAuthLink,
              }, copied ? tr("copySuccess") : tr("copyAuthLink")),
            ),
            React.createElement("code", { className: "dsha-oauth-link" }, authUrl),
            React.createElement("div", { className: "dsha-oauth-manual-hint" }, tr("manualFallback")),
            React.createElement("div", { className: "dsha-oauth-manual-row" },
              React.createElement("input", {
                className: "dsha-input",
                value: manualInput,
                placeholder: tr("pastePlaceholder"),
                onChange: (e) => setManualInput(e.target.value),
                disabled: isSubmittingManual,
              }),
              React.createElement("button", {
                className: "dsha-btn dsha-btn-primary",
                onClick: submitManualLogin,
                disabled: isSubmittingManual || !manualInput.trim(),
              }, isSubmittingManual ? tr("submitting") : tr("submit")),
            ),
            React.createElement("button", {
              className: "dsha-btn dsha-btn-link",
              onClick: checkNow,
            }, tr("alreadyAuthorized")),
          ),

          !status.authenticated && accounts.length === 0 && React.createElement("div", { className: "dsha-empty" }, tr("notSignedInDesc")),

          accounts.length > 0 && React.createElement("div", { className: "dsha-account-list" },
            accounts.map((acc, index) => {
              const isActive = Boolean(
                acc.active ||
                (status.activeEmail && acc.email === status.activeEmail) ||
                (!status.activeEmail && status.email && acc.email === status.email)
              );
              const accountPlan = acc.planLabel || (isActive && plan ? plan : "");
              const avatarLetter = (acc.email || "G").charAt(0).toUpperCase();
              const avatarBg = getAvatarBackground(acc.email);

              return React.createElement("div", {
                key: acc.email || index,
                className: `dsha-account-item ${isActive ? "dsha-account-item-active" : ""}`,
              },
                React.createElement("div", { className: "dsha-account-item-left" },
                  React.createElement("div", {
                    className: "dsha-account-avatar",
                    style: { background: avatarBg },
                  }, avatarLetter),
                  React.createElement("div", { className: "dsha-account-details" },
                    React.createElement("span", { className: "dsha-account-email", title: acc.email }, acc.email),
                    React.createElement("span", {
                      className: "dsha-badge",
                      title: accountPlan ? `Subscription: ${accountPlan}` : "Google Cloud Code Assist",
                    }, `✦ ${formatPlanBadge(accountPlan)}`),
                    isActive && React.createElement("span", { className: "dsha-account-tag-active" },
                      React.createElement(CheckIcon, { size: 10, stroke: "#10b981" }),
                      tr("currentActive"),
                    ),
                  ),
                ),
                React.createElement("div", { className: "dsha-account-actions" },
                  !isActive && React.createElement("button", {
                    className: "dsha-btn",
                    disabled: Boolean(switchingEmail || deletingEmail || isLoggingIn),
                    onClick: () => switchAccount(acc.email),
                  },
                    switchingEmail === acc.email && React.createElement("span", { className: "dsha-spinner", style: { borderTopColor: "var(--dsha-brand-color)" } }),
                    " ",
                    switchingEmail === acc.email ? tr("switchingAccount") : tr("switchAccount"),
                  ),
                  React.createElement("button", {
                    className: "dsha-btn dsha-btn-danger",
                    title: tr("deleteAccount"),
                    disabled: Boolean(switchingEmail || deletingEmail || isLoggingIn),
                    onClick: () => deleteAccount(acc.email),
                  },
                    deletingEmail === acc.email
                      ? React.createElement("span", { className: "dsha-spinner", style: { borderTopColor: "#ef4444" } })
                      : React.createElement(TrashIcon, { size: 13 }),
                    " ",
                    deletingEmail === acc.email ? tr("deletingAccount") : tr("deleteAccount"),
                  ),
                ),
              );
            }),
          ),

          accounts.length > 0 && React.createElement("div", { className: "dsha-failover-bar" },
            React.createElement("div", { className: "dsha-failover-info" },
              React.createElement("span", { className: "dsha-failover-title" },
                "⚡ ",
                tr("autoFailover"),
              ),
              React.createElement("span", { className: "dsha-failover-desc" },
                tr("autoFailoverDesc"),
              ),
            ),
            React.createElement("label", { className: "dsha-switch" },
              React.createElement("input", {
                type: "checkbox",
                checked: autoFailover,
                disabled: isTogglingFailover,
                onChange: (e) => toggleFailover(e.target.checked),
              }),
              React.createElement("span", { className: "dsha-switch-slider" }),
            ),
          ),

          accountActionError && React.createElement("div", { className: "dsha-error" }, accountActionError),
          authError && React.createElement("div", { className: "dsha-error" }, authError),

          status.authenticated && !quota && React.createElement("div", { className: "dsha-empty" }, isRefreshingQuota ? tr("fetchingQuota") : tr("noQuotaDesc")),

          status.authenticated && (quotaGroups.length > 0 || fallbackModelRows.length > 0) && React.createElement("div", { className: "dsha-quota-title" },
            `📊 ${tr("quota")}`,
          ),

          status.authenticated && quotaGroups.map((group, index) => {
            const isCyan = /claude|gpt|3p|openai|anthropic/i.test(`${group.displayName || ""} ${group.description || ""}`);
            return React.createElement(QuotaGroup, {
              key: group.displayName || index,
              group,
              accent: isCyan ? "cyan" : "green",
              t: tr,
            });
          }),

          status.authenticated && quotaGroups.length === 0 && fallbackModelRows.map((row, index) => {
            const isCyan = /claude|gpt|3p|openai|anthropic/i.test(`${row.id || ""} ${row.label || ""}`);
            return React.createElement(QuotaRow, {
              key: row.id || row.label || index,
              row,
              accent: isCyan ? "cyan" : "green",
              t: tr,
            });
          }),

          quota && React.createElement("div", { className: "dsha-note" },
            `🕒 ${tr("updatedAt", { time: new Date(quota.fetchedAt).toLocaleTimeString() })}`,
          ),
        ),

        React.createElement("section", { className: "dsha-card" },
          React.createElement("div", { className: "dsha-card-header" },
            React.createElement("div", { className: "dsha-card-header-main" },
              React.createElement("div", { className: "dsha-title" }, `🌐 ${tr("proxyTitle")}`),
              React.createElement("div", { className: "dsha-card-desc" }, tr("proxyDesc")),
            ),
          ),
          React.createElement("div", { className: "dsha-oauth-manual-row" },
            React.createElement("input", {
              className: "dsha-input",
              value: proxyInput,
              placeholder: tr("proxyPlaceholder"),
              spellCheck: false,
              autoComplete: "off",
              onChange: (e) => setProxyInput(e.target.value),
              onKeyDown: (e) => {
                if (e.key === "Enter") saveProxy();
              },
              disabled: proxyStatus === "saving",
            }),
            React.createElement("button", {
              className: "dsha-btn dsha-btn-primary",
              onClick: saveProxy,
              disabled: proxyStatus === "saving",
            }, proxyStatus === "saving" ? tr("proxySaving") : tr("proxySave")),
          ),
          proxyError && React.createElement("div", { className: "dsha-error" }, proxyError),
          proxyInfo && React.createElement("div", { className: "dsha-note" },
            proxyStatus === "saved"
              ? tr("proxySaved")
              : proxyInfo.activeUrl
                ? tr("proxyActive", { url: proxyInfo.activeUrl, source: proxyInfo.activeSource })
                : tr("proxyNone"),
          ),
        ),

        status.authenticated && React.createElement("section", { className: "dsha-card" },
          React.createElement("div", { className: "dsha-card-header" },
            React.createElement("div", { className: "dsha-card-header-main" },
              React.createElement("div", { className: "dsha-title" }, `⚡ ${tr("modelSelector")}`),
              React.createElement("div", { className: "dsha-card-desc" }, tr("modelSelectorDesc")),
            ),
            React.createElement("div", { className: "dsha-card-toolbar" },
              React.createElement("div", { className: "dsha-actions" },
                React.createElement("button", {
                  className: "dsha-btn",
                  onClick: () => setAllModels(true),
                }, tr("selectAll")),
                React.createElement("button", {
                  className: "dsha-btn",
                  onClick: () => setAllModels(false),
                }, tr("unselectAll")),
              ),
              saveNotice,
            ),
          ),

          React.createElement("div", { className: "dsha-filter-bar" },
            React.createElement("div", { className: "dsha-tabs" },
              React.createElement("button", {
                className: `dsha-tab-btn ${activeFilter === "all" ? "dsha-tab-btn-active" : ""}`,
                onClick: () => setActiveFilter("all"),
              }, tr("filterAll")),
              React.createElement("button", {
                className: `dsha-tab-btn ${activeFilter === "gemini" ? "dsha-tab-btn-active" : ""}`,
                onClick: () => setActiveFilter("gemini"),
              }, tr("filterGemini")),
              React.createElement("button", {
                className: `dsha-tab-btn ${activeFilter === "3p" ? "dsha-tab-btn-active" : ""}`,
                onClick: () => setActiveFilter("3p"),
              }, tr("filter3P")),
              React.createElement("button", {
                className: `dsha-tab-btn ${activeFilter === "enabled" ? "dsha-tab-btn-active" : ""}`,
                onClick: () => setActiveFilter("enabled"),
              }, tr("filterEnabled", { count: enabledCount })),
            ),
          ),

          filteredOptions.length === 0
            ? React.createElement("div", { className: "dsha-empty" }, tr("loadingModels"))
            : React.createElement("div", { className: "dsha-model-list" },
                filteredOptions.map((option) => React.createElement(ModelOptionRow, {
                  key: option.id,
                  option,
                  checked: optimisticSet.has(option.id),
                  onToggle: toggleModel,
                  t: tr,
                })),
              ),

          modelError && React.createElement("div", { className: "dsha-error" }, modelError),
          React.createElement("div", { className: "dsha-note" }, tr("modelSelectorNote")),
        ),
      );
    }

    return {
      inject: ["slots", "locale"],
      apply(ctx) {
        installStyle();
        patchNavIconScoped();
        if (ctx.locale && typeof ctx.locale.register === "function") {
          ctx.locale.register(NS, { zh, en, ru });
        }
        ctx.slots.inject("settings.section", () => ctx.slots.register({
          name: "settings.section",
          id: "antigravity",
          order: 12,
          label: () => "Antigravity",
        }, (props) => React.createElement(AntigravitySettings, { ...props, ctx })));
        const registerQuotaStrip = (scope, models) => scope.slots.inject("conversation.composer.dock", () => scope.slots.register({
          name: "conversation.composer.dock",
          id: "antigravity-quota",
          order: 50,
          ...(models ? {
            inject: (sessionId) => {
              try {
                return { directory: models.directoryFor(sessionId).store };
              } catch {
                return {};
              }
            },
          } : {}),
        }, (props) => React.createElement(QuotaStrip, { ...props, ctx })));
        try {
          if (typeof ctx.inject === "function") {
            ctx.inject(["slots", "modelDirectories"], (scope) => registerQuotaStrip(scope, scope.modelDirectories));
          } else {
            registerQuotaStrip(ctx, null);
          }
        } catch (error) {
          console.warn("[dsh-antigravity] quota strip slot unavailable", error);
        }
      },
    };
  }

  if (typeof window !== "undefined" && window.__ModuleLoader__) {
    window.__ModuleLoader__.load({
      id: "@wisexin/dsh-antigravity",
      factory,
    });
    window.__ModuleLoader__.load({
      id: "dsh-antigravity",
      factory,
    });
  }
})();
