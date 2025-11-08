import { CommonModule } from "@angular/common";
import { Component, OnInit, Input, ChangeDetectorRef } from "@angular/core";
import { Router } from "@angular/router";
import {
  AlertController,
  IonicModule,
  PopoverController,
} from "@ionic/angular";
import { Capacitor } from "@capacitor/core";
import { ConfigService } from "src/app/shared/services/config.service";
import { DreamService } from "@/app/shared/services/dreams/dream.base.service";
import { AuthService } from "src/app/shared/services/auth.service";
import { FirebaseAuthService } from "src/app/shared/services/firebase-auth.service";
import { Preferences } from "@capacitor/preferences";
import { TranslateModule, TranslateService } from "@ngx-translate/core";
import { FormsModule } from "@angular/forms";
import { LoggerService } from "@/app/shared/services/log.service";
import { FirebaseBackupService } from "@/app/shared/services/firebase-backup.service";
import {
  ToastLevelEnum,
  ToastNotifierService,
} from "@/app/shared/services/toast-notifier";
import { LocalNotifications } from "@capacitor/local-notifications";
import { APP_CONSTANTS } from "@/app/app.constants";
import { DreamPdfService } from "@/app/shared/services/export-pdf.service.ts/export-pdf.service";
import { TripleClickDirective } from "@/app/shared/directives/triple-click.directive";
import { firstValueFrom } from "rxjs";

interface User {
  name: string;
  email: string;
  avatar: string;
}

// Language Popover Component
@Component({
  selector: "app-language-popover",
  template: `
    <ion-list class="language-popover-list">
      <ion-item
        button
        lines="none"
        (click)="selectLanguage('en')"
        [class.selected]="currentLanguage === 'en'"
      >
        <ion-label>{{ "PROFILE.ENGLISH" | translate }}</ion-label>
        <ion-icon
          *ngIf="currentLanguage === 'en'"
          name="checkmark"
          slot="end"
          color="primary"
        ></ion-icon>
      </ion-item>
      <ion-item
        button
        lines="none"
        (click)="selectLanguage('es')"
        [class.selected]="currentLanguage === 'es'"
      >
        <ion-label>{{ "PROFILE.SPANISH" | translate }}</ion-label>
        <ion-icon
          *ngIf="currentLanguage === 'es'"
          name="checkmark"
          slot="end"
          color="primary"
        ></ion-icon>
      </ion-item>
    </ion-list>
  `,
  styles: [
    `
      .language-popover-list {
        padding: 0;
        min-width: 150px;
      }

      ion-item {
        --padding-start: 16px;
        --padding-end: 16px;
        --min-height: 44px;
        cursor: pointer;
        --ion-item-background: var(--color-bg);
        color: var(--color-text-primary);
        --color: var(--color-text-primary);
        --ion-color-primary: var(--color-text-primary);
      }

      ion-item.selected {
        --background: var(--color-bg);
        color: var(--color-text-primary);
        --color: var(--color-text-primary);
        --ion-color-primary: var(--color-text-primary);
      }

      ion-item:hover {
        --background: var(--color-bg-content);
        color: var(--color-text-primary);
        --color: var(--color-text-primary);
        --ion-color-primary: var(--color-text-primary);
      }

      ion-label {
        font-size: 14px;
        font-weight: 500;
      }

      ion-icon[slot="end"] {
        margin-left: 8px;
        font-size: 20px;
      }
    `,
  ],
  standalone: true,
  imports: [CommonModule, IonicModule, TranslateModule],
})
export class LanguagePopoverComponent {
  @Input() currentLanguage: string = "en";
  @Input() onLanguageSelect!: (lang: string) => void;

  selectLanguage(lang: string) {
    if (this.onLanguageSelect) {
      this.onLanguageSelect(lang);
    }
  }
}

