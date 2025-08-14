// This script will be used to handle the redirection and expansion
// It will be added to projects.html to handle the expansion of project cards

document.addEventListener('DOMContentLoaded', function() {
    // Check if there's a hash in the URL
    const hash = window.location.hash;
    if (hash) {
        const projectCard = document.querySelector(hash);
        if (projectCard) {
            // Scroll to the project card
            projectCard.scrollIntoView({ behavior: 'smooth' });
            
            // If the project card has an expandable section, expand it
            const expandButton = projectCard.querySelector('.toggle-expand');
            if (expandButton) {
                setTimeout(() => {
                    expandButton.click();
                }, 500); // Small delay to ensure the page has scrolled
            }
        }
    }
});
