import { Component, inject } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { ValidacionPermisosService } from './servicios/validacion-permisos.service';
import { Router } from '@angular/router';
import { Platform } from '@ionic/angular';

@Component({
	selector: 'app-root',
	templateUrl: 'app.component.html',
	styleUrls: ['app.component.scss'],
	standalone: false
})
export class AppComponent {
	
	private validacionPermisosService = inject(ValidacionPermisosService);
	private router = inject(Router);
	private platform = inject(Platform);

	constructor(private storage: Storage) { }

	async ngOnInit() {
		try {
			// 1. Inicializar storage PRIMERO
			await this.storage.create();
			
			// 2. Esperar a que la plataforma esté lista
			await this.platform.ready();
			
			// 3. Validar permisos después de que todo esté inicializado
			await this.validarPermisosIniciales();
			
		} catch (error) {
			console.error('Error al inicializar la aplicación:', error);
		}
	}

	/**
	 * Valida permisos cuando la aplicación se inicia
	 */
	private async validarPermisosIniciales(): Promise<void> {
		try {
			// Solo validar si no estamos en login o rutas públicas
			const rutaActual = this.router.url;
			const rutasPublicas = ['/login', '/forget-password', '/', '/home'];
			
			const esRutaPublica = rutasPublicas.some(ruta => 
				rutaActual === ruta || rutaActual.startsWith(ruta)
			);
			
			if (esRutaPublica) {
				return;
			}

			
			// Inicializar el servicio de validación de permisos
			await this.validacionPermisosService.inicializar();
			
			// Dar un pequeño delay para asegurar que todo esté inicializado
			await new Promise(resolve => setTimeout(resolve, 200));
			
			// Intentar validar permisos
			const permisosValidos = await this.validacionPermisosService.validarPermisosAlIniciar();
			
			if (!permisosValidos) {
				this.router.navigateByUrl('/login');
			}
			
		} catch (error) {
			console.error('Error al validar permisos iniciales:', error);
			// En caso de error, no redirigir automáticamente para evitar loops
		}
	}
}
