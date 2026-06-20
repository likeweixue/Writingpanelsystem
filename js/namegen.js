// ========== 起名生成器工具 ==========

var nameGenData = {
    favoriteChars: [],
    surnameMode: 'none',
    customSurname: '',
    genderPref: 'all',
    themePrefs: { 道具: false, 装备: false, 怪物: false },
    wordLength: '2',
    requirement: ''
};

// ========== 数据操作 ==========

function loadNameGenSettings() {
    var bookId = currentBookId || 'global';
    var key = 'openwrite_namegen_' + bookId;
    var saved = localStorage.getItem(key);
    if (saved) {
        try {
            var data = JSON.parse(saved);
            nameGenData = data;
            return;
        } catch(e) {}
    }
    // 默认设置
    nameGenData.favoriteChars = [];
    nameGenData.surnameMode = 'none';
    nameGenData.customSurname = '';
    nameGenData.genderPref = 'all';
    nameGenData.themePrefs = { 道具: false, 装备: false, 怪物: false };
    nameGenData.wordLength = '2';
    nameGenData.requirement = '';
}

function saveNameGenSettings() {
    var bookId = currentBookId || 'global';
    var key = 'openwrite_namegen_' + bookId;
    localStorage.setItem(key, JSON.stringify(nameGenData));
}

// ========== 词库 ==========

var nameGenChars = {
    person: ["吕斯","龚湛","周峻峰","庄非凡","宫瑜","乔森","杜敬","史宗裕","刘津卫","游京","朱柯礼","涂湛","邹尚","白凛","殷乔","马奔","冯竣","虞归舟","成然","汪昀","纪云霆","叶尘","雪灵儿","墨渊"],
    force: ["青云阁","月影楼","玄天宗","凌霄殿","听雨轩","破军府","百花谷","流云渡","落星宗","冰雪宫","魔渊","天机阁"],
    place: ["沧澜江","断龙崖","落星原","凤凰台","无涯海","青丘山","归墟境","白露洲","苍梧山","云梦泽"],
    special: ["破空斩","霜月刃","星陨","麒麟臂","幻影步","青冥剑","啸月狼","烛龙","赤焰甲","玄冰蛊","紫霄幻月指","霜华玲珑塔"],
    gender: ["然","兮","云","霄","逸","澄","安","临","清","霁","和","宁","初","随","玄","微"],
    male: ["锋","刚","毅","辰","豪","渊","烈","铮","武","雄","威","勇"],
    female: ["柔","婉","雅","汐","梦","萱","婵","瑶","琳","雪","晴","月"]
};

var commonSurnames = ["李","王","张","刘","陈","赵","周","吴","郑","孙","林","郭","马","朱","胡","徐","高","黄","萧","沈"];
var doubleSurnames = ["欧阳","慕容","上官","诸葛","司徒","令狐","独孤","轩辕","尉迟","长孙","宇文","呼延"];

// ========== 渲染起名器 ==========

