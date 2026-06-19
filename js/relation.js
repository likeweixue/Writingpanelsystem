// ========== 关系图工具 ==========

var relationData = {
    entities: [],
    relations: [],
    selectedId: null,
    nextId: 1
};

// ========== 数据操作 ==========

function getRelationData() {
    var bookId = currentBookId || 'global';
    var key = 'openwrite_relation_' + bookId;
    var saved = localStorage.getItem(key);
    if (saved) {
        try {
            var data = JSON.parse(saved);
            relationData.entities = data.entities || [];
            relationData.relations = data.relations || [];
            relationData.selectedId = data.selectedId || null;
            relationData.nextId = data.nextId || 1;
            return;
        } catch(e) {}
    }
    setDefaultRelationData();
}

function setDefaultRelationData() {
    relationData.entities = [
        { id: 'ent_1', name: '叶尘', type: 'character', color: '#4A90D9', x: 200, y: 200 },
        { id: 'ent_2', name: '雪灵儿', type: 'character', color: '#E87A90', x: 450, y: 150 },
        { id: 'ent_3', name: '墨渊', type: 'character', color: '#2C3E50', x: 400, y: 350 },
        { id: 'ent_4', name: '落星宗', type: 'faction', color: '#27AE60', x: 80, y: 350 },
        { id: 'ent_5', name: '魔渊', type: 'faction', color: '#8E44AD', x: 600, y: 300 },
    ];
    relationData.relations = [
        { id: 'rel_1', fromId: 'ent_1', toId: 'ent_2', label: '道侣 · 挚爱', color: '#E87A90' },
        { id: 'rel_2', fromId: 'ent_1', toId: 'ent_4', label: '核心弟子', color: '#27AE60' },
        { id: 'rel_3', fromId: 'ent_1', toId: 'ent_3', label: '宿敌', color: '#E74C3C' },
        { id: 'rel_4', fromId: 'ent_3', toId: 'ent_5', label: '君主', color: '#8E44AD' },
        { id: 'rel_5', fromId: 'ent_2', toId: 'ent_4', label: '盟友', color: '#27AE60' },
    ];
    relationData.selectedId = 'ent_1';
    relationData.nextId = 100;
    saveRelationData();
}

function saveRelationData() {
    var bookId = currentBookId || 'global';
    var key = 'openwrite_relation_' + bookId;
    var data = {
        entities: relationData.entities,
        relations: relationData.relations,
        selectedId: relationData.selectedId,
        nextId: relationData.nextId
    };
    localStorage.setItem(key, JSON.stringify(data));
}

function getRelationEntity(id) {
    return relationData.entities.find(function(e) { return e.id === id; });
}

function getRelationsForEntity(id) {
    return relationData.relations.filter(function(r) { return r.fromId === id || r.toId === id; });
}

function genRelationId() {
    return 'rel_' + (relationData.nextId++);
}

function genEntityId() {
    return 'ent_' + (relationData.nextId++);
}

// ========== 全屏模式渲染 ==========

function renderRelationEntities() {
    var container = document.getElementById('relationEntityList');
    if (!container) return;
    container.innerHTML = '';
    var characters = relationData.entities.filter(function(e) { return e.type === 'character'; });
    var factions = relationData.entities.filter(function(e) { return e.type === 'faction'; });
    
    function renderGroup(items, title, icon) {
        if (items.length === 0) return;
        var groupDiv = document.createElement('div');
        groupDiv.style.marginBottom = '8px';
        groupDiv.innerHTML = '<div style="font-size:11px;color:#888;margin-bottom:4px;font-weight:500;">' + icon + ' ' + title + '</div>';
        items.forEach(function(entity) {
            var div = document.createElement('div');
            div.className = 'relation-entity-item';
            div.style.cssText = 'display:flex;align-items:center;gap:8px;padding:5px 10px;margin:2px 0;border-radius:6px;cursor:pointer;transition:background 0.15s;font-size:13px;';
            if (relationData.selectedId === entity.id) {
                div.style.background = 'rgba(0,122,255,0.12)';
            }
            div.setAttribute('data-id', entity.id);
            div.innerHTML = '<span style="display:inline-block;width:12px;height:12px;border-radius:50%;background:' + entity.color + ';flex-shrink:0;"></span>' +
                '<span style="flex:1;">' + entity.name + '</span>' +
                '<span style="font-size:10px;color:#888;">' + getRelationsForEntity(entity.id).length + ' 关系</span>';
            div.onclick = function() {
                selectRelationEntity(entity.id);
            };
            groupDiv.appendChild(div);
        });
        container.appendChild(groupDiv);
    }
    renderGroup(characters, '人物', '👤');
    renderGroup(factions, '势力', '🏛️');
    if (relationData.entities.length === 0) {
        container.innerHTML = '<div style="text-align:center;color:#888;padding:20px;font-size:13px;">暂无实体，点击"新增"添加</div>';
    }
}

function renderRelationList() {
    var container = document.getElementById('relationList');
    if (!container) return;
    if (relationData.relations.length === 0) {
        container.innerHTML = '<div style="text-align:center;color:#888;padding:12px;font-size:12px;">暂无关系</div>';
        return;
    }
    container.innerHTML = '';
    relationData.relations.forEach(function(rel) {
        var from = getRelationEntity(rel.fromId);
        var to = getRelationEntity(rel.toId);
        if (!from || !to) return;
        var div = document.createElement('div');
        div.className = 'relation-item';
        div.style.cssText = 'display:flex;align-items:center;gap:8px;padding:5px 10px;margin:3px 0;background:rgba(0,0,0,0.02);border-radius:6px;border-left:3px solid ' + (rel.color || '#888') + ';font-size:12px;';
        div.innerHTML =
            '<span style="font-weight:500;">' + from.name + '</span>' +
            '<span style="color:#888;">→</span>' +
            '<span style="font-weight:500;">' + to.name + '</span>' +
            '<span style="font-size:11px;color:#888;flex:1;">' + (rel.label || '关联') + '</span>' +
            '<button class="delete-relation-btn" data-id="' + rel.id + '" style="background:none;border:none;color:#dc3545;cursor:pointer;font-size:13px;">✕</button>';
        container.appendChild(div);
    });
    container.querySelectorAll('.delete-relation-btn').forEach(function(btn) {
        btn.onclick = function() {
            var id = this.getAttribute('data-id');
            if (confirm('确定删除这个关系吗？')) {
                relationData.relations = relationData.relations.filter(function(r) { return r.id !== id; });
                saveRelationData();
                renderRelationEntities();
                renderRelationList();
                renderRelationCanvas();
            }
        };
    });
}

function selectRelationEntity(id) {
    relationData.selectedId = id;
    saveRelationData();
    renderRelationEntities();
    renderRelationList();
    renderRelationCanvas();
}

function addRelationEntity() {
    var type = confirm('点击"确定"添加人物，点击"取消"添加势力') ? 'character' : 'faction';
    var typeName = type === 'character' ? '人物' : '势力';
    var name = prompt('请输入' + typeName + '名称：', type === 'character' ? '新角色' : '新势力');
    if (!name || !name.trim()) return;
    var colors = ['#4A90D9', '#E87A90', '#27AE60', '#E67E22', '#8E44AD', '#2ECC71', '#E74C3C', '#1ABC9C'];
    var color = colors[relationData.entities.length % colors.length];
    var newEntity = {
        id: genEntityId(),
        name: name.trim(),
        type: type,
        color: color,
        x: 200 + Math.random() * 300,
        y: 100 + Math.random() * 300
    };
    relationData.entities.push(newEntity);
    relationData.selectedId = newEntity.id;
    saveRelationData();
    renderRelationEntities();
    renderRelationList();
    renderRelationCanvas();
}

function addRelationFolder() {
    var name = prompt('请输入分类名称：', '新分类');
    if (!name || !name.trim()) return;
    // 分类在关系图中作为势力类型处理
    var colors = ['#4A90D9', '#E87A90', '#27AE60', '#E67E22', '#8E44AD', '#2ECC71', '#E74C3C', '#1ABC9C'];
    var color = colors[relationData.entities.length % colors.length];
    var newEntity = {
        id: genEntityId(),
        name: name.trim(),
        type: 'faction',
        color: color,
        x: 200 + Math.random() * 300,
        y: 100 + Math.random() * 300
    };
    relationData.entities.push(newEntity);
    relationData.selectedId = newEntity.id;
    saveRelationData();
    renderRelationEntities();
    renderRelationList();
    renderRelationCanvas();
}

