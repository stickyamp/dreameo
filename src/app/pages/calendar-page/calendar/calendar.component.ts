import {
  Component,
  ElementRef,
  inject,
  OnInit,
  ViewChild,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { IonicModule, ModalController, NavController } from "@ionic/angular";
import { Dream } from "../../../models/dream.model";
import { AddDreamComponent } from "../../add-dream/add-dream.component";
import { DreamListComponent } from "../../dream-list/dream-list.component";
import { ShowDreamsListDirective } from "src/app/shared/directives/add-dream-open-modal.directive";
import { TranslateModule, TranslateService } from "@ngx-translate/core";
import { ConfigService } from "@/app/shared/services/config.service";
import { DreamService } from "@/app/shared/services/dreams/dream.base.service";

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
  private dreamService: DreamService = inject(DreamService);

  constructor(
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
    // Calcular diferencia porcentual real entre este mes y el anterior
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    // Conteo actual
    const dreamsCurrent = this.getMonthlyDreamCount();
    // Conteo mes anterior
    let prevMonth = month - 1;
    let prevYear = year;
    if (prevMonth < 0) {
      prevMonth = 11;
      prevYear -= 1;
    }
    // Mover la fecha para calcular el mes anterior
    const prevStart = new Date(prevYear, prevMonth, 1);
    const prevEnd = new Date(prevYear, prevMonth + 1, 0);
    let prevCount = 0;
    for (
      let d = new Date(prevStart);
      d <= prevEnd;
      d.setDate(d.getDate() + 1)
    ) {
      prevCount += this.getDreamCount(this.formatDate(d));
    }
    if (prevCount === 0 && dreamsCurrent > 0) {
      return 100; // de 0 a algo, 100%
    }
    if (prevCount === 0 && dreamsCurrent === 0) {
      return 0;
    }
    return Math.round(((dreamsCurrent - prevCount) / prevCount) * 100);
  }

  generateWeeklyData() {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0);

    // Construir las semanas del mes basadas en domingo a sábado
    let weeks: { start: number; end: number; count: number }[] = [];
    let day = 1;
    const daysInMonth = endDate.getDate();
    while (day <= daysInMonth) {
      const weekStartDate = new Date(year, month, day);
      // La semana empieza en el día actual
      let startDay = weekStartDate.getDate();
      // La semana termina en el sábado o el último día del mes
      let daysLeft = 7 - weekStartDate.getDay();
      let endDay = Math.min(day + daysLeft - 1, daysInMonth);
      let weekCount = 0;
      for (let d = startDay; d <= endDay; d++) {
        let date = new Date(year, month, d);
        weekCount += this.getDreamCount(this.formatDate(date));
      }
      weeks.push({ start: startDay, end: endDay, count: weekCount });
      day = endDay + 1;
    }

    // Como máximo 6 barras (rellenar si hay menos con barras vacías)
    while (weeks.length < 6) {
      weeks.push({ start: 0, end: 0, count: 0 });
    }
    this.weeklyData = weeks.map((w, idx) => ({
      week: w.start > 0 ? `${w.start}-${w.end}` : "",
      count: w.count,
      height: 0, // se ajusta abajo
      isHighest: false,
    }));
    const maxCount = Math.max(...this.weeklyData.map((w) => w.count));
    const minPercent = 10;
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
