import { Injectable, Injector, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import * as CryptoJS from 'crypto-js';
import { Observable, empty, firstValueFrom } from 'rxjs';
import { StorageService } from '../../servicios/storage.service';
import { FuncionesGenerales } from '../funciones/funciones';
import { NotificacionesService } from 'src/app/servicios/notificaciones.service';
import { UrlConfigService } from '../../servicios/url-config.service';

export class CustomInjectorService {
	static injector: Injector
}

@Injectable({
	providedIn: 'root'
})
export class PeticionService {

	// 🚀 DEPENDENCY INJECTION MODERNA
	private storageService = inject(StorageService);
	private notificacionesService = inject(NotificacionesService);
	private httpClient = inject(HttpClient);
	private urlConfigService = inject(UrlConfigService);
	
	public url: string = environment.urlBack + 'index.php/API/';
	public categoria: string = '';

	constructor() {
		// Los servicios ya están inyectados mediante inject()
		// No inicializamos la URL aquí para evitar problemas con Storage no inicializado
	}

	/**
	 * Obtiene la URL activa actualizada en tiempo real
	 */
	private async getActiveUrl(): Promise<string> {
		try {
			const activeUrl = await this.urlConfigService.getActiveUrl();
			return activeUrl + 'index.php/API/';
		} catch (error) {
			// Si hay error, usar la URL por defecto de environment sin loggear
			return environment.urlBack + 'index.php/API/';
		}
	}

	async encriptar(datos: any) {
		const salt = CryptoJS.lib.WordArray.random(256);
		const iv = CryptoJS.lib.WordArray.random(16);
		const crypt = JSON.parse(await this.storageService.get('crypt').then(resp => resp));
		const key = CryptoJS.PBKDF2(crypt.key, salt, { hasher: CryptoJS.algo.SHA512, keySize: 64 / 8, iterations: crypt.it });
		const encrypted = CryptoJS.AES.encrypt(JSON.stringify(datos), key, { iv: iv });
		const data = {
			ciphertext: CryptoJS.enc.Base64.stringify(encrypted.ciphertext),
			salt: CryptoJS.enc.Hex.stringify(salt),
			iv: CryptoJS.enc.Hex.stringify(iv)
		}
		return JSON.stringify(data);
	}

	async desencriptar(encriptado: any) {		
		// Validar si el objeto tiene las propiedades necesarias para desencriptar
		if (!encriptado || (typeof encriptado !== 'object' && typeof encriptado !== 'string')) {
			return null; // Retornar null en lugar de lanzar error
		}

		// Si el objeto tiene propiedades de Zone.js, extraer el valor real
		if (encriptado.__zone_symbol__value !== undefined) {
			encriptado = encriptado.__zone_symbol__value;
		}

		// Si es un array vacío o null después de extraer de Zone.js
		if (Array.isArray(encriptado) && encriptado.length === 0) {
			return null; // Retornar null en lugar de lanzar error
		}

		// Si es null o undefined después de las validaciones
		if (encriptado === null || encriptado === undefined) {
			return null;
		}

		// Si es una string, intentar parsear como JSON
		if (typeof encriptado === 'string') {
			try {
				encriptado = JSON.parse(encriptado);
			} catch (error) {
				// Si no se puede parsear, podría ser un string simple, retornarlo
				return encriptado;
			}
		}

		// Validar que tenga las propiedades necesarias para la desencriptación
		if (!encriptado.salt || !encriptado.iv || !encriptado.ciphertext) {
			// Si es un objeto que ya viene desencriptado (como en tu caso que tiene 'foto'), devolverlo tal como está
			if (encriptado && typeof encriptado === 'object' && Object.keys(encriptado).length > 0) {
				console.info('Datos ya parecen estar desencriptados, retornándolos tal como están');
				return encriptado;
			}
			
			// Si no hay propiedades válidas, retornar null en lugar de error
			return null;
		}

		try {
			const salt = CryptoJS.enc.Hex.parse(encriptado.salt);
			const iv = CryptoJS.enc.Hex.parse(encriptado.iv);
			const crypt = JSON.parse(await this.storageService.get('crypt').then(resp => resp));
			
			if (!crypt || !crypt.key) {
				console.error('No se encontró la clave de encriptación en el storage');
				throw new Error('Clave de encriptación no encontrada');
			}
			
			const key = CryptoJS.PBKDF2(crypt.key, salt, { hasher: CryptoJS.algo.SHA512, keySize: 64 / 8, iterations: crypt.it });
			const decrypted = CryptoJS.AES.decrypt(encriptado.ciphertext, key, { iv: iv });
			
			const decryptedString = decrypted.toString(CryptoJS.enc.Utf8);
			if (!decryptedString) {
				throw new Error('La desencriptación resultó en una cadena vacía');
			}
			
			return JSON.parse(decryptedString);
		} catch (error) {
			console.error('Error durante la desencriptación:', error);
			console.error('Objeto que causó el error:', encriptado);
			throw new Error(`Error al desencriptar: ${error.message}`);
		}
	}

	async obtener(controlador: string) {
		const uri = await this.construirUrl(controlador);
		try {
			const resp = await firstValueFrom(this.ejecutarPeticion('get', uri));
			return await this.desencriptar(resp);
		} catch (error) {
			console.error('Error en obtener():', error);
			throw error;
		}
	}

	async informacion(body: object, controlador: string, valida= false) {
		const data = {
			encriptado: await this.encriptar(body)
		};
		const uri = await this.construirUrl(controlador);
		const Conexion = await this.storageService.get('conexion').then(resp => resp);
		let NIT = await this.storageService.get('nit').then(resp => resp);
		
		// Usar la función utilitaria segura para obtener datos del usuario
		let usuario = await this.obtenerDatosStorage('usuario');
		
		if (!usuario) {
			console.error('No se encontraron datos válidos de usuario para la petición');
			throw new Error('Usuario no encontrado o datos inválidos');
		}
				
		// Crear headers con valores seguros (convertir undefined a string vacío)
		const headers = new HttpHeaders({
			Token: usuario.IngresoId || '',
			Conexion: Conexion || '',
			NIT: NIT || '',
			Usuario: usuario.usuarioId || '',
			Num_docu: usuario.num_docu || '',
			Tercero_id: usuario.tercero_id || ''
		});
		return await firstValueFrom(this.ejecutarPeticion('post', uri, data, headers)).then(async resp => {			
			if (valida == false) {
				try {
					const desencriptado = await this.desencriptar(resp);
					
					// 🔥 VALIDAR SI EL EMPLEADO ESTÁ RETIRADO (respuesta de error del servidor con valido===0)
					await this.validarEmpleadoRetirado(desencriptado, true);
					
					// 🔥 VALIDAR SI LOS DATOS CONTIENEN INFO DE EMPLEADO RETIRADO (respuesta normal con datos)
					// Esto cubre casos donde el backend retorna datos normales pero el empleado tiene fecha_retiro
					if (desencriptado && desencriptado.datos) {
						// Si es un array de datos
						if (Array.isArray(desencriptado.datos) && desencriptado.datos.length > 0) {
							await this.validarEmpleadoRetirado(desencriptado.datos[0], false);
						}
						// Si es un objeto único
						else if (typeof desencriptado.datos === 'object') {
							await this.validarEmpleadoRetirado(desencriptado.datos, false);
						}
					}
					// Si la respuesta directa tiene fecha_retiro (sin wrapper 'datos')
					else if (desencriptado && desencriptado.fecha_retiro && !desencriptado.valido) {
						await this.validarEmpleadoRetirado(desencriptado, false);
					}
					
					if (desencriptado.activoLogueo) {
						// Solo cerrar sesión si es una respuesta crítica de autenticación
						// No cerrar por operaciones normales como cargar fotos
						console.warn('Servidor indicó activoLogueo=true, pero manteniendo sesión activa');
						
						// Verificar si realmente es necesario cerrar sesión
						// o si es solo una advertencia del servidor
						if (desencriptado.mensaje && desencriptado.mensaje.includes('sesión expirada')) {
							this.storageService.limpiarTodo();
							return null;
						}
						
						// Para otros casos, mantener la sesión pero retornar la respuesta
						return desencriptado;
					} else {
						return desencriptado;
					}
				} catch (error) {
					console.error('DEBUG PETICION: Error en desencriptación:', error);
					throw error;
				}
			}else{
				return resp;
			}
		}).catch((request) => {			
			this.validarAlertaError(request);
			throw request; // Importante: re-lanzar el error para que se propague
		});
	}

	/**
	 * Función utilitaria para obtener datos del storage de forma segura
	 * @param key La clave del storage
	 * @returns Los datos desencriptados o null si no existen
	 */
	async obtenerDatosStorage(key: string): Promise<any> {
		try {
			const datos = await this.storageService.get(key);
			
			if (!datos) {
				return null;
			}

			// Si es una string, intentar parsear
			let datosParsed = datos;
			if (typeof datos === 'string') {
				try {
					datosParsed = JSON.parse(datos);
				} catch (error) {
					console.error(`Error al parsear datos del storage para ${key}:`, error);
					return null;
				}
			}

			// Si los datos parecen estar encriptados, desencriptarlos
			if (datosParsed && typeof datosParsed === 'object' && 
				(datosParsed.salt || datosParsed.iv || datosParsed.ciphertext)) {
					const desencriptado = await this.desencriptar(datosParsed);
				
				// 🔥 VALIDAR SI ES USUARIO Y ESTÁ RETIRADO (solo si la fecha ya pasó)
				if (key === 'usuario' && desencriptado && desencriptado.fecha_retiro) {
					const fechaRetiro = new Date(desencriptado.fecha_retiro);
					const hoy = new Date();
					hoy.setHours(0, 0, 0, 0); // Normalizar a medianoche
					
					if (fechaRetiro < hoy) {
						await this.cerrarSesionEmpleadoRetirado('El empleado se encuentra retirado.');
						throw new Error('EMPLEADO_RETIRADO');
					}
				}
				
				return desencriptado;
			}

			// Si ya están desencriptados o son datos simples, retornarlos
			return datosParsed;

		} catch (error: any) {
			// Re-lanzar error de empleado retirado
			if (error?.message === 'EMPLEADO_RETIRADO') {
				throw error;
			}
			console.error(`Error al obtener datos del storage para ${key}:`, error);
			return null;
		}
	}

	/**
	 * 🔥 Valida si un empleado está retirado
	 * @param dato Puede ser una respuesta del backend (con valido===0) o un objeto empleado
	 * @param esRespuestaError true si es respuesta de error del servidor, false si es objeto empleado normal
	 * @returns true si está retirado (y cierra sesión), false si no
	 * @throws Error('EMPLEADO_RETIRADO') si está retirado
	 */
	async validarEmpleadoRetirado(dato: any, esRespuestaError: boolean = false): Promise<boolean> {
		if (!dato) {
			return false;
		}

		// Si es respuesta de error del backend (valido === 0)
		if (esRespuestaError) {
			if (dato.valido === 0 && dato.fecha_retiro) {
				await this.cerrarSesionEmpleadoRetirado(dato.mensaje);
				throw new Error('EMPLEADO_RETIRADO');
			}
			return false;
		}

		// Verificar si el objeto tiene campos de empleado antes de validar
		// Si no tiene estado ni fecha_retiro, no es un objeto de empleado
		if (dato.estado === undefined && dato.fecha_retiro === undefined) {
			return false; // No es un objeto empleado, no validar
		}

		// Si es objeto empleado normal, validar por estado y fecha
		if (dato.estado !== undefined && dato.estado != '1') {
			await this.cerrarSesionEmpleadoRetirado('El empleado se encuentra inactivo.');
			throw new Error('EMPLEADO_RETIRADO');
		}

		// Validar fecha de retiro si existe
		if (!dato.fecha_retiro) {
			return false; // No tiene fecha de retiro, está activo
		}

		const fechaRetiro = new Date(dato.fecha_retiro);
		const hoy = new Date();
		hoy.setHours(0, 0, 0, 0);

		if (fechaRetiro < hoy) {
			await this.cerrarSesionEmpleadoRetirado();
			throw new Error('EMPLEADO_RETIRADO');
		}

		return false;
	}

	/**
	 * 🔥 HELPER: Maneja errores en catch, re-lanzando EMPLEADO_RETIRADO
	 * Usar en todos los .catch() de los módulos
	 * @param error Error capturado
	 * @param event Evento de Ionic (opcional) para completar loading
	 * @throws Error si es EMPLEADO_RETIRADO
	 */
	manejarErrorEmpleadoRetirado(error: any, event?: any): void {
		if (event) {
			event.target?.complete();
		}

		// Si es empleado retirado, re-lanzar para que se propague
		if (error?.message === 'EMPLEADO_RETIRADO') {
			throw error;
		}

		// Para otros errores, solo registrar
		console.error('Error en petición:', error);
	}

	/**
	 * Cierra la sesión del empleado retirado (método centralizado)
	 * @param mensaje Mensaje personalizado (opcional)
	 */
	private async cerrarSesionEmpleadoRetirado(mensaje?: string): Promise<void> {		
		// Mostrar notificación
		this.notificacionesService.notificacion(
			mensaje || 'El empleado se encuentra retirado.'
		);
		
		// Limpiar TODO el storage para volver a la pantalla de NIT
		await this.storageService.clear();
		
		// Redirigir al login (primera pantalla - ingresar NIT)
		setTimeout(() => {
			window.location.href = '/login';
		}, 1500);
	}

	/**
	 * Valida si el usuario guardado en storage está retirado
	 * Debe ser llamado al cargar cualquier página
	 * @returns true si está activo, false si está retirado (y cierra sesión)
	 */
	async validarUsuarioStorage(): Promise<boolean> {
		try {
			const usuario = await this.obtenerDatosStorage('usuario');
			
			if (!usuario) {
				return false;
			}

			// Verificar si tiene fecha_retiro
			if (usuario.fecha_retiro && usuario.fecha_retiro !== null && usuario.fecha_retiro !== '') {				
				// Mostrar notificación
				this.notificacionesService.notificacion(
					'El empleado se encuentra retirado.'
				);
				
				// Cerrar sesión
				await this.storageService.clear();
				
				// Redirigir al login
				setTimeout(() => {
					window.location.href = '/login';
				}, 1500);
				
				return false;
			}

			return true;
		} catch (error) {
			console.error('Error al validar usuario en storage:', error);
			return false;
		}
	}

	/**
	 * Función para validar que el usuario esté correctamente autenticado
	 * @returns true si el usuario está válido, false si no
	 */
	async validarSesionActiva(): Promise<boolean> {
		try {
			const usuario = await this.obtenerDatosStorage('usuario');
			const modulos = await this.obtenerDatosStorage('modulos');
			const conexion = await this.storageService.getSafe('conexion');
			const nit = await this.storageService.getSafe('nit');
			
			// Validar que todos los datos esenciales estén presentes
			if (!usuario || !modulos || !conexion || !nit) {
				return false;
			}

			// Validar que el usuario tenga las propiedades necesarias
			if (!usuario.IngresoId || !usuario.usuarioId || !usuario.num_docu || !usuario.tercero_id) {
				return false;
			}

			return true;
		} catch (error) {
			console.error('Error al validar sesión activa:', error);
			return false;
		}
	}

	/**
	 * Inicializa o valida la sesión del usuario al iniciar la aplicación
	 * @returns true si la sesión es válida, false si necesita re-autenticación
	 */
	async inicializarSesion(): Promise<boolean> {
		try {
			const sesionValida = await this.validarSesionActiva();
			
			if (!sesionValida) {
				this.storageService.limpiarTodo(true);
				return false;
			}

			return true;
		} catch (error) {
			console.error('Error al inicializar sesión:', error);
			this.storageService.limpiarTodo(true);
			return false;
		}
	}

	private async construirUrl(controlador: string): Promise<string> {
		const baseUrl = await this.getActiveUrl();
		return baseUrl + this.categoria + controlador;
	}

	async validarNit(NIT: any) {
		const baseUrl = await this.getActiveUrl();
		return await firstValueFrom(this.ejecutarPeticion('post', `${baseUrl}Login/ValidarNIT`, { NIT })).then(resp => resp, console.error);
	}

	async iniciarSesionUser(data: any) {
		data = {
			user: data.num_docu,
			password: data.password,
			permisos: data.permisos,
			userSeccion: 1
		};
		data = {
			encriptado: await this.encriptar(data),
			RASTREO: FuncionesGenerales.rastreo('Ingresa al Sistema Gestión Empresarial', 'Ingreso Sistema'),
		}
		const Conexion = await this.storageService.get('conexion').then(resp => resp);
		const NIT = await this.storageService.get('nit').then(resp => resp);
		const headers = new HttpHeaders({ NIT, Conexion, Token: '0' });
		const baseUrl = await this.getActiveUrl();
		return await firstValueFrom(this.ejecutarPeticion('post', `${baseUrl}Login/ingreso`, data, headers)).then(resp => resp, console.error);
	}

	async cerrarSesionUser() {
		const Conexion = await this.storageService.get('conexion').then(resp => resp);
		
		// Usar la función utilitaria segura para obtener datos del usuario
		let usuario = await this.obtenerDatosStorage('usuario');
		
		if (!usuario) {
			console.error('No se encontraron datos válidos de usuario para cerrar sesión');
			// Si no hay usuario válido, simplemente limpiar el storage
			this.storageService.limpiarTodo(true);
			return;
		}
		
		let data: any = {
			ingreso: usuario.IngresoId,
			usuario: usuario.usuarioId
		};
		data = {
			encriptado: await this.encriptar(data),
			RASTREO: FuncionesGenerales.rastreo('Salida del Sistema Gestión Empresarial', 'Salida Sistema'),
		}
		const headers = new HttpHeaders({ Conexion, Token: usuario.IngresoId });
		const baseUrl = await this.getActiveUrl();
		return await firstValueFrom(this.ejecutarPeticion('post', `${baseUrl}Login/cierre`, data, headers)).then(resp => this.desencriptar(resp)).catch(error => {
			this.validarAlertaError(error);
		});
	}

	ejecutarPeticion(verboPeticion: string, url: string, data?: object, headers?: HttpHeaders): Observable<any> {
		if (verboPeticion === 'get') {
			return this.httpClient.get(url);
		}
		return this.httpClient.post(url, data, { headers });
	}

	private validarAlertaError(request: any) {
		if (request.error !== '' && request.error !== undefined) {
			let encabezado = 'Se ha producido un problema';
			let encabezado2 = 'Error';
			let opciones = [];
			let mensaje = `Para obtener más información de este problema y posibles correcciones, 
				pulse el botón "Ver Detalle" y comuniquese a la línea de servicio al cliente.`;
			if (request.error.text !== '' && request.error.text !== undefined) {
				mensaje = `Para obtener más información de este problema y posibles correcciones, 
					pulse el botón "Ver Detalle" y comuniquese a la línea de servicio al cliente.`;
				opciones = [{
					text: 'Ver Detalle',
					handler: () => {
						this.notificacionesService.alerta(request.error.text, 'Error', ['alerta-error'],
							[{
								text: 'Cerrar',
								role: 'aceptar',
								handler: () => {
									//this.storageService.limpiarTodo(true);
								}
							}]
						);
					}
				}, {
					text: 'Cerrar',
					role: 'cancel',
					handler: () => {
						//this.storageService.limpiarTodo(true);
					}
				}];
			} else {
				// Convertir error a string para poder usar includes()
				const errorString = typeof request.error === 'string' ? request.error : 
					(request.error?.message || request.error?.error || JSON.stringify(request.error));
				
				if (errorString.includes('DELETE') && errorString.includes('REFERENCE') && errorString.includes('FK')) {
					mensaje = 'No se puede eliminar, el registro se encuentra referenciado en otras tablas.';
					encabezado = 'Error de Integridad';
					encabezado2 = encabezado;
				}
				opciones = [{
					text: 'Ver Detalle',
					handler: () => {
						this.notificacionesService.alerta(errorString, "Error", ['alerta-error'], [{ text: 'Cerrar', role: 'aceptar' }]);
					}
				}, {
					text: 'Cerrar',
					role: 'cancel'
				}];
			}
			this.notificacionesService.alerta(mensaje, encabezado, [], opciones);

		}
	}

	async recuperarPassword(body: object, controlador: string) {
		const data = {
			encriptado: await this.encriptar(body),
			conexion: await this.storageService.get('conexion').then(resp => resp),
			nit: await this.storageService.get('nit').then(resp => resp)
		}
		const uri = await this.construirUrl(controlador);
		const NIT = await this.storageService.get('nit').then(resp => resp);
		const headers = new HttpHeaders({ NIT, Token: '0' });
		return await firstValueFrom(this.ejecutarPeticion('post', uri, data, headers)).then(async resp => {
			let desencriptado = resp;
			if (!resp.valido) {
				desencriptado = await this.desencriptar(resp);
			}
			if (desencriptado.activoLogueo) {
				// return Ejecutar cerrar sesion
				this.storageService.limpiarTodo();
			} else {
				return desencriptado;
			}
		}).catch((request) => {
			this.validarAlertaError(request);
		});
	}

}
