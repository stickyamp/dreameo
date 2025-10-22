# Splash Screen Generation Instructions

## Option 1: Manual Generation (Recommended)

1. **Open the generated HTML file:**
   - Open `splash-generator.html` in your browser
   - Take a screenshot of the full screen (1080x1920)
   - Save it as `splash.png`

2. **Replace the splash images:**
   ```bash
   # Copy the new splash.png to all density folders
   cp splash.png android/app/src/main/res/drawable/splash.png
   cp splash.png android/app/src/main/res/drawable-port-hdpi/splash.png
   cp splash.png android/app/src/main/res/drawable-port-mdpi/splash.png
   cp splash.png android/app/src/main/res/drawable-port-xhdpi/splash.png
   cp splash.png android/app/src/main/res/drawable-port-xxhdpi/splash.png
   cp splash.png android/app/src/main/res/drawable-port-xxxhdpi/splash.png
   ```

## Option 2: Use Online Tools

1. **Go to:** https://apetools.webprofusion.com/app/
2. **Upload your app icon** (the star icon from your HTML)
3. **Set background color:** #030014
4. **Set text:** "Dreameo"
5. **Download and use the generated splash screens**

## Option 3: Create Simple Text-Based Splash

If you want a quick solution, I can create a simple text-based splash screen using Android drawables.
