import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { FuncionesGenerales } from '../config/funciones/funciones';
import { CargadorService } from '../servicios/cargador.service';
import { LoginService } from '../servicios/login.service';
import { NotificacionesService } from '../servicios/notificaciones.service';
import { StorageService } from '../servicios/storage.service';
import { ThemeService } from '../servicios/theme.service';
import { CambioMenuService } from '../config/cambio-menu/cambio-menu.service';
import { RxFormGroup } from '@rxweb/reactive-form-validators';
import { timer } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular';
import { UrlConfigModalComponent } from '../componentes/url-config-modal/url-config-modal.component';
@Component({
	selector: 'app-login',
	templateUrl: './login.page.html',
	styleUrls: ['./login.page.scss'],
	standalone: true,
	imports: [CommonModule, FormsModule, ReactiveFormsModule, IonicModule],
  })
export class LoginPage implements OnInit {
	[key: string]: any;

	formLogin!: { formulario: RxFormGroup; propiedades: Array<string>; };
	ingresoDocumento = true;
	claseDocumento = '';
	claseUsuario = '';
	verPassword = false;
	urlFondoImagen = '/assets/images/fondoLogin.jpg';
	mostrarBotonesSesion: boolean = false;
	nombreEmpresa: string = '';
	version: string = '';
	
	// Variables para el long-press
	private longPressTimer: any;
	private isModalOpen: boolean = false;
	isPressing: boolean = false; // Para mostrar feedback visual
	private readonly LONG_PRESS_DURATION = 500; // 0.5 segundos

	constructor(
		private sanitizer: DomSanitizer,
		private theme: ThemeService,
		private router: Router,
		private notificaciones: NotificacionesService,
		private loginService: LoginService,
		private storageService: StorageService,
		private cargadorService: CargadorService,
		private cambioMenu: CambioMenuService,
		private modalCtrl: ModalController,
	) { }

	ngOnInit() {
		this.configForm();
	}

	ionViewWillEnter() {
		this.validarAccion();
	}

	ionViewWillLeave() {
		// Limpiar timer y cerrar modal si la página se abandona
		this.onPressEnd();
		if (this.isModalOpen) {
			this.modalCtrl.dismiss();
			this.isModalOpen = false;
		}
	}

	async validarAccion() {
		const nit = await this.storageService.get('nit').then(resp => resp);
		if (nit) {
			this.formLogin.formulario?.get('nit')?.setValue(nit);
			this.irFormulario();
		}
	}

	configForm() {
		this.formLogin = FuncionesGenerales.crearFormulario(this.loginService);
	}

	obtenerFondo() {
		return this.sanitizer.bypassSecurityTrustStyle(`
			background-image: url(${this.urlFondoImagen});
			background-repeat: no-repeat;
			background-size: cover;
			background-position: center;
			background-attachment: fixed;
		`);
	}

	irFormulario() {
		this.cargadorService.presentar();
		if (this.formLogin.formulario.get('nit')?.valid) {
			const nit = this.formLogin.formulario.get('nit')?.value;
			this.loginService.validarNit(nit).then(respuesta => {
				if (respuesta && respuesta.success) {
					this.storageService.set('nit', nit);
					this.storageService.set('crypt', respuesta.crypt);
					this.storageService.set('modulos', respuesta.modulos);
					this.storageService.set('conexion', respuesta.db);
					this.storageService.set('empresa', respuesta.Empresa || '');
					this.nombreEmpresa = respuesta.Empresa || '';
					this.version = '- V' + (respuesta.version || '');
					this.claseDocumento = 'animate__fadeOutLeft';
					this.ejecutarTimer('claseUsuario', 'animate__fadeInRight')
						.then(item => this.ingresoDocumento = !this.ingresoDocumento);
				} else {
					this.notificaciones.notificacion(respuesta.mensaje);
				}
				this.cargadorService.ocultar();
			}).catch(error => {
				console.log(error);
				this.notificaciones.notificacion('Error de conexión.');
				this.cargadorService.ocultar();
			});
		} else {
			this.cargadorService.ocultar();
		}
	}

	async ejecutarTimer(variable: string, clase: string) {
		return await timer(200).toPromise().then(resp => this[variable] = clase);
	}

	retornar() {
		this.formLogin.formulario.reset();
		this.formLogin.formulario.markAsUntouched();
		this.mostrarBotonesSesion = false;
		this.version = '';
		this.nombreEmpresa = '';
		this.claseUsuario = 'animate__fadeOutRight';
		this.ejecutarTimer('claseDocumento', 'animate__fadeInLeft').then(item => this.ingresoDocumento = !this.ingresoDocumento);
	}

	get fontSize() {
		return { 'fontSize': this.theme.getStyle() };
	};

