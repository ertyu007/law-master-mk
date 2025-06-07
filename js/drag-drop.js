/**
 * เกม Drag & Drop ความรู้กฎหมายไทย
 * เวอร์ชันปรับปรุง: เสถียรภาพสูง รองรับทั้งมือถือและคอมพิวเตอร์
 * การปรับปรุงหลัก:
 * - เพิ่มการจัดการข้อผิดพลาดอย่างครอบคลุม
 * - ปรับปรุงการทำงานบนหน้าจอสัมผัส
 * - ปรับปรุงประสิทธิภาพการลากและวาง
 * - ป้องกันการรั่วไหลของ memory
 */

// ระบบแจ้งเตือนแบบโมดอล
const alertSystem = {
  show: function (type, title, message, callback) {
    try {
      // ลบ overlay เดิมหากมีอยู่
      const existingOverlay = document.querySelector('.alert-overlay');
      if (existingOverlay) {
        document.body.removeChild(existingOverlay);
      }

      const overlay = document.createElement("div");
      overlay.className = "alert-overlay";

      const alertBox = document.createElement("div");
      alertBox.className = `alert-box alert-${type}`;

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
        if (typeof callback === 'function') {
          callback();
        }
      };

      alertBox.append(icon, alertTitle, alertMessage, button);
      overlay.appendChild(alertBox);
      document.body.appendChild(overlay);

      // เพิ่ม animation ด้วย setTimeout
      setTimeout(() => overlay.classList.add("active"), 10);
    } catch (error) {
      console.error("Error in alert system:", error);
      // Fallback to native alert
      alert(`${title}\n${message}`);
    }
  }
};

// สถานะเกม
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

// ตัวแปรสำหรับการลากและวาง
let dragItem = null;
let dragClone = null;
let dragStartX = 0;
let dragStartY = 0;
let isTouchDragging = false;
let longPressTimeout = null;
let scrollInterval = null;

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

      // ลบ event listeners เดิมเพื่อป้องกันการซ้ำซ้อน
      item.removeEventListener("dragstart", handleDragStart);
      item.removeEventListener("dragend", handleDragEnd);
      item.removeEventListener("touchstart", handleTouchStart);
      item.removeEventListener("touchmove", handleTouchMove);
      item.removeEventListener("touchend", handleTouchEnd);
      item.removeEventListener("touchcancel", handleTouchCancel);

      // ตั้งค่า drag และ touch events ใหม่
      item.setAttribute("draggable", true);
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
    if (e.target?.classList?.contains("dragging")) {
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
    cleanupTouchTimeout();

    longPressTimeout = setTimeout(() => {
      isTouchDragging = true;

      // สร้างองค์ประกอบลากแบบ ghost
      dragClone = dragItem.cloneNode(true);
      Object.assign(dragClone.style, {
        position: "fixed",
        pointerEvents: "none",
        opacity: "0.7",
        zIndex: "1000",
        left: `${dragStartX - dragItem.offsetWidth / 2}px`,
        top: `${dragStartY - dragItem.offsetHeight / 2}px`,
        width: `${dragItem.offsetWidth}px`,
        height: `${dragItem.offsetHeight}px`
      });
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
    if (!dragItem) return;

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

    if (isTouchDragging) {
      e.preventDefault();

      // เลื่อน clone ตามนิ้ว
      if (dragClone) {
        dragClone.style.left = `${moveX - dragClone.offsetWidth / 2}px`;
        dragClone.style.top = `${moveY - dragClone.offsetHeight / 2}px`;
      }

      // Auto-scroll เมื่อใกล้ขอบจอ
      handleAutoScroll(moveY);
    }
  } catch (error) {
    console.error("Error in touch move:", error);
    cleanupTouchDrag();
  }
}

function handleAutoScroll(currentY) {
  try {
    // หยุดการ scroll อัตโนมัติที่อาจมีอยู่
    if (scrollInterval) {
      clearInterval(scrollInterval);
      scrollInterval = null;
    }

    const threshold = 50;
    const scrollSpeed = 10;

    if (currentY < threshold) {
      // Scroll ขึ้น
      scrollInterval = setInterval(() => {
        window.scrollBy(0, -scrollSpeed);
      }, 16);
    } else if (currentY > window.innerHeight - threshold) {
      // Scroll ลง
      scrollInterval = setInterval(() => {
        window.scrollBy(0, scrollSpeed);
      }, 16);
    }
  } catch (error) {
    console.error("Error in auto scroll:", error);
  }
}

function handleTouchEnd(e) {
  try {
    cleanupTouchTimeout();
    stopAutoScroll();

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

function stopAutoScroll() {
  if (scrollInterval) {
    clearInterval(scrollInterval);
    scrollInterval = null;
  }
}

function cleanupTouchDrag() {
  try {
    cleanupTouchTimeout();
    stopAutoScroll();
    
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
    zone.classList.remove("correct", "incorrect", "success");
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
      const correctAnswer = zone.dataset.correct;
      const userAnswer = zone.dataset.droppedValue || "";
      
      if (userAnswer === correctAnswer) {
        zone.classList.add("correct");
        zone.classList.remove("incorrect");
        playSound("correct", 0.5);
      } else {
        zone.classList.add("incorrect");
        zone.classList.remove("correct");
        playSound("answerIncorrect", 0.3);
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

function showQuestion(questionId) {
  try {
    document.querySelectorAll(".question-section").forEach((section) => {
      section?.classList?.remove("active");
    });
    
    const question = document.getElementById(questionId);
    if (question) {
      question.classList.add("active");
    }
  } catch (error) {
    console.error("Error showing question:", error);
  }
}

function nextQuestion(currentQuestionId) {
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
    
    const finalResult = document.getElementById("final-result");
    if (finalResult) {
      finalResult.style.display = "block";
      const scoreElement = finalResult.querySelector("#final-score");
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
      const totalQuestions = Object.keys(gameState.answeredQuestions).length;
      display.textContent = `คะแนน: ${gameState.score} จาก ${totalQuestions}`;
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

function playSound(soundId, volume = 1) {
  try {
    const sound = document.getElementById(soundId);
    if (sound) {
      sound.currentTime = 0;
      sound.volume = Math.min(Math.max(volume, 0), 1); // จำกัดค่าระหว่าง 0-1
      sound.play().catch(error => {
        console.log("ไม่สามารถเล่นเสียงได้:", error);
      });
    }
  } catch (error) {
    console.error("Error playing sound:", error);
  }
}