import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { SolicitarpermisosPageRoutingModule } from './solicitarpermisos-routing.module';
import { RxReactiveFormsModule } from '@rxweb/reactive-form-validators';
import { ComponentesModule } from 'src/app/componentes/componentes.module';
import { PipesModule } from 'src/app/pipes/pipes.module';
import { SolicitarpermisosPage } from './solicitarpermisos.page';
import { AgregarSolicitarPermisosComponent } from './agregar-solicitar-permisos/agregar-solicitar-permisos.component';
import { TypeaheadModule } from 'src/app/componentes/UI/typehead/typehead.module';

@NgModule({
	imports: [
		CommonModule,
		FormsModule,
		IonicModule,
		ReactiveFormsModule,
		RxReactiveFormsModule,
		ComponentesModule,
		PipesModule,
		SolicitarpermisosPageRoutingModule,
		TypeaheadModule
	],
	declarations: [SolicitarpermisosPage, AgregarSolicitarPermisosComponent]
})
export class SolicitarpermisosPageModule { }
