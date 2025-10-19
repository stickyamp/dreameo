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
  private allDreams: Dream[] = [];
  searchQuery: string = '';
  showSearch: boolean = false;
  showSearchbar() {
    this.showSearch = true;
    setTimeout(() => {
      const sb: any = document.querySelector('ion-searchbar');
      if (sb) sb.setFocus && sb.setFocus();
    }, 200);
  }
  hideSearch() {
    this.showSearch = false;
    // Optionally clear search: this.searchQuery = '';
    // this.applyFilterAndGroup();
  }

  // Month selector state
  months: { label: string; index: number }[] = [
    { label: 'enero', index: 0 },
    { label: 'febrero', index: 1 },
    { label: 'marzo', index: 2 },
    { label: 'abril', index: 3 },
    { label: 'mayo', index: 4 },
    { label: 'junio', index: 5 },
    { label: 'julio', index: 6 },
    { label: 'agosto', index: 7 },
    { label: 'septiembre', index: 8 },
    { label: 'octubre', index: 9 },
    { label: 'noviembre', index: 10 },
    { label: 'diciembre', index: 11 }
  ];
  selectedYear: number = new Date().getFullYear();
  selectedMonthIndex: number = new Date().getMonth();

  constructor(
    private dreamService: DreamService,
    private modalController: ModalController
  ) { }

  ngOnInit() {
    this.loadRecentDreams();
    this.initializeMockTags();

    // Subscribe to dreams changes
    this.dreamService.dreams$.subscribe(() => {
      this.loadRecentDreams();
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
      ? source.filter(d =>
        (d.title || '').toLowerCase().includes(normalizedQuery) ||
        (d.description || '').toLowerCase().includes(normalizedQuery)
      )
      : source;

    // Filter by selected month/year
    const filteredByMonth = filteredByQuery.filter(d => {
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
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      })
      .slice(0, 200);

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

  onSearchChange(event: any) {
    this.searchQuery = event.target?.value || event.detail?.value || '';
    this.applyFilterAndGroup();
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

  // getDreamType(dream: Dream): 'good' | 'bad' {
  //   return dream.type || 'good'; // Default to 'good' for existing dreams without type
  // }

  // getDreamTypeIcon(dream: Dream): string {
  //   return this.getDreamType(dream) === 'good' ? 'heart' : 'warning';
  // }

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

  previousMonth() {
    if (this.selectedMonthIndex === 0) {
      this.selectedMonthIndex = 11;
      this.selectedYear -= 1;
    } else {
      this.selectedMonthIndex -= 1;
    }
    this.applyFilterAndGroup();
  }

  nextMonth() {
    if (this.selectedMonthIndex === 11) {
      this.selectedMonthIndex = 0;
      this.selectedYear += 1;
    } else {
      this.selectedMonthIndex += 1;
    }
    this.applyFilterAndGroup();
  }

  setMonth(index: number) {
    this.selectedMonthIndex = index;
    this.applyFilterAndGroup();
  }

  getCurrentMonthYearLabel(): string {
    const date = new Date(this.selectedYear, this.selectedMonthIndex, 1);
    const monthFormatter = new Intl.DateTimeFormat('es-ES', { month: 'long' });
    const month = monthFormatter.format(date);
    const year = this.selectedYear;
    // Capitalize first letter and combine without "de"
    return month.charAt(0).toUpperCase() + month.slice(1) + ' ' + year;
  }

  getAdjacentMonthLabel(offset: number): string {
    const d = new Date(this.selectedYear, this.selectedMonthIndex + offset, 1);
    const formatter = new Intl.DateTimeFormat('es-ES', { month: 'long' });
    const label = formatter.format(d);
    return label.charAt(0).toUpperCase() + label.slice(1);
  }

  // async toggleFavorite(dream: Dream, event?: Event) {
  //   if (event) {
  //     event.stopPropagation();
  //     event.preventDefault();
  //   }
  //   await this.dreamService.updateDream(dream.id, { favorite: !dream.favorite });
  //   this.loadRecentDreams();
  // }

  private initializeMockTags() {
    const allDreams = this.dreamService.getAllDreams();
    const tagOptions = [
      'Lucid dream', 'Nightmare', 'Chasing', 'Flying', 'Water', 'Animals',
      'Family', 'Work', 'Adventure', 'Romantic', 'Scary', 'Funny', 'Vivid'
    ];

    // Add mock tags to dreams that don't have them
    allDreams.forEach(dream => {
      if (!dream.tags || dream.tags.length === 0) {
        const numTags = Math.floor(Math.random() * 3) + 1; // 1-3 tags
        const selectedTags = [];
        const availableTags = [...tagOptions];

        for (let i = 0; i < numTags; i++) {
          const randomIndex = Math.floor(Math.random() * availableTags.length);
          selectedTags.push(availableTags.splice(randomIndex, 1)[0]);
        }

        this.dreamService.updateDream(dream.id, { tags: selectedTags });
      }
    });
  }

  getTagClass(tag: string): string {
    // Normalize tag to one-word (remove spaces, capitalize first letter for SCSS match)
    const normalized = tag.replace(/\s+/g, '');
    // List your SCSS-defined tag classes:
    const tagClassList = [
      'Flying', 'Lucid', 'Work', 'Anxiety', 'Beach', 'Relaxing',
      'Nightmare', 'Animals', 'Romantic', 'Scary'
    ];
    let match = tagClassList.find(sc => normalized.toLowerCase().includes(sc.toLowerCase()));
    if (match) return match;
    // fallback
    return '';
  }
}

interface DreamGroup {
  date: string;
  dreams: Dream[];
}
