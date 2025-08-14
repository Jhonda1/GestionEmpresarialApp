import { Component, Input, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DatosEmpleadosService } from 'src/app/servicios/datosEmpleados.service';
import { Constantes } from 'src/app/config/constantes/constantes';
import { IonAccordionGroup, IonModal, Platform} from '@ionic/angular';
import { NotificacionesService } from 'src/app/servicios/notificaciones.service';
import { RxFormGroup, RxReactiveFormsModule } from '@rxweb/reactive-form-validators';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { FuncionesGenerales } from 'src/app/config/funciones/funciones';
import { LoginService } from 'src/app/servicios/login.service';
import { StorageService } from 'src/app/servicios/storage.service';
import { FormGroup, FormControl} from '@angular/forms';
import { DatosAusentismosService } from 'src/app/servicios/datosAusentismo.service';
import { Item } from '@app/componentes/UI/types';
import { HeaderComponent } from 'src/app/componentes/header/header.component';
import { TypeaheadModule } from 'src/app/componentes/UI/typehead/typehead.module';
import { ValidacionPermisosService } from 'src/app/servicios/validacion-permisos.service';
import { ValidarPermiso, PermisosUtils } from 'src/app/utils/permisos.decorators';

interface Empleado {
  id: number;
  nombre: string;
  documento?: number ;
  sueldo: number;
  cargo: string;
}

interface Area {
  id: string; // o number, dependiendo de tu estructura de datos
  nombre: string;
}

interface Ausentismo {
  id: string; // o number
  nombre: string;
}

@Component({
	selector: 'app-registroausentismo',
	templateUrl: './registroausentismo.page.html',
	styleUrls: ['./registroausentismo.page.scss'],
	standalone: true,
	imports: [
		CommonModule,
		IonicModule,
		FormsModule,
		ReactiveFormsModule,
		RxReactiveFormsModule,
		HeaderComponent,
		TypeaheadModule
	]
})
// eslint-disable-next-line @typescript-eslint/naming-convention
export class registroausentismoPage implements OnInit, OnDestroy {
	[key: string]: any;
	@ViewChild(IonAccordionGroup, { static: true }) accordionGroup!: IonAccordionGroup;
	@ViewChild('modalFechaSolicitudesInicio') modalFechaSolicitudesInicio!: IonModal;
	@ViewChild('modalFechaSolicitudesFin') modalFechaSolicitudesFin!: IonModal;
	@ViewChild('modal', { static: true }) modal!: IonModal;
  	@Input() enfermedades: Item[] = [];


	tipoCalculo = Constantes.tipoCalculo;
	escalaAusentismo = Constantes.escalaAusentismo;
  	segur: Array<object> = [];
	src: any;
	base64Img: any;
	pdfObj: any;
	datosUsuario: { num_docu?: number; SEGUR?: Array<object> } = {};
	base64 = '';
	rutaGeneral = 'Autogestion/cAusentismoAutoGestion/';
	selectedOption: string = '';
	selectedOptionHoras: any;
	diasAusentismo: any;
	horasAusentismo: any;
	costoAusentismo: any;
	precioHoraLaboral: any;
	totalHorasAusente: any;
	fechaInicio: Date | undefined;
	fechaFin: Date | undefined;
	diferenciaDias: number = 0;
	terceroId: number = 0;
	searching = true;
	subject = new Subject();
	empleado: Empleado | null = null;
	areas: Area[] = [];
  	ausentismo: Ausentismo[] = [];
	selectedFiles: File[] = [];
	grado: string = '';
	tipoausentismoId: string = '';
	areaId: string = '';
	datosForm = {};
	datosSeleccionados = {};
	ausentismoForm= new FormGroup({
		areaId: new FormControl(),
		grado: new FormControl(),
		fechainicio: new FormControl(),
		fechafin: new FormControl(),
		tiposausentismoid: new FormControl(),
		cie10: new FormControl(),
		observacion: new FormControl(),
		horas_dia_laboradas: new FormControl(),
		dias: new FormControl(),
		TipoCalculo: new FormControl(),
		horas: new FormControl(),
		total_horas: new FormControl(),
		costo_hora: new FormControl(),
		costo_total: new FormControl(),
	});
	cambiovalor: boolean = false;
	guardarAusentismoPermiso = false;
	permisoRegistrar = false; // 6001009 - Registro de Ausentismo
	divCie10 = {};
	selectedEnfermedadesText = '0 Items';
  	selectedEnfermedades: string[] = [];
	search$ = new Subject<string>();

