/* eslint-disable @typescript-eslint/naming-convention */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ComponentesModule } from '../../../componentes/componentes.module';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ElementosproteccionPageRoutingModule } from './elementosproteccion-routing.module';
import { ElementosproteccionPage } from './elementosproteccion.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ElementosproteccionPageRoutingModule,
    ComponentesModule,
    ReactiveFormsModule,
    FontAwesomeModule
  ],
  declarations: [ElementosproteccionPage]
})
export class elementosproteccionPageModule {}
