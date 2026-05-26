// ========== 江湖模块 - 外部链接管理 ==========

var jianghuGroups = [];
var jianghuItems = [];

function getDefaultGroups() {
    return [{ id: 'default', name: '默认分组', icon: '📁' }];
}

function getDefaultItems() {
    return [
        { id: 1, groupId: 'default', title: 'GitHub', url: 'https://github.com/likeweixue/OpenWrite', desc: '查看源码与反馈', icon: '🐙' },
        { id: 2, groupId: 'default', title: 'QQ交流群', url: 'https://qm.qq.com/q/69uBoYdjmE', desc: '群号: 1095036654', icon: '💬' },
        { id: 3, groupId: 'default', title: '邮箱反馈', url: 'mailto:likeweixue@qq.com', desc: 'likeweixue@qq.com', icon: '📧' },
        { id: 4, groupId: 'default', title: '写作帮手官网', url: 'https://openwrite.team', desc: '官方网站', icon: '🌐' },
        { id: 5, groupId: 'default', title: '建议反馈', url: 'https://github.com/likeweixue/OpenWrite/issues', desc: '提交建议和问题', icon: '💡' },
        { id: 6, groupId: 'default', title: '微信输入法', url: 'https://z.weixin.qq.com', desc: '微信键盘', icon: '⌨️' },
        { id: 7, groupId: 'default', title: '手心输入法', url: 'https://www.xinshuru.com', desc: '手心输入法', icon: '⌨️' },
        { id: 8, groupId: 'default', title: '豆包输入法', url: 'https://shurufa.doubao.com/pc', desc: '豆包输入法', icon: '⌨️' },
        { id: 9, groupId: 'default', title: '谷歌浏览器', url: 'https://www.google.cn/chrome', desc: 'Chrome浏览器', icon: '🌐' },
        { id: 10, groupId: 'default', title: '微软浏览器', url: 'https://www.microsoft.com/zh-cn/edge/download', desc: 'Edge浏览器', icon: '🌐' },
        { id: 11, groupId: 'default', title: '在线地图生成', url: 'https://www.8desk.top', desc: '地图生成工具', icon: '🗺️' },
        { id: 12, groupId: 'default', title: '起点萌新交流群', url: 'https://qm.qq.com/q/F8A4wBYPYY', desc: '群号: 660783010', icon: '💬' },
        { id: 13, groupId: 'default', title: '起源小说交流群1', url: 'https://qm.qq.com/q/JncPDkywkk', desc: '群号: 834927072', icon: '💬' },
        { id: 14, groupId: 'default', title: '起源小说交流群2', url: 'https://qm.qq.com/q/5F5jsubt3G', desc: '群号: 947399218', icon: '💬' },
        { id: 15, groupId: 'default', title: '云深不知处', url: 'https://bbs.ysbzc.cn', desc: '网文论坛', icon: '📚' },
        { id: 16, groupId: 'default', title: '百花深处', url: 'https://www.baihua365.com', desc: '网文论坛', icon: '📚' },
        { id: 17, groupId: 'default', title: '百合会', url: 'https://bbs.yamibo.com/forum.php', desc: '网文论坛', icon: '📚' },
        { id: 18, groupId: 'default', title: '慕雪阁', url: 'https://bbs.muxuege.com', desc: '网文论坛', icon: '📚' },
        { id: 19, groupId: 'default', title: '晋江论坛', url: 'https://bbs.jjwxc.net', desc: '网文论坛', icon: '📚' },
        { id: 20, groupId: 'default', title: '阡陌居', url: 'https://www.1000qm.vip', desc: '网文论坛', icon: '📚' },
        { id: 21, groupId: 'default', title: '龙的天空', url: 'https://www.lkong.com/forum/2349', desc: '网文论坛', icon: '📚' },
        { id: 22, groupId: 'default', title: '水云间', url: 'https://www.ishuiyunjian.com/', desc: '网文论坛', icon: '📚' },
        { id: 23, groupId: 'default', title: '花开忘忧', url: 'http://fengruhua.cn/', desc: '网文论坛', icon: '📚' },
        { id: 24, groupId: 'default', title: '转角论坛', url: 'http://bbs.zjiao.net/', desc: '网文论坛', icon: '📚' },
        { id: 25, groupId: 'default', title: '作家助手', url: 'https://write.qq.com', desc: '写作软件', icon: '✍️' },
        { id: 26, groupId: 'default', title: '好好码字', url: 'https://haohaomazi.com', desc: '写作软件', icon: '✍️' },
        { id: 27, groupId: 'default', title: '橙瓜码字', url: 'https://mz.chenggua.com', desc: '写作软件', icon: '✍️' },
        { id: 28, groupId: 'default', title: '我要码字', url: 'https://github.com/xiaoshengxianjun/51mazi', desc: '写作软件', icon: '✍️' },
        { id: 29, groupId: 'default', title: '写作天下', url: 'https://web.writerfly.cn', desc: '写作软件', icon: '✍️' },
        { id: 30, groupId: 'default', title: '小密圈写作', url: 'https://gitee.com/jeasonchen/small-dense-circle-writing', desc: '写作软件', icon: '✍️' },
        { id: 31, groupId: 'default', title: '柚子写作', url: 'https://gitee.com/vic-gao/Youzi-Write', desc: '写作软件', icon: '✍️' },
        { id: 32, groupId: 'default', title: '云上写作', url: 'http://www.yunshangxiezuo.com/web/', desc: '写作软件', icon: '✍️' },
        { id: 33, groupId: 'default', title: '云卢写作', url: 'https://www.yunlu.co/', desc: '写作软件', icon: '✍️' },
        { id: 34, groupId: 'default', title: 'WPS Office', url: 'https://www.wps.cn/', desc: '办公软件', icon: '📄' },
        { id: 35, groupId: 'default', title: 'OnlyOffice', url: 'https://onlyoffice.com', desc: '办公软件', icon: '📄' },
        { id: 36, groupId: 'default', title: 'OpenOffice', url: 'https://openoffice.org', desc: '办公软件', icon: '📄' },
        { id: 37, groupId: 'default', title: '起源小说-抹茶投稿', url: 'mailto:3667211310@qq.com', desc: '长篇男频投稿', icon: '📧' }
    ];
}

