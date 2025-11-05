const fs = require('fs');

// Simple splash screen configuration - black background with small centered icon
const splashConfig = {
    backgroundColor: '#000000',
    iconSize: 64
};

// Create simple splash screen HTML template
const simpleSplashTemplate = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Simple Splash Screen Generator</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            width: 1080px;
            height: 1920px;
            background: ${splashConfig.backgroundColor};
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
        }
        
        .logo {
            width: ${splashConfig.iconSize}px;
            height: ${splashConfig.iconSize}px;
        }
    </style>
</head>
<body>
    <img class="logo" src="src/assets/icons/icon-128.webp" alt="App Logo">
</body>
</html>
`;

// Write the template to a file
fs.writeFileSync('simple-splash-generator.html', simpleSplashTemplate);

console.log('Simple splash screen generator created!');
console.log('1. Open simple-splash-generator.html in your browser');
console.log('2. Take a screenshot at 1080x1920 resolution');
console.log('3. Save as splash.png');
console.log('4. Replace all splash.png files in android/app/src/main/res/drawable-*/');