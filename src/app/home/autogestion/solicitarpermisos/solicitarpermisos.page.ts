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
	datosInicialmenteLoaded = false; // Nueva propiedad para controlar la carga inicial
	rutaGeneral = 'Autogestion/cSolicitudPermiso/';
	qPendientes: Array<object> = [];
	tiposAusentismosArray: Array<object> = [];
	enfermedadesArray: Array<object> = [];
	subject = new Subject();
	subjectMenu = new Subject();
	segur: Array<any> = [];
	datosUsuario: any = {};

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
		// Inicializar las variables de permisos como false hasta que se carguen los datos
		this.permisoPendientes = false;
		this.permisoDisfrutados = false;
		this.permisoCrear = false;
	}

	private async validarPermisosIniciales() {
		try {
			// 1. Primero cargar los datos del usuario desde el storage
			await this.obtenerUsuario();

			// 2. Asegurar que el servicio de validación esté inicializado
			await this.validacionPermisosService.inicializar();
			
			// 3. Validar permisos usando tanto el cache del servicio como la validación local
			const permisos = [60010081, 60010082, 60010083];
			
			// Luego validar localmente como respaldo
			const resultadosLocales = permisos.map(permiso => this.validarPermiso(permiso));

			// Usar la validación local como principal (más confiable en este contexto)
			this.permisoPendientes = resultadosLocales[0];
			this.permisoDisfrutados = resultadosLocales[1]; 
			this.permisoCrear = resultadosLocales[2];

		} catch (error) {
			console.error('❌ Error validando permisos iniciales:', error);
			// En caso de error, mantener los permisos como false por seguridad
			this.permisoPendientes = false;
			this.permisoDisfrutados = false;
			this.permisoCrear = false;
		}
	}

	ngOnDestroy() {
		this.subject.next(true);
		this.subject.complete();
		this.subjectMenu.next(true);
		this.subjectMenu.complete();
	}

	ionViewDidEnter() {
		this.searching = true;
		
		// Cargar datos iniciales y validar permisos en secuencia
		this.cargarDatosIniciales();
		
		// Configurar suscripciones del menú
		this.menu.suscripcion().pipe(
			takeUntil(this.subjectMenu)
		).subscribe(() => {
			this.subject.next(true);
			this.subjectMenu.next(true);
		}, error => {
			console.log('Error ', error);
		}, () => console.log(''));
	}

	private async cargarDatosIniciales() {
		try {						
			// 1. Primero cargar los datos del usuario y validar permisos
			await this.validarPermisosIniciales();
			
			// 2. Marcar que los datos iniciales están cargados
			this.datosInicialmenteLoaded = true;
			
			// 3. Luego cargar los datos de la página
			this.obtenerInformacion('getData', 'obtenerDatosEmpleado');
			this.obtenerInformacion('tiposAusentismo', 'tiposDeAusentismo');
			
		} catch (error) {
			console.error('❌ Error cargando datos iniciales:', error);
			this.searching = false;
			this.datosInicialmenteLoaded = true; // Marcar como cargado para mostrar mensaje de error
		}
	}

	async obtenerUsuario() {
		try {
			const usuarioEncriptado = await this.storage.get('usuario');
			if (!usuarioEncriptado) {
				throw new Error('No se encontraron datos de usuario en storage');
			}

			// Usar el método de desencriptación del servicio de datos básicos
			this.datosUsuario = await this.datosBasicosService.obtenerDatosStorage('usuario');
			
			if (!this.datosUsuario) {
				console.error('Los datos de usuario no tienen las propiedades necesarias:', JSON.parse(usuarioEncriptado));
				throw new Error('Error al desencriptar datos de usuario');
			}
			
			this.segur = this.datosUsuario['SEGUR'] || [];
		} catch (error) {
			console.error('❌ Error obteniendo usuario:', error);
			this.segur = [];
			this.datosUsuario = {};
			
			// Mostrar notificación de error específica
			this.notificacionService.notificacion('Error al cargar datos de usuario. Por favor, cierre sesión e ingrese nuevamente.');
		}
	}

	validarPermiso = (permiso: number) => this.segur.length > 0 && this.segur.includes(permiso);

	buscarFiltro(variable: keyof SolicitarpermisosPage, evento: any) {
		(this[variable] as any) = evento.detail.value;
	}

	refresh(evento: any) {
		this.obtenerInformacion('getData', 'obtenerDatosEmpleado', {}, evento);
	}

	async obtenerDatosEmpleado({ qPendientes, datos }: { qPendientes: any, datos?: any }) {
		// NOTA: 'datos' es un array [{estado, fecha_retiro, ...}]
		// Validar el primer elemento del array si existe
		if (datos && Array.isArray(datos) && datos.length > 0) {
			await this.datosBasicosService.validarEmpleadoRetirado(datos[0], false);
		}
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
			}
			this.searching = false;
			if (event) {
				event.target.complete();
			}
		}, console.error).catch(err => {
			// ✅ Usar helper centralizado para manejar errores
			this.datosBasicosService.manejarErrorEmpleadoRetirado(err, event);
			this.searching = false;
		});
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