function renderNameGen() {
    var container = document.getElementById('nameGenContainer');
    if (!container) return;
    
    loadNameGenSettings();
    
    container.innerHTML = `
        <div class="namegen-container" style="display:flex; height:100%; width:100%;">
            <!-- 左侧：词库选择 -->
            <div class="namegen-sidebar" style="width:320px; min-width:240px; max-width:400px; background:var(--panel-bg, rgba(255,255,255,0.95)); backdrop-filter:blur(8px); border-right:1px solid var(--border-color, rgba(0,0,0,0.08)); display:flex; flex-direction:column; flex-shrink:0; overflow-y:auto; padding:16px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                    <span style="font-weight:600;">✏️ 起名生成器</span>
                    <button id="nameGenCloseBtn" style="background:none; border:none; cursor:pointer; font-size:16px;">✕</button>
                </div>
                
                <div style="margin-bottom:12px;">
                    <div style="font-size:12px; color:#888; margin-bottom:4px;">📖 字数（不含姓氏）</div>
                    <div style="display:flex; gap:6px;" id="nameGenLengthGroup">
                        ${['1','2','3','不限'].map(function(len) {
                            var active = (len === nameGenData.wordLength) ? 'background:#9b784e; color:white;' : 'background:#f0f0f0;';
                            return '<button data-len="' + len + '" style="padding:4px 14px; border:none; border-radius:20px; cursor:pointer; font-size:13px; ' + active + '">' + len + '</button>';
                        }).join('')}
                    </div>
                </div>
                
                <div style="margin-bottom:12px;">
                    <div style="font-size:12px; color:#888; margin-bottom:4px;">👤 姓氏</div>
                    <div style="display:flex; gap:6px; flex-wrap:wrap;">
                        ${['none','single','double'].map(function(mode) {
                            var active = (mode === nameGenData.surnameMode) ? 'background:#9b784e; color:white;' : 'background:#f0f0f0;';
                            var label = mode === 'none' ? '无姓' : (mode === 'single' ? '单姓' : '复姓');
                            return '<button data-mode="' + mode + '" style="padding:4px 12px; border:none; border-radius:20px; cursor:pointer; font-size:12px; ' + active + '">' + label + '</button>';
                        }).join('')}
                    </div>
                    <input type="text" id="nameGenCustomSurname" placeholder="自定义姓氏" value="${nameGenData.customSurname || ''}" style="width:100%; margin-top:6px; padding:4px 8px; border:1px solid var(--border-color, #ddd); border-radius:6px; font-size:12px; background:transparent; color:var(--text-color, #333);">
                </div>
                
                <div style="margin-bottom:12px;">
                    <div style="font-size:12px; color:#888; margin-bottom:4px;">⚧ 性别倾向</div>
                    <div style="display:flex; gap:6px; flex-wrap:wrap;">
                        ${['all','男','女','中性'].map(function(g) {
                            var active = (g === nameGenData.genderPref) ? 'background:#9b784e; color:white;' : 'background:#f0f0f0;';
                            return '<button data-gender="' + g + '" style="padding:4px 12px; border:none; border-radius:20px; cursor:pointer; font-size:12px; ' + active + '">' + g + '</button>';
                        }).join('')}
                    </div>
                </div>
                
                <div style="margin-bottom:12px;">
                    <div style="font-size:12px; color:#888; margin-bottom:4px;">🎭 主题偏好</div>
                    <div style="display:flex; gap:6px; flex-wrap:wrap;">
                        ${['道具','装备','怪物'].map(function(t) {
                            var checked = nameGenData.themePrefs[t] ? 'checked' : '';
                            return '<label style="font-size:12px; display:flex; align-items:center; gap:4px; background:#f0f0f0; padding:2px 10px; border-radius:20px; cursor:pointer;"><input type="checkbox" data-theme="' + t + '" ' + checked + '> ' + t + '</label>';
                        }).join('')}
                    </div>
                </div>
                
                <div style="margin-bottom:12px;">
                    <div style="font-size:12px; color:#888; margin-bottom:4px;">📝 特殊要求</div>
                    <input type="text" id="nameGenRequirement" placeholder="如：带'剑'字、古风风格..." value="${nameGenData.requirement || ''}" style="width:100%; padding:6px 10px; border:1px solid var(--border-color, #ddd); border-radius:6px; font-size:12px; background:transparent; color:var(--text-color, #333);">
                </div>
                
                <div style="margin-top:auto; display:flex; gap:8px;">
                    <button id="nameGenGenerateBtn" style="flex:1; padding:10px; background:#9b784e; color:white; border:none; border-radius:8px; cursor:pointer; font-size:14px; font-weight:600;">🎲 随机生成</button>
                    <button id="nameGenFavoriteBtn" style="padding:10px 12px; background:#f0f0f0; border:none; border-radius:8px; cursor:pointer; font-size:16px;">⭐</button>
                </div>
            </div>
            
            <!-- 右侧：结果显示 + 收藏 -->
            <div class="namegen-result" style="flex:1; display:flex; flex-direction:column; background:var(--panel-bg, rgba(255,255,255,0.9)); overflow:hidden; padding:20px;">
                <div style="text-align:center; padding:20px 0; border-bottom:1px solid var(--border-color, rgba(0,0,0,0.08));">
                    <div style="font-size:48px; font-weight:800; letter-spacing:4px; color:var(--text-color, #333);" id="nameGenResult">妙笔生花</div>
                    <div style="font-size:12px; color:#888; margin-top:8px;">✨ 点击"随机生成"获取灵感</div>
                </div>
                
                <div style="flex:1; overflow-y:auto; padding:16px 0;">
                    <div style="font-size:13px; color:#888; margin-bottom:12px;">⭐ 收藏列表</div>
                    <div id="nameGenFavoriteList" style="display:flex; flex-wrap:wrap; gap:8px;"></div>
                    <div style="font-size:11px; color:#ccc; margin-top:12px;">💡 点击收藏的名字可复制到剪贴板</div>
                </div>
                
                <div style="padding-top:12px; border-top:1px solid var(--border-color, rgba(0,0,0,0.08)); display:flex; gap:8px;">
                    <button id="nameGenClearFavoritesBtn" style="padding:6px 12px; background:#dc3545; color:white; border:none; border-radius:6px; cursor:pointer; font-size:12px;">清空收藏</button>
                    <button id="nameGenCopyResultBtn" style="padding:6px 12px; background:#6c757d; color:white; border:none; border-radius:6px; cursor:pointer; font-size:12px;">📋 复制结果</button>
                </div>
            </div>
        </div>
    `;
    
    bindNameGenEvents();
    renderNameGenFavorites();
    loadNameGenSettings();
}

// ========== 绑定事件 ==========

function bindNameGenEvents() {
    // 关闭
    document.getElementById('nameGenCloseBtn').onclick = closeNameGenPanel;
    
    // 长度选择
    document.querySelectorAll('#nameGenLengthGroup button').forEach(function(btn) {
        btn.onclick = function() {
            document.querySelectorAll('#nameGenLengthGroup button').forEach(function(b) {
                b.style.background = '#f0f0f0';
                b.style.color = '';
            });
            this.style.background = '#9b784e';
            this.style.color = 'white';
            nameGenData.wordLength = this.getAttribute('data-len');
            saveNameGenSettings();
        };
    });
    
    // 姓氏模式
    document.querySelectorAll('[data-mode]').forEach(function(btn) {
        btn.onclick = function() {
            document.querySelectorAll('[data-mode]').forEach(function(b) {
                b.style.background = '#f0f0f0';
                b.style.color = '';
            });
            this.style.background = '#9b784e';
            this.style.color = 'white';
            nameGenData.surnameMode = this.getAttribute('data-mode');
            saveNameGenSettings();
        };
    });
    
    // 自定义姓氏
    document.getElementById('nameGenCustomSurname').oninput = function() {
        nameGenData.customSurname = this.value;
        saveNameGenSettings();
    };
    
    // 性别倾向
    document.querySelectorAll('[data-gender]').forEach(function(btn) {
        btn.onclick = function() {
            document.querySelectorAll('[data-gender]').forEach(function(b) {
                b.style.background = '#f0f0f0';
                b.style.color = '';
            });
            this.style.background = '#9b784e';
            this.style.color = 'white';
            nameGenData.genderPref = this.getAttribute('data-gender');
            saveNameGenSettings();
        };
    });
    
    // 主题偏好
    document.querySelectorAll('[data-theme]').forEach(function(cb) {
        cb.onchange = function() {
            nameGenData.themePrefs[this.getAttribute('data-theme')] = this.checked;
            saveNameGenSettings();
        };
    });
    
    // 特殊要求
    document.getElementById('nameGenRequirement').oninput = function() {
        nameGenData.requirement = this.value;
        saveNameGenSettings();
    };
    
    // 生成
    document.getElementById('nameGenGenerateBtn').onclick = function() {
        var name = generateName();
        document.getElementById('nameGenResult').textContent = name;
        // 添加动画效果
        var el = document.getElementById('nameGenResult');
        el.style.transition = 'transform 0.2s';
        el.style.transform = 'scale(1.1)';
        setTimeout(function() { el.style.transform = 'scale(1)'; }, 200);
    };
    
    // 收藏
    document.getElementById('nameGenFavoriteBtn').onclick = function() {
        var name = document.getElementById('nameGenResult').textContent;
        if (name && name !== '妙笔生花' && nameGenData.favoriteChars.indexOf(name) === -1) {
            nameGenData.favoriteChars.push(name);
            saveNameGenSettings();
            renderNameGenFavorites();
        } else if (nameGenData.favoriteChars.indexOf(name) !== -1) {
            alert('已收藏过这个名字');
        } else {
            alert('请先生成一个名字');
        }
    };
    
    // 清空收藏
    document.getElementById('nameGenClearFavoritesBtn').onclick = function() {
        if (confirm('确定清空所有收藏吗？')) {
            nameGenData.favoriteChars = [];
            saveNameGenSettings();
            renderNameGenFavorites();
        }
    };
    
    // 复制结果
    document.getElementById('nameGenCopyResultBtn').onclick = function() {
        var name = document.getElementById('nameGenResult').textContent;
        if (name && name !== '妙笔生花') {
            navigator.clipboard.writeText(name).then(function() {
                alert('已复制：' + name);
            }).catch(function() {
                // 降级方案
                var textarea = document.createElement('textarea');
                textarea.value = name;
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand('copy');
                document.body.removeChild(textarea);
                alert('已复制：' + name);
            });
        } else {
            alert('请先生成一个名字');
        }
    };
    
    // 键盘快捷键：回车生成
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && document.activeElement && 
            (document.activeElement.id === 'nameGenRequirement' || 
             document.activeElement.id === 'nameGenCustomSurname')) {
            document.getElementById('nameGenGenerateBtn').click();
        }
    });
}

// ========== 生成名字 ==========

