// ==============================================================
// 🛠️ FUNCIONES UTILITARIAS (HELPERS)
// ==============================================================
// Este archivo contiene funciones "helper" que se usan en varios
// lugares del módulo. Son funciones pequeñas y reutilizables.
//
// 💡 TIP: Las funciones utilitarias son "puras" - solo reciben
//         datos, los procesan y devuelven un resultado.
//         No modifican el estado ni tienen efectos secundarios.
// ==============================================================

import type {
    Category,
    EditableEntry,
    EntryTotals,
    ExportableData,
    PricesData,
    StemSize,
} from './_types';

// ==============================================================
// 📅 FUNCIONES DE FECHA
// ==============================================================
// Re-exportamos funciones de fecha desde la librería global
// Esto permite importarlas desde aquí o desde @/lib/date-utils

export {
    formatDateEC,      // Formatea una fecha al estilo Ecuador
    formatRelativeEC,  // Muestra "hace 2 horas", "ayer", etc.
    formatTimeEC,      // Formatea solo la hora
    getTodayEC,        // Obtiene la fecha de hoy en Ecuador
    getTodayTitleEC,   // Obtiene un título como "Lunes, 21 de enero de 2026"
    isTodayEC,         // Verifica si una fecha es hoy
} from '@/lib/date-utils';

// Alias para compatibilidad con código antiguo
export { getTodayEC as getEcuadorDateTime } from '@/lib/date-utils';

// ==============================================================
// 📐 CONFIGURACIÓN DE TAMAÑOS DE TALLO
// ==============================================================
// Este array define todos los tamaños de tallo disponibles.
// Se usa para generar formularios y hacer cálculos.
//
// 💡 TIP: Definir esto como constante evita errores de tipeo
//         y hace fácil agregar/quitar tamaños en el futuro.

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
        unit: '',  // Sin unidad porque no es un tamaño específico
    },
];

// ==============================================================
// 🏭 FUNCIONES FACTORY (Crean objetos vacíos)
// ==============================================================
// Estas funciones crean objetos con valores iniciales vacíos.
// Se usan cuando agregamos una nueva entrada al formulario.

/**
 * Crea un objeto ExportableData con todos los valores vacíos
 *
 * @returns Un objeto con todas las claves de tamaño en string vacío
 *
 * 💡 Ejemplo de uso:
 *    const nuevoExportable = createEmptyExportable();
 *    // { cm_40: '', cm_50: '', ... }
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
 * Crea un objeto PricesData con todos los precios vacíos
 *
 * @returns Un objeto con todas las claves de precio en string vacío
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

// ==============================================================
// ✅ FUNCIONES DE VALIDACIÓN Y LIMPIEZA
// ==============================================================
// Estas funciones limpian y validan la entrada del usuario.

/**
 * Limpia ceros a la izquierda de un número
 *
 * @param value - El valor a limpiar (ej: "007")
 * @returns El valor sin ceros a la izquierda (ej: "7")
 *
 * 💡 Ejemplo:
 *    cleanNumericValue("007") → "7"
 *    cleanNumericValue("100") → "100"
 *    cleanNumericValue("0")   → "0"
 *
 * 💡 La expresión regular /^0+(?=\d)/ significa:
 *    ^0+    = uno o más ceros al inicio
 *    (?=\d) = seguido de un dígito (pero no lo incluye en el reemplazo)
 */
export const cleanNumericValue = (value: string): string => {
    return value.replace(/^0+(?=\d)/, '');
};

/**
 * Verifica si un string es un número entero válido
 *
 * @param value - El valor a validar
 * @returns true si es vacío o solo contiene dígitos
 *
 * 💡 Ejemplo:
 *    isValidNumber("123") → true
 *    isValidNumber("")    → true (vacío es válido)
 *    isValidNumber("12.5") → false (tiene punto)
 *    isValidNumber("abc") → false
 */
export const isValidNumber = (value: string): boolean => {
    return value === '' || /^\d+$/.test(value);
};

/**
 * Verifica si un string es un precio válido (decimal con hasta 2 decimales)
 *
 * @param value - El valor a validar
 * @returns true si es un precio válido
 *
 * 💡 Ejemplo:
 *    isValidPrice("12.50") → true
 *    isValidPrice("12")    → true
 *    isValidPrice("12.5")  → true
 *    isValidPrice("12.555") → false (más de 2 decimales)
 *
 * 💡 La expresión regular /^\d*\.?\d{0,2}$/ significa:
 *    ^\d*   = cero o más dígitos al inicio
 *    \.?    = opcionalmente un punto decimal
 *    \d{0,2}$ = de 0 a 2 dígitos al final
 */
export const isValidPrice = (value: string): boolean => {
    const cleanValue = value.replace(/[^0-9.]/g, '');
    return cleanValue === '' || /^\d*\.?\d{0,2}$/.test(cleanValue);
};

// ==============================================================
// 📊 FUNCIONES DE CÁLCULO
// ==============================================================
// Estas funciones calculan totales y resúmenes.

/**
 * Calcula los totales de una entrada (una variedad)
 *
 * @param entry - La entrada editable
 * @param categories - Las categorías de rechazo (para calcular flor local)
 * @returns Un objeto EntryTotals con todos los cálculos
 *
 * 💡 Esta función:
 *    1. Suma todos los valores de exportable
 *    2. Suma todos los valores de flor local (por categoría y subcategoría)
 *    3. Calcula el total clasificado y el restante
 */
export const getEntryTotals = (
    entry: EditableEntry,
    categories: Category[],
): EntryTotals => {
    // Obtener la cantidad total (convertir string a número, o 0 si está vacío)
    const quantity = Number(entry.quantity) || 0;

    // Sumar todos los valores de exportable
    // Object.values() obtiene un array con los valores del objeto
    // .reduce() suma todos los valores
    const totalExportable = Object.values(entry.exportable).reduce(
        (sum, val) => sum + (Number(val) || 0),
        0,  // Valor inicial de la suma
    );

    // Sumar todos los valores de flor local
    let totalLocal = 0;

    // Recorremos cada categoría
    categories.forEach((cat) => {
        // Sumamos el valor de la categoría (ej: localFlower["cat_1"])
        totalLocal += Number(entry.localFlower[`cat_${cat.id}`]) || 0;

        // Recorremos las subcategorías y sumamos sus valores
        cat.active_subcategories?.forEach((sub) => {
            totalLocal += Number(entry.localFlower[`sub_${sub.id}`]) || 0;
        });
    });

    // Total clasificado = exportable + local
    const totalClassified = totalExportable + totalLocal;

    // Restante = cantidad original - lo que ya se clasificó
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
 * Calcula el precio total de una entrada
 *
 * @param entry - La entrada editable
 * @returns El precio total (suma de cantidad × precio para cada tamaño)
 *
 * 💡 Fórmula: Σ (cantidad_tamaño × precio_tamaño)
 *    Ej: (50 tallos × $0.25) + (100 tallos × $0.30) = $42.50
 */
export const calculateEntryTotalPrice = (entry: EditableEntry): number => {
    let total = 0;

    // Recorremos cada tamaño de tallo
    STEM_SIZES.forEach(({ key, priceKey }) => {
        // Obtenemos la cantidad de ese tamaño
        // "as keyof ExportableData" le dice a TypeScript que key es una clave válida
        const qty = Number(entry.exportable[key as keyof ExportableData]) || 0;

        // Obtenemos el precio de ese tamaño
        const price = Number(entry.prices[priceKey as keyof PricesData]) || 0;

        // Sumamos cantidad × precio
        total += qty * price;
    });

    return total;
};
