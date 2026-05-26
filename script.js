/* ============================================
   ZETASHIFT LABS — Interactive JavaScript
   Navigation, Animations, Forms, Particles
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initParticles();
    initScrollReveal();
    initCounterAnimation();
    initTestimonials();
    initContactForm();
    initFileUpload();
    initCharCounter();
    initSmoothScrolling();
    initTypingEffect();
});

/* ============================================
   NAVIGATION
   ============================================ */
function initNavigation() {
    const navbar = document.getElementById('navbar');
    const navToggle = document.getElementById('nav-toggle');
    const navLinks = document.getElementById('nav-links');
    const allNavLinks = document.querySelectorAll('.nav-link');

    // Scroll effect
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;

        if (currentScroll > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        lastScroll = currentScroll;
    });

    // Mobile toggle
    navToggle.addEventListener('click', () => {
        navToggle.classList.toggle('open');
        navLinks.classList.toggle('open');
        document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
    });

    // Close mobile nav on link click
    allNavLinks.forEach(link => {
        link.addEventListener('click', () => {
            navToggle.classList.remove('open');
            navLinks.classList.remove('open');
            document.body.style.overflow = '';
        });
    });

    // Active link on scroll
    const sections = document.querySelectorAll('section[id]');
    window.addEventListener('scroll', () => {
        const scrollY = window.pageYOffset + 100;
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            const navLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);

            if (navLink && scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
                allNavLinks.forEach(l => l.classList.remove('active'));
                navLink.classList.add('active');
            }
        });
    });
}

/* ============================================
   HERO PARTICLES
   ============================================ */
function initParticles() {
    const container = document.getElementById('hero-particles');
    if (!container) return;

    const particleCount = 30;

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 4 + 's';
        particle.style.animationDuration = (3 + Math.random() * 3) + 's';

        // Randomize color
        const colors = ['var(--accent-primary)', 'var(--accent-secondary)', 'var(--accent-tertiary)'];
        particle.style.background = colors[Math.floor(Math.random() * colors.length)];
        particle.style.width = (2 + Math.random() * 3) + 'px';
        particle.style.height = particle.style.width;

        container.appendChild(particle);
    }
}

/* ============================================
   SCROLL REVEAL
   ============================================ */
function initScrollReveal() {
    const revealElements = document.querySelectorAll(
        '.service-card, .about-grid, .portfolio-card, .testimonial-card, ' +
        '.section-header, .contact-grid, .footer-grid'
    );

    revealElements.forEach(el => el.classList.add('reveal'));

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -60px 0px'
    });

    revealElements.forEach(el => observer.observe(el));
}

/* ============================================
   COUNTER ANIMATION
   ============================================ */
function initCounterAnimation() {
    const counters = document.querySelectorAll('.stat-number');
    let animated = false;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !animated) {
                animated = true;
                counters.forEach(counter => {
                    const target = parseInt(counter.getAttribute('data-count'));
                    const duration = 2000;
                    const startTime = performance.now();

                    function updateCounter(currentTime) {
                        const elapsed = currentTime - startTime;
                        const progress = Math.min(elapsed / duration, 1);

                        // Ease out quad
                        const eased = 1 - (1 - progress) * (1 - progress);
                        const current = Math.round(eased * target);

                        counter.textContent = current;

                        if (progress < 1) {
                            requestAnimationFrame(updateCounter);
                        }
                    }

                    requestAnimationFrame(updateCounter);
                });
            }
        });
    }, { threshold: 0.5 });

    const statsSection = document.getElementById('hero-stats');
    if (statsSection) observer.observe(statsSection);
}

/* ============================================
   TESTIMONIALS CAROUSEL
   ============================================ */
