import { Injectable } from '@angular/core';
import { AlertController, ToastController } from '@ionic/angular';
import { AlertInput, AlertButton } from '@ionic/core';

@Injectable({
  providedIn: 'root'
})
export class NotificacionesService {

  constructor(
    private toastController: ToastController,
    private alertaController: AlertController
  ) { }

  async notificacion(message: string, duration: number = 3000, position?: 'top' | 'bottom' | 'middle', color?: string, mode?: 'ios' | 'md') {
    const toast = await this.toastController.create({
      message, position, animated: true, color, duration, mode,
    });
    return toast.present();
  }

  async alerta(message: string, header?: string, cssClass?: string[], buttons?: AlertButton[], inputs?: AlertInput[], backdropDismiss?: boolean, mode?: 'ios' | 'md') {
    if (!buttons) {
      buttons = [{
        text: 'Aceptar', role: 'aceptar'
      }, {
        text: 'Cancelar', role: 'cancelar'
      }];
    }
    const alerta = await this.alertaController.create({
      header, message, animated: true, mode, buttons, backdropDismiss, inputs, cssClass
    });
    await alerta.present();
    return alerta.onWillDismiss();
  }

  async presentToast(message: any, position: any = 'top') {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      position: position,
      color: 'dark'
    });
    toast.present();
  }

  async presentToastConfirm(message: any, position: any = 'top') {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      position: position,
      color: 'success'
    });
    toast.present();
  }
}
