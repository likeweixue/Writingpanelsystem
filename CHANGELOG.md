# 更新日志

本文件记录**写作面板系统 WritingPanelSystem** 的版本变更。

- 版本号遵循 [SemVer](https://semver.org/lang/zh-CN/)：`主版本.次版本.修订号`
- **`package.json` 的 `version` 字段是唯一真源**，其余位置（关于界面、启动画面、README 徽章）均从它读取
- 格式参考 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)
- v1.12.0 及更早的手写记录见 [`Help/更新日志.md`](Help/更新日志.md) 与 [GitHub Releases](https://github.com/likeweixue/Writingpanelsystem/releases)

---

## [1.13.0] - 2026-10-19

本次为**修复 + 重构**版本，不新增功能，重点解决打包版「放大面板」打不开的老问题。

### 修复

- **打包成 exe / dmg 后，侧边栏「⤢ 放大面板」点了没反应，或弹出「请允许弹出窗口，或手动打开新窗口」**
  - 现象：浏览器里打开 `index.html` 一切正常，只有 electron-builder 打出来的安装包必现。
  - 根因：各工具模块都用 `window.open('', '_blank')` 再 `document.write()` 的方式开面板。空字符串在 `setWindowOpenHandler` 里是 falsy，无法命中内部页面白名单，被判定成外部链接返回 `{ action: 'deny' }`，于是 `window.open` 返回 `null`，旧代码便弹出提示。浏览器不经过这层拦截，所以只在打包态暴露。
  - 修复：改为先把面板 HTML 通过 IPC 落盘到 `app.getPath('userData')/panels/*.html`，再用 `window.open('file://...')` 打开。既保留了 `opener` 关系，也让子窗口与主窗口同源，`localStorage`（书籍、大纲、主题）可以正常读写。浏览器环境自动回退到 Blob URL，行为不变。
- **「关于」对话框版本号长期停在 1.9.1**：改为读取 `app.getVersion()`，不再硬编码。
- **README 徽章、启动画面版本号滞后**：分别修正为 1.13.0，启动画面改由主进程注入版本号。

### 变更

- 新增 `js/panel-window.js`，统一管理面板窗口：
  - `THEME_COLORS`：主题色表的**唯一维护点**（深浅色 + 强调色）
  - `getPanelTheme()`：返回 `{ colors, isDark, isOpen, hasCustomBg, bgStyle }`，各模块不再各算一套
  - `openPanelWindow({ name, html, width, height })`：Electron 走「写文件 + `file://`」，浏览器走 Blob URL
- 9 个工具模块（大纲、角色、设定、时间线、关系图、词典、取名、笔记、无边记）删除重复的主题代码与旧弹窗代码，统一改调 `openPanelWindow()`，**净减 153 行**。
- `main.js`：`setWindowOpenHandler` 对 `file://`、`blob:`、`about:blank`、`*.html` 一律放行，并带上 `overrideBrowserWindowOptions`；新增 `write-panel-file` IPC。
- `preload.js`：暴露 `writePanelFile(name, html)` 与 `appVersion`。
- 删除 `index.html` 里吞掉 `window.open` 返回值的 `fixWindowOpen` 补丁 —— 它把失败伪装成成功，是当初排查困难的主要原因之一。

### 文档

- 新增 `docs/01-团队协作规范.md`：分支命名 `<type>/<slug>`、Conventional Commits、评审与协作约定。
- 新增 `docs/02-交付流程与版本发布.md`：双周节奏、版本号唯一真源、打包态专项回归、发版清单。
- 新增 `docs/03-质量门禁与验收标准DoD.md`：准入准出条件、验收标准、数据不丢红线。
- 新增本文件 `CHANGELOG.md`，后续每个版本在此追加。

### 工程

- 新增 `.gitignore`：忽略 `node_modules/`、`dist/`、`release/`、`.DS_Store`、`.workbuddy/` 等。
- 将历史上误提交的 8 个 `.DS_Store` 移出版本控制。
- `package.json` 的版本号由 `"v 1.12.0"`（带 `v` 和空格，不是合法 semver，会让 `electron-builder` 与 npm 解析异常）修正为 `"1.13.0"`。

### 升级说明

- 覆盖安装即可。`localStorage` 中的书籍、大纲、章节、主题设置**不受影响**；备份目录 `~/Documents/写作面板系统备份/` 保持不变。
- 面板 HTML 会缓存在用户数据目录的 `panels/` 下，可随时手动清空，下次打开会自动重建。
- 首次打开某个面板需要写一次磁盘，冷启动会多几十毫秒，属正常现象。

---

## 版本记录约定

发布新版本时按以下顺序操作，避免版本号再次漂移：

1. 改 `package.json` 的 `version`（不带 `v`、不带空格）
2. 在本文件顶部追加 `## [x.y.z] - YYYY-MM-DD` 段落
3. 提交：`chore(release): vX.Y.Z`
4. 打标签：`git tag -a vX.Y.Z -m "vX.Y.Z"`，然后 `git push origin main --tags`

> 提示：`.github/workflows/build.yml` 监听 `v*` 标签，推送标签即自动触发 Windows / macOS 打包。