	login() {
		if (this.formLogin.formulario.valid) {
			this.cargadorService.presentar();
			const permisos = FuncionesGenerales.permisos();
			const data = { ...this.formLogin.formulario.value, permisos };
			this.loginService.iniciarSesionUser(data).then(async respuesta => {
				// 🔥 VALIDAR SI EL EMPLEADO ESTÁ RETIRADO
				if (respuesta && respuesta.valido === 0 && respuesta.fecha_retiro) {
					this.notificaciones.notificacion(
						respuesta.mensaje || 'El empleado se encuentra retirado.'
					);
					this.formLogin.formulario.reset();
					this.formLogin.formulario.markAsUntouched();
					this.cargadorService.ocultar();
					return;
				}
				
				if (respuesta && respuesta.password) {
					this.olvidoPass(1);
					this.formLogin.formulario.reset();
					this.formLogin.formulario.markAsUntouched();
				}
				if (respuesta && respuesta.valido) {
					
					// 🔥 CRÍTICO: Limpiar PRIMERO cualquier dato del usuario anterior
					// Remover explícitamente el usuario anterior del storage
					await this.storageService.remove('usuario');
					await this.storageService.remove('urlFotoUsuarioSesion'); // Limpiar foto anterior
					
					// Espera para asegurar que se eliminó en Android SQLite
					await new Promise(resolve => setTimeout(resolve, 200));
										
					// Guardar nuevo usuario en storage (AWAIT para asegurar que se guarde)
					await this.storageService.set('usuario', respuesta.usuario);
										
					// 🔥 IMPORTANTE: Marcar que hay un nuevo usuario para forzar recarga
					await this.storageService.set('_nuevoLogin', 'true');
										
					// Espera adicional para asegurar que el storage se escribió en disco (Android)
					await new Promise(resolve => setTimeout(resolve, 300));
										
					// 🔥 SOLUCIÓN DEFINITIVA: Recargar la página para limpiar TODO el estado
					// Esto fuerza que Angular/Ionic recargue completamente eliminando:
					// - Todos los servicios singleton en memoria
					// - Todos los componentes cacheados
					// - Todas las variables estáticas
					// - Todo el estado de la aplicación
					window.location.href = '/modulos/datosbasicos';
				} else {
					this.notificaciones.notificacion(respuesta.mensaje);
				}
				this.cargadorService.ocultar();
			}).catch(error => {
				console.error('Error ', error);
				this.cargadorService.ocultar();
			});
		} else {
			FuncionesGenerales.formularioTocado(this.formLogin.formulario);
		}
	}  

	olvidoPass(extra = 0) {
		this.router.navigateByUrl(`forget-password/${this.formLogin.formulario.get('num_docu')?.value || '0'}/${extra}`);
	}

	/**
	 * Inicia el contador para long-press
	 */
	onPressStart(event?: Event) {
		// Prevenir comportamiento por defecto
		if (event) {
			event.preventDefault();
			event.stopPropagation();
		}
		
		// No hacer nada si ya hay un modal abierto
		if (this.isModalOpen) {
			return;
		}
		
		// Limpiar cualquier timer previo
		if (this.longPressTimer) {
			clearTimeout(this.longPressTimer);
			this.longPressTimer = null;
		}
		
		// Activar feedback visual
		this.isPressing = true;
		
		// Iniciar nuevo timer
		this.longPressTimer = setTimeout(() => {
			this.longPressTimer = null;
			this.isPressing = false;
			this.abrirConfiguracionUrls();
		}, this.LONG_PRESS_DURATION);
	}

	/**
	 * Cancela el contador si se suelta antes de tiempo
	 */
	onPressEnd(event?: Event) {
		// Prevenir comportamiento por defecto
		if (event) {
			event.preventDefault();
			event.stopPropagation();
		}
		
		// Desactivar feedback visual
		this.isPressing = false;
		
		// Limpiar el timer si existe
		if (this.longPressTimer) {
			clearTimeout(this.longPressTimer);
			this.longPressTimer = null;
		}
	}

	/**
	 * Abre el modal de configuración de URLs
	 */
	async abrirConfiguracionUrls() {
		// Prevenir múltiples aperturas
		if (this.isModalOpen) {
			console.log('Modal ya está abierto, ignorando...');
			return;
		}
		
		try {
			this.isModalOpen = true;
			
			const modal = await this.modalCtrl.create({
				component: UrlConfigModalComponent,
				cssClass: 'url-config-modal',
				backdropDismiss: true
			});

			await modal.present();

			const { data } = await modal.onWillDismiss();
			
			// Resetear la bandera cuando se cierre el modal
			this.isModalOpen = false;
			
			if (data && data.guardado) {
				console.log('Configuración de URLs actualizada');
			}
		} catch (error) {
			console.error('Error al abrir modal de configuración:', error);
			this.isModalOpen = false;
		}
	}
}
