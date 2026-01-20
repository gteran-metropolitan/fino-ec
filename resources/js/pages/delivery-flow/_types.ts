// Tipos compartidos para delivery-flow

export interface Supplier {
    id: number;
    name: string;
    code?: string;
}

export interface Species {
    id: number;
    name: string;
}

export interface Variety {
    id: number;
    name: string;
}

export interface Subcategory {
    id: number;
    name: string;
    description: string | null;
}

export interface Category {
    id: number;
    name: string;
    description: string | null;
    active_subcategories: Subcategory[];
}

export interface ExistingRejection {
    id: number;
    rejection_category_id: number;
    rejection_subcategory_id: number | null;
    quantity: number;
    detail: string | null;
}

export interface Classification {
    id: number;
    cm_40: number;
    price_40: number;
    cm_50: number;
    price_50: number;
    cm_60: number;
    price_60: number;
    cm_70: number;
    price_70: number;
    cm_80: number;
    price_80: number;
    cm_90: number;
    price_90: number;
    cm_100: number;
    price_100: number;
    cm_110: number;
    price_110: number;
    cm_120: number;
    price_120: number;
    sobrante: number;
    price_sobrante: number;
    total_classified: number;
    total_price: number;
    is_complete: boolean;
    local_quantity: number;
    local_is_complete: boolean;
    rejections: ExistingRejection[];
}

export interface ProductEntry {
    id: number;
    species: Species;
    variety: Variety;
    quantity: number;
    stem_classification: Classification | null;
}

export interface ProductEntryGroup {
    id: number;
    supplier: Supplier;
    entry_datetime: string;
    notes: string | null;
    entries: ProductEntry[];
}

export interface ExistingSpecies {
    id: number;
    name: string;
}

export interface ExistingVariety {
    id: number;
    name: string;
    species_id: number;
}

// Estado editable de una entrada
export interface EditableEntry {
    id: number | string;
    isNew?: boolean;
    species_name: string;
    variety_name: string;
    quantity: string;
    originalQuantity: number;
    addQuantity: string;
    removeQuantity: string;
    exportable: ExportableData;
    prices: PricesData;
    localFlower: Record<string, string>;
    exportableOpen: boolean;
    localFlowerOpen: boolean;
}

export interface ExportableData {
    cm_40: string;
    cm_50: string;
    cm_60: string;
    cm_70: string;
    cm_80: string;
    cm_90: string;
    cm_100: string;
    cm_110: string;
    cm_120: string;
    sobrante: string;
}

export interface PricesData {
    price_40: string;
    price_50: string;
    price_60: string;
    price_70: string;
    price_80: string;
    price_90: string;
    price_100: string;
    price_110: string;
    price_120: string;
    price_sobrante: string;
}

export interface EntryTotals {
    quantity: number;
    totalExportable: number;
    totalLocal: number;
    totalClassified: number;
    remaining: number;
}

export interface GlobalTotals {
    totalQuantity: number;
    totalExportable: number;
    totalLocal: number;
    totalPrice: number;
    totalClassified: number;
    remaining: number;
    progress: number;
}

export interface StemSize {
    key: string;
    priceKey: string;
    label: string;
    unit: string;
}

