/* ============================================================
   Faith Ochanya Ejembi — portfolio behaviour
   No dependencies. Everything degrades gracefully without JS.
   ============================================================ */

(function () {
  'use strict';

  var root = document.documentElement;
  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Theme ---------- */

  var themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('theme', next); } catch (e) {}
      refreshParticleColour();
    });
  }

  /* ---------- Mobile nav ---------- */

  var navLinks = document.getElementById('nav-links');
  var menuToggle = document.getElementById('menu-toggle');

  if (navLinks && menuToggle) {
    menuToggle.addEventListener('click', function () {
      var open = navLinks.classList.toggle('open');
      menuToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });

    navLinks.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        navLinks.classList.remove('open');
        menuToggle.setAttribute('aria-expanded', 'false');
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && navLinks.classList.contains('open')) {
        navLinks.classList.remove('open');
        menuToggle.setAttribute('aria-expanded', 'false');
        menuToggle.focus();
      }
    });
  }

  /* ---------- Status bar clock ---------- */

  var timeEl = document.getElementById('status-time');
  var dateEl = document.getElementById('status-date');

  function updateClock() {
    var now = new Date();
    if (timeEl) {
      timeEl.textContent = now.toLocaleTimeString('en-US', {
        hour: '2-digit', minute: '2-digit', second: '2-digit'
      });
    }
    if (dateEl) {
      dateEl.textContent = now.toLocaleDateString('en-US', {
        weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
      });
    }
  }

  if (timeEl || dateEl) {
    updateClock();
    setInterval(updateClock, 1000);
  }

  /* ---------- Footer year ---------- */

  var year = String(new Date().getFullYear());
  Array.prototype.forEach.call(document.querySelectorAll('.js-year'), function (el) {
    el.textContent = year;
  });

  /* ---------- Portrait fallback ---------- */

  /* If profile.jpg is absent, reveal the monogram behind it instead
     of leaving a broken image in the hero. */
  Array.prototype.forEach.call(document.querySelectorAll('.hero-portrait img'), function (img) {
    function markMissing() {
      var wrap = img.closest('.hero-portrait');
      if (wrap) wrap.classList.add('no-photo');
    }
    img.addEventListener('error', markMissing);
    if (img.complete && img.naturalWidth === 0) markMissing();
  });

  /* ---------- Typing effect ---------- */

  var typingEl = document.querySelector('.typing-text');
  var PHRASES = [
    'AI Engineer in the making',
    'Learning Python & FastAPI',
    'Building AI-powered applications',
    'Solving real problems with code'
  ];

  if (typingEl) {
    if (prefersReduced) {
      typingEl.textContent = PHRASES[0];
    } else {
      var phraseIndex = 0;
      var charIndex = 0;
      var deleting = false;

      (function type() {
        var phrase = PHRASES[phraseIndex];
        charIndex += deleting ? -1 : 1;
        typingEl.textContent = phrase.substring(0, charIndex);

        var delay = deleting ? 40 : 80;

        if (!deleting && charIndex === phrase.length) {
          delay = 2200;
          deleting = true;
        } else if (deleting && charIndex === 0) {
          deleting = false;
          phraseIndex = (phraseIndex + 1) % PHRASES.length;
          delay = 400;
        }

        setTimeout(type, delay);
      })();
    }
  }

  /* ---------- Background particles ---------- */

  var canvas = document.getElementById('bg-canvas');
  var accentRgb = [59, 130, 246];

  function readAccent() {
    var raw = getComputedStyle(root).getPropertyValue('--accent').trim();
    var hex = raw.replace('#', '');
    if (hex.length === 3) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    if (hex.length !== 6) return;
    var n = parseInt(hex, 16);
    accentRgb = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }

  function refreshParticleColour() { readAccent(); }

  if (canvas && canvas.getContext && !prefersReduced) {
    var ctx = canvas.getContext('2d');
    var width, height, particles = [];
    var mouse = null;
    var animate = null;

    readAccent();

    function resize() {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }
    resize();

    function Particle() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.size = Math.random() * 1.6 + 0.4;
      this.speedX = (Math.random() - 0.5) * 0.35;
      this.speedY = (Math.random() - 0.5) * 0.35;
      this.opacity = Math.random() * 0.5 + 0.15;
    }

    Particle.prototype.update = function () {
      this.x += this.speedX;
      this.y += this.speedY;

      if (this.x > width) this.x = 0;
      if (this.x < 0) this.x = width;
      if (this.y > height) this.y = 0;
      if (this.y < 0) this.y = height;

      if (mouse) {
        var dx = this.x - mouse.x;
        var dy = this.y - mouse.y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 140 && dist > 0) {
          var angle = Math.atan2(dy, dx);
          var force = ((140 - dist) / 140) * 0.4;
          this.x += Math.cos(angle) * force;
          this.y += Math.sin(angle) * force;
        }
      }
    };

    Particle.prototype.draw = function () {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(' + accentRgb[0] + ',' + accentRgb[1] + ',' + accentRgb[2] + ',' + this.opacity + ')';
      ctx.fill();
    };

    function build() {
      var isNarrow = window.innerWidth < 700;
      var count = isNarrow
        ? 40
        : Math.min(120, Math.floor((width * height) / 12000));
      particles = [];
      for (var i = 0; i < count; i++) particles.push(new Particle());
      return isNarrow;
    }

    var staticMode = build();

    if (!staticMode) {
      document.addEventListener('mousemove', function (e) {
        mouse = { x: e.clientX, y: e.clientY };
      });
      document.addEventListener('mouseleave', function () { mouse = null; });
    }

    animate = function () {
      ctx.clearRect(0, 0, width, height);

      for (var i = 0; i < particles.length; i++) {
        for (var j = i + 1; j < particles.length; j++) {
          var dx = particles[i].x - particles[j].x;
          var dy = particles[i].y - particles[j].y;
          var d = Math.sqrt(dx * dx + dy * dy);
          if (d < 110) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = 'rgba(' + accentRgb[0] + ',' + accentRgb[1] + ',' + accentRgb[2] + ',' + ((1 - d / 110) * 0.25) + ')';
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      for (var k = 0; k < particles.length; k++) {
        particles[k].update();
        particles[k].draw();
      }

      requestAnimationFrame(animate);
    };

    animate();

    var resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        resize();
        build();
      }, 150);
    });

    /* Pause the animation while the tab is hidden — no point burning
       CPU on a page nobody is looking at. */
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) {
        cancelAnimationFrame(animate);
      } else {
        requestAnimationFrame(animate);
      }
    });
  }

  /* ---------- Scroll reveal ---------- */

  var fadeEls = document.querySelectorAll('.fade-in');

  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

    Array.prototype.forEach.call(fadeEls, function (el) { observer.observe(el); });
  } else {
    Array.prototype.forEach.call(fadeEls, function (el) { el.classList.add('visible'); });
  }

  /* ---------- Terminal ---------- */

  var terminal = document.getElementById('terminal-overlay');
  var tInput = document.getElementById('terminal-input');
  var tOutput = document.getElementById('terminal-output');
  var tClose = document.getElementById('terminal-close');

  if (terminal && tInput && tOutput) {
    var COMMANDS = {
      help: function () {
        return [
          'Available commands:',
          '  help      - Show this help message',
          '  about     - Who I am',
          '  skills    - Technologies I work with',
          '  projects  - What I have built',
          '  contact   - How to reach me',
          '  whoami    - Display current user',
          '  date      - Show current date and time',
          '  echo      - Repeat what you type',
          '  clear     - Clear the terminal'
        ].join('\n');
      },
      about: function () {
        return 'Faith Ochanya Ejembi — learning Python as a pathway to\nbecoming a skilled AI Engineer, and building AI-powered applications.';
      },
      skills: function () {
        return 'Python • JavaScript • Go • HTML • CSS • FastAPI\nHugging Face • LLM APIs • Git • GitHub';
      },
      projects: function () {
        return '📚 Fibles — AI Study Assistant (in progress)\n' +
               '🔐 Password Strength Checker (finished)\n' +
               '🔗 Visit projects.html for details.';
      },
      contact: function () {
        return 'Email:  faithejembi72@gmail.com\n' +
               'GitHub: github.com/ejembi45';
      },
      whoami: function () {
        return 'faith@ejembi45';
      },
      date: function () {
        return new Date().toString();
      },
      echo: function (args) {
        return args.join(' ') || '...';
      },
      clear: function () {
        tOutput.innerHTML = '';
        return null;
      }
    };

    function openTerminal() {
      terminal.classList.add('active');
      setTimeout(function () { tInput.focus(); }, 100);
    }

    function closeTerminal() {
      terminal.classList.remove('active');
    }

    document.addEventListener('keydown', function (e) {
      if (e.ctrlKey && e.key === '`') {
        e.preventDefault();
        terminal.classList.contains('active') ? closeTerminal() : openTerminal();
      }
      if (e.key === 'Escape' && terminal.classList.contains('active')) {
        closeTerminal();
      }
    });

    if (tClose) tClose.addEventListener('click', closeTerminal);

    tInput.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter') return;

      var input = tInput.value.trim();
      tInput.value = '';

      var line = document.createElement('div');
      line.className = 'terminal-line';
      /* Escape before echoing so typed markup renders as text, not HTML. */
      line.innerHTML = '<span style="color:#22c55e;">$</span> ' +
        input.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      tOutput.appendChild(line);

      var parts = input.split(' ');
      var cmd = (parts[0] || '').toLowerCase();
      var args = parts.slice(1);
      var output = '';

      if (Object.prototype.hasOwnProperty.call(COMMANDS, cmd)) {
        output = COMMANDS[cmd](args);
      } else if (cmd) {
        output = "Command not found: " + cmd + ". Type 'help' for available commands.";
      }

      if (output !== null && output !== undefined && output !== '') {
        var out = document.createElement('div');
        out.className = 'terminal-line';
        out.textContent = output;
        tOutput.appendChild(out);
      }

      tOutput.scrollTop = tOutput.scrollHeight;
    });
  }

})();
