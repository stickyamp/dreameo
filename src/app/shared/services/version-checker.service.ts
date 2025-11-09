import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { firstValueFrom } from "rxjs";
import { App } from "@capacitor/app";
import { LoggerService } from "./log.service";
import { AlertController } from "@ionic/angular";

@Injectable({
  providedIn: "root",
})
export class VersionService {
  private versionUrl = `https://gist.githack.com/stickyamp/3ab59e2e07b5fe15d12271721a0b951c/raw/dreameo.json?ts=${Date.now()}`;
  constructor(private http: HttpClient, private loggerService: LoggerService) {}

  private alertController = inject(AlertController);

  async checkForUpdate(): Promise<boolean> {
    try {
      // 👇 Fetch remote JSON
      const remoteData: any = await firstValueFrom(
        this.http.get(this.versionUrl)
      );
      const remoteVersion = remoteData.APP_VERSION;

      this.loggerService.log(
        `checkForUpdate Checking checkForUpdate ${remoteVersion}`
      );

      // 👇 Get local app version from Capacitor
      const info = await App.getInfo();
      const localVersion = info.version;

      console.log("Local version:", localVersion);
      console.log("Remote version:", remoteVersion);
      this.loggerService.log(`Local version ${localVersion}`);
      this.loggerService.log(`Remote version ${remoteVersion}`);
      return this.isNewerVersion(remoteVersion, localVersion);
    } catch (err) {
      this.loggerService.log(`Error in version checker ${JSON.stringify(err)}`);
      console.error("Error checking version:", JSON.stringify(err));
      return false;
    }
  }

  private isNewerVersion(remote: string, local: string): boolean {
    const r = remote.split(".").map(Number);
    const l = local.split(".").map(Number);
    for (let i = 0; i < r.length; i++) {
      if (r[i] > (l[i] || 0)) return true;
      if (r[i] < (l[i] || 0)) return false;
    }
    return false;
  }

  public async presentAlertUpdateAvailable() {
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
      this.presentAlertUpdateAvailable();
    });

    await alert.present();
  }
}
