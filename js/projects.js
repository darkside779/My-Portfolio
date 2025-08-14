document.addEventListener('DOMContentLoaded', function() {
    // Handle project card expansion
    const projectCards = document.querySelectorAll('.project-card');
    
    function updateToggleButtons(card, isExpanded) {
        const buttons = card.querySelectorAll('.toggle-expand');
        buttons.forEach(button => {
            button.textContent = isExpanded ? 'Show Less' : 'Show More';
        });
    }
    
    function collapseAllCards(exceptCard = null) {
        document.querySelectorAll('.project-card.expanded').forEach(expandedCard => {
            if (!exceptCard || expandedCard !== exceptCard) {
                expandedCard.classList.remove('expanded');
                updateToggleButtons(expandedCard, false);
            }
        });
    }
    
    projectCards.forEach(card => {
        const toggleButtons = card.querySelectorAll('.toggle-expand');
        const expandedContent = card.querySelector('.project-expanded');
        const thumbnails = expandedContent ? expandedContent.querySelectorAll('.gallery-thumbnails img') : [];
        
        // Toggle expand/collapse
        toggleButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const isExpanding = !card.classList.contains('expanded');
                
                // Collapse any other expanded card when expanding a new one
                if (isExpanding) {
                    collapseAllCards(card);
                }
                
                // Toggle current card
                card.classList.toggle('expanded');
                updateToggleButtons(card, isExpanding);
                
                if (isExpanding) {
                    // Make sure the first thumbnail is active when expanding
                    const firstThumb = expandedContent?.querySelector('.gallery-thumbnails img:first-child');
                    if (firstThumb) {
                        // Remove active class from all thumbnails first
                        expandedContent.querySelectorAll('.gallery-thumbnails img').forEach(t => t.classList.remove('active'));
                        // Set first thumbnail as active
                        firstThumb.classList.add('active');
                        
                        // Update main image to match the first thumbnail
                        const galleryMain = expandedContent.querySelector('.gallery-main');
                        if (galleryMain) {
                            // Clear existing images
                            galleryMain.innerHTML = '';
                            
                            // Create and append new main image
                            const newMainImg = document.createElement('img');
                            newMainImg.src = firstThumb.src;
                            newMainImg.alt = firstThumb.alt;
                            newMainImg.classList.add('active');
                            galleryMain.appendChild(newMainImg);
                        }
                    }
                    
                    // Scroll to the card when expanding
                    setTimeout(() => {
                        card.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }, 50);
                }
            });
        });
        
        // Initialize gallery navigation
        if (expandedContent) {
            const gallery = expandedContent.querySelector('.gallery-thumbnails');
            const container = expandedContent.querySelector('.gallery-thumbnails-container');
            const prevBtn = expandedContent.querySelector('.gallery-nav-arrow.prev');
            const nextBtn = expandedContent.querySelector('.gallery-nav-arrow.next');
            const thumbnails = container ? Array.from(container.querySelectorAll('img')) : [];
            
            // Handle thumbnail clicks
            thumbnails.forEach(thumb => {
                thumb.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    // Get the main image container
                    const galleryMain = thumb.closest('.project-gallery').querySelector('.gallery-main');
                    
                    // Create new main image
                    const newMainImg = document.createElement('img');
                    newMainImg.src = thumb.src;
                    newMainImg.alt = thumb.alt;
                    newMainImg.classList.add('active');
                    
                    // Remove existing active images
                    const activeImages = galleryMain.querySelectorAll('img');
                    activeImages.forEach(img => img.remove());
                    
                    // Add new image
                    galleryMain.appendChild(newMainImg);
                    
                    // Update active thumbnail
                    thumbnails.forEach(t => t.classList.remove('active'));
                    thumb.classList.add('active');
                    
                    // Center the active thumbnail
                    scrollToThumb(thumb, container);
                });
            });
            
            // Handle navigation arrows
            if (prevBtn && nextBtn && container) {
                const scrollAmount = 150; // Slightly reduced scroll amount
                let isScrolling = false;
                
                const updateArrowVisibility = () => {
                    const { scrollWidth, clientWidth } = container;
                    const canScroll = scrollWidth > clientWidth;
                    
                    if (!canScroll) {
                        // Hide both arrows if all thumbnails are visible
                        prevBtn.style.display = 'none';
                        nextBtn.style.display = 'none';
                        return;
                    }
                    
                    // Show arrows since we have overflow content
                    prevBtn.style.display = 'flex';
                    nextBtn.style.display = 'flex';
                    
                    // Update arrow states based on scroll position
                    const { scrollLeft } = container;
                    const isAtStart = scrollLeft === 0;
                    const isAtEnd = scrollLeft >= scrollWidth - clientWidth - 1;
                    
                    prevBtn.style.visibility = isAtStart ? 'hidden' : 'visible';
                    nextBtn.style.visibility = isAtEnd ? 'hidden' : 'visible';
                };
                
                const scrollTo = (direction) => {
                    if (isScrolling) return;
                    isScrolling = true;
                    
                    const currentScroll = container.scrollLeft;
                    const targetScroll = direction === 'next' 
                        ? Math.min(currentScroll + scrollAmount, container.scrollWidth - container.clientWidth)
                        : Math.max(0, currentScroll - scrollAmount);
                    
                    container.scrollTo({
                        left: targetScroll,
                        behavior: 'smooth'
                    });
                    
                    // Enable scrolling again after animation
                    setTimeout(() => {
                        isScrolling = false;
                        updateArrowVisibility();
                    }, 300);
                };
                
                prevBtn.addEventListener('click', () => scrollTo('prev'));
                nextBtn.addEventListener('click', () => scrollTo('next'));
                
                // Initial update
                updateArrowVisibility();
                
                // Update on scroll with debounce
                let scrollTimeout;
                container.addEventListener('scroll', () => {
                    clearTimeout(scrollTimeout);
                    scrollTimeout = setTimeout(updateArrowVisibility, 100);
                });
                
                // Handle window resize
                const resizeObserver = new ResizeObserver(updateArrowVisibility);
                resizeObserver.observe(container);
                
                // Cleanup
                return () => {
                    resizeObserver.disconnect();
                    window.removeEventListener('resize', updateArrowVisibility);
                };
            }
        }
        
        // Helper function to center the active thumbnail
        function scrollToThumb(thumb, container) {
            if (!thumb || !container) return;
            
            const containerRect = container.getBoundingClientRect();
            const thumbRect = thumb.getBoundingClientRect();
            const containerCenter = containerRect.left + containerRect.width / 2;
            const thumbCenter = thumbRect.left + thumbRect.width / 2;
            const scrollOffset = thumbCenter - containerCenter;
            
            container.scrollBy({
                left: scrollOffset,
                behavior: 'smooth'
            });
        }
    });
    
    // Close expanded card when clicking outside
    document.addEventListener('click', (e) => {
        const expandedCard = document.querySelector('.project-card.expanded');
        if (expandedCard && !expandedCard.contains(e.target) && !e.target.classList.contains('toggle-expand')) {
            expandedCard.classList.remove('expanded');
            updateToggleButtons(expandedCard, false);
        }
    });
    
    // Close expanded card with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const expandedCard = document.querySelector('.project-card.expanded');
            if (expandedCard) {
                expandedCard.classList.remove('expanded');
                updateToggleButtons(expandedCard, false);
            }
        }
    });
    
    // Handle window resize to ensure proper state
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            const expandedCard = document.querySelector('.project-card.expanded');
            if (expandedCard) {
                expandedCard.classList.remove('expanded');
                updateToggleButtons(expandedCard, false);
            }
        }, 250);
    });
});
