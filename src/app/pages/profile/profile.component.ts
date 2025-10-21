import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, IonicModule } from '@ionic/angular';
import { ConfigService } from 'src/app/shared/services/config.service';
import { DreamService } from 'src/app/shared/services/dream.service';
import { Preferences } from '@capacitor/preferences';

interface User {
  name: string;
  email: string;
  avatar: string;
}

@Component({
  selector: 'app-configuration',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  imports: [IonicModule, CommonModule],
  standalone: true
})
export class ProfileComponent implements OnInit {
  user: User = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    avatar: 'assets/avatar.jpg'
  };

  darkMode: boolean = false;
  selectedLanguage: string = 'English';

  constructor(
    private router: Router,
    private alertController: AlertController,
    private configService: ConfigService,
    private dreamService: DreamService
  ) { }

  async ngOnInit() {
    this.darkMode = await this.configService.isDarkMode();
  }

  goBack(): void {
    this.router.navigate(['/home']);
  }

  navigateToLanguage(): void {
    this.router.navigate(['/language-selection']);
  }

  toggleDarkMode(event: any): void {
    this.darkMode = event.detail.checked;
    this.configService.saveDarkModePreference(this.darkMode);

    if (this.darkMode) {
      this.configService.enableDarkMode();
    }
    else {
      this.configService.enableLightMode();

    }
  }

  async closeSession(): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Close Session',
      message: 'Are you sure you want to close your session?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary'
        },
        {
          text: 'Close',
          cssClass: 'danger',
          handler: () => {
            this.performCloseSession();
          }
        }
      ]
    });

    await alert.present();
  }

  async cleanData(): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Clean Data',
      message: 'This will remove all local data including dreams, settings, and preferences. Are you sure?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary'
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
    localStorage.removeItem('userToken');
    this.router.navigate(['/login']);
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