/**
 * 主窗口 <-> 全屏面板窗口 的数据同步桥。
 *
 * 旧实现是面板里每次自动保存都执行 window.opener.location.reload()，
 * 导致主窗口整页刷新（看起来像卡死）。现在改为 postMessage：
 *   - 面板保存时把最新数据发给主窗口
 *   - 主窗口只重绘对应工具的数据，不刷新页面
 *   - 面板关闭后主窗口保持原样
 */
(function (global) {
    'use strict';

    function isPanelWindow() {
        try { return !!(global.opener && global.opener !== global); } catch (e) { return false; }
    }

    global.WPSPanel = {
        notify: function (tool, data) {
            if (!tool || !isPanelWindow()) return false;
            var message = {
                source: 'wps-panel',
                type: 'data-changed',
                tool: tool,
                data: data,
                bookId: global.currentBookId || 'global',
                at: Date.now()
            };
            try {
                global.opener.postMessage(message, '*');
                return true;
            } catch (e) {
                console.warn('[WPSPanel] 同步主窗口失败：', e);
                return false;
            }
        }
    };

    if (!isPanelWindow()) {
        global.addEventListener('message', function (event) {
            var data = event.data;
            if (!data || data.source !== 'wps-panel' || data.type !== 'data-changed') return;
            if (typeof global.applyPanelDataChange === 'function') {
                global.applyPanelDataChange(data);
            } else {
                // app.js 还没加载完时先排队，避免丢失面板里的修改
                global.dispatchEvent(new CustomEvent('wps-panel-data', { detail: data }));
            }
        });
    }
})(window);
