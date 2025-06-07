/**
 * law-types-touch.js
 * เกม Drag & Drop ประเภทของกฎหมาย - รองรับมือถือและคอมพิวเตอร์
 * เวอร์ชันปรับปรุง: แก้ไขข้อบกพร่องและเพิ่มความเสถียร
 */

// ระบบแจ้งเตือนแบบโมดอล
const alertSystem = {
  show: function (type, title, message, callback) {
    try {
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
        default:        icon.textContent = "ℹ️";
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
        if (typeof callback === 'function') callback();
      };

      alertBox.append(icon, alertTitle, alertMessage, button);
      overlay.appendChild(alertBox);
      document.body.appendChild(overlay);

      setTimeout(() => overlay.classList.add("active"), 10);
    } catch (error) {
      console.error("Error in alertSystem:", error);
      // Fallback to native alert if custom alert fails
      alert(`${title}\n${message}`);
    }
  },
};

// Updated game state for 20 questions
const gameState = {
  score: 0,
  answeredQuestions: {
    q1: false, q2: false, q3: false, q4: false, q5: false,
    q6: false, q7: false, q8: false, q9: false, q10: false,
    q11: false, q12: false, q13: false, q14: false, q15: false,
    q16: false, q17: false, q18: false, q19: false, q20: false
  },
  questionOrder: ["q1", "q2", "q3", "q4", "q5", "q6", "q7", "q8", "q9", "q10",
                 "q11", "q12", "q13", "q14", "q15", "q16", "q17", "q18", "q19", "q20"],
  currentQuestionIndex: 0,
};

// ตัวแปรสำหรับการลากและวาง
let dragItem = null;
let dragClone = null;
let dragStartX = 0;
let dragStartY = 0;
let isTouchDragging = false;
let longPressTimeout = null;

// เริ่มต้นเกมเมื่อ DOM พร้อม
document.addEventListener("DOMContentLoaded", initializeGame);

function initializeGame() {
  try {
    setupDragAndDrop();
    showQuestion(gameState.questionOrder[gameState.currentQuestionIndex]);
    updateProgressDisplay();
    updateScoreDisplay();
  } catch (error) {
    console.error("Error initializing game:", error);
    alertSystem.show("error", "ข้อผิดพลาด", "ไม่สามารถเริ่มเกมได้ กรุณารีเฟรชหน้าเว็บ");
  }
}

function setupDragAndDrop() {
  try {
    // Mouse drag support
    document.querySelectorAll(".drag-item").forEach((item) => {
      if (!item) return;

      item.setAttribute("draggable", true);
      
      // Remove existing listeners to prevent duplicates
      item.removeEventListener("dragstart", handleDragStart);
      item.removeEventListener("dragend", handleDragEnd);
      item.removeEventListener("touchstart", handleTouchStart);
      item.removeEventListener("touchmove", handleTouchMove);
      item.removeEventListener("touchend", handleTouchEnd);
      item.removeEventListener("touchcancel", handleTouchCancel);

      // Add new listeners
      item.addEventListener("dragstart", handleDragStart);
      item.addEventListener("dragend", handleDragEnd);
      item.addEventListener("touchstart", handleTouchStart, { passive: false });
      item.addEventListener("touchmove", handleTouchMove, { passive: false });
      item.addEventListener("touchend", handleTouchEnd);
      item.addEventListener("touchcancel", handleTouchCancel);
    });

    // Drop zones
    document.querySelectorAll(".drop-zone").forEach((zone) => {
      if (!zone) return;

      zone.removeEventListener("dragover", handleDragOver);
      zone.removeEventListener("drop", handleDrop);
      
      zone.addEventListener("dragover", handleDragOver);
      zone.addEventListener("drop", handleDrop);
    });

    // Double click to clear
    document.removeEventListener("dblclick", handleDoubleClick);
    document.addEventListener("dblclick", handleDoubleClick);
  } catch (error) {
    console.error("Error setting up drag and drop:", error);
  }
}

// -------- Mouse drag handlers --------
function handleDragStart(e) {
  try {
    if (!e.target || !e.dataTransfer) return;

    e.dataTransfer.setData("text/plain", e.target.dataset.value);
    e.dataTransfer.effectAllowed = "copy";
    e.target.classList.add("dragging");
  } catch (error) {
    console.error("Error in drag start:", error);
  }
}

function handleDragEnd(e) {
  try {
    if (e.target && e.target.classList) {
      e.target.classList.remove("dragging");
    }
  } catch (error) {
    console.error("Error in drag end:", error);
  }
}

function handleDragOver(e) {
  try {
    e.preventDefault();
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = "copy";
    }
  } catch (error) {
    console.error("Error in drag over:", error);
  }
}

function handleDrop(e) {
  try {
    e.preventDefault();
    const value = e.dataTransfer?.getData("text/plain");
    const zone = e.target?.closest(".drop-zone");
    
    if (zone && value) {
      placeAnswer(zone, value);
      playSound("dropSound");
    }
  } catch (error) {
    console.error("Error in drop:", error);
  }
}

// -------- Touch drag handlers --------
function handleTouchStart(e) {
  try {
    if (e.touches.length !== 1) return;
    e.preventDefault();

    dragItem = e.target?.closest(".drag-item");
    if (!dragItem) return;

    const touch = e.touches[0];
    dragStartX = touch.clientX;
    dragStartY = touch.clientY;

    // Clear any existing timeout
    if (longPressTimeout) {
      clearTimeout(longPressTimeout);
      longPressTimeout = null;
    }

    longPressTimeout = setTimeout(() => {
      isTouchDragging = true;

      // Create drag clone
      dragClone = dragItem.cloneNode(true);
      dragClone.style.position = "fixed";
      dragClone.style.pointerEvents = "none";
      dragClone.style.opacity = "0.7";
      dragClone.style.zIndex = "1000";
      dragClone.style.left = `${dragStartX - dragItem.offsetWidth / 2}px`;
      dragClone.style.top = `${dragStartY - dragItem.offsetHeight / 2}px`;
      dragClone.classList.add("dragging");

      document.body.appendChild(dragClone);
      dragItem.classList.add("dragging");
    }, 300);
  } catch (error) {
    console.error("Error in touch start:", error);
    cleanupTouchDrag();
  }
}

function handleTouchMove(e) {
  try {
    if (!dragItem || !isTouchDragging) return;

    const touch = e.touches[0];
    const moveX = touch.clientX;
    const moveY = touch.clientY;

    if (!isTouchDragging) {
      const distX = Math.abs(moveX - dragStartX);
      const distY = Math.abs(moveY - dragStartY);
      
      if (distX > 10 || distY > 10) {
        cleanupTouchDrag();
        return;
      }
    }

    e.preventDefault();

    if (dragClone) {
      dragClone.style.left = `${moveX - dragClone.offsetWidth / 2}px`;
      dragClone.style.top = `${moveY - dragClone.offsetHeight / 2}px`;
    }

    // Auto-scroll when near edge
    const threshold = 50;
    const scrollSpeed = 10;

    if (moveY < threshold) {
      window.scrollBy(0, -scrollSpeed);
    } else if (moveY > window.innerHeight - threshold) {
      window.scrollBy(0, scrollSpeed);
    }
  } catch (error) {
    console.error("Error in touch move:", error);
    cleanupTouchDrag();
  }
}

function handleTouchEnd(e) {
  try {
    cleanupTouchTimeout();

    if (!isTouchDragging || !dragItem) return;
    e.preventDefault();

    const touch = e.changedTouches[0];
    const elem = document.elementFromPoint(touch.clientX, touch.clientY);
    const dropZone = elem?.closest(".drop-zone");

    if (dropZone) {
      placeAnswer(dropZone, dragItem.dataset.value);
      playSound("dropSound");
    }

    cleanupTouchDrag();
  } catch (error) {
    console.error("Error in touch end:", error);
    cleanupTouchDrag();
  }
}

function handleTouchCancel() {
  try {
    cleanupTouchDrag();
  } catch (error) {
    console.error("Error in touch cancel:", error);
  }
}

function cleanupTouchTimeout() {
  if (longPressTimeout) {
    clearTimeout(longPressTimeout);
    longPressTimeout = null;
  }
}

function cleanupTouchDrag() {
  try {
    cleanupTouchTimeout();
    
    if (dragClone?.parentNode) {
      dragClone.parentNode.removeChild(dragClone);
    }
    
    if (dragItem?.classList?.contains("dragging")) {
      dragItem.classList.remove("dragging");
    }
    
    dragClone = null;
    dragItem = null;
    isTouchDragging = false;
  } catch (error) {
    console.error("Error cleaning up touch drag:", error);
  }
}

// -------- Common functions --------
function placeAnswer(zone, value) {
  try {
    if (!zone) return;

    zone.textContent = value;
    zone.dataset.droppedValue = value;
    zone.classList.add("success");
    
    setTimeout(() => {
      if (zone.classList.contains("success")) {
        zone.classList.remove("success");
      }
    }, 300);
  } catch (error) {
    console.error("Error placing answer:", error);
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
    console.error("Error in double click:", error);
  }
}

function clearAnswer(zone) {
  try {
    if (!zone) return;
    
    delete zone.dataset.droppedValue;
    zone.textContent = "";
    zone.classList.remove("correct", "incorrect");
  } catch (error) {
    console.error("Error clearing answer:", error);
  }
}

function checkAnswers(questionId) {
  try {
    if (!questionId || gameState.answeredQuestions[questionId]) {
      alertSystem.show("warning", "แจ้งเตือน", "คุณได้ตรวจคำตอบข้อนี้แล้ว", () => playSound("checked"));
      return;
    }

    let allCorrect = true;
    const dropZones = document.querySelectorAll(`#${questionId} .drop-zone`);
    
    if (!dropZones.length) {
      alertSystem.show("error", "ข้อผิดพลาด", "ไม่พบคำถามที่ระบุ");
      return;
    }

    dropZones.forEach((zone) => {
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
      
      alertSystem.show("success", "ถูกต้อง!", "คุณสามารถไปข้อถัดไปได้", () => {
        setTimeout(() => nextQuestion(), 1000);
      });
    } else {
      alertSystem.show("error", "คำตอบไม่ถูกต้อง", "บางคำตอบยังไม่ถูก กรุณาตรวจสอบอีกครั้ง");
    }
  } catch (error) {
    console.error("Error checking answers:", error);
    alertSystem.show("error", "ข้อผิดพลาด", "เกิดข้อผิดพลาดในการตรวจคำตอบ");
  }
}

function resetQuestion(questionId) {
  try {
    document.querySelectorAll(`#${questionId} .drop-zone`).forEach((zone) => {
      clearAnswer(zone);
    });

    if (gameState.answeredQuestions[questionId]) {
      gameState.score--;
      gameState.answeredQuestions[questionId] = false;
      updateScoreDisplay();
      updateProgressDisplay();
    }
  } catch (error) {
    console.error("Error resetting question:", error);
  }
}

function showQuestion(id) {
  try {
    document.querySelectorAll(".question-section").forEach((s) => {
      s?.classList?.remove("active");
    });
    
    const question = document.getElementById(id);
    if (question) {
      question.classList.add("active");
    }
  } catch (error) {
    console.error("Error showing question:", error);
  }
}

function nextQuestion() {
  try {
    if (gameState.currentQuestionIndex < gameState.questionOrder.length - 1) {
      gameState.currentQuestionIndex++;
      showQuestion(gameState.questionOrder[gameState.currentQuestionIndex]);
      updateProgressDisplay();
    } else {
      showFinalResult();
      playSound("finalResult");
    }
  } catch (error) {
    console.error("Error moving to next question:", error);
  }
}

function showFinalResult() {
  try {
    const gameContainer = document.querySelector(".game-container");
    if (gameContainer) {
      gameContainer.style.display = "none";
    }
    
    const result = document.getElementById("final-result");
    if (result) {
      result.style.display = "block";
      const scoreElement = result.querySelector("#final-score");
      if (scoreElement) {
        scoreElement.textContent = `คุณได้คะแนน: ${gameState.score} จาก ${gameState.questionOrder.length}`;
      }
    }
  } catch (error) {
    console.error("Error showing final result:", error);
  }
}

function updateScoreDisplay() {
  try {
    const display = document.getElementById("score-display");
    if (display) {
      const total = Object.keys(gameState.answeredQuestions).length;
      display.textContent = `คะแนน: ${gameState.score} จาก ${total}`;
    }
  } catch (error) {
    console.error("Error updating score display:", error);
  }
}

function updateProgressDisplay() {
  try {
    const display = document.getElementById("progress-display");
    if (display) {
      display.textContent = `ข้อ ${gameState.currentQuestionIndex + 1} จาก ${gameState.questionOrder.length}`;
    }
  } catch (error) {
    console.error("Error updating progress display:", error);
  }
}

function playSound(id, volume = 1) {
  try {
    const sound = document.getElementById(id);
    if (sound) {
      sound.currentTime = 0;
      sound.volume = Math.min(Math.max(volume, 0), 1); // Clamp between 0 and 1
      sound.play().catch(error => {
        console.log("ไม่สามารถเล่นเสียงได้:", error);
      });
    }
  } catch (error) {
    console.error("Error playing sound:", error);
  }
}