function deleteRelationEntity() {
    var entity = getRelationEntity(relationData.selectedId);
    if (!entity) return;
    if (relationData.entities.length === 1) {
        alert('至少保留一个实体');
        return;
    }
    if (confirm('确定删除「' + entity.name + '」及其所有关系吗？')) {
        relationData.relations = relationData.relations.filter(function(r) { return r.fromId !== entity.id && r.toId !== entity.id; });
        relationData.entities = relationData.entities.filter(function(e) { return e.id !== entity.id; });
        relationData.selectedId = relationData.entities.length > 0 ? relationData.entities[0].id : null;
        saveRelationData();
        renderRelationEntities();
        renderRelationList();
        renderRelationCanvas();
    }
}

function renameRelationEntity() {
    var entity = getRelationEntity(relationData.selectedId);
    if (!entity) return;
    var newName = prompt('重命名：', entity.name);
    if (newName && newName.trim()) {
        entity.name = newName.trim();
        saveRelationData();
        renderRelationEntities();
        renderRelationList();
        renderRelationCanvas();
    }
}

function openRelationForm() {
    var modal = document.getElementById('relationFormModal');
    if (!modal) {
        var html = `
            <div id="relationFormModal" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.4);z-index:20000;display:flex;align-items:center;justify-content:center;">
                <div style="background:#fff;border-radius:12px;padding:24px;width:360px;box-shadow:0 4px 20px rgba(0,0,0,0.2);">
                    <h3 style="margin:0 0 16px 0;">🔗 建立关系</h3>
                    <div style="margin-bottom:12px;">
                        <label style="display:block;margin-bottom:4px;font-size:13px;color:#666;">源实体</label>
                        <select id="relFromSelect" style="width:100%;padding:8px;border-radius:6px;border:1px solid #ddd;"></select>
                    </div>
                    <div style="margin-bottom:12px;">
                        <label style="display:block;margin-bottom:4px;font-size:13px;color:#666;">目标实体</label>
                        <select id="relToSelect" style="width:100%;padding:8px;border-radius:6px;border:1px solid #ddd;"></select>
                    </div>
                    <div style="margin-bottom:16px;">
                        <label style="display:block;margin-bottom:4px;font-size:13px;color:#666;">关系描述</label>
                        <input type="text" id="relLabelInput" placeholder="如：师徒、盟友、敌对" style="width:100%;padding:8px;border-radius:6px;border:1px solid #ddd;">
                    </div>
                    <div style="display:flex;gap:12px;justify-content:flex-end;">
                        <button id="relFormCancel" style="padding:8px 16px;background:#6c757d;color:white;border:none;border-radius:6px;cursor:pointer;">取消</button>
                        <button id="relFormConfirm" style="padding:8px 16px;background:#007aff;color:white;border:none;border-radius:6px;cursor:pointer;">建立</button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', html);
        modal = document.getElementById('relationFormModal');
        document.getElementById('relFormCancel').onclick = function() { modal.remove(); };
        document.getElementById('relFormConfirm').onclick = function() {
            var fromId = document.getElementById('relFromSelect').value;
            var toId = document.getElementById('relToSelect').value;
            var label = document.getElementById('relLabelInput').value.trim() || '关联';
            if (!fromId || !toId) { alert('请选择源和目标实体'); return; }
            if (fromId === toId) { alert('不能与自己建立关系'); return; }
            if (relationData.relations.some(function(r) { return r.fromId === fromId && r.toId === toId; })) {
                alert('关系已存在');
                return;
            }
            var colors = ['#E74C3C', '#27AE60', '#F39C12', '#8E44AD', '#2ECC71', '#E67E22'];
            var newRel = {
                id: genRelationId(),
                fromId: fromId,
                toId: toId,
                label: label,
                color: colors[relationData.relations.length % colors.length]
            };
            relationData.relations.push(newRel);
            saveRelationData();
            renderRelationEntities();
            renderRelationList();
            renderRelationCanvas();
            modal.remove();
        };
    }
    var fromSelect = document.getElementById('relFromSelect');
    var toSelect = document.getElementById('relToSelect');
    fromSelect.innerHTML = '<option value="">-- 选择 --</option>';
    toSelect.innerHTML = '<option value="">-- 选择 --</option>';
    relationData.entities.forEach(function(e) {
        var opt = '<option value="' + e.id + '">' + (e.type === 'character' ? '👤' : '🏛️') + ' ' + e.name + '</option>';
        fromSelect.innerHTML += opt;
        toSelect.innerHTML += opt;
    });
    modal.style.display = 'flex';
}

// ========== Canvas 渲染 ==========

var relationCanvas = null;
var relationCtx = null;
var dragEntityId = null;
var isDragging = false;
var dragOffsetX = 0;
var dragOffsetY = 0;

function initRelationCanvas() {
    relationCanvas = document.getElementById('relationCanvas');
    if (!relationCanvas) return;
    relationCtx = relationCanvas.getContext('2d');
    resizeRelationCanvas();
    renderRelationCanvas();
    relationCanvas.addEventListener('mousedown', onRelationMouseDown);
    relationCanvas.addEventListener('mousemove', onRelationMouseMove);
    relationCanvas.addEventListener('mouseup', onRelationMouseUp);
    relationCanvas.addEventListener('dblclick', onRelationDblClick);
    window.addEventListener('resize', function() { resizeRelationCanvas(); renderRelationCanvas(); });
}

function resizeRelationCanvas() {
    if (!relationCanvas) return;
    var container = relationCanvas.parentElement;
    relationCanvas.width = container.clientWidth;
    relationCanvas.height = container.clientHeight;
}

function renderRelationCanvas() {
    if (!relationCtx) return;
    var w = relationCanvas.width;
    var h = relationCanvas.height;
    relationCtx.clearRect(0, 0, w, h);
    relationData.relations.forEach(function(rel) {
        var from = getRelationEntity(rel.fromId);
        var to = getRelationEntity(rel.toId);
        if (!from || !to) return;
        relationCtx.beginPath();
        relationCtx.moveTo(from.x, from.y);
        relationCtx.lineTo(to.x, to.y);
        relationCtx.strokeStyle = rel.color || '#888';
        relationCtx.lineWidth = 2;
        relationCtx.setLineDash([5, 5]);
        relationCtx.stroke();
        relationCtx.setLineDash([]);
        var midX = (from.x + to.x) / 2;
        var midY = (from.y + to.y) / 2;
        relationCtx.fillStyle = '#666';
        relationCtx.font = '11px sans-serif';
        relationCtx.textAlign = 'center';
        relationCtx.textBaseline = 'bottom';
        relationCtx.fillText(rel.label || '', midX, midY - 4);
    });
    relationData.entities.forEach(function(entity) {
        var isSelected = entity.id === relationData.selectedId;
        var radius = isSelected ? 30 : 24;
        relationCtx.shadowColor = 'rgba(0,0,0,0.1)';
        relationCtx.shadowBlur = 8;
        relationCtx.shadowOffsetY = 2;
        var grad = relationCtx.createRadialGradient(entity.x - 6, entity.y - 6, 0, entity.x, entity.y, radius);
        grad.addColorStop(0, lightenColor(entity.color, 40));
        grad.addColorStop(1, entity.color);
        relationCtx.beginPath();
        relationCtx.arc(entity.x, entity.y, radius, 0, Math.PI * 2);
        relationCtx.fillStyle = grad;
        relationCtx.fill();
        relationCtx.shadowBlur = 0;
        relationCtx.strokeStyle = isSelected ? '#007aff' : 'rgba(255,255,255,0.5)';
        relationCtx.lineWidth = isSelected ? 3 : 1.5;
        relationCtx.stroke();
        relationCtx.fillStyle = '#fff';
        relationCtx.font = isSelected ? 'bold 13px sans-serif' : '12px sans-serif';
        relationCtx.textAlign = 'center';
        relationCtx.textBaseline = 'middle';
        relationCtx.fillText(entity.name, entity.x, entity.y);
        relationCtx.font = '14px sans-serif';
        relationCtx.fillStyle = 'rgba(255,255,255,0.6)';
        var icon = entity.type === 'character' ? '👤' : '🏛️';
        relationCtx.fillText(icon, entity.x, entity.y - radius - 14);
    });
}

function lightenColor(color, percent) {
    var num = parseInt(color.replace('#', ''), 16);
    var amt = Math.round(2.55 * percent);
    var R = Math.min(255, (num >> 16) + amt);
    var G = Math.min(255, ((num >> 8) & 0x00FF) + amt);
    var B = Math.min(255, (num & 0x0000FF) + amt);
    return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
}

function onRelationMouseDown(e) {
    var rect = relationCanvas.getBoundingClientRect();
    var x = e.clientX - rect.left;
    var y = e.clientY - rect.top;
    for (var i = relationData.entities.length - 1; i >= 0; i--) {
        var entity = relationData.entities[i];
        var dx = x - entity.x;
        var dy = y - entity.y;
        if (Math.sqrt(dx * dx + dy * dy) < 28) {
            dragEntityId = entity.id;
            isDragging = true;
            dragOffsetX = x - entity.x;
            dragOffsetY = y - entity.y;
            relationData.selectedId = entity.id;
            saveRelationData();
            renderRelationEntities();
            renderRelationList();
            renderRelationCanvas();
            return;
        }
    }
}

function onRelationMouseMove(e) {
    if (!isDragging || !dragEntityId) return;
    var rect = relationCanvas.getBoundingClientRect();
    var x = e.clientX - rect.left;
    var y = e.clientY - rect.top;
    var entity = getRelationEntity(dragEntityId);
    if (entity) {
        entity.x = Math.max(30, Math.min(relationCanvas.width - 30, x - dragOffsetX));
        entity.y = Math.max(30, Math.min(relationCanvas.height - 30, y - dragOffsetY));
        renderRelationCanvas();
    }
}

function onRelationMouseUp() {
    if (isDragging && dragEntityId) {
        saveRelationData();
    }
    isDragging = false;
    dragEntityId = null;
}

function onRelationDblClick(e) {
    var rect = relationCanvas.getBoundingClientRect();
    var x = e.clientX - rect.left;
    var y = e.clientY - rect.top;
    for (var i = relationData.entities.length - 1; i >= 0; i--) {
        var entity = relationData.entities[i];
        var dx = x - entity.x;
        var dy = y - entity.y;
        if (Math.sqrt(dx * dx + dy * dy) < 28) {
            renameRelationEntity();
            return;
        }
    }
}

// ========== 全屏模式打开/关闭 ==========

function openRelationPanel() {
    var existingPage = document.querySelector('.page[data-page="relation_panel"]');
    if (existingPage) {
        switchToTab('relation_panel');
        return;
    }
    var bookId = currentBookId || 'global';
    var tabId = 'relation_panel';
    openTabs.push({ id: tabId, title: '🔗 关系图', type: 'relation', bookId: bookId });
    renderTabs();
    var pagesContainer = document.getElementById('pagesContainer');
    var pageDiv = document.createElement('div');
    pageDiv.className = 'page';
    pageDiv.setAttribute('data-page', tabId);
    pageDiv.innerHTML = renderRelationPage();
    pagesContainer.appendChild(pageDiv);
    getRelationData();
    renderRelationEntities();
    renderRelationList();
    setTimeout(function() {
        initRelationCanvas();
    }, 200);
    initRelationEvents();
    switchToTab(tabId);
    var sidebar = document.querySelector('.sidebar-menu');
    if (sidebar) sidebar.style.display = 'none';
}

function closeRelationPanel() {
    closeTab('relation_panel');
    var sidebar = document.querySelector('.sidebar-menu');
    if (sidebar) {
        var activePage = document.querySelector('.page.active');
        if (activePage && activePage.getAttribute('data-page') && activePage.getAttribute('data-page').indexOf('book_') === 0) {
            sidebar.style.display = 'none';
        } else {
            sidebar.style.display = 'flex';
        }
    }
}

function renderRelationPage() {
    return `
        <div class="relation-container" style="display:flex;height:100%;width:100%;">
            <div class="relation-sidebar" style="width:260px;min-width:180px;max-width:320px;background:var(--panel-bg, rgba(255,255,255,0.95));backdrop-filter:blur(8px);border-right:1px solid var(--border-color, rgba(0,0,0,0.08));display:flex;flex-direction:column;flex-shrink:0;overflow:hidden;">
                <div class="relation-sidebar-header" style="display:flex;justify-content:space-between;align-items:center;padding:10px 14px;background:rgba(0,0,0,0.03);border-bottom:1px solid var(--border-color, rgba(0,0,0,0.08));flex-shrink:0;">
                    <span style="font-weight:600;font-size:14px;">🔗 关系图谱</span>
                    <div style="display:flex;gap:4px;">
                        <button id="relationAddEntityBtn" title="新增实体" style="background:none;border:none;cursor:pointer;font-size:15px;">➕</button>
                        <button id="relationAddFolderBtn" title="新增分类" style="background:none;border:none;cursor:pointer;font-size:15px;">📁</button>
                        <button id="relationAddRelationBtn" title="建立关系" style="background:none;border:none;cursor:pointer;font-size:15px;">🔗</button>
                        <button id="relationDeleteBtn" title="删除实体" style="background:none;border:none;cursor:pointer;font-size:15px;">🗑</button>
                        <button id="relationRefreshBtn" title="刷新" style="background:none;border:none;cursor:pointer;font-size:15px;">🔄</button>
                        <button id="relationCloseBtn" title="关闭" style="background:none;border:none;cursor:pointer;font-size:15px;">✕</button>
                    </div>
                </div>
                <div style="padding:6px 10px;flex-shrink:0;">
                    <input type="text" id="outlineSearchInput" placeholder="搜索..." style="width:100%;padding:6px 10px 6px 32px;border:1px solid var(--border-color, #ddd);border-radius:6px;font-size:12px;background:var(--input-bg, #f8f8f8) url('icons/search.svg') no-repeat 8px center;background-size:16px 16px;color:var(--text-color, #333);">
                </div>
                <div style="padding:0 10px;flex-shrink:0;font-size:11px;color:#888;display:flex;gap:12px;">
                    <span>👤 <span id="relationCharCount">0</span></span>
                    <span>🏛️ <span id="relationFactionCount">0</span></span>
                    <span>🔗 <span id="relationRelCount">0</span></span>
                </div>
                <div id="relationEntityList" style="flex:1;overflow-y:auto;padding:6px 10px;"></div>
                <div id="relationList" style="max-height:160px;overflow-y:auto;padding:6px 10px;border-top:1px solid var(--border-color, rgba(0,0,0,0.08));"></div>
                <div style="padding:4px 10px;border-top:1px solid var(--border-color, rgba(0,0,0,0.08));font-size:10px;color:#888;display:flex;justify-content:space-between;flex-shrink:0;">
                    <span>💡 双击重命名</span>
                    <span>📌 拖拽移动</span>
                </div>
            </div>
            <div class="relation-canvas-wrapper" style="flex:1;background:var(--panel-bg, rgba(255,255,255,0.9));overflow:hidden;position:relative;">
                <canvas id="relationCanvas" style="width:100%;height:100%;cursor:default;"></canvas>
                <div style="position:absolute;bottom:12px;left:50%;transform:translateX(-50%);font-size:11px;color:#888;background:rgba(255,255,255,0.8);padding:4px 14px;border-radius:12px;">
                    💡 拖拽移动 · 双击重命名 · 点击选择
                </div>
            </div>
        </div>
    `;
}

function initRelationEvents() {
    var closeBtn = document.getElementById('relationCloseBtn');
    if (closeBtn) closeBtn.onclick = closeRelationPanel;
    var addEntityBtn = document.getElementById('relationAddEntityBtn');
    if (addEntityBtn) addEntityBtn.onclick = addRelationEntity;
    var addFolderBtn = document.getElementById('relationAddFolderBtn');
    if (addFolderBtn) addFolderBtn.onclick = addRelationFolder;
    var deleteBtn = document.getElementById('relationDeleteBtn');
    if (deleteBtn) deleteBtn.onclick = deleteRelationEntity;
    var addRelationBtn = document.getElementById('relationAddRelationBtn');
    if (addRelationBtn) addRelationBtn.onclick = openRelationForm;
    var refreshBtn = document.getElementById('relationRefreshBtn');
    if (refreshBtn) {
        refreshBtn.onclick = function() {
            getRelationData();
            renderRelationEntities();
            renderRelationList();
            renderRelationCanvas();
        };
    }
    var searchInput = document.getElementById('relationSearchInput');
    if (searchInput) {
        searchInput.oninput = function() {
            var keyword = this.value.trim().toLowerCase();
            var items = document.querySelectorAll('.relation-entity-item');
            items.forEach(function(item) {
                var name = item.textContent.toLowerCase();
                item.style.display = name.indexOf(keyword) !== -1 ? 'flex' : 'none';
            });
        };
    }
    // 快捷键：删除键删除选中的实体
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Delete' || e.key === 'Backspace') {
            var activePage = document.querySelector('.page.active');
            if (activePage && activePage.getAttribute('data-page') === 'relation_panel') {
                if (relationData.selectedId) {
                    deleteRelationEntity();
                }
            }
        }
    });
    updateRelationCounts();
}

function updateRelationCounts() {
    var chars = relationData.entities.filter(function(e) { return e.type === 'character'; });
    var factions = relationData.entities.filter(function(e) { return e.type === 'faction'; });
    var charEl = document.getElementById('relationCharCount');
    var factionEl = document.getElementById('relationFactionCount');
    var relEl = document.getElementById('relationRelCount');
    if (charEl) charEl.textContent = chars.length;
    if (factionEl) factionEl.textContent = factions.length;
    if (relEl) relEl.textContent = relationData.relations.length;
}

// ====================================================================
// ========== 浮动面板（紧凑模式） ==========
// ====================================================================

function openRelationSidebar(tool) {
    console.log('openRelationSidebar 被调用，工具:', tool);
    var sidebar = document.querySelector('.sidebar-menu');
    if (sidebar) { sidebar.style.display = 'none'; }
    var existingPanel = document.getElementById('floatingToolPanel');
    if (existingPanel) { existingPanel.remove(); }
    var rightSidebar = document.getElementById('rightSidebar');
    if (rightSidebar) {
        rightSidebar.classList.remove('collapsed');
        rightSidebar.style.display = 'flex';
        rightSidebar.style.width = '48px';
        rightSidebar.style.minWidth = '48px';
        localStorage.setItem('rightSidebar_collapsed', 'false');
    }
    var detailMain = document.querySelector('.detail-main');
    if (detailMain) {
        var panel = document.createElement('div');
        panel.id = 'floatingToolPanel';
        panel.style.cssText = 'width:420px;min-width:350px;max-width:550px;height:100%;background:var(--panel-bg, rgba(255,255,255,0.98));backdrop-filter:blur(12px);border-left:1px solid var(--border-color, rgba(0,0,0,0.08));border-right:1px solid var(--border-color, rgba(0,0,0,0.08));display:flex;flex-direction:column;flex-shrink:0;overflow:hidden;z-index:10;transition:width 0.2s ease;box-shadow:-2px 0 12px rgba(0,0,0,0.08);';
        panel.innerHTML = renderCompactRelationPanel();
        var editor = document.querySelector('.detail-editor');
        if (editor && editor.nextSibling) {
            detailMain.insertBefore(panel, editor.nextSibling);
        } else {
            detailMain.appendChild(panel);
        }
        getRelationData();
        renderCompactRelationEntities();
        renderCompactRelationList();
        setTimeout(function() {
            initCompactRelationCanvas();
        }, 200);
        bindCompactRelationEvents();
    }
    setTimeout(function() {
        var toolItems = document.querySelectorAll('.sidebar-tool-item');
        toolItems.forEach(function(item) {
            if (item.getAttribute('data-tool') === tool) {
                item.style.background = 'rgba(0,122,255,0.15)';
                item.style.borderRadius = '8px';
                setTimeout(function() {
                    item.style.background = '';
                }, 1500);
            }
        });
    }, 200);
}

function closeRelationFloatingPanel() {
    var panel = document.getElementById('floatingToolPanel');
    if (panel) { panel.remove(); }
    var rightSidebar = document.getElementById('rightSidebar');
    if (rightSidebar) {
        rightSidebar.style.width = '48px';
        rightSidebar.style.minWidth = '48px';
    }
}

function renderCompactRelationPanel() {
    return `
        <div style="display:flex;flex-direction:column;height:100%;width:100%;">
            <div style="display:flex;justify-content:space-between;align-items:center;padding:6px 12px;border-bottom:1px solid var(--border-color, rgba(0,0,0,0.08));flex-shrink:0;">
                <span style="font-weight:600;font-size:13px;">🔗 关系图</span>
                <div style="display:flex;gap:3px;">
                    <button id="compactRelationAddBtn" title="新增实体" style="background:none;border:none;cursor:pointer;font-size:13px;padding:2px 6px;">➕</button>
                    <button id="compactRelationAddFolderBtn" title="新增分类" style="background:none;border:none;cursor:pointer;font-size:13px;padding:2px 6px;">📁</button>
                    <button id="compactRelationLinkBtn" title="建立关系" style="background:none;border:none;cursor:pointer;font-size:13px;padding:2px 6px;">🔗</button>
                    <button id="compactRelationExpandBtn" title="新窗口打开" style="background:none;border:none;cursor:pointer;font-size:13px;padding:2px 6px;">⤢</button>
                    <button id="compactRelationCloseBtn" title="关闭面板" style="background:none;border:none;cursor:pointer;font-size:13px;padding:2px 6px;">✕</button>
                </div>
            </div>
            <div style="display:flex;flex:1;overflow:hidden;">
                <div style="width:35%;min-width:100px;max-width:160px;border-right:1px solid var(--border-color, rgba(0,0,0,0.08));display:flex;flex-direction:column;overflow:hidden;">
                    <div style="padding:4px 6px;flex-shrink:0;">
                        <input type="text" id="outlineSearchInput" placeholder="搜索..." style="width:100%;padding:6px 10px 6px 32px;border:1px solid var(--border-color, #ddd);border-radius:6px;font-size:12px;background:var(--input-bg, #f8f8f8) url('icons/search.svg') no-repeat 8px center;background-size:16px 16px;color:var(--text-color, #333);">
                    </div>
                    <div id="compactRelationEntityList" style="flex:1;overflow-y:auto;padding:4px 4px;"></div>
                    <div id="compactRelationList" style="max-height:100px;overflow-y:auto;padding:4px 6px;border-top:1px solid var(--border-color, rgba(0,0,0,0.08));"></div>
                    <div style="padding:2px 6px;border-top:1px solid var(--border-color, rgba(0,0,0,0.08));font-size:9px;color:#888;display:flex;justify-content:space-between;flex-shrink:0;">
                        <span>👤<span id="compactRelationCharCount">0</span> 🏛️<span id="compactRelationFactionCount">0</span></span>
                        <span>🔗<span id="compactRelationRelCount">0</span></span>
                    </div>
                </div>
                <div style="flex:1;position:relative;overflow:hidden;background:#f8f8f8;min-width:120px;">
                    <canvas id="compactRelationCanvas" style="width:100%;height:100%;cursor:default;"></canvas>
                    <div style="position:absolute;bottom:6px;left:50%;transform:translateX(-50%);font-size:9px;color:#888;background:rgba(255,255,255,0.8);padding:2px 10px;border-radius:8px;white-space:nowrap;">
                        💡 拖拽 · 双击重命名
                    </div>
                </div>
            </div>
        </div>
    `;
}

var compactRelationCanvas = null;
var compactRelationCtx = null;
var compactDragEntityId = null;
var compactIsDragging = false;
var compactDragOffsetX = 0;
var compactDragOffsetY = 0;

function renderCompactRelationEntities() {
    var container = document.getElementById('compactRelationEntityList');
    if (!container) return;
    container.innerHTML = '';
    var chars = relationData.entities.filter(function(e) { return e.type === 'character'; });
    var factions = relationData.entities.filter(function(e) { return e.type === 'faction'; });
    function renderGroup(items, icon) {
        if (items.length === 0) return;
        items.forEach(function(entity) {
            var div = document.createElement('div');
            div.className = 'compact-relation-entity';
            div.style.cssText = 'display:flex;align-items:center;gap:4px;padding:2px 6px;margin:1px 0;border-radius:4px;cursor:pointer;transition:background 0.15s;font-size:11px;';
            if (relationData.selectedId === entity.id) {
                div.style.background = 'rgba(0,122,255,0.12)';
            }
            div.setAttribute('data-id', entity.id);
            div.innerHTML = '<span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:' + entity.color + ';flex-shrink:0;"></span>' +
                '<span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">' + entity.name + '</span>' +
                '<span style="font-size:8px;color:#888;">' + getRelationsForEntity(entity.id).length + '</span>';
            div.onclick = function() {
                selectCompactRelationEntity(entity.id);
            };
            container.appendChild(div);
        });
    }
    renderGroup(chars, '👤');
    renderGroup(factions, '🏛️');
    if (relationData.entities.length === 0) {
        container.innerHTML = '<div style="text-align:center;color:#888;padding:12px;font-size:11px;">暂无实体</div>';
    }
    updateCompactRelationCounts();
}

function renderCompactRelationList() {
    var container = document.getElementById('compactRelationList');
    if (!container) return;
    if (relationData.relations.length === 0) {
        container.innerHTML = '<div style="text-align:center;color:#888;padding:6px;font-size:10px;">暂无关系</div>';
        return;
    }
    container.innerHTML = '';
    relationData.relations.forEach(function(rel) {
        var from = getRelationEntity(rel.fromId);
        var to = getRelationEntity(rel.toId);
        if (!from || !to) return;
        var div = document.createElement('div');
        div.style.cssText = 'display:flex;align-items:center;gap:4px;padding:2px 4px;margin:1px 0;border-radius:3px;border-left:2px solid ' + (rel.color || '#888') + ';font-size:10px;background:rgba(0,0,0,0.02);';
        div.innerHTML =
            '<span style="font-weight:500;">' + from.name + '</span>' +
            '<span style="color:#888;">→</span>' +
            '<span style="font-weight:500;">' + to.name + '</span>' +
            '<span style="font-size:9px;color:#888;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">' + (rel.label || '关联') + '</span>' +
            '<button class="compact-delete-rel" data-id="' + rel.id + '" style="background:none;border:none;color:#dc3545;cursor:pointer;font-size:10px;">✕</button>';
        container.appendChild(div);
    });
    container.querySelectorAll('.compact-delete-rel').forEach(function(btn) {
        btn.onclick = function() {
            var id = this.getAttribute('data-id');
            if (confirm('确定删除这个关系吗？')) {
                relationData.relations = relationData.relations.filter(function(r) { return r.id !== id; });
                saveRelationData();
                renderCompactRelationEntities();
                renderCompactRelationList();
                renderCompactRelationCanvas();
            }
        };
    });
}

function selectCompactRelationEntity(id) {
    relationData.selectedId = id;
    saveRelationData();
    renderCompactRelationEntities();
    renderCompactRelationList();
    renderCompactRelationCanvas();
}

function updateCompactRelationCounts() {
    var chars = relationData.entities.filter(function(e) { return e.type === 'character' });
    var factions = relationData.entities.filter(function(e) { return e.type === 'faction' });
    var charEl = document.getElementById('compactRelationCharCount');
    var factionEl = document.getElementById('compactRelationFactionCount');
    var relEl = document.getElementById('compactRelationRelCount');
    if (charEl) charEl.textContent = chars.length;
    if (factionEl) factionEl.textContent = factions.length;
    if (relEl) relEl.textContent = relationData.relations.length;
}

function initCompactRelationCanvas() {
    compactRelationCanvas = document.getElementById('compactRelationCanvas');
    if (!compactRelationCanvas) return;
    compactRelationCtx = compactRelationCanvas.getContext('2d');
    resizeCompactRelationCanvas();
    renderCompactRelationCanvas();
    compactRelationCanvas.addEventListener('mousedown', onCompactRelationMouseDown);
    compactRelationCanvas.addEventListener('mousemove', onCompactRelationMouseMove);
    compactRelationCanvas.addEventListener('mouseup', onCompactRelationMouseUp);
    compactRelationCanvas.addEventListener('dblclick', onCompactRelationDblClick);
}

function resizeCompactRelationCanvas() {
    if (!compactRelationCanvas) return;
    var container = compactRelationCanvas.parentElement;
    compactRelationCanvas.width = container.clientWidth;
    compactRelationCanvas.height = container.clientHeight;
}

function renderCompactRelationCanvas() {
    if (!compactRelationCtx) return;
    var w = compactRelationCanvas.width;
    var h = compactRelationCanvas.height;
    compactRelationCtx.clearRect(0, 0, w, h);
    relationData.relations.forEach(function(rel) {
        var from = getRelationEntity(rel.fromId);
        var to = getRelationEntity(rel.toId);
        if (!from || !to) return;
        var scale = 1;
        compactRelationCtx.beginPath();
        compactRelationCtx.moveTo(from.x * scale, from.y * scale);
        compactRelationCtx.lineTo(to.x * scale, to.y * scale);
        compactRelationCtx.strokeStyle = rel.color || '#888';
        compactRelationCtx.lineWidth = 1.5;
        compactRelationCtx.setLineDash([4, 4]);
        compactRelationCtx.stroke();
        compactRelationCtx.setLineDash([]);
        var midX = (from.x + to.x) / 2 * scale;
        var midY = (from.y + to.y) / 2 * scale;
        compactRelationCtx.fillStyle = '#666';
        compactRelationCtx.font = '9px sans-serif';
        compactRelationCtx.textAlign = 'center';
        compactRelationCtx.textBaseline = 'bottom';
        compactRelationCtx.fillText(rel.label || '', midX, midY - 3);
    });
    relationData.entities.forEach(function(entity) {
        var isSelected = entity.id === relationData.selectedId;
        var radius = isSelected ? 22 : 18;
        var scale = 1;
        var x = entity.x * scale;
        var y = entity.y * scale;
        compactRelationCtx.shadowColor = 'rgba(0,0,0,0.08)';
        compactRelationCtx.shadowBlur = 6;
        compactRelationCtx.shadowOffsetY = 1;
        var grad = compactRelationCtx.createRadialGradient(x - 4, y - 4, 0, x, y, radius);
        grad.addColorStop(0, lightenColor(entity.color, 40));
        grad.addColorStop(1, entity.color);
        compactRelationCtx.beginPath();
        compactRelationCtx.arc(x, y, radius, 0, Math.PI * 2);
        compactRelationCtx.fillStyle = grad;
        compactRelationCtx.fill();
        compactRelationCtx.shadowBlur = 0;
        compactRelationCtx.strokeStyle = isSelected ? '#007aff' : 'rgba(255,255,255,0.5)';
        compactRelationCtx.lineWidth = isSelected ? 2 : 1;
        compactRelationCtx.stroke();
        compactRelationCtx.fillStyle = '#fff';
        compactRelationCtx.font = (isSelected ? 'bold ' : '') + '10px sans-serif';
        compactRelationCtx.textAlign = 'center';
        compactRelationCtx.textBaseline = 'middle';
        compactRelationCtx.fillText(entity.name, x, y);
    });
}

function onCompactRelationMouseDown(e) {
    var rect = compactRelationCanvas.getBoundingClientRect();
    var x = (e.clientX - rect.left) / (rect.width / compactRelationCanvas.width);
    var y = (e.clientY - rect.top) / (rect.height / compactRelationCanvas.height);
    for (var i = relationData.entities.length - 1; i >= 0; i--) {
        var entity = relationData.entities[i];
        var dx = x - entity.x;
        var dy = y - entity.y;
        if (Math.sqrt(dx * dx + dy * dy) < 22) {
            compactDragEntityId = entity.id;
            compactIsDragging = true;
            compactDragOffsetX = x - entity.x;
            compactDragOffsetY = y - entity.y;
            relationData.selectedId = entity.id;
            saveRelationData();
            renderCompactRelationEntities();
            renderCompactRelationList();
            renderCompactRelationCanvas();
            return;
        }
    }
}

function onCompactRelationMouseMove(e) {
    if (!compactIsDragging || !compactDragEntityId) return;
    var rect = compactRelationCanvas.getBoundingClientRect();
    var x = (e.clientX - rect.left) / (rect.width / compactRelationCanvas.width);
    var y = (e.clientY - rect.top) / (rect.height / compactRelationCanvas.height);
    var entity = getRelationEntity(compactDragEntityId);
    if (entity) {
        entity.x = Math.max(20, Math.min(compactRelationCanvas.width - 20, x - compactDragOffsetX));
        entity.y = Math.max(20, Math.min(compactRelationCanvas.height - 20, y - compactDragOffsetY));
        renderCompactRelationCanvas();
    }
}

function onCompactRelationMouseUp() {
    if (compactIsDragging && compactDragEntityId) {
        saveRelationData();
    }
    compactIsDragging = false;
    compactDragEntityId = null;
}

function onCompactRelationDblClick(e) {
    var rect = compactRelationCanvas.getBoundingClientRect();
    var x = (e.clientX - rect.left) / (rect.width / compactRelationCanvas.width);
    var y = (e.clientY - rect.top) / (rect.height / compactRelationCanvas.height);
    for (var i = relationData.entities.length - 1; i >= 0; i--) {
        var entity = relationData.entities[i];
        var dx = x - entity.x;
        var dy = y - entity.y;
        if (Math.sqrt(dx * dx + dy * dy) < 22) {
            renameRelationEntity();
            renderCompactRelationEntities();
            renderCompactRelationList();
            renderCompactRelationCanvas();
            return;
        }
    }
}

function bindCompactRelationEvents() {
    var addBtn = document.getElementById('compactRelationAddBtn');
    if (addBtn) {
        addBtn.onclick = function() {
            addRelationEntity();
            renderCompactRelationEntities();
            renderCompactRelationList();
            renderCompactRelationCanvas();
        };
    }
    var addFolderBtn = document.getElementById('compactRelationAddFolderBtn');
    if (addFolderBtn) {
        addFolderBtn.onclick = function() {
            addRelationFolder();
            renderCompactRelationEntities();
            renderCompactRelationList();
            renderCompactRelationCanvas();
        };
    }
    var linkBtn = document.getElementById('compactRelationLinkBtn');
    if (linkBtn) {
        linkBtn.onclick = function() {
            openRelationForm();
            // 弹窗关闭后刷新
            var checkInterval = setInterval(function() {
                if (!document.getElementById('relationFormModal')) {
                    clearInterval(checkInterval);
                    renderCompactRelationEntities();
                    renderCompactRelationList();
                    renderCompactRelationCanvas();
                }
            }, 200);
        };
    }
    var expandBtn = document.getElementById('compactRelationExpandBtn');
    if (expandBtn) {
        expandBtn.onclick = function() {
            openRelationInNewWindow();
        };
    }
    var closeBtn = document.getElementById('compactRelationCloseBtn');
    if (closeBtn) {
        closeBtn.onclick = function() {
            closeRelationFloatingPanel();
            var rightSidebar = document.getElementById('rightSidebar');
            if (rightSidebar) {
                rightSidebar.style.width = '48px';
                rightSidebar.style.minWidth = '48px';
            }
        };
    }
    var searchInput = document.getElementById('compactRelationSearch');
    if (searchInput) {
        searchInput.oninput = function() {
            var keyword = this.value.trim().toLowerCase();
            var items = document.querySelectorAll('.compact-relation-entity');
            items.forEach(function(item) {
                var name = item.textContent.toLowerCase();
                item.style.display = name.indexOf(keyword) !== -1 ? 'flex' : 'none';
            });
        };
    }
    window.addEventListener('resize', function() {
        resizeCompactRelationCanvas();
        renderCompactRelationCanvas();
    });
}

// ========== 新窗口打开 ==========

function openRelationInNewWindow() {
    closeRelationFloatingPanel();
    var html = `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>🔗 关系图 - 全屏编辑</title>
<style>
* { margin:0; padding:0; box-sizing:border-box; }
body { font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif; background:#f0f2f5; height:100vh; overflow:hidden; }
.relation-container { display:flex; height:100vh; width:100%; }
.relation-sidebar { width:280px; min-width:200px; max-width:350px; background:rgba(255,255,255,0.95); backdrop-filter:blur(8px); border-right:1px solid rgba(0,0,0,0.08); display:flex; flex-direction:column; flex-shrink:0; overflow:hidden; }
.relation-sidebar-header { display:flex; justify-content:space-between; align-items:center; padding:12px 16px; background:rgba(0,0,0,0.03); border-bottom:1px solid rgba(0,0,0,0.08); flex-shrink:0; }
.relation-sidebar-header span { font-weight:600; font-size:15px; }
.relation-sidebar-header button { background:none; border:none; cursor:pointer; font-size:16px; padding:0 4px; }
.relation-search { padding:8px 12px; flex-shrink:0; }
.relation-search input { width:100%; padding:6px 10px; border:1px solid #ddd; border-radius:6px; font-size:13px; background:#f8f8f8; }
.relation-stats { padding:0 12px 6px 12px; font-size:12px; color:#888; display:flex; gap:16px; flex-shrink:0; }
#winEntityList { flex:1; overflow-y:auto; padding:6px 12px; }
#winRelationList { max-height:180px; overflow-y:auto; padding:6px 12px; border-top:1px solid rgba(0,0,0,0.08); }
.relation-entity-item { display:flex; align-items:center; gap:8px; padding:5px 10px; margin:2px 0; border-radius:6px; cursor:pointer; transition:background 0.15s; font-size:13px; }
.relation-entity-item:hover { background:rgba(0,0,0,0.05); }
.relation-entity-item.active { background:rgba(0,122,255,0.12); }
.relation-item { display:flex; align-items:center; gap:8px; padding:4px 10px; margin:2px 0; border-radius:4px; font-size:12px; background:rgba(0,0,0,0.02); }
.relation-canvas-wrapper { flex:1; background:#f8f8f8; overflow:hidden; position:relative; }
.relation-canvas-wrapper canvas { width:100%; height:100%; cursor:default; }
.canvas-tip { position:absolute; bottom:12px; left:50%; transform:translateX(-50%); font-size:11px; color:#888; background:rgba(255,255,255,0.8); padding:4px 14px; border-radius:12px; white-space:nowrap; }
</style>
</head>
<body>
<div class="relation-container">
<div class="relation-sidebar">
<div class="relation-sidebar-header">
<span>🔗 关系图谱</span>
<div>
<button id="winAddEntity" title="新增实体">➕</button>
<button id="winAddFolder" title="新增分类">📁</button>
<button id="winAddRelation" title="建立关系">🔗</button>
<button id="winDelete" title="删除">🗑</button>
<button id="winRefresh" title="刷新">🔄</button>
</div>
</div>
<div class="relation-search"><input type="text" id="winSearch" placeholder="🔍 搜索..."></div>
<div class="relation-stats"><span>👤 <span id="winCharCount">0</span></span><span>🏛️ <span id="winFactionCount">0</span></span><span>🔗 <span id="winRelCount">0</span></span></div>
<div id="winEntityList"></div>
<div id="winRelationList"></div>
</div>
<div class="relation-canvas-wrapper">
<canvas id="winRelationCanvas"></canvas>
<div class="canvas-tip">💡 拖拽移动 · 双击重命名 · 点击选择</div>
</div>
</div>
<script>
var relationData = ${JSON.stringify(relationData)};
var currentBookId = ${currentBookId || 'null'};
var selectedId = ${relationData.selectedId ? JSON.stringify(relationData.selectedId) : 'null'};

function getRelationEntity(id) { return relationData.entities.find(function(e) { return e.id === id; }); }
function getRelationsForEntity(id) { return relationData.relations.filter(function(r) { return r.fromId === id || r.toId === id; }); }
function saveRelationData() {
    var key = 'openwrite_relation_' + (currentBookId || 'global');
    var data = { entities: relationData.entities, relations: relationData.relations, selectedId: selectedId, nextId: relationData.nextId || 100 };
    localStorage.setItem(key, JSON.stringify(data));
    if (window.opener && window.opener.window) { try { window.opener.window.location.reload(); } catch(e) {} }
}
function selectEntity(id) { selectedId = id; saveRelationData(); renderEntities(); renderRelations(); renderCanvas(); }

function renderEntities() {
    var container = document.getElementById('winEntityList');
    if (!container) return;
    container.innerHTML = '';
    var chars = relationData.entities.filter(function(e) { return e.type === 'character'; });
    var factions = relationData.entities.filter(function(e) { return e.type === 'faction'; });
    function renderGroup(items) {
        items.forEach(function(entity) {
            var div = document.createElement('div');
            div.className = 'relation-entity-item';
            if (selectedId === entity.id) div.classList.add('active');
            div.setAttribute('data-id', entity.id);
            div.innerHTML = '<span style="display:inline-block;width:12px;height:12px;border-radius:50%;background:' + entity.color + ';flex-shrink:0;"></span>' +
                '<span style="flex:1;">' + entity.name + '</span>' +
                '<span style="font-size:10px;color:#888;">' + getRelationsForEntity(entity.id).length + ' 关系</span>';
            div.onclick = function() { selectEntity(entity.id); };
            container.appendChild(div);
        });
    }
    renderGroup(chars);
    renderGroup(factions);
    if (relationData.entities.length === 0) {
        container.innerHTML = '<div style="text-align:center;color:#888;padding:20px;">暂无实体</div>';
    }
    updateCounts();
}
function renderRelations() {
    var container = document.getElementById('winRelationList');
    if (!container) return;
    if (relationData.relations.length === 0) { container.innerHTML = '<div style="text-align:center;color:#888;padding:12px;font-size:12px;">暂无关系</div>'; return; }
    container.innerHTML = '';
    relationData.relations.forEach(function(rel) {
        var from = getRelationEntity(rel.fromId);
        var to = getRelationEntity(rel.toId);
        if (!from || !to) return;
        var div = document.createElement('div');
        div.className = 'relation-item';
        div.style.borderLeft = '3px solid ' + (rel.color || '#888');
        div.innerHTML =
            '<span style="font-weight:500;">' + from.name + '</span>' +
            '<span style="color:#888;">→</span>' +
            '<span style="font-weight:500;">' + to.name + '</span>' +
            '<span style="font-size:11px;color:#888;flex:1;">' + (rel.label || '关联') + '</span>' +
            '<button class="del-rel" data-id="' + rel.id + '" style="background:none;border:none;color:#dc3545;cursor:pointer;font-size:13px;">✕</button>';
        container.appendChild(div);
    });
    container.querySelectorAll('.del-rel').forEach(function(btn) {
        btn.onclick = function() {
            var id = this.getAttribute('data-id');
            if (confirm('确定删除这个关系吗？')) {
                relationData.relations = relationData.relations.filter(function(r) { return r.id !== id; });
                saveRelationData();
                renderEntities();
                renderRelations();
                renderCanvas();
            }
        };
    });
}
function updateCounts() {
    var chars = relationData.entities.filter(function(e) { return e.type === 'character'; });
    var factions = relationData.entities.filter(function(e) { return e.type === 'faction'; });
    document.getElementById('winCharCount').textContent = chars.length;
    document.getElementById('winFactionCount').textContent = factions.length;
    document.getElementById('winRelCount').textContent = relationData.relations.length;
}

var canvas, ctx, dragId, isDragging, offX, offY;
function initCanvas() {
    canvas = document.getElementById('winRelationCanvas');
    if (!canvas) return;
    ctx = canvas.getContext('2d');
    resizeCanvas();
    renderCanvas();
    canvas.addEventListener('mousedown', onMouseDown);
    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('mouseup', onMouseUp);
    canvas.addEventListener('dblclick', onDblClick);
    window.addEventListener('resize', function() { resizeCanvas(); renderCanvas(); });
}
function resizeCanvas() {
    var container = canvas.parentElement;
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
}
function renderCanvas() {
    if (!ctx) return;
    var w = canvas.width, h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    relationData.relations.forEach(function(rel) {
        var from = getRelationEntity(rel.fromId);
        var to = getRelationEntity(rel.toId);
        if (!from || !to) return;
        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);
        ctx.strokeStyle = rel.color || '#888';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.stroke();
        ctx.setLineDash([]);
        var midX = (from.x + to.x) / 2, midY = (from.y + to.y) / 2;
        ctx.fillStyle = '#666';
        ctx.font = '11px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText(rel.label || '', midX, midY - 4);
    });
    relationData.entities.forEach(function(entity) {
        var isSelected = entity.id === selectedId;
        var radius = isSelected ? 30 : 24;
        ctx.shadowColor = 'rgba(0,0,0,0.1)';
        ctx.shadowBlur = 8;
        ctx.shadowOffsetY = 2;
        var grad = ctx.createRadialGradient(entity.x - 6, entity.y - 6, 0, entity.x, entity.y, radius);
        grad.addColorStop(0, lightenColor(entity.color, 40));
        grad.addColorStop(1, entity.color);
        ctx.beginPath();
        ctx.arc(entity.x, entity.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.strokeStyle = isSelected ? '#007aff' : 'rgba(255,255,255,0.5)';
        ctx.lineWidth = isSelected ? 3 : 1.5;
        ctx.stroke();
        ctx.fillStyle = '#fff';
        ctx.font = isSelected ? 'bold 13px sans-serif' : '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(entity.name, entity.x, entity.y);
        ctx.font = '14px sans-serif';
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.fillText(entity.type === 'character' ? '👤' : '🏛️', entity.x, entity.y - radius - 14);
    });
}
function lightenColor(color, percent) {
    var num = parseInt(color.replace('#',''),16);
    var amt = Math.round(2.55 * percent);
    var R = Math.min(255,(num>>16)+amt);
    var G = Math.min(255,((num>>8)&0x00FF)+amt);
    var B = Math.min(255,(num&0x0000FF)+amt);
    return '#'+(0x1000000+R*0x10000+G*0x100+B).toString(16).slice(1);
}
function onMouseDown(e) {
    var rect = canvas.getBoundingClientRect();
    var x = e.clientX - rect.left, y = e.clientY - rect.top;
    for (var i=relationData.entities.length-1; i>=0; i--) {
        var entity = relationData.entities[i];
        if (Math.sqrt((x-entity.x)*(x-entity.x)+(y-entity.y)*(y-entity.y)) < 28) {
            dragId = entity.id; isDragging = true;
            offX = x - entity.x; offY = y - entity.y;
            selectedId = entity.id;
            saveRelationData();
            renderEntities();
            renderRelations();
            renderCanvas();
            return;
        }
    }
}
function onMouseMove(e) {
    if (!isDragging || !dragId) return;
    var rect = canvas.getBoundingClientRect();
    var x = e.clientX - rect.left, y = e.clientY - rect.top;
    var entity = getRelationEntity(dragId);
    if (entity) {
        entity.x = Math.max(30, Math.min(canvas.width-30, x - offX));
        entity.y = Math.max(30, Math.min(canvas.height-30, y - offY));
        renderCanvas();
    }
}
function onMouseUp() { if (isDragging && dragId) saveRelationData(); isDragging = false; dragId = null; }
function onDblClick(e) {
    var rect = canvas.getBoundingClientRect();
    var x = e.clientX - rect.left, y = e.clientY - rect.top;
    for (var i=relationData.entities.length-1; i>=0; i--) {
        var entity = relationData.entities[i];
        if (Math.sqrt((x-entity.x)*(x-entity.x)+(y-entity.y)*(y-entity.y)) < 28) {
            var newName = prompt('重命名：', entity.name);
            if (newName && newName.trim()) { entity.name = newName.trim(); saveRelationData(); renderEntities(); renderRelations(); renderCanvas(); }
            return;
        }
    }
}

function addEntity() {
    var type = confirm('点击"确定"添加人物，点击"取消"添加势力') ? 'character' : 'faction';
    var typeName = type === 'character' ? '人物' : '势力';
    var name = prompt('请输入' + typeName + '名称：', type === 'character' ? '新角色' : '新势力');
    if (!name || !name.trim()) return;
    var colors = ['#4A90D9','#E87A90','#27AE60','#E67E22','#8E44AD','#2ECC71','#E74C3C','#1ABC9C'];
    var color = colors[relationData.entities.length % colors.length];
    var newEntity = { id: 'ent_' + (relationData.nextId || 100), name: name.trim(), type: type, color: color, x: 200 + Math.random()*300, y: 100 + Math.random()*300 };
    relationData.nextId = (relationData.nextId || 100) + 1;
    relationData.entities.push(newEntity);
    selectedId = newEntity.id;
    saveRelationData();
    renderEntities(); renderRelations(); renderCanvas();
}
function addFolder() {
    var name = prompt('请输入分类名称：', '新分类');
    if (!name || !name.trim()) return;
    var colors = ['#4A90D9','#E87A90','#27AE60','#E67E22','#8E44AD','#2ECC71','#E74C3C','#1ABC9C'];
    var color = colors[relationData.entities.length % colors.length];
    var newEntity = { id: 'ent_' + (relationData.nextId || 100), name: name.trim(), type: 'faction', color: color, x: 200 + Math.random()*300, y: 100 + Math.random()*300 };
    relationData.nextId = (relationData.nextId || 100) + 1;
    relationData.entities.push(newEntity);
    selectedId = newEntity.id;
    saveRelationData();
    renderEntities(); renderRelations(); renderCanvas();
}
function addRelation() {
    var modal = document.createElement('div');
    modal.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.4);z-index:20000;display:flex;align-items:center;justify-content:center;';
    var fromOpts = '', toOpts = '';
    relationData.entities.forEach(function(e) {
        var opt = '<option value="' + e.id + '">' + (e.type === 'character' ? '👤' : '🏛️') + ' ' + e.name + '</option>';
        fromOpts += opt; toOpts += opt;
    });
    modal.innerHTML = '<div style="background:#fff;border-radius:12px;padding:24px;width:360px;box-shadow:0 4px 20px rgba(0,0,0,0.2);">' +
        '<h3 style="margin:0 0 16px 0;">🔗 建立关系</h3>' +
        '<div style="margin-bottom:12px;"><label style="display:block;margin-bottom:4px;font-size:13px;color:#666;">源实体</label><select id="relFrom" style="width:100%;padding:8px;border-radius:6px;border:1px solid #ddd;">' + fromOpts + '</select></div>' +
        '<div style="margin-bottom:12px;"><label style="display:block;margin-bottom:4px;font-size:13px;color:#666;">目标实体</label><select id="relTo" style="width:100%;padding:8px;border-radius:6px;border:1px solid #ddd;">' + toOpts + '</select></div>' +
        '<div style="margin-bottom:16px;"><label style="display:block;margin-bottom:4px;font-size:13px;color:#666;">关系描述</label><input type="text" id="relLabel" placeholder="如：师徒、盟友、敌对" style="width:100%;padding:8px;border-radius:6px;border:1px solid #ddd;"></div>' +
        '<div style="display:flex;gap:12px;justify-content:flex-end;"><button id="relCancel" style="padding:8px 16px;background:#6c757d;color:white;border:none;border-radius:6px;cursor:pointer;">取消</button><button id="relConfirm" style="padding:8px 16px;background:#007aff;color:white;border:none;border-radius:6px;cursor:pointer;">建立</button></div></div>';
    document.body.appendChild(modal);
    document.getElementById('relCancel').onclick = function() { modal.remove(); };
    document.getElementById('relConfirm').onclick = function() {
        var fromId = document.getElementById('relFrom').value;
        var toId = document.getElementById('relTo').value;
        var label = document.getElementById('relLabel').value.trim() || '关联';
        if (!fromId || !toId) { alert('请选择源和目标实体'); return; }
        if (fromId === toId) { alert('不能与自己建立关系'); return; }
        if (relationData.relations.some(function(r) { return r.fromId === fromId && r.toId === toId; })) { alert('关系已存在'); return; }
        var colors = ['#E74C3C','#27AE60','#F39C12','#8E44AD','#2ECC71','#E67E22'];
        var newRel = { id: 'rel_' + (relationData.nextId || 100), fromId: fromId, toId: toId, label: label, color: colors[relationData.relations.length % colors.length] };
        relationData.nextId = (relationData.nextId || 100) + 1;
        relationData.relations.push(newRel);
        saveRelationData();
        renderEntities(); renderRelations(); renderCanvas();
        modal.remove();
    };
}
function deleteEntity() {
    var entity = getRelationEntity(selectedId);
    if (!entity) return;
    if (relationData.entities.length === 1) { alert('至少保留一个实体'); return; }
    if (confirm('确定删除「' + entity.name + '」及其所有关系吗？')) {
        relationData.relations = relationData.relations.filter(function(r) { return r.fromId !== entity.id && r.toId !== entity.id; });
        relationData.entities = relationData.entities.filter(function(e) { return e.id !== entity.id; });
        selectedId = relationData.entities.length > 0 ? relationData.entities[0].id : null;
        saveRelationData();
        renderEntities(); renderRelations(); renderCanvas();
    }
}

document.getElementById('winAddEntity').onclick = addEntity;
document.getElementById('winAddFolder').onclick = addFolder;
document.getElementById('winAddRelation').onclick = addRelation;
document.getElementById('winDelete').onclick = deleteEntity;
document.getElementById('winRefresh').onclick = function() { renderEntities(); renderRelations(); renderCanvas(); };
document.getElementById('winSearch').oninput = function() {
    var keyword = this.value.trim().toLowerCase();
    var items = document.querySelectorAll('.relation-entity-item');
    items.forEach(function(item) {
        var name = item.textContent.toLowerCase();
        item.style.display = name.indexOf(keyword) !== -1 ? 'flex' : 'none';
    });
};
renderEntities(); renderRelations(); initCanvas();
console.log('关系图窗口已打开');
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

// ========== 右侧边栏入口绑定 ==========

function bindRelationToolEntry() {
    var relationTool = document.querySelector('.sidebar-tool-item[data-tool="relation"]');
    if (relationTool) {
        relationTool.onclick = function() {
            var existingPanel = document.getElementById('floatingToolPanel');
            if (existingPanel) {
                closeRelationFloatingPanel();
                var toolItems = document.querySelectorAll('.sidebar-tool-item');
                toolItems.forEach(function(item) {
                    if (item.getAttribute('data-tool') === 'relation') {
                        item.style.background = '';
                    }
                });
            } else {
                openRelationSidebar('relation');
            }
        };
    }
}

// ========== 导出 ==========

window.openRelationPanel = openRelationPanel;
window.closeRelationPanel = closeRelationPanel;
window.openRelationSidebar = openRelationSidebar;
window.closeRelationFloatingPanel = closeRelationFloatingPanel;
window.openRelationInNewWindow = openRelationInNewWindow;
window.relationData = relationData;
window.getRelationData = getRelationData;
window.saveRelationData = saveRelationData;
window.renderRelationEntities = renderRelationEntities;
window.renderRelationList = renderRelationList;
window.renderRelationCanvas = renderRelationCanvas;
window.addRelationEntity = addRelationEntity;
window.addRelationFolder = addRelationFolder;
window.deleteRelationEntity = deleteRelationEntity;
window.renameRelationEntity = renameRelationEntity;
window.selectRelationEntity = selectRelationEntity;
window.getRelationEntity = getRelationEntity;
window.getRelationsForEntity = getRelationsForEntity;
window.renderCompactRelationEntities = renderCompactRelationEntities;
window.renderCompactRelationList = renderCompactRelationList;
window.renderCompactRelationCanvas = renderCompactRelationCanvas;
window.bindRelationToolEntry = bindRelationToolEntry;

console.log('关系图工具已加载');
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(bindRelationToolEntry, 500);
});