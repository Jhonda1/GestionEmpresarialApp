import { Component, Input, OnInit, ViewChild, inject} from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { ModalController, IonModal } from '@ionic/angular';
import { FuncionesGenerales } from 'src/app/config/funciones/funciones';
import { InformacionPermiso } from 'src/app/servicios/informacionpermiso.service';
import { Constantes } from 'src/app/config/constantes/constantes';
import { NotificacionesService } from 'src/app/servicios/notificaciones.service';
import { DatosEmpleadosService } from 'src/app/servicios/datosEmpleados.service';
import { ValidacionPermisosService } from 'src/app/servicios/validacion-permisos.service';
import { Item } from '../../../../componentes/UI/types';
import { RxReactiveFormsModule } from '@rxweb/reactive-form-validators';
import { TypeaheadModule } from 'src/app/componentes/UI/typehead/typehead.module';
import { ValidarPermiso, LogAccion } from 'src/app/utils/permisos.decorators';

@Component({
	selector: 'app-agregar-solicitar-permisos',
	templateUrl: './agregar-solicitar-permisos.component.html',
	styleUrls: ['./agregar-solicitar-permisos.component.scss'],
	standalone: true,
	imports: [
		CommonModule,
		IonicModule,
		FormsModule,
		ReactiveFormsModule,
		RxReactiveFormsModule,
		TypeaheadModule
	]
})

export class AgregarSolicitarPermisosComponent implements OnInit {

	@Input() ausentimos: Array<{ id: string; nombre: string }> = [];
	@Input() enfermedades: Item[] = [];
	@ViewChild('modal', { static: true }) ionModal!: IonModal;

	tipoCalculo = Constantes.tipoCalculo;
	rutaGeneral = 'Autogestion/cSolicitudPermiso/';
	searching = true;
	datosSolicitudPermisos!: { formulario: FormGroup };
	datosForm: { [key: string]: any } = {};
	datosSeleccionados: { [key: string]: any } = {};
	divCie10 = {};
	selectedOption: string = '';
	fechaInicio: Date = new Date();
	fechaFin: Date = new Date();
	diferenciaDias: number = 0;
	search$ = new Subject<string>();
	selectedEnfermedadesText = '0 Items';
  	selectedEnfermedades: string[] = [];
	diasAusentismo: string = '';

	// Inyección del nuevo servicio de validación
	private validacionPermisosService = inject(ValidacionPermisosService);

	constructor(
		private modalController: ModalController,
		private informacionPermiso: InformacionPermiso,
		private notificacionService: NotificacionesService,
		private datosEmpleadosService: DatosEmpleadosService,
		private fb: FormBuilder
	) { 
		this.datosSolicitudPermisos = {
			formulario: this.fb.group({
			  TipoAusentismoId: ['', Validators.required],
			  FechaInicio: ['', Validators.required],
			  FechaFin: ['', Validators.required],
			  TipoCalculo: ['', Validators.required],
			  Dias: [''],
			  horas: [''],
			  Observacion: ['']
			})
		};
	}

	ngOnInit() {
		this.datosSolicitudPermisos = FuncionesGenerales.crearFormulario(this.informacionPermiso);
		//funcionalidad para que cuando se busque algo en el CIE10 espera y no haga la busqueda
		// de una y de tiempo de escribir lo que se desea buscar
		this.search$.pipe(
			debounceTime(600) // espera 600 milisegundos antes de hacer la busqueda
		).subscribe(term => {
			if(term !== ''){
				this.obtenerInformacion('enfermedades', '', { search: term }); // Aquí llamas a la función para obtener los datos
			}
		});
	}

	cerrarModal(datos?: any) {
		this.modalController.dismiss(datos);
	}

