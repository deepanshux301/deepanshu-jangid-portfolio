/**
 * DEEPANSHU JANGID - PORTFOLIO INTERACTION ENGINE
 * Tech: Pure Vanilla JavaScript (ES6+)
 * Features:
 *  - Responsive mobile drawer menu & accessibility attributes
 *  - Sticky navbar scroll detection & scroll-spy active state
 *  - One-click copy-to-clipboard with floating toast feedback
 *  - Client-side accessible contact form validation & mailto dispatch
 *  - Smooth back-to-top interaction
 */

document.addEventListener('DOMContentLoaded', () => {
  // --------------------------------------------------------------------------
  // 1. Element Selectors
  // --------------------------------------------------------------------------
  const header = document.getElementById('header');
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const mobileNav = document.getElementById('mobileNav');
  const desktopNavLinks = document.querySelectorAll('.desktop-nav .nav-link');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
  const sections = document.querySelectorAll('section[id], header[id]');
  const toastEl = document.getElementById('toast');
  const backToTopBtn = document.getElementById('backToTopBtn');
  const contactForm = document.getElementById('contactForm');
  const copyEmailButtons = document.querySelectorAll(
    '.btn-copy-hero-email, .btn-copy-contact-email, .btn-copy-footer-email'
  );

  // --------------------------------------------------------------------------
  // 2. Toast Notification Utility
  // --------------------------------------------------------------------------
  let toastTimer = null;

  function showToast(message, duration = 3200) {
    if (!toastEl) return;
    toastEl.textContent = message;
    toastEl.classList.add('show');

    if (toastTimer) {
      clearTimeout(toastTimer);
    }

    toastTimer = setTimeout(() => {
      toastEl.classList.remove('show');
    }, duration);
  }

  // --------------------------------------------------------------------------
  // 3. Mobile Navigation Menu Toggle
  // --------------------------------------------------------------------------
  function toggleMobileMenu(forceClose = false) {
    if (!mobileNav || !mobileMenuBtn) return;

    const isExpanded = mobileMenuBtn.getAttribute('aria-expanded') === 'true';
    const nextState = forceClose ? false : !isExpanded;

    mobileMenuBtn.setAttribute('aria-expanded', String(nextState));

    if (nextState) {
      mobileNav.removeAttribute('hidden');
    } else {
      mobileNav.setAttribute('hidden', '');
    }
  }

  if (mobileMenuBtn && mobileNav) {
    mobileMenuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleMobileMenu();
    });

    // Close when clicking any link inside mobile navigation
    document.querySelectorAll('.mobile-nav a').forEach((link) => {
      link.addEventListener('click', () => {
        toggleMobileMenu(true);
      });
    });

    // Close on click outside
    document.addEventListener('click', (e) => {
      const isExpanded = mobileMenuBtn.getAttribute('aria-expanded') === 'true';
      if (isExpanded && !mobileNav.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
        toggleMobileMenu(true);
      }
    });

    // Close on Escape key press
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileMenuBtn.getAttribute('aria-expanded') === 'true') {
        toggleMobileMenu(true);
        mobileMenuBtn.focus();
      }
    });
  }

  // --------------------------------------------------------------------------
  // 4. Sticky Header & Scroll Spy
  // --------------------------------------------------------------------------
  function handleScroll() {
    const scrollY = window.pageYOffset || document.documentElement.scrollTop;

    // Sticky Header Glass Effect
    if (header) {
      if (scrollY > 30) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }

    // Scroll-Spy: Highlight current active section in nav
    const scrollPosition = scrollY + 120;

    sections.forEach((section) => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const sectionId = section.getAttribute('id');

      if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
        // Update Desktop Links
        desktopNavLinks.forEach((link) => {
          if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });

        // Update Mobile Links
        mobileNavLinks.forEach((link) => {
          if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }
    });

    // Back to top button visibility
    if (backToTopBtn) {
      if (scrollY > 500) {
        backToTopBtn.style.opacity = '1';
        backToTopBtn.style.pointerEvents = 'auto';
      } else {
        backToTopBtn.style.opacity = '0.7';
      }
    }
  }

  // Throttle scroll listener for smooth performance
  let isScrolling = false;
  window.addEventListener('scroll', () => {
    if (!isScrolling) {
      window.requestAnimationFrame(() => {
        handleScroll();
        isScrolling = false;
      });
      isScrolling = true;
    }
  }, { passive: true });

  // Initial call on load
  handleScroll();

  // --------------------------------------------------------------------------
  // 5. Copy Email to Clipboard
  // --------------------------------------------------------------------------
  function copyTextToClipboard(textToCopy) {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(textToCopy)
        .then(() => {
          showToast(`Copied to clipboard: ${textToCopy}`);
        })
        .catch(() => {
          fallbackCopyText(textToCopy);
        });
    } else {
      fallbackCopyText(textToCopy);
    }
  }

  function fallbackCopyText(textToCopy) {
    const textArea = document.createElement('textarea');
    textArea.value = textToCopy;
    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';
    textArea.style.top = '0';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      const successful = document.execCommand('copy');
      if (successful) {
        showToast(`Copied to clipboard: ${textToCopy}`);
      } else {
        showToast('Unable to copy. Please manually select the email.');
      }
    } catch (err) {
      showToast('Unable to copy. Please manually select the email.');
    }

    document.body.removeChild(textArea);
  }

  copyEmailButtons.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const email = btn.getAttribute('data-email') || '[deepanshu.jangid.dev@example.com]';
      copyTextToClipboard(email);
    });
  });

  // --------------------------------------------------------------------------
  // 6. Interactive Contact Form with Validation
  // --------------------------------------------------------------------------
  if (contactForm) {
    const nameInput = document.getElementById('userName');
    const emailInput = document.getElementById('userEmail');
    const subjectInput = document.getElementById('msgSubject');
    const messageInput = document.getElementById('userMessage');

    const nameError = document.getElementById('nameError');
    const emailError = document.getElementById('emailError');
    const messageError = document.getElementById('messageError');

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    function clearErrors() {
      if (nameError) nameError.textContent = '';
      if (emailError) emailError.textContent = '';
      if (messageError) messageError.textContent = '';

      if (nameInput) nameInput.classList.remove('input-error');
      if (emailInput) emailInput.classList.remove('input-error');
      if (messageInput) messageInput.classList.remove('input-error');
    }

    // Clear error dynamically when typing
    [nameInput, emailInput, messageInput].forEach((input) => {
      if (input) {
        input.addEventListener('input', () => {
          input.classList.remove('input-error');
          const errSpan = input.parentElement.querySelector('.field-error');
          if (errSpan) errSpan.textContent = '';
        });
      }
    });

    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      clearErrors();

      let isValid = true;
      const nameVal = nameInput ? nameInput.value.trim() : '';
      const emailVal = emailInput ? emailInput.value.trim() : '';
      const subjectVal = subjectInput ? subjectInput.value.trim() : 'Portfolio Inquiry';
      const messageVal = messageInput ? messageInput.value.trim() : '';

      // Validate Name
      if (!nameVal || nameVal.length < 2) {
        if (nameError) nameError.textContent = 'Please enter your name (at least 2 characters).';
        if (nameInput) nameInput.classList.add('input-error');
        isValid = false;
      }

      // Validate Email
      if (!emailVal || !emailPattern.test(emailVal)) {
        if (emailError) emailError.textContent = 'Please enter a valid email address.';
        if (emailInput) emailInput.classList.add('input-error');
        isValid = false;
      }

      // Validate Message
      if (!messageVal || messageVal.length < 10) {
        if (messageError) messageError.textContent = 'Please enter a message of at least 10 characters.';
        if (messageInput) messageInput.classList.add('input-error');
        isValid = false;
      }

      if (!isValid) {
        showToast('Please fix the errors indicated above.');
        return;
      }

      // If valid, format mailto link and provide instant feedback
      const recipient = '[deepanshu.jangid.dev@example.com]';
      const mailtoLink = `mailto:${encodeURIComponent(recipient)}?subject=${encodeURIComponent(
        subjectVal || 'Portfolio Message from ' + nameVal
      )}&body=${encodeURIComponent(
        `Name: ${nameVal}\nEmail: ${emailVal}\n\nMessage:\n${messageVal}`
      )}`;

      showToast('Opening your mail client to send message...');

      // Attempt opening mailto link
      setTimeout(() => {
        window.location.href = mailtoLink;
      }, 500);

      // Reset form
      contactForm.reset();
    });
  }

  // --------------------------------------------------------------------------
  // 7. Accessibility & Keyboard Enhancements
  // --------------------------------------------------------------------------
  // Ensure smooth scroll with sticky header offset for all anchor jumps
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (!targetId || targetId === '#') return;

      // Intercept bracketed editable placeholders gracefully
      if (targetId.includes('[')) {
        e.preventDefault();
        showToast('Editable placeholder link — replace with your live URL in index.html.');
        return;
      }

      try {
        if (targetId === '#home') {
          e.preventDefault();
          window.scrollTo({
            top: 0,
            behavior: 'smooth'
          });
          history.pushState(null, null, '#home');
          return;
        }

        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          e.preventDefault();
          const headerEl = document.getElementById('header');
          const headerHeight = headerEl ? headerEl.offsetHeight : 72;
          const elementPosition = targetElement.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerHeight - 12;

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
          history.pushState(null, null, targetId);
        }
      } catch (err) {
        // Fallback gracefully if selector is non-standard
      }
    });
  });
});
