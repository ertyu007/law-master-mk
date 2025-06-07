/**
 * law-chapter1.js
 * เกม Drag & Drop เกี่ยวกับกฎหมายไทย - รองรับทั้งมือถือและคอมพิวเตอร์
 * เวอร์ชันปรับปรุง: เพิ่มประสิทธิภาพและแก้ไขข้อบกพร่อง
 */

// ระบบแจ้งเตือนแบบโมดอล
const AlertSystem = {
  show: function (type, title, message, callback) {
    try {
      // สร้าง overlay
      const overlay = document.createElement("div");
      overlay.className = "alert-overlay";

      // สร้างกล่องแจ้งเตือน
      const alertBox = document.createElement("div");
      alertBox.className = `alert-box alert-${type}`;

      // ไอคอนแสดงสถานะ
      const icon = document.createElement("div");
      icon.className = "alert-icon";

      // เลือกไอคอนตามประเภท
      const icons = {
        success: "✓",
        warning: "⚠️",
        error: "✗",
        info: "ℹ️"
      };
      icon.textContent = icons[type] || icons.info;

      // หัวข้อแจ้งเตือน
      const alertTitle = document.createElement("h3");
      alertTitle.className = "alert-title";
      alertTitle.textContent = title;

      // ข้อความแจ้งเตือน
      const alertMessage = document.createElement("div");
      alertMessage.className = "alert-message";
      alertMessage.textContent = message;

      // ปุ่มตกลง
      const button = document.createElement("button");
      button.className = "alert-btn";
      button.textContent = "ตกลง";
      button.onclick = () => {
        document.body.removeChild(overlay);
        if (typeof callback === 'function') callback();
      };

      // รวมองค์ประกอบ
      alertBox.append(icon, alertTitle, alertMessage, button);
      overlay.appendChild(alertBox);
      document.body.appendChild(overlay);

      // แสดงด้วย animation
      setTimeout(() => overlay.classList.add("active"), 10);

    } catch (error) {
      console.error("AlertSystem error:", error);
      // Fallback ใช้ alert ปกติถ้ามีปัญหา
      alert(`${title}\n${message}`);
    }
  }
};

// สถานะเกม
const GameState = {
  questions: [
    'q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q8', 'q9', 'q10',
    'q11', 'q12', 'q13', 'q14', 'q15', 'q16', 'q17', 'q18', 'q19', 'q20'
  ],
  currentIndex: 0,
  score: 0,
  answered: {}
};

// ตัวแปรการลากและวาง
let dragState = {
  item: null,
  clone: null,
  startX: 0,
  startY: 0,
  isDragging: false,
  longPressTimer: null
};

// เริ่มต้นเกมเมื่อหน้าเว็บโหลดเสร็จ
document.addEventListener("DOMContentLoaded", initGame);

function initGame() {
  try {
    setupDragDrop();
    showQuestion(GameState.questions[GameState.currentIndex]);
    updateUI();
  } catch (error) {
    console.error("Init error:", error);
    AlertSystem.show("error", "ข้อผิดพลาด", "ไม่สามารถเริ่มเกมได้");
  }
}

function setupDragDrop() {
  try {
    // ตั้งค่า Drag Items
    document.querySelectorAll(".drag-item").forEach(item => {
      item.setAttribute("draggable", true);

      // ลบ event listeners เดิมก่อนเพิ่มใหม่
      item.removeEventListener("dragstart", handleDragStart);
      item.removeEventListener("dragend", handleDragEnd);
      item.removeEventListener("touchstart", handleTouchStart);
      item.removeEventListener("touchmove", handleTouchMove);
      item.removeEventListener("touchend", handleTouchEnd);

      // เพิ่ม event listeners ใหม่
      item.addEventListener("dragstart", handleDragStart);
      item.addEventListener("dragend", handleDragEnd);
      item.addEventListener("touchstart", handleTouchStart, { passive: false });
      item.addEventListener("touchmove", handleTouchMove, { passive: false });
      item.addEventListener("touchend", handleTouchEnd);
    });

    // ตั้งค่า Drop Zones
    document.querySelectorAll(".drop-zone").forEach(zone => {
      zone.removeEventListener("dragover", handleDragOver);
      zone.removeEventListener("drop", handleDrop);

      zone.addEventListener("dragover", handleDragOver);
      zone.addEventListener("drop", handleDrop);
    });

    // การดับเบิลคลิกเพื่อลบคำตอบ
    document.addEventListener("dblclick", handleDoubleClick);

  } catch (error) {
    console.error("DragDrop setup error:", error);
  }
}

