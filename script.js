/* ============================================================
   FREM — Artisanal Bakery & Patisserie
   Shared JavaScript: script.js
   Loaded by: index.html  AND  cakes.html
   ============================================================ */

/* ──────────────────────────────────────────────────────────────
   CART — localStorage-backed, shared across all pages
   ────────────────────────────────────────────────────────────── */
const CART_KEY = 'frem_cart';

const Cart = {
  /** Return current cart array from localStorage */
  get() {
    try {
      return JSON.parse(localStorage.getItem(CART_KEY)) || [];
    } catch {
      return [];
    }
  },

  /** Save cart array to localStorage */
  save(items) {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  },

  /** Add one unit of a product; merge if already in cart */
  add(product) {
    const items = this.get();
    const existing = items.find(i => i.id === product.id);
    if (existing) {
      existing.qty += 1;
    } else {
      items.push({ ...product, qty: 1 });
    }
    this.save(items);
    Cart.updateBadges();
    return existing ? existing.qty : 1;
  },

  /** Total number of items across all products */
  totalQty() {
    return this.get().reduce((sum, i) => sum + i.qty, 0);
  },

  /** Update every cart badge element on the page */
  updateBadges() {
    const qty = this.totalQty();
    document.querySelectorAll('[id^="cart-badge"]').forEach(badge => {
      if (qty > 0) {
        badge.textContent = qty > 99 ? '99+' : qty;
        badge.classList.remove('hidden');
      } else {
        badge.classList.add('hidden');
      }
    });
  },
};


/* ──────────────────────────────────────────────────────────────
   TOAST NOTIFICATION
   ────────────────────────────────────────────────────────────── */
function showToast(message) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `
    <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
    </svg>
    <span>${message}</span>`;
  container.appendChild(toast);

  // Animate in
  requestAnimationFrame(() => {
    requestAnimationFrame(() => toast.classList.add('show'));
  });

  // Animate out and remove after 2.8s
  setTimeout(() => {
    toast.classList.remove('show');
    toast.addEventListener('transitionend', () => toast.remove(), { once: true });
  }, 2800);
}


/* ──────────────────────────────────────────────────────────────
   DOM READY
   ────────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {

  /* ── 1. INITIALISE CART BADGE ─────────────────────────────── */
  Cart.updateBadges();


  /* ── 2. HEADER — Blur on scroll ──────────────────────────── */
  const header = document.getElementById('main-header');
  if (header) {
    window.addEventListener('scroll', () => {
      header.classList.toggle('header-scrolled', window.scrollY > 30);
    });
  }


  /* ── 3. MOBILE NAV ──────────────────────────────────────── */
  const mobileNav      = document.getElementById('mobile-nav');
  const mobileMenuBtn  = document.getElementById('mobile-menu-btn');
  const mobileCloseBtn = document.getElementById('mobile-close-btn');

  function openMobileNav() {
    mobileNav.classList.replace('hidden-nav', 'visible-nav');
    document.body.style.overflow = 'hidden';
  }

  function closeMobileNav() {
    mobileNav.classList.replace('visible-nav', 'hidden-nav');
    document.body.style.overflow = '';
  }

  if (mobileMenuBtn)  mobileMenuBtn.addEventListener('click', openMobileNav);
  if (mobileCloseBtn) mobileCloseBtn.addEventListener('click', closeMobileNav);
  if (mobileNav) {
    mobileNav.querySelectorAll('a').forEach(link =>
      link.addEventListener('click', closeMobileNav)
    );
  }


  /* ── 4. SCROLL REVEAL ────────────────────────────────────── */
  const revealElements = document.querySelectorAll('.reveal, .reveal-child');
  if (revealElements.length) {
    const revealObserver = new IntersectionObserver(
      entries => entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      }),
      { threshold: 0.10 }
    );
    revealElements.forEach(el => revealObserver.observe(el));
  }


  /* ── 5. SMOOTH SCROLL (same-page anchor links only) ─────── */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href   = this.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (target && header) {
        e.preventDefault();
        const top = target.getBoundingClientRect().top + window.scrollY - header.offsetHeight - 12;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });


  /* ── 6. ACTIVE NAV HIGHLIGHT ────────────────────────────── */
  // Mark the correct nav link as active based on current page/section
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';

  // Desktop + mobile nav links
  document.querySelectorAll('nav a').forEach(link => {
    const href = link.getAttribute('href') || '';
    const linkPage = href.split('/').pop().split('#')[0] || 'index.html';

    if (currentPage === 'cakes.html' && linkPage === 'cakes.html') {
      link.classList.add('nav-active');
    } else if (currentPage === 'index.html' && linkPage === 'index.html') {
      // scrollspy will handle the active link on homepage
    }
  });

  // Scrollspy (homepage only)
  if (currentPage === 'index.html' || currentPage === '') {
    const sections  = document.querySelectorAll('section[id], footer[id]');
    const navLinks  = document.querySelectorAll('nav a[href^="#"], nav a[href*="index.html#"]');

    function updateActiveLink() {
      let currentId = '';
      sections.forEach(section => {
        const sectionTop = section.offsetTop - (header ? header.offsetHeight : 80) - 60;
        if (window.scrollY >= sectionTop) currentId = section.getAttribute('id');
      });
      navLinks.forEach(link => {
        const href = link.getAttribute('href') || '';
        const id   = href.split('#')[1] || '';
        link.classList.toggle('nav-active', id === currentId);
      });
    }

    window.addEventListener('scroll', updateActiveLink);
    updateActiveLink();
  }


  /* ── 7. ADD TO CART — catalog page buttons ───────────────── */
  document.querySelectorAll('.btn-add-cart').forEach(btn => {
    btn.addEventListener('click', function () {
      const product = {
        id:    this.dataset.id,
        name:  this.dataset.name,
        price: parseFloat(this.dataset.price),
        image: this.dataset.image,
      };

      const newQty = Cart.add(product);

      // Brief "Added" state
      const original = this.innerHTML;
      this.classList.add('added');
      this.innerHTML = `
        <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
        </svg> Added!`;

      setTimeout(() => {
        this.innerHTML = original;
        this.classList.remove('added');
      }, 1400);

      showToast(`<strong>${product.name}</strong> added to cart (×${newQty})`);
    });
  });

});
