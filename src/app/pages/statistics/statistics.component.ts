import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { DreamService } from '../../shared/services/dream.service';
import { Dream } from '../../models/dream.model';

@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class StatisticsComponent implements OnInit {
  selectedPeriod: 'week' | 'month' | 'year' = 'week';
  dreams: Dream[] = [];

  // Statistics data
  dailyAverage: number = 1.2;
  lucidDreams: number = 7;
  lucidDreamsChange: string = '+2 esta semana';

  // Dream frequency data (for chart) - will be updated based on selected period
  dreamFrequency: { day: string; count: number }[] = [];

  // Dream sentiment data
  dreamSentiment: { emoji: string; label: string; percentage: number; color: string }[] = [
    { emoji: '😊', label: 'Feliz', percentage: 45, color: '#4CAF50' },
    { emoji: '😐', label: 'Neutral', percentage: 20, color: '#FF9800' },
    { emoji: '😟', label: 'Triste', percentage: 15, color: '#F44336' }
  ];

  constructor(private dreamService: DreamService) { }

  ngOnInit() {
    this.loadDreams();

    // Subscribe to dreams changes
    this.dreamService.dreams$.subscribe(() => {
      this.loadDreams();
      this.calculateStatistics();
    });

    // Initialize with sample data for testing
    this.initializeSampleData();
  }

  initializeSampleData() {
    // Add some sample dreams for testing different periods
    const sampleDreams: Dream[] = [
      {
        id: '1',
        date: '2024-01-15', // January
        title: 'Sample Dream 1',
        description: 'Test dream',
        type: 'good',
        createdAt: '2024-01-15T10:00:00Z'
      },
      {
        id: '2',
        date: '2024-02-20', // February
        title: 'Sample Dream 2',
        description: 'Test dream',
        type: 'good',
        createdAt: '2024-02-20T10:00:00Z'
      },
      {
        id: '3',
        date: '2024-03-10', // March
        title: 'Sample Dream 3',
        description: 'Test dream',
        type: 'good',
        createdAt: '2024-03-10T10:00:00Z'
      },
      {
        id: '4',
        date: '2024-04-05', // April
        title: 'Sample Dream 4',
        description: 'Test dream',
        type: 'good',
        createdAt: '2024-04-05T10:00:00Z'
      }
    ];

    // Add sample dreams to the service if they don't exist
    const existingDreams = this.dreamService.getAllDreams();
    if (existingDreams.length === 0) {
      sampleDreams.forEach(dream => {
        this.dreamService.addDream(dream);
      });
    }
  }

  loadDreams() {
    this.dreams = this.dreamService.getAllDreams();
    this.calculateStatistics();
  }

  calculateStatistics() {
    // Calculate daily average based on selected period
    const now = new Date();
    let startDate: Date;

    switch (this.selectedPeriod) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
    }

    const periodDreams = this.dreams.filter(dream =>
      new Date(dream.date) >= startDate
    );

    const daysDiff = Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    this.dailyAverage = periodDreams.length / daysDiff;

    // Count lucid dreams (for now, we'll simulate this data)
    // In a real app, you'd add a 'lucid' property to the Dream model
    this.lucidDreams = Math.floor(periodDreams.length * 0.3); // Simulate 30% lucid dreams

    // Update frequency data based on period
    this.updateFrequencyData(periodDreams);
  }

  updateFrequencyData(dreams: Dream[]) {
    if (this.selectedPeriod === 'week') {
      // Group by day of week
      const dayCounts = [0, 0, 0, 0, 0, 0, 0]; // Sunday to Saturday
      const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

      dreams.forEach(dream => {
        const day = new Date(dream.date).getDay();
        dayCounts[day]++;
      });

      this.dreamFrequency = dayNames.map((day, index) => ({
        day,
        count: dayCounts[index]
      }));
    } else if (this.selectedPeriod === 'month') {
      // Group by week of month
      const weekCounts = [0, 0, 0, 0]; // 4 weeks
      const weekNames = ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'];

      dreams.forEach(dream => {
        const date = new Date(dream.date);
        const weekOfMonth = Math.floor((date.getDate() - 1) / 7);
        if (weekOfMonth < 4) {
          weekCounts[weekOfMonth]++;
        }
      });

      this.dreamFrequency = weekNames.map((week, index) => ({
        day: week,
        count: weekCounts[index]
      }));
    } else if (this.selectedPeriod === 'year') {
      // Group by month of year
      const monthCounts = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]; // 12 months
      const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

      dreams.forEach(dream => {
        const month = new Date(dream.date).getMonth();
        monthCounts[month]++;
      });

      this.dreamFrequency = monthNames.map((month, index) => ({
        day: month,
        count: monthCounts[index]
      }));
    }
  }

  onPeriodChange(event: any) {
    const period = event.detail.value as 'week' | 'month' | 'year';
    if (period) {
      this.selectedPeriod = period;
      this.calculateStatistics();
    }
  }

  getMaxFrequency(): number {
    return Math.max(...this.dreamFrequency.map(f => f.count), 1);
  }

  getBarHeight(count: number): number {
    const max = this.getMaxFrequency();
    return (count / max) * 100;
  }

  getYAxisTicks(): number[] {
    const max = this.getMaxFrequency();
    const steps = 4; // 5 tick labels including 0
    const ticks: number[] = [];
    for (let i = steps; i >= 0; i--) {
      ticks.push(Math.round((max * i) / steps));
    }
    return ticks;
  }

  trackByTick(index: number, value: number): number {
    return value;
  }

  trackByDay(index: number, item: { day: string; count: number }): string {
    return item.day;
  }

  trackBySentiment(index: number, item: { emoji: string; label: string; percentage: number; color: string }): string {
    return item.label;
  }
}
