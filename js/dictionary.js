// ========== 
console.log('📚 dictionary.js 开始加载...');
// 写作词典工具 ==========

var dictionaryData = {
    entries: [],
    categories: ['人物称谓', '功法境界', '地名势力', '兵器法宝', '灵植异兽', '术语概念', '历史事件', '写作术语'],
    selectedId: null,
    nextId: 1,
    searchKeyword: ''
};

// ========== 默认词典数据 ==========

function getDefaultDictionaryEntries() {
    return [
        // ===== 人物称谓 =====
        { id: 'dict_1', category: '人物称谓', word: '主角', meaning: '故事的核心人物，所有情节围绕其展开', content: '主角是故事的第一视角人物，读者通过其眼睛看世界。主角的性格、成长、遭遇是故事的主线。常见类型：废柴逆袭、天才陨落、穿越重生、系统流等。', tags: ['写作术语', '人物'] },
        { id: 'dict_2', category: '人物称谓', word: '配角', meaning: '故事中次要的人物，推动情节发展', content: '配角是主角身边的辅助角色，包括：伙伴、导师、对手、爱人等。好的配角能让故事更丰满，不能沦为工具人，要有自己的性格和动机。', tags: ['写作术语', '人物'] },
        { id: 'dict_3', category: '人物称谓', word: '反派', meaning: '与主角对立的人物，制造冲突和阻碍', content: '反派是故事的冲突来源。好的反派不是纯粹的恶，而是有自己合理的立场和动机。常见类型：宿敌、幕后黑手、立场对立者、堕落者。', tags: ['写作术语', '人物'] },
        { id: 'dict_4', category: '人物称谓', word: '女主角', meaning: '故事中与主角有情感线的女性角色', content: '女主角是故事的重要人物，通常与主角有爱情线。类型包括：白月光、红颜知己、欢喜冤家、高冷女神、青梅竹马等。', tags: ['写作术语', '人物'] },
        
        // ===== 功法境界 =====
        { id: 'dict_5', category: '功法境界', word: '炼气期', meaning: '修仙第一步，感应天地灵气', content: '炼气期是修仙的入门阶段，修士通过吐纳法门吸收天地灵气，淬炼己身。共分九层，每层实力递增。炼气期修士可施展低级法术，寿命延长至百岁左右。', tags: ['修仙', '境界'] },
        { id: 'dict_6', category: '功法境界', word: '筑基期', meaning: '修仙第二境，铸就道基', content: '筑基期修士已能内视丹田，凝聚真元。筑基成功后可御器飞行，寿命延长至两百岁左右。筑基分为：初期、中期、后期、大圆满。', tags: ['修仙', '境界'] },
        { id: 'dict_7', category: '功法境界', word: '金丹期', meaning: '修仙第三境，凝聚金丹', content: '金丹期是修仙的分水岭，结丹成功意味着正式踏入长生之门。金丹修士可元神出窍，操控法宝，寿命五百岁以上。金丹品质：下品、中品、上品、极品。', tags: ['修仙', '境界'] },
        { id: 'dict_8', category: '功法境界', word: '元婴期', meaning: '修仙第四境，破丹成婴', content: '元婴期修士丹田中金丹化为元婴，可离体遨游，即便肉身被毁也可夺舍重生。元婴修士可施展大神通，寿命千年以上。', tags: ['修仙', '境界'] },
        { id: 'dict_9', category: '功法境界', word: '化神期', meaning: '修仙第五境，元神化神', content: '化神期是修仙的高阶境界，修士可将元神与天地大道相合，掌控一方天地之力。化神修士寿命可达五千年。', tags: ['修仙', '境界'] },
        { id: 'dict_10', category: '功法境界', word: '御剑境', meaning: '剑道修炼境界，可御剑飞行', content: '御剑境是剑修的重要境界，修士能以剑意驾驭飞剑，御剑飞行。御剑境共分九品，一品最低，九品最高。', tags: ['修仙', '剑道'] },
        
        // ===== 地名势力 =====
        { id: 'dict_11', category: '地名势力', word: '青云阁', meaning: '修仙宗门，以剑法闻名', content: '青云阁是修仙界知名剑修宗门，位于青云山脉。阁中弟子修炼《青云剑诀》，以快剑著称。现任阁主为青云剑尊。', tags: ['修仙', '宗门'] },
        { id: 'dict_12', category: '地名势力', word: '月影楼', meaning: '神秘杀手组织，擅长暗杀', content: '月影楼是修仙界最神秘的杀手组织，成员皆蒙面，以月影为号。只要付得起代价，没有杀不了的人。', tags: ['修仙', '组织'] },
        { id: 'dict_13', category: '地名势力', word: '玄天宗', meaning: '修仙大派，正道领袖之一', content: '玄天宗是修仙界正道六大宗门之首，以玄天功法闻名。宗门规矩森严，弟子注重品德修行。', tags: ['修仙', '宗门'] },
        { id: 'dict_14', category: '地名势力', word: '落星宗', meaning: '擅长星象占卜的修仙宗门', content: '落星宗位于落星原，以观星术闻名。宗中弟子擅长卜算、阵法，能借星辰之力施展法术。', tags: ['修仙', '宗门'] },
        { id: 'dict_15', category: '地名势力', word: '魔渊', meaning: '魔道势力，与正道对立', content: '魔渊是修仙界最大的魔道势力，位于极北之地。魔道修士修炼魔功，行事不拘一格，是正道的大敌。', tags: ['修仙', '魔道'] },
        { id: 'dict_16', category: '地名势力', word: '冰雪宫', meaning: '位于极北的修仙宗门，擅长冰系功法', content: '冰雪宫是极北之地最强大的宗门，宫主为冰雪女帝。宗中弟子以冰系功法闻名，性格冷若冰霜。', tags: ['修仙', '宗门'] },
        
        // ===== 兵器法宝 =====
        { id: 'dict_17', category: '兵器法宝', word: '青冥剑', meaning: '上古神剑，传说中的神兵利器', content: '青冥剑是上古时期铸造的神剑，剑身青色如冥火，剑锋凌厉无匹。传说此剑封印着上古剑魂，能择主而侍。', tags: ['修仙', '法宝'] },
        { id: 'dict_18', category: '兵器法宝', word: '霜华玲珑塔', meaning: '上古法器，可镇封邪魔', content: '霜华玲珑塔是天阶法宝，通体冰晶剔透，共九层。塔中蕴含极寒之气，可镇压邪魔、净化灵气。', tags: ['修仙', '法宝'] },
        { id: 'dict_19', category: '兵器法宝', word: '混铁炉', meaning: '奇珍异宝，可用于锻造兵器', content: '混铁炉是炼器师的至宝，外表古朴无华，却能熔炼天下金属。有传言说混铁炉中封印着器灵。', tags: ['修仙', '法宝'] },
        { id: 'dict_20', category: '兵器法宝', word: '紫霄幻月指', meaning: '玄阶上品指法，能让人陷入幻境', content: '紫霄幻月指是玄阶上品功法，练至大成者可在指尖凝出幻月之力，击出时使人陷入月下幻境，丧失抵抗之力。', tags: ['修仙', '功法'] },
        
        // ===== 灵植异兽 =====
        { id: 'dict_21', category: '灵植异兽', word: '幽瞳影蛇', meaning: '三阶妖兽，速度快，能释放幻术', content: '幽瞳影蛇是生活在南疆十万大山的妖兽，速度极快如鬼魅，双目可释放幻术迷惑猎物。蛇胆是炼药珍品。', tags: ['修仙', '妖兽'] },
        { id: 'dict_22', category: '灵植异兽', word: '啸月狼', meaning: '妖兽，月圆之夜会啸月，实力暴增', content: '啸月狼是群居妖兽，以狼王为首。月圆之夜会聚集啸月，吸收月华之力，实力大幅提升。', tags: ['修仙', '妖兽'] },
        { id: 'dict_23', category: '灵植异兽', word: '烛龙', meaning: '上古神兽，掌管昼夜交替', content: '烛龙是传说中的上古神兽，形如巨龙，通体赤红。睁眼为昼，闭眼为夜，掌控着天地间的昼夜交替。', tags: ['修仙', '神兽'] },
        
        // ===== 术语概念 =====
        { id: 'dict_24', category: '术语概念', word: '世界观', meaning: '故事发生的世界背景设定', content: '世界观是故事的底层设定，包括：地理、历史、文化、修炼体系、势力格局等。好的世界观能让故事更真实、更宏大。', tags: ['写作术语'] },
        { id: 'dict_25', category: '术语概念', word: '剧情线', meaning: '故事的主要情节走向', content: '剧情线是故事的主脉络，包括：主线（核心剧情）、支线（辅助剧情）、暗线（伏笔埋线）。好的剧情线应该环环相扣、层层递进。', tags: ['写作术语'] },
        { id: 'dict_26', category: '术语概念', word: '人设', meaning: '人物设定，角色的性格、背景、能力等', content: '人设是角色的完整设定，包括：性格特征、外貌描述、背景经历、能力特长、人际关系等。好的人设让角色活起来。', tags: ['写作术语'] },
        { id: 'dict_27', category: '术语概念', word: '伏笔', meaning: '埋设在文中的暗示，为后文做铺垫', content: '伏笔是作者在文中提前埋下的线索，通常不引人注意，但在后续剧情中会起到重要作用。好的伏笔让人恍然大悟、回味无穷。', tags: ['写作术语'] },
        { id: 'dict_28', category: '术语概念', word: '爽点', meaning: '让读者感到愉悦的剧情设计', content: '爽点是网络小说中最核心的元素之一，包括：打脸反转、扮猪吃虎、装逼打脸、甜宠恋爱、金手指爆发等。爽点设计要合理有铺垫。', tags: ['写作术语'] },
        { id: 'dict_29', category: '术语概念', word: '金手指', meaning: '主角的特殊优势或能力', content: '金手指是主角区别于常人的特殊能力或优势，如：系统、重生、穿越、稀有天赋、神秘法宝等。金手指不能太过无敌，要有合理限制。', tags: ['写作术语'] },
        { id: 'dict_30', category: '术语概念', word: '系统', meaning: '网文中常见的金手指形式，以系统面板形式存在', content: '系统是网文中最常见的金手指形式，以虚拟面板形式出现，可发布任务、发放奖励、显示数据。系统文要处理好系统与人物成长的关系。', tags: ['写作术语'] },
        
        // ===== 历史事件 =====
        { id: 'dict_31', category: '历史事件', word: '神魔大战', meaning: '上古时期神族与魔族的大战', content: '神魔大战是上古时期最惨烈的战争，神族与魔族争夺天地主宰权。最终神族惨胜，将魔族封印于九幽之下。', tags: ['修仙', '历史'] },
        { id: 'dict_32', category: '历史事件', word: '九龙夺嫡', meaning: '太初历210年的皇位争夺事件', content: '九龙夺嫡是太初历210年发生的事件，九位皇子为争夺帝位展开血腥争斗，最终明帝在众皇子中脱颖而出，登基称帝。', tags: ['历史'] },
        
        // ===== 写作术语 =====
        { id: 'dict_33', category: '写作术语', word: '开篇', meaning: '小说的开头部分，需要吸引读者', content: '开篇是小说的第一印象，需在三章内抓住读者。常见开篇方式：冲突开场、悬念开场、日常切入、倒叙开场。网文黄金三章原则：第一章立人设，第二章出冲突，第三章解悬念。', tags: ['写作技巧'] },
        { id: 'dict_34', category: '写作术语', word: '节奏', meaning: '剧情的推进速度和张弛', content: '节奏是小说的生命线。张弛有度是核心：战斗场面要快节奏、短促有力；文戏场面要慢节奏、细腻刻画。不要一直高潮，也不要一直平淡。', tags: ['写作技巧'] },
        { id: 'dict_35', category: '写作术语', word: '网文黄金三章', meaning: '网文写作的核心法则：前三章必须抓住读者', content: '黄金三章法则：第一章（建立人设）让读者喜欢主角，第二章（引出冲突）让读者产生好奇，第三章（解决/升级冲突）让读者有期待。', tags: ['写作技巧'] },
        { id: 'dict_36', category: '写作术语', word: '打斗描写', meaning: '战斗场景的写作技巧', content: '好的打斗描写不是简单的"他打出一拳"，要包含：动作细节（如何打的）、环境反馈（打中后周围的变化）、心理活动（打的人和被打的人在想什么）。多用短句，节奏要快。', tags: ['写作技巧'] }
    ];
}

