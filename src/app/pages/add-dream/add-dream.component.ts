import { Component, DestroyRef, Input, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { IonicModule, ModalController, AlertController } from "@ionic/angular";
import { DreamService } from "../../shared/services/dreams/dream.base.service";
import { AudioService } from "../../shared/services/audio.service";
import {
  Dream,
  OfficialTags,
  TagElement,
  TagModel,
} from "../../models/dream.model";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { ToastNotifierService } from "../../shared/services/toast-notifier";
import { TranslateModule, TranslateService } from "@ngx-translate/core";
import { provideDreamService } from "@/app/shared/services/providers";

@Component({
  selector: "app-add-dream",
  templateUrl: "./add-dream.component.html",
  styleUrls: ["./add-dream.component.scss"],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, TranslateModule],
  providers: [provideDreamService()]
})
export class AddDreamComponent implements OnInit {
  @Input() selectedDate!: string;
  @Input() dream?: Dream;

  isEditing = false;
  isListening = false;
  isPlayingAudio = false;
  audioPath?: string;
  isAddingTag = false;
  newTagText = "";
  isSaveDisabled = false;

  baseTags: TagElement[] = [];

  tags: TagElement[] = [];
  dreamData = {
    title: "",
    description: "",
    type: "good" as "good" | "bad",
  };

  constructor(
    private modalController: ModalController,
    private alertController: AlertController,
    private dreamService: DreamService,
    private audioService: AudioService,
    private destroyRef: DestroyRef,
    private toastNotifierService: ToastNotifierService,
    private translate: TranslateService
  ) {
    const lang = localStorage.getItem("lang") || "en";
    this.translate.use(lang);
  }

  async ngOnInit() {
    this.audioService.isListening$.subscribe((isListening) => {
      this.isListening = isListening;
    });
    // Initialize base tags with translations
    this.baseTags = [
      {
        name: this.translate.instant("ADD_DREAM.TAG_LUCID"),
        checked: false,
        canBeRemoved: false,
        type: OfficialTags.LUCID,
      },
      {
        name: this.translate.instant("ADD_DREAM.TAG_NIGHTMARE"),
        checked: false,
        canBeRemoved: false,
        type: OfficialTags.NIGHTMARE,
      },
    ];

    if (this.dream) {
      this.isEditing = true;
      this.dreamData.title = this.dream.title;
      this.dreamData.description = this.dream.description || "";
      //this.dreamData.type = this.dream.type || 'good';
      //this.audioPath = this.dream.audioPath;
      this.selectedDate = this.dream.date;
    } else {
      const dreams = await this.dreamService.getAllDreams();
      const dreamWord = this.translate.instant("ADD_DREAM.DEFAULT_TITLE");
      this.dreamData.title = `${dreamWord} ${dreams.length + 1}`;
    }

    this.tags = this.baseTags;
    this.dreamService.tags$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((tagsFromSource) => {
        this.tags = [...this.baseTags, ...this.getAllTags(tagsFromSource)];
      });
  }

  private getAllTags(tagsFromSource: TagModel[]): TagElement[] {
    return tagsFromSource.map((e) => {
      return {
        name: e.name,
        checked: false,
        canBeRemoved: true,
        type: OfficialTags.REGULAR,
      } as TagElement;
    });
  }

  getFormattedDate(): string {
    const date = new Date(this.selectedDate);
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
    return `${date.getDate()} de ${months[date.getMonth()]
      } de ${date.getFullYear()}`;
  }

  canSave(): boolean {
    return (
      this.dreamData.title.trim().length > 0 &&
      this.dreamData.description.trim().length > 0
    );
  }

  async startRecording() {
    try {
      const success = await this.audioService.startListening();
      if (success) {
        console.log("Grabación iniciada correctamente");
        this.dreamData.description = success;

      } else {
        //await this.showAlert('Error', 'No se pudo iniciar la grabación. Verifica que tengas permisos de micrófono.');
      }
    } catch (error) {
      console.error("Error starting recording:", error);
      await this.showAlert(
        "Error",
        `No se pudo iniciar la grabación. Verifica que tengas permisos de micrófono. ${error}`
      );
    }
  }

  async stopRecording() {
    try {
      await this.audioService.stopListening();
    } catch (error) {
      console.error("Error stopping recording:", error);
      await this.showAlert("Error", "Error al detener la grabación.");
    }
  }

  async saveDream() {
    if (this.isSaveDisabled) return;

    this.isSaveDisabled = true;

    try {
      if (this.isEditing && this.dream) {
        // Update existing dream
        await this.dreamService.updateDream(this.dream.id, {
          title: this.dreamData.title.trim(),
          description: this.dreamData.description.trim() || undefined,
          tags: this.tags
            .filter((t) => t.checked)
            .map((t) => {
              return { name: t.name, type: t.type } as TagModel;
            }),
          isLucid: !!this.tags.find(
            (t) => t.type == OfficialTags.LUCID && t.checked
          ),
          isNightmare: !!this.tags.find(
            (t) => t.type == OfficialTags.NIGHTMARE && t.checked
          ),
          //type: this.dreamData.type,
          //audioPath: this.audioPath
        });
      } else {
        // Create new dream
        await this.dreamService.addDream({
          date: this.selectedDate,
          title: this.dreamData.title.trim(),
          description: this.dreamData.description.trim() || undefined,
          tags: this.tags
            .filter((t) => t.checked)
            .map((t) => {
              return { name: t.name, type: t.type } as TagModel;
            }),
          isLucid: !!this.tags.find(
            (t) => t.type == OfficialTags.LUCID && t.checked
          ),
          isNightmare: !!this.tags.find(
            (t) => t.type == OfficialTags.NIGHTMARE && t.checked
          ),
          //type: this.dreamData.type,
          //audioPath: this.audioPath
        });
      }

      this.modalController.dismiss({
        dreamAdded: !this.isEditing,
        dreamUpdated: this.isEditing,
      });
    } catch (error) {
      console.error("Error saving dream:", error);
      this.isSaveDisabled = false;
      await this.showAlert(
        "Error",
        "No se pudo guardar el sueño. Inténtalo de nuevo."
      );
    }
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

  toggleTag(tag: any) {
    tag.checked = !tag.checked;
  }

  toogleIsAddingTag() {
    this.isAddingTag = !this.isAddingTag;
  }

  saveTag() {
    console.log("manuXX aa", this.newTagText);
    if (this.newTagText.length <= 0) return;

    this.dreamService.addTag(this.newTagText, OfficialTags.REGULAR);
    this.cancelTag();
  }

  cancelTag() {
    this.newTagText = "";
    this.isAddingTag = false;
  }

  async deleteTag(tagName: string) {
    const confirmation = await this.toastNotifierService.presentAlert(
      "Confirm the delete for tag:",
      tagName
    );

    console.log("confirmation", confirmation);

    if (!confirmation) return;

    this.dreamService.deleteTag(tagName);
  }

  async deleteDream() {
    if (!this.isEditing || !this.dream) return;

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
                this.dream!.id
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
}
