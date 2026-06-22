# 📝 写作面板系统 WritingPanelSystem

> 免费 · 开源 · 自由的写作软件

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![GitHub release](https://img.shields.io/badge/release-v1.9.0-brightgreen.svg)](https://github.com/likeweixue/Writingpanelsystem/releases)
[![Electron](https://img.shields.io/badge/Electron-28.0.0-47848f.svg)](https://electronjs.org)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

**写作帮手** 是一款专为小说作者打造的桌面写作软件，基于 Electron + HTML/CSS/JS 构建。内置大纲、角色、设定、时间线、关系图、词典、超链接、右键菜单等小说创作全流程工具，助力作者高效写作。

---

## 📸 界面预览

<div align="center">
  <img src="https://img.seedvault.cn/i/2026/06/21/QQ20260621-1523476a3791b06542a264.png" alt="主界面" width="32%">
  <img src="https://img.seedvault.cn/i/2026/06/21/QQ20260621-1526266a37923650b0f264.png" alt="写作界面" width="32%">
  <img src="https://img.seedvault.cn/i/2026/06/21/d2ee4e3a75282b003cdc56d6da289d2b6a378cdd82e44264.png" alt="自定义背景界面" width="32%">
</div>

---

## ✨ 核心功能

### 📖 书籍管理
- 创建/编辑/删除书籍，支持分组管理
- 书籍封面图片上传（自动压缩）
- 回收站（软删除，可恢复）
- 稿费设置（每千字稿费 + 目标字数）

### ✍️ 写作编辑器
- 富文本编辑（contenteditable）
- 自动保存（1秒防抖）
- 字数统计 + 稿费实时计算
- 双栏模式（左右对照编辑）
- 备忘录模式（右侧独立笔记区）
- 历史记录（撤销/恢复，支持 Ctrl+Z/Y）

### 🛠️ 九大写作工具（三种形态）
每个工具都支持：**侧边栏模式** · **标签页模式** · **独立窗口模式**

| 工具 | 功能 |
|------|------|
| 📋 大纲 | 树形大纲，支持拖拽排序、搜索 |
| ⏱️ 时间线 | 按时代分类的事件线 |
| 👥 角色 | 角色目录 + 详细设定模板 |
| ⚙️ 设定 | 世界观/修炼/地理/法宝等 |
| 🔗 关系图 | Canvas 关系图，拖拽连线 |
| 📝 无边记 | 卡片式白板，自由记录 |
| ✏️ 起名 | 随机生成角色名，支持收藏 |
| 📓 笔记 | 灵感记录，分类管理 |
| 📚 词典 | 词条管理，支持 CSV 导入导出 |

### 🔗 超链接系统
- **章节链接**：`[[第一章]]` → 跳转到对应章节
- **词典链接**：`[[御剑境]]` → 打开词典并选中词条
- **锚点链接**：`[[#伏笔1]]` → 跳转到锚点位置
- **插入链接对话框**：可视化插入链接
- **快捷键**：`Ctrl+Shift+L` 插入链接，`Ctrl+Shift+A` 添加锚点

### 🖱️ 右键菜单
选中文字后右键，快速操作：
- 剪切/复制/粘贴/全选
- **标记颜色**（9种预设 + 自定义颜色）
- **插入链接**（章节/词典/锚点）
- **新建章节/角色/设定/词条**（从选中文字创建）
- **全书搜索**
- **字数统计**

### 🔍 查找替换（支持正则表达式）
- 查找/替换当前章节
- 查找/替换全书
- 正则表达式支持
- 区分大小写 / 全字匹配
- 匹配统计与预览

### 📤 导入导出
- **导入**：TXT 文件（自动分章）、图片（自动压缩）
- **导出**：TXT / DOCX（单章或全书）
- **全书导出**：按「书名/分卷/章节」文件夹结构打包 ZIP

### 🎨 主题系统
- 5种预设主题：默认白 · 护眼绿 · 经典黄 · 暗夜黑 · Open 圆润
- 自定义背景图片 + 透明度调节
- 全局文字颜色设置

### ⌨️ 快捷键
| 快捷键 | 功能 |
|--------|------|
| `Ctrl+N` | 新建书籍 |
| `Ctrl+W` | 关闭标签页 |
| `Ctrl+Tab` | 切换标签页 |
| `Ctrl+S` | 保存章节 |
| `Ctrl+F` | 查找替换 |
| `Ctrl+Z` / `Ctrl+Y` | 撤销 / 恢复 |
| `Ctrl+Shift+O/T/R/E/G/W/N/M/D` | 快速打开工具 |
| `Ctrl+/` | 快捷键帮助 |
| `F11` | 全屏 |

---

## 🚀 快速开始

### 下载安装包（推荐）

前往 [Releases](https://github.com/likeweixue/Writingpanelsystem/releases) 下载对应平台的安装包：

| 平台 | 文件 |
|------|------|
| Windows | `WritingPanelSystem-Setup-x64.exe` |
| macOS | `WritingPanelSystem-x64.dmg` |

### 从源码运行

```bash
# 克隆项目
git clone https://github.com/likeweixue/Writingpanelsystem.git
cd Writingpanelsystem

# 安装依赖
npm install

# 启动应用
npm start

###打包应用
# 打包 Windows 版本
npm run build-win

# 打包 macOS 版本
npm run build-mac

###项目结构
Writingpanelsystem/
├── index.html          # 主界面入口
├── main.js            # Electron 主进程
├── preload.js         # 预加载脚本（安全 API）
├── package.json       # 项目配置
├── css/
│   └── style.css      # 主样式表
├── js/                # 所有 JavaScript 模块
│   ├── app.js         # 应用主入口
│   ├── data.js        # 数据模型
│   ├── books.js       # 书籍管理
│   ├── toolbar.js     # 工具栏功能
│   ├── outline.js     # 大纲工具
│   ├── characters.js  # 角色工具
│   ├── setting.js     # 设定工具
│   ├── timeline.js    # 时间线工具
│   ├── relation.js    # 关系图工具
│   ├── whiteboard.js  # 无边记工具
│   ├── namegen.js     # 起名工具
│   ├── notes.js       # 笔记工具
│   ├── dictionary.js  # 词典工具
│   ├── links.js       # 超链接系统
│   └── contextmenu.js # 右键菜单
├── themes/            # 主题样式
│   ├── default.css
│   ├── eye.css
│   ├── warm.css
│   ├── dark.css
│   └── open.css
└── icons/             # 图标资源

### 致谢
感谢以下作者的支持与反馈：
风吹屁屁凉 · 泽墨川 · 长兮常相忆 · 岚音 · 以及所有读者和作者朋友

💡 寄语
“想法一开始并不是完美的，没有人一开始就会，都是在做的过程中不断遇到与解决问题，我们要做的是迈出第一步。所以，开始书写故事吧！” —— 马克·扎克伯格
###开始书写你的故事吧！
