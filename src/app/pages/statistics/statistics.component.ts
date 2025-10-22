import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { IonicModule } from "@ionic/angular";
import { DreamService } from "src/app/shared/services/dream.service";
import { Dream, DreamForStatistics, DreamType } from "../../models/dream.model";
import { TranslateModule, TranslateService } from "@ngx-translate/core";

@Component({
  selector: "app-dream-statistics",
  templateUrl: "./statistics.component.html",
  styleUrls: ["./statistics.component.scss"],
  imports: [IonicModule, CommonModule, TranslateModule],
  standalone: true,
})
export class DreamStatisticsPage implements OnInit {
  selectedPeriod: string = "thisMonth";

  stats = {
    totalDreams: 0,
    lucidDreams: 0,
    dreamFrequency: 0,
  };

  keywords: string[] = [];
  dreamTypes = [
    { type: "Lucid", count: 0 },
    { type: "Normal", count: 0 },
    { type: "Nightmare", count: 0 },
  ];

  chartData: number[] = [];
  chartLabels: string[] = [];
  chartPath: string = "";

  // This should come from your dream service
  private allDreams: DreamForStatistics[] = [];

  constructor(
    private dreamService: DreamService,
    private translate: TranslateService
  ) {
    const lang = localStorage.getItem("lang") || "es";
    this.translate.use(lang);
  }

  ngOnInit() {
    this.loadDreams();
    this.selectPeriod("thisMonth");
  }

  selectPeriod(period: string) {
    this.selectedPeriod = period;
    this.updateStatistics(period);
    this.generateChartPath();
  }

  private loadDreams() {
    this.allDreams = this.dreamService.getAllDreams().map((d) => {
      return {
        id: d.id,
        date: new Date(d.date), // This is now ALWAYS a Date object
        isLucid: d.tags?.some((t) => t === DreamType.LUCID.toString()),
        isNightmare: d.tags?.some((t) => t === DreamType.NIGHTMARE.toString()),
        tags: d.tags,
      } as unknown as DreamForStatistics;
    });
  }

  private updateStatistics(period: string) {
    const now = new Date();
    let startDate: Date;
    let filteredDreams: DreamForStatistics[];

    // Determine date range
    switch (period) {
      case "thisWeek":
        {
          // Get Monday of this week
          startDate = new Date(now);
          const day = startDate.getDay();
          const diff = startDate.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is Sunday
          startDate.setDate(diff);
          startDate.setHours(0, 0, 0, 0);
          filteredDreams = this.allDreams.filter((d) => d.date >= startDate);
          this.prepareWeeklyData(filteredDreams, startDate);
        }
        break;
      case "thisMonth":
        {
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          startDate.setHours(0, 0, 0, 0);
          filteredDreams = this.allDreams.filter((d) => d.date >= startDate);
          this.prepareMonthlyData(filteredDreams, startDate);
        }
        break;
      case "allTime":
        filteredDreams = this.allDreams;
        this.prepareYearlyData(filteredDreams);
        break;
      default:
        filteredDreams = this.allDreams;
    }

    // Update stats
    this.stats.totalDreams = filteredDreams.length;
    this.stats.lucidDreams = filteredDreams.filter((d) => d.isLucid).length;
    this.stats.dreamFrequency = filteredDreams.length;

    // Update dream types percentages
    const lucidCount = filteredDreams.filter((d) =>
      d.tags?.some((d) => d === DreamType.LUCID.toString())
    ).length;
    const normalCount = filteredDreams.filter(
      (d) =>
        !d.tags?.includes(DreamType.NIGHTMARE.toString()) &&
        !d.tags?.some((t) => t === DreamType.LUCID.toString())
    ).length;
    const nightmareCount = filteredDreams.filter((d) =>
      d.tags?.includes(DreamType.NIGHTMARE.toString())
    ).length;
    const total = filteredDreams.length || 1;

    this.dreamTypes = [
      { type: "Lucid", count: lucidCount },
      { type: "Normal", count: normalCount },
      { type: "Nightmare", count: nightmareCount },
    ];

    // Update keywords
    this.updateKeywords(filteredDreams);
  }

  private prepareWeeklyData(dreams: DreamForStatistics[], startDate: Date) {
    this.chartLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    this.chartData = new Array(7).fill(0);

    dreams.forEach((dream) => {
      const dayIndex = dream.date.getDay();
      const adjustedIndex = dayIndex === 0 ? 6 : dayIndex - 1; // Convert Sunday from 0 to 6
      this.chartData[adjustedIndex]++;
    });
  }

  private prepareMonthlyData(dreams: DreamForStatistics[], startDate: Date) {
    // Calculate the number of weeks in the current month
    const now = new Date();
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();
    const numberOfWeeks = Math.ceil(daysInMonth / 7);

    // Generate date range labels for each week
    this.chartLabels = this.generateWeeklyDateLabels(startDate, numberOfWeeks);
    this.chartData = new Array(numberOfWeeks).fill(0);

    dreams.forEach((dream) => {
      const daysDiff = Math.floor(
        (dream.date.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000)
      );
      const weekIndex = Math.min(Math.floor(daysDiff / 7), numberOfWeeks - 1);
      if (weekIndex >= 0 && weekIndex < numberOfWeeks) {
        this.chartData[weekIndex]++;
      }
    });
  }

  private prepareYearlyData(dreams: DreamForStatistics[]) {
    this.chartLabels = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    this.chartData = new Array(12).fill(0);

    const now = new Date();
    const oneYearAgo = new Date(
      now.getFullYear() - 1,
      now.getMonth(),
      now.getDate()
    );

    dreams.forEach((dream) => {
      if (dream.date >= oneYearAgo) {
        const monthIndex = dream.date.getMonth();
        this.chartData[monthIndex]++;
      }
    });
  }

  private generateChartPath() {
    if (this.chartData.length === 0) {
      this.chartPath = "";
      return;
    }

    const width = 240;
    const height = 100;
    const padding = 5;
    const maxValue = Math.max(...this.chartData, 1);
    const stepX = width / (this.chartData.length - 1 || 1);

    let path = "";

    this.chartData.forEach((value, index) => {
      const x = index * stepX;
      const y = height - padding - (value / maxValue) * (height - padding * 2);

      if (index === 0) {
        path += `M ${x},${y}`;
      } else {
        path += ` L ${x},${y}`;
      }
    });

    this.chartPath = path;
  }

  private generateWeeklyDateLabels(
    startDate: Date,
    numberOfWeeks: number
  ): string[] {
    const labels: string[] = [];

    for (let week = 0; week < numberOfWeeks; week++) {
      const weekStart = new Date(startDate);
      weekStart.setDate(startDate.getDate() + week * 7);

      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);

      // Handle end of month case
      const now = new Date();
      const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      if (weekEnd > lastDayOfMonth) {
        weekEnd.setDate(lastDayOfMonth.getDate());
      }

      const startDay = weekStart.getDate().toString().padStart(2, "0");
      const endDay = weekEnd.getDate().toString().padStart(2, "0");

      labels.push(`${startDay}-${endDay}`);
    }

    return labels;
  }

  private updateKeywords(dreams: DreamForStatistics[]) {
    const keywordCount = new Map<string, number>();

    dreams.forEach((dream) => {
      if (dream.tags) {
        dream.tags.forEach((tag) => {
          keywordCount.set(tag, (keywordCount.get(tag) || 0) + 1);
        });
      }
    });

    this.keywords = Array.from(keywordCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map((entry) => entry[0]);
  }
}
