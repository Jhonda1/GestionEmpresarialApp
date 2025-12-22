import { Component, OnInit, OnDestroy, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule, ModalController, IonAccordionGroup, Platform } from '@ionic/angular';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { IonItemSliding } from '@ionic/angular';
import { StorageService } from 'src/app/servicios/storage.service';
import { FuncionesGenerales } from 'src/app/config/funciones/funciones';
import { LoginService } from 'src/app/servicios/login.service';
import { CambioMenuService } from 'src/app/config/cambio-menu/cambio-menu.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { DatosbasicosService } from 'src/app/servicios/datosbasicos.service';
import { FiltrosCertificadosComponent } from './filtros-certificados/filtros-certificados.component';
import { VerPdfComponent } from './ver-pdf/ver-pdf.component';
import { Browser } from '@capacitor/browser';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
// Importaciones de componentes y pipes necesarios
import { HeaderComponent } from 'src/app/componentes/header/header.component';
import { FiltroListaPipe } from 'src/app/pipes/filtro-lista/filtro-lista.pipe';

// IMPORTACIONES PARA VALIDACIÓN DE PERMISOS
import { ValidacionPermisosService } from 'src/app/servicios/validacion-permisos.service';
import { NotificacionesService } from 'src/app/servicios/notificaciones.service';
import { ValidarPermiso, LogAccion, PermisosUtils } from 'src/app/utils/permisos.decorators';

@Component({
	selector: 'app-certificados',
	templateUrl: './certificados.page.html',
	styleUrls: ['./certificados.page.scss'],
	standalone: true,
	imports: [
		CommonModule,
		FormsModule,
		ReactiveFormsModule,
		IonicModule,
		FontAwesomeModule,
		PdfViewerModule,
		// Componentes
		HeaderComponent,
		FiltrosCertificadosComponent,
		VerPdfComponent,
		// Pipes
		FiltroListaPipe
	]
})
export class CertificadosPage implements OnInit, OnDestroy {
  permisoExtrato      = false;
  permisoCertificado  = false;
  permisoCartaLaboral = false;
  permisoAccesoModulo = false;
  
  hoy = new Date();
  Month = ("0" + (this.hoy.getMonth() + 1)).slice(-2);
  anio = this.hoy.getFullYear();
  SEGUR: number[] = [];

	src: any;
	@ViewChild(IonAccordionGroup, { static: true }) accordionGroup!: IonAccordionGroup;
	viwPDF = false;
	carataLaboral = '';
	buscarListaHistorico: string = '';
	segmento = 'historicoFamilia';
	searching: boolean = false;
	pdfObj: any;
	datosUsuario: { SEGUR?: number[] } = {};
	base64 = '';
	subject = new Subject();
	subjectMenu = new Subject();
	listEstra: any = [{ nombre: 'cesar', Observacion: 'nuevo para descarga' }, { nombre: 'juan', Observacion: 'nuevo para descarga' }]
	qExtractos: any = Array();
	qCIR: any = Array();
	terceroId = '';
	rutaGeneral: string = 'Autogestion/cCertificadoslaborales/';
	filtro: any = false;
	formFiltro: {
		anio?: number;
		meses?: string[];
		quincena?: string[];
		documento?: string;
		salario?: string | null;
		destino?: string | null;
	} = {};
	qCartaLaboral: any[] = [];
	accordions = ["CL", "EX", "CI"];

  private validacionPermisosService = inject(ValidacionPermisosService);
  private notificacionService = inject(NotificacionesService);
  private router = inject(Router);

	constructor(
		private loginService: LoginService,
		private storage: StorageService,
		private menu: CambioMenuService,
		private datosBasicosService: DatosbasicosService,
		private modalController: ModalController,
		public platform: Platform,
		private sanitizer: DomSanitizer

	) { }

	async ngOnInit() {
    //  VALIDAR PERMISOS AL INICIALIZAR
    await this.validarPermisosIniciales();
    
		if (this.accordionGroup) {
			this.accordionGroup.ionChange.subscribe(({ detail }) => {
				if (this.accordions.includes(detail.value)) {
					this.accordionGroup.value = detail.value;
				}
			});
		}
	}

  //  VALIDACIÓN DE PERMISOS INICIALES
  private async validarPermisosIniciales() {
    try {
      // Validar permiso general del módulo
      const resultado = await this.validacionPermisosService.validarPermisoParaAccion(
        6001007, // Permiso general para certificados laborales
        'acceder al módulo de certificados laborales'
      );

      if (!resultado.valido) {
        this.notificacionService.notificacion(resultado.mensaje);
        this.router.navigateByUrl('/modulos/datosbasicos');
        return;
      }

      this.permisoAccesoModulo = true;

      // Validar permisos específicos
      await this.validarPermisosEspecificos();

    } catch (error) {
      console.error('Error al validar permisos iniciales:', error);
      this.notificacionService.notificacion('Error al validar permisos.');
      
      // En caso de error, activar redirección
      setTimeout(() => {
        this.validacionPermisosService.manejarFaltaDePermisos('Error al validar permisos');
      }, 1500);
    }
  }

  // VALIDACIÓN DE PERMISOS ESPECÍFICOS
  private async validarPermisosEspecificos() {
    const resultados = await this.validacionPermisosService.validarMultiplesPermisos([
      60010071, // Carta laboral
      60010072, // Extracto
      60010073  // Certificado
    ]);

    this.permisoCartaLaboral = resultados[60010071] || false;
    this.permisoExtrato = resultados[60010072] || false;
    this.permisoCertificado = resultados[60010073] || false;
  }

	fechaActual() {

		this.formFiltro = {
			anio: this.anio,
			meses: [this.Month],
			quincena: ['01', '16'],
			documento: 'T',
			salario: null,
			destino: null
		};
		this.obtenerDatosEmpleado();
	}

  async obtenerUsuario() {
		// ✅ Usar método centralizado que valida empleados retirados
		this.datosUsuario = await this.datosBasicosService.obtenerDatosStorage('usuario');
		
		if (!this.datosUsuario) {
			console.error('No se pudo obtener usuario del storage');
			return;
		}
		
		this.SEGUR = this.datosUsuario['SEGUR'] || [];
    
    this.permisoExtrato = this.validacionPermisosService.validarPermisoLocal(60010072);
    this.permisoCertificado = this.validacionPermisosService.validarPermisoLocal(60010073);
    this.permisoCartaLaboral = this.validacionPermisosService.validarPermisoLocal(60010071);
	}

  validarPermiso(permiso: number): boolean {
    return this.validacionPermisosService.validarPermisoLocal(permiso);
	}

	ionViewDidEnter() {
		this.searching = true;
		this.obtenerUsuario();
		this.fechaActual();

		this.menu.suscripcion().pipe(
			takeUntil(this.subjectMenu)
		).subscribe(() => {
			this.subject.next(true);
			this.subjectMenu.next(true);
		}, error => {
			console.log("Error ", error);
		}, () => console.log("Completado Menú !!"));
	}

	obtenerDatosEmpleado(event?: any) {
		this.searching = true;
		this.datosBasicosService.informacion(this.formFiltro, this.rutaGeneral + 'getData').then(({
			datos,
			qCertificados,
		}) => {
			if (datos) {
				this.qCartaLaboral = [datos];
				this.qCIR = qCertificados.CIR;
				this.qExtractos = qCertificados.Extracto;
				this.terceroId = datos.id_tercero;
			}
			this.searching = false;
			if (event) {
				event.target.complete();
			}
		}).catch(error => {
			// ✅ Usar helper centralizado para manejar errores
			this.datosBasicosService.manejarErrorEmpleadoRetirado(error, event);
		});
	}

