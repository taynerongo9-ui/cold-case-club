/* ============================================
   COLD CASE CLUB — Main JS
   Commercially Ready Edition
   ============================================ */

// -------------------------------------------
// CONFIG
// -------------------------------------------
const CONFIG = {
  // Stripe Publishable Key (safe to expose in frontend)
  stripePublishableKey: 'pk_live_51THFD2GsNBzVX9j8k97GMVcvFUAzo6lRJL0pQMdfVfFBDKP1E4WFmCxyeQpz4LWfeIkzUpDetROWNV6Wt6LqHvQj00XHD9ljmq',

  // Fallback: Payment Links (used if embedded checkout fails)
  stripeMonthly: 'https://buy.stripe.com/5kQbJ1afS1Y96AX50SeME03',
  stripePrepaid: 'https://buy.stripe.com/00wbJ173G8mx5wTgJAeME04',
  stripeGift:    'https://buy.stripe.com/7sY9AT0FibyJ8J50KCeME05',

  // Self-hosted email collection API (Vercel serverless function)
  emailEndpoint: '/api/subscribe',

  // Mother's Day shipping cutoff (May 5, 2026 midnight ET)
  urgencyDeadline: new Date('2026-05-05T04:00:00Z'),
};

// -------------------------------------------
// Urgency bar — hide if previously dismissed
// -------------------------------------------
const urgencyBar = document.getElementById('urgency-bar');
if (urgencyBar && localStorage.getItem('urgencyDismissed')) {
  urgencyBar.style.display = 'none';
}

// -------------------------------------------
// Sticky Nav — shrink on scroll
// -------------------------------------------
const nav = document.querySelector('.nav');
if (nav) {
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 50);
  }, { passive: true });
}

// -------------------------------------------
// Mobile Nav Toggle
// -------------------------------------------
const navToggle = document.querySelector('.nav-toggle');
const navOverlay = document.querySelector('.nav-overlay');

if (navToggle && navOverlay) {
  navToggle.addEventListener('click', () => {
    const isOpen = navOverlay.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', isOpen);
    navToggle.textContent = isOpen ? '\u2715' : '\u2630';
  });
  navOverlay.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navOverlay.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
      navToggle.textContent = '\u2630';
    });
  });
}

// -------------------------------------------
// FAQ Accordion (with aria-expanded)
// -------------------------------------------
document.querySelectorAll('.faq-question').forEach(btn => {
  btn.setAttribute('aria-expanded', 'false');
  btn.addEventListener('click', () => {
    const item = btn.parentElement;
    const wasOpen = item.classList.contains('open');

    // Close all
    document.querySelectorAll('.faq-item').forEach(i => {
      i.classList.remove('open');
      i.querySelector('.faq-question')?.setAttribute('aria-expanded', 'false');
    });

    // Toggle clicked
    if (!wasOpen) {
      item.classList.add('open');
      btn.setAttribute('aria-expanded', 'true');
    }
  });
});

// -------------------------------------------
// Scroll Fade-In (Enhanced Intersection Observer)
// Supports: .fade-in, .slide-left, .slide-right, .scale-in, .section-divider
// -------------------------------------------
const animatedEls = document.querySelectorAll('.fade-in, .slide-left, .slide-right, .scale-in, .section-divider');

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  animatedEls.forEach(el => observer.observe(el));
} else {
  animatedEls.forEach(el => el.classList.add('visible'));
}

// -------------------------------------------
// SCROLL PROGRESS BAR
// -------------------------------------------
(function initScrollProgress() {
  const bar = document.createElement('div');
  bar.className = 'scroll-progress';
  document.body.prepend(bar);
  window.addEventListener('scroll', () => {
    const h = document.documentElement.scrollHeight - window.innerHeight;
    if (h > 0) bar.style.transform = `scaleX(${window.scrollY / h})`;
  }, { passive: true });
})();

// -------------------------------------------
// FILM GRAIN OVERLAY
// -------------------------------------------
(function initGrain() {
  const grain = document.createElement('div');
  grain.className = 'grain-overlay';
  document.body.appendChild(grain);
})();

