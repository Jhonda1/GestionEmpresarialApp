// Servicios de login y validación de NIT con lógica real del backend
import axios from 'axios';
import { setItem, getItem } from './storage';
import { CryptoService } from './cryptoService';
import { environment } from '../config/environment';

export async function validateNitService(nit: string) {
  const API_URL = `${environment.urlBack}index.php/API/Login/ValidarNIT`;
  try {
    console.log('Validando NIT:', nit, 'en URL:', API_URL);
    
    const response = await axios.post(API_URL, { NIT: nit });
    
    console.log('Respuesta de validación NIT:', response.data);
    
    // Guardar NIT y respuesta en MMKV para el siguiente paso
    setItem('nit', nit);
    setItem('nitValidationResponse', response.data);
    
    // Si la respuesta contiene datos de encriptación, guardarlos
    if (response.data && response.data.crypt) {
      setItem('crypt', response.data.crypt);
      console.log('Datos de encriptación guardados:', response.data.crypt);
    }
    if (response.data && response.data.db) {
      setItem('conexion', response.data.db);
      console.log('Conexión guardada:', response.data.db);
    }
    
    return response.data;
  } catch (error: any) {
    console.error('Error validando NIT:', error);
    console.error('Detalles del error:', error?.response?.data);
    return { 
      success: false, 
      valido: false,
      mensaje: error?.response?.data?.mensaje || 'Error de conexión' 
    };
  }
}

export async function loginService({ nit, num_docu, password }: { nit: string, num_docu: string, password: string }) {
  const API_URL = `${environment.urlBack}index.php/API/Login/ingreso`;
  
  try {
    // Obtener datos necesarios para headers antes de encriptar
    const conexion = getItem('conexion') || '';
    const nitStored = getItem('nit') || nit;
    const nitValidationResponse = getItem('nitValidationResponse');

    // Preparar datos para encriptación
    const loginData = {
      user: num_docu,
      password: password,
      permisos: nitValidationResponse?.modulos || [],
      userSeccion: 1
    };

    // Encriptar datos solo si tenemos la clave de encriptación
    let encryptedData;
    const cryptData = getItem('crypt');
    if (cryptData && cryptData.key) {
      encryptedData = await CryptoService.encrypt(loginData);
    } else {
      // Si no hay clave, enviar datos sin encriptar (esto podría requerir ajuste en el backend)
      console.warn('No se encontró clave de encriptación, enviando datos sin encriptar');
      encryptedData = JSON.stringify(loginData);
    }
    
    // Generar rastreo como en Angular
    const rastreo = {
      fecha: new Date().toISOString(),
      accion: 'Ingresa al Sistema Gestión Empresarial',
      tipo: 'Ingreso Sistema',
      ip: '0.0.0.0', // IP simulada
      dispositivo: 'Mobile App'
    };

    const requestData = {
      encriptado: encryptedData,
      RASTREO: rastreo
    };

    // Configurar headers exactamente como en Angular (todos deben ser strings no vacíos)
    const headers = {
      'Content-Type': 'application/json',
      'NIT': nitStored || '0',
      'Conexion': conexion || '0', 
      'Token': '0'
    };

    console.log('Enviando login con headers:', headers);
    console.log('Datos de login:', requestData);

    const response = await axios.post(API_URL, requestData, { headers });
    
    // Desencriptar respuesta si es necesario
    let decryptedResponse = response.data;
    try {
      if (response.data && typeof response.data === 'object' && response.data.ciphertext) {
        decryptedResponse = await CryptoService.decrypt(response.data);
      }
    } catch (decryptError) {
      console.warn('No se pudo desencriptar la respuesta, usando datos crudos:', decryptError);
      decryptedResponse = response.data;
    }

    // Guardar datos de usuario si el login fue exitoso
    if (decryptedResponse.valido) {
      setItem('usuario', decryptedResponse.usuario);
      if (decryptedResponse.modulos) {
        setItem('modulos', decryptedResponse.modulos);
      }
    }

    return decryptedResponse;
  } catch (error: any) {
    console.error('Error en login:', error);
    console.error('Detalles del error:', error?.response?.data);
    return { 
      valido: false, 
      mensaje: error?.response?.data?.mensaje || 'Error de conexión' 
    };
  }
}
