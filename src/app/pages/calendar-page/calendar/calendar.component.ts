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

  // ------ NUEVAS VARIABLES PARA DREAM MAP Y PROGRESO ------
  dreamDayPoints: { x: number; y: number; date: string }[] = [];
  polylineString: string = "";
  progressPercent: number = 0;
  filledDays: number = 0;
  totalMonthDays: number = 0;
  userRankLabel: string = "CALENDAR.RANK_ROOKIE"; // placeholder
  bgStars: { x: number; y: number; r: number }[] = [];

  // Variables para el sistema de progreso por niveles
  currentRankName: string = "CALENDAR.RANK_ROOKIE";
  nextRankName: string = "CALENDAR.RANK_NOVICE";
  currentDreamsCount: number = 0;
  dreamsNeededForNext: number = 10;
  progressToNextPercent: number = 0;

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
    this.updateDreamJourneyMap();
    this.updateRankProgress(); // Calcular progreso inicial
    // Suscripciones existentes:
    this.dreamService.dreams$.subscribe(() => {
      this.generateCalendar();
      this.generateWeeklyData();
      this.updateDreamJourneyMap();
      this.updateRankProgress(); // Recalcular cuando cambien los sueños
      this.decorateMoonBadges();
    });
    this.translate.onLangChange.subscribe(() => {
      this.updateLocalizedLabels();
      this.generateCalendar();
      this.generateWeeklyData();
      this.updateDreamJourneyMap();
      this.updateRankProgress();
    });
  }

  // Construye la lógica para calcular las posiciones de los sueños como estrellas
  updateDreamJourneyMap() {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0);
    const stars: { date: string; day: number }[] = [];
    let daysWithDream: Set<number> = new Set();
    for (let d = 1; d <= endDate.getDate(); d++) {
      const dateStr = this.formatDate(new Date(year, month, d));
      if (this.getDreamCount(dateStr) > 0) {
        stars.push({ date: dateStr, day: d });
        daysWithDream.add(d);
      }
    }
    // Área de dibujo del SVG (coincide con el viewBox 0 0 350 120)
    const width = 350;
    const height = 120;
    const marginX = 8;
    const marginTop = 10; // margen superior mínimo para no cortar
    const marginBottom = 10;
    const minY = marginTop;
    const maxY = height - marginBottom;

    const count = stars.length;
    this.dreamDayPoints = stars.map((s, idx) => {
      // Crear grupos/clusters aleatorios para formar figuras más distintas
      const groupSize = Math.max(2, Math.floor(count / 3)); // Dividir en grupos
      const groupIndex = Math.floor(idx / groupSize);
      const positionInGroup = idx % groupSize;
      
      // Centros de grupos distribuidos a lo largo del ancho
      const groupCenterX = marginX + ((width - marginX * 2) * groupIndex) / Math.max(1, Math.ceil(count / groupSize) - 1);
      const groupCenterY = minY + (maxY - minY) * (0.3 + Math.random() * 0.4); // Centros Y aleatorios
      
      // Posición dentro del grupo con patrones más orgánicos
      const angle = (positionInGroup / groupSize) * Math.PI * 2 + Math.random() * 0.8; // Ángulo con variación
      const radius = 15 + Math.random() * 25; // Radio variable para cada estrella
      
      // Aplicar transformaciones adicionales para mayor variabilidad
      const spiralFactor = Math.sin(idx * 0.7) * 10; // Factor espiral
      const clusterVariation = (Math.random() - 0.5) * 40; // Variación adicional del cluster
      
      let x = groupCenterX + Math.cos(angle) * radius + spiralFactor + clusterVariation * 0.5;
      let y = groupCenterY + Math.sin(angle) * radius * 0.8 + clusterVariation; // Y más comprimido
      
      // Agregar ruido adicional para romper patrones perfectos
      x += (Math.random() - 0.5) * 20;
      y += (Math.random() - 0.5) * 15;
      
      // Clamp para que nunca se corten
      x = Math.max(marginX, Math.min(width - marginX, x));
      y = Math.max(minY, Math.min(maxY, y));
      
      return { x, y, date: s.date };
    });
    this.polylineString = this.dreamDayPoints
      .map((pt) => `${pt.x},${pt.y}`)
      .join(" ");

    // Progreso barra (para el mapa mensual)
    this.filledDays = daysWithDream.size;
    this.totalMonthDays = endDate.getDate();
    this.progressPercent =
      this.totalMonthDays === 0
        ? 0
        : Math.round((this.filledDays / this.totalMonthDays) * 100);

    // Actualizar progreso del sistema de niveles basado en total de sueños
    this.updateRankProgress();

    // Estrellas pequeñas de fondo: más densas y aleatorias como en la imagen de referencia
    const backgroundArea = width * height;
    const numSmallStars = Math.round(backgroundArea / 60); // Más estrellas (~700)
    const takenZones = this.dreamDayPoints.map((p) => ({ x: p.x, y: p.y }));
    this.bgStars = [];
    for (let i = 0; i < numSmallStars; i++) {
      let rx = Math.random() * (width - marginX * 2) + marginX;
      let ry = Math.random() * (maxY - minY) + minY;
      if (
        takenZones.some(
          (z) => Math.abs(z.x - rx) < 8 && Math.abs(z.y - ry) < 8
        )
      ) {
        i--;
        continue;
      }
      // Puntos más pequeños y variados para mayor realismo
      const r = 0.15 + Math.random() * 0.6;
      this.bgStars.push({ x: rx, y: ry, r });
    }
  }

  updateRankProgress() {
    // Obtener el total de sueños guardados en toda la aplicación
    const allDreams = this.dreamService.getAllDreams();
    this.currentDreamsCount = allDreams.length;

    // Definir niveles con rangos más amplios: Rookie (0-19), Novice (20-49), Intermediate (50-99),
    // Advanced (100-199), Expert (200-399), Master (400+)
    let currentRank: string;
    let nextRank: string;
    let dreamsNeeded: number;
    let progressInCurrentLevel: number;
    let rankStart: number;

    if (this.currentDreamsCount < 20) {
      // Rookie: 0-19 sueños, necesita 20 para Novice
      currentRank = "CALENDAR.RANK_ROOKIE";
      nextRank = "CALENDAR.RANK_NOVICE";
      dreamsNeeded = 20;
      rankStart = 0;
      progressInCurrentLevel = this.currentDreamsCount;
    } else if (this.currentDreamsCount < 50) {
      // Novice: 20-49 sueños, necesita 50 para Intermediate
      currentRank = "CALENDAR.RANK_NOVICE";
      nextRank = "CALENDAR.RANK_INTERMEDIATE";
      dreamsNeeded = 50;
      rankStart = 20;
      progressInCurrentLevel = this.currentDreamsCount - 20;
    } else if (this.currentDreamsCount < 100) {
      // Intermediate: 50-99 sueños, necesita 100 para Advanced
      currentRank = "CALENDAR.RANK_INTERMEDIATE";
      nextRank = "CALENDAR.RANK_ADVANCED";
      dreamsNeeded = 100;
      rankStart = 50;
      progressInCurrentLevel = this.currentDreamsCount - 50;
    } else if (this.currentDreamsCount < 200) {
      // Advanced: 100-199 sueños, necesita 200 para Expert
      currentRank = "CALENDAR.RANK_ADVANCED";
      nextRank = "CALENDAR.RANK_EXPERT";
      dreamsNeeded = 200;
      rankStart = 100;
      progressInCurrentLevel = this.currentDreamsCount - 100;
    } else if (this.currentDreamsCount < 400) {
      // Expert: 200-399 sueños, necesita 400 para Master
      currentRank = "CALENDAR.RANK_EXPERT";
      nextRank = "CALENDAR.RANK_MASTER";
      dreamsNeeded = 400;
      rankStart = 200;
      progressInCurrentLevel = this.currentDreamsCount - 200;
    } else {
      // Master: 400+ sueños, es el nivel máximo
      currentRank = "CALENDAR.RANK_MASTER";
      nextRank = "CALENDAR.RANK_MASTER"; // No hay siguiente nivel
      dreamsNeeded = 400; // Mantener el umbral para el cálculo
      rankStart = 400;
      progressInCurrentLevel = Math.min(this.currentDreamsCount - 400, 100); // Límite para mostrar progreso
    }

    this.currentRankName = currentRank;
    this.nextRankName = nextRank;
    // Mostrar el número total de sueños necesarios para el siguiente nivel
    this.dreamsNeededForNext = dreamsNeeded;

    // Calcular porcentaje de progreso hacia el siguiente nivel
    if (
      currentRank === "CALENDAR.RANK_MASTER" &&
      nextRank === "CALENDAR.RANK_MASTER"
    ) {
      // Nivel máximo alcanzado
      this.progressToNextPercent = 100;
    } else {
      // Calcular cuántos sueños se necesitan en total para llegar al siguiente nivel
      const dreamsRequiredForNext = dreamsNeeded - rankStart;
      // Calcular progreso: sueños en el nivel actual / sueños necesarios para el siguiente nivel
      const progress =
        dreamsRequiredForNext > 0
          ? Math.min(
              100,
              Math.round((progressInCurrentLevel / dreamsRequiredForNext) * 100)
            )
          : 0;
      this.progressToNextPercent = progress;
    }
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
    this.updateDreamJourneyMap();
  }

  nextMonth() {
    this.currentDate.setMonth(this.currentDate.getMonth() + 1);
    this.generateCalendar();
    this.generateWeeklyData();
    this.updateDreamJourneyMap();
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
