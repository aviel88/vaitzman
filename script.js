/* ── SHARED HEADER / FOOTER INJECTION ── */

const PAGES = [
  { href: 'index.html',       label: 'ראשי' },
  { href: 'menu.html',        label: 'תפריט' },
  { href: 'reservation.html', label: 'הזמנת מקום' },
  { href: 'about.html',       label: 'אודות' },
  { href: 'contact.html',     label: 'צור קשר' },
];

function getCurrentPage() {
  const path = window.location.pathname.split('/').pop() || 'index.html';
  return path;
}

function buildHeader() {
  const current = getCurrentPage();
  const navLinks = PAGES.map(p => {
    const active = (current === p.href || (current === '' && p.href === 'index.html')) ? ' class="active"' : '';
    return `<a href="${p.href}"${active}>${p.label}</a>`;
  }).join('');

  const mobileLinks = PAGES.map(p => {
    return `<a href="${p.href}">${p.label}</a>`;
  }).join('');

  return `
    <a class="header-logo" href="index.html">
      ויצמן
      <span>Weizmann Restaurant</span>
    </a>
    <nav class="main-nav" aria-label="ניווט ראשי">
      ${navLinks}
    </nav>
    <div class="header-right">
      <div class="kosher-badge">גלאט כשר<br>למהדרין</div>
      <a href="reservation.html" class="btn-reserve-header">הזמינו שולחן</a>
      <button class="hamburger" id="hamburger" aria-label="תפריט" aria-expanded="false">
        <span></span><span></span><span></span>
      </button>
    </div>
    <div class="mobile-menu" id="mobileMenu" role="dialog" aria-label="תפריט ניווט">
      ${mobileLinks}
      <a href="reservation.html" class="btn-reserve-header">הזמינו שולחן</a>
    </div>
  `;
}

function buildFooter() {
  return `
    <div class="footer-grid">
      <div class="footer-col">
        <h4>מסעדת ויצמן</h4>
        <p>מסעדה מרוקאית כשרה בנמל אשדוד.</p>
        <p>שלושה דורות של אוכל ביתי אותנטי.</p>
        <div class="footer-social">
          <a href="#" aria-label="פייסבוק"><i class="fab fa-facebook-f"></i></a>
          <a href="#" aria-label="אינסטגרם"><i class="fab fa-instagram"></i></a>
        </div>
      </div>
      <div class="footer-col">
        <h4>שעות פעילות</h4>
        <p>ראשון – חמישי: 12:00–22:30</p>
        <p>שישי ושבת: סגור</p>
      </div>
      <div class="footer-col">
        <h4>צור קשר</h4>
        <a href="tel:088522593">08-852-2593</a>
        <p>הבנאים 9, אשדוד</p>
        <p>נגיש לנכים</p>
      </div>
      <div class="footer-col">
        <h4>כשרות</h4>
        <p>גלאט כשר</p>
        <p>כשרות הרב מחפוד בד"צ יורה דעה</p>
        <p>כשרות למהדרין [בשרי]</p>
      </div>
    </div>
    <div class="footer-bottom">
      <p>© 2025 מסעדת ויצמן. כל הזכויות שמורות.</p>
      <p>הבנאים 9, אשדוד | 08-852-2593</p>
    </div>
  `;
}

function injectHeaderFooter() {
  const headerEl = document.getElementById('site-header');
  const footerEl = document.getElementById('site-footer');
  if (headerEl) headerEl.innerHTML = buildHeader();
  if (footerEl) footerEl.innerHTML = buildFooter();

  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      const open = mobileMenu.classList.toggle('open');
      hamburger.classList.toggle('open', open);
      hamburger.setAttribute('aria-expanded', open);
    });
    mobileMenu.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
      });
    });
  }
}

/* ── SCROLL ANIMATIONS ── */
function initScrollAnimations() {
  const items = document.querySelectorAll('.fade-in');
  if (!items.length) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });
  items.forEach(el => observer.observe(el));
}

/* ── RESERVATION FORM ── */
function initReservationForm() {
  const form = document.getElementById('reservationForm');
  if (!form) return;

  const successEl = document.getElementById('reservationSuccess');

  function validateField(input) {
    const group = input.closest('.form-group');
    const errMsg = group ? group.querySelector('.error-msg') : null;
    let valid = true;
    let msg = '';

    if (input.hasAttribute('required') && !input.value.trim()) {
      valid = false;
      msg = 'שדה חובה';
    } else if (input.type === 'email' && input.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value)) {
      valid = false;
      msg = 'כתובת אימייל לא תקינה';
    } else if (input.type === 'tel' && input.value && !/^[\d\-\+\(\)\s]{7,15}$/.test(input.value)) {
      valid = false;
      msg = 'מספר טלפון לא תקין';
    } else if (input.id === 'resDate' && input.value) {
      const d = new Date(input.value);
      const day = d.getDay();
      if (day === 5 || day === 6) {
        valid = false;
        msg = 'בימי שישי ושבת המסעדה סגורה. אנא בחרו תאריך בין ראשון לחמישי.';
      }
    }

    input.classList.toggle('error', !valid);
    if (errMsg) {
      errMsg.textContent = msg;
      errMsg.classList.toggle('show', !valid);
    }
    return valid;
  }

  form.querySelectorAll('input, select, textarea').forEach(input => {
    input.addEventListener('blur', () => validateField(input));
    input.addEventListener('input', () => {
      if (input.classList.contains('error')) validateField(input);
    });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let allValid = true;
    form.querySelectorAll('input, select, textarea').forEach(input => {
      if (!validateField(input)) allValid = false;
    });
    if (!allValid) return;

    form.style.display = 'none';
    if (successEl) successEl.classList.add('show');
    window.scrollTo({ top: form.closest('.reservation-section').offsetTop - 80, behavior: 'smooth' });
  });
}

/* ── CONTACT FORM ── */
function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let allValid = true;
    form.querySelectorAll('input, textarea').forEach(input => {
      if (input.hasAttribute('required') && !input.value.trim()) {
        input.classList.add('error');
        allValid = false;
      } else {
        input.classList.remove('error');
      }
    });
    if (!allValid) return;

    const btn = form.querySelector('button[type="submit"]');
    const original = btn.textContent;
    btn.textContent = 'ההודעה נשלחה! ✓';
    btn.disabled = true;
    btn.style.background = '#2d6a4f';
    setTimeout(() => {
      btn.textContent = original;
      btn.disabled = false;
      btn.style.background = '';
      form.reset();
    }, 3500);
  });
}

/* ── SET MIN DATE FOR RESERVATION ── */
function initDatePicker() {
  const dateInput = document.getElementById('resDate');
  if (!dateInput) return;
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  dateInput.min = `${yyyy}-${mm}-${dd}`;
}

/* ── INIT ── */
document.addEventListener('DOMContentLoaded', () => {
  injectHeaderFooter();
  initScrollAnimations();
  initReservationForm();
  initContactForm();
  initDatePicker();
});
