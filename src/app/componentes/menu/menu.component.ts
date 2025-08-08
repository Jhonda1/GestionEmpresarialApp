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
	standalone: false,
})
export class MenuComponent implements OnInit {
	formLogin!: { formulario: RxFormGroup, propiedades: Array<string> };
	appMenuSwipeGesture: boolean = false;

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

	// Definimos `modulos` como un objeto indexado
	modulos: { [key: string]: boolean } = {};

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

		const modulosRaw = await this.loginService.desencriptar(
			JSON.parse(await this.storageService.get('modulos').then(resp => resp))
		);
	
		// Verificamos si modulosRaw es un objeto
		if (modulosRaw && typeof modulosRaw === 'object') {
			// Usamos Object.keys() para obtener las claves de modulosRaw
			this.modulos = Object.keys(modulosRaw).reduce((acc: { [key: string]: boolean }, modulo: string) => {
				acc[modulo] = true; // O puedes hacer algo más con el valor si lo necesitas
				return acc;
			}, {});
		} else {
			console.error('modulosRaw no es un objeto:', modulosRaw);
			// Aquí puedes manejar el caso si `modulosRaw` no es un objeto de la manera que prefieras
		}
	}

	toggleMenu(sesion?: boolean) {
		this.menuController.close('first');
	}

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
				this.router.navigateByUrl(`forget-password/${this.formLogin.formulario.get('num_docu')?.value || '0'}/${extra}`);
			}
		}, console.error);
	}

	async SincronizarPermisos() {
		const perfilid = this.datosUsuario['perfilid'];
		const permisos = FuncionesGenerales.permisos();
		const data = { perfilid, permisos };

		try {
			const resp = await this.loginService.informacion(data, `Login/sincronizarPermisos`);
			this.datosUsuario['SEGUR'] = resp;
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
