import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, AlertController, ActionSheetController } from '@ionic/angular';
import { DreamService } from '../../shared/services/dream.service';
import { AuthService } from '../../shared/services/auth.service';
import { LanguageService } from '../../shared/services/language.service';
import { DreamStatistics, UserProfile } from '../../models/dream.model';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class ProfileComponent implements OnInit {
  userProfile: UserProfile = {
    name: 'Lucía',
    email: 'lucia.sanchez@email.com',
    darkMode: true
  };
  currentUser: any = null;

  statistics: DreamStatistics = {
    streakDays: 0,
    totalDreams: 0,
    goodDreams: 0,
    badDreams: 0
  };

  constructor(
    private dreamService: DreamService,
    private authService: AuthService,
    private languageService: LanguageService,
    private alertController: AlertController,
    private actionSheetController: ActionSheetController
  ) { }

  async ngOnInit() {
    // Load user profile
    this.dreamService.userProfile$.subscribe(profile => {
      this.userProfile = profile;
    });

    // Load current user from auth service
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }


  async toggleDarkMode(event: any) {
    this.userProfile.darkMode = event.detail.checked;

    if (this.userProfile.darkMode) {
      document.documentElement.classList.add('ion-palette-dark');
    } else {
      document.documentElement.classList.remove('ion-palette-dark');
    }

    await this.dreamService.updateUserProfile(this.userProfile);
  }

  async exportDreams() {
    try {
      const dreamData = await this.dreamService.exportDreams();

      // Create a downloadable file
      const blob = new Blob([dreamData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `dream-journal-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      await this.showAlert('Éxito', 'Los datos de tus sueños han sido exportados exitosamente.');
    } catch (error) {
      console.error('Error exporting dreams:', error);
      await this.showAlert('Error', 'No se pudieron exportar los datos.');
    }
  }

  async confirmClearData() {
    const alert = await this.alertController.create({
      header: 'Confirmar eliminación',
      message: '¿Estás seguro de que quieres eliminar todos los datos de los sueños? Esta acción no se puede deshacer.',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar todo',
          role: 'destructive',
          handler: () => {
            this.clearAllData();
          }
        }
      ]
    });

    await alert.present();
  }

  async clearAllData() {
    try {
      await this.dreamService.clearAllData();
      await this.showAlert('Datos eliminados', 'Todos los datos de los sueños han sido eliminados.');
    } catch (error) {
      console.error('Error clearing data:', error);
      await this.showAlert('Error', 'No se pudieron eliminar los datos.');
    }
  }

  async confirmLogout() {
    const alert = await this.alertController.create({
      header: 'Cerrar sesión',
      message: '¿Estás seguro de que quieres cerrar sesión?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Cerrar sesión',
          role: 'destructive',
          handler: () => {
            this.logout();
          }
        }
      ]
    });

    await alert.present();
  }

  async logout() {
    try {
      await this.authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
      await this.showAlert('Error', 'No se pudo cerrar sesión correctamente.');
    }
  }

  goBack() {
    window.history.back();
  }

  getCurrentLanguageName(): string {
    const currentLang = this.languageService.getCurrentLanguage();
    const language = this.languageService.getLanguageByCode(currentLang);
    return language ? `${language.flag} ${language.name}` : 'English';
  }

  async openLanguageSelector() {
    const actionSheet = await this.actionSheetController.create({
      header: 'Select Language',
      buttons: this.languageService.languages.map(lang => ({
        text: `${lang.flag} ${lang.name}`,
        handler: () => {
          this.languageService.setLanguage(lang.code);
          // Reload the page to apply the new language
          window.location.reload();
        }
      }))
    });
    await actionSheet.present();
  }

  private async showAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK']
    });
    await alert.present();
  }
}