function loadJianghuData() {
    var savedGroups = localStorage.getItem('openwrite_jianghu_groups');
    var savedItems = localStorage.getItem('openwrite_jianghu_items');
    
    if (savedGroups) {
        try { jianghuGroups = JSON.parse(savedGroups); } catch(e) {}
    }
    if (savedItems) {
        try { jianghuItems = JSON.parse(savedItems); } catch(e) {}
    }
    
    if (!jianghuGroups || jianghuGroups.length === 0) {
        jianghuGroups = getDefaultGroups();
    }
    if (!jianghuItems || jianghuItems.length === 0) {
        jianghuItems = getDefaultItems();
    }
}

function saveJianghuData() {
    localStorage.setItem('openwrite_jianghu_groups', JSON.stringify(jianghuGroups));
    localStorage.setItem('openwrite_jianghu_items', JSON.stringify(jianghuItems));
}

function exportJianghuData() {
    var data = { groups: jianghuGroups, items: jianghuItems, exportTime: new Date().toISOString() };
    var blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'openwrite_jianghu_backup.json';
    a.click();
    URL.revokeObjectURL(url);
    alert('江湖数据已导出');
}

function importJianghuData(file) {
    var reader = new FileReader();
    reader.onload = function(e) {
        try {
            var data = JSON.parse(e.target.result);
            if (data.groups) jianghuGroups = data.groups;
            if (data.items) jianghuItems = data.items;
            saveJianghuData();
            renderJianghuPage();
            alert('数据导入成功');
        } catch(err) {
            alert('文件格式错误');
        }
    };
    reader.readAsText(file);
}

