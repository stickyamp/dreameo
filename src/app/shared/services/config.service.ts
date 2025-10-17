import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  constructor() {
    setTimeout(async () => {
      if (await this.isDarkMode()) {
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

  public async saveDarkModePreference(enabled: boolean): Promise<void> {
    await Preferences.set({
      key: 'darkMode',
      value: enabled.toString()
    });
  }

  public async isDarkMode(): Promise<boolean> {
    const result = await Preferences.get({ key: 'darkMode' });
    return result.value === 'true';
  }
}
