import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { RxFormGroup, RxReactiveFormsModule } from '@rxweb/reactive-form-validators';
import { FuncionesGenerales } from 'src/app/config/funciones/funciones';
import { InformacionSolicitud } from 'src/app/servicios/informacionsolicitud.service';

@Component({
	selector: 'app-agregar-solicitud-vacaciones',
	templateUrl: './agregar-solicitud-vacaciones.component.html',
	styleUrls: ['./agregar-solicitud-vacaciones.component.scss'],
	standalone: true,
	imports: [
		CommonModule,
		IonicModule,
		FormsModule,
		ReactiveFormsModule,
		RxReactiveFormsModule
	]
})
export class AgregarSolicitudVacacionesComponent implements OnInit {

	@ViewChild('fechaInput', { static: false }) selectFechaInicio!: ElementRef<HTMLInputElement>;
	datosSolicitud!: { formulario: RxFormGroup, propiedades: Array<string> };
	datosForm: { [key: string]: any } = {};
	datosSeleccionados: { [key: string]: any } = {};
	popoverAbierto: string | null = null;

	constructor(
		private modalController: ModalController,
		private informacionSolicitud: InformacionSolicitud,
	) { }

	ngOnInit() {
		this.datosSolicitud = FuncionesGenerales.crearFormulario(this.informacionSolicitud);
	}

	abrirPopover(tipo: string) {
		this.popoverAbierto = tipo;
	  }

	cerrarModal(datos?: any) {
		this.modalController.dismiss(datos);
	}

	submitDataFamiliaContacto() {
		this.datosForm = Object.assign({}, this.datosSolicitud.formulario.value);
		Object.keys(this.datosSeleccionados).forEach(it => {
			this.datosForm[it] = this.datosSeleccionados[it];
		});
		this.cerrarModal(this.datosForm);
		this.datosSolicitud.formulario.reset();
		this.datosSolicitud.formulario.markAsUntouched();
	}

	confirmarInicio(event: any) {
		let fecha = event.detail.value; 
		fecha = fecha.split('T')[0]
		this.datosSolicitud.formulario.patchValue({ FechaInicio: fecha });
		this.popoverAbierto = null;
	  }
}
