import { Routes } from "@angular/router";
import { AuthGuard } from "./guards/auth.guard";

export const routes: Routes = [
  {
    path: "",
    redirectTo: "/tabs/history",
    pathMatch: "full",
  },
  {
    path: "login",
    loadComponent: () =>
      import("./pages/login/login.component").then((m) => m.LoginComponent),
  },
  {
    path: "splash",
    loadComponent: () =>
      import("./pages/splash/splash.component").then((m) => m.SplashComponent),
  },
  {
    path: "test3",
    loadComponent: () =>
      import("../app/shared/ui-elements/onboarding/onboarding.component").then(
        (m) => m.OnboardingComponent
      ),
  },
  {
    path: "onboarding",
    loadComponent: () =>
      import("../app/shared/ui-elements/onboarding/onboarding.component").then(
        (m) => m.OnboardingComponent
      ),
  },
  {
    path: "tabs",
    loadComponent: () =>
      import("./tabs/tabs.component").then((m) => m.TabsComponent),
    canActivate: [],
    children: [
      {
        path: "",
        redirectTo: "/tabs/calendar",
        pathMatch: "full",
      },
      {
        path: "calendar",
        loadComponent: () =>
          import("./pages/calendar-page/calendar/calendar.component").then(
            (m) => m.CalendarComponent
          ),
      },
      {
        path: "history",
        loadComponent: () =>
          import("./pages/dreams/dreams.component").then(
            (m) => m.DreamsComponent
          ),
      },
      {
        path: "statistics",
        loadComponent: () =>
          import("./pages/statistics/statistics.component").then(
            (m) => m.DreamStatisticsPage
          ),
      },
      {
        path: "profile",
        loadComponent: () =>
          import("./pages/profile/profile.component").then(
            (m) => m.ProfileComponent
          ),
      },
      {
        path: "test",
        loadComponent: () =>
          import(
            "../app/shared/ui-elements/logViewer/log-viewer.component"
          ).then((m) => m.LogViewerComponent),
      },
    ],
  },
];
