// ========== 学府模块 ==========

var xuefuMaterials = [
    { id: 1, name: '古言写作素材大全', type: 'chm', path: 'library/chm/古言写作素材大全.chm', desc: '古代言情写作必备素材' },
    { id: 2, name: '龙与地下城DND扩展规则大全', type: 'chm', path: 'library/chm/龙与地下城DND扩展规则大全.chm', desc: 'DND跑团规则扩展' },
    { id: 3, name: '男频文写作指南', type: 'chm', path: 'library/chm/男频文写作指南.chm', desc: '男频小说创作指导' },
    { id: 4, name: '女频文创作指南', type: 'chm', path: 'library/chm/女频文创作指南.chm', desc: '女频小说创作指导' },
    { id: 5, name: '小说素材大典', type: 'chm', path: 'library/chm/小说素材大典.chm', desc: '丰富的小说素材库' },
    { id: 6, name: '医学-植物草药资料库', type: 'chm', path: 'library/chm/医学-植物草药资料库.chm', desc: '中医药植物资料' }
];

function loadXuefuMaterials() {
    var saved = localStorage.getItem('xuefu_materials');
    if (saved) { try { xuefuMaterials = JSON.parse(saved); } catch(e) {} }
}

function saveXuefuMaterials() {
    localStorage.setItem('xuefu_materials', JSON.stringify(xuefuMaterials));
}

function getPlatform() {
    var ua = navigator.userAgent;
    if (ua.indexOf('Win') !== -1) return 'windows';
    if (ua.indexOf('Mac') !== -1) return 'mac';
    return 'other';
}

function loadXuefuPage() {
    var container = document.getElementById('xuefuContainer');
    if (!container) {
        console.log('xuefuContainer not found');
        return;
    }
    loadXuefuMaterials();
    var html = `
        <div style="padding:20px;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
                <h2>学府</h2>
                <button id="addMaterialBtn" class="btn-primary" style="background:#007aff;">+ 添加素材</button>
            </div>
            <div class="xuefu-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px;">
                ${xuefuMaterials.map(function(m) {
                    var typeIcon = m.type === 'chm' ? '📘' : (m.type === 'pdf' ? '📕' : '📄');
                    return `
                        <div class="xuefu-card" data-id="${m.id}" style="background:#fff;border-radius:12px;padding:16px;cursor:pointer;transition:all 0.2s;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
                            <div style="display:flex;align-items:center;gap:12px;">
                                <span style="font-size:32px;">${typeIcon}</span>
                                <div style="flex:1;">
                                    <div style="font-weight:600;">${escapeHtml(m.name)}</div>
                                    <div style="font-size:12px;color:#888;">${escapeHtml(m.desc)}</div>
                                </div>
                                <button class="material-menu" data-id="${m.id}" style="background:none;border:none;font-size:16px;cursor:pointer;padding:4px 8px;">⋯</button>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
            <div style="margin-top:20px;padding:16px;background:rgba(0,0,0,0.05);border-radius:12px;">
                <h4>使用提示</h4>
                <p style="font-size:12px;color:#888;">CHM文件在macOS上需要第三方软件打开（如KchmViewer），建议转换为PDF格式。</p>
            </div>
        </div>
    `;
    container.innerHTML = html;
    var cards = document.querySelectorAll('.xuefu-card');
    for (var i = 0; i < cards.length; i++) {
        cards[i].onclick = function(e) {
            if (e.target.classList && e.target.classList.contains('material-menu')) return;
            var id = parseInt(this.getAttribute('data-id'));
            var material = xuefuMaterials.find(function(m) { return m.id === id; });
            if (material) {
                if (getPlatform() === 'windows') {
                    alert('请手动打开文件：' + material.path);
                } else {
                    alert('素材文件位置：' + material.path + '\n\nCHM文件在macOS上无法直接打开，请安装KchmViewer或在Windows上打开');
                }
            }
        };
    }
    var menus = document.querySelectorAll('.material-menu');
    for (var i = 0; i < menus.length; i++) {
        menus[i].onclick = function(e) {
            e.stopPropagation();
            var id = parseInt(this.getAttribute('data-id'));
            showMaterialMenu(id, this);
        };
    }
    var addBtn = document.getElementById('addMaterialBtn');
    if (addBtn) addBtn.onclick = addNewMaterial;
}

function showMaterialMenu(materialId, btn) {
    var material = xuefuMaterials.find(function(m) { return m.id === materialId; });
    if (!material) return;
    var menu = document.createElement('div');
    menu.style.cssText = 'position:fixed;background:#fff;border-radius:8px;padding:4px 0;box-shadow:0 2px 8px rgba(0,0,0,0.15);z-index:1000;min-width:120px;';
    menu.innerHTML = `<button class="edit-material" style="display:block;width:100%;padding:8px 16px;border:none;background:none;cursor:pointer;">编辑</button>
        <button class="delete-material" style="display:block;width:100%;padding:8px 16px;border:none;background:none;cursor:pointer;">删除</button>`;
    var rect = btn.getBoundingClientRect();
    menu.style.top = rect.bottom + 'px';
    menu.style.left = rect.left + 'px';
    document.body.appendChild(menu);
    menu.querySelector('.edit-material').onclick = function() {
        var newName = prompt('请输入素材名称', material.name);
        if (newName && newName.trim()) material.name = newName.trim();
        var newDesc = prompt('请输入素材描述', material.desc);
        if (newDesc !== null) material.desc = newDesc || '';
        saveXuefuMaterials();
        loadXuefuPage();
        menu.remove();
    };
    menu.querySelector('.delete-material').onclick = function() {
        if (confirm('确定删除这个素材吗？')) {
            xuefuMaterials = xuefuMaterials.filter(function(m) { return m.id !== materialId; });
            saveXuefuMaterials();
            loadXuefuPage();
        }
        menu.remove();
    };
    setTimeout(function() {
        document.addEventListener('click', function closeMenu(e) {
            if (!menu.contains(e.target)) { menu.remove(); document.removeEventListener('click', closeMenu); }
        });
    }, 100);
}

function addNewMaterial() {
    var name = prompt('请输入素材名称');
    if (!name || !name.trim()) return;
    var type = prompt('请输入素材类型（chm/pdf/txt）', 'chm');
    if (!type) type = 'chm';
    var path = prompt('请输入文件路径', 'library/' + type + '/' + name.trim().replace(/[\\/:*?"<>|]/g, '') + '.' + type);
    var desc = prompt('请输入素材描述', '');
    xuefuMaterials.push({
        id: Date.now(),
        name: name.trim(),
        type: type,
        path: path,
        desc: desc || ''
    });
    saveXuefuMaterials();
    loadXuefuPage();
}
