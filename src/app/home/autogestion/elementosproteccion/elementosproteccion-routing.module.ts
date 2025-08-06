import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ElementosproteccionPage } from './elementosproteccion.page';

const routes: Routes = [
  {
    path: '',
    component: ElementosproteccionPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ElementosproteccionPageRoutingModule {}
