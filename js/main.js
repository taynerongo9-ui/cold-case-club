/* ============================================
   COLD CASE CLUB — Main JS
   Wolf of Wall Street Edition: Every pixel sells.
   ============================================ */

// -------------------------------------------
// CONFIG
// -------------------------------------------
const CONFIG = {
  stripePublishableKey: 'pk_live_51THFD2GsNBzVX9j8k97GMVcvFUAzo6lRJL0pQMdfVfFBDKP1E4WFmCxyeQpz4LWfeIkzUpDetROWNV6Wt6LqHvQj00XHD9ljmq',

  // Create these in Stripe Dashboard → Payment Links, paste URLs here
  stripeMonthly: 'https://buy.stripe.com/YOUR_MONTHLY_LINK',
  stripePrepaid: 'https://buy.stripe.com/YOUR_PREPAID_LINK',
  stripeGift:    'https://buy.stripe.com/YOUR_GIFT_LINK',

  // Self-hosted email collection API (Vercel serverless function)
  emailEndpoint: '/api/subscribe',

  // Mother's Day shipping cutoff (May 5, 2026 midnight ET)
  urgencyDeadline: new Date('2026-05-05T04:00:00Z'),
};

// -------------------------------------------
// Sticky Nav — shrink on scroll
// -------------------------------------------
const nav = document.querySelector('.nav');

window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 50);
}, { passive: true });

// -------------------------------------------
// Mobile Nav Toggle
// -------------------------------------------
const navToggle = document.querySelector('.nav-toggle');
const navOverlay = document.querySelector('.nav-overlay');

if (navToggle && navOverlay) {
  navToggle.addEventListener('click', () => {
    navOverlay.classList.toggle('open');
    navToggle.textContent = navOverlay.classList.contains('open') ? '\u2715' : '\u2630';
  });
  navOverlay.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navOverlay.classList.remove('open');
      navToggle.textContent = '\u2630';
    });
  });
}

// -------------------------------------------
// FAQ Accordion
// -------------------------------------------
document.querySelectorAll('.faq-question').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = btn.parentElement;
    const wasOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
    if (!wasOpen) item.classList.add('open');
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

// Attach to all email forms
handleEmailForm(document.getElementById('email-form'));
handleEmailForm(document.getElementById('exit-email-form'));

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
      // Pre-launch: redirect to email capture instead of dead alert
      document.getElementById('cta')?.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

// -------------------------------------------
// Smooth scroll for anchor links
// -------------------------------------------
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', (e) => {
    const target = document.querySelector(link.getAttribute('href'));
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
// STICKY MOBILE CTA — show after scrolling past hero
// -------------------------------------------
const mobileCta = document.getElementById('mobile-cta');
const heroSection = document.querySelector('.hero');

if (mobileCta && heroSection) {
  const mobileObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      // Show sticky CTA when hero is NOT visible (user scrolled past)
      mobileCta.classList.toggle('visible', !entry.isIntersecting);
    });
  }, { threshold: 0 });
  mobileObserver.observe(heroSection);
}

// -------------------------------------------
// EXIT INTENT POPUP — fires once on desktop
// -------------------------------------------
const exitPopup = document.getElementById('exit-popup');
let exitPopupShown = false;

if (exitPopup) {
  // Desktop: mouse leaves viewport through top
  document.addEventListener('mouseleave', (e) => {
    if (e.clientY < 10 && !exitPopupShown && !sessionStorage.getItem('exitShown')) {
      exitPopup.classList.add('show');
      exitPopupShown = true;
      sessionStorage.setItem('exitShown', '1');
    }
  });

  // Close on overlay click (outside popup box)
  exitPopup.addEventListener('click', (e) => {
    if (e.target === exitPopup) {
      exitPopup.classList.remove('show');
    }
  });

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') exitPopup.classList.remove('show');
  });
}
