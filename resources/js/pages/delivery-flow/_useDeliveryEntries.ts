// ==============================================================
// 🪝 HOOK PERSONALIZADO: useDeliveryEntries
// ==============================================================
// Este hook maneja TODA la lógica de edición de una entrega existente.
//
// 💡 ¿Qué es un Hook Personalizado?
//    Es una función que empieza con "use" y puede usar otros hooks
//    de React (como useState). Permite reutilizar lógica compleja.
//
// 💡 ¿Por qué usar un hook?
//    - Separa la LÓGICA (este archivo) de la UI (show.tsx)
//    - Hace el código más fácil de leer y mantener
//    - Permite reutilizar la misma lógica en diferentes componentes
// ==============================================================

import { router } from '@inertiajs/react';
import { useState } from 'react';

import type {
    Category,
    EditableEntry,
    GlobalTotals,
    ProductEntryGroup,
} from './_types';
import {
    calculateEntryTotalPrice,
    cleanNumericValue,
    createEmptyExportable,
    createEmptyPrices,
    getEntryTotals,
    isValidNumber,
    isValidPrice,
} from './_utils';

/**
 * Props que recibe el hook
 *
 * @property group - El grupo de entrega a editar (viene del servidor)
 * @property categories - Las categorías de rechazo disponibles
 */
interface UseDeliveryEntriesProps {
    group: ProductEntryGroup;
    categories: Category[];
}

/**
 * Hook para manejar la edición de entradas de una entrega
 *
 * @param props - Las props del hook
 * @returns Todos los estados y funciones necesarios para editar
 *
 * 💡 Uso en el componente:
 *    const { entries, updateQuantity, saveChanges } = useDeliveryEntries({ group, categories });
 */
