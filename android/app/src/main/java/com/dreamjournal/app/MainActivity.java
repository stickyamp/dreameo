package com.dreamjournal.app;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        // Set splash theme before calling super.onCreate()
        setTheme(R.style.SplashTheme);
        super.onCreate(savedInstanceState);
    }
}
