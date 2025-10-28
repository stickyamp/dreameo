import { CommonModule } from "@angular/common";
import { Component, OnInit, Input, ChangeDetectorRef } from "@angular/core";
import { Router } from "@angular/router";
import {
  AlertController,
  IonicModule,
  PopoverController,
} from "@ionic/angular";
import { ConfigService } from "src/app/shared/services/config.service";
import { DreamService } from "@/app/shared/services/dreams/dream.base.service";
import { AuthService } from "src/app/shared/services/auth.service";
import { FirebaseAuthService } from "src/app/shared/services/firebase-auth.service";
import { Preferences } from "@capacitor/preferences";
import { TranslateModule, TranslateService } from "@ngx-translate/core";
import { FormsModule } from "@angular/forms";
import { LoggerService } from "@/app/shared/services/log.service";

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
    avatar: "assets/avatar.jpg",
  };

  darkMode: boolean = false;
  selectedLanguage: string = "en";
  isUserLogged: boolean = true;
  isGoogleUserLogged: boolean = false;
  isConnectingGoogle: boolean = false;

  constructor(
    private router: Router,
    private alertController: AlertController,
    private configService: ConfigService,
    private dreamService: DreamService,
    private authService: AuthService,
    private firebaseAuthService: FirebaseAuthService,
    private translate: TranslateService,
    private popoverController: PopoverController,
    private cdr: ChangeDetectorRef,
    private logService: LoggerService
  ) {}

  async ngOnInit() {
    this.darkMode = await this.configService.isDarkMode();
    const savedLang = localStorage.getItem("lang") || "en";
    this.selectedLanguage = savedLang; // Sin traducción aquí: se hará en template
    this.setLanguage(savedLang);

    // Verificar si hay usuario de Google logeado
    const googleUser = this.firebaseAuthService.getCurrentUser();
    if (googleUser) {
      this.user = {
        name: googleUser.displayName || googleUser.email.split("@")[0],
        email: googleUser.email,
        avatar: "assets/avatar.jpg",
      };
      this.isGoogleUserLogged = true;
      this.isUserLogged = true;
    } else {
      // Si no hay usuario de Google, verificar usuario básico
      const currentUser = this.authService.getCurrentUser();
      if (currentUser) {
        this.user = {
          name: currentUser.username,
          email: currentUser.email,
          avatar: "assets/avatar.jpg",
        };
        this.isUserLogged = true;
        this.isGoogleUserLogged = false;
      } else {
        this.isUserLogged = false;
        this.isGoogleUserLogged = false;
      }
    }

    // Suscribirse a cambios en el estado de autenticación de Firebase
    this.firebaseAuthService.currentUser$.subscribe((user) => {
      console.log("Firebase user state changed:", user);
      if (user) {
        this.user = {
          name: user.displayName || user.email.split("@")[0],
          email: user.email,
          avatar: "assets/avatar.jpg",
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
            avatar: "assets/avatar.jpg",
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

  // async closeSession(): Promise<void> {
  //   const alert = await this.alertController.create({
  //     header: "Close Session",
  //     message: "Are you sure you want to close your session?",
  //     buttons: [
  //       {
  //         text: "Cancel",
  //         role: "cancel",
  //         cssClass: "secondary",
  //       },
  //       {
  //         text: "Close",
  //         cssClass: "danger",
  //         handler: () => {
  //           this.performCloseSession();
  //         },
  //       },
  //     ],
  //   });

  //   await alert.present();
  // }

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
        this.user = {
          name: currentUser.displayName || currentUser.email.split("@")[0],
          email: currentUser.email,
          avatar: "assets/avatar.jpg",
        };
        this.isGoogleUserLogged = true;
        this.isUserLogged = true;

        console.log(
          "User state updated - isGoogleUserLogged:",
          this.isGoogleUserLogged
        );

        // Forzar detección de cambios
        this.cdr.detectChanges();

        await this.showSuccessAlert(
          this.translate.instant("profile.googleConnected") ||
            "Google Account Connected",
          this.translate.instant("profile.googleConnectedMessage") ||
            "Your Google account has been connected successfully."
        );
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
      this.router.navigate(["/login"]);
    } catch (error) {
      console.error("Error during logout:", error);
      // Fallback: intentar navegar a login de todas formas
      this.router.navigate(["/login"]);
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

  goToDebug() {
    this.router.navigate(["/tabs/test"]);
  }
}
