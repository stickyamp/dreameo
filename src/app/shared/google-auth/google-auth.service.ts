import { Injectable } from '@angular/core';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';

export interface GoogleUser {
  email: string;
  name: string;
  imageUrl: string;
  idToken: string;
}

@Injectable({ providedIn: 'root' })
export class GoogleAuthService {
  private user: GoogleUser | null = null;

  constructor() {
    // Initialize plugin on web (optional)
    GoogleAuth.initialize();
  }

  async signIn(): Promise<GoogleUser | null> {
    try {
      const result = await GoogleAuth.signIn();
      const user: GoogleUser = {
        email: result.email,
        name: result.name,
        imageUrl: result.imageUrl,
        idToken: result.authentication.idToken,
      };
      this.user = user;
      localStorage.setItem('google_user', JSON.stringify(user));
      return user;
    } catch (err) {
      console.error('Google Sign-In failed', err);
      return null;
    }
  }

  async signOut(): Promise<void> {
    await GoogleAuth.signOut();
    this.user = null;
    localStorage.removeItem('google_user');
  }

  refresh(){
    //TODO
  }

  getCurrentUser(): GoogleUser | null {
    if (!this.user) {
      const saved = localStorage.getItem('google_user');
      if (saved) this.user = JSON.parse(saved);
    }
    return this.user;
  }
}
