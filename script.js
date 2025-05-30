let currentNumber = 0;  // 目前已點擊的數字
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
let timerRunning = false;

startGameBtn.addEventListener("click", () => {
  startGameBtn.style.display = "none";
  mainContainer.style.display = "flex";
  initGame();
  updateProgress();
});

restartBtn.addEventListener("click", () => {
  initGame();
  updateProgress();
});

soundBtn.addEventListener("click", () => {
  isSoundOn = !isSoundOn;
  soundBtn.textContent = isSoundOn ? "🔊" : "🔇";
});

function initGame() {
  clearInterval(timerInterval);
  timerEl.textContent = "時間：0.00 秒";
  grid.innerHTML = "";
  timerRunning = false;
  currentNumber = 0;  // 初始化目前已點擊數字

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

function handleClick(btn, num) {
  const expected = currentNumber + 1;
  if (num !== expected) return;

  if (!timerRunning) {
    startTime = Date.now();
    timerInterval = setInterval(updateTimer, 10);
    timerRunning = true;
  }

  currentNumber = expected;

  btn.classList.add("clicked");

  if (isSoundOn) {
    clickSound.pause();
    clickSound.currentTime = 0;
    clickSound.play();
  }

  // 2秒後移除點擊綠色樣式，不影響遊戲邏輯
  setTimeout(() => {
    btn.classList.remove("clicked");
  }, 2000);

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

function updateTimer() {
  const elapsed = (Date.now() - startTime) / 1000;
  timerEl.textContent = `時間：${elapsed.toFixed(2)} 秒`;
}

function updateProgress() {
  if (timeList.length < 2) {
    progressNumber.textContent = "尚無資料";
    if (chart) chart.destroy();
    return;
  }

  const diff = timeList[timeList.length - 2] - timeList[timeList.length - 1];
  if (diff > 0) {
    progressNumber.textContent = `進步了 ${diff.toFixed(3)} 秒 🎉`;
  } else if (diff < 0) {
    progressNumber.textContent = `退步了 ${(-diff).toFixed(3)} 秒 😥`;
  } else {
    progressNumber.textContent = "與上次持平";
  }

  const labels = timeList.map((_, i) => `第${i + 1}次`);
  if (chart) chart.destroy();

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