@Component({
  selector: "app-configuration",
  templateUrl: "./profile.component.html",
  styleUrls: ["./profile.component.scss"],
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    TranslateModule,
    TripleClickDirective,
  ],
  standalone: true,
})
export class ProfileComponent implements OnInit {
  user: User = {
    name: "John Doe",
    email: "john.doe@example.com",
    avatar: "",
  };

  darkMode: boolean = false;
  selectedLanguage: string = "en";
  isUserLogged: boolean = true;
  isGoogleUserLogged?: boolean;
  isConnectingGoogle: boolean = false;
  notificationsEnabled: boolean = false;
  notificationsLoading: boolean = false;

  showDebugTools: boolean = false;

  constructor(
    private router: Router,
    private alertController: AlertController,
    private configService: ConfigService,
    private dreamService: DreamService,
    private authService: AuthService,
    private firebaseAuthService: FirebaseAuthService,
    private firebaseBackupService: FirebaseBackupService,
    private translate: TranslateService,
    private popoverController: PopoverController,
    private cdr: ChangeDetectorRef,
    private logService: LoggerService,
    private toastNotifierService: ToastNotifierService,
    private dreamPdfService: DreamPdfService
  ) {
    this.showDebugTools = APP_CONSTANTS.IS_DEBUG;
  }

  enableDebugMode() {
    this.showDebugTools = !this.showDebugTools;
  }

  async ngOnInit() {
    this.darkMode = await this.configService.isDarkMode();
    const savedLang = localStorage.getItem("lang") || "en";
    this.selectedLanguage = savedLang; // Sin traducción aquí: se hará en template
    this.setLanguage(savedLang);
    if (Capacitor.isNativePlatform()) {
      this.notificationsEnabled = await this.checkNotificationPermission();
    }

    // Suscribirse a cambios en el estado de autenticación de Firebase
    this.firebaseAuthService.currentUser$.subscribe(async (user) => {
      console.log("Firebase user state changed:", user);
      if (user) {
        let avatarBase64 = await this.getCachedUserPhoto();
        if (!avatarBase64) {
          avatarBase64 = await this.cacheUserPhoto(user.profileImage ?? "");
        }
        this.user = {
          name: user.displayName || user.email.split("@")[0],
          email: user.email,
          avatar: avatarBase64 ?? "",
        };
        this.isGoogleUserLogged = true;
        this.isUserLogged = true;
        console.log(
          "Google user logged in, isGoogleUserLogged:",
          this.isGoogleUserLogged
        );
      } else {
        // Verificar si hay usuario básico
        const basicUser = this.authService.getCurrentUser();
        if (basicUser) {
          this.user = {
            name: basicUser.username,
            email: basicUser.email,
            avatar: "",
          };
          this.isUserLogged = false;
          this.isGoogleUserLogged = false;
        } else {
          this.isUserLogged = false;
          this.isGoogleUserLogged = false;
        }
        console.log(
          "No Google user, isGoogleUserLogged:",
          this.isGoogleUserLogged
        );
      }
      // Forzar detección de cambios
      this.cdr.detectChanges();
    });
  }

  goBack(): void {
    this.router.navigate(["/home"]);
  }

  toggleDarkMode(event: any): void {
    this.darkMode = event.detail.checked;
    this.configService.saveDarkModePreference(this.darkMode);

    if (this.darkMode) {
      this.configService.enableDarkMode();
    } else {
      this.configService.enableLightMode();
    }
  }

  async toggleLanguage(event?: Event): Promise<void> {
    const popover = await this.popoverController.create({
      component: LanguagePopoverComponent,
      event: event,
      translucent: true,
      size: "auto",
      componentProps: {
        currentLanguage: this.selectedLanguage,
        onLanguageSelect: (lang: string) => {
          this.setLanguage(lang);
          popover.dismiss();
        },
      },
    });

    await popover.present();
  }

  setLanguage(lang: string): void {
    this.translate.use(lang);
    localStorage.setItem("lang", lang);
    this.selectedLanguage = lang;
  }