function initTestimonials() {
    const track = document.getElementById('testimonials-track');
    const prevBtn = document.getElementById('testimonial-prev');
    const nextBtn = document.getElementById('testimonial-next');
    const dots = document.querySelectorAll('#testimonial-dots .dot');

    if (!track || !prevBtn || !nextBtn) return;

    let currentIndex = 0;
    const cards = track.querySelectorAll('.testimonial-card');
    const totalCards = cards.length;

    function getCardsPerView() {
        if (window.innerWidth <= 768) return 1;
        if (window.innerWidth <= 1024) return 2;
        return 3;
    }

    function updateCarousel() {
        const cardsPerView = getCardsPerView();
        const maxIndex = Math.max(0, totalCards - cardsPerView);
        currentIndex = Math.min(currentIndex, maxIndex);

        const gap = 24;
        const cardWidth = track.parentElement.offsetWidth / cardsPerView - (gap * (cardsPerView - 1) / cardsPerView);
        const offset = currentIndex * (cardWidth + gap);

        track.style.transform = `translateX(-${offset}px)`;

        // Update dots
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === currentIndex);
        });
    }

    prevBtn.addEventListener('click', () => {
        if (currentIndex > 0) {
            currentIndex--;
            updateCarousel();
        }
    });

    nextBtn.addEventListener('click', () => {
        const cardsPerView = getCardsPerView();
        const maxIndex = Math.max(0, totalCards - cardsPerView);
        if (currentIndex < maxIndex) {
            currentIndex++;
            updateCarousel();
        }
    });

    dots.forEach((dot, i) => {
        dot.addEventListener('click', () => {
            currentIndex = i;
            updateCarousel();
        });
    });

    window.addEventListener('resize', updateCarousel);
    updateCarousel();

    // Auto-play
    let autoPlay = setInterval(() => {
        const cardsPerView = getCardsPerView();
        const maxIndex = Math.max(0, totalCards - cardsPerView);
        currentIndex = currentIndex >= maxIndex ? 0 : currentIndex + 1;
        updateCarousel();
    }, 5000);

    track.parentElement.addEventListener('mouseenter', () => clearInterval(autoPlay));
    track.parentElement.addEventListener('mouseleave', () => {
        autoPlay = setInterval(() => {
            const cardsPerView = getCardsPerView();
            const maxIndex = Math.max(0, totalCards - cardsPerView);
            currentIndex = currentIndex >= maxIndex ? 0 : currentIndex + 1;
            updateCarousel();
        }, 5000);
    });
}

/* ============================================
   MULTI-STEP CONTACT FORM
   ============================================ */
let currentStep = 1;

function goToStep(step) {
    // Validate current step before going forward
    if (step > currentStep) {
        if (!validateStep(currentStep)) return;
    }

    // Update step visibility
    document.querySelectorAll('.form-step').forEach(s => s.classList.remove('active'));
    const targetStep = document.getElementById(`form-step-${step}`);
    if (targetStep) targetStep.classList.add('active');

    // Update progress indicator
    document.querySelectorAll('.progress-step').forEach(ps => {
        const psStep = parseInt(ps.getAttribute('data-step'));
        ps.classList.remove('active', 'completed');
        if (psStep === step) {
            ps.classList.add('active');
        } else if (psStep < step) {
            ps.classList.add('completed');
        }
    });

    // Update progress lines
    const line1 = document.getElementById('progress-line-1');
    const line2 = document.getElementById('progress-line-2');
    if (line1) line1.classList.toggle('filled', step >= 2);
    if (line2) line2.classList.toggle('filled', step >= 3);

    currentStep = step;

    // Scroll form into view
    document.querySelector('.contact-form-wrapper').scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
    });
}

function validateStep(step) {
    clearErrors();

    if (step === 1) {
        let valid = true;
        const name = document.getElementById('name');
        const email = document.getElementById('email');

        if (!name.value.trim()) {
            showError('name', 'name-error');
            valid = false;
        }

        if (!email.value.trim() || !isValidEmail(email.value)) {
            showError('email', 'email-error');
            valid = false;
        }

        return valid;
    }

    if (step === 2) {
        let valid = true;
        const checkedServices = document.querySelectorAll('input[name="services"]:checked');
        const budget = document.getElementById('budget');
        const timeline = document.getElementById('timeline');

        if (checkedServices.length === 0) {
            document.getElementById('services-error').classList.add('visible');
            valid = false;
        }

        if (!budget.value) {
            showError('budget', 'budget-error');
            valid = false;
        }

        if (!timeline.value) {
            showError('timeline', 'timeline-error');
            valid = false;
        }

        return valid;
    }

    if (step === 3) {
        let valid = true;
        const projectTitle = document.getElementById('project-title');
        const message = document.getElementById('message');

        if (!projectTitle.value.trim()) {
            showError('project-title', 'project-title-error');
            valid = false;
        }

        if (!message.value.trim()) {
            showError('message', 'message-error');
            valid = false;
        }

        return valid;
    }

    return true;
}

