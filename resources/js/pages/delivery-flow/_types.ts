// ==============================================================
// 📚 TIPOS COMPARTIDOS PARA DELIVERY-FLOW
// ==============================================================
// Este archivo define la "forma" de todos los datos que usamos.
// TypeScript usa estos tipos para ayudarte a evitar errores.
//
// 💡 TIP: Una "interface" es como un contrato que dice
//         qué propiedades DEBE tener un objeto.
// ==============================================================

/**
 * 👤 PROVEEDOR
 * Representa una persona o empresa que entrega flores
 */
export interface Supplier {
    id: number;        // Identificador único (viene de la base de datos)
    name: string;      // Nombre del proveedor (ej: "Flores del Valle")
    code?: string;     // Código único OPCIONAL - el signo ? indica que puede no existir
}

/**
 * 🌸 ESPECIE DE FLOR
 * Una especie es el tipo general de flor (Rosa, Clavel, Girasol, etc.)
 */
export interface Species {
    id: number;
    name: string;      // Ej: "Rosa", "Clavel", "Girasol"
}

/**
 * 🌺 VARIEDAD DE FLOR
 * Una variedad es un tipo específico dentro de una especie
 * Ej: Si la especie es "Rosa", la variedad puede ser "Freedom" o "Explorer"
 */
export interface Variety {
    id: number;
    name: string;      // Ej: "Freedom", "Explorer", "Vendela"
}

/**
 * 📂 SUBCATEGORÍA DE RECHAZO
 * Una razón específica por la que una flor fue rechazada
 * Pertenece a una categoría padre
 */
export interface Subcategory {
    id: number;
    name: string;              // Ej: "Pétalo roto", "Tallo débil"
    description: string | null; // Descripción adicional (puede ser null)
}

/**
 * 📁 CATEGORÍA DE RECHAZO
 * Agrupa las razones de rechazo en categorías generales
 * Ej: "Defectos físicos", "Plagas", "Enfermedades"
 */
export interface Category {
    id: number;
    name: string;                              // Nombre de la categoría
    description: string | null;                // Descripción opcional
    active_subcategories: Subcategory[];       // Lista de subcategorías activas
    // 💡 El tipo Subcategory[] significa "un array de Subcategory"
}

/**
 * ❌ RECHAZO EXISTENTE
 * Representa un registro de rechazo guardado en la base de datos
 */
export interface ExistingRejection {
    id: number;
    rejection_category_id: number;             // A qué categoría pertenece
    rejection_subcategory_id: number | null;   // Subcategoría (puede ser null)
    quantity: number;                          // Cuántos tallos rechazados
    detail: string | null;                     // Detalle adicional opcional
}

/**
 * 📊 CLASIFICACIÓN DE TALLOS
 * Contiene cuántos tallos hay de cada tamaño y sus precios
 *
 * Los tallos se clasifican por tamaño en centímetros:
 * - cm_40, cm_50, cm_60... hasta cm_120
 * - "sobrante" son los que no caben en ninguna categoría
 */
export interface Classification {
    id: number;

    // 📏 CANTIDAD DE TALLOS POR TAMAÑO (en centímetros)
    cm_40: number;      // Tallos de 40cm
    cm_50: number;      // Tallos de 50cm
    cm_60: number;      // Tallos de 60cm
    cm_70: number;      // Tallos de 70cm
    cm_80: number;      // Tallos de 80cm
    cm_90: number;      // Tallos de 90cm
    cm_100: number;     // Tallos de 100cm
    cm_110: number;     // Tallos de 110cm
    cm_120: number;     // Tallos de 120cm
    sobrante: number;   // Tallos sobrantes (no clasificados por tamaño)

    // 💰 PRECIOS POR CADA TAMAÑO (en dólares)
    price_40: number;
    price_50: number;
    price_60: number;
    price_70: number;
    price_80: number;
    price_90: number;
    price_100: number;
    price_110: number;
    price_120: number;
    price_sobrante: number;

    // 📈 TOTALES CALCULADOS
    total_classified: number;  // Total de tallos clasificados (exportables)
    total_price: number;       // Precio total de la clasificación
    is_complete: boolean;      // ¿Se clasificaron TODOS los tallos?

    // 🏠 FLOR LOCAL (no se exporta, se vende localmente)
    local_quantity: number;    // Cantidad de flor local
    local_is_complete: boolean; // ¿Se clasificó toda la flor local?

    // ❌ RECHAZOS asociados a esta clasificación
    rejections: ExistingRejection[];
}

/**
 * 📦 ENTRADA DE PRODUCTO
 * Representa UNA variedad de flor dentro de una entrega
 * Ej: "500 tallos de Rosa Freedom"
 */
