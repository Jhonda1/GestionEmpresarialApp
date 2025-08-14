import { Injectable, inject } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { PermisosHelperService } from '../servicios/permisos-helper.service';

/**
 * Guard que valida permisos y recarga automáticamente si no los tiene
 * Configurar en las rutas con el permiso requerido en data
 */
@Injectable({
  providedIn: 'root'
})
export class PermisosGuard implements CanActivate {

  private permisosHelper = inject(PermisosHelperService);
  private router = inject(Router);

  async canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean> {
    
    // Obtener el permiso requerido desde la configuración de la ruta
    const permisoRequerido = route.data['permiso'] as number;
    const nombreRuta = route.data['nombreRuta'] as string || state.url;

    if (!permisoRequerido) {
      console.warn('Guard configurado sin permiso requerido para la ruta:', state.url);
      return true; // Permitir acceso si no está configurado
    }

    try {
      // Usar el helper para validar permisos
      const tienePermiso = await this.permisosHelper.validarPermisoRuta(
        permisoRequerido,
        nombreRuta
      );

      return tienePermiso;
    } catch (error) {
      console.error('Error en guard de permisos:', error);
      // En caso de error, redirigir a datos básicos como primera opción
      this.router.navigateByUrl('/modulos/datosbasicos');
      return false;
    }
  }
}

/*
 * EJEMPLO DE USO EN ROUTING:
 * 
 * const routes: Routes = [
 *   {
 *     path: 'empleados',
 *     component: EmpleadosComponent,
 *     canActivate: [PermisosGuard],
 *     data: { 
 *       permiso: 600100,
 *       nombreRuta: 'Gestión de Empleados'
 *     }
 *   },
 *   {
 *     path: 'gastos',
 *     component: GastosComponent,
 *     canActivate: [PermisosGuard],
 *     data: { 
 *       permiso: 500100,
 *       nombreRuta: 'Gestión de Gastos'
 *     }
 *   }
 * ];
 */
