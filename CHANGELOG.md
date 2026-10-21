# 更新日志

本文件记录**写作面板系统 WritingPanelSystem** 的版本变更。

- 版本号遵循 [SemVer](https://semver.org/lang/zh-CN/)：`主版本.次版本.修订号`
- **`package.json` 的 `version` 字段是唯一真源**，其余位置（关于界面、启动画面、README 徽章）均从它读取
- 格式参考 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)
- v1.12.0 及更早的手写记录见 [`Help/更新日志.md`](Help/更新日志.md) 与 [GitHub Releases](https://github.com/likeweixue/Writingpanelsystem/releases)

---

## [1.13.1] - 2026-10-20

本版本为 **v1.13.0 的发布工程热修**：代码功能与 v1.13.0 完全一致，仅修复 CI 自动发布流程，确保推送标签后能正常生成 GitHub Release（附带 Windows exe 与 macOS dmg）。

### 工程

- 恢复并固化「经过验证」的发布配置：每个打包作业携带 `GH_TOKEN` 并运行 `electron-builder ... --publish always`，`package.json` 的 `build.publish` 指向 `github/likeweixue/Writingpanelsystem`。该配置（提交 `a3ee956`）实测曾成功产出 GitHub Release。
- 新增幂等的 `publish-release` 兜底作业：构建完成后确保同名 Release 处于「已发布」且为 `latest` 状态（非草稿）。
- 增加诊断能力：打包作业在失败时通过 `upload-artifact` 上传 `build-win.log` / `build-mac.log`，便于在构建失败时拿到真实报错（此前数轮失败仅暴露 `Process completed with exit code 1`，无详细日志，根因未能定位）。
- 固定构建机镜像：`windows-2022` / `macos-14`；手动触发（`workflow_dispatch`）仅构建并上传产物、不发布 Release。

#### 过程中排查与未决项

- `v1.13.0`（`a3ee956`）之后，曾尝试把发布从打包作业剥离为独立 `release` 作业（提交 `c8f76ab` → `c0f384b` → `857e381`），即打包作业不再带 `GH_TOKEN`、也不再 `--publish always`、并一度删除 `build.publish`。这三轮**打包步骤均 `exit 1` 失败**，独立 `release` 作业因此被跳过、从未生成 Release。
- 由于失败日志仅有一句 `exit code 1`，无法确认去掉发布是否为真正根因；但可确认的是：带 `--publish always` + `GH_TOKEN` 的 `a3ee956` 配置**实测成功**，而无该配置的三轮**实测失败**。故 `v1.13.1` 回退到验证可用的配置，并补上日志 artifact 以便未来若再失败可定位真实原因。
- 原 `v1.13.0` 标签继续保留（仅作纯标签，无对应 Release）；以 **v1.13.1** 重新发版。

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
- 重构 `.github/workflows/build.yml`：推送 `v*` 标签时自动打包并**发布 GitHub Release**（自动附带 dmg / exe），macOS 同时产出 Intel（x64）与 Apple Silicon（arm64）两个架构；手动触发则只上传 artifact 不发布。

### 清理

- 删除 `js/books.js` 中每次打开书籍都会刷屏的 5 行调试日志，以及指向不存在的 `html/` 目录的死降级代码（`toolNewWindowMap` 9 处假回退 + 展开按钮 2 块降级 fileMap）。
- 删除 `js/dictionary.js` 尾部 4 行重复导出。
- 修复 `js/namegen.js` 紧凑面板「⤢ 展开」按钮的错位大括号：原来 `console.warn` 无条件执行，且按钮不存在时会直接抛 TypeError 中断整个事件绑定函数。
- 删除 `index.html` 尾部 `</html>` 之后的重复绑定补丁（`fixButtons`，67 行），与正文内联脚本功能重复；同步删除 `js/app.js` 中基于不存在 DOM（`newBookDrawer` 等）的旧抽屉式新建书籍/分组代码（`openDrawer`/`closeDrawer`/`createNewBook`/`createNewGroup`，约 55 行）。
- 以上清理净减约 150 行，不改变任何现有行为。

### 已知遗留（本版本未动）

- `js/sidebar.js` 的 `createRightSidebar` / `openSecondaryWindow`、`js/books.js` 的 `initRightSidebar` 等首页侧边栏旧路径仍引用不存在的 `html/` 目录，其实际可达性依赖运行时初始化时序，需实测后再清理。
- 主窗口 `webPreferences` 中 `webSecurity: false`（为本地自定义背景图放行），后续版本评估收紧。

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
