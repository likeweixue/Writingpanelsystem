// ========== 右侧边栏管理 ==========

// 创建右侧边栏的函数
function createRightSidebar() {
    if (document.getElementById('rightSidebar')) return;
    
    var sidebarHtml = '<div id="rightSidebar" class="right-sidebar"><div class="right-sidebar-content"><div class="sidebar-tool-item" data-tool="outline"><div class="sidebar-tool-icon">📋</div><div class="sidebar-tool-label">大纲</div></div><div class="sidebar-tool-item" data-tool="timeline"><div class="sidebar-tool-icon">⏱️</div><div class="sidebar-tool-label">时间线</div></div><div class="sidebar-tool-item" data-tool="characters"><div class="sidebar-tool-icon">👥</div><div class="sidebar-tool-label">角色</div></div><div class="sidebar-tool-item" data-tool="setting"><div class="sidebar-tool-icon">⚙️</div><div class="sidebar-tool-label">设定</div></div><div class="sidebar-tool-item" data-tool="relation"><div class="sidebar-tool-icon">🔗</div><div class="sidebar-tool-label">关系图</div></div><div class="sidebar-tool-item" data-tool="whiteboard"><div class="sidebar-tool-icon">📝</div><div class="sidebar-tool-label">无边记</div></div><div class="sidebar-tool-item" data-tool="namegen"><div class="sidebar-tool-icon">✏️</div><div class="sidebar-tool-label">起名</div></div><div class="sidebar-tool-item" data-tool="notes"><div class="sidebar-tool-icon">📓</div><div class="sidebar-tool-label">笔记</div></div></div></div>';
    document.body.insertAdjacentHTML('beforeend', sidebarHtml);
    
    // 绑定工具点击事件
    var tools = document.querySelectorAll('.sidebar-tool-item');
    for (var i = 0; i < tools.length; i++) {
        tools[i].onclick = function() {
            var tool = this.getAttribute('data-tool');
            openSecondaryWindow(tool);
        };
    }
    
    // 恢复保存的收起状态
    var savedCollapsed = localStorage.getItem('rightSidebar_collapsed');
    var rightSidebar = document.getElementById('rightSidebar');
    if (rightSidebar) {
        if (savedCollapsed === 'true') {
            rightSidebar.classList.add('collapsed');
            rightSidebar.style.width = '0';
            rightSidebar.style.minWidth = '0';
        } else {
            rightSidebar.classList.remove('collapsed');
            rightSidebar.style.width = '280px';
            rightSidebar.style.minWidth = '200px';
        }
    }
    
    console.log('右侧边栏已创建');
    return document.getElementById('rightSidebar');
}

// 切换右侧边栏显示/隐藏
function toggleRightSidebar() {
    var sidebar = document.getElementById('rightSidebar');
    
    if (!sidebar) {
        sidebar = createRightSidebar();
    }
    
    if (sidebar) {
        if (sidebar.classList.contains('collapsed')) {
            sidebar.classList.remove('collapsed');
            sidebar.style.width = '280px';
            sidebar.style.minWidth = '200px';
            localStorage.setItem('rightSidebar_collapsed', 'false');
            console.log('侧边栏已展开');
        } else {
            sidebar.classList.add('collapsed');
            sidebar.style.width = '0';
            sidebar.style.minWidth = '0';
            localStorage.setItem('rightSidebar_collapsed', 'true');
            console.log('侧边栏已收起');
        }
    }
}

// 打开辅助窗口
function openSecondaryWindow(tool) {
    var fileMap = {
        whiteboard: 'whiteboard.html',
        namegen: 'namegen.html',
        notes: 'notes.html',
        outline: 'outline.html',
        timeline: 'timeline.html',
        characters: 'characters.html',
        setting: 'setting.html',
        relation: 'relation.html'
    };
    var file = fileMap[tool];
    if (file) {
        window.open(file, '_blank', 'width=1000,height=750,left=100,top=50,resizable=yes');
    } else {
        alert(tool + '功能开发中');
    }
}

// 页面加载完成后自动创建侧边栏
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(function() {
        if (!document.getElementById('rightSidebar')) {
            createRightSidebar();
        }
        // 绑定边栏按钮
        var sidebarBtn = document.querySelector('[data-action="sidebar"]');
        if (sidebarBtn) {
            sidebarBtn.onclick = function(e) {
                e.preventDefault();
                toggleRightSidebar();
            };
        }
    }, 500);
});