// ========== 数据操作 ==========

function getDictionaryData() {
    var bookId = currentBookId || 'global';
    var key = 'openwrite_dictionary_' + bookId;
    var saved = localStorage.getItem(key);
    if (saved) {
        try {
            var data = JSON.parse(saved);
            dictionaryData.entries = data.entries || [];
            dictionaryData.categories = data.categories || ['人物称谓', '功法境界', '地名势力', '兵器法宝', '灵植异兽', '术语概念', '历史事件', '写作术语'];
            dictionaryData.selectedId = data.selectedId || null;
            dictionaryData.nextId = data.nextId || 1;
            return;
        } catch(e) {}
    }
    // 没有数据，使用默认数据
    dictionaryData.entries = getDefaultDictionaryEntries();
    dictionaryData.categories = ['人物称谓', '功法境界', '地名势力', '兵器法宝', '灵植异兽', '术语概念', '历史事件', '写作术语'];
    dictionaryData.selectedId = dictionaryData.entries.length > 0 ? dictionaryData.entries[0].id : null;
    dictionaryData.nextId = 1000;
    saveDictionaryData();
}

function saveDictionaryData() {
    var bookId = currentBookId || 'global';
    var key = 'openwrite_dictionary_' + bookId;
    var data = {
        entries: dictionaryData.entries,
        categories: dictionaryData.categories,
        selectedId: dictionaryData.selectedId,
        nextId: dictionaryData.nextId
    };
    localStorage.setItem(key, JSON.stringify(data));
}

function getDictionaryEntry(id) {
    return dictionaryData.entries.find(function(e) { return e.id === id; });
}

function getEntriesByCategory(category) {
    if (!category) return dictionaryData.entries;
    return dictionaryData.entries.filter(function(e) { return e.category === category; });
}

function genDictionaryId() {
    return 'dict_' + (dictionaryData.nextId++);
}

function searchDictionary(keyword) {
    if (!keyword || !keyword.trim()) return dictionaryData.entries;
    var kw = keyword.trim().toLowerCase();
    return dictionaryData.entries.filter(function(e) {
        return e.word.toLowerCase().indexOf(kw) !== -1 ||
               e.meaning.toLowerCase().indexOf(kw) !== -1 ||
               e.content.toLowerCase().indexOf(kw) !== -1 ||
               (e.tags && e.tags.join('').toLowerCase().indexOf(kw) !== -1);
    });
}

// ========== 添加/编辑/删除 ==========

function addDictionaryEntry(word, category, meaning, content, tags) {
    var newEntry = {
        id: genDictionaryId(),
        word: word.trim(),
        category: category || '术语概念',
        meaning: meaning || '',
        content: content || '',
        tags: tags || []
    };
    dictionaryData.entries.push(newEntry);
    dictionaryData.selectedId = newEntry.id;
    saveDictionaryData();
    renderDictionaryTree();
    updateDictionaryEditor();
    renderCompactDictionaryTree();
    updateCompactDictionaryEditor();
    return newEntry;
}

function updateDictionaryEntry(id, word, category, meaning, content, tags) {
    var entry = getDictionaryEntry(id);
    if (!entry) return;
    entry.word = word.trim();
    entry.category = category || '术语概念';
    entry.meaning = meaning || '';
    entry.content = content || '';
    entry.tags = tags || [];
    saveDictionaryData();
    renderDictionaryTree();
    updateDictionaryEditor();
    renderCompactDictionaryTree();
    updateCompactDictionaryEditor();
}

function deleteDictionaryEntry(id) {
    var entry = getDictionaryEntry(id);
    if (!entry) return;
    if (!confirm('确定删除词条「' + entry.word + '」吗？')) return;
    dictionaryData.entries = dictionaryData.entries.filter(function(e) { return e.id !== id; });
    if (dictionaryData.selectedId === id) {
        dictionaryData.selectedId = dictionaryData.entries.length > 0 ? dictionaryData.entries[0].id : null;
    }
    saveDictionaryData();
    renderDictionaryTree();
    updateDictionaryEditor();
    renderCompactDictionaryTree();
    updateCompactDictionaryEditor();
}

// ========== 全屏模式渲染 ==========

function renderDictionaryTree() {
    var container = document.getElementById('dictionaryTree');
    if (!container) return;
    container.innerHTML = '';
    
    var categories = dictionaryData.categories;
    var hasContent = false;
    
    categories.forEach(function(cat) {
        var entries = getEntriesByCategory(cat);
        if (entries.length === 0) return;
        hasContent = true;
        
        var catDiv = document.createElement('div');
        catDiv.className = 'dict-category-group';
        catDiv.style.cssText = 'margin-bottom:8px;';
        
        var catHeader = document.createElement('div');
        catHeader.style.cssText = 'font-size:11px;color:#888;padding:4px 8px;font-weight:600;';
        catHeader.textContent = cat + ' (' + entries.length + ')';
        catDiv.appendChild(catHeader);
        
        entries.forEach(function(entry) {
            var div = document.createElement('div');
            div.className = 'dict-entry-item';
            div.style.cssText = 'display:flex;align-items:center;gap:6px;padding:4px 10px;margin:1px 0;border-radius:4px;cursor:pointer;transition:background 0.15s;font-size:13px;';
            if (dictionaryData.selectedId === entry.id) {
                div.style.background = 'rgba(0,122,255,0.12)';
                div.style.fontWeight = '500';
            }
            div.setAttribute('data-id', entry.id);
            div.innerHTML = '<span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">' + entry.word + '</span>' +
                '<span style="font-size:10px;color:#888;flex-shrink:0;">' + (entry.tags && entry.tags.length > 0 ? entry.tags[0] : '') + '</span>';
            div.onclick = function() {
                selectDictionaryEntry(entry.id);
            };
            catDiv.appendChild(div);
        });
        container.appendChild(catDiv);
    });
    
    if (!hasContent) {
        container.innerHTML = '<div style="padding:20px;text-align:center;color:#888;font-size:13px;">暂无词条，点击"新增"添加</div>';
    }
}

function selectDictionaryEntry(id) {
    dictionaryData.selectedId = id;
    saveDictionaryData();
    renderDictionaryTree();
    updateDictionaryEditor();
    renderCompactDictionaryTree();
    updateCompactDictionaryEditor();
}

