import { Injectable } from "@angular/core";
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  GoogleAuthProvider,
  signInWithCredential,
} from "@angular/fire/auth";
import { BehaviorSubject, Observable } from "rxjs";
import { Router } from "@angular/router";
import { Preferences } from "@capacitor/preferences";
import { GoogleAuth } from "@codetrix-studio/capacitor-google-auth";

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  createdAt: string;
}

@Injectable({
  providedIn: "root",
})
export class FirebaseAuthService {
  private currentUserSubject = new BehaviorSubject<UserProfile | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(private auth: Auth, private router: Router) {
    this.initializeAuth();
    this.initializeGoogleAuth();
  }

  private async initializeGoogleAuth() {
    try {
      // Inicializar Google Auth
      await GoogleAuth.initialize({
        clientId: "YOUR_WEB_CLIENT_ID.apps.googleusercontent.com",
        scopes: ["profile", "email"],
        grantOfflineAccess: true,
      });
      console.log("Google Auth initialized successfully");
    } catch (error) {
      console.error("Error initializing Google Auth:", error);
      // No lanzar error para no bloquear la app si Google Auth falla
    }
  }

  private async initializeAuth() {
    try {
      onAuthStateChanged(this.auth, async (user: User | null) => {
        if (user) {
          const userProfile: UserProfile = {
            uid: user.uid,
            email: user.email || "",
            displayName: user.displayName || undefined,
            createdAt: user.metadata.creationTime || new Date().toISOString(),
          };

          this.currentUserSubject.next(userProfile);
          this.isAuthenticatedSubject.next(true);

          // Guardar sesión localmente
          await Preferences.set({
            key: "firebase_user_session",
            value: JSON.stringify(userProfile),
          });

          console.log("Firebase user authenticated:", userProfile);
        } else {
          this.currentUserSubject.next(null);
          this.isAuthenticatedSubject.next(false);

          // Limpiar sesión local
          await Preferences.remove({ key: "firebase_user_session" });

          console.log("Firebase user signed out");
        }
      });
    } catch (error) {
      console.error("Error initializing Firebase auth:", error);
    }
  }

  async register(
    email: string,
    password: string,
    displayName?: string
  ): Promise<UserProfile> {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        this.auth,
        email,
        password
      );
      const user = userCredential.user;

      const userProfile: UserProfile = {
        uid: user.uid,
        email: user.email || "",
        displayName: displayName || user.displayName || undefined,
        createdAt: user.metadata.creationTime || new Date().toISOString(),
      };

      console.log("User registered successfully:", userProfile);
      return userProfile;
    } catch (error: any) {
      console.error("Registration error:", error);
      throw this.handleAuthError(error);
    }
  }

  async login(email: string, password: string): Promise<UserProfile> {
    try {
      const userCredential = await signInWithEmailAndPassword(
        this.auth,
        email,
        password
      );
      const user = userCredential.user;

      const userProfile: UserProfile = {
        uid: user.uid,
        email: user.email || "",
        displayName: user.displayName || undefined,
        createdAt: user.metadata.creationTime || new Date().toISOString(),
      };

      console.log("User logged in successfully:", userProfile);
      return userProfile;
    } catch (error: any) {
      console.error("Login error:", error);
      throw this.handleAuthError(error);
    }
  }

  async signInWithGoogle(): Promise<UserProfile> {
    try {
      console.log("Starting Google Sign-In...");

      // Verificar si Google Auth está inicializado
      try {
        await GoogleAuth.initialize({
          clientId: "YOUR_WEB_CLIENT_ID.apps.googleusercontent.com",
          scopes: ["profile", "email"],
          grantOfflineAccess: true,
        });
      } catch (initError) {
        console.log(
          "Google Auth already initialized or initialization attempted"
        );
      }

      // Iniciar el flujo de autenticación con Google
      const googleUser = await GoogleAuth.signIn();

      if (!googleUser) {
        throw new Error(
          "No se pudo obtener la información del usuario de Google"
        );
      }

      console.log("Google user obtained:", googleUser.email);

      // Verificar que tenemos el token de autenticación
      if (!googleUser.authentication || !googleUser.authentication.idToken) {
        throw new Error(
          "No se pudo obtener el token de autenticación de Google"
        );
      }

      // Crear credencial de Firebase con el token de Google
      const credential = GoogleAuthProvider.credential(
        googleUser.authentication.idToken
      );

      // Autenticar con Firebase usando la credencial de Google
      const userCredential = await signInWithCredential(this.auth, credential);
      const user = userCredential.user;

      const userProfile: UserProfile = {
        uid: user.uid,
        email: user.email || googleUser.email || "",
        displayName:
          user.displayName ||
          googleUser.name ||
          googleUser.givenName ||
          undefined,
        createdAt: user.metadata.creationTime || new Date().toISOString(),
      };

      console.log("Google sign-in successful:", userProfile.email);
      return userProfile;
    } catch (error: any) {
      console.error("Google sign-in error:", error);

      // Manejar errores específicos de Google Sign-In
      if (
        error.error === "popup_closed_by_user" ||
        error === "popup_closed_by_user" ||
        error.message?.includes("cancelled") ||
        error.message?.includes("canceled")
      ) {
        throw new Error("Inicio de sesión con Google cancelado");
      }

      // Error de configuración
      if (
        error.message?.includes("Client ID") ||
        error.message?.includes("clientId")
      ) {
        throw new Error(
          "Error de configuración de Google Sign-In. Por favor, configura las credenciales."
        );
      }

      // Error de red
      if (
        error.message?.includes("network") ||
        error.message?.includes("Network")
      ) {
        throw new Error(
          "Error de conexión. Verifica tu internet e intenta nuevamente."
        );
      }

      throw this.handleAuthError(error);
    }
  }

  async logout(): Promise<void> {
    try {
      await signOut(this.auth);
      this.router.navigate(["/login"]);
      console.log("User logged out successfully");
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  }

  getCurrentUser(): UserProfile | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  private handleAuthError(error: any): Error {
    let message = "An error occurred";

    switch (error.code) {
      case "auth/email-already-in-use":
        message = "This email is already registered";
        break;
      case "auth/weak-password":
        message = "Password should be at least 6 characters";
        break;
      case "auth/invalid-email":
        message = "Invalid email address";
        break;
      case "auth/user-not-found":
        message = "No user found with this email";
        break;
      case "auth/wrong-password":
        message = "Incorrect password";
        break;
      case "auth/too-many-requests":
        message = "Too many failed attempts. Please try again later";
        break;
      default:
        message = error.message || "Authentication failed";
    }

    return new Error(message);
  }
}
