/**
 * main.js
 * จัดการแอนิเมชัน, Scroll Reveal, Preloader และเอฟเฟกต์ปฏิสัมพันธ์ทั่วทั้งเว็บไซต์
 * ขยะและสิ่งแวดล้อม 2026
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // 1. Remove Preloader
  const preloader = document.getElementById('preloader');
  if (preloader) {
    window.addEventListener('load', () => {
      setTimeout(() => {
        preloader.classList.add('fade-out');
        setTimeout(() => {
          preloader.style.display = 'none';
        }, 600);
      }, 300);
    });
    // Fallback if load already fired
    if (document.readyState === 'complete') {
      preloader.classList.add('fade-out');
      setTimeout(() => { preloader.style.display = 'none'; }, 600);
    }
  }

  // 2. Scroll Reveal Animation using IntersectionObserver
  const revealElements = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          // Once animated, unobserve
          observer.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: '0px 0px -40px 0px',
      threshold: 0.12
    });

    revealElements.forEach(el => revealObserver.observe(el));
  } else {
    // Fallback for older browsers
    revealElements.forEach(el => el.classList.add('active'));
  }

  // 3. Stat Counter Animation
  const statNumbers = document.querySelectorAll('[data-counter]');
  if (statNumbers.length > 0 && 'IntersectionObserver' in window) {
    const counterObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = parseFloat(el.getAttribute('data-counter'));
          const suffix = el.getAttribute('data-suffix') || '';
          const prefix = el.getAttribute('data-prefix') || '';
          const duration = 1600;
          let start = 0;
          const stepTime = 25;
          const steps = duration / stepTime;
          const increment = target / steps;

          const timer = setInterval(() => {
            start += increment;
            if (start >= target) {
              el.innerText = prefix + (Number.isInteger(target) ? target.toLocaleString() : target.toFixed(1)) + suffix;
              clearInterval(timer);
            } else {
              el.innerText = prefix + (Number.isInteger(target) ? Math.floor(start).toLocaleString() : start.toFixed(1)) + suffix;
            }
          }, stepTime);

          observer.unobserve(el);
        }
      });
    }, { threshold: 0.5 });

    statNumbers.forEach(num => counterObserver.observe(num));
  }

  // 4. Smooth Anchor Scrolling
  document.querySelectorAll('a[href^="#"]:not([href="#"])').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });

});

