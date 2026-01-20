import type {
    Category,
    EditableEntry,
    EntryTotals,
    ExportableData,
    PricesData,
    StemSize,
} from './_types';

// Re-exportar funciones de fecha del hook global
export {
    formatDateEC,
    formatRelativeEC,
    formatTimeEC,
    getTodayEC,
    getTodayTitleEC,
    isTodayEC,
} from '@/lib/date-utils';

// Alias para compatibilidad
export { getTodayEC as getEcuadorDateTime } from '@/lib/date-utils';

// Configuración de tamaños de tallo
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

// Crear exportable vacío
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

// Crear precios vacíos
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

// Limpiar valor numérico (eliminar ceros a la izquierda)
export const cleanNumericValue = (value: string): string => {
    return value.replace(/^0+(?=\d)/, '');
};

// Validar si es número válido
export const isValidNumber = (value: string): boolean => {
    return value === '' || /^\d+$/.test(value);
};

// Validar si es precio válido (decimal con hasta 2 decimales)
export const isValidPrice = (value: string): boolean => {
    const cleanValue = value.replace(/[^0-9.]/g, '');
    return cleanValue === '' || /^\d*\.?\d{0,2}$/.test(cleanValue);
};

// Calcular totales para una entrada
export const getEntryTotals = (
    entry: EditableEntry,
    categories: Category[],
): EntryTotals => {
    const quantity = Number(entry.quantity) || 0;
    const totalExportable = Object.values(entry.exportable).reduce(
        (sum, val) => sum + (Number(val) || 0),
        0,
    );

    let totalLocal = 0;
    categories.forEach((cat) => {
        totalLocal += Number(entry.localFlower[`cat_${cat.id}`]) || 0;
        cat.active_subcategories?.forEach((sub) => {
            totalLocal += Number(entry.localFlower[`sub_${sub.id}`]) || 0;
        });
    });

    const totalClassified = totalExportable + totalLocal;
    const remaining = quantity - totalClassified;

    return {
        quantity,
        totalExportable,
        totalLocal,
        totalClassified,
        remaining,
    };
};

// Calcular total de precios de una entrada
export const calculateEntryTotalPrice = (entry: EditableEntry): number => {
    let total = 0;
    STEM_SIZES.forEach(({ key, priceKey }) => {
        const qty = Number(entry.exportable[key as keyof ExportableData]) || 0;
        const price = Number(entry.prices[priceKey as keyof PricesData]) || 0;
        total += qty * price;
    });
    return total;
};
