/**
 * WritingPanelSystem 图标系统
 *
 * - 图标来自 Lucide（ISC License），由 scripts/build-icons.mjs 生成内联 sprite
 * - <img src="icons/xxx.svg"> 会被替换成可跟随主题变色的内联 SVG
 * - 界面里的 Emoji 图标会被替换成同风格的线性图标（输入框 / 正文 / 代码块除外）
 * - 全屏面板窗口也会注入本文件，保证主窗口与弹出窗口视觉一致
 */
(function (global) {
    'use strict';

    var SVG_NS = 'http://www.w3.org/2000/svg';
    var SPRITE_ID = 'wps-icon-sprite';
    var STYLE_ID = 'wps-icon-styles';
    var started = false;
    var observer = null;
    var pendingRoots = new Set();
    var flushScheduled = false;

    // ===================== Emoji / 控制符 -> Lucide =====================
    // 只映射“当图标用”的字符；正文、输入框、代码块不会处理。
    var EMOJI_MAP = {
        '📁': 'folder', '📂': 'folder-open', '📄': 'file-text', '📃': 'file-text',
        '📚': 'library', '📖': 'book-open', '📕': 'book', '📘': 'book',
        '📓': 'notebook', '📔': 'notebook', '📝': 'notebook-pen', '📋': 'clipboard-list',
        '📌': 'pin', '📍': 'map-pin', '📎': 'paperclip', '🔖': 'book-marked',
        '✅': 'circle-check-big', '☑': 'square-check', '☐': 'square',
        '❌': 'circle-x', '✕': 'x', '✖': 'x', '⛔': 'circle-x',
        '⚠': 'triangle-alert', '💡': 'lightbulb', '❓': 'circle-help', '❔': 'circle-help',
        '✏': 'pencil', '✍': 'pen-line', '🖊': 'pen', '🖍': 'highlighter', '🖌': 'brush',
        '🎨': 'palette', '🔤': 'type', '💻': 'laptop', '⌨': 'keyboard',
        '📏': 'ruler', '📐': 'ruler', '🔆': 'sun', '🌞': 'sun', '☀': 'sun',
        '🌙': 'moon', '🌑': 'moon', '🌿': 'leaf', '🔥': 'flame', '⚡': 'zap',
        '✨': 'sparkles', '🔮': 'sparkles', '🪄': 'wand-sparkles', '🎲': 'dice-5',
        '🎯': 'target', '🏆': 'trophy', '🚀': 'rocket', '⭐': 'star', '🌟': 'star',
        '🗑': 'trash-2', '💾': 'save', '📥': 'download', '📤': 'upload',
        '📦': 'package', '🧾': 'receipt', '📊': 'chart-no-axes-column',
        '📈': 'trending-up', '📅': 'calendar', '📆': 'calendar-days',
        '⏱': 'timer', '⏳': 'hourglass', '⏎': 'corner-down-left',
        '↕': 'move-vertical', '🔄': 'refresh-cw', '🔁': 'repeat',
        '↩': 'undo-2', '↪': 'redo-2', '▶': 'chevron-right', '◀': 'chevron-left',
        '▸': 'chevron-right', '▾': 'chevron-down', '⤢': 'maximize-2',
        '⋯': 'ellipsis', '☰': 'align-left', '➕': 'plus', '✚': 'plus',
        '🔗': 'link', '🖇': 'link-2', '🌐': 'globe', '🔍': 'search',
        '👁': 'eye', '🔒': 'lock', '🔔': 'bell', '👤': 'user', '👥': 'users',
        '👆': 'pointer', '💬': 'message-circle', '🗨': 'message-circle',
        '📧': 'mail', '📨': 'mail', '⚙': 'settings', '🔧': 'wrench',
        '🛠': 'hammer', '🔀': 'shuffle', '🏛': 'landmark', '🗺': 'map',
        '🏔': 'mountain', '🗼': 'tower-control', '🐉': 'flame', '🐍': 'worm',
        '⚔': 'swords', '🏥': 'hospital', '🐙': 'github', '🪟': 'app-window',
        '🎭': 'drama', '⚧': 'users', '🧠': 'brain', '🧩': 'puzzle',
        '🧭': 'compass', '📜': 'scroll-text', '🖼': 'image', '🖱': 'mouse-pointer-2',
        '💰': 'circle-dollar-sign', '🕵': 'scan-text', '🏠': 'house',
        '🔴': 'circle', '✂': 'scissors', '✔': 'check', '✓': 'check'
    };

    // 旧图标文件名 -> Lucide 名称（与 scripts/build-icons.mjs 保持一致）
    var IMAGE_MAP = {
        Fingerprint: 'fingerprint', Insert: 'image-plus', anchor: 'anchor', check: 'check',
        check1: 'circle-check-big', close: 'x', delete: 'trash-2', doublecolumn: 'columns-2',
        down: 'arrow-down', export: 'upload', folder: 'folder', font: 'type',
        fullscreen: 'maximize-2', history: 'history', hyperlink: 'link-2', import: 'download',
        label: 'tag', layout: 'layout-panel-left', library: 'library', list: 'list',
        memo: 'notebook-pen', mindmap: 'network', name: 'pen-line', notes: 'notebook',
        outline: 'list-tree', refresh: 'refresh-cw', relationship: 'network', rename: 'square-pen',
        save: 'save', search: 'search', settings: 'settings', timeline: 'clock',
        toolbar: 'panel-right', topic: 'palette', trash: 'trash-2', up: 'arrow-up', user: 'user'
    };

    var emojiKeys = Object.keys(EMOJI_MAP).sort(function (a, b) { return b.length - a.length; });
    var EMOJI_RE = new RegExp('(' + emojiKeys.map(escapeRegExp).join('|') + ')\\uFE0F?', 'gu');

    function escapeRegExp(str) {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    function escapeAttr(str) {
        return String(str).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    // ===================== 基础渲染 =====================

    function iconSvg(name, className) {
        if (!name) return '';
        return '<svg class="wps-icon' + (className ? ' ' + escapeAttr(className) : '') +
            '" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><use href="#wps-i-' +
            escapeAttr(name) + '"></use></svg>';
    }

    function iconElement(name, className) {
        var svg = document.createElementNS(SVG_NS, 'svg');
        svg.setAttribute('class', 'wps-icon' + (className ? ' ' + className : ''));
        svg.setAttribute('viewBox', '0 0 24 24');
        svg.setAttribute('aria-hidden', 'true');
        svg.setAttribute('focusable', 'false');
        var use = document.createElementNS(SVG_NS, 'use');
        use.setAttribute('href', '#wps-i-' + name);
        svg.appendChild(use);
        return svg;
    }

    function icon(name, className) {
        return iconSvg(name, className);
    }

    function ensureBase() {
        if (!document.body) {
            document.addEventListener('DOMContentLoaded', ensureBase, { once: true });
            return;
        }
        if (!document.getElementById(SPRITE_ID) && global.WPS_ICON_SPRITE) {
            // 精灵图必须真实存在于 DOM 中，<use href="#..."> 才能工作
            var holder = document.createElement('div');
            holder.setAttribute('aria-hidden', 'true');
            holder.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden;pointer-events:none;';
            holder.innerHTML = global.WPS_ICON_SPRITE;
            document.body.insertBefore(holder, document.body.firstChild);
        }
        if (!document.getElementById(STYLE_ID)) {
            var style = document.createElement('style');
            style.id = STYLE_ID;
            style.textContent = [
                '.wps-icon{display:inline-block;width:1em;height:1em;vertical-align:-0.125em;flex:0 0 auto;pointer-events:none;overflow:visible}',
                '.wps-icon-slot{display:inline-flex;align-items:center;justify-content:center;flex:0 0 auto;line-height:1}',
                '.wps-icon-slot>.wps-icon{width:1.15em;height:1.15em}',
                '.wps-emoji-icon{display:inline-flex;align-items:center;justify-content:center;vertical-align:-0.12em;margin-right:.34em;line-height:1}',
                '.wps-emoji-icon:only-child{margin-right:0}',
                '.wps-emoji-icon .wps-icon{width:1.05em;height:1.05em}',
                'button .wps-icon,.menu-item .wps-icon,.book-menu .wps-icon,.group-menu-btn .wps-icon,.tool-expand-btn .wps-icon{pointer-events:none}',
                '.tab .wps-icon{width:15px;height:15px}',
                '.tab-close .wps-icon{width:12px;height:12px}',
                '.new-tab-btn .wps-icon{width:16px;height:16px}'
            ].join('\n');
            document.head.appendChild(style);
        }
    }

    // ===================== 替换 DOM =====================

    function shouldSkipNode(node) {
        var parent = node.parentElement;
        if (!parent) return true;
        if (parent.closest('script,style,textarea,input,select,option,pre,code,title,.wps-icon,.wps-emoji-icon,.wps-icon-slot,.wps-no-icons')) return true;
        if (parent.isContentEditable) return true;
        if (parent.closest('[contenteditable=""],[contenteditable="true"],[contenteditable="plaintext-only"],.editor-content')) return true;
        return false;
    }

    function replaceEmojiInTextNode(node) {
        var text = node.nodeValue;
        if (!text) return;
        EMOJI_RE.lastIndex = 0;
        if (!EMOJI_RE.test(text)) return;
        EMOJI_RE.lastIndex = 0;

        var frag = document.createDocumentFragment();
        var last = 0;
        var match;
        while ((match = EMOJI_RE.exec(text)) !== null) {
            var raw = match[0];
            var ch = raw.replace(/\uFE0F/g, '');
            var name = EMOJI_MAP[ch];
            if (!name) continue;

            var before = text.slice(last, match.index);
            // 图标前通常不需要空格
            before = before.replace(/\s+$/, before.length > 0 && /^\s+$/.test(before) ? '' : '');
            if (before) frag.appendChild(document.createTextNode(before));

            var span = document.createElement('span');
            span.className = 'wps-emoji-icon';
            span.setAttribute('aria-hidden', 'true');
            span.appendChild(iconElement(name));
            frag.appendChild(span);

            last = match.index + raw.length;
            // 图标后如果紧跟一个空格，吞掉它，避免“图标 + 空格 + 文字”过宽
            if (text.charAt(last) === ' ') last++;
        }
        if (!frag.childNodes.length) return;
        var rest = text.slice(last);
        if (rest) frag.appendChild(document.createTextNode(rest));
        node.parentNode.replaceChild(frag, node);
    }

    function replaceImages(root) {
        var images = [];
        if (root.nodeType === 1 && root.matches && root.matches('img[src]')) images.push(root);
        if (root.querySelectorAll) {
            var found = root.querySelectorAll('img[src*="icons/"]');
            for (var i = 0; i < found.length; i++) images.push(found[i]);
        }
        for (var j = 0; j < images.length; j++) {
            var img = images[j];
            var src = img.getAttribute('src') || '';
            var file = src.split('/').pop().replace(/\.svg(?:\?.*)?$/i, '');
            var name = IMAGE_MAP[file];
            if (!name) continue;
            if (img.closest('[contenteditable=""],[contenteditable="true"],.editor-content,.wps-no-icons')) continue;

            var svg = iconElement(name, img.className || '');
            svg.style.cssText = img.style.cssText || '';
            var width = img.getAttribute('width');
            var height = img.getAttribute('height');
            if (width) svg.style.width = /^\d+(\.\d+)?$/.test(width) ? width + 'px' : width;
            if (height) svg.style.height = /^\d+(\.\d+)?$/.test(height) ? height + 'px' : height;
            if (svg.style.verticalAlign === '') svg.style.verticalAlign = 'middle';

            var alt = img.getAttribute('alt');
            if (alt) {
                svg.setAttribute('role', 'img');
                svg.setAttribute('aria-label', alt);
            }
            var title = img.getAttribute('title');
            if (title) {
                var titleEl = document.createElementNS(SVG_NS, 'title');
                titleEl.textContent = title;
                svg.appendChild(titleEl);
            }
            img.parentNode.replaceChild(svg, img);
        }
    }

    function replacePlaceholders(root) {
        if (!root.querySelectorAll) return;
        var slots = root.querySelectorAll('[data-wps-icon]');
        for (var i = 0; i < slots.length; i++) {
            var el = slots[i];
            var name = el.getAttribute('data-wps-icon');
            if (!name) continue;
            el.classList.add('wps-icon-slot');
            el.innerHTML = iconSvg(name);
            el.removeAttribute('data-wps-icon');
        }
    }

    function cleanOptionText(root) {
        if (!root.querySelectorAll) return;
        var options = root.querySelectorAll('option');
        for (var i = 0; i < options.length; i++) {
            var opt = options[i];
            var text = opt.textContent || '';
            EMOJI_RE.lastIndex = 0;
            if (!EMOJI_RE.test(text)) continue;
            EMOJI_RE.lastIndex = 0;
            // <option> 里不能放 SVG，退而求其次：去掉 Emoji，保留干净的文本
            opt.textContent = text.replace(EMOJI_RE, '').replace(/^\s+/, '').replace(/\s{2,}/g, ' ');
        }
    }

    function cleanAttributes(root) {
        if (!root.querySelectorAll) return;
        var nodes = root.querySelectorAll('[placeholder],[title],[aria-label]');
        for (var i = 0; i < nodes.length; i++) {
            var el = nodes[i];
            ['placeholder', 'title', 'aria-label'].forEach(function (attr) {
                var value = el.getAttribute(attr);
                if (!value) return;
                EMOJI_RE.lastIndex = 0;
                if (!EMOJI_RE.test(value)) return;
                EMOJI_RE.lastIndex = 0;
                var cleaned = value.replace(EMOJI_RE, '').replace(/^\s+/, '');
                el.setAttribute(attr, cleaned);
            });
        }
    }

    function enhance(root) {
        if (!root || root.nodeType !== 1) return;
        ensureBase();
        replacePlaceholders(root);
        replaceImages(root);
        if (root.querySelectorAll) {
            var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
            var textNodes = [];
            var node;
            while ((node = walker.nextNode())) {
                if (!shouldSkipNode(node)) textNodes.push(node);
            }
            for (var i = 0; i < textNodes.length; i++) replaceEmojiInTextNode(textNodes[i]);
        }
        cleanAttributes(root);
        cleanOptionText(root);
    }

    // ===================== 动态内容监听 =====================

    function schedule(root) {
        if (!root) return;
        if (root.nodeType === 3) root = root.parentElement;
        if (!root || root.nodeType !== 1) return;
        if (root.closest && root.closest('#' + SPRITE_ID + ',#wps-icon-styles')) return;
        pendingRoots.add(root);
        if (flushScheduled) return;
        flushScheduled = true;
        requestAnimationFrame(function () {
            flushScheduled = false;
            var roots = Array.from(pendingRoots);
            pendingRoots.clear();
            if (observer) observer.disconnect();
            for (var i = 0; i < roots.length; i++) {
                if (roots[i].isConnected) enhance(roots[i]);
            }
            observe();
        });
    }

    function observe() {
        if (!observer || !document.body) return;
        observer.observe(document.body, { childList: true, subtree: true });
    }

    function start() {
        if (started) return;
        started = true;
        ensureBase();
        // 窗口标题里的 Emoji 也清掉（标题里无法放 SVG）
        if (document.title) {
            EMOJI_RE.lastIndex = 0;
            var cleanedTitle = document.title.replace(EMOJI_RE, '').replace(/\s+/g, ' ').trim();
            if (cleanedTitle) document.title = cleanedTitle;
        }
        enhance(document.body);
        observer = new MutationObserver(function (mutations) {
            for (var i = 0; i < mutations.length; i++) {
                var added = mutations[i].addedNodes;
                for (var j = 0; j < added.length; j++) {
                    var item = added[j];
                    if (item.nodeType === 1 || item.nodeType === 3) schedule(item);
                }
            }
        });
        observe();
    }

    // ===================== 全屏面板注入 =====================

    function enhancePanelHtml(html) {
        if (!html || typeof html !== 'string') return html;
        if (html.indexOf('js/icons.js') !== -1) return html;
        var base = '<base href="' + escapeAttr(global.location.href) + '">';
        var scripts = '<script src="js/icon-sprite.js"><\/script><script src="js/icons.js"><\/script><script src="js/panel-bridge.js"><\/script>';
        if (/<head[^>]*>/i.test(html)) {
            html = html.replace(/<head([^>]*)>/i, function (m, attrs) { return '<head' + attrs + '>' + base; });
        } else {
            html = base + html;
        }
        if (/<\/body>/i.test(html)) return html.replace(/<\/body>/i, scripts + '</body>');
        return html + scripts;
    }

    // ===================== 导出 =====================

    global.WPS = {
        icon: icon,
        iconSvg: iconSvg,
        iconElement: iconElement,
        enhance: enhance,
        enhancePanelHtml: enhancePanelHtml,
        emojiMap: EMOJI_MAP,
        imageMap: IMAGE_MAP
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', start, { once: true });
    } else {
        start();
    }
})(window);