function updateDictionaryEditor() {
    var entry = getDictionaryEntry(dictionaryData.selectedId);
    var wordInput = document.getElementById('dictEditorWord');
    var catSelect = document.getElementById('dictEditorCategory');
    var meaningInput = document.getElementById('dictEditorMeaning');
    var contentArea = document.getElementById('dictEditorContent');
    var tagsInput = document.getElementById('dictEditorTags');
    var statusEl = document.getElementById('dictStatus');
    
    if (!wordInput || !contentArea) return;
    
    if (entry) {
        wordInput.value = entry.word || '';
        catSelect.value = entry.category || '术语概念';
        meaningInput.value = entry.meaning || '';
        contentArea.value = entry.content || '';
        tagsInput.value = (entry.tags || []).join('，');
        statusEl.textContent = '已选择：' + entry.word;
        var deleteBtn = document.getElementById('dictDeleteBtn');
        if (deleteBtn) deleteBtn.style.display = 'inline-block';
    } else {
        wordInput.value = '';
        catSelect.value = '术语概念';
        meaningInput.value = '';
        contentArea.value = '';
        tagsInput.value = '';
        statusEl.textContent = '请选择一个词条';
        var deleteBtn = document.getElementById('dictDeleteBtn');
        if (deleteBtn) deleteBtn.style.display = 'none';
    }
}

function saveDictionaryNode() {
    var entry = getDictionaryEntry(dictionaryData.selectedId);
    var wordInput = document.getElementById('dictEditorWord');
    var catSelect = document.getElementById('dictEditorCategory');
    var meaningInput = document.getElementById('dictEditorMeaning');
    var contentArea = document.getElementById('dictEditorContent');
    var tagsInput = document.getElementById('dictEditorTags');
    
    if (!entry) {
        // 新建词条
        var word = wordInput.value.trim();
        if (!word) { alert('请输入词条名'); return; }
        var category = catSelect.value;
        var meaning = meaningInput.value.trim();
        var content = contentArea.value;
        var tags = tagsInput.value.split(/[，,、\s]+/).filter(function(t) { return t.trim(); });
        addDictionaryEntry(word, category, meaning, content, tags);
        document.getElementById('dictStatus').textContent = '✅ 已添加';
        setTimeout(function() {
            document.getElementById('dictStatus').textContent = '已就绪';
        }, 1500);
        return;
    }
    
    var word = wordInput.value.trim();
    if (!word) { alert('请输入词条名'); return; }
    entry.word = word;
    entry.category = catSelect.value;
    entry.meaning = meaningInput.value.trim();
    entry.content = contentArea.value;
    entry.tags = tagsInput.value.split(/[，,、\s]+/).filter(function(t) { return t.trim(); });
    saveDictionaryData();
    renderDictionaryTree();
    updateDictionaryEditor();
    renderCompactDictionaryTree();
    updateCompactDictionaryEditor();
    document.getElementById('dictStatus').textContent = '✅ 已保存';
    setTimeout(function() {
        document.getElementById('dictStatus').textContent = '已保存';
    }, 1500);
}

function addNewDictionaryEntry() {
    // 清空编辑器，准备新建
    document.getElementById('dictEditorWord').value = '';
    document.getElementById('dictEditorMeaning').value = '';
    document.getElementById('dictEditorContent').value = '';
    document.getElementById('dictEditorTags').value = '';
    document.getElementById('dictEditorCategory').value = '术语概念';
    document.getElementById('dictStatus').textContent = '📝 新建词条';
    dictionaryData.selectedId = null;
    renderDictionaryTree();
    document.getElementById('dictEditorWord').focus();
}

// ========== 全屏模式打开/关闭 ==========

function openDictionaryPanel() {
    var existingPage = document.querySelector('.page[data-page="dictionary_panel"]');
    if (existingPage) {
        switchToTab('dictionary_panel');
        return;
    }
    var bookId = currentBookId || 'global';
    var tabId = 'dictionary_panel';
    openTabs.push({ id: tabId, title: '📚 词典', type: 'dictionary', bookId: bookId });
    renderTabs();
    var pagesContainer = document.getElementById('pagesContainer');
    var pageDiv = document.createElement('div');
    pageDiv.className = 'page';
    pageDiv.setAttribute('data-page', tabId);
    pageDiv.innerHTML = renderDictionaryPage();
    pagesContainer.appendChild(pageDiv);
    getDictionaryData();
    renderDictionaryTree();
    updateDictionaryEditor();
    initDictionaryEvents();
    switchToTab(tabId);
    var sidebar = document.querySelector('.sidebar-menu');
    if (sidebar) sidebar.style.display = 'none';
}