function renderJianghuPage() {
    var container = document.getElementById('jianghuContainer');
    if (!container) {
        console.log('jianghuContainer not found');
        return;
    }
    
    loadJianghuData();
    
    var html = `
        <div style="padding:60px 20px 20px 20px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; flex-wrap:wrap; gap:12px;">
                <h2 style="margin:0;">江湖</h2>
                <div style="display:flex; gap:12px;">
                    <button id="jhNewGroupBtn" class="btn-secondary" style="background:#6c757d;">+ 新建分组</button>
                    <button id="jhNewItemBtn" class="btn-primary" style="background:#007aff;">+ 新建链接</button>
                    <button id="jhExportBtn" class="btn-secondary" style="background:#28a745;">📤 导出数据</button>
                    <button id="jhImportBtn" class="btn-secondary" style="background:#ffc107; color:#333;">📥 导入数据</button>
                </div>
            </div>
            <div id="jhGroupsContainer"></div>
            <input type="file" id="jhImportFile" accept=".json" style="display:none;">
        </div>
    `;
    container.innerHTML = html;
    
    renderGroups();
    
    document.getElementById('jhNewGroupBtn').onclick = function() { openNewGroup(); };
    document.getElementById('jhNewItemBtn').onclick = function() { openNewItem(); };
    document.getElementById('jhExportBtn').onclick = function() { exportJianghuData(); };
    document.getElementById('jhImportBtn').onclick = function() { document.getElementById('jhImportFile').click(); };
    document.getElementById('jhImportFile').onchange = function(e) {
        if (e.target.files && e.target.files[0]) {
            importJianghuData(e.target.files[0]);
            e.target.value = '';
        }
    };
}

function renderGroups() {
    var container = document.getElementById('jhGroupsContainer');
    if (!container) return;
    container.innerHTML = '';
    
    for (var g = 0; g < jianghuGroups.length; g++) {
        var group = jianghuGroups[g];
        var groupItems = jianghuItems.filter(function(item) { return item.groupId === group.id; });
        
        var groupDiv = document.createElement('div');
        groupDiv.className = 'jh-group-section';
        groupDiv.setAttribute('data-group-id', group.id);
        groupDiv.style.cssText = 'margin-bottom:30px;';
        groupDiv.innerHTML = `
            <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:16px; padding-bottom:8px; border-bottom:2px solid rgba(0,0,0,0.1);">
                <div style="display:flex; align-items:center; gap:10px;">
                    <span style="font-size:24px;">${group.icon || '📁'}</span>
                    <h3 style="margin:0;">${escapeHtml(group.name)}</h3>
                    <span style="font-size:12px; opacity:0.6;">(${groupItems.length}项)</span>
                </div>
                <button class="jh-group-menu" data-id="${group.id}" style="background:none; border:none; font-size:18px; cursor:pointer;">⋯</button>
            </div>
            <div class="jh-items-grid" style="display:grid; grid-template-columns:repeat(auto-fill, minmax(280px, 1fr)); gap:16px;">
                ${groupItems.map(function(item) {
                    return `
                        <div class="jh-item-card" data-id="${item.id}" draggable="true" style="background:#fff; border-radius:12px; padding:16px; cursor:pointer; transition:all 0.2s; box-shadow:0 2px 8px rgba(0,0,0,0.08);">
                            <div style="display:flex; align-items:center; gap:12px;">
                                <span style="font-size:32px;">${item.icon || '🔗'}</span>
                                <div style="flex:1;">
                                    <div style="font-weight:600; font-size:16px;">${escapeHtml(item.title)}</div>
                                    <div style="font-size:12px; color:#888; margin-top:4px;">${escapeHtml(item.desc || '点击打开链接')}</div>
                                </div>
                                <button class="jh-item-menu" data-id="${item.id}" style="background:none; border:none; font-size:16px; cursor:pointer;">⋯</button>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
        container.appendChild(groupDiv);
    }
    
    var cards = document.querySelectorAll('.jh-item-card');
    for (var i = 0; i < cards.length; i++) {
        cards[i].onclick = function(e) {
            if (e.target.classList && e.target.classList.contains('jh-item-menu')) return;
            var id = parseInt(this.getAttribute('data-id'));
            var item = jianghuItems.find(function(i) { return i.id === id; });
            if (item && item.url) window.open(item.url, '_blank');
        };
        initDrag(cards[i]);
    }
    
    var groupMenus = document.querySelectorAll('.jh-group-menu');
    for (var i = 0; i < groupMenus.length; i++) {
        groupMenus[i].onclick = function(e) {
            e.stopPropagation();
            showGroupMenu(this.getAttribute('data-id'));
        };
    }
    
    var itemMenus = document.querySelectorAll('.jh-item-menu');
    for (var i = 0; i < itemMenus.length; i++) {
        itemMenus[i].onclick = function(e) {
            e.stopPropagation();
            showItemMenu(parseInt(this.getAttribute('data-id')));
        };
    }
    
    initDropZones();
}

