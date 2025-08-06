import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CertificadosPage } from './certificados.page';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

const routes: Routes = [
  {
    path: '',
    component: CertificadosPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes),FontAwesomeModule],
  exports: [RouterModule],
})
export class CertificadosPageRoutingModule {}
