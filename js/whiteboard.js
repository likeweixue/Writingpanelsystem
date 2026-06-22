// ========== 无边记白板工具 ==========

var whiteboardData = {
    cards: [],
    connections: [],
    nextId: 1,
    zoom: 1,
    panX: 0,
    panY: 0
};

// ========== 数据操作 ==========

function getWhiteboardData() {
    var bookId = currentBookId || 'global';
    var key = 'openwrite_whiteboard_' + bookId;
    var saved = localStorage.getItem(key);
    if (saved) {
        try {
            var data = JSON.parse(saved);
            whiteboardData = data;
            return;
        } catch(e) {}
    }
    setDefaultWhiteboardData();
}

function setDefaultWhiteboardData() {
    whiteboardData.cards = [
        { id: 'card_1', type: 'note', text: '✨ 主线：龙渊剑封印上古龙魂', x: 80, y: 80, width: 220, height: 100 },
        { id: 'card_2', type: 'todo', text: '□ 完善落星宗势力图\n□ 叶尘情感线', x: 350, y: 60, width: 200, height: 120 },
        { id: 'card_3', type: 'quote', text: '「剑道尽头谁为峰，一见龙渊道成空。」', x: 600, y: 150, width: 200, height: 90 },
        { id: 'card_4', type: 'note', text: '魔渊与天机阁暗中勾结', x: 200, y: 280, width: 210, height: 100 },
    ];
    whiteboardData.connections = [
        { id: 'conn_1', fromId: 'card_1', toId: 'card_2' },
        { id: 'conn_2', fromId: 'card_1', toId: 'card_4' },
    ];
    whiteboardData.nextId = 100;
    whiteboardData.zoom = 1;
    whiteboardData.panX = 0;
    whiteboardData.panY = 0;
    saveWhiteboardData();
}

function saveWhiteboardData() {
    var bookId = currentBookId || 'global';
    var key = 'openwrite_whiteboard_' + bookId;
    localStorage.setItem(key, JSON.stringify(whiteboardData));
}

function getWhiteboardCard(id) {
    return whiteboardData.cards.find(function(c) { return c.id === id; });
}

function genWhiteboardId(prefix) {
    return prefix + '_' + (whiteboardData.nextId++);
}

// ========== 渲染白板 ==========

function renderWhiteboard() {
    var container = document.getElementById('whiteboardContainer');
    if (!container) return;
    
    getWhiteboardData();
    
    container.innerHTML = `
        <div class="whiteboard-wrapper" style="display:flex; flex-direction:column; height:100%; width:100%; background:var(--panel-bg, #f0f2f5); position:relative; overflow:hidden;">
            <!-- 工具栏 -->
            <div style="display:flex; gap:8px; padding:10px 16px; background:rgba(255,255,255,0.8); backdrop-filter:blur(8px); border-bottom:1px solid var(--border-color, rgba(0,0,0,0.08)); flex-shrink:0; z-index:10; flex-wrap:wrap;">
                <button id="wbAddNote" style="padding:4px 12px; background:#f0f0f0; border:none; border-radius:6px; cursor:pointer;">📝 笔记</button>
                <button id="wbAddTodo" style="padding:4px 12px; background:#f0f0f0; border:none; border-radius:6px; cursor:pointer;">✅ 待办</button>
                <button id="wbAddQuote" style="padding:4px 12px; background:#f0f0f0; border:none; border-radius:6px; cursor:pointer;">💡 灵感</button>
                <button id="wbLinkMode" style="padding:4px 12px; background:#f0f0f0; border:none; border-radius:6px; cursor:pointer;">🔗 连线</button>
                <button id="wbClearLines" style="padding:4px 12px; background:#f0f0f0; border:none; border-radius:6px; cursor:pointer;">🗑 清空连线</button>
                <button id="wbClearAll" style="padding:4px 12px; background:#dc3545; color:white; border:none; border-radius:6px; cursor:pointer;">清空白板</button>
                <button id="wbCloseBtn" style="padding:4px 12px; background:#6c757d; color:white; border:none; border-radius:6px; cursor:pointer;">✕ 关闭</button>
                <span style="font-size:12px; color:#888; margin-left:auto;">💡 拖拽卡片移动 · 双击编辑</span>
            </div>
            
            <!-- 白板区域 -->
            <div class="whiteboard-canvas" style="flex:1; position:relative; overflow:hidden; cursor:grab; background-image:radial-gradient(circle at 1px 1px, rgba(0,0,0,0.05) 1px, transparent 1px); background-size:24px 24px;" id="wbCanvas">
                <!-- SVG连线层 -->
                <svg id="wbSvgLayer" style="position:absolute; top:0; left:0; width:100%; height:100%; pointer-events:none; z-index:1;"></svg>
                <!-- 卡片容器 -->
                <div id="wbCardsContainer" style="position:absolute; top:0; left:0; width:100%; height:100%; z-index:2;"></div>
                <!-- 状态 -->
                <div style="position:absolute; bottom:12px; right:16px; font-size:11px; color:#888; background:rgba(255,255,255,0.8); padding:4px 12px; border-radius:12px; z-index:5;">
                    卡片: <span id="wbCardCount">0</span> | 连线: <span id="wbLineCount">0</span>
                </div>
            </div>
        </div>
    `;
    
    renderWhiteboardCards();
    renderWhiteboardLines();
    bindWhiteboardEvents();
    updateWhiteboardStats();
}

// ========== 渲染卡片 ==========

