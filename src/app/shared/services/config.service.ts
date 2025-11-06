import { Injectable } from "@angular/core";
import { LocalNotifications } from "@capacitor/local-notifications";
import { Preferences } from "@capacitor/preferences";

@Injectable({
  providedIn: "root",
})
export class ConfigService {
  selectedLanguage: string = "en";

  constructor() {
    const savedLang = localStorage.getItem("lang") || "en";
    this.selectedLanguage = savedLang; // Sin traducción aquí: se hará en template
    setTimeout(async () => {
      if (await this.isDarkMode()) {
        console.log("manuXX aa");
        this.enableDarkMode();
      } else {
        console.log("manuXX bb");
        this.enableLightMode();
      }
    }, 0);
  }

  public enableDarkMode() {
    console.log("manuXX", { ...document.documentElement.classList });
    document.documentElement.classList.remove("ion-palette-light");
    document.documentElement.classList.add("ion-palette-dark");
  }

  public enableLightMode() {
    document.documentElement.classList.remove("ion-palette-dark");
    document.documentElement.classList.add("ion-palette-light");
  }

  public async saveDarkModePreference(enabled: boolean): Promise<void> {
    await Preferences.set({
      key: "darkMode",
      value: enabled.toString(),
    });
  }

  public async isDarkMode(): Promise<boolean> {
    const result = await Preferences.get({ key: "darkMode" });
    return (
      result.value === "true" ||
      result.value === undefined ||
      result.value === null
    );
  }

  public async scheduleDailyNotificationByLang() {
    if (!LocalNotifications) return;
    const lang = this.selectedLanguage;
    let title = "";
    let body = "";
    if (lang === "es") {
      title = "🌙 No olvides registrar tu sueño";
      body = "¡Abre la app y escribe tu sueño de hoy! 💤";
    } else {
      title = "🌙 Don't forget to log your dream";
      body = "Open the app and write down your dream! 💤";
    }
    await LocalNotifications.schedule({
      notifications: [
        {
          id: 1,
          title,
          body,
          schedule: { repeats: true, on: { hour: 10, minute: 0 } },
          smallIcon: "ic_star_notification",
          largeIcon: "ic_star_notification",
          actionTypeId: "",
          extra: null,
        },
      ],
    });
  }
}
