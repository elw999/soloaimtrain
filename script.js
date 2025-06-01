// Game state variables
let currentNumber = 0;
let startTime, timerInterval;
let isSoundOn = true;
let isHardMode = false;
let isGameStarted = false;

// Separate stats for normal and hard modes
let normalBest = null;
let normalTimeList = [];
let normalTotalRuns = 0;
let hardBest = null;
let hardTimeList = [];
let hardTotalRuns = 0;

// Current active stats (for display)
let currentBest = null;
let currentTimeList = [];
let currentTotalRuns = 0;

// Language translations
const translations = {
  'zh': {
    'gameTitle': '我獨自成為槍男',
    'startButton': '開始升級',
    'timer': '時間：0.00 秒',
    'restartButton': '再玩一次',
    'bestTime': '歷史最快:',
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
    'startPrompt': '點擊空白處開始遊戲'
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
    'startPrompt': 'Click to start game'
  }
};

let currentLanguage = 'zh';

// DOM elements
const timerEl = document.getElementById("timer");
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

// Player stats elements for normal mode
const normalTotalGamesEl = document.getElementById("normalTotalGames");
const normalAverageTimeEl = document.getElementById("normalAverageTime");
const normalBestTimeEl = document.getElementById("normalBestTime");

// Player stats elements for hard mode
const hardTotalGamesEl = document.getElementById("hardTotalGames");
const hardAverageTimeEl = document.getElementById("hardAverageTime");
const hardBestTimeEl = document.getElementById("hardBestTime");

// Mode tabs
const modeTabs = document.querySelectorAll(".mode-tab");

// Chart variables
let chart;
let timerRunning = false;

// Play button sound
function playButtonSound() {
  if (isSoundOn) {
    buttonSound.currentTime = 0;
    buttonSound.play();
  }
}

// Load stats from localStorage
function loadStats() {
  const savedStats = localStorage.getItem('gunmanGameStats');
  if (savedStats) {
    const stats = JSON.parse(savedStats);
    normalTotalRuns = stats.normalTotalRuns || 0;
    normalBest = stats.normalBest || null;
    normalTimeList = stats.normalTimeList || [];
    hardTotalRuns = stats.hardTotalRuns || 0;
    hardBest = stats.hardBest || null;
    hardTimeList = stats.hardTimeList || [];
    isHardMode = stats.isHardMode || false;
    
    if (isHardMode) {
      if (gameArea) gameArea.classList.add("hard-mode");
      if (hardModeBtn) hardModeBtn.classList.add("hard");
      if (modeText) modeText.textContent = translations[currentLanguage].hardMode;
      if (modeIcon) modeIcon.textContent = '💀';
    }

    updateCurrentStats();
    updatePlayerStats();
  }
}

// Save stats to localStorage
function saveStats() {
  const stats = {
    normalTotalRuns,
    normalBest,
    normalTimeList,
    hardTotalRuns,
    hardBest,
    hardTimeList,
    isHardMode
  };
  localStorage.setItem('gunmanGameStats', JSON.stringify(stats));
}

// Update current stats based on mode
function updateCurrentStats() {
  if (isHardMode) {
    currentBest = hardBest;
    currentTimeList = hardTimeList;
    currentTotalRuns = hardTotalRuns;
  } else {
    currentBest = normalBest;
    currentTimeList = normalTimeList;
    currentTotalRuns = normalTotalRuns;
  }
}

// Initialize game
function initGame() {
  clearInterval(timerInterval);
  timerEl.textContent = translations[currentLanguage].timer;
  grid.innerHTML = "";
  timerRunning = false;
  currentNumber = 0;
  isGameStarted = false;
  startPrompt.style.display = "block";
  gameArea.classList.remove("game-started");
  gameArea.classList.remove("game-ended");
  
  const numbers = Array.from({ length: 25 }, (_, i) => i + 1).sort(() => Math.random() - 0.5);
  numbers.forEach((num) => {
    const btn = document.createElement("button");
    btn.classList.add("grid-button");
    btn.textContent = num;
    btn.dataset.num = num;
    btn.style.visibility = "hidden";
    btn.addEventListener("click", () => handleClick(btn, num));
    grid.appendChild(btn);
  });
}

// Start game
function startGame() {
  if (!isGameStarted && grid.innerHTML !== "") {
    isGameStarted = true;
    startPrompt.style.display = "none";
    gameArea.classList.add("game-started");
    
    const buttons = document.querySelectorAll(".grid-button");
    buttons.forEach(btn => {
      btn.style.visibility = "visible";
    });
    
    startTime = Date.now();
    timerInterval = setInterval(updateTimer, 10);
    timerRunning = true;
  }
}

