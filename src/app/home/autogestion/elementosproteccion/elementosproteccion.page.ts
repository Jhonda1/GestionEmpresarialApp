/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/quotes */
/* eslint-disable @typescript-eslint/dot-notation */
import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { DatosEmpleadosService } from 'src/app/servicios/datosEmpleados.service';
import { LoginService } from 'src/app/servicios/login.service';
import { StorageService } from 'src/app/servicios/storage.service';
import { IonModal, AlertController } from '@ionic/angular';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import QrScanner from 'qr-scanner';
import { NotificacionesService } from 'src/app/servicios/notificaciones.service';


@Component({
  selector: 'app-elementosproteccion',
  templateUrl: './elementosproteccion.page.html',
  styleUrls: ['./elementosproteccion.page.scss'],
  standalone: false
})
export class ElementosproteccionPage implements OnInit {
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

  openQRModal() {
    this.isQRModalOpen = true;
    this.startQRScanner();
  }

  closeQRModal() {
    this.isQRModalOpen = false;
    this.stopQRScanner();
    this.cdRef.detectChanges(); 
  }
  
  cancelarQR() {
    this.closeQRModal();
  }

  startQRScanner() {
    setTimeout(() => {
      const videoElement = document.getElementById('videoQR') as HTMLVideoElement;
      if (!videoElement) {
        console.error('Elemento de video no encontrado');
        return;
      }
  
      this.lectorQR = new QrScanner(
        videoElement,
        async (result) => {
          if (this.validandoClave) return;
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
              this.validandoClave = false; // Restablecer validación
              this.obtenerUsuario();
            } else {
              setTimeout(() => (this.validandoClave = false), 1000);
            }
          } catch (error) {
            console.error('Error al procesar el resultado del escaneo:', error);
            this.validandoClave = false;
          }
        },
        {
          highlightScanRegion: true,
          highlightCodeOutline: true,
          returnDetailedScanResult: true,
        }
      );
  
      this.lectorQR.start().catch((error) => {
        console.error('Error al iniciar el escáner QR:', error);
      });
    }, 500);
  }

  stopQRScanner() {
    if (this.lectorQR) {
      this.lectorQR.stop();
      this.lectorQR.destroy();
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
    this.isQRModalOpen = true;
    this.startQRScanner();
  }
}
