import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { IonicModule } from "@ionic/angular";
import { Router } from "@angular/router";
import { TranslateModule, TranslateService } from "@ngx-translate/core";

@Component({
  selector: "app-splash",
  templateUrl: "./splash.component.html",
  styleUrls: ["./splash.component.scss"],
  standalone: true,
  imports: [CommonModule, IonicModule, TranslateModule],
})
export class SplashComponent implements OnInit {
  constructor(
    private router: Router,
    private translate: TranslateService
  ) {}

  ngOnInit() {
    // Enable dark mode
    document.documentElement.classList.add("ion-palette-dark");
    
    // Set default language
    const lang = localStorage.getItem("lang") || "es";
    this.translate.use(lang);
  }

  goToCalendar() {
    this.router.navigate(["/tabs/calendar"]);
  }
}
