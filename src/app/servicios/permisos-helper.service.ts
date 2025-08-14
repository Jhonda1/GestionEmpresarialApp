import { Injectable, inject } from '@angular/core';
import { ValidacionPermisosService } from './validacion-permisos.service';
import { NotificacionesService } from './notificaciones.service';
import { Router } from '@angular/router';

/**
 * Servicio helper para manejo de permisos con recarga automática
 * Usar este servicio cuando quieras validar permisos y recargar automáticamente si no los tiene
 */
@Injectable({
  providedIn: 'root'
})
export class PermisosHelperService {

  private validacionPermisosService = inject(ValidacionPermisosService);
  private notificacionesService = inject(NotificacionesService);
  private router = inject(Router);

  /**
   * Valida un permiso antes de ejecutar una acción crítica
   * Si no tiene permisos, muestra mensaje y recarga la página automáticamente
   */
  async validarYEjecutar(
    permisoId: number,
    accion: () => Promise<void> | void,
    nombreAccion: string = 'realizar esta operación'
  ): Promise<boolean> {
    try {
      const tienePermiso = await this.validacionPermisosService.validarPermisoConRecarga(
        permisoId, 
        nombreAccion, 
        true
      );

      if (tienePermiso) {
        await accion();
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error al validar y ejecutar:', error);
      this.notificacionesService.notificacion('Error al procesar la solicitud');
      return false;
    }
  }

  /**
   * Valida un permiso silenciosamente (sin mostrar mensajes)
   * Útil para validaciones en ngOnInit o verificaciones rápidas
   */
  async validarSilencioso(permisoId: number): Promise<boolean> {
    try {
      const resultado = await this.validacionPermisosService.validarPermisoParaAccion(
        permisoId, 
        'acceder a esta sección'
      );
      return resultado.valido;
    } catch (error) {
      console.error('Error en validación silenciosa:', error);
      return false;
    }
  }

  /**
   * Valida permiso para acceder a un módulo/página
   * Si no tiene permisos, recarga automáticamente
   */
  async validarAccesoModulo(
    permisoId: number,
    nombreModulo: string
  ): Promise<boolean> {
    try {
      const tienePermiso = await this.validarSilencioso(permisoId);
      
      if (!tienePermiso) {
        this.manejarAccesoNoAutorizado(nombreModulo);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error al validar acceso al módulo:', error);
      this.manejarAccesoNoAutorizado(nombreModulo);
      return false;
    }
  }

  /**
   * Valida múltiples permisos para una vista compleja
   * Si falta alguno, recarga automáticamente
   */
  async validarPermisosMultiples(
    permisos: { id: number, nombre: string }[],
    nombreSeccion: string = 'esta sección'
  ): Promise<boolean> {
    try {
      for (const permiso of permisos) {
        const tienePermiso = await this.validarSilencioso(permiso.id);
        if (!tienePermiso) {
          this.manejarAccesoNoAutorizado(
            `${nombreSeccion} (permiso requerido: ${permiso.nombre})`
          );
          return false;
        }
      }
      return true;
    } catch (error) {
      console.error('Error al validar permisos múltiples:', error);
      this.manejarAccesoNoAutorizado(nombreSeccion);
      return false;
    }
  }

  /**
   * Valida permiso antes de mostrar un botón o elemento de UI
   * Retorna true/false sin recargar la página
   */
  async validarParaUI(permisoId: number): Promise<boolean> {
    return await this.validarSilencioso(permisoId);
  }

  /**
   * Maneja el caso cuando el usuario no tiene permisos
   */
  private manejarAccesoNoAutorizado(seccion: string): void {
    this.validacionPermisosService.manejarFaltaDePermisos(
      `No tiene permisos para acceder a ${seccion}`
    );
  }

  /**
   * Método de conveniencia para usar en guards de rutas
   */
  async validarPermisoRuta(permisoId: number, nombreRuta: string): Promise<boolean> {
    const tienePermiso = await this.validarSilencioso(permisoId);
    
    if (!tienePermiso) {
      // Para guards, redirigir a datos básicos como primera opción
      this.notificacionesService.notificacion(
        `No tiene permisos para acceder a ${nombreRuta}.`
      );
      this.router.navigateByUrl('/modulos/datosbasicos');
      return false;
    }
    
    return true;
  }

  /**
   * Wrapper para validar permisos en formularios antes de guardar
   */
  async validarAntesDeGuardar(
    permisoId: number,
    accionGuardar: () => Promise<any>,
    tipoOperacion: string = 'guardar'
  ): Promise<any> {
    const ejecutado = await this.validarYEjecutar(
      permisoId,
      accionGuardar,
      tipoOperacion
    );
    
    return ejecutado;
  }

  /**
   * Método para validar permisos con timeout
   * Útil cuando la validación puede tomar tiempo
   */
  async validarConTimeout(
    permisoId: number,
    nombreAccion: string = 'realizar esta operación',
    timeoutMs: number = 5000
  ): Promise<boolean> {
    return new Promise(async (resolve) => {
      const timeoutId = setTimeout(() => {
        console.warn('Timeout en validación de permisos');
        resolve(false);
      }, timeoutMs);

      try {
        const resultado = await this.validacionPermisosService.validarPermisoConRecarga(
          permisoId,
          nombreAccion,
          true
        );
        clearTimeout(timeoutId);
        resolve(resultado);
      } catch (error) {
        clearTimeout(timeoutId);
        console.error('Error en validación con timeout:', error);
        resolve(false);
      }
    });
  }
}
