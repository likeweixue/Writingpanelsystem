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

console.log('无边记工具已加载');