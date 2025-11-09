import {
  Injectable,
  ApplicationRef,
  createComponent,
  EnvironmentInjector,
} from "@angular/core";
import { SplashComponent } from "./splash.component";

@Injectable({
  providedIn: "root",
})
export class SplashService {
  private isShowing = false;
  private componentRef: any = null;

  constructor(
    private appRef: ApplicationRef,
    private injector: EnvironmentInjector
  ) {}

  async show(duration: number = 1500): Promise<void> {
    if (this.isShowing) {
      return;
    }

    this.isShowing = true;

    // Create the component
    this.componentRef = createComponent(SplashComponent, {
      environmentInjector: this.injector,
    });

    // Attach to the application
    this.appRef.attachView(this.componentRef.hostView);

    // Get the DOM element
    const domElem = (this.componentRef.hostView as any)
      .rootNodes[0] as HTMLElement;

    // Append to body
    document.body.appendChild(domElem);

    // Auto-hide after duration
    setTimeout(() => {
      this.hide();
    }, duration);
  }

  hide(): void {
    if (!this.isShowing || !this.componentRef) {
      return;
    }

    // Remove from DOM
    const domElem = (this.componentRef.hostView as any)
      .rootNodes[0] as HTMLElement;
    if (domElem && domElem.parentNode) {
      domElem.parentNode.removeChild(domElem);
    }

    // Detach from application
    this.appRef.detachView(this.componentRef.hostView);

    // Destroy component
    this.componentRef.destroy();
    this.componentRef = null;
    this.isShowing = false;
  }
}