	async download(url: string) {
    // Validar permiso antes de mostrar el PDF
    const tienePermiso = await PermisosUtils.validarPermisoImperativo(
      this.validacionPermisosService,
      this.notificacionService,
      60010073, // Permiso para ver certificados
      'ver certificados'
    );

    if (!tienePermiso) {
      return;
    }

    try {
      const modal = await this.modalController.create({
        component: VerPdfComponent,
        backdropDismiss: true,
        cssClass: 'animate__animated animate__slideInRight animate__faster',
        componentProps: { url }
      });

      await modal.present();
      modal.onWillDismiss().then(() => { }).catch(console.log);
    } catch (error) {
      console.error('Error al abrir PDF:', error);
      this.notificacionService.notificacion('Error al abrir el documento');
    }
	}

	async filtros(param: number | null | undefined) {
		this.formFiltro['salario'] = param == null ? null : 'S';
		this.formFiltro['destino'] = '';
		let componentProps = {
      inputanio: this.formFiltro['anio'],
			inputmeses: this.formFiltro['meses'],
			inputquincena: this.formFiltro['quincena'],
			inputdocumento: this.formFiltro['documento'],
			inputsalario: this.formFiltro['salario'],
			inputdestino: this.formFiltro['destino']
		};
		const modal = await this.modalController.create({
			component: FiltrosCertificadosComponent,
			backdropDismiss: true,
			cssClass: 'animate__animated animate__slideInRight animate__faster',
			componentProps
		});

		await modal.present();
		modal.onWillDismiss().then(({ data }) => {
			if (data) {
				if (data.limpiar) {
					this.fechaActual();
				} else {
          this.formFiltro['anio'] = data.anio;
					this.formFiltro['meses'] = data.meses;
					this.formFiltro['quincena'] = data.quincena;
					this.formFiltro['documento'] = data.documento;
					this.formFiltro['destino'] = data.destino;
					this.formFiltro['salario'] = data.salario;
					if (param == null) {
						this.obtenerDatosEmpleado();
					} else {
						this.CartaLaboral(param);
					}
				}
			}
		}).catch((error) => {
			console.log(error);
		});
	}

	refresh(event: any) {
		this.obtenerDatosEmpleado();
	}

	buscarFiltro(variable: keyof CertificadosPage, evento: any) {
		(this as any)[variable] = evento.detail.value;
	}

	sliding(ref: string) {
		let elem: any = document.getElementById(ref);
		(elem as IonItemSliding).getSlidingRatio().then(numero => {
			if (numero === 1) {
				(elem as IonItemSliding).close();
			} else {
				(elem as IonItemSliding).open("end");
			}
		});
	}

	async obtenerArchivo(url: string) {
    const tienePermiso = await PermisosUtils.validarPermisoImperativo(
      this.validacionPermisosService,
      this.notificacionService,
      60010073, // Permiso para descargar certificados
      'descargar certificados'
    );

    if (!tienePermiso) {
      return;
    }

    try {
      await Browser.open({ url });
    } catch (error) {
      console.error('Error al abrir archivo:', error);
      this.notificacionService.notificacion('Error al abrir el archivo');
    }
	}


  @ValidarPermiso(60010071, 'generar carta laboral')
  @LogAccion('Generación de carta laboral')
	async CartaLaboral(event: any) {
    try {
      const resultado = await this.datosBasicosService.informacion(
        this.formFiltro, 
        this.rutaGeneral + 'ImprimirCartaLaboral'
      );

      const { base64Img, file_aux } = resultado;

      if (event == 1) {
        // Usar el modal VerPdfComponent para consistencia con otros PDFs
        this.download(base64Img);
      } else {
        // Abrir en el navegador externo
        this.obtenerArchivo(file_aux);
      }
    } catch (error) {
      // 🔥 Usar helper centralizado para manejar errores de empleado retirado
      this.datosBasicosService.manejarErrorEmpleadoRetirado(error);
      console.error('Error al generar carta laboral:', error);
      this.notificacionService.notificacion('Error al generar la carta laboral');
    }
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

}


