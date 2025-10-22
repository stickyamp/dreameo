const fs = require('fs');
const path = require('path');

// Splash screen configuration matching your HTML design
const splashConfig = {
    width: 1080,
    height: 1920,
    backgroundColor: '#030014',
    logoSize: 200,
    logoColor: '#FFFFFF',
    textColor: '#E6E6FA',
    accentColor: '#A855F7'
};

// Create splash screen HTML template for generation
const splashTemplate = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Splash Screen Generator</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            width: ${splashConfig.width}px;
            height: ${splashConfig.height}px;
            background: ${splashConfig.backgroundColor};
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            font-family: 'Manrope', sans-serif;
            overflow: hidden;
        }
        
        .stars {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
        }
        
        .star {
            position: absolute;
            background: white;
            border-radius: 50%;
            animation: twinkle 4s infinite ease-in-out;
        }
        
        .star:nth-child(1) { top: 10%; left: 20%; width: 2px; height: 2px; animation-delay: 0s; }
        .star:nth-child(2) { top: 25%; left: 80%; width: 3px; height: 3px; animation-delay: 0.5s; }
        .star:nth-child(3) { top: 50%; left: 15%; width: 1px; height: 1px; animation-delay: 1s; }
        .star:nth-child(4) { top: 70%; left: 90%; width: 2px; height: 2px; animation-delay: 1.5s; }
        .star:nth-child(5) { top: 85%; left: 30%; width: 1px; height: 1px; animation-delay: 2s; }
        .star:nth-child(6) { top: 5%; left: 50%; width: 2px; height: 2px; animation-delay: 2.5s; }
        .star:nth-child(7) { top: 40%; left: 60%; width: 1px; height: 1px; animation-delay: 3s; }
        .star:nth-child(8) { top: 95%; left: 70%; width: 3px; height: 3px; animation-delay: 3.5s; }
        
        @keyframes twinkle {
            0%, 100% { opacity: 0.2; }
            50% { opacity: 1; }
        }
        
        .content {
            z-index: 10;
            text-align: center;
            color: ${splashConfig.textColor};
        }
        
        .logo {
            width: ${splashConfig.logoSize}px;
            height: ${splashConfig.logoSize}px;
            margin-bottom: 40px;
            color: ${splashConfig.logoColor};
        }
        
        .title {
            font-size: 72px;
            font-weight: 700;
            margin-bottom: 60px;
            color: ${splashConfig.logoColor};
            letter-spacing: 4px;
        }
        
        .loading-bar {
            width: 300px;
            height: 4px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 2px;
            overflow: hidden;
            margin: 0 auto 20px;
        }
        
        .loading-fill {
            width: 100%;
            height: 100%;
            background: ${splashConfig.accentColor};
            border-radius: 2px;
            animation: pulse 2s infinite ease-in-out;
        }
        
        @keyframes pulse {
            0%, 100% { opacity: 0.7; }
            50% { opacity: 1; }
        }
        
        .subtitle {
            font-size: 18px;
            opacity: 0.7;
            font-weight: 400;
        }
    </style>
</head>
<body>
    <div class="stars">
        <div class="star"></div>
        <div class="star"></div>
        <div class="star"></div>
        <div class="star"></div>
        <div class="star"></div>
        <div class="star"></div>
        <div class="star"></div>
        <div class="star"></div>
    </div>
    
    <div class="content">
        <svg class="logo" fill="none" stroke="currentColor" stroke-width="1" viewBox="0 0 24 24">
            <path d="M21.64 13.5a1.5 1.5 0 00-1.04-1.04l-4.78-2.65-2.65-4.78a1.5 1.5 0 00-2.08 0L8.44 9.81 3.66 12.46a1.5 1.5 0 00-1.04 1.04l-2.65 4.78a1.5 1.5 0 002.08 2.08l4.78-2.65 2.65-4.78 4.78 2.65 2.65 4.78a1.5 1.5 0 002.08-2.08l-2.65-4.78z" stroke-linecap="round" stroke-linejoin="round"></path>
            <path d="M12 2v2" stroke-linecap="round" stroke-linejoin="round"></path>
            <path d="M12 20v2" stroke-linecap="round" stroke-linejoin="round"></path>
            <path d="M4.93 4.93l1.41 1.41" stroke-linecap="round" stroke-linejoin="round"></path>
            <path d="M17.66 17.66l1.41 1.41" stroke-linecap="round" stroke-linejoin="round"></path>
            <path d="M2 12h2" stroke-linecap="round" stroke-linejoin="round"></path>
            <path d="M20 12h2" stroke-linecap="round" stroke-linejoin="round"></path>
            <path d="M4.93 19.07l1.41-1.41" stroke-linecap="round" stroke-linejoin="round"></path>
            <path d="M17.66 6.34l1.41-1.41" stroke-linecap="round" stroke-linejoin="round"></path>
        </svg>
        
        <h1 class="title">Dreameo</h1>
        
        <div class="loading-bar">
            <div class="loading-fill"></div>
        </div>
        
        <p class="subtitle">Entering the dream world...</p>
    </div>
</body>
</html>
`;

// Write the template to a file for manual screenshot generation
fs.writeFileSync('splash-generator.html', splashTemplate);

console.log('Splash screen generator created!');
console.log('Open splash-generator.html in your browser and take a screenshot');
console.log('Save it as splash.png and place it in android/app/src/main/res/drawable/');
