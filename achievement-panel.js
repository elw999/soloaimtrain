// achievement-panel.js
// 這個檔案應於 script.js 載入後引入

document.addEventListener("DOMContentLoaded", function () {
  const achievementBtn = document.getElementById("achievementBtn");
  const achievementModal = document.getElementById("achievementModal");
  const closeModalBtn = document.getElementById("closeModalBtn");
  const newAchievementBadge = document.getElementById("newAchievementBadge");
  const achievementsList = document.getElementById("achievementsList");

  // 切換成就面板顯示
  window.toggleAchievementModal = function toggleAchievementModal() {
    if (achievementModal.classList.contains('active')) {
      achievementModal.classList.remove('active');
      // 將所有成就 isNew = false
      if (window.achievements) {
        for (const key in window.achievements) {
          window.achievements[key].isNew = false;
        }
        if (typeof window.saveStats === "function") window.saveStats();
      }
      if (newAchievementBadge) newAchievementBadge.style.display = 'none';
    } else {
      achievementModal.classList.add('active');
      if (typeof window.updateAchievements === "function") {
        window.updateAchievements();
      } else if (achievementsList) {
        // fallback: 顯示預設
        achievementsList.innerHTML = `<div class="achievement unlocked">
          <div class="achievement-icon">🏆</div>
          <div class="achievement-details">
            <div class="achievement-title">首勝</div>
            <div class="achievement-desc">完成第一次遊戲</div>
          </div>
        </div>`;
      }
    }
  };

  if (achievementBtn) achievementBtn.addEventListener('click', window.toggleAchievementModal);
  if (closeModalBtn) closeModalBtn.addEventListener('click', window.toggleAchievementModal);
  if (achievementModal) {
    achievementModal.addEventListener('click', function(e) {
      // 點擊遮罩關閉
      if (e.target === achievementModal) {
        window.toggleAchievementModal();
      }
    });
  }
});