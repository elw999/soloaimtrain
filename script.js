// Game state variables
let currentNumber = 0;
let startTime, timerInterval;
let isSoundOn = true;
let isHardMode = false;
let isGameStarted = false;
let volumeLevel = 1;

// Game settings
let gridSize = 5;

// Stats
let totalClicks = 0;
let correctClicks = 0;
let reactionTimes = [];

// Achievements
let achievements = {
  firstWin: { unlocked: false, title: "首勝", desc: "完成第一次遊戲", icon: "🏆", isNew: false },
  speedDemon: { unlocked: false, title: "速度達人", desc: "在10秒內完成遊戲", icon: "⚡", isNew: false },
  hardMaster: { unlocked: false, title: "困難大師", desc: "在困難模式下完成遊戲", icon: "💀", isNew: false },
  perfectAccuracy: { unlocked: false, title: "完美準確", desc: "達到100%點擊準確率", icon: "🎯", isNew: false },
  fiveStreak: { unlocked: false, title: "五連勝", desc: "連續五次遊戲進步", icon: "🔥", isNew: false },
  marathon: { unlocked: false, title: "馬拉松", desc: "完成50場遊戲", icon: "🏃", isNew: false }
};

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

// Daily stats
let today = new Date().toDateString();
let todayStats = {
  date: today,
  gamesPlayed: 0,
  bestTime: null
};

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
    'clickPrompt': '點擊空白處開始',
    'achievements': '成就'
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
    'clickPrompt': 'Click to start',
    'achievements': 'Achievements'
  }
};

let currentLanguage = 'zh';

// DOM elements
const timerEl = document.getElementById("timer");
const grid = document.getElementById("grid");
const restartBtn = document.getElementById("restartBtn");
const soundBtn = document.getElementById("soundToggleBtn");
const volumeSlider = document.getElementById("volumeSlider");
const clickSound = document.getElementById("clickSound");
const winSound = document.getElementById("winSound");
const buttonSound = document.getElementById("buttonSound");
const achievementSound = document.getElementById("achievementSound");
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
const gridSizeSelect = document.getElementById("gridSize");
const applySettingsBtn = document.getElementById("applySettingsBtn");
const achievementsList = document.getElementById("achievementsList");

// Stats elements
const totalClicksEl = document.getElementById("totalClicks");
const accuracyEl = document.getElementById("accuracy");
const avgReactionEl = document.getElementById("avgReaction");
const todayGamesEl = document.getElementById("todayGames");

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

// Achievement modal elements
const achievementBtn = document.getElementById("achievementBtn");
const achievementModal = document.getElementById("achievementModal");
const closeModalBtn = document.getElementById("closeModalBtn");
const newAchievementBadge = document.getElementById("newAchievementBadge");

// Chart variables
let chart;
let timerRunning = false;

// Initialize particles background
function initParticles() {
  particlesJS("particles-js", {
    particles: {
      number: { value: 80, density: { enable: true, value_area: 800 } },
      color: { value: "#3a7bd5" },
      shape: { type: "circle", stroke: { width: 0, color: "#000000" } },
      opacity: { value: 0.5, random: true },
      size: { value: 3, random: true },
      line_linked: {
        enable: true,
        distance: 150,
        color: "#3a7bd5",
        opacity: 0.4,
        width: 1
      },
      move: {
        enable: true,
        speed: 2,
        direction: "none",
        random: true,
        straight: false,
        out_mode: "out",
        bounce: false
      }
    },
    interactivity: {
      detect_on: "canvas",
      events: {
        onhover: { enable: true, mode: "grab" },
        onclick: { enable: true, mode: "push" },
        resize: true
      },
      modes: {
        grab: { distance: 140, line_linked: { opacity: 1 } },
        push: { particles_nb: 4 }
      }
    },
    retina_detect: true
  });
}

// Play button sound with volume
function playButtonSound() {
  if (isSoundOn) {
    try {
      buttonSound.volume = volumeLevel;
      buttonSound.currentTime = 0;
      buttonSound.play().catch(e => console.log("Audio play error:", e));
    } catch (e) {
      console.error("Button sound error:", e);
    }
  }
}

