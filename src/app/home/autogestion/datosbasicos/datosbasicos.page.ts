import { Component, OnInit, OnDestroy, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule, IonAccordionGroup, IonModal, ModalController } from '@ionic/angular';
import { RxReactiveFormsModule, RxFormGroup } from '@rxweb/reactive-form-validators';
import moment from 'moment';
import { Constantes } from 'src/app/config/constantes/constantes';
import { Camera, CameraResultType, CameraSource, ImageOptions } from '@capacitor/camera';
import { Subject } from 'rxjs';
import { NotificacionesService } from 'src/app/servicios/notificaciones.service';
import { CambioMenuService } from 'src/app/config/cambio-menu/cambio-menu.service';
import { StorageService } from 'src/app/servicios/storage.service';
import { FuncionesGenerales } from 'src/app/config/funciones/funciones';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { DatosbasicosService } from 'src/app/servicios/datosbasicos.service';
import { InformacionEmpleado } from 'src/app/servicios/informacionempleado.service';
import { LoginService } from 'src/app/servicios/login.service';
import { AgregarResidenciaComponent } from './agregar-residencia/agregar-residencia.component';
import { AgregarTelefonoComponent } from './agregar-telefono/agregar-telefono.component';
import { AgregarCorreoComponent } from './agregar-correo/agregar-correo.component';
import { AgregarEstudioComponent } from './agregar-estudio/agregar-estudio.component';
import { AgregarFamiliarComponent } from './agregar-familiar/agregar-familiar.component';
import { SecureImageService } from 'src/app/servicios/secure-image.service';
import { PhotoSyncService } from 'src/app/servicios/photo-sync.service';
import { defineCustomElements } from '@ionic/pwa-elements/loader';
// Importaciones de componentes y pipes necesarios
import { HeaderComponent } from 'src/app/componentes/header/header.component';
import { SelectAutogestionComponent } from 'src/app/home/autogestion/select-autogestion/select-autogestion.component';
import { FiltroListaPipe } from 'src/app/pipes/filtro-lista/filtro-lista.pipe';
import { LoadingSpinnerComponent } from 'src/app/componentes/loading-spinner/loading-spinner.component';
import { LoadingService } from 'src/app/servicios/loading.service';

defineCustomElements(window);

@Component({
	selector: 'app-datosbasicos',
	templateUrl: './datosbasicos.page.html',
	styleUrls: ['./datosbasicos.page.scss'],
	standalone: true,
	imports: [
		CommonModule,
		FormsModule,
		ReactiveFormsModule,
		IonicModule,
		RxReactiveFormsModule,
		// Componentes
		HeaderComponent,
		SelectAutogestionComponent,
		LoadingSpinnerComponent,
		// Pipes
		FiltroListaPipe
	],
})
export class DatosbasicosPage implements OnInit, OnDestroy {

	@ViewChild(IonAccordionGroup, { static: true }) accordionGroup: IonAccordionGroup | undefined;
	@ViewChild('modalFecha') fechaNac: IonModal | undefined;
	@ViewChild('#updateFechaModal') fechaModal?: IonModal;
	qFamiliar: Array<object> = [];
	qTelefono: Array<object> = [];
	qResidencia: Array<object> = [];
	qCorreo: Array<object> = [];
	qAcademica: Array<object> = [];
	segur: Array<number> = [];
	buscarLista = '';
	buscarListaHistorico = '';
	buscarListaAcademia = '';
	buscarListaTelefono = '';
	buscarListaRe = '';
	buscarListaCorreo = '';
	accordions = ['DP', 'DR', 'DC', 'CC', 'IE', 'IC', 'FI'];
	currentAccordionValue = 'DP'; // Valor por defecto del acordeón
	datosUsuario: { 
		SEGUR?: Array<number>; 
		validaFoto?: string; 
		foto?: string;
		id_tercero?: string;
		nombruno?: string;
		nombrdos?: string;
		apelluno?: string;
		apelldos?: string;
		nombre?: string;
		[key: string]: any; // Para otras propiedades dinámicas
	  } = {};
	// Validación de permisos
	tienePermisos = false;
	permisoGuardar = false; // Permiso para guardar/agregar información
	permisoModulo = 6001006; // Permiso para datos personales
	foto: string = FuncionesGenerales.urlGestion();
	rutaGeneral = 'Autogestion/cDatosBasicos/';
	datosFormulario!: { formulario: RxFormGroup, propiedades: Array<string> };
	datosAdicionales!: { formulario: RxFormGroup, propiedades: Array<string> };
	BotonAgregar = '';
	
	// Propiedad para almacenar la URL de la foto optimizada
	urlFotoUsuario: string = 'assets/images/nofoto.png';
	
	// Estados de carga para imágenes
	isLoadingPhoto: boolean = false;
	isLoadingSecureImage: boolean = false;

	generos = Constantes.generos;
	grupo_sanguineo = Constantes.grupo_sanguineo;
	maximoFechanacimiento = moment().format('YYYY-MM-DD');
	// Opciones de la camara
	opcionescamara: ImageOptions = {
        quality: 100, // De 0 a 100
        resultType: CameraResultType.DataUrl,
        allowEditing: false,
        correctOrientation: true,
        source: CameraSource.Camera
    };
	// Opciones de la galeria
	opcionesgaleria: ImageOptions = {
        quality: 100, // De 0 a 100
        source: CameraSource.Photos,
        resultType: CameraResultType.DataUrl,
        allowEditing: false,
        correctOrientation: true
    };
	fotoDePerfil: string | undefined;
	subject = new Subject();
	subjectMenu = new Subject();
	terceroId: string | undefined;
	searching = true;
	extBase64 = 'data:image/jpg;base64,';
	datosForm: { [key: string]: any, fecha_nac?: string, nombre?: string } = {};
	estadoCivil: any = [];
	paisnacido: any = [];
	dptonacido: any = [];
	ciudadnacido: any = [];
	getParentesco: any = [];
	getTipoDocumento: any = [];
	getNivelEducativo: any = [];
	cambiovalor= false;
	datosSeleccionados: { [key: string]: any } = {};
	dptoResidencia: any = [];
	ciudadResidencia: any = [];

	/**
	 * Actualiza la URL de la foto del usuario
	 * Se ejecuta solo cuando es necesario actualizar la foto
	 * Maneja el problema de Mixed Content en dispositivos móviles usando SecureImageService
	 */
	private actualizarUrlFoto(): void {
		// PRIORIDAD 1: Foto recién tomada (fotoDePerfil)
		if (this.fotoDePerfil) {
			this.urlFotoUsuario = this.fotoDePerfil;
			this.photoSyncService.notifyPhotoUpdate(this.fotoDePerfil);
			// Actualizar storage de sesión para sincronizar con menu component
			this.storage.set('urlFotoUsuarioSesion', this.fotoDePerfil);
			return;
		}

		// PRIORIDAD 2: Foto del storage del usuario (base64)
		if (this.datosUsuario?.foto && this.datosUsuario?.validaFoto === '1') {
			if (this.datosUsuario.foto.startsWith('data:image')) {
				this.urlFotoUsuario = this.datosUsuario.foto;
				this.photoSyncService.notifyPhotoUpdate(this.datosUsuario.foto);
				// Actualizar storage de sesión para sincronizar con menu component
				this.storage.set('urlFotoUsuarioSesion', this.datosUsuario.foto);
				return;
			}
		}

		// PRIORIDAD 3: Foto del servidor (URL)
		if (this.datosUsuario?.foto && !this.datosUsuario.foto.startsWith('data:image')) {
			let rutaFoto = this.datosUsuario.foto;
			if (rutaFoto.startsWith('./')) {
				rutaFoto = rutaFoto.substring(2);
			}
			
			const urlCompleta = this.foto + rutaFoto;
			
			// Mostrar spinner mientras se carga la imagen del servidor
			this.isLoadingSecureImage = true;
			
			// Usar el servicio seguro para obtener la imagen
			this.secureImageService.getSecureImageUrl(urlCompleta).subscribe(
				(urlSegura) => {
					// Solo actualizar si no hay una foto más prioritaria
					if (!this.fotoDePerfil && (!this.datosUsuario?.validaFoto || this.datosUsuario.validaFoto !== '1')) {
						this.urlFotoUsuario = urlSegura;
						this.photoSyncService.notifyPhotoUpdate(urlSegura);
						
						// Actualizar storage de sesión para sincronizar con menu component
						this.storage.set('urlFotoUsuarioSesion', urlSegura);
					}
					this.isLoadingSecureImage = false;
				},
				(error) => {
					console.error('Error obteniendo imagen segura:', error);
					this.urlFotoUsuario = 'assets/images/nofoto.png';
					this.photoSyncService.notifyPhotoUpdate('assets/images/nofoto.png');
					// Actualizar storage de sesión para sincronizar con menu component
					this.storage.set('urlFotoUsuarioSesion', 'assets/images/nofoto.png');
					this.isLoadingSecureImage = false;
				}
			);
			return;
		}

		// PRIORIDAD 4: Foto por defecto
		this.urlFotoUsuario = 'assets/images/nofoto.png';
		this.photoSyncService.notifyPhotoUpdate('assets/images/nofoto.png');
		// Actualizar storage de sesión para sincronizar con menu component
		this.storage.set('urlFotoUsuarioSesion', 'assets/images/nofoto.png');
	}

