import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SolicitarpermisosPage } from './solicitarpermisos.page';

const routes: Routes = [
  {
    path: '',
    component: SolicitarpermisosPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SolicitarpermisosPageRoutingModule {}
