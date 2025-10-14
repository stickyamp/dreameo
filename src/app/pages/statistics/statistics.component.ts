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

  // Dream frequency data (for chart)
  dreamFrequency: { day: string; count: number }[] = [
    { day: 'Lun', count: 1 },
    { day: 'Mar', count: 2 },
    { day: 'Mié', count: 0 },
    { day: 'Jue', count: 1 },
    { day: 'Vie', count: 3 },
    { day: 'Sáb', count: 2 },
    { day: 'Dom', count: 1 }
  ];

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
    } else {
      // For month/year, show weekly aggregates or monthly data
      this.dreamFrequency = [
        { day: 'Sem 1', count: 5 },
        { day: 'Sem 2', count: 3 },
        { day: 'Sem 3', count: 7 },
        { day: 'Sem 4', count: 4 }
      ];
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

  trackByDay(index: number, item: { day: string; count: number }): string {
    return item.day;
  }

  trackBySentiment(index: number, item: { emoji: string; label: string; percentage: number; color: string }): string {
    return item.label;
  }
}
