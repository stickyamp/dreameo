import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  constructor() {
  }

  public enableDarkMode() {
    document.documentElement.classList.add('ion-palette-dark');
    document.documentElement.classList.remove('ion-palette-light');
  }

  public enableLightMode() {
    document.documentElement.classList.remove('ion-palette-dark');
    document.documentElement.classList.add('ion-palette-light');

  }
}
