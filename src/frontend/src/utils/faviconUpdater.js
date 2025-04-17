export const updateFavicon = (color) => {
    // Create canvas for smooth transitions
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    
    // Draw circle with current color
    ctx.beginPath();
    ctx.arc(32, 32, 32, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    
    // Convert to data URL
    const pngData = canvas.toDataURL('image/png');
    
    // Find or create favicon link
    let favicon = document.querySelector('link[rel="icon"]');
    if (!favicon) {
      favicon = document.createElement('link');
      favicon.rel = 'icon';
      document.head.appendChild(favicon);
    }
    // Update favicon
    favicon.href = pngData;
  };