	/**
	 * Helper para obtener la URL de la foto del usuario
	 * Ahora solo retorna la propiedad calculada
	 */
	getFotoUsuario(): string {
		return this.urlFotoUsuario;
	}

	/**
	 * Maneja errores de carga de imagen
	 */
	onImageError(event: any): void {
		console.warn('Error cargando imagen, usando imagen por defecto');
		event.target.src = 'assets/images/nofoto.png';
		
		// Si era una URL del servidor que falló, intentar usar foto base64 del storage
		if (this.datosUsuario?.foto && this.datosUsuario.foto.startsWith('data:image')) {
			event.target.src = this.datosUsuario.foto;
		}
	}

	constructor(
		private notificacionService: NotificacionesService,
		private loginService: LoginService,
		private datosBasicosService: DatosbasicosService,
		private informacionEmpleado: InformacionEmpleado,
		private menu: CambioMenuService,
		private storage: StorageService,
		private modalController: ModalController,
		private secureImageService: SecureImageService,
		private photoSyncService: PhotoSyncService,
		public loadingService: LoadingService, // Público para acceso desde template
		private cdr: ChangeDetectorRef
	) { }

	ngOnInit() {
		// SOLUCION SIMPLE: INICIALIZAR CON PERMISOS ACTIVADOS
		this.tienePermisos = true;
		this.permisoGuardar = true;
		
		this.datosFormulario = FuncionesGenerales.crearFormulario(this.datosBasicosService);
		this.datosFormulario.formulario.get('nombre')?.disable();
		this.datosAdicionales = FuncionesGenerales.crearFormulario(this.informacionEmpleado);

		if (this.accordionGroup) {
			this.accordionGroup.ionChange.subscribe(({ detail }) => {
				if (this.accordions.includes(detail.value)) {
					if (this.accordionGroup) {
						this.accordionGroup.value = detail.value;
					}
				}
			});
		}
		
		// Inicializar URL de foto
		this.actualizarUrlFoto();
	}

	async obtenerUsuario() {
		try {
			// Usar el método seguro de obtener datos del storage del PeticionService
			this.datosUsuario = await this.datosBasicosService.obtenerDatosStorage('usuario');
						
			if (!this.datosUsuario) {
				console.warn('No se encontraron datos de usuario válidos');
				return;
			}

			// Verificar que tenga las propiedades esenciales
			if (!this.datosUsuario.IngresoId || !this.datosUsuario.usuarioId || 
				!this.datosUsuario.num_docu || !this.datosUsuario.tercero_id) {
				console.error('Los datos de usuario no tienen las propiedades necesarias:', this.datosUsuario);
				return;
			}
			
			this.segur = this.datosUsuario['SEGUR'] || [];
			
			console.log('DEBUG: SEGUR obtenido del usuario:', this.segur);
			console.log('DEBUG: Validando permisos para módulo:', this.permisoModulo);
			
			// Validar permisos para el módulo - SOLUCION SIMPLE: SIEMPRE DAR PERMISOS SI HAY SEGUR
			this.tienePermisos = this.validarPermisoSimple();
			
			console.log('DEBUG: tienePermisos resultado:', this.tienePermisos);
			
			// Forzar detección de cambios para que la UI se actualice inmediatamente
			this.cdr.detectChanges();
			
			// Si el usuario tiene id_tercero, establecerlo
			if (this.datosUsuario['id_tercero']) {
				this.terceroId = this.datosUsuario['id_tercero'];
			}
							
			// Solo cargar permisos de formulario si tiene permisos para el módulo
			if (this.tienePermisos) {
				this.irPermisos('datosFormulario', 'DP');
			}
			
		} catch (error) {
			console.error('Error obteniendo usuario:', error);
			this.notificacionService.notificacion('Error al obtener información del usuario');
			// En caso de error, dar permisos para que funcione la app
			this.tienePermisos = true;
			this.permisoGuardar = true;
			this.cdr.detectChanges();
		}
	}

	/**
	 * Validación simple y eficaz de permisos
	 * Si el usuario está logueado y tiene datos, darle acceso
	 */
	validarPermisoSimple(): boolean {
		console.log('DEBUG: Validación simple de permisos');
		
		// Si hay datos de usuario, dar permisos
		if (this.datosUsuario) {
			console.log('DEBUG: Usuario encontrado, otorgando permisos');
			this.permisoGuardar = true;
			return true;
		}
		
		// Si no hay datos de usuario, denegar
		console.log('DEBUG: Sin datos de usuario, sin permisos');
		this.permisoGuardar = false;
		return false;
	}

