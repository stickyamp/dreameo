import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController } from '@ionic/angular';
import { DreamService } from '../../../shared/services/dream.service';
import { Dream } from '../../../models/dream.model';
import { AddDreamComponent } from '../../add-dream/add-dream.component';
import { DreamListComponent } from '../../dream-list/dream-list.component';
import { ShowDreamsListDirective } from 'src/app/shared/directives/add-dream-open-modal.directive';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, ShowDreamsListDirective]
})
export class CalendarComponent implements OnInit {
  currentDate = new Date();
  selectedDate?: string;
  modalSendDate?: string;
  calendarDays: CalendarDay[] = [];
  daysOfWeek = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];
  @ViewChild('modalOpener') modalOpener!: ShowDreamsListDirective;

  constructor(
    private dreamService: DreamService,
    private modalController: ModalController,
  ) { }

  ngOnInit() {
    this.generateCalendar();

    // Subscribe to dreams changes to update calendar
    this.dreamService.dreams$.subscribe(() => {
      this.generateCalendar();
    });
  }

  generateCalendar() {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();

    // First day of the month
    const firstDay = new Date(year, month, 1);
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0);

    // Start from Sunday of the week containing the first day
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - startDate.getDay());

    // End on Saturday of the week containing the last day
    const endDate = new Date(lastDay);
    endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));

    this.calendarDays = [];
    const current = new Date(startDate);

    while (current <= endDate) {
      this.calendarDays.push({
        date: this.formatDate(current),
        day: current.getDate(),
        currentMonth: current.getMonth() === month
      });
      current.setDate(current.getDate() + 1);
    }
  }

  formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  getMonthYearLabel(): string {
    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return `${months[this.currentDate.getMonth()]} ${this.currentDate.getFullYear()}`;
  }

  previousMonth() {
    this.currentDate.setMonth(this.currentDate.getMonth() - 1);
    this.generateCalendar();
  }

  nextMonth() {
    this.currentDate.setMonth(this.currentDate.getMonth() + 1);
    this.generateCalendar();
  }

  selectDay(day: CalendarDay) {
    if (!day.currentMonth) return;

    this.selectedDate = day.date;
    this.showDreamsList(day.date);
  }

  async showDreamsList(date: string) {
    this.modalSendDate = date;
    console.log(this.modalSendDate);
    this.modalOpener.trigger(date);
  }

  async addDream() {
    const modal = await this.modalController.create({
      component: AddDreamComponent,
      componentProps: {
        selectedDate: this.selectedDate || this.formatDate(new Date())
      }
    });

    modal.onDidDismiss().then(() => {
      // Refresh calendar if needed
      this.generateCalendar();
    });

    await modal.present();
  }

  hasDreams(date: string): boolean {
    return this.dreamService.hasDreams(date);
  }

  isSelected(date: string): boolean {
    return this.selectedDate === date;
  }

  isToday(date: string): boolean {
    return this.formatDate(new Date()) === date;
  }

  trackByDay(index: number, day: CalendarDay): string {
    return day.date;
  }

  isFirstDayOfMonth(day: CalendarDay): boolean {
    return day.day === 1 && day.currentMonth;
  }

  getDreamCount(date: string): number {
    return this.dreamService.getDreamsByDate(date).length;
  }
}

interface CalendarDay {
  date: string;
  day: number;
  currentMonth: boolean;
}
