/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/quotes */
/* eslint-disable @typescript-eslint/dot-notation */
import { Component, OnInit, OnDestroy, ViewChild, ChangeDetectorRef, ElementRef } from '@angular/core';
import { DatosEmpleadosService } from 'src/app/servicios/datosEmpleados.service';
import { LoginService } from 'src/app/servicios/login.service';
import { StorageService } from 'src/app/servicios/storage.service';
import { IonModal, AlertController } from '@ionic/angular';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import QrScanner from 'qr-scanner';
import { NotificacionesService } from 'src/app/servicios/notificaciones.service';
import { Camera } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';


@Component({
  selector: 'app-elementosproteccion',
  templateUrl: './elementosproteccion.page.html',
  styleUrls: ['./elementosproteccion.page.scss'],
  standalone: false
})
export class ElementosproteccionPage implements OnInit, OnDestroy {
  @ViewChild('modal', { static: true }) modal!: IonModal;
  @ViewChild('modal1', { static: true }) modal1!: IonModal;
  @ViewChild('modalQR', { static: false }) modalQR!: IonModal;
  @ViewChild('videoQR', { static: false }) videoQR!: ElementRef<HTMLVideoElement>;
  rutaGeneral = 'Autogestion/cElementosProteccion/';
  elementosProteccion: any[] = [];
  terceroId!: number;
  datosUsuario: { num_docu: number } = { num_docu: 0 };
  segur: Array<object> = [];
  fechaInicial!: string;
  fechaFinal!: string;
  filtroForm: FormGroup;
  isFirmaModalOpen = false;
  currentItem: any;
  isModalOpen!: boolean;
  isClaveModalOpen!: boolean;
  isQRModalOpen!: boolean;
  clave!: string;
  lectorQR: QrScanner | null = null;
  validandoClave = false;

  constructor(
    private datosEmpleadosService: DatosEmpleadosService,
    private fb: FormBuilder,
    private loginService: LoginService,
    private storage: StorageService,
    private alertController: AlertController,
    private notificacionService: NotificacionesService,
    private cdRef: ChangeDetectorRef,
  ) {
    this.filtroForm = new FormGroup({
      fechainicio: new FormControl(),
      fechafinal: new FormControl()
    });
  }

  ngOnInit() {
    this.obtenerUsuario();
  }

  ngOnDestroy() {
    // Limpiar recursos cuando el componente se destruye
    this.stopQRScanner();
  }

  async obtenerUsuario() {
    this.datosUsuario = await this.loginService.desencriptar(
      JSON.parse(await this.storage.get('usuario').then(resp => resp))
    );
    this.terceroId = this.datosUsuario['num_docu'];
    this.obtenerInformacion('obtenerElementosAsignados', 'cargarElementosAsignados', {
      terceroId: this.terceroId,
      fechaInicial: this.fechaInicial,
      fechaFinal: this.fechaFinal
    });
  }

  obtenerInformacion(metodo: string, funcion: string, datos = {}, event?: any): Promise<any> {
    return this.datosEmpleadosService.informacion(datos, this.rutaGeneral + metodo).then(resp => {
      if (resp.success) {
        (this[funcion as keyof ElementosproteccionPage] as Function)(resp);
      }
      if (event) {
        event.target.complete();
      }
    }).catch(err => {
      console.log('Error ', err);
      if (event) {
        event.target.complete();
      }
      throw err;
    });
  }

  cargarElementosAsignados(resp: any) {
    if (resp.datos && resp.datos.length === 0) {
      this.notificacionService.notificacion('No hay datos en las fechas filtradas');
    }
    this.elementosProteccion = resp.datos;
  }

  openModal() {
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }
  reiniciarFiltros(){
    this.filtrarPorFecha();
  }

  filtrarPorFecha() {
    this.obtenerInformacion('obtenerElementosAsignados', 'cargarElementosAsignados', {
      terceroId: this.terceroId,
      fechaInicial: this.fechaInicial,
      fechaFinal: this.fechaFinal
    });
    this.fechaInicial = '';
    this.fechaFinal = '';
    this.closeModal();
  }

  confirmarInicio() {
    const inputElement = document.getElementById('Fechainicio') as HTMLInputElement;
    const fechanacselect = document.getElementById('selectFechaInicio') as HTMLInputElement;
    const inputSelect = inputElement.value;
    fechanacselect.value = inputSelect.split('T')[0];
    this.fechaInicial = fechanacselect.value;
  }

