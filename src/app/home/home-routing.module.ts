/* eslint-disable max-len */
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
	{
		path: 'inicio',
		loadChildren: () => import('./inicio/inicio.module').then(m => m.InicioPageModule)
	},
	{
		path: 'datosbasicos',
		loadChildren: () => import('./autogestion/datosbasicos/datosbasicos.module').then(m => m.DatosbasicosPageModule)
	},
  {
    path: 'solicitarvacaciones',
    loadChildren: () => import('./autogestion/solicitarvacaciones/solicitarvacaciones.module').then( m => m.SolicitarvacacionesPageModule)
  },
  {
    path: 'solicitarpermisos',
    loadChildren: () => import('./autogestion/solicitarpermisos/solicitarpermisos.module').then( m => m.SolicitarpermisosPageModule)
  },
  {
    path: 'certificados',
    loadChildren: () => import('./autogestion/certificados/certificados.module').then( m => m.CertificadosPageModule)
  },
  {
    path: 'registroausentismo',
    loadChildren: () => import('./autogestion/registroausentismo/registroausentismo.module').then( m => m.registroausentismoPageModule)
  },
  {
    path: 'elementosproteccion',
    loadChildren: () => import('./autogestion/elementosproteccion/elementosproteccion.module').then( m => m.elementosproteccionPageModule)
  },
  {
    path: 'gastos',
    loadChildren: () => import('./gastos/gastos.module').then( m => m.GastosPageModule)
  }
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class HomePageRoutingModule { }
