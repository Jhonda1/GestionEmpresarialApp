import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { RxFormGroup } from '@rxweb/reactive-form-validators';
import { Constantes } from 'src/app/config/constantes/constantes';
import { FuncionesGenerales } from 'src/app/config/funciones/funciones';
import { InformacionCorreo } from 'src/app/servicios/informacioncorreo.service';

@Component({
	selector: 'app-agregar-correo',
	templateUrl: './agregar-correo.component.html',
	styleUrls: ['./agregar-correo.component.scss'],
  standalone: false
})
export class AgregarCorreoComponent implements OnInit {

	@Input() permisos: Array<any> = [];
	datosCorreo!: { formulario: RxFormGroup, propiedades: Array<string> };
	ppal = Constantes.ppal;
	datosSeleccionados: { [key: string]: any } = {};

	constructor(
		private modalController: ModalController,
		private informacionCorreo: InformacionCorreo,
	) { }

	ngOnInit() {
		this.datosCorreo = FuncionesGenerales.crearFormulario(this.informacionCorreo);
		this.validarPermiso();
	}

	cerrarModal(datos?: any) {
		this.modalController.dismiss(datos);
	}

	submitDataFamiliaContacto(tabla: any) {
		let form = Object.assign({}, this.datosCorreo.formulario.value);

		Object.keys(this.datosSeleccionados).forEach(it => {
			form[it] = this.datosSeleccionados[it];
		});
		form['tabla'] = tabla;
		if (this.datosCorreo.formulario.valid) {
			this.cerrarModal(form);
			this.datosCorreo.formulario.reset();
			this.datosCorreo.formulario.markAsUntouched();
		} else {
			FuncionesGenerales.formularioTocado(this.datosCorreo.formulario);
		}
	}

	validarPermiso() {
		let permView = FuncionesGenerales.permisos('CC');
		permView.forEach(({ id, campo }: any) => {
			this.datosCorreo.formulario.get(campo)?.disable();
			if (this.permisos.includes(id)) {
				this.datosCorreo.formulario.get(campo)?.enable();
			}
		});
	}

}