  confirmarFin() {
    const inputElement = document.getElementById('FechaFin') as HTMLInputElement;
    const fechanacselect = document.getElementById('selectFechaFin') as HTMLInputElement;
    const inputSelect = inputElement.value;
    fechanacselect.value = inputSelect.split('T')[0];
    this.fechaFinal = fechanacselect.value;
  }

  openFirmaModal(item: any) {
    this.currentItem = item;
    this.isFirmaModalOpen = true;
  }

  closeFirmaModal() {
    this.isFirmaModalOpen = false;
  }

  openModalFirmas(item: any) {
    this.currentItem = item;
    this.isFirmaModalOpen = true;
  }

  closeClaveModal() {
    this.isClaveModalOpen = false;
  }

  async openQRModal() {
    try {      
      // Verificar si estamos en una plataforma nativa
      if (Capacitor.isNativePlatform()) {        
        // Solicitar permisos de cámara
        const permissions = await Camera.requestPermissions({ permissions: ['camera'] });
        
        if (permissions.camera !== 'granted') {
          this.notificacionService.notificacion('Permisos de cámara requeridos para escanear QR');
          return;
        }
        
        // Esperar un momento para que los permisos se apliquen
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Verificar si hay cámara disponible
      const hasCamera = await QrScanner.hasCamera();
      
      if (!hasCamera) {
        this.notificacionService.notificacion('No se detectó una cámara disponible');
        return;
      }

      this.isQRModalOpen = true;
      
      // Forzar múltiples detecciones de cambios
      this.cdRef.detectChanges();
      this.cdRef.markForCheck();
            
      // Esperar a que el modal esté completamente renderizado
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      let errorMessage = 'Error al acceder a la cámara';
      
      if (error.name === 'NotAllowedError') {
        errorMessage = 'Permisos de cámara denegados. Por favor, habilítalos en configuración.';
      } else if (error.name === 'NotFoundError') {
        errorMessage = 'No se encontró ninguna cámara en el dispositivo.';
      } else if (error.name === 'NotSupportedError') {
        errorMessage = 'Cámara no soportada por este dispositivo.';
      } else if (error.message) {
        errorMessage += ': ' + error.message;
      }
      
      this.notificacionService.notificacion(errorMessage);
    }
  }

  closeQRModal() {    
    // Detener scanner primero
    this.stopQRScanner();
    this.validandoClave = false;
    
    // Cerrar modal usando ambos métodos
    this.isQRModalOpen = false;
    
    if (this.modalQR) {
      this.modalQR.dismiss();
    }
    
    this.cdRef.detectChanges();
  }
  
  cancelarQR() {
    this.closeQRModal();
  }

  async startQRScanner() {
    try {      
      const videoElement = this.videoQR?.nativeElement;
      if (!videoElement) {
        this.notificacionService.notificacion('No se pudo inicializar la cámara - elemento de video no encontrado');
        return;
      }

      // Detener scanner previo si existe
      if (this.lectorQR) {
        this.stopQRScanner();
      }

      // Configurar atributos del video
      videoElement.setAttribute('autoplay', 'true');
      videoElement.setAttribute('muted', 'true');
      videoElement.setAttribute('playsinline', 'true');
      videoElement.style.width = '100%';
      videoElement.style.height = '100%';

      const cameras = await QrScanner.listCameras(true);
      
      if (!cameras.length) {
        this.notificacionService.notificacion('No hay cámaras disponibles en el dispositivo');
        this.closeQRModal();
        return;
      }

      this.lectorQR = new QrScanner(
        videoElement,
        async (result) => {
          if (this.validandoClave) {
            return;
          }
          
          this.validandoClave = true;

          try {
            const datosScan = JSON.parse(result.data);
            const { fechaAsignacion, empleadoId, tercero_id } = this.currentItem;

            const esClaveValida = await this.validarClave(
              fechaAsignacion,
              empleadoId,
              tercero_id,
              datosScan.Clave,
              datosScan.id_tercero
            );

            if (esClaveValida) {
              this.obtenerUsuario();
            }
          } catch (error) {
            console.error('Error al procesar QR:', error);
            this.notificacionService.notificacion('Código QR inválido o mal formateado');
          } finally {
            this.validandoClave = false;
          }
        },
        {
          highlightScanRegion: true,
          highlightCodeOutline: true,
          returnDetailedScanResult: true,
          maxScansPerSecond: 5,
          preferredCamera: 'environment'
        }
      );

      // Buscar cámara trasera
      const rearCamera = cameras.find(cam =>
        cam.label.toLowerCase().includes('back') ||
        cam.label.toLowerCase().includes('rear') ||
        cam.label.toLowerCase().includes('environment') ||
        cam.label.toLowerCase().includes('0') // Muchos dispositivos usan 0 para trasera
      );
      
      if (rearCamera) {
        await this.lectorQR.setCamera(rearCamera.id);
      } else {
        await this.lectorQR.setCamera(cameras[0].id);
      }

      await this.lectorQR.start();

    } catch (error) {
      console.error('Error detallado al iniciar el escáner QR:', error);
      
      let errorMsg = 'Error al iniciar la cámara';
      if (error.message) {
        errorMsg += ': ' + error.message;
      }
      
      this.notificacionService.notificacion(errorMsg);
      this.closeQRModal();
    }
  }

  stopQRScanner() {
    try {
      if (this.lectorQR) {
        this.lectorQR.stop();
        this.lectorQR.destroy();
      }
    } catch (error) {
      console.error('Error al detener el scanner QR:', error);
    } finally {
      this.lectorQR = null; // Liberar referencia siempre
    }
  }
  
  async validarClave(fachaAsignado: string, empleadoId: string, tercero: string, pass: string, scaner: number = 0): Promise<boolean> {
    let resp = false;
    try {
      const resultado = await this.datosEmpleadosService.informacion({
        fachaAsignado,
        empleadoId,
        pass,
        scaner,
        tercero
      }, this.rutaGeneral + "verificarClave");
  
      resp = resultado.valido;
      this.notificacionService.notificacion(resultado.msj);
  
      if (resultado.valido) {
        this.stopQRScanner();  
        this.isQRModalOpen = false; 
        this.cdRef.detectChanges();
        this.isFirmaModalOpen = false;
      }
  
    } catch (error) {
      console.log(error);
    }
    return resp;
  }
  
  
  

  async openModalClave() {
    const alert = await this.alertController.create({
      header: '¡Advertencia!',
      inputs: [
        {
          name: 'clave',
          type: 'password',
          placeholder: 'Clave Firma'
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Aceptar',
          handler: async (data) => {
            const { fechaAsignacion, empleadoId, tercero_id } = this.currentItem;
            const respQuery = await this.validarClave(fechaAsignacion, empleadoId, tercero_id, data.clave);
            if (respQuery) {
              this.closeFirmaModal();
              this.filtrarPorFecha();
            }
          }
        }
      ]
    });
    await alert.present();
  }

  async openScanner() {
    await this.openQRModalImproved();
  }

  // Método para manejar eventos del modal QR
  onQRModalDidPresent() {
    setTimeout(() => {
      this.startQRScanner();
    }, 200);
  }

  onQRModalWillDismiss() {
    this.stopQRScanner();
    this.validandoClave = false;
  }

  // Método alternativo para intentar abrir el modal directamente
  async openQRModalDirect() {    
    try {
      // Método 1: Usando ViewChild
      if (this.modalQR) {
        await this.modalQR.present();
      } else {
        // Método 2: Usando isOpen
        this.isQRModalOpen = true;
        this.cdRef.detectChanges();
        this.cdRef.markForCheck();
      }
      
      // Forzar re-renderizado
      setTimeout(() => {
        this.cdRef.detectChanges();
      }, 100);
      
    } catch (error) {
      console.error('Error al abrir modal directamente:', error);
      // Fallback al método original
      this.isQRModalOpen = true;
      this.cdRef.detectChanges();
    }
  }

  // Método mejorado que combina ambos enfoques
  async openQRModalImproved() {
    try {      
      // Verificar permisos primero
      if (Capacitor.isNativePlatform()) {
        const permissions = await Camera.requestPermissions({ permissions: ['camera'] });
        
        if (permissions.camera !== 'granted') {
          this.notificacionService.notificacion('Permisos de cámara requeridos para escanear QR');
          return;
        }
        
        await new Promise(resolve => setTimeout(resolve, 300));
      }

      // Verificar cámara disponible
      const hasCamera = await QrScanner.hasCamera();
      
      if (!hasCamera) {
        this.notificacionService.notificacion('No se detectó una cámara disponible');
        return;
      }
      
      // Usar ViewChild para apertura más confiable
      if (this.modalQR) {
        this.isQRModalOpen = true;
        await this.modalQR.present();
      } else {
        // Fallback al método tradicional
        this.isQRModalOpen = true;
        this.cdRef.detectChanges();
        this.cdRef.markForCheck();
        
        await new Promise(resolve => setTimeout(resolve, 200));
        this.cdRef.detectChanges();
      }

    } catch (error) {
      console.error('Error en escáner QR:', error);
      this.notificacionService.notificacion('Error al abrir el escáner QR: ' + error.message);
    }
  }
}
