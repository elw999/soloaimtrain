let startTime, timerInterval;
let best = null;
let timeList = [];
let isSoundOn = true;

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

let chart;
let timerRunning = false;  // 計時器是否已啟動
let currentNumber = 0;     // 追蹤當前點擊到的數字
let clickedButtons = new Map(); // 儲存被點擊的按鈕與時間 (用於顏色消失)

startGameBtn.addEventListener("click", () => {
  startGameBtn.style.display = "none";
  mainContainer.style.display = "flex";
  initGame();
});

// 初始化遊戲，生成格子但不計時
function initGame() {
  clearInterval(timerInterval);
  timerEl.textContent = "時間：0.00 秒";
  grid.innerHTML = "";
  clickedButtons.clear();
  currentNumber = 0;

  const numbers = Array.from({ length: 25 }, (_, i) => i + 1).sort(() => Math.random() - 0.5);
  numbers.forEach((num) => {
    const btn = document.createElement("button");
    btn.classList.add("grid-button");
    btn.textContent = num;
    btn.addEventListener("click", () => handleClick(btn, num));
    grid.appendChild(btn);
  });

  timerRunning = false;
  if (chart) {
    chart.destroy();
    chart = null;
  }
  progressNumber.textContent = "尚無資料";
}

// 點擊方塊邏輯
function handleClick(btn, num) {
  if (num !== currentNumber + 1) return; // 用 currentNumber 判斷順序

  if (!timerRunning) {
    startTime = Date.now();
    timerInterval = setInterval(updateTimer, 10);
    timerRunning = true;
  }

  currentNumber++;
  btn.classList.add("clicked");
  clickedButtons.set(btn, Date.now());

  if (isSoundOn) {
    clickSound.pause();
    clickSound.currentTime = 0;
    clickSound.play();
  }

  if (currentNumber === 25) {
    clearInterval(timerInterval);
    timerRunning = false;
    const timeUsed = (Date.now() - startTime) / 1000;
    timerEl.textContent = `時間：${timeUsed.toFixed(2)} 秒`;
    if (best === null || timeUsed < best) {
      best = timeUsed;
      bestTimeEl.textContent = `${best.toFixed(2)} 秒`;
    }
    timeList.push(timeUsed);
    if (timeList.length > 10) timeList.shift();
    updateProgress();

    if (isSoundOn) {
      winSound.pause();
      winSound.currentTime = 0;
      winSound.play();
    }
  }
}

// 計時器更新
function updateTimer() {
  const elapsed = (Date.now() - startTime) / 1000;
  timerEl.textContent = `時間：${elapsed.toFixed(2)} 秒`;
}

// 切換音效
soundBtn.addEventListener("click", () => {
  isSoundOn = !isSoundOn;
  soundBtn.textContent = isSoundOn ? "🔊" : "🔇";
});

// 重新開始按鈕
restartBtn.addEventListener("click", () => {
  initGame();
});

// 2秒後清除已點擊按鈕顏色的循環
setInterval(() => {
  const now = Date.now();
  for (const [btn, clickedTime] of clickedButtons.entries()) {
    if (now - clickedTime > 2000) {
      btn.classList.remove("clicked");
      clickedButtons.delete(btn);
    }
  }
}, 200);

// 更新進步圖表與數字
function updateProgress() {
  if (timeList.length === 0) {
    progressNumber.textContent = "尚無資料";
    if (chart) {
      chart.destroy();
      chart = null;
    }
    return;
  }

  // 計算前後差值百分比 (用第一筆作基準，後面每筆與前一筆比較)
  let diffs = [];
  for (let i = 1; i < timeList.length; i++) {
    const diff = ((timeList[i - 1] - timeList[i]) / timeList[i - 1]) * 100;
    diffs.push(diff.toFixed(2));
  }

  // 顯示最後一次進步百分比
  let lastDiff = diffs.length > 0 ? diffs[diffs.length - 1] : "0.00";
  let sign = lastDiff > 0 ? "+" : "";
  progressNumber.textContent = `${sign}${lastDiff}%`;

  // 繪製折線圖
  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: "line",
    data: {
      labels: timeList.map((_, i) => i + 1),
      datasets: [{
        label: "完成時間 (秒)",
        data: timeList,
        borderColor: "#4caf50",
        backgroundColor: "rgba(76, 175, 80, 0.3)",
        fill: true,
        tension: 0.3,
        pointRadius: 5,
        pointHoverRadius: 7,
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: false,
          suggestedMin: Math.min(...timeList) * 0.9,
          suggestedMax: Math.max(...timeList) * 1.1,
          title: {
            display: true,
            text: "秒數"
          }
        },
        x: {
          title: {
            display: true,
            text: "遊玩次數"
          }
        }
      },
      plugins: {
        legend: { display: false }
      }
    }
  });
}
