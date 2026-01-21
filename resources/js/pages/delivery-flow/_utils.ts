/**
 * UTILIDADES PARA EL MÓDULO DELIVERY FLOW
 * 
 * Este archivo contiene funciones helper y constantes reutilizables
 * para todo el módulo de Entrega y Postcosecha.
 * 
 * Contenido:
 * 1. Funciones de fecha (re-exportadas)
 * 2. Configuración de tamaños de tallo
 * 3. Funciones para crear datos vacíos
 * 4. Validaciones de entrada
 * 5. Cálculos de totales
 */

import type {
    Category,
    EditableEntry,
    EntryTotals,
    ExportableData,
    PricesData,
    StemSize,
} from './_types';

// ============================================================================
// 1. FUNCIONES DE FECHA (Ecuador timezone)
// ============================================================================

// Re-exportamos las funciones de fecha del hook global para facilitar el acceso
export {
    formatDateEC,         // Formatea fecha en timezone de Ecuador
    formatRelativeEC,     // Formatea fecha relativa (ej: "hace 2 horas")
    formatTimeEC,         // Formatea solo la hora
    getTodayEC,           // Obtiene la fecha/hora actual de Ecuador
    getTodayTitleEC,      // Obtiene título del día (ej: "Hoy, 21 de enero")
    isTodayEC,            // Verifica si una fecha es hoy en Ecuador
} from '@/lib/date-utils';

// Alias para compatibilidad con código antiguo
export { getTodayEC as getEcuadorDateTime } from '@/lib/date-utils';

// ============================================================================
// 2. CONFIGURACIÓN DE TAMAÑOS DE TALLO
// ============================================================================

/**
 * TAMAÑOS_DE_TALLO_DISPONIBLES
 * 
 * Define todos los tamaños de clasificación de tallos que se usan en el sistema.
 * 
 * Las flores se clasifican por la longitud del tallo en centímetros.
 * Cada tamaño tiene asociado:
 * - Una clave para la cantidad (ej: cm_40)
 * - Una clave para el precio (ej: price_40)
 * - Una etiqueta visible (ej: "40")
 * - Una unidad (ej: "cm")
 * 
 * Los tamaños van desde 40cm hasta 120cm en incrementos de 10cm,
 * más una categoría especial "Sobrante" para tallos que no cumplen
 * con las medidas estándar.
 */
export const STEM_SIZES: StemSize[] = [
    { key: 'cm_40', priceKey: 'price_40', label: '40', unit: 'cm' },
    { key: 'cm_50', priceKey: 'price_50', label: '50', unit: 'cm' },
    { key: 'cm_60', priceKey: 'price_60', label: '60', unit: 'cm' },
    { key: 'cm_70', priceKey: 'price_70', label: '70', unit: 'cm' },
    { key: 'cm_80', priceKey: 'price_80', label: '80', unit: 'cm' },
    { key: 'cm_90', priceKey: 'price_90', label: '90', unit: 'cm' },
    { key: 'cm_100', priceKey: 'price_100', label: '100', unit: 'cm' },
    { key: 'cm_110', priceKey: 'price_110', label: '110', unit: 'cm' },
    { key: 'cm_120', priceKey: 'price_120', label: '120', unit: 'cm' },
    {
        key: 'sobrante',
        priceKey: 'price_sobrante',
        label: 'Sobrante',
        unit: '',
    },
];

// ============================================================================
// 3. FUNCIONES PARA CREAR DATOS VACÍOS
// ============================================================================

/**
 * Crear objeto de datos exportables vacío
 * 
 * Crea un objeto con todos los tamaños de tallo inicializados como string vacío.
 * Se usa al crear una nueva entrada de producto para tener la estructura completa.
 * 
 * @returns Objeto ExportableData con todos los campos vacíos
 */
export const createEmptyExportable = (): ExportableData => ({
    cm_40: '',
    cm_50: '',
    cm_60: '',
    cm_70: '',
    cm_80: '',
    cm_90: '',
    cm_100: '',
    cm_110: '',
    cm_120: '',
    sobrante: '',
});

/**
 * Crear objeto de precios vacío
 * 
 * Crea un objeto con todos los precios por tamaño inicializados como string vacío.
 * Se usa al crear una nueva entrada de producto para tener la estructura completa.
 * 
 * @returns Objeto PricesData con todos los campos vacíos
 */
export const createEmptyPrices = (): PricesData => ({
    price_40: '',
    price_50: '',
    price_60: '',
    price_70: '',
    price_80: '',
    price_90: '',
    price_100: '',
    price_110: '',
    price_120: '',
    price_sobrante: '',
});

// ============================================================================
// 4. VALIDACIONES DE ENTRADA
// ============================================================================

