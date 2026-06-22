// ========== 数据统计面板 ==========

console.log('📊 数据统计面板加载...');

// ========== 获取统计数据 ==========

function getStatsData() {
    var totalBooks = books ? books.length : 0;
    var totalChapters = 0;
    var totalWords = 0;
    var todayWords = 0;
    var weekWords = 0;
    var monthWords = 0;
    var yearWords = 0;
    var today = new Date();
    var todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
    var weekStart = todayStart - 6 * 86400000;
    var monthStart = new Date(today.getFullYear(), today.getMonth(), 1).getTime();
    var yearStart = new Date(today.getFullYear(), 0, 1).getTime();
    
    var monthlyStats = {};
    for (var m = 0; m < 12; m++) {
        monthlyStats[m] = 0;
    }
    
    var dailyStats = {};
    
    if (books) {
        for (var i = 0; i < books.length; i++) {
            var book = books[i];
            if (book && book.volumes) {
                for (var j = 0; j < book.volumes.length; j++) {
                    var vol = book.volumes[j];
                    if (vol && vol.chapters) {
                        for (var k = 0; k < vol.chapters.length; k++) {
                            var ch = vol.chapters[k];
                            if (ch && ch.content) {
                                var wordCount = ch.content.replace(/<[^>]*>/g, '').length;
                                totalWords += wordCount;
                                totalChapters++;
                                
                                var date = new Date(ch.updatedTime || ch.createdTime);
                                var dateKey = date.getFullYear() + '-' + 
                                    String(date.getMonth() + 1).padStart(2, '0') + '-' + 
                                    String(date.getDate()).padStart(2, '0');
                                
                                if (!dailyStats[dateKey]) {
                                    dailyStats[dateKey] = 0;
                                }
                                dailyStats[dateKey] += wordCount;
                                
                                if (date.getTime() >= todayStart) {
                                    todayWords += wordCount;
                                }
                                if (date.getTime() >= weekStart) {
                                    weekWords += wordCount;
                                }
                                if (date.getTime() >= monthStart) {
                                    monthWords += wordCount;
                                }
                                if (date.getTime() >= yearStart) {
                                    yearWords += wordCount;
                                }
                                var monthIdx = date.getMonth();
                                monthlyStats[monthIdx] = (monthlyStats[monthIdx] || 0) + wordCount;
                            }
                        }
                    }
                }
            }
        }
    }
    
    // 连续码字天数
    var consecutiveDays = 0;
    var checkDate = new Date();
    checkDate.setHours(0, 0, 0, 0);
    while (true) {
        var key = checkDate.getFullYear() + '-' + 
            String(checkDate.getMonth() + 1).padStart(2, '0') + '-' + 
            String(checkDate.getDate()).padStart(2, '0');
        if (dailyStats[key] && dailyStats[key] > 0) {
            consecutiveDays++;
            checkDate.setDate(checkDate.getDate() - 1);
        } else {
            break;
        }
    }
    
    // 平均每日字数
    var avgDailyWords = 0;
    var daysWithData = 0;
    for (var d = 0; d < 30; d++) {
        var date = new Date();
        date.setDate(date.getDate() - d);
        var key = date.getFullYear() + '-' + 
            String(date.getMonth() + 1).padStart(2, '0') + '-' + 
            String(date.getDate()).padStart(2, '0');
        if (dailyStats[key] && dailyStats[key] > 0) {
            avgDailyWords += dailyStats[key];
            daysWithData++;
        }
    }
    avgDailyWords = daysWithData > 0 ? Math.round(avgDailyWords / daysWithData) : 0;
    
    // 码字速度
    var speedPerHour = 0;
    var speedDays = 0;
    for (var d = 0; d < 7; d++) {
        var date = new Date();
        date.setDate(date.getDate() - d);
        var key = date.getFullYear() + '-' + 
            String(date.getMonth() + 1).padStart(2, '0') + '-' + 
            String(date.getDate()).padStart(2, '0');
        if (dailyStats[key] && dailyStats[key] > 0) {
            speedDays++;
        }
    }
    speedPerHour = speedDays > 0 ? Math.round((weekWords / speedDays) / 2) : 0;
    
    // 分组统计
    var groupStats = {};
    if (groups) {
        for (var i = 0; i < groups.length; i++) {
            var group = groups[i];
            var count = books ? books.filter(function(b) { return b.groupId === group.id; }).length : 0;
            if (count > 0) {
                groupStats[group.name] = count;
            }
        }
    }
    
    return {
        totalBooks: totalBooks,
        totalChapters: totalChapters,
        totalWords: totalWords,
        todayWords: todayWords,
        weekWords: weekWords,
        monthWords: monthWords,
        yearWords: yearWords,
        monthlyStats: monthlyStats,
        dailyStats: dailyStats,
        consecutiveDays: consecutiveDays,
        avgDailyWords: avgDailyWords,
        speedPerHour: speedPerHour,
        groupStats: groupStats,
        totalVolumes: books ? books.reduce(function(sum, b) { return sum + (b.volumes ? b.volumes.length : 0); }, 0) : 0
    };
}