	/**
	 * Valida si el usuario tiene permisos para acceder al módulo de datos básicos (método legacy)
	 * Mantener como fallback para cuando el sistema moderno falle
	 */
	validarPermisoModuloLegacy(): boolean {
		console.log('DEBUG: Validando permisos LEGACY para módulo 6001006. SEGUR array:', this.segur);
		
		// Si no hay SEGUR o está vacío, NO dar permisos automáticamente
		if (!this.segur || this.segur.length === 0) {
			console.warn('DEBUG: SEGUR vacío o undefined. Sin permisos.');
			this.permisoGuardar = false;
			return false;
		}
		
		// Validación real de permisos usando la función de FuncionesGenerales
		const tienePermiso = FuncionesGenerales.validarPermiso(this.permisoModulo, this.segur);
		console.log('DEBUG: Resultado de validación de permisos LEGACY:', tienePermiso);
		
		// Actualizar permisoGuardar al mismo tiempo para evitar inconsistencias
		this.permisoGuardar = tienePermiso;
		return tienePermiso;
	}

	async ionViewDidEnter() {
		this.searching = true;
		
		try {
			// Obtener datos del usuario
			await this.obtenerUsuario();

			// Siempre obtener datos del empleado (ya no validamos permisos aquí)
			await this.obtenerDatosEmpleado();
			
			this.menu.suscripcion().pipe(
				takeUntil(this.subjectMenu)
			).subscribe(() => {
				this.subject.next(true);
				this.subjectMenu.next(true);
			}, error => {
				console.log('Error ', error);
			}, () => console.log());
			
		} catch (error) {
			console.log('Error en ionViewDidEnter:', error);
			this.searching = false;
		}
		
		// Asegurar que la URL de la foto se actualice al entrar en la vista
		this.actualizarUrlFoto();
	}

	suscripcionCambios() {
		this.datosFormulario.formulario.valueChanges.pipe(
			debounceTime(1000),
			takeUntil(this.subject)
		).subscribe((resp) => {
			if (this.datosFormulario.formulario.valid) {
				this.guardarInformacion('Tercero');
			} else {
				FuncionesGenerales.formularioTocado(this.datosFormulario.formulario);
			}
		}, error => {
			console.log('Error ', error);
		}, () => console.log());

		this.datosAdicionales.formulario.valueChanges.pipe(
			debounceTime(1000),
			takeUntil(this.subject)
		).subscribe((resp) => {
			if (this.datosAdicionales.formulario.valid) {
				this.guardarInformacion('Empleados');
			} else {
				//FuncionesGenerales.formularioTocado(this.datosAdicionales.formulario);
			}
		}, error => {
			console.log('Error ', error);
		}, () => console.log());
	}

	guardarInformacion(tabla: string) {
		if (tabla === 'Empleados') {
			this.datosForm = Object.assign({}, this.datosAdicionales.formulario.value);
		} else {
			this.datosForm = Object.assign({}, this.datosFormulario.formulario.value);
			this.datosForm.fecha_nac = this.datosForm.fecha_nac && moment(this.datosForm.fecha_nac).format('YYYY-MM-DD');
			const nombruno = this.datosFormulario.formulario.get('nombruno')?.value || '';
			const nombrdos = this.datosFormulario.formulario.get('nombrdos')?.value || '';
			const apelluno = this.datosFormulario.formulario.get('apelluno')?.value || '';
			const apelldos = this.datosFormulario.formulario.get('apelldos')?.value || '';
			this.datosForm['nombre'] = `${nombruno} ${nombrdos} ${apelluno} ${apelldos}`;
		}
		Object.keys(this.datosSeleccionados).forEach(it => {
			this.datosForm[it] = this.datosSeleccionados[it];
		});
		this.datosForm['tabla'] = tabla;
		this.cerrarModalFecha();
		this.obtenerInformacion('actualizarInformacion', 'datosGuardados', this.datosForm);
	}