function renderWhiteboardCards() {
    var container = document.getElementById('wbCardsContainer');
    if (!container) return;
    
    container.innerHTML = '';
    whiteboardData.cards.forEach(function(card) {
        var cardDiv = document.createElement('div');
        cardDiv.className = 'wb-card';
        cardDiv.style.cssText = 'position:absolute; left:' + card.x + 'px; top:' + card.y + 'px; width:' + card.width + 'px; min-height:' + (card.height || 100) + 'px; background:rgba(255,255,245,0.95); backdrop-filter:blur(4px); border-radius:16px; padding:12px; box-shadow:0 4px 12px rgba(0,0,0,0.1), 0 0 0 0.5px rgba(0,0,0,0.05); cursor:default; z-index:2; display:flex; flex-direction:column;';
        cardDiv.setAttribute('data-id', card.id);
        
        var icons = { note: '📝', todo: '✅', quote: '💡' };
        var labels = { note: '笔记', todo: '待办', quote: '灵感' };
        
        cardDiv.innerHTML = `
            <div class="wb-card-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px; font-size:11px; color:#888;">
                <span>${icons[card.type] || '📝'} ${labels[card.type] || '笔记'}</span>
                <div style="display:flex; gap:8px;">
                    <span class="wb-card-delete" data-id="${card.id}" style="cursor:pointer; opacity:0.5;">✕</span>
                </div>
            </div>
            <div class="wb-card-content" contenteditable="true" data-id="${card.id}" style="flex:1; font-size:13px; line-height:1.5; outline:none; white-space:pre-wrap; word-break:break-word; cursor:text; user-select:text; min-height:60px;">${card.text}</div>
            <div class="wb-card-resize" style="position:absolute; bottom:4px; right:4px; width:12px; height:12px; background:rgba(0,0,0,0.05); border-radius:50%; cursor:se-resize;"></div>
        `;
        container.appendChild(cardDiv);
    });
    
    // 卡片拖拽
    document.querySelectorAll('.wb-card').forEach(function(cardEl) {
        var isDragging = false;
        var startX, startY, origX, origY;
        var header = cardEl.querySelector('.wb-card-header');
        
        header.addEventListener('mousedown', function(e) {
            if (e.target.closest('.wb-card-delete')) return;
            isDragging = true;
            var rect = cardEl.getBoundingClientRect();
            var containerRect = document.getElementById('wbCardsContainer').getBoundingClientRect();
            startX = e.clientX;
            startY = e.clientY;
            origX = parseFloat(cardEl.style.left);
            origY = parseFloat(cardEl.style.top);
            cardEl.style.cursor = 'grabbing';
            cardEl.style.zIndex = '10';
            e.preventDefault();
            
            // 连线模式处理
            if (whiteboardData.linkMode) {
                handleLinkModeClick(cardEl.getAttribute('data-id'));
                isDragging = false;
                return;
            }
        });
        
        document.addEventListener('mousemove', function(e) {
            if (!isDragging) return;
            var dx = (e.clientX - startX);
            var dy = (e.clientY - startY);
            var newX = origX + dx;
            var newY = origY + dy;
            cardEl.style.left = Math.max(0, newX) + 'px';
            cardEl.style.top = Math.max(0, newY) + 'px';
            
            // 更新数据
            var card = getWhiteboardCard(cardEl.getAttribute('data-id'));
            if (card) {
                card.x = Math.max(0, newX);
                card.y = Math.max(0, newY);
            }
            renderWhiteboardLines();
        });
        
        document.addEventListener('mouseup', function() {
            if (isDragging) {
                isDragging = false;
                cardEl.style.cursor = 'default';
                cardEl.style.zIndex = '2';
                saveWhiteboardData();
                renderWhiteboardLines();
            }
        });
        
        // 调整大小
        var resizeHandle = cardEl.querySelector('.wb-card-resize');
        if (resizeHandle) {
            var isResizing = false;
            var startWidth, startHeight, startXResize, startYResize;
            
            resizeHandle.addEventListener('mousedown', function(e) {
                e.stopPropagation();
                e.preventDefault();
                isResizing = true;
                startWidth = parseFloat(cardEl.style.width) || 200;
                startHeight = parseFloat(cardEl.style.height) || 100;
                startXResize = e.clientX;
                startYResize = e.clientY;
            });
            
            document.addEventListener('mousemove', function(e) {
                if (!isResizing) return;
                var dx = e.clientX - startXResize;
                var dy = e.clientY - startYResize;
                var newWidth = Math.max(120, startWidth + dx);
                var newHeight = Math.max(80, startHeight + dy);
                cardEl.style.width = newWidth + 'px';
                cardEl.style.height = newHeight + 'px';
                var card = getWhiteboardCard(cardEl.getAttribute('data-id'));
                if (card) {
                    card.width = newWidth;
                    card.height = newHeight;
                }
                renderWhiteboardLines();
            });
            
            document.addEventListener('mouseup', function() {
                if (isResizing) {
                    isResizing = false;
                    saveWhiteboardData();
                    renderWhiteboardLines();
                }
            });
        }
    });
    
    // 卡片内容编辑
    document.querySelectorAll('.wb-card-content').forEach(function(content) {
        content.addEventListener('blur', function() {
            var card = getWhiteboardCard(this.getAttribute('data-id'));
            if (card) {
                card.text = this.innerText;
                saveWhiteboardData();
            }
        });
        content.addEventListener('dblclick', function(e) {
            e.stopPropagation();
            // 聚焦以编辑
            this.focus();
            // 选中全部内容
            var range = document.createRange();
            range.selectNodeContents(this);
            var sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
        });
        // 阻止拖拽冒泡
        content.addEventListener('mousedown', function(e) {
            e.stopPropagation();
        });
    });
    
    // 删除卡片
    document.querySelectorAll('.wb-card-delete').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            var id = this.getAttribute('data-id');
            if (confirm('确定删除这个卡片吗？')) {
                whiteboardData.cards = whiteboardData.cards.filter(function(c) { return c.id !== id; });
                whiteboardData.connections = whiteboardData.connections.filter(function(c) { return c.fromId !== id && c.toId !== id; });
                saveWhiteboardData();
                renderWhiteboardCards();
                renderWhiteboardLines();
                updateWhiteboardStats();
            }
        });
    });
}

