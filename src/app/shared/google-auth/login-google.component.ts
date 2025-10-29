import { Component } from '@angular/core';
import { GoogleAuthService, GoogleUser } from './google-auth.service';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-login',
  imports: [IonicModule],
  standalone: true,
  template: `
    <ion-content class="ion-padding">
      <ion-button expand="full" (click)="loginWithGoogle()">Sign in with Google</ion-button>

      <div *ngIf="user">
        <ion-avatar><img [src]="user!.imageUrl"></ion-avatar>
        <p>{{ user!.name }}</p>
        <p>{{ user!.email }}</p>
        <ion-button color="danger" (click)="logout()">Logout</ion-button>
      </div>
    </ion-content>
  `,
})
export class LoginComponent {
  user: GoogleUser | null = null;

  constructor(private googleAuth: GoogleAuthService) {
    this.user = this.googleAuth.getCurrentUser();
  }

  async loginWithGoogle() {
    this.user = await this.googleAuth.signIn();
  }

  async logout() {
    await this.googleAuth.signOut();
    this.user = null;
  }
}
