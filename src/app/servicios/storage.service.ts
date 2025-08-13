import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';
import { NotificacionesService } from './notificaciones.service';

@Injectable({
	providedIn: 'root'
})
export class StorageService {

	constructor(
		private storage: Storage
		, private router: Router
		, private modalController: ModalController
		, private notifcaciones: NotificacionesService
	) { }

	set(llave: string, valor: any) {
		this.storage.set(llave, valor);
	}

	async get(llave: any) {
		return await this.storage.get(llave);
	}

	remove(llave: string) {
		this.storage.remove(llave);
	}

	async limpiarTodo(logout?: boolean) {
		try {
			const tema = await this.get('theme');
			const nit = await this.get('nit');
			// const version = await this.get('version');
			await this.storage.clear();
			if (!logout) this.notifcaciones.alerta("Error de conexión", '', [], [{ text: 'Cerrar', role: 'aceptar' }]);
			if (this.modalController) this.modalController.dismiss();
			if (tema) await this.set('theme', tema);
			if (nit) await this.set('nit', nit);
			// if (version) this.set('version', version);
			this.router.navigateByUrl('login');
		} catch (error) {
			console.error('Error al limpiar storage:', error);
			// En caso de error, al menos navegar al login
			this.router.navigateByUrl('login');
		}
	}

  public clear() {
		return this.storage.clear();
	}
}
