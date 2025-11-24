import * as CryptoJS from 'crypto-js';
import { getItem, setItem, removeItem, clearAll } from './storage';

export class CryptoService {
  
  /**
   * Encripta datos usando AES con la clave almacenada en MMKV
   */
  static async encrypt(data: any): Promise<string> {
    const salt = CryptoJS.lib.WordArray.random(256);
    const iv = CryptoJS.lib.WordArray.random(16);
    const cryptData = getItem('crypt');
    
    if (!cryptData || !cryptData.key) {
      throw new Error('No se encontró la clave de encriptación');
    }
    
    const key = CryptoJS.PBKDF2(cryptData.key, salt, { 
      hasher: CryptoJS.algo.SHA512, 
      keySize: 64 / 8, 
      iterations: cryptData.it 
    });
    
    const encrypted = CryptoJS.AES.encrypt(JSON.stringify(data), key, { iv: iv });
    
    const encryptedData = {
      ciphertext: CryptoJS.enc.Base64.stringify(encrypted.ciphertext),
      salt: CryptoJS.enc.Hex.stringify(salt),
      iv: CryptoJS.enc.Hex.stringify(iv)
    };
    
    return JSON.stringify(encryptedData);
  }

  /**
   * Desencripta datos usando AES con la clave almacenada en MMKV
   */
  static async decrypt(encryptedData: any): Promise<any> {
    // Validar si el objeto tiene las propiedades necesarias para desencriptar
    if (!encryptedData || (typeof encryptedData !== 'object' && typeof encryptedData !== 'string')) {
      console.warn('Datos de entrada inválidos para desencriptar:', encryptedData);
      return null;
    }

    // Si es una string, intentar parsear como JSON
    if (typeof encryptedData === 'string') {
      try {
        encryptedData = JSON.parse(encryptedData);
      } catch (error) {
        console.warn('Error al parsear JSON, los datos podrían no estar encriptados:', error);
        return encryptedData;
      }
    }

    // Validar que tenga las propiedades necesarias para la desencriptación
    if (!encryptedData.salt || !encryptedData.iv || !encryptedData.ciphertext) {
      console.warn('El objeto no contiene las propiedades necesarias para desencriptación:', encryptedData);
      
      // Si es un objeto que ya viene desencriptado, devolverlo tal como está
      if (encryptedData && typeof encryptedData === 'object' && Object.keys(encryptedData).length > 0) {
        console.info('Datos ya parecen estar desencriptados, retornándolos tal como están');
        return encryptedData;
      }
      
      return null;
    }

    try {
      const salt = CryptoJS.enc.Hex.parse(encryptedData.salt);
      const iv = CryptoJS.enc.Hex.parse(encryptedData.iv);
      const cryptData = getItem('crypt');
      
      if (!cryptData || !cryptData.key) {
        console.error('No se encontró la clave de encriptación en el storage');
        throw new Error('Clave de encriptación no encontrada');
      }
      
      const key = CryptoJS.PBKDF2(cryptData.key, salt, { 
        hasher: CryptoJS.algo.SHA512, 
        keySize: 64 / 8, 
        iterations: cryptData.it 
      });
      
      const decrypted = CryptoJS.AES.decrypt(encryptedData.ciphertext, key, { iv: iv });
      
      const decryptedString = decrypted.toString(CryptoJS.enc.Utf8);
      if (!decryptedString) {
        throw new Error('La desencriptación resultó en una cadena vacía');
      }
      
      return JSON.parse(decryptedString);
    } catch (error: any) {
      console.error('Error durante la desencriptación:', error);
      console.error('Objeto que causó el error:', encryptedData);
      throw new Error(`Error al desencriptar: ${error?.message || 'Error desconocido'}`);
    }
  }

  /**
   * Función utilitaria para obtener datos del storage de forma segura
   */
  static getSafeStorageData(key: string): any {
    try {
      const data = getItem(key);
      
      if (!data) {
        console.warn(`No se encontraron datos para la clave: ${key}`);
        return null;
      }

      return data;
    } catch (error) {
      console.error(`Error al obtener datos del storage para ${key}:`, error);
      return null;
    }
  }

  /**
   * Valida que el usuario esté correctamente autenticado
   */
  static async validateActiveSession(): Promise<boolean> {
    try {
      const usuario = this.getSafeStorageData('usuario');
      const modulos = this.getSafeStorageData('modulos');
      const conexion = this.getSafeStorageData('conexion');
      const nit = this.getSafeStorageData('nit');
      
      // Validar que todos los datos esenciales estén presentes
      if (!usuario || !modulos || !conexion || !nit) {
        console.warn('Faltan datos esenciales para mantener la sesión activa');
        return false;
      }

      // Validar que el usuario tenga las propiedades necesarias
      if (!usuario.IngresoId || !usuario.usuarioId || !usuario.num_docu || !usuario.tercero_id) {
        console.warn('Los datos de usuario no tienen las propiedades necesarias');
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error al validar sesión activa:', error);
      return false;
    }
  }

  /**
   * Limpia toda la sesión manteniendo configuraciones básicas
   */
  static clearSession(isLogout: boolean = false): void {
    try {
      const tema = getItem('theme');
      let nit = null;
      
      // Solo preservar el NIT si NO es un logout deliberado
      if (!isLogout) {
        nit = getItem('nit');
      }
      
      clearAll();
      
      // Restaurar configuraciones básicas
      if (tema) setItem('theme', tema);
      
      // Solo restaurar NIT si no fue un logout
      if (nit && !isLogout) {
        setItem('nit', nit);
      }
    } catch (error) {
      console.error('Error al limpiar sesión:', error);
    }
  }
}
