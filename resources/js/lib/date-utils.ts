/**
 * Utilidades de fecha para Ecuador (America/Guayaquil - UTC-5)
 * Usa date-fns para formateo consistente
 */

import { format, isToday, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { formatInTimeZone, toZonedTime } from 'date-fns-tz';

const TIMEZONE = 'America/Guayaquil';

export interface FormattedDate {
    /** Formato corto: "20/01/2026, 10:30 AM" */
    short: string;
    /** Formato largo: "lunes, 20 de enero de 2026" */
    long: string;
    /** Solo hora: "10:30 AM" */
    time: string;
    /** Solo fecha: "20/01/2026" */
    dateOnly: string;
    /** Fecha para input type="date": "2026-01-20" */
    inputDate: string;
    /** Hora para input type="time": "10:30" */
    inputTime: string;
}

/**
 * Formatear una fecha a varios formatos con zona horaria de Ecuador
 */
export function formatDateEC(dateString: string | Date): FormattedDate {
    const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;

    return {
        short: formatInTimeZone(date, TIMEZONE, "dd/MM/yyyy, hh:mm a", { locale: es }),
        long: formatInTimeZone(date, TIMEZONE, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es }),
        time: formatInTimeZone(date, TIMEZONE, "hh:mm a", { locale: es }),
        dateOnly: formatInTimeZone(date, TIMEZONE, "dd/MM/yyyy", { locale: es }),
        inputDate: formatInTimeZone(date, TIMEZONE, "yyyy-MM-dd"),
        inputTime: formatInTimeZone(date, TIMEZONE, "HH:mm"),
    };
}

/**
 * Obtener fecha y hora actual de Ecuador para inputs
 */
export function getTodayEC(): { date: string; time: string; full: string } {
    const now = new Date();

    return {
        date: formatInTimeZone(now, TIMEZONE, "yyyy-MM-dd"),
        time: formatInTimeZone(now, TIMEZONE, "HH:mm"),
        full: formatInTimeZone(now, TIMEZONE, "dd/MM/yyyy, hh:mm a", { locale: es }),
    };
}

/**
 * Obtener la fecha actual en Ecuador como objeto Date
 */
export function getNowEC(): Date {
    return toZonedTime(new Date(), TIMEZONE);
}

/**
 * Verificar si una fecha es del día actual en Ecuador
 */
export function isTodayEC(dateString: string | Date): boolean {
    const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
    const zonedDate = toZonedTime(date, TIMEZONE);
    const zonedNow = toZonedTime(new Date(), TIMEZONE);

    return (
        zonedDate.getFullYear() === zonedNow.getFullYear() &&
        zonedDate.getMonth() === zonedNow.getMonth() &&
        zonedDate.getDate() === zonedNow.getDate()
    );
}

/**
 * Obtener el título del día actual formateado
 * Ejemplo: "lunes, 20 de enero de 2026"
 */
export function getTodayTitleEC(): string {
    return formatInTimeZone(new Date(), TIMEZONE, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es });
}

/**
 * Formatear solo la hora con AM/PM
 */
export function formatTimeEC(dateString: string | Date): string {
    const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
    return formatInTimeZone(date, TIMEZONE, "hh:mm a", { locale: es });
}

/**
 * Formatear fecha relativa (hoy, ayer, etc.)
 */
export function formatRelativeEC(dateString: string | Date): string {
    const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
    const zonedDate = toZonedTime(date, TIMEZONE);

    if (isTodayEC(date)) {
        return `Hoy, ${formatInTimeZone(date, TIMEZONE, "hh:mm a", { locale: es })}`;
    }

    return formatInTimeZone(date, TIMEZONE, "dd/MM/yyyy, hh:mm a", { locale: es });
}
