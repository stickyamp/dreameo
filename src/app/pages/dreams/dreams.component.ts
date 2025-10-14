import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController } from '@ionic/angular';
import { DreamService } from '../../shared/services/dream.service';
import { Dream } from '../../models/dream.model';
import { DreamDetailComponent } from '../dream-detail/dream-detail.component';
import { AddDreamComponent } from '../add-dream/add-dream.component';

@Component({
  selector: 'app-dreams',
  templateUrl: './dreams.component.html',
  styleUrls: ['./dreams.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class DreamsComponent implements OnInit {
  recentDreams: Dream[] = [];
  dreamGroups: DreamGroup[] = [];

  constructor(
    private dreamService: DreamService,
    private modalController: ModalController
  ) { }

  ngOnInit() {
    this.loadRecentDreams();

    // Subscribe to dreams changes
    this.dreamService.dreams$.subscribe(() => {
      this.loadRecentDreams();
    });
  }

  loadRecentDreams() {
    this.recentDreams = this.dreamService.getAllDreams().slice(0, 50); // Last 50 dreams
    this.groupDreamsByDate();
  }

  groupDreamsByDate() {
    const groups: { [key: string]: Dream[] } = {};

    this.recentDreams.forEach(dream => {
      const dateKey = dream.date;
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(dream);
    });

    this.dreamGroups = Object.keys(groups)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
      .map(date => ({
        date: this.getFormattedDate(date),
        dreams: groups[date].sort((a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
      }));
  }

  getHeaderTitle(): string {
    if (this.recentDreams.length === 0) {
      return 'Sueños';
    }

    const count = this.recentDreams.length;
    return `${count} sueño${count !== 1 ? 's' : ''}`;
  }

  getFormattedDate(dateString: string): string {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Check if it's today
    if (date.toDateString() === today.toDateString()) {
      return 'Hoy';
    }

    // Check if it's yesterday
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Ayer';
    }

    // Check if it's this week
    const daysDiff = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (daysDiff < 7) {
      const days = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
      return days[date.getDay()];
    }

    // Format as date
    const months = [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ];
    return `${date.getDate()} de ${months[date.getMonth()]}`;
  }

  getFormattedTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getTruncatedDescription(description: string): string {
    // if (description.length > 80) {
    //   return description.substring(0, 80) + '...';
    // }
    return description;
  }

  getDreamType(dream: Dream): 'good' | 'bad' {
    return dream.type || 'good'; // Default to 'good' for existing dreams without type
  }

  getDreamTypeIcon(dream: Dream): string {
    return this.getDreamType(dream) === 'good' ? 'heart' : 'warning';
  }

  getDisplayedDreams(dreams: Dream[]): Dream[] {
    return dreams.slice(0, 5); // Show maximum 5 dreams
  }

  async addDream() {
    const modal = await this.modalController.create({
      component: AddDreamComponent,
      componentProps: {
        selectedDate: new Date().toISOString().split('T')[0]
      }
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
      component: DreamDetailComponent,
      componentProps: {
        dream: dream
      }
    });

    modal.onDidDismiss().then((result) => {
      if (result.data?.dreamUpdated || result.data?.dreamDeleted) {
        this.loadRecentDreams();
      }
    });

    await modal.present();
  }

  trackByDate(index: number, group: DreamGroup): string {
    return group.date;
  }

  trackByDream(index: number, dream: Dream): string {
    return dream.id;
  }
}

interface DreamGroup {
  date: string;
  dreams: Dream[];
}
