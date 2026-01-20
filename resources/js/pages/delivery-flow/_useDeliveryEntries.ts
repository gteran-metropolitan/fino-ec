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

interface UseDeliveryEntriesProps {
    group: ProductEntryGroup;
    categories: Category[];
}

export function useDeliveryEntries({
    group,
    categories,
}: UseDeliveryEntriesProps) {
    // Convertir entradas existentes a formato editable
    const initializeEntries = (): EditableEntry[] => {
        return group.entries.map((entry) => {
            const classification = entry.stem_classification;
            const localFlower: Record<string, string> = {};

            if (classification?.rejections) {
                classification.rejections.forEach((r) => {
                    if (r.rejection_subcategory_id) {
                        localFlower[`sub_${r.rejection_subcategory_id}`] =
                            r.quantity.toString();
                        if (r.detail)
                            localFlower[
                                `sub_${r.rejection_subcategory_id}_detail`
                            ] = r.detail;
                    } else {
                        localFlower[`cat_${r.rejection_category_id}`] =
                            r.quantity.toString();
                        if (r.detail)
                            localFlower[
                                `cat_${r.rejection_category_id}_detail`
                            ] = r.detail;
                    }
                });
            }

            const getClassificationValue = (
                value: number | undefined,
            ): string => {
                return value && Number(value) > 0 ? value.toString() : '';
            };

            return {
                id: entry.id,
                isNew: false,
                species_name: entry.species.name,
                variety_name: entry.variety.name,
                quantity: entry.quantity.toString(),
                originalQuantity: entry.quantity,
                addQuantity: '',
                removeQuantity: '',
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
                localFlower,
                exportableOpen: false,
                localFlowerOpen: false,
            };
        });
    };

    const [entries, setEntries] = useState<EditableEntry[]>(initializeEntries);
    const [processing, setProcessing] = useState(false);
    const [newEntryCounter, setNewEntryCounter] = useState(0);

    // Agregar nueva variedad
    const addNewEntry = (speciesName: string, varietyName: string) => {
        const newEntry: EditableEntry = {
            id: `new-${newEntryCounter}`,
            isNew: true,
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
        setNewEntryCounter((prev) => prev + 1);
        setEntries([...entries, newEntry]);
    };

    // Eliminar entrada
    const removeEntry = (entryId: number | string) => {
        setEntries(entries.filter((e) => e.id !== entryId));
    };

    // Actualizar cantidad
    const updateQuantity = (entryId: number | string, value: string) => {
        const cleanValue = cleanNumericValue(value);
        if (isValidNumber(cleanValue)) {
            setEntries(
                entries.map((e) =>
                    e.id === entryId ? { ...e, quantity: cleanValue } : e,
                ),
            );
        }
    };

    // Actualizar cantidad a aumentar
    const updateAddQuantity = (entryId: number | string, value: string) => {
        const cleanValue = cleanNumericValue(value);
        if (isValidNumber(cleanValue)) {
            setEntries(
                entries.map((e) => {
                    if (e.id !== entryId) return e;
                    const add = Number(cleanValue) || 0;
                    const remove = Number(e.removeQuantity) || 0;
                    const newQuantity = e.originalQuantity + add - remove;
                    return {
                        ...e,
                        addQuantity: cleanValue,
                        quantity: Math.max(0, newQuantity).toString(),
                    };
                }),
            );
        }
    };

    // Actualizar cantidad a quitar
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

    // Actualizar exportable
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
                              ...e,
                              exportable: {
                                  ...e.exportable,
                                  [key]: cleanValue,
                              },
                          }
                        : e,
                ),
            );
        }
    };

    // Actualizar precio
    const updatePrice = (
        entryId: number | string,
        key: string,
        value: string,
    ) => {
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

    // Actualizar flor local
    const updateLocalFlower = (
        entryId: number | string,
        key: string,
        value: string,
    ) => {
        if (key.endsWith('_detail')) {
            const upperValue = value.toUpperCase();
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
