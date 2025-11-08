import {
  Component,
  inject,
  OnInit,
  ViewChild,
  CUSTOM_ELEMENTS_SCHEMA,
  AfterViewInit,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { IonicModule, ModalController } from "@ionic/angular";
import { Dream, OfficialTags, TagModel } from "../../models/dream.model";
import { AddDreamComponent } from "../add-dream/add-dream.component";
import { NoDreamsComponent } from "src/app/shared/ui-elements/no-dreams-splash.component";
import { TranslateModule, TranslateService } from "@ngx-translate/core";
import { ConfigService } from "@/app/shared/services/config.service";
import { DreamService } from "@/app/shared/services/dreams/dream.base.service";

// Import Swiper
import { register } from "swiper/element/bundle";

// Register Swiper custom elements
register();

interface MonthData {
  year: number;
  month: number;
  dreams: Dream[];
  label: string;
}

@Component({
  selector: "app-dreams",
  templateUrl: "./dreams.component.html",
  styleUrls: ["./dreams.component.scss"],
  standalone: true,
  imports: [CommonModule, IonicModule, NoDreamsComponent, TranslateModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class DreamsComponent implements OnInit, AfterViewInit {
  @ViewChild("swiper") swiperRef: any;

  private allDreams: Dream[] = [];
  areDreamsLoaded = false;
  searchQuery: string = "";
  showSearch: boolean = false;
  public OfficialTags = OfficialTags;

  // Swiper state
  monthsData: MonthData[] = [];
  currentSlideIndex = 0;
  private dreamService: DreamService = inject(DreamService);

  // Loading state
  isLoadingPrevious = false;
  isLoadingNext = false;

  // Performance optimization: limit total slides
  private readonly MAX_SLIDES = 15; // Keep only 15 months in memory

  // Month selector state
  private monthNames: string[] = [];
  private dayNames: string[] = [];

  // For header display
  currentMonthText = "";
  previousMonthText = "";
  nextMonthText = "";

  constructor(
    private modalController: ModalController,
    private translate: TranslateService,
    private configService: ConfigService
  ) {
    const lang = localStorage.getItem("lang") || "es";
    this.translate.use(lang);
  }

  ngOnInit() {
    this.updateLocalizedLabels();
    this.loadAllDreams();

    // Subscribe to dreams changes
    this.dreamService.dreams$.subscribe(() => {
      this.loadAllDreams();
    });

    // Subscribe to language changes
    this.translate.onLangChange.subscribe(() => {
      this.updateLocalizedLabels();
      this.rebuildMonthsData();
    });
  }

  ngAfterViewInit() {
    // Configure swiper after view init
    if (this.swiperRef?.nativeElement) {
      const swiperEl = this.swiperRef.nativeElement;

      // Swiper parameters with performance optimizations
      Object.assign(swiperEl, {
        slidesPerView: 1,
        spaceBetween: 20,
        speed: 300, // Reduced from 400 for snappier feel
        centeredSlides: true,
        grabCursor: true,
        initialSlide: this.currentSlideIndex,
        allowSlideNext: true,
        allowSlidePrev: true,
        // Performance optimizations
        watchSlidesProgress: false,
        watchSlidesVisibility: false,
        preventInteractionOnTransition: false,
        touchStartPreventDefault: false,
      });

      // Initialize swiper
      swiperEl.initialize();

      // Listen to slide changes
      swiperEl.addEventListener("swiperslidechange", (event: any) => {
        this.onSlideChange(event);
      });
    }
  }

  private updateLocalizedLabels() {
    this.translate.get("CALENDAR.MONTHS").subscribe((months: string[]) => {
      if (Array.isArray(months) && months.length === 12) {
        this.monthNames = months;
        this.rebuildMonthsData();
      }
    });

    this.translate.get("CALENDAR.DAYS_FULL").subscribe((days: string[]) => {
      if (Array.isArray(days) && days.length === 7) {
        this.dayNames = days;
      }
    });
  }

  loadAllDreams() {
    this.allDreams = this.dreamService.getAllDreams();

    // If months are already initialized, preserve position
    if (this.monthsData.length > 0) {
      this.rebuildMonthsData();
    } else {
      this.initializeMonthsData();
    }
  }

  private initializeMonthsData() {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();

    // Start with fewer months loaded
    this.monthsData = [];

    // Load 7 months: 3 previous, current, 3 next
    for (let i = -8; i <= 8; i++) {
      const date = new Date(currentYear, currentMonth + i, 1);
      this.monthsData.push(
        this.createMonthData(date.getFullYear(), date.getMonth())
      );
    }

    this.currentSlideIndex = 8; // Start at current month (middle slide)
    this.updateHeaderLabels();
    this.areDreamsLoaded = true;
  }

  private createMonthData(year: number, month: number): MonthData {
    const filtered = this.filterDreamsByMonth(year, month);
    return {
      year,
      month,
      dreams: filtered,
      label: this.getMonthYearLabel(year, month),
    };
  }

  private filterDreamsByMonth(year: number, month: number): Dream[] {
    const normalizedQuery = this.searchQuery.trim().toLowerCase();

    let filtered = this.allDreams.filter((d) => {
      const date = new Date(d.date);
      return date.getMonth() === month && date.getFullYear() === year;
    });

    if (normalizedQuery) {
      filtered = filtered.filter(
        (d) =>
          (d.title || "").toLowerCase().includes(normalizedQuery) ||
          (d.description || "").toLowerCase().includes(normalizedQuery)
      );
    }

    // Sort by date desc then createdAt desc
    // Limit to 100 dreams per month for performance
    return filtered
      .sort((a, b) => {
        const byDate = new Date(b.date).getTime() - new Date(a.date).getTime();
        if (byDate !== 0) return byDate;
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      })
      .slice(0, 100);
  }

  private rebuildMonthsData() {
    this.monthsData = this.monthsData.map((monthData) =>
      this.createMonthData(monthData.year, monthData.month)
    );
    this.updateHeaderLabels();

    // Force swiper to update and maintain current position
    if (this.swiperRef?.nativeElement?.swiper) {
      const swiper = this.swiperRef.nativeElement.swiper;
      swiper.update();
    }
  }

  private loadPreviousMonths() {
    if (this.isLoadingPrevious) return;

    const firstMonth = this.monthsData[0];
    if (!firstMonth) return;

    this.isLoadingPrevious = true;

    // Small delay to avoid interrupting active swipe
    setTimeout(() => {
      // Load 2 previous months
      const newMonths: MonthData[] = [];
      for (let i = 10; i >= 1; i--) {
        const prevDate = new Date(firstMonth.year, firstMonth.month - i, 1);
        newMonths.push(
          this.createMonthData(prevDate.getFullYear(), prevDate.getMonth())
        );
      }

      // Calculate new index before modifying array
      const oldLength = this.monthsData.length;
      const addedCount = newMonths.length;

      // Add new months at the beginning
      this.monthsData.unshift(...newMonths);

      // Trim from the end if we exceed MAX_SLIDES
      let removedCount = 0;
      if (this.monthsData.length > this.MAX_SLIDES) {
        removedCount = this.monthsData.length - this.MAX_SLIDES;
        this.monthsData.splice(-removedCount, removedCount);
      }

      // Adjust current index
      const newIndex = this.currentSlideIndex + addedCount;

      // Update swiper without animation
      if (this.swiperRef?.nativeElement?.swiper) {
        const swiper = this.swiperRef.nativeElement.swiper;
        swiper.update();

        // Use slideTo with 0 duration to avoid jump
        swiper.slideTo(newIndex, 0, false);
        this.currentSlideIndex = newIndex;
        this.updateHeaderLabels();
      }

      this.isLoadingPrevious = false;
    }, 200);
  }

  private loadNextMonths() {
    if (this.isLoadingNext) return;

    const lastMonth = this.monthsData[this.monthsData.length - 1];
    if (!lastMonth) return;

    this.isLoadingNext = true;

    // Small delay to avoid interrupting active swipe
    setTimeout(() => {
      // Load 6 next months
      const newMonths: MonthData[] = [];
      for (let i = 1; i <= 10; i++) {
        const nextDate = new Date(lastMonth.year, lastMonth.month + i, 1);
        newMonths.push(
          this.createMonthData(nextDate.getFullYear(), nextDate.getMonth())
        );
      }

      const oldIndex = this.currentSlideIndex;

      // Add new months at the end
      this.monthsData.push(...newMonths);

      // Trim from the beginning if we exceed MAX_SLIDES
      let removedCount = 0;
      if (this.monthsData.length > this.MAX_SLIDES) {
        removedCount = this.monthsData.length - this.MAX_SLIDES;
        this.monthsData.splice(0, removedCount);
      }

      // Adjust current index if we trimmed from beginning
      const newIndex = oldIndex - removedCount;

      // Update swiper
      if (this.swiperRef?.nativeElement?.swiper) {
        const swiper = this.swiperRef.nativeElement.swiper;
        swiper.update();

        // Only adjust position if we trimmed from beginning
        if (removedCount > 0) {
          swiper.slideTo(newIndex, 0, false);
          this.currentSlideIndex = newIndex;
        }

        this.updateHeaderLabels();
      }

      this.isLoadingNext = false;
    }, 200);
  }

  onSlideChange(event: any) {
    const swiper = event.target.swiper;
    const newIndex = swiper.activeIndex;

    this.currentSlideIndex = newIndex;
    this.updateHeaderLabels();

    // Only load if not currently loading and swiper is not animating
    if (!swiper.animating) {
      // Load previous months when we're close to the beginning
      if (newIndex <= 2 && !this.isLoadingPrevious) {
        this.loadPreviousMonths();
      }

      // Load next months when we're close to the end
      if (newIndex >= this.monthsData.length - 3 && !this.isLoadingNext) {
        this.loadNextMonths();
      }
    }
  }

  private updateHeaderLabels() {
    const current = this.monthsData[this.currentSlideIndex];
    if (current) {
      this.currentMonthText = current.label;

      const prev = this.monthsData[this.currentSlideIndex - 1];
      this.previousMonthText = prev
        ? this.getMonthLabel(prev.year, prev.month)
        : "";

      const next = this.monthsData[this.currentSlideIndex + 1];
      this.nextMonthText = next
        ? this.getMonthLabel(next.year, next.month)
        : "";
    }
  }

  private getMonthYearLabel(year: number, month: number): string {
    const monthName =
      this.monthNames.length === 12 ? this.monthNames[month] : "";
    return `${monthName} ${year}`;
  }

  private getMonthLabel(year: number, month: number): string {
    return this.monthNames.length === 12 ? this.monthNames[month] : "";
  }

  showSearchbar() {
    this.showSearch = true;
    setTimeout(() => {
      const sb: any = document.querySelector("ion-searchbar");
      if (sb) sb.setFocus && sb.setFocus();
    }, 200);
  }

  hideSearch() {
    this.showSearch = false;
    this.searchQuery = "";
    this.rebuildMonthsData();
  }

  onSearchChange(event: any) {
    this.searchQuery = event.target?.value || event.detail?.value || "";
    this.rebuildMonthsData();
  }

  getFormattedDate(dateString: string): string {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return this.translate.instant("CALENDAR.TODAY");
    }

    if (date.toDateString() === yesterday.toDateString()) {
      return this.translate.instant("CALENDAR.YESTERDAY");
    }

    const daysDiff = Math.floor(
      (today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysDiff < 7 && this.dayNames.length === 7) {
      return this.dayNames[date.getDay()];
    }

    const monthName =
      this.monthNames.length === 12
        ? this.monthNames[date.getMonth()]
        : date.getMonth() + 1;
    const lang = this.translate.currentLang || "es";
    return lang === "en"
      ? `${monthName} ${date.getDate()}`
      : `${date.getDate()} de ${monthName}`;
  }

  previousMonth() {
    if (this.swiperRef?.nativeElement?.swiper) {
      this.swiperRef.nativeElement.swiper.slidePrev();
    }
  }

  nextMonth() {
    if (this.swiperRef?.nativeElement?.swiper) {
      this.swiperRef.nativeElement.swiper.slideNext();
    }
  }

  async addDream() {
    const modal = await this.modalController.create({
      component: AddDreamComponent,
      componentProps: {
        selectedDate: new Date().toISOString().split("T")[0],
      },
    });

    modal.onDidDismiss().then((result) => {
      if (result.data?.dreamAdded) {
        this.loadAllDreams();
      }
    });

    await modal.present();
  }

  async viewDream(dream: Dream) {
    const modal = await this.modalController.create({
      component: AddDreamComponent,
      cssClass: (await this.configService.isDarkMode())
        ? "ion-palette-dark"
        : "ion-palette-light",
      componentProps: {
        dream: dream,
        selectedDate: dream.date,
      },
    });

    await modal.present();
  }

  trackByMonthData(index: number, monthData: MonthData): string {
    return `${monthData.year}-${monthData.month}`;
  }

  trackByDream(index: number, dream: Dream): string {
    return dream.id;
  }

  trackByTag(index: number, tag: TagModel): string {
    return tag.id;
  }
}
