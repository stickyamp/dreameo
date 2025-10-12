import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Router } from '@angular/router';
import { Preferences } from '@capacitor/preferences';

export interface User {
  id: string;
  username: string;
  email: string;
  createdAt: Date;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(private router: Router) {
    this.initializeAuth();
  }

  private async initializeAuth() {
    try {
      const { value } = await Preferences.get({ key: 'user_session' });
      if (value) {
        const user = JSON.parse(value);
        this.currentUserSubject.next(user);
        this.isAuthenticatedSubject.next(true);
        console.log('User session restored:', user);
      } else {
        this.isAuthenticatedSubject.next(false);
        console.log('No user session found');
      }
    } catch (error) {
      console.error('Error checking auth state:', error);
      this.isAuthenticatedSubject.next(false);
    }
  }

  async login(credentials: LoginCredentials): Promise<{ success: boolean; message?: string }> {
    try {
      // Simulate API call - in real app, this would be an HTTP request
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock validation - in real app, validate against backend
      if (credentials.email === 'demo@dream.com' && credentials.password === 'password') {
        const user: User = {
          id: '1',
          username: 'Demo User',
          email: credentials.email,
          createdAt: new Date()
        };

        await this.setUserSession(user);
        return { success: true };
      } else {
        return { success: false, message: 'Invalid email or password' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Login failed. Please try again.' };
    }
  }

  async register(credentials: RegisterCredentials): Promise<{ success: boolean; message?: string }> {
    try {
      // Validate passwords match
      if (credentials.password !== credentials.confirmPassword) {
        return { success: false, message: 'Passwords do not match' };
      }

      // Validate password strength
      if (credentials.password.length < 6) {
        return { success: false, message: 'Password must be at least 6 characters long' };
      }

      // Simulate API call - in real app, this would be an HTTP request
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock registration - in real app, create user on backend
      const user: User = {
        id: Date.now().toString(),
        username: credentials.username,
        email: credentials.email,
        createdAt: new Date()
      };

      await this.setUserSession(user);
      return { success: true };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, message: 'Registration failed. Please try again.' };
    }
  }

  private async setUserSession(user: User) {
    try {
      await Preferences.set({
        key: 'user_session',
        value: JSON.stringify(user)
      });

      this.currentUserSubject.next(user);
      this.isAuthenticatedSubject.next(true);
    } catch (error) {
      console.error('Error setting user session:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      await Preferences.remove({ key: 'user_session' });
      this.currentUserSubject.next(null);
      this.isAuthenticatedSubject.next(false);
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

}