  async connectGoogleAccount(): Promise<void> {
    if (this.isConnectingGoogle) return;

    this.isConnectingGoogle = true;

    try {
      console.log("Starting Google Sign-In from profile...");
      this.logService.log(`1- Starting google auth flow`);
      await this.firebaseAuthService.signInWithGoogle();
      this.logService.log(`2- Starting google auth flow`);
      // Esperar un poco para que Firebase actualice el estado
      await new Promise((resolve) => setTimeout(resolve, 500));
      this.logService.log(`3- Starting google auth flow`);
      // Actualizar información del usuario después de conectar
      const currentUser = this.firebaseAuthService.getCurrentUser();
      console.log("Current user after sign in:", currentUser);
      this.logService.log(`4- Starting google auth flow ${currentUser}`);
      if (currentUser) {
        let avatarBase64 = await this.getCachedUserPhoto();
        if (!avatarBase64) {
          avatarBase64 = await this.cacheUserPhoto(
            currentUser.profileImage ?? ""
          );
        }
        this.user = {
          name: currentUser.displayName || currentUser.email.split("@")[0],
          email: currentUser.email,
          avatar: avatarBase64 ?? "",
        };
        this.isGoogleUserLogged = true;
        this.isUserLogged = true;

        console.log(
          "User state updated - isGoogleUserLogged:",
          this.isGoogleUserLogged
        );

        // Forzar detección de cambios
        this.cdr.detectChanges();
      } else {
        console.warn("No user found after Google sign in");
      }
    } catch (error: any) {
      console.error("Google connection error:", error);

      // No mostrar alerta si el usuario canceló
      if (
        error.message?.includes("cancelado") ||
        error.message?.includes("cancelled")
      ) {
        console.log("User cancelled Google connection");
        return;
      }
      this.logService.log(`Error happened in google auth flow ${error}`);
      await this.showAlert(
        this.translate.instant("profile.googleError") || "Connection Error",
        error.message ||
          this.translate.instant("profile.googleErrorMessage") ||
          "Could not connect to Google account"
      );
    } finally {
      this.isConnectingGoogle = false;
      this.cdr.detectChanges();
    }
  }

  async closeSession(): Promise<void> {
    const alert = await this.alertController.create({
      header: this.translate.instant("PROFILE.LOGOUT_HEADER"),
      message: this.translate.instant("PROFILE.LOGOUT_MESSAGE"),
      buttons: [
        {
          text: this.translate.instant("PROFILE.CANCEL"),
          role: "cancel",
          cssClass: "secondary",
        },
        {
          text: this.translate.instant("PROFILE.CONFIRM_LOGOUT"),
          cssClass: "danger",
          handler: () => this.performCloseSession(),
        },
      ],
    });
    await alert.present();
  }

  async cleanData(): Promise<void> {
    const alert = await this.alertController.create({
      header: this.translate.instant("CLEAN_DATA.HEADER"),
      message: this.translate.instant("CLEAN_DATA.MESSAGE"),
      buttons: [
        {
          text: this.translate.instant("CLEAN_DATA.CANCEL"),
          role: "cancel",
          cssClass: "secondary",
        },
        {
          text: this.translate.instant("CLEAN_DATA.CONFIRM"),
          cssClass: "danger",
          handler: async () => {
            await this.performCleanData();
          },
        },
      ],
    });

    await alert.present();
  }

  private async performCloseSession(): Promise<void> {
    try {
      // Verificar si hay un usuario de Google logeado
      const googleUser = this.firebaseAuthService.getCurrentUser();

      if (googleUser) {
        // Si hay usuario de Google, cerrar sesión de Firebase
        console.log("Logging out Google user");
        await this.firebaseAuthService.logout();
      } else {
        // Si no hay usuario de Google, cerrar sesión básica
        console.log("Logging out basic user");
        await this.authService.logout();
      }

      this.isUserLogged = false;
      // Navegar a login
    } catch (error) {
      console.error("Error during logout:", error);
    }
  }