function closeDictionaryPanel() {
    closeTab('dictionary_panel');
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

function renderDictionaryPage() {
    var categoriesOptions = dictionaryData.categories.map(function(cat) {
        return '<option value="' + cat + '">' + cat + '</option>';
    }).join('');
    
    return `
        <div class="dictionary-container" style="display:flex;height:100%;width:100%;">
            <div class="dictionary-sidebar" style="width:280px;min-width:200px;max-width:400px;background:var(--panel-bg, rgba(255,255,255,0.95));backdrop-filter:blur(8px);border-right:1px solid var(--border-color, rgba(0,0,0,0.08));display:flex;flex-direction:column;flex-shrink:0;position:relative;overflow:visible;">
                <div class="dictionary-sidebar-header" style="display:flex;justify-content:space-between;align-items:center;padding:12px 16px;background:rgba(0,0,0,0.03);border-bottom:1px solid var(--border-color, rgba(0,0,0,0.08));flex-shrink:0;">
                    <span style="font-weight:600;">📚 词典目录</span>
                    <div style="display:flex;gap:6px;">
                        <button id="dictAddRootBtn" title="新增词条" style="background:none;border:none;cursor:pointer;font-size:16px;">
                            <img src="icons/folder.svg" width="16" height="16" alt="新增词条">
                        </button>
                        <button id="dictRefreshBtn" title="刷新" style="background:none;border:none;cursor:pointer;font-size:16px;">
                            <img src="icons/refresh.svg" width="16" height="16" alt="刷新">
                        </button>
                        <button id="dictCloseBtn" title="关闭" style="background:none;border:none;cursor:pointer;font-size:16px;">
                            <img src="icons/close.svg" width="16" height="16" alt="关闭">
                        </button>
                    </div>
                </div>
                <div style="padding:8px 12px;flex-shrink:0;">
                    <input type="text" id="dictSearchInput" placeholder="搜索词条..." style="width:100%;padding:6px 10px 6px 32px;border:1px solid var(--border-color, #ddd);border-radius:6px;font-size:12px;background:var(--input-bg, #f8f8f8) url('icons/search.svg') no-repeat 8px center;background-size:16px 16px;color:var(--text-color, #333);">
                </div>
                <div style="display:flex;gap:6px;padding:0 12px 8px 12px;flex-shrink:0;">
                    <button id="dictAddEntryBtn" title="新增词条" style="flex:1;background:#28a745;color:white;border:none;border-radius:4px;cursor:pointer;font-size:12px;padding:5px 0;font-weight:500;">+ 词条</button>
                    <button id="dictAddCategoryBtn" title="新增分类" style="flex:1;background:#9b784e;color:white;border:none;border-radius:4px;cursor:pointer;font-size:12px;padding:5px 0;font-weight:500;">
                        <img src="icons/folder.svg" width="14" height="14" alt="分类" style="vertical-align:middle; margin-right:4px;"> 分类
                    </button>
                </div>
                <div id="dictionaryTree" style="flex:1;overflow-y:auto;padding:8px 4px;"></div>
                <div style="padding:8px 12px;border-top:1px solid var(--border-color, rgba(0,0,0,0.08));font-size:11px;color:#888;display:flex;justify-content:space-between;flex-shrink:0;">
                    <span>词条: <span id="dictNodeCount">0</span></span>
                    <span>💡 点击选择 · 双击编辑</span>
                </div>
                <div id="dictResizeHandle" style="position:absolute;right:-4px;top:0;width:6px;height:100%;cursor:ew-resize;background:transparent;z-index:10;transition:background 0.2s;"></div>
            </div>
            <div class="dictionary-editor" style="flex:1;display:flex;flex-direction:column;background:var(--panel-bg, rgba(255,255,255,0.9));overflow:hidden;">
                <div style="display:flex;justify-content:space-between;align-items:center;padding:12px 20px;border-bottom:1px solid var(--border-color, rgba(0,0,0,0.08));flex-shrink:0;flex-wrap:wrap;gap:8px;">
                    <div style="display:flex;align-items:center;gap:8px;flex:1;min-width:200px;">
                        <input type="text" id="dictEditorWord" placeholder="词条名" style="font-size:18px;font-weight:600;border:none;background:transparent;outline:none;flex:1;color:var(--text-color, #333);min-width:80px;">
                        <select id="dictEditorCategory" style="padding:4px 8px;border:1px solid var(--border-color, #ddd);border-radius:4px;font-size:12px;background:transparent;color:var(--text-color, #333);">
                            ${categoriesOptions}
                        </select>
                    </div>
                    <div style="display:flex;gap:8px;flex-wrap:wrap;">
                        <button id="dictPinBtn" title="收起为侧边栏" style="padding:6px 12px;background:#6c757d;color:white;border:none;border-radius:6px;cursor:pointer;font-size:13px;">
                            <img src="icons/label.svg" width="14" height="14" alt="缩起" style="vertical-align:middle; margin-right:4px;"> 缩起
                        </button>
                        <button id="dictSaveBtn" style="padding:6px 16px;background:#9b784e;color:white;border:none;border-radius:6px;cursor:pointer;">
                            <img src="icons/toolbar.svg" width="14" height="14" alt="保存" style="vertical-align:middle; margin-right:4px;"> 保存
                        </button>
                        <button id="dictDeleteBtn" style="padding:6px 16px;background:#dc3545;color:white;border:none;border-radius:6px;cursor:pointer;">
                            <img src="icons/trash.svg" width="14" height="14" alt="删除" style="vertical-align:middle; margin-right:4px;"> 删除
                        </button>
                    </div>
                </div>
                <div style="padding:4px 20px;border-bottom:1px solid var(--border-color, rgba(0,0,0,0.05));flex-shrink:0;display:flex;gap:12px;align-items:center;flex-wrap:wrap;">
                    <input type="text" id="dictEditorMeaning" placeholder="简短释义..." style="flex:1;padding:4px 8px;border:1px solid var(--border-color, #ddd);border-radius:4px;font-size:13px;background:transparent;color:var(--text-color, #333);min-width:120px;">
                    <input type="text" id="dictEditorTags" placeholder="标签（逗号分隔）" style="flex:1;padding:4px 8px;border:1px solid var(--border-color, #ddd);border-radius:4px;font-size:12px;background:transparent;color:var(--text-color, #333);min-width:120px;">
                </div>
                <textarea id="dictEditorContent" style="flex:1;padding:20px;border:none;outline:none;resize:none;font-size:14px;line-height:1.8;background:transparent;color:var(--text-color, #333);font-family:inherit;" placeholder="详细内容..."></textarea>
                <div class="dictionary-status-bar" style="padding:8px 20px;border-top:1px solid var(--border-color, rgba(0,0,0,0.08));display:flex;justify-content:space-between;font-size:12px;color:#888;flex-shrink:0;">
                    <span id="dictWordCount">0 字</span>
                    <span id="dictStatus">已就绪</span>
                </div>
            </div>
        </div>
    `;
}

function initDictionaryEvents() {
    var closeBtn = document.getElementById('dictCloseBtn');
    if (closeBtn) closeBtn.onclick = closeDictionaryPanel;
    var saveBtn = document.getElementById('dictSaveBtn');
    if (saveBtn) saveBtn.onclick = saveDictionaryNode;
    var deleteBtn = document.getElementById('dictDeleteBtn');
    if (deleteBtn) deleteBtn.onclick = function() {
        if (dictionaryData.selectedId) {
            deleteDictionaryEntry(dictionaryData.selectedId);
        }
    };
    var addEntryBtn = document.getElementById('dictAddEntryBtn');
    if (addEntryBtn) addEntryBtn.onclick = addNewDictionaryEntry;
    var addRootBtn = document.getElementById('dictAddRootBtn');
    if (addRootBtn) addRootBtn.onclick = addNewDictionaryEntry;
    var addCategoryBtn = document.getElementById('dictAddCategoryBtn');
    if (addCategoryBtn) {
        addCategoryBtn.onclick = function() {
            var newCat = prompt('请输入新分类名称：');
            if (newCat && newCat.trim() && dictionaryData.categories.indexOf(newCat.trim()) === -1) {
                dictionaryData.categories.push(newCat.trim());
                saveDictionaryData();
                renderDictionaryTree();
                updateDictionaryEditor();
                renderCompactDictionaryTree();
                updateCompactDictionaryEditor();
                // 刷新分类下拉框
                var catSelect = document.getElementById('dictEditorCategory');
                if (catSelect) {
                    catSelect.innerHTML = dictionaryData.categories.map(function(c) {
                        return '<option value="' + c + '">' + c + '</option>';
                    }).join('');
                }
                alert('分类 "' + newCat.trim() + '" 已添加');
            } else if (newCat && dictionaryData.categories.indexOf(newCat.trim()) !== -1) {
                alert('分类已存在');
            }
        };
    }
    var refreshBtn = document.getElementById('dictRefreshBtn');
    if (refreshBtn) {
        refreshBtn.onclick = function() {
            getDictionaryData();
            renderDictionaryTree();
            updateDictionaryEditor();
            renderCompactDictionaryTree();
            updateCompactDictionaryEditor();
        };
    }
    var searchInput = document.getElementById('dictSearchInput');
    if (searchInput) {
        searchInput.oninput = function() {
            var keyword = this.value.trim().toLowerCase();
            var container = document.getElementById('dictionaryTree');
            if (!keyword) { renderDictionaryTree(); return; }
            var results = searchDictionary(keyword);
            container.innerHTML = '';
            if (results.length === 0) {
                container.innerHTML = '<div style="padding:20px;text-align:center;color:#888;font-size:13px;">未找到匹配词条</div>';
                return;
            }
            results.forEach(function(entry) {
                var div = document.createElement('div');
                div.style.cssText = 'display:flex;align-items:center;gap:6px;padding:4px 10px;margin:1px 0;border-radius:4px;cursor:pointer;transition:background 0.15s;font-size:13px;';
                if (dictionaryData.selectedId === entry.id) {
                    div.style.background = 'rgba(0,122,255,0.12)';
                    div.style.fontWeight = '500';
                }
                div.setAttribute('data-id', entry.id);
                div.innerHTML = '<span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">' + entry.word + '</span>' +
                    '<span style="font-size:10px;color:#888;">' + entry.category + '</span>';
                div.onclick = function() {
                    selectDictionaryEntry(entry.id);
                };
                container.appendChild(div);
            });
        };
    }
    var pinBtn = document.getElementById('dictPinBtn');
    if (pinBtn) {
        pinBtn.onclick = function() {
            closeDictionaryPanel();
            setTimeout(function() {
                openDictionarySidebar('dictionary');
            }, 150);
        };
    }
    var contentArea = document.getElementById('dictEditorContent');
    var wordInput = document.getElementById('dictEditorWord');
    var meaningInput = document.getElementById('dictEditorMeaning');
    var tagsInput = document.getElementById('dictEditorTags');
    var catSelect = document.getElementById('dictEditorCategory');
    var saveTimer = null;
    
    function autoSave() {
        var entry = getDictionaryEntry(dictionaryData.selectedId);
        if (!entry) return;
        var word = wordInput.value.trim();
        if (!word) { return; }
        entry.word = word;
        entry.category = catSelect.value;
        entry.meaning = meaningInput.value.trim();
        entry.content = contentArea.value;
        entry.tags = tagsInput.value.split(/[，,、\s]+/).filter(function(t) { return t.trim(); });
        saveDictionaryData();
        renderDictionaryTree();
        renderCompactDictionaryTree();
        document.getElementById('dictStatus').textContent = '✅ 已保存';
        setTimeout(function() {
            document.getElementById('dictStatus').textContent = '已保存';
        }, 1000);
    }
    
    if (contentArea) {
        contentArea.oninput = function() {
            document.getElementById('dictWordCount').textContent = this.value.length + ' 字';
            document.getElementById('dictStatus').textContent = '✏️ 未保存';
            clearTimeout(saveTimer);
            saveTimer = setTimeout(autoSave, 500);
        };
    }
    if (wordInput) {
        wordInput.oninput = function() {
            clearTimeout(saveTimer);
            saveTimer = setTimeout(autoSave, 500);
        };
    }
    if (meaningInput) {
        meaningInput.oninput = function() {
            clearTimeout(saveTimer);
            saveTimer = setTimeout(autoSave, 500);
        };
    }
    if (tagsInput) {
        tagsInput.oninput = function() {
            clearTimeout(saveTimer);
            saveTimer = setTimeout(autoSave, 500);
        };
    }
    if (catSelect) {
        catSelect.onchange = function() {
            clearTimeout(saveTimer);
            saveTimer = setTimeout(autoSave, 500);
        };
    }
    
    var handle = document.getElementById('dictResizeHandle');
    var sidebar = document.querySelector('.dictionary-sidebar');
    if (handle && sidebar) {
        var isResizing = false;
        var startX = 0;
        var startWidth = 0;
        handle.onmousedown = function(e) {
            e.preventDefault();
            isResizing = true;
            startX = e.clientX;
            startWidth = sidebar.offsetWidth;
            document.body.style.cursor = 'ew-resize';
            document.onmousemove = function(ev) {
                if (!isResizing) return;
                var newWidth = startWidth + (ev.clientX - startX);
                if (newWidth < 150) newWidth = 150;
                if (newWidth > 400) newWidth = 400;
                sidebar.style.width = newWidth + 'px';
                sidebar.style.minWidth = newWidth + 'px';
            };
            document.onmouseup = function() {
                isResizing = false;
                document.body.style.cursor = '';
                document.onmousemove = null;
                document.onmouseup = null;
            };
        };
        handle.onmouseenter = function() { this.style.background = 'rgba(0,122,255,0.4)'; };
        handle.onmouseleave = function() { this.style.background = 'transparent'; };
    }
    updateDictionaryNodeCount();
}

function updateDictionaryNodeCount() {
    var count = dictionaryData.entries.length;
    var el = document.getElementById('dictNodeCount');
    if (el) el.textContent = count;
}

// ====================================================================
// ========== 浮动面板（紧凑模式 - 侧边栏） ==========
// ====================================================================

function openDictionarySidebar(tool) {
    // 如果 tool 是 undefined 或 null，设置默认值
    if (!tool) {
        tool = 'dictionary';
        console.log('📚 tool 参数为空，自动设置为:', tool);
    }
    console.log('openDictionarySidebar 被调用，工具:', tool);
    
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
        panel.setAttribute('data-tool', tool);
        panel.style.cssText = 'width:420px;min-width:350px;max-width:550px;height:100%;background:var(--panel-bg, rgba(255,255,255,0.98));backdrop-filter:blur(12px);border-left:1px solid var(--border-color, rgba(0,0,0,0.08));border-right:1px solid var(--border-color, rgba(0,0,0,0.08));display:flex;flex-direction:column;flex-shrink:0;overflow:hidden;z-index:10;transition:width 0.2s ease;box-shadow:-2px 0 12px rgba(0,0,0,0.08);';
        
        // 先把 panel 添加到 DOM
        var editor = document.querySelector('.detail-editor');
        if (editor && editor.nextSibling) {
            detailMain.insertBefore(panel, editor.nextSibling);
        } else {
            detailMain.appendChild(panel);
        }
        
        // 渲染词典紧凑面板
        try {
            panel.innerHTML = renderCompactDictionaryPanel();
            getDictionaryData();
            // 延迟执行确保 DOM 已更新
            setTimeout(function() {
                renderCompactDictionaryTree();
                updateCompactDictionaryEditor();
                bindCompactDictionaryEvents();
            }, 50);
        } catch(e) {
            console.error('词典面板渲染失败:', e);
            panel.innerHTML = '<div style="padding:20px;text-align:center;color:#888;">词典加载失败，请刷新后重试</div>';
        }
    }
    setTimeout(function() {
        var toolItems = document.querySelectorAll('.sidebar-tool-item');
        toolItems.forEach(function(item) {
            if (item.getAttribute('data-tool') === tool) {
                item.style.background = 'rgba(0,122,255,0.15)';
                item.style.borderRadius = '8px';
                item.style.color = '#007aff';
            } else {
                item.style.background = '';
                item.style.borderRadius = '';
                item.style.color = '';
            }
        });
    }, 200);
}

