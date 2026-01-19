/**
 * Formatea una fecha al formato corto: dd/mm/yyyy HH:mm
 */
export const formatDateShort = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString('es-EC', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone: 'America/Guayaquil',
    });
};

/**
 * Formatea una fecha al formato largo: Lunes, 10 de enero de 2026
 */
export const formatDateLong = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-EC', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        timeZone: 'America/Guayaquil',
    });
};

/**
 * Componente para mostrar fecha en formato corto y largo
 */
export const formatDateWithLong = (dateString: string): { short: string; long: string } => {
    return {
        short: formatDateShort(dateString),
        long: formatDateLong(dateString),
    };
};