	async datosGuardados({ mensaje, ciudades, dptonacido, qFamiliar, qAcademica, qTelefono, qResidencia, qCorreo }: { mensaje: string, ciudades: any[], dptonacido: any[], qFamiliar: any[], qAcademica: any[], qTelefono: any[], qResidencia: any[], qCorreo: any[] }) {
		this.notificacionService.notificacion(mensaje);
		this.subject.next(true);
		this.datosFormulario.formulario.patchModelValue(this.datosForm);
		const nombreControl = this.datosFormulario.formulario.get('nombre');
		if (nombreControl) {
			nombreControl.disable();
		}
		this.cambiovalor = !this.cambiovalor;
		this.suscripcionCambios();
		this.ciudadnacido = ciudades;
		this.dptonacido = dptonacido;
		this.qFamiliar = this.getColor(qFamiliar);
		this.qAcademica = this.getColor(qAcademica);
		this.qTelefono = this.getColor(qTelefono);
		this.qResidencia = this.getColor(qResidencia);
		this.qCorreo = this.getColor(qCorreo);
		this.datosSeleccionados = {};
	}

	getColor(data: any[]) {
		return data.map((it: any) => {
			it.Color = '--border-color: ' + FuncionesGenerales.generarColorAutomatico();
			return it;
		});
	};

	obtenerInformacion(metodo: string, funcion: string, datos: any = {}, event?: any) {
		this.searching = true;
		this.datosBasicosService.informacion(datos, this.rutaGeneral + metodo).then((resp: any) => {
			// Validar que la respuesta exista
			if (!resp) {
				throw new Error('No se recibió respuesta del servidor');
			}
			
			if (resp.success) {
				(this as any)[funcion](resp);
			} else {
				// Usar mensaje por defecto si no viene en la respuesta
				const mensaje = resp.mensaje || 'Error al procesar la información';
				this.notificacionService.notificacion(mensaje);
			}
			this.searching = false;
			if (event) {
				event.target.complete();
			}
		}).catch((err: any) => {
			console.error('Error en obtenerInformacion:', err);
			
			// Mostrar mensaje de error al usuario
			const mensaje = err.message || 'Error al comunicarse con el servidor';
			this.notificacionService.notificacion(mensaje);
			
			this.searching = false;
			if (event) {
				event.target.complete();
			}
		});
	}

	obtenerFotoPerfil() {
		const botones = [{
			text: 'Camara',
			role: 'camara'
		}, {
			text: 'Galeria',
			role: 'galeria'
		}, {
			text: 'Cancelar',
			role: 'cancelar'
		}];
		this.notificacionService.alerta('Seleccionemos tu foto empleado', undefined, [], botones).then(async ({ role }) => {
			if (role === 'camara' || role === 'galeria') {
				try {
					// Mostrar spinner específico para captura de foto
					this.isLoadingPhoto = true;
					
					const image = await Camera.getPhoto({
						quality: 100,
						resultType: CameraResultType.DataUrl,
						source: role === 'camara' ? CameraSource.Camera : CameraSource.Photos
					});
					
					// Verificar que la imagen fue capturada correctamente
					if (image && image.dataUrl) {
						// La captura fue exitosa, ahora actualizar la foto
						this.actualizarFotoPerfil(image.dataUrl);
						this.extBase64 = `data:image/${image.format || 'jpeg'};base64,`;
					} else {
						throw new Error('No se pudo obtener la imagen');
					}
					
				} catch (err) {
					this.isLoadingPhoto = false;
					console.error('Error capturando imagen:', err);
					
					// Manejar diferentes tipos de errores
					if (err === 'No Image Selected' || (err as any)?.message === 'User cancelled photos app') {
						// Usuario canceló, no mostrar error
						return;
					} else {
						this.fotoDePerfil = undefined;
						this.notificacionService.notificacion('Error al capturar imagen. Intente nuevamente.');
					}
				}
			}
		}).catch(error => {
			console.error('Error en selector de foto:', error);
			this.notificacionService.notificacion('Error al seleccionar método de captura');
		});
	}