function showError(inputId, errorId) {
    const input = document.getElementById(inputId);
    const error = document.getElementById(errorId);
    if (input) input.classList.add('error');
    if (error) error.classList.add('visible');
}

function clearErrors() {
    document.querySelectorAll('.form-input.error').forEach(el => el.classList.remove('error'));
    document.querySelectorAll('.form-error.visible').forEach(el => el.classList.remove('visible'));
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/* ============================================
   GOOGLE SHEETS CONFIGURATION
   ============================================
   To connect to Google Sheets:
   1. Create a Google Sheet
   2. Go to Extensions > Apps Script
   3. Paste the Apps Script code (see google-apps-script.js in project root)
   4. Deploy as Web App (Execute as: Me, Access: Anyone)
   5. Paste the deployment URL below
   ============================================ */
const GOOGLE_SHEETS_URL = 'https://script.google.com/macros/s/AKfycbyiS85UgzatOHBgddCcJoTR7uodZQ-cJbjWeaP5heFQ1yVZC5ubIKkqPgShqm61ZD0mGg/exec'; // <-- Paste your Apps Script Web App URL here

function initContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (!validateStep(3)) return;

        const submitBtn = document.getElementById('contact-submit');
        const btnText = submitBtn.querySelector('span');
        const btnArrow = submitBtn.querySelector('.btn-arrow');
        const originalText = btnText.textContent;

        // Collect all form data
        const formData = {
            timestamp: new Date().toISOString(),
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            company: document.getElementById('company').value,
            services: Array.from(document.querySelectorAll('input[name="services"]:checked')).map(cb => cb.value).join(', '),
            budget: document.getElementById('budget').value,
            timeline: document.getElementById('timeline').value,
            projectTitle: document.getElementById('project-title').value,
            message: document.getElementById('message').value,
            referenceLink: document.getElementById('reference-link').value,
        };

        // Show loading state
        submitBtn.disabled = true;
        btnText.textContent = 'Submitting...';
        if (btnArrow) btnArrow.style.display = 'none';
        submitBtn.classList.add('btn-loading');

        try {
            if (GOOGLE_SHEETS_URL) {
                // Send to Google Sheets
                const response = await fetch(GOOGLE_SHEETS_URL, {
                    method: 'POST',
                    mode: 'no-cors', // Apps Script requires no-cors
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData),
                });

                console.log('✅ Form data sent to Google Sheets');
            } else {
                // Fallback: log to console if URL not configured
                console.log('📧 Form submission data (Google Sheets URL not configured):', formData);
                console.log('💡 To save data, configure GOOGLE_SHEETS_URL in script.js');
                // Simulate network delay for demo
                await new Promise(resolve => setTimeout(resolve, 1000));
            }

            // Show success state
            document.querySelectorAll('.form-step').forEach(s => s.classList.remove('active'));
            document.querySelector('.form-progress').style.display = 'none';
            document.getElementById('form-success').classList.add('active');

        } catch (error) {
            console.error('❌ Submission error:', error);
            showToast('Something went wrong. Please try again or email us directly.', 'error');
        } finally {
            // Reset button state
            submitBtn.disabled = false;
            btnText.textContent = originalText;
            if (btnArrow) btnArrow.style.display = '';
            submitBtn.classList.remove('btn-loading');
        }
    });

    // Remove error styling on input
    form.querySelectorAll('.form-input').forEach(input => {
        input.addEventListener('input', () => {
            input.classList.remove('error');
            const errorEl = input.parentElement.querySelector('.form-error');
            if (errorEl) errorEl.classList.remove('visible');
        });
    });

    // Remove service error on checkbox change
    document.querySelectorAll('input[name="services"]').forEach(cb => {
        cb.addEventListener('change', () => {
            const servicesError = document.getElementById('services-error');
            if (servicesError) servicesError.classList.remove('visible');
        });
    });
}

