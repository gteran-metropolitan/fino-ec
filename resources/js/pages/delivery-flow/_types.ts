/**
 * TIPOS COMPARTIDOS PARA EL MÓDULO DELIVERY FLOW
 * 
 * Este archivo contiene todas las definiciones de tipos TypeScript utilizadas
 * en el módulo de Entrega y Postcosecha (Delivery Flow).
 * 
 * Organización:
 * 1. Entidades básicas (Proveedor, Especie, Variedad)
 * 2. Clasificación y rechazos
 * 3. Entradas de productos
 * 4. Estados editables
 * 5. Totales y resúmenes
 */

// ============================================================================
// 1. ENTIDADES BÁSICAS
// ============================================================================

/**
 * Proveedor - Representa a un proveedor de flores
 */
export interface Supplier {
    id: number;              // ID único del proveedor
    name: string;            // Nombre completo del proveedor
    code?: string;           // Código único del proveedor (opcional)
}

/**
 * Especie - Tipo de flor (ejemplo: Rosa, Clavel, Gypsophila)
 */
export interface Species {
    id: number;              // ID único de la especie
    name: string;            // Nombre de la especie
}

/**
 * Variedad - Variedad específica dentro de una especie
 * (ejemplo: Rosa -> Freedom, Rosa -> Vendela)
 */
export interface Variety {
    id: number;              // ID único de la variedad
    name: string;            // Nombre de la variedad
}

// ============================================================================
// 2. CATEGORÍAS DE RECHAZO (FLOR LOCAL)
// ============================================================================

/**
 * Subcategoría de rechazo - Clasificación detallada dentro de una categoría
 */
export interface Subcategory {
    id: number;                      // ID único de la subcategoría
    name: string;                    // Nombre de la subcategoría
    description: string | null;      // Descripción detallada (opcional)
}

/**
 * Categoría de rechazo - Razón principal por la que una flor no es exportable
 * (ejemplo: Defectos, Tamaño pequeño, Daño mecánico)
 */
export interface Category {
    id: number;                          // ID único de la categoría
    name: string;                        // Nombre de la categoría
    description: string | null;          // Descripción detallada (opcional)
    active_subcategories: Subcategory[]; // Subcategorías activas asociadas
}

/**
 * Rechazo existente - Registro de flores rechazadas previamente guardado
 */
export interface ExistingRejection {
    id: number;                         // ID único del rechazo
    rejection_category_id: number;      // ID de la categoría de rechazo
    rejection_subcategory_id: number | null; // ID de la subcategoría (si aplica)
    quantity: number;                   // Cantidad de tallos rechazados
    detail: string | null;              // Detalle adicional (opcional)
}

// ============================================================================
// 3. CLASIFICACIÓN DE TALLOS
// ============================================================================

/**
 * Clasificación de tallos - Clasificación completa de una entrada de flores
 * 
 * Las flores se clasifican por tamaño (longitud del tallo en cm) para exportación.
 * Cada tamaño tiene una cantidad y un precio asociado.
 * 
 * Tamaños disponibles: 40, 50, 60, 70, 80, 90, 100, 110, 120 cm + Sobrante
 */
export interface Classification {
    id: number;                      // ID único de la clasificación
    
    // Cantidades por tamaño de tallo (en centímetros)
    cm_40: number;                   // Cantidad de tallos de 40cm
    cm_50: number;                   // Cantidad de tallos de 50cm
    cm_60: number;                   // Cantidad de tallos de 60cm
    cm_70: number;                   // Cantidad de tallos de 70cm
    cm_80: number;                   // Cantidad de tallos de 80cm
    cm_90: number;                   // Cantidad de tallos de 90cm
    cm_100: number;                  // Cantidad de tallos de 100cm
    cm_110: number;                  // Cantidad de tallos de 110cm
    cm_120: number;                  // Cantidad de tallos de 120cm
    sobrante: number;                // Tallos que no cumplen medidas estándar
    
