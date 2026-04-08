document.addEventListener('DOMContentLoaded', () => {
    // Register GSAP Plugins
    if (typeof gsap !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);
        initGSAP();
    }

    // Header Scroll Effect
    const header = document.querySelector('header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Mobile Menu Toggle with Close Button and Overlay
    const navToggle = document.querySelector('.nav-toggle');
    const navClose = document.querySelector('.nav-close');
    const nav = document.querySelector('nav');
    const navOverlay = document.getElementById('navOverlay');

    function openNav() {
        nav.classList.add('active');
        document.body.classList.add('nav-open');
        if (navOverlay) navOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        // Animate nav items stagger in
        if (typeof gsap !== 'undefined') {
            gsap.fromTo('nav ul li',
                { x: 40, opacity: 0 },
                { x: 0, opacity: 1, stagger: 0.06, duration: 0.4, ease: 'power2.out', delay: 0.2 }
            );
        }
    }

    function closeNav() {
        nav.classList.remove('active');
        document.body.classList.remove('nav-open');
        if (navOverlay) navOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    if (navToggle) {
        navToggle.addEventListener('click', openNav);
    }

    if (navClose) {
        navClose.addEventListener('click', closeNav);
    }

    if (navOverlay) {
        navOverlay.addEventListener('click', closeNav);
    }

    // Smooth Scrolling for Anchors
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
                // Close mobile menu if open
                closeNav();
            }
        });
    });

    function initGSAP() {
        // --- 0a. Extraordinary Heading Animation Prep ---
        const headingsToSplit = document.querySelectorAll('main h1, main h2');

        function splitTextNodes(el) {
            const fragment = document.createDocumentFragment();
            Array.from(el.childNodes).forEach(node => {
                if (node.nodeType === Node.TEXT_NODE) {
                    const text = node.nodeValue;
                    const words = text.split(/(\s+)/);
                    words.forEach(word => {
                        if (word.trim().length > 0) {
                            const mask = document.createElement('span');
                            mask.className = 'reveal-text-mask';
                            mask.style.display = 'inline-block';
                            mask.style.overflow = 'hidden';
                            mask.style.verticalAlign = 'bottom';

                            const item = document.createElement('span');
                            item.className = 'reveal-text-item';
                            item.style.display = 'inline-block';
                            item.style.willChange = 'transform, opacity';
                            item.textContent = word;

                            mask.appendChild(item);
                            fragment.appendChild(mask);
                        } else {
                            fragment.appendChild(document.createTextNode(word));
                        }
                    });
                } else if (node.nodeType === Node.ELEMENT_NODE && node.tagName !== 'BR') {
                    splitTextNodes(node);
                    fragment.appendChild(node);
                } else {
                    fragment.appendChild(node);
                }
            });
            el.innerHTML = '';
            el.appendChild(fragment);
        }

        headingsToSplit.forEach(h => splitTextNodes(h));

        gsap.set(".reveal-text-item", {
            y: "120%",
            rotate: 8,
            opacity: 0,
            transformOrigin: "bottom left",
            force3D: true
        });

        // 0. Pre-initialization: Set starting states
        gsap.set(".hero-content .section-subtitle, .hero-content p, .hero-btns .btn, .hero-btns .read-more, .reveal, .in-action-block", {
            opacity: 0,
            y: 30,
            force3D: true
        });

        // 0b. Global SVG Prep: Calculate lengths and hide all .draw-me elements
        const allDrawElements = document.querySelectorAll('.draw-me');
        allDrawElements.forEach(el => {
            try {
                const length = el.getTotalLength() || 1000;
                gsap.set(el, {
                    strokeDasharray: length,
                    strokeDashoffset: length,
                    autoAlpha: 0
                });
            } catch (e) {
                console.warn("SVG path setup failed:", e);
                gsap.set(el, { autoAlpha: 0 });
            }
        });

        // 1. Hero Entrance Animation
        const heroTl = gsap.timeline({
            defaults: { ease: "power3.out", duration: 0.8, force3D: true }
        });

        const heroDrawElements = document.querySelectorAll('#hero-svg .draw-me');

        // Start revealing the visual and drawing lines for HERO
        heroTl.to(".hero-visual", {
            autoAlpha: 1,
            y: 0,
            duration: 0.1
        }, "0")
            .to(".hero-content .section-subtitle", {
                y: 0,
                autoAlpha: 1
            }, "0.2")
            .to(".hero-content h1 .reveal-text-item", {
                y: "0%",
                rotate: 0,
                autoAlpha: 1,
                duration: 1.2,
                stagger: 0.08,
                ease: "expo.out"
            }, "-=0.5")
            // SVG Drawing sequence
            .to(heroDrawElements, {
                strokeDashoffset: 0,
                autoAlpha: 1,
                duration: 1.5,
                stagger: 0.25,
                ease: "power2.inOut"
            }, "0.5")
            .to(".hero-content p", {
                y: 0,
                autoAlpha: 1
            }, "-=1.2")
            .to(".hero-btns .btn, .hero-btns .read-more", {
                y: 0,
                autoAlpha: 1,
                stagger: 0.1,
                duration: 0.6
            }, "-=0.8");

        // 1b. Global SVG Scroll-Triggered Drawing (for non-hero SVGs)
        const otherSvgs = document.querySelectorAll('svg:not(#hero-svg)');
        otherSvgs.forEach(svg => {
            const svgDrawMe = svg.querySelectorAll('.draw-me');
            const svgText = svg.querySelectorAll('.draw-me-text');
            if (svgDrawMe.length > 0) {
                const parentReveal = svg.closest('.reveal');

                // Create a timeline for the SVG section reveal + draw
                const svgTl = gsap.timeline({
                    scrollTrigger: {
                        trigger: svg,
                        start: "top 85%",
                        toggleActions: "play none none none"
                    }
                });

                if (parentReveal) {
                    svgTl.to(parentReveal, {
                        autoAlpha: 1,
                        y: 0,
                        duration: 0.8,
                        ease: "power2.out"
                    }, "0");
                }

                svgTl.to(svgDrawMe, {
                    strokeDashoffset: 0,
                    autoAlpha: 1,
                    duration: 1.2,
                    stagger: 0.15,
                    ease: "power2.inOut"
                }, "0.2");

                if (svgText.length > 0) {
                    svgTl.to(svgText, {
                        autoAlpha: 1,
                        duration: 0.5,
                        stagger: 0.1
                    }, "-=0.5");
                }
            }
        });

        // 2. Global Scroll Reveals
        const revealElements = document.querySelectorAll('.reveal');
        revealElements.forEach((el) => {
            if (el.classList.contains('hero-visual') || el.querySelector('svg')) return;
            // Skip hero and elements containing SVGs as they have custom drawing logic
            gsap.to(el, {
                scrollTrigger: {
                    trigger: el,
                    start: "top 88%",
                    toggleActions: "play none none none"
                },
                y: 0,
                autoAlpha: 1,
                duration: 1,
                ease: "power2.out",
                force3D: true
            });
        });

        // 3. Staggered reveal for Action Blocks
        const actionBlockContainer = document.querySelector('.in-action-container');
        if (actionBlockContainer) {
            gsap.to(".in-action-block", {
                scrollTrigger: {
                    trigger: actionBlockContainer,
                    start: "top 82%"
                },
                y: 0,
                autoAlpha: 1,
                duration: 1,
                stagger: 0.2,
                ease: "power3.out",
                force3D: true
            });
        }

        // 3.5. Staggered reveal for Interactive Grid Cards (Engagement, Blog)
        const interactiveGrids = document.querySelectorAll('.u-grid-2, .minimal-grid');
        interactiveGrids.forEach(grid => {
            const cards = grid.querySelectorAll('.glass-interactive');
            if (cards.length > 0) {
                cards.forEach(c => c.classList.remove('reveal'));
                gsap.set(cards, { y: 40, opacity: 0 });
                gsap.to(cards, {
                    scrollTrigger: {
                        trigger: grid,
                        start: "top 85%"
                    },
                    y: 0,
                    opacity: 1,
                    duration: 1,
                    stagger: 0.1,
                    ease: "power3.out"
                });
            }
        });

        // 3.6. Strategic Blueprint Grid Animation (Why Choose Us)
        const blueprintSection = document.getElementById('why-us');
        if (blueprintSection) {
            const blueprintCards = blueprintSection.querySelectorAll('.blueprint-card');
            const blueprintViewport = blueprintSection.querySelector('.blueprint-viewport');
            const blueprintLabel = blueprintSection.querySelector('.technical-label');

            const blueprintTl = gsap.timeline({
                scrollTrigger: {
                    trigger: blueprintSection,
                    start: "top 75%",
                    toggleActions: "play none none none"
                }
            });

            blueprintTl.fromTo(blueprintLabel,
                { x: -20, opacity: 0 },
                { x: 0, opacity: 1, duration: 0.6, ease: "power2.out" }
            )
                .fromTo(blueprintViewport,
                    { y: 30, opacity: 0, scale: 0.98 },
                    { y: 0, opacity: 1, scale: 1, duration: 1, ease: "power3.out" },
                    "-=0.3"
                )
                .fromTo(blueprintCards,
                    { y: 50, opacity: 0, rotationX: 15 },
                    { y: 0, opacity: 1, rotationX: 0, duration: 0.8, stagger: 0.15, ease: "power4.out" },
                    "-=0.6"
                );
        }

        // 3.7. Capability Nexus Animation (Evolutionary Platform Architecture)
        const nexusSection = document.querySelector('.capability-nexus-section');
        if (nexusSection) {
            const nexusCards = nexusSection.querySelectorAll('.nexus-card');
            const nexusHeader = nexusSection.querySelector('.blueprint-header');

            const nexusTl = gsap.timeline({
                scrollTrigger: {
                    trigger: nexusSection,
                    start: "top 70%",
                    toggleActions: "play none none none"
                }
            });

            nexusTl.fromTo(nexusHeader,
                { y: 30, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }
            )
                .fromTo(nexusCards,
                    { y: 60, opacity: 0, scale: 0.95 },
                    { y: 0, opacity: 1, scale: 1, duration: 0.8, stagger: 0.12, ease: "power2.out" },
                    "-=0.4"
                );
        }

        // 4. Parallax effect for Hero components
        gsap.to(".hero::before, .hero::after", {
            scrollTrigger: {
                trigger: ".hero",
                start: "top top",
                end: "bottom top",
                scrub: 1 // Adding slight smoothing to scrub
            },
            y: 50,
            ease: "none"
        });
        // 5. Extraordinary Heading Scroll Animations
        headingsToSplit.forEach(h => {
            const items = h.querySelectorAll('.reveal-text-item');
            if (h.closest('.hero')) return; // Handled by heroTl

            gsap.to(items, {
                scrollTrigger: {
                    trigger: h,
                    start: "top 90%",
                    toggleActions: "play none none none"
                },
                y: "0%",
                rotate: 0,
                opacity: 1,
                duration: 1.2,
                stagger: 0.05,
                ease: "expo.out",
                force3D: true
            });
        });

        // 6. Service Icons Scale-Bounce Animation
        const serviceIcons = document.querySelectorAll('.minimal-item i');
        if (serviceIcons.length > 0) {
            gsap.set(serviceIcons, { scale: 0, rotation: -15 });
            serviceIcons.forEach(icon => {
                gsap.to(icon, {
                    scrollTrigger: {
                        trigger: icon.closest('.minimal-item') || icon,
                        start: "top 90%",
                        toggleActions: "play none none none"
                    },
                    scale: 1,
                    rotation: 0,
                    duration: 0.8,
                    ease: "back.out(1.7)",
                    force3D: true
                });
            });
        }

        // 7. Blog Image Reveal Animation
        const blogImages = document.querySelectorAll('.blog-img');
        if (blogImages.length > 0) {
            gsap.set(blogImages, { scale: 1.15, opacity: 0 });
            blogImages.forEach(img => {
                gsap.to(img, {
                    scrollTrigger: {
                        trigger: img.closest('.blog-card') || img,
                        start: "top 88%",
                        toggleActions: "play none none none"
                    },
                    scale: 1,
                    opacity: 1,
                    duration: 1.2,
                    ease: "power2.out"
                });
            });
        }

        // 8. CTA Section Entrance Animation
        const ctaSection = document.querySelector('.cta-block');
        if (ctaSection) {
            const ctaTl = gsap.timeline({
                scrollTrigger: {
                    trigger: ctaSection,
                    start: "top 80%",
                    toggleActions: "play none none none"
                }
            });

            ctaTl.fromTo(ctaSection.querySelector('h2'),
                { y: 40, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }
            )
                .fromTo(ctaSection.querySelector('.u-cta-sub'),
                    { y: 30, opacity: 0 },
                    { y: 0, opacity: 1, duration: 0.6, ease: "power2.out" },
                    "-=0.4"
                )
                .fromTo('.contact-info-box',
                    { y: 25, opacity: 0 },
                    { y: 0, opacity: 1, stagger: 0.12, duration: 0.6, ease: "power2.out" },
                    "-=0.3"
                )
                .fromTo(ctaSection.querySelector('.btn-large'),
                    { scale: 0.9, opacity: 0 },
                    { scale: 1, opacity: 1, duration: 0.5, ease: "back.out(1.7)", clearProps: "transform,scale" },
                    "-=0.2"
                );
        }

        // 9. Business Outcomes List Items Animation
        const outcomesList = document.querySelectorAll('.business-outcomes-list li, .outcomes-content ul li');
        if (outcomesList.length > 0) {
            outcomesList.forEach((li, index) => {
                gsap.from(li, {
                    scrollTrigger: {
                        trigger: li.closest('.in-action-container') || li,
                        start: "top 85%",
                        toggleActions: "play none none none"
                    },
                    x: -30,
                    opacity: 0,
                    duration: 0.6,
                    delay: index * 0.08,
                    ease: "power2.out"
                });
            });
        }

        // 10. Footer Columns Stagger
        const footerCols = document.querySelectorAll('.footer-col');
        if (footerCols.length > 0) {
            gsap.from(footerCols, {
                scrollTrigger: {
                    trigger: 'footer',
                    start: "top 90%",
                    toggleActions: "play none none none"
                },
                y: 40,
                opacity: 0,
                stagger: 0.12,
                duration: 0.8,
                ease: "power2.out"
            });
        }

        // 11. Blueprint List Items (Enterprise Automation numbered items)
        const blueprintItems = document.querySelectorAll('.blueprint-list-item');
        if (blueprintItems.length > 0) {
            gsap.set(blueprintItems, { x: -20, opacity: 0 });
            blueprintItems.forEach((item, index) => {
                gsap.to(item, {
                    scrollTrigger: {
                        trigger: item.closest('.compact-blueprint-layout') || item,
                        start: "top 85%",
                        toggleActions: "play none none none"
                    },
                    x: 0,
                    opacity: 1,
                    duration: 0.7,
                    delay: index * 0.1,
                    ease: "power2.out"
                });
            });
        }

        // 12. Who We Are Text Fade-in
        const whoWeAreText = document.querySelector('.who-we-are-text');
        if (whoWeAreText) {
            gsap.from(whoWeAreText, {
                scrollTrigger: {
                    trigger: whoWeAreText,
                    start: "top 88%",
                    toggleActions: "play none none none"
                },
                y: 20,
                opacity: 0,
                duration: 1,
                ease: "power2.out"
            });
        }

        // 13. Blog Tags Pop-in
        const blogTags = document.querySelectorAll('.blog-tag');
        if (blogTags.length > 0) {
            gsap.set(blogTags, { scale: 0, opacity: 0 });
            blogTags.forEach(tag => {
                gsap.to(tag, {
                    scrollTrigger: {
                        trigger: tag.closest('.blog-card') || tag,
                        start: "top 85%",
                        toggleActions: "play none none none"
                    },
                    scale: 1,
                    opacity: 1,
                    duration: 0.5,
                    delay: 0.3,
                    ease: "back.out(2)"
                });
            });
        }

        // 14. Engagement Card Icons Spin-in
        const engagementIcons = document.querySelectorAll('.engagement-card i');
        if (engagementIcons.length > 0) {
            gsap.set(engagementIcons, { scale: 0, rotation: -180 });
            engagementIcons.forEach(icon => {
                gsap.to(icon, {
                    scrollTrigger: {
                        trigger: icon.closest('.engagement-card') || icon,
                        start: "top 88%",
                        toggleActions: "play none none none"
                    },
                    scale: 1,
                    rotation: 0,
                    duration: 0.8,
                    ease: "back.out(1.5)"
                });
            });
        }
        // 16. Architectural Timeline Progress
        const timelines = document.querySelectorAll('.architectural-timeline-container');
        timelines.forEach(timeline => {
            const progressBar = timeline.querySelector('.architectural-timeline-progress');
            if (progressBar) {
                gsap.to(progressBar, {
                    height: "100%",
                    ease: "none",
                    scrollTrigger: {
                        trigger: timeline,
                        start: "top center",
                        end: "bottom center",
                        scrub: 1
                    }
                });
            }
        });
        // 17. Evolutionary Processing Matrix Animations
        const matrixContainer = document.querySelector('.matrix-container');
        if (matrixContainer) {
            const matrixNodes = matrixContainer.querySelectorAll('.matrix-node');
            const matrixLines = matrixContainer.querySelectorAll('.matrix-line');
            const matrixCore = matrixContainer.querySelector('.matrix-core-wrapper');

            const matrixTl = gsap.timeline({
                scrollTrigger: {
                    trigger: matrixContainer,
                    start: "top 75%",
                    toggleActions: "play none none none"
                }
            });

            // 1. Core initialization
            matrixTl.fromTo(matrixCore,
                { scale: 0, opacity: 0, rotation: -90 },
                { scale: 1, opacity: 1, rotation: 0, duration: 1.2, ease: "elastic.out(1, 0.75)" }
            );

            // 2. Orbital System Reveal (SVG Rings)
            const matrixSVG = matrixContainer.querySelector('.matrix-svg-system svg');
            matrixTl.fromTo(matrixSVG,
                { opacity: 0, scale: 0.8 },
                { opacity: 1, scale: 1, duration: 1, ease: "power2.out" },
                "-=0.8"
            );

            // 3. Nodes Circular "Lock-on"
            matrixTl.fromTo(matrixNodes,
                { scale: 0, autoAlpha: 0, filter: "blur(10px)" },
                { scale: 1, autoAlpha: 1, filter: "blur(0px)", duration: 0.8, stagger: 0.2, ease: "back.out(1.7)" },
                "-=0.5"
            );
        }
    }
});

