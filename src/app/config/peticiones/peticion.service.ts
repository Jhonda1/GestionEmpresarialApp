import { Injectable, Injector, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import * as CryptoJS from 'crypto-js';
import { Observable, firstValueFrom } from 'rxjs';
import { StorageService } from '../../servicios/storage.service';
import { FuncionesGenerales } from '../funciones/funciones';
import { NotificacionesService } from 'src/app/servicios/notificaciones.service';

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
	
	public url: string = environment.urlBack + 'index.php/API/';
	public categoria: string = '';

	constructor() {
		// Los servicios ya están inyectados mediante inject()
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
			console.error('Datos de entrada inválidos para desencriptar:', encriptado);
			throw new Error('Los datos para desencriptar no tienen el formato correcto');
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
				console.error('Error al parsear JSON:', error);
				throw new Error('Los datos no tienen un formato JSON válido');
			}
		}

		// Validar que tenga las propiedades necesarias para la desencriptación
		if (!encriptado.salt || !encriptado.iv || !encriptado.ciphertext) {
			console.error('El objeto no contiene las propiedades necesarias (salt, iv, ciphertext):', encriptado);
			
			// Si es un objeto que ya viene desencriptado (como en tu caso que tiene 'foto'), devolverlo tal como está
			if (encriptado && typeof encriptado === 'object' && (encriptado.foto || Object.keys(encriptado).length > 0)) {
				return encriptado;
			}
			
			// Si no hay propiedades válidas, retornar null en lugar de error
			return null;
		}

		try {
			const salt = CryptoJS.enc.Hex.parse(encriptado.salt);
			const iv = CryptoJS.enc.Hex.parse(encriptado.iv);
			const crypt = JSON.parse(await this.storageService.get('crypt').then(resp => resp));
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
		const uri = this.construirUrl(controlador);
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
		const uri = this.construirUrl(controlador);
		const Conexion = await this.storageService.get('conexion').then(resp => resp);
		let NIT = await this.storageService.get('nit').then(resp => resp);
		let usuario = await this.desencriptar(JSON.parse(await this.storageService.get('usuario').then(resp => resp)));
		const headers = new HttpHeaders({
			Token: usuario.IngresoId,
			Conexion,
			NIT,
			Usuario: usuario.usuarioId,
			Num_docu: usuario.num_docu,
			Tercero_id: usuario.tercero_id
		});
		return await firstValueFrom(this.ejecutarPeticion('post', uri, data, headers)).then(async resp => {
			if (valida == false) {
				const desencriptado = await this.desencriptar(resp);
				if (desencriptado.activoLogueo) {
					// return Ejecutar cerrar sesion
					this.storageService.limpiarTodo();
				} else {
					return desencriptado;
				}
			}else{
				return resp;
			}
		}).catch((request) => {
			this.validarAlertaError(request);
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
				console.warn(`No se encontraron datos para la clave: ${key}`);
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
				return await this.desencriptar(datosParsed);
			}

			// Si ya están desencriptados o son datos simples, retornarlos
			return datosParsed;

		} catch (error) {
			console.error(`Error al obtener datos del storage para ${key}:`, error);
			return null;
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
			
			return !!(usuario && modulos);
		} catch (error) {
			console.error('Error al validar sesión activa:', error);
			return false;
		}
	}

	private construirUrl(controlador: string) {
		return this.url + this.categoria + controlador;
	}

	async validarNit(NIT: any) {
		return await firstValueFrom(this.ejecutarPeticion('post', `${this.url}Login/ValidarNIT`, { NIT })).then(resp => resp, console.error);
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
			RASTREO: FuncionesGenerales.rastreo('Ingresa al Sistema Gestion Empresarial', 'Ingreso Sistema'),
		}
		const Conexion = await this.storageService.get('conexion').then(resp => resp);
		const NIT = await this.storageService.get('nit').then(resp => resp);
		const headers = new HttpHeaders({ NIT, Conexion, Token: '0' });
		console.log('Iniciando sesión con datos:', data);
		return await firstValueFrom(this.ejecutarPeticion('post', `${this.url}Login/ingreso`, data, headers)).then(resp => resp, console.error);
	}

	async cerrarSesionUser() {
		const Conexion = await this.storageService.get('conexion').then(resp => resp);
		let usuario = await this.desencriptar(JSON.parse(await this.storageService.get('usuario').then(resp => resp)));
		let data: any = {
			ingreso: usuario.IngresoId,
			usuario: usuario.usuarioId
		};
		data = {
			encriptado: await this.encriptar(data),
			RASTREO: FuncionesGenerales.rastreo('Salida del Sistema Gestion Empresarial', 'Salida Sistema'),
		}
		const headers = new HttpHeaders({ Conexion, Token: usuario.IngresoId });
		return await firstValueFrom(this.ejecutarPeticion('post', `${this.url}Login/cierre`, data, headers)).then(resp => this.desencriptar(resp)).catch(error => {
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
				if (request.error.includes('DELETE') && request.error.includes('REFERENCE') && request.error.includes('FK')) {
					mensaje = 'No se puede eliminar, el registro se encuentra referenciado en otras tablas.';
					encabezado = 'Error de Integridad';
					encabezado2 = encabezado;
				}
				opciones = [{
					text: 'Ver Detalle',
					handler: () => {
						this.notificacionesService.alerta(request.error, "Error", ['alerta-error'], [{ text: 'Cerrar', role: 'aceptar' }]);
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
		const uri = this.construirUrl(controlador);
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
