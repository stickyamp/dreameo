import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  constructor() {
    setTimeout(() => {
      if (this.isDarkMode()) {
        console.log("manuXX aa")
        this.enableDarkMode();
      }
      else {
        console.log("manuXX bb")
        this.enableLightMode();
      }

    }, 0);

  }

  public enableDarkMode() {
    console.log("manuXX", { ...document.documentElement.classList })
    document.documentElement.classList.remove('ion-palette-light');
    document.documentElement.classList.add('ion-palette-dark');
  }

  public enableLightMode() {
    document.documentElement.classList.remove('ion-palette-dark');
    document.documentElement.classList.add('ion-palette-light');

  }

  public saveDarkModePreference(enabled: boolean): void {
    localStorage.setItem('darkMode', enabled.toString());
  }

  public isDarkMode(): boolean {
    return Boolean(localStorage.getItem('darkMode')) ?? false;
  }
}
