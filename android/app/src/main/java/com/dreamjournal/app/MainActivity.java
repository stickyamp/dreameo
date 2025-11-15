package com.dreamt.moonstick.app;

import android.content.res.Configuration;
import android.os.Bundle;
import android.view.WindowManager;
import android.webkit.WebSettings;
import android.webkit.WebView;
import androidx.activity.EdgeToEdge;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.graphics.Insets;
import androidx.core.view.WindowInsetsControllerCompat;
import com.getcapacitor.BridgeActivity;
import com.codetrixstudio.capacitor.GoogleAuth.GoogleAuth;

public class MainActivity extends BridgeActivity {
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        // Apply splash theme before calling super
        setTheme(R.style.SplashTheme);
        
        // Enable Edge-to-Edge mode
        WindowCompat.setDecorFitsSystemWindows(getWindow(), false);
        EdgeToEdge.enable(this);
        
        super.onCreate(savedInstanceState);
        
        // Register Google Auth plugin
        registerPlugin(GoogleAuth.class);
        
        // Get the WebView used by Capacitor
        WebView webView = (WebView) this.bridge.getWebView();
        
        if (webView != null) {
            WebSettings settings = webView.getSettings();
            
            // Enable useful settings
            settings.setDomStorageEnabled(true);
            settings.setJavaScriptEnabled(true);
            settings.setMediaPlaybackRequiresUserGesture(false);
            
            // Improve rendering performance
            webView.setLayerType(android.view.View.LAYER_TYPE_HARDWARE, null);
            
            // Optional: improve scroll performance
            webView.setOverScrollMode(android.view.View.OVER_SCROLL_NEVER);
        }
        
        // Handle safe area insets dynamically
        ViewCompat.setOnApplyWindowInsetsListener(
            findViewById(android.R.id.content), // Root view of the activity
            (v, windowInsets) -> {
                // Get insets for gesture navigation and system bars
                Insets gestureInsets = windowInsets.getInsets(WindowInsetsCompat.Type.systemGestures());
                Insets systemInsets = windowInsets.getInsets(WindowInsetsCompat.Type.systemBars());
                Insets imeInsets = windowInsets.getInsets(WindowInsetsCompat.Type.ime());
                
                float density = getResources().getDisplayMetrics().density;
                int topInset = (int) (systemInsets.top / density);
                int bottomInset = (int) (gestureInsets.bottom / density);
                
                // Handle keyboard visibility and set bottom padding to 0 if keyboard is open
                int imeHeight = Math.max(0, imeInsets.bottom - systemInsets.bottom);
                if (imeHeight > 0) {
                    bottomInset = 0; // Ignore gesture insets when keyboard is visible
                }
                
                // Inject CSS variables dynamically
                setSafeAreaInsets(topInset, bottomInset);
                
                // Consume the insets so they aren't passed further
                return WindowInsetsCompat.CONSUMED;
            }
        );
        
        // Update status bar and navigation bar appearance
        updateSystemBarAppearance();
    }
    
    private void setSafeAreaInsets(int top, int bottom) {
        // Set CSS variables dynamically for Ionic to use
        String js = "document.addEventListener('DOMContentLoaded', function() {" +
            "document.documentElement.style.setProperty('--ion-safe-area-top', '" + top + "px');" +
            "document.documentElement.style.setProperty('--ion-safe-area-bottom', '" + bottom + "px');" +
            "});";
        bridge.getWebView().evaluateJavascript(js, null);
    }
    
    private void updateSystemBarAppearance() {
        // Detect if the device is in dark mode
        boolean isDarkMode = (getResources().getConfiguration().uiMode &
            Configuration.UI_MODE_NIGHT_MASK) == Configuration.UI_MODE_NIGHT_YES;
        
        // Get the InsetsController to modify appearance
        WindowInsetsControllerCompat insetsController = WindowCompat.getInsetsController(getWindow(), getWindow().getDecorView());
        
        // Update status bar icons based on mode
        insetsController.setAppearanceLightStatusBars(!isDarkMode); // Light icons in dark mode, dark icons in light mode
        
        // Update navigation bar icons based on mode
        insetsController.setAppearanceLightNavigationBars(!isDarkMode); // Light icons in dark mode, dark icons in light mode
        
        // Set transparent bars for edge-to-edge effect
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS);
        getWindow().setStatusBarColor(android.graphics.Color.TRANSPARENT);
        getWindow().setNavigationBarColor(android.graphics.Color.TRANSPARENT);
    }
    
    @Override
    public void onConfigurationChanged(Configuration newConfig) {
        super.onConfigurationChanged(newConfig);
        // Reapply system bar appearance when theme changes
        updateSystemBarAppearance();
    }
}