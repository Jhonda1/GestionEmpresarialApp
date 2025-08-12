import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { MenuController } from '@ionic/angular';
import { CambioMenuService } from 'src/app/config/cambio-menu/cambio-menu.service';
import { FuncionesGenerales } from 'src/app/config/funciones/funciones';
import { CargadorService } from 'src/app/servicios/cargador.service';
import { LoginService } from 'src/app/servicios/login.service';
import { NotificacionesService } from 'src/app/servicios/notificaciones.service';
import { StorageService } from 'src/app/servicios/storage.service';
import { ThemeService } from 'src/app/servicios/theme.service';
import { SecureImageService } from 'src/app/servicios/secure-image.service';
import { PhotoSyncService } from 'src/app/servicios/photo-sync.service';
import { RxFormGroup } from '@rxweb/reactive-form-validators';
import { ChangeDetectorRef } from '@angular/core';
import { Subject, interval } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators';

@Component({
	selector: 'app-menu',
	templateUrl: './menu.component.html',
	styleUrls: ['./menu.component.scss'],
	standalone: false,
})
export class MenuComponent implements OnInit, OnDestroy {
	formLogin!: { formulario: RxFormGroup, propiedades: Array<string> };
	appMenuSwipeGesture: boolean = false;
	private destroy$ = new Subject<void>();

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

	datosUsuario: { perfilid?: string, foto?: string, [key: string]: any } = {};
	public logo = 'assets/images/nofoto.png';
	public urlFotoUsuario: string = 'assets/images/nofoto.png';

	// Definimos `modulos` como un objeto indexado
	modulos: { [key: string]: boolean } = {};

	foto: string = FuncionesGenerales.urlGestion();

	constructor(
		private menuController: MenuController,
		private router: Router,
		public  theme: ThemeService,
		private notificacionesService: NotificacionesService,
		private storageService: StorageService,
		private loginService: LoginService,
		private cambioMenuService: CambioMenuService,
		private cargadorService: CargadorService,
		private cdr: ChangeDetectorRef,
		private secureImageService: SecureImageService,
		private photoSyncService: PhotoSyncService
	) {
		this.menus = this.menus.sort((a, b) => FuncionesGenerales.ordenar(a, 'title', 1, b));
	}

	ngOnInit() {
		this.obtenerUsuario();
		this.configForm();
		this.inicializarFotoUsuario();
		this.configurarListenerFoto();
	}

	/**
	 * Inicializa la foto del usuario desde diferentes fuentes
	 */
	private inicializarFotoUsuario() {
		// 1. Primero intentar desde storage de sesión
		this.storageService.get('urlFotoUsuarioSesion').then(urlSesion => {
			if (urlSesion && urlSesion !== 'assets/images/nofoto.png') {
				this.urlFotoUsuario = urlSesion;
				this.cdr.detectChanges();
			} else {
				// 2. Si no hay en sesión, usar la del usuario
				this.actualizarFotoDesdeUsuario();
			}
		}).catch(error => {
			console.error('Menu - Error obteniendo foto de sesión:', error);
			this.actualizarFotoDesdeUsuario();
		});
	}

	/**
	 * Actualiza la foto desde los datos del usuario
	 */
	private actualizarFotoDesdeUsuario() {
		if (this.datosUsuario?.foto) {
			
			// Si es base64, usar directamente
			if (this.datosUsuario.foto.startsWith('data:image')) {
				this.urlFotoUsuario = this.datosUsuario.foto;
				this.cdr.detectChanges();
			} else {
				// Es una ruta del servidor, usar servicio seguro
				let rutaFoto = this.datosUsuario.foto;
				if (rutaFoto.startsWith('./')) {
					rutaFoto = rutaFoto.substring(2);
				}
				
				const urlCompleta = this.foto + rutaFoto;
				
				this.secureImageService.getSecureImageUrl(urlCompleta).subscribe(
					(urlSegura) => {
						this.urlFotoUsuario = urlSegura;
						this.cdr.detectChanges();
					},
					(error) => {
						console.error('Menu - Error obteniendo imagen segura:', error);
						this.urlFotoUsuario = 'assets/images/nofoto.png';
						this.cdr.detectChanges();
					}
				);
			}
		} else {
			this.urlFotoUsuario = 'assets/images/nofoto.png';
			this.cdr.detectChanges();
		}
	}

	/**
	 * Configura un listener para detectar cambios en la foto
	 */
	private configurarListenerFoto() {
		// Escuchar notificaciones del PhotoSyncService
		this.photoSyncService.photoUpdated$.pipe(
			takeUntil(this.destroy$),
			filter(url => url !== '' && url !== this.urlFotoUsuario)
		).subscribe(newPhotoUrl => {
			this.urlFotoUsuario = newPhotoUrl;
			this.cdr.detectChanges();
		});

		// Verificar cambios en el storage cada 3 segundos (backup)
		interval(3000).pipe(
			takeUntil(this.destroy$)
		).subscribe(() => {
			this.verificarCambiosFoto();
		});

		// También escuchar cambios del servicio de menú
		this.cambioMenuService.suscripcion().pipe(
			takeUntil(this.destroy$)
		).subscribe(() => {
			setTimeout(() => {
				this.verificarCambiosFoto();
			}, 500);
		});
	}

	/**
	 * Verifica si hay cambios en la foto y actualiza si es necesario
	 */
	private async verificarCambiosFoto() {
		try {
			// Verificar si hay una nueva foto en el storage de sesión
			const urlSesion = await this.storageService.get('urlFotoUsuarioSesion');
			
			if (urlSesion && urlSesion !== this.urlFotoUsuario) {
				this.urlFotoUsuario = urlSesion;
				this.cdr.detectChanges();
				return;
			}

			// También verificar cambios en los datos del usuario
			const userStorage = await this.storageService.get('usuario');
			if (userStorage) {
				const userParsed = JSON.parse(userStorage);
				const userDecrypted = await this.loginService.desencriptar(userParsed);
				
				if (userDecrypted?.foto && userDecrypted.foto !== this.datosUsuario?.foto) {
					this.datosUsuario.foto = userDecrypted.foto;
					this.actualizarFotoDesdeUsuario();
				}
			}
		} catch (error) {
			console.error('Menu - Error verificando cambios de foto:', error);
		}
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
		this.destroy$.next();
		this.destroy$.complete();
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
		console.log('Datos para sincronizar permisos:', this.datosUsuario);

		try {
			const resp = await this.loginService.informacion(data, `Login/sincronizarPermisos`);
			// console.log('Respuesta de sincronización de permisos:',this.datosUsuario, resp);
			return;
			this.datosUsuario['SEGUR'] = resp;
			console.log('Datos de usuario después de sincronizar permisos:', this.datosUsuario);
			const datosEncriptados = this.loginService.encriptar(this.datosUsuario);
			this.storageService.set('usuario', datosEncriptados);
			// location.reload();
		} catch (error) {
			console.error('Error durante la sincronización de permisos:', error);
		}
	}

	irMiPerfil() {
		//this.router.navigateByUrl('modulos/mi-perfil');
	}

	/**
	 * Maneja errores de carga de imagen en el menú
	 */
	onImageError(event: any): void {
		console.warn('Menu - Error cargando imagen, usando imagen por defecto');
		event.target.src = 'assets/images/nofoto.png';
		
		// Intentar recargar la foto desde el storage
		setTimeout(() => {
			this.inicializarFotoUsuario();
		}, 1000);
	}

	/**
	 * Método público para forzar actualización de foto (puede ser llamado desde otros componentes)
	 */
	public actualizarFoto() {
		this.inicializarFotoUsuario();
	}
}
