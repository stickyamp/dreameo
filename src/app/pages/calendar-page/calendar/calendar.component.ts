import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { CommonModule } from "@angular/common";
import { IonicModule, ModalController } from "@ionic/angular";
import { DreamService } from "../../../shared/services/dream.service";
import { Dream } from "../../../models/dream.model";
import { AddDreamComponent } from "../../add-dream/add-dream.component";
import { DreamListComponent } from "../../dream-list/dream-list.component";
import { ShowDreamsListDirective } from "src/app/shared/directives/add-dream-open-modal.directive";

@Component({
  selector: "app-calendar",
  templateUrl: "./calendar.component.html",
  styleUrls: ["./calendar.component.scss"],
  standalone: true,
  imports: [CommonModule, IonicModule, ShowDreamsListDirective],
})
export class CalendarComponent implements OnInit {
  currentDate = new Date();
  selectedDate?: string;
  modalSendDate?: string;
  calendarDays: CalendarDay[] = [];
  daysOfWeek = ["D", "L", "M", "M", "J", "V", "S"];
  @ViewChild("modalOpener") modalOpener!: ShowDreamsListDirective;
  @ViewChild("dt", { read: ElementRef })
  datetimeEl?: ElementRef<HTMLIonDatetimeElement>;
  private decorateScheduled = false;

  constructor(
    private dreamService: DreamService,
    private modalController: ModalController
  ) {}

  ngOnInit() {
    this.generateCalendar();

    // Subscribe to dreams changes to update calendar and refresh moon badges
    this.dreamService.dreams$.subscribe(() => {
      this.generateCalendar();
      this.decorateMoonBadges();
    });
  }

  onDateChange(event: CustomEvent) {
    const value = (event as any).detail?.value as string | string[] | undefined;
    if (!value) return;
    const dateStr = Array.isArray(value) ? value[0] : value;
    const date = new Date(dateStr);
    const normalized = this.formatDate(date);
    this.selectedDate = normalized;
    this.showDreamsList(normalized);
  }

  ngAfterViewInit() {
    // After view init, attempt to render moon badges
    setTimeout(() => this.safeDecorate(), 0);
    // Re-decorate when the month view changes (observe shadow DOM mutations)
    try {
      const host = this.datetimeEl?.nativeElement;
      const shadow = (host as any)?.shadowRoot as ShadowRoot | undefined;
      if (!shadow) return;
      const calendarGrid =
        shadow.querySelector('[part="calendar-body"]') || shadow;
      const observer = new MutationObserver(() => {
        if (this.decorateScheduled) return;
        this.decorateScheduled = true;
        setTimeout(() => {
          this.safeDecorate();
          this.decorateScheduled = false;
        }, 0);
      });
      observer.observe(calendarGrid, { childList: true, subtree: true });
    } catch {
      // ignore observer errors
    }
  }

  private safeDecorate() {
    try {
      this.decorateMoonBadges();
    } catch {
      /* do nothing */
    }
  }

  private decorateMoonBadges() {
    const host = this.datetimeEl?.nativeElement;
    if (!host) return;
    const shadow = (host as any).shadowRoot as ShadowRoot | undefined;
    if (!shadow) return;
    // Read visible month/year
    const monthYearEl = shadow.querySelector(
      '[part="calendar-month-year"]'
    ) as HTMLElement | null;
    let visibleYear = new Date().getFullYear();
    let visibleMonthIndex = new Date().getMonth();
    if (monthYearEl) {
      const text = (monthYearEl.textContent || "").toLowerCase();
      const months = [
        "enero",
        "febrero",
        "marzo",
        "abril",
        "mayo",
        "junio",
        "julio",
        "agosto",
        "septiembre",
        "octubre",
        "noviembre",
        "diciembre",
      ];
      const foundIndex = months.findIndex((m) => text.includes(m));
      if (foundIndex >= 0) visibleMonthIndex = foundIndex;
      const yearMatch = text.match(/\d{4}/);
      if (yearMatch) visibleYear = parseInt(yearMatch[0], 10);
    }
    const dayButtons = shadow.querySelectorAll('[part="calendar-day"]');
    dayButtons.forEach((el) => {
      const button = el as HTMLElement;
      // Ensure positioning context for the badge
      if (getComputedStyle(button).position === "static") {
        button.style.position = "relative";
      }
      // Prefer attribute date if available (most precise)
      const attrIso =
        button.getAttribute("data-day") ||
        button.getAttribute("aria-label") ||
        button.getAttribute("data-date") ||
        "";
      const attrMatch = attrIso.match(/\d{4}-\d{2}-\d{2}/);
      if (attrMatch) {
        this.toggleMoonBadge(button, attrMatch[0]);
        return;
      }

      // Fallback: Skip cells outside of month and build date from header
      const partAttr = button.getAttribute("part") || "";
      if (partAttr.includes("outside")) return;
      const text = (button.textContent || "").trim();
      const dayNum = parseInt(text, 10);
      if (isNaN(dayNum)) return;
      const mm = String(visibleMonthIndex + 1).padStart(2, "0");
      const dd = String(dayNum).padStart(2, "0");
      const key = `${visibleYear}-${mm}-${dd}`;
      this.toggleMoonBadge(button, key);
    });
  }