  private async performCleanData(): Promise<void> {
    try {
      console.log("Starting comprehensive data cleanup...");

      // Clear all Capacitor Preferences data
      await this.clearAllPreferences();

      // Clear dreams data using DreamService
      await this.dreamService.clearAllData();

      const currentUser = await firstValueFrom(
        this.firebaseAuthService.currentUser$
      );
      if (currentUser?.uid && currentUser?.uid.length > 0) {
        //Clear firestore stored tags and dreams
        await this.firebaseBackupService.deleteAllDreams();

        //Clear firestore stored tags and dreams
        await this.firebaseBackupService.deleteAllTags();
      }

      // Clear localStorage (for any remaining web data)
      localStorage.clear();

      // // Reset dark mode to default
      // await this.configService.saveDarkModePreference(true);
      // this.configService.enableDarkMode();
      // this.darkMode = true;

      console.log("All data cleaned successfully");

      // Show success message
      const successAlert = await this.alertController.create({
        header: this.translate.instant("CLEAN_DATA.SUCCESS_HEADER"),
        message: this.translate.instant("CLEAN_DATA.SUCCESS_MESSAGE"),
        buttons: ["OK"],
      });
      await successAlert.present();
    } catch (error) {
      console.error("Error clearing data:", error);

      // Show error message
      const errorAlert = await this.alertController.create({
        header: "Error",
        message: "There was an error clearing some data. Please try again.",
        buttons: ["OK"],
      });
      await errorAlert.present();
    }
  }

  private async clearAllPreferences(): Promise<void> {
    try {
      // Get all keys from Preferences
      const keys = await Preferences.keys();

      // Remove each key individually
      for (const key of keys.keys) {
        await Preferences.remove({ key });
        console.log(`Removed preference key: ${key}`);
      }

      console.log("All Capacitor Preferences cleared");
    } catch (error) {
      console.error("Error clearing Preferences:", error);
      throw error;
    }
  }