// -------------------------------------------
// TYPEWRITER HERO EFFECT
// -------------------------------------------
(function initTypewriter() {
  const heroH1 = document.querySelector('.hero h1');
  if (!heroH1 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const line1 = 'Someone Got Away With It.';
  const line2 = 'Can You Prove It?';

  heroH1.innerHTML = '';
  heroH1.style.visibility = 'visible';

  const span1 = document.createElement('span');
  span1.className = 'typewriter-line';
  const span2 = document.createElement('span');
  span2.className = 'typewriter-line';
  const em = document.createElement('em');
  em.style.fontStyle = 'normal';
  em.style.color = 'var(--gold)';

  const cursor = document.createElement('span');
  cursor.className = 'typewriter-cursor';
  cursor.innerHTML = '&nbsp;';

  heroH1.appendChild(span1);
  heroH1.appendChild(document.createElement('br'));
  heroH1.appendChild(em);
  em.appendChild(span2);

  let i = 0;
  let phase = 1; // 1 = line1, 2 = pause, 3 = line2

  function type() {
    if (phase === 1) {
      if (i < line1.length) {
        span1.textContent = line1.slice(0, i + 1);
        i++;
        setTimeout(type, 45 + Math.random() * 35);
      } else {
        span1.appendChild(cursor);
        phase = 2;
        i = 0;
        setTimeout(type, 600);
      }
    } else if (phase === 2) {
      cursor.remove();
      phase = 3;
      type();
    } else if (phase === 3) {
      if (i < line2.length) {
        span2.textContent = line2.slice(0, i + 1);
        i++;
        setTimeout(type, 45 + Math.random() * 35);
      } else {
        span2.appendChild(cursor);
      }
    }
  }

  setTimeout(type, 400);
})();

// -------------------------------------------
// COUNT-UP ANIMATION — Proof Bar Numbers
// -------------------------------------------
(function initCountUp() {
  const proofValues = document.querySelectorAll('.proof-value');
  if (!proofValues.length) return;

  const countObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const text = el.textContent.trim();
      countObserver.unobserve(el);

      // Parse the target value
      const match = text.match(/^([\d,]+\.?\d*)/);
      if (!match) return;

      const suffix = text.replace(match[0], ''); // e.g., "+", "/5", "%"
      const hasComma = match[0].includes(',');
      const target = parseFloat(match[0].replace(/,/g, ''));
      const isDecimal = match[0].includes('.');
      const duration = 2000;
      const startTime = performance.now();

      el.classList.add('counting');

      function animate(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = eased * target;

        if (isDecimal) {
          el.textContent = current.toFixed(1) + suffix;
        } else if (hasComma) {
          el.textContent = Math.floor(current).toLocaleString() + suffix;
        } else {
          el.textContent = Math.floor(current) + suffix;
        }

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          // Restore original text exactly
          el.textContent = text;
          el.classList.remove('counting');
        }
      }

      requestAnimationFrame(animate);
    });
  }, { threshold: 0.5 });

  proofValues.forEach(el => countObserver.observe(el));
})();