	/**
	 * Valida y envía los datos del formulario de solicitud de permisos
	 * Requiere permiso 60010083 (Crear solicitudes de permiso)
	 */
	@ValidarPermiso(60010083, 'crear solicitudes de permiso')
	@LogAccion('Creación de solicitud de permiso')
	async submitData() {
		const camposObligatorios = ['TipoAusentismoId', 'FechaInicio', 'FechaFin', 'TipoCalculo'];
		let formularioValido = true;
		
		// Validar campos obligatorios
		camposObligatorios.forEach((campo) => {
			const control = this.datosSolicitudPermisos.formulario.get(campo);
			if (control && control.invalid) {
				formularioValido = false;
				control.markAsTouched(); // Marcar el campo como tocado para mostrar errores
			}
		});
	
		if (!formularioValido) {
			this.notificacionService.notificacion('Por favor, complete todos los campos obligatorios marcados con *.');
			return false;
		}

		try {
			// Validación adicional de permisos antes de procesar
			const validacion = await this.validacionPermisosService.validarPermisoParaAccion(
				60010083, 
				'crear esta solicitud de permiso'
			);

			if (!validacion.valido) {
				this.notificacionService.notificacion(validacion.mensaje);
				
				// Activar redirección automática
				setTimeout(() => {
					this.validacionPermisosService.manejarFaltaDePermisos(validacion.mensaje);
				}, 1500);
				
				return false;
			}
	
			// Procesar datos si todo es válido
			this.datosForm = { ...this.datosSolicitudPermisos.formulario.value };
	
			// Agregar códigos CIE10 seleccionados
			this.datosForm['cie10'] = this.selectedEnfermedades;
	
			Object.keys(this.datosSeleccionados).forEach((key) => {
				this.datosForm[key] = this.datosSeleccionados[key];
			});

			// Limpiar y validar datos antes de enviar
			this.datosForm = this.limpiarDatosParaEnvio(this.datosForm);

			// Log detallado para debugging
			console.log('📝 Datos procesados para enviar al servidor:', {
				datosFormulario: this.datosForm,
				formularioOriginal: this.datosSolicitudPermisos.formulario.value,
				cie10Seleccionados: this.selectedEnfermedades,
				datosSeleccionados: this.datosSeleccionados,
				timestamp: new Date().toISOString()
			});
	
			// Enviar los datos y cerrar el modal
			this.cerrarModal(this.datosForm);
			this.datosSolicitudPermisos.formulario.reset();
			this.datosSolicitudPermisos.formulario.markAsUntouched();

			return true;

		} catch (error) {
			console.error('Error al procesar solicitud de permiso:', error);
			this.notificacionService.notificacion('Error al procesar la solicitud.');

			// En caso de error, también activar redirección
			setTimeout(() => {
				this.validacionPermisosService.manejarFaltaDePermisos('Error al procesar la solicitud');
			}, 1500);
			
			return false;
		}
	}

	/**
	 * Limpia y valida los datos antes de enviarlos al servidor
	 */
	private limpiarDatosParaEnvio(datos: any): any {
		const datosLimpios = { ...datos };

		// Validar y limpiar fechas
		if (datosLimpios.FechaInicio) {
			datosLimpios.FechaInicio = this.formatearFecha(datosLimpios.FechaInicio);
		}
		if (datosLimpios.FechaFin) {
			datosLimpios.FechaFin = this.formatearFecha(datosLimpios.FechaFin);
		}

		// Validar campos numéricos
		if (datosLimpios.TipoAusentismoId) {
			datosLimpios.TipoAusentismoId = parseInt(datosLimpios.TipoAusentismoId, 10);
		}

		// Validar horas y días
		if (datosLimpios.horas) {
			datosLimpios.horas = parseFloat(datosLimpios.horas) || 0;
		}
		if (datosLimpios.dias) {
			datosLimpios.dias = parseInt(datosLimpios.dias, 10) || 0;
		}

		// Asegurar que CIE10 sea un array válido
		if (!Array.isArray(datosLimpios.cie10)) {
			datosLimpios.cie10 = [];
		}

		// Remover campos vacíos o inválidos
		Object.keys(datosLimpios).forEach(key => {
			if (datosLimpios[key] === null || datosLimpios[key] === undefined || datosLimpios[key] === '') {
				delete datosLimpios[key];
			}
		});

		console.log('🧹 Datos limpiados:', datosLimpios);
		return datosLimpios;
	}

	/**
	 * Formatea fecha para envío al servidor
	 */
	private formatearFecha(fecha: string): string {
		if (!fecha) return '';
		
		try {
			// Si la fecha viene en formato ISO, extraer solo la parte de fecha
			if (fecha.includes('T')) {
				return fecha.split('T')[0];
			}
			
			// Si viene en formato DD-MM-YYYY, convertir a YYYY-MM-DD
			if (fecha.includes('-') && fecha.length === 10) {
				const partes = fecha.split('-');
				if (partes.length === 3 && partes[0].length === 2) {
					// Formato DD-MM-YYYY -> YYYY-MM-DD
					return `${partes[2]}-${partes[1]}-${partes[0]}`;
				}
			}
			
			return fecha;
		} catch (error) {
			console.error('Error al formatear fecha:', fecha, error);
			return fecha;
		}
	}
	

