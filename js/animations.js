// Only run animations on index.html
if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/') {
    document.addEventListener('DOMContentLoaded', () => {
        // Add js-animations class to body
        document.body.classList.add('js-animations');
        
        // Small delay to ensure styles are applied before observing
        setTimeout(() => {
            // Get all sections and navigation links
            const sections = document.querySelectorAll('section');
            const navLinks = document.querySelectorAll('.nav-link');
            
            // Configure the Intersection Observer
            const observerOptions = {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px' // Reduced bottom margin for earlier trigger
            };

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        // Remove any existing transition delay
                        entry.target.style.transitionDelay = '0s';
                        entry.target.classList.add('visible');
                        // Unobserve after animation plays once to improve performance
                        observer.unobserve(entry.target);
                    }
                });
            }, observerOptions);

            // Observe all sections
            sections.forEach(section => {
                // Reset any inline styles that might affect animations
                section.style.transitionDelay = '0s';
                observer.observe(section);
            });

            // Smooth scroll for navigation links with consistent timing
            navLinks.forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    const targetId = link.getAttribute('href');
                    if (targetId.startsWith('#')) {
                        const targetElement = document.querySelector(targetId);
                        if (targetElement) {
                            // Immediately make the target section visible
                            targetElement.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
                            targetElement.style.transitionDelay = '0.1s';
                            targetElement.classList.add('visible');
                            
                            // Smooth scroll to the target
                            setTimeout(() => {
                                window.scrollTo({
                                    top: targetElement.offsetTop - 80,
                                    behavior: 'smooth'
                                });
                            }, 50); // Small delay to ensure the class is applied
                        }
                    }
                });
            });

            // Initial animation for hero section
            const heroSection = document.querySelector('.hero');
            if (heroSection) {
                heroSection.classList.add('visible');
            }
        }, 50); // 50ms delay to ensure styles are applied
    });
}
