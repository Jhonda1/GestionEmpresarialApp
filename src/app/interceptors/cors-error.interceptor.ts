import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { NotificacionesService } from '../servicios/notificaciones.service';

/**
 * Interceptor para manejar errores CORS y de red de manera más robusta
 */
@Injectable()
export class CorsErrorInterceptor implements HttpInterceptor {

  constructor(private notificacionesService: NotificacionesService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        return this.manejarErrorCors(error);
      })
    );
  }

  private manejarErrorCors(error: HttpErrorResponse): Observable<never> {
    let mensaje = '';
    let esErrorImportante = false;

    // Detectar diferentes tipos de errores
    if (error.status === 0) {
      // Error de red o CORS
      if (error.error instanceof ProgressEvent) {
        mensaje = 'Error de conexión con el servidor. Verifique su conexión a internet o contacte al administrador.';
        console.error('🌐 Error CORS/Red detectado:', error);
      } else {
        mensaje = 'Error de red. Por favor, verifique su conexión a internet.';
      }
    } else if (error.status === -1) {
      // Error de timeout o conexión
      mensaje = 'Tiempo de espera agotado. El servidor no responde.';
      esErrorImportante = true;
    } else if (error.status === 500) {
      // Error interno del servidor
      mensaje = 'Error interno del servidor. Revise los datos enviados o contacte al administrador.';
      esErrorImportante = true;
      
      console.error('💥 Error 500 del servidor:', {
        url: error.url,
        message: error.message,
        error: error.error,
        timestamp: new Date().toISOString()
      });
    } else if (error.status === 400) {
      // Error de petición incorrecta
      mensaje = 'Datos de la petición incorrectos. Verifique los campos del formulario.';
      esErrorImportante = true;
    } else if (error.status === 404) {
      // Recurso no encontrado
      mensaje = 'El servicio solicitado no fue encontrado en el servidor.';
      esErrorImportante = true;
    } else if (error.message && error.message.includes('CORS')) {
      // Error CORS específico
      mensaje = 'Error de configuración del servidor (CORS). Contacte al administrador.';
    } else if (error.status >= 500 && error.status < 600) {
      // Otros errores del servidor
      mensaje = 'Error interno del servidor. Por favor, intente más tarde.';
      esErrorImportante = true;
    }

    // Solo mostrar notificación para errores importantes
    if (mensaje && esErrorImportante) {
      console.error('🚨 Error importante detectado:', {
        status: error.status,
        message: error.message,
        url: error.url,
        error: error.error,
        timestamp: new Date().toISOString()
      });

      this.notificacionesService.notificacion(mensaje);
    } else if (mensaje) {
      // Para errores menos críticos, solo loggear
      console.warn('⚠️ Error de red detectado:', {
        status: error.status,
        message: error.message,
        url: error.url
      });
    }

    // Re-lanzar el error para que otros interceptores puedan manejarlo
    return throwError(() => error);
  }
}
