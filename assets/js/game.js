/**
 * game.js
 * มินิเกม "Eco Sort Challenge - แยกขยะกู้โลกใน 60 วินาที"
 * รองรับทั้ง Mouse Drag & Drop (PC) และ Mobile Touch/Click (มือถือ/แท็บเล็ต)
 * มีระบบเสียงด้วย Web Audio API, จับเวลานับถอยหลัง 1 นาที, ระบบคอมโบ, และสรุปผลคะแนน
 * โดย Natthaphum Thongsri
 */

(function () {
  'use strict';

  // --- ข้อมูลขยะทั้งหมดที่ใช้ในการสุ่ม ---
  const TRASH_ITEMS = [
    // ถังขยะเปียก / อินทรีย์ (green)
    { id: 't1', name: 'เปลือกกล้วย', category: 'green', icon: '🍌', hint: 'ย่อยสลายได้ง่ายตามธรรมชาติ' },
    { id: 't2', name: 'ก้างปลา / เศษอาหาร', category: 'green', icon: '🐟', hint: 'นำไปทำปุ๋ยหมักชีวภาพได้' },
    { id: 't3', name: 'เปลือกส้ม', category: 'green', icon: '🍊', hint: 'ขยะอินทรีย์ย่อยสลายได้' },
    { id: 't4', name: 'ใบไม้แห้ง', category: 'green', icon: '🍂', hint: 'เศษวัชพืช/ใบไม้ หมักเป็นดินปุ๋ยได้' },
    { id: 't5', name: 'กากกาแฟ', category: 'green', icon: '☕', hint: 'ขยะเปียกอินทรีย์ บำรุงดินได้ดี' },
    { id: 't6', name: 'กระดูกไก่', category: 'green', icon: '🍗', hint: 'เศษอาหารอินทรีย์' },

    // ถังขยะรีไซเคิล (yellow)
    { id: 't7', name: 'ขวดน้ำดื่ม PET', category: 'yellow', icon: '🧴', hint: 'พลาสติกใสเบอร์ 1 นำไปรีไซเคิลเป็นเส้นใยผ้าได้' },
    { id: 't8', name: 'กระป๋องน้ำอัดลม', category: 'yellow', icon: '🥫', hint: 'อลูมิเนียมหลอมรีไซเคิลได้ไม่จำกัดครั้ง' },
    { id: 't9', name: 'กล่องกระดาษพัสดุ', category: 'yellow', icon: '📦', hint: 'กระดาษลูกฟูก แปรรูปทำกระดาษใหม่ได้' },
    { id: 't10', name: 'ขวดแก้วน้ำหวาน', category: 'yellow', icon: '🍾', hint: 'แก้วนำกลับไปล้างหรือหลอมใหม่ได้ 100%' },
    { id: 't11', name: 'หนังสือพิมพ์เก่า', category: 'yellow', icon: '📰', hint: 'เยื่อกระดาษรีไซเคิล' },
    { id: 't12', name: 'กระป๋องปลากระป๋อง', category: 'yellow', icon: '🥫', hint: 'โลหะเหล็ก/สังกะสี ล้างให้สะอาดก่อนทิ้ง' },

    // ถังขยะทั่วไป (blue)
    { id: 't13', name: 'ซองขนมขบเคี้ยว', category: 'blue', icon: '🍟', hint: 'ฟิล์มหลายชั้น ไม่คุ้มค่าต่อการรีไซเคิล' },
    { id: 't14', name: 'กล่องโฟมเปื้อนอาหาร', category: 'blue', icon: '🍱', hint: 'ย่อยสลายยากมากและปนเปื้อนคราบมัน' },
    { id: 't15', name: 'หลอดพลาสติกดูดน้ำ', category: 'blue', icon: '🥤', hint: 'พลาสติกชิ้นเล็ก ย่อยสลายยาก' },
    { id: 't16', name: 'กระดาษทิชชูใช้แล้ว', category: 'blue', icon: '🧻', hint: 'เปื้อนสิ่งสกปรก ไม่สามารถรีไซเคิลได้' },
    { id: 't17', name: 'ถุงพลาสติกหูหิ้วเปื้อน', category: 'blue', icon: '🛍️', hint: 'พลาสติกฟิล์มเปื้อนคราบน้ำแกง' },
    { id: 't18', name: 'ซองบะหมี่กึ่งสำเร็จรูป', category: 'blue', icon: '🍜', hint: 'ซองฟอยล์เคลือบพลาสติก' },

    // ถังขยะอันตราย (red)
    { id: 't19', name: 'ถ่านไฟฉาย AA', category: 'red', icon: '🔋', hint: 'มีสารปรอทและแคดเมียม ต้องกำจัดพิเศษ' },
    { id: 't20', name: 'กระป๋องสเปรย์ฆ่าแมลง', category: 'red', icon: '🧴', hint: 'สารเคมีไวไฟ มีก๊าซอัดความดัน' },
    { id: 't21', name: 'หลอดไฟนีออน / ฟลูออเรสเซนต์', category: 'red', icon: '💡', hint: 'มีไอปรอทเคลือบอยู่ภายใน ห้ามทุบแตก' },
    { id: 't22', name: 'แบตเตอรี่มือถือเก่า', category: 'red', icon: '📱', hint: 'มีลิเธียมไอออน อาจระเบิดหรือติดไฟได้' },
    { id: 't23', name: 'ขวดยาหมดอายุ', category: 'red', icon: '💊', hint: 'สารเคมีตกค้างและอันตรายต่อสิ่งแวดล้อม' },
    { id: 't24', name: 'กระป๋องสีทาบ้าน', category: 'red', icon: '🪣', hint: 'มีโลหะหนักและสารทำละลายอินทรีย์' }
  ];

  const BIN_NAMES = {
    green: 'ถังขยะเปียก (สีเขียว)',
    yellow: 'ถังขยะรีไซเคิล (สีเหลือง)',
    blue: 'ถังขยะทั่วไป (สีน้ำเงิน)',
    red: 'ถังขยะอันตราย (สีแดง)'
  };

  // --- Game State ---
  let isGameRunning = false;
  let timeLeft = 60;
  let timerInterval = null;
  let score = 0;
  let correctCount = 0;
  let wrongCount = 0;
  let comboStreak = 0;
  let maxCombo = 0;
  let currentTrash = null;
  let soundEnabled = true;

  // --- Web Audio API Synthesizer (No external mp3 required!) ---
  let audioCtx = null;
  function initAudio() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
  }

  function playTone(freq, type, duration, delay = 0) {
    if (!soundEnabled) return;
    try {
      initAudio();
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      setTimeout(() => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + duration);
      }, delay * 1000);
    } catch (e) {
      console.warn('Audio not allowed yet:', e);
    }
  }

  function playSuccessSound() {
    playTone(523.25, 'sine', 0.12, 0);       // C5
    playTone(659.25, 'sine', 0.12, 0.08);    // E5
    playTone(783.99, 'sine', 0.25, 0.16);    // G5
  }

  function playErrorSound() {
    playTone(220, 'sawtooth', 0.18, 0);     // A3
    playTone(180, 'sawtooth', 0.25, 0.1);   // F3
  }

  function playGameOverFanfare() {
    playTone(440, 'triangle', 0.15, 0);
    playTone(554.37, 'triangle', 0.15, 0.15);
    playTone(659.25, 'triangle', 0.15, 0.3);
    playTone(880, 'sine', 0.5, 0.45);
  }

  // --- DOM Elements ---
  let startOverlay, playZone, resultModal;
  let timeDisplay, scoreDisplay, comboDisplay;
  let stageArea;
  let bins = [];

  function initGameDOM() {
    startOverlay = document.getElementById('game-start-overlay');
    playZone = document.getElementById('game-play-zone');
    timeDisplay = document.getElementById('hud-timer');
    scoreDisplay = document.getElementById('hud-score');
    comboDisplay = document.getElementById('hud-combo');
    stageArea = document.getElementById('item-stage');
    bins = document.querySelectorAll('.game-drop-bin');

    const startBtn = document.getElementById('btn-start-game');
    if (startBtn) {
      startBtn.addEventListener('click', startGame);
    }

    const soundToggle = document.getElementById('btn-sound-toggle');
    if (soundToggle) {
      soundToggle.addEventListener('click', () => {
        soundEnabled = !soundEnabled;
        soundToggle.innerHTML = soundEnabled 
          ? '<i class="fa-solid fa-volume-high"></i>' 
          : '<i class="fa-solid fa-volume-xmark"></i>';
      });
    }

    const restartBtn = document.getElementById('btn-restart-game');
    if (restartBtn) {
      restartBtn.addEventListener('click', () => {
        const modalEl = document.getElementById('gameResultModal');
        if (modalEl && window.bootstrap) {
          const modalInstance = bootstrap.Modal.getInstance(modalEl);
          if (modalInstance) modalInstance.hide();
        }
        startGame();
      });
    }

    setupBinsEventListeners();
  }

  // --- Start Game ---
  function startGame() {
    initAudio();
    isGameRunning = true;
    timeLeft = 60;
    score = 0;
    correctCount = 0;
    wrongCount = 0;
    comboStreak = 0;
    maxCombo = 0;

    updateHUD();

    if (startOverlay) startOverlay.style.display = 'none';
    if (playZone) playZone.style.display = 'block';

    // Start Timer
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
      timeLeft--;
      updateHUD();

      if (timeDisplay) {
        if (timeLeft <= 10) {
          timeDisplay.classList.add('timer-urgent');
        } else {
          timeDisplay.classList.remove('timer-urgent');
        }
      }

      if (timeLeft <= 0) {
        endGame();
      }
    }, 1000);

    spawnNextTrash();
  }

  // --- Update HUD ---
  function updateHUD() {
    if (timeDisplay) {
      const minutes = Math.floor(timeLeft / 60);
      const seconds = timeLeft % 60;
      timeDisplay.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }
    if (scoreDisplay) {
      scoreDisplay.textContent = score;
    }
    if (comboDisplay) {
      comboDisplay.textContent = comboStreak > 1 ? `x${comboStreak}` : '0';
    }
  }

  // --- Spawn Next Trash Item ---
  function spawnNextTrash() {
    if (!isGameRunning) return;

    // Pick random item (avoid immediate consecutive duplicate for better variety)
    let randomIndex;
    do {
      randomIndex = Math.floor(Math.random() * TRASH_ITEMS.length);
    } while (TRASH_ITEMS.length > 1 && currentTrash && TRASH_ITEMS[randomIndex].id === currentTrash.id);

    currentTrash = TRASH_ITEMS[randomIndex];

    if (!stageArea) return;

    stageArea.innerHTML = `
      <div class="trash-spawn-card" id="active-trash-card" draggable="true" data-category="${currentTrash.category}">
        <span class="trash-icon-large">${currentTrash.icon}</span>
        <div class="trash-name">${currentTrash.name}</div>
        <div class="trash-hint"><i class="fa-solid fa-lightbulb text-warning me-1"></i>${currentTrash.hint}</div>
        <div class="text-muted small mt-2 d-md-none"><i class="fa-solid fa-hand-pointer text-primary"></i> แตะที่ถังด้านล่างเพื่อทิ้ง</div>
      </div>
    `;

    const trashEl = document.getElementById('active-trash-card');
    setupTrashDrag(trashEl);
  }

  // --- Setup Drag & Drop Handlers ---
  function setupTrashDrag(trashEl) {
    if (!trashEl) return;

    // Desktop HTML5 Drag
    trashEl.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/plain', currentTrash.category);
      trashEl.classList.add('dragging');
    });

    trashEl.addEventListener('dragend', () => {
      trashEl.classList.remove('dragging');
    });

    // Mobile / Touch Drag Simulation & Tap Support
    let touchStartX = 0;
    let touchStartY = 0;

    trashEl.addEventListener('touchstart', (e) => {
      const touch = e.touches[0];
      touchStartX = touch.clientX;
      touchStartY = touch.clientY;
    }, { passive: true });

    trashEl.addEventListener('touchend', (e) => {
      const touch = e.changedTouches[0];
      const elemBelow = document.elementFromPoint(touch.clientX, touch.clientY);
      if (elemBelow) {
        const binTarget = elemBelow.closest('.game-drop-bin');
        if (binTarget) {
          const binCategory = binTarget.getAttribute('data-bin-type');
          handleDrop(binCategory, binTarget);
        }
      }
    });
  }

  // --- Setup Drop Bins Listeners ---
  function setupBinsEventListeners() {
    bins.forEach(bin => {
      // Desktop Drag & Drop
      bin.addEventListener('dragover', (e) => {
        e.preventDefault();
        bin.classList.add('drag-over');
      });

      bin.addEventListener('dragleave', () => {
        bin.classList.remove('drag-over');
      });

      bin.addEventListener('drop', (e) => {
        e.preventDefault();
        bin.classList.remove('drag-over');
        const binType = bin.getAttribute('data-bin-type');
        handleDrop(binType, bin);
      });

      // Mobile Tap to choose bin (Very friendly for phones!)
      bin.addEventListener('click', () => {
        if (!isGameRunning || !currentTrash) return;
        const binType = bin.getAttribute('data-bin-type');
        handleDrop(binType, bin);
      });
    });
  }

  // --- Handle Bin Drop / Selection ---
  function handleDrop(selectedBinType, binElement) {
    if (!isGameRunning || !currentTrash) return;

    const isCorrect = (selectedBinType === currentTrash.category);

    if (isCorrect) {
      // Correct!
      comboStreak++;
      if (comboStreak > maxCombo) maxCombo = comboStreak;
      correctCount++;

      // Score bonus based on combo
      const bonus = comboStreak >= 5 ? 15 : (comboStreak >= 3 ? 12 : 10);
      score += bonus;

      playSuccessSound();
      showScoreToast(`+${bonus}`, 'plus', binElement);
      showFlashFeedback(binElement, true);
    } else {
      // Wrong!
      comboStreak = 0;
      wrongCount++;
      score = Math.max(0, score - 5);

      playErrorSound();
      showScoreToast(`-5 (${BIN_NAMES[currentTrash.category]})`, 'minus', binElement);
      showFlashFeedback(binElement, false);
    }

    updateHUD();
    spawnNextTrash();
  }

  // --- Floating Toast Points Effect ---
  function showScoreToast(text, type, anchorEl) {
    const toast = document.createElement('div');
    toast.className = `score-toast ${type}`;
    toast.textContent = text;

    if (anchorEl) {
      const rect = anchorEl.getBoundingClientRect();
      const parentRect = anchorEl.parentElement.getBoundingClientRect();
      toast.style.left = `${(anchorEl.offsetLeft + (anchorEl.offsetWidth / 2) - 30)}px`;
      toast.style.top = `${anchorEl.offsetTop - 20}px`;
      anchorEl.parentElement.style.position = 'relative';
      anchorEl.parentElement.appendChild(toast);
    } else if (stageArea) {
      stageArea.appendChild(toast);
    }

    setTimeout(() => {
      toast.remove();
    }, 1000);
  }

  // --- Visual Feedback Flash ---
  function showFlashFeedback(binElement, isCorrect) {
    if (!binElement) return;
    const originalShadow = binElement.style.boxShadow;
    binElement.style.transition = 'box-shadow 0.2s ease, transform 0.2s ease';
    binElement.style.transform = 'scale(1.05)';
    binElement.style.boxShadow = isCorrect 
      ? '0 0 30px rgba(16, 185, 129, 0.7)' 
      : '0 0 30px rgba(239, 68, 68, 0.7)';

    setTimeout(() => {
      binElement.style.transform = '';
      binElement.style.boxShadow = originalShadow;
    }, 300);
  }

  // --- End Game ---
  function endGame() {
    isGameRunning = false;
    clearInterval(timerInterval);
    playGameOverFanfare();

    const totalAnswered = correctCount + wrongCount;
    const accuracy = totalAnswered > 0 ? Math.round((correctCount / totalAnswered) * 100) : 0;

    // Determine Rank
    let rankTitle = 'มือใหม่หัดแยกขยะ (Eco Beginner)';
    let rankBadge = '🌱';
    let rankDesc = 'คุณเริ่มต้นได้ดี! หมั่นฝึกฝนและศึกษาประเภทขยะเพิ่มเติมเพื่อเป็นกำลังสำคัญในการกู้โลกนะ';

    if (score >= 250) {
      rankTitle = 'สุดยอดผู้พิทักษ์โลกขั้นเทพ (Eco Grandmaster)';
      rankBadge = '👑';
      rankDesc = 'ยอดเยี่ยมที่สุด! คุณมีความรู้ความเข้าใจในการคัดแยกขยะอย่างแม่นยำระดับมืออาชีพ';
    } else if (score >= 150) {
      rankTitle = 'ผู้พิทักษ์สิ่งแวดล้อม (Green Guardian)';
      rankBadge = '🛡️';
      rankDesc = 'เก่งมาก! ทักษะการแยกขยะของคุณยอดเยี่ยม สามารถเป็นผู้นำด้านสิ่งแวดล้อมได้สบาย';
    } else if (score >= 80) {
      rankTitle = 'นักแยกขยะประจำบ้าน (Eco Warrior)';
      rankBadge = '⭐';
      rankDesc = 'ทำได้ดีทีเดียว! รู้จักขยะในชีวิตประจำวันเกือบครบถ้วน ลองใหม่อีกนิดเพื่อคะแนนเต็ม';
    }

    // Populate modal results
    document.getElementById('modal-final-score').textContent = score;
    document.getElementById('modal-correct-count').textContent = correctCount;
    document.getElementById('modal-wrong-count').textContent = wrongCount;
    document.getElementById('modal-accuracy').textContent = `${accuracy}%`;
    document.getElementById('modal-max-combo').textContent = maxCombo;
    document.getElementById('modal-rank-badge').textContent = rankBadge;
    document.getElementById('modal-rank-title').textContent = rankTitle;
    document.getElementById('modal-rank-desc').textContent = rankDesc;

    // Show Bootstrap Modal
    const modalEl = document.getElementById('gameResultModal');
    if (modalEl && window.bootstrap) {
      const modal = new bootstrap.Modal(modalEl);
      modal.show();
    }
  }

  // Initialize Game on DOM ready
  document.addEventListener('DOMContentLoaded', () => {
    initGameDOM();
  });

})();

