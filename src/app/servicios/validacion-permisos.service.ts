import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { StorageService } from './storage.service';
import { NotificacionesService } from './notificaciones.service';
import { LoginService } from './login.service';
import { FuncionesGenerales } from '../config/funciones/funciones';
import { CargadorService } from './cargador.service';
import { Storage } from '@ionic/storage-angular';
import { Router } from '@angular/router';

export interface PermisosUsuario {
  SEGUR: number[];
  ultimaActualizacion: Date;
  perfilId: number;
}

export interface ResultadoValidacion {
  valido: boolean;
  mensaje: string;
  codigoPermiso: number;
  requiereSincronizacion: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ValidacionPermisosService {
  
  private storageService = inject(StorageService);
  private notificacionesService = inject(NotificacionesService);
  private loginService = inject(LoginService);
  private cargadorService = inject(CargadorService);
  private storage = inject(Storage);
  private router = inject(Router);

  // Subject para notificar cambios en permisos
  private permisosActualizados$ = new BehaviorSubject<boolean>(false);
  
  // Cache de permisos del usuario actual
  private permisosCache: PermisosUsuario | null = null;
  
  // Tiempo máximo sin sincronizar (en minutos)
  private readonly TIEMPO_MAX_SIN_SINCRONIZAR = 60;

  // Flag para controlar si el storage está inicializado
  private storageReady: boolean = false;

  constructor() {
    // No inicializar permisos inmediatamente en el constructor
    // Esperar a que se llame explícitamente a los métodos
  }

  /**
   * Observable para escuchar cambios en permisos
   */
  get permisosActualizados(): Observable<boolean> {
    return this.permisosActualizados$.asObservable();
  }

  /**
   * Método público para inicializar el servicio de forma segura
   */
  async inicializar(): Promise<void> {
    await this.initializeStorageAndPermissions();
  }

  /**
   * Inicializa el storage y luego los permisos
   */
  private async initializeStorageAndPermissions(): Promise<void> {
    try {
      // Asegurar que el storage esté inicializado
      await this.ensureStorageReady();
      
      // Una vez que el storage está listo, inicializar permisos
      await this.inicializarPermisos();
    } catch (error) {
      console.error('Error al inicializar storage y permisos:', error);
    }
  }

  /**
   * Asegura que el storage esté listo antes de usarlo
   */
  private async ensureStorageReady(): Promise<void> {
    if (this.storageReady) {
      return;
    }

    try {
      // Intentar crear el storage si no está creado
      const storage = await this.storage.create();
      this.storageReady = true;
    } catch (error) {
      console.error('Error al inicializar storage:', error);
      // Intentar usar el storageService como fallback
      try {
        // Intentar acceder al storage a través del servicio
        const testValue = await this.storageService.get('test-key-init');
        this.storageReady = true;
      } catch (fallbackError) {
        console.error('Error en fallback del storage:', fallbackError);
        // Como último recurso, esperar un poco y marcar como listo
        await new Promise(resolve => setTimeout(resolve, 500));
        this.storageReady = true;
        console.warn('📦 Storage marcado como listo por timeout (puede fallar)');
      }
    }
  }

  /**
   * Wrapper seguro para obtener datos del storage
   */
  private async safeStorageGet(key: string): Promise<any> {
    try {
      await this.ensureStorageReady();
      return await this.storageService.get(key);
    } catch (error) {
      console.error(`Error al obtener ${key} del storage:`, error);
      return null;
    }
  }

  /**
   * Wrapper seguro para guardar datos en el storage
   */
  private async safeStorageSet(key: string, value: any): Promise<boolean> {
    try {
      await this.ensureStorageReady();
      await this.storageService.set(key, value);
      return true;
    } catch (error) {
      console.error(`Error al guardar ${key} en el storage:`, error);
      return false;
    }
  }

  /**
   * Inicializa los permisos desde el storage
   */
  private async inicializarPermisos(): Promise<void> {
    try {
      const usuario = await this.obtenerUsuarioDelStorage();
      if (usuario && usuario.SEGUR) {
        this.permisosCache = {
          SEGUR: usuario.SEGUR,
          ultimaActualizacion: new Date(usuario.ultimaActualizacionPermisos || Date.now()),
          perfilId: usuario.perfilid
        };
      }
    } catch (error) {
      console.error('Error al inicializar permisos:', error);
    }
  }

  /**
   * Valida permisos al iniciar la aplicación
   */
  async validarPermisosAlIniciar(): Promise<boolean> {
    try {      
      // Asegurar que el storage esté listo
      await this.ensureStorageReady();
      
      // Verificar si tenemos permisos en cache
      if (!this.permisosCache) {
        await this.inicializarPermisos();
      }

      // Si no tenemos permisos, forzar sincronización
      if (!this.permisosCache || !this.permisosCache.SEGUR || this.permisosCache.SEGUR.length === 0) {
        return await this.sincronizarPermisos();
      }

      // Verificar si necesitamos sincronizar por tiempo
      if (this.necesitaSincronizacionPorTiempo()) {
        return await this.sincronizarPermisos();
      }

      return true;

    } catch (error) {
      console.error('Error al validar permisos al iniciar:', error);
      this.notificacionesService.notificacion('Error al validar permisos. Intente cerrar sesión y volver a ingresar.');
      return false;
    }
  }

  /**
   * Valida un permiso específico antes de una acción
   */
  async validarPermisoParaAccion(
    permisoId: number, 
    nombreAccion: string = 'realizar esta acción',
    forzarSincronizacion: boolean = false
  ): Promise<ResultadoValidacion> {
    
    try {
      // Asegurar que el storage esté listo
      await this.ensureStorageReady();
      
      // Si se fuerza la sincronización o no tenemos permisos actuales
      if (forzarSincronizacion || !this.permisosCache) {
        await this.sincronizarPermisos();
      }

      // Verificar permiso
      const tienePermiso = this.validarPermisoLocal(permisoId);
      
      if (!tienePermiso) {
        // Si no tiene permiso, intentar sincronizar una vez más
        await this.sincronizarPermisos();
        
        // Verificar nuevamente
        const tienePermisoActualizado = this.validarPermisoLocal(permisoId);
        
        return {
          valido: tienePermisoActualizado,
          mensaje: tienePermisoActualizado 
            ? '' 
            : `No tiene permisos para ${nombreAccion}. `,
          codigoPermiso: permisoId,
          requiereSincronizacion: false
        };
      }

      return {
        valido: true,
        mensaje: '',
        codigoPermiso: permisoId,
        requiereSincronizacion: false
      };

    } catch (error) {
      console.error('Error al validar permiso:', error);
      return {
        valido: false,
        mensaje: 'Error al validar permisos. Intente nuevamente.',
        codigoPermiso: permisoId,
        requiereSincronizacion: true
      };
    }
  }

  /**
   * Valida múltiples permisos de una vez
   */
  async validarMultiplesPermisos(permisos: number[]): Promise<{[key: number]: boolean}> {
    // Asegurar que el storage esté listo
    await this.ensureStorageReady();
    
    if (!this.permisosCache) {
      await this.inicializarPermisos();
    }

    const resultado: {[key: number]: boolean} = {};
    
    for (const permiso of permisos) {
      resultado[permiso] = this.validarPermisoLocal(permiso);
    }

    return resultado;
  }

  /**
   * Valida permiso localmente (sin sincronización)
   */
  validarPermisoLocal(permisoId: number): boolean {
    if (!this.permisosCache || !this.permisosCache.SEGUR) {
      return false;
    }
    
    return FuncionesGenerales.validarPermiso(permisoId, this.permisosCache.SEGUR);
  }

  /**
   * Obtiene los permisos actuales del usuario
   */
  obtenerPermisosActuales(): number[] {
    return this.permisosCache?.SEGUR || [];
  }

  /**
   * Sincroniza permisos con el servidor
   */
  async sincronizarPermisos(): Promise<boolean> {
    try {      
      // Asegurar que el storage esté listo
      await this.ensureStorageReady();
      
      const usuario = await this.obtenerUsuarioDelStorage();
      if (!usuario || !usuario.perfilid) {
        throw new Error('No se pudo obtener información del usuario');
      }

      const perfilid = usuario.perfilid;
      const permisos = FuncionesGenerales.permisos();
      const data = { perfilid, permisos };

      const resp = await this.loginService.informacion(data, `Login/sincronizarPermisos`);
      
      if (resp && Array.isArray(resp.permisos) && resp.permisos.length > 0) {
        // Actualizar cache local
        this.permisosCache = {
          SEGUR: resp.permisos,
          ultimaActualizacion: new Date(),
          perfilId: perfilid
        };

        // Actualizar usuario en storage
        usuario.SEGUR = resp.permisos;
        usuario.ultimaActualizacionPermisos = new Date().toISOString();
        const guardadoExitoso = await this.safeStorageSet('usuario', await this.loginService.encriptar(usuario));
        
        if (!guardadoExitoso) {
          console.warn('⚠️ No se pudo guardar usuario actualizado en storage');
        }

        // Notificar cambios
        this.permisosActualizados$.next(true);

        return true;
      } else {
        throw new Error('Respuesta inválida del servidor');
      }

    } catch (error) {
      console.error('Error al sincronizar permisos:', error);
      this.notificacionesService.notificacion('Error al sincronizar permisos');
      return false;
    }
  }

  /**
   * Valida si necesita sincronización por tiempo transcurrido
   */
  private necesitaSincronizacionPorTiempo(): boolean {
    if (!this.permisosCache?.ultimaActualizacion) {
      return true;
    }

    const ahora = new Date();
    const tiempoTranscurrido = ahora.getTime() - this.permisosCache.ultimaActualizacion.getTime();
    const minutosTranscurridos = tiempoTranscurrido / (1000 * 60);

    return minutosTranscurridos > this.TIEMPO_MAX_SIN_SINCRONIZAR;
  }

  /**
   * Obtiene el usuario del storage de forma segura
   */
  private async obtenerUsuarioDelStorage(): Promise<any> {
    try {
      const usuarioStorage = await this.safeStorageGet('usuario');
      if (!usuarioStorage) {
        console.warn('No se encontró usuario en el storage');
        return null;
      }

      const usuarioParsed = JSON.parse(usuarioStorage);
      return await this.loginService.desencriptar(usuarioParsed);
    } catch (error) {
      console.error('Error al obtener usuario del storage:', error);
      return null;
    }
  }

  /**
   * Fuerza la actualización de permisos
   */
  async forzarActualizacionPermisos(): Promise<boolean> {
    // Asegurar que el storage esté listo
    await this.ensureStorageReady();
    
    this.permisosCache = null;
    return await this.sincronizarPermisos();
  }

  /**
   * Limpia el cache de permisos (usado al cerrar sesión)
   */
  limpiarCache(): void {
    this.permisosCache = null;
    this.permisosActualizados$.next(false);
  }

  /**
   * Método estático para validación rápida (compatibilidad con código existente)
   */
  static validarPermiso(permisoId: number, segurArray: number[]): boolean {
    return FuncionesGenerales.validarPermiso(permisoId, segurArray);
  }

  /**
   * Método estático para obtener validación completa (compatibilidad con código existente)
   */
  static obtenerValidacionCompleta(permisoId: number, segurArray: number[], nombreModulo: string) {
    return FuncionesGenerales.verificarPermisoConMensaje(permisoId, segurArray, nombreModulo);
  }

  /**
   * Método de contingencia para validar permisos cuando el storage falla
   */
  async validarPermisoConFallback(permisoId: number): Promise<boolean> {
    try {
      // Intentar validación normal
      return this.validarPermisoLocal(permisoId);
    } catch (error) {
      console.warn('Error en validación normal, usando fallback:', error);
      
      // Como fallback, asumir que tiene permisos básicos si está logueado
      // (esto es temporal mientras se resuelve el problema de storage)
      const permisosBasicos = [600100]; // Permiso de menú básico
      return permisosBasicos.includes(permisoId);
    }
  }

  /**
   * Método para verificar el estado del storage
   */
  async verificarEstadoStorage(): Promise<{
    storageReady: boolean;
    usuarioEncontrado: boolean;
    permisosEncontrados: boolean;
  }> {
    try {
      await this.ensureStorageReady();
      const usuario = await this.obtenerUsuarioDelStorage();
      
      return {
        storageReady: this.storageReady,
        usuarioEncontrado: !!usuario,
        permisosEncontrados: !!(usuario && usuario.SEGUR && usuario.SEGUR.length > 0)
      };
    } catch (error) {
      console.error('Error al verificar estado del storage:', error);
      return {
        storageReady: false,
        usuarioEncontrado: false,
        permisosEncontrados: false
      };
    }
  }

  /**
   * Valida permiso y maneja automáticamente la recarga si no tiene permisos
   */
  async validarPermisoConRecarga(
    permisoId: number, 
    nombreAccion: string = 'realizar esta acción',
    mostrarMensaje: boolean = true
  ): Promise<boolean> {
    try {
      const resultado = await this.validarPermisoParaAccion(permisoId, nombreAccion);
      
      if (!resultado.valido) {
        if (mostrarMensaje) {
          this.notificacionesService.notificacion(resultado.mensaje);
        }
        
        // Recargar página después de mostrar el mensaje
        setTimeout(() => {
          this.recargarPaginaPorPermisos();
        }, 2000);
        
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error al validar permiso con recarga:', error);
      if (mostrarMensaje) {
        this.notificacionesService.notificacion('Error al validar permisos.');
      }
      
      setTimeout(() => {
        this.recargarPaginaPorPermisos();
      }, 2000);
      
      return false;
    }
  }

  /**
   * Recarga la página cuando se detecta falta de permisos
   * Redirige a datos básicos que es la primera opción disponible en cualquier módulo
   */
  private recargarPaginaPorPermisos(): void {
    try {      
      // Usar router de Angular para preservar el estado de la aplicación
      setTimeout(() => {
        this.router.navigateByUrl('/modulos/datosbasicos', { replaceUrl: true });
      }, 1500);
      
    } catch (error) {
      console.error(' Error al redirigir a datos básicos:', error);
      // Solo como último recurso usar window.location
      setTimeout(() => {
        window.location.href = '/modulos/datosbasicos';
      }, 1500);
    }
  }

  /**
   * Método público para recargar cuando se detecten problemas de permisos
   * Redirige a datos básicos que es la primera opción disponible en cualquier módulo
   */
  public manejarFaltaDePermisos(mensaje: string = 'No tiene permisos para acceder a esta sección'): void {
    // this.notificacionesService.notificacion(mensaje);
    setTimeout(() => {
      try {
        // Usar router de Angular para preservar el estado de la aplicación
        this.router.navigateByUrl('/modulos/datosbasicos', { replaceUrl: true });
      } catch (error) {
        console.error('Error con router, usando fallback:', error);
        // Solo como último recurso usar window.location
        window.location.href = '/modulos/datosbasicos';
      }
    }, 1500);
  }
}
