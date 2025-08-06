import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SolicitarvacacionesPage } from './solicitarvacaciones.page';

const routes: Routes = [
  {
    path: '',
    component: SolicitarvacacionesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SolicitarvacacionesPageRoutingModule {}
