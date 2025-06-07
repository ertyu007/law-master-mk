// Game configuration
const GAME_CONFIG = {
    totalQuestions: 10,
    timePerQuestion: 120, // seconds
    maxScore: 20,
    hintDuration: 15, // seconds
    perfectMatchThreshold: 0.85,
    partialMatchThreshold: 0.6
};

// Questions database
const QUESTIONS = [
    {
        question: "กฎหมายสารบัญญัติ (Substantive Law) คืออะไร",
        answer: "กฎหมายที่มีลักษณะเป็นส่วนเนื้อแท้ของกฎหมาย เป็นบทบัญญัติที่สั่งห้ามบุคคลให้กระทำหรืองดเว้นการกระทำ",
        hint: "เกี่ยวกับส่วนเนื้อแท้ของกฎหมาย...เกี่ยวข้องกับการห้ามกระทำ",
        explanation: "กฎหมายสารบัญญัติเป็นกฎหมายที่กำหนดสิทธิและหน้าที่ของบุคคล เช่น กฎหมายอาญาที่กำหนดว่าอะไรเป็นความผิด"
    },
    {
        question: "กฎหมายวิธีสบัญญัติ (Procedural Law) คืออะไร",
        answer: "กฎหมายที่มีหน้าที่ช่วยให้สภาพบังคับของกฎหมายสารบัญญัติเป็นไปได้ตามที่กำหนดไว้",
        hint: "เกี่ยวกับกระบวนการทำให้กฎหมายมีผลบังคับใช้...",
        explanation: "กฎหมายวิธีสบัญญัติเป็นกฎหมายที่กำหนดกระบวนการหรือวิธีการในการบังคับใช้กฎหมาย เช่น วิธีพิจารณาความอาญา"
    },
    {
        question: "กฎหมายเอกชน คืออะไร",
        answer: "กฎหมายที่กำหนดความสัมพันธ์ระหว่างราษฎรกับราษฎร หรือบุคคลกับบุคคลในรัฐเดียวกัน หรือรัฐกับรัฐ แต่รัฐจะต้องมีฐานะเท่าเทียมกับราษฎร",
        hint: "เกี่ยวกับความสัมพันธ์ระหว่างบุคคลด้วยกัน...",
        explanation: "กฎหมายเอกชนควบคุมความสัมพันธ์ระหว่างปัจเจกบุคคลด้วยกัน เช่น กฎหมายแพ่งและพาณิชย์"
    },
    {
        question: "กฎหมายเอกชนแยกสาขาออกได้อย่างไร",
        answer: "1. กฎหมายแพ่ง\n2. กฎหมายพาณิชย์",
        hint: "มี 2 สาขาหลัก...",
        explanation: "กฎหมายเอกชนแบ่งเป็นกฎหมายแพ่ง (ครอบครัว, มรดก, หนี้) และกฎหมายพาณิชย์ (การค้า, หุ้นส่วน, บริษัท)"
    },
    {
        question: "กฎหมายมหาชน คืออะไร",
        answer: "กฎหมายที่กำหนดความสัมพันธ์ระหว่างรัฐหรือหน่วยงานของรัฐกับราษฎร ในฐานะที่รัฐมีฐานะเหนือกว่าเพราะเป็นผู้ปกครอง",
        hint: "เกี่ยวกับความสัมพันธ์ระหว่างรัฐกับประชาชน...",
        explanation: "กฎหมายมหาชนควบคุมความสัมพันธ์ระหว่างรัฐกับประชาชน เช่น รัฐธรรมนูญ กฎหมายปกครอง"
    },
    {
        question: "กฎหมายที่จัดอยู่ในหมวดหมู่กฎหมายมหาชน มีอะไรบ้าง",
        answer: "1. รัฐธรรมนูญ\n2. กฎหมายปกครอง\n3. กฎหมายอาญา\n4. กฎหมายวิธีพิจารณาความอาญา\n5. กฎหมายวิธีพิจารณาความแพ่ง\n6. กฎหมายพระธรรมนูญศาลยุติธรรม",
        hint: "มี 6 ประเภทหลัก...",
        explanation: "กฎหมายมหาชนครอบคลุมกฎหมายที่เกี่ยวกับการจัดระเบียบรัฐและอำนาจรัฐ"
    },
    {
        question: "รัฐธรรมนูญที่ไม่เป็นลายลักษณ์อักษร หมายถึงอะไร",
        answer: "รัฐธรรมนูญอ่อนไหว หรือ รัฐธรรมนูญแก้ไขได้ง่าย หรือ รัฐธรรมนูญแก้ไขได้",
        hint: "เกี่ยวกับรัฐธรรมนูญที่ไม่ได้เขียนเป็นตัวหนังสือ...",
        explanation: "รัฐธรรมนูญที่ไม่เป็นลายลักษณ์อักษรเป็นจารีตประเพณีการปกครองที่ปฏิบัติสืบต่อกันมา"
    },
    {
        question: "การจัดระเบียบแห่งองค์การปกครองประเทศ แบ่งออกเป็นอะไรบ้าง",
        answer: "การบริหารราชการส่วนกลาง การบริหารราชการส่วนภูมิภาค และการบริหารราชการส่วนท้องถิ่น",
        hint: "แบ่งเป็น 3 ส่วนหลัก...",
        explanation: "การจัดระเบียบการปกครองแบ่งตามพื้นที่และอำนาจหน้าที่"
    },
    {
        question: "ทำไมนักนิติศาสตร์บางท่านไม่ยอมรับว่ากฎหมายระหว่างประเทศเป็นกฎหมายที่แท้จริง",
        answer: "ขาดคุณสมบัติของกฎหมายที่สำคัญ คือ ไม่มีสภาพบังคับ ถึงแม้จะมีศาลยุติธรรมระหว่างประเทศ หรือศาลโลกทำหน้าที่พิจารณาพิพากษาคดีระหว่างประเทศก็ตาม",
        hint: "เกี่ยวกับการบังคับใช้...",
        explanation: "กฎหมายระหว่างประเทศไม่มีกลไกบังคับใช้ที่เข้มแข็งเหมือนกฎหมายภายในประเทศ"
    },
    {
        question: "กฎหมายระหว่างประเทศแบ่งออกเป็นกี่สาขา อะไรบ้าง",
        answer: "1. กฎหมายระหว่างประเทศแผนกคดีเมือง\n2. กฎหมายระหว่างประเทศแผนกคดีอาญา\n3. กฎหมายระหว่างประเทศแผนกคดีบุคคล",
        hint: "แบ่งเป็น 3 สาขา...",
        explanation: "กฎหมายระหว่างประเทศแบ่งตามประเภทของความสัมพันธ์ระหว่างประเทศ"
    }
];

// Game state
let gameState = {
    currentQuestionIndex: 0,
    score: 0,
    timeLeft: GAME_CONFIG.timePerQuestion,
    timer: null,
    usedHints: 0,
    hintTimer: null
};

// Initialize the game when window loads
window.onload = function() {
    startGame();
};

// Start the game
function startGame() {
    resetGameState();
    displayQuestion();
    startTimer();
}

// Reset game state
function resetGameState() {
    gameState = {
        currentQuestionIndex: 0,
        score: 0,
        timeLeft: GAME_CONFIG.timePerQuestion,
        timer: null,
        usedHints: 0,
        hintTimer: null
    };
    updateScoreDisplay();
}

// Display current question
function displayQuestion() {
    const question = QUESTIONS[gameState.currentQuestionIndex];
    document.getElementById("question").textContent = question.question;
    document.getElementById("userAnswer").value = "";
    document.getElementById("currentQ").textContent = gameState.currentQuestionIndex + 1;
    document.getElementById("resultBox").style.display = "none";
    document.getElementById("nextBtn").style.display = "none";
    document.getElementById("submitBtn").style.display = "inline-block";
    document.getElementById("hintBtn").style.display = "inline-block";
    document.getElementById("explanation").style.display = "none";
    document.getElementById("hintBox").innerHTML = "";
}

// Start the timer
function startTimer() {
    clearInterval(gameState.timer);
    gameState.timeLeft = GAME_CONFIG.timePerQuestion;
    updateTimerDisplay();

    gameState.timer = setInterval(() => {
        gameState.timeLeft--;
        updateTimerDisplay();

        if (gameState.timeLeft <= 0) {
            clearInterval(gameState.timer);
            handleTimeOut();
        }
    }, 1000);
}

// Update timer display
function updateTimerDisplay() {
    document.getElementById("time").textContent = gameState.timeLeft;
}

// Handle when time runs out
function handleTimeOut() {
    document.getElementById("resultStatus").textContent = "⏰ เวลาหมด!";
    showCorrectAnswer();
    const resultBox = document.getElementById("resultBox");
    resultBox.className = "result-box incorrect";
    resultBox.style.display = "block";
    document.getElementById("explanation").textContent = QUESTIONS[gameState.currentQuestionIndex].explanation;
    document.getElementById("explanation").style.display = "block";
    document.getElementById("nextBtn").style.display = "inline-block";
    document.getElementById("submitBtn").style.display = "none";
    document.getElementById("hintBtn").style.display = "none";
}

// Check user's answer
function checkAnswer() {
    clearInterval(gameState.timer);

    const userAnswer = document.getElementById("userAnswer").value.trim();
    const correctAnswer = QUESTIONS[gameState.currentQuestionIndex].answer;
    const similarityScore = calculateSimilarity(userAnswer, correctAnswer);

    let resultText = "";
    let pointsEarned = 0;

    if (similarityScore >= GAME_CONFIG.perfectMatchThreshold) {
        resultText = "✅ ถูกต้องสมบูรณ์! (+2 คะแนน)";
        pointsEarned = 2;
        playSound("tada");
    } else if (similarityScore >= GAME_CONFIG.partialMatchThreshold) {
        resultText = "⚠️ ถูกต้องบางส่วน (+1 คะแนน)";
        pointsEarned = 1;
        playSound("among");
    } else {
        resultText = "❌ ยังไม่ถูกต้อง";
        pointsEarned = 0;
        playSound("kaa");
    }

    // Deduct points for using hints
    if (gameState.usedHints > 0) {
        pointsEarned = Math.max(0, pointsEarned - gameState.usedHints);
        if (pointsEarned > 0) {
            resultText += ` (หักคะแนนสำหรับคำใบ้ ${gameState.usedHints} แต้ม)`;
        }
    }

    gameState.score += pointsEarned;
    gameState.usedHints = 0;

    document.getElementById("resultStatus").textContent = resultText;
    showCorrectAnswer();
    updateScoreDisplay();

    if (similarityScore >= GAME_CONFIG.partialMatchThreshold) {
        document.getElementById("resultBox").className = "result-box correct";
    } else {
        document.getElementById("resultBox").className = "result-box incorrect";
    }

    document.getElementById("resultBox").style.display = "block";
    document.getElementById("explanation").textContent = QUESTIONS[gameState.currentQuestionIndex].explanation;
    document.getElementById("explanation").style.display = "block";
    document.getElementById("nextBtn").style.display = "inline-block";
    document.getElementById("submitBtn").style.display = "none";
    document.getElementById("hintBtn").style.display = "none";
}

// Show correct answer
function showCorrectAnswer() {
    document.getElementById("correctAnswer").innerHTML = 
        QUESTIONS[gameState.currentQuestionIndex].answer.replace(/\n/g, "<br>");
}

// Update score display
function updateScoreDisplay() {
    document.getElementById("score").textContent = gameState.score;
}

// Show hint to the user
function showHint() {
    gameState.usedHints++;

    const hintText = QUESTIONS[gameState.currentQuestionIndex].hint;
    const hintBox = document.getElementById("hintBox");

    let timeLeft = GAME_CONFIG.hintDuration;

    clearInterval(gameState.hintTimer);

    hintBox.innerHTML = `
        <div class="alert">
            💡 <strong>คำใบ้:</strong> ${hintText}
            <div id="countdown" style="margin-top: 5px;">จะหายภายใน ${timeLeft} วินาที</div>
        </div>
    `;

    gameState.hintTimer = setInterval(() => {
        timeLeft--;
        const countdown = document.getElementById("countdown");
        if (countdown) countdown.textContent = `จะหายภายใน ${timeLeft} วินาที`;

        if (timeLeft <= 0) {
            clearInterval(gameState.hintTimer);
            hintBox.innerHTML = "";
        }
    }, 1000);
}

// Move to next question
function nextQuestion() {
    gameState.currentQuestionIndex++;

    if (gameState.currentQuestionIndex < QUESTIONS.length) {
        displayQuestion();
        startTimer();
    } else {
        endGame();
    }
}

// End the game
function endGame() {
    clearInterval(gameState.timer);
    playSound("Gameover");
    
    const gameArea = document.getElementById("gameArea");
    gameArea.innerHTML = `
        <div class="game-container game-over">
            <h2>จบเกมแล้ว! 🎉</h2>
            <p class="final-score">คะแนนสุดท้าย: <strong>${gameState.score}/${GAME_CONFIG.maxScore}</strong></p>
            <p>คุณตอบถูก ${Math.round(gameState.score / 2)} จาก ${GAME_CONFIG.totalQuestions} ข้อ</p>
            <button class="restart-btn" onclick="restartGame()">เล่นอีกครั้ง</button>
        </div>
    `;
}

// Restart the game
function restartGame() {
    resetGameState();
    
    document.getElementById("gameArea").innerHTML = `
        <div class="game-container">
            <div class="question-header">
                <span class="question-number">ข้อที่ <span id="currentQ">1</span>/10</span>
                <span class="timer">เวลาเหลือ: <span id="time">120</span> วินาที</span>
            </div>
            
            <div class="question-text" id="question"></div>
            
            <textarea id="userAnswer" placeholder="พิมพ์คำตอบของคุณ..."></textarea>
            
            <div class="buttons">
                <button class="submit-btn" id="submitBtn" onclick="checkAnswer()">ส่งคำตอบ</button>
                <button class="hint-btn" id="hintBtn" onclick="showHint()">ขอคำใบ้</button>
                <button class="next-btn" id="nextBtn" onclick="nextQuestion()">ข้อต่อไป</button>
                <div id="hintBox"></div>
            </div>
            
            <div class="score-display">
                คะแนน: <span id="score">0</span>/20
            </div>
            
            <div class="result-box" id="resultBox">
                <div class="result-status" id="resultStatus"></div>
                <div class="correct-answer">
                    <strong>เฉลย:</strong> <span id="correctAnswer"></span>
                </div>
                <div class="explanation" id="explanation"></div>
            </div>
        </div>
    `;

    startGame();
}

// Play sound effect
function playSound(soundId) {
    const sound = document.getElementById(soundId);
    if (sound) {
        sound.currentTime = 0;
        sound.play();
    }
}

// Calculate similarity between two strings
function calculateSimilarity(str1, str2) {
    str1 = str1.replace(/\s+/g, "").toLowerCase();
    str2 = str2.replace(/\s+/g, "").toLowerCase();

    if (str1 === str2) return 1.0;

    if (Math.abs(str1.length - str2.length) > Math.max(str1.length, str2.length) * 0.3) {
        return 0.0;
    }

    const distance = levenshteinDistance(str1, str2);
    const maxLength = Math.max(str1.length, str2.length);

    return 1.0 - distance / maxLength;
}

// Levenshtein distance for text similarity
function levenshteinDistance(s, t) {
    if (s.length === 0) return t.length;
    if (t.length === 0) return s.length;

    const matrix = [];

    for (let i = 0; i <= s.length; i++) {
        matrix[i] = [i];
    }

    for (let j = 0; j <= t.length; j++) {
        matrix[0][j] = j;
    }

    for (let i = 1; i <= s.length; i++) {
        for (let j = 1; j <= t.length; j++) {
            const cost = s[i - 1] === t[j - 1] ? 0 : 1;
            matrix[i][j] = Math.min(
                matrix[i -1][j] + 1,
                matrix[i][j -1] + 1,
                matrix[i -1][j -1] + cost
            );
        }
    }

    return matrix[s.length][t.length];
}
