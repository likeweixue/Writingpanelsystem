/**
 * panel-window.js —— 全屏面板窗口统一工具
 *
 * 背景：
 *   以前每个模块的「放大面板」都自己写一遍：
 *     1) 一份 5 套主题色的 themeColors（9 个文件，一字不差地重复）
 *     2) window.open('', '_blank') + document.write(html)
 *   第二步在 Electron 打包后会直接失败：
 *     空 URL 走不到 main.js 的 setWindowOpenHandler 白名单（url 为空字符串是 falsy），
 *     于是被 deny → window.open 返回 null → 弹出 "请允许弹出窗口，或手动打开新窗口。"
 *
 * 现在统一由本文件提供：
 *   getPanelTheme()              统一读取主题 + 自定义背景（替代 9 份重复代码）
 *   openPanelWindow({...})       统一打开全屏面板窗口
 *     - Electron：先把 HTML 写到用户数据目录（IPC），再用 window.open 打开这个 file:// 文件
 *       这样既绕开了拦截，又保留了 opener 关系，localStorage 与主窗口同源共享
 *     - 浏览器：优先 Blob URL，失败再退回 document.write
 */

(function (global) {
    'use strict';

    // ===================== 主题色（全项目唯一一份） =====================

    var THEME_COLORS = {
        'default': { bg: '#f0f2f5', panel: 'rgba(255,255,255,0.95)', border: 'rgba(0,0,0,0.08)', text: '#333', textSecondary: '#888', headerBg: 'rgba(0,0,0,0.03)' },
        'eye':     { bg: '#e8f0e5', panel: 'rgba(200,219,197,0.95)', border: 'rgba(44,62,47,0.12)', text: '#2c3e2f', textSecondary: '#5a7a5a', headerBg: 'rgba(44,62,47,0.06)' },
        'warm':    { bg: '#f5efe5', panel: 'rgba(223,213,189,0.95)', border: 'rgba(74,59,44,0.12)', text: '#4a3b2c', textSecondary: '#8a7a6a', headerBg: 'rgba(74,59,44,0.06)' },
        'dark':    { bg: '#1a1a2e', panel: 'rgba(30,30,46,0.95)', border: 'rgba(255,255,255,0.08)', text: '#e0e0e0', textSecondary: '#8888aa', headerBg: 'rgba(255,255,255,0.05)' },
        'open':    { bg: '#f0f2f5', panel: 'rgba(255,255,255,0.2)',  border: 'rgba(255,255,255,0.1)',  text: '#333', textSecondary: '#888', headerBg: 'rgba(255,255,255,0.08)' }
    };

    function safeStorageGet(key, fallback) {
        try {
            var v = localStorage.getItem(key);
            return v === null || v === undefined ? fallback : v;
        } catch (e) {
            return fallback;
        }
    }

    /**
     * 读取当前主题与自定义背景，供全屏面板模板使用
     * 返回 { name, colors, bgStyle, customBgImage, isDark, isOpen, hasCustomBg }
     */
    function getPanelTheme() {
        var name = safeStorageGet('app_theme', 'default') || 'default';
        var customBgImage = safeStorageGet('custom_bg_image', '') || '';
        var customBgOpacity = parseInt(safeStorageGet('custom_bg_opacity', '30'), 10);
        if (isNaN(customBgOpacity)) customBgOpacity = 30;

        var colors = THEME_COLORS[name] || THEME_COLORS['default'];
        var hasCustomBg = !!(customBgImage && customBgImage.length > 0);
        var bgStyle = hasCustomBg
            ? 'background-image: url(' + JSON.stringify(customBgImage) + '); background-size: cover; background-position: center; background-attachment: fixed; opacity: ' + (customBgOpacity / 100) + ';'
            : '';

        return {
            name: name,
            colors: colors,
            customBgImage: customBgImage,
            customBgOpacity: customBgOpacity,
            hasCustomBg: hasCustomBg,
            bgStyle: bgStyle,
            isDark: name === 'dark',
            isOpen: name === 'open'
        };
    }

    // ===================== 打开全屏面板窗口 =====================

    function buildFeatures(width, height) {
        return 'width=' + (width || 1200) + ',height=' + (height || 800) +
            ',resizable=yes,scrollbars=yes,menubar=no,toolbar=no,location=no,status=no';
    }

    function isElectronApp() {
        return !!(typeof window !== 'undefined' && window.electron && typeof window.electron.writePanelFile === 'function');
    }

    function uniqueName(name) {
        return (name || 'panel') + '_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
    }

    /** 方式一：把 HTML 交给主进程写成临时文件，再用 window.open 打开 file:// 地址 */
    function openViaFile(name, html, width, height) {
        return window.electron.writePanelFile(uniqueName(name), html).then(function (res) {
            if (!res || !res.success || !res.url) throw new Error((res && res.error) || '写入面板文件失败');
            var win = window.open(res.url, name, buildFeatures(width, height));
            if (win && typeof win.focus === 'function') { try { win.focus(); } catch (e) {} }
            return true;
        });
    }

    /** 方式二：Blob URL（浏览器可用） */
    function openViaBlob(name, html, width, height) {
        try {
            var url = URL.createObjectURL(new Blob([html], { type: 'text/html;charset=utf-8' }));
            var win = window.open(url, name, buildFeatures(width, height));
            setTimeout(function () { URL.revokeObjectURL(url); }, 60000);
            return !!win;
        } catch (e) {
            console.warn('[PanelWindow] Blob 方式打开失败：', e);
            return false;
        }
    }

    /** 方式三：about:blank + document.write（兜底） */
    function openViaDocumentWrite(name, html, width, height) {
        var win = window.open('', name, buildFeatures(width, height));
        if (!win) return false;
        try {
            win.document.write(html);
            win.document.close();
            win.focus();
            return true;
        } catch (e) {
            console.warn('[PanelWindow] document.write 方式打开失败：', e);
            return false;
        }
    }

    function notifyFailed() {
        var msg = '面板窗口打开失败，请检查是否被弹窗拦截后重试。';
        if (typeof global.alert === 'function') alert(msg);
        console.error('[PanelWindow] ' + msg);
    }

    /**
     * 统一入口
     * @param {Object} opts { html, name, width, height }
     * @returns {Promise<boolean>}
     */
    function openPanelWindow(opts) {
        opts = opts || {};
        var html = opts.html || '';
        var name = opts.name || 'panel';
        var width = opts.width || 1200;
        var height = opts.height || 800;

        // 给面板统一补上图标运行时、数据同步桥和正确的相对路径基准。
        // （Electron 会把面板写到用户数据目录，不补 base 的话 icons/*.svg 会 404）
        if (global.WPS && typeof global.WPS.enhancePanelHtml === 'function') {
            html = global.WPS.enhancePanelHtml(html);
        }

        var promise;
        if (isElectronApp()) {
            promise = openViaFile(name, html, width, height).catch(function (err) {
                console.error('[PanelWindow] Electron 方式失败，回退到浏览器方式：', err);
                return openViaBlob(name, html, width, height) || openViaDocumentWrite(name, html, width, height);
            });
        } else {
            promise = Promise.resolve(openViaBlob(name, html, width, height) || openViaDocumentWrite(name, html, width, height));
        }

        return promise.then(function (ok) {
            if (!ok) notifyFailed();
            return ok;
        });
    }

    // ===================== 导出 =====================

    global.PanelWindow = {
        open: openPanelWindow,
        themeColors: THEME_COLORS,
        getThemeColors: function (name) { return THEME_COLORS[name] || THEME_COLORS['default']; },
        getPanelTheme: getPanelTheme
    };
    global.openPanelWindow = openPanelWindow;
    global.getPanelTheme = getPanelTheme;
})(window);
