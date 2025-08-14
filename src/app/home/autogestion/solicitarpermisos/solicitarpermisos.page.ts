/* eslint-disable @typescript-eslint/dot-notation */
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CambioMenuService } from 'src/app/config/cambio-menu/cambio-menu.service';
import { DatosbasicosService } from 'src/app/servicios/datosbasicos.service';
import { StorageService } from 'src/app/servicios/storage.service';
import { NotificacionesService } from '../../../servicios/notificaciones.service';
import { AgregarSolicitarPermisosComponent } from './agregar-solicitar-permisos/agregar-solicitar-permisos.component';
import { HeaderComponent } from 'src/app/componentes/header/header.component';
import { FiltroListaPipe } from 'src/app/pipes/filtro-lista/filtro-lista.pipe';
import { ValidacionPermisosService } from 'src/app/servicios/validacion-permisos.service';
import { PermisosHelperService } from 'src/app/servicios/permisos-helper.service';
import { ValidarPermiso, PermisosUtils } from 'src/app/utils/permisos.decorators';

@Component({
	selector: 'app-solicitarpermisos',
	templateUrl: './solicitarpermisos.page.html',
	styleUrls: ['./solicitarpermisos.page.scss'],
	standalone: true,
	imports: [
		CommonModule,
		IonicModule,
		FormsModule,
		HeaderComponent,
		FiltroListaPipe,
		AgregarSolicitarPermisosComponent // Usado en modal dinámico con ModalController
	]
})
export class SolicitarpermisosPage implements OnInit, OnDestroy {

	searching= false;
	permisoPendientes= false;
	permisoDisfrutados = false;
	buscarPendientes = '';
	permisoCrear = false;
	rutaGeneral = 'Autogestion/cSolicitudPermiso/';
	qPendientes: Array<object> = [];
	tiposAusentismosArray: Array<object> = [];
	enfermedadesArray: Array<object> = [];
	subject = new Subject();
	subjectMenu = new Subject();
	segur: Array<any> = [];
	datosUsuario: { SEGUR?: number[] } = {};

	constructor(
		private datosBasicosService: DatosbasicosService,
		private modalController: ModalController,
		private notificacionService: NotificacionesService,
		private menu: CambioMenuService,
		private storage: StorageService,
		private validacionPermisosService: ValidacionPermisosService,
		private permisosHelper: PermisosHelperService
	) { }

	ngOnInit() {
		this.validarPermisosIniciales();
	}

	private validarPermisosIniciales() {
		// Validar múltiples permisos para solicitudes de permisos/ausentismo
		const permisos = [60010081, 60010082, 60010083];
		const promesasValidacion = permisos.map(permiso => 
			this.validacionPermisosService.validarPermisoLocal(permiso)
		);

		Promise.all(promesasValidacion).then(resultados => {
			this.permisoPendientes = resultados[0];
			this.permisoDisfrutados = resultados[1]; 
			this.permisoCrear = resultados[2];
		}).catch(error => {
			console.error('Error validando permisos:', error);
		});
	}

	ngOnDestroy() {
		this.subject.next(true);
		this.subject.complete();
		this.subjectMenu.next(true);
		this.subjectMenu.complete();
	}

	ionViewDidEnter() {
		this.searching = true;
		this.obtenerInformacion('getData', 'obtenerDatosEmpleado');
		this.obtenerUsuario();
		this.menu.suscripcion().pipe(
			takeUntil(this.subjectMenu)
		).subscribe(() => {
			this.subject.next(true);
			this.subjectMenu.next(true);
		}, error => {
			console.log('Error ', error);
		}, () => console.log('Completado Menú !!'));
		this.obtenerInformacion('tiposAusentismo', 'tiposDeAusentismo');
	}

	async obtenerUsuario() {
		this.datosUsuario = await this.datosBasicosService.desencriptar(
			JSON.parse(await this.storage.get('usuario').then(resp => resp))
		);
		this.segur = this.datosUsuario['SEGUR'] || [];
		this.permisoCrear = this.validarPermiso(60010083);
		this.permisoDisfrutados = this.validarPermiso(60010082);
		this.permisoPendientes = this.validarPermiso(60010081);
	}

	validarPermiso = (permiso: number) => this.segur.length > 0 && this.segur.includes(permiso);

	buscarFiltro(variable: keyof SolicitarpermisosPage, evento: any) {
		(this[variable] as any) = evento.detail.value;
	}

	refresh(evento: any) {
		this.obtenerInformacion('getData', 'obtenerDatosEmpleado', {}, evento);
	}

	obtenerDatosEmpleado({ qPendientes }: { qPendientes: any }) {
		this.qPendientes = qPendientes;
	}

	@ValidarPermiso(60010083, 'crear solicitud de permiso')
	async irModal() {
		const datos = {
			component: AgregarSolicitarPermisosComponent,
			componentProps: {
				ausentimos: this.tiposAusentismosArray, 
				enfermedades: this.enfermedadesArray
			}
		};
		const modalInstance = await this.modalController.create(datos);
		await modalInstance.present();
		await modalInstance.onWillDismiss().then(resp => {
			if (resp.data && typeof resp.data === 'object') {
				this.obtenerInformacion('crearSolicitud', 'datosGuardados', resp.data);
			}
		});
	}

	obtenerInformacion(metodo: string, funcion: keyof SolicitarpermisosPage, datos: object = {}, event?: any) {
		// Validación imperativa para creación de solicitudes
		if (metodo === 'crearSolicitud' && !PermisosUtils.validarPermisoImperativo(this.validacionPermisosService, this.notificacionService, 60010083)) {
			if (event) { event.target.complete(); }
			return;
		}

		this.searching = true;
		this.datosBasicosService.informacion(datos, this.rutaGeneral + metodo).then(resp => {
			if (resp.success) {
				(this[funcion] as Function)(resp);
			} else {
				this.notificacionService.notificacion(resp.mensaje);
			}
			this.searching = false;
			if (event) {
				event.target.complete();
			};
		}, console.error).catch(err => {
			console.log('Error ',err);
			this.searching = false;
			if (event) {
				event.target.complete();
			};
		}).catch(error => console.log('Error ', error));
	}

	async datosGuardados({ mensaje, qPendientes }: { mensaje: string, qPendientes: any[] }) {
		this.notificacionService.notificacion(mensaje);
		this.subject.next(true);
		this.qPendientes = qPendientes;
		this.obtenerInformacion('getData', 'obtenerDatosEmpleado');
	}

	tiposDeAusentismo(resp: any) {
		this.tiposAusentismosArray = resp.datos;
	}

	enfermedadesfunction(resp: any) {
		this.enfermedadesArray = resp.datos;
	}

}
