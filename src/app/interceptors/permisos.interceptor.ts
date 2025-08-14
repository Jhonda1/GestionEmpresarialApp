import { Injectable, inject } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap, timeout } from 'rxjs/operators';
import { ValidacionPermisosService } from '../servicios/validacion-permisos.service';
import { NotificacionesService } from '../servicios/notificaciones.service';
import { Router } from '@angular/router';

/**
 * Interceptor para validar permisos antes de operaciones críticas
 * y manejar respuestas de "sin permisos" del backend
 */
@Injectable()
export class PermisosInterceptor implements HttpInterceptor {

  private validacionPermisosService = inject(ValidacionPermisosService);
  private notificacionesService = inject(NotificacionesService);
  private router = inject(Router);

  // URLs que requieren validación de permisos antes de la petición
  private readonly URLS_CRITICAS = [
    '/guardar',
    '/crear',
    '/actualizar',
    '/eliminar',
    '/modificar',
    '/cambiar'
  ];

  // Mapeo de URLs a permisos requeridos
  private readonly MAPEO_PERMISOS: { [key: string]: number } = {
    // Datos básicos
    'Empleados/guardarInformacionPersonal': 6001006,
    'Empleados/guardarInformacionContacto': 6001006,
    'Empleados/guardarInformacionFamiliar': 6001006,
    
    // Solicitar permisos
    'Empleados/guardarSolicitudPermiso': 60010083,
    'Empleados/eliminarSolicitudPermiso': 60010083,
    
    // Certificados
    'Empleados/generarCertificado': 6001007,
    
    // Gastos
    'Gastos/guardar': 500100,
    'Gastos/actualizar': 500100,
    'Gastos/eliminar': 500100,
    
    // Vacaciones
    'Empleados/solicitarVacaciones': 6001008,
    
    // Ausentismo
    'Empleados/registrarAusentismo': 6001009
  };

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    
    // Solo procesar si es una operación crítica
    if (this.esOperacionCritica(req.url)) {
      return this.validarPermisoAntesDePeticion(req, next);
    }

    // Para peticiones normales, solo manejar errores de permisos del backend
    return next.handle(req).pipe(
      timeout(30000), // 30 segundos timeout
      catchError((error: HttpErrorResponse) => this.manejarErrorPermisos(error))
    );
  }

  /**
   * Verifica si la URL requiere validación de permisos
   */
  private esOperacionCritica(url: string): boolean {
    return this.URLS_CRITICAS.some(urlCritica => url.includes(urlCritica)) ||
           Object.keys(this.MAPEO_PERMISOS).some(endpoint => url.includes(endpoint));
  }

  /**
   * Valida permisos antes de enviar la petición
   */
  private validarPermisoAntesDePeticion(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const permisoRequerido = this.obtenerPermisoRequerido(req.url);
    
    if (!permisoRequerido) {
      // Si no se encuentra un permiso específico, permitir la petición
      // (el backend validará)
      return next.handle(req).pipe(
        catchError((error: HttpErrorResponse) => this.manejarErrorPermisos(error))
      );
    }

    // Usar switchMap para convertir la Promise en Observable
    return new Observable(observer => {
      this.validacionPermisosService.validarPermisoParaAccion(
        permisoRequerido, 
        'realizar esta operación'
      ).then(resultado => {
        if (!resultado.valido) {
          // Si no tiene permiso, mostrar mensaje y recargar
          this.notificacionesService.notificacion(resultado.mensaje);
          
          // Recargar página después de mostrar el mensaje
          setTimeout(() => {
            this.recargarPaginaPorPermisos();
          }, 2000);
          
          observer.error(new Error(`Sin permisos: ${resultado.mensaje}`));
          return;
        }

        // Si tiene permiso, continuar con la petición
        next.handle(req).pipe(
          catchError((error: HttpErrorResponse) => this.manejarErrorPermisos(error))
        ).subscribe({
          next: (event) => observer.next(event),
          error: (error) => observer.error(error),
          complete: () => observer.complete()
        });
      }).catch(error => {
        console.error('Error al validar permisos:', error);
        // En caso de error, mostrar mensaje y recargar
        this.notificacionesService.notificacion('Error al validar permisos.');
        setTimeout(() => {
          this.recargarPaginaPorPermisos();
        }, 2000);
        observer.error(error);
      });
    });
  }

  /**
   * Obtiene el permiso requerido para una URL específica
   */
  private obtenerPermisoRequerido(url: string): number | null {
    for (const [endpoint, permiso] of Object.entries(this.MAPEO_PERMISOS)) {
      if (url.includes(endpoint)) {
        return permiso;
      }
    }
    return null;
  }

  /**
   * Maneja errores relacionados con permisos del backend
   */
  private manejarErrorPermisos(error: HttpErrorResponse): Observable<never> {
    
    // Códigos de error relacionados con permisos
    if (error.status === 403 || error.status === 401) {
      let mensaje = 'No tiene permisos para realizar esta acción.';
      let debeRecargar = false;
      
      // Personalizar mensaje según el tipo de error
      if (error.error?.mensaje) {
        mensaje = error.error.mensaje;
      } else if (error.status === 401) {
        mensaje = 'Su sesión ha expirado. Por favor, inicie sesión nuevamente.';
        // Redirigir al login si la sesión expiró
        setTimeout(() => {
          this.router.navigateByUrl('/login');
        }, 2000);
      } else if (error.status === 403) {
        // Error 403 significa que no tiene permisos
        mensaje = 'No tiene permisos para realizar esta acción.';
        debeRecargar = true;
      }

      this.notificacionesService.notificacion(mensaje);
      
      // Si el backend dice que no tiene permisos, sincronizar
      if (error.error?.sincronizarPermisos) {
        this.validacionPermisosService.forzarActualizacionPermisos();
      }

      // Recargar página si no tiene permisos para la acción actual
      if (debeRecargar) {
        setTimeout(() => {
          this.recargarPaginaPorPermisos();
        }, 2000);
      }
    }

    // Si es un error de red o servidor
    if (error.status === 0 || error.status >= 500) {
      this.notificacionesService.notificacion(
        'Error de conexión. Verifique su conexión a internet e intente nuevamente.'
      );
    }

    return throwError(() => error);
  }

  /**
   * Redirige al usuario a datos básicos cuando se detecta falta de permisos
   * Datos básicos es la primera opción disponible en cualquier módulo
   */
  private recargarPaginaPorPermisos(): void {
    try {      
      // Redirigir a datos básicos que es la primera opción de cualquier módulo
      setTimeout(() => {
        this.router.navigateByUrl('/modulos/datosbasicos', { replaceUrl: true });
      }, 1500);
      
    } catch (error) {
      console.error('❌ Interceptor: Error al redirigir a datos básicos:', error);
      // Como fallback, redirigir a datos básicos usando window.location
      setTimeout(() => {
        window.location.href = '/modulos/datosbasicos';
      }, 1500);
    }
  }
}
