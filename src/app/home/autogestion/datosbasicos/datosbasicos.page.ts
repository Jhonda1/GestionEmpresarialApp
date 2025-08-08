import { Component, OnInit, ViewChild } from '@angular/core';
import { RxFormGroup } from '@rxweb/reactive-form-validators';
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
import { IonAccordionGroup, IonModal, ModalController } from '@ionic/angular';
import { AgregarResidenciaComponent } from './agregar-residencia/agregar-residencia.component';
import { AgregarTelefonoComponent } from './agregar-telefono/agregar-telefono.component';
import { AgregarCorreoComponent } from './agregar-correo/agregar-correo.component';
import { AgregarEstudioComponent } from './agregar-estudio/agregar-estudio.component';
import { AgregarFamiliarComponent } from './agregar-familiar/agregar-familiar.component';
import { defineCustomElements } from '@ionic/pwa-elements/loader';

defineCustomElements(window);

@Component({
	selector: 'app-datosbasicos',
	templateUrl: './datosbasicos.page.html',
	styleUrls: ['./datosbasicos.page.scss'],
  	standalone: false,
})
export class DatosbasicosPage implements OnInit {

	@ViewChild(IonAccordionGroup, { static: true }) accordionGroup: IonAccordionGroup | undefined;
	@ViewChild('modalFecha') fechaNac: IonModal | undefined;
	@ViewChild('#updateFechaModal') fechaModal?: IonModal;
	qFamiliar: Array<object> = [];
	qTelefono: Array<object> = [];
	qResidencia: Array<object> = [];
	qCorreo: Array<object> = [];
	qAcademica: Array<object> = [];
	segur: Array<object> = [];
	buscarLista = '';
	buscarListaHistorico = '';
	buscarListaAcademia = '';
	buscarListaTelefono = '';
	buscarListaRe = '';
	buscarListaCorreo = '';
	accordions = ['DP', 'DR', 'DC', 'CC', 'IE', 'IC', 'FI'];
	datosUsuario: { 
		SEGUR?: Array<object>; 
		validaFoto?: string; 
		foto?: string; 
	  } = {};
	foto: string = FuncionesGenerales.urlGestion();
	rutaGeneral = 'Autogestion/cDatosBasicos/';
	datosFormulario!: { formulario: RxFormGroup, propiedades: Array<string> };
	datosAdicionales!: { formulario: RxFormGroup, propiedades: Array<string> };
	BotonAgregar = '';

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
	 * Helper para obtener la URL de la foto del usuario
	 * Maneja la lógica de mostrar la foto correcta basada en el estado
	 */
	getFotoUsuario(): string {
		// Si hay una foto de perfil recién tomada, usarla
		if (this.fotoDePerfil) {
			return this.fotoDePerfil;
		}

		// Si hay foto en datosUsuario
		if (this.datosUsuario?.foto) {
			// Si tiene validaFoto = 'S', usar la URL del servidor
			if (this.datosUsuario.validaFoto === 'S') {
				return this.foto + this.datosUsuario.foto;
			}
			// Si no, usar directamente la foto (base64)
			return this.datosUsuario.foto;
		}

		// Foto por defecto
		return 'assets/images/nofoto.png';
	}

	/**
	 * Verifica si el usuario tiene una foto válida
	 */
	tieneFotoValida(): boolean {
		return !!(this.fotoDePerfil || this.datosUsuario?.foto);
	}

	/**
	 * Limpia la foto actual
	 */
	limpiarFoto(): void {
		this.fotoDePerfil = undefined;
		if (this.datosUsuario) {
			this.datosUsuario.foto = '';
			this.datosUsuario.validaFoto = 'N';
		}
	}

	constructor(
		private notificacionService: NotificacionesService,
		private loginService: LoginService,
		private datosBasicosService: DatosbasicosService,
		private informacionEmpleado: InformacionEmpleado,
		private menu: CambioMenuService,
		private storage: StorageService,
		private modalController: ModalController
	) { }

	ngOnInit() {
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
	}

