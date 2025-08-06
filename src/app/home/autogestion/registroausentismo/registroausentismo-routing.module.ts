import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { registroausentismoPage } from './registroausentismo.page';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

const routes: Routes = [
  {
    path: '',
    component: registroausentismoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes),FontAwesomeModule],
  exports: [RouterModule],
})
// eslint-disable-next-line @typescript-eslint/naming-convention
export class registroausentismoPageRoutingModule {}
