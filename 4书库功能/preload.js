const { contextBridge, ipcRenderer } = require('electron');

// 暴露安全的 API 给渲染进程
contextBridge.exposeInMainWorld('electron', {
    // 备份相关
    backupBook: (book) => ipcRenderer.invoke('backup-book', { book }),
    backupAllBooks: (books) => ipcRenderer.invoke('backup-all-books', { books }),
    openBackupFolder: () => ipcRenderer.invoke('open-backup-folder'),
    
    // 通用
    platform: process.platform
});

console.log('preload.js 已加载，electron API 已暴露');
