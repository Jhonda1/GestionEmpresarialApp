import { format, parseISO, addDays, subDays, isValid, parse } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * Utilidades para manejo de fechas usando date-fns
 * Estas funciones reemplazan las funcionalidades de moment.js
 */
export class DateUtils {
  
  /**
   * Formatea una fecha a string
   * @param date Fecha a formatear
   * @param formatStr Formato deseado (ej: 'dd/MM/yyyy', 'yyyy-MM-dd')
   * @returns Fecha formateada como string
   */
  static formatDate(date: Date | string, formatStr: string = 'dd/MM/yyyy'): string {
    try {
      const dateObj = typeof date === 'string' ? parseISO(date) : date;
      if (!isValid(dateObj)) {
        console.warn('Fecha inválida:', date);
        return '';
      }
      return format(dateObj, formatStr, { locale: es });
    } catch (error) {
      console.error('Error al formatear fecha:', error);
      return '';
    }
  }

  /**
   * Convierte una fecha a formato ISO string (YYYY-MM-DD)
   * @param date Fecha a convertir
   * @returns Fecha en formato ISO
   */
  static toISOString(date: Date | string): string {
    try {
      const dateObj = typeof date === 'string' ? parseISO(date) : date;
      if (!isValid(dateObj)) {
        console.warn('Fecha inválida:', date);
        return '';
      }
      return format(dateObj, 'yyyy-MM-dd');
    } catch (error) {
      console.error('Error al convertir a ISO:', error);
      return '';
    }
  }

  /**
   * Parsea una fecha desde string
   * @param dateString String de fecha
   * @param formatStr Formato del string (opcional)
   * @returns Objeto Date
   */
  static parseDate(dateString: string, formatStr?: string): Date | null {
    try {
      if (formatStr) {
        const parsed = parse(dateString, formatStr, new Date());
        return isValid(parsed) ? parsed : null;
      }
      const parsed = parseISO(dateString);
      return isValid(parsed) ? parsed : null;
    } catch (error) {
      console.error('Error al parsear fecha:', error);
      return null;
    }
  }

  /**
   * Agrega días a una fecha
   * @param date Fecha base
   * @param days Días a agregar
   * @returns Nueva fecha
   */
  static addDays(date: Date | string, days: number): Date {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return addDays(dateObj, days);
  }

  /**
   * Resta días a una fecha
   * @param date Fecha base
   * @param days Días a restar
   * @returns Nueva fecha
   */
  static subtractDays(date: Date | string, days: number): Date {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return subDays(dateObj, days);
  }

  /**
   * Obtiene la fecha actual en formato ISO
   * @returns Fecha actual en formato YYYY-MM-DD
   */
  static getCurrentDate(): string {
    return format(new Date(), 'yyyy-MM-dd');
  }

  /**
   * Obtiene la fecha actual formateada
   * @param formatStr Formato deseado
   * @returns Fecha actual formateada
   */
  static getCurrentFormattedDate(formatStr: string = 'dd/MM/yyyy'): string {
    return format(new Date(), formatStr, { locale: es });
  }

  /**
   * Valida si una fecha es válida
   * @param date Fecha a validar
   * @returns true si es válida, false si no
   */
  static isValidDate(date: any): boolean {
    if (!date) return false;
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return isValid(dateObj);
  }
}
