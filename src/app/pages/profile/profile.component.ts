import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, IonicModule } from '@ionic/angular';

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
    private alertController: AlertController
  ) { }

  ngOnInit() {
    this.loadDarkModePreference();
  }

  goBack(): void {
    this.router.navigate(['/home']);
  }

  navigateToLanguage(): void {
    this.router.navigate(['/language-selection']);
  }

  toggleDarkMode(event: any): void {
    this.darkMode = event.detail.checked;
    this.saveDarkModePreference(this.darkMode);
    document.body.classList.toggle('dark', this.darkMode);
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
      message: 'This will remove all local data. Are you sure?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary'
        },
        {
          text: 'Clean',
          cssClass: 'danger',
          handler: () => {
            this.performCleanData();
          }
        }
      ]
    });

    await alert.present();
  }

  private loadDarkModePreference(): void {
    const savedMode = localStorage.getItem('darkMode');
    this.darkMode = savedMode === 'true';
    document.body.classList.toggle('dark', this.darkMode);
  }

  private saveDarkModePreference(enabled: boolean): void {
    localStorage.setItem('darkMode', enabled.toString());
  }

  private performCloseSession(): void {
    localStorage.removeItem('userToken');
    this.router.navigate(['/login']);
  }

  private performCleanData(): void {
    localStorage.clear();
    console.log('Data cleaned successfully');
  }
}