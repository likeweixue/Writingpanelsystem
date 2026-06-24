const { contextBridge, ipcRenderer, shell } = require('electron');

contextBridge.exposeInMainWorld('electron', {
    // 备份相关
    backupBook: (book) => ipcRenderer.invoke('backup-book', { book }),
    backupAllBooks: (books) => ipcRenderer.invoke('backup-all-books', { books }),
    openBackupFolder: () => ipcRenderer.invoke('open-backup-folder'),
    
    // 保存图片
    saveImage: (imageData, fileName) => ipcRenderer.invoke('save-image', { imageData, fileName }),
    
    // 保存文件对话框
    saveFile: (fileName, content, type) => ipcRenderer.invoke('save-file-dialog', { fileName, content, type }),
    
    // 保存 ZIP 文件
    saveZipFile: (fileName, data) => ipcRenderer.invoke('save-zip-file', { fileName, data }),
    
    platform: process.platform,

    // ===== 打开新窗口（内部页面） =====
    openWindow: (url, options) => {
        console.log('🔗 Electron openWindow 被调用:', url);
        if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
            shell.openExternal(url);
        } else {
            // 使用 window.open 打开新窗口
            window.open(url, '_blank', options || 'width=1200,height=800,resizable=yes');
        }
    },
    
    // ===== 显示提示框 =====
    showAlert: (message) => {
        return ipcRenderer.invoke('show-alert', { message });
    }
});

console.log('preload.js 已加载，electron API 已暴露');