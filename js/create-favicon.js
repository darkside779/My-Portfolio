// Run this in browser console to generate favicon
function createFavicon() {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    
    // Background
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, 32, 32);
    
    // Text
    ctx.font = 'bold 24px Poppins';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('AK', 16, 16);
    
    // Convert to favicon
    const link = document.createElement('link');
    link.rel = 'icon';
    link.href = canvas.toDataURL('image/png');
    
    // Add to page
    document.head.appendChild(link);
    
    // Log the base64 data URL
    console.log('Favicon data URL:', link.href);
}

createFavicon();