var dragSourceId = null;
var dragSourceGroup = null;

function initDrag(card) {
    card.ondragstart = function(e) {
        dragSourceId = parseInt(this.getAttribute('data-id'));
        var groupDiv = this.closest('.jh-group-section');
        if (groupDiv) dragSourceGroup = groupDiv.getAttribute('data-group-id');
        e.dataTransfer.setData('text/plain', dragSourceId);
        this.style.opacity = '0.5';
    };
    card.ondragend = function(e) {
        this.style.opacity = '1';
        dragSourceId = null;
    };
}

function initDropZones() {
    var groups = document.querySelectorAll('.jh-group-section');
    for (var i = 0; i < groups.length; i++) {
        groups[i].ondragover = function(e) {
            e.preventDefault();
            this.style.backgroundColor = 'rgba(0,122,255,0.05)';
        };
        groups[i].ondragleave = function(e) {
            this.style.backgroundColor = '';
        };
        groups[i].ondrop = function(e) {
            e.preventDefault();
            this.style.backgroundColor = '';
            if (!dragSourceId) return;
            var targetGroup = this.getAttribute('data-group-id');
            if (dragSourceGroup === targetGroup) return;
            var item = jianghuItems.find(function(i) { return i.id === dragSourceId; });
            if (item) {
                item.groupId = targetGroup;
                saveJianghuData();
                renderJianghuPage();
            }
            dragSourceId = null;
        };
    }
}

function showGroupMenu(groupId) {
    var group = jianghuGroups.find(function(g) { return g.id == groupId; });
    if (!group) return;
    var menu = document.createElement('div');
    menu.style.cssText = 'position:fixed; background:#fff; border-radius:8px; padding:4px 0; box-shadow:0 2px 8px rgba(0,0,0,0.15); z-index:1000; min-width:120px;';
    menu.innerHTML = '<button class="rename-group" style="display:block; width:100%; padding:8px 16px; border:none; background:none; cursor:pointer;">重命名</button><button class="delete-group" style="display:block; width:100%; padding:8px 16px; border:none; background:none; cursor:pointer;">删除分组</button>';
    document.body.appendChild(menu);
    var rect = event.target.getBoundingClientRect();
    menu.style.top = rect.bottom + 'px';
    menu.style.left = rect.left + 'px';
    menu.querySelector('.rename-group').onclick = function() {
        var newName = prompt('请输入新名称', group.name);
        if (newName && newName.trim()) {
            group.name = newName.trim();
            saveJianghuData();
            renderJianghuPage();
        }
        menu.remove();
    };
    menu.querySelector('.delete-group').onclick = function() {
        if (group.name === '默认分组') { alert('默认分组不能删除'); menu.remove(); return; }
        if (confirm('确定删除分组 "' + group.name + '" 吗？')) {
            var defaultGroup = jianghuGroups.find(function(g) { return g.name === '默认分组'; });
            if (!defaultGroup) {
                defaultGroup = { id: 'default', name: '默认分组', icon: '📁' };
                jianghuGroups.push(defaultGroup);
            }
            for (var i = 0; i < jianghuItems.length; i++) {
                if (jianghuItems[i].groupId == groupId) jianghuItems[i].groupId = defaultGroup.id;
            }
            jianghuGroups = jianghuGroups.filter(function(g) { return g.id != groupId; });
            saveJianghuData();
            renderJianghuPage();
        }
        menu.remove();
    };
}

