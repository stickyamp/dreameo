import {
  Component,
  ElementRef,
  inject,
  OnInit,
  ViewChild,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { IonicModule, ModalController, NavController } from "@ionic/angular";
import { AddDreamComponent } from "../../add-dream/add-dream.component";
import { ShowDreamsListDirective } from "src/app/shared/directives/add-dream-open-modal.directive";
import { TranslateModule, TranslateService } from "@ngx-translate/core";
import { ConfigService } from "@/app/shared/services/config.service";
import { DreamService } from "@/app/shared/services/dreams/dream.base.service";

export interface Rank {
  requiredDreams: number;
  icon: string;
  iconCss: string;
  iconBackground: string;
  iconBackgroundCss: string;
  title: string;
}

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
  isolatedDreamPoints: { x: number; y: number; date: string }[] = [];
  polylineString: string = "";
  progressPercent: number = 0;
  filledDays: number = 0;
  totalMonthDays: number = 0;
  userRankLabel: string = "CALENDAR.RANK_ROOKIE"; // placeholder
  bgStars: {
    x: number;
    y: number;
    r: number;
    sparkleOffsetX: number;
    sparkleOffsetY: number;
  }[] = [];

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

    // Área de dibujo del SVG (coincide con el viewBox 0 0 350 130)
    const width = 350;
    const height = 130;
    const marginX = 15; // Reducir margen lateral para usar más espacio
    const marginTop = 15;
    const marginBottom = 15;
    const minY = marginTop;
    const maxY = height - marginBottom;

    // Separar estrellas en conectadas y aisladas
    const totalStars = stars.length;
    let connectedStars: { date: string; day: number }[] = [];
    let isolatedStars: { date: string; day: number }[] = [];

    if (totalStars <= 2) {
      // Si hay muy pocas estrellas, todas van conectadas
      connectedStars = [...stars];
    } else if (totalStars <= 4) {
      // Para pocas estrellas, conectar la mayoría
      connectedStars = stars.slice(0, Math.ceil(totalStars * 0.7));
      isolatedStars = stars.slice(Math.ceil(totalStars * 0.7));
    } else {
      // Para muchas estrellas, conectar solo algunas para evitar saturación
      const connectedCount = Math.min(4, Math.ceil(totalStars * 0.5));
      connectedStars = stars.slice(0, connectedCount);
      isolatedStars = stars.slice(connectedCount);
    }

    // Generar posiciones para estrellas conectadas
    this.dreamDayPoints = connectedStars.map((s, idx) => {
      const count = connectedStars.length;
      const progress = count > 1 ? idx / (count - 1) : 0.5;

      // Posición base a lo largo del ancho
      let x = marginX + (width - marginX * 2) * progress;

      // Crear patrones de constelación más sutiles
      const centerY = (minY + maxY) / 2;
      let y;

      if (count <= 2) {
        y = centerY + Math.sin(progress * Math.PI) * 15;
      } else if (count <= 3) {
        y = centerY + Math.sin(progress * Math.PI * 1.2) * 20;
      } else {
        y =
          centerY +
          Math.sin(progress * Math.PI * 1.5) * 25 +
          Math.cos(progress * Math.PI * 2) * 10;
      }

      // Menos variación aleatoria para líneas más suaves
      x += (Math.random() - 0.5) * 15;
      y += (Math.random() - 0.5) * 10;

      // Clamp para mantener dentro del área
      x = Math.max(marginX, Math.min(width - marginX, x));
      y = Math.max(minY, Math.min(maxY, y));

      return { x, y, date: s.date };
    });

    // Generar posiciones para estrellas aisladas
    this.isolatedDreamPoints = isolatedStars.map((s) => {
      let x: number = marginX + Math.random() * (width - marginX * 2);
      let y: number = minY + Math.random() * (maxY - minY);
      let attempts = 0;
      const maxAttempts = 20;

      while (
        attempts < maxAttempts &&
        this.dreamDayPoints.some(
          (pt) => Math.abs(pt.x - x) < 30 && Math.abs(pt.y - y) < 30
        )
      ) {
        x = marginX + Math.random() * (width - marginX * 2);
        y = minY + Math.random() * (maxY - minY);
        attempts++;
      }

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

    // Estrellas pequeñas de fondo distribuidas como en la imagen
    const numSmallStars = 22; // Aumentar para cubrir mejor el área
    const takenZones = [
      ...this.dreamDayPoints.map((p) => ({ x: p.x, y: p.y })),
      ...this.isolatedDreamPoints.map((p) => ({ x: p.x, y: p.y })),
    ];
    this.bgStars = [];

    // Crear zonas preferenciales para distribución más natural cubriendo todo el ancho
    const zones = [
      { x: width * 0.1, y: height * 0.2, weight: 0.7 },
      { x: width * 0.25, y: height * 0.15, weight: 0.6 },
      { x: width * 0.4, y: height * 0.3, weight: 0.5 },
      { x: width * 0.6, y: height * 0.25, weight: 0.7 },
      { x: width * 0.75, y: height * 0.18, weight: 0.8 },
      { x: width * 0.9, y: height * 0.35, weight: 0.9 }, // Zona específica para el lateral derecho
      { x: width * 0.2, y: height * 0.75, weight: 0.5 },
      { x: width * 0.5, y: height * 0.8, weight: 0.6 },
      { x: width * 0.8, y: height * 0.7, weight: 0.8 }, // Otra zona para el lateral derecho inferior
    ];

    // Garantizar distribución en todo el ancho
    const rightSideStars = Math.ceil(numSmallStars * 0.3); // 30% para el lado derecho

    for (let i = 0; i < numSmallStars; i++) {
      let rx: number, ry: number;

      // Forzar algunas estrellas en el lateral derecho
      if (i < rightSideStars) {
        rx = width * 0.7 + Math.random() * (width * 0.25); // 70-95% del ancho
        ry = minY + Math.random() * (maxY - minY);
      } else if (i < zones.length && Math.random() < zones[i].weight) {
        // Usar zona preferencial con algo de variación
        const zone = zones[i];
        rx = zone.x + (Math.random() - 0.5) * 50; // Aumentar variación
        ry = zone.y + (Math.random() - 0.5) * 40;
      } else {
        // Distribución aleatoria en todo el ancho
        rx = marginX + Math.random() * (width - marginX * 2);
        ry = minY + Math.random() * (maxY - minY);
      }

      // Clamp dentro del área completa
      rx = Math.max(marginX, Math.min(width - marginX, rx));
      ry = Math.max(minY, Math.min(maxY, ry));

      // Evitar solapamiento con puntos principales (distancia reducida)
      if (
        takenZones.some(
          (z) => Math.abs(z.x - rx) < 20 && Math.abs(z.y - ry) < 20
        )
      ) {
        i--;
        continue;
      }

      // Tamaño variado pero más pequeño
      const r = 0.4 + Math.random() * 0.4;
      const sparkleOffsetX = 0;
      const sparkleOffsetY = 0;
      this.bgStars.push({ x: rx, y: ry, r, sparkleOffsetX, sparkleOffsetY });
    }
  }

  ranks: Rank[] = [
    {
      title: this.translate.instant("RANKS.RANK_ROOKIE"),
      icon: "sparkles",
      iconCss: "rank-icon-style-1",
      iconBackground: "shield-outline",
      iconBackgroundCss: "rank-background-style-1",
      requiredDreams: 0,
      //requiredDreams: 0,
    },
    {
      title: this.translate.instant("RANKS.RANK_NOVICE"),
      icon: "moon",
      iconCss: "rank-icon-style-1",
      iconBackground: "shield-outline",
      iconBackgroundCss: "rank-background-style-1",
      //requiredDreams: 10,
      requiredDreams: 3,
    },
    {
      title: this.translate.instant("RANKS.RANK_INTERMEDIATE"),
      icon: "planet-outline",
      iconCss: "rank-icon-style-2",
      iconBackground: "shield",
      iconBackgroundCss: "rank-background-style-2",
      //requiredDreams: 25,
      requiredDreams: 5,
    },
    {
      title: this.translate.instant("RANKS.RANK_ADVANCED"),
      icon: "flame",
      iconCss: "rank-icon-style-2",
      iconBackground: "shield",
      iconBackgroundCss: "rank-background-style-2",
      //requiredDreams: 50,
      requiredDreams: 7,
    },
    {
      title: this.translate.instant("RANKS.RANK_EXPERT"),
      icon: "",
      iconCss: "rank-icon-style-3",
      iconBackground: "star",
      iconBackgroundCss: "rank-background-style-3",
      //requiredDreams: 100,
      requiredDreams: 10,
    },
    {
      title: this.translate.instant("RANKS.RANK_MASTER"),
      icon: "",
      iconCss: "rank-icon-style-4",
      iconBackground: "skull",
      iconBackgroundCss: "rank-background-style-4",
      //requiredDreams: 200,
      requiredDreams: 12,
    },
    {
      title: this.translate.instant("RANKS.RANK_LORD"),
      icon: "assets/moon",
      iconCss: "rank-icon-style-5",
      iconBackground: "moon",
      iconBackgroundCss: "rank-background-style-5",
      //requiredDreams: 500,
      requiredDreams: 14,
    },
  ];

  currentRank: Rank = {} as any;
  nextRank: Rank | null = null;

  updateRankProgress() {
    const allDreams = this.dreamService.getAllDreams();
    this.currentDreamsCount = allDreams.length;

    // Find the current rank (last rank where requiredDreams <= currentDreamsCount)
    let currentIndex = this.ranks.findIndex((rank, index) => {
      const nextRank = this.ranks[index + 1];
      return !nextRank || this.currentDreamsCount < nextRank.requiredDreams;
    });

    if (currentIndex === -1) {
      currentIndex = this.ranks.length - 1; // Fallback (should not happen)
    }

    this.currentRank = this.ranks[currentIndex];
    this.nextRank = this.ranks[currentIndex + 1] ?? null; // Could be null if Master

    if (!this.nextRank) {
      // Master rank (no more levels)
      this.dreamsNeededForNext = this.currentRank.requiredDreams;
      this.progressToNextPercent = 100;
      return;
    }

    // Dreams needed to reach next rank
    this.dreamsNeededForNext = this.nextRank.requiredDreams;

    const rankStart = this.currentRank.requiredDreams;
    const progressInCurrentLevel = this.currentDreamsCount - rankStart;
    const dreamsRequiredForNext = this.nextRank.requiredDreams - rankStart;

    this.progressToNextPercent = Math.min(
      100,
      Math.max(
        0,
        Math.round((progressInCurrentLevel / dreamsRequiredForNext) * 100)
      )
    );
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

  // Método para generar el path SVG de una estrella pequeña
  getSmallStarPath(cx: number, cy: number, size: number): string {
    const outerRadius = size * 1.2;
    const innerRadius = size * 0.5;
    const points = 5;
    let path = "";

    for (let i = 0; i < points * 2; i++) {
      const angle = (i * Math.PI) / points - Math.PI / 2;
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const x = cx + Math.cos(angle) * radius;
      const y = cy + Math.sin(angle) * radius;

      if (i === 0) {
        path += `M ${x} ${y}`;
      } else {
        path += ` L ${x} ${y}`;
      }
    }
    path += " Z";
    return path;
  }

  // Método para generar círculos pequeños
  getSmallCirclePath(cx: number, cy: number, radius: number): string {
    return `M ${cx - radius} ${cy} A ${radius} ${radius} 0 1 0 ${
      cx + radius
    } ${cy} A ${radius} ${radius} 0 1 0 ${cx - radius} ${cy}`;
  }

  // Método para generar el path SVG de una estrella principal grande
  getMainStarPath(cx: number, cy: number): string {
    const outerRadius = 5;
    const innerRadius = 2;
    const points = 5;
    let path = "";

    for (let i = 0; i < points * 2; i++) {
      const angle = (i * Math.PI) / points - Math.PI / 2;
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const x = cx + Math.cos(angle) * radius;
      const y = cy + Math.sin(angle) * radius;

      if (i === 0) {
        path += `M ${x} ${y}`;
      } else {
        path += ` L ${x} ${y}`;
      }
    }
    path += " Z";
    return path;
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
