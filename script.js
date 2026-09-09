/* ============================================
   ZETASHIFT LABS — Interactive JavaScript
   Navigation, Animations, Forms, Particles
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initParticles();
    initScrollReveal();
    initCounterAnimation();
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
        '.service-card, .about-grid, ' +
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
   CONTACT & INQUIRY FORM
   ============================================ */
function validateForm() {
    clearErrors();
    let valid = true;

    const name = document.getElementById('name');
    const email = document.getElementById('email');
    const inquiryType = document.getElementById('inquiry-type');
    const subject = document.getElementById('subject');
    const message = document.getElementById('message');

    if (!name || !name.value.trim()) {
        showError('name', 'name-error');
        valid = false;
    }

    if (!email || !email.value.trim() || !isValidEmail(email.value)) {
        showError('email', 'email-error');
        valid = false;
    }

    if (!inquiryType || !inquiryType.value) {
        showError('inquiry-type', 'inquiry-type-error');
        valid = false;
    }

    if (!subject || !subject.value.trim()) {
        showError('subject', 'subject-error');
        valid = false;
    }

    if (!message || !message.value.trim()) {
        showError('message', 'message-error');
        valid = false;
    }

    return valid;
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
   ============================================ */
const GOOGLE_SHEETS_URL = 'https://script.google.com/macros/s/AKfycby639D3TK6EZdLglgj_ZprRquPsOSxfsgWRR2q5csoIm8oOV2s4dVSpb-Ro-WeG066mmQ/exec';

function buildMailtoLink(formData) {
    const subject = encodeURIComponent(`[${formData.inquiryType || 'Inquiry'}] ${formData.subject || 'Website Message'}`);
    const body = [
        `Name: ${formData.name || ''}`,
        `Email: ${formData.email || ''}`,
        `Inquiry Type: ${formData.inquiryType || ''}`,
        `Subject: ${formData.subject || ''}`,
        `Message: ${formData.message || ''}`,
        `Reference Link: ${formData.referenceLink || ''}`,
    ].join('\n');

    return `mailto:snapsolve.edupp@gmail.com?subject=${subject}&body=${encodeURIComponent(body)}`;
}

function readFileAsBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const result = reader.result || '';
            const base64String = result.includes(',') ? result.split(',')[1] : result;
            resolve({
                name: file.name,
                type: file.type || 'application/octet-stream',
                data: base64String,
            });
        };
        reader.onerror = error => reject(error);
        reader.readAsDataURL(file);
    });
}

function initContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        // Anti-spam Honeypot Check
        const honeypot = document.getElementById('form-botcheck')?.value || '';
        if (honeypot.trim() !== '') {
            document.getElementById('form-success').classList.add('active');
            return;
        }

        const submitBtn = document.getElementById('contact-submit');
        const btnText = submitBtn.querySelector('span');
        const btnArrow = submitBtn.querySelector('.btn-arrow');
        const originalText = btnText.textContent;

        // Show loading state
        submitBtn.disabled = true;
        btnText.textContent = uploadedFiles.length > 0 ? 'Uploading & Sending...' : 'Sending...';
        if (btnArrow) btnArrow.style.display = 'none';
        submitBtn.classList.add('btn-loading');

        try {
            // Process any attached files
            let attachments = [];
            if (uploadedFiles && uploadedFiles.length > 0) {
                attachments = await Promise.all(uploadedFiles.map(file => readFileAsBase64(file)));
            }

            // Collect all form data
            const formData = {
                timestamp: new Date().toISOString(),
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                services: document.getElementById('inquiry-type').value, // Maps to services/type in sheet
                inquiryType: document.getElementById('inquiry-type').value,
                projectTitle: document.getElementById('subject').value, // Maps to projectTitle/subject in sheet
                subject: document.getElementById('subject').value,
                message: document.getElementById('message').value,
                referenceLink: document.getElementById('reference-link')?.value || '',
                phone: '',
                company: '',
                budget: '',
                timeline: '',
                honeypot: honeypot,
                attachments: attachments,
            };

            if (GOOGLE_SHEETS_URL) {
                // Send to Google Sheets & Drive
                await fetch(GOOGLE_SHEETS_URL, {
                    method: 'POST',
                    mode: 'no-cors',
                    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                    body: JSON.stringify(formData),
                });

                console.log('✅ Form data sent to Google Sheets');
            } else {
                console.log('📧 Form submission data (Google Sheets URL not configured):', formData);
                const mailtoLink = buildMailtoLink(formData);
                window.location.href = mailtoLink;
                await new Promise(resolve => setTimeout(resolve, 600));
            }

            // Show success state
            document.getElementById('form-success').classList.add('active');

        } catch (error) {
            console.error('❌ Submission error:', error);
            showToast('Something went wrong. Please try again or email us directly at snapsolve.edupp@gmail.com', 'error');
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
            const errorEl = input.parentElement.querySelector('.form-error') || 
                            document.getElementById(`${input.id}-error`);
            if (errorEl) errorEl.classList.remove('visible');
        });
        input.addEventListener('change', () => {
            input.classList.remove('error');
            const errorEl = input.parentElement.querySelector('.form-error') || 
                            document.getElementById(`${input.id}-error`);
            if (errorEl) errorEl.classList.remove('visible');
        });
    });
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

    document.getElementById('form-success').classList.remove('active');
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