function showItemMenu(itemId) {
    var item = jianghuItems.find(function(i) { return i.id === itemId; });
    if (!item) return;
    var menu = document.createElement('div');
    menu.style.cssText = 'position:fixed; background:#fff; border-radius:8px; padding:4px 0; box-shadow:0 2px 8px rgba(0,0,0,0.15); z-index:1000; min-width:120px;';
    menu.innerHTML = '<button class="edit-item" style="display:block; width:100%; padding:8px 16px; border:none; background:none; cursor:pointer;">编辑</button><button class="delete-item" style="display:block; width:100%; padding:8px 16px; border:none; background:none; cursor:pointer;">删除</button><button class="move-item" style="display:block; width:100%; padding:8px 16px; border:none; background:none; cursor:pointer;">移动到分组</button>';
    document.body.appendChild(menu);
    var rect = event.target.getBoundingClientRect();
    menu.style.top = rect.bottom + 'px';
    menu.style.left = rect.left + 'px';
    menu.querySelector('.edit-item').onclick = function() {
        var newTitle = prompt('请输入链接名称', item.title);
        if (newTitle && newTitle.trim()) item.title = newTitle.trim();
        var newUrl = prompt('请输入链接地址', item.url);
        if (newUrl && newUrl.trim()) item.url = newUrl.trim();
        var newDesc = prompt('请输入链接描述', item.desc);
        if (newDesc !== null) item.desc = newDesc || '';
        saveJianghuData();
        renderJianghuPage();
        menu.remove();
    };
    menu.querySelector('.delete-item').onclick = function() {
        if (confirm('确定删除这个链接吗？')) {
            jianghuItems = jianghuItems.filter(function(i) { return i.id !== itemId; });
            saveJianghuData();
            renderJianghuPage();
        }
        menu.remove();
    };
    menu.querySelector('.move-item').onclick = function() {
        var groupNames = jianghuGroups.map(function(g) { return g.name; }).join(', ');
        var newGroupName = prompt('移动到哪个分组？可选：' + groupNames, '默认分组');
        var targetGroup = jianghuGroups.find(function(g) { return g.name === newGroupName; });
        if (targetGroup) {
            item.groupId = targetGroup.id;
            saveJianghuData();
            renderJianghuPage();
        }
        menu.remove();
    };
}

function openNewGroup() {
    var name = prompt('请输入分组名称：');
    if (name && name.trim()) {
        var newGroup = { id: Date.now().toString(), name: name.trim(), icon: '📁' };
        jianghuGroups.push(newGroup);
        saveJianghuData();
        renderJianghuPage();
    }
}

function openNewItem() {
    var title = prompt('请输入链接名称：');
    if (!title || !title.trim()) return;
    var url = prompt('请输入链接地址（URL）：');
    if (!url || !url.trim()) return;
    var desc = prompt('请输入链接描述（可选）：');
    var targetGroup = jianghuGroups[0];
    if (jianghuGroups.length > 1) {
        var groupNames = jianghuGroups.map(function(g) { return g.name; }).join(', ');
        var groupName = prompt('请选择分组，可选：' + groupNames, '默认分组');
        targetGroup = jianghuGroups.find(function(g) { return g.name === groupName; }) || jianghuGroups[0];
    }
    var newItem = { id: Date.now(), groupId: targetGroup.id, title: title.trim(), url: url.trim(), desc: desc || '点击打开链接', icon: '🔗' };
    jianghuItems.push(newItem);
    saveJianghuData();
    renderJianghuPage();
}

function loadJianghuPageContent() {
    renderJianghuPage();
}

loadJianghuData();
