import { router } from '@inertiajs/react';
import { useState } from 'react';

import http from '@/lib/http';

import type { Category, ExistingSpecies, ExistingVariety } from './_types';
import {
    calculateEntryTotalPrice,
    cleanNumericValue,
    createEmptyExportable,
    createEmptyPrices,
    getEcuadorDateTime,
    getEntryTotals,
    isValidNumber,
    isValidPrice,
} from './_utils';

// Tipos específicos para create
export interface SupplierVariety {
    id: number;
    species_id: number;
    species_name: string;
    variety_id: number;
    variety_name: string;
}

export interface Supplier {
    id: number;
    code: string;
    name: string;
    email?: string;
    phone?: string;
    ruc?: string;
    supplier_varieties?: {
        id: number;
        species: { id: number; name: string };
        variety: { id: number; name: string };
    }[];
}

export interface ExistingDelivery {
    id: number;
    entry_datetime: string;
    total_entries: number;
    total_stems: number;
}

export interface VarietyEntry {
    id: string;
    species_name: string;
    variety_name: string;
    quantity: string;
    exportable: ReturnType<typeof createEmptyExportable>;
    prices: ReturnType<typeof createEmptyPrices>;
    localFlower: Record<string, string>;
    exportableOpen: boolean;
    localFlowerOpen: boolean;
}

interface UseCreateDeliveryProps {
    categories: Category[];
    existingSpecies: ExistingSpecies[];
    existingVarieties: ExistingVariety[];
}

export function useCreateDelivery({
    categories,
    existingSpecies,
    existingVarieties,
}: UseCreateDeliveryProps) {
    const ecuadorNow = getEcuadorDateTime();

    // Paso actual
    const [currentStep, setCurrentStep] = useState<'supplier' | 'entry'>(
        'supplier',
    );

    // Búsqueda de proveedor
    const [supplierCode, setSupplierCode] = useState('');
    const [searchingSupplier, setSearchingSupplier] = useState(false);
    const [searchMessage, setSearchMessage] = useState('');
    const [showCreateSupplier, setShowCreateSupplier] = useState(false);

    // Nuevo proveedor
    const [newSupplier, setNewSupplier] = useState({
        code: '',
        name: '',
        email: '',
        phone: '',
        ruc: '',
    });
    const [newSupplierErrors, setNewSupplierErrors] = useState<
        Record<string, string>
    >({});
    const [creatingSupplier, setCreatingSupplier] = useState(false);

    // Datos de entrega
    const [supplierId, setSupplierId] = useState('');
    const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(
        null,
    );
    const [deliveryDate, setDeliveryDate] = useState(ecuadorNow.date);
    const [deliveryTime, setDeliveryTime] = useState(ecuadorNow.time);

    // Variedades
    const [supplierVarieties, setSupplierVarieties] = useState<
        SupplierVariety[]
    >([]);
    const [availableVarieties, setAvailableVarieties] = useState<
        SupplierVariety[]
    >([]);
    const [entries, setEntries] = useState<VarietyEntry[]>([]);
    const [entryCounter, setEntryCounter] = useState(0);

    // Estados generales
    const [processing, setProcessing] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    // Entrega existente
    const [existingDelivery, setExistingDelivery] =
        useState<ExistingDelivery | null>(null);
    const [showExistingDeliveryDialog, setShowExistingDeliveryDialog] =
        useState(false);

    // Autocompletado para variedad manual
    const [newSpeciesName, setNewSpeciesName] = useState('');
    const [newVarietyName, setNewVarietyName] = useState('');
    const [showSpeciesSuggestions, setShowSpeciesSuggestions] = useState(false);
    const [showVarietySuggestions, setShowVarietySuggestions] = useState(false);
    const [filteredSpecies, setFilteredSpecies] = useState<ExistingSpecies[]>(
        [],
    );
    const [filteredVarieties, setFilteredVarieties] = useState<
        ExistingVariety[]
    >([]);

    // Cargar variedades del proveedor
    const loadSupplierVarieties = (supplier: Supplier) => {
        if (supplier.supplier_varieties) {
            const varieties = supplier.supplier_varieties.map((sv) => ({
                id: sv.id,
                species_id: sv.species.id,
                species_name: sv.species.name,
                variety_id: sv.variety.id,
                variety_name: sv.variety.name,
            }));
            setSupplierVarieties(varieties);
            setAvailableVarieties(varieties);
            setEntries([]);
        } else {
            setSupplierVarieties([]);
            setAvailableVarieties([]);
            setEntries([]);
        }
    };

    // Buscar proveedor
    const searchSupplier = async () => {
        if (!supplierCode.trim()) {
            setSearchMessage('Ingresa un código de proveedor para buscar.');
            return;
        }

        setSearchingSupplier(true);
        setSearchMessage('');

        try {
            const { data } = await http.post('/delivery-flow/search-supplier', {
                code: supplierCode.trim(),
            });

            if (data.found) {
                setSelectedSupplier(data.supplier);
                setSupplierId(data.supplier.id.toString());
                loadSupplierVarieties(data.supplier);

                if (data.existing_delivery) {
                    setExistingDelivery(data.existing_delivery);
                    setShowExistingDeliveryDialog(true);
                } else {
                    setCurrentStep('entry');
                }
                setSearchMessage('');
            } else {
                setSearchMessage(data.message);
                setNewSupplier((prev) => ({
                    ...prev,
                    code: supplierCode.trim(),
                }));
            }
        } catch (error: unknown) {
            const axiosError = error as { response?: { status?: number } };
            if (axiosError.response?.status === 419) {
                setSearchMessage(
                    'La sesión ha expirado. Por favor, recarga la página.',
                );
            } else {
                setSearchMessage('Error de conexión al buscar el proveedor.');
            }
        } finally {
            setSearchingSupplier(false);
        }
    };

    // Validar nuevo proveedor
    const validateNewSupplier = () => {
        const errors: Record<string, string> = {};

        if (!newSupplier.code.trim()) errors.code = 'El código es requerido.';
        if (!newSupplier.name.trim()) {
            errors.name = 'El nombre es requerido.';
        } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(newSupplier.name)) {
            errors.name = 'El nombre solo puede contener letras.';
        }
        if (!newSupplier.email.trim()) {
            errors.email = 'El correo es requerido.';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newSupplier.email)) {
            errors.email = 'El correo debe ser válido.';
        }
        if (!newSupplier.phone.trim()) {
            errors.phone = 'El celular es requerido.';
        } else if (!/^\d{10}$/.test(newSupplier.phone)) {
            errors.phone = 'El celular debe tener exactamente 10 dígitos.';
        }
        if (!newSupplier.ruc.trim()) {
            errors.ruc = 'El RUC es requerido.';
        } else if (!/^\d{13}$/.test(newSupplier.ruc)) {
            errors.ruc = 'El RUC debe tener exactamente 13 dígitos.';
        }

        setNewSupplierErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Crear proveedor
    const createSupplier = async () => {
        if (!validateNewSupplier()) return;

        setCreatingSupplier(true);

        try {
            const { data } = await http.post(
                '/delivery-flow/quick-supplier',
                newSupplier,
            );

            if (data.success) {
                setSelectedSupplier(data.supplier);
                setSupplierId(data.supplier.id.toString());
                loadSupplierVarieties(data.supplier);
                setShowCreateSupplier(false);
                setCurrentStep('entry');
                setSuccessMessage('Proveedor creado exitosamente.');
                setNewSupplier({
                    code: '',
                    name: '',
                    email: '',
                    phone: '',
                    ruc: '',
                });
                setNewSupplierErrors({});
                setSearchMessage('');
            } else {
                setNewSupplierErrors(
                    data.errors || {
                        general: data.message || 'Error al crear el proveedor.',
                    },
                );
            }
        } catch (error: unknown) {
            const axiosError = error as {
                response?: {
                    data?: {
                        errors?: Record<string, string>;
                        message?: string;
                    };
                };
            };
            setNewSupplierErrors(
                axiosError.response?.data?.errors || {
                    general: 'Error de conexión. Intenta de nuevo.',
                },
            );
        } finally {
            setCreatingSupplier(false);
        }
    };

    // Volver a buscar proveedor
    const backToSupplier = () => {
        setCurrentStep('supplier');
        setSelectedSupplier(null);
        setSupplierId('');
        setSupplierVarieties([]);
        setAvailableVarieties([]);
        setEntries([]);
    };

    // Continuar con nueva entrega
    const continueNewDelivery = () => {
        setShowExistingDeliveryDialog(false);
        setExistingDelivery(null);
        setCurrentStep('entry');
    };

    // Editar entrega existente
    const editExistingDelivery = () => {
        if (existingDelivery) {
            router.visit(`/delivery-flow/${existingDelivery.id}`);
        }
    };

    // Manejo de especie con autocompletado
    const handleSpeciesChange = (value: string) => {
        const upperValue = value.toUpperCase().replace(/[^A-ZÁÉÍÓÚÑÜ\s]/g, '');
        setNewSpeciesName(upperValue);

        if (upperValue.trim()) {
            const filtered = existingSpecies.filter((s) =>
                s.name.toUpperCase().includes(upperValue.trim()),
            );
            setFilteredSpecies(filtered);
            setShowSpeciesSuggestions(filtered.length > 0);
        } else {
            setFilteredSpecies([]);
            setShowSpeciesSuggestions(false);
        }
    };

    // Manejo de variedad con autocompletado
    const handleVarietyChange = (value: string) => {
        const upperValue = value
            .toUpperCase()
            .replace(/[^A-ZÁÉÍÓÚÑÜ0-9\s-]/g, '');
        setNewVarietyName(upperValue);

        if (upperValue.trim()) {
            const currentSpecies = existingSpecies.find(
                (s) =>
                    s.name.toUpperCase() ===
                    newSpeciesName.trim().toUpperCase(),
            );
            const filtered = currentSpecies
                ? existingVarieties.filter(
                      (v) =>
                          v.species_id === currentSpecies.id &&
                          v.name.toUpperCase().includes(upperValue.trim()),
                  )
                : existingVarieties.filter((v) =>
                      v.name.toUpperCase().includes(upperValue.trim()),
                  );
            setFilteredVarieties(filtered);
            setShowVarietySuggestions(filtered.length > 0);
        } else {
            setFilteredVarieties([]);
            setShowVarietySuggestions(false);
        }
    };

    const selectSpecies = (species: ExistingSpecies) => {
        setNewSpeciesName(species.name.toUpperCase());
        setShowSpeciesSuggestions(false);
    };

    const selectVariety = (variety: ExistingVariety) => {
        setNewVarietyName(variety.name.toUpperCase());
        if (!newSpeciesName.trim()) {
            const species = existingSpecies.find(
                (s) => s.id === variety.species_id,
            );
            if (species) setNewSpeciesName(species.name.toUpperCase());
        }
        setShowVarietySuggestions(false);
    };

    // Agregar variedad del proveedor
    const addVariety = (sv: SupplierVariety) => {
        const newEntry: VarietyEntry = {
            id: `entry-${entryCounter}`,
            species_name: sv.species_name,
            variety_name: sv.variety_name,
            quantity: '',
            exportable: createEmptyExportable(),
            prices: createEmptyPrices(),
            localFlower: {},
            exportableOpen: true,
            localFlowerOpen: false,
        };
        setEntryCounter((prev) => prev + 1);
        setEntries([...entries, newEntry]);
        setAvailableVarieties(availableVarieties.filter((v) => v.id !== sv.id));
    };

    // Agregar variedad manual
    const addManualVariety = () => {
        if (!newSpeciesName.trim() || !newVarietyName.trim()) return;

        const newEntry: VarietyEntry = {
            id: `entry-${entryCounter}`,
            species_name: newSpeciesName.trim(),
            variety_name: newVarietyName.trim(),
            quantity: '',
            exportable: createEmptyExportable(),
            prices: createEmptyPrices(),
            localFlower: {},
            exportableOpen: true,
            localFlowerOpen: false,
        };
        setEntryCounter((prev) => prev + 1);
        setEntries([...entries, newEntry]);
        setNewSpeciesName('');
        setNewVarietyName('');
    };

    // Eliminar entrada
    const removeEntry = (entryId: string) => {
        const entry = entries.find((e) => e.id === entryId);
        if (entry) {
            const originalVariety = supplierVarieties.find(
                (sv) =>
                    sv.species_name === entry.species_name &&
                    sv.variety_name === entry.variety_name,
            );
            if (originalVariety) {
                setAvailableVarieties([...availableVarieties, originalVariety]);
            }
        }
        setEntries(entries.filter((e) => e.id !== entryId));
    };

    // Actualizar cantidad
    const updateQuantity = (entryId: string, value: string) => {
        const cleanValue = cleanNumericValue(value);
        if (isValidNumber(cleanValue)) {
            setEntries(
                entries.map((e) =>
                    e.id === entryId ? { ...e, quantity: cleanValue } : e,
                ),
            );
        }
    };

    // Actualizar exportable
    const updateExportable = (entryId: string, key: string, value: string) => {
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
    const updatePrice = (entryId: string, key: string, value: string) => {
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
    const updateLocalFlower = (entryId: string, key: string, value: string) => {
        if (key.endsWith('_detail')) {
            setEntries(
                entries.map((e) =>
                    e.id === entryId
                        ? {
                              ...e,
                              localFlower: {
                                  ...e.localFlower,
                                  [key]: value.toUpperCase(),
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
    const toggleExportable = (entryId: string) => {
        setEntries(
            entries.map((e) =>
                e.id === entryId
                    ? { ...e, exportableOpen: !e.exportableOpen }
                    : e,
            ),
        );
    };

    const toggleLocalFlower = (entryId: string) => {
        setEntries(
            entries.map((e) =>
                e.id === entryId
                    ? { ...e, localFlowerOpen: !e.localFlowerOpen }
                    : e,
            ),
        );
    };

    // Calcular totales de entrada
    const getEntryTotalsLocal = (entry: VarietyEntry) => {
        return getEntryTotals(entry as any, categories);
    };

    // Totales globales
    const calculateGlobalTotals = () => {
        let totalQuantity = 0;
        let totalExportable = 0;
        let totalLocal = 0;
        let totalPrice = 0;

        entries.forEach((entry) => {
            const totals = getEntryTotalsLocal(entry);
            totalQuantity += totals.quantity;
            totalExportable += totals.totalExportable;
            totalLocal += totals.totalLocal;
            totalPrice += calculateEntryTotalPrice(entry as any);
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

    // Agrupar variedades por especie
    const groupedAvailableVarieties = availableVarieties.reduce(
        (acc, sv) => {
            if (!acc[sv.species_name]) acc[sv.species_name] = [];
            acc[sv.species_name].push(sv);
            return acc;
        },
        {} as Record<string, SupplierVariety[]>,
    );

    // Validar si se puede guardar
    const canSave =
        entries.length > 0 && entries.every((e) => Number(e.quantity) > 0);

    // Guardar
    const save = () => {
        const formData = {
            supplier_id: supplierId,
            delivery_date: deliveryDate,
            delivery_time: deliveryTime,
            entries: entries.map((entry) => {
                const rejections: Array<{
                    category_id: number;
                    subcategory_id: number | null;
                    quantity: number;
                    detail: string | null;
                }> = [];

                categories.forEach((cat) => {
                    const catQty =
                        Number(entry.localFlower[`cat_${cat.id}`]) || 0;
                    if (catQty > 0) {
                        rejections.push({
                            category_id: cat.id,
                            subcategory_id: null,
                            quantity: catQty,
                            detail:
                                entry.localFlower[`cat_${cat.id}_detail`] ||
                                null,
                        });
                    }
                    cat.active_subcategories?.forEach((sub) => {
                        const subQty =
                            Number(entry.localFlower[`sub_${sub.id}`]) || 0;
                        if (subQty > 0) {
                            rejections.push({
                                category_id: cat.id,
                                subcategory_id: sub.id,
                                quantity: subQty,
                                detail:
                                    entry.localFlower[`sub_${sub.id}_detail`] ||
                                    null,
                            });
                        }
                    });
                });

                return {
                    species_name: entry.species_name,
                    variety_name: entry.variety_name,
                    quantity: Number(entry.quantity),
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
                    total_price: calculateEntryTotalPrice(entry as any),
                    rejections,
                };
            }),
        };

        setProcessing(true);
        router.post('/delivery-flow', formData, {
            onSuccess: () => setSuccessMessage('Entrega guardada exitosamente'),
            onFinish: () => setProcessing(false),
        });
    };

    return {
        // Estados
        currentStep,
        supplierCode,
        setSupplierCode,
        searchingSupplier,
        searchMessage,
        showCreateSupplier,
        setShowCreateSupplier,
        newSupplier,
        setNewSupplier,
        newSupplierErrors,
        creatingSupplier,
        selectedSupplier,
        deliveryDate,
        setDeliveryDate,
        deliveryTime,
        setDeliveryTime,
        entries,
        processing,
        successMessage,
        existingDelivery,
        showExistingDeliveryDialog,
        setShowExistingDeliveryDialog,
        availableVarieties,
        groupedAvailableVarieties,
        canSave,
        globalTotals: calculateGlobalTotals(),

        // Autocompletado
        newSpeciesName,
        newVarietyName,
        showSpeciesSuggestions,
        setShowSpeciesSuggestions,
        showVarietySuggestions,
        setShowVarietySuggestions,
        filteredSpecies,
        filteredVarieties,

        // Acciones proveedor
        searchSupplier,
        createSupplier,
        backToSupplier,
        continueNewDelivery,
        editExistingDelivery,

        // Acciones autocompletado
        handleSpeciesChange,
        handleVarietyChange,
        selectSpecies,
        selectVariety,

        // Acciones entradas
        addVariety,
        addManualVariety,
        removeEntry,
        updateQuantity,
        updateExportable,
        updatePrice,
        updateLocalFlower,
        toggleExportable,
        toggleLocalFlower,
        getEntryTotals: getEntryTotalsLocal,

        // Guardar
        save,
    };
}
