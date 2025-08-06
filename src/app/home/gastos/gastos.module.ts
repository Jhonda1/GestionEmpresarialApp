import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { GastosPageRoutingModule } from './gastos-routing.module';

import { GastosPage } from './gastos.page';
import { ComponentesModule } from '../../componentes/componentes.module';

@NgModule({
	imports: [
		CommonModule,
		FormsModule,
		IonicModule,
		GastosPageRoutingModule,
		ComponentesModule
	],
	declarations: [GastosPage]
})
export class GastosPageModule { }
