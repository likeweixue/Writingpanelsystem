#!/usr/bin/env node
/**
 * 生成 WritingPanelSystem 的图标资源（Lucide，ISC License）。
 *
 * 用法：node scripts/build-icons.mjs
 *   1. 从 unpkg 下载固定版本的 Lucide SVG
 *   2. 生成 js/icon-sprite.js（内联 symbol 精灵图，离线可用）
 *   3. 重写 icons/*.svg（给 <img> / CSS background 作为兼容兜底）
 *
 * 应用运行时（js/icons.js）会把 <img src="icons/x.svg"> 和常见的
 * Emoji 图标统一替换成精灵图中的线性图标，因此主题切换时图标会
 * 跟随 currentColor 变色。
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const VERSION = '0.468.0';
const BASE = `https://unpkg.com/lucide-static@${VERSION}/icons`;

// 精灵图里用到的所有图标。命名保持 Lucide 原名，方便后续替换。
const ICONS = [
  'align-left', 'anchor', 'app-window', 'archive', 'arrow-down', 'arrow-left',
  'arrow-right', 'arrow-up', 'bell', 'book', 'book-marked', 'book-open',
  'book-plus', 'brain', 'brush', 'calendar', 'calendar-days', 'chart-no-axes-column',
  'check', 'chevron-down', 'chevron-left', 'chevron-right', 'circle',
  'circle-check-big', 'circle-dollar-sign', 'circle-help', 'circle-x', 'clipboard-list',
  'clock', 'columns-2', 'compass', 'corner-down-left', 'dice-5', 'download',
  'drama', 'ellipsis', 'eye', 'feather', 'file-down', 'file-text', 'file-up',
  'fingerprint', 'flame', 'folder', 'folder-minus', 'folder-open', 'folder-plus',
  'gem', 'github', 'globe', 'graduation-cap', 'grid-2x2', 'hammer', 'highlighter',
  'history', 'hospital', 'hourglass', 'house', 'image', 'image-plus', 'info',
  'keyboard', 'landmark', 'laptop', 'layout-panel-left', 'leaf', 'library',
  'lightbulb', 'link', 'link-2', 'list', 'list-ordered', 'list-tree', 'lock',
  'mail', 'map', 'map-pin', 'maximize-2', 'message-circle', 'minus', 'moon',
  'mountain', 'mouse-pointer-2', 'move-vertical', 'network', 'notebook',
  'notebook-pen', 'package', 'palette', 'panel-right', 'paperclip', 'pen',
  'pen-line', 'pencil', 'pin', 'play', 'plus', 'pointer', 'puzzle', 'receipt',
  'redo-2', 'refresh-cw', 'repeat', 'rocket', 'ruler', 'save', 'scan-text',
  'scissors', 'scroll-text', 'search', 'settings', 'share-2', 'shuffle',
  'sliders-horizontal', 'sparkles', 'square', 'square-check', 'square-pen',
  'star', 'sun', 'swords', 'tag', 'target', 'timer', 'tower-control', 'trash-2',
  'trending-up', 'triangle-alert', 'trophy', 'type', 'undo-2', 'upload', 'user',
  'users', 'wand-sparkles', 'worm', 'wrench', 'x', 'zap',
];

// 旧文件名 -> 新图标名（保持现有 <img src="icons/xxx.svg"> 可用）
const LEGACY = {
  'Fingerprint': 'fingerprint',
  'Insert': 'image-plus',
  'anchor': 'anchor',
  'check': 'check',
  'check1': 'circle-check-big',
  'close': 'x',
  'delete': 'trash-2',
  'doublecolumn': 'columns-2',
  'down': 'arrow-down',
  'export': 'upload',
  'folder': 'folder',
  'font': 'type',
  'fullscreen': 'maximize-2',
  'history': 'history',
  'hyperlink': 'link-2',
  'import': 'download',
  'label': 'tag',
  'layout': 'layout-panel-left',
  'library': 'library',
  'list': 'list',
  'memo': 'notebook-pen',
  'mindmap': 'network',
  'name': 'pen-line',
  'notes': 'notebook',
  'outline': 'list-tree',
  'refresh': 'refresh-cw',
  'relationship': 'network',
  'rename': 'square-pen',
  'save': 'save',
  'search': 'search',
  'settings': 'settings',
  'timeline': 'clock',
  'toolbar': 'panel-right',
  'topic': 'palette',
  'trash': 'trash-2',
  'up': 'arrow-up',
  'user': 'user',
};

async function fetchIcon(name, attempt = 1) {
  const res = await fetch(`${BASE}/${name}.svg`);
  if (!res.ok) {
    if (attempt < 3) {
      await new Promise((r) => setTimeout(r, 400 * attempt));
      return fetchIcon(name, attempt + 1);
    }
    throw new Error(`下载图标失败：${name} (${res.status})`);
  }
  return res.text();
}

function extractInner(svg) {
  const match = svg.match(/<svg[^>]*>([\s\S]*?)<\/svg>/i);
  if (!match) throw new Error('无法解析 SVG');
  return match[1]
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function standaloneSvg(inner) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4b5563" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>\n`;
}

async function main() {
  console.log(`下载 Lucide v${VERSION}（${ICONS.length} 个图标）...`);
  const entries = [];
  const concurrency = 8;
  for (let i = 0; i < ICONS.length; i += concurrency) {
    const batch = ICONS.slice(i, i + concurrency);
    const results = await Promise.all(batch.map(async (name) => [name, extractInner(await fetchIcon(name))]));
    entries.push(...results);
    process.stdout.write(`\r  已下载 ${Math.min(i + concurrency, ICONS.length)}/${ICONS.length}`);
  }
  process.stdout.write('\n');

  const symbols = entries
    .map(([name, inner]) => `<symbol id="wps-i-${name}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">${inner}</symbol>`)
    .join('');

  const sprite = `/* 由 scripts/build-icons.mjs 生成，请勿手改。图标来自 Lucide v${VERSION}（ISC License）。 */\nwindow.WPS_ICON_SPRITE = '<svg xmlns="http://www.w3.org/2000/svg" id="wps-icon-sprite" aria-hidden="true" focusable="false" style="position:absolute;width:0;height:0;overflow:hidden"><defs>${symbols.replace(/'/g, '&#39;')}</defs></svg>';\n`;
  await fs.writeFile(path.join(ROOT, 'js/icon-sprite.js'), sprite, 'utf8');

  const byName = new Map(entries);
  await fs.mkdir(path.join(ROOT, 'icons'), { recursive: true });
  for (const [file, iconName] of Object.entries(LEGACY)) {
    const inner = byName.get(iconName);
    if (!inner) throw new Error(`缺少图标：${iconName}`);
    await fs.writeFile(path.join(ROOT, 'icons', `${file}.svg`), standaloneSvg(inner), 'utf8');
  }

  console.log(`已生成 js/icon-sprite.js 与 ${Object.keys(LEGACY).length} 个 icons/*.svg`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