	async obtenerUsuario() {
		try {
			const userStorage = await this.storage.get('usuario');
			
			if (!userStorage) {
				console.log('No hay usuario en storage');
				return;
			}

			const userParsed = JSON.parse(userStorage);
			this.datosUsuario = await this.loginService.desencriptar(userParsed);
			
			if (this.datosUsuario) {
				this.segur = this.datosUsuario['SEGUR'] || [];
				
				// Si el usuario tiene id_tercero, establecerlo
				if (this.datosUsuario['id_tercero']) {
					this.terceroId = this.datosUsuario['id_tercero'];
				}
				
				// Establecer la foto si existe
				if (this.datosUsuario['foto']) {
					console.log('Cargando foto desde usuario:', this.datosUsuario['foto'].substring(0, 50) + '...');
				}
								
				this.irPermisos('datosFormulario', 'DP');
			}
			
		} catch (error) {
			console.error('Error obteniendo usuario:', error);
			this.notificacionService.notificacion('Error al obtener información del usuario');
		}
	}

	async ionViewDidEnter() {
		this.searching = true;
		
		try {
			// IMPORTANTE: Primero obtener usuario para establecer terceroId
			await this.obtenerUsuario();
			
			// Luego obtener datos del empleado
			this.obtenerDatosEmpleado();
			
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
			if (resp.success) {
				(this as any)[funcion](resp);
			} else {
				this.notificacionService.notificacion(resp.mensaje);
			}
			this.searching = false;
			if (event) {
				event.target.complete();
			}
		}, console.error).catch((err: any) => {
			console.log('Error ', err);
			this.searching = false;
			if (event) {
				event.target.complete();
			}
		}).catch((error: any) => console.log('Error ', error));
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
					const image = await Camera.getPhoto({
						quality: 100,
						resultType: CameraResultType.DataUrl,
						source: role === 'camara' ? CameraSource.Camera : CameraSource.Photos
					});
					this.actualizarFotoPerfil(image.dataUrl || '');
					this.extBase64 = `data:image/${image.format};base64,`;
				} catch (err) {
					if (err !== 'No Image Selected') {
						this.fotoDePerfil = undefined;
						this.notificacionService.notificacion('Error al tomar imagen');
					}
				}
			}
		}, error => console.log('Error ', error));
	}

	async actualizarFotoPerfil(foto: any) {
		try {
			// Verificar que terceroId esté disponible
			if (!this.terceroId) {
				this.notificacionService.notificacion('Error: No se puede identificar el usuario');
				return;
			}

			const datos = { id_tercero: this.terceroId, foto };
			
			const response = await this.datosBasicosService.informacion(datos, this.rutaGeneral + 'fotoPerfil');
			const { mensaje, success, archivo } = response;
			
			this.notificacionService.notificacion(mensaje);
			
			if (success) {
				// Actualizar TODAS las propiedades relacionadas con la foto
				this.fotoDePerfil = foto;
				this.datosUsuario.foto = foto;
				
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

					// Actualizar la foto
					userDecrypted.foto = foto;
					userDecrypted.validaFoto = 'S'; 

					// Encriptar y guardar correctamente
					const userEncrypted = await this.loginService.encriptar(userDecrypted);					
					await this.storage.set('usuario', JSON.stringify(userEncrypted));
					
					// Actualizar datosUsuario local también
					this.datosUsuario.foto = foto;
					this.datosUsuario.validaFoto = 'S';
					
					// Forzar actualización de la vista
					this.cambiovalor = !this.cambiovalor;
					
				} catch (storageError) {
					console.error('Error manejando storage:', storageError);
					this.notificacionService.notificacion('Error al actualizar la información del usuario');
				}
			}
			
		} catch (error) {
			console.error('Error actualizando foto:', error);
			this.notificacionService.notificacion('Error al actualizar la foto de perfil');
		}
	}

	obtenerDatosEmpleado(event?: any) {
		this.datosBasicosService.informacion({}, this.rutaGeneral + 'getData').then((resp: any) => {
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
			const { datos } = resp;
			this.terceroId = datos.id_tercero;
			this.datosFormulario.formulario.patchModelValue(datos);
			this.datosAdicionales.formulario.patchModelValue(datos);
			this.suscripcionCambios();
			this.searching = false;
			if (event) {
				event.target.complete();
			};
		}).catch((error: any) => console.log('Error ', error));
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
		const valor = this.accordionGroup ? this.accordionGroup.value : null;
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

	refresh(evento: any) {
		this.subject.next(true);
		this.obtenerDatosEmpleado(evento);
	}

	cerrarModalFecha(){
		this.fechaNac?.dismiss();
	}
}
