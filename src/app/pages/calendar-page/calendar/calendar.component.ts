import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { CommonModule } from "@angular/common";
import { IonicModule, ModalController, NavController } from "@ionic/angular";
import { DreamService } from "../../../shared/services/dream.service";
import { Dream } from "../../../models/dream.model";
import { AddDreamComponent } from "../../add-dream/add-dream.component";
import { DreamListComponent } from "../../dream-list/dream-list.component";
import { ShowDreamsListDirective } from "src/app/shared/directives/add-dream-open-modal.directive";
import { TranslateModule, TranslateService } from "@ngx-translate/core";
import { ConfigService } from "@/app/shared/services/config.service";

@Component({
  selector: "app-calendar",
  templateUrl: "./calendar.component.html",
  styleUrls: ["./calendar.component.scss"],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    ShowDreamsListDirective,
    TranslateModule,
  ],
})
export class CalendarComponent implements OnInit {
  currentDate = new Date();
  selectedDate?: string;
  modalSendDate?: string;
  calendarDays: CalendarDay[] = [];
  daysOfWeek = ["S", "M", "T", "W", "T", "F", "S"];
  weeklyData: WeeklyData[] = [];
  @ViewChild("modalOpener") modalOpener!: ShowDreamsListDirective;
  @ViewChild("dt", { read: ElementRef })
  datetimeEl?: ElementRef<HTMLIonDatetimeElement>;
  private decorateScheduled = false;

  constructor(
    private dreamService: DreamService,
    private modalController: ModalController,
    private navController: NavController,
    private translate: TranslateService,
    private configService: ConfigService
  ) {
    const lang = localStorage.getItem("lang") || "en";
    this.translate.use(lang);
  }

  ngOnInit() {
    this.updateLocalizedLabels();
    this.generateCalendar();
    this.generateWeeklyData();

    // Subscribe to dreams changes to update calendar and refresh moon badges
    this.dreamService.dreams$.subscribe(() => {
      this.generateCalendar();
      this.generateWeeklyData();
      this.decorateMoonBadges();
    });

    // Subscribe to language changes to update labels
    this.translate.onLangChange.subscribe(() => {
      this.updateLocalizedLabels();
      this.generateCalendar();
      this.generateWeeklyData();
    });
  }

  private updateLocalizedLabels() {
    // Días de la semana abreviados
    this.translate.get("CALENDAR.DAYS_SHORT").subscribe((days: string[]) => {
      if (Array.isArray(days) && days.length === 7) {
        this.daysOfWeek = days;
      } else {
        this.daysOfWeek = ["S", "M", "T", "W", "T", "F", "S"];
      }
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
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  // getMonthYearLabel(): string {
  //   const months = [
  //     "Enero",
  //     "Febrero",
  //     "Marzo",
  //     "Abril",
  //     "Mayo",
  //     "Junio",
  //     "Julio",
  //     "Agosto",
  //     "Septiembre",
  //     "Octubre",
  //     "Noviembre",
  //     "Diciembre",
  //   ];
  //   return `${months[this.currentDate.getMonth()]
  //     } ${this.currentDate.getFullYear()}`;
  // }
  getMonthYearLabel(): string {
    const months = this.translate.instant("CALENDAR.MONTHS") as string[];
    const monthNames =
      Array.isArray(months) && months.length === 12
        ? months
        : [
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
      monthNames[this.currentDate.getMonth()]
    } ${this.currentDate.getFullYear()}`;
  }

  previousMonth() {
    this.currentDate.setMonth(this.currentDate.getMonth() - 1);
    this.generateCalendar();
    this.generateWeeklyData();
  }

  nextMonth() {
    this.currentDate.setMonth(this.currentDate.getMonth() + 1);
    this.generateCalendar();
    this.generateWeeklyData();
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
      cssClass: (await this.configService.isDarkMode())
        ? "ion-palette-dark"
        : "ion-palette-light",
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

  // New methods for the updated UI
  goBack() {
    this.navController.back();
  }

  getMonthlyDreamCount(): number {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0);

    let count = 0;
    for (
      let d = new Date(startDate);
      d <= endDate;
      d.setDate(d.getDate() + 1)
    ) {
      const dateStr = this.formatDate(d);
      count += this.getDreamCount(dateStr);
    }
    return count;
  }

  getPercentageChange(): number {
    // Mock percentage change - you can implement real logic here
    return 12;
  }

  generateWeeklyData() {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0);

    // Genera exactamente 6 barras por mes, agregando por semanas del calendario (domingo a sábado)
    const daysInMonth = endDate.getDate();
    const firstDayWeekIndex = startDate.getDay(); // 0=Domingo ... 6=Sábado
    const weekBuckets: number[] = new Array(6).fill(0);

    for (let day = 1; day <= daysInMonth; day++) {
      const weekIndex = Math.min(
        5,
        Math.floor((day - 1 + firstDayWeekIndex) / 7)
      );
      const date = new Date(year, month, day);
      const dateStr = this.formatDate(date);
      weekBuckets[weekIndex] += this.getDreamCount(dateStr);
    }

    this.weeklyData = weekBuckets.map((count, idx) => ({
      week: (idx + 1).toString(),
      count,
      height: 0, // normalizado más abajo
      isHighest: false,
    }));

    // Normaliza alturas (0–100%) según el máximo del mes y aplica altura mínima
    const maxCount = Math.max(...this.weeklyData.map((w) => w.count));
    const minPercent = 10; // altura mínima visible para semanas con conteo > 0
    this.weeklyData.forEach((week) => {
      const pct = maxCount > 0 ? Math.round((week.count / maxCount) * 100) : 0;
      const clamped = Math.min(
        100,
        Math.max(week.count > 0 ? minPercent : 0, pct)
      );
      week.height = clamped;
      week.isHighest = week.count === maxCount && week.count > 0;
    });
  }
}

interface CalendarDay {
  date: string;
  day: number;
  currentMonth: boolean;
}

interface WeeklyData {
  week: string;
  count: number;
  height: number;
  isHighest: boolean;
}
