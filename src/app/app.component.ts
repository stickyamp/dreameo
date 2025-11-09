import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router, RouterOutlet } from "@angular/router";
import { AlertController, IonicModule, Platform } from "@ionic/angular";
import { DreamService } from "./shared/services/dreams/dream.base.service";
import { provideDreamService } from "./shared/services/providers";
import { VersionService } from "./shared/services/version-checker.service";
import { Capacitor } from "@capacitor/core";
import { GoogleAuth } from "@codetrix-studio/capacitor-google-auth";
import { FirebaseBackupService } from "./shared/services/firebase-backup.service";
import { Preferences } from "@capacitor/preferences";
import { LoggerService } from "./shared/services/log.service";

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
  BACKUP_INTERVAL_HOURS = 12;
  BACKUP_KEY = "LAST_BACKUP_DATE";
  ONBOARDING_DONE = "ONBOARDING_DONE";

  constructor(
    private platform: Platform,
    private dreamService: DreamService,
    private versionService: VersionService,
    private alertController: AlertController,
    private firebaseBackupService: FirebaseBackupService,
    private router: Router,
    private loggerService: LoggerService
  ) {}

  async ngOnInit() {
    try {
      await this.platform.ready();
      await this.initializeApp();
      this.launchOnboarding();
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

    setTimeout(() => {
      this.backUpDreamsIfNeeded();
    }, 5000);
  }

  private async checkVersionAndLaunchPopup() {
    this.loggerService.log(
      `checkVersionAndLaunchPopup Checking if new version available`
    );
    const updateAvailable = await this.versionService.checkForUpdate();
    //const updateAvailable = true;
    this.loggerService.log(
      `checkVersionAndLaunchPopup updateAvailable ${updateAvailable}`
    );

    if (updateAvailable) {
      await this.versionService.presentAlertUpdateAvailable();
    }
  }

  private async backUpDreamsIfNeeded() {
    try {
      const currentLocalDreams = this.dreamService.getAllDreams();
      const currentLocalTags = this.dreamService.getAllTags();

      if (currentLocalDreams.length <= 0) return;

      const lastBackup = await Preferences.get({ key: this.BACKUP_KEY });
      const now = new Date();
      let shouldBackup = false;

      if (!lastBackup.value) {
        // Never backed up before
        shouldBackup = true;
      } else {
        const lastBackupDate = new Date(lastBackup.value);
        const diffHours =
          (now.getTime() - lastBackupDate.getTime()) / (1000 * 60 * 60);
        if (diffHours >= this.BACKUP_INTERVAL_HOURS) {
          shouldBackup = true;
        }
      }

      if (shouldBackup) {
        console.log("⏫ Backing up dreams to Firebase...");
        await this.firebaseBackupService.saveAllDreams(currentLocalDreams);
        await this.firebaseBackupService.saveAllTags(currentLocalTags);

        // Save new backup time
        await Preferences.set({
          key: this.BACKUP_KEY,
          value: now.toISOString(),
        });
        console.log("✅ Dreams backup completed.");
      } else {
        console.log("⏸ Dreams backup skipped (less than 12 hours).");
      }
    } catch (err) {
      console.error("Error checking or performing dream backup:", err);
    }
  }

  private async launchOnboarding() {
    const onboardingDone = await Preferences.get({ key: this.ONBOARDING_DONE });

    if (onboardingDone && onboardingDone.value) return;

    this.router.navigate(["/onboarding"]);
  }
}