	datosFormulario!: { formulario: RxFormGroup, propiedades: Array<string> };
	datosFormularioEnvio!: { formulario: RxFormGroup, propiedades: Array<string> };

	constructor(
		private datosEmpleadosService: DatosEmpleadosService,
		public platform: Platform,
		private notificacionService: NotificacionesService,
		private loginService: LoginService,
		private storage: StorageService,
		private datosAusentismo: DatosAusentismosService,
		private validacionPermisosService: ValidacionPermisosService,
	) { }
	ngOnInit() {
		this.datosFormulario = FuncionesGenerales.crearFormulario(this.datosEmpleadosService);
		this.datosFormularioEnvio = FuncionesGenerales.crearFormulario(this.datosAusentismo);
		this.obtenerUsuario();
		this.validarPermisosIniciales();

		//funcionalidad para que cuando se busque algo en el CIE10 espera y no haga la busqueda
		// de una y de tiempo de escribir lo que se desea buscar
		this.search$.pipe(
			debounceTime(600) // Espera 600 ms después de la última entrada del usuario
		).subscribe(term => {
			if(term !== ''){
				this.obtenerInformacion('enfermedades', '', { search: term }); // Aquí llamas a la función para obtener los datos
			}
		});
	}

	private validarPermisosIniciales() {
		// Validar permiso para registro de ausentismo (6001009)
		this.permisoRegistrar = this.validacionPermisosService.validarPermisoLocal(6001009);
	}

	ngOnDestroy() {
		this.subject.next(true);
		this.subject.complete();
		this.search$.next('');
		this.search$.complete();
	}

	ionViewDidEnter() {
		this.obtenerDatosEmpleado(this.terceroId);
		this.obtenerInformacion('obtenerDatosSelects', 'obtenerSelect');
	}

	async obtenerUsuario() {
		this.datosUsuario = await this.loginService.desencriptar(
			JSON.parse(await this.storage.get('usuario').then(resp => resp))
		);
		this.terceroId = this.datosUsuario['num_docu']!;
		this.segur = this.datosUsuario['SEGUR'] || [];
	}

	obtenerDatosEmpleado(event?: any) {
		this.datosEmpleadosService.informacion({documento: event}, `${this.rutaGeneral}cargarEmpleado`).then((resp: any) => {
			this.empleado= resp[0];
			this.irPermisos('ausentismoForm', 'RC');
			this.segur = this.datosUsuario['SEGUR'] || [];

		}).catch(error => console.log('Error ', error));

	}

	irPermisos(form: string, tipo: string) {
		const permisos = FuncionesGenerales.permisos(tipo) as { id: number; tipo: string; campo?: string }[];
		this.datosUsuario['SEGUR'] = permisos;
		permisos.forEach(({ id, campo }: any) => this.validarPermiso(id, form as keyof registroausentismoPage, campo));
	}

	validarPermiso(permiso: any, formulario: keyof registroausentismoPage, control: string) {
		if (this.segur.length > 0 && !this.segur.includes(permiso)) {
			this.cambiovalor = !this.cambiovalor;
			(this[formulario] as FormGroup).disable();
			this.guardarAusentismoPermiso = true;
		}
	}

	obtenerInformacion(metodo: string, funcion: string, datos: any = {}, event?: any) {
		// Validación imperativa para guardado de ausentismo
		if (metodo === 'guardarAnexo' && !PermisosUtils.validarPermisoImperativo(this.validacionPermisosService, this.notificacionService, 6001009)) {
			if (event) { event.target.complete(); }
			return;
		}

		this.searching = true;
		this.datosEmpleadosService.informacion(datos, this.rutaGeneral + metodo).then(resp => {
			this.areas = resp.areas;
			this.ausentismo = resp.tiposAusentismo;
			if (resp.success) {
				this[funcion](resp);
			}
			this.searching = false;
			if (event) {
				event.target.complete();
			}
		}, console.error).catch(err => {
			console.log('Error ', err);
			this.searching = false;
			if (event) {
				event.target.complete();
			}
		});
	}

