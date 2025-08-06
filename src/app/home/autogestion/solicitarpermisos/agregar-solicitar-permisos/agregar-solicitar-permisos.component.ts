import { Component, Input, OnInit, ViewChild} from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { ModalController, IonModal } from '@ionic/angular';
import { FuncionesGenerales } from 'src/app/config/funciones/funciones';
import { InformacionPermiso } from 'src/app/servicios/informacionpermiso.service';
import { Constantes } from 'src/app/config/constantes/constantes';
import { NotificacionesService } from 'src/app/servicios/notificaciones.service';
import { DatosEmpleadosService } from 'src/app/servicios/datosEmpleados.service';
import { Item } from '../../../../componentes/UI/types';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
	selector: 'app-agregar-solicitar-permisos',
	templateUrl: './agregar-solicitar-permisos.component.html',
	styleUrls: ['./agregar-solicitar-permisos.component.scss'],
  standalone: false
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

	submitData() {
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
			return;
		}
	
		// Procesar datos si todo es válido
		this.datosForm = { ...this.datosSolicitudPermisos.formulario.value };
	
		// Agregar códigos CIE10 seleccionados
		this.datosForm['cie10'] = this.selectedEnfermedades;
	
		Object.keys(this.datosSeleccionados).forEach((key) => {
			this.datosForm[key] = this.datosSeleccionados[key];
		});
	
		// Enviar los datos y cerrar el modal
		this.cerrarModal(this.datosForm);
		this.datosSolicitudPermisos.formulario.reset();
		this.datosSolicitudPermisos.formulario.markAsUntouched();
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
