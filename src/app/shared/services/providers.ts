import { Provider } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { DreamService } from './dreams/dream.base.service';
import { DreamMobileService } from './dreams/dream.mobile.service';
import { DreamWebService } from './dreams/dream.web.service';

let cachedInstance: DreamService | null = null;

export function provideDreamService(): Provider {
    // 🔒 internal cache (closure-scoped)
    return {
        provide: DreamService,
        useFactory: () => {
            // Return cached instance if available
            if (cachedInstance) {
                return cachedInstance;
            }

            // Otherwise create it once and cache it
            cachedInstance = Capacitor.isNativePlatform()
                ? new DreamMobileService()
                : new DreamWebService();

            return cachedInstance;
        },
    };
}