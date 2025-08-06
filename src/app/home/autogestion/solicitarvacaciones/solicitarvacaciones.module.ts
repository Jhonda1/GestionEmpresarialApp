import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';


import { RxReactiveFormsModule } from '@rxweb/reactive-form-validators';
import { ComponentesModule } from '../../../componentes/componentes.module';
import { PipesModule } from '../../../pipes/pipes.module';
// import { Camera } from '@ionic-native/camera/ngx';

// import { IonicSelectableModule } from 'ionic-selectable';
import { SelectAutogestionModule } from '../select-autogestion/select-autogestion.module';


import { SolicitarvacacionesPageRoutingModule } from './solicitarvacaciones-routing.module';

import { SolicitarvacacionesPage } from './solicitarvacaciones.page';
import { AgregarSolicitudVacacionesComponent } from './agregar-solicitud-vacaciones/agregar-solicitud-vacaciones.component';

@NgModule({
	imports: [
		CommonModule,
		IonicModule,
		ReactiveFormsModule,
		RxReactiveFormsModule,
		ComponentesModule,
		PipesModule,
		FormsModule,
		SolicitarvacacionesPageRoutingModule
	],
	declarations: [
		SolicitarvacacionesPage,
		AgregarSolicitudVacacionesComponent
	]
})
export class SolicitarvacacionesPageModule { }
