# 更新日志

本文件记录**写作面板系统 WritingPanelSystem** 的版本变更。

- 版本号遵循 [SemVer](https://semver.org/lang/zh-CN/)：`主版本.次版本.修订号`
- **`package.json` 的 `version` 字段是唯一真源**，其余位置（关于界面、启动画面、README 徽章）均从它读取
- 格式参考 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)
- v1.12.0 及更早的手写记录见 [`Help/更新日志.md`](Help/更新日志.md) 与 [GitHub Releases](https://github.com/likeweixue/Writingpanelsystem/releases)

---

## [Unreleased]

### 修复

- **Windows 安装包点击「设置」没有反应**：`getDefaultBackupPath()` 在渲染进程读取 `process.env.USERNAME`，而 Electron 开启了 `contextIsolation`，Windows 上会直接抛 `ReferenceError`，导致设置页渲染中断。现改为优先使用 preload 暴露的真实用户目录，浏览器预览回退到 `%USERPROFILE%` / `~/Documents`，并给设置初始化加了兜底。
- **全屏大纲窗口保存时主窗口「卡住 / 刷新」**：9 个工具面板的保存函数里都有 `window.opener.location.reload()`，面板每自动保存一次就重载主窗口。现统一改为 `postMessage` 增量同步，只重绘对应工具，不再刷新页面；关闭面板也不会影响写作界面。
- **多本书标签页串数据**：书籍编辑器只保留一份页面 DOM，切换书籍时先保存再重建，避免两个页面同时存在 `#editor` / `#chapterTitle` 时 `getElementById` 永远命中第一份、把 B 书写进 A 书的问题。
- **大纲紧凑面板搜索框失效**：绑定时查找的 `compactOutlineSearch` 与真实 id `outlineSearchInput` 不一致。
- **树节点箭头点击误选中**：图标替换后事件目标变成 SVG，原 `e.target === toggle` 判断失效，统一改为 `toggle.contains(e.target)`。
- **删除失效的 docx CDN 引用**：原地址 `docx@8.5.0/build/index.min.js` 在 npm 包中并不存在，且项目实际用 JSZip 手写 DOCX，已移除无用外部依赖，离线启动不再受它影响。
- **DOCX 导出的段落丢失**：detached 元素的 `innerText` 不可靠，改为先把 `<br>` / 块级结束标签转成换行再取文本。
- **重复的右侧工具栏**：`sidebar.js` 会在页面加载 500ms 后自动创建一份 `#rightSidebar`，打开书籍后又生成第二份，产生重复 id。现只保留书籍编辑器内的一份。
- **暗色 / Open 主题数据页可读性**：补充统计卡片与日历格子的主题覆盖。

### 变更

- **顶部标签栏改为浏览器风格**：圆角标签、类型图标、悬停关闭、中键关闭、右键菜单（关闭其他/右侧）、拖动排序、横向滚动、`+` 新建标签；标签栏高度与工具栏对齐。
- **标签页与主内容融为一体**：活动标签与下方主内容使用同一块主题表面，底部左右两个角改为 Chrome 式向外翻的圆弧，标签栏底部细线不再穿过活动标签。
- **标签底角曲线可调**：新增 `tools/tab-tuner.html` 在线调节器（W/H/C1/C2/offset 实时预览、主题切换、辅助轮廓、复制参数），最终采用 `26 / 18 / 0.79 / 0.27 / 0` 的贝塞尔曲线。
- **数据页/设置页卡片跟随主题**：去掉统计卡片写死的白色背景，改为主题变量；书籍封面底色也跟随主题，暗色/护眼绿/经典黄/自定义背景都不再突兀。
- **全量图标替换**：引入 Lucide v0.468.0（ISC）统一线性图标，生成离线 sprite；`<img src="icons/*.svg">` 与界面 Emoji 图标会自动替换为跟随主题变色的内联 SVG，下拉框中的 Emoji 会清理为纯文本。新增 `scripts/build-icons.mjs` 可重新生成。
- 左侧导航增加图标、应用 Logo、菜单高亮；书籍页按钮、分组标题、书封水印、右侧工具栏标签统一视觉。
- 标签页切换时保留侧边栏导航（数据/设置/关于/回收站），仅在书籍编辑器与全屏工具页隐藏。
- 清理 `temp_switchpage.js`、`openbook_fix.js`、`temp_books.js` 等未加载的旧代码。

---

## [1.13.1] - 2026-10-20

本版本为 **v1.13.0 的发布工程热修**：代码功能与 v1.13.0 完全一致，仅修复 CI 自动发布流程，确保推送标签后能正常生成 GitHub Release（附带 Windows exe 与 macOS dmg）。

### 工程

- **重写发布架构为「构建与发布分离 + 确定性 `gh` 发布」**：两个打包作业（Windows / macOS）**只构建、不发布**，把 `dist/*.exe` / `dist/*.dmg` 作为 artifact 上传；独立的 `publish-release` 作业下载两平台产物后，用官方 `gh` CLI（`gh release create` / `gh release upload --clobber`）创建或更新 Release 并附带资产。该方式不依赖 electron-builder 的发布器，可被 API 直接核验。
- 从 `package.json` 移除 `build.publish` 配置（构建作业不再尝试自行发布，发布完全由 `publish-release` 作业负责）。
- 增加诊断能力：打包作业在失败时通过 `upload-artifact` 上传 `build-win.log` / `build-mac.log`，便于在构建失败时拿到真实报错。
- 固定构建机镜像：`windows-2022` / `macos-14`；手动触发（`workflow_dispatch`）仅构建并上传产物、不发布 Release；`publish-release` 仅在「推送标签 且 两个打包作业均成功」时运行。

#### 追加修复（发布草稿陷阱）

- **现象**：`82d8356` 那轮三个作业全绿、步骤「创建/更新 Release 并上传资产」显示 success，但 GitHub Releases 里 `v1.13.1` 始终查不到（REST API `releases/tags/v1.13.1` 返回 404，网页端却能看到）。
- **根因**：该标签下已存在一个**网页端手动创建的草稿 Release**。工作流旧的发布逻辑是「`gh release view` 命中已存在 Release → 走 `gh release upload` 分支」，而 `upload` **不会把草稿发布出去**，于是步骤"成功"却只把资产传进草稿、草稿从未发布。草稿对 REST API 不可见，正好解释了 404。
- **修复**：在「已存在 Release」分支里 `upload` 之后显式执行 `gh release edit <tag> --draft=false --latest` 把草稿转为已发布；并给发布脚本加 `set -e`，任何 `gh` 命令失败都会让步骤立即失败，杜绝再次"假成功"。`gh release create` 分支本身即发布态，不受影响。

#### 过程中排查（重要结论）

- 经 GitHub Releases API 与网页双向核验，仓库 `latest` 仍为 `v1.12.0`，此前的 `v1.13.0` / `v1.13.1` 标签**从未真正生成过 Release**——相关 run 要么构建失败、要么构建 success 却未产出 Release。
- 真正的拦路石（在 `3f2f316` 轮通过 job 的 check-run annotations 定位）：**electron-builder 在 CI 且检测到 Git 标签时会自动尝试发布**（构建日志可见 `artifacts will be published reason=tag is defined tag=v1.13.1`）。当构建作业既不带 `build.publish` 也无 `GH_TOKEN` 时，它想发布却无提供方/令牌 → `exit 1`，构建失败。此前误判为「CDN 偶发下载失败」。
- 修复：构建命令加 `--publish never` 显式禁止发布，发布完全交由 `publish-release` 作业的 `gh` 完成；同时移除 `package.json` 的 `build.publish`，彻底堵住任何自动发布路径。
- `773d4d2` 那轮（带 `--publish always` + `GH_TOKEN` + `build.publish`）构建步骤虽 success，但 Release 依旧缺失，说明 electron-builder 的发布器在本仓库并不可靠——因此最终改用确定性更强的 `gh release create` 方案。
- 原 `v1.13.0` 标签继续保留（仅作纯标签，无对应 Release）。

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
