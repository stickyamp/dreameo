/// <reference types="@angular/localize" />

import '@angular/localize/init';
import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';
// Firebase imports commented out until proper configuration
// import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
// import { provideAuth, getAuth } from '@angular/fire/auth';
// import { provideFirestore, getFirestore } from '@angular/fire/firestore';
// import { provideStorage, getStorage } from '@angular/fire/storage';
// import { environment } from './environments/environment';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';

// Importar y registrar los iconos
import { addIcons } from 'ionicons';
import {
  calendar,
  calendarOutline,
  moon,
  moonOutline,
  person,
  personOutline,
  add,
  addCircle,
  chevronBack,
  chevronForward,
  arrowBack,
  create,
  trash,
  play,
  stop,
  volumeHigh,
  mic,
  save,
  share,
  time,
  close,
  heart,
  warning
} from 'ionicons/icons';

// Registrar los iconos
addIcons({
  calendar,
  'calendar-outline': calendarOutline,
  moon,
  'moon-outline': moonOutline,
  person,
  'person-outline': personOutline,
  add,
  'add-circle': addCircle,
  'chevron-back': chevronBack,
  'chevron-forward': chevronForward,
  'arrow-back': arrowBack,
  create,
  trash,
  play,
  stop,
  'volume-high': volumeHigh,
  mic,
  save,
  share,
  time,
  close,
  heart,
  warning
});

import { defineCustomElements } from '@ionic/core/loader';

defineCustomElements(window);

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(routes),
    // Firebase providers commented out until proper configuration
    // provideFirebaseApp(() => initializeApp(environment.firebase)),
    // provideAuth(() => getAuth()),
    // provideFirestore(() => getFirestore()),
    // provideStorage(() => getStorage()),
  ],
});
