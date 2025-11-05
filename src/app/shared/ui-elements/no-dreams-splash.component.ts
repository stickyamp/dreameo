// Component TypeScript (no-dreams.component.ts)
import { Component, Input } from "@angular/core";
import { IonicModule } from "@ionic/angular";
import { CommonModule } from "@angular/common";
import { TranslateDirective, TranslatePipe } from "@ngx-translate/core";
import { HttpClientModule } from "@angular/common/http";

@Component({
  selector: "app-no-dreams",
  standalone: true,
  imports: [IonicModule, CommonModule, HttpClientModule, TranslatePipe],
  templateUrl: "./no-dreams-splash.component.html",
  styleUrls: ["./no-dreams-splash.component.scss"],
})
export class NoDreamsComponent {
  @Input() isDaily: boolean = false;
  constructor() {}
  ngOnInit() {}
}
