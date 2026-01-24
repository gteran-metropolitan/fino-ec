/**
 * =====================================================
 * 📅 UTILIDADES DE FECHA - ZONA HORARIA ECUADOR
 * =====================================================
 *
 * Este archivo centraliza todo el manejo de fechas del sistema.
 * SIEMPRE usa la zona horaria de Ecuador (America/Guayaquil),
 * sin importar dónde esté el navegador del usuario.
 *
 * Usa la librería date-fns-tz para conversiones de zona horaria.
 */

import { parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { formatInTimeZone, toZonedTime } from 'date-fns-tz';

// =====================================================
// ⚙️ CONFIGURACIÓN
// =====================================================

const ECUADOR_TIMEZONE = 'America/Guayaquil';

// Formatos de fecha reutilizables
const FORMATS = {
    inputDate: 'yyyy-MM-dd',        // Para <input type="date">
    inputTime: 'HH:mm',             // Para <input type="time">
    dateShort: 'dd/MM/yyyy',        // 23/01/2026
    dateTime: 'dd/MM/yyyy, hh:mm a', // 23/01/2026, 10:30 AM
    dateLong: "EEEE, d 'de' MMMM 'de' yyyy", // lunes, 23 de enero de 2026
    time: 'hh:mm a',                // 10:30 AM
};

// =====================================================
// 🔧 HELPERS INTERNOS
// =====================================================

/** Convierte string o Date a objeto Date */
function toDate(value: string | Date): Date {
    return typeof value === 'string' ? parseISO(value) : value;
}

/** Formatea una fecha en la zona horaria de Ecuador */
function formatEC(date: Date, format: string): string {
    return formatInTimeZone(date, ECUADOR_TIMEZONE, format, { locale: es });
}

// =====================================================
// 📤 TIPOS EXPORTADOS
// =====================================================

export interface FormattedDate {
    short: string;     // "23/01/2026, 10:30 AM"
    long: string;      // "lunes, 23 de enero de 2026"
    time: string;      // "10:30 AM"
    dateOnly: string;  // "23/01/2026"
    inputDate: string; // "2026-01-23" (para inputs)
    inputTime: string; // "10:30" (para inputs)
}

// =====================================================
// 📤 FUNCIONES EXPORTADAS
// =====================================================

/**
 * Formatea una fecha en múltiples formatos útiles
 *
 * @example
 * const fecha = formatDateEC('2026-01-23T10:30:00');
 * fecha.short     // "23/01/2026, 10:30 AM"
 * fecha.inputDate // "2026-01-23"
 */
export function formatDateEC(dateString: string | Date): FormattedDate {
    const date = toDate(dateString);

    return {
        short: formatEC(date, FORMATS.dateTime),
        long: formatEC(date, FORMATS.dateLong),
        time: formatEC(date, FORMATS.time),
        dateOnly: formatEC(date, FORMATS.dateShort),
        inputDate: formatEC(date, FORMATS.inputDate),
        inputTime: formatEC(date, FORMATS.inputTime),
    };
}

/**
 * Obtiene la fecha y hora ACTUAL de Ecuador
 * Útil para precargar inputs de fecha/hora
 *
 * @example
 * const ahora = getTodayEC();
 * ahora.date // "2026-01-23"
 * ahora.time // "10:30"
 */
export function getTodayEC(): { date: string; time: string; full: string } {
    const now = new Date();

    return {
        date: formatEC(now, FORMATS.inputDate),
        time: formatEC(now, FORMATS.inputTime),
        full: formatEC(now, FORMATS.dateTime),
    };
}

/**
 * Verifica si una fecha es del día de HOY en Ecuador
 *
 * @example
 * isTodayEC('2026-01-23T10:00:00') // true si hoy es 23 de enero
 */
export function isTodayEC(dateString: string | Date): boolean {
    const date = toDate(dateString);
    const zonedDate = toZonedTime(date, ECUADOR_TIMEZONE);
    const zonedNow = toZonedTime(new Date(), ECUADOR_TIMEZONE);

    const sameYear = zonedDate.getFullYear() === zonedNow.getFullYear();
    const sameMonth = zonedDate.getMonth() === zonedNow.getMonth();
    const sameDay = zonedDate.getDate() === zonedNow.getDate();

    return sameYear && sameMonth && sameDay;
}

/**
 * Obtiene el título del día actual
 *
 * @example
 * getTodayTitleEC() // "lunes, 23 de enero de 2026"
 */
export function getTodayTitleEC(): string {
    return formatEC(new Date(), FORMATS.dateLong);
}

/**
 * Formatea solo la hora de una fecha
 *
 * @example
 * formatTimeEC('2026-01-23T10:30:00') // "10:30 AM"
 */
export function formatTimeEC(dateString: string | Date): string {
    return formatEC(toDate(dateString), FORMATS.time);
}

/**
 * Formatea fecha de forma relativa (muestra "Hoy" si es hoy)
 *
 * @example
 * formatRelativeEC('2026-01-23T10:30:00')
 * // Si es hoy: "Hoy, 10:30 AM"
 * // Si no: "23/01/2026, 10:30 AM"
 */
export function formatRelativeEC(dateString: string | Date): string {
    const date = toDate(dateString);

    if (isTodayEC(date)) {
        return `Hoy, ${formatEC(date, FORMATS.time)}`;
    }

    return formatEC(date, FORMATS.dateTime);
}
