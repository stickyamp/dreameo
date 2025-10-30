import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  EventEmitter,
  Output,
  ViewChild,
  ElementRef,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { IonicModule } from "@ionic/angular";
import { register } from "swiper/element/bundle";

// Register Swiper custom elements
register();

interface OnboardingSlide {
  icon: string;
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

  currentSlideIndex = 0;

  onboardingSlides: OnboardingSlide[] = [
    {
      icon: "",
      title: "Welcome to Dreamt",
      description:
        "Your personal space to record, analyze, and understand your dreams. Let's begin your journey of self-discovery.",
      background:
        "linear-gradient(135deg, rgba(255, 182, 193, 0.3) 0%, rgba(173, 216, 230, 0.3) 100%)",
    },
    {
      icon: "journal-outline",
      title: "Your Dream Journal",
      description:
        "All your dreams in one place. Easily add new dreams and revisit your past adventures anytime.",
      background:
        "linear-gradient(135deg, rgba(216, 191, 216, 0.3) 0%, rgba(230, 230, 250, 0.3) 100%)",
    },
    {
      icon: "stats-chart-outline",
      title: "Track Your Progress",
      description:
        "Discover patterns in your dreams with our advanced statistics. Understand your sleep quality, common themes, and emotional trends over time.",
      background:
        "linear-gradient(135deg, rgba(176, 224, 230, 0.3) 0%, rgba(152, 251, 152, 0.3) 100%)",
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
    this.completed.emit();
  }
}
