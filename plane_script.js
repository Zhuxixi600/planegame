// 游戏常量
const GAME_WIDTH = 400;
const GAME_HEIGHT = 600;
const PLAYER_WIDTH = 50;
const PLAYER_HEIGHT = 60;
const ENEMY_WIDTH = 40;
const ENEMY_HEIGHT = 40;
const BULLET_WIDTH = 4;
const BULLET_HEIGHT = 15;
const BULLET_SPEED = 7;
const ENEMY_BULLET_SPEED = 3;
const PLAYER_SPEED = 5;
const ENEMY_SPEED = 1;
const ENEMY_SPAWN_INTERVAL = 2000;
const ENEMY_FIRE_CHANCE = 0.005;

// 游戏状态
let canvas;
let ctx;
let requestId;
let gameOver = false;
let isPaused = false;
let lastEnemySpawn = 0;
let isMobileDevice = false;

// 计分
let score = 0;
let lives = 3;
let level = 1;

// 游戏对象
let player;
let bullets = [];
let enemyBullets = [];
let enemies = [];
let stars = []; // 背景星星

// 按键状态
const keys = {
    ArrowLeft: false,
    ArrowRight: false,
    ArrowUp: false,
    ArrowDown: false,
    Space: false
};

// 图像资源
const images = {
    player: new Image(),
    enemy: new Image(),
    background: new Image()
};

// DOM 元素
const scoreElement = document.getElementById('score');
const livesElement = document.getElementById('lives');
const levelElement = document.getElementById('level');
const startBtn = document.getElementById('start-btn');
const pauseBtn = document.getElementById('pause-btn');
const gameOverElement = document.getElementById('game-over');
const finalScoreElement = document.getElementById('final-score');
const restartBtn = document.getElementById('restart-btn');

// 移动设备控制按钮
let upBtn, downBtn, leftBtn, rightBtn, fireBtn;

// 初始化游戏
function init() {
    // 检测是否为移动设备
    isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // 设置游戏画布
    canvas = document.getElementById('game-board');
    ctx = canvas.getContext('2d');
    
    // 设置画布大小
    canvas.width = GAME_WIDTH;
    canvas.height = GAME_HEIGHT;
    
    // 加载图像
    images.player.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MCA2MCI+PHJhZGlhbEdyYWRpZW50IGlkPSJnMSIgY3g9IjI1IiBjeT0iMzAiIHI9IjIwIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHN0b3Agb2Zmc2V0PSIwIiBzdG9wLWNvbG9yPSIjNjBkZmZmIi8+PHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjMDA4MWNjIi8+PC9yYWRpYWxHcmFkaWVudD48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImcyIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjNGZjM2Y3Ii8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjMDM1YWZmIi8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHBhdGggZmlsbD0idXJsKCNnMikiIGQ9Ik0yNSAybDEyIDE4aC0yNHoiLz48cGF0aCBmaWxsPSJ1cmwoI2cxKSIgZD0iTTE1IDIwaDIwdjI1aC0yMHoiLz48cGF0aCBmaWxsPSIjMDM1YWZmIiBkPSJNOCAzMGw3LTE1djMwbC03LTE1eiIvPjxwYXRoIGZpbGw9IiMwMzVhZmYiIGQ9Ik00MiAzMGwtNy0xNXYzMGw3LTE1eiIvPjxwYXRoIGZpbGw9IiMwMzVhZmYiIGQ9Ik0xNSA0NWgyMHYxMmwtMTAtNmwtMTAgNnoiLz48cGF0aCBmaWxsPSIjZmZmIiBkPSJNMjAgMjVoMTB2MTBoLTEweiIvPjxjaXJjbGUgY3g9IjI1IiBjeT0iMzAiIHI9IjMiIGZpbGw9IiMwMDI4NjYiLz48cGF0aCBmaWxsPSJub25lIiBzdHJva2U9IiM4MGZmZmYiIHN0cm9rZS13aWR0aD0iMC41IiBkPSJNMTUgMjBsMTAtMThtMCAwbDEwIDE4Ii8+PHBhdGggZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMDBmZmZmIiBzdHJva2Utd2lkdGg9IjAuMyIgZD0iTTE1IDQ1YzAgMCAxMC0yIDIwIDAiLz48L3N2Zz4=';
    
    // 更美观的敌机SVG
    images.enemy.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0MCA0MCI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJnMSIgeDE9IjAlIiB5MT0iMCUiIHgyPSIxMDAlIiB5Mj0iMTAwJSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iI2ZmODA4MCIvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iI2NjMDAwMCIvPjwvbGluZWFyR3JhZGllbnQ+PHJhZGlhbEdyYWRpZW50IGlkPSJnMiIgY3g9IjIwIiBjeT0iMjAiIHI9IjE1IiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHN0b3Agb2Zmc2V0PSIwIiBzdG9wLWNvbG9yPSIjZmY1MjUyIi8+PHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjYmIwMDAwIi8+PC9yYWRpYWxHcmFkaWVudD48L2RlZnM+PHBhdGggZmlsbD0idXJsKCNnMSkiIGQ9Ik0yMCAzbDE4IDEybC0xOCAxMmwtMTggLTEyeiIvPjxwYXRoIGZpbGw9InVybCgjZzIpIiBkPSJNOCAxNWwxMiAxMmwxMiAtMTJ2MThoLTI0eiIvPjxwYXRoIGZpbGw9IiM4MDAwMDAiIGQ9Ik04IDMzaDI0djRoLTI0eiIvPjxjaXJjbGUgY3g9IjIwIiBjeT0iMjIiIHI9IjQiIGZpbGw9IiM1NTAwMDAiLz48Y2lyY2xlIGN4PSIyMCIgY3k9IjIyIiByPSIyIiBmaWxsPSIjZmYwMDAwIi8+PHBhdGggZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZmY4MDgwIiBzdHJva2Utd2lkdGg9IjAuNSIgZD0iTTggMTVsMTIgLTEybTAgMGwxMiAxMiIvPjxwYXRoIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2ZmMDAwMCIgc3Ryb2tlLXdpZHRoPSIwLjMiIGQ9Ik04IDMzYzAgMCAxMi0yIDI0IDAiLz48L3N2Zz4=';
    
    // 创建背景星星
    createStars();
    
    // 初始化移动设备控制
    if (isMobileDevice) {
        initMobileControls();
    }
    
    // 添加事件监听器
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    startBtn.addEventListener('click', startGame);
    pauseBtn.addEventListener('click', togglePause);
    restartBtn.addEventListener('click', startGame);
    
    // 添加屏幕尺寸变化监听
    window.addEventListener('resize', handleResize);
    handleResize();
    
    // 绘制初始画面
    drawBackground();
    drawText("飞机大战", GAME_WIDTH / 2, GAME_HEIGHT / 2 - 50, "40px Arial", "#4fc3f7");
    drawText("按开始游戏按钮开始", GAME_WIDTH / 2, GAME_HEIGHT / 2 + 20, "20px Arial", "#fff");
    
    // 创建图标和manifest文件
    createAppIcons();
}

// 初始化移动设备控制
function initMobileControls() {
    upBtn = document.getElementById('up-btn');
    downBtn = document.getElementById('down-btn');
    leftBtn = document.getElementById('left-btn');
    rightBtn = document.getElementById('right-btn');
    fireBtn = document.getElementById('fire-btn');
    
    // 添加触摸事件
    upBtn.addEventListener('touchstart', () => keys.ArrowUp = true);
    upBtn.addEventListener('touchend', () => keys.ArrowUp = false);
    
    downBtn.addEventListener('touchstart', () => keys.ArrowDown = true);
    downBtn.addEventListener('touchend', () => keys.ArrowDown = false);
    
    leftBtn.addEventListener('touchstart', () => keys.ArrowLeft = true);
    leftBtn.addEventListener('touchend', () => keys.ArrowLeft = false);
    
    rightBtn.addEventListener('touchstart', () => keys.ArrowRight = true);
    rightBtn.addEventListener('touchend', () => keys.ArrowRight = false);
    
    fireBtn.addEventListener('touchstart', () => keys.Space = true);
    fireBtn.addEventListener('touchend', () => keys.Space = false);
    
    // 防止触摸事件滚动页面
    document.addEventListener('touchmove', function(e) {
        if (e.target.classList.contains('control-btn') || e.target.classList.contains('fire-btn')) {
            e.preventDefault();
        }
    }, { passive: false });
}

// 处理屏幕尺寸变化
function handleResize() {
    // 调整画布大小以适应屏幕
    const container = document.querySelector('.game-board-container');
    const containerWidth = container.clientWidth;
    
    // 如果是移动设备，调整游戏尺寸
    if (isMobileDevice || containerWidth < GAME_WIDTH) {
        const scale = containerWidth / GAME_WIDTH;
        canvas.style.width = `${GAME_WIDTH * scale}px`;
        canvas.style.height = `${GAME_HEIGHT * scale}px`;
    } else {
        canvas.style.width = `${GAME_WIDTH}px`;
        canvas.style.height = `${GAME_HEIGHT}px`;
    }
}

// 创建应用图标
function createAppIcons() {
    // 创建图标的canvas
    const iconCanvas = document.createElement('canvas');
    iconCanvas.width = 192;
    iconCanvas.height = 192;
    const iconCtx = iconCanvas.getContext('2d');
    
    // 绘制图标背景
    iconCtx.fillStyle = '#121212';
    iconCtx.fillRect(0, 0, 192, 192);
    
    // 绘制飞机
    const iconSize = 120;
    iconCtx.drawImage(images.player, (192 - iconSize) / 2, (192 - iconSize) / 2, iconSize, iconSize);
    
    // 添加边框
    iconCtx.strokeStyle = '#4fc3f7';
    iconCtx.lineWidth = 6;
    iconCtx.strokeRect(10, 10, 172, 172);
    
    // 导出图标为数据URL
    const iconDataUrl = iconCanvas.toDataURL('image/png');
    
    // 创建图标链接元素
    const iconLink = document.createElement('link');
    iconLink.rel = 'icon';
    iconLink.type = 'image/png';
    iconLink.href = iconDataUrl;
    document.head.appendChild(iconLink);
    
    // 创建苹果触摸图标
    const appleIconLink = document.createElement('link');
    appleIconLink.rel = 'apple-touch-icon';
    appleIconLink.href = iconDataUrl;
    document.head.appendChild(appleIconLink);
    
    // 创建manifest.json文件
    createManifestFile(iconDataUrl);
    
    // 创建Service Worker文件
    createServiceWorkerFile();
}

// 创建manifest.json文件
function createManifestFile(iconUrl) {
    const manifest = {
        name: "飞机大战",
        short_name: "飞机大战",
        description: "一个简单的飞机射击游戏",
        start_url: "./plane_game.html",
        display: "standalone",
        orientation: "portrait",
        background_color: "#121212",
        theme_color: "#4fc3f7",
        icons: [
            {
                src: iconUrl,
                sizes: "192x192",
                type: "image/png"
            }
        ]
    };
    
    // 创建Blob并下载
    const manifestBlob = new Blob([JSON.stringify(manifest, null, 2)], {type: 'application/json'});
    const manifestUrl = URL.createObjectURL(manifestBlob);
    
    // 创建下载链接
    const downloadLink = document.createElement('a');
    downloadLink.href = manifestUrl;
    downloadLink.download = 'manifest.json';
    
    // 触发下载
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
}

// 创建Service Worker文件
function createServiceWorkerFile() {
    const swCode = `
// Service Worker for 飞机大战
const CACHE_NAME = 'plane-game-cache-v1';
const urlsToCache = [
  './plane_game.html',
  './plane_style.css',
  './plane_script.js',
  './manifest.json'
];

// 安装Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('缓存已打开');
        return cache.addAll(urlsToCache);
      })
  );
});

// 拦截请求并从缓存中提供响应
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // 如果找到缓存的响应，则返回缓存的版本
        if (response) {
          return response;
        }
        
        // 否则，获取网络响应
        return fetch(event.request)
          .then(response => {
            // 检查是否收到有效响应
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // 克隆响应，因为响应是流，只能使用一次
            const responseToCache = response.clone();
            
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
              
            return response;
          });
      })
  );
});

// 更新Service Worker
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
    `;
    
    // 创建Blob并下载
    const swBlob = new Blob([swCode], {type: 'application/javascript'});
    const swUrl = URL.createObjectURL(swBlob);
    
    // 创建下载链接
    const downloadLink = document.createElement('a');
    downloadLink.href = swUrl;
    downloadLink.download = 'service-worker.js';
    
    // 触发下载
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
}

// 开始游戏
function startGame() {
    if (requestId) {
        cancelAnimationFrame(requestId);
    }
    
    // 重置游戏状态
    score = 0;
    lives = 3;
    level = 1;
    gameOver = false;
    isPaused = false;
    bullets = [];
    enemyBullets = [];
    enemies = [];
    lastEnemySpawn = 0;
    
    // 创建玩家飞机
    player = {
        x: GAME_WIDTH / 2 - PLAYER_WIDTH / 2,
        y: GAME_HEIGHT - PLAYER_HEIGHT - 20,
        width: PLAYER_WIDTH,
        height: PLAYER_HEIGHT,
        lastFire: 0
    };
    
    // 更新显示
    scoreElement.textContent = score;
    livesElement.textContent = lives;
    levelElement.textContent = level;
    
    // 隐藏游戏结束界面
    gameOverElement.style.display = 'none';
    
    // 开始游戏循环
    requestId = requestAnimationFrame(gameLoop);
    
    // 更新按钮状态
    startBtn.textContent = '重新开始';
    pauseBtn.disabled = false;
    
    // 如果是移动设备，请求全屏
    if (isMobileDevice) {
        requestFullScreen();
    }
}

// 请求全屏
function requestFullScreen() {
    const doc = window.document;
    const docEl = doc.documentElement;
    
    const requestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;
    
    if (requestFullScreen) {
        requestFullScreen.call(docEl);
    }
}

// 游戏循环
function gameLoop(timestamp) {
    if (gameOver) {
        return;
    }
    
    if (isPaused) {
        requestId = requestAnimationFrame(gameLoop);
        return;
    }
    
    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 更新和绘制背景
    updateBackground();
    drawBackground();
    
    // 更新和绘制玩家
    updatePlayer();
    drawPlayer();
    
    // 更新和绘制子弹
    updateBullets();
    drawBullets();
    
    // 更新和绘制敌机
    if (timestamp - lastEnemySpawn > ENEMY_SPAWN_INTERVAL / level) {
        spawnEnemy();
        lastEnemySpawn = timestamp;
    }
    updateEnemies(timestamp);
    drawEnemies();
    
    // 检测碰撞
    checkCollisions();
    
    // 检查升级
    checkLevelUp();
    
    // 继续游戏循环
    requestId = requestAnimationFrame(gameLoop);
}

// 更新背景
function updateBackground() {
    stars.forEach(star => {
        star.y += star.speed;
        if (star.y > GAME_HEIGHT) {
            star.y = 0;
            star.x = Math.random() * GAME_WIDTH;
        }
    });
}

// 绘制背景
function drawBackground() {
    // 绘制黑色背景
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    
    // 绘制星星
    ctx.fillStyle = '#fff';
    stars.forEach(star => {
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
    });
}

// 更新玩家
function updatePlayer() {
    // 根据按键状态移动玩家
    if (keys.ArrowLeft && player.x > 0) {
        player.x -= PLAYER_SPEED;
    }
    if (keys.ArrowRight && player.x < GAME_WIDTH - PLAYER_WIDTH) {
        player.x += PLAYER_SPEED;
    }
    if (keys.ArrowUp && player.y > GAME_HEIGHT / 2) {
        player.y -= PLAYER_SPEED;
    }
    if (keys.ArrowDown && player.y < GAME_HEIGHT - PLAYER_HEIGHT) {
        player.y += PLAYER_SPEED;
    }
    
    // 发射子弹
    if (keys.Space && Date.now() - player.lastFire > 300) {
        fireBullet();
        player.lastFire = Date.now();
    }
}

// 绘制玩家
function drawPlayer() {
    ctx.drawImage(images.player, player.x, player.y, PLAYER_WIDTH, PLAYER_HEIGHT);
}

// 发射子弹
function fireBullet() {
    bullets.push({
        x: player.x + PLAYER_WIDTH / 2 - BULLET_WIDTH / 2,
        y: player.y,
        width: BULLET_WIDTH,
        height: BULLET_HEIGHT
    });
}

// 更新子弹
function updateBullets() {
    // 更新玩家子弹
    bullets = bullets.filter(bullet => {
        bullet.y -= BULLET_SPEED;
        return bullet.y + BULLET_HEIGHT > 0;
    });
    
    // 更新敌机子弹
    enemyBullets = enemyBullets.filter(bullet => {
        bullet.y += ENEMY_BULLET_SPEED;
        return bullet.y < GAME_HEIGHT;
    });
}

// 绘制子弹
function drawBullets() {
    // 绘制玩家子弹
    ctx.fillStyle = '#4fc3f7';
    bullets.forEach(bullet => {
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    });
    
    // 绘制敌机子弹
    ctx.fillStyle = '#ff5252';
    enemyBullets.forEach(bullet => {
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    });
}

// 生成敌机
function spawnEnemy() {
    const x = Math.random() * (GAME_WIDTH - ENEMY_WIDTH);
    enemies.push({
        x,
        y: -ENEMY_HEIGHT,
        width: ENEMY_WIDTH,
        height: ENEMY_HEIGHT,
        speed: ENEMY_SPEED * (0.7 + Math.random() * 0.3) * (1 + level * 0.05),
        lastFire: 0
    });
}