// Handle number click
function handleClick(btn, num) {
  if (!isGameStarted) return;
  
  const expected = currentNumber + 1;
  if (num !== expected) return;

  currentNumber = expected;
  
  if (!isHardMode) {
    btn.classList.add("clicked");
    setTimeout(() => {
      btn.classList.remove("clicked");
    }, 2000);
  }

  if (isSoundOn) {
    clickSound.pause();
    clickSound.currentTime = 0;
    clickSound.play();
  }

  if (currentNumber === 25) {
    clearInterval(timerInterval);
    timerRunning = false;
    isGameStarted = false;
    gameArea.classList.add("game-ended");
    const timeUsed = (Date.now() - startTime) / 1000;
    timerEl.textContent = currentLanguage === 'zh' ? 
      `時間：${timeUsed.toFixed(2)} 秒` : 
      `Time: ${timeUsed.toFixed(2)}s`;

    // Update stats based on current mode
    if (isHardMode) {
      if (hardBest === null || timeUsed < hardBest) {
        hardBest = timeUsed;
      }
      hardTimeList.push(timeUsed);
      if (hardTimeList.length > 10) hardTimeList.shift();
      hardTotalRuns++;
    } else {
      if (normalBest === null || timeUsed < normalBest) {
        normalBest = timeUsed;
      }
      normalTimeList.push(timeUsed);
      if (normalTimeList.length > 10) normalTimeList.shift();
      normalTotalRuns++;
    }
    
    updateCurrentStats();
    updatePlayerStats();
    updateProgress();
    saveStats();

    if (isSoundOn) {
      winSound.pause();
      winSound.currentTime = 0;
      winSound.play();
    }
  }
}

// Update timer display
function updateTimer() {
  const elapsed = (Date.now() - startTime) / 1000;
  timerEl.textContent = currentLanguage === 'zh' ? 
    `時間：${elapsed.toFixed(2)} 秒` : 
    `Time: ${elapsed.toFixed(2)}s`;
}

// Update player stats
function updatePlayerStats() {
  // Update normal mode stats
  normalTotalGamesEl.textContent = normalTotalRuns;
  const normalAvg = normalTimeList.length > 0 
    ? (normalTimeList.reduce((a, b) => a + b, 0) / normalTimeList.length)
    : 0;
  normalAverageTimeEl.textContent = normalAvg.toFixed(2) + 's';
  normalBestTimeEl.textContent = normalBest === null 
    ? translations[currentLanguage].noRecord 
    : normalBest.toFixed(2) + 's';

  // Update hard mode stats
  hardTotalGamesEl.textContent = hardTotalRuns;
  const hardAvg = hardTimeList.length > 0 
    ? (hardTimeList.reduce((a, b) => a + b, 0) / hardTimeList.length)
    : 0;
  hardAverageTimeEl.textContent = hardAvg.toFixed(2) + 's';
  hardBestTimeEl.textContent = hardBest === null 
    ? translations[currentLanguage].noRecord 
    : hardBest.toFixed(2) + 's';
}

