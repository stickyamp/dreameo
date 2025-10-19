import { Directive, HostListener, Input, inject } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { AddDreamComponent } from 'src/app/pages/add-dream/add-dream.component';
import { DreamListComponent } from 'src/app/pages/dream-list/dream-list.component';
import { ConfigService } from '../services/config.service';

@Directive({
  selector: '[appShowDreamsList]',
  standalone: true,
  exportAs: 'appShowDreamsList'
})
export class ShowDreamsListDirective {
  private modalController = inject(ModalController);

  constructor(private configService: ConfigService) { }

  public async goToDayDreamList(date: string) {
    if (!date) {
      console.warn('⚠️ No date provided to appShowDreamsList directive.');
      return;
    }
    console.log(date, 'aaa');
    const modal = await this.modalController.create({
      component: DreamListComponent,
      componentProps: {
        selectedDate: date
      },
      presentingElement: await this.modalController.getTop()
    });

    await modal.present();
  }

  public async addDream(selectedDate: string) {
    const modal = await this.modalController.create({
      component: AddDreamComponent,
      cssClass: await this.configService.isDarkMode() ? 'ion-palette-dark' : 'ion-palette-light',
      componentProps: {
        selectedDate: selectedDate
      }
    });

    // modal.onDidDismiss().then((result) => {
    //   if (result.data?.dreamAdded) {
    //     this.loadDreams();
    //   }
    // });

    await modal.present();
  }
}
