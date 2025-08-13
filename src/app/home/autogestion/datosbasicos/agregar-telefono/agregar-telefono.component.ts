import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular';
import { RxReactiveFormsModule, RxFormGroup } from '@rxweb/reactive-form-validators';
import { Constantes } from 'src/app/config/constantes/constantes';
import { FuncionesGenerales } from 'src/app/config/funciones/funciones';
import { InformacionTelefono } from 'src/app/servicios/informaciontelefono.service';

@Component({
	selector: 'app-agregar-telefono',
	templateUrl: './agregar-telefono.component.html',
	styleUrls: ['./agregar-telefono.component.scss'],
	standalone: true,
	imports: [
		CommonModule,
		FormsModule,
		ReactiveFormsModule,
		IonicModule,
		RxReactiveFormsModule
	]
})
export class AgregarTelefonoComponent implements OnInit {

	@Input() permisos: Array<any> = [];
	datosTelefono!: { formulario: RxFormGroup, propiedades: Array<string> };
	ppal = Constantes.ppal;
	datosSeleccionados: { [key: string]: any } = {};

	constructor(
		private modalController: ModalController,
		private informacionTelefono: InformacionTelefono,
	) { }

	ngOnInit() {
		this.datosTelefono = FuncionesGenerales.crearFormulario(this.informacionTelefono);
		this.validarPermiso();
	}

	cerrarModal(datos?: any) {
		this.modalController.dismiss(datos);
	}

	submitDataFamiliaContacto(tabla: any) {
		let form = Object.assign({}, this.datosTelefono.formulario.value);

		Object.keys(this.datosSeleccionados).forEach(it => {
			form[it] = this.datosSeleccionados[it];
		});
		form['tabla'] = tabla;
		if (this.datosTelefono.formulario.valid) {
			this.cerrarModal(form);
			this.datosTelefono.formulario.reset();
			this.datosTelefono.formulario.markAsUntouched();
		} else {
			FuncionesGenerales.formularioTocado(this.datosTelefono.formulario);
		}
	}

	validarPermiso() {
		let permView = FuncionesGenerales.permisos('DC');
		permView.forEach(({ id, campo }: any) => {
			this.datosTelefono.formulario.get(campo)?.disable();
			if (this.permisos.includes(id)) {
				this.datosTelefono.formulario.get(campo)?.enable();
			}
		});
	}

}
