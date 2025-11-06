import { Directive, EventEmitter, HostListener, Output } from "@angular/core";

@Directive({
  selector: "[tripleClick]",
  standalone: true,
})
export class TripleClickDirective {
  @Output() tripleClick = new EventEmitter<MouseEvent>();

  private clickCount = 0;
  private timeout: any;

  @HostListener("click", ["$event"])
  onClick(event: MouseEvent) {
    this.clickCount++;

    if (this.clickCount === 1) {
      // Start/reset the timer on the first click
      this.timeout = setTimeout(() => {
        this.clickCount = 0;
      }, 400); // Adjust max delay allowed between clicks
    }

    if (this.clickCount === 3) {
      clearTimeout(this.timeout);
      this.clickCount = 0;
      this.tripleClick.emit(event);
    }
  }
}
