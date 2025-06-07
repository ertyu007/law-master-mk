/**
 * เกม Drag & Drop ความรู้กฎหมายไทย
 * ปรับปรุงใหม่รองรับการกดค้างแล้วลาก (touch and hold drag) บนมือถือและลากด้วย mouse บนคอม
 * ฟังก์ชันหลัก:
 * - รองรับทั้ง mouse และ touch แบบกดค้างแล้วลาก
 * - ตรวจสอบคำตอบ
 * - รีเซ็ตรายการ
 * - เปลี่ยนข้อคำถาม
 * - นับคะแนนและแสดงผล
 */

// Alert system with custom modals
const alertSystem = {
  show: function (type, title, message, callback) {
    const overlay = document.createElement("div");
    overlay.className = "alert-overlay";

    const alertBox = document.createElement("div");
    alertBox.className = `alert-box alert-${type}`;

    const icon = document.createElement("div");
    icon.className = "alert-icon";

    switch (type) {
      case "success":
        icon.textContent = "✓";
        break;
      case "warning":
        icon.textContent = "⚠️";
        break;
      case "error":
        icon.textContent = "✗";
        break;
      default:
        icon.textContent = "ℹ️";
    }

    const alertTitle = document.createElement("div");
    alertTitle.className = "alert-title";
    alertTitle.textContent = title;

    const alertMessage = document.createElement("div");
    alertMessage.className = "alert-message";
    alertMessage.textContent = message;

    const button = document.createElement("button");
    button.className = "alert-btn";
    button.textContent = "ตกลง";
    button.onclick = function () {
      document.body.removeChild(overlay);
      if (callback) callback();
    };

    alertBox.append(icon, alertTitle, alertMessage, button);
    overlay.appendChild(alertBox);
    document.body.appendChild(overlay);

    setTimeout(() => {
      overlay.classList.add("active");
    }, 10);
  },
};

// Game state
const gameState = {
  score: 0,
  answeredQuestions: {
    q11: false,
    q12: false,
    q13: false,
    q14: false,
  },
  questionOrder: ["q11", "q12", "q13", "q14"],
  currentQuestionIndex: 0,
};

// Variables for touch drag handling
let dragItem = null;
let dragClone = null;
let dragStartX = 0;
let dragStartY = 0;
let isTouchDragging = false;
let longPressTimeout = null;

document.addEventListener("DOMContentLoaded", initializeGame);

function initializeGame() {
  setupDragAndDrop();
  showQuestion(gameState.questionOrder[gameState.currentQuestionIndex]);
  updateProgressDisplay();
  updateScoreDisplay();
}

function setupDragAndDrop() {
  // Mouse drag support (standard HTML5 draggable)
  document.querySelectorAll(".drag-item").forEach((item) => {
    item.setAttribute("draggable", true);
    item.addEventListener("dragstart", handleDragStart);
    item.addEventListener("dragend", handleDragEnd);
  });

  // Drop zones
  document.querySelectorAll(".drop-zone").forEach((zone) => {
    zone.addEventListener("dragover", handleDragOver);
    zone.addEventListener("drop", handleDrop);
  });

  // Touch support for long press drag
  document.querySelectorAll(".drag-item").forEach((item) => {
    item.addEventListener("touchstart", handleTouchStart, { passive: false });
    item.addEventListener("touchmove", handleTouchMove, { passive: false });
    item.addEventListener("touchend", handleTouchEnd);
    item.addEventListener("touchcancel", handleTouchCancel);
  });

  // Support double click to clear answer
  document.addEventListener("dblclick", handleDoubleClick);
}

// -------- Mouse drag handlers --------

function handleDragStart(e) {
  // Transfer data value
  e.dataTransfer.setData("text/plain", e.target.dataset.value);
  e.dataTransfer.effectAllowed = "copy";

  // Add dragging class
  e.target.classList.add("dragging");
}

function handleDragEnd(e) {
  e.target.classList.remove("dragging");
}

function handleDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = "copy";
}

function handleDrop(e) {
  e.preventDefault();
  const value = e.dataTransfer.getData("text/plain");
  const zone = e.target.closest(".drop-zone");
  if (zone && value) {
    placeAnswer(zone, value);
    playSound("dropSound");
  }
}

// -------- Touch drag handlers --------

function handleTouchStart(e) {
  // Only process single touch
  if (e.touches.length !== 1) return;

  e.preventDefault();
  dragItem = e.target.closest(".drag-item");
  if (!dragItem) return;

  // Save start position
  const touch = e.touches[0];
  dragStartX = touch.clientX;
  dragStartY = touch.clientY;

  // Setup long press timer (300ms) to start dragging
  longPressTimeout = setTimeout(() => {
    isTouchDragging = true;

    // Create a clone of the drag item as a ghost element following the finger
    dragClone = dragItem.cloneNode(true);
    dragClone.style.position = "fixed";
    dragClone.style.pointerEvents = "none";
    dragClone.style.opacity = "0.7";
    dragClone.style.zIndex = "1000";
    dragClone.style.left = `${dragStartX - dragItem.offsetWidth / 2}px`;
    dragClone.style.top = `${dragStartY - dragItem.offsetHeight / 2}px`;
    dragClone.classList.add("dragging");

    document.body.appendChild(dragClone);

    // Add dragging style to original item (optional)
    dragItem.classList.add("dragging");
  }, 300);
}

function handleTouchMove(e) {
  if (!dragItem) return;

  const touch = e.touches[0];
  const moveX = touch.clientX;
  const moveY = touch.clientY;

  const distX = Math.abs(moveX - dragStartX);
  const distY = Math.abs(moveY - dragStartY);

  // ถ้านิ้วขยับก่อน long press ก็ยกเลิกลาก
  if (!isTouchDragging && (distX > 10 || distY > 10)) {
    clearTimeout(longPressTimeout);
    longPressTimeout = null;
    dragItem = null;
    return;
  }

  if (isTouchDragging) {
    e.preventDefault();

    // 👇 เลื่อน clone ตามนิ้ว
    dragClone.style.left = `${moveX - dragClone.offsetWidth / 2}px`;
    dragClone.style.top = `${moveY - dragClone.offsetHeight / 2}px`;

    // 👇 เพิ่ม Auto Scroll ตอนลากใกล้ขอบจอ
    const threshold = 50;      // ห่างจากขอบกี่ px ถึงจะเริ่ม scroll
    const scrollSpeed = 10;    // ความเร็ว scroll ต่อ frame

    if (moveY < threshold) {
      window.scrollBy(0, -scrollSpeed); // scroll ขึ้น
    } else if (moveY > window.innerHeight - threshold) {
      window.scrollBy(0, scrollSpeed); // scroll ลง
    }
  }
}


function handleTouchEnd(e) {
  clearTimeout(longPressTimeout);
  longPressTimeout = null;

  if (!dragItem) return;

  if (isTouchDragging) {
    e.preventDefault();

    let dropZone = null;
    // Identify element under finger at touch end
    const touch = e.changedTouches[0];
    const elem = document.elementFromPoint(touch.clientX, touch.clientY);

    if (elem) {
      dropZone = elem.closest(".drop-zone");
    }

    if (dropZone) {
      placeAnswer(dropZone, dragItem.dataset.value);
      playSound("dropSound");
    }

    // Cleanup clone and dragging class
    if (dragClone && dragClone.parentNode) {
      dragClone.parentNode.removeChild(dragClone);
    }
    dragClone = null;
    dragItem.classList.remove("dragging");
  }

  dragItem = null;
  isTouchDragging = false;
}

function handleTouchCancel(e) {
  clearTimeout(longPressTimeout);
  longPressTimeout = null;

  if (dragClone && dragClone.parentNode) {
    dragClone.parentNode.removeChild(dragClone);
  }
  if (dragItem) dragItem.classList.remove("dragging");
  dragClone = null;
  dragItem = null;
  isTouchDragging = false;
}

// -------- Common functions --------

function placeAnswer(zone, value) {
  if (!zone) return;

  // If already has dropped value, just overwrite without returning old
  zone.textContent = value;
  zone.dataset.droppedValue = value;
  zone.classList.add("success");

  setTimeout(() => zone.classList.remove("success"), 300);
}

function handleDoubleClick(e) {
  const zone = e.target.closest(".drop-zone");
  if (zone && zone.dataset.droppedValue) {
    clearAnswer(zone);
    playSound("dblclick");
  }
}

function clearAnswer(zone) {
    delete zone.dataset.droppedValue;
    zone.textContent = "";
}

function checkAnswers(questionId) {
  if (gameState.answeredQuestions[questionId]) {
    alertSystem.show("warning", "แจ้งเตือน", "คุณได้ตรวจคำตอบข้อนี้แล้ว", () => playSound("checked"));
    return;
  }

  let allCorrect = true;

  document.querySelectorAll(`#${questionId} .drop-zone`).forEach((zone) => {
    const correctAnswer = zone.dataset.correct;
    const userAnswer = zone.dataset.droppedValue || "";
    if (userAnswer === correctAnswer) {
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
    gameState.score++;
    gameState.answeredQuestions[questionId] = true;
    updateScoreDisplay();
    updateProgressDisplay();

    alertSystem.show("success", "ถูกต้อง!", "คุณสามารถไปข้อถัดไปได้", () => {
      setTimeout(() => nextQuestion(questionId), 1000);
    });
  } else {
    alertSystem.show("error", "คำตอบไม่ถูกต้อง", "บางคำตอบยังไม่ถูก กรุณาตรวจสอบอีกครั้ง");
  }
}

function resetQuestion(questionId) {
  document.querySelectorAll(`#${questionId} .drop-zone`).forEach((zone) => {
    zone.textContent = "";
    zone.classList.remove("correct", "incorrect");
    delete zone.dataset.droppedValue;
  });

  if (gameState.answeredQuestions[questionId]) {
    gameState.score--;
    gameState.answeredQuestions[questionId] = false;
    updateScoreDisplay();
    updateProgressDisplay();
  }
}

function showQuestion(questionId) {
  document.querySelectorAll(".question-section").forEach((section) => {
    section.classList.remove("active");
  });

  document.getElementById(questionId).classList.add("active");
}

function nextQuestion(currentQuestionId) {
  if (gameState.currentQuestionIndex < gameState.questionOrder.length - 1) {
    gameState.currentQuestionIndex++;
    showQuestion(gameState.questionOrder[gameState.currentQuestionIndex]);
    updateProgressDisplay();
  } else {
    showFinalResult();
    playSound("finalResult");
  }
}

function showFinalResult() {
  document.querySelector(".game-container").style.display = "none";
  const finalResult = document.getElementById("final-result");
  finalResult.style.display = "block";
  finalResult.querySelector("#final-score").textContent = `คุณได้คะแนน: ${gameState.score} จาก ${gameState.questionOrder.length}`;
}

function updateScoreDisplay() {
  const totalQuestions = Object.keys(gameState.answeredQuestions).length;
  document.getElementById("score-display").textContent = `คะแนน: ${gameState.score} จาก ${totalQuestions}`;
}

function updateProgressDisplay() {
  document.getElementById("progress-display").textContent = `ข้อ ${gameState.currentQuestionIndex + 1} จาก ${gameState.questionOrder.length}`;
}

function playSound(soundId, volume = 1) {
  const sound = document.getElementById(soundId);
  if (sound) {
    sound.currentTime = 0;
    sound.volume = volume;
    sound.play().catch(e => console.log("ไม่สามารถเล่นเสียงได้:", e));
  }
}

