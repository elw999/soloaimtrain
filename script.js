// 遊戲狀態變量
let currentNumber = 0;
let startTime, timerInterval;
let best = null;
let timeList = [];
let isSoundOn = true;
let totalRuns = 0;

// DOM 元素
const timerEl = document.getElementById("timer");
const bestTimeEl = document.getElementById("bestTime");
const grid = document.getElementById("grid");
const restartBtn = document.getElementById("restartBtn");
const soundBtn = document.getElementById("soundToggleBtn");
const clickSound = document.getElementById("clickSound");
const winSound = document.getElementById("winSound");
const progressNumber = document.getElementById("progressNumber");
const ctx = document.getElementById("progressChart").getContext("2d");
const startGameBtn = document.getElementById("startGameBtn");
const mainContainer = document.getElementById("mainContainer");
const titleContainer = document.getElementById("titleContainer");
const resetStatsBtn = document.getElementById("resetStatsBtn");

// 玩家數據元素
const totalGamesEl = document.getElementById("totalGames");
const averageTimeEl = document.getElementById("averageTime");

// 圖表變量
let chart;
let timerRunning = false;

// 從localStorage加載數據
function loadStats() {
  const savedStats = localStorage.getItem('gunmanGameStats');
  if (savedStats) {
    const stats = JSON.parse(savedStats);
    totalRuns = stats.totalRuns || 0;
    best = stats.best || null;
    timeList = stats.timeList || [];
    
    if (best !== null) {
      bestTimeEl.textContent = `${best.toFixed(2)} 秒`;
    }
  }
}

// 保存數據到localStorage
function saveStats() {
  const stats = {
    totalRuns,
    best,
    timeList
  };
  localStorage.setItem('gunmanGameStats', JSON.stringify(stats));
}

// 重置所有統計數據
function resetStats() {
  if (confirm("確定要重置所有遊戲數據嗎？此操作無法復原！")) {
    totalRuns = 0;
    best = null;
    timeList = [];
    
    bestTimeEl.textContent = "尚無紀錄";
    saveStats();
    updatePlayerStats();
    updateProgress();
  }
}

// 初始化遊戲
function initGame() {
  clearInterval(timerInterval);
  timerEl.textContent = "時間：0.00 秒";
  grid.innerHTML = "";
  timerRunning = false;
  currentNumber = 0;

  // 生成隨機數字網格
  const numbers = Array.from({ length: 25 }, (_, i) => i + 1).sort(() => Math.random() - 0.5);
  numbers.forEach((num) => {
    const btn = document.createElement("button");
    btn.classList.add("grid-button");
    btn.textContent = num;
    btn.dataset.num = num;
    btn.addEventListener("click", () => handleClick(btn, num));
    grid.appendChild(btn);
  });
}

// 處理數字點擊
function handleClick(btn, num) {
  const expected = currentNumber + 1;
  if (num !== expected) return;

  // 開始計時器（如果是第一個點擊）
  if (!timerRunning) {
    startTime = Date.now();
    timerInterval = setInterval(updateTimer, 10);
    timerRunning = true;
  }

  currentNumber = expected;
  btn.classList.add("clicked");

  // 播放音效
  if (isSoundOn) {
    clickSound.pause();
    clickSound.currentTime = 0;
    clickSound.play();
  }

  // 移除點擊樣式
  setTimeout(() => {
    btn.classList.remove("clicked");
  }, 2000);

  // 檢查是否完成遊戲
  if (currentNumber === 25) {
    clearInterval(timerInterval);
    timerRunning = false;
    const timeUsed = (Date.now() - startTime) / 1000;
    timerEl.textContent = `時間：${timeUsed.toFixed(2)} 秒`;

    // 更新最佳紀錄
    if (best === null || timeUsed < best) {
      best = timeUsed;
      bestTimeEl.textContent = `${best.toFixed(2)} 秒`;
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
  timerEl.textContent = `時間：${elapsed.toFixed(2)} 秒`;
}

// 更新玩家數據
function updatePlayerStats() {
  totalGamesEl.textContent = totalRuns;
  
  // 計算平均時間
  const avg = timeList.length > 0 
    ? (timeList.reduce((a, b) => a + b, 0) / timeList.length)
    : 0;
  averageTimeEl.textContent = avg.toFixed(2) + "s";
}

// 更新進度圖表
function updateProgress() {
  if (timeList.length < 2) {
    progressNumber.textContent = "尚無資料";
    if (chart) chart.destroy();
    return;
  }

  // 計算進步/退步
  const diff = timeList[timeList.length - 2] - timeList[timeList.length - 1];
  if (diff > 0) {
    progressNumber.textContent = `進步了 ${diff.toFixed(3)} 秒 🎉`;
  } else if (diff < 0) {
    progressNumber.textContent = `退步了 ${Math.abs(diff).toFixed(3)} 秒 😥`;
  } else {
    progressNumber.textContent = "與上次持平";
  }

  // 準備圖表數據
  const startRun = totalRuns - timeList.length + 1;
  const labels = timeList.map((_, i) => `第${startRun + i}次`);

  if (chart) chart.destroy();

  // 繪製圖表
  chart = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [{
        label: "時間（秒）",
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

// 事件監聽器
startGameBtn.addEventListener("click", function() {
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
  // 按鈕反饋動畫
  restartBtn.style.transform = "scale(0.95)";
  setTimeout(() => {
    restartBtn.style.transform = "scale(1)";
  }, 200);
  
  // 重新開始遊戲
  initGame();
});

soundBtn.addEventListener("click", () => {
  isSoundOn = !isSoundOn;
  soundBtn.textContent = isSoundOn ? "🔊" : "🔇";
});

resetStatsBtn.addEventListener("click", resetStats);

// 初始化遊戲和數據
loadStats();
updatePlayerStats();
updateProgress();