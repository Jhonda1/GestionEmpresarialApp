import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { registroausentismoPageRoutingModule } from './registroausentismo-routing.module';
import { registroausentismoPage } from './registroausentismo.page';
import { RxReactiveFormsModule } from '@rxweb/reactive-form-validators';
import { ComponentesModule } from '../../../componentes/componentes.module';
import { PipesModule } from '../../../pipes/pipes.module';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TypeaheadModule } from 'src/app/componentes/UI/typehead/typehead.module';

@NgModule({
	imports: [
		CommonModule,
		FormsModule,
		IonicModule,
		registroausentismoPageRoutingModule,
		ReactiveFormsModule,
		RxReactiveFormsModule,
		ComponentesModule,
		FontAwesomeModule,
		PipesModule,
		TypeaheadModule

	],
	declarations: [registroausentismoPage],
	exports: [registroausentismoPage]
})
// eslint-disable-next-line @typescript-eslint/naming-convention
export class registroausentismoPageModule { }
