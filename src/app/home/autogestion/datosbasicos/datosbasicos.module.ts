import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { DatosbasicosPageRoutingModule } from './datosbasicos-routing.module';
import { DatosbasicosPage } from './datosbasicos.page';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RxReactiveFormsModule } from '@rxweb/reactive-form-validators';
import { ComponentesModule } from '../../../componentes/componentes.module';
import { PipesModule } from 'src/app/pipes/pipes.module';
import { SelectAutogestionModule } from 'src/app/home/autogestion/select-autogestion/select-autogestion.module';
import { AgregarResidenciaComponent } from './agregar-residencia/agregar-residencia.component';
import { AgregarTelefonoComponent } from './agregar-telefono/agregar-telefono.component';
import { AgregarCorreoComponent } from './agregar-correo/agregar-correo.component';
import { AgregarEstudioComponent } from './agregar-estudio/agregar-estudio.component';
import { AgregarFamiliarComponent } from './agregar-familiar/agregar-familiar.component';

@NgModule({
	imports: [
		CommonModule,
		IonicModule,
		ReactiveFormsModule,
		RxReactiveFormsModule,
		DatosbasicosPageRoutingModule,
		ComponentesModule,
		PipesModule,
		FormsModule,
		SelectAutogestionModule
	],
	declarations: [
		DatosbasicosPage,
		AgregarResidenciaComponent,
		AgregarTelefonoComponent,
		AgregarCorreoComponent,
		AgregarEstudioComponent,
		AgregarFamiliarComponent,
	],
	exports: [
		SelectAutogestionModule
	]
})

export class DatosbasicosPageModule { }