// ========== 拖拽排序系统 ==========

var dragConfig = {
    dragItem: null,
    dragOverItem: null,
    dragStartY: 0,
    dragOffsetY: 0
};

// 初始化拖拽功能
function initDragSort(containerId) {
    var container = document.getElementById(containerId);
    if (!container) return;
    
    // 为容器内的直接子元素添加拖拽属性
    var items = container.children;
    for (var i = 0; i < items.length; i++) {
        var item = items[i];
        if (item.classList && item.classList.contains('drag-item')) {
            setupDragItem(item);
        }
    }
}

function setupDragItem(item) {
    item.setAttribute('draggable', 'true');
    item.style.cursor = 'grab';
    
    item.addEventListener('dragstart', function(e) {
        dragConfig.dragItem = this;
        this.style.opacity = '0.5';
        this.style.border = '2px dashed #007aff';
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', '');
        // 延迟一帧重置样式
        setTimeout(function() {
            if (dragConfig.dragItem) {
                dragConfig.dragItem.style.opacity = '0.5';
            }
        }, 0);
    });
    
    item.addEventListener('dragend', function(e) {
        if (dragConfig.dragItem) {
            dragConfig.dragItem.style.opacity = '1';
            dragConfig.dragItem.style.border = '';
        }
        // 清除所有高亮
        var container = this.parentElement;
        var children = container.children;
        for (var i = 0; i < children.length; i++) {
            children[i].style.border = '';
            children[i].style.boxShadow = '';
        }
        dragConfig.dragItem = null;
        dragConfig.dragOverItem = null;
        // 保存顺序
        saveDragOrder(container.id);
    });
    
    item.addEventListener('dragover', function(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        if (dragConfig.dragItem && dragConfig.dragItem !== this) {
            this.style.border = '2px dashed #007aff';
            this.style.boxShadow = '0 0 12px rgba(0,122,255,0.2)';
            dragConfig.dragOverItem = this;
        }
    });
    
    item.addEventListener('dragleave', function(e) {
        if (this !== dragConfig.dragItem) {
            this.style.border = '';
            this.style.boxShadow = '';
        }
    });
    
    item.addEventListener('drop', function(e) {
        e.preventDefault();
        if (dragConfig.dragItem && dragConfig.dragItem !== this) {
            var container = this.parentElement;
            var dragItem = dragConfig.dragItem;
            var dropItem = this;
            
            // 交换位置
            var dragIndex = Array.from(container.children).indexOf(dragItem);
            var dropIndex = Array.from(container.children).indexOf(dropItem);
            
            if (dragIndex < dropIndex) {
                container.insertBefore(dragItem, dropItem.nextSibling);
            } else {
                container.insertBefore(dragItem, dropItem);
            }
            
            // 重置样式
            dragItem.style.opacity = '1';
            dragItem.style.border = '';
            this.style.border = '';
            this.style.boxShadow = '';
            
            // 保存顺序
            saveDragOrder(container.id);
        }
        dragConfig.dragItem = null;
        dragConfig.dragOverItem = null;
    });
}

// 保存拖拽顺序到 localStorage
function saveDragOrder(containerId) {
    var container = document.getElementById(containerId);
    if (!container) return;
    var items = container.querySelectorAll('.drag-item');
    var order = [];
    for (var i = 0; i < items.length; i++) {
        var id = items[i].getAttribute('data-drag-id') || i;
        order.push(id);
    }
    localStorage.setItem('drag_order_' + containerId, JSON.stringify(order));
}

// 加载拖拽顺序
function loadDragOrder(containerId) {
    var saved = localStorage.getItem('drag_order_' + containerId);
    if (!saved) return null;
    try {
        return JSON.parse(saved);
    } catch(e) {
        return null;
    }
}

// 应用拖拽顺序
function applyDragOrder(containerId) {
    var container = document.getElementById(containerId);
    if (!container) return;
    var order = loadDragOrder(containerId);
    if (!order || order.length === 0) return;
    
    var items = container.querySelectorAll('.drag-item');
    var itemMap = {};
    for (var i = 0; i < items.length; i++) {
        var id = items[i].getAttribute('data-drag-id') || i;
        itemMap[id] = items[i];
    }
    
    for (var i = 0; i < order.length; i++) {
        var id = order[i];
        if (itemMap[id]) {
            container.appendChild(itemMap[id]);
        }
    }
}

// ========== 渲染统计面板 ==========