// ========== Mouse Events ==========
function handleDragStart(e) {
  try {
    e.dataTransfer.setData("text/plain", e.target.dataset.value);
    e.dataTransfer.effectAllowed = "copy";
    e.target.classList.add("dragging");
  } catch (error) {
    console.error("DragStart error:", error);
  }
}

function handleDragEnd(e) {
  try {
    e.target.classList.remove("dragging");
  } catch (error) {
    console.error("DragEnd error:", error);
  }
}

function handleDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = "copy";
}

function handleDrop(e) {
  try {
    e.preventDefault();
    const value = e.dataTransfer.getData("text/plain");
    const zone = e.target.closest(".drop-zone");

    if (zone && value) {
      placeAnswer(zone, value);
      playSound("drop");
    }
  } catch (error) {
    console.error("Drop error:", error);
  }
}

// ========== Touch Events ==========
function handleTouchStart(e) {
  try {
    if (e.touches.length !== 1) return;
    e.preventDefault();

    dragState.item = e.target.closest(".drag-item");
    if (!dragState.item) return;

    const touch = e.touches[0];
    dragState.startX = touch.clientX;
    dragState.startY = touch.clientY;

    // ตั้งเวลา long press
    clearTimeout(dragState.longPressTimer);
    dragState.longPressTimer = setTimeout(() => {
      dragState.isDragging = true;

      // สร้างองค์ประกอบลาก
      dragState.clone = dragState.item.cloneNode(true);
      dragState.clone.style.position = "fixed";
      dragState.clone.style.pointerEvents = "none";
      dragState.clone.style.opacity = "0.8";
      dragState.clone.style.zIndex = "1000";
      dragState.clone.style.left = `${dragState.startX - dragState.clone.offsetWidth / 2}px`;
      dragState.clone.style.top = `${dragState.startY - dragState.clone.offsetHeight / 2}px`;
      dragState.clone.classList.add("dragging");

      document.body.appendChild(dragState.clone);
      dragState.item.classList.add("dragging");
    }, 300);

  } catch (error) {
    console.error("TouchStart error:", error);
    resetDragState();
  }
}

function handleTouchMove(e) {
  try {
    if (!dragState.isDragging) return;
    e.preventDefault();

    const touch = e.touches[0];
    const moveX = touch.clientX;
    const moveY = touch.clientY;

    if (dragState.clone) {
      dragState.clone.style.left = `${moveX - dragState.clone.offsetWidth / 2}px`;
      dragState.clone.style.top = `${moveY - dragState.clone.offsetHeight / 2}px`;
    }

    // Auto-scroll เมื่อใกล้ขอบ
    const threshold = 50;
    const scrollSpeed = 10;

    if (moveY < threshold) {
      window.scrollBy(0, -scrollSpeed);
    } else if (moveY > window.innerHeight - threshold) {
      window.scrollBy(0, scrollSpeed);
    }

  } catch (error) {
    console.error("TouchMove error:", error);
    resetDragState();
  }
}

function handleTouchEnd(e) {
  try {
    clearTimeout(dragState.longPressTimer);

    if (!dragState.isDragging) return;
    e.preventDefault();

    const touch = e.changedTouches[0];
    const elem = document.elementFromPoint(touch.clientX, touch.clientY);
    const dropZone = elem?.closest(".drop-zone");

    if (dropZone) {
      placeAnswer(dropZone, dragState.item.dataset.value);
      playSound("dropSound");
    }

    resetDragState();

  } catch (error) {
    console.error("TouchEnd error:", error);
    resetDragState();
  }
}

function resetDragState() {
  try {
    clearTimeout(dragState.longPressTimer);

    if (dragState.clone?.parentNode) {
      dragState.clone.parentNode.removeChild(dragState.clone);
    }

    if (dragState.item?.classList?.contains("dragging")) {
      dragState.item.classList.remove("dragging");
    }

    dragState = {
      item: null,
      clone: null,
      startX: 0,
      startY: 0,
      isDragging: false,
      longPressTimer: null
    };

  } catch (error) {
    console.error("ResetDragState error:", error);
  }
}

// ========== Game Functions ==========
function placeAnswer(zone, value) {
  try {
    zone.textContent = value;
    zone.dataset.droppedValue = value;
    zone.classList.add("dropped");

    setTimeout(() => {
      zone.classList.remove("dropped");
    }, 300);

  } catch (error) {
    console.error("PlaceAnswer error:", error);
  }
}

