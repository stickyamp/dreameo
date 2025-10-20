import { Component, Injectable } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { IonButton, ToastController } from '@ionic/angular/standalone';

export enum ToastLevelEnum {
  INFO,
  WARNING,
  ERROR
}

@Injectable({
  providedIn: 'root'
})
export class ToastNotifierService {
  constructor(private toastController: ToastController, private alertController: AlertController) { }

  public async presentToast(message: string, toastLevel: ToastLevelEnum, position: 'top' | 'middle' | 'bottom') {
    const toast = await this.toastController.create({
      message: message ?? 'undefined',
      duration: 1500,
      position: position,
    });

    await toast.present();
  }

  public async presentAlert(header: string, body: string): Promise<boolean> {
    const alert = await this.alertController.create({
      header: header,
      message: body,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Confirm',
          role: 'confirm'
        }
      ]
    });

    await alert.present();

    const { role } = await alert.onDidDismiss();

    return role === 'confirm';
  }
}