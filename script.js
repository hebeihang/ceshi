// 全局变量定义
const currDate = new Date().toISOString().substring(0, 10);
let cardIsFront = true;
let cardId = 0;
let redraw = false;
let redrawClickNum = 0;
let state = 'home';

// 简化错误处理函数
window.onerror = function(msg, url, line) {
    console.error('Error:', msg, 'at line', line);
    return false;
};

// 等待 DOM 加载完成
document.addEventListener('DOMContentLoaded', function() {
    // 初始化应用
    init();
});

// 初始化函数
function init() {
    // 从 localStorage 读取数据
    let lastDate = localStorage.getItem('date');
    try {
        cardId = +localStorage.getItem('id') || 0;
        redraw = !!localStorage.getItem('redraw');
    } catch {
        console.log('Failed to load from localStorage');
    }

    // 直接设置为首页状态
    updateState('home');

    // 初始化选择列表
    const picker = document.getElementById('manualPicker');
    picker.innerHTML = '<option value="" disabled selected>请选择...</option>';
    for (let i = 1; i <= 100; i++) {
        const option = document.createElement('option');
        option.value = i - 1;
        option.textContent = `第 ${i} 签`;
        picker.appendChild(option);
    }

    // 绑定事件处理函数
    setupEventListeners();
}

// 事件处理函数设置
function setupEventListeners() {
    console.log('Setting up event listeners...');
    
    // 每日抽签按钮
    const drawDailyBtn = document.getElementById('drawDailyBtn');
    console.log('drawDailyBtn:', drawDailyBtn);
    if (drawDailyBtn) {
        drawDailyBtn.onclick = function(e) {
            e.preventDefault();
            drawCard();
        };
    }

    // 手动选择
    const manualPickBtn = document.getElementById('manualPicker');
    if (manualPicker) {
        manualPicker.onchange = function(e) {
            e.preventDefault();
            cardId = +e.target.value + 1;
            updateState('card');
            showCard();
        };
    }
   

    // 解读按钮
    const decodeBtn = document.getElementById('decodeBtn');
    if (decodeBtn) {
        decodeBtn.onclick = function(e) {
            e.preventDefault();
            showText();
        };
    }

    // 卡片点击
    const cardContainer = document.getElementById('cardContainer');
    if (cardContainer) {
        cardContainer.onclick = function(e) {
            e.preventDefault();
            cardIsFront = !cardIsFront;
            showCard();
        };
    }

    // 重抽按钮
    const redrawBtn = document.getElementById('redrawBtn');
    if (redrawBtn) {
        redrawBtn.onclick = function(e) {
            e.preventDefault();
            if (redraw) {
                if (++redrawClickNum === 5) {
                    redraw = false;
                    updateState('home');
                    return;
                }
                // 使用 confirm 代替 alert，提供返回选项
                if (confirm('今天已重抽过了，是否返回首页？\n\n点击"确定"返回首页\n点击"取消"继续留在当前页面')) {
                    // 用户点击"确定"，返回首页
                    redraw = false;
                    updateState('home');
                }
                return;
            }
            redraw = true;
            updateState('home');
        };
    }

    // 返回按钮
    const backBtn = document.getElementById('backBtn');
    if (backBtn) {
        backBtn.onclick = function(e) {
            e.preventDefault();
            updateState('card');
        };
    }

    // 分享按钮
    const shareBtn = document.getElementById('shareBtn');
    if (shareBtn) {
        shareBtn.onclick = async function(e) {
            e.preventDefault();
            try {
                if (navigator.share) {
                    await navigator.share({
                        title: 'おみくじ',
                        text: document.getElementById('signText').textContent,
                        url: window.location.href
                    });
                }
            } catch (err) {
                console.log('Share failed:', err.message);
            }
        };
    }
}

// 抽签函数
function drawCard() {
    console.log('Drawing card...');
    for (;;) {
        const id = 1 + Math.floor(Math.random() * 100);
        if (id === cardId) {
            continue;
        }
        if (redraw) {
            // 重抽必须是吉
            if (info[id - 1].吉凶 !== '吉') {
                continue;
            }
        }
        cardId = id;
        break;
    }
    console.log('Drew card:', cardId);
    showCard();
    try {
        localStorage.setItem('id', cardId);
        localStorage.setItem('redraw', redraw);
        localStorage.setItem('date', currDate);
    } catch {
        console.log('Failed to save to localStorage');
    }
}

// 显示卡片
function showCard() {
    const arr = cardIsFront ? card1 : card0;
    const url = arr[cardId - 1];
    const cardContainer = document.getElementById('cardContainer');
    
    // 确保容器可见
    cardContainer.style.display = 'flex';
    cardContainer.style.backgroundImage = `url(${url})`;
    
    // 清空签文
    const signText = document.getElementById('signText');
    if (signText) {
        signText.textContent = '';
    }
    
    // 更新状态
    updateState('card');
}

// 显示签文
function showText() {
    const v = info[cardId - 1];
    const signText = document.getElementById('signText');
    
    // 处理签诗文本，将每行包装在div中以确保居中
    const poemLines = v.签诗.trim().split('\n').map(line => 
        `<div class="poem-line">${line}</div>`
    ).join('');
    
    // 构建HTML内容
    const sections = [
        `<div class="sign-header">第${v.编号} ${v.吉凶}</div>`,
        `<div class="sign-section">
            <h3>签诗</h3>
            <p class="poem-text">${poemLines}</p>
        </div>`,
        `<div class="sign-section">
            <h3>翻译</h3>
            <p>${v.翻译.trim().replace(/\n/g, '<br>')}</p>
        </div>`,
        `<div class="sign-section">
            <h3>建议</h3>
            <p>${v.签文解读.trim().replace(/\n/g, '<br>')}</p>
        </div>`
    ];

    // 设置HTML内容
    signText.innerHTML = sections.join('');
    
    // 更新状态
    updateState('text');
}

