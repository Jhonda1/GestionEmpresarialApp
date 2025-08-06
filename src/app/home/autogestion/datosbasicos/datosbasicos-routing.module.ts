import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DatosbasicosPage } from './datosbasicos.page';

const routes: Routes = [
  {
    path: '',
    component: DatosbasicosPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DatosbasicosPageRoutingModule {}
