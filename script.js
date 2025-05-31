// 遊戲狀態變量
let currentNumber = 0;
let startTime, timerInterval;
let best = null;
let timeList = [];
let isSoundOn = true;
let totalRuns = 0;
let isHardMode = false;
let isGameStarted = false;

// 語言翻譯對象
const translations = {
  'zh': {
    'gameTitle': '我獨自成為槍男',
    'startButton': '開始升級',
    'timer': '時間：0.00 秒',
    'restartButton': '再玩一次',
    'bestTime': '歷史最快',
    'noRecord': '尚無紀錄',
    'playerStats': '玩家數據',
    'totalGames': '總完成場數:',
    'averageTime': '平均時間:',
    'resetButton': '重置數據',
    'progressTitle': '進步幅度',
    'progressSubtext': '（近10次紀錄）',
    'noData': '尚無資料',
    'improved': '進步了 ${diff} 秒 🎉',
    'regressed': '退步了 ${diff} 秒 😥',
    'same': '與上次持平',
    'timeLabel': '時間（秒）',
    'confirmReset': '確定要重置所有遊戲數據嗎？此操作無法復原！',
    'madeBy': 'Made by 表溜',
    'normalMode': '普通模式',
    'hardMode': '困難模式',
    'startPrompt': '按空格鍵開始'
  },
  'en': {
    'gameTitle': 'Solo Aim Train',
    'startButton': 'Start Training',
    'timer': 'Time: 0.00s',
    'restartButton': 'Play Again',
    'bestTime': 'Best Time',
    'noRecord': 'No Record',
    'playerStats': 'Player Stats',
    'totalGames': 'Total Games:',
    'averageTime': 'Avg Time:',
    'resetButton': 'Reset Data',
    'progressTitle': 'Progress',
    'progressSubtext': '(Last 10 Records)',
    'noData': 'No Data',
    'improved': 'Improved by ${diff}s 🎉',
    'regressed': 'Regressed by ${diff}s 😥',
    'same': 'Same as last time',
    'timeLabel': 'Time (seconds)',
    'confirmReset': 'Are you sure to reset all game data? This cannot be undone!',
    'madeBy': 'Made by 表溜',
    'normalMode': 'Normal Mode',
    'hardMode': 'Hard Mode',
    'startPrompt': 'Press Space to start'
  }
};

let currentLanguage = 'zh'; // 默認中文

// DOM 元素
const timerEl = document.getElementById("timer");
const bestTimeEl = document.getElementById("bestTime");
const grid = document.getElementById("grid");
const restartBtn = document.getElementById("restartBtn");
const soundBtn = document.getElementById("soundToggleBtn");
const clickSound = document.getElementById("clickSound");
const winSound = document.getElementById("winSound");
const buttonSound = document.getElementById("buttonSound");
const progressNumber = document.getElementById("progressNumber");
const ctx = document.getElementById("progressChart").getContext("2d");
const startGameBtn = document.getElementById("startGameBtn");
const mainContainer = document.getElementById("mainContainer");
const titleContainer = document.getElementById("titleContainer");
const resetStatsBtn = document.getElementById("resetStatsBtn");
const switchLanguageBtn = document.getElementById("switchLanguageBtn");
const langTextEl = document.querySelector(".lang-text");
const hardModeBtn = document.getElementById("hardModeToggleBtn");
const modeIcon = document.querySelector(".mode-icon");
const modeText = document.querySelector(".mode-text");
const gameArea = document.getElementById("gameArea");
const startPrompt = document.getElementById("startPrompt");
const coffeeBtn = document.querySelector(".coffee-btn");

// 玩家數據元素
const totalGamesEl = document.getElementById("totalGames");
const averageTimeEl = document.getElementById("averageTime");

// 圖表變量
let chart;
let timerRunning = false;

// 播放按鈕音效
function playButtonSound() {
  if (isSoundOn) {
    buttonSound.currentTime = 0;
    buttonSound.play();
  }
}

// 從localStorage加載數據
function loadStats() {
  const savedStats = localStorage.getItem('gunmanGameStats');
  if (savedStats) {
    const stats = JSON.parse(savedStats);
    totalRuns = stats.totalRuns || 0;
    best = stats.best || null;
    timeList = stats.timeList || [];
    isHardMode = stats.isHardMode || false;
    
    if (best !== null) {
      bestTimeEl.textContent = currentLanguage === 'zh' ? 
        `${best.toFixed(2)} 秒` : 
        `${best.toFixed(2)}s`;
    }
    
    // 更新困難模式按鈕狀態
    if (isHardMode) {
      hardModeBtn.classList.add("hard");
      modeText.textContent = translations[currentLanguage].hardMode;
      modeIcon.textContent = '💀';
    } else {
      hardModeBtn.classList.remove("hard");
      modeText.textContent = translations[currentLanguage].normalMode;
      modeIcon.textContent = '😊';
    }
  }
}

// 保存數據到localStorage
function saveStats() {
  const stats = {
    totalRuns,
    best,
    timeList,
    isHardMode
  };
  localStorage.setItem('gunmanGameStats', JSON.stringify(stats));
}

// 重置所有統計數據
function resetStats() {
  playButtonSound();
  if (confirm(translations[currentLanguage].confirmReset)) {
    totalRuns = 0;
    best = null;
    timeList = [];
    
    bestTimeEl.textContent = translations[currentLanguage].noRecord;
    saveStats();
    updatePlayerStats();
    updateProgress();
  }
}

// 初始化遊戲
function initGame() {
  clearInterval(timerInterval);
  timerEl.textContent = translations[currentLanguage].timer;
  grid.innerHTML = "";
  timerRunning = false;
  currentNumber = 0;
  isGameStarted = false;
  startPrompt.style.display = "block";

  // 生成隨機數字網格
  const numbers = Array.from({ length: 25 }, (_, i) => i + 1).sort(() => Math.random() - 0.5);
  numbers.forEach((num) => {
    const btn = document.createElement("button");
    btn.classList.add("grid-button");
    btn.textContent = num;
    btn.dataset.num = num;
    btn.style.visibility = "hidden"; // 初始隱藏數字
    btn.addEventListener("click", () => handleClick(btn, num));
    grid.appendChild(btn);
  });
}

// 開始遊戲
function startGame() {
  if (!isGameStarted && grid.innerHTML !== "") {
    isGameStarted = true;
    startPrompt.style.display = "none";
    
    // 顯示所有數字
    const buttons = document.querySelectorAll(".grid-button");
    buttons.forEach(btn => {
      btn.style.visibility = "visible";
    });
    
    // 開始計時
    startTime = Date.now();
    timerInterval = setInterval(updateTimer, 10);
    timerRunning = true;
  }
}

// 處理數字點擊
function handleClick(btn, num) {
  if (!isGameStarted) return; // 遊戲未開始時不能點擊
  
  const expected = currentNumber + 1;
  if (num !== expected) return;

  currentNumber = expected;
  
  // 只有在非困難模式下才添加視覺反饋
  if (!isHardMode) {
    btn.classList.add("clicked");
    setTimeout(() => {
      btn.classList.remove("clicked");
    }, 2000);
  }

  // 播放音效
  if (isSoundOn) {
    clickSound.pause();
    clickSound.currentTime = 0;
    clickSound.play();
  }

  if (currentNumber === 25) {
    clearInterval(timerInterval);
    timerRunning = false;
    isGameStarted = false;
    const timeUsed = (Date.now() - startTime) / 1000;
    timerEl.textContent = currentLanguage === 'zh' ? 
      `時間：${timeUsed.toFixed(2)} 秒` : 
      `Time: ${timeUsed.toFixed(2)}s`;

    // 更新最佳紀錄
    if (best === null || timeUsed < best) {
      best = timeUsed;
      bestTimeEl.textContent = currentLanguage === 'zh' ? 
        `${best.toFixed(2)} 秒` : 
        `${best.toFixed(2)}s`;
    }

    // 更新時間列表
    timeList.push(timeUsed);
    if (timeList.length > 10) timeList.shift();
    
    // 更新遊戲次數
    totalRuns++;
    
    // 更新玩家數據和進度圖表
    updatePlayerStats();
    updateProgress();
    saveStats();

    // 播放勝利音效
    if (isSoundOn) {
      winSound.pause();
      winSound.currentTime = 0;
      winSound.play();
    }
  }
}

// 更新計時器顯示
function updateTimer() {
  const elapsed = (Date.now() - startTime) / 1000;
  timerEl.textContent = currentLanguage === 'zh' ? 
    `時間：${elapsed.toFixed(2)} 秒` : 
    `Time: ${elapsed.toFixed(2)}s`;
}

// 更新玩家數據
function updatePlayerStats() {
  totalGamesEl.textContent = totalRuns;
  
  // 計算平均時間
  const avg = timeList.length > 0 
    ? (timeList.reduce((a, b) => a + b, 0) / timeList.length)
    : 0;
  averageTimeEl.textContent = avg.toFixed(2) + (currentLanguage === 'zh' ? 's' : 's');
}

// 更新進度圖表
function updateProgress() {
  if (timeList.length < 2) {
    progressNumber.textContent = translations[currentLanguage].noData;
    if (chart) chart.destroy();
    return;
  }

  const diff = timeList[timeList.length - 2] - timeList[timeList.length - 1];
  if (diff > 0) {
    progressNumber.textContent = translations[currentLanguage].improved.replace('${diff}', diff.toFixed(3));
  } else if (diff < 0) {
    progressNumber.textContent = translations[currentLanguage].regressed.replace('${diff}', Math.abs(diff).toFixed(3));
  } else {
    progressNumber.textContent = translations[currentLanguage].same;
  }

  // 準備圖表數據
  const startRun = totalRuns - timeList.length + 1;
  const runText = currentLanguage === 'zh' ? '第' : 'Run ';
  const labels = timeList.map((_, i) => `${runText}${startRun + i}${currentLanguage === 'zh' ? '次' : ''}`);

  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [{
        label: translations[currentLanguage].timeLabel,
        data: timeList,
        borderColor: "#4caf50",
        backgroundColor: "rgba(76,175,80,0.2)",
        fill: true,
        tension: 0.3,
      }],
    },
    options: {
      scales: {
        y: {
          beginAtZero: false,
          reverse: true,
        },
      },
      plugins: {
        legend: { display: true },
      },
      animation: { duration: 300 },
    },
  });
}

// 切換困難模式
function toggleHardMode() {
  playButtonSound();
  isHardMode = !isHardMode;
  
  if (isHardMode) {
    hardModeBtn.classList.add("hard");
    modeText.textContent = translations[currentLanguage].hardMode;
    modeIcon.textContent = '💀';
  } else {
    hardModeBtn.classList.remove("hard");
    modeText.textContent = translations[currentLanguage].normalMode;
    modeIcon.textContent = '😊';
  }
  
  // 重新初始化遊戲以應用新模式
  initGame();
  saveStats();
}

// 切換語言並刷新頁面
function switchLanguage() {
  currentLanguage = currentLanguage === 'zh' ? 'en' : 'zh';
  saveLanguagePreference();
  window.location.reload();
}

// 保存語言偏好到localStorage
function saveLanguagePreference() {
  localStorage.setItem('gunmanGameLanguage', currentLanguage);
}

// 從localStorage加載語言偏好
function loadLanguagePreference() {
  const savedLanguage = localStorage.getItem('gunmanGameLanguage');
  if (savedLanguage) {
    currentLanguage = savedLanguage;
  }
  translatePage();
  updateLanguageButton();
}

// 更新語言按鈕文本
function updateLanguageButton() {
  langTextEl.textContent = currentLanguage === 'zh' ? 'EN' : '中文';
}

// 翻譯頁面
function translatePage() {
  // 標題和按鈕
  document.querySelector('h1').textContent = translations[currentLanguage].gameTitle;
  document.getElementById('startGameBtn').innerHTML = `
    ${translations[currentLanguage].startButton}
    <span class="ripple"></span>
  `;
  document.getElementById('restartBtn').textContent = translations[currentLanguage].restartButton;
  
  // 玩家數據區域
  document.querySelector('#playerStats h2').textContent = translations[currentLanguage].playerStats;
  document.querySelectorAll('.stat-item')[0].querySelector('.stat-label').textContent = translations[currentLanguage].totalGames;
  document.querySelectorAll('.stat-item')[1].querySelector('.stat-label').textContent = translations[currentLanguage].averageTime;
  document.querySelectorAll('.stat-item')[2].querySelector('.stat-label').textContent = translations[currentLanguage].bestTime;
  document.getElementById('resetStatsBtn').textContent = translations[currentLanguage].resetButton;
  
  // 進步幅度區域
  document.querySelector('#progressArea h2').innerHTML = `
    ${translations[currentLanguage].progressTitle} 
    <span class="subtext">${translations[currentLanguage].progressSubtext}</span>
  `;
  
  // 更新計時器顯示
  if (timerEl) {
    const timeText = timerEl.textContent.match(/\d+\.\d+/);
    if (timeText) {
      timerEl.textContent = currentLanguage === 'zh' ? 
        `時間：${timeText[0]} 秒` : 
        `Time: ${timeText[0]}s`;
    } else {
      timerEl.textContent = translations[currentLanguage].timer;
    }
  }
  
  // 更新最佳紀錄
  if (bestTimeEl) {
    if (best !== null) {
      bestTimeEl.textContent = currentLanguage === 'zh' ? 
        `${best.toFixed(2)} 秒` : 
        `${best.toFixed(2)}s`;
    } else {
      bestTimeEl.textContent = translations[currentLanguage].noRecord;
    }
  }
  
  // 更新困難模式按鈕文本
  if (modeText) {
    modeText.textContent = isHardMode ? 
      translations[currentLanguage].hardMode : 
      translations[currentLanguage].normalMode;
  }
  
  // 更新開始提示文本
  if (startPrompt) {
    startPrompt.textContent = translations[currentLanguage].startPrompt;
  }
  
  // 更新製作人員信息
  document.querySelector('#credit > div:first-child').textContent = translations[currentLanguage].madeBy;
}

// 事件監聽器
startGameBtn.addEventListener("click", function() {
  playButtonSound();
  // 觸發漣漪動畫
  const ripple = this.querySelector(".ripple");
  ripple.style.animation = "none";
  void ripple.offsetWidth; // 觸發重繪
  ripple.style.animation = "ripple 0.6s ease-out";
  
  // 隱藏標題，顯示遊戲
  titleContainer.classList.add("hide");
  setTimeout(() => {
    mainContainer.style.display = "flex";
    setTimeout(() => {
      mainContainer.classList.add("show");
      initGame();
      updatePlayerStats();
      updateProgress();
    }, 50);
  }, 300);
});

restartBtn.addEventListener("click", () => {
  playButtonSound();
  // 按鈕反饋動畫
  restartBtn.style.transform = "scale(0.95)";
  setTimeout(() => {
    restartBtn.style.transform = "scale(1)";
  }, 200);
  
  // 重新開始遊戲
  initGame();
});

soundBtn.addEventListener("click", () => {
  buttonSound.currentTime = 0;
  buttonSound.play();
  
  isSoundOn = !isSoundOn;
  soundBtn.textContent = isSoundOn ? "🔊" : "🔇";
});

resetStatsBtn.addEventListener("click", resetStats);

switchLanguageBtn.addEventListener("click", switchLanguage);

hardModeBtn.addEventListener("click", toggleHardMode);

// 為Buy Me a Coffee按鈕添加音效
coffeeBtn.addEventListener('click', function() {
  playButtonSound();
  // 允許默認行為繼續執行（打開鏈接）
});

// 遊戲區域點擊開始
gameArea.addEventListener("click", function(e) {
  if (e.target === this && !isGameStarted && grid.innerHTML !== "") {
    playButtonSound();
    startGame();
  }
});

// 空格鍵開始
document.addEventListener("keydown", function(e) {
  if (e.code === "Space" && !isGameStarted && grid.innerHTML !== "") {
    e.preventDefault();
    playButtonSound();
    startGame();
  }
});

// 初始化遊戲和數據
loadLanguagePreference();
loadStats();
updatePlayerStats();
updateProgress();