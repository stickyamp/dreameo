import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { IonicModule, Platform } from '@ionic/angular';
// import { StatusBar, Style } from '@capacitor/status-bar';
// import { SplashScreen } from '@capacitor/splash-screen';
import { DreamService } from './shared/services/dream.service';

@Component({
  selector: 'app-root',
  template: `
    <ion-app>
      <router-outlet></router-outlet>
    </ion-app>
  `,
  styles: [`
    ion-app {
      background: linear-gradient(135deg, #2d1b69 0%, #1a0f3d 100%);
    }
  `],
  standalone: true,
  imports: [CommonModule, RouterOutlet, IonicModule]
})
export class AppComponent implements OnInit {
  constructor(
    private platform: Platform,
    private dreamService: DreamService
  ) { }

  async ngOnInit() {
    try {
      await this.platform.ready();
      await this.initializeApp();
    } catch (error) {
      console.error('Error in ngOnInit:', error);
    }
  }

  private async initializeApp() {
    this.enableLightMode();
  }

  private enableDarkMode() {
    document.documentElement.classList.add('ion-palette-dark');
    document.documentElement.classList.remove('ion-palette-light');
  }

  private enableLightMode() {
    document.documentElement.classList.remove('ion-palette-light');
    document.documentElement.classList.add('ion-palette-light');

  }
}
