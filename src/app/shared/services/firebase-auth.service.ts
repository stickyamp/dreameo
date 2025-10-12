import { Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, User } from '@angular/fire/auth';
import { BehaviorSubject, Observable } from 'rxjs';
import { Router } from '@angular/router';
import { Preferences } from '@capacitor/preferences';

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class FirebaseAuthService {
  private currentUserSubject = new BehaviorSubject<UserProfile | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(
    private auth: Auth,
    private router: Router
  ) {
    this.initializeAuth();
  }

  private async initializeAuth() {
    try {
      onAuthStateChanged(this.auth, async (user: User | null) => {
        if (user) {
          const userProfile: UserProfile = {
            uid: user.uid,
            email: user.email || '',
            displayName: user.displayName || undefined,
            createdAt: user.metadata.creationTime || new Date().toISOString()
          };
          
          this.currentUserSubject.next(userProfile);
          this.isAuthenticatedSubject.next(true);
          
          // Guardar sesión localmente
          await Preferences.set({
            key: 'firebase_user_session',
            value: JSON.stringify(userProfile)
          });
          
          console.log('Firebase user authenticated:', userProfile);
        } else {
          this.currentUserSubject.next(null);
          this.isAuthenticatedSubject.next(false);
          
          // Limpiar sesión local
          await Preferences.remove({ key: 'firebase_user_session' });
          
          console.log('Firebase user signed out');
        }
      });
    } catch (error) {
      console.error('Error initializing Firebase auth:', error);
    }
  }

  async register(email: string, password: string, displayName?: string): Promise<UserProfile> {
    try {
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      const user = userCredential.user;
      
      const userProfile: UserProfile = {
        uid: user.uid,
        email: user.email || '',
        displayName: displayName || user.displayName || undefined,
        createdAt: user.metadata.creationTime || new Date().toISOString()
      };

      console.log('User registered successfully:', userProfile);
      return userProfile;
    } catch (error: any) {
      console.error('Registration error:', error);
      throw this.handleAuthError(error);
    }
  }

  async login(email: string, password: string): Promise<UserProfile> {
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      const user = userCredential.user;
      
      const userProfile: UserProfile = {
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || undefined,
        createdAt: user.metadata.creationTime || new Date().toISOString()
      };

      console.log('User logged in successfully:', userProfile);
      return userProfile;
    } catch (error: any) {
      console.error('Login error:', error);
      throw this.handleAuthError(error);
    }
  }

  async logout(): Promise<void> {
    try {
      await signOut(this.auth);
      this.router.navigate(['/login']);
      console.log('User logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
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
    let message = 'An error occurred';
    
    switch (error.code) {
      case 'auth/email-already-in-use':
        message = 'This email is already registered';
        break;
      case 'auth/weak-password':
        message = 'Password should be at least 6 characters';
        break;
      case 'auth/invalid-email':
        message = 'Invalid email address';
        break;
      case 'auth/user-not-found':
        message = 'No user found with this email';
        break;
      case 'auth/wrong-password':
        message = 'Incorrect password';
        break;
      case 'auth/too-many-requests':
        message = 'Too many failed attempts. Please try again later';
        break;
      default:
        message = error.message || 'Authentication failed';
    }
    
    return new Error(message);
  }
}
