import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { HeaderComponent } from './header/header.component';
import { MenuComponent } from './menu/menu.component';


const COMPONENTES = [MenuComponent, HeaderComponent];

@NgModule({
	declarations: COMPONENTES,
	imports: [
		CommonModule,
		IonicModule
	],
	exports: COMPONENTES,
})
export class ComponentesModule { }
