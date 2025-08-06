
import { Component, OnInit } from '@angular/core';
import { MenuController } from '@ionic/angular';
import { NotificacionesService } from 'src/app/servicios/notificaciones.service';
import { Observable } from 'rxjs';
import { IonInfiniteScroll } from '@ionic/angular';
import { Router } from '@angular/router';
import { StorageService } from 'src/app/servicios/storage.service';
import { GastosService } from 'src/app/servicios/gastos.service';
@Component({
	selector: 'app-gastos',
	templateUrl: './gastos.page.html',
	styleUrls: ['./gastos.page.scss'],
  standalone: false
})
export class GastosPage implements OnInit {

	infiniteScroll!: IonInfiniteScroll;
	isConnected = true;
	verBusqueda = false;
	listaSolicitudes: any = [];
	solicitud: any;
	Solicitudes: any = [];
	cargando: boolean = false;
	contenido: boolean = true;
	listImagesDelete: any = [];
	detallesDeletes: any = [];

	constructor(
		private menu: MenuController,
		private gastosService: GastosService,
		private notificaciones: NotificacionesService,
		private router: Router,
		private storageService: StorageService,
	) { }

	ngOnInit() {
	}

	async ionViewWillEnter() {
		this.menu.close();

		await this.storageService.get('Solicitudes').then(
			(data: any) => {
				if (data != null) {
					this.Solicitudes = data;
				}
			}
		);

		await this.storageService.get('listImagesDelete').then(
			(data: any) => {
				if (data != null) {
					this.listImagesDelete = data;
				}
			}
		);

		await this.storageService.get('detallesDeletes').then(
			(data: any) => {
				if (data != null) {
					this.detallesDeletes = data;
				}
			}
		);

		await this.storageService.get('solicitudSeleccionada').then(
			(data: any) => {
				if (data != null) {
					if (this.Solicitudes != null && this.Solicitudes !== undefined) {
						const arrTemp = [];
						for (let i = 0; i < this.Solicitudes.length; i++) {
							if (this.Solicitudes[i].SolicitudGastoId !== data.SolicitudGastoId) {
								arrTemp.push(this.Solicitudes[i]);
							}
						}
						arrTemp.push(data);
						this.Solicitudes = arrTemp;
						this.storageService.set('Solicitudes', this.Solicitudes);
					}
				}
			}
		);

		const listaElement = document.getElementById('lista');
		if (listaElement) {
			listaElement.innerHTML = '';
		}
		const self = this;
		setTimeout(function() {
			self.actualizarInformacion();
		}, 2000);

		this.storageService.remove('solicitudSeleccionada');
	}

	doRefresh(event: any) {
		const self = this;
		setTimeout(() => {
			event.target.complete();
			self.actualizarInformacion();
		}, 2000);
	}

	volver() {
		this.verBusqueda = false;
		if (this.Solicitudes != null) {
			this.listaSolicitudes = this.Solicitudes;
			const listaElement = document.getElementById('lista');
			if (listaElement) {
				listaElement.innerHTML = '';
			}
			if (this.listaSolicitudes.length > 0) {
				this.length = 0;
				this.appendItems(20);
			}
		}
	}

	mostrarBusqueda() {
		this.verBusqueda = true;
	}

	gestionarSolicitud(data: any) {
		this.storageService.set('solicitudSeleccionada', data);
		this.router.navigateByUrl('/modulos/gestionarsolicitud');
	}

	async actualizarInformacion() {
		if (this.isConnected) {
			await this.guardarMovimientos().then(() => {
				setTimeout(() => {
					this.cargarInformacion();
				}, 500);
			});
		} else {
			await this.storageService.get('Solicitudes').then(
				(data: any) => {
					data = JSON.parse(data);
					if (data != null) {
						this.Solicitudes = data;
						this.listaSolicitudes = data;

						const listaElement = document.getElementById('lista');
						if (listaElement) {
							listaElement.innerHTML = '';
						}
						if (this.listaSolicitudes.length > 0) {
							this.length = 0;
							this.appendItems(20);
						}
					}
				}
			);
			this.loader(false);
		}
	}