/**
 * Limpiar valor numérico
 * 
 * Elimina ceros a la izquierda de un número para evitar problemas de formato.
 * Por ejemplo: "007" → "7", "0123" → "123"
 * 
 * @param value - El valor string a limpiar
 * @returns El valor sin ceros a la izquierda
 */
export const cleanNumericValue = (value: string): string => {
    return value.replace(/^0+(?=\d)/, '');
};

/**
 * Validar si es un número entero válido
 * 
 * Verifica que el string sea vacío o contenga solo dígitos.
 * Se usa para validar cantidades de tallos.
 * 
 * @param value - El valor a validar
 * @returns true si es válido, false si no
 */
export const isValidNumber = (value: string): boolean => {
    return value === '' || /^\d+$/.test(value);
};

/**
 * Validar si es un precio válido
 * 
 * Verifica que el string sea un número decimal válido con hasta 2 decimales.
 * Acepta formatos como: "10", "10.5", "10.50", ".50"
 * Se usa para validar precios de tallos.
 * 
 * @param value - El valor a validar
 * @returns true si es válido, false si no
 */
export const isValidPrice = (value: string): boolean => {
    const cleanValue = value.replace(/[^0-9.]/g, '');
    return cleanValue === '' || /^\d*\.?\d{0,2}$/.test(cleanValue);
};

// ============================================================================
// 5. CÁLCULOS DE TOTALES
// ============================================================================

/**
 * Calcular totales de una entrada
 * 
 * Calcula todos los totales de una entrada (variedad) mientras se está clasificando:
 * - Cantidad total recibida
 * - Total de tallos exportables (suma de todos los tamaños)
 * - Total de flor local (suma de todas las categorías de rechazo)
 * - Total clasificado (exportable + local)
 * - Tallos restantes por clasificar
 * 
 * Este cálculo se hace en tiempo real para mostrar el progreso al usuario
 * y detectar si hay inconsistencias (ej: clasificó más de lo que recibió).
 * 
 * @param entry - La entrada que se está clasificando
 * @param categories - Las categorías de rechazo disponibles
 * @returns Objeto con todos los totales calculados
 */
export const getEntryTotals = (
    entry: EditableEntry,
    categories: Category[],
): EntryTotals => {
    // 1. Obtener la cantidad total recibida
    const quantity = Number(entry.quantity) || 0;
    
    // 2. Calcular total de tallos exportables
    // Sumamos todos los valores del objeto exportable (cm_40, cm_50, etc.)
    const totalExportable = Object.values(entry.exportable).reduce(
        (sum, val) => sum + (Number(val) || 0),
        0,
    );

    // 3. Calcular total de flor local (rechazos)
    let totalLocal = 0;
    
    // Iteramos cada categoría de rechazo
    categories.forEach((category) => {
        // Sumamos la cantidad de la categoría (si no tiene subcategorías)
        totalLocal += Number(entry.localFlower[`cat_${category.id}`]) || 0;
        
        // Sumamos las cantidades de cada subcategoría
        category.active_subcategories?.forEach((subcategory) => {
            totalLocal += Number(entry.localFlower[`sub_${subcategory.id}`]) || 0;
        });
    });

    // 4. Calcular total clasificado (exportable + local)
    const totalClassified = totalExportable + totalLocal;
    
    // 5. Calcular tallos restantes (puede ser negativo si se clasificó de más)
    const remaining = quantity - totalClassified;

    return {
        quantity,
        totalExportable,
        totalLocal,
        totalClassified,
        remaining,
    };
};

/**
 * Calcular precio total de una entrada
 * 
 * Calcula el valor total en dólares de los tallos exportables de una entrada.
 * Para cada tamaño de tallo:
 *   - Multiplica la cantidad por el precio
 *   - Suma todos los subtotales
 * 
 * Por ejemplo:
 *   - 100 tallos de 40cm a $0.50 = $50
 *   - 50 tallos de 60cm a $0.75 = $37.50
 *   - Total = $87.50
 * 
 * @param entry - La entrada con los datos de clasificación
 * @returns El precio total en dólares
 */
export const calculateEntryTotalPrice = (entry: EditableEntry): number => {
    let total = 0;
    
    // Iteramos cada tamaño de tallo disponible
    STEM_SIZES.forEach(({ key, priceKey }) => {
        // Obtenemos la cantidad de tallos de este tamaño
        const qty = Number(entry.exportable[key as keyof ExportableData]) || 0;
        
        // Obtenemos el precio por tallo de este tamaño
        const price = Number(entry.prices[priceKey as keyof PricesData]) || 0;
        
        // Sumamos al total: cantidad × precio
        total += qty * price;
    });
    
    return total;
};
