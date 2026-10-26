// ========== 右侧工具栏（书籍编辑器内） ==========

/**
 * 显示 / 收起书籍编辑器右侧的工具图标栏。
 * 边栏 DOM 由 renderBookEditor() 生成，这里不再重复创建，避免出现两个 #rightSidebar。
 */
function toggleRightSidebar() {
    var sidebar = document.getElementById('rightSidebar');
    if (!sidebar) return;

    if (sidebar.classList.contains('collapsed')) {
        sidebar.classList.remove('collapsed');
        sidebar.style.width = '60px';
        sidebar.style.minWidth = '60px';
        localStorage.setItem('rightSidebar_collapsed', 'false');
    } else {
        sidebar.classList.add('collapsed');
        sidebar.style.width = '0';
        sidebar.style.minWidth = '0';
        localStorage.setItem('rightSidebar_collapsed', 'true');
    }
}