// ========== 渲染连线 ==========

function renderWhiteboardLines() {
    var svg = document.getElementById('wbSvgLayer');
    if (!svg) return;
    
    svg.innerHTML = '';
    whiteboardData.connections.forEach(function(conn) {
        var from = getWhiteboardCard(conn.fromId);
        var to = getWhiteboardCard(conn.toId);
        if (!from || !to) return;
        
        var fromX = from.x + (from.width || 200) / 2;
        var fromY = from.y + (from.height || 100) / 2;
        var toX = to.x + (to.width || 200) / 2;
        var toY = to.y + (to.height || 100) / 2;
        
        var line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', fromX);
        line.setAttribute('y1', fromY);
        line.setAttribute('x2', toX);
        line.setAttribute('y2', toY);
        line.setAttribute('stroke', '#8b8a90');
        line.setAttribute('stroke-width', '2');
        line.setAttribute('stroke-dasharray', '5 3');
        line.setAttribute('data-conn-id', conn.id);
        line.style.pointerEvents = 'stroke';
        line.style.cursor = 'pointer';
        
        line.addEventListener('click', function(e) {
            if (e.shiftKey) {
                whiteboardData.connections = whiteboardData.connections.filter(function(c) { return c.id !== conn.id; });
                saveWhiteboardData();
                renderWhiteboardLines();
                updateWhiteboardStats();
            }
        });
        
        svg.appendChild(line);
    });
}

// ========== 连线模式 ==========

var linkModePending = null;

function handleLinkModeClick(cardId) {
    if (linkModePending === null) {
        linkModePending = cardId;
        var cardEl = document.querySelector('.wb-card[data-id="' + cardId + '"]');
        if (cardEl) {
            cardEl.style.boxShadow = '0 0 0 3px #007aff';
            setTimeout(function() {
                if (cardEl) cardEl.style.boxShadow = '';
            }, 300);
        }
    } else if (linkModePending !== cardId) {
        whiteboardData.connections.push({
            id: genWhiteboardId('conn'),
            fromId: linkModePending,
            toId: cardId
        });
        linkModePending = null;
        saveWhiteboardData();
        renderWhiteboardLines();
        updateWhiteboardStats();
    } else {
        linkModePending = null;
    }
}

// ========== 白板事件绑定 ==========

function bindWhiteboardEvents() {
    // 添加卡片
    document.getElementById('wbAddNote').onclick = function() { addWhiteboardCard('note'); };
    document.getElementById('wbAddTodo').onclick = function() { addWhiteboardCard('todo'); };
    document.getElementById('wbAddQuote').onclick = function() { addWhiteboardCard('quote'); };
    
    // 连线模式
    document.getElementById('wbLinkMode').onclick = function() {
        whiteboardData.linkMode = !whiteboardData.linkMode;
        this.style.background = whiteboardData.linkMode ? '#007aff' : '#f0f0f0';
        this.style.color = whiteboardData.linkMode ? 'white' : '';
        if (whiteboardData.linkMode) {
            linkModePending = null;
            alert('🔗 连线模式已开启，依次点击两个卡片的顶部区域创建连线');
        }
    };
    
    // 清空连线
    document.getElementById('wbClearLines').onclick = function() {
        if (confirm('确定删除所有连线吗？')) {
            whiteboardData.connections = [];
            saveWhiteboardData();
            renderWhiteboardLines();
            updateWhiteboardStats();
        }
    };
    
    // 清空白板
    document.getElementById('wbClearAll').onclick = function() {
        if (confirm('确定清空所有卡片和连线吗？')) {
            whiteboardData.cards = [];
            whiteboardData.connections = [];
            saveWhiteboardData();
            renderWhiteboardCards();
            renderWhiteboardLines();
            updateWhiteboardStats();
        }
    };
    
    // 关闭
    document.getElementById('wbCloseBtn').onclick = closeWhiteboardPanel;
    
    // 键盘快捷键
    document.addEventListener('keydown', function(e) {
        if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
            // 撤销（简化：删除最后添加的卡片）
            if (whiteboardData.cards.length > 0) {
                whiteboardData.cards.pop();
                saveWhiteboardData();
                renderWhiteboardCards();
                renderWhiteboardLines();
                updateWhiteboardStats();
            }
        }
    });
}

function addWhiteboardCard(type) {
    var textMap = {
        note: '双击编辑笔记...',
        todo: '□ 任务一\n□ 任务二',
        quote: '「写下灵感语录」'
    };
    var newCard = {
        id: genWhiteboardId('card'),
        type: type,
        text: textMap[type] || '新卡片',
        x: 100 + Math.random() * 200,
        y: 80 + Math.random() * 150,
        width: 220,
        height: 100
    };
    whiteboardData.cards.push(newCard);
    saveWhiteboardData();
    renderWhiteboardCards();
    renderWhiteboardLines();
    updateWhiteboardStats();
}

function updateWhiteboardStats() {
    document.getElementById('wbCardCount').textContent = whiteboardData.cards.length;
    document.getElementById('wbLineCount').textContent = whiteboardData.connections.length;
}

// ========== 打开/关闭 ==========

function openWhiteboardPanel() {
    var existingPage = document.querySelector('.page[data-page="whiteboard_panel"]');
    if (existingPage) {
        switchToTab('whiteboard_panel');
        return;
    }
    
    var bookId = currentBookId || 'global';
    var tabId = 'whiteboard_panel';
    openTabs.push({ id: tabId, title: '📝 无边记', type: 'whiteboard', bookId: bookId });
    renderTabs();
    
    var pagesContainer = document.getElementById('pagesContainer');
    var pageDiv = document.createElement('div');
    pageDiv.className = 'page';
    pageDiv.setAttribute('data-page', tabId);
    pageDiv.innerHTML = '<div id="whiteboardContainer" style="height:100%;"></div>';
    pagesContainer.appendChild(pageDiv);
    
    getWhiteboardData();
    renderWhiteboard();
    
    switchToTab(tabId);
    var sidebar = document.querySelector('.sidebar-menu');
    if (sidebar) sidebar.style.display = 'none';
}

