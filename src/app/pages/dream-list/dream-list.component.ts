import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController } from '@ionic/angular';
import { DreamService } from '../../shared/services/dream.service';
import { Dream } from '../../models/dream.model';
import { AddDreamComponent } from '../add-dream/add-dream.component';
import { DreamDetailComponent } from '../dream-detail/dream-detail.component';
import { ShowDreamsListDirective } from 'src/app/shared/directives/add-dream-open-modal.directive';

@Component({
  selector: 'app-dream-list',
  templateUrl: './dream-list.component.html',
  styleUrls: ['./dream-list.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, ShowDreamsListDirective]
})
export class DreamListComponent implements OnInit {
  @Input() selectedDate!: string;
  dreams: Dream[] = [];

  @ViewChild('modalOpener') modalOpener!: ShowDreamsListDirective;


  constructor(
    private dreamService: DreamService,
    private modalController: ModalController
  ) { }

  ngOnInit() {
    this.loadDreams();
  }

  loadDreams() {
    this.dreams = this.dreamService.getDreamsByDate(this.selectedDate);
  }

  getFormattedDate(): string {
    const date = new Date(this.selectedDate);
    const months = [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ];
    return `${date.getDate()} de ${months[date.getMonth()]} de ${date.getFullYear()}`;
  }

  getFormattedTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getTruncatedDescription(description: string): string {
    if (description.length > 100) {
      return description.substring(0, 100) + '...';
    }
    return description;
  }

  // getDreamType(dream: Dream): 'good' | 'bad' {
  //   return dream.type || 'good'; // Default to 'good' for existing dreams without type
  // }

  // getDreamTypeIcon(dream: Dream): string {
  //   return this.getDreamType(dream) === 'good' ? 'heart' : 'warning';
  // }

  async addDream() {
    const modal = await this.modalController.create({
      component: AddDreamComponent,
      componentProps: {
        selectedDate: this.selectedDate
      }
    });

    modal.onDidDismiss().then((result) => {
      if (result.data?.dreamAdded) {
        this.loadDreams();
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
        this.loadDreams();
      }
    });

    await modal.present();
  }

  dismiss() {
    this.modalController.dismiss();
  }

  trackByDream(index: number, dream: Dream): string {
    return dream.id;
  }

  openAddDream() {
    this.modalOpener.addDream(this.selectedDate);
  }
}