// Play click sound with volume
function playClickSound() {
  if (isSoundOn) {
    try {
      clickSound.volume = volumeLevel;
      clickSound.currentTime = 0;
      clickSound.play().catch(e => console.log("Audio play error:", e));
    } catch (e) {
      console.error("Click sound error:", e);
    }
  }
}

// Play win sound with volume
function playWinSound() {
  if (isSoundOn) {
    try {
      winSound.volume = volumeLevel;
      winSound.currentTime = 0;
      winSound.play().catch(e => console.log("Audio play error:", e));
    } catch (e) {
      console.error("Win sound error:", e);
    }
  }
}

// Play achievement sound
function playAchievementSound() {
  if (isSoundOn) {
    try {
      achievementSound.volume = volumeLevel;
      achievementSound.currentTime = 0;
      achievementSound.play().catch(e => console.log("Audio play error:", e));
    } catch (e) {
      console.error("Achievement sound error:", e);
    }
  }
}

// Create confetti effect
function createConfetti() {
  const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
  const confettiCount = 200;
  
  for (let i = 0; i < confettiCount; i++) {
    const confetti = document.createElement('div');
    confetti.className = 'confetti';
    confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    confetti.style.left = Math.random() * 100 + 'vw';
    confetti.style.top = '-10px';
    confetti.style.width = Math.random() * 10 + 5 + 'px';
    confetti.style.height = Math.random() * 10 + 5 + 'px';
    confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
    confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
    document.body.appendChild(confetti);
    
    // 添加動畫
    confetti.style.animation = `confetti-fall ${Math.random() * 3 + 2}s linear forwards`;
    
    // 移除彩帶
    setTimeout(() => {
      confetti.remove();
    }, 5000);
  }
  
  // 添加破紀錄提示
  const recordFlash = document.createElement('div');
  recordFlash.className = 'record-flash';
  recordFlash.textContent = currentLanguage === 'zh' ? '新紀錄！' : 'New Record!';
  document.body.appendChild(recordFlash);
  
  setTimeout(() => {
    recordFlash.remove();
  }, 2000);
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
    volumeLevel = stats.volumeLevel !== undefined ? stats.volumeLevel : 1;
    totalClicks = stats.totalClicks || 0;
    correctClicks = stats.correctClicks || 0;
    reactionTimes = stats.reactionTimes || [];
    achievements = stats.achievements || achievements;
    todayStats = stats.todayStats || todayStats;
    gridSize = stats.gridSize || 5;
    
    if (isHardMode) {
      gameArea.classList.add("hard-mode");
      hardModeBtn.classList.add("hard");
      modeText.textContent = translations[currentLanguage].hardMode;
      modeIcon.textContent = '💀';
    }
    
    // Set initial volume slider value
    volumeSlider.value = volumeLevel;
    updateVolumeIcon();
    
    // Update settings dropdown
    gridSizeSelect.value = gridSize;
    
    updateCurrentStats();
    updatePlayerStats();
    updateProgress();
    updateAchievements();
    updateTrainingStats();
    
    // Check if there are new achievements to show badge
    checkForNewAchievements();
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
    isHardMode,
    volumeLevel,
    totalClicks,
    correctClicks,
    reactionTimes,
    achievements,
    todayStats,
    gridSize
  };
  localStorage.setItem('gunmanGameStats', JSON.stringify(stats));
}

// Update volume icon based on volume level
function updateVolumeIcon() {
  if (volumeLevel === 0) {
    soundBtn.textContent = "🔇";
  } else if (volumeLevel <= 0.3) {
    soundBtn.textContent = "🔈";
  } else {
    soundBtn.textContent = "🔊";
  }
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
  startPrompt.style.display = "flex";
  gameArea.classList.remove("game-started");
  gameArea.classList.remove("game-ended");
  
  const numbers = [];
  const count = gridSize * gridSize;
  const min = 1;
  const max = count;
  
  // Generate unique random numbers
  while (numbers.length < count) {
    const num = Math.floor(Math.random() * (max - min + 1)) + min;
    if (numbers.indexOf(num) === -1) {
      numbers.push(num);
    }
  }
  
  numbers.sort(() => Math.random() - 0.5);
  
  // Set grid template
  grid.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;
  
  // Add grid size class
  grid.className = `grid-size-${gridSize}`;
  
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
    
    // Add animation effect
    gameArea.animate([
      { transform: 'scale(0.95)', opacity: 0.8 },
      { transform: 'scale(1)', opacity: 1 }
    ], {
      duration: 300,
      easing: 'ease-out'
    });
  }
}

