import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ModalController, AlertController } from '@ionic/angular';
import { DreamService } from '../../shared/services/dream.service';
import { AudioService } from '../../shared/services/audio.service';
import { Dream } from '../../models/dream.model';

@Component({
  selector: 'app-add-dream',
  templateUrl: './add-dream.component.html',
  styleUrls: ['./add-dream.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class AddDreamComponent implements OnInit {
  @Input() selectedDate!: string;
  @Input() dream?: Dream;

  isEditing = false;
  isRecording = false;
  isPlayingAudio = false;
  audioPath?: string;

  dreamData = {
    title: '',
    description: '',
    type: 'good' as 'good' | 'bad',
  };

  constructor(
    private modalController: ModalController,
    private alertController: AlertController,
    private dreamService: DreamService,
    private audioService: AudioService
  ) { }

  ngOnInit() {
    if (this.dream) {
      this.isEditing = true;
      this.dreamData.title = this.dream.title;
      this.dreamData.description = this.dream.description || '';
      this.dreamData.type = this.dream.type || 'good';
      this.audioPath = this.dream.audioPath;
      this.selectedDate = this.dream.date;
    }
  }

  getFormattedDate(): string {
    const date = new Date(this.selectedDate);
    const months = [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ];
    return `${date.getDate()} de ${months[date.getMonth()]} de ${date.getFullYear()}`;
  }

  canSave(): boolean {
    return this.dreamData.title.trim().length > 0;
  }

  async startRecording() {
    try {
      await this.audioService.startRecording();
      this.isRecording = true;
    } catch (error) {
      console.error('Error starting recording:', error);
      await this.showAlert('Error', 'No se pudo iniciar la grabación. Verifica que tengas permisos de micrófono.');
    }
  }

  async stopRecording() {
    try {
      this.audioPath = await this.audioService.stopRecording();
      this.isRecording = false;
    } catch (error) {
      console.error('Error stopping recording:', error);
      await this.showAlert('Error', 'Error al detener la grabación.');
      this.isRecording = false;
    }
  }

  async playAudio() {
    if (!this.audioPath) return;

    try {
      this.isPlayingAudio = true;
      await this.audioService.playAudio(this.audioPath);
    } catch (error) {
      console.error('Error playing audio:', error);
      await this.showAlert('Error', 'No se pudo reproducir el audio.');
    } finally {
      this.isPlayingAudio = false;
    }
  }

  async deleteAudio() {
    const alert = await this.alertController.create({
      header: 'Eliminar audio',
      message: '¿Estás seguro de que quieres eliminar la grabación de voz?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => {
            this.audioPath = undefined;
          }
        }
      ]
    });

    await alert.present();
  }

  async saveDream() {
    if (!this.canSave()) {
      await this.showAlert('Error', 'El título es obligatorio');
      return;
    }

    try {
      if (this.isEditing && this.dream) {
        // Update existing dream
        await this.dreamService.updateDream(this.dream.id, {
          title: this.dreamData.title.trim(),
          description: this.dreamData.description.trim() || undefined,
          type: this.dreamData.type,
          audioPath: this.audioPath
        });
      } else {
        // Create new dream
        await this.dreamService.addDream({
          date: this.selectedDate,
          title: this.dreamData.title.trim(),
          description: this.dreamData.description.trim() || undefined,
          type: this.dreamData.type,
          audioPath: this.audioPath
        });
      }

      this.modalController.dismiss({
        dreamAdded: !this.isEditing,
        dreamUpdated: this.isEditing
      });
    } catch (error) {
      console.error('Error saving dream:', error);
      await this.showAlert('Error', 'No se pudo guardar el sueño. Inténtalo de nuevo.');
    }
  }

  dismiss() {
    this.modalController.dismiss();
  }

  private async showAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK']
    });
    await alert.present();
  }
}
