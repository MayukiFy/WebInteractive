/**
 * components.js
 * จัดการ Navigation Bar และ Footer ให้เหมือนกันทุกหน้า 
 * สามารถแก้ไขข้อมูลที่นี่เพียงจุดเดียว ก็จะเปลี่ยนทุกหน้าทันที
 * รวมไปถึงระบบ Dark/Light Mode, ปุ่ม Scroll to top
 * และระบบเล่นเสียงดนตรีธรรมชาติในพื้นหลัง (Ambient Nature Audio) พร้อมปุ่มเปิด/ปิด
 * ออกแบบโดย Natthaphum Thongsri
 */

(function () {
  'use strict';

  // 1. Theme Configuration & Initialization (Dark / Light Mode)
  const savedTheme = localStorage.getItem('eco_theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', savedTheme);
  document.documentElement.setAttribute('data-bs-theme', savedTheme);

  // 2. Navigation items configuration
  const navItems = [
    { title: 'Home', href: 'index.html', icon: 'fa-house' },
    { title: 'PlayGame', href: 'game.html', icon: 'fa-gamepad' },
    { title: 'ขยะในชีวิตประจำวัน', href: 'daily-waste.html', icon: 'fa-trash-can' },
    { title: 'รักษาสิ่งแวดล้อม', href: 'environment.html', icon: 'fa-earth-americas' }
  ];

  // Helper to get active page filename
  function getCurrentPageName() {
    const path = window.location.pathname;
    const page = path.split('/').pop().toLowerCase();
    if (!page || page === '' || page === 'index.php') return 'index.html';
    return page;
  }

  // 3. Ambient Nature Sound Engine (Web Audio API Synthesizer)
  class AmbientSoundEngine {
    constructor() {
      this.ctx = null;
      this.isPlaying = false;
      this.masterGain = null;
      this.oscillators = [];
      this.chimeTimer = null;
      this.storageKey = 'eco_bgm_active';
    }

    initAudio() {
      if (!this.ctx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioContext();
      }
    }

    start() {
      this.initAudio();
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      if (this.isPlaying) return;

      this.isPlaying = true;
      localStorage.setItem(this.storageKey, 'true');
      this.updateUI(true);

      const now = this.ctx.currentTime;

      // Master Gain Node with gentle fade-in (low volume so it's pleasant and non-intrusive)
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.0001, now);
      this.masterGain.gain.exponentialRampToValueAtTime(0.09, now + 2);
      this.masterGain.connect(this.ctx.destination);

      // Low-pass filter for a warm, soft nature drone (no harsh high frequencies)
      const lpf = this.ctx.createBiquadFilter();
      lpf.type = 'lowpass';
      lpf.frequency.setValueAtTime(420, now);
      lpf.connect(this.masterGain);

      // Calming Harmonic chord: C3, G3, B3, E4, G4 (Eco Nature Pentatonic)
      const chord = [130.81, 196.00, 246.94, 329.63, 392.00];
      this.oscillators = [];

      chord.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const oscGain = this.ctx.createGain();

        osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, now);
        osc.detune.setValueAtTime((idx - 2) * 5, now); // Gentle chorus detune

        oscGain.gain.setValueAtTime(0.04 / chord.length, now);

        // Slow breathing LFO modulation
        const lfo = this.ctx.createOscillator();
        const lfoGain = this.ctx.createGain();
        lfo.frequency.setValueAtTime(0.12 + (idx * 0.04), now);
        lfoGain.gain.setValueAtTime(0.015, now);
        lfo.connect(oscGain.gain);
        lfo.start(now);

        osc.connect(oscGain);
        oscGain.connect(lpf);
        osc.start(now);

        this.oscillators.push(osc, lfo);
      });

      // Occasional gentle natural singing bowl / wind chime tone
      const playChime = () => {
        if (!this.isPlaying || !this.ctx) return;
        const chimeTime = this.ctx.currentTime;
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        const chosenNote = notes[Math.floor(Math.random() * notes.length)];

        const cOsc = this.ctx.createOscillator();
        const cGain = this.ctx.createGain();

        cOsc.type = 'sine';
        cOsc.frequency.setValueAtTime(chosenNote, chimeTime);

        cGain.gain.setValueAtTime(0.035, chimeTime);
        cGain.gain.exponentialRampToValueAtTime(0.0001, chimeTime + 3.2);

        cOsc.connect(cGain);
        cGain.connect(this.masterGain);

        cOsc.start(chimeTime);
        cOsc.stop(chimeTime + 3.3);
      };

      clearInterval(this.chimeTimer);
      this.chimeTimer = setInterval(playChime, 6000);
      setTimeout(playChime, 1200);
    }

    stop() {
      if (!this.isPlaying) return;
      this.isPlaying = false;
      localStorage.setItem(this.storageKey, 'false');
      this.updateUI(false);
      clearInterval(this.chimeTimer);

      if (this.masterGain && this.ctx) {
        const now = this.ctx.currentTime;
        this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
        this.masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.8);

        setTimeout(() => {
          this.oscillators.forEach(o => {
            try { o.stop(); o.disconnect(); } catch (e) {}
          });
          this.oscillators = [];
        }, 900);
      }
    }

    toggle() {
      if (this.isPlaying) {
        this.stop();
      } else {
        this.start();
      }
    }

    updateUI(active) {
      const navBtn = document.getElementById('bgm-toggle-btn');
      const pill = document.getElementById('audio-floating-pill');
      const pillLabel = pill ? pill.querySelector('.audio-pill-label') : null;

      if (navBtn) {
        if (active) {
          navBtn.classList.add('playing');
          navBtn.title = 'ปิดเสียงเพลงธรรมชาติในพื้นหลัง';
          navBtn.innerHTML = '<i class="fa-solid fa-volume-high text-success"></i>';
        } else {
          navBtn.classList.remove('playing');
          navBtn.title = 'เปิดเสียงเพลงธรรมชาติในพื้นหลัง';
          navBtn.innerHTML = '<i class="fa-solid fa-volume-xmark"></i>';
        }
      }

      if (pill) {
        if (active) {
          pill.classList.add('playing');
          if (pillLabel) pillLabel.textContent = 'เสียงธรรมชาติ: เปิด';
        } else {
          pill.classList.remove('playing');
          if (pillLabel) pillLabel.textContent = 'เสียงธรรมชาติ: ปิด';
        }
      }
    }
  }

  const ambientAudio = new AmbientSoundEngine();

  // 4. Render Navbar
  function renderNavbar() {
    const navPlaceholder = document.getElementById('site-navbar');
    if (!navPlaceholder) return;

    const currentPage = getCurrentPageName();

    const linksHtml = navItems.map(item => {
      const isActive = (currentPage === item.href.toLowerCase()) || 
                       (currentPage === '' && item.href === 'index.html');
      return `
        <li class="nav-item">
          <a class="nav-link nav-link-custom ${isActive ? 'active' : ''}" href="${item.href}">
            <i class="fa-solid ${item.icon}"></i>
            <span>${item.title}</span>
          </a>
        </li>
      `;
    }).join('');

    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const isBgmActive = (localStorage.getItem('eco_bgm_active') !== 'false');

    navPlaceholder.innerHTML = `
      <nav class="navbar navbar-expand-lg navbar-custom">
        <div class="container">
          <a class="navbar-brand brand-logo" href="index.html">
            <div class="brand-icon-wrap">
              <i class="fa-solid fa-seedling"></i>
            </div>
            <span>ขยะและสิ่งแวดล้อม</span>
          </a>

          <div class="d-flex align-items-center gap-2 order-lg-last">
            <!-- Background Music Toggle Button -->
            <button class="btn-theme-toggle btn-audio-toggle ${isBgmActive ? 'playing' : ''}" id="bgm-toggle-btn" title="${isBgmActive ? 'ปิดเสียงเพลงธรรมชาติในพื้นหลัง' : 'เปิดเสียงเพลงธรรมชาติในพื้นหลัง'}" aria-label="Toggle Background Music">
              <i class="fa-solid ${isBgmActive ? 'fa-volume-high text-success' : 'fa-volume-xmark'}"></i>
            </button>
            
            <!-- Dark / Light Theme Toggle Button -->
            <button class="btn-theme-toggle" id="theme-toggle-btn" title="เปลี่ยนโหมด สว่าง / มืด" aria-label="Toggle Theme">
              <i class="fa-solid ${currentTheme === 'dark' ? 'fa-sun' : 'fa-moon'}"></i>
            </button>

            <!-- Nav CTA Play Game -->
            <a href="game.html" class="btn-nav-play d-none d-sm-inline-flex">
              <i class="fa-solid fa-gamepad"></i>
              <span>เล่นเกมแยกขยะ</span>
            </a>

            <!-- Mobile Hamburger Toggler -->
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarMainContent" aria-controls="navbarMainContent" aria-expanded="false" aria-label="Toggle navigation">
              <i class="fa-solid fa-bars-staggered"></i>
            </button>
          </div>

          <div class="collapse navbar-collapse justify-content-center" id="navbarMainContent">
            <ul class="navbar-nav gap-lg-2 py-3 py-lg-0">
              ${linksHtml}
            </ul>
          </div>
        </div>
      </nav>
    `;

    // Listen for Theme Toggle Click
    const toggleBtn = document.getElementById('theme-toggle-btn');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', toggleTheme);
    }

    // Listen for BGM Audio Toggle Click in Navbar
    const bgmBtn = document.getElementById('bgm-toggle-btn');
    if (bgmBtn) {
      bgmBtn.addEventListener('click', () => {
        ambientAudio.toggle();
      });
    }

    // Auto close mobile navbar collapse when a link is clicked
    const navCollapse = document.getElementById('navbarMainContent');
    if (navCollapse) {
      navCollapse.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
          if (navCollapse.classList.contains('show') && window.bootstrap) {
            const bsCollapse = bootstrap.Collapse.getInstance(navCollapse) || new bootstrap.Collapse(navCollapse, { toggle: false });
            bsCollapse.hide();
          }
        });
      });
    }
  }

  // 5. Render Floating Ambient Audio Pill Widget
  function setupFloatingAudioWidget() {
    let pill = document.getElementById('audio-floating-pill');
    if (!pill) {
      pill = document.createElement('div');
      pill.id = 'audio-floating-pill';
      pill.className = 'audio-floating-pill';
      pill.setAttribute('title', 'คลิกเพื่อเปิด / ปิดเสียงดนตรีธรรมชาติ');
      pill.innerHTML = `
        <div class="equalizer-bars">
          <span class="eq-bar"></span>
          <span class="eq-bar"></span>
          <span class="eq-bar"></span>
        </div>
        <span class="audio-pill-label">เสียงธรรมชาติ: เปิด</span>
      `;
      document.body.appendChild(pill);
    }

    pill.addEventListener('click', () => {
      ambientAudio.toggle();
    });

    // Check saved state: Default to true (Autoplay on page load unless user explicitly set to 'false')
    const savedState = localStorage.getItem('eco_bgm_active');
    const shouldPlay = (savedState !== 'false');

    if (shouldPlay) {
      // Set UI to active immediately
      ambientAudio.updateUI(true);

      // Attempt immediate autoplay
      ambientAudio.start();

      // If browser enforces autoplay policy requiring a user gesture,
      // resume on the very first interaction (click, scroll, touch, keydown)
      const unlockEvents = ['click', 'touchstart', 'pointerdown', 'scroll', 'keydown'];
      const unlockAutoplay = () => {
        if (!ambientAudio.isPlaying && (localStorage.getItem('eco_bgm_active') !== 'false')) {
          ambientAudio.start();
        }
        unlockEvents.forEach(evt => window.removeEventListener(evt, unlockAutoplay, { passive: true }));
      };

      unlockEvents.forEach(evt => {
        window.addEventListener(evt, unlockAutoplay, { once: true, passive: true });
      });
    } else {
      ambientAudio.updateUI(false);
    }
  }

  // 6. Toggle Dark / Light Theme
  function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    document.documentElement.setAttribute('data-bs-theme', next);
    localStorage.setItem('eco_theme', next);

    const toggleBtn = document.getElementById('theme-toggle-btn');
    if (toggleBtn) {
      toggleBtn.innerHTML = `<i class="fa-solid ${next === 'dark' ? 'fa-sun' : 'fa-moon'}"></i>`;
    }
  }

  // 7. Render Footer
  function renderFooter() {
    const footerPlaceholder = document.getElementById('site-footer');
    if (!footerPlaceholder) return;

    footerPlaceholder.innerHTML = `
      <footer class="site-footer">
        <div class="container">
          <div class="row g-4 align-items-center">
            <div class="col-lg-5 text-center text-lg-start">
              <a href="index.html" class="brand-logo justify-content-center justify-content-lg-start mb-2">
                <div class="brand-icon-wrap">
                  <i class="fa-solid fa-seedling"></i>
                </div>
                <span>ขยะและสิ่งแวดล้อม</span>
              </a>
              <p class="text-muted small mb-0">
                เรียนรู้การคัดแยกขยะอย่างถูกต้องเพื่อโลกที่ยั่งยืน และร่วมเป็นส่วนหนึ่งในการลดภาวะโลกร้อนไปด้วยกัน
              </p>
            </div>
            
            <div class="col-lg-4 text-center">
              <ul class="list-inline mb-0">
                <li class="list-inline-item mx-2"><a href="index.html" class="footer-link">Home</a></li>
                <li class="list-inline-item mx-2"><a href="game.html" class="footer-link">PlayGame</a></li>
                <li class="list-inline-item mx-2"><a href="daily-waste.html" class="footer-link">ขยะในชีวิตประจำวัน</a></li>
                <li class="list-inline-item mx-2"><a href="environment.html" class="footer-link">รักษาสิ่งแวดล้อม</a></li>
              </ul>
            </div>

            <div class="col-lg-3 text-center text-lg-end">
              <span class="badge-pill-eco mb-0">
                <i class="fa-solid fa-shield-heart text-success"></i> Save The Planet 2026
              </span>
            </div>
          </div>

          <hr class="footer-divider">

          <div class="row align-items-center">
            <div class="col-md-6 text-center text-md-start mb-2 mb-md-0">
              <p class="mb-0 text-muted small">
                &copy; 2026 ขยะและสิ่งแวดล้อม
              </p>
            </div>
            <div class="col-md-6 text-center text-md-end">
              <p class="mb-0 text-muted small">
                Designed by <strong class="text-success">Natthaphum Thongsri</strong>
              </p>
            </div>
          </div>
        </div>
      </footer>
    `;
  }

  // 8. Render Scroll To Top Button
  function setupScrollToTop() {
    let btn = document.getElementById('btn-scroll-top');
    if (!btn) {
      btn = document.createElement('button');
      btn.id = 'btn-scroll-top';
      btn.setAttribute('aria-label', 'เลื่อนขึ้นด้านบน');
      btn.setAttribute('title', 'เลื่อนขึ้นด้านบน');
      btn.innerHTML = '<i class="fa-solid fa-arrow-up"></i>';
      document.body.appendChild(btn);
    }

    window.addEventListener('scroll', () => {
      if (window.scrollY > 300) {
        btn.classList.add('visible');
      } else {
        btn.classList.remove('visible');
      }
    });

    btn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  // 9. Navbar scroll shadow effect
  function setupNavbarScroll() {
    const navbar = document.querySelector('.navbar-custom');
    if (!navbar) return;
    window.addEventListener('scroll', () => {
      if (window.scrollY > 40) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    });
  }

  // Initialize all shared components when DOM is ready
  document.addEventListener('DOMContentLoaded', () => {
    renderNavbar();
    renderFooter();
    setupFloatingAudioWidget();
    setupScrollToTop();
    setupNavbarScroll();
  });

})();