// Handle number click
function handleClick(btn, num) {
  if (!isGameStarted) return;
  
  const clickTime = Date.now();
  const reactionTime = clickTime - startTime - (currentNumber * 100); // Approximate reaction time
  reactionTimes.push(reactionTime);
  totalClicks++;
  
  const expected = currentNumber + 1;
  if (num !== expected) return;
  
  correctClicks++;
  currentNumber = expected;
  
  if (!isHardMode) {
    btn.classList.add("clicked");
    setTimeout(() => {
      btn.classList.remove("clicked");
    }, 2000);
  }
  
  playClickSound();
  
  if (currentNumber === gridSize * gridSize) {
  clearInterval(timerInterval);
  timerRunning = false;
  isGameStarted = false;
  gameArea.classList.add("game-ended");
  const timeUsed = (Date.now() - startTime) / 1000;
  timerEl.textContent = currentLanguage === 'zh' ? 
    `時間：${timeUsed.toFixed(2)} 秒` : 
    `Time: ${timeUsed.toFixed(2)}s`;
  
  // 更新當前模式的統計數據
  if (isHardMode) {
    hardTotalRuns++;
    hardTimeList.push(timeUsed);
    if (hardBest === null || timeUsed < hardBest) {
      hardBest = timeUsed;
      createConfetti();
    }
  } else {
    normalTotalRuns++;
    normalTimeList.push(timeUsed);
    if (normalBest === null || timeUsed < normalBest) {
      normalBest = timeUsed;
      createConfetti();
    }
  }
  
  // 更新每日統計
  const today = new Date().toDateString();
  if (todayStats.date !== today) {
    todayStats = { date: today, gamesPlayed: 0, bestTime: null };
  }
  todayStats.gamesPlayed++;
  if (!todayStats.bestTime || timeUsed < todayStats.bestTime) {
    todayStats.bestTime = timeUsed;
  }
  
  updateCurrentStats();
  updatePlayerStats();
  updateProgress();
  updateTrainingStats();
  saveStats();
  
  playWinSound();
  
  // 檢查成就
  checkAchievements(timeUsed);
}
}

// Check and unlock achievements
function checkAchievements(timeUsed) {
  let unlockedAny = false;
  
  // First win
  if (!achievements.firstWin.unlocked) {
    achievements.firstWin.unlocked = true;
    achievements.firstWin.isNew = true;
    unlockAchievement('firstWin');
    unlockedAny = true;
  }
  
  // Speed demon
  if (!achievements.speedDemon.unlocked && timeUsed < 10) {
    achievements.speedDemon.unlocked = true;
    achievements.speedDemon.isNew = true;
    unlockAchievement('speedDemon');
    unlockedAny = true;
  }
  
  // Hard master
  if (!achievements.hardMaster.unlocked && isHardMode) {
    achievements.hardMaster.unlocked = true;
    achievements.hardMaster.isNew = true;
    unlockAchievement('hardMaster');
    unlockedAny = true;
  }
  
  // Perfect accuracy
  if (!achievements.perfectAccuracy.unlocked && correctClicks === totalClicks && totalClicks > 0) {
    achievements.perfectAccuracy.unlocked = true;
    achievements.perfectAccuracy.isNew = true;
    unlockAchievement('perfectAccuracy');
    unlockedAny = true;
  }
  
  // Five streak
  if (!achievements.fiveStreak.unlocked && currentTimeList.length >= 5) {
    let improved = true;
    for (let i = currentTimeList.length - 1; i > currentTimeList.length - 5; i--) {
      if (currentTimeList[i] >= currentTimeList[i-1]) {
        improved = false;
        break;
      }
    }
    if (improved) {
      achievements.fiveStreak.unlocked = true;
      achievements.fiveStreak.isNew = true;
      unlockAchievement('fiveStreak');
      unlockedAny = true;
    }
  }
  
  // Marathon
  if (!achievements.marathon.unlocked && (normalTotalRuns + hardTotalRuns) >= 50) {
    achievements.marathon.unlocked = true;
    achievements.marathon.isNew = true;
    unlockAchievement('marathon');
    unlockedAny = true;
  }
  
  if (unlockedAny) {
    playAchievementSound();
    saveStats();
    checkForNewAchievements();
  }
}