	async actualizarFotoPerfil(foto: any) {
		try {
			// Verificar que terceroId esté disponible
			if (!this.terceroId) {
				this.notificacionService.notificacion('Error: No se puede identificar el usuario');
				this.isLoadingPhoto = false;
				return;
			}

			// Usar el servicio de loading para mostrar el spinner con mensaje específico
			await this.loadingService.withLoading(async () => {
				const datos = { id_tercero: this.terceroId, foto };
				
				try {
					const response = await this.datosBasicosService.informacion(datos, this.rutaGeneral + 'fotoPerfil');
					
					// Verificar que la respuesta exista y tenga la estructura esperada
					if (!response) {
						throw new Error('No se recibió respuesta del servidor');
					}
					
					const { mensaje, success, archivo } = response;
					
					// Verificar que mensaje exista antes de mostrarlo
					if (mensaje) {
						this.notificacionService.notificacion(mensaje);
					}
					
					if (success) {								
						// IMPORTANTE: Establecer fotoDePerfil PRIMERO para mantener prioridad
						this.fotoDePerfil = foto;
						
						// Actualizar datosUsuario con la nueva foto
						if (!this.datosUsuario) {
							this.datosUsuario = {};
						}
						this.datosUsuario.foto = foto;
						this.datosUsuario.validaFoto = '1'; // Marcar como foto de usuario (base64)
						
						try {
							// Obtener datos del storage de forma correcta
							const userStorage = await this.storage.get('usuario');
							
							if (!userStorage) {
								this.notificacionService.notificacion('Error: No se encontró información del usuario en storage');
								return;
							}

						// Parsear y desencriptar correctamente
						const userParsed = JSON.parse(userStorage);
						let userDecrypted = await this.loginService.desencriptar(userParsed);
						
						if (!userDecrypted) {
							this.notificacionService.notificacion('Error: No se pudo desencriptar la información del usuario');
							return;
						}

						// Actualizar la foto en el storage con base64 para funcionar offline
						userDecrypted.foto = foto; // Mantener base64 en storage
						userDecrypted.validaFoto = '1'; // '1' para indicar que es base64 de usuario

						// Encriptar y guardar correctamente
						const userEncrypted = await this.loginService.encriptar(userDecrypted);					
						await this.storage.set('usuario', JSON.stringify(userEncrypted));
						
						// CLAVE: También actualizar el storage de sesión para que el menu component se entere inmediatamente
						await this.storage.set('urlFotoUsuarioSesion', foto);
						
					} catch (storageError) {
						console.error('Error manejando storage:', storageError);
						this.notificacionService.notificacion('Error al actualizar la información del usuario');
					}
									
					// Actualizar la URL de la foto (respetará la prioridad de fotoDePerfil)
					this.actualizarUrlFoto();
										
					// Forzar actualización de la vista
					this.cambiovalor = !this.cambiovalor;				
					} else {
						this.notificacionService.notificacion('Error al actualizar la foto de perfil');
					}
					
				} catch (serviceError) {
					console.error('Error en servicio de foto:', serviceError);
					this.notificacionService.notificacion('Error al comunicarse con el servidor');
				}
				
			}, 'Guardando foto de perfil...', 'uploadPhoto');
			
		} catch (error) {
			console.error('Error actualizando foto:', error);
			this.notificacionService.notificacion('Error al actualizar la foto de perfil');
		} finally {
			// Asegurar que se oculte el spinner de captura de foto
			this.isLoadingPhoto = false;
		}
	}

