document.addEventListener('DOMContentLoaded', () => {

    // Elements
    const header = document.getElementById('navbar');
    const hamburger = document.querySelector('.hamburger');
    const mobileMenu = document.querySelector('.mobile-menu');
    const mobileLinks = document.querySelectorAll('.mobile-link');

    // 1. Sticky Header
    if (header) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }

    // 2. Mobile Menu Toggle
    if (hamburger && mobileMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            mobileMenu.classList.toggle('open');
            document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
        });
    }

    // Close mobile menu when a link is clicked
    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            mobileMenu.classList.remove('open');
            document.body.style.overflow = '';
        });
    });

    // 3. Scroll Animations (Intersection Observer)
    const observerOptions = {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); // Only animate once
            }
        });
    }, observerOptions);

    // Target elements
    const animatedElements = document.querySelectorAll('.fade-in, .fade-in-up, .fade-in-left, .fade-in-right');
    animatedElements.forEach(el => observer.observe(el));

    // 4. Smooth Scrolling (Optional fix for fixed header offset if CSS scroll-padding isn't enough)
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const headerHeight = header ? header.offsetHeight : 0;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerHeight;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth"
                });
            }
        });
    });

    // 5. Code Typing Animation
    const codeContainer = document.getElementById('typewriter');

    if (codeContainer) {
        const codeSnippet = [
            { text: "const ", class: "code-keyword" },
            { text: "kodingin ", class: "code-variable" },
            { text: "= {\n", class: "" },
            { text: "  mission: ", class: "code-property" },
            { text: "'Digital Excellence'", class: "code-string" },
            { text: ",\n", class: "" },
            { text: "  precision: ", class: "code-property" },
            { text: "true", class: "code-keyword" },
            { text: ",\n", class: "" },
            { text: "  logic: ", class: "code-property" },
            { text: "'Every Line'", class: "code-string" },
            { text: ",\n", class: "" },
            { text: "  build: ", class: "code-property" },
            { text: "() => ", class: "code-keyword" },
            { text: "{\n", class: "" },
            { text: "    return ", class: "code-keyword" },
            { text: "'Scalable Future'", class: "code-string" },
            { text: ";\n", class: "" },
            { text: "  }\n", class: "" },
            { text: "};", class: "" }
        ];

        let i = 0;
        let charIndex = 0;
        let currentSpan = null;

        function typeCode() {
            if (i < codeSnippet.length) {
                const token = codeSnippet[i];

                if (!currentSpan) {
                    currentSpan = document.createElement('span');
                    if (token.class) currentSpan.className = token.class;
                    codeContainer.appendChild(currentSpan);
                }

                if (charIndex < token.text.length) {
                    currentSpan.textContent += token.text.charAt(charIndex);
                    charIndex++;
                    setTimeout(typeCode, Math.random() * 30 + 30); // Random typing speed
                } else {
                    i++;
                    charIndex = 0;
                    currentSpan = null;
                    setTimeout(typeCode, Math.random() * 50 + 50); // Pause between tokens
                }
            }
        }

        // Trigger on visibility
        const codeObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    typeCode();
                    codeObserver.disconnect();
                }
            });
        }, { threshold: 0.5 });

        codeObserver.observe(document.querySelector('.code-window'));
    }

    // 6. Contact Form Submission (Mock)
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = contactForm.querySelector('button');
            const originalText = btn.innerText;

            btn.innerText = 'Sending...';
            btn.disabled = true;

            // Mock API call
            setTimeout(() => {
                btn.innerText = 'Message Sent!';
                btn.style.backgroundColor = '#28a745'; // Success Green for feedback
                btn.style.borderColor = '#28a745';
                contactForm.reset();

                setTimeout(() => {
                    btn.innerText = originalText;
                    btn.disabled = false;
                    btn.style.backgroundColor = ''; // Revert to CSS default
                    btn.style.borderColor = '';
                }, 3000);
            }, 1500);
        });
    }
    // 7. Theme Toggle
    const themeToggleBtn = document.getElementById('theme-toggle');
    const currentTheme = localStorage.getItem('theme');

    if (currentTheme) {
        document.documentElement.setAttribute('data-theme', currentTheme);
    }

    if (themeToggleBtn) {
        // Set initial icon based on current theme
        const isLight = document.documentElement.getAttribute('data-theme') === 'light';
        themeToggleBtn.innerHTML = isLight ? '🌙' : '☀️';

        themeToggleBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const current = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', current);
            localStorage.setItem('theme', current);

            // update icon
            themeToggleBtn.innerHTML = current === 'light' ? '🌙' : '☀️';
        });
    }
});