export interface ProductEntry {
    id: number;
    species: Species;                        // La especie (ej: Rosa)
    variety: Variety;                        // La variedad (ej: Freedom)
    quantity: number;                        // Cantidad de tallos entregados
    stem_classification: Classification | null; // Su clasificación (puede no tener aún)
    // 💡 El tipo "Classification | null" significa que puede ser Classification O null
}

/**
 * 📋 GRUPO DE ENTRADAS (UNA ENTREGA COMPLETA)
 * Agrupa todas las variedades entregadas por UN proveedor en UNA fecha
 * Ej: "Proveedor Juan entregó 3 variedades el 21 de enero"
 */
export interface ProductEntryGroup {
    id: number;
    supplier: Supplier;              // El proveedor que hizo la entrega
    entry_datetime: string;          // Fecha y hora de la entrega (formato ISO)
    notes: string | null;            // Notas adicionales opcionales
    entries: ProductEntry[];         // Lista de todas las variedades entregadas
}

/**
 * 🔍 ESPECIE EXISTENTE (para autocompletado)
 * Lista de especies que ya están en el sistema
 */
export interface ExistingSpecies {
    id: number;
    name: string;
}

/**
 * 🔍 VARIEDAD EXISTENTE (para autocompletado)
 * Lista de variedades que ya están en el sistema
 */
export interface ExistingVariety {
    id: number;
    name: string;
    species_id: number;   // A qué especie pertenece esta variedad
}

// ==============================================================
// 📝 TIPOS PARA EL FORMULARIO DE EDICIÓN
// ==============================================================
// Estos tipos son para manejar los datos mientras el usuario
// está editando el formulario. Usamos "string" en vez de "number"
// porque los inputs de HTML siempre devuelven texto.
// ==============================================================

/**
 * ✏️ ENTRADA EDITABLE
 * Versión "editable" de ProductEntry para usar en formularios
 *
 * 💡 La diferencia con ProductEntry es que aquí todo son strings
 *    porque vienen de inputs de texto en el formulario
 */
export interface EditableEntry {
    id: number | string;        // Puede ser número (existente) o string (nuevo como "new-1")
    isNew?: boolean;            // ¿Es una entrada nueva que aún no existe en BD?
    species_name: string;       // Nombre de la especie
    variety_name: string;       // Nombre de la variedad
    quantity: string;           // Cantidad (string porque viene de un input)
    originalQuantity: number;   // Cantidad original (para calcular diferencias)
    addQuantity: string;        // Cantidad a AGREGAR
    removeQuantity: string;     // Cantidad a QUITAR
    exportable: ExportableData; // Datos de clasificación exportable
    prices: PricesData;         // Precios por tamaño
    localFlower: Record<string, string>; // Flor local por categoría
    // 💡 Record<string, string> es un objeto donde las claves y valores son strings
    //    Ej: { "cat_1": "50", "sub_3": "25" }
    exportableOpen: boolean;    // ¿Está abierta la sección de exportable?
    localFlowerOpen: boolean;   // ¿Está abierta la sección de flor local?
}

/**
 * 📏 DATOS DE EXPORTABLE (editable)
 * Cantidad de tallos por tamaño - en formato string para formularios
 */
export interface ExportableData {
    cm_40: string;    // "50" (como string, no número)
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

/**
 * 💰 DATOS DE PRECIOS (editable)
 * Precio por cada tamaño - en formato string para formularios
 */
export interface PricesData {
    price_40: string;   // "0.25" (como string)
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

/**
 * 📊 TOTALES DE UNA ENTRADA
 * Cálculos resumidos de una sola variedad
 */
export interface EntryTotals {
    quantity: number;           // Cantidad total de tallos entregados
    totalExportable: number;    // Total clasificado como exportable
    totalLocal: number;         // Total clasificado como flor local
    totalClassified: number;    // Total clasificado (exportable + local)
    remaining: number;          // Restante por clasificar (quantity - totalClassified)
}

/**
 * 📊 TOTALES GLOBALES
 * Cálculos resumidos de TODAS las entradas de una entrega
 */
export interface GlobalTotals {
    totalQuantity: number;      // Suma de todos los tallos
    totalExportable: number;    // Suma de todo el exportable
    totalLocal: number;         // Suma de toda la flor local
    totalPrice: number;         // Precio total de todo
    totalClassified: number;    // Total clasificado
    remaining: number;          // Total restante por clasificar
    progress: number;           // Porcentaje de progreso (0-100)
}

/**
 * 📐 CONFIGURACIÓN DE TAMAÑO DE TALLO
 * Define la información de cada tamaño para renderizar formularios
 */
export interface StemSize {
    key: string;       // Clave para el dato (ej: "cm_40")
    priceKey: string;  // Clave para el precio (ej: "price_40")
    label: string;     // Etiqueta para mostrar (ej: "40")
    unit: string;      // Unidad (ej: "cm" o vacío para sobrante)
}