// Check if there are new achievements
function checkForNewAchievements() {
  let hasNew = false;
  for (const key in achievements) {
    if (achievements[key].isNew) {
      hasNew = true;
      break;
    }
  }
  
  if (hasNew) {
    newAchievementBadge.style.display = "flex";
  } else {
    newAchievementBadge.style.display = "none";
  }
}

// Unlock achievement with animation
function unlockAchievement(achievementKey) {
  const achievement = achievements[achievementKey];
  const achievementEl = document.createElement('div');
  achievementEl.className = 'achievement unlocked new';
  achievementEl.innerHTML = `
    <div class="achievement-icon">${achievement.icon}</div>
    <div class="achievement-details">
      <div class="achievement-title">${achievement.title}</div>
      <div class="achievement-desc">${achievement.desc}</div>
    </div>
  `;
  
  achievementsList.insertBefore(achievementEl, achievementsList.firstChild);
  
  // Animate achievement
  achievementEl.animate([
    { transform: 'translateX(100px)', opacity: 0 },
    { transform: 'translateX(0)', opacity: 1 }
  ], {
    duration: 500,
    easing: 'ease-out'
  });
}

// Update achievements display
function updateAchievements() {
  achievementsList.innerHTML = '';
  
  for (const key in achievements) {
    const achievement = achievements[key];
    const achievementEl = document.createElement('div');
    achievementEl.className = `achievement ${achievement.unlocked ? 'unlocked' : 'locked'}`;
    if (achievement.isNew) {
      achievementEl.classList.add('new');
    }
    achievementEl.innerHTML = `
      <div class="achievement-icon">${achievement.icon}</div>
      <div class="achievement-details">
        <div class="achievement-title">${achievement.title}</div>
        <div class="achievement-desc">${achievement.desc}</div>
      </div>
    `;
    achievementsList.appendChild(achievementEl);
  }
  
  // Add animations for new achievements
  const newAchievements = document.querySelectorAll('.achievement.new');
  newAchievements.forEach(el => {
    el.animate([
      { transform: 'scale(1)', boxShadow: '0 0 0 rgba(76, 175, 80, 0)' },
      { transform: 'scale(1.05)', boxShadow: '0 0 20px rgba(76, 175, 80, 0.7)' },
      { transform: 'scale(1)', boxShadow: '0 0 0 rgba(76, 175, 80, 0)' }
    ], {
      duration: 1000,
      iterations: 2
    });
    
    // Remove new class after animation
    setTimeout(() => {
      el.classList.remove('new');
    }, 2000);
  });
}

// Toggle achievement modal
function toggleAchievementModal() {
  playButtonSound();
  
  if (achievementModal.classList.contains('active')) {
    // Hide modal
    achievementModal.classList.remove('active');
    
    // Mark all achievements as viewed
    for (const key in achievements) {
      achievements[key].isNew = false;
    }
    
    // Hide the new achievement badge
    newAchievementBadge.style.display = 'none';
    
    // Save updated achievements
    saveStats();
  } else {
    // Show modal
    achievementModal.classList.add('active');
    
    // Update achievements display with animations
    updateAchievements();
  }
}