  private toggleMoonBadge(button: HTMLElement, dateKey: string) {
    const count = this.getDreamCount(dateKey);
    const existing = button.querySelector(".moon-badge");
    if (count > 0 && !existing) {
      const badge = document.createElement("span");
      badge.className = "moon-badge moon-icon";
      badge.textContent = "🌙";
      badge.style.position = "absolute";
      badge.style.bottom = "6px";
      badge.style.left = "50%";
      badge.style.transform = "translateX(-50%)";
      badge.style.fontSize = "14px";
      badge.style.color = "var(--color-text-primary)";
      button.appendChild(badge);
    } else if (count === 0 && existing) {
      existing.remove();
    }
  }

  generateCalendar() {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();

    // First day of the month
    const firstDay = new Date(year, month, 1);
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0);

    // Start from Sunday of the week containing the first day
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - startDate.getDay());

    // End on Saturday of the week containing the last day
    const endDate = new Date(lastDay);
    endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));

    this.calendarDays = [];
    const current = new Date(startDate);

    while (current <= endDate) {
      this.calendarDays.push({
        date: this.formatDate(current),
        day: current.getDate(),
        currentMonth: current.getMonth() === month,
      });
      current.setDate(current.getDate() + 1);
    }
  }

  formatDate(date: Date): string {
    return date.toISOString().split("T")[0];
  }

  getMonthYearLabel(): string {
    const months = [
      "Enero",
      "Febrero",
      "Marzo",
      "Abril",
      "Mayo",
      "Junio",
      "Julio",
      "Agosto",
      "Septiembre",
      "Octubre",
      "Noviembre",
      "Diciembre",
    ];
    return `${
      months[this.currentDate.getMonth()]
    } ${this.currentDate.getFullYear()}`;
  }

  previousMonth() {
    this.currentDate.setMonth(this.currentDate.getMonth() - 1);
    this.generateCalendar();
  }

  nextMonth() {
    this.currentDate.setMonth(this.currentDate.getMonth() + 1);
    this.generateCalendar();
  }

  selectDay(day: CalendarDay) {
    if (!day.currentMonth) return;

    this.selectedDate = day.date;
    this.showDreamsList(day.date);
  }

  async showDreamsList(date: string) {
    this.modalSendDate = date;
    console.log(this.modalSendDate);
    this.modalOpener.goToDayDreamList(date);
  }

  async addDream() {
    const modal = await this.modalController.create({
      component: AddDreamComponent,
      componentProps: {
        selectedDate: this.selectedDate || this.formatDate(new Date()),
      },
    });

    modal.onDidDismiss().then(() => {
      // Refresh calendar if needed
      this.generateCalendar();
    });

    await modal.present();
  }

  hasDreams(date: string): boolean {
    return this.dreamService.hasDreams(date);
  }

  isSelected(date: string): boolean {
    return this.selectedDate === date;
  }

  isToday(date: string): boolean {
    return this.formatDate(new Date()) === date;
  }

  trackByDay(index: number, day: CalendarDay): string {
    return day.date;
  }

  isFirstDayOfMonth(day: CalendarDay): boolean {
    return day.day === 1 && day.currentMonth;
  }

  getDreamCount(date: string): number {
    return this.dreamService.getDreamsByDate(date).length;
  }
}

interface CalendarDay {
  date: string;
  day: number;
  currentMonth: boolean;
}
