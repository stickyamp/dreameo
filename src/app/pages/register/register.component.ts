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
import { AuthService } from "../../shared/services/auth.service";
import { TranslateModule, TranslateService } from "@ngx-translate/core";

@Component({
  selector: "app-register",
  templateUrl: "./register.component.html",
  styleUrls: ["./register.component.scss"],
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
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  showPassword = false;
  showConfirmPassword = false;
  isLoading = false;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private loadingController: LoadingController,
    private alertController: AlertController,
    private translate: TranslateService
  ) {
    this.registerForm = this.formBuilder.group(
      {
        username: ["", [Validators.required, Validators.minLength(3)]],
        email: ["", [Validators.required, Validators.email]],
        password: ["", [Validators.required, Validators.minLength(6)]],
        confirmPassword: ["", [Validators.required]],
      },
      { validators: this.passwordMatchValidator }
    );

    const lang = localStorage.getItem("lang") || "en";
    this.translate.use(lang);
  }

  ngOnInit() {
    // Check if user is already authenticated
    this.authService.isAuthenticated$.subscribe((isAuth) => {
      if (isAuth) {
        this.router.navigate(["/tabs"]);
      }
    });
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get("password");
    const confirmPassword = form.get("confirmPassword");

    if (
      password &&
      confirmPassword &&
      password.value !== confirmPassword.value
    ) {
      confirmPassword.setErrors({ passwordMismatch: true });
    } else {
      if (confirmPassword?.errors?.["passwordMismatch"]) {
        delete confirmPassword.errors["passwordMismatch"];
        if (Object.keys(confirmPassword.errors).length === 0) {
          confirmPassword.setErrors(null);
        }
      }
    }

    return null;
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  async onRegister() {
    if (this.registerForm.valid) {
      this.isLoading = true;

      const credentials = {
        username: this.registerForm.value.username,
        email: this.registerForm.value.email,
        password: this.registerForm.value.password,
        confirmPassword: this.registerForm.value.confirmPassword,
      };

      try {
        const result = await this.authService.register(credentials);

        if (result.success) {
          await this.showAlert("Success", "Account created successfully!");
          this.router.navigate(["/tabs"]);
        } else {
          await this.showAlert(
            "Registration Failed",
            result.message || "Registration failed"
          );
        }
      } catch (error: any) {
        await this.showAlert(
          "Registration Failed",
          error.message || "Registration failed"
        );
      } finally {
        this.isLoading = false;
      }
    }
  }

  goBack() {
    this.router.navigate(["/login"]);
  }

  goToLogin() {
    this.router.navigate(["/login"]);
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