// 更新状态
function updateState(newState) {
    state = newState;
    document.body.setAttribute('data-state', state);
    
    const elements = {
        signTextContainer: document.getElementById('signTextContainer'),
        cardContainer: document.getElementById('cardContainer'),
        homeContainer: document.getElementById('homeContainer'),
        decodeBtn: document.getElementById('decodeBtn'),
        redrawBtn: document.getElementById('redrawBtn'),
        backBtn: document.getElementById('backBtn'),
        shareBtn: document.getElementById('shareBtn'),
        homeButtons: document.querySelector('.home-buttons')
    };

    // 更新显示状态
    elements.signTextContainer.style.display = state === 'text' ? 'flex' : 'none';
    elements.cardContainer.style.display = state === 'card' ? 'flex' : 'none';
    elements.homeContainer.style.display = state === 'home' ? 'flex' : 'none';
    
    // 更新按钮显示
    elements.decodeBtn.parentElement.style.display = state === 'card' ? 'block' : 'none';
    elements.redrawBtn.parentElement.style.display = state === 'card' ? 'block' : 'none';
    elements.backBtn.parentElement.style.display = state === 'text' ? 'block' : 'none';
    elements.shareBtn.parentElement.style.display = state === 'text' ? 'block' : 'none';
    elements.homeButtons.style.display = state === 'home' ? 'flex' : 'none';
}

// 获取用户设备语言
function getDeviceLanguage() {
    // 获取浏览器语言设置
    const language = navigator.language || navigator.userLanguage;
    // 如果是中文（包括简体和繁体），返回 'chs'，否则返回 'eng'
    return language.toLowerCase().startsWith('zh') ? 'chs' : 'eng';
}

// 语言切换功能
function setupLanguageSwitch() {
    console.log('Setting up language switch...'); // 调试日志

    // 获取元素
    const langBtn = document.getElementById('langBtn');
    const langMenu = document.getElementById('langMenu');
    const options = document.querySelectorAll('.lang-option');

    // 直接绑定点击事件
    if (langBtn) {
        langBtn.addEventListener('click', function(e) {
            console.log('Language button clicked'); // 调试日志
            e.preventDefault();
            e.stopPropagation();
            
            // 直接切换显示状态
            if (langMenu.style.display === 'block') {
                langMenu.style.display = 'none';
            } else {
                langMenu.style.display = 'block';
                console.log('Menu shown'); // 调试日志
            }
        });
    }

    // 点击其他地方关闭菜单
    document.addEventListener('click', function(e) {
        if (langMenu && langMenu.style.display === 'block' && 
            !langBtn.contains(e.target) && !langMenu.contains(e.target)) {
            langMenu.style.display = 'none';
            console.log('Menu hidden'); // 调试日志
        }
    });

    // 语言选择
    options.forEach(option => {
        option.addEventListener('click', function(e) {
            console.log('Language option clicked:', this.dataset.lang); // 调试日志
            e.preventDefault();
            e.stopPropagation();
            
            const lang = this.dataset.lang;
            document.body.dataset.lang = lang;
            
            // 更新按钮文本
            const currentLang = langBtn.querySelector('.current-lang');
            if (currentLang) {
                currentLang.textContent = lang === 'chs' ? '中文' : 'English';
            }
            
            // 隐藏菜单
            langMenu.style.display = 'none';
            
            // 保存语言选择
            localStorage.setItem('language', lang);
            
            // 更新界面
            updateLanguage(lang);
        });
    });
}

// 更新语言相关的文本
function updateLanguage(lang) {
    // 更新标题
    document.title = lang === 'chs' ? '浅草寺御神签' : 'Omikuji Fortune';
    
    // 更新选择器的提示文本
    const picker = document.getElementById('manualPicker');
    if (picker) {
        picker.options[0].text = lang === 'chs' ? '请选择...' : 'Please select...';
        // 更新选项文本
        for (let i = 1; i <= picker.options.length - 1; i++) {
            picker.options[i].text = lang === 'chs' ? 
                `第 ${i} 签` : `Fortune ${i}`;
        }
    }
}

// 初始化御神签显示
function initOmikuji() {
    const omikujiContainer = document.querySelector('#box_omikuji_draw .box_omikuji_inner');
    const omikujiImages = omikujiContainer.querySelectorAll('.pic_omikuji');
    
    // 随机显示御神签
    omikujiImages.forEach((img, index) => {
        // 随机延迟显示
        setTimeout(() => {
            img.style.display = 'block';
        }, index * 100);
    });

    // 点击事件处理
    omikujiImages.forEach(img => {
        img.addEventListener('click', function() {
            // 移除其他御神签的选中状态
            omikujiImages.forEach(other => other.classList.remove('select_omikuji'));
            // 添加选中状态到当前御神签
            this.classList.add('select_omikuji');
        });
    });
}

// 确保在 DOM 加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded'); // 调试日志
    setupLanguageSwitch();
    init();
    initOmikuji();
});

$('#box_omikuji_draw').hover(
    function() {
        //マウスカーソルが重なった時の処理
        $('#btn_omikuji_draw').addClass("hover");
    },
    function() {
        //マウスカーソルが離れた時の処理
        $('#btn_omikuji_draw').removeClass("hover");
    }
);