function renderStatsPage() {
    var container = document.getElementById('statsContainer');
    if (!container) {
        console.warn('statsContainer 不存在');
        return;
    }
    
    var stats = getStatsData();
    console.log('📊 渲染数据:', stats);
    
    // 生成唯一ID用于拖拽排序
    var panelId = 'stats_panel_' + Date.now();
    
    var html = `
        <div id="${panelId}" style="padding:24px; background:var(--panel-bg, rgba(255,255,255,0.95)); min-height:100%;">
            
            <!-- ===== 第一部分：书籍分组（最上面） ===== -->
            <div class="drag-item" data-drag-id="group" style="background:rgba(255,255,255,0.8); border-radius:12px; padding:16px; border:1px solid var(--border-color, rgba(0,0,0,0.06)); margin-bottom:16px; transition: all 0.2s;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                    <div style="font-size:14px; font-weight:600;">📂 书籍分组</div>
                    <div style="font-size:11px; color:#888; opacity:0.5;">↕ 拖拽排序</div>
                </div>
                <div>
                    ${renderGroupStats(stats.groupStats)}
                </div>
            </div>
            
            <!-- ===== 第二部分：顶部统计卡片 - 6个一排 ===== -->
            <div class="drag-item" data-drag-id="stats1" style="background:rgba(255,255,255,0.8); border-radius:12px; padding:16px; border:1px solid var(--border-color, rgba(0,0,0,0.06)); margin-bottom:16px; transition: all 0.2s;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                    <div style="font-size:14px; font-weight:600;">📊 核心指标</div>
                    <div style="font-size:11px; color:#888; opacity:0.5;">↕ 拖拽排序</div>
                </div>
                <div style="display:grid; grid-template-columns:repeat(6, 1fr); gap:12px;">
                    <div style="background:rgba(255,255,255,0.6); border-radius:10px; padding:14px 10px; text-align:center; border:1px solid var(--border-color, rgba(0,0,0,0.04));">
                        <div style="font-size:24px; font-weight:700; color:#007aff;">${stats.totalWords.toLocaleString()}</div>
                        <div style="font-size:11px; color:#888;">总字数</div>
                    </div>
                    <div style="background:rgba(255,255,255,0.6); border-radius:10px; padding:14px 10px; text-align:center; border:1px solid var(--border-color, rgba(0,0,0,0.04));">
                        <div style="font-size:24px; font-weight:700; color:#28a745;">${stats.todayWords.toLocaleString()}</div>
                        <div style="font-size:11px; color:#888;">今日码字</div>
                    </div>
                    <div style="background:rgba(255,255,255,0.6); border-radius:10px; padding:14px 10px; text-align:center; border:1px solid var(--border-color, rgba(0,0,0,0.04));">
                        <div style="font-size:24px; font-weight:700; color:#ff6b35;">${stats.speedPerHour}</div>
                        <div style="font-size:11px; color:#888;">速度 (字/时)</div>
                    </div>
                    <div style="background:rgba(255,255,255,0.6); border-radius:10px; padding:14px 10px; text-align:center; border:1px solid var(--border-color, rgba(0,0,0,0.04));">
                        <div style="font-size:24px; font-weight:700; color:#ffd93d;">🔥 ${stats.consecutiveDays}</div>
                        <div style="font-size:11px; color:#888;">连续码字</div>
                    </div>
                    <div style="background:rgba(255,255,255,0.6); border-radius:10px; padding:14px 10px; text-align:center; border:1px solid var(--border-color, rgba(0,0,0,0.04));">
                        <div style="font-size:24px; font-weight:700; color:#9b784e;">${stats.totalBooks}</div>
                        <div style="font-size:11px; color:#888;">📚 书籍</div>
                    </div>
                    <div style="background:rgba(255,255,255,0.6); border-radius:10px; padding:14px 10px; text-align:center; border:1px solid var(--border-color, rgba(0,0,0,0.04));">
                        <div style="font-size:24px; font-weight:700; color:#a29bfe;">${stats.totalChapters}</div>
                        <div style="font-size:11px; color:#888;">📖 章节</div>
                    </div>
                </div>
            </div>
            
            <!-- ===== 第三部分：本周/本月/今年/总字数 ===== -->
            <div class="drag-item" data-drag-id="stats2" style="background:rgba(255,255,255,0.8); border-radius:12px; padding:16px; border:1px solid var(--border-color, rgba(0,0,0,0.06)); margin-bottom:16px; transition: all 0.2s;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                    <div style="font-size:14px; font-weight:600;">📅 时间统计</div>
                    <div style="font-size:11px; color:#888; opacity:0.5;">↕ 拖拽排序</div>
                </div>
                <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:12px;">
                    <div style="background:rgba(255,255,255,0.6); border-radius:10px; padding:12px 10px; text-align:center; border:1px solid var(--border-color, rgba(0,0,0,0.04));">
                        <div style="font-size:20px; font-weight:700; color:#e67e22;">${stats.weekWords.toLocaleString()}</div>
                        <div style="font-size:11px; color:#888;">📅 本周</div>
                    </div>
                    <div style="background:rgba(255,255,255,0.6); border-radius:10px; padding:12px 10px; text-align:center; border:1px solid var(--border-color, rgba(0,0,0,0.04));">
                        <div style="font-size:20px; font-weight:700; color:#8e44ad;">${stats.monthWords.toLocaleString()}</div>
                        <div style="font-size:11px; color:#888;">📅 本月</div>
                    </div>
                    <div style="background:rgba(255,255,255,0.6); border-radius:10px; padding:12px 10px; text-align:center; border:1px solid var(--border-color, rgba(0,0,0,0.04));">
                        <div style="font-size:20px; font-weight:700; color:#2ecc71;">${stats.yearWords.toLocaleString()}</div>
                        <div style="font-size:11px; color:#888;">📅 今年</div>
                    </div>
                    <div style="background:rgba(255,255,255,0.6); border-radius:10px; padding:12px 10px; text-align:center; border:1px solid var(--border-color, rgba(0,0,0,0.04));">
                        <div style="font-size:20px; font-weight:700; color:#007aff;">${stats.totalWords.toLocaleString()}</div>
                        <div style="font-size:11px; color:#888;">📚 总字数</div>
                    </div>
                </div>
            </div>
            
            <!-- ===== 第四部分：月度趋势（全宽） ===== -->
            <div class="drag-item" data-drag-id="trend" style="background:rgba(255,255,255,0.8); border-radius:12px; padding:16px; border:1px solid var(--border-color, rgba(0,0,0,0.06)); margin-bottom:16px; transition: all 0.2s;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                    <div style="font-size:14px; font-weight:600;">📈 月度码字趋势</div>
                    <div style="font-size:11px; color:#888; opacity:0.5;">↕ 拖拽排序</div>
                </div>
                <div style="height:150px;">
                    ${renderMonthlyChart(stats.monthlyStats)}
                </div>
            </div>
            
            <!-- ===== 第五部分：码字日历 - GitHub 风格（最下面） ===== -->
            <div class="drag-item" data-drag-id="calendar" style="background:rgba(255,255,255,0.8); border-radius:12px; padding:16px; border:1px solid var(--border-color, rgba(0,0,0,0.06)); transition: all 0.2s;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                    <div style="font-size:14px; font-weight:600;">📆 码字日历</div>
                    <div style="font-size:11px; color:#888; opacity:0.5;">↕ 拖拽排序</div>
                </div>
                <div style="overflow-x:auto;">
                    ${renderCalendarHeatmap(stats.dailyStats)}
                </div>
            </div>
            
        </div>
    `;
    
    container.innerHTML = html;
    
    // 初始化拖拽功能
    setTimeout(function() {
        var panelContainer = document.getElementById(panelId);
        if (panelContainer) {
            // 为所有拖拽项设置事件
            var dragItems = panelContainer.querySelectorAll('.drag-item');
            for (var i = 0; i < dragItems.length; i++) {
                setupDragItem(dragItems[i]);
            }
            // 应用保存的顺序
            applyDragOrder(panelId);
        }
    }, 100);
}