  private async showAlert(header: string, message: string): Promise<void> {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ["OK"],
    });
    await alert.present();
  }

  async loadBackUp() {
    try {
      const backedUpDreams = await this.firebaseBackupService.getAllDreams();
      const backedUpTags = await this.firebaseBackupService.getAllTags();
      console.log("manuXX assassa", backedUpTags);
      console.log("manuXX ddddsdsassassa", backedUpDreams);
      this.dreamService.setAllDreamsOverwrite(backedUpDreams);
      this.dreamService.setAllTagsOverwrite(backedUpTags);

      const alert = await this.alertController.create({
        header: this.translate.instant("BACKUP.LOADED.TITLE"),
        message: this.translate.instant("BACKUP.LOADED.MESSAGE"),
        buttons: ["OK"],
        cssClass: "success-alert",
      });
      await alert.present();
    } catch (err) {}
  }

  goToDebug() {
    this.router.navigate(["/tabs/test"]);
  }

  goToDebug2() {
    this.router.navigate(["/tabs/test2"]);
  }

  goToDebug3() {
    this.router.navigate(["/test3"]);
  }

  async goToDebug4() {
    const confirmation = await this.toastNotifierService.presentToast(
      "Testing toast",
      ToastLevelEnum.INFO,
      "bottom",
      600000,
      "arrow-back"
    );
  }

  async goToDebug5() {
    await Preferences.remove({ key: "LAST_BACKUP_DATE" });
  }

  async getCachedUserPhoto(): Promise<string | null> {
    const { value } = await Preferences.get({ key: "userPhoto" });
    return value;
  }

  async cacheUserPhoto(photoUrl: string): Promise<string> {
    try {
      const response = await fetch(photoUrl);

      // Check if the response is OK and of image type
      const contentType = response.headers.get("content-type") || "";
      if (!response.ok || !contentType.startsWith("image/")) {
        console.warn("Invalid photo response:", response.status, contentType);
        return "";
      }

      const blob = await response.blob();
      const base64 = (await this.convertBlobToBase64(blob)) as string;

      await Preferences.set({
        key: "userPhoto",
        value: base64,
      });

      return base64;
    } catch (err) {
      console.error("Error caching user photo:", err);
      return "";
    }
  }

  private convertBlobToBase64(
    blob: Blob
  ): Promise<string | ArrayBuffer | null> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  }

  async checkNotificationPermission(): Promise<boolean> {
    if (!LocalNotifications) {
      return false;
      console.error("No local notifications provider");
    }
    const perm = await LocalNotifications.checkPermissions();
    return perm.display === "granted";
  }

  async toggleNotificationPermission() {
    if (this.notificationsLoading) return;
    this.notificationsLoading = true;
    if (!LocalNotifications) {
      console.error("Error no LN:");
      this.notificationsEnabled = false;
      this.notificationsLoading = false;
      return;
    }
    if (this.notificationsEnabled) {
      console.error("Error no LN 2:");
      await LocalNotifications.cancel({ notifications: [{ id: 1 }] });
      this.notificationsEnabled = false;
      this.notificationsLoading = false;
      return;
    }
    const permResult = await LocalNotifications.requestPermissions();
    if (permResult.display === "granted") {
      await this.configService.scheduleDailyNotificationByLang();
      this.notificationsEnabled = true;
    } else {
      this.notificationsEnabled = false;
    }
    this.notificationsLoading = false;
  }

  async sendTestNotification() {
    if (!LocalNotifications) {
      console.warn("LocalNotifications plugin not available");
      await this.toastNotifierService.presentToast(
        "LocalNotifications plugin not available",
        ToastLevelEnum.ERROR,
        "bottom"
      );
      return;
    }

    // Check or request permissions first
    const perm = await LocalNotifications.checkPermissions();
    if (perm.display !== "granted") {
      const request = await LocalNotifications.requestPermissions();
      if (request.display !== "granted") {
        console.warn("Notification permission not granted");
        await this.toastNotifierService.presentToast(
          "Notification permission not granted",
          ToastLevelEnum.WARNING,
          "bottom"
        );
        return;
      }
    }

    // Schedule for 1 minute from now
    const triggerTime = new Date(Date.now() + 60 * 1000); // +1 minute

    const notification = {
      id: Math.floor(Date.now() / 1000) % 2147483647,
      title: "🕐 Test Notification",
      body: "This is your test notification — it was scheduled 1 minute ago!",
      schedule: { at: triggerTime },
      smallIcon: "ic_notification",
      largeIcon: "ic_notification",
      extra: { test: true, scheduledAt: triggerTime.toISOString() },
    };

    try {
      await LocalNotifications.schedule({ notifications: [notification] });
      console.log("Test notification scheduled for:", triggerTime);
      await this.toastNotifierService.presentToast(
        `Test notification scheduled for ${triggerTime.toLocaleTimeString()}`,
        ToastLevelEnum.INFO,
        "bottom"
      );
    } catch (err) {
      console.error("Error scheduling test notification:", err);
      await this.toastNotifierService.presentToast(
        "Error scheduling test notification",
        ToastLevelEnum.ERROR,
        "bottom"
      );
    }
  }

  async exportDreamsPdf() {
    const dreams = await this.dreamService.getAllDreams();
    this.dreamPdfService.exportDreamsToPdf(dreams);
  }

  async deletePermanentAccount() {
    const alert = await this.alertController.create({
      header: this.translate.instant("DELETE_PERMANENT_ACCOUNT.HEADER"),
      message: this.translate.instant("DELETE_PERMANENT_ACCOUNT.MESSAGE"),
      buttons: [
        {
          text: this.translate.instant("DELETE_PERMANENT_ACCOUNT.CANCEL"),
          role: "cancel",
          cssClass: "secondary",
        },
        {
          text: this.translate.instant("DELETE_PERMANENT_ACCOUNT.CONFIRM"),
          cssClass: "danger",
          handler: async () => {
            await this.firebaseAuthService.deleteAccountWithReauth();
            window.location.replace("/onboarding");
          },
        },
      ],
    });
    await alert.present();
  }
}