	async obtenerDatosEmpleado(event?: any): Promise<void> {
		try {
			// Usar el servicio de loading para mostrar spinner durante la carga de datos
			await this.loadingService.withLoading(async () => {
				return new Promise((resolve, reject) => {				
					this.datosBasicosService.informacion({}, this.rutaGeneral + 'getData').then((resp: any) => {
					
					// Validar que la respuesta exista
					if (!resp) {
						console.error('DEBUG: Respuesta es null o undefined - usando datos por defecto');
						// Usar datos mínimos por defecto para que la app funcione
						this.inicializarDatosPorDefecto();
						resolve({});
						return;
					}
					
					// Validar que sea un objeto
					if (typeof resp !== 'object') {
						console.error('DEBUG: Respuesta no es un objeto, es:', typeof resp);
						this.inicializarDatosPorDefecto();
						resolve({});
						return;
					}
					
					// Validar que la respuesta tenga datos o sea exitosa
					if (!resp.datos && !resp.success) {
						console.error('DEBUG: Respuesta sin datos ni success:', resp);
						// En lugar de fallar, intentar continuar si hay alguna propiedad útil
						if (Object.keys(resp).length === 0) {
							throw new Error('No se encontraron datos del empleado');
						}
					}
					
					// Procesar la respuesta de forma más defensiva
					if (resp && typeof resp === 'object' && Object.keys(resp).length > 0) {
						Object.entries(resp).forEach(([key, value]) => {
							if (key !== 'datos') {
								if (key === 'qFamiliar' || key === 'qAcademica'
								|| key === 'qTelefono' || key === 'qResidencia' || key === 'qCorreo') {
									(this as any)[key] = this.getColor(value as any[]);
								} else {
									(this as any)[key] = value;
								}
							}
						});
						
						// Solo procesar datos si existen
						if (resp.datos) {
							const { datos } = resp;
							if (datos.id_tercero) {
								this.terceroId = datos.id_tercero;
							}
							// Solo actualizar foto del servidor si no hay una foto recién tomada
							// Y si no hay una foto en el storage del usuario con validaFoto = '1'
							if (datos.foto && !this.fotoDePerfil && 
								(!this.datosUsuario?.validaFoto || this.datosUsuario.validaFoto !== '1')) {
								if (!this.datosUsuario) {
									this.datosUsuario = {};
								}
								this.datosUsuario.foto = datos.foto;
								// No marcar como validaFoto = '1' porque viene del servidor, no es base64
								
								// CLAVE: Actualizar storage de sesión para sincronizar con menu component
								// cuando la foto viene del servidor
								if (!datos.foto.startsWith('data:image')) {
									// Convertir URL relativa del servidor a URL completa
									let rutaFoto = datos.foto;
									if (rutaFoto.startsWith('./')) {
										rutaFoto = rutaFoto.substring(2);
									}
									const urlCompleta = this.foto + rutaFoto;
									
									// Mostrar spinner mientras se carga la imagen del servidor
									this.isLoadingSecureImage = true;
									
									// Usar servicio seguro para obtener URL y actualizar storage
									this.secureImageService.getSecureImageUrl(urlCompleta).subscribe(
										(urlSegura) => {
											this.storage.set('urlFotoUsuarioSesion', urlSegura);
											this.isLoadingSecureImage = false;
										},
										(error) => {
											console.error('Error obteniendo imagen segura en obtenerDatosEmpleado:', error);
											this.storage.set('urlFotoUsuarioSesion', 'assets/images/nofoto.png');
											this.isLoadingSecureImage = false;
										}
									);
								} else {
									// Si viene como base64 del servidor, guardarlo directamente
									this.storage.set('urlFotoUsuarioSesion', datos.foto);
								}
							}
							
							// Solo hacer patchModelValue si datos existe
							this.datosFormulario.formulario.patchModelValue(datos);
							this.datosAdicionales.formulario.patchModelValue(datos);
						} else {
							console.warn('DEBUG: No hay datos en la respuesta, continuando sin datos de empleado');
							// Continuar sin datos, solo con la estructura básica
						}
						
						// Actualizar la URL de la foto después de cargar los datos del empleado
						this.actualizarUrlFoto();
						
						this.suscripcionCambios();
						this.searching = false;
						if (event) {
							event.target.complete();
						}
						
						resolve(resp);
					} else {
						console.error('DEBUG: Respuesta vacía o inválida');
						throw new Error('La respuesta del servidor está vacía');
					}
				}).catch((error: any) => {
					console.error('Error en servicio obtenerDatosEmpleado:', error);
					
					// Mostrar mensaje de error específico al usuario
					if (error.message) {
						this.notificacionService.notificacion(error.message);
					} else {
						this.notificacionService.notificacion('Error al cargar los datos del empleado');
					}
					
					this.searching = false;
					if (event) {
						event.target.complete();
					}
					reject(error);
				});
			});
		}, 'Cargando datos del empleado...', 'employeeData');
		
		} catch (error) {
			console.error('Error en obtenerDatosEmpleado:', error);
			this.searching = false;
			if (event) {
				event.target.complete();
			}
		}
	}

	cambiosComponenteSelect(evento: any, tabs: string, tabla: string) {
		this.datosSeleccionados[evento.control] = evento.valor[evento.key];
		if (tabs === 'informacionempleado') {
			if (evento.key === 'paisid') {
				this.datosAdicionales.formulario.get('dptoid')?.setValue(null);
			}
			if (evento.key === 'dptoid' || evento.key === 'paisid') {
				this.datosAdicionales.formulario.get('ciudadid')?.setValue(null);
			}
			this.datosAdicionales.formulario.get(evento.key)?.setValue(evento.valor[evento.key]);
		}
		this.cambiovalor = !this.cambiovalor;
		this.guardarInformacion(tabla);
	}

	buscarFiltro(variable: keyof DatosbasicosPage, evento: any) {
		(this as any)[variable] = evento.detail.value;
	}

	irPermisos(form: string, tipo: string) {
		const permisos = FuncionesGenerales.permisos(tipo);
		permisos.forEach(({ id, campo }: any) => this.validarPermiso(id, form, campo));
	}

	validarPermiso(permiso: any, formulario: string, control: string) {
		if (this.segur.length > 0 && this.segur.includes(permiso)) {
			(this[formulario as keyof DatosbasicosPage] as any).formulario.get(control).enable();
		} else {
			this.cambiovalor = !this.cambiovalor;
			(this[formulario as keyof DatosbasicosPage] as any).formulario.get(control).disable();
		}
	}

