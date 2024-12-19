import { Injectable } from '@angular/core';
import { LoadingController } from '@ionic/angular';

@Injectable({
	providedIn: 'root'
})
export class CargadorService {

	cargador: HTMLIonLoadingElement | undefined;

	constructor(private loadingController: LoadingController) { }

	async presentar(message: string = 'Cargando...', duration?: number) {
		this.cargador = await this.loadingController.create({ message, duration, spinner: 'lines-small' });
		await this.cargador.present();
	}

	async ocultar() {
		return this.cargador?.dismiss();
	}
}
