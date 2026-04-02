/* ============================================
   COLD CASE CLUB — Main JS
   Commercially Ready Edition
   ============================================ */

// -------------------------------------------
// CONFIG
// -------------------------------------------
const CONFIG = {
  // Create these in Stripe Dashboard → Payment Links, paste URLs here
  stripeMonthly: 'https://buy.stripe.com/bJefZhgEg6ep8J5790eME00',
  stripePrepaid: 'https://buy.stripe.com/6oU6oHafSbyJ0cz8d4eME01',
  stripeGift:    'https://buy.stripe.com/bJe8wPew86epe3p790eME02',

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
// Scroll Fade-In (Intersection Observer)
// -------------------------------------------
const fadeEls = document.querySelectorAll('.fade-in');

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  fadeEls.forEach(el => observer.observe(el));
} else {
  fadeEls.forEach(el => el.classList.add('visible'));
}

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
        btn.textContent = "You're In! Check Your Inbox.";
        input.value = '';
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
// Checkout Redirects
// -------------------------------------------
document.querySelectorAll('[data-checkout]').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    const plan = btn.dataset.checkout;
    const url = CONFIG['stripe' + plan.charAt(0).toUpperCase() + plan.slice(1)];

    if (url && !url.includes('YOUR_')) {
      // Fire Meta Pixel checkout event
      if (typeof fbq === 'function') fbq('track', 'InitiateCheckout', { content_name: plan });
      window.location.href = url;
    } else {
      // Pre-launch: scroll to email capture on current page
      const cta = document.getElementById('cta') || document.getElementById('gift-email-form');
      if (cta) {
        cta.scrollIntoView({ behavior: 'smooth' });
      } else {
        // Fallback: go to homepage email capture
        window.location.href = '/#cta';
      }
    }
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
