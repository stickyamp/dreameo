import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { IonicModule, Platform } from '@ionic/angular';
// import { StatusBar, Style } from '@capacitor/status-bar';
// import { SplashScreen } from '@capacitor/splash-screen';
import { DreamService } from './shared/services/dreams/dream.base.service';
import { ConfigService } from './shared/services/config.service';
import { provideDreamService } from './shared/services/providers';

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
  imports: [CommonModule, RouterOutlet, IonicModule],
  providers: [provideDreamService()]
})
export class AppComponent implements OnInit {
  constructor(
    private platform: Platform,
    private dreamService: DreamService,
    private configService: ConfigService
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
    this.configService.enableLightMode();
  }
}