function closeDictionaryFloatingPanel() {
    var panel = document.getElementById('floatingToolPanel');
    if (panel) { panel.remove(); }
    var rightSidebar = document.getElementById('rightSidebar');
    if (rightSidebar) {
        rightSidebar.style.width = '48px';
        rightSidebar.style.minWidth = '48px';
    }
}

function renderCompactDictionaryPanel() {
    var categoriesOptions = dictionaryData.categories.map(function(cat) {
        return '<option value="' + cat + '">' + cat + '</option>';
    }).join('');
    
    return `
        <div style="display:flex;flex-direction:column;height:100%;width:100%;">
            <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 14px;border-bottom:1px solid var(--border-color, rgba(0,0,0,0.08));flex-shrink:0;">
                <span style="font-weight:600;font-size:14px;">📚 词典</span>
                <div style="display:flex;gap:4px;">
                    <button id="compactDictExpandBtn" title="新窗口打开" style="background:none;border:none;cursor:pointer;font-size:14px;padding:2px 8px;border-radius:4px;">⤢</button>
                    <button id="compactDictCloseBtn" title="关闭面板" style="background:none;border:none;cursor:pointer;font-size:14px;padding:2px 8px;border-radius:4px;">✕</button>
                </div>
            </div>
            <div style="display:flex;flex:1;overflow:hidden;">
                <div style="width:38%;min-width:120px;max-width:180px;border-right:1px solid var(--border-color, rgba(0,0,0,0.08));display:flex;flex-direction:column;overflow:hidden;">
                    <div style="padding:4px 8px;flex-shrink:0;">
                        <input type="text" id="compactDictSearch" placeholder="搜索..." style="width:100%;padding:6px 10px 6px 32px;border:1px solid var(--border-color, #ddd);border-radius:6px;font-size:12px;background:var(--input-bg, #f8f8f8) url('icons/search.svg') no-repeat 8px center;background-size:16px 16px;color:var(--text-color, #333);">
                    </div>
                    <div style="display:flex;gap:6px;padding:4px 8px 6px 8px;flex-shrink:0;">
                        <button id="compactDictAddBtn" title="新增词条" style="flex:1;background:#28a745;color:white;border:none;border-radius:4px;cursor:pointer;font-size:12px;padding:4px 0;font-weight:500;">➕ 词条</button>
                        <button id="compactDictAddCategoryBtn" title="新增分类" style="flex:1;background:#9b784e;color:white;border:none;border-radius:4px;cursor:pointer;font-size:12px;padding:4px 0;font-weight:500;">📁 分类</button>
                    </div>
                    <div id="compactDictionaryTree" style="flex:1;overflow-y:auto;padding:4px 4px;"></div>
                    <div style="padding:3px 10px;border-top:1px solid var(--border-color, rgba(0,0,0,0.08));font-size:10px;color:#888;flex-shrink:0;display:flex;justify-content:space-between;">
                        <span>词条: <span id="compactDictNodeCount">0</span></span>
                        <span>📌 点击选择</span>
                    </div>
                </div>
                <div style="flex:1;display:flex;flex-direction:column;overflow:hidden;min-width:150px;">
                    <div style="padding:6px 12px;border-bottom:1px solid var(--border-color, rgba(0,0,0,0.08));flex-shrink:0;display:flex;gap:6px;align-items:center;flex-wrap:wrap;">
                        <input type="text" id="compactDictWord" placeholder="词条名" style="flex:1;font-size:15px;font-weight:600;border:none;background:transparent;outline:none;color:var(--text-color, #333);min-width:60px;">
                        <select id="compactDictCategory" style="padding:2px 6px;border:1px solid var(--border-color, #ddd);border-radius:4px;font-size:11px;background:transparent;color:var(--text-color, #333);">
                            ${categoriesOptions}
                        </select>
                        <button id="compactDictSaveBtn" title="保存" style="background:#9b784e;color:white;border:none;border-radius:4px;cursor:pointer;font-size:11px;padding:2px 10px;">💾</button>
                    </div>
                    <input type="text" id="compactDictMeaning" placeholder="简短释义..." style="padding:4px 12px;border:none;border-bottom:1px solid var(--border-color, rgba(0,0,0,0.05));font-size:12px;background:transparent;color:var(--text-color, #333);outline:none;flex-shrink:0;">
                    <textarea id="compactDictContent" style="flex:1;padding:10px 12px;border:none;outline:none;resize:none;font-size:13px;line-height:1.8;background:transparent;color:var(--text-color, #333);font-family:inherit;" placeholder="详细内容..."></textarea>
                    <div style="padding:3px 12px;border-top:1px solid var(--border-color, rgba(0,0,0,0.08));font-size:10px;color:#888;display:flex;justify-content:space-between;flex-shrink:0;">
                        <span id="compactDictWordCount">0 字</span>
                        <span id="compactDictStatus">已就绪</span>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function renderCompactDictionaryTree() {
    var container = document.getElementById('compactDictionaryTree');
    if (!container) return;
    container.innerHTML = '';
    
    var categories = dictionaryData.categories;
    var hasContent = false;
    
    categories.forEach(function(cat) {
        var entries = getEntriesByCategory(cat);
        if (entries.length === 0) return;
        hasContent = true;
        
        var catDiv = document.createElement('div');
        catDiv.style.cssText = 'margin-bottom:4px;';
        var catHeader = document.createElement('div');
        catHeader.style.cssText = 'font-size:10px;color:#888;padding:2px 6px;font-weight:600;';
        catHeader.textContent = cat + ' (' + entries.length + ')';
        catDiv.appendChild(catHeader);
        
        entries.forEach(function(entry) {
            var div = document.createElement('div');
            div.className = 'compact-dict-entry';
            div.style.cssText = 'display:flex;align-items:center;gap:4px;padding:2px 8px;margin:1px 0;border-radius:4px;cursor:pointer;transition:background 0.15s;font-size:12px;';
            if (dictionaryData.selectedId === entry.id) {
                div.style.background = 'rgba(0,122,255,0.12)';
                div.style.fontWeight = '500';
            }
            div.setAttribute('data-id', entry.id);
            div.innerHTML = '<span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">' + entry.word + '</span>';
            div.onclick = function() {
                selectDictionaryEntry(entry.id);
            };
            catDiv.appendChild(div);
        });
        container.appendChild(catDiv);
    });
    
    if (!hasContent) {
        container.innerHTML = '<div style="padding:12px;text-align:center;color:#888;font-size:12px;">暂无词条</div>';
    }
    
    var countEl = document.getElementById('compactDictNodeCount');
    if (countEl) countEl.textContent = dictionaryData.entries.length;
}
function renderCompactDictionaryTree() {
    var container = document.getElementById('compactDictionaryTree');
    console.log('🔍 renderCompactDictionaryTree 被调用');
    console.log('🔍 container 元素:', container);
    
    if (!container) {
        console.warn('⚠️ compactDictionaryTree 元素不存在！');
        // 尝试等待一下再重试
        setTimeout(function() {
            console.log('🔄 重试渲染词典树...');
            renderCompactDictionaryTree();
        }, 100);
        return;
    }
    
    console.log('🔄 开始渲染词典树，词条数:', dictionaryData.entries.length);
    container.innerHTML = '';
    
    var categories = dictionaryData.categories;
    var hasContent = false;
    
    categories.forEach(function(cat) {
        var entries = getEntriesByCategory(cat);
        if (entries.length === 0) return;
        hasContent = true;
        
        var catDiv = document.createElement('div');
        catDiv.style.cssText = 'margin-bottom:4px;';
        var catHeader = document.createElement('div');
        catHeader.style.cssText = 'font-size:10px;color:#888;padding:2px 6px;font-weight:600;';
        catHeader.textContent = cat + ' (' + entries.length + ')';
        catDiv.appendChild(catHeader);
        
        entries.forEach(function(entry) {
            var div = document.createElement('div');
            div.className = 'compact-dict-entry';
            div.style.cssText = 'display:flex;align-items:center;gap:4px;padding:2px 8px;margin:1px 0;border-radius:4px;cursor:pointer;transition:background 0.15s;font-size:12px;';
            if (dictionaryData.selectedId === entry.id) {
                div.style.background = 'rgba(0,122,255,0.12)';
                div.style.fontWeight = '500';
            }
            div.setAttribute('data-id', entry.id);
            div.innerHTML = '<span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">' + entry.word + '</span>';
            div.onclick = function() {
                selectDictionaryEntry(entry.id);
            };
            catDiv.appendChild(div);
        });
        container.appendChild(catDiv);
    });
    
    if (!hasContent) {
        container.innerHTML = '<div style="padding:12px;text-align:center;color:#888;font-size:12px;">暂无词条</div>';
    }
    
    var countEl = document.getElementById('compactDictNodeCount');
    if (countEl) countEl.textContent = dictionaryData.entries.length;
    console.log('✅ 词典树渲染完成，共', dictionaryData.entries.length, '个词条');
}
function updateCompactDictionaryEditor() {
    var entry = getDictionaryEntry(dictionaryData.selectedId);
    var wordInput = document.getElementById('compactDictWord');
    var catSelect = document.getElementById('compactDictCategory');
    var meaningInput = document.getElementById('compactDictMeaning');
    var contentArea = document.getElementById('compactDictContent');
    var statusEl = document.getElementById('compactDictStatus');
    var wordCount = document.getElementById('compactDictWordCount');
    
    if (entry) {
        if (wordInput) wordInput.value = entry.word || '';
        if (catSelect) catSelect.value = entry.category || '术语概念';
        if (meaningInput) meaningInput.value = entry.meaning || '';
        if (contentArea) contentArea.value = entry.content || '';
        if (statusEl) statusEl.textContent = '已选择：' + entry.word;
        if (wordCount) wordCount.textContent = (entry.content || '').length + ' 字';
    } else {
        if (wordInput) wordInput.value = '';
        if (catSelect) catSelect.value = '术语概念';
        if (meaningInput) meaningInput.value = '';
        if (contentArea) contentArea.value = '';
        if (statusEl) statusEl.textContent = '请选择一个词条';
        if (wordCount) wordCount.textContent = '0 字';
    }
}

function bindCompactDictionaryEvents() {
    var addBtn = document.getElementById('compactDictAddBtn');
    if (addBtn) {
        addBtn.onclick = function() {
            // 清空编辑器，准备新建
            document.getElementById('compactDictWord').value = '';
            document.getElementById('compactDictMeaning').value = '';
            document.getElementById('compactDictContent').value = '';
            document.getElementById('compactDictCategory').value = '术语概念';
            document.getElementById('compactDictStatus').textContent = '📝 新建词条';
            dictionaryData.selectedId = null;
            renderCompactDictionaryTree();
            document.getElementById('compactDictWord').focus();
        };
    }
    
    var addCategoryBtn = document.getElementById('compactDictAddCategoryBtn');
    if (addCategoryBtn) {
        addCategoryBtn.onclick = function() {
            var newCat = prompt('请输入新分类名称：');
            if (newCat && newCat.trim() && dictionaryData.categories.indexOf(newCat.trim()) === -1) {
                dictionaryData.categories.push(newCat.trim());
                saveDictionaryData();
                renderCompactDictionaryTree();
                updateCompactDictionaryEditor();
                // 刷新分类下拉框
                var catSelect = document.getElementById('compactDictCategory');
                if (catSelect) {
                    catSelect.innerHTML = dictionaryData.categories.map(function(c) {
                        return '<option value="' + c + '">' + c + '</option>';
                    }).join('');
                }
                alert('分类 "' + newCat.trim() + '" 已添加');
            } else if (newCat && dictionaryData.categories.indexOf(newCat.trim()) !== -1) {
                alert('分类已存在');
            }
        };
    }
    
    var expandBtn = document.getElementById('compactDictExpandBtn');
    if (expandBtn) {
        expandBtn.onclick = function() {
            openDictionaryInNewWindow();
        };
    }
    
    var closeBtn = document.getElementById('compactDictCloseBtn');
    if (closeBtn) {
        closeBtn.onclick = function() {
            closeDictionaryFloatingPanel();
            var rightSidebar = document.getElementById('rightSidebar');
            if (rightSidebar) {
                rightSidebar.style.width = '48px';
                rightSidebar.style.minWidth = '48px';
            }
            var toolItems = document.querySelectorAll('.sidebar-tool-item');
            toolItems.forEach(function(item) {
                if (item.getAttribute('data-tool') === 'dictionary') {
                    item.style.background = '';
                    item.style.borderRadius = '';
                    item.style.color = '';
                }
            });
        };
    }
    
    var saveBtn = document.getElementById('compactDictSaveBtn');
    if (saveBtn) {
        saveBtn.onclick = function() {
            var entry = getDictionaryEntry(dictionaryData.selectedId);
            var wordInput = document.getElementById('compactDictWord');
            var catSelect = document.getElementById('compactDictCategory');
            var meaningInput = document.getElementById('compactDictMeaning');
            var contentArea = document.getElementById('compactDictContent');
            
            if (!entry) {
                // 新建词条
                var word = wordInput.value.trim();
                if (!word) { alert('请输入词条名'); return; }
                var category = catSelect.value;
                var meaning = meaningInput.value.trim();
                var content = contentArea.value;
                addDictionaryEntry(word, category, meaning, content, []);
                document.getElementById('compactDictStatus').textContent = '✅ 已添加';
                setTimeout(function() {
                    document.getElementById('compactDictStatus').textContent = '已就绪';
                }, 1500);
                return;
            }
            
            var word = wordInput.value.trim();
            if (!word) { alert('请输入词条名'); return; }
            entry.word = word;
            entry.category = catSelect.value;
            entry.meaning = meaningInput.value.trim();
            entry.content = contentArea.value;
            saveDictionaryData();
            renderCompactDictionaryTree();
            updateCompactDictionaryEditor();
            document.getElementById('compactDictStatus').textContent = '✅ 已保存';
            setTimeout(function() {
                document.getElementById('compactDictStatus').textContent = '已就绪';
            }, 1500);
        };
    }
    
    var searchInput = document.getElementById('compactDictSearch');
    if (searchInput) {
        searchInput.oninput = function() {
            var keyword = this.value.trim().toLowerCase();
            var container = document.getElementById('compactDictionaryTree');
            if (!keyword) { renderCompactDictionaryTree(); return; }
            var results = searchDictionary(keyword);
            container.innerHTML = '';
            if (results.length === 0) {
                container.innerHTML = '<div style="padding:12px;text-align:center;color:#888;font-size:12px;">未找到匹配词条</div>';
                return;
            }
            results.forEach(function(entry) {
                var div = document.createElement('div');
                div.style.cssText = 'display:flex;align-items:center;gap:4px;padding:2px 8px;margin:1px 0;border-radius:4px;cursor:pointer;transition:background 0.15s;font-size:12px;';
                if (dictionaryData.selectedId === entry.id) {
                    div.style.background = 'rgba(0,122,255,0.12)';
                    div.style.fontWeight = '500';
                }
                div.setAttribute('data-id', entry.id);
                div.innerHTML = '<span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">' + entry.word + '</span>';
                div.onclick = function() {
                    selectDictionaryEntry(entry.id);
                };
                container.appendChild(div);
            });
        };
    }
    
    // 自动保存
    var contentArea = document.getElementById('compactDictContent');
    var wordInput = document.getElementById('compactDictWord');
    var meaningInput = document.getElementById('compactDictMeaning');
    var catSelect = document.getElementById('compactDictCategory');
    var saveTimer = null;
    
    function autoSaveCompact() {
        var entry = getDictionaryEntry(dictionaryData.selectedId);
        if (!entry) return;
        var word = wordInput.value.trim();
        if (!word) return;
        entry.word = word;
        entry.category = catSelect.value;
        entry.meaning = meaningInput.value.trim();
        entry.content = contentArea.value;
        saveDictionaryData();
        renderCompactDictionaryTree();
        document.getElementById('compactDictStatus').textContent = '✅ 已保存';
        setTimeout(function() {
            document.getElementById('compactDictStatus').textContent = '已就绪';
        }, 1000);
    }
    
    if (contentArea) {
        contentArea.oninput = function() {
            document.getElementById('compactDictWordCount').textContent = this.value.length + ' 字';
            document.getElementById('compactDictStatus').textContent = '✏️ 未保存';
            clearTimeout(saveTimer);
            saveTimer = setTimeout(autoSaveCompact, 500);
        };
    }
    if (wordInput) {
        wordInput.oninput = function() {
            clearTimeout(saveTimer);
            saveTimer = setTimeout(autoSaveCompact, 500);
        };
    }
    if (meaningInput) {
        meaningInput.oninput = function() {
            clearTimeout(saveTimer);
            saveTimer = setTimeout(autoSaveCompact, 500);
        };
    }
    if (catSelect) {
        catSelect.onchange = function() {
            clearTimeout(saveTimer);
            saveTimer = setTimeout(autoSaveCompact, 500);
        };
    }
}

// ========== 新窗口打开 ==========

function openDictionaryInNewWindow() {
    closeDictionaryFloatingPanel();
    getDictionaryData();
    
    var dataJson = JSON.stringify(dictionaryData);
    var bookId = currentBookId || 'global';
    var categoriesOptions = dictionaryData.categories.map(function(cat) {
        return '<option value="' + cat + '">' + cat + '</option>';
    }).join('');
    
    var html = `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>📚 词典 - 全屏编辑</title>
<style>
* { margin:0; padding:0; box-sizing:border-box; }
body { font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif; background:#f0f2f5; height:100vh; overflow:hidden; }
.dictionary-container { display:flex; height:100vh; width:100%; }
.dictionary-sidebar { width:300px; min-width:220px; max-width:450px; background:rgba(255,255,255,0.95); backdrop-filter:blur(8px); border-right:1px solid rgba(0,0,0,0.08); display:flex; flex-direction:column; flex-shrink:0; overflow:hidden; }
.dictionary-sidebar-header { display:flex; justify-content:space-between; align-items:center; padding:12px 16px; background:rgba(0,0,0,0.03); border-bottom:1px solid rgba(0,0,0,0.08); flex-shrink:0; }
.dictionary-sidebar-header span { font-weight:600; font-size:15px; }
.dictionary-sidebar-header button { background:none; border:none; cursor:pointer; font-size:16px; padding:0 4px; }
.dictionary-search { padding:8px 12px; flex-shrink:0; }
.dictionary-search input { width:100%; padding:6px 10px; border:1px solid #ddd; border-radius:6px; font-size:13px; background:#f8f8f8; }
.dictionary-add-buttons { display:flex; gap:6px; padding:0 12px 8px 12px; flex-shrink:0; }
.dictionary-add-buttons button { flex:1; border:none; border-radius:4px; cursor:pointer; font-size:12px; padding:5px 0; font-weight:500; color:white; }
.dictionary-add-buttons .add-entry { background:#28a745; }
.dictionary-add-buttons .add-category { background:#9b784e; }
#dictionaryTree { flex:1; overflow-y:auto; padding:8px 4px; }
.dictionary-status { padding:6px 12px; border-top:1px solid rgba(0,0,0,0.08); font-size:11px; color:#888; display:flex; justify-content:space-between; flex-shrink:0; }
.dictionary-editor { flex:1; display:flex; flex-direction:column; background:rgba(255,255,255,0.9); overflow:hidden; }
.dictionary-editor-header { display:flex; justify-content:space-between; align-items:center; padding:12px 20px; border-bottom:1px solid rgba(0,0,0,0.08); flex-shrink:0; flex-wrap:wrap; gap:8px; }
.dictionary-editor-header .word-cat { display:flex; align-items:center; gap:8px; flex:1; min-width:200px; }
.dictionary-editor-header .word-cat input { font-size:18px; font-weight:600; border:none; background:transparent; outline:none; flex:1; color:#333; min-width:80px; }
.dictionary-editor-header .word-cat select { padding:4px 8px; border:1px solid #ddd; border-radius:4px; font-size:12px; background:transparent; color:#333; }
.dictionary-editor-header .actions { display:flex; gap:8px; flex-wrap:wrap; }
.dictionary-editor-header .actions button { padding:6px 16px; border:none; border-radius:6px; cursor:pointer; font-size:13px; }
.dictionary-editor-header .actions .save-btn { background:#9b784e; color:white; }
.dictionary-editor-header .actions .delete-btn { background:#dc3545; color:white; }
.dictionary-editor-meaning { padding:4px 20px; border-bottom:1px solid rgba(0,0,0,0.05); flex-shrink:0; }
.dictionary-editor-meaning input { width:100%; padding:4px 8px; border:1px solid #ddd; border-radius:4px; font-size:13px; background:transparent; color:#333; }
.dictionary-editor-content { flex:1; padding:20px; border:none; outline:none; resize:none; font-size:14px; line-height:1.8; background:transparent; color:#333; font-family:inherit; }
.dictionary-status-bar { padding:8px 20px; border-top:1px solid rgba(0,0,0,0.08); display:flex; justify-content:space-between; font-size:12px; color:#888; flex-shrink:0; }
::-webkit-scrollbar { width:6px; height:6px; }
::-webkit-scrollbar-thumb { background:rgba(136,136,136,0.4); border-radius:3px; }
::-webkit-scrollbar-track { background:transparent; }
.dict-category-group { margin-bottom:8px; }
.dict-category-group .cat-header { font-size:11px; color:#888; padding:4px 8px; font-weight:600; }
.dict-entry-item { display:flex; align-items:center; gap:6px; padding:4px 10px; margin:1px 0; border-radius:4px; cursor:pointer; transition:background 0.15s; font-size:13px; }
.dict-entry-item:hover { background:rgba(0,0,0,0.05); }
.dict-entry-item.active { background:rgba(0,122,255,0.12); font-weight:500; }
.dict-entry-item .word { flex:1; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.dict-entry-item .tag { font-size:10px; color:#888; flex-shrink:0; }
</style>
</head>
<body>
<div class="dictionary-container">
<div class="dictionary-sidebar">
<div class="dictionary-sidebar-header">
<span>📚 词典目录</span>
<div>
<button id="winAddEntry" title="新增词条">➕</button>
<button id="winRefresh" title="刷新">🔄</button>
</div>
</div>
<div class="dictionary-search"><input type="text" id="winSearch" placeholder="🔍 搜索词条..."></div>
<div class="dictionary-add-buttons">
    <button class="add-entry" id="winAddEntryBtn">➕ 词条</button>
    <button class="add-category" id="winAddCategoryBtn">📁 分类</button>
</div>
<div id="dictionaryTree"></div>
<div class="dictionary-status"><span>词条: <span id="winNodeCount">0</span></span><span>💡 点击选择 · 双击编辑</span></div>
</div>
<div class="dictionary-editor">
<div class="dictionary-editor-header">
<div class="word-cat">
<input type="text" id="winWord" placeholder="词条名">
<select id="winCategory">
    ${categoriesOptions}
</select>
</div>
<div class="actions">
<button class="save-btn" id="winSave">💾 保存</button>
<button class="delete-btn" id="winDelete">🗑 删除</button>
</div>
</div>
<div class="dictionary-editor-meaning">
<input type="text" id="winMeaning" placeholder="简短释义...">
</div>
<textarea id="winContent" class="dictionary-editor-content" placeholder="详细内容..."></textarea>
<div class="dictionary-status-bar"><span id="winWordCount">0 字</span><span id="winStatus">已就绪</span></div>
</div>
</div>
<script>
var dictionaryData = ${dataJson};
var currentBookId = ${bookId};
var selectedId = ${dictionaryData.selectedId ? JSON.stringify(dictionaryData.selectedId) : 'null'};

function getDictionaryEntry(id) {
    return dictionaryData.entries.find(function(e) { return e.id === id; });
}
function getEntriesByCategory(category) {
    return dictionaryData.entries.filter(function(e) { return e.category === category; });
}
function saveDictionaryData() {
    var key = 'openwrite_dictionary_' + (currentBookId || 'global');
    var data = { entries: dictionaryData.entries, categories: dictionaryData.categories, selectedId: selectedId, nextId: dictionaryData.nextId || 1 };
    localStorage.setItem(key, JSON.stringify(data));
    if (window.opener && window.opener.window) {
        try { window.opener.window.location.reload(); } catch(e) {}
    }
}
function selectEntry(id) { selectedId = id; renderTree(); updateEditor(); saveDictionaryData(); }
function renderTree() {
    var container = document.getElementById('dictionaryTree');
    if (!container) return;
    container.innerHTML = '';
    var categories = dictionaryData.categories;
    var hasContent = false;
    categories.forEach(function(cat) {
        var entries = getEntriesByCategory(cat);
        if (entries.length === 0) return;
        hasContent = true;
        var catDiv = document.createElement('div');
        catDiv.className = 'dict-category-group';
        var catHeader = document.createElement('div');
        catHeader.className = 'cat-header';
        catHeader.textContent = cat + ' (' + entries.length + ')';
        catDiv.appendChild(catHeader);
        entries.forEach(function(entry) {
            var div = document.createElement('div');
            div.className = 'dict-entry-item' + (selectedId === entry.id ? ' active' : '');
            div.setAttribute('data-id', entry.id);
            div.innerHTML = '<span class="word">' + entry.word + '</span><span class="tag">' + (entry.tags && entry.tags.length > 0 ? entry.tags[0] : '') + '</span>';
            div.onclick = function() { selectEntry(entry.id); };
            div.ondblclick = function() { 
                var newWord = prompt('重命名：', entry.word);
                if (newWord && newWord.trim()) { entry.word = newWord.trim(); saveDictionaryData(); renderTree(); updateEditor(); }
            };
            catDiv.appendChild(div);
        });
        container.appendChild(catDiv);
    });
    if (!hasContent) {
        container.innerHTML = '<div style="padding:20px;text-align:center;color:#888;font-size:13px;">暂无词条</div>';
    }
    document.getElementById('winNodeCount').textContent = dictionaryData.entries.length;
}
function updateEditor() {
    var entry = getDictionaryEntry(selectedId);
    var wordInput = document.getElementById('winWord');
    var catSelect = document.getElementById('winCategory');
    var meaningInput = document.getElementById('winMeaning');
    var contentArea = document.getElementById('winContent');
    var statusEl = document.getElementById('winStatus');
    var wordCount = document.getElementById('winWordCount');
    var deleteBtn = document.getElementById('winDelete');
    if (entry) {
        wordInput.value = entry.word || '';
        catSelect.value = entry.category || '术语概念';
        meaningInput.value = entry.meaning || '';
        contentArea.value = entry.content || '';
        statusEl.textContent = '已选择：' + entry.word;
        wordCount.textContent = (entry.content || '').length + ' 字';
        deleteBtn.style.display = 'inline-block';
    } else {
        wordInput.value = '';
        catSelect.value = '术语概念';
        meaningInput.value = '';
        contentArea.value = '';
        statusEl.textContent = '请选择一个词条';
        wordCount.textContent = '0 字';
        deleteBtn.style.display = 'none';
    }
}
function saveNode() {
    var entry = getDictionaryEntry(selectedId);
    var wordInput = document.getElementById('winWord');
    var catSelect = document.getElementById('winCategory');
    var meaningInput = document.getElementById('winMeaning');
    var contentArea = document.getElementById('winContent');
    if (!entry) {
        var word = wordInput.value.trim();
        if (!word) { alert('请输入词条名'); return; }
        var newEntry = { id: 'dict_' + (dictionaryData.nextId || 100), word: word, category: catSelect.value, meaning: meaningInput.value.trim(), content: contentArea.value, tags: [] };
        dictionaryData.nextId = (dictionaryData.nextId || 100) + 1;
        dictionaryData.entries.push(newEntry);
        selectedId = newEntry.id;
        saveDictionaryData();
        renderTree();
        updateEditor();
        document.getElementById('winStatus').textContent = '✅ 已添加';
        setTimeout(function() { document.getElementById('winStatus').textContent = '已保存'; }, 1500);
        return;
    }
    var word = wordInput.value.trim();
    if (!word) { alert('请输入词条名'); return; }
    entry.word = word;
    entry.category = catSelect.value;
    entry.meaning = meaningInput.value.trim();
    entry.content = contentArea.value;
    saveDictionaryData();
    renderTree();
    updateEditor();
    document.getElementById('winStatus').textContent = '✅ 已保存';
    setTimeout(function() { document.getElementById('winStatus').textContent = '已保存'; }, 1500);
}
function deleteNode() {
    var entry = getDictionaryEntry(selectedId);
    if (!entry) return;
    if (confirm('确定删除词条「' + entry.word + '」吗？')) {
        dictionaryData.entries = dictionaryData.entries.filter(function(e) { return e.id !== selectedId; });
        selectedId = dictionaryData.entries.length > 0 ? dictionaryData.entries[0].id : null;
        saveDictionaryData();
        renderTree();
        updateEditor();
    }
}
function addCategory() {
    var newCat = prompt('请输入新分类名称：');
    if (newCat && newCat.trim() && dictionaryData.categories.indexOf(newCat.trim()) === -1) {
        dictionaryData.categories.push(newCat.trim());
        saveDictionaryData();
        renderTree();
        updateEditor();
        var catSelect = document.getElementById('winCategory');
        if (catSelect) {
            catSelect.innerHTML = dictionaryData.categories.map(function(c) {
                return '<option value="' + c + '">' + c + '</option>';
            }).join('');
        }
        alert('分类 "' + newCat.trim() + '" 已添加');
    } else if (newCat && dictionaryData.categories.indexOf(newCat.trim()) !== -1) {
        alert('分类已存在');
    }
}
document.getElementById('winAddEntry').onclick = function() {
    document.getElementById('winWord').value = '';
    document.getElementById('winMeaning').value = '';
    document.getElementById('winContent').value = '';
    document.getElementById('winCategory').value = '术语概念';
    document.getElementById('winStatus').textContent = '📝 新建词条';
    selectedId = null;
    renderTree();
    document.getElementById('winWord').focus();
};
document.getElementById('winAddEntryBtn').onclick = function() {
    document.getElementById('winWord').value = '';
    document.getElementById('winMeaning').value = '';
    document.getElementById('winContent').value = '';
    document.getElementById('winCategory').value = '术语概念';
    document.getElementById('winStatus').textContent = '📝 新建词条';
    selectedId = null;
    renderTree();
    document.getElementById('winWord').focus();
};
document.getElementById('winAddCategoryBtn').onclick = addCategory;
document.getElementById('winRefresh').onclick = function() { renderTree(); updateEditor(); };
document.getElementById('winSave').onclick = saveNode;
document.getElementById('winDelete').onclick = deleteNode;
document.getElementById('winSearch').oninput = function() {
    var keyword = this.value.trim().toLowerCase();
    var container = document.getElementById('dictionaryTree');
    if (!keyword) { renderTree(); return; }
    var results = dictionaryData.entries.filter(function(e) {
        return e.word.toLowerCase().indexOf(keyword) !== -1 ||
               e.meaning.toLowerCase().indexOf(keyword) !== -1 ||
               e.content.toLowerCase().indexOf(keyword) !== -1;
    });
    container.innerHTML = '';
    if (results.length === 0) {
        container.innerHTML = '<div style="padding:20px;text-align:center;color:#888;font-size:13px;">未找到匹配词条</div>';
        return;
    }
    results.forEach(function(entry) {
        var div = document.createElement('div');
        div.className = 'dict-entry-item' + (selectedId === entry.id ? ' active' : '');
        div.setAttribute('data-id', entry.id);
        div.innerHTML = '<span class="word">' + entry.word + '</span><span class="tag">' + entry.category + '</span>';
        div.onclick = function() { selectEntry(entry.id); };
        container.appendChild(div);
    });
};
var saveTimer = null;
document.getElementById('winContent').oninput = function() {
    var entry = getDictionaryEntry(selectedId);
    if (entry) {
        entry.content = this.value;
        document.getElementById('winWordCount').textContent = this.value.length + ' 字';
        document.getElementById('winStatus').textContent = '✏️ 未保存';
        clearTimeout(saveTimer);
        saveTimer = setTimeout(function() {
            saveDictionaryData();
            document.getElementById('winStatus').textContent = '✅ 已保存';
            setTimeout(function() { document.getElementById('winStatus').textContent = '已保存'; }, 1000);
        }, 500);
    }
};
document.getElementById('winWord').oninput = function() {
    var entry = getDictionaryEntry(selectedId);
    if (entry && this.value.trim()) {
        entry.word = this.value.trim();
        clearTimeout(saveTimer);
        saveTimer = setTimeout(function() {
            saveDictionaryData();
            renderTree();
        }, 500);
    }
};
document.getElementById('winMeaning').oninput = function() {
    var entry = getDictionaryEntry(selectedId);
    if (entry) {
        entry.meaning = this.value.trim();
        clearTimeout(saveTimer);
        saveTimer = setTimeout(function() {
            saveDictionaryData();
        }, 500);
    }
};
document.getElementById('winCategory').onchange = function() {
    var entry = getDictionaryEntry(selectedId);
    if (entry) {
        entry.category = this.value;
        clearTimeout(saveTimer);
        saveTimer = setTimeout(function() {
            saveDictionaryData();
            renderTree();
        }, 500);
    }
};
document.addEventListener('keydown', function(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); saveNode(); }
});
renderTree();
updateEditor();
console.log('词典窗口已打开');
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

function bindDictionaryToolEntry() {
    var dictTool = document.querySelector('.sidebar-tool-item[data-tool="dictionary"]');
    if (dictTool) {
        dictTool.onclick = function() {
            var existingPanel = document.getElementById('floatingToolPanel');
            if (existingPanel) {
                var panelTool = existingPanel.getAttribute('data-tool');
                if (panelTool === 'dictionary') {
                    closeDictionaryFloatingPanel();
                    var toolItems = document.querySelectorAll('.sidebar-tool-item');
                    toolItems.forEach(function(item) {
                        if (item.getAttribute('data-tool') === 'dictionary') {
                            item.style.background = '';
                            item.style.borderRadius = '';
                            item.style.color = '';
                        }
                    });
                } else {
                    closeDictionaryFloatingPanel();
                    openDictionarySidebar('dictionary');
                }
            } else {
                openDictionarySidebar('dictionary');
            }
        };
    }
}

// ========== 导出 ==========
window.openDictionaryPanel = openDictionaryPanel;
window.closeDictionaryPanel = closeDictionaryPanel;
window.openDictionarySidebar = openDictionarySidebar;
window.closeDictionaryFloatingPanel = closeDictionaryFloatingPanel;
window.openDictionaryInNewWindow = openDictionaryInNewWindow;
window.dictionaryData = dictionaryData;
window.getDictionaryData = getDictionaryData;
window.saveDictionaryData = saveDictionaryData;
window.addDictionaryEntry = addDictionaryEntry;
window.deleteDictionaryEntry = deleteDictionaryEntry;
window.selectDictionaryEntry = selectDictionaryEntry;
window.getDictionaryEntry = getDictionaryEntry;
window.searchDictionary = searchDictionary;
window.getDefaultDictionaryEntries = getDefaultDictionaryEntries;

// 导出到 window
window.openDictionarySidebar = openDictionarySidebar;
window.openDictionaryInNewWindow = openDictionaryInNewWindow;
window.renderCompactDictionaryPanel = renderCompactDictionaryPanel;
window.renderCompactDictionaryTree = renderCompactDictionaryTree;
window.updateCompactDictionaryEditor = updateCompactDictionaryEditor;
window.bindCompactDictionaryEvents = bindCompactDictionaryEvents;
window.getDictionaryData = getDictionaryData;
window.dictionaryData = dictionaryData;

console.log('📚 词典工具已加载');
console.log('✅ openDictionarySidebar 存在:', typeof openDictionarySidebar === 'function');
console.log('✅ openDictionaryInNewWindow 存在:', typeof openDictionaryInNewWindow === 'function');

console.log('📚 dictionary.js 加载完成');