	async guardarMovimientos() {
		let nit = 0;
		await this.storageService.get('tokenNIT').then(
			(data: any) => {
				if (data != null) {
					data = JSON.parse(data);
					nit = data;
				}
			}
		);

		{

			await this.storageService.get('Solicitudes').then(
				(data: any) => {
					let datosEncvia = {
						Solicitudes: data,
						listImagesDelete: this.listImagesDelete,
						detallesDeletes: this.detallesDeletes,
						NIT: nit
					};

					this.gastosService.informacion(datosEncvia, 'gastos/cGastos/guardarInformacion').then(async respuesta => {
						this.storageService.remove('solicitudSeleccionada');
						this.storageService.remove('Solicitudes');
						this.storageService.remove('listImagesDelete');
						this.storageService.remove('detallesDeletes');
					}).catch(error => {
						this.notificaciones.presentToast('Ha ocurrido un ploblema');
						console.error(error);
					});
				});
		}
	}


	async cargarInformacion() {
		this.loader(true);
		this.gastosService.informacion({}, 'gastos/cGastos/cargarInformacion').then(async respuesta => {
			console.log(respuesta);
			this.listaSolicitudes = respuesta.Solicitudes;
			this.Solicitudes = this.listaSolicitudes;
			this.storageService.set('Solicitudes', this.listaSolicitudes);
			const listaElement = document.getElementById('lista');
			if (listaElement) {
				listaElement.innerHTML = '';
			}
			if (this.listaSolicitudes.length > 0) {
				this.length = 0;
				this.appendItems(20);
			}
			this.loader(false);
		}).catch(error => {
			console.log('Error ', error);
			this.loader(false);
		});

	}

	async search(key: string, nameKey: string, myArray: any[]) {
		const arr = [];
		for (let i = 0; i < myArray.length; i++) {
			if (myArray[i][key] === nameKey.toUpperCase()) {
				arr.push(myArray[i]);
			}
		}
		return arr;
	}


	length = 0;
	loadData(event: any) {
		const self = this;
		self.infiniteScroll = event;
		setTimeout(() => {
			event.target.complete();
			self.appendItems(20);
		}, 1000);
	}

	appendItems(number: number) {
		const originalLengh = this.length;
		const list = document.getElementById('lista');
		if (!list) {
			return;
		}
		const self = this;
		for (let i = 0; i < number; i++) {
			if (this.listaSolicitudes[i + originalLengh] !== undefined) {
				const el = document.createElement('ion-item');
				el.innerHTML = '<ion-label>' +
					`<h6><b>${self.listaSolicitudes[i + originalLengh].fase}</b> <span class="listFecha" style="float: right;font-size: 12px;">${self.listaSolicitudes[i + originalLengh].fecha}</span></h6>` +
					`<ion-card-subtitle style="overflow: hidden; text-overflow: ellipsis;">${self.listaSolicitudes[i + originalLengh].descripcion}</ion-card-subtitle>` +
					'</ion-label>';
				this.apend(list, el, i, originalLengh);
				this.length++;
			}
			if (this.length <= this.listaSolicitudes.length && this.length === this.listaSolicitudes.length) {
				if (self.infiniteScroll !== undefined) {
					self.infiniteScroll.disabled = true;
				}
				break;
			}
		}
	}

	async apend(list: HTMLElement, el: HTMLElement, i: number, originalLengh: number) {
		list.appendChild(el);
		const self = this;
		(el as any).disabled = self.listaSolicitudes[i + originalLengh].disabled;
		el.onclick = function(event) {
			self.gestionarSolicitud(self.listaSolicitudes[i + originalLengh]);
		};
		return;
	}

	loader(estado: boolean) {
		this.cargando = estado === true ? false : true;
		this.contenido = estado === true ? true : false;
	}

}
