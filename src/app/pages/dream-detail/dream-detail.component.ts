import { Component, Input, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { IonicModule, ModalController, AlertController } from "@ionic/angular";
import { DreamService } from "../../shared/services/dream.service";
import { AudioService } from "../../shared/services/audio.service";
import { Dream } from "../../models/dream.model";
import { AddDreamComponent } from "../add-dream/add-dream.component";
import { TranslateModule, TranslateService } from "@ngx-translate/core";

@Component({
  selector: "app-dream-detail",
  templateUrl: "./dream-detail.component.html",
  styleUrls: ["./dream-detail.component.scss"],
  standalone: true,
  imports: [CommonModule, IonicModule, TranslateModule],
})
export class DreamDetailComponent implements OnInit {
  @Input() dream!: Dream;
  isPlayingAudio = false;

  constructor(
    private modalController: ModalController,
    private alertController: AlertController,
    private dreamService: DreamService,
    private audioService: AudioService,
    private translate: TranslateService
  ) {
    const lang = localStorage.getItem("lang") || "es";
    this.translate.use(lang);
  }

  ngOnInit() {
    if (!this.dream) {
      this.dismiss();
    }
  }

  getFormattedDate(): string {
    const date = new Date(this.dream.date);
    const months = [
      "enero",
      "febrero",
      "marzo",
      "abril",
      "mayo",
      "junio",
      "julio",
      "agosto",
      "septiembre",
      "octubre",
      "noviembre",
      "diciembre",
    ];
    return `${date.getDate()} de ${
      months[date.getMonth()]
    } de ${date.getFullYear()}`;
  }

  getFormattedTime(): string {
    const date = new Date(this.dream.createdAt);
    return date.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  getFullFormattedDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  // getDreamType(): 'good' | 'bad' {
  //   return this.dream.type || 'good'; // Default to 'good' for existing dreams without type
  // }

  // getDreamTypeLabel(): string {
  //   return this.getDreamType() === 'good' ? 'Sueño bueno' : 'Pesadilla';
  // }

  // getDreamTypeIcon(): string {
  //   return this.getDreamType() === 'good' ? 'heart' : 'warning';
  // }

  // async playAudio() {
  //   if (!this.dream.audioPath) return;

  //   try {
  //     this.isPlayingAudio = true;
  //     await this.audioService.playAudio(this.dream.audioPath);
  //   } catch (error) {
  //     console.error('Error playing audio:', error);
  //     await this.showAlert('Error', 'No se pudo reproducir el audio.');
  //   } finally {
  //     this.isPlayingAudio = false;
  //   }
  // }

  async editDream() {
    const modal = await this.modalController.create({
      component: AddDreamComponent,
      componentProps: {
        dream: this.dream,
        selectedDate: this.dream.date,
      },
    });

    modal.onDidDismiss().then((result) => {
      if (result.data?.dreamUpdated) {
        // Refresh the dream data
        const updatedDream = this.dreamService.getDreamById(this.dream.id);
        if (updatedDream) {
          this.dream = updatedDream;
        }

        this.modalController.dismiss({
          dreamUpdated: true,
        });
      }
    });

    await modal.present();
  }

  async deleteDream() {
    const alert = await this.alertController.create({
      header: "Eliminar sueño",
      message:
        "¿Estás seguro de que quieres eliminar este sueño? Esta acción no se puede deshacer.",
      buttons: [
        {
          text: "Cancelar",
          role: "cancel",
        },
        {
          text: "Eliminar",
          role: "destructive",
          handler: async () => {
            try {
              const deleted = await this.dreamService.deleteDream(
                this.dream.id
              );
              if (deleted) {
                this.modalController.dismiss({
                  dreamDeleted: true,
                });
              } else {
                await this.showAlert("Error", "No se pudo eliminar el sueño.");
              }
            } catch (error) {
              console.error("Error deleting dream:", error);
              await this.showAlert("Error", "Error al eliminar el sueño.");
            }
          },
        },
      ],
    });

    await alert.present();
  }

  dismiss() {
    this.modalController.dismiss();
  }

  private async showAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ["OK"],
    });
    await alert.present();
  }
}
