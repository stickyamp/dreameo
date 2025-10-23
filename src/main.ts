/// <reference types="@angular/localize" />

import "@angular/localize/init";
import { bootstrapApplication } from "@angular/platform-browser";
import { RouteReuseStrategy, provideRouter } from "@angular/router";
import {
  IonicRouteStrategy,
  provideIonicAngular,
} from "@ionic/angular/standalone";
import { provideFirebaseApp, initializeApp } from "@angular/fire/app";
import { provideAuth, getAuth } from "@angular/fire/auth";
import { provideFirestore, getFirestore } from "@angular/fire/firestore";
import { provideStorage, getStorage } from "@angular/fire/storage";
import { environment } from "./environments/environment";

import { routes } from "./app/app.routes";
import { AppComponent } from "./app/app.component";

import { provideTranslateService, TranslateService } from "@ngx-translate/core";
import { provideTranslateHttpLoader } from "@ngx-translate/http-loader";

// Importar y registrar los iconos
import { addIcons } from "ionicons";
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
  star,
  starOutline,
  warning,
  logoGoogle,
  eyeOutline,
  eyeOffOutline,
  phonePortraitOutline,
} from "ionicons/icons";

// Registrar los iconos
addIcons({
  calendar,
  "calendar-outline": calendarOutline,
  moon,
  "moon-outline": moonOutline,
  person,
  "person-outline": personOutline,
  add,
  "add-circle": addCircle,
  "chevron-back": chevronBack,
  "chevron-forward": chevronForward,
  "arrow-back": arrowBack,
  create,
  trash,
  play,
  stop,
  "volume-high": volumeHigh,
  mic,
  save,
  share,
  time,
  close,
  heart,
  star,
  "star-outline": starOutline,
  warning,
  "logo-google": logoGoogle,
  "eye-outline": eyeOutline,
  "eye-off-outline": eyeOffOutline,
  "phone-portrait-outline": phonePortraitOutline,
});

import { defineCustomElements } from "@ionic/core/loader";
import { importProvidersFrom } from "@angular/core";
import { provideHttpClient } from "@angular/common/http";

defineCustomElements(window);

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(routes),
    provideHttpClient(),
    provideTranslateService({
      lang: "en",
      fallbackLang: "en",
      loader: provideTranslateHttpLoader({
        prefix: "/assets/i18n/",
        suffix: ".json",
      }),
    }),

    // Firebase providers
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    provideStorage(() => getStorage()),
  ],
});
