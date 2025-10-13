import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { ShowDreamsListDirective } from '../shared/directives/add-dream-open-modal.directive';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.component.html',
  styleUrls: ['./tabs.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, IonicModule, ShowDreamsListDirective]
})
export class TabsComponent {
  @ViewChild('modalOpener') modalOpener!: ShowDreamsListDirective;

  constructor() { }

  async openAddDream() {
    this.modalOpener.addDream(new Date().toISOString().split('T')[0]);
  }

}
