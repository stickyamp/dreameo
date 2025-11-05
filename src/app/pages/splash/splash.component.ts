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
    // Simple initialization without potential error sources
    setTimeout(() => {
      this.goToCalendar();
    }, 1500);
  }

  goToCalendar() {
    this.router.navigate(["/tabs/calendar"]);
  }
}
