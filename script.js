/* ============================================
   ZETASHIFT LABS — Interactive JavaScript
   Navigation, Animations, Forms, Particles
   ============================================ */

// Track session visit start time for duration analytics
const SITE_VISIT_START = Date.now();

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
    initAnalyticsEvents();
    initPlayStoreDirectLauncher();
    initSolveCraftQR();
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

    return `mailto:support@zetashiftlabs.com?subject=${subject}&body=${encodeURIComponent(body)}`;
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

/**
 * POSTs the payload and only resolves if the server explicitly reports success.
 * Sent as text/plain so the browser treats it as a "simple" request (no CORS preflight)
 * while still letting us read the JSON response.
 */
async function submitToEndpoint(payload) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 45000);
    try {
        const res = await fetch(GOOGLE_SHEETS_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify(payload),
            signal: controller.signal,
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        let result;
        try {
            result = await res.json();
        } catch (_) {
            throw new Error('Unreadable server response');
        }

        if (result.status !== 'success') {
            const err = new Error(result.message || 'Submission rejected');
            // Only surface server messages that are meant for visitors
            if (result.status === 'invalid' || result.status === 'rate_limited') {
                err.userMessage = result.message;
            }
            throw err;
        }
        return result;
    } finally {
        clearTimeout(timer);
    }
}

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.setAttribute('role', 'alert');
    toast.textContent = message;
    Object.assign(toast.style, {
        position: 'fixed',
        left: '50%',
        bottom: '24px',
        transform: 'translateX(-50%)',
        maxWidth: 'min(92vw, 480px)',
        padding: '14px 18px',
        borderRadius: '12px',
        background: type === 'error' ? '#7f1d1d' : '#1e293b',
        color: '#fff',
        fontSize: '14px',
        lineHeight: '1.5',
        boxShadow: '0 12px 32px rgba(0,0,0,0.4)',
        zIndex: '9999',
    });
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 8000);
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

            // Calculate visitor duration & analytics context
            const elapsedSeconds = Math.round((Date.now() - SITE_VISIT_START) / 1000);
            const dwellMinutes = Math.floor(elapsedSeconds / 60);
            const dwellSecs = elapsedSeconds % 60;
            const timeOnSiteFormatted = dwellMinutes > 0 ? `${dwellMinutes}m ${dwellSecs}s` : `${dwellSecs}s`;
            const referrerInfo = document.referrer || 'Direct visit';
            const screenInfo = `${window.innerWidth}x${window.innerHeight}`;

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
                timeOnSite: timeOnSiteFormatted,
                referrer: referrerInfo,
                device: screenInfo,
                honeypot: honeypot,
                attachments: attachments,
            };

            if (GOOGLE_SHEETS_URL) {
                // Send to Google Sheets & Drive; throws unless the server confirms success
                await submitToEndpoint(formData);
            } else {
                console.log('📧 Form submission data (Google Sheets URL not configured):', formData);
                const mailtoLink = buildMailtoLink(formData);
                window.location.href = mailtoLink;
                await new Promise(resolve => setTimeout(resolve, 600));
            }

            // Show success state
            document.getElementById('form-success').classList.add('active');

            // Log event in Google Analytics
            if (typeof gtag === 'function') {
                gtag('event', 'generate_lead', {
                    event_category: 'Contact',
                    event_label: formData.inquiryType || 'General Inquiry',
                    inquiry_type: formData.inquiryType || 'General'
                });
            }

            // Tag Clarity recordings with non-identifying context (privacy: no name/email sent)
            if (typeof clarity === 'function') {
                // No name/email is sent to Clarity (privacy): only non-identifying tags
                clarity('set', 'inquiry_type', formData.inquiryType || 'General');
                clarity('set', 'time_on_site', timeOnSiteFormatted);
                clarity('event', 'lead_form_submitted');
            }

        } catch (error) {
            console.error('❌ Submission error:', error);
            showToast(error.userMessage || 'We couldn’t send your message. Please try again, or email us directly at support@zetashiftlabs.com', 'error');
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
        // Reset so selecting the same file again after removing it still fires 'change'
        fileInput.value = '';
    });
}

