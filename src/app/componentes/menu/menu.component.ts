/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/dot-notation */
/* eslint-disable @typescript-eslint/member-ordering */
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MenuController } from '@ionic/angular';
import { CambioMenuService } from 'src/app/config/cambio-menu/cambio-menu.service';
import { FuncionesGenerales } from 'src/app/config/funciones/funciones';
import { CargadorService } from 'src/app/servicios/cargador.service';
import { LoginService } from 'src/app/servicios/login.service';
import { NotificacionesService } from 'src/app/servicios/notificaciones.service';
import { StorageService } from 'src/app/servicios/storage.service';
import { ThemeService } from 'src/app/servicios/theme.service';
import { RxFormGroup } from '@rxweb/reactive-form-validators';

@Component({
	selector: 'app-menu',
	templateUrl: './menu.component.html',
	styleUrls: ['./menu.component.scss'],
})
export class MenuComponent implements OnInit {
	// eslint-disable-next-line @typescript-eslint/member-delimiter-style
	formLogin!: { formulario: RxFormGroup, propiedades: Array<string> };
	appMenuSwipeGesture: boolean = false;
	// eslint-disable-next-line @typescript-eslint/member-delimiter-style
	menus: Array<{ icon: string, title: string, path: string, badge?: boolean, hijos?: Array<any>, modulo?: string }> = [
		{
			modulo: 'GASTOSAPP', icon: '', title: 'Gastos', path: '', hijos: [{
				icon: 'cash-outline', title: 'Gastos', path: '/modulos/gastos'
			}]
		},
		{
			modulo: 'AUTOGEST', icon: '', title: 'Auto Gestión', path: '', hijos: [{
				icon: 'person-add-outline', title: 'Datos básicos', path: '/modulos/datosbasicos'
			},
			{
				icon: 'newspaper-outline', title: 'Solicitar Vacaciones', path: '/modulos/solicitarvacaciones'
			},
			{
				icon: 'chatbox-ellipses-outline', title: 'Solicitar Permiso', path: '/modulos/solicitarpermisos'
			},
			{
				icon: 'documents-outline', title: 'Certificados Laborales', path: '/modulos/certificados'
			},
			{
				icon: 'list-outline', title: 'Registro Ausentismos', path: '/modulos/registroausentismo'
			},
			{
				icon: 'list', title: 'Elementos de Protección', path: '/modulos/elementosproteccion'
			}]
		}
	];
	datosUsuario: { perfilid?: string, [key: string]: any } = {};
	public logo = 'assets/images/nofoto.png';
	modulos: Array<object> = [];

	foto: string = FuncionesGenerales.urlGestion();

	constructor(
		private menuController: MenuController,
		private router: Router,
		public theme: ThemeService,
		private notificacionesService: NotificacionesService,
		private storageService: StorageService,
		private loginService: LoginService,
		private cambioMenuService: CambioMenuService,
		private cargadorService: CargadorService,
	) {
		this.menus = this.menus.sort((a, b) => FuncionesGenerales.ordenar(a, 'title', 1, b));
	}

	ngOnInit() {
		this.obtenerUsuario();
		this.configForm();
	}

	configForm() {
		this.formLogin = FuncionesGenerales.crearFormulario(this.loginService);
	}

	async obtenerUsuario() {
		this.datosUsuario = await this.loginService.desencriptar(
			JSON.parse(await this.storageService.get('usuario').then(resp => resp))
		);
		this.modulos = await this.loginService.desencriptar(
			JSON.parse(await this.storageService.get('modulos').then(resp => resp))
		);
	}

	toggleMenu(sesion?: boolean) {
		this.menuController.close('first');
	}

	// eslint-disable-next-line @angular-eslint/use-lifecycle-interface
	ngOnDestroy() {
		this.menuController.enable(false);
	}

	mostrarConfiguracion(ruta: string) {
		this.router.navigateByUrl(ruta);
		this.toggleMenu();
	}

	get size() {
		return { fontSize: this.theme.getStyle() };
	}

	irPagina(ruta: string) {
		this.cambioMenuService.cambio(ruta);
		this.router.navigateByUrl(ruta);
	}

	confirmarCerrarSesion() {
		this.notificacionesService.alerta('¿Esta seguro de Cerrar Sesión?').then(respuesta => {
			if (respuesta.role === 'aceptar') {
				this.cargadorService.presentar().then(resp => {
					this.loginService.cerrarSesionUser().then(respc => {
						if (respc.valido === 1) {
							this.storageService.limpiarTodo(true);
						} else {
							this.notificacionesService.notificacion(respc.mensaje);
						}
						this.cargadorService.ocultar();
					}).catch(error => {
						this.notificacionesService.notificacion('ha ocurrido un error');
						this.cargadorService.ocultar();
					});
				});
			}
		}, console.error);
	}

	confirmarCambioClave(extra = 0) {
		this.notificacionesService.alerta('¿Esta seguro de cambiar la clave?').then(respuesta => {
			if (respuesta.role === 'aceptar') {
				console.log('respuesta.role', respuesta.role);
				this.router.navigateByUrl(`forget-password/${this.formLogin.formulario.get('num_docu')?.value || '0'}/${extra}`);
			}
		}, console.error);
	}

	async SincronizarPermisos() {
		const perfilid = this.datosUsuario['perfilid'];
		const permisos = FuncionesGenerales.permisos();
		const data = { perfilid, permisos };

		try {
			// Llamada al servicio
			const resp = await this.loginService.informacion(data, `Login/sincronizarPermisos`);

			// Modificar o utilizar los datos desencriptados
			this.datosUsuario['SEGUR'] = resp;

			// Encriptar antes de guardar en storage
			const datosEncriptados = this.loginService.encriptar(this.datosUsuario);
			this.storageService.set('usuario', datosEncriptados);
			location.reload();
		} catch (error) {
			console.error('Error durante la sincronización de permisos:', error);
		}
	}

	irMiPerfil() {
		//this.router.navigateByUrl('modulos/mi-perfil');
	}

}