	confirmarInicio(event: Event){
		const inputElement = document.getElementById('Fechainicio') as HTMLInputElement;
		const fechanacselect = document.getElementById('selectFechaInicio') as HTMLInputElement;
		const inputSelect = inputElement.value;
		this.datosSolicitudPermisos.formulario.patchValue({ FechaInicio: inputSelect.split('T')[0] });
		fechanacselect.value = inputSelect.split('T')[0];
		this.validateEndDate();
	}
	confirmarFin(event: Event){
		const inputElement = document.getElementById('FechaFin') as HTMLInputElement;
		const fechanacselect = document.getElementById('selectFechaFin') as HTMLInputElement;
		const inputSelect = inputElement.value;
		this.datosSolicitudPermisos.formulario.patchValue({ FechaFin: inputSelect.split('T')[0] });
		fechanacselect.value = inputSelect.split('T')[0];
		this.validateEndDate();
	}

	validateEndDate() {
		const fechaInicio = this.datosSolicitudPermisos.formulario.get('FechaInicio')?.value;
		const fechaFin = this.datosSolicitudPermisos.formulario.get('FechaFin')?.value;
		if (fechaInicio && fechaFin && new Date(fechaFin) < new Date(fechaInicio)) {
			this.notificacionService.notificacion('La fecha de fin no puede ser inferior a la fecha de inicio.');
			this.datosSolicitudPermisos.formulario.patchValue({ FechaFin: '' });
			const fechanacselect = document.getElementById('selectFechaFin') as HTMLInputElement;
			fechanacselect.value = '';
		}
	}

	onSelectChange(){
		const diasAusentismo: any = document.getElementById('diasAusentismo') as HTMLInputElement;
		const horasAusentismo = document.getElementById('horasAusentismo') as HTMLInputElement;
		const selectFechaInicio = document.getElementById('selectFechaInicio') as HTMLInputElement;
		const selectFechaFin = document.getElementById('selectFechaFin') as HTMLInputElement;

		if (selectFechaInicio.value !== '' && selectFechaFin.value !== '') {
			//hacemos el calculo de las fechas para saber cuantos dias son
			this.fechaInicio = this.parsearFecha(selectFechaInicio.value);
			this.fechaFin = this.parsearFecha(selectFechaFin.value);
			const diferenciaMilisegundos = this.fechaFin.getTime() - this.fechaInicio.getTime();
			this.diferenciaDias = Math.floor(diferenciaMilisegundos / (1000*60*60*24))+1;
			if (this.selectedOption === 'D') {
				diasAusentismo.value= this.diferenciaDias;
				horasAusentismo.setAttribute('disabled','true');
			}else if (this.selectedOption === 'H') {
				diasAusentismo.value= 0;
				horasAusentismo.removeAttribute('disabled');
			}
		}else{
			this.notificacionService.notificacion('Los campos de fecha inicio y fecha fin no pueden estar vacios');
			this.selectedOption='';
		}
	}

	parsearFecha(fechaStr: string): Date{
		const [ano,mes,dia]=fechaStr.split('-').map(Number);
		return new Date(ano,mes-1,dia);
	}

	searchbarInput(term: string): void {
		this.search$.next(term); // Envía el término al Subject, que luego lo pasa por debounceTime
	}

	obtenerInformacion(metodo: string, funcion: string, datos: any) {
		this.datosEmpleadosService.informacion(datos, 'Autogestion/cSolicitudPermiso/' + metodo).then(resp => {
			this.enfermedades = resp.datos || [] ;
		}).catch(err => {
			console.error('Error al obtener la información:', err);
		});
	}

	enfermedadesSelectionChanged(selected: string[]) {
		this.selectedEnfermedades = selected;
		this.selectedEnfermedadesText = this.formatData(this.selectedEnfermedades);
	}

	// Formatear el texto para mostrar los ítems seleccionados
	private formatData(data: string[]): string {
		return data.length > 0 ? `${data.length} items seleccionados` : 'No hay selección';
	}
}