// -------------------------------------------
// 3D TILT ON EVIDENCE CARDS — Mouse parallax
// -------------------------------------------
(function initCardTilt() {
  const heroVisual = document.querySelector('.hero-visual');
  if (!heroVisual || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const cards = heroVisual.querySelectorAll('.evidence-card');

  heroVisual.addEventListener('mousemove', (e) => {
    const rect = heroVisual.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;  // -0.5 to 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5;

    cards.forEach((card, i) => {
      const intensity = (i + 1) * 3;
      const rotateX = -y * intensity;
      const rotateY = x * intensity;
      const translateZ = (i + 1) * 5;
      card.style.transform = `rotate(${[-3, 2, -1][i] || 0}deg) perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(${translateZ}px)`;
    });
  });

  heroVisual.addEventListener('mouseleave', () => {
    cards.forEach((card, i) => {
      card.style.transform = '';
    });
  });
})();

// -------------------------------------------
// FLOATING PARTICLES — Dust motes / paper fibers
// -------------------------------------------
(function initParticles() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (window.innerWidth < 768) return; // Skip on mobile for performance

  const canvas = document.createElement('canvas');
  canvas.className = 'particles-canvas';
  document.body.prepend(canvas);
  const ctx = canvas.getContext('2d');

  let w, h;
  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  const particles = [];
  const count = 40;

  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * w,
      y: Math.random() * h,
      size: Math.random() * 2 + 0.5,
      speedX: (Math.random() - 0.5) * 0.3,
      speedY: Math.random() * 0.2 + 0.05,
      opacity: Math.random() * 0.3 + 0.05,
      drift: Math.random() * Math.PI * 2,
    });
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);
    particles.forEach(p => {
      p.x += p.speedX + Math.sin(p.drift) * 0.1;
      p.y += p.speedY;
      p.drift += 0.005;

      if (p.y > h + 10) { p.y = -10; p.x = Math.random() * w; }
      if (p.x > w + 10) p.x = -10;
      if (p.x < -10) p.x = w + 10;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(201, 168, 76, ${p.opacity})`;
      ctx.fill();
    });
    requestAnimationFrame(draw);
  }
  draw();
})();

// -------------------------------------------
// PARALLAX BACKGROUND — Subtle depth on scroll
// -------------------------------------------
(function initParallax() {
  const hero = document.querySelector('.hero');
  if (!hero || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (y > window.innerHeight) return; // Don't compute past hero
    hero.style.setProperty('--parallax-y', `${y * 0.3}px`);
  }, { passive: true });
})();

// -------------------------------------------
// MAGNETIC BUTTONS — Subtle pull toward cursor
// -------------------------------------------
(function initMagneticButtons() {
  if (window.innerWidth < 900) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  document.querySelectorAll('.btn-primary.btn-large').forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px) translateY(-1px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });
})();

// -------------------------------------------
// TEXT SCRAMBLE — Section labels on scroll
// -------------------------------------------
(function initTextScramble() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#@$%';
  const labels = document.querySelectorAll('.section-label');

  const scrambleObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      scrambleObserver.unobserve(entry.target);

      const el = entry.target;
      const original = el.textContent;
      let iteration = 0;

      const interval = setInterval(() => {
        el.textContent = original
          .split('')
          .map((char, i) => {
            if (char === ' ') return ' ';
            if (i < iteration) return original[i];
            return chars[Math.floor(Math.random() * chars.length)];
          })
          .join('');

        iteration += 1 / 2;
        if (iteration >= original.length) {
          el.textContent = original;
          clearInterval(interval);
        }
      }, 40);
    });
  }, { threshold: 0.5 });

  labels.forEach(el => scrambleObserver.observe(el));
})();

// -------------------------------------------
// Universal Email Form Handler
// -------------------------------------------
function handleEmailForm(form) {
  if (!form) return;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const input = form.querySelector('input[type="email"]');
    const btn = form.querySelector('button');
    const email = input.value.trim();
    if (!email) return;

    const originalText = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Sending...';

    try {
      const res = await fetch(CONFIG.emailEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ email, source: form.id || 'unknown' }),
      });

      if (res.ok) {
        btn.textContent = "Check Your Inbox to Verify!";
        btn.style.fontSize = '.85rem';
        input.value = '';
        input.placeholder = 'Verification email sent!';
        // Fire Meta Pixel lead event
        if (typeof fbq === 'function') fbq('track', 'Lead');
        // Close exit popup if this form is inside it
        const popup = document.getElementById('exit-popup');
        if (popup && popup.contains(form)) {
          setTimeout(() => popup.classList.remove('show'), 2000);
        }
        setTimeout(() => { btn.textContent = originalText; btn.disabled = false; }, 4000);
      } else {
        throw new Error('Failed');
      }
    } catch {
      btn.textContent = 'Try Again';
      btn.disabled = false;
      setTimeout(() => { btn.textContent = originalText; }, 2000);
    }
  });
}

// Attach to all email forms (index + gift page)
handleEmailForm(document.getElementById('email-form'));
handleEmailForm(document.getElementById('exit-email-form'));
handleEmailForm(document.getElementById('gift-email-form'));

// -------------------------------------------
// Stripe Embedded Checkout
// -------------------------------------------
let stripeInstance = null;
let checkoutInstance = null;

function getStripe() {
  if (!stripeInstance && typeof Stripe !== 'undefined') {
    // Use publishable key — set this to your real pk_live_ key
    stripeInstance = Stripe(CONFIG.stripePublishableKey || 'pk_live_placeholder');
  }
  return stripeInstance;
}

async function openEmbeddedCheckout(plan) {
  const overlay = document.getElementById('checkout-overlay');
  const container = document.getElementById('checkout-container');
  const loading = document.getElementById('checkout-loading');

  if (!overlay || !container) return fallbackCheckout(plan);

  // Show modal with loading state
  overlay.classList.add('show');
  loading.classList.remove('hidden');
  container.innerHTML = '';
  document.body.style.overflow = 'hidden';

  // Fire Meta Pixel
  if (typeof fbq === 'function') fbq('track', 'InitiateCheckout', { content_name: plan });

  try {
    // Create checkout session via our API
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan }),
    });
    const data = await res.json();

    // If server returns redirect mode (no Stripe secret key configured), fall back
    if (data.mode === 'redirect' && data.url) {
      overlay.classList.remove('show');
      document.body.style.overflow = '';
      window.location.href = data.url;
      return;
    }

    // Mount embedded checkout
    const stripe = getStripe();
    if (!stripe) {
      throw new Error('Stripe.js not loaded');
    }

    // Destroy previous instance if exists
    if (checkoutInstance) {
      checkoutInstance.destroy();
    }

    loading.classList.add('hidden');

    checkoutInstance = await stripe.createEmbeddedCheckoutPage({
      fetchClientSecret: () => Promise.resolve(data.clientSecret),
    });

    checkoutInstance.mount('#checkout-container');
  } catch (err) {
    console.error('[CHECKOUT]', err);
    overlay.classList.remove('show');
    document.body.style.overflow = '';
    fallbackCheckout(plan);
  }
}

function fallbackCheckout(plan) {
  const url = CONFIG['stripe' + plan.charAt(0).toUpperCase() + plan.slice(1)];
  if (url && !url.includes('YOUR_') && !url.includes('placeholder')) {
    window.location.href = url;
  } else {
    const cta = document.getElementById('cta') || document.getElementById('gift-email-form');
    if (cta) cta.scrollIntoView({ behavior: 'smooth' });
    else window.location.href = '/#cta';
  }
}

// Close checkout modal
(function initCheckoutModal() {
  const overlay = document.getElementById('checkout-overlay');
  const closeBtn = document.getElementById('checkout-close');

  function closeCheckout() {
    if (overlay) overlay.classList.remove('show');
    document.body.style.overflow = '';
    if (checkoutInstance) {
      checkoutInstance.destroy();
      checkoutInstance = null;
    }
  }

  if (closeBtn) closeBtn.addEventListener('click', closeCheckout);
  if (overlay) overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeCheckout();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay?.classList.contains('show')) closeCheckout();
  });
})();

// Attach to all checkout buttons
document.querySelectorAll('[data-checkout]').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    const plan = btn.dataset.checkout;
    openEmbeddedCheckout(plan);
  });
});

// -------------------------------------------
// Smooth scroll for anchor links
// -------------------------------------------
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', (e) => {
    const href = link.getAttribute('href');
    if (href === '#') return;
    const target = document.querySelector(href);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// -------------------------------------------
// URGENCY: Mother's Day Countdown Timer
// -------------------------------------------
const countdownEl = document.getElementById('countdown');

function updateCountdown() {
  if (!countdownEl) return;
  const now = new Date();
  const diff = CONFIG.urgencyDeadline - now;

  if (diff <= 0) {
    countdownEl.textContent = 'LAST CHANCE';
    return;
  }

  const days = Math.floor(diff / 86400000);
  const hrs  = Math.floor((diff % 86400000) / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);

  if (days > 0) {
    countdownEl.textContent = `${days}d ${hrs}h left`;
  } else {
    countdownEl.textContent = `${hrs}h ${mins}m left`;
  }
}

updateCountdown();
setInterval(updateCountdown, 60000);

// -------------------------------------------
// STICKY MOBILE CTA — show after scrolling past hero or gift-hero
// -------------------------------------------
const mobileCta = document.getElementById('mobile-cta');
const heroSection = document.querySelector('.hero') || document.querySelector('.gift-hero');

if (mobileCta && heroSection) {
  const mobileObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      mobileCta.classList.toggle('visible', !entry.isIntersecting);
    });
  }, { threshold: 0 });
  mobileObserver.observe(heroSection);
}

// -------------------------------------------
// EXIT INTENT POPUP — desktop + mobile
// -------------------------------------------
const exitPopup = document.getElementById('exit-popup');
let exitPopupShown = false;

function showExitPopup() {
  if (exitPopupShown || sessionStorage.getItem('exitShown') || !exitPopup) return;
  exitPopup.classList.add('show');
  exitPopupShown = true;
  sessionStorage.setItem('exitShown', '1');
}

if (exitPopup) {
  // Desktop: mouse leaves viewport through top
  document.addEventListener('mouseleave', (e) => {
    if (e.clientY < 10) showExitPopup();
  });

  // Mobile: fire after 45 seconds if user hasn't interacted with email form
  if (window.innerWidth < 900) {
    setTimeout(() => {
      const emailForm = document.getElementById('email-form') || document.getElementById('gift-email-form');
      const alreadySubmitted = emailForm?.querySelector('button')?.disabled;
      if (!alreadySubmitted) showExitPopup();
    }, 45000);
  }

  // Close on overlay click
  exitPopup.addEventListener('click', (e) => {
    if (e.target === exitPopup) exitPopup.classList.remove('show');
  });

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') exitPopup.classList.remove('show');
  });
}

// -------------------------------------------
// Hero evidence cards — aria-hidden for screen readers
// -------------------------------------------
const evidenceStack = document.querySelector('.evidence-stack');
if (evidenceStack) evidenceStack.setAttribute('aria-hidden', 'true');
