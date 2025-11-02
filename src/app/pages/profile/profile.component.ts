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
import { FirebaseBackupService } from "@/app/shared/services/firebase-backup-2.service";
import {
  ToastLevelEnum,
  ToastNotifierService,
} from "@/app/shared/services/toast-notifier";

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
  imports: [IonicModule, CommonModule, FormsModule, TranslateModule],
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
  private localNotifications: any = null;

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
    private toastNotifierService: ToastNotifierService
  ) {}

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
          this.isUserLogged = true;
          this.isGoogleUserLogged = false;
        } else {
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

  navigateToLanguage(): void {
    this.router.navigate(["/language-selection"]);
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

  changeLang(event: any): void {
    const lang = event.detail ? event.detail.value : event;
    this.setLanguage(lang);
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
      header: this.translate.instant("profile.logoutHeader"),
      message: this.translate.instant("profile.logoutMessage"),
      buttons: [
        {
          text: this.translate.instant("profile.cancel"),
          role: "cancel",
          cssClass: "secondary",
        },
        {
          text: this.translate.instant("profile.confirmLogout"),
          cssClass: "danger",
          handler: () => this.performCloseSession(),
        },
      ],
    });
    await alert.present();
  }

  async cleanData(): Promise<void> {
    const alert = await this.alertController.create({
      header: "Clean Data",
      message:
        "This will remove all local data including dreams, settings, and preferences. Are you sure?",
      buttons: [
        {
          text: "Cancel",
          role: "cancel",
          cssClass: "secondary",
        },
        {
          text: "Clean",
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

      // Clear localStorage (for any remaining web data)
      localStorage.clear();

      // Reset dark mode to default
      await this.configService.saveDarkModePreference(false);
      this.configService.enableLightMode();
      this.darkMode = false;

      console.log("All data cleaned successfully");

      // Show success message
      const successAlert = await this.alertController.create({
        header: "Success",
        message: "All local data has been cleared successfully.",
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

  private async showSuccessAlert(
    header: string,
    message: string
  ): Promise<void> {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ["OK"],
      cssClass: "success-alert",
    });
    await alert.present();
  }

  async loadBackUp() {
    const backedUpDreams = await this.firebaseBackupService.getAllDreams();
    const backedUpTags = await this.firebaseBackupService.getAllTags();
    console.log("manuXX assassa", backedUpTags);
    console.log("manuXX ddddsdsassassa", backedUpDreams);
    this.dreamService.setAllDreamsOverwrite(backedUpDreams);
    this.dreamService.setAllTagsOverwrite(backedUpTags);
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

  private async getLocalNotifications() {
    if (!this.localNotifications) {
      // dynamic import solo en runtime
      try {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const mod = await import("@capacitor/local-notifications");
        this.localNotifications = mod.LocalNotifications;
      } catch {
        this.localNotifications = null;
      }
    }
    return this.localNotifications;
  }

  async checkNotificationPermission(): Promise<boolean> {
    const LN = await this.getLocalNotifications();
    if (!LN) return false;
    const perm = await LN.checkPermissions();
    return perm.display === "granted";
  }

  async toggleNotificationPermission() {
    if (this.notificationsLoading) return;
    this.notificationsLoading = true;
    const LN = await this.getLocalNotifications();
    if (!LN) {
      this.notificationsEnabled = false;
      this.notificationsLoading = false;
      return;
    }
    if (this.notificationsEnabled) {
      await LN.cancel({ notifications: [{ id: 1 }] });
      this.notificationsEnabled = false;
      this.notificationsLoading = false;
      return;
    }
    const permResult = await LN.requestPermissions();
    if (permResult.display === "granted") {
      await this.scheduleDailyNotificationByLang();
      this.notificationsEnabled = true;
    } else {
      this.notificationsEnabled = false;
    }
    this.notificationsLoading = false;
  }

  async scheduleDailyNotificationByLang() {
    const LN = await this.getLocalNotifications();
    if (!LN) return;
    const lang = this.selectedLanguage;
    let title = "";
    let body = "";
    if (lang === "es") {
      title = "No olvides registrar tu sueño";
      body = "¡Abre la app y escribe tu sueño de hoy! 💤";
    } else {
      title = "Don't forget to log your dream";
      body = "Open the app and write down your dream! 💤";
    }
    await LN.schedule({
      notifications: [
        {
          id: 1,
          title,
          body,
          schedule: { repeats: true, on: { hour: 10, minute: 0 } },
          sound: null,
          smallIcon: "ic_stat_iconconfig",
          actionTypeId: "",
          extra: null,
        },
      ],
    });
  }
}
