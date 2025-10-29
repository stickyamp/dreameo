package com.dreamjournal.app;

import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.view.View;
import com.getcapacitor.BridgeActivity;
import com.codetrixstudio.capacitor.GoogleAuth.GoogleAuth;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
         // Apply splash theme before calling super
        setTheme(R.style.SplashTheme);

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
            webView.setLayerType(View.LAYER_TYPE_HARDWARE, null);

            // Optional: improve scroll performance
            webView.setOverScrollMode(View.OVER_SCROLL_NEVER);
        }
    }
}