/* ============================================
   TOAST NOTIFICATION
   ============================================ */
function showToast(message, type = 'info') {
    // Remove existing toast
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <span class="toast-message">${message}</span>
        <button class="toast-close" onclick="this.parentElement.remove()">✕</button>
    `;
    document.body.appendChild(toast);

    // Trigger animation
    requestAnimationFrame(() => toast.classList.add('toast-visible'));

    // Auto-remove after 6 seconds
    setTimeout(() => {
        toast.classList.remove('toast-visible');
        setTimeout(() => toast.remove(), 300);
    }, 6000);
}

function resetForm() {
    const form = document.getElementById('contact-form');
    if (form) form.reset();

    // Reset file list
    const fileList = document.getElementById('file-list');
    if (fileList) fileList.innerHTML = '';
    uploadedFiles = [];

    // Reset char counter
    const charCount = document.getElementById('char-count');
    if (charCount) charCount.textContent = '0';

    // Reset to step 1
    document.querySelector('.form-progress').style.display = 'flex';
    document.getElementById('form-success').classList.remove('active');
    currentStep = 1;
    goToStep(1);
    clearErrors();
}

/* ============================================
   FILE UPLOAD
   ============================================ */
let uploadedFiles = [];

function initFileUpload() {
    const uploadArea = document.getElementById('file-upload-area');
    const fileInput = document.getElementById('file-input');
    const fileList = document.getElementById('file-list');

    if (!uploadArea || !fileInput) return;

    // Click to upload
    uploadArea.addEventListener('click', () => fileInput.click());

    // Drag and drop
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        handleFiles(e.dataTransfer.files);
    });

    // File input change
    fileInput.addEventListener('change', (e) => {
        handleFiles(e.target.files);
    });
}

function handleFiles(files) {
    const fileList = document.getElementById('file-list');
    const maxSize = 10 * 1024 * 1024; // 10MB

    Array.from(files).forEach(file => {
        if (file.size > maxSize) {
            alert(`"${file.name}" exceeds the 10MB limit.`);
            return;
        }

        if (uploadedFiles.some(f => f.name === file.name)) return;

        uploadedFiles.push(file);
        renderFileItem(file, fileList);
    });
}

function renderFileItem(file, container) {
    const item = document.createElement('div');
    item.className = 'file-item';
    item.innerHTML = `
        <div class="file-item-info">
            <span class="file-item-name">${file.name}</span>
            <span class="file-item-size">${formatFileSize(file.size)}</span>
        </div>
        <button type="button" class="file-remove" onclick="removeFile('${file.name}', this)" aria-label="Remove file">✕</button>
    `;
    container.appendChild(item);
}

function removeFile(fileName, button) {
    uploadedFiles = uploadedFiles.filter(f => f.name !== fileName);
    button.closest('.file-item').remove();
}

function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
}

/* ============================================
   CHARACTER COUNTER
   ============================================ */
function initCharCounter() {
    const message = document.getElementById('message');
    const charCount = document.getElementById('char-count');

    if (!message || !charCount) return;

    message.addEventListener('input', () => {
        const length = message.value.length;
        charCount.textContent = length;

        if (length > 2000) {
            charCount.style.color = 'var(--accent-tertiary)';
            message.value = message.value.substring(0, 2000);
            charCount.textContent = '2000';
        } else if (length > 1800) {
            charCount.style.color = '#fbbf24';
        } else {
            charCount.style.color = 'var(--text-muted)';
        }
    });
}

/* ============================================
   SMOOTH SCROLLING
   ============================================ */
function initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#') return;

            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

/* ============================================
   TYPING EFFECT FOR CODE BLOCK
   ============================================ */
function initTypingEffect() {
    const codeBlock = document.querySelector('.code-body code');
    if (!codeBlock) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                codeBlock.style.opacity = '0';
                setTimeout(() => {
                    codeBlock.style.transition = 'opacity 0.5s ease';
                    codeBlock.style.opacity = '1';
                }, 200);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });

    observer.observe(codeBlock);
}
