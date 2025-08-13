import { Routes } from '@angular/router';
import { HomePage } from './home/home.page';
import { RutasAutenticadoGuard } from './config/guards/rutas-autenticado.guard';
import { RutasNoAutenticadoGuard } from './config/guards/rutas-no-autenticado.guard';

export const routes: Routes = [
	{
		path: 'login',
		canActivate: [RutasNoAutenticadoGuard],
		loadChildren: () => import('./login/login.module').then(m => m.LoginPageModule)
	},
	{
		path: 'modulos',
		component: HomePage,
		canActivate: [RutasAutenticadoGuard],
		children: [
			{
				path: '',
				loadChildren: () => import('./home/home.module').then(m => m.HomePageModule)
			}
		]
	},
	{
		path: '',
		redirectTo: '/login',
		pathMatch: 'full'
	},
	{
		path: 'forget-password/:id/:cargar',
		loadChildren: () => import('./forget-password/forget-password.module').then(m => m.ForgetPasswordPageModule)
	}
];
