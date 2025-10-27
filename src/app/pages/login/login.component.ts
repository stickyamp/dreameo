import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from "@angular/forms";
import {
  IonicModule,
  LoadingController,
  AlertController,
} from "@ionic/angular";
import { Router, RouterModule } from "@angular/router";
import { take } from "rxjs/operators";
import { AuthService } from "../../shared/services/auth.service";
import { FirebaseAuthService } from "../../shared/services/firebase-auth.service";
import { TranslateModule, TranslateService } from "@ngx-translate/core";

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.scss"],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    RouterModule,
    TranslateModule,
  ],
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  showPassword = false;
  isLoading = false;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private firebaseAuthService: FirebaseAuthService,
    private router: Router,
    private loadingController: LoadingController,
    private alertController: AlertController,
    private translate: TranslateService
  ) {
    this.loginForm = this.formBuilder.group({
      email: ["", [Validators.required, Validators.email]],
      password: ["", [Validators.required, Validators.minLength(6)]],
    });
  }

  ngOnInit() {
    // Check if user is already authenticated with a small delay
    setTimeout(() => {
      this.authService.isAuthenticated$.pipe(take(1)).subscribe((isAuth) => {
        console.log("Login component - isAuthenticated:", isAuth);
        if (isAuth) {
          this.router.navigate(["/tabs"]);
        }
      });
    }, 200);
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  async onLogin() {
    if (this.loginForm.valid) {
      this.isLoading = true;

      const email = this.loginForm.value.email;
      const password = this.loginForm.value.password;

      try {
        const result = await this.authService.login({ email, password });
        if (result.success) {
          this.router.navigate(["/tabs"]);
        } else {
          await this.showAlert(
            "Login Failed",
            result.message || "Invalid credentials"
          );
        }
      } catch (error: any) {
        await this.showAlert(
          "Login Failed",
          error.message || "Invalid credentials"
        );
      } finally {
        this.isLoading = false;
      }
    }
  }

  async onGoogleLogin() {
    this.isLoading = true;

    try {
      console.log("Starting Google Sign-In from login page...");
      const userProfile = await this.firebaseAuthService.signInWithGoogle();

      if (userProfile) {
        console.log("Google login successful, navigating to tabs");
        this.router.navigate(["/tabs"]);
      }
    } catch (error: any) {
      console.error("Google login error:", error);

      // No mostrar alerta si el usuario canceló
      if (
        error.message?.includes("cancelado") ||
        error.message?.includes("cancelled")
      ) {
        console.log("User cancelled Google login");
        return;
      }

      // Mostrar mensaje de error apropiado
      const header =
        this.translate.instant("PROFILE.GOOGLE_ERROR") || "Connection Error";
      const message =
        error.message ||
        this.translate.instant("PROFILE.GOOGLE_ERROR_MESSAGE") ||
        "Could not connect to Google account";

      await this.showAlert(header, message);
    } finally {
      this.isLoading = false;
    }
  }

  goToRegister() {
    this.router.navigate(["/register"]);
  }

  private async showAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ["OK"],
    });
    await alert.present();
  }
}