// Update progress chart
function updateProgress() {
  if (currentTimeList.length < 2) {
    progressNumber.textContent = translations[currentLanguage].noData;
    if (chart) chart.destroy();
    return;
  }

  const diff = currentTimeList[currentTimeList.length - 2] - currentTimeList[currentTimeList.length - 1];
  if (diff > 0) {
    progressNumber.textContent = translations[currentLanguage].improved.replace('${diff}', diff.toFixed(3));
  } else if (diff < 0) {
    progressNumber.textContent = translations[currentLanguage].regressed.replace('${diff}', Math.abs(diff).toFixed(3));
  } else {
    progressNumber.textContent = translations[currentLanguage].same;
  }

  const startRun = currentTotalRuns - currentTimeList.length + 1;
  const runText = currentLanguage === 'zh' ? '第' : 'Run ';
  const labels = currentTimeList.map((_, i) => `${runText}${startRun + i}${currentLanguage === 'zh' ? '次' : ''}`);

  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [{
        label: translations[currentLanguage].timeLabel,
        data: currentTimeList,
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

// Toggle hard mode
function toggleHardMode() {
  playButtonSound();
  isHardMode = !isHardMode;
  
  if (isHardMode) {
    if (hardModeBtn) hardModeBtn.classList.add("hard");
    if (gameArea) gameArea.classList.add("hard-mode");
    if (modeText) modeText.textContent = translations[currentLanguage].hardMode;
    if (modeIcon) modeIcon.textContent = '💀';
  } else {
    if (hardModeBtn) hardModeBtn.classList.remove("hard");
    if (gameArea) gameArea.classList.remove("hard-mode");
    if (modeText) modeText.textContent = translations[currentLanguage].normalMode;
    if (modeIcon) modeIcon.textContent = '😊';
  }
  
  updateCurrentStats();
  initGame();
  updatePlayerStats();
  updateProgress();
  saveStats();
}

// Reset stats
function resetStats() {
  if (confirm(translations[currentLanguage].confirmReset)) {
    normalBest = null;
    normalTimeList = [];
    normalTotalRuns = 0;
    hardBest = null;
    hardTimeList = [];
    hardTotalRuns = 0;
    
    updateCurrentStats();
    updatePlayerStats();
    updateProgress();
    saveStats();
  }
}

// Switch language
function switchLanguage() {
  currentLanguage = currentLanguage === 'zh' ? 'en' : 'zh';
  saveLanguagePreference();
  window.location.reload();
}

// Save language preference
function saveLanguagePreference() {
  localStorage.setItem('gunmanGameLanguage', currentLanguage);
}

// Load language preference
function loadLanguagePreference() {
  const savedLanguage = localStorage.getItem('gunmanGameLanguage');
  if (savedLanguage) {
    currentLanguage = savedLanguage;
  }
  translatePage();
  updateLanguageButton();
}

// Update language button text
function updateLanguageButton() {
  langTextEl.textContent = currentLanguage === 'zh' ? 'EN' : '中文';
}

// Translate page
function translatePage() {
  document.querySelector('h1').textContent = translations[currentLanguage].gameTitle;
  document.getElementById('startGameBtn').innerHTML = `
    ${translations[currentLanguage].startButton}
    <span class="ripple"></span>
  `;
  document.getElementById('restartBtn').textContent = translations[currentLanguage].restartButton;
  
  document.querySelector('#playerStats h2').textContent = translations[currentLanguage].playerStats;
  document.querySelectorAll('.stat-item .stat-label')[0].textContent = translations[currentLanguage].totalGames;
  document.querySelectorAll('.stat-item .stat-label')[1].textContent = translations[currentLanguage].averageTime;
  document.querySelectorAll('.stat-item .stat-label')[2].textContent = translations[currentLanguage].bestTime;
  document.getElementById('resetStatsBtn').textContent = translations[currentLanguage].resetButton;
  
  document.querySelector('#progressArea h2').innerHTML = `
    ${translations[currentLanguage].progressTitle} 
    <span class="subtext">${translations[currentLanguage].progressSubtext}</span>
  `;
  
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
  
  if (normalBestTimeEl) {
    normalBestTimeEl.textContent = normalBest === null 
      ? translations[currentLanguage].noRecord 
      : normalBest.toFixed(2) + 's';
  }
  
  if (hardBestTimeEl) {
    hardBestTimeEl.textContent = hardBest === null 
      ? translations[currentLanguage].noRecord 
      : hardBest.toFixed(2) + 's';
  }
  
  if (modeText) {
    modeText.textContent = isHardMode ? 
      translations[currentLanguage].hardMode : 
      translations[currentLanguage].normalMode;
  }
  
  if (startPrompt) {
    startPrompt.textContent = translations[currentLanguage].startPrompt;
  }
  
  document.querySelector('#credit > div:first-child').textContent = translations[currentLanguage].madeBy;
  
  // Update mode tabs
  modeTabs.forEach(tab => {
    const mode = tab.dataset.mode;
    tab.textContent = translations[currentLanguage][`${mode}Mode`];
  });
}

// Event listeners
startGameBtn.addEventListener("click", function() {
  playButtonSound();
  const ripple = this.querySelector(".ripple");
  ripple.style.animation = "none";
  void ripple.offsetWidth;
  ripple.style.animation = "ripple 0.6s ease-out";
  
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

restartBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  playButtonSound();
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

coffeeBtn.addEventListener('click', function() {
  playButtonSound();
});

// Game area click handler
gameArea.addEventListener("click", function(e) {
  const allButtonsHidden = document.querySelectorAll('.grid-button[style*="visible"]').length === 0;
  
  if (!isGameStarted && grid.innerHTML !== "" && !e.target.closest('button') && allButtonsHidden) {
    playButtonSound();
    startGame();
  }
});

// Space key to start
document.addEventListener("keydown", function(e) {
  if (e.code === "Space" && !isGameStarted && grid.innerHTML !== "") {
    const allButtonsHidden = document.querySelectorAll('.grid-button[style*="visible"]').length === 0;
    if (allButtonsHidden) {
      e.preventDefault();
      playButtonSound();
      startGame();
    }
  }
});

// Mode tab switching
modeTabs.forEach(tab => {
  tab.addEventListener('click', function() {
    modeTabs.forEach(t => t.classList.remove('active'));
    this.classList.add('active');
    
    const mode = this.dataset.mode;
    document.querySelectorAll('.stats-container').forEach(container => {
      container.classList.remove('active');
    });
    
    document.getElementById(`${mode}Stats`).classList.add('active');
  });
});

// Initialize game and data
loadLanguagePreference();
loadStats();
updatePlayerStats();
updateProgress();