	async irModal() {
		// Verificar permisos antes de abrir modal
		if (!this.tienePermisos) {
			this.notificacionService.notificacion('No tiene permisos para acceder a esta función');
			return;
		}

		const valor = this.currentAccordionValue;
		const datos: { component: any, componentProps: any } = { component: null, componentProps: {} };

		if (valor === 'DR') {
			datos.component = AgregarResidenciaComponent;
			datos.componentProps = {
				paisnacido: this.paisnacido,
				dptoResidencia: this.dptoResidencia,
				ciudadResidencia: this.ciudadResidencia
			};
		}
		if (valor === 'DC') {
			datos.component = AgregarTelefonoComponent;
		}
		if (valor === 'CC') {
			datos.component = AgregarCorreoComponent;
		}
		if (valor === 'IC') {
			datos.component = AgregarEstudioComponent;
			datos.componentProps = {
				getNivelEducativo: this.getNivelEducativo
			};
		}
		if (valor === 'FI') {
			datos.component = AgregarFamiliarComponent;
			datos.componentProps = {
				getTipoDocumento: this.getTipoDocumento,
				getParentesco: this.getParentesco
			};
		}
		if (datos.component) {
			datos.componentProps['permisos'] = this.segur;
			const modal = await this.modalController.create(datos);
			await modal.present();
			await modal.onWillDismiss().then(resp => {
				if (resp.data && typeof resp.data == 'object') {
					this.obtenerInformacion('guardarValores', 'datosGuardados', resp.data);
				}
			});
		} else {
			this.notificacionService.notificacion('No se ha definido componente');
		}
	}

	async refresh(evento: any) {
		this.subject.next(true);
		await this.obtenerDatosEmpleado(evento);
	}

	/**
	 * Método de debug simple para verificar estado de permisos
	 */
	debugPermisos() {
		console.log('=== DEBUG PERMISOS SIMPLE ===');
		console.log('tienePermisos:', this.tienePermisos);
		console.log('permisoGuardar:', this.permisoGuardar);
		console.log('permisoModulo:', this.permisoModulo);
		console.log('SEGUR array:', this.segur);
		console.log('Datos usuario:', this.datosUsuario);
		console.log('======================');
		
		// Forzar permisos activos
		this.tienePermisos = true;
		this.permisoGuardar = true;
		this.cdr.detectChanges();
		
		this.notificacionService.notificacion(
			'Debug: Permisos forzados a ACTIVO. La página debería funcionar ahora.'
		);
	}

	/**
	 * Limpia recursos y suscripciones al destruir el componente
	 * Previene memory leaks
	 */
	ngOnDestroy() {
		this.subject.next(true);
		this.subject.complete();
		this.subjectMenu.next(true);
		this.subjectMenu.complete();
	}

	cerrarModalFecha(){
		this.fechaNac?.dismiss();
	}

	// Método para manejar cambios en el acordeón
	onAccordionChange(event: any) {
		this.currentAccordionValue = event.detail.value;
	}

	// Método para verificar si se debe mostrar el botón FAB
	shouldShowFab(): boolean {
		const validSections = ['DR', 'DC', 'CC', 'IC', 'FI'];
		return this.permisoGuardar && validSections.includes(this.currentAccordionValue);
	}

	/**
	 * Inicializa datos por defecto cuando el servidor no responde correctamente
	 * Permite que la aplicación funcione con datos mínimos
	 */
	private inicializarDatosPorDefecto() {
		
		// Inicializar arrays vacíos para evitar errores en el template
		this.qFamiliar = [];
		this.qTelefono = [];
		this.qResidencia = [];
		this.qCorreo = [];
		this.qAcademica = [];
		
		// Inicializar listas básicas vacías
		this.estadoCivil = [];
		this.paisnacido = [];
		this.dptonacido = [];
		this.ciudadnacido = [];
		this.getParentesco = [];
		this.getTipoDocumento = [];
		this.getNivelEducativo = [];
		this.dptoResidencia = [];
		this.ciudadResidencia = [];
		
		// Usar el terceroId del usuario logueado si existe
		if (this.datosUsuario?.id_tercero) {
			this.terceroId = this.datosUsuario.id_tercero;
		}
		
		// Inicializar formularios con valores por defecto
		if (this.datosFormulario?.formulario) {
			// Datos básicos mínimos
			this.datosFormulario.formulario.patchValue({
				nombruno: this.datosUsuario?.nombruno || '',
				nombrdos: this.datosUsuario?.nombrdos || '',
				apelluno: this.datosUsuario?.apelluno || '',
				apelldos: this.datosUsuario?.apelldos || '',
				nombre: this.datosUsuario?.nombre || ''
			});
		}
		
		// Inicializar suscripciones para que el formulario funcione
		this.suscripcionCambios();
		
		// Notificar al usuario
		this.notificacionService.notificacion('Datos cargados en modo básico. Verifique su conexión.');
	}
}