// 更新敌机
function updateEnemies(timestamp) {
    enemies = enemies.filter(enemy => {
        // 移动敌机
        enemy.y += enemy.speed;
        
        // 随机发射子弹
        if (Math.random() < ENEMY_FIRE_CHANCE * level && enemy.y > 0) {
            enemyBullets.push({
                x: enemy.x + ENEMY_WIDTH / 2 - BULLET_WIDTH / 2,
                y: enemy.y + ENEMY_HEIGHT,
                width: BULLET_WIDTH,
                height: BULLET_HEIGHT
            });
        }
        
        // 如果敌机飞出屏幕底部，则移除
        return enemy.y < GAME_HEIGHT;
    });
}

// 绘制敌机
function drawEnemies() {
    enemies.forEach(enemy => {
        ctx.drawImage(images.enemy, enemy.x, enemy.y, ENEMY_WIDTH, ENEMY_HEIGHT);
    });
}

// 检测碰撞
function checkCollisions() {
    // 检测玩家子弹与敌机的碰撞
    bullets.forEach((bullet, bulletIndex) => {
        enemies.forEach((enemy, enemyIndex) => {
            if (isColliding(bullet, enemy)) {
                // 移除子弹和敌机
                bullets.splice(bulletIndex, 1);
                enemies.splice(enemyIndex, 1);
                
                // 增加分数
                score += 10 * level;
                scoreElement.textContent = score;
            }
        });
    });
    
    // 检测敌机子弹与玩家的碰撞
    enemyBullets.forEach((bullet, bulletIndex) => {
        if (isColliding(bullet, player)) {
            // 移除子弹
            enemyBullets.splice(bulletIndex, 1);
            
            // 减少生命值
            lives--;
            livesElement.textContent = lives;
            
            // 检查游戏是否结束
            if (lives <= 0) {
                endGame();
            }
        }
    });
    
    // 检测敌机与玩家的碰撞
    enemies.forEach((enemy, enemyIndex) => {
        if (isColliding(enemy, player)) {
            // 移除敌机
            enemies.splice(enemyIndex, 1);
            
            // 减少生命值
            lives--;
            livesElement.textContent = lives;
            
            // 检查游戏是否结束
            if (lives <= 0) {
                endGame();
            }
        }
    });
}

// 碰撞检测函数
function isColliding(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

// 检查升级
function checkLevelUp() {
    const newLevel = Math.floor(score / 500) + 1;
    if (newLevel > level) {
        level = newLevel;
        levelElement.textContent = level;
    }
}

// 游戏结束
function endGame() {
    gameOver = true;
    finalScoreElement.textContent = score;
    gameOverElement.style.display = 'flex';
}

// 绘制文本
function drawText(text, x, y, font, color) {
    ctx.font = font;
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.fillText(text, x, y);
}

// 处理键盘按下事件
function handleKeyDown(event) {
    if (event.code === 'ArrowLeft') keys.ArrowLeft = true;
    if (event.code === 'ArrowRight') keys.ArrowRight = true;
    if (event.code === 'ArrowUp') keys.ArrowUp = true;
    if (event.code === 'ArrowDown') keys.ArrowDown = true;
    if (event.code === 'Space') keys.Space = true;
    
    // 防止空格键滚动页面
    if (event.code === 'Space') {
        event.preventDefault();
    }
}

// 处理键盘释放事件
function handleKeyUp(event) {
    if (event.code === 'ArrowLeft') keys.ArrowLeft = false;
    if (event.code === 'ArrowRight') keys.ArrowRight = false;
    if (event.code === 'ArrowUp') keys.ArrowUp = false;
    if (event.code === 'ArrowDown') keys.ArrowDown = false;
    if (event.code === 'Space') keys.Space = false;
}

// 暂停/继续游戏
function togglePause() {
    isPaused = !isPaused;
    pauseBtn.textContent = isPaused ? '继续' : '暂停';
}

// 创建背景星星
function createStars() {
    stars = [];
    for (let i = 0; i < 100; i++) {
        stars.push({
            x: Math.random() * GAME_WIDTH,
            y: Math.random() * GAME_HEIGHT,
            size: Math.random() * 2 + 1,
            speed: Math.random() * 2 + 1
        });
    }
}

// 页面加载完成后初始化游戏
window.addEventListener('load', init); 