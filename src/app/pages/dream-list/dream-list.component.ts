import { Component, DestroyRef, inject, Input, OnInit, ViewChild } from "@angular/core";
import { CommonModule } from "@angular/common";
import { IonicModule, ModalController } from "@ionic/angular";
import { DreamService } from "../../shared/services/dreams/dream.base.service";
import {
  Dream,
  OfficialTags,
  TagElement,
  TagModel,
} from "../../models/dream.model";
import { AddDreamComponent } from "../add-dream/add-dream.component";

import { ShowDreamsListDirective } from "src/app/shared/directives/add-dream-open-modal.directive";
import { TranslateModule, TranslateService } from "@ngx-translate/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { NoDreamsComponent } from "@/app/shared/ui-elements/no-dreams-splash.component";
import { ConfigService } from "@/app/shared/services/config.service";
import { provideDreamService } from "@/app/shared/services/providers";

@Component({
  selector: "app-dream-list",
  templateUrl: "./dream-list.component.html",
  styleUrls: ["./dream-list.component.scss"],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    ShowDreamsListDirective,
    TranslateModule,
    NoDreamsComponent,
  ],
  providers: [provideDreamService()]
})
export class DreamListComponent implements OnInit {
  @Input() selectedDate!: string;
  dreams: Dream[] = [];
  tags: TagModel[] = [];
  public OfficialTags = OfficialTags;
  private monthNames: string[] = [];
  public formattedDate: string = '';
  @ViewChild("modalOpener") modalOpener!: ShowDreamsListDirective;
  private dreamService: DreamService = inject(DreamService);

  constructor(
    private modalController: ModalController,
    private translate: TranslateService,
    private destroyRef: DestroyRef,
    private configService: ConfigService
  ) {
    const lang = localStorage.getItem("lang") || "es";
    this.translate.use(lang);
  }

  ngOnInit() {
    this.updateLocalizedLabels();
    this.formattedDate = this.getFormattedDate();

    // Subscribe to dreams changes to reactively update the component
    this.dreamService.dreams$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((dreamsByDate) => {
        this.dreams = this.dreamService.getDreamsByDate(this.selectedDate);
      });

    this.dreamService.tags$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((tags) => {
        this.tags = tags;
      });

    // Subscribe to language changes
    this.translate.onLangChange.subscribe(() => {
      this.updateLocalizedLabels();
    });

    // Load initial dreams
    this.loadDreams();
  }

  private updateLocalizedLabels() {
    this.translate.get("CALENDAR.MONTHS").subscribe((months: string[]) => {
      if (Array.isArray(months) && months.length === 12) {
        this.monthNames = months;
      }
    });
  }

  loadDreams() {
    this.dreams = this.dreamService.getDreamsByDate(this.selectedDate);
  }

  getFormattedDate(): string {
    const date = new Date(this.selectedDate);
    const monthName =
      this.monthNames.length === 12
        ? this.monthNames[date.getMonth()]
        : date.getMonth() + 1;
    const lang = this.translate.currentLang || "es";
    return lang === "en"
      ? `${monthName} ${date.getDate()}, ${date.getFullYear()}`
      : `${date.getDate()} de ${monthName} de ${date.getFullYear()}`;
  }

  getMonthAbbreviation(date: string): string {
    const d = new Date(date);
    const monthName =
      this.monthNames.length === 12
        ? this.monthNames[d.getMonth()]
        : (d.getMonth() + 1).toString();
    // Get first 3 letters for abbreviation
    return typeof monthName === "string"
      ? monthName.substring(0, 3).toUpperCase()
      : monthName;
  }

  getFormattedTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  getTruncatedDescription(description: string): string {
    if (description.length > 100) {
      return description.substring(0, 100) + "...";
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
      cssClass: (await this.configService.isDarkMode())
        ? "ion-palette-dark"
        : "ion-palette-light",
      componentProps: {
        selectedDate: this.selectedDate,
      },
    });

    // No need to manually reload dreams - the subscription will handle it
    await modal.present();
  }

  async viewDream(dream: Dream) {
    const modal = await this.modalController.create({
      component: AddDreamComponent,
      cssClass: (await this.configService.isDarkMode())
        ? "ion-palette-dark"
        : "ion-palette-light",
      componentProps: {
        dream: dream,
        selectedDate: dream.date,
      },
    });

    // No need to manually reload dreams - the subscription will handle it
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
