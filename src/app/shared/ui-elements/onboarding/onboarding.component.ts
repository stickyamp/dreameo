import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  EventEmitter,
  Output,
  ViewChild,
  ElementRef,
  inject,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { IonicModule } from "@ionic/angular";
import { register } from "swiper/element/bundle";
import { Router } from "@angular/router";
import { FirebaseAuthService } from "../../services/firebase-auth.service";
import {
  ToastLevelEnum,
  ToastNotifierService,
} from "../../services/toast-notifier";
import { Preferences } from "@capacitor/preferences";
import { LocalNotifications } from "@capacitor/local-notifications";
import { ConfigService } from "../../services/config.service";

// Register Swiper custom elements
register();

interface OnboardingSlide {
  icon: string;
  width?: number;
  height?: number;
  class?: string;
  title: string;
  description: string;
  background: string;
}

@Component({
  selector: "app-onboarding",
  templateUrl: "./onboarding.component.html",
  styleUrls: ["./onboarding.component.scss"],
  standalone: true,
  imports: [CommonModule, IonicModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class OnboardingComponent {
  @ViewChild("swiper", { static: false }) swiperRef?: ElementRef<any>;
  @Output() completed = new EventEmitter<void>();
  ONBOARDING_DONE = "ONBOARDING_DONE";

  private readonly router = inject(Router);
  private readonly firebaseAuthService = inject(FirebaseAuthService);
  private readonly toastNotifierService = inject(ToastNotifierService);
  private readonly configService = inject(ConfigService);
  currentSlideIndex = 0;

  onboardingSlides: OnboardingSlide[] = [
    {
      icon: "assets/images/logo_no_bg.png",
      width: 400,
      height: 320,
      title: "Welcome to Dreamt",
      description:
        "Your personal space to record, analyze, and understand your dreams. Let's begin your journey of self-discovery.",
      background:
        "linear-gradient(135deg, rgba(255, 182, 193, 0.3) 0%, rgba(173, 216, 230, 0.3) 100%)",
    },
    {
      icon: "assets/images/onboarding/onboarding_dreams.png",
      width: 180,
      height: 336,
      class: "onboarding-dreams glowing-image",
      title: "Your Dream Journal",
      description:
        "All your dreams in one place. Easily add new dreams and revisit your past adventures anytime.",
      background:
        "linear-gradient(135deg, rgba(216, 191, 216, 0.3) 0%, rgba(230, 230, 250, 0.3) 100%)",
    },
    {
      icon: "assets/images/onboarding/onboarding_statistics.png",
      width: 180,
      height: 336,
      class: "onboarding-dreams glowing-image",
      title: "Track Your Progress",
      description:
        "Discover patterns in your dreams with our advanced statistics. Understand your sleep common themes, and emotional trends over time.",
      background:
        "linear-gradient(135deg, rgba(176, 224, 230, 0.3) 0%, rgba(152, 251, 152, 0.3) 100%)",
    },
    {
      icon: "notifications-outline",
      title: "Never miss an insight",
      description:
        "Get gentle reminders to journal your dreams and unlock patterns in your sleep.",
      background:
        "linear-gradient(135deg, rgba(173, 216, 230, 0.3) 0%, rgba(135, 206, 235, 0.3) 100%)",
    },
    {
      icon: "cloud-upload-outline",
      title: "Save Your Dreams",
      description:
        "Securely back up your dream journal to the cloud. Never lose your precious insights and access them from any device.",
      background:
        "linear-gradient(135deg, rgba(173, 216, 230, 0.3) 0%, rgba(135, 206, 235, 0.3) 100%)",
    },
  ];

  isUserLoggedIn = false;
  isConnectingGoogle = false;

  areNotificationsEnabled = false;
  isEnablingNotifications = false;

  ngOnInit() {
    // Suscribirse a cambios en el estado de autenticación de Firebase
    this.firebaseAuthService.currentUser$.subscribe(async (user) => {
      console.log("Firebase user state changed asaasasassasa:", user);
      this.isUserLoggedIn = (user && user.email.length > 0) || false;
    });
  }

  ngAfterViewInit() {
    const swiperEl = this.swiperRef?.nativeElement as HTMLElement;
    if (swiperEl) {
      swiperEl.addEventListener("swiperslidechange", () => {
        const swiper = (swiperEl as any).swiper;
        this.currentSlideIndex = swiper.activeIndex;
      });
    }
  }

  nextSlide(): void {
    const swiper = this.swiperRef?.nativeElement.swiper;
    if (swiper) {
      if (swiper.isEnd) {
        this.completeOnboarding();
      } else {
        swiper.slideNext();
      }
    }
  }

  skip(): void {
    this.completeOnboarding();
  }

  completeOnboarding(): void {
    this.router.navigate(["/tabs/history"]);
    this.markOnboardingAsDone();
    this.completed.emit();
  }

  loginGoogle() {
    if (this.isUserLoggedIn) return;
    this.connectGoogleAccount();
  }

  async connectGoogleAccount(): Promise<void> {
    if (this.isConnectingGoogle) return;

    this.isConnectingGoogle = true;

    try {
      await this.firebaseAuthService.signInWithGoogle();
      await new Promise((resolve) => setTimeout(resolve, 500));
      const currentUser = this.firebaseAuthService.getCurrentUser();
      if (currentUser) {
        this.isUserLoggedIn = true;
        this.notifyToastSuccededLogin();
      } else {
        console.warn("No user found after Google sign in");
      }
    } catch (error: any) {
      console.error("Google connection error:", error);
      if (
        error.message?.includes("cancelado") ||
        error.message?.includes("cancelled")
      ) {
        console.log("User cancelled Google connection");
        return;
      }
    } finally {
      this.isConnectingGoogle = false;
      this.router.navigate([""]);
    }
  }

  async toggleNotificationPermission() {
    if (this.isEnablingNotifications) return;
    if (this.areNotificationsEnabled) return;
    this.isEnablingNotifications = true;
    if (!LocalNotifications) {
      console.error("Error no LN:");
      this.areNotificationsEnabled = false;
      this.isEnablingNotifications = false;
      return;
    }
    if (this.areNotificationsEnabled) {
      console.error("Error no LN 2:");
      await LocalNotifications.cancel({ notifications: [{ id: 1 }] });
      this.areNotificationsEnabled = false;
      this.isEnablingNotifications = false;
      return;
    }
    const permResult = await LocalNotifications.requestPermissions();
    if (permResult.display === "granted") {
      await this.configService.scheduleDailyNotificationByLang();
      this.areNotificationsEnabled = true;
    } else {
      this.areNotificationsEnabled = false;
    }
    this.isEnablingNotifications = false;
  }

  async notifyToastSuccededLogin() {
    const confirmation = await this.toastNotifierService.presentToast(
      "All set up, ready to go",
      ToastLevelEnum.INFO,
      "bottom",
      4000,
      "checkmark-outline"
    );
  }

  async markOnboardingAsDone() {
    await Preferences.set({
      key: this.ONBOARDING_DONE,
      value: "true",
    });
  }
}