    // Precios por tamaño de tallo (en dólares)
    price_40: number;                // Precio por tallo de 40cm
    price_50: number;                // Precio por tallo de 50cm
    price_60: number;                // Precio por tallo de 60cm
    price_70: number;                // Precio por tallo de 70cm
    price_80: number;                // Precio por tallo de 80cm
    price_90: number;                // Precio por tallo de 90cm
    price_100: number;               // Precio por tallo de 100cm
    price_110: number;               // Precio por tallo de 110cm
    price_120: number;               // Precio por tallo de 120cm
    price_sobrante: number;          // Precio por tallo sobrante
    
    // Totales calculados
    total_classified: number;        // Total de tallos clasificados (exportables)
    total_price: number;             // Precio total de todos los tallos exportables
    is_complete: boolean;            // ¿Se clasificó toda la cantidad recibida?
    
    // Flor local (no exportable)
    local_quantity: number;          // Total de tallos destinados a mercado local
    local_is_complete: boolean;      // ¿Se clasificó toda la flor local?
    
    // Rechazos detallados
    rejections: ExistingRejection[]; // Lista de rechazos con sus categorías
}

// ============================================================================
// 4. ENTRADAS DE PRODUCTOS
// ============================================================================

/**
 * Entrada de producto - Representa una variedad específica en una entrega
 * 
 * Cada entrada contiene información sobre:
 * - Qué variedad de flor es
 * - Cuántos tallos se recibieron
 * - Su clasificación (si ya fue procesada)
 */
export interface ProductEntry {
    id: number;                              // ID único de la entrada
    species: Species;                        // Especie de la flor
    variety: Variety;                        // Variedad específica
    quantity: number;                        // Cantidad total de tallos recibidos
    stem_classification: Classification | null; // Clasificación (null si aún no se clasifica)
}

/**
 * Grupo de entradas de producto - Representa una entrega completa de un proveedor
 * 
 * Agrupa todas las variedades que llegaron en una misma entrega
 */
export interface ProductEntryGroup {
    id: number;                      // ID único del grupo de entrega
    supplier: Supplier;              // Proveedor que realizó la entrega
    entry_datetime: string;          // Fecha y hora de la entrega (ISO 8601)
    notes: string | null;            // Notas adicionales sobre la entrega
    entries: ProductEntry[];         // Lista de todas las variedades entregadas
}

/**
 * Especie existente - Versión simplificada para autocompletado
 */
export interface ExistingSpecies {
    id: number;                      // ID de la especie
    name: string;                    // Nombre de la especie
}

/**
 * Variedad existente - Versión simplificada para autocompletado
 */
export interface ExistingVariety {
    id: number;                      // ID de la variedad
    name: string;                    // Nombre de la variedad
    species_id: number;              // ID de la especie a la que pertenece
}

// ============================================================================
// 5. ESTADO EDITABLE (para formularios)
// ============================================================================

/**
 * Entrada editable - Versión en memoria de una entrada mientras se está editando
 * 
 * Este tipo se usa en los formularios donde el usuario está clasificando flores.
 * Todos los valores numéricos se mantienen como strings para facilitar la entrada
 * de datos, y se convierten a números solo al guardar.
 */
export interface EditableEntry {
    id: number | string;                 // ID (número si existe, string temporal si es nueva)
    isNew?: boolean;                     // ¿Es una entrada nueva que aún no se ha guardado?
    
    // Información de la variedad
    species_name: string;                // Nombre de la especie
    variety_name: string;                // Nombre de la variedad
    
    // Cantidad recibida
    quantity: string;                    // Cantidad actual (como string para input)
    originalQuantity: number;            // Cantidad original al cargar (para tracking de cambios)
    addQuantity: string;                 // Cantidad a agregar (para ajustes)
    removeQuantity: string;              // Cantidad a quitar (para ajustes)
    
    // Clasificación exportable
    exportable: ExportableData;          // Cantidades por tamaño de tallo
    prices: PricesData;                  // Precios por tamaño de tallo
    
