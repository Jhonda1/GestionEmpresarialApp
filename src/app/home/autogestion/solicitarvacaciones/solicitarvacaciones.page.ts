/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-inferrable-types */
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { NotificacionesService } from 'src/app/servicios/notificaciones.service';
import { CambioMenuService } from 'src/app/config/cambio-menu/cambio-menu.service';
import { takeUntil } from 'rxjs/operators';
import { DatosbasicosService } from 'src/app/servicios/datosbasicos.service';
import { AgregarSolicitudVacacionesComponent } from './agregar-solicitud-vacaciones/agregar-solicitud-vacaciones.component';
import { ModalController } from '@ionic/angular';
import { LoginService } from 'src/app/servicios/login.service';
import { StorageService } from 'src/app/servicios/storage.service';
import { HeaderComponent } from 'src/app/componentes/header/header.component';
import { FiltroListaPipe } from 'src/app/pipes/filtro-lista/filtro-lista.pipe';
import { ValidacionPermisosService } from 'src/app/servicios/validacion-permisos.service';
import { PermisosHelperService } from 'src/app/servicios/permisos-helper.service';
import { ValidarPermiso, PermisosUtils } from 'src/app/utils/permisos.decorators';

interface DatosUsuario {
	[key: string]: any;
	SEGUR: Array<number>;
}

@Component({
	selector: 'app-solicitarvacaciones',
	templateUrl: './solicitarvacaciones.page.html',
	styleUrls: ['./solicitarvacaciones.page.scss'],
	standalone: true,
	imports: [
		CommonModule,
		IonicModule,
		FormsModule,
		HeaderComponent,
		FiltroListaPipe
	]
})
export class SolicitarvacacionesPage implements OnInit, OnDestroy {
	[key: string]: any;

	permisoCrear = false;
	permisoDisfrutados = false;
	permisoPendientes = false;
	searching: boolean = true;
	datosUsuario: DatosUsuario = { SEGUR: [] };
	SEGUR: Array<number> = [];
	qPendientes: Array<object> = [];
	qAprobados: Array<object> = [];
	buscarListaHistorico: string = '';
	buscarDisfrutados: string = '';
	rutaGeneral: string = 'Autogestion/cSolicitarVacaciones/';
	subject = new Subject();
	subjectMenu = new Subject();

	constructor(
		private loginService: LoginService,
		private storage: StorageService,
		private notificacionService: NotificacionesService,
		private datosBasicosService: DatosbasicosService,
		private menu: CambioMenuService,
		private modalController: ModalController,
		private validacionPermisosService: ValidacionPermisosService,
		private permisosHelper: PermisosHelperService
	) { }

	ngOnInit() {
		this.validarPermisosIniciales();
	}

	private validarPermisosIniciales() {
		// Validar múltiples permisos de forma asíncrona
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
		this.obtenerDatosEmpleado();
		this.obtenerUsuario();
		this.menu.suscripcion().pipe(
			takeUntil(this.subjectMenu)
		).subscribe(() => {
			this.subject.next(true);
			this.subjectMenu.next(true);
		}, error => {
			console.log('Error', error);
		}, () => console.log('Completado Menú !!'));
	}

	async obtenerUsuario() {
		this.datosUsuario = await this.loginService.desencriptar(
			JSON.parse(await this.storage.get('usuario').then(resp => resp))
		);
		this.SEGUR = this.datosUsuario.SEGUR || [];
		this.permisoCrear = this.validarPermiso(60010083);
		this.permisoDisfrutados = this.validarPermiso(60010082);
		this.permisoPendientes = this.validarPermiso(60010081);
	}

	validarPermiso(permiso: number) {
		if (this.SEGUR.length > 0 && this.SEGUR.includes(permiso)) {
			return true;
		} else {
			return false;
		}
	}

	async obtenerInformacion(metodo: string, funcion: string, datos: object = {}, event?: any) {
		// Validación imperativa para guardado de datos con sincronización forzada
		if (metodo === 'guardarValores') {
			try {
				// Forzar sincronización de permisos antes de validar operaciones críticas
				const resultadoValidacion = await this.validacionPermisosService.validarPermisoParaAccion(
					60010083, 
					'crear solicitud de vacaciones',
					true // forzar sincronización
				);
				
				if (!resultadoValidacion.valido) {
					this.notificacionService.notificacion(resultadoValidacion.mensaje);
					
					// Activar redirección automática después de mostrar el mensaje
					setTimeout(() => {
						this.validacionPermisosService.manejarFaltaDePermisos(resultadoValidacion.mensaje);
					}, 1500);
					
					if (event) { event.target.complete(); }
					return;
				}
			} catch (error) {
				console.error('Error al validar permisos antes de guardar:', error);
				this.notificacionService.notificacion('Error al validar permisos.');
				
				// En caso de error, también activar redirección
				setTimeout(() => {
					this.validacionPermisosService.manejarFaltaDePermisos('Error al validar permisos');
				}, 1500);
				
				if (event) { event.target.complete(); }
				return;
			}
		}

		this.searching = true;
		this.datosBasicosService.informacion(datos, this.rutaGeneral + metodo).then(resp => {
			if (resp.success) {
				this[funcion](resp);
			} else {
				this.notificacionService.notificacion(resp.mensaje);
			}
			this.searching = false;
			if (event) {event.target.complete();}
		}, console.error).catch(err => {
			console.log('Error ', err);
			this.searching = false;
			if (event) {event.target.complete();}
		}).catch(error => console.log('Error ', error));
	}

	async datosGuardados({ mensaje, qPendientes, qAprobados }: { mensaje: string, qPendientes: Array<object>, qAprobados: Array<object> }) {
		this.notificacionService.notificacion(mensaje);
		this.subject.next(true);
		this.qPendientes = qPendientes;
		this.qAprobados = qAprobados;
	}

	obtenerDatosEmpleado(event?: any) {
		this.datosBasicosService.informacion({}, this.rutaGeneral + 'getData').then(({
			qPendientes,
			qAprobados,
		}) => {
			this.qPendientes = (qPendientes || []);
			this.qAprobados = (qAprobados || []);
			this.searching = false;
			if (event) {event.target.complete();}
		}).catch(error => console.log('Error ', error));
	}

	buscarFiltro(variable: string, evento: any) {
		this[variable] = evento.detail.value;
	}

	refresh(evento: any) {
		this.obtenerDatosEmpleado(evento);
	}

	@ValidarPermiso(60010083, 'crear solicitud de vacaciones')
	async irModal() {
		const datos = { component: AgregarSolicitudVacacionesComponent, componentProps: {} };
		const modal = await this.modalController.create(datos);
		await modal.present();
		await modal.onWillDismiss().then(resp => {
			if (resp.data && typeof resp.data == 'object') {
				this.obtenerInformacion('guardarValores', 'datosGuardados', resp.data);
			}
		});
	}

}
