// 修复 openBookTab 函数
function openBookTab(bookId) {
    var book = getBookById(bookId);
    if (!book) return;
    var tabId = 'book_' + bookId;
    for (var i = 0; i < openTabs.length; i++) {
        if (openTabs[i].id === tabId) {
            switchToTab(tabId);
            return;
        }
    }
    openTabs.push({ id: tabId, title: book.title, type: 'book', bookId: bookId });
    renderTabs();
    var pagesContainer = document.getElementById('pagesContainer');
    var pageDiv = document.createElement('div');
    pageDiv.className = 'page';
    pageDiv.setAttribute('data-page', tabId);
    pageDiv.innerHTML = renderBookEditor(bookId);
    pagesContainer.appendChild(pageDiv);
    initBookEditor(tabId, bookId);
    switchToTab(tabId);
    var sidebar = document.querySelector('.sidebar-menu');
    if (sidebar) sidebar.style.display = 'none';
    var toolbar = document.getElementById('mainToolbar');
    if (toolbar) toolbar.classList.add('visible');
}