// Update training stats
function updateTrainingStats() {
  totalClicksEl.textContent = totalClicks;
  
  const accuracy = totalClicks > 0 ? (correctClicks / totalClicks * 100) : 0;
  accuracyEl.textContent = accuracy.toFixed(1) + '%';
  
  const avgReaction = reactionTimes.length > 0 ? 
    reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length : 0;
  avgReactionEl.textContent = avgReaction.toFixed(0) + 'ms';
  
  todayGamesEl.textContent = todayStats.gamesPlayed;
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
  // 更新普通模式統計
  normalTotalGamesEl.textContent = normalTotalRuns;
  const normalAvg = normalTimeList.length > 0 
    ? (normalTimeList.reduce((a, b) => a + b, 0) / normalTimeList.length)
    : 0;
  normalAverageTimeEl.textContent = normalAvg.toFixed(2) + 's';
  normalBestTimeEl.textContent = normalBest === null 
    ? translations[currentLanguage].noRecord 
    : normalBest.toFixed(2) + 's';
  
  // 更新困難模式統計
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
          ticks: { color: 'rgba(255,255,255,0.7)' },
          grid: { color: 'rgba(255,255,255,0.1)' }
        },
        x: {
          ticks: { color: 'rgba(255,255,255,0.7)' },
          grid: { color: 'rgba(255,255,255,0.1)' }
        }
      },
      plugins: {
        legend: { 
          display: true,
          labels: { color: 'rgba(255,255,255,0.7)' }
        },
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
    hardModeBtn.classList.add("hard");
    gameArea.classList.add("hard-mode");
    modeText.textContent = translations[currentLanguage].hardMode;
    modeIcon.textContent = '💀';
  } else {
    hardModeBtn.classList.remove("hard");
    gameArea.classList.remove("hard-mode");
    modeText.textContent = translations[currentLanguage].normalMode;
    modeIcon.textContent = '😊';
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
    totalClicks = 0;
    correctClicks = 0;
    reactionTimes = [];
    todayStats = { date: new Date().toDateString(), gamesPlayed: 0, bestTime: null };
    
    // Reset achievements
    for (const key in achievements) {
      achievements[key].unlocked = false;
      achievements[key].isNew = false;
    }
    
    updateCurrentStats();
    updatePlayerStats();
    updateProgress();
    updateTrainingStats();
    updateAchievements();
    saveStats();
    checkForNewAchievements();
  }
}

// Apply settings
function applySettings() {
  gridSize = parseInt(gridSizeSelect.value);
  initGame();
  saveStats();
  playButtonSound();
  
  // Update grid size class
  grid.className = `grid-size-${gridSize}`;
}

// Switch language
function switchLanguage() {
  playButtonSound();
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
    const clickText = startPrompt.querySelector('.click-text');
    if (clickText) {
      clickText.textContent = translations[currentLanguage].clickPrompt;
    }
  }
  
  document.querySelector('#credit > div:first-child').textContent = translations[currentLanguage].madeBy;
  
  // Update mode tabs
  modeTabs.forEach(tab => {
    const mode = tab.dataset.mode;
    tab.textContent = translations[currentLanguage][`${mode}Mode`];
  });
  
  // Update achievement button text
  document.querySelector('.achievement-text').textContent = translations[currentLanguage].achievements;
}

// Volume control event listener
volumeSlider.addEventListener("input", function() {
  volumeLevel = parseFloat(this.value);
  updateVolumeIcon();
  
  // Play a test sound when adjusting volume
  if (isSoundOn) {
    buttonSound.volume = volumeLevel;
    buttonSound.currentTime = 0;
    buttonSound.play().catch(e => console.log("Audio play error:", e));
  }
  
  saveStats();
});

// Sound toggle button event listener
soundBtn.addEventListener("click", () => {
  isSoundOn = !isSoundOn;
  
  if (isSoundOn) {
    buttonSound.volume = volumeLevel;
    buttonSound.currentTime = 0;
    buttonSound.play().catch(e => console.log("Audio play error:", e));
    updateVolumeIcon();
  } else {
    soundBtn.textContent = "🔇";
  }
  
  saveStats();
});

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
      initParticles();
    }, 50);
  }, 300);
});

restartBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  playButtonSound();
  initGame();
});

resetStatsBtn.addEventListener("click", resetStats);
applySettingsBtn.addEventListener("click", applySettings);

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
    
    // Sync main game area mode
    if (mode === "hard" && !isHardMode) {
      toggleHardMode();
    } else if (mode === "normal" && isHardMode) {
      toggleHardMode();
    }
  });
});

// Achievement modal functionality
achievementBtn.addEventListener('click', toggleAchievementModal);

closeModalBtn.addEventListener('click', toggleAchievementModal);

// Close modal when clicking outside
achievementModal.addEventListener('click', function(e) {
  if (e.target === this) {
    toggleAchievementModal();
  }
});

// Initialize

// Initialize game and data
loadLanguagePreference();
loadStats();
updatePlayerStats();
updateProgress();
updateAchievements();
updateTrainingStats();
initParticles();