	confirmarInicio(){
		const inputElement = document.getElementById('fechainicio') as HTMLInputElement;
		const fechanacselect = document.getElementById('selectfechainicio') as HTMLInputElement;
		const inputSelect = inputElement.value;
		fechanacselect.value = inputSelect.split('T')[0];
		this.ausentismoForm.get('fechainicio')?.setValue(inputSelect.split('T')[0]);
		this.ausentismoForm.get('fechainicio')?.markAsDirty();
		this.ausentismoForm.get('fechainicio')?.updateValueAndValidity();
	}

	confirmarFin(){
		const inputElement = document.getElementById('fechafin') as HTMLInputElement;
		const fechanacselect = document.getElementById('selectfechafin') as HTMLInputElement;
		const inputSelect = inputElement.value;
		fechanacselect.value = inputSelect.split('T')[0];
		this.ausentismoForm.get('fechafin')?.setValue(inputSelect.split('T')[0]);
		this.ausentismoForm.get('fechafin')?.markAsDirty();
		this.ausentismoForm.get('fechafin')?.updateValueAndValidity();
	}

	onSelectChange() {
		this.diasAusentismo = '';
		this.horasAusentismo = '';
		this.costoAusentismo = '';
		this.totalHorasAusente = '';
		this.precioHoraLaboral = '';
		const horasAusentismo = document.getElementById('horasAusentismo') as HTMLInputElement;
		const horasLaborales = document.getElementById('HorasLaborales') as HTMLInputElement;
		horasLaborales.value = ''; 
		const diasAusentismo: any = document.getElementById('diasAusentismo') as HTMLInputElement;
		const selectfechainicio = document.getElementById('selectfechainicio') as HTMLInputElement;
		const selectfechafin = document.getElementById('selectfechafin') as HTMLInputElement;
		
		if (selectfechainicio.value !== '' && selectfechafin.value !== '') {
			//hacemos el calculo de las fechas para saber cuantos dias son
			this.fechaInicio = this.parsearFecha(selectfechainicio.value);
			this.fechaFin = this.parsearFecha(selectfechafin.value);
			const diferenciaMilisegundos = this.fechaFin.getTime() - this.fechaInicio.getTime();
			this.diferenciaDias = Math.floor(diferenciaMilisegundos / (1000*60*60*24))+1;
			horasLaborales.removeAttribute('disabled');
			if (this.selectedOption === 'D') {
				horasAusentismo.setAttribute('readonly','true');
				diasAusentismo.value = this.diferenciaDias;
				this.diasAusentismo = this.diferenciaDias;
				this.horasAusentismo = 0;
			}else if (this.selectedOption === 'H') {
				horasAusentismo.removeAttribute('readonly');
				diasAusentismo.value= 0;
				this.totalHorasAusente =0;
				this.costoAusentismo =0;
			}
		}else{
			this.notificacionService.notificacion('Los campos de fecha inicio y fecha fin no pueden estar vacios');
			this.selectedOption='';
		}
	}

	onSelectChangeHoras(){
		const precioHoraLaboral: any = document.getElementById('PrecioHoraLaboral') as HTMLInputElement;
		const totalHorasAusente: any = document.getElementById('totalHorasAusente') as HTMLInputElement;
		const precioHora = this.empleado ? this.empleado['sueldo'] / 30 : 0;
		const precio = precioHora.toFixed(2);
		const totalPrecioHoras = parseFloat(precio)/ (this.selectedOptionHoras || 1);
		precioHoraLaboral.value = totalPrecioHoras.toFixed(2);
		this.ausentismoForm.get('costo_hora')?.setValue(totalPrecioHoras.toFixed(2));
		if (this.selectedOption === 'D') {
			const totalHoras = (this.diasAusentismo || 0) * (this.selectedOptionHoras || 0);
			totalHorasAusente.value = totalHoras;
			this.ausentismoForm.get('total_horas')?.setValue(totalHoras);
			this.costoAusentismo = totalHoras * totalPrecioHoras;
			this.ausentismoForm.get('costo_total')?.setValue(this.costoAusentismo);
		}
	}

	onSelectChangeHorasAusentismo(){
		const precioHoraLaboral: any = document.getElementById('PrecioHoraLaboral') as HTMLInputElement;
		this.totalHorasAusente = this.horasAusentismo;
		this.costoAusentismo = this.horasAusentismo * precioHoraLaboral.value;
	}

	parsearFecha(fechaStr: string): Date{
		const [ano,mes,dia]=fechaStr.split('-').map(Number);
		return new Date(ano,mes-1,dia);
	}