function generateName() {
    var wordLength = nameGenData.wordLength === '不限' ? Math.floor(Math.random() * 3) + 1 : parseInt(nameGenData.wordLength);
    
    // 构建词库
    var pool = [];
    var allChars = nameGenChars.person.concat(
        nameGenChars.force, nameGenChars.place, 
        nameGenChars.special, nameGenChars.gender
    );
    
    // 根据性别过滤
    var genderPool = [];
    if (nameGenData.genderPref === '男') {
        genderPool = nameGenChars.male.concat(nameGenChars.gender);
    } else if (nameGenData.genderPref === '女') {
        genderPool = nameGenChars.female.concat(nameGenChars.gender);
    } else if (nameGenData.genderPref === '中性') {
        genderPool = nameGenChars.gender;
    } else {
        genderPool = nameGenChars.male.concat(nameGenChars.female, nameGenChars.gender);
    }
    
    // 主题词
    var themePool = [];
    if (nameGenData.themePrefs.道具) themePool = themePool.concat(['珠','玉','环','铃','伞','笛','扇','鼎','镜','印']);
    if (nameGenData.themePrefs.装备) themePool = themePool.concat(['剑','刀','甲','铠','弓','盾','枪','戈','戟','刃']);
    if (nameGenData.themePrefs.怪物) themePool = themePool.concat(['煞','魇','妖','魔','兽','鬼','狰','狞','魁','魉']);
    
    // 合并词库
    pool = pool.concat(genderPool, themePool);
    if (pool.length === 0) pool = allChars;
    
    // 去重
    pool = pool.filter(function(item, index) { return pool.indexOf(item) === index; });
    
    // 生成名字主体
    var nameBody = '';
    for (var i = 0; i < wordLength; i++) {
        var char = pool[Math.floor(Math.random() * pool.length)];
        if (char.length > 2) char = char.substring(0, 2);
        nameBody += char;
    }
    
    // 截取到目标长度
    if (nameBody.length > wordLength) nameBody = nameBody.slice(0, wordLength);
    
    // 添加姓氏
    var fullName = '';
    if (nameGenData.surnameMode === 'single') {
        var surname = nameGenData.customSurname || commonSurnames[Math.floor(Math.random() * commonSurnames.length)];
        fullName = surname + nameBody;
    } else if (nameGenData.surnameMode === 'double') {
        var surname = nameGenData.customSurname || doubleSurnames[Math.floor(Math.random() * doubleSurnames.length)];
        fullName = surname + nameBody;
    } else {
        fullName = nameBody;
    }
    
    // 应用特殊要求（简单处理）
    if (nameGenData.requirement) {
        var req = nameGenData.requirement;
        // 如果要求包含某个字，尝试替换
        var chars = req.match(/['"“](.)['"”]/);
        if (chars && chars[1]) {
            var targetChar = chars[1];
            if (fullName.indexOf(targetChar) === -1 && fullName.length > 1) {
                var pos = Math.floor(Math.random() * fullName.length);
                var arr = fullName.split('');
                arr[pos] = targetChar;
                fullName = arr.join('');
            }
        }
    }
    
    return fullName;
}

// ========== 收藏列表 ==========

function renderNameGenFavorites() {
    var container = document.getElementById('nameGenFavoriteList');
    if (!container) return;
    
    if (nameGenData.favoriteChars.length === 0) {
        container.innerHTML = '<div style="color:#ccc; font-size:12px;">暂无收藏</div>';
        return;
    }
    
    container.innerHTML = '';
    nameGenData.favoriteChars.forEach(function(name) {
        var span = document.createElement('span');
        span.style.cssText = 'padding:4px 12px; background:rgba(155,120,78,0.15); border-radius:20px; font-size:13px; cursor:pointer; transition:background 0.2s;';
        span.textContent = name;
        span.onclick = function() {
            navigator.clipboard.writeText(name).then(function() {
                alert('已复制：' + name);
            }).catch(function() {
                var textarea = document.createElement('textarea');
                textarea.value = name;
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand('copy');
                document.body.removeChild(textarea);
                alert('已复制：' + name);
            });
        };
        span.onmouseenter = function() { this.style.background = 'rgba(155,120,78,0.3)'; };
        span.onmouseleave = function() { this.style.background = 'rgba(155,120,78,0.15)'; };
        container.appendChild(span);
    });
}

// ========== 打开/关闭 ==========

function openNameGenPanel() {
    var existingPage = document.querySelector('.page[data-page="namegen_panel"]');
    if (existingPage) {
        switchToTab('namegen_panel');
        return;
    }
    
    var bookId = currentBookId || 'global';
    var tabId = 'namegen_panel';
    openTabs.push({ id: tabId, title: '✏️ 起名', type: 'namegen', bookId: bookId });
    renderTabs();
    
    var pagesContainer = document.getElementById('pagesContainer');
    var pageDiv = document.createElement('div');
    pageDiv.className = 'page';
    pageDiv.setAttribute('data-page', tabId);
    pageDiv.innerHTML = '<div id="nameGenContainer" style="height:100%;"></div>';
    pagesContainer.appendChild(pageDiv);
    
    renderNameGen();
    
    switchToTab(tabId);
    var sidebar = document.querySelector('.sidebar-menu');
    if (sidebar) sidebar.style.display = 'none';
}

function closeNameGenPanel() {
    closeTab('namegen_panel');
    var sidebar = document.querySelector('.sidebar-menu');
    if (sidebar) sidebar.style.display = 'flex';
}

// ========== 导出 ==========

window.openNameGenPanel = openNameGenPanel;
window.closeNameGenPanel = closeNameGenPanel;
window.nameGenData = nameGenData;

document.addEventListener('DOMContentLoaded', function() {
    var namegenTool = document.querySelector('.sidebar-tool-item[data-tool="namegen"]');
    if (namegenTool) {
        namegenTool.onclick = function() {
            if (typeof openNameGenPanel === 'function') {
                openNameGenPanel();
            } else {
                window.open('html/namegen.html', '_blank');
            }
        };
    }
});

// ========== 起名生成器侧边栏模式 ==========

function openNameGenSidebar() {
    if (typeof openToolSidebar === 'function') {
        openToolSidebar('namegen');
    } else {
        window.open('html/namegen.html', '_blank', 'width=1200,height=800,resizable=yes');
    }
}

function openNameGenInNewWindow() {
    // 关闭浮动面板
    if (typeof closeFloatingPanel === 'function') {
        closeFloatingPanel();
    }
    
    // 确保设置已加载
    loadNameGenSettings();
    
    // 序列化数据
    var dataJson = JSON.stringify(nameGenData);
    var bookId = currentBookId || 'global';
    
    var html = `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>✏️ 起名生成器 - 全屏编辑</title>
<style>
* { margin:0; padding:0; box-sizing:border-box; }
body { font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif; background:#f0f2f5; height:100vh; overflow:hidden; }
.namegen-container { display:flex; height:100vh; width:100%; }
.namegen-sidebar { width:320px; min-width:240px; max-width:400px; background:rgba(255,255,255,0.95); backdrop-filter:blur(8px); border-right:1px solid rgba(0,0,0,0.08); display:flex; flex-direction:column; flex-shrink:0; overflow-y:auto; padding:16px; }
.namegen-sidebar .title { display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; font-weight:600; font-size:16px; }
.namegen-sidebar .title button { background:none; border:none; cursor:pointer; font-size:16px; }
.namegen-sidebar .section { margin-bottom:12px; }
.namegen-sidebar .section-label { font-size:12px; color:#888; margin-bottom:4px; }
.namegen-sidebar .btn-group { display:flex; gap:6px; flex-wrap:wrap; }
.namegen-sidebar .btn-group button { padding:4px 14px; border:none; border-radius:20px; cursor:pointer; font-size:13px; background:#f0f0f0; }
.namegen-sidebar .btn-group button.active { background:#9b784e; color:white; }
.namegen-sidebar input[type="text"] { width:100%; padding:4px 8px; border:1px solid #ddd; border-radius:6px; font-size:12px; background:transparent; color:#333; margin-top:6px; }
.namegen-sidebar .generate-row { display:flex; gap:8px; margin-top:auto; }
.namegen-sidebar .generate-row .gen-btn { flex:1; padding:10px; background:#9b784e; color:white; border:none; border-radius:8px; cursor:pointer; font-size:14px; font-weight:600; }
.namegen-sidebar .generate-row .fav-btn { padding:10px 12px; background:#f0f0f0; border:none; border-radius:8px; cursor:pointer; font-size:16px; }
.namegen-result { flex:1; display:flex; flex-direction:column; background:rgba(255,255,255,0.9); overflow:hidden; padding:20px; }
.namegen-result .result-display { text-align:center; padding:20px 0; border-bottom:1px solid rgba(0,0,0,0.08); }
.namegen-result .result-display .name { font-size:48px; font-weight:800; letter-spacing:4px; color:#333; }
.namegen-result .result-display .hint { font-size:12px; color:#888; margin-top:8px; }
.namegen-result .favorites { flex:1; overflow-y:auto; padding:16px 0; }
.namegen-result .favorites .label { font-size:13px; color:#888; margin-bottom:12px; }
.namegen-result .favorites .list { display:flex; flex-wrap:wrap; gap:8px; }
.namegen-result .favorites .list .item { padding:4px 12px; background:rgba(155,120,78,0.15); border-radius:20px; font-size:13px; cursor:pointer; transition:background 0.2s; }
.namegen-result .favorites .list .item:hover { background:rgba(155,120,78,0.3); }
.namegen-result .bottom-actions { padding-top:12px; border-top:1px solid rgba(0,0,0,0.08); display:flex; gap:8px; }
.namegen-result .bottom-actions button { padding:6px 12px; border:none; border-radius:6px; cursor:pointer; font-size:12px; }
.namegen-result .bottom-actions .clear { background:#dc3545; color:white; }
.namegen-result .bottom-actions .copy { background:#6c757d; color:white; }
::-webkit-scrollbar { width:6px; height:6px; }
::-webkit-scrollbar-thumb { background:rgba(136,136,136,0.4); border-radius:3px; }
::-webkit-scrollbar-track { background:transparent; }
</style>
</head>
<body>
<div class="namegen-container">
    <div class="namegen-sidebar">
        <div class="title">
            <span>✏️ 起名生成器</span>
            <button id="nameGenCloseBtn">✕</button>
        </div>
        <div class="section">
            <div class="section-label">📖 字数（不含姓氏）</div>
            <div class="btn-group" id="nameGenLengthGroup">
                ${['1','2','3','不限'].map(function(len) {
                    var active = (len === nameGenData.wordLength) ? 'active' : '';
                    return '<button data-len="' + len + '" class="' + active + '">' + len + '</button>';
                }).join('')}
            </div>
        </div>
        <div class="section">
            <div class="section-label">👤 姓氏</div>
            <div class="btn-group" id="nameGenModeGroup">
                ${['none','single','double'].map(function(mode) {
                    var active = (mode === nameGenData.surnameMode) ? 'active' : '';
                    var label = mode === 'none' ? '无姓' : (mode === 'single' ? '单姓' : '复姓');
                    return '<button data-mode="' + mode + '" class="' + active + '">' + label + '</button>';
                }).join('')}
            </div>
            <input type="text" id="nameGenCustomSurname" placeholder="自定义姓氏" value="${nameGenData.customSurname || ''}">
        </div>
        <div class="section">
            <div class="section-label">⚧ 性别倾向</div>
            <div class="btn-group" id="nameGenGenderGroup">
                ${['all','男','女','中性'].map(function(g) {
                    var active = (g === nameGenData.genderPref) ? 'active' : '';
                    return '<button data-gender="' + g + '" class="' + active + '">' + g + '</button>';
                }).join('')}
            </div>
        </div>
        <div class="section">
            <div class="section-label">🎭 主题偏好</div>
            <div class="btn-group" style="gap:8px;">
                ${['道具','装备','怪物'].map(function(t) {
                    var checked = nameGenData.themePrefs[t] ? 'checked' : '';
                    return '<label style="font-size:12px; display:flex; align-items:center; gap:4px; background:#f0f0f0; padding:2px 10px; border-radius:20px; cursor:pointer;"><input type="checkbox" data-theme="' + t + '" ' + checked + '> ' + t + '</label>';
                }).join('')}
            </div>
        </div>
        <div class="section">
            <div class="section-label">📝 特殊要求</div>
            <input type="text" id="nameGenRequirement" placeholder="如：带'剑'字、古风风格..." value="${nameGenData.requirement || ''}">
        </div>
        <div class="generate-row">
            <button class="gen-btn" id="nameGenGenerateBtn">🎲 随机生成</button>
            <button class="fav-btn" id="nameGenFavoriteBtn">⭐</button>
        </div>
    </div>
    <div class="namegen-result">
        <div class="result-display">
            <div class="name" id="nameGenResult">妙笔生花</div>
            <div class="hint">✨ 点击"随机生成"获取灵感</div>
        </div>
        <div class="favorites">
            <div class="label">⭐ 收藏列表</div>
            <div class="list" id="nameGenFavoriteList"></div>
            <div style="font-size:11px; color:#ccc; margin-top:12px;">💡 点击收藏的名字可复制到剪贴板</div>
        </div>
        <div class="bottom-actions">
            <button class="clear" id="nameGenClearFavoritesBtn">清空收藏</button>
            <button class="copy" id="nameGenCopyResultBtn">📋 复制结果</button>
        </div>
    </div>
</div>
<script>
// 从父窗口传递的数据
var nameGenData = ${dataJson};
var currentBookId = ${bookId};

function saveNameGenSettings() {
    var key = 'openwrite_namegen_' + (currentBookId || 'global');
    localStorage.setItem(key, JSON.stringify(nameGenData));
    if (window.opener && window.opener.window) {
        try { window.opener.window.location.reload(); } catch(e) {}
    }
}

// 词库
var nameGenChars = {
    person: ["吕斯","龚湛","周峻峰","庄非凡","宫瑜","乔森","杜敬","史宗裕","刘津卫","游京","朱柯礼","涂湛","邹尚","白凛","殷乔","马奔","冯竣","虞归舟","成然","汪昀","纪云霆","叶尘","雪灵儿","墨渊"],
    force: ["青云阁","月影楼","玄天宗","凌霄殿","听雨轩","破军府","百花谷","流云渡","落星宗","冰雪宫","魔渊","天机阁"],
    place: ["沧澜江","断龙崖","落星原","凤凰台","无涯海","青丘山","归墟境","白露洲","苍梧山","云梦泽"],
    special: ["破空斩","霜月刃","星陨","麒麟臂","幻影步","青冥剑","啸月狼","烛龙","赤焰甲","玄冰蛊","紫霄幻月指","霜华玲珑塔"],
    gender: ["然","兮","云","霄","逸","澄","安","临","清","霁","和","宁","初","随","玄","微"],
    male: ["锋","刚","毅","辰","豪","渊","烈","铮","武","雄","威","勇"],
    female: ["柔","婉","雅","汐","梦","萱","婵","瑶","琳","雪","晴","月"]
};
var commonSurnames = ["李","王","张","刘","陈","赵","周","吴","郑","孙","林","郭","马","朱","胡","徐","高","黄","萧","沈"];
var doubleSurnames = ["欧阳","慕容","上官","诸葛","司徒","令狐","独孤","轩辕","尉迟","长孙","宇文","呼延"];

function generateName() {
    var wordLength = nameGenData.wordLength === '不限' ? Math.floor(Math.random() * 3) + 1 : parseInt(nameGenData.wordLength);
    var pool = [];
    var allChars = nameGenChars.person.concat(nameGenChars.force, nameGenChars.place, nameGenChars.special, nameGenChars.gender);
    var genderPool = [];
    if (nameGenData.genderPref === '男') {
        genderPool = nameGenChars.male.concat(nameGenChars.gender);
    } else if (nameGenData.genderPref === '女') {
        genderPool = nameGenChars.female.concat(nameGenChars.gender);
    } else if (nameGenData.genderPref === '中性') {
        genderPool = nameGenChars.gender;
    } else {
        genderPool = nameGenChars.male.concat(nameGenChars.female, nameGenChars.gender);
    }
    var themePool = [];
    if (nameGenData.themePrefs.道具) themePool = themePool.concat(['珠','玉','环','铃','伞','笛','扇','鼎','镜','印']);
    if (nameGenData.themePrefs.装备) themePool = themePool.concat(['剑','刀','甲','铠','弓','盾','枪','戈','戟','刃']);
    if (nameGenData.themePrefs.怪物) themePool = themePool.concat(['煞','魇','妖','魔','兽','鬼','狰','狞','魁','魉']);
    pool = pool.concat(genderPool, themePool);
    if (pool.length === 0) pool = allChars;
    pool = pool.filter(function(item, index) { return pool.indexOf(item) === index; });
    var nameBody = '';
    for (var i = 0; i < wordLength; i++) {
        var char = pool[Math.floor(Math.random() * pool.length)];
        if (char.length > 2) char = char.substring(0, 2);
        nameBody += char;
    }
    if (nameBody.length > wordLength) nameBody = nameBody.slice(0, wordLength);
    var fullName = '';
    if (nameGenData.surnameMode === 'single') {
        var surname = nameGenData.customSurname || commonSurnames[Math.floor(Math.random() * commonSurnames.length)];
        fullName = surname + nameBody;
    } else if (nameGenData.surnameMode === 'double') {
        var surname = nameGenData.customSurname || doubleSurnames[Math.floor(Math.random() * doubleSurnames.length)];
        fullName = surname + nameBody;
    } else {
        fullName = nameBody;
    }
    if (nameGenData.requirement) {
        var req = nameGenData.requirement;
        var chars = req.match(/['"“](.)['"”]/);
        if (chars && chars[1]) {
            var targetChar = chars[1];
            if (fullName.indexOf(targetChar) === -1 && fullName.length > 1) {
                var pos = Math.floor(Math.random() * fullName.length);
                var arr = fullName.split('');
                arr[pos] = targetChar;
                fullName = arr.join('');
            }
        }
    }
    return fullName;
}

function renderFavorites() {
    var container = document.getElementById('nameGenFavoriteList');
    if (!container) return;
    if (nameGenData.favoriteChars.length === 0) {
        container.innerHTML = '<div style="color:#ccc; font-size:12px;">暂无收藏</div>';
        return;
    }
    container.innerHTML = '';
    nameGenData.favoriteChars.forEach(function(name) {
        var span = document.createElement('span');
        span.className = 'item';
        span.textContent = name;
        span.onclick = function() {
            navigator.clipboard.writeText(name).then(function() {
                alert('已复制：' + name);
            }).catch(function() {
                var textarea = document.createElement('textarea');
                textarea.value = name;
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand('copy');
                document.body.removeChild(textarea);
                alert('已复制：' + name);
            });
        };
        container.appendChild(span);
    });
}

// 绑定事件
document.getElementById('nameGenCloseBtn').onclick = function() { window.close(); };

document.querySelectorAll('#nameGenLengthGroup button').forEach(function(btn) {
    btn.onclick = function() {
        document.querySelectorAll('#nameGenLengthGroup button').forEach(function(b) { b.classList.remove('active'); b.style.background = '#f0f0f0'; b.style.color = ''; });
        this.classList.add('active'); this.style.background = '#9b784e'; this.style.color = 'white';
        nameGenData.wordLength = this.getAttribute('data-len');
        saveNameGenSettings();
    };
});

document.querySelectorAll('#nameGenModeGroup button').forEach(function(btn) {
    btn.onclick = function() {
        document.querySelectorAll('#nameGenModeGroup button').forEach(function(b) { b.classList.remove('active'); b.style.background = '#f0f0f0'; b.style.color = ''; });
        this.classList.add('active'); this.style.background = '#9b784e'; this.style.color = 'white';
        nameGenData.surnameMode = this.getAttribute('data-mode');
        saveNameGenSettings();
    };
});

document.querySelectorAll('#nameGenGenderGroup button').forEach(function(btn) {
    btn.onclick = function() {
        document.querySelectorAll('#nameGenGenderGroup button').forEach(function(b) { b.classList.remove('active'); b.style.background = '#f0f0f0'; b.style.color = ''; });
        this.classList.add('active'); this.style.background = '#9b784e'; this.style.color = 'white';
        nameGenData.genderPref = this.getAttribute('data-gender');
        saveNameGenSettings();
    };
});

document.getElementById('nameGenCustomSurname').oninput = function() {
    nameGenData.customSurname = this.value;
    saveNameGenSettings();
};

document.querySelectorAll('[data-theme]').forEach(function(cb) {
    cb.onchange = function() {
        nameGenData.themePrefs[this.getAttribute('data-theme')] = this.checked;
        saveNameGenSettings();
    };
});

document.getElementById('nameGenRequirement').oninput = function() {
    nameGenData.requirement = this.value;
    saveNameGenSettings();
};

document.getElementById('nameGenGenerateBtn').onclick = function() {
    var name = generateName();
    var resultEl = document.getElementById('nameGenResult');
    resultEl.textContent = name;
    resultEl.style.transition = 'transform 0.2s';
    resultEl.style.transform = 'scale(1.1)';
    setTimeout(function() { resultEl.style.transform = 'scale(1)'; }, 200);
};

document.getElementById('nameGenFavoriteBtn').onclick = function() {
    var name = document.getElementById('nameGenResult').textContent;
    if (name && name !== '妙笔生花' && nameGenData.favoriteChars.indexOf(name) === -1) {
        nameGenData.favoriteChars.push(name);
        saveNameGenSettings();
        renderFavorites();
    } else if (nameGenData.favoriteChars.indexOf(name) !== -1) {
        alert('已收藏过这个名字');
    } else {
        alert('请先生成一个名字');
    }
};

document.getElementById('nameGenClearFavoritesBtn').onclick = function() {
    if (confirm('确定清空所有收藏吗？')) {
        nameGenData.favoriteChars = [];
        saveNameGenSettings();
        renderFavorites();
    }
};

document.getElementById('nameGenCopyResultBtn').onclick = function() {
    var name = document.getElementById('nameGenResult').textContent;
    if (name && name !== '妙笔生花') {
        navigator.clipboard.writeText(name).then(function() {
            alert('已复制：' + name);
        }).catch(function() {
            var textarea = document.createElement('textarea');
            textarea.value = name;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            alert('已复制：' + name);
        });
    } else {
        alert('请先生成一个名字');
    }
};

document.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && document.activeElement && 
        (document.activeElement.id === 'nameGenRequirement' || 
         document.activeElement.id === 'nameGenCustomSurname')) {
        document.getElementById('nameGenGenerateBtn').click();
    }
});

// 初始化
renderFavorites();
console.log('起名生成器独立窗口已打开');
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
// ========== 起名生成器紧凑模式（侧边栏） ==========

function renderCompactNameGenPanel() {
    return `
        <div style="display:flex;flex-direction:column;height:100%;width:100%;">
            <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 14px;border-bottom:1px solid var(--border-color, rgba(0,0,0,0.08));flex-shrink:0;">
                <span style="font-weight:600;font-size:14px;">✏️ 起名</span>
                <div style="display:flex;gap:4px;">
                    <button id="compactNameGenExpandBtn" title="新窗口打开" style="background:none;border:none;cursor:pointer;font-size:14px;padding:2px 8px;border-radius:4px;">⤢</button>
                    <button id="compactNameGenCloseBtn" title="关闭面板" style="background:none;border:none;cursor:pointer;font-size:14px;padding:2px 8px;border-radius:4px;">✕</button>
                </div>
            </div>
            <div style="padding:12px;flex-shrink:0;">
                <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px;">
                    ${['1','2','3','不限'].map(function(len) {
                        var active = (len === nameGenData.wordLength) ? 'background:#9b784e;color:white;' : 'background:#f0f0f0;';
                        return '<button data-cLen="' + len + '" style="padding:2px 10px;border:none;border-radius:14px;cursor:pointer;font-size:11px;' + active + '">' + len + '字</button>';
                    }).join('')}
                </div>
                <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px;">
                    ${['none','single','double'].map(function(mode) {
                        var active = (mode === nameGenData.surnameMode) ? 'background:#9b784e;color:white;' : 'background:#f0f0f0;';
                        var label = mode === 'none' ? '无姓' : (mode === 'single' ? '单姓' : '复姓');
                        return '<button data-cMode="' + mode + '" style="padding:2px 10px;border:none;border-radius:14px;cursor:pointer;font-size:11px;' + active + '">' + label + '</button>';
                    }).join('')}
                </div>
                <div style="display:flex;gap:8px;">
                    <input type="text" id="compactNameGenSurname" placeholder="自定义姓氏" value="${nameGenData.customSurname || ''}" style="flex:1;padding:4px 8px;border:1px solid #ddd;border-radius:6px;font-size:12px;background:transparent;color:var(--text-color, #333);">
                    <button id="compactNameGenGenerateBtn" style="padding:4px 14px;background:#9b784e;color:white;border:none;border-radius:6px;cursor:pointer;font-size:12px;">🎲</button>
                </div>
                <div style="text-align:center;padding:8px 0;font-size:22px;font-weight:700;color:var(--text-color, #333);letter-spacing:2px;" id="compactNameGenResult">妙笔生花</div>
            </div>
            <div style="flex:1;overflow-y:auto;padding:0 12px 12px 12px;">
                <div style="font-size:11px;color:#888;margin-bottom:6px;">⭐ 收藏</div>
                <div id="compactNameGenFavorites" style="display:flex;flex-wrap:wrap;gap:6px;"></div>
            </div>
        </div>
    `;
}

function renderCompactNameGenFavorites() {
    var container = document.getElementById('compactNameGenFavorites');
    if (!container) return;
    
    if (nameGenData.favoriteChars.length === 0) {
        container.innerHTML = '<div style="color:#ccc;font-size:11px;">暂无收藏</div>';
        return;
    }
    
    container.innerHTML = '';
    nameGenData.favoriteChars.forEach(function(name) {
        var span = document.createElement('span');
        span.style.cssText = 'padding:2px 10px;background:rgba(155,120,78,0.15);border-radius:14px;font-size:12px;cursor:pointer;transition:background 0.2s;';
        span.textContent = name;
        span.onclick = function() {
            navigator.clipboard.writeText(name).then(function() {
                alert('已复制：' + name);
            }).catch(function() {
                var textarea = document.createElement('textarea');
                textarea.value = name;
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand('copy');
                document.body.removeChild(textarea);
                alert('已复制：' + name);
            });
        };
        container.appendChild(span);
    });
}

function bindCompactNameGenEvents() {
    console.log('绑定起名事件...');
    
    // 长度选择
    var lenBtns = document.querySelectorAll('[data-cLen]');
    if (lenBtns.length > 0) {
        lenBtns.forEach(function(btn) {
            btn.onclick = function() {
                document.querySelectorAll('[data-cLen]').forEach(function(b) {
                    b.style.background = '#f0f0f0';
                    b.style.color = '';
                });
                this.style.background = '#9b784e';
                this.style.color = 'white';
                nameGenData.wordLength = this.getAttribute('data-cLen');
                saveNameGenSettings();
            };
        });
    } else {
        console.warn('data-cLen 按钮不存在');
    }
    
    // 姓氏模式
    var modeBtns = document.querySelectorAll('[data-cMode]');
    if (modeBtns.length > 0) {
        modeBtns.forEach(function(btn) {
            btn.onclick = function() {
                document.querySelectorAll('[data-cMode]').forEach(function(b) {
                    b.style.background = '#f0f0f0';
                    b.style.color = '';
                });
                this.style.background = '#9b784e';
                this.style.color = 'white';
                nameGenData.surnameMode = this.getAttribute('data-cMode');
                saveNameGenSettings();
            };
        });
    } else {
        console.warn('data-cMode 按钮不存在');
    }
    
    // 自定义姓氏
    var surnameInput = document.getElementById('compactNameGenSurname');
    if (surnameInput) {
        surnameInput.oninput = function() {
            nameGenData.customSurname = this.value;
            saveNameGenSettings();
        };
    } else {
        console.warn('compactNameGenSurname 输入框不存在');
    }
    
    // 生成
    var generateBtn = document.getElementById('compactNameGenGenerateBtn');
    if (generateBtn) {
        generateBtn.onclick = function() {
            var name = generateName();
            var resultEl = document.getElementById('compactNameGenResult');
            if (resultEl) {
                resultEl.textContent = name;
                // 点击名字收藏
                resultEl.onclick = function() {
                    var name = this.textContent;
                    if (name && name !== '妙笔生花' && nameGenData.favoriteChars.indexOf(name) === -1) {
                        nameGenData.favoriteChars.push(name);
                        saveNameGenSettings();
                        renderCompactNameGenFavorites();
                        alert('已收藏：' + name);
                    } else if (nameGenData.favoriteChars.indexOf(name) !== -1) {
                        alert('已收藏过这个名字');
                    } else {
                        alert('请先生成一个名字');
                    }
                };
            }
        };
    } else {
        console.warn('compactNameGenGenerateBtn 按钮不存在');
    }
    
    // 展开 - 使用 openNameGenInNewWindow
document.getElementById('compactNameGenExpandBtn').onclick = function() {
    if (typeof openNameGenInNewWindow === 'function') {
        openNameGenInNewWindow();
    } else {
        window.open('html/namegen.html', '_blank', 'width=1200,height=800,resizable=yes');
        };
        console.warn('compactNameGenExpandBtn 按钮不存在');
    }
    
    // 关闭
    var closeBtn = document.getElementById('compactNameGenCloseBtn');
    if (closeBtn) {
        closeBtn.onclick = function() {
            if (typeof closeFloatingPanel === 'function') {
                closeFloatingPanel();
            }
        };
    } else {
        console.warn('compactNameGenCloseBtn 按钮不存在');
    }
    
    console.log('起名事件绑定完成');
}
// 导出
window.openNameGenSidebar = openNameGenSidebar;
window.openNameGenInNewWindow = openNameGenInNewWindow;

console.log('起名生成器侧边栏函数已注册');
console.log('起名生成器工具已加载');
console.log('✅ namegen.js 已加载，renderCompactNameGenPanel 存在:', typeof renderCompactNameGenPanel === 'function');
console.log('✅ loadNameGenSettings 存在:', typeof loadNameGenSettings === 'function');