export function useDeliveryEntries({
    group,
    categories,
}: UseDeliveryEntriesProps) {

    // ==============================================================
    // 🔄 FUNCIÓN DE INICIALIZACIÓN
    // ==============================================================
    // Esta función convierte los datos del servidor (ProductEntry[])
    // a un formato editable (EditableEntry[])

    const initializeEntries = (): EditableEntry[] => {
        // .map() transforma cada entrada del servidor
        return group.entries.map((entry) => {
            // Obtenemos la clasificación (puede ser null si no existe)
            const classification = entry.stem_classification;

            // Creamos un objeto para la flor local
            const localFlower: Record<string, string> = {};

            // Si hay rechazos, los convertimos al formato del formulario
            if (classification?.rejections) {
                classification.rejections.forEach((r) => {
                    // Si tiene subcategoría, usamos "sub_X"
                    if (r.rejection_subcategory_id) {
                        localFlower[`sub_${r.rejection_subcategory_id}`] =
                            r.quantity.toString();
                        if (r.detail)
                            localFlower[
                                `sub_${r.rejection_subcategory_id}_detail`
                            ] = r.detail;
                    } else {
                        // Si no, usamos "cat_X"
                        localFlower[`cat_${r.rejection_category_id}`] =
                            r.quantity.toString();
                        if (r.detail)
                            localFlower[
                                `cat_${r.rejection_category_id}_detail`
                            ] = r.detail;
                    }
                });
            }

            /**
             * Función auxiliar para convertir números a string
             * Si el valor es 0, undefined o vacío, devuelve string vacío
             *
             * 💡 Esto evita mostrar "0" en campos que no tienen valor
             */
            const getClassificationValue = (
                value: number | undefined,
            ): string => {
                return value && Number(value) > 0 ? value.toString() : '';
            };

            // Retornamos el objeto EditableEntry con todos los datos
            return {
                id: entry.id,                          // ID de la entrada
                isNew: false,                          // No es nueva (viene de BD)
                species_name: entry.species.name,      // Nombre de la especie
                variety_name: entry.variety.name,      // Nombre de la variedad
                quantity: entry.quantity.toString(),   // Cantidad (como string)
                originalQuantity: entry.quantity,      // Cantidad original (para comparar)
                addQuantity: '',                       // Cantidad a agregar (vacío)
                removeQuantity: '',                    // Cantidad a quitar (vacío)

                // Datos de clasificación exportable
                exportable: {
                    cm_40: getClassificationValue(classification?.cm_40),
                    cm_50: getClassificationValue(classification?.cm_50),
                    cm_60: getClassificationValue(classification?.cm_60),
                    cm_70: getClassificationValue(classification?.cm_70),
                    cm_80: getClassificationValue(classification?.cm_80),
                    cm_90: getClassificationValue(classification?.cm_90),
                    cm_100: getClassificationValue(classification?.cm_100),
                    cm_110: getClassificationValue(classification?.cm_110),
                    cm_120: getClassificationValue(classification?.cm_120),
                    sobrante: getClassificationValue(classification?.sobrante),
                },

                // Precios por tamaño
                prices: {
                    price_40: getClassificationValue(classification?.price_40),
                    price_50: getClassificationValue(classification?.price_50),
                    price_60: getClassificationValue(classification?.price_60),
                    price_70: getClassificationValue(classification?.price_70),
                    price_80: getClassificationValue(classification?.price_80),
                    price_90: getClassificationValue(classification?.price_90),
                    price_100: getClassificationValue(
                        classification?.price_100,
                    ),
                    price_110: getClassificationValue(
                        classification?.price_110,
                    ),
                    price_120: getClassificationValue(
                        classification?.price_120,
                    ),
                    price_sobrante: getClassificationValue(
                        classification?.price_sobrante,
                    ),
                },

                localFlower,                // Flor local (ya procesada arriba)
                exportableOpen: false,      // Sección cerrada por defecto
                localFlowerOpen: false,     // Sección cerrada por defecto
            };
        });
    };

    // ==============================================================
    // 📦 ESTADOS DEL HOOK (useState)
    // ==============================================================
    // Estos son los "estados" que React rastrea.
    // Cuando un estado cambia, React re-renderiza el componente.

    /**
     * Lista de entradas editables
     *
     * 💡 useState puede recibir una función (initializeEntries) que se
     *    ejecuta solo UNA vez al montar el componente. Esto es más
     *    eficiente que pasar un valor directo si ese valor es costoso de calcular.
     */
    const [entries, setEntries] = useState<EditableEntry[]>(initializeEntries);

    /**
     * Indica si estamos procesando/guardando
     * Se usa para deshabilitar el botón de guardar mientras se envía
     */
    const [processing, setProcessing] = useState(false);

    /**
     * Contador para generar IDs únicos para nuevas entradas
     * Cada vez que agregamos una entrada, incrementamos esto
     */
    const [newEntryCounter, setNewEntryCounter] = useState(0);

    // ==============================================================
    // 📝 FUNCIONES DE MODIFICACIÓN
    // ==============================================================
    // Estas funciones modifican el estado de las entradas.
    // Cada una usa setEntries para actualizar el estado.

    /**
     * ➕ Agregar una nueva variedad a la lista
     *
     * @param speciesName - Nombre de la especie (ej: "Rosa")
     * @param varietyName - Nombre de la variedad (ej: "Freedom")
     *
     * 💡 Crea una entrada con ID temporal como "new-0", "new-1", etc.
     *    Cuando se guarda, el servidor le asigna un ID real.
     */
    const addNewEntry = (speciesName: string, varietyName: string) => {
        const newEntry: EditableEntry = {
            id: `new-${newEntryCounter}`,    // ID temporal único
            isNew: true,                      // Marcamos como nueva
            species_name: speciesName,
            variety_name: varietyName,
            quantity: '',
            originalQuantity: 0,
            addQuantity: '',
            removeQuantity: '',
            exportable: createEmptyExportable(),
            prices: createEmptyPrices(),
            localFlower: {},
            exportableOpen: false,
            localFlowerOpen: false,
        };
        // Incrementamos el contador para el próximo ID
        setNewEntryCounter((prev) => prev + 1);
        // Agregamos la nueva entrada al final de la lista
        // [...entries, newEntry] crea un nuevo array con todo lo anterior + lo nuevo
        setEntries([...entries, newEntry]);
    };

    /**
     * 🗑️ Eliminar una entrada de la lista
     *
     * @param entryId - ID de la entrada a eliminar
     *
     * 💡 .filter() crea un nuevo array excluyendo el elemento eliminado
     */
    const removeEntry = (entryId: number | string) => {
        setEntries(entries.filter((e) => e.id !== entryId));
    };

    /**
     * 🔢 Actualizar la cantidad de tallos de una entrada
     *
     * @param entryId - ID de la entrada
     * @param value - Nuevo valor (string del input)
     *
     * 💡 El patrón entries.map(e => e.id === entryId ? {...e, campo: valor} : e)
     *    es muy común en React. Crea un nuevo array donde solo cambia un elemento.
     */
    const updateQuantity = (entryId: number | string, value: string) => {
        // Limpiamos el valor (quitar ceros a la izquierda)
        const cleanValue = cleanNumericValue(value);

        // Solo actualizamos si es un número válido
        if (isValidNumber(cleanValue)) {
            setEntries(
                entries.map((e) =>
                    // Si es la entrada que buscamos, actualizamos quantity
                    // Si no, devolvemos la entrada sin cambios
                    e.id === entryId ? { ...e, quantity: cleanValue } : e,
                ),
            );
        }
    };

    /**
     * ➕ Actualizar cantidad a AGREGAR
     *
     * @param entryId - ID de la entrada
     * @param value - Cantidad a agregar (string del input)
     *
     * 💡 La cantidad final se calcula como:
     *    cantidadFinal = cantidadOriginal + agregar - quitar
     *
     * Ej: Si original=100, agregar=20, quitar=10 → final=110
     */
    const updateAddQuantity = (entryId: number | string, value: string) => {
        const cleanValue = cleanNumericValue(value);
        if (isValidNumber(cleanValue)) {
            setEntries(
                entries.map((e) => {
                    // Si no es la entrada que buscamos, devolver sin cambios
                    if (e.id !== entryId) return e;

                    // Calcular la nueva cantidad
                    const add = Number(cleanValue) || 0;
                    const remove = Number(e.removeQuantity) || 0;
                    const newQuantity = e.originalQuantity + add - remove;

                    // Math.max(0, x) asegura que nunca sea negativo
                    return {
                        ...e,
                        addQuantity: cleanValue,
                        quantity: Math.max(0, newQuantity).toString(),
                    };
                }),
            );
        }
    };

    /**
     * ➖ Actualizar cantidad a QUITAR
     *
     * @param entryId - ID de la entrada
     * @param value - Cantidad a quitar (string del input)
     *
     * 💡 Funciona igual que updateAddQuantity pero para quitar
     */
    const updateRemoveQuantity = (entryId: number | string, value: string) => {
        const cleanValue = cleanNumericValue(value);
        if (isValidNumber(cleanValue)) {
            setEntries(
                entries.map((e) => {
                    if (e.id !== entryId) return e;

                    const add = Number(e.addQuantity) || 0;
                    const remove = Number(cleanValue) || 0;
                    const newQuantity = e.originalQuantity + add - remove;

                    return {
                        ...e,
                        removeQuantity: cleanValue,
                        quantity: Math.max(0, newQuantity).toString(),
                    };
                }),
            );
        }
    };

    /**
     * 📏 Actualizar valor de exportable (cantidad por tamaño)
     *
     * @param entryId - ID de la entrada
     * @param key - Clave del tamaño (ej: "cm_40", "cm_50", "sobrante")
     * @param value - Nuevo valor (string del input)
     *
     * 💡 La sintaxis [key]: value es "computed property name" en JS
     *    Permite usar una variable como nombre de propiedad
     *
     *    Ej: { [key]: value } donde key="cm_40" → { cm_40: value }
     */
    const updateExportable = (
        entryId: number | string,
        key: string,
        value: string,
    ) => {
        const cleanValue = cleanNumericValue(value);
        if (isValidNumber(cleanValue)) {
            setEntries(
                entries.map((e) =>
                    e.id === entryId
                        ? {
                              ...e,                      // Mantener todo lo demás
                              exportable: {
                                  ...e.exportable,       // Mantener otros tamaños
                                  [key]: cleanValue,     // Actualizar solo este tamaño
                              },
                          }
                        : e,
                ),
            );
        }
    };

    /**
     * 💰 Actualizar precio de un tamaño
     *
     * @param entryId - ID de la entrada
     * @param key - Clave del precio (ej: "price_40", "price_50")
     * @param value - Nuevo valor (permite decimales)
     *
     * 💡 A diferencia de updateExportable, aquí permitimos decimales
     *    porque los precios pueden ser "0.25", "1.50", etc.
     */
    const updatePrice = (
        entryId: number | string,
        key: string,
        value: string,
    ) => {
        // Permitimos solo números y punto decimal
        const cleanValue = value.replace(/[^0-9.]/g, '');
        if (isValidPrice(cleanValue)) {
            setEntries(
                entries.map((e) =>
                    e.id === entryId
                        ? { ...e, prices: { ...e.prices, [key]: cleanValue } }
                        : e,
                ),
            );
        }
    };

    /**
     * 🏠 Actualizar flor local (cantidad o detalle)
     *
     * @param entryId - ID de la entrada
     * @param key - Clave de la categoría/subcategoría (ej: "cat_1", "sub_3", "cat_1_detail")
     * @param value - Nuevo valor
     *
     * 💡 Si la clave termina en "_detail", es un campo de texto libre
     *    Si no, es un campo numérico (cantidad)
     */
    const updateLocalFlower = (
        entryId: number | string,
        key: string,
        value: string,
    ) => {
        // Si es un campo de detalle (texto)
        if (key.endsWith('_detail')) {
            const upperValue = value.toUpperCase(); // Convertir a mayúsculas
            setEntries(
                entries.map((e) =>
                    e.id === entryId
                        ? {
                              ...e,
                              localFlower: {
                                  ...e.localFlower,
                                  [key]: upperValue,
                              },
                          }
                        : e,
                ),
            );
        } else {
            // Si es un campo numérico (cantidad)
            const cleanValue = cleanNumericValue(value);
            if (isValidNumber(cleanValue)) {
                setEntries(
                    entries.map((e) =>
                        e.id === entryId
                            ? {
                                  ...e,
                                  localFlower: {
                                      ...e.localFlower,
                                      [key]: cleanValue,
                                  },
                              }
                            : e,
                    ),
                );
            }
        }
    };

    // Toggle secciones
    const toggleExportable = (entryId: number | string) => {
        setEntries(
            entries.map((e) =>
                e.id === entryId
                    ? { ...e, exportableOpen: !e.exportableOpen }
                    : e,
            ),
        );
    };

    const toggleLocalFlower = (entryId: number | string) => {
        setEntries(
            entries.map((e) =>
                e.id === entryId
                    ? { ...e, localFlowerOpen: !e.localFlowerOpen }
                    : e,
            ),
        );
    };

    // Calcular totales globales
    const calculateGlobalTotals = (): GlobalTotals => {
        let totalQuantity = 0;
        let totalExportable = 0;
        let totalLocal = 0;
        let totalPrice = 0;

        entries.forEach((entry) => {
            const totals = getEntryTotals(entry, categories);
            totalQuantity += totals.quantity;
            totalExportable += totals.totalExportable;
            totalLocal += totals.totalLocal;
            totalPrice += calculateEntryTotalPrice(entry);
        });

        const totalClassified = totalExportable + totalLocal;

        return {
            totalQuantity,
            totalExportable,
            totalLocal,
            totalPrice,
            totalClassified,
            remaining: totalQuantity - totalClassified,
            progress:
                totalQuantity > 0
                    ? Math.round((totalClassified / totalQuantity) * 100)
                    : 0,
        };
    };

    // Guardar cambios
    const saveChanges = () => {
        const formData = {
            entries: entries.map((entry) => {
                const rejections: Array<{
                    category_id: number;
                    subcategory_id: number | null;
                    quantity: number;
                    detail: string | null;
                }> = [];

                categories.forEach((cat) => {
                    const catQuantity =
                        Number(entry.localFlower[`cat_${cat.id}`]) || 0;
                    if (catQuantity > 0) {
                        rejections.push({
                            category_id: cat.id,
                            subcategory_id: null,
                            quantity: catQuantity,
                            detail:
                                entry.localFlower[`cat_${cat.id}_detail`] ||
                                null,
                        });
                    }

                    cat.active_subcategories?.forEach((sub) => {
                        const subQuantity =
                            Number(entry.localFlower[`sub_${sub.id}`]) || 0;
                        if (subQuantity > 0) {
                            rejections.push({
                                category_id: cat.id,
                                subcategory_id: sub.id,
                                quantity: subQuantity,
                                detail:
                                    entry.localFlower[`sub_${sub.id}_detail`] ||
                                    null,
                            });
                        }
                    });
                });

                return {
                    id: entry.id,
                    isNew: entry.isNew || false,
                    species_name: entry.species_name,
                    variety_name: entry.variety_name,
                    quantity: Number(entry.quantity) || 0,
                    exportable: {
                        cm_40: Number(entry.exportable.cm_40) || 0,
                        cm_50: Number(entry.exportable.cm_50) || 0,
                        cm_60: Number(entry.exportable.cm_60) || 0,
                        cm_70: Number(entry.exportable.cm_70) || 0,
                        cm_80: Number(entry.exportable.cm_80) || 0,
                        cm_90: Number(entry.exportable.cm_90) || 0,
                        cm_100: Number(entry.exportable.cm_100) || 0,
                        cm_110: Number(entry.exportable.cm_110) || 0,
                        cm_120: Number(entry.exportable.cm_120) || 0,
                        sobrante: Number(entry.exportable.sobrante) || 0,
                    },
                    prices: {
                        price_40: Number(entry.prices.price_40) || 0,
                        price_50: Number(entry.prices.price_50) || 0,
                        price_60: Number(entry.prices.price_60) || 0,
                        price_70: Number(entry.prices.price_70) || 0,
                        price_80: Number(entry.prices.price_80) || 0,
                        price_90: Number(entry.prices.price_90) || 0,
                        price_100: Number(entry.prices.price_100) || 0,
                        price_110: Number(entry.prices.price_110) || 0,
                        price_120: Number(entry.prices.price_120) || 0,
                        price_sobrante:
                            Number(entry.prices.price_sobrante) || 0,
                    },
                    total_price: calculateEntryTotalPrice(entry),
                    rejections,
                };
            }),
        };

        setProcessing(true);
        router.put(`/delivery-flow/${group.id}`, formData, {
            onSuccess: () => {
                router.visit('/delivery-flow');
            },
            onError: () => {
                setProcessing(false);
            },
        });
    };

    return {
        entries,
        processing,
        globalTotals: calculateGlobalTotals(),
        addNewEntry,
        removeEntry,
        updateQuantity,
        updateAddQuantity,
        updateRemoveQuantity,
        updateExportable,
        updatePrice,
        updateLocalFlower,
        toggleExportable,
        toggleLocalFlower,
        saveChanges,
        getEntryTotals: (entry: EditableEntry) =>
            getEntryTotals(entry, categories),
    };
}