// ========== 渲染月度图表（移除蓝色占位块） ==========

function renderMonthlyChart(monthlyStats) {
    var months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
    var maxVal = Math.max.apply(null, Object.values(monthlyStats)) || 1;
    
    var html = '<div style="display:flex; align-items:flex-end; height:130px; gap:4px; padding:0 2px;">';
    for (var i = 0; i < 12; i++) {
        var val = monthlyStats[i] || 0;
        // 计算高度，至少3px可见
        var height = Math.max(3, (val / maxVal) * 115);
        var color = val > 0 ? '#007aff' : '#e8e8e8';
        html += '<div style="flex:1; display:flex; flex-direction:column; align-items:center;">';
        // 柱子 - 去掉底部蓝色占位块，只保留柱子本身
        html += '<div style="width:100%; height:' + height + 'px; background:' + color + '; border-radius:3px 3px 0 0; min-height:3px;"></div>';
        html += '<div style="font-size:9px; color:#888; margin-top:3px;">' + months[i] + '</div>';
        html += '</div>';
    }
    html += '</div>';
    return html;
}

// ========== 渲染分组统计 ==========

function renderGroupStats(groupStats) {
    var keys = Object.keys(groupStats);
    if (keys.length === 0) {
        return '<div style="color:#888; font-size:13px; text-align:center; padding:8px;">暂无分组数据</div>';
    }
    
    var total = 0;
    for (var i = 0; i < keys.length; i++) {
        total += groupStats[keys[i]];
    }
    
    var colors = ['#007aff', '#28a745', '#ff6b35', '#ffd93d', '#a29bfe', '#ff6b81', '#2ed573', '#1e90ff'];
    var html = '';
    for (var i = 0; i < keys.length; i++) {
        var name = keys[i];
        var count = groupStats[name];
        var pct = total > 0 ? Math.round((count / total) * 100) : 0;
        var color = colors[i % colors.length];
        html += '<div style="display:flex; align-items:center; gap:8px; margin:3px 0;">';
        html += '<span style="font-size:12px; flex:0 0 auto; max-width:100px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">' + name + '</span>';
        html += '<div style="flex:1; height:6px; background:#f0f0f0; border-radius:3px; overflow:hidden; min-width:40px;">';
        html += '<div style="height:100%; width:' + pct + '%; background:' + color + '; border-radius:3px;"></div>';
        html += '</div>';
        html += '<span style="font-size:11px; color:#888; flex:0 0 auto; min-width:30px; text-align:right;">' + count + '本</span>';
    }
    return html;
}

