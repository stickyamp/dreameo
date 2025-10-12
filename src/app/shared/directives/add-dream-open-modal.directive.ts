import { Directive, HostListener, Input, inject } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { DreamListComponent } from 'src/app/pages/dream-list/dream-list.component';

@Directive({
  selector: '[appShowDreamsList]',
  standalone: true,
  exportAs: 'appShowDreamsList'
})
export class ShowDreamsListDirective {
  private modalController = inject(ModalController);

  constructor() { }

  public async trigger(date: string) {
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
}
