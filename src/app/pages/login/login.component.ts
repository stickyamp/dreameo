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
import { FirebaseAuthService } from "../../shared/services/firebase-auth.service";
import { TranslateModule } from "@ngx-translate/core";

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
    private authService: FirebaseAuthService,
    private router: Router,
    private loadingController: LoadingController,
    private alertController: AlertController
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
        await this.authService.login(email, password);
        this.router.navigate(["/tabs"]);
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
    if (this.isLoading) return; // Evitar múltiples clics

    this.isLoading = true;
    const loading = await this.loadingController.create({
      message: "Conectando con Google...",
      spinner: "crescent",
    });

    try {
      await loading.present();
      await this.authService.signInWithGoogle();
      await loading.dismiss();
      this.router.navigate(["/tabs"]);
    } catch (error: any) {
      await loading.dismiss();
      console.error("Google login error:", error);

      let errorMessage =
        error.message || "No se pudo iniciar sesión con Google";

      // Mensajes personalizados para errores comunes
      if (
        errorMessage.includes("cancelado") ||
        errorMessage.includes("cancelled")
      ) {
        // No mostrar alerta si el usuario canceló
        console.log("User cancelled Google sign-in");
      } else if (errorMessage.includes("configuración")) {
        await this.showAlert(
          "Error de Configuración",
          "Por favor, configura las credenciales de Google Sign-In. Ejecuta 'node setup-firebase.js' o consulta QUICK_START.md"
        );
      } else {
        await this.showAlert("Error al iniciar sesión", errorMessage);
      }
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
