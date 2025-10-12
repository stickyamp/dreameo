import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-splash',
  templateUrl: './splash.component.html',
  styleUrls: ['./splash.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class SplashComponent implements OnInit {

  constructor(private router: Router) {}

  ngOnInit() {
    // Enable dark mode
    document.documentElement.classList.add('ion-palette-dark');
  }

  goToCalendar() {
    this.router.navigate(['/tabs/calendar']);
  }
}
