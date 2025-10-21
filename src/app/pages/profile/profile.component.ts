import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, IonicModule } from '@ionic/angular';
import { ConfigService } from 'src/app/shared/services/config.service';
import { DreamService } from 'src/app/shared/services/dream.service';
import { Preferences } from '@capacitor/preferences';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';


interface User {
  name: string;
  email: string;
  avatar: string;
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

  constructor(
    private router: Router,
    private alertController: AlertController,
    private configService: ConfigService,
    private dreamService: DreamService,
    private translate: TranslateService
  ) { }

  async ngOnInit() {
    this.darkMode = await this.configService.isDarkMode();
    const savedLang = localStorage.getItem("lang") || "en";
    this.selectedLanguage = savedLang; // Sin traducción aquí: se hará en template
    this.setLanguage(savedLang);
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
      header: 'Clean Data',
      message: 'This will remove all local data including dreams, settings, and preferences. Are you sure?',
      buttons: [
        {
          text: "Cancel",
          role: "cancel",
          cssClass: "secondary",
        },
        {
          text: 'Clean',
          cssClass: 'danger',
          handler: async () => {
            await this.performCleanData();
          }
        }
      ]
    });

    await alert.present();
  }

  private performCloseSession(): void {
    localStorage.removeItem("userToken");
    this.router.navigate(["/login"]);
  }

  private async performCleanData(): Promise<void> {
    try {
      console.log('Starting comprehensive data cleanup...');

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

      console.log('All data cleaned successfully');

      // Show success message
      const successAlert = await this.alertController.create({
        header: 'Success',
        message: 'All local data has been cleared successfully.',
        buttons: ['OK']
      });
      await successAlert.present();

    } catch (error) {
      console.error('Error clearing data:', error);

      // Show error message
      const errorAlert = await this.alertController.create({
        header: 'Error',
        message: 'There was an error clearing some data. Please try again.',
        buttons: ['OK']
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

      console.log('All Capacitor Preferences cleared');
    } catch (error) {
      console.error('Error clearing Preferences:', error);
      throw error;
    }
  }
}
