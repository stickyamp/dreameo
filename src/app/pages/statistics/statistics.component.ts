import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { DreamService } from 'src/app/shared/services/dream.service';
import { TooltipComponent } from 'src/app/shared/ui-elements/tooltip/tooltip/tooltip.component';
import { Dream, DreamForStatistics, DreamType } from '../../models/dream.model';

@Component({
  selector: 'app-dream-statistics',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.scss'],
  imports: [IonicModule, CommonModule, TooltipComponent],
  standalone: true
})
export class DreamStatisticsPage implements OnInit {
  selectedPeriod: string = 'lastMonth';

  stats = {
    totalDreams: 0,
    lucidDreams: 0,
    dreamFrequency: 0,
  };

  keywords: string[] = [];
  dreamTypes = [
    { type: 'Lucid', percentage: 0 },
    { type: 'Normal', percentage: 0 },
    { type: 'Nightmare', percentage: 0 }
  ];

  chartData: number[] = [];
  chartLabels: string[] = [];
  chartPath: string = '';

  // This should come from your dream service
  private allDreams: DreamForStatistics[] = [];

  constructor(private dreamService: DreamService) { }

  ngOnInit() {
    // Replace this with your actual dream service call
    this.loadDreams();
    this.selectPeriod('lastMonth');
  }

  selectPeriod(period: string) {
    this.selectedPeriod = period;
    this.updateStatistics(period);
    this.generateChartPath();
  }

  private loadDreams() {
    // MOCK DATA - Replace this with your actual service call
    // Example: this.dreamService.getAllDreams().subscribe(dreams => { this.allDreams = dreams; });

    //this.allDreams = this.generateMockDreams();
    this.allDreams = this.dreamService.getAllDreams().map(d => {
      return {
        id: d.id,
        date: d.createdAt,
        isLucid: d.tags?.some(d => d === DreamType.LUCID.toString()),
        isNightmare: d.tags?.some(d => d === DreamType.NIGHTMARE.toString()),
        tags: d.tags,
      } as unknown as DreamForStatistics
    });
  }

  private updateStatistics(period: string) {
    const now = new Date();
    let startDate: Date;
    let filteredDreams: DreamForStatistics[];

    // Determine date range
    switch (period) {
      case 'lastWeek':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        filteredDreams = this.allDreams.filter(d => d.date >= startDate);
        this.prepareWeeklyData(filteredDreams, startDate);
        break;
      case 'lastMonth':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        filteredDreams = this.allDreams.filter(d => d.date >= startDate);
        this.prepareMonthlyData(filteredDreams, startDate);
        break;
      case 'allTime':
        filteredDreams = this.allDreams;
        this.prepareYearlyData(filteredDreams);
        break;
      default:
        filteredDreams = this.allDreams;
    }

    // Update stats
    this.stats.totalDreams = filteredDreams.length;
    this.stats.lucidDreams = filteredDreams.filter(d => d.isLucid).length;
    this.stats.dreamFrequency = filteredDreams.length;

    // Update dream types percentages
    const lucidCount = filteredDreams.filter(d => d.tags?.some(d => d === DreamType.LUCID.toString())).length;
    const normalCount = filteredDreams.filter(d => !d.tags?.includes(DreamType.NIGHTMARE.toString())).length;
    const nightmareCount = filteredDreams.filter(d => d.tags?.includes(DreamType.NIGHTMARE.toString())).length;
    const total = filteredDreams.length || 1;

    this.dreamTypes = [
      { type: 'Lucid', percentage: Math.round((lucidCount / total) * 100) },
      { type: 'Normal', percentage: Math.round((normalCount / total) * 100) },
      { type: 'Nightmare', percentage: Math.round((nightmareCount / total) * 100) }
    ];

    // Update keywords
    this.updateKeywords(filteredDreams);
  }

  private prepareWeeklyData(dreams: DreamForStatistics[], startDate: Date) {
    this.chartLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    this.chartData = new Array(7).fill(0);

    dreams.forEach(dream => {
      const dayIndex = dream.date.getDay();
      const adjustedIndex = dayIndex === 0 ? 6 : dayIndex - 1; // Convert Sunday from 0 to 6
      this.chartData[adjustedIndex]++;
    });
  }

  private prepareMonthlyData(dreams: DreamForStatistics[], startDate: Date) {
    this.chartLabels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
    this.chartData = new Array(4).fill(0);

    dreams.forEach(dream => {
      const daysDiff = Math.floor((dream.date.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000));
      const weekIndex = Math.min(Math.floor(daysDiff / 7), 3);
      this.chartData[weekIndex]++;
    });
  }

  private prepareYearlyData(dreams: DreamForStatistics[]) {
    this.chartLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    this.chartData = new Array(12).fill(0);

    const now = new Date();
    const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());

    dreams.forEach(dream => {
      if (dream.date >= oneYearAgo) {
        const monthIndex = dream.date.getMonth();
        this.chartData[monthIndex]++;
      }
    });
  }

  private generateChartPath() {
    if (this.chartData.length === 0) {
      this.chartPath = '';
      return;
    }

    const width = 240;
    const height = 100;
    const padding = 5;
    const maxValue = Math.max(...this.chartData, 1);
    const stepX = width / (this.chartData.length - 1 || 1);

    let path = '';

    this.chartData.forEach((value, index) => {
      const x = index * stepX;
      const y = height - padding - ((value / maxValue) * (height - padding * 2));

      if (index === 0) {
        path += `M ${x},${y}`;
      } else {
        path += ` L ${x},${y}`;
      }
    });

    this.chartPath = path;
  }

  private updateKeywords(dreams: DreamForStatistics[]) {
    const keywordCount = new Map<string, number>();

    dreams.forEach(dream => {
      if (dream.tags) {
        dream.tags.forEach(tag => {
          keywordCount.set(tag, (keywordCount.get(tag) || 0) + 1);
        });
      }
    });

    this.keywords = Array.from(keywordCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(entry => entry[0]);
  }

  // MOCK DATA GENERATOR - Remove this and use your actual service
  // private generateMockDreams(): DreamForStatistics[] {
  //   const dreams: DreamForStatistics[] = [];
  //   const now = new Date();
  //   const types: (DreamType.LUCID | DreamType.NORMAL | DreamType.NIGHTMARE)[] = [DreamType.LUCID, DreamType.NORMAL, DreamType.NIGHTMARE];
  //   const allKeywords = ['Flying', 'Water', 'School', 'Friend', 'Falling', 'Family', 'Animal', 'Car', 'House', 'Work'];

  //   // Generate dreams for the last 90 days
  //   for (let i = 0; i < 90; i++) {
  //     const dreamDate = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);

  //     // Random chance of having a dream each day (70% chance)
  //     if (Math.random() > 0.3) {
  //       const type = types[Math.floor(Math.random() * types.length)];
  //       const numKeywords = Math.floor(Math.random() * 4) + 1;
  //       const dreamKeywords: string[] = [];

  //       for (let j = 0; j < numKeywords; j++) {
  //         const keyword = allKeywords[Math.floor(Math.random() * allKeywords.length)];
  //         if (!dreamKeywords.includes(keyword)) {
  //           dreamKeywords.push(keyword);
  //         }
  //       }

  //       dreams.push({
  //         id: `dream-${i}`,
  //         date: dreamDate,
  //         isLucid: type === DreamType.LUCID,
  //         type: type,
  //         keywords: dreamKeywords
  //       });
  //     }
  //   }

  //   return dreams;
  // }
}