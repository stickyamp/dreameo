import { ChangeDetectionStrategy, Component, inject, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { IonicModule, ModalController } from "@ionic/angular";
import { Dream, OfficialTags } from "../../models/dream.model";

import { AddDreamComponent } from "../add-dream/add-dream.component";
import { NoDreamsComponent } from "src/app/shared/ui-elements/no-dreams-splash.component";
import { TranslateModule, TranslateService } from "@ngx-translate/core";
import { ConfigService } from "@/app/shared/services/config.service";
import { DreamService } from "@/app/shared/services/dreams/dream.base.service";

@Component({
  selector: "app-dreams",
  templateUrl: "./dreams.component.html",
  styleUrls: ["./dreams.component.scss"],
  standalone: true,
  imports: [CommonModule, IonicModule, NoDreamsComponent, TranslateModule]
})
export class DreamsComponent implements OnInit {
  recentDreams: Dream[] = [];
  dreamGroups: DreamGroup[] = [];
  private allDreams: Dream[] = [];
  areDreamsLoaded = false;
  searchQuery: string = "";
  showSearch: boolean = false;
  public OfficialTags = OfficialTags;

  previousMonthText = '';
  currentMonthText = '';
  nextMonthText = '';

  private dreamService: DreamService = inject(DreamService);


  showSearchbar() {
    this.showSearch = true;
    setTimeout(() => {
      const sb: any = document.querySelector("ion-searchbar");
      if (sb) sb.setFocus && sb.setFocus();
    }, 200);
  }
  hideSearch() {
    this.showSearch = false;
    this.searchQuery = '';
    this.applyFilterAndGroup();
  }

  // Month selector state
  months: { label: string; index: number }[] = [];
  selectedYear: number = new Date().getFullYear();
  selectedMonthIndex: number = new Date().getMonth();
  private monthNames: string[] = [];
  private dayNames: string[] = [];

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
    this.loadRecentDreams();
    this.refreshData();

    // Subscribe to dreams changes
    this.dreamService.dreams$.subscribe(() => {
      this.loadRecentDreams();
      this.refreshData();
    });

    // Subscribe to language changes
    this.translate.onLangChange.subscribe(() => {
      this.updateLocalizedLabels();
      this.applyFilterAndGroup();
      this.refreshData();
    });
  }

  private updateLocalizedLabels() {
    this.translate.get("CALENDAR.MONTHS").subscribe((months: string[]) => {
      if (Array.isArray(months) && months.length === 12) {
        this.monthNames = months;
        this.months = months.map((label, index) => ({ label, index }));
      }
    });

    this.translate.get("CALENDAR.DAYS_FULL").subscribe((days: string[]) => {
      if (Array.isArray(days) && days.length === 7) {
        this.dayNames = days;
      }
    });
  }

  loadRecentDreams() {
    this.allDreams = this.dreamService.getAllDreams();
    this.applyFilterAndGroup();
  }

  private applyFilterAndGroup() {
    const normalizedQuery = this.searchQuery.trim().toLowerCase();
    const source = this.allDreams.slice(0, 200); // cap for performance

    const filteredByQuery = normalizedQuery
      ? source.filter(
        (d) =>
          (d.title || "").toLowerCase().includes(normalizedQuery) ||
          (d.description || "").toLowerCase().includes(normalizedQuery)
      )
      : source;

    // Filter by selected month/year
    const filteredByMonth = filteredByQuery.filter((d) => {
      const date = new Date(d.date);
      return (
        date.getMonth() === this.selectedMonthIndex &&
        date.getFullYear() === this.selectedYear
      );
    });

    // Sort by date desc then createdAt desc
    this.recentDreams = filteredByMonth
      .sort((a, b) => {
        const byDate = new Date(b.date).getTime() - new Date(a.date).getTime();
        if (byDate !== 0) return byDate;
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      })
      .slice(0, 200);

    const groups: { [key: string]: Dream[] } = {};

    this.recentDreams.forEach((dream) => {
      const dateKey = dream.date;
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(dream);
    });

    this.dreamGroups = Object.keys(groups)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
      .map((date) => ({
        date: this.getFormattedDate(date),
        dreams: groups[date].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ),
      }));

    this.areDreamsLoaded = true;
  }

  onSearchChange(event: any) {
    this.searchQuery = event.target?.value || event.detail?.value || "";
    this.applyFilterAndGroup();
  }

  getHeaderTitle(): string {
    if (this.recentDreams.length === 0) {
      return "Sueños";
    }

    const count = this.recentDreams.length;
    return `${count} sueño${count !== 1 ? "s" : ""}`;
  }

  getFormattedDate(dateString: string): string {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Check if it's today
    if (date.toDateString() === today.toDateString()) {
      return this.translate.instant("CALENDAR.TODAY");
    }

    // Check if it's yesterday
    if (date.toDateString() === yesterday.toDateString()) {
      return this.translate.instant("CALENDAR.YESTERDAY");
    }

    // Check if it's this week
    const daysDiff = Math.floor(
      (today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysDiff < 7 && this.dayNames.length === 7) {
      return this.dayNames[date.getDay()];
    }

    // Format as date
    const monthName =
      this.monthNames.length === 12
        ? this.monthNames[date.getMonth()]
        : date.getMonth() + 1;
    const lang = this.translate.currentLang || "es";
    const separator = lang === "en" ? "" : " de ";
    return lang === "en"
      ? `${monthName} ${date.getDate()}`
      : `${date.getDate()} de ${monthName}`;
  }

  getFormattedTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  getDisplayedDreams(dreams: Dream[]): Dream[] {
    return dreams.slice(0, 5); // Show maximum 5 dreams
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
        this.loadRecentDreams();
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

    // No need to manually reload dreams - the subscription will handle it
    await modal.present();
  }

  trackByDate(index: number, group: DreamGroup): string {
    return group.date;
  }

  trackByDream(index: number, dream: Dream): string {
    return dream.id;
  }

  previousMonth() {
    if (this.selectedMonthIndex === 0) {
      this.selectedMonthIndex = 11;
      this.selectedYear -= 1;
    } else {
      this.selectedMonthIndex -= 1;
    }
    this.refreshData();
    this.applyFilterAndGroup();
  }

  nextMonth() {
    if (this.selectedMonthIndex === 11) {
      this.selectedMonthIndex = 0;
      this.selectedYear += 1;
    } else {
      this.selectedMonthIndex += 1;
    }
    this.refreshData();
    this.applyFilterAndGroup();
  }

  setMonth(index: number) {
    this.selectedMonthIndex = index;
    this.applyFilterAndGroup();
  }

  getCurrentMonthYearLabel(): string {
    const monthName =
      this.monthNames.length === 12
        ? this.monthNames[this.selectedMonthIndex]
        : "";
    return `${monthName} ${this.selectedYear}`;
  }

  getAdjacentMonthLabel(offset: number): string {
    let monthIndex = this.selectedMonthIndex + offset;
    if (monthIndex < 0) monthIndex = 11;
    if (monthIndex > 11) monthIndex = 0;

    return this.monthNames.length === 12 ? this.monthNames[monthIndex] : "";
  }


  refreshData() {
    this.previousMonthText = this.getAdjacentMonthLabel(-1);
    this.currentMonthText = this.getCurrentMonthYearLabel();
    this.nextMonthText = this.getAdjacentMonthLabel(1);
  }
}

interface DreamGroup {
  date: string;
  dreams: Dream[];
}