    // Flor local (rechazos)
    localFlower: Record<string, string>; // Rechazos por categoría/subcategoría
                                         // Formato de keys: "cat_{id}" o "sub_{id}"
    
    // Estado de la UI (secciones expandidas/colapsadas)
    exportableOpen: boolean;             // ¿Sección de exportable está expandida?
    localFlowerOpen: boolean;            // ¿Sección de flor local está expandida?
}

/**
 * Datos de exportable - Cantidades clasificadas por tamaño (como strings)
 * 
 * Se mantienen como strings para permitir inputs vacíos y facilitar
 * la validación mientras el usuario escribe
 */
export interface ExportableData {
    cm_40: string;                       // Cantidad de tallos de 40cm
    cm_50: string;                       // Cantidad de tallos de 50cm
    cm_60: string;                       // Cantidad de tallos de 60cm
    cm_70: string;                       // Cantidad de tallos de 70cm
    cm_80: string;                       // Cantidad de tallos de 80cm
    cm_90: string;                       // Cantidad de tallos de 90cm
    cm_100: string;                      // Cantidad de tallos de 100cm
    cm_110: string;                      // Cantidad de tallos de 110cm
    cm_120: string;                      // Cantidad de tallos de 120cm
    sobrante: string;                    // Cantidad de tallos sobrantes
}

/**
 * Datos de precios - Precios por tamaño (como strings)
 * 
 * Se mantienen como strings para permitir decimales parciales mientras
 * el usuario escribe (ej: "0.", "1.5")
 */
export interface PricesData {
    price_40: string;                    // Precio por tallo de 40cm
    price_50: string;                    // Precio por tallo de 50cm
    price_60: string;                    // Precio por tallo de 60cm
    price_70: string;                    // Precio por tallo de 70cm
    price_80: string;                    // Precio por tallo de 80cm
    price_90: string;                    // Precio por tallo de 90cm
    price_100: string;                   // Precio por tallo de 100cm
    price_110: string;                   // Precio por tallo de 110cm
    price_120: string;                   // Precio por tallo de 120cm
    price_sobrante: string;              // Precio por tallo sobrante
}

// ============================================================================
// 6. TOTALES Y RESÚMENES
// ============================================================================

/**
 * Totales de una entrada - Resumen calculado de una entrada individual
 * 
 * Estos totales se calculan en tiempo real mientras el usuario clasifica,
 * para mostrar el progreso y detectar inconsistencias
 */
export interface EntryTotals {
    quantity: number;                // Cantidad total recibida de esta variedad
    totalExportable: number;         // Total de tallos clasificados como exportables
    totalLocal: number;              // Total de tallos clasificados como flor local
    totalClassified: number;         // Total clasificado (exportable + local)
    remaining: number;               // Tallos restantes por clasificar (puede ser negativo si hay error)
}

/**
 * Totales globales - Resumen calculado de toda la entrega
 * 
 * Agrupa los totales de todas las variedades para dar una vista general
 * del progreso de clasificación de la entrega completa
 */
export interface GlobalTotals {
    totalQuantity: number;           // Cantidad total de tallos en toda la entrega
    totalExportable: number;         // Total de tallos exportables en toda la entrega
    totalLocal: number;              // Total de flor local en toda la entrega
    totalPrice: number;              // Valor total en dólares de los tallos exportables
    totalClassified: number;         // Total de tallos ya clasificados
    remaining: number;               // Total de tallos pendientes por clasificar
    progress: number;                // Porcentaje de progreso (0-100)
}

/**
 * Tamaño de tallo - Configuración de un tamaño de clasificación
 * 
 * Define la metadata para cada uno de los tamaños disponibles
 * (se usa para generar los campos de forma dinámica)
 */
export interface StemSize {
    key: string;                     // Clave para la cantidad (ej: "cm_40")
    priceKey: string;                // Clave para el precio (ej: "price_40")
    label: string;                   // Etiqueta a mostrar al usuario (ej: "40")
    unit: string;                    // Unidad de medida (ej: "cm", vacío para sobrante)
}