function closeWhiteboardPanel() {
    closeTab('whiteboard_panel');
    var sidebar = document.querySelector('.sidebar-menu');
    if (sidebar) sidebar.style.display = 'flex';
}

// ========== 导出 ==========

window.openWhiteboardPanel = openWhiteboardPanel;
window.closeWhiteboardPanel = closeWhiteboardPanel;
window.whiteboardData = whiteboardData;

document.addEventListener('DOMContentLoaded', function() {
    var whiteboardTool = document.querySelector('.sidebar-tool-item[data-tool="whiteboard"]');
    if (whiteboardTool) {
        whiteboardTool.onclick = function() {
            if (typeof openWhiteboardPanel === 'function') {
                openWhiteboardPanel();
            } else {
                window.open('html/whiteboard.html', '_blank');
            }
        };
    }
});

// ========== 白板侧边栏模式 ==========

function openWhiteboardSidebar() {
    if (typeof openToolSidebar === 'function') {
        openToolSidebar('whiteboard');
    } else {
        window.open('html/whiteboard.html', '_blank', 'width=1200,height=800,resizable=yes');
    }
}

function openWhiteboardInNewWindow() {
    // 关闭浮动面板
    if (typeof closeWhiteboardFloatingPanel === 'function') {
        closeWhiteboardFloatingPanel();
    }
    
    // 确保数据已加载
    getWhiteboardData();
    
    // ========== 获取主题和自定义背景 ==========
    var currentTheme = localStorage.getItem('app_theme') || 'default';
    var customBgImage = localStorage.getItem('custom_bg_image') || '';
    var customBgOpacity = parseInt(localStorage.getItem('custom_bg_opacity') || '30');
    
    var themeColors = {
        'default': { bg: '#f0f2f5', panel: 'rgba(255,255,255,0.95)', border: 'rgba(0,0,0,0.08)', text: '#333', textSecondary: '#888', headerBg: 'rgba(0,0,0,0.03)' },
        'eye': { bg: '#e8f0e5', panel: 'rgba(200,219,197,0.95)', border: 'rgba(44,62,47,0.12)', text: '#2c3e2f', textSecondary: '#5a7a5a', headerBg: 'rgba(44,62,47,0.06)' },
        'warm': { bg: '#f5efe5', panel: 'rgba(223,213,189,0.95)', border: 'rgba(74,59,44,0.12)', text: '#4a3b2c', textSecondary: '#8a7a6a', headerBg: 'rgba(74,59,44,0.06)' },
        'dark': { bg: '#1a1a2e', panel: 'rgba(30,30,46,0.95)', border: 'rgba(255,255,255,0.08)', text: '#e0e0e0', textSecondary: '#8888aa', headerBg: 'rgba(255,255,255,0.05)' },
        'open': { bg: '#f0f2f5', panel: 'rgba(255,255,255,0.2)', border: 'rgba(255,255,255,0.1)', text: '#333', textSecondary: '#888', headerBg: 'rgba(255,255,255,0.08)' }
    };
    var c = themeColors[currentTheme] || themeColors['default'];
    var isDark = currentTheme === 'dark';
    var isOpen = currentTheme === 'open';
    var hasCustomBg = customBgImage && customBgImage.length > 0;
    
    var bgStyle = '';
    if (hasCustomBg) {
        bgStyle = 'background-image: url(' + JSON.stringify(customBgImage) + '); background-size: cover; background-position: center; background-attachment: fixed; opacity: ' + (customBgOpacity/100) + ';';
    }
    
    // 序列化数据
    var dataJson = JSON.stringify(whiteboardData);
    var bookId = currentBookId || 'global';
    
    var html = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>📝 无边记 - 全屏编辑</title>
    <style>
        * { margin:0; padding:0; box-sizing:border-box; }
        body { font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif; ${hasCustomBg ? bgStyle : 'background:' + c.bg + ';'} height:100vh; overflow:hidden; color:${c.text}; position:relative; }
        ${hasCustomBg ? `
        body::before {
            content: '';
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.3);
            z-index: 0;
            pointer-events: none;
        }
        .whiteboard-wrapper { position:relative; z-index:1; }
        ` : ''}
        .whiteboard-wrapper { display:flex; flex-direction:column; height:100%; width:100%; background:${c.bg}; position:relative; overflow:hidden; ${isOpen ? 'padding:12px;' : ''} }
        .whiteboard-toolbar { display:flex; gap:8px; padding:10px 16px; background:${hasCustomBg ? 'rgba(0,0,0,0.5)' : c.panel}; backdrop-filter:blur(8px); border-bottom:1px solid ${c.border}; flex-shrink:0; z-index:10; flex-wrap:wrap; ${isOpen ? 'border-radius:20px;border:1px solid rgba(255,255,255,0.15);' : ''} }
        .whiteboard-toolbar button { padding:4px 12px; background:${isDark ? 'rgba(255,255,255,0.08)' : '#f0f0f0'}; border:none; border-radius:6px; cursor:pointer; color:${c.text}; }
        .whiteboard-toolbar .clear-all { background:#dc3545; color:white; }
        .whiteboard-canvas { flex:1; position:relative; overflow:hidden; cursor:grab; background-image:radial-gradient(circle at 1px 1px, rgba(0,0,0,0.05) 1px, transparent 1px); background-size:24px 24px; ${isOpen ? 'border-radius:20px;border:1px solid rgba(255,255,255,0.15);margin-top:12px;' : ''} }
        .whiteboard-canvas svg { position:absolute; top:0; left:0; width:100%; height:100%; pointer-events:none; z-index:1; }
        .whiteboard-cards { position:absolute; top:0; left:0; width:100%; height:100%; z-index:2; }
        .whiteboard-stats { position:absolute; bottom:12px; right:16px; font-size:11px; color:${c.textSecondary}; background:${hasCustomBg ? 'rgba(0,0,0,0.5)' : c.panel}; padding:4px 12px; border-radius:12px; z-index:5; backdrop-filter:blur(8px); }
        .wb-card { position:absolute; background:${c.panel}; border-radius:16px; padding:12px; box-shadow:${isDark ? '0 4px 12px rgba(0,0,0,0.3)' : '0 4px 12px rgba(0,0,0,0.1)'}; cursor:default; z-index:2; display:flex; flex-direction:column; border:1px solid ${c.border}; }
        .wb-card-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:6px; font-size:11px; color:${c.textSecondary}; }
        .wb-card-header .delete { cursor:pointer; opacity:0.5; }
        .wb-card-content { flex:1; font-size:13px; line-height:1.5; outline:none; white-space:pre-wrap; word-break:break-word; cursor:text; user-select:text; min-height:60px; color:${c.text}; }
        .wb-card-resize { position:absolute; bottom:4px; right:4px; width:12px; height:12px; background:rgba(0,0,0,0.05); border-radius:50%; cursor:se-resize; }
        ::-webkit-scrollbar { width:6px; height:6px; }
        ::-webkit-scrollbar-thumb { background:${isDark ? 'rgba(255,255,255,0.2)' : 'rgba(136,136,136,0.4)'}; border-radius:3px; }
        ::-webkit-scrollbar-track { background:transparent; }
        ${hasCustomBg ? `
        .whiteboard-toolbar { background:rgba(0,0,0,0.5); }
        .wb-card { background:rgba(0,0,0,0.6); border-color:rgba(255,255,255,0.1); }
        .wb-card-header { color:rgba(255,255,255,0.7); }
        .wb-card-content { color:#fff; }
        .whiteboard-stats { background:rgba(0,0,0,0.5); color:rgba(255,255,255,0.7); }
        .whiteboard-toolbar button { color:#fff; }
        ` : ''}
    </style>
</head>
<body>
<div class="whiteboard-wrapper">
    <div class="whiteboard-toolbar">
        <button id="wbAddNote">📝 笔记</button>
        <button id="wbAddTodo">✅ 待办</button>
        <button id="wbAddQuote">💡 灵感</button>
        <button id="wbLinkMode">🔗 连线</button>
        <button id="wbClearLines">🗑 清空连线</button>
        <button class="clear-all" id="wbClearAll">清空白板</button>
        <span style="font-size:12px; color:${c.textSecondary}; margin-left:auto;">💡 拖拽卡片移动 · 双击编辑</span>
    </div>
    <div class="whiteboard-canvas" id="wbCanvas">
        <svg id="wbSvgLayer"></svg>
        <div class="whiteboard-cards" id="wbCardsContainer"></div>
        <div class="whiteboard-stats">卡片: <span id="wbCardCount">0</span> | 连线: <span id="wbLineCount">0</span></div>
    </div>
</div>
<script>
var whiteboardData = ${dataJson};
var currentBookId = ${bookId};

function getWhiteboardCard(id) {
    return whiteboardData.cards.find(function(c) { return c.id === id; });
}
function saveWhiteboardData() {
    var key = 'openwrite_whiteboard_' + (currentBookId || 'global');
    localStorage.setItem(key, JSON.stringify(whiteboardData));
    if (window.opener && window.opener.window) {
        try { window.opener.window.location.reload(); } catch(e) {}
    }
}
function genWhiteboardId(prefix) {
    return prefix + '_' + (whiteboardData.nextId++);
}
function renderCards() {
    var container = document.getElementById('wbCardsContainer');
    if (!container) return;
    container.innerHTML = '';
    whiteboardData.cards.forEach(function(card) {
        var cardDiv = document.createElement('div');
        cardDiv.className = 'wb-card';
        cardDiv.style.cssText = 'position:absolute; left:' + card.x + 'px; top:' + card.y + 'px; width:' + card.width + 'px; min-height:' + (card.height || 100) + 'px;';
        cardDiv.setAttribute('data-id', card.id);
        var icons = { note: '📝', todo: '✅', quote: '💡' };
        var labels = { note: '笔记', todo: '待办', quote: '灵感' };
        cardDiv.innerHTML = \`
            <div class="wb-card-header">
                <span>\${icons[card.type] || '📝'} \${labels[card.type] || '笔记'}</span>
                <span class="delete" data-id="\${card.id}">✕</span>
            </div>
            <div class="wb-card-content" contenteditable="true" data-id="\${card.id}">\${card.text}</div>
            <div class="wb-card-resize"></div>
        \`;
        container.appendChild(cardDiv);
    });
    bindCardEvents();
    updateStats();
}
function bindCardEvents() {
    document.querySelectorAll('.wb-card').forEach(function(cardEl) {
        var isDragging = false, startX, startY, origX, origY;
        var header = cardEl.querySelector('.wb-card-header');
        header.addEventListener('mousedown', function(e) {
            if (e.target.closest('.delete')) return;
            if (whiteboardData.linkMode) {
                handleLinkMode(cardEl.getAttribute('data-id'));
                return;
            }
            isDragging = true;
            var rect = cardEl.getBoundingClientRect();
            var containerRect = document.getElementById('wbCardsContainer').getBoundingClientRect();
            startX = e.clientX; startY = e.clientY;
            origX = parseFloat(cardEl.style.left); origY = parseFloat(cardEl.style.top);
            cardEl.style.cursor = 'grabbing';
            cardEl.style.zIndex = '10';
            e.preventDefault();
        });
        document.addEventListener('mousemove', function(e) {
            if (!isDragging) return;
            var dx = e.clientX - startX, dy = e.clientY - startY;
            var newX = origX + dx, newY = origY + dy;
            cardEl.style.left = Math.max(0, newX) + 'px';
            cardEl.style.top = Math.max(0, newY) + 'px';
            var card = getWhiteboardCard(cardEl.getAttribute('data-id'));
            if (card) { card.x = Math.max(0, newX); card.y = Math.max(0, newY); }
            renderLines();
        });
        document.addEventListener('mouseup', function() {
            if (isDragging) { isDragging = false; cardEl.style.cursor = 'default'; cardEl.style.zIndex = '2'; saveWhiteboardData(); renderLines(); }
        });
        var resizeHandle = cardEl.querySelector('.wb-card-resize');
        if (resizeHandle) {
            var isResizing = false, startWidth, startHeight, startXResize, startYResize;
            resizeHandle.addEventListener('mousedown', function(e) {
                e.stopPropagation(); e.preventDefault();
                isResizing = true;
                startWidth = parseFloat(cardEl.style.width) || 200;
                startHeight = parseFloat(cardEl.style.height) || 100;
                startXResize = e.clientX; startYResize = e.clientY;
            });
            document.addEventListener('mousemove', function(e) {
                if (!isResizing) return;
                var dx = e.clientX - startXResize, dy = e.clientY - startYResize;
                var newWidth = Math.max(120, startWidth + dx);
                var newHeight = Math.max(80, startHeight + dy);
                cardEl.style.width = newWidth + 'px';
                cardEl.style.height = newHeight + 'px';
                var card = getWhiteboardCard(cardEl.getAttribute('data-id'));
                if (card) { card.width = newWidth; card.height = newHeight; }
                renderLines();
            });
            document.addEventListener('mouseup', function() {
                if (isResizing) { isResizing = false; saveWhiteboardData(); renderLines(); }
            });
        }
    });
    document.querySelectorAll('.wb-card-content').forEach(function(content) {
        content.addEventListener('blur', function() {
            var card = getWhiteboardCard(this.getAttribute('data-id'));
            if (card) { card.text = this.innerText; saveWhiteboardData(); }
        });
        content.addEventListener('dblclick', function(e) { e.stopPropagation(); this.focus(); });
        content.addEventListener('mousedown', function(e) { e.stopPropagation(); });
    });
    document.querySelectorAll('.delete').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            var id = this.getAttribute('data-id');
            if (confirm('确定删除这个卡片吗？')) {
                whiteboardData.cards = whiteboardData.cards.filter(function(c) { return c.id !== id; });
                whiteboardData.connections = whiteboardData.connections.filter(function(c) { return c.fromId !== id && c.toId !== id; });
                saveWhiteboardData();
                renderCards();
                renderLines();
                updateStats();
            }
        });
    });
}
var linkModePending = null;
function handleLinkMode(cardId) {
    if (linkModePending === null) {
        linkModePending = cardId;
        var cardEl = document.querySelector('.wb-card[data-id="' + cardId + '"]');
        if (cardEl) { cardEl.style.boxShadow = '0 0 0 3px #007aff'; setTimeout(function() { if (cardEl) cardEl.style.boxShadow = ''; }, 300); }
    } else if (linkModePending !== cardId) {
        whiteboardData.connections.push({ id: genWhiteboardId('conn'), fromId: linkModePending, toId: cardId });
        linkModePending = null;
        saveWhiteboardData();
        renderLines();
        updateStats();
    } else {
        linkModePending = null;
    }
}
function renderLines() {
    var svg = document.getElementById('wbSvgLayer');
    if (!svg) return;
    svg.innerHTML = '';
    whiteboardData.connections.forEach(function(conn) {
        var from = getWhiteboardCard(conn.fromId);
        var to = getWhiteboardCard(conn.toId);
        if (!from || !to) return;
        var fromX = from.x + (from.width || 200) / 2;
        var fromY = from.y + (from.height || 100) / 2;
        var toX = to.x + (to.width || 200) / 2;
        var toY = to.y + (to.height || 100) / 2;
        var line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', fromX); line.setAttribute('y1', fromY);
        line.setAttribute('x2', toX); line.setAttribute('y2', toY);
        line.setAttribute('stroke', '#8b8a90'); line.setAttribute('stroke-width', '2');
        line.setAttribute('stroke-dasharray', '5 3');
        svg.appendChild(line);
    });
}
function updateStats() {
    document.getElementById('wbCardCount').textContent = whiteboardData.cards.length;
    document.getElementById('wbLineCount').textContent = whiteboardData.connections.length;
}
function addCard(type) {
    var textMap = { note: '双击编辑笔记...', todo: '□ 任务一\\n□ 任务二', quote: '「写下灵感语录」' };
    var newCard = {
        id: genWhiteboardId('card'),
        type: type,
        text: textMap[type] || '新卡片',
        x: 100 + Math.random() * 200,
        y: 80 + Math.random() * 150,
        width: 220,
        height: 100
    };
    whiteboardData.cards.push(newCard);
    saveWhiteboardData();
    renderCards();
    renderLines();
    updateStats();
}
document.getElementById('wbAddNote').onclick = function() { addCard('note'); };
document.getElementById('wbAddTodo').onclick = function() { addCard('todo'); };
document.getElementById('wbAddQuote').onclick = function() { addCard('quote'); };
document.getElementById('wbLinkMode').onclick = function() {
    whiteboardData.linkMode = !whiteboardData.linkMode;
    this.style.background = whiteboardData.linkMode ? '#007aff' : '#f0f0f0';
    this.style.color = whiteboardData.linkMode ? 'white' : '';
    if (whiteboardData.linkMode) { linkModePending = null; alert('🔗 连线模式已开启，依次点击两个卡片的顶部区域创建连线'); }
};
document.getElementById('wbClearLines').onclick = function() {
    if (confirm('确定删除所有连线吗？')) {
        whiteboardData.connections = [];
        saveWhiteboardData();
        renderLines();
        updateStats();
    }
};
document.getElementById('wbClearAll').onclick = function() {
    if (confirm('确定清空所有卡片和连线吗？')) {
        whiteboardData.cards = [];
        whiteboardData.connections = [];
        saveWhiteboardData();
        renderCards();
        renderLines();
        updateStats();
    }
};
document.addEventListener('keydown', function(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        if (whiteboardData.cards.length > 0) {
            whiteboardData.cards.pop();
            saveWhiteboardData();
            renderCards();
            renderLines();
            updateStats();
        }
    }
});
renderCards();
renderLines();
updateStats();
console.log('白板独立窗口已打开');
<\/script>
</body>
</html>`;
    
    var newWindow = window.open('', '_blank', 'width=1200,height=800,menubar=no,toolbar=no,location=no,status=no,scrollbars=no');
    if (newWindow) {
        newWindow.document.write(html);
        newWindow.document.close();
        newWindow.focus();
    } else {
        alert('请允许弹出窗口，或手动打开新窗口。');
    }
}
// ========== 白板紧凑模式（侧边栏） ==========

function renderCompactWhiteboardPanel() {
    return `
        <div style="display:flex;flex-direction:column;height:100%;width:100%;">
            <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 14px;border-bottom:1px solid var(--border-color, rgba(0,0,0,0.08));flex-shrink:0;">
                <span style="font-weight:600;font-size:14px;">📝 无边记</span>
                <div style="display:flex;gap:4px;">
                    <button id="compactWbExpandBtn" title="新窗口打开" style="background:none;border:none;cursor:pointer;font-size:14px;padding:2px 8px;border-radius:4px;">⤢</button>
                    <button id="compactWbCloseBtn" title="关闭面板" style="background:none;border:none;cursor:pointer;font-size:14px;padding:2px 8px;border-radius:4px;">✕</button>
                </div>
            </div>
            <div style="display:flex;gap:6px;padding:8px 12px;flex-shrink:0;flex-wrap:wrap;">
                <button id="compactWbAddNote" style="padding:4px 10px;background:#f0f0f0;border:none;border-radius:6px;cursor:pointer;font-size:12px;">📝 笔记</button>
                <button id="compactWbAddTodo" style="padding:4px 10px;background:#f0f0f0;border:none;border-radius:6px;cursor:pointer;font-size:12px;">✅ 待办</button>
                <button id="compactWbAddQuote" style="padding:4px 10px;background:#f0f0f0;border:none;border-radius:6px;cursor:pointer;font-size:12px;">💡 灵感</button>
                <button id="compactWbClearAll" style="padding:4px 10px;background:#dc3545;color:white;border:none;border-radius:6px;cursor:pointer;font-size:12px;">清空</button>
            </div>
            <div id="compactWhiteboardCanvas" style="flex:1;position:relative;overflow:hidden;background:radial-gradient(circle at 1px 1px, rgba(0,0,0,0.05) 1px, transparent 1px);background-size:20px 20px;margin:0 8px 8px 8px;border-radius:12px;">
                <svg id="compactWbSvg" style="position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:1;"></svg>
                <div id="compactWbCards" style="position:absolute;top:0;left:0;width:100%;height:100%;z-index:2;"></div>
                <div style="position:absolute;bottom:8px;right:12px;font-size:10px;color:#888;background:rgba(255,255,255,0.8);padding:2px 10px;border-radius:10px;z-index:3;">
                    卡片: <span id="compactWbCardCount">0</span>
                </div>
            </div>
        </div>
    `;
}

function renderCompactWhiteboardCards() {
    var container = document.getElementById('compactWbCards');
    if (!container) return;
    
    container.innerHTML = '';
    whiteboardData.cards.forEach(function(card) {
        var cardDiv = document.createElement('div');
        cardDiv.className = 'compact-wb-card';
        cardDiv.style.cssText = 'position:absolute;left:' + card.x + 'px;top:' + card.y + 'px;width:' + (card.width || 180) + 'px;min-height:' + (card.height || 80) + 'px;background:rgba(255,255,245,0.95);border-radius:12px;padding:10px;box-shadow:0 2px 8px rgba(0,0,0,0.08);cursor:default;z-index:2;';
        cardDiv.setAttribute('data-id', card.id);
        
        var icons = { note: '📝', todo: '✅', quote: '💡' };
        cardDiv.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:center;font-size:10px;color:#888;margin-bottom:4px;">
                <span>${icons[card.type] || '📝'}</span>
                <span class="compact-wb-delete" data-id="${card.id}" style="cursor:pointer;opacity:0.5;">✕</span>
            </div>
            <div class="compact-wb-content" contenteditable="true" data-id="${card.id}" style="font-size:12px;line-height:1.5;outline:none;white-space:pre-wrap;word-break:break-word;cursor:text;min-height:40px;">${card.text}</div>
        `;
        container.appendChild(cardDiv);
    });
    
    // 卡片拖拽
    document.querySelectorAll('.compact-wb-card').forEach(function(cardEl) {
        var isDragging = false;
        var startX, startY, origX, origY;
        
        cardEl.addEventListener('mousedown', function(e) {
            if (e.target.closest('.compact-wb-delete')) return;
            if (e.target.closest('.compact-wb-content')) return;
            isDragging = true;
            var rect = cardEl.getBoundingClientRect();
            var containerRect = document.getElementById('compactWbCards').getBoundingClientRect();
            startX = e.clientX;
            startY = e.clientY;
            origX = parseFloat(cardEl.style.left);
            origY = parseFloat(cardEl.style.top);
            cardEl.style.cursor = 'grabbing';
            cardEl.style.zIndex = '10';
            e.preventDefault();
        });
        
        document.addEventListener('mousemove', function(e) {
            if (!isDragging) return;
            var dx = (e.clientX - startX);
            var dy = (e.clientY - startY);
            var newX = origX + dx;
            var newY = origY + dy;
            cardEl.style.left = Math.max(0, newX) + 'px';
            cardEl.style.top = Math.max(0, newY) + 'px';
            var card = getWhiteboardCard(cardEl.getAttribute('data-id'));
            if (card) {
                card.x = Math.max(0, newX);
                card.y = Math.max(0, newY);
            }
            renderCompactWhiteboardLines();
        });
        
        document.addEventListener('mouseup', function() {
            if (isDragging) {
                isDragging = false;
                cardEl.style.cursor = 'default';
                cardEl.style.zIndex = '2';
                saveWhiteboardData();
                renderCompactWhiteboardLines();
            }
        });
    });
    
    // 内容编辑
    document.querySelectorAll('.compact-wb-content').forEach(function(content) {
        content.addEventListener('blur', function() {
            var card = getWhiteboardCard(this.getAttribute('data-id'));
            if (card) {
                card.text = this.innerText;
                saveWhiteboardData();
            }
        });
    });
    
    // 删除
    document.querySelectorAll('.compact-wb-delete').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            var id = this.getAttribute('data-id');
            whiteboardData.cards = whiteboardData.cards.filter(function(c) { return c.id !== id; });
            saveWhiteboardData();
            renderCompactWhiteboardCards();
            renderCompactWhiteboardLines();
            updateCompactWbStats();
        });
    });
    
    updateCompactWbStats();
}

function renderCompactWhiteboardLines() {
    var svg = document.getElementById('compactWbSvg');
    if (!svg) return;
    
    svg.innerHTML = '';
    whiteboardData.connections.forEach(function(conn) {
        var from = getWhiteboardCard(conn.fromId);
        var to = getWhiteboardCard(conn.toId);
        if (!from || !to) return;
        
        var fromX = from.x + (from.width || 180) / 2;
        var fromY = from.y + (from.height || 80) / 2;
        var toX = to.x + (to.width || 180) / 2;
        var toY = to.y + (to.height || 80) / 2;
        
        var line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', fromX);
        line.setAttribute('y1', fromY);
        line.setAttribute('x2', toX);
        line.setAttribute('y2', toY);
        line.setAttribute('stroke', '#8b8a90');
        line.setAttribute('stroke-width', '1.5');
        line.setAttribute('stroke-dasharray', '4 3');
        svg.appendChild(line);
    });
}

function updateCompactWbStats() {
    var el = document.getElementById('compactWbCardCount');
    if (el) el.textContent = whiteboardData.cards.length;
}

function bindCompactWhiteboardEvents() {
    console.log('绑定白板事件...');
    
    // 添加卡片 - 检查元素是否存在
    var addNoteBtn = document.getElementById('compactWbAddNote');
    if (addNoteBtn) {
        addNoteBtn.onclick = function() { 
            addCompactWhiteboardCard('note'); 
        };
    } else {
        console.warn('compactWbAddNote 按钮不存在');
    }
    
    var addTodoBtn = document.getElementById('compactWbAddTodo');
    if (addTodoBtn) {
        addTodoBtn.onclick = function() { 
            addCompactWhiteboardCard('todo'); 
        };
    } else {
        console.warn('compactWbAddTodo 按钮不存在');
    }
    
    var addQuoteBtn = document.getElementById('compactWbAddQuote');
    if (addQuoteBtn) {
        addQuoteBtn.onclick = function() { 
            addCompactWhiteboardCard('quote'); 
        };
    } else {
        console.warn('compactWbAddQuote 按钮不存在');
    }
    
    // 清空
    var clearBtn = document.getElementById('compactWbClearAll');
    if (clearBtn) {
        clearBtn.onclick = function() {
            if (confirm('确定清空所有卡片吗？')) {
                whiteboardData.cards = [];
                whiteboardData.connections = [];
                saveWhiteboardData();
                renderCompactWhiteboardCards();
                renderCompactWhiteboardLines();
                updateCompactWbStats();
            }
        };
    } else {
        console.warn('compactWbClearAll 按钮不存在');
    }
    
    // 展开 - 使用 openWhiteboardInNewWindow 而不是打开 HTML
document.getElementById('compactWbExpandBtn').onclick = function() {
    if (typeof openWhiteboardInNewWindow === 'function') {
        openWhiteboardInNewWindow();
    } else {
        // 降级方案
        window.open('html/whiteboard.html', '_blank', 'width=1200,height=800,resizable=yes');
        };
        console.warn('compactWbExpandBtn 按钮不存在');
    }
    
    // 关闭
    var closeBtn = document.getElementById('compactWbCloseBtn');
    if (closeBtn) {
        closeBtn.onclick = function() {
            if (typeof closeFloatingPanel === 'function') {
                closeFloatingPanel();
            }
        };
    } else {
        console.warn('compactWbCloseBtn 按钮不存在');
    }
    
    console.log('白板事件绑定完成');
}

function addCompactWhiteboardCard(type) {
    var textMap = {
        note: '双击编辑笔记...',
        todo: '□ 任务一\n□ 任务二',
        quote: '「写下灵感语录」'
    };
    var newCard = {
        id: genWhiteboardId('card'),
        type: type,
        text: textMap[type] || '新卡片',
        x: 20 + Math.random() * 100,
        y: 20 + Math.random() * 80,
        width: 180,
        height: 80
    };
    whiteboardData.cards.push(newCard);
    saveWhiteboardData();
    renderCompactWhiteboardCards();
    renderCompactWhiteboardLines();
    updateCompactWbStats();
}

// 导出
window.openWhiteboardSidebar = openWhiteboardSidebar;
window.openWhiteboardInNewWindow = openWhiteboardInNewWindow;

console.log('白板侧边栏函数已注册');
console.log('无边记工具已加载');
console.log('✅ whiteboard.js 已加载，renderCompactWhiteboardPanel 存在:', typeof renderCompactWhiteboardPanel === 'function');
console.log('✅ getWhiteboardData 存在:', typeof getWhiteboardData === 'function');