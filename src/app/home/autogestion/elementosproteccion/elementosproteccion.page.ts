/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/quotes */
/* eslint-disable @typescript-eslint/dot-notation */
import { Component, OnInit, OnDestroy, ViewChild, ChangeDetectorRef } from '@angular/core';
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
    console.log('openModalFirmas',item);
    this.currentItem = item;
    this.isFirmaModalOpen = true;
  }

  closeClaveModal() {
    this.isClaveModalOpen = false;
  }

  async openQRModal() {
    try {
      // Verificar si estamos en un dispositivo nativo
      if (Capacitor.isNativePlatform()) {
        // Solicitar permisos de cámara explícitamente
        const permissions = await Camera.requestPermissions({
          permissions: ['camera']
        });
        
        if (permissions.camera !== 'granted') {
          this.notificacionService.notificacion('Permisos de cámara requeridos para escanear QR');
          return;
        }
      }

      // Verificar permisos de cámara antes de abrir el modal
      const hasCamera = await QrScanner.hasCamera();
      if (!hasCamera) {
        this.notificacionService.notificacion('No se detectó una cámara disponible');
        return;
      }

      this.isQRModalOpen = true;
      this.cdRef.detectChanges();
      
      // Esperar a que el DOM se actualice antes de iniciar el scanner
      await this.startQRScanner();
    } catch (error) {
      console.error('Error al abrir modal QR:', error);
      this.notificacionService.notificacion('Error al acceder a la cámara');
    }
  }

  closeQRModal() {
    this.isQRModalOpen = false;
    this.stopQRScanner();
    this.validandoClave = false; // Resetear estado de validación
    this.cdRef.detectChanges(); 
  }
  
  cancelarQR() {
    this.closeQRModal();
  }

  async startQRScanner() {
    try {
      // Detener scanner previo si existe
      if (this.lectorQR) {
        this.stopQRScanner();
      }

      // Esperar más tiempo para que el DOM esté completamente renderizado
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      const videoElement = document.getElementById('videoQR') as HTMLVideoElement;
      if (!videoElement) {
        console.error('Elemento de video no encontrado');
        this.notificacionService.notificacion('No se pudo inicializar la cámara');
        return;
      }

      // Configurar el elemento de video
      videoElement.setAttribute('autoplay', 'true');
      videoElement.setAttribute('muted', 'true');
      videoElement.setAttribute('playsinline', 'true');

      // Verificar si QrScanner tiene cámaras disponibles
      let cameras;
      try {
        cameras = await QrScanner.listCameras(true);
      } catch (cameraError) {
        console.error('Error al listar cámaras:', cameraError);
        this.notificacionService.notificacion('Error al acceder a las cámaras del dispositivo');
        return;
      }

      if (!cameras || cameras.length === 0) {
        this.notificacionService.notificacion('No hay cámaras disponibles');
        return;
      }

      console.log('Cámaras disponibles:', cameras);

      this.lectorQR = new QrScanner(
        videoElement,
        async (result) => {
          if (this.validandoClave) return;
          this.validandoClave = true;

          try {
            console.log('Resultado escaneado:', result.data);
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
              this.validandoClave = false;
              this.obtenerUsuario();
            } else {
              setTimeout(() => (this.validandoClave = false), 1000);
            }
          } catch (error) {
            console.error('Error al procesar el resultado del escaneo:', error);
            this.notificacionService.notificacion('Error al procesar código QR');
            this.validandoClave = false;
          }
        },
        {
          highlightScanRegion: true,
          highlightCodeOutline: true,
          returnDetailedScanResult: true,
          maxScansPerSecond: 5,
          preferredCamera: 'environment' // Usar cámara trasera por defecto
        }
      );

      // Intentar usar la cámara trasera si está disponible
      const rearCamera = cameras.find(camera => 
        camera.label.toLowerCase().includes('back') || 
        camera.label.toLowerCase().includes('rear') ||
        camera.label.toLowerCase().includes('environment') ||
        camera.label.toLowerCase().includes('trasera')
      );
      
      if (rearCamera) {
        try {
          await this.lectorQR.setCamera(rearCamera.id);
          console.log('Cámara trasera seleccionada:', rearCamera.label);
        } catch (setCameraError) {
          console.warn('Error al configurar cámara trasera, usando la por defecto:', setCameraError);
        }
      }

      // Intentar iniciar el scanner con reintentos
      let attempts = 0;
      const maxAttempts = 3;
      
      while (attempts < maxAttempts) {
        try {
          await this.lectorQR.start();
          console.log('Scanner QR iniciado correctamente');
          break;
        } catch (startError) {
          attempts++;
          console.error(`Intento ${attempts} falló:`, startError);
          
          if (attempts >= maxAttempts) {
            throw startError;
          }
          
          // Esperar un poco antes del siguiente intento
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
      
    } catch (error) {
      console.error('Error al iniciar el escáner QR:', error);
      
      let errorMessage = 'Error al iniciar la cámara';
      
      // Mensajes de error más específicos
      if (error.name === 'NotAllowedError') {
        errorMessage = 'Permisos de cámara denegados. Por favor, habilita los permisos en configuración.';
      } else if (error.name === 'NotFoundError') {
        errorMessage = 'No se encontró una cámara disponible en el dispositivo.';
      } else if (error.name === 'NotSupportedError') {
        errorMessage = 'La cámara no es compatible con este dispositivo.';
      } else if (error.name === 'NotReadableError') {
        errorMessage = 'La cámara está siendo usada por otra aplicación.';
      } else if (error.message) {
        errorMessage += ': ' + error.message;
      }
      
      this.notificacionService.notificacion(errorMessage);
      this.validandoClave = false;
      
      // Si hay error, cerrar el modal
      this.closeQRModal();
    }
  }

  stopQRScanner() {
    try {
      if (this.lectorQR) {
        this.lectorQR.stop();
        this.lectorQR.destroy();
        this.lectorQR = null;
        console.log('Scanner QR detenido correctamente');
      }
    } catch (error) {
      console.error('Error al detener scanner:', error);
      this.lectorQR = null;
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
    await this.openQRModal();
  }
}
