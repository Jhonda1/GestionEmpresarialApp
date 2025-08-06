/* eslint-disable @typescript-eslint/dot-notation */
/* eslint-disable @typescript-eslint/member-delimiter-style */
import { Component, Input, OnInit } from '@angular/core';
import { RxFormGroup } from '@rxweb/reactive-form-validators';
import { ModalController, } from '@ionic/angular';
import * as moment from 'moment';
import { InformacionFamiliar } from 'src/app/servicios/informacionfamiliar.service';
import { FuncionesGenerales } from 'src/app/config/funciones/funciones';

@Component({
	selector: 'app-agregar-familiar',
	templateUrl: './agregar-familiar.component.html',
	styleUrls: ['./agregar-familiar.component.scss'],
  standalone: false
})
export class AgregarFamiliarComponent implements OnInit {
	@Input() getTipoDocumento: Array<any> = [];
	@Input() getParentesco: Array<any> = [];
	@Input() permisos: Array<any> = [];
	datosFamiliar: { formulario: RxFormGroup, propiedades: Array<string> } = { formulario: {} as RxFormGroup, propiedades: [] };
	cambiovalor: boolean = false;
	cambiovalor2: boolean = false;
	maximoFechanacimiento = moment().format('YYYY-MM-DD');
	datosSeleccionados: { [key: string]: any } = {};

	constructor(
		private modalController: ModalController,
		private informacionFamiliar: InformacionFamiliar
	) { }

	ngOnInit() {
		this.datosFamiliar = FuncionesGenerales.crearFormulario(this.informacionFamiliar);
		this.validarPermiso();
	}

	cerrarModal(datos?: any) {
		this.modalController.dismiss(datos);
	}

	cambiosComponenteSelect(evento: any) {
		this.datosSeleccionados[evento.control] = evento.valor[evento.key];
		this.datosFamiliar.formulario.get(evento.key)?.setValue(evento.valor[evento.key]);
		const formData = this.datosFamiliar.formulario.getRawValue(); // Obtiene todos los valores, incluidos los `disabled`
		const isValid = Object.values(formData).every(value => value !== null && value !== '');
	}

	submitDataFamiliaContacto(tabla: string) {
		const form = Object.assign({}, this.datosFamiliar.formulario.value);
		Object.keys(this.datosSeleccionados).forEach(it => {
			form[it] = this.datosSeleccionados[it];
		});
		form['tabla'] = tabla;
		if (this.datosFamiliar.formulario.valid) {
			this.cerrarModal(form);
			this.datosFamiliar.formulario.reset();
			this.datosFamiliar.formulario.markAsUntouched();
		} else {
			FuncionesGenerales.formularioTocado(this.datosFamiliar.formulario);
		}
	}

	validarPermiso() {
		const permView = FuncionesGenerales.permisos('FI');
		permView.forEach(({ id, campo }: any) => {
			if (this.permisos.includes(id)) {
				this.datosFamiliar.formulario.get(campo)?.enable();
			} else {
				this.datosFamiliar.formulario.get(campo)?.disable();
				this.cambiovalor = !this.cambiovalor;
			}
		});
	}

	confirmar(){
		const inputElement = document.getElementById('selectFecha') as HTMLInputElement;
		const fechanacselect = document.getElementById('selectFecha2') as HTMLInputElement;
		let inputSelect = inputElement.value.split('T')[0];
		fechanacselect.value = inputSelect;
	}
}