// ========== 渲染日历热力图（GitHub 风格） ==========

function renderCalendarHeatmap(dailyStats) {
    var now = new Date();
    var year = now.getFullYear();
    
    // 构建一年 52 周的数据
    var startDate = new Date(year, 0, 1);
    var endDate = new Date(year, 11, 31);
    
    // 获取该年的第 0 周（从周日开始）
    var firstDayOfYear = startDate.getDay(); // 0 = Sunday
    var offsetDays = firstDayOfYear; // 前面需要填充的空白天数
    
    // 构建周数据
    var weeks = [];
    var currentWeek = [];
    
    // 先填充第一周前面的空白天数
    for (var i = 0; i < offsetDays; i++) {
        currentWeek.push(null);
    }
    
    var currentDate = new Date(startDate);
    while (currentDate <= endDate) {
        var key = currentDate.getFullYear() + '-' + 
            String(currentDate.getMonth() + 1).padStart(2, '0') + '-' + 
            String(currentDate.getDate()).padStart(2, '0');
        var value = dailyStats[key] || 0;
        
        currentWeek.push({
            date: new Date(currentDate),
            value: value,
            key: key
        });
        
        if (currentWeek.length === 7) {
            weeks.push(currentWeek);
            currentWeek = [];
        }
        currentDate.setDate(currentDate.getDate() + 1);
    }
    
    // 如果最后一周不满 7 天，补全
    if (currentWeek.length > 0) {
        while (currentWeek.length < 7) {
            currentWeek.push(null);
        }
        weeks.push(currentWeek);
    }
    
    // 如果没有数据，显示空状态
    if (weeks.length === 0 || weeks.every(function(w) { return w.every(function(d) { return d === null; }); })) {
        return '<div style="text-align:center; padding:20px; color:#888;">暂无码字数据</div>';
    }
    
    // 月份名称
    var monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
    var weekDays = ['日', '一', '二', '三', '四', '五', '六'];
    
    // 计算每个月的列数
    var monthCols = {};
    var monthStartCol = 0;
    var currentMonth = startDate.getMonth();
    
    for (var w = 0; w < weeks.length; w++) {
        var week = weeks[w];
        var hasDayInMonth = false;
        for (var d = 0; d < week.length; d++) {
            var day = week[d];
            if (day) {
                var dayMonth = day.date.getMonth();
                if (dayMonth !== currentMonth) {
                    var cols = w - monthStartCol;
                    if (cols > 0) {
                        monthCols[currentMonth] = cols;
                    }
                    currentMonth = dayMonth;
                    monthStartCol = w;
                }
                hasDayInMonth = true;
                break;
            }
        }
    }
    var lastCols = weeks.length - monthStartCol;
    if (lastCols > 0) {
        monthCols[currentMonth] = lastCols;
    }
    
    // 构建 HTML
    var html = '<div style="min-width:700px;">';
    
    // 月份行
    html += '<div style="display:flex; margin-bottom:4px; padding-left:28px;">';
    var colIdx = 0;
    for (var m = 0; m < 12; m++) {
        var cols = monthCols[m] || 0;
        if (cols > 0) {
            html += '<div style="flex: ' + cols + '; font-size:11px; color:#888; text-align:left;">' + monthNames[m] + '</div>';
            colIdx += cols;
        }
    }
    html += '</div>';
    
    // 表格主体
    html += '<div style="display:flex; gap:2px;">';
    
    // 星期几列
    html += '<div style="display:flex; flex-direction:column; gap:2px; padding-right:4px; min-width:24px;">';
    for (var d = 0; d < 7; d++) {
        // 只显示 日、二、四、六
        if (d % 2 === 0) {
            html += '<div style="height:12px; font-size:9px; color:#888; text-align:right; line-height:12px;">' + weekDays[d] + '</div>';
        } else {
            html += '<div style="height:12px;"></div>';
        }
    }
    html += '</div>';
    
    // 周数据列
    for (var w = 0; w < weeks.length; w++) {
        var week = weeks[w];
        html += '<div style="display:flex; flex-direction:column; gap:2px;">';
        for (var d = 0; d < 7; d++) {
            var day = week[d];
            if (day) {
                var value = day.value;
                var isToday = day.date.getFullYear() === now.getFullYear() && 
                              day.date.getMonth() === now.getMonth() && 
                              day.date.getDate() === now.getDate();
                
                // 根据字数确定颜色
                var colorClass = '';
                if (value === 0) {
                    colorClass = '#ebedf0';
                } else if (value < 100) {
                    colorClass = '#c6e48b';
                } else if (value < 500) {
                    colorClass = '#7bc96f';
                } else if (value < 1000) {
                    colorClass = '#239a3b';
                } else {
                    colorClass = '#196127';
                }
                
                var borderStyle = isToday ? 'border:2px solid #007aff;' : '';
                var textColor = value > 500 ? 'white' : '#333';
                var displayText = value > 0 ? (value >= 10000 ? (value/10000).toFixed(1)+'w' : value) : '';
                
                html += '<div style="width:12px; height:12px; background:' + colorClass + '; border-radius:3px; ' + borderStyle + ' display:flex; align-items:center; justify-content:center; font-size:6px; color:' + textColor + '; cursor:pointer;" title="' + day.date.toLocaleDateString() + ': ' + value.toLocaleString() + '字">' + displayText + '</div>';
            } else {
                html += '<div style="width:12px; height:12px;"></div>';
            }
        }
        html += '</div>';
    }
    html += '</div>';
    
    // 图例
    html += '<div style="display:flex; align-items:center; gap:4px; margin-top:8px; font-size:10px; color:#888;">';
    html += '少 <span style="display:inline-block; width:12px; height:12px; background:#ebedf0; border-radius:2px;"></span>';
    html += '<span style="display:inline-block; width:12px; height:12px; background:#c6e48b; border-radius:2px;"></span>';
    html += '<span style="display:inline-block; width:12px; height:12px; background:#7bc96f; border-radius:2px;"></span>';
    html += '<span style="display:inline-block; width:12px; height:12px; background:#239a3b; border-radius:2px;"></span>';
    html += '<span style="display:inline-block; width:12px; height:12px; background:#196127; border-radius:2px;"></span> 多';
    html += '</div>';
    
    html += '</div>';
    return html;
}