function clearAnswer(zone) {
  try {
    delete zone.dataset.droppedValue;
    zone.textContent = "";
    zone.classList.remove("correct", "incorrect");
  } catch (error) {
    console.error("ClearAnswer error:", error);
  }
}

function checkAnswers(questionId) {
  try {
    if (!questionId || GameState.answered[questionId]) {
      AlertSystem.show("warning", "แจ้งเตือน", "คุณได้ตรวจคำตอบข้อนี้แล้ว");
      return;
    }

    const dropZones = document.querySelectorAll(`#${questionId} .drop-zone`);
    if (!dropZones.length) {
      AlertSystem.show("error", "ข้อผิดพลาด", "ไม่พบคำถามที่ระบุ");
      return;
    }

    let allCorrect = true;

    dropZones.forEach(zone => {
      const correct = zone.dataset.correct;
      const userAnswer = zone.dataset.droppedValue || "";

      if (userAnswer === correct) {
        zone.classList.add("correct");
        zone.classList.remove("incorrect");
        playSound("correct");
      } else {
        zone.classList.add("incorrect");
        zone.classList.remove("correct");
        playSound("answerIncorrect");
        allCorrect = false;
      }
    });

    if (allCorrect) {
      GameState.score++;
      GameState.answered[questionId] = true;
      updateUI();

      AlertSystem.show("success", "ถูกต้อง!", "ตอบถูกทั้งหมด!", () => {
        setTimeout(() => nextQuestion(), 1000);
      });
    } else {
      AlertSystem.show("error", "คำตอบผิด", "กรุณาตรวจสอบคำตอบอีกครั้ง");
    }

  } catch (error) {
    console.error("CheckAnswers error:", error);
    alertSystem.show("warning", "แจ้งเตือน", "คุณได้ตรวจคำตอบข้อนี้แล้ว", () => playSound("checked"));
  }
}

function resetQuestion(questionId) {
  try {
    document.querySelectorAll(`#${questionId} .drop-zone`).forEach(zone => {
      clearAnswer(zone);
    });

    if (GameState.answered[questionId]) {
      GameState.score--;
      delete GameState.answered[questionId];
      updateUI();
    }

  } catch (error) {
    console.error("ResetQuestion error:", error);
  }
}

function showQuestion(questionId) {
  document.querySelectorAll('.question-section').forEach(section => {
    section.style.display = 'none';
  });

  const currentSection = document.getElementById(questionId);
  if (currentSection) {
    currentSection.style.display = 'block';
    GameState.currentIndex = GameState.questions.indexOf(questionId);
    updateUI();
  }
}

function nextQuestion() {
  const nextIndex = GameState.currentIndex + 1;

  if (nextIndex < GameState.questions.length) {
    showQuestion(GameState.questions[nextIndex]);
  } else {
    showResult();
    playSound("finalResult");
  }
}

function showResult() {
  try {
    document.querySelector(".game-container").style.display = "none";

    const resultSection = document.getElementById("final-result");
    if (resultSection) {
      resultSection.style.display = "block";
      document.getElementById("final-score").textContent =
        `คะแนนรวม: ${GameState.score} จาก ${GameState.questions.length}`;
    }

  } catch (error) {
    console.error("ShowResult error:", error);
  }
}

function updateUI() {
  try {
    // อัปเดตคะแนน
    const scoreDisplay = document.getElementById("score-display");
    if (scoreDisplay) {
      scoreDisplay.textContent = `คะแนน: ${GameState.score}/${GameState.questions.length}`;
    }

    // อัปเดตความคืบหน้า
    const progressDisplay = document.getElementById("progress-display");
    if (progressDisplay) {
      progressDisplay.textContent = `ข้อ ${GameState.currentIndex + 1}/${GameState.questions.length}`;
    }

  } catch (error) {
    console.error("UpdateUI error:", error);
  }
}

function playSound(id, volume = 0.5) {
  try {
    const sound = document.getElementById(id);
    if (sound) {
      sound.currentTime = 0;
      sound.volume = Math.min(Math.max(volume, 0), 1);
      sound.play().catch(e => console.log("เล่นเสียงไม่สำเร็จ:", e));
    }
  } catch (error) {
    console.error("PlaySound error:", error);
  }
}

function handleDoubleClick(e) {
  try {
    const zone = e.target?.closest(".drop-zone");
    if (zone && zone.dataset.droppedValue) {
      clearAnswer(zone);
      playSound("dblclick");
    }
  } catch (error) {
    console.error("DoubleClick error:", error);
  }
}