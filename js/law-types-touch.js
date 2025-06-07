/**
 * law-types-touch.js
 * เกม Drag & Drop ประเภทของกฎหมาย - รองรับมือถือและคอมพิวเตอร์
 */

// Alert system for modal messages
const alertSystem = {
  show: function (type, title, message, callback) {
    const overlay = document.createElement("div");
    overlay.className = "alert-overlay";

    const alertBox = document.createElement("div");
    alertBox.className = `alert-box alert-${type}`;

    const icon = document.createElement("div");
    icon.className = "alert-icon";

    switch (type) {
      case "success": icon.textContent = "✓"; break;
      case "warning": icon.textContent = "⚠️"; break;
      case "error":   icon.textContent = "✗"; break;
      default:         icon.textContent = "ℹ️";
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

    setTimeout(() => overlay.classList.add("active"), 10);
  },
};

const gameState = {
  score: 0,
  answeredQuestions: {
    q1: false, q2: false, q3: false, q4: false, q5: false,
    q6: false, q7: false, q8: false, q9: false, q10: false
  },
  questionOrder: ["q1", "q2", "q3", "q4", "q5", "q6", "q7", "q8", "q9", "q10"],
  currentQuestionIndex: 0,
};

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
  document.querySelectorAll(".drag-item").forEach((item) => {
    item.setAttribute("draggable", true);
    item.addEventListener("dragstart", handleDragStart);
    item.addEventListener("dragend", handleDragEnd);

    item.addEventListener("touchstart", handleTouchStart, { passive: false });
    item.addEventListener("touchmove", handleTouchMove, { passive: false });
    item.addEventListener("touchend", handleTouchEnd);
    item.addEventListener("touchcancel", handleTouchCancel);
  });

  document.querySelectorAll(".drop-zone").forEach((zone) => {
    zone.addEventListener("dragover", handleDragOver);
    zone.addEventListener("drop", handleDrop);
  });

  document.addEventListener("dblclick", handleDoubleClick);
}

function handleDragStart(e) {
  e.dataTransfer.setData("text/plain", e.target.dataset.value);
  e.dataTransfer.effectAllowed = "copy";
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
  if (!dragItem) return;

  if (isTouchDragging) {
    const touch = e.changedTouches[0];
    const elem = document.elementFromPoint(touch.clientX, touch.clientY);
    const dropZone = elem?.closest(".drop-zone");
    if (dropZone) {
      placeAnswer(dropZone, dragItem.dataset.value);
      playSound("dropSound");
    }
    if (dragClone && dragClone.parentNode) dragClone.remove();
    dragItem.classList.remove("dragging");
  }

  dragItem = null;
  dragClone = null;
  isTouchDragging = false;
}

function handleTouchCancel() {
  clearTimeout(longPressTimeout);
  if (dragClone) dragClone.remove();
  if (dragItem) dragItem.classList.remove("dragging");
  dragItem = null;
  dragClone = null;
  isTouchDragging = false;
}

function placeAnswer(zone, value) {
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
    const correct = zone.dataset.correct;
    const user = zone.dataset.droppedValue || "";
    if (user === correct) {
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
    alertSystem.show("success", "ถูกต้อง!", "คุณสามารถไปข้อถัดไปได้", () => setTimeout(() => nextQuestion(), 1000));
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

function showQuestion(id) {
  document.querySelectorAll(".question-section").forEach((s) => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

function nextQuestion() {
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
  const result = document.getElementById("final-result");
  result.style.display = "block";
  result.querySelector("#final-score").textContent = `คุณได้คะแนน: ${gameState.score} จาก ${gameState.questionOrder.length}`;
}

function updateScoreDisplay() {
  const total = Object.keys(gameState.answeredQuestions).length;
  document.getElementById("score-display").textContent = `คะแนน: ${gameState.score} จาก ${total}`;
}

function updateProgressDisplay() {
  document.getElementById("progress-display").textContent = `ข้อ ${gameState.currentQuestionIndex + 1} จาก ${gameState.questionOrder.length}`;
}

function playSound(id, volume = 1) {
  const sound = document.getElementById(id);
  if (sound) {
    sound.currentTime = 0;
    sound.volume = volume;
    sound.play().catch(e => console.log("ไม่สามารถเล่นเสียงได้:", e));
  }
}