function handleFiles(files) {
    const fileList = document.getElementById('file-list');
    const maxSize = 5 * 1024 * 1024; // 5MB per file (must match the server limit)
    const maxFiles = 3;

    Array.from(files).forEach(file => {
        if (uploadedFiles.length >= maxFiles) {
            showToast(`You can attach up to ${maxFiles} files.`, 'error');
            return;
        }

        if (file.size > maxSize) {
            showToast(`"${file.name}" exceeds the 5MB limit.`, 'error');
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

    const info = document.createElement('div');
    info.className = 'file-item-info';

    const name = document.createElement('span');
    name.className = 'file-item-name';
    name.textContent = file.name; // textContent avoids HTML/JS injection from filenames

    const size = document.createElement('span');
    size.className = 'file-item-size';
    size.textContent = formatFileSize(file.size);

    info.append(name, size);

    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'file-remove';
    removeBtn.textContent = '✕';
    removeBtn.setAttribute('aria-label', `Remove ${file.name}`);
    removeBtn.addEventListener('click', () => removeFile(file.name, removeBtn));

    item.append(info, removeBtn);
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

/* ============================================
   GOOGLE ANALYTICS EVENT TRACKING
   ============================================ */
function initAnalyticsEvents() {
    // Track Google Play downloads
    document.querySelectorAll('a[href*="play.google.com"]').forEach(link => {
        link.addEventListener('click', () => {
            if (typeof gtag === 'function') {
                gtag('event', 'app_download_click', {
                    event_category: 'Engagement',
                    event_label: 'SolveCraft - Google Play',
                    app_name: 'SolveCraft',
                    platform: 'Android'
                });
            }
            if (typeof clarity === 'function') {
                clarity('event', 'app_download_click');
            }
        });
    });

    // Track direct email clicks
    document.querySelectorAll('a[href^="mailto:"]').forEach(link => {
        link.addEventListener('click', () => {
            if (typeof gtag === 'function') {
                gtag('event', 'contact_click', {
                    event_category: 'Engagement',
                    event_label: link.getAttribute('href'),
                    method: 'Email'
                });
            }
            if (typeof clarity === 'function') {
                clarity('event', 'contact_email_click');
            }
        });
    });
}

/* ============================================
   GOOGLE PLAY NATIVE DIRECT APP LAUNCHER
   Launches native Play Store app on Android (market://)
   with fallback to web store for desktop/iOS
   ============================================ */
function initPlayStoreDirectLauncher() {
    const playLinks = document.querySelectorAll('a[href*="play.google.com"], [data-package]');
    const isAndroid = /android/i.test(navigator.userAgent);

    playLinks.forEach(link => {
        const pkg = link.getAttribute('data-package') || 'com.girishks.snapsolve';
        const webUrl = `https://play.google.com/store/apps/details?id=${pkg}`;
        const marketUrl = `market://details?id=${pkg}`;

        if (isAndroid) {
            // Update href directly to market:// for instant native Play Store app launch
            link.setAttribute('href', marketUrl);
        }

        link.addEventListener('click', (e) => {
            // Log in GA4
            if (typeof gtag === 'function') {
                gtag('event', 'app_download_click', {
                    event_category: 'Engagement',
                    event_label: 'SolveCraft - Google Play Direct',
                    app_name: 'SolveCraft',
                    platform: isAndroid ? 'Android-Native' : 'Web'
                });
            }

            if (isAndroid) {
                e.preventDefault();
                const start = Date.now();
                // Attempt direct native Play Store app launch
                window.location.href = marketUrl;

                // Fallback to web link if market:// handler is not installed
                setTimeout(() => {
                    if (Date.now() - start < 1800) {
                        window.location.href = webUrl;
                    }
                }, 1000);
            }
        });
    });
}

/* ============================================
   SOLVECRAFT QR SCAN CODE INTERACTION
   ============================================ */
function initSolveCraftQR() {
    const toggleBtn = document.getElementById('qr-toggle-btn');
    const popover = document.getElementById('solvecraft-qr-popover');
    const closeBtn = document.getElementById('qr-close-btn');

    if (!toggleBtn || !popover) return;

    function openQR() {
        popover.classList.add('active');
        toggleBtn.setAttribute('aria-expanded', 'true');

        if (typeof gtag === 'function') {
            gtag('event', 'qr_code_view', {
                event_category: 'Engagement',
                event_label: 'SolveCraft QR Code Scan'
            });
        }
        if (typeof clarity === 'function') {
            clarity('event', 'qr_code_view');
        }
    }

    function closeQR() {
        popover.classList.remove('active');
        toggleBtn.setAttribute('aria-expanded', 'false');
    }

    toggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (popover.classList.contains('active')) {
            closeQR();
        } else {
            openQR();
        }
    });

    if (closeBtn) {
        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            closeQR();
        });
    }

    // Close when clicking outside
    document.addEventListener('click', (e) => {
        if (!popover.contains(e.target) && !toggleBtn.contains(e.target)) {
            closeQR();
        }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && popover.classList.contains('active')) {
            closeQR();
        }
    });
}