// ========== 打开数据面板 ==========

function openStatsPanel() {
    console.log('📊 打开数据面板');
    
    // 先确保数据已加载
    if (typeof loadAllData === 'function') {
        loadAllData();
    }
    
    // 使用现有的 stats 页面
    var existingPage = document.querySelector('.page[data-page="stats"]');
    if (existingPage) {
        switchToTab('stats');
        setTimeout(function() {
            renderStatsPage();
        }, 50);
        return;
    }
    
    // 创建新标签页
    var tabId = 'stats_panel';
    openTabs.push({ id: tabId, title: '📊 数据', type: 'page', pageId: 'stats_panel' });
    renderTabs();
    
    var pagesContainer = document.getElementById('pagesContainer');
    var pageDiv = document.createElement('div');
    pageDiv.className = 'page';
    pageDiv.setAttribute('data-page', tabId);
    pageDiv.innerHTML = '<div id="statsContainer" style="height:100%; overflow:auto;"></div>';
    pagesContainer.appendChild(pageDiv);
    
    setTimeout(function() {
        renderStatsPage();
    }, 50);
    
    switchToTab(tabId);
    
    var sidebar = document.querySelector('.sidebar-menu');
    if (sidebar) sidebar.style.display = 'none';
}

// ========== 加载数据页面 ==========

function loadStatsPage() {
    var container = document.getElementById('statsContainer');
    if (container) {
        renderStatsPage();
    }
}

// ========== 导出 ==========

window.openStatsPanel = openStatsPanel;
window.renderStatsPage = renderStatsPage;
window.getStatsData = getStatsData;
window.loadStatsPage = loadStatsPage;

console.log('📊 数据统计面板加载完成');