	onFileSelected(event: any){
		const files: FileList = event.target.files;
		for (let i = 0; i < files.length; i++) {
			const file = files[i];
			this.selectedFiles.push(file);
		}
	}

	eliminarArchivo(file: File){
		const index = this.selectedFiles.indexOf(file);
		if (index !== -1) {
			this.selectedFiles.splice(index,1);
		}
	}

	getFileIcon(file: File): string {
		const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
		switch (fileExtension) {
			case 'jpg':
			case 'jpeg':
			case 'png':
				return '../../../../assets/images/img.png';
			case 'pdf':
				return '../../../../assets/images/pdf.png';
				// return pdf;
			case 'doc':
			case 'docx':
				return '../../../../assets/images/word.png';
				// return doc;
			case 'xls':
			case 'xlsx':
				return '../../../../assets/images/excel.png';
				// return excel;
			default:
				return '../../../../assets/images/default.png';
		}
	}

	@ValidarPermiso(6001009, 'guardar registro de ausentismo')
	async guardarDatos() {
		const camposObligatorios = ['areaId', 'fechainicio', 'fechafin', 'tiposausentismoid', 'observacion', 'TipoCalculo', 'horas_dia_laboradas'];
		let formularioValido = true;
	  
		// Validar campos obligatorios
		camposObligatorios.forEach((campo) => {
		  const control = this.ausentismoForm.get(campo);
		  if (control && control.invalid) {
			formularioValido = false;
			control.markAsTouched(); // Marcar el campo como tocado para mostrar errores
		  }
		});
	  
		if (formularioValido) {
		  // Extraer los códigos CIE10 de las enfermedades seleccionadas
		  const cie10Codes = this.selectedEnfermedades;
		  // Agregar los códigos CIE10 al formulario
		  this.ausentismoForm.value.cie10 = cie10Codes;
		  const datosAnexos: { [key: string]: object } = {};
		  if (this.selectedFiles.length > 0) {
			for (let i = 0; i < this.selectedFiles.length; i++) {
			  const archivo = this.selectedFiles[i];
			  try {
				const base64 = await this.getBase64(archivo);
				datosAnexos[` ${archivo.name}`] = {
				  ArchivoNombre: archivo.name,
				  TipoArchivo: archivo.type,
				  archivo: base64,
				};
			  } catch (error) {
				console.error('Error al convertir archivo a base64', error);
			  }
			}
		  }
	  
		  const datosEnviar: any = {
			...this.ausentismoForm.value,
			tercero_id: this.empleado?.id ?? 0,
			nombre: this.empleado?.nombre ?? '',
			num_docu: this.empleado?.documento ?? 0,
			salarioBase: this.empleado?.sueldo ?? 0,
		  };
		  if (Object.keys(datosAnexos).length > 0) {
			datosEnviar.anexos = datosAnexos;
		  }
	  
		  this.obtenerInformacion('guardarAnexo', 'guardarA', datosEnviar);
		  this.selectedEnfermedades = [];
		  this.selectedEnfermedadesText = '0 Items';
		} else {
		  this.notificacionService.notificacion('Diligencia todos los campos obligatorios.');
		}
	  }

	guardarA(resp: any){
		const anexos: any = document.getElementById('inputAnexos') as HTMLInputElement;
		this.ausentismoForm.reset();
		this.selectedFiles = [];
		anexos.value='';
		this.divCie10 = {};
		this.precioHoraLaboral = '';
		this.costoAusentismo = '';
		this.obtenerUsuario();
		this.obtenerDatosEmpleado(this.terceroId);
		this.obtenerInformacion('obtenerDatosSelects', 'obtenerSelect');
		this.notificacionService.notificacion(resp.mensaje);
	}

	getBase64(file: File): Promise<string> {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.readAsDataURL(file);
			reader.onload = function() {
				resolve(reader.result as string);
			};
			reader.onerror = function(error) {
				reject(error);
			};
		});
	}

	enfermedadesSelectionChanged(selected: string[]) {
		this.selectedEnfermedades = selected;
		this.selectedEnfermedadesText = this.formatData(this.selectedEnfermedades);
	}

	searchbarInput(term: string): void {
		this.search$.next(term); // Envía el término al Subject, que luego lo pasa por debounceTime
	}

	// Formatear el texto para mostrar los ítems seleccionados
	private formatData(data: string[]): string {
		return data.length > 0 ? `${data.length} items seleccionados` : 'No hay selección';
	}
}
