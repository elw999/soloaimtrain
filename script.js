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

  const numbers = Array.from({ length: 25 }, (_, i) => i + 1).sort(() => Math.random() - 0.5);
  numbers.forEach((num) => {
    const btn = document.createElement("button");
    btn.classList.add("grid-button");
    btn.textContent = num;
    btn.addEventListener("click", () => handleClick(btn, num));
    grid.appendChild(btn);
  });

  timerRunning = false;
}

// 點擊方塊邏輯
function handleClick(btn, num) {
  const expected = [...grid.children].filter(b => b.classList.contains("clicked")).length + 1;

  if (num !== expected) return; // 只接受點擊正確數字

  if (!timerRunning) {
    startTime = Date.now();
    timerInterval = setInterval(updateTimer, 10);
    timerRunning = true;
  }

  btn.classList.add("clicked");

  if (isSoundOn) {
    clickSound.pause();
    clickSound.currentTime = 0;
    clickSound.play();
  }

  if (expected === 25) {
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

function updateTimer() {
  const elapsed = (Date.now() - startTime) / 1000;
  timerEl.textContent = `時間：${elapsed.toFixed(2)} 秒`;
}

soundBtn.addEventListener("click", () => {
  isSoundOn = !isSoundOn;
  soundBtn.textContent = isSoundOn ? "🔊" : "🔇";
});

restartBtn.addEventListener("click", () => {
  initGame();
});

function updateProgress() {
  if (timeList.length < 2) {
    progressNumber.textContent = "尚無資料";
    if (chart) {
      chart.destroy();
      chart = null;
    }
    return;
  }

  const diff = timeList[timeList.length - 1] - timeList[0];
  const change = ((-diff / timeList[0]) * 100).toFixed(1);
  progressNumber.textContent = `${change > 0 ? "+" : ""}${change}%`;

  const labels = timeList.map((_, i) => `#${i + 1}`);
  const data = timeList.map(t => t.toFixed(2));

  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [{
        label: "時間 (秒)",
        data,
        borderColor: "#4caf50",
        fill: false,
        tension: 0.2,
      }],
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: false,
          reverse: true // ✅ 讓進步時向上顯示
        }
      },
      plugins: {
        legend: {
          display: false,
        }
      }
    }
  });
}
