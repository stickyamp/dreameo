import { Component, HostBinding } from "@angular/core";
import { CommonModule } from "@angular/common";
import { IonicModule } from "@ionic/angular";
import { TranslateModule } from "@ngx-translate/core";
import {
  trigger,
  state,
  style,
  transition,
  animate,
} from "@angular/animations";

@Component({
  selector: "app-splash",
  templateUrl: "./splash.component.html",
  styleUrls: ["./splash.component.scss"],
  standalone: true,
  imports: [CommonModule, IonicModule, TranslateModule],
  animations: [
    trigger("fadeIn", [
      state("void", style({ opacity: 0 })),
      state("*", style({ opacity: 1 })),
      transition("void => *", animate("300ms ease-in")),
    ]),
  ],
})
export class SplashComponent {
  constructor() {}
}
