import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterOutlet } from "@angular/router";
import { AlertController, IonicModule, Platform } from "@ionic/angular";
// import { StatusBar, Style } from '@capacitor/status-bar';
// import { SplashScreen } from '@capacitor/splash-screen';
import { DreamService } from "./shared/services/dreams/dream.base.service";
import { ConfigService } from "./shared/services/config.service";
import { provideDreamService } from "./shared/services/providers";
import { VersionService } from "./shared/services/version-checker.service";
import { Capacitor } from "@capacitor/core";
import { GoogleAuth } from "@codetrix-studio/capacitor-google-auth";

@Component({
  selector: "app-root",
  template: `
    <ion-app>
      <router-outlet></router-outlet>
    </ion-app>
  `,
  styles: [
    `
      ion-app {
        background: var(--color-bg);
      }
    `,
  ],
  standalone: true,
  imports: [CommonModule, RouterOutlet, IonicModule],
  providers: [provideDreamService()],
})
export class AppComponent implements OnInit {
  constructor(
    private platform: Platform,
    private dreamService: DreamService,
    private configService: ConfigService,
    private versionService: VersionService,
    private alertController: AlertController
  ) {}

  async ngOnInit() {
    try {
      await this.platform.ready();
      await this.initializeApp();
    } catch (error) {
      console.error("Error in ngOnInit:", error);
    }
  }

  private async initializeApp() {
    if (Capacitor.isNativePlatform()) {
      this.checkVersionAndLaunchPopup();
    } else {
      GoogleAuth.initialize();
    }
  }

  private async checkVersionAndLaunchPopup() {
    const updateAvailable = await this.versionService.checkForUpdate();
    //const updateAvailable = true;

    if (updateAvailable) {
      const alert = await this.alertController.create({
        header: "Update Required",
        message:
          "A new version of Dreameo is available. Please update to continue.",
        backdropDismiss: false, // 🚫 disable tap outside
        keyboardClose: false, // 🚫 prevent closing with keyboard
        buttons: [
          {
            text: "Update",
            handler: () => {
              // 👇 Opens Play Store (or App Store)
              window.open(
                "https://play.google.com/store/apps/details?id=com.yourapp",
                "_system"
              );
              // Optional: close the app if you want to enforce update
              // App.exitApp(); // uncomment if desired (needs @capacitor/app)
            },
          },
          { text: "Later", role: "cancel" },
        ],
      });

      // Prevent hardware back button dismissal (Android)
      alert.onDidDismiss().then(() => {
        // Reopen the alert immediately if user somehow closed it
        this.checkVersionAndLaunchPopup();
      });

      await alert.present();
    }
  }
}
