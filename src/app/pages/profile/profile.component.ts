import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { AlertController, IonicModule } from "@ionic/angular";
import { TranslateService } from "@ngx-translate/core";
import { ConfigService } from "src/app/shared/services/config.service";
import { FormsModule } from "@angular/forms";
import { TranslateModule } from "@ngx-translate/core";

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
    private translate: TranslateService
  ) {}

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
      header: "Clean Data",
      message: "This will remove all local data. Are you sure?",
      buttons: [
        {
          text: "Cancel",
          role: "cancel",
          cssClass: "secondary",
        },
        {
          text: "Clean",
          cssClass: "danger",
          handler: () => {
            this.performCleanData();
          },
        },
      ],
    });

    await alert.present();
  }

  private performCloseSession(): void {
    localStorage.removeItem("userToken");
    this.router.navigate(["/login"]);
  }

  private performCleanData(): void {
    localStorage.clear();
    console.log("Data cleaned successfully");
  }
}
