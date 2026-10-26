# 图标资源

本项目从 **Lucide v0.468.0**（ISC License）选取了一套统一的线性图标，保证工具栏、侧边栏、标签页和全屏面板中的图标风格一致。

- `*.svg`：兼容旧代码的独立图标文件，给 `<img src="icons/xxx.svg">` 和 CSS `background-image` 使用。
- `../js/icon-sprite.js`：由 `scripts/build-icons.mjs` 生成的内联 SVG sprite，运行时使用（离线可用）。
- `../js/icons.js`：把 `<img>` 和界面里的 Emoji 图标替换成跟随当前主题变色的内联 SVG。

重新生成：

```bash
node scripts/build-icons.mjs
```

图标许可见 `LICENSE-lucide.txt`。Lucide 的部分图标源自 Feather（MIT）。
