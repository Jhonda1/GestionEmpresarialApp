import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule, MenuController } from '@ionic/angular';
import { Router } from '@angular/router';
import { CambioMenuService } from 'src/app/config/cambio-menu/cambio-menu.service';
import { FuncionesGenerales } from 'src/app/config/funciones/funciones';
import { CargadorService } from 'src/app/servicios/cargador.service';
import { LoginService } from 'src/app/servicios/login.service';
import { NotificacionesService } from 'src/app/servicios/notificaciones.service';
import { StorageService } from 'src/app/servicios/storage.service';
import { ThemeService } from 'src/app/servicios/theme.service';
import { SecureImageService } from 'src/app/servicios/secure-image.service';
import { PhotoSyncService } from 'src/app/servicios/photo-sync.service';
import { RxReactiveFormsModule, RxFormGroup } from '@rxweb/reactive-form-validators';
import { ChangeDetectorRef } from '@angular/core';
import { Subject, interval } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Component({
	selector: 'app-menu',
	templateUrl: './menu.component.html',
	styleUrls: ['./menu.component.scss'],
	standalone: true,
	imports: [
		CommonModule,
		FormsModule,
		ReactiveFormsModule,
		IonicModule,
		RxReactiveFormsModule
	]
})
export class MenuComponent implements OnInit, OnDestroy {
	formLogin!: { formulario: RxFormGroup, propiedades: Array<string> };
	appMenuSwipeGesture: boolean = false;
	private destroy$ = new Subject<void>();

	menus: Array<{ icon: string, title: string, path: string, badge?: boolean, hijos?: Array<any>, modulo?: string, permisoId?: number }> = [
		// {
		// 	modulo: 'GASTOSAPP', 
		// 	icon: '', 
		// 	title: 'Gastos', 
		// 	path: '', 
		// 	permisoId: 500100, // Permiso principal del menú
		// 	hijos: [{
		// 		icon: 'cash-outline', 
		// 		title: 'Gastos', 
		// 		path: '/modulos/gastos',
		// 	}]
		// },
		{
			modulo: 'AUTOGEST', 
			icon: '', 
			title: 'Auto Gestión', 
			path: '', 
			permisoId: 600100, // Permiso principal del menú
			hijos: [{
				icon: 'person-add-outline', 
				title: 'Datos básicos', 
				path: '/modulos/datosbasicos',
				permisoId: 6001006 // Permiso para datos personales
			},
			{
				icon: 'newspaper-outline', 
				title: 'Solicitar Vacaciones', 
				path: '/modulos/solicitarvacaciones',
				permisoId: 6001008 // Permiso para solicitar vacaciones
			},
			{
				icon: 'chatbox-ellipses-outline', 
				title: 'Solicitar Permiso', 
				path: '/modulos/solicitarpermisos',
				permisoId: 6001008 // Permiso para solicitar vacaciones
			},
			{
				icon: 'documents-outline', 
				title: 'Certificados Laborales', 
				path: '/modulos/certificados',
				permisoId: 6001007 // Permiso para certificados laborales
			},
			{
				icon: 'list-outline', 
				title: 'Registro Ausentismos', 
				path: '/modulos/registroausentismo',
				permisoId: 6001009 // Permiso para ausentismo
			},
			{
				icon: 'list', 
				title: 'Elementos de Protección', 
				path: '/modulos/elementosproteccion',
			}]
		}
	];

	datosUsuario: { perfilid?: string, foto?: string, SEGUR?: Array<number>, [key: string]: any } = {};
	public logo = 'assets/images/nofoto.png';
	public urlFotoUsuario: string = 'assets/images/nofoto.png';

	// Definimos `modulos` como un objeto indexado
	modulos: { [key: string]: boolean } = {};
	
	// Array para manejar los permisos de seguridad
	SEGUR: Array<number> = [];

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
		// 1. Primero intentar desde storage de sesión (prioridad alta)
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
				// Sincronizar con storage de sesión
				this.storageService.set('urlFotoUsuarioSesion', this.datosUsuario.foto);
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
						// Sincronizar con storage de sesión
						this.storageService.set('urlFotoUsuarioSesion', urlSegura);
						this.cdr.detectChanges();
					},
					(error) => {
						console.error('Menu - Error obteniendo imagen segura:', error);
						this.urlFotoUsuario = 'assets/images/nofoto.png';
						this.storageService.set('urlFotoUsuarioSesion', 'assets/images/nofoto.png');
						this.cdr.detectChanges();
					}
				);
			}
		} else {
			this.urlFotoUsuario = 'assets/images/nofoto.png';
			this.storageService.set('urlFotoUsuarioSesion', 'assets/images/nofoto.png');
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

		// Verificar cambios en el storage cada 1.5 segundos (más responsivo)
		interval(1500).pipe(
			takeUntil(this.destroy$)
		).subscribe(() => {
			this.verificarCambiosFoto();
		});

		// También escuchar cambios del servicio de menú
		this.cambioMenuService.suscripcion().pipe(
			takeUntil(this.destroy$)
		).subscribe(() => {
			// Re-obtener usuario completo cuando se notifique un cambio (e.g., nuevo login)
			this.obtenerUsuario().then(() => {
				// Después de recargar datos del usuario, actualizar foto y permisos
				this.actualizarFotoDesdeUsuario();
				this.cdr.detectChanges(); // Forzar detección de cambios para actualizar permisos
				
				// Verificar si el usuario sigue teniendo permisos para la ruta actual
				this.verificarPermisosRutaActual();
				
				setTimeout(() => {
					this.verificarCambiosFoto();
				}, 300); // Reducir tiempo de espera
			});
		});
	}

	/**
	 * Verifica si hay cambios en la foto y actualiza si es necesario
	 */
	private async verificarCambiosFoto() {
		try {
			// PRIORIDAD 1: Verificar si hay una nueva foto en el storage de sesión
			const urlSesion = await this.storageService.get('urlFotoUsuarioSesion');
			
			if (urlSesion && urlSesion !== this.urlFotoUsuario && urlSesion !== 'assets/images/nofoto.png') {
				this.urlFotoUsuario = urlSesion;
				this.cdr.detectChanges();
				return;
			}

			// PRIORIDAD 2: También verificar cambios en los datos del usuario
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

		// Cargar permisos de seguridad
		this.SEGUR = this.datosUsuario.SEGUR || [];

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

	/**
	 * Getter para verificar si el usuario tiene permisos básicos de menú
	 */
	get tienePermisosMenu(): boolean {
		return this.SEGUR && this.SEGUR.length > 0;
	}

	/**
	 * Valida si el usuario puede acceder a una ruta específica
	 * Útil para validaciones desde otros componentes
	 * @param ruta - Ruta a validar
	 * @returns boolean - true si puede acceder, false en caso contrario
	 */
	puedeAccederARuta(ruta: string): boolean {
		// Rutas siempre permitidas
		const rutasPermitidas = ['/home', '/login', '/', '/settings'];
		
		if (rutasPermitidas.some(rutaPermitida => ruta.startsWith(rutaPermitida))) {
			return true;
		}
		
		// Verificar rutas específicas de módulos
		for (const menu of this.menus) {
			if (menu.hijos) {
				const hijo = menu.hijos.find(h => h.path === ruta);
				if (hijo) {
					// Verificar tanto el módulo como el permiso específico
					const tieneModulo = !menu.modulo || this.modulos[menu.modulo];
					const tienePermisoModulo = this.validarPermiso(menu.permisoId);
					const tienePermisoHijo = this.validarPermiso(hijo.permisoId);
					
					return tieneModulo && tienePermisoModulo && tienePermisoHijo;
				}
			}
		}
		
		// Si no encuentra la ruta en el menú, denegar acceso por seguridad
		return false;
	}

	/**
	 * Obtiene el número total de opciones de menú disponibles para el usuario
	 * @returns number - Cantidad de opciones disponibles
	 */
	get opcionesDisponibles(): number {
		let total = 0;
		this.menus.forEach(menu => {
			if (this.validarModulo(menu)) {
				total += this.filtrarHijosPorPermisos(menu.hijos || []).length;
			}
		});
		return total;
	}

	/**
	 * Verifica si el usuario puede acceder a la ruta actual
	 * @param ruta - Ruta actual a verificar
	 * @returns boolean - true si puede acceder, false en caso contrario
	 */
	verificarAccesoRutaActual(ruta: string): boolean {
		// Si está en home o login, siempre permitir
		if (ruta === '/home' || ruta === '/login' || ruta === '/' || ruta.includes('forget-password')) {
			return true;
		}

		// Verificar si la ruta está en el menú y si tiene permisos
		return this.puedeAccederARuta(ruta);
	}

	/**
	 * Redirige al usuario al inicio cuando pierde permisos
	 */
	redirigirAInicio() {
		// Cerrar el menú si está abierto
		this.menuController.close('first');
		
		// Redirigir al home
		setTimeout(() => {
			this.router.navigateByUrl('/home');
		}, 1000);
	}

	/**
	 * Método público estático para verificar permisos desde otros componentes
	 * @param permisoId - ID del permiso a verificar
	 * @param segurArray - Array de permisos del usuario
	 * @returns boolean - true si tiene permiso, false en caso contrario
	 */
	static validarPermisoEstatico(permisoId: number, segurArray: number[]): boolean {
		if (!permisoId || !segurArray || segurArray.length === 0) {
			return false;
		}
		return segurArray.includes(permisoId);
	}

	/**
	 * Método estático para obtener información completa de validación de permisos
	 * Útil para implementar en otros módulos
	 * @param permisoId - ID del permiso a verificar
	 * @param segurArray - Array de permisos del usuario
	 * @param nombreModulo - Nombre del módulo
	 * @returns Objeto con toda la información de validación
	 */
	static obtenerValidacionCompleta(permisoId: number, segurArray: number[], nombreModulo: string) {
		return FuncionesGenerales.verificarPermisoConMensaje(permisoId, segurArray, nombreModulo);
	}

	/**
	 * Verifica periódicamente si el usuario sigue teniendo permisos para la ruta actual
	 * Se ejecuta cada vez que se detecta un cambio en el menú
	 */
	private verificarPermisosRutaActual() {
		const rutaActual = this.router.url;
		if (!this.verificarAccesoRutaActual(rutaActual)) {
			this.notificacionesService.notificacion('Sus permisos han cambiado. Será redirigido al inicio.');
			this.redirigirAInicio();
		}
	}

	/**
	 * Verifica si el usuario tiene al menos una opción disponible en el menú
	 * @returns boolean - true si tiene opciones, false si no tiene ninguna
	 */
	tieneOpcionesDisponibles(): boolean {
		return this.opcionesDisponibles > 0;
	}

	/**
	 * Maneja el caso cuando el usuario no tiene opciones disponibles
	 */
	manejarSinOpciones() {
		this.router.navigateByUrl('/modulos/datosbasicos');
		this.toggleMenu();
	}

	irPagina(ruta: string) {
		this.cambioMenuService.cambio(ruta);
		this.router.navigateByUrl(ruta);
	}

	/**
	 * Valida si el usuario tiene permiso para acceder a una funcionalidad específica
	 * @param permisoId - ID del permiso a validar
	 * @returns boolean - true si tiene permiso, false en caso contrario
	 */
	validarPermiso(permisoId?: number): boolean {
		// Si no se especifica permiso, permitir acceso
		if (!permisoId) {
			return true;
		}
		
		// Si no hay permisos cargados, denegar acceso
		if (!this.SEGUR || this.SEGUR.length === 0) {
			return false;
		}
		
		// Verificar si el permiso específico está en la lista
		return this.SEGUR.includes(permisoId);
	}

	/**
	 * Valida si el módulo completo debe mostrarse basado en permisos
	 * @param menuItem - Elemento del menú a validar
	 * @returns boolean - true si debe mostrarse, false en caso contrario
	 */
	validarModulo(menuItem: any): boolean {
		// Validar primero si el módulo está habilitado
		if (menuItem.modulo && !this.modulos[menuItem.modulo]) {
			return false;
		}

		// Validar permiso principal del módulo
		if (!this.validarPermiso(menuItem.permisoId)) {
			return false;
		}

		// Si tiene hijos, verificar si al menos uno tiene permisos
		if (menuItem.hijos && Array.isArray(menuItem.hijos)) {
			return menuItem.hijos.some((hijo: any) => this.validarPermiso(hijo.permisoId));
		}

		return true;
	}

	/**
	 * Filtra los hijos de un menú basado en permisos
	 * @param hijos - Array de elementos hijos del menú
	 * @returns Array filtrado con solo los elementos con permisos
	 */
	filtrarHijosPorPermisos(hijos: any[]): any[] {
		if (!hijos || !Array.isArray(hijos)) {
			return [];
		}
		
		return hijos.filter(hijo => this.validarPermiso(hijo.permisoId));
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
			this.cargadorService.presentar('Sincronizando permisos...');
			
			const resp = await this.loginService.informacion(data, `Login/sincronizarPermisos`);
			if (resp && Array.isArray(resp.permisos) && resp.permisos.length > 0) {
				this.datosUsuario['SEGUR'] = resp.permisos;
				this.SEGUR = resp.permisos; // Actualizar también la variable local
			} else {
				this.datosUsuario['SEGUR'] = [];
				this.SEGUR = [];
			}
			
			// Guardar los datos actualizados
			const datosEncriptados = this.loginService.encriptar(this.datosUsuario);
			await this.storageService.set('usuario', datosEncriptados);
			
			// Detectar cambios para actualizar la vista
			this.cdr.detectChanges();
			
			this.cargadorService.ocultar();
			
			// Verificar si el usuario tiene al menos una opción disponible
			if (!this.tieneOpcionesDisponibles()) {
				this.manejarSinOpciones();
				return;
			}
			
			this.notificacionesService.notificacion('Permisos sincronizados correctamente');
			
			// Recargar la página para que se actualicen los permisos en el módulo actual
			setTimeout(() => {
				location.reload();
			}, 1000);
			
		} catch (error) {
			console.error('Error durante la sincronización de permisos:', error);
			this.cargadorService.ocultar();
			this.notificacionesService.notificacion('Error al sincronizar permisos');
		}
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
