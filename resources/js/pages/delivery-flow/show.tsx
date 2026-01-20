import { Head, Link, router, usePage } from '@inertiajs/react';
import { AlertCircle, Check, ChevronDown, ChevronUp, Flower2, Plus, Ruler, Save, Trash2, Truck, X } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

interface Supplier {
    id: number;
    name: string;
    code?: string;
}

interface Species {
    id: number;
    name: string;
}

interface Variety {
    id: number;
    name: string;
}

interface Subcategory {
    id: number;
    name: string;
    description: string | null;
}

interface Category {
    id: number;
    name: string;
    description: string | null;
    active_subcategories: Subcategory[];
}

interface ExistingRejection {
    id: number;
    rejection_category_id: number;
    rejection_subcategory_id: number | null;
    quantity: number;
    detail: string | null;
}

interface Classification {
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

interface ProductEntry {
    id: number;
    species: Species;
    variety: Variety;
    quantity: number;
    stem_classification: Classification | null;
}

interface ProductEntryGroup {
    id: number;
    supplier: Supplier;
    entry_datetime: string;
    notes: string | null;
    entries: ProductEntry[];
}

interface ExistingSpecies {
    id: number;
    name: string;
}

interface ExistingVariety {
    id: number;
    name: string;
    species_id: number;
}

interface Props {
    group: ProductEntryGroup;
    categories: Category[];
    existingSpecies?: ExistingSpecies[];
    existingVarieties?: ExistingVariety[];
}

// Estado editable de una entrada
interface EditableEntry {
    id: number | string; // string para nuevas entradas
    isNew?: boolean;
    species_name: string;
    variety_name: string;
    quantity: string;
    originalQuantity: number; // Cantidad original para referencia
    addQuantity: string; // Cantidad a aumentar
    removeQuantity: string; // Cantidad a quitar
    exportable: {
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
    };
    prices: {
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
    };
    localFlower: Record<string, string>;
    exportableOpen: boolean;
    localFlowerOpen: boolean;
}

const stemSizes = [
    { key: 'cm_40', priceKey: 'price_40', label: '40', unit: 'cm' },
    { key: 'cm_50', priceKey: 'price_50', label: '50', unit: 'cm' },
    { key: 'cm_60', priceKey: 'price_60', label: '60', unit: 'cm' },
    { key: 'cm_70', priceKey: 'price_70', label: '70', unit: 'cm' },
    { key: 'cm_80', priceKey: 'price_80', label: '80', unit: 'cm' },
    { key: 'cm_90', priceKey: 'price_90', label: '90', unit: 'cm' },
    { key: 'cm_100', priceKey: 'price_100', label: '100', unit: 'cm' },
    { key: 'cm_110', priceKey: 'price_110', label: '110', unit: 'cm' },
    { key: 'cm_120', priceKey: 'price_120', label: '120', unit: 'cm' },
    { key: 'sobrante', priceKey: 'price_sobrante', label: 'Sobrante', unit: '' },
];

const createEmptyExportable = () => ({
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

const createEmptyPrices = () => ({
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

export default function ShowDeliveryFlow({ group, categories, existingSpecies = [], existingVarieties = [] }: Props) {
    const pageErrors = usePage().props.errors as Record<string, string>;

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Panel', href: '/dashboard' },
        { title: 'Entrega y Postcosecha', href: '/delivery-flow' },
        { title: `Entrega #${group.id}`, href: `/delivery-flow/${group.id}` },
    ];

    // Convertir entradas existentes a formato editable
    const initializeEntries = (): EditableEntry[] => {
        return group.entries.map(entry => {
            const classification = entry.stem_classification;

            // Inicializar flor local desde los rechazos existentes
            const localFlower: Record<string, string> = {};
            if (classification?.rejections) {
                classification.rejections.forEach(r => {
                    if (r.rejection_subcategory_id) {
                        localFlower[`sub_${r.rejection_subcategory_id}`] = r.quantity.toString();
                        if (r.detail) localFlower[`sub_${r.rejection_subcategory_id}_detail`] = r.detail;
                    } else {
                        localFlower[`cat_${r.rejection_category_id}`] = r.quantity.toString();
                        if (r.detail) localFlower[`cat_${r.rejection_category_id}_detail`] = r.detail;
                    }
                });
            }

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
                    cm_40: Number(classification?.cm_40) > 0 ? classification?.cm_40?.toString() ?? '' : '',
                    cm_50: Number(classification?.cm_50) > 0 ? classification?.cm_50?.toString() ?? '' : '',
                    cm_60: Number(classification?.cm_60) > 0 ? classification?.cm_60?.toString() ?? '' : '',
                    cm_70: Number(classification?.cm_70) > 0 ? classification?.cm_70?.toString() ?? '' : '',
                    cm_80: Number(classification?.cm_80) > 0 ? classification?.cm_80?.toString() ?? '' : '',
                    cm_90: Number(classification?.cm_90) > 0 ? classification?.cm_90?.toString() ?? '' : '',
                    cm_100: Number(classification?.cm_100) > 0 ? classification?.cm_100?.toString() ?? '' : '',
                    cm_110: Number(classification?.cm_110) > 0 ? classification?.cm_110?.toString() ?? '' : '',
                    cm_120: Number(classification?.cm_120) > 0 ? classification?.cm_120?.toString() ?? '' : '',
                    sobrante: Number(classification?.sobrante) > 0 ? classification?.sobrante?.toString() ?? '' : '',
                },
                prices: {
                    price_40: Number(classification?.price_40) > 0 ? classification?.price_40?.toString() ?? '' : '',
                    price_50: Number(classification?.price_50) > 0 ? classification?.price_50?.toString() ?? '' : '',
                    price_60: Number(classification?.price_60) > 0 ? classification?.price_60?.toString() ?? '' : '',
                    price_70: Number(classification?.price_70) > 0 ? classification?.price_70?.toString() ?? '' : '',
                    price_80: Number(classification?.price_80) > 0 ? classification?.price_80?.toString() ?? '' : '',
                    price_90: Number(classification?.price_90) > 0 ? classification?.price_90?.toString() ?? '' : '',
                    price_100: Number(classification?.price_100) > 0 ? classification?.price_100?.toString() ?? '' : '',
                    price_110: Number(classification?.price_110) > 0 ? classification?.price_110?.toString() ?? '' : '',
                    price_120: Number(classification?.price_120) > 0 ? classification?.price_120?.toString() ?? '' : '',
                    price_sobrante: Number(classification?.price_sobrante) > 0 ? classification?.price_sobrante?.toString() ?? '' : '',
                },
                localFlower,
                exportableOpen: false,
                localFlowerOpen: false,
            };
        });
    };

    const [entries, setEntries] = useState<EditableEntry[]>(initializeEntries);
    const [processing, setProcessing] = useState(false);
    const [successMessage] = useState('');

    // Estados para agregar nueva variedad
    const [newSpeciesName, setNewSpeciesName] = useState('');
    const [newVarietyName, setNewVarietyName] = useState('');
    const [newEntryCounter, setNewEntryCounter] = useState(0);

    // Estados para autocompletado
    const [showSpeciesSuggestions, setShowSpeciesSuggestions] = useState(false);
    const [showVarietySuggestions, setShowVarietySuggestions] = useState(false);
    const [filteredSpecies, setFilteredSpecies] = useState<ExistingSpecies[]>([]);
    const [filteredVarieties, setFilteredVarieties] = useState<ExistingVariety[]>([]);

    // Manejar cambio de especie con autocompletado y mayúsculas
    const handleSpeciesChange = (value: string) => {
        const upperValue = value.toUpperCase().replace(/[^A-ZÁÉÍÓÚÑÜ\s]/g, '');
        setNewSpeciesName(upperValue);

        if (upperValue.trim()) {
            const filtered = existingSpecies.filter(s =>
                s.name.toUpperCase().includes(upperValue.trim())
            );
            setFilteredSpecies(filtered);
            setShowSpeciesSuggestions(filtered.length > 0);
        } else {
            setFilteredSpecies([]);
            setShowSpeciesSuggestions(false);
        }
    };

    // Manejar cambio de variedad con autocompletado y mayúsculas
    const handleVarietyChange = (value: string) => {
        const upperValue = value.toUpperCase().replace(/[^A-ZÁÉÍÓÚÑÜ0-9\s-]/g, '');
        setNewVarietyName(upperValue);

        if (upperValue.trim()) {
            const currentSpecies = existingSpecies.find(s =>
                s.name.toUpperCase() === newSpeciesName.trim().toUpperCase()
            );

            let filtered: ExistingVariety[];
            if (currentSpecies) {
                filtered = existingVarieties.filter(v =>
                    v.species_id === currentSpecies.id &&
                    v.name.toUpperCase().includes(upperValue.trim())
                );
            } else {
                filtered = existingVarieties.filter(v =>
                    v.name.toUpperCase().includes(upperValue.trim())
                );
            }
            setFilteredVarieties(filtered);
            setShowVarietySuggestions(filtered.length > 0);
        } else {
            setFilteredVarieties([]);
            setShowVarietySuggestions(false);
        }
    };

    // Seleccionar especie de las sugerencias
    const selectSpecies = (species: ExistingSpecies) => {
        setNewSpeciesName(species.name.toUpperCase());
        setShowSpeciesSuggestions(false);
    };

    // Seleccionar variedad de las sugerencias
    const selectVariety = (variety: ExistingVariety) => {
        setNewVarietyName(variety.name.toUpperCase());
        if (!newSpeciesName.trim()) {
            const species = existingSpecies.find(s => s.id === variety.species_id);
            if (species) {
                setNewSpeciesName(species.name.toUpperCase());
            }
        }
        setShowVarietySuggestions(false);
    };

    // Agregar nueva variedad
    const addNewEntry = () => {
        if (!newSpeciesName.trim() || !newVarietyName.trim()) {
            return;
        }

        const newEntry: EditableEntry = {
            id: `new-${newEntryCounter}`,
            isNew: true,
            species_name: newSpeciesName.trim(),
            variety_name: newVarietyName.trim(),
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
        setNewEntryCounter(prev => prev + 1);
        setEntries([...entries, newEntry]);
        setNewSpeciesName('');
        setNewVarietyName('');
    };

    // Eliminar entrada (solo nuevas)
    const removeEntry = (entryId: number | string) => {
        setEntries(entries.filter(e => e.id !== entryId));
    };

    // Actualizar cantidad de tallos
    const updateEntryQuantity = (entryId: number | string, value: string) => {
        const cleanValue = value.replace(/^0+(?=\d)/, '');
        if (cleanValue === '' || /^\d+$/.test(cleanValue)) {
            setEntries(entries.map(e => e.id === entryId ? { ...e, quantity: cleanValue } : e));
        }
    };

    // Actualizar cantidad a aumentar
    const updateAddQuantity = (entryId: number | string, value: string) => {
        const cleanValue = value.replace(/^0+(?=\d)/, '');
        if (cleanValue === '' || /^\d+$/.test(cleanValue)) {
            setEntries(entries.map(e => {
                if (e.id !== entryId) return e;
                const add = Number(cleanValue) || 0;
                const remove = Number(e.removeQuantity) || 0;
                const newQuantity = e.originalQuantity + add - remove;
                return {
                    ...e,
                    addQuantity: cleanValue,
                    quantity: Math.max(0, newQuantity).toString()
                };
            }));
        }
    };

    // Actualizar cantidad a quitar
    const updateRemoveQuantity = (entryId: number | string, value: string) => {
        const cleanValue = value.replace(/^0+(?=\d)/, '');
        if (cleanValue === '' || /^\d+$/.test(cleanValue)) {
            setEntries(entries.map(e => {
                if (e.id !== entryId) return e;
                const add = Number(e.addQuantity) || 0;
                const remove = Number(cleanValue) || 0;
                const newQuantity = e.originalQuantity + add - remove;
                return {
                    ...e,
                    removeQuantity: cleanValue,
                    quantity: Math.max(0, newQuantity).toString()
                };
            }));
        }
    };

    // Actualizar exportable
    const updateEntryExportable = (entryId: number | string, key: string, value: string) => {
        const cleanValue = value.replace(/^0+(?=\d)/, '');
        if (cleanValue === '' || /^\d+$/.test(cleanValue)) {
            setEntries(entries.map(e => e.id === entryId ? {
                ...e,
                exportable: { ...e.exportable, [key]: cleanValue }
            } : e));
        }
    };

    // Actualizar precio unitario
    const updateEntryPrice = (entryId: number | string, key: string, value: string) => {
        // Permitir números decimales con hasta 2 decimales
        const cleanValue = value.replace(/[^0-9.]/g, '');
        // Validar formato decimal
        if (cleanValue === '' || /^\d*\.?\d{0,2}$/.test(cleanValue)) {
            setEntries(entries.map(e => e.id === entryId ? {
                ...e,
                prices: { ...e.prices, [key]: cleanValue }
            } : e));
        }
    };


    // Calcular total de precios de una entrada
    const calculateEntryTotalPrice = (entry: EditableEntry): number => {
        let total = 0;
        stemSizes.forEach(({ key, priceKey }) => {
            const qty = Number(entry.exportable[key as keyof typeof entry.exportable]) || 0;
            const price = Number(entry.prices[priceKey as keyof typeof entry.prices]) || 0;
            total += qty * price;
        });
        return total;
    };

    // Actualizar flor local
    const updateEntryLocalFlower = (entryId: number | string, key: string, value: string) => {
        if (key.endsWith('_detail')) {
            // Convertir a MAYÚSCULAS para los campos de detalle
            const upperValue = value.toUpperCase();
            setEntries(entries.map(e => e.id === entryId ? {
                ...e,
                localFlower: { ...e.localFlower, [key]: upperValue }
            } : e));
        } else {
            const cleanValue = value.replace(/^0+(?=\d)/, '');
            if (cleanValue === '' || /^\d+$/.test(cleanValue)) {
                setEntries(entries.map(e => e.id === entryId ? {
                    ...e,
                    localFlower: { ...e.localFlower, [key]: cleanValue }
                } : e));
            }
        }
    };

    // Toggle secciones
    const toggleExportable = (entryId: number | string) => {
        setEntries(entries.map(e => e.id === entryId ? { ...e, exportableOpen: !e.exportableOpen } : e));
    };

    const toggleLocalFlower = (entryId: number | string) => {
        setEntries(entries.map(e => e.id === entryId ? { ...e, localFlowerOpen: !e.localFlowerOpen } : e));
    };

    // Calcular totales para una entrada
    const getEntryTotals = (entry: EditableEntry) => {
        const quantity = Number(entry.quantity) || 0;
        const totalExportable = Object.values(entry.exportable).reduce((sum, val) => sum + (Number(val) || 0), 0);

        let totalLocal = 0;
        categories.forEach(cat => {
            totalLocal += Number(entry.localFlower[`cat_${cat.id}`]) || 0;
            cat.active_subcategories?.forEach(sub => {
                totalLocal += Number(entry.localFlower[`sub_${sub.id}`]) || 0;
            });
        });

        const totalClassified = totalExportable + totalLocal;
        const remaining = quantity - totalClassified;

        return { quantity, totalExportable, totalLocal, totalClassified, remaining };
    };

    // Calcular totales generales
    const calculateGlobalTotals = () => {
        let totalQuantity = 0;
        let totalExportable = 0;
        let totalLocal = 0;
        let totalPrice = 0;

        entries.forEach(entry => {
            const totals = getEntryTotals(entry);
            totalQuantity += totals.quantity;
            totalExportable += totals.totalExportable;
            totalLocal += totals.totalLocal;
            totalPrice += calculateEntryTotalPrice(entry);
        });

        return {
            totalQuantity,
            totalExportable,
            totalLocal,
            totalPrice,
            totalClassified: totalExportable + totalLocal,
            remaining: totalQuantity - (totalExportable + totalLocal),
            progress: totalQuantity > 0 ? Math.round(((totalExportable + totalLocal) / totalQuantity) * 100) : 0,
        };
    };

    const globalTotals = calculateGlobalTotals();

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return {
            short: date.toLocaleString('es-EC', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
                timeZone: 'America/Guayaquil',
            }),
            long: date.toLocaleDateString('es-EC', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                timeZone: 'America/Guayaquil',
            }),
        };
    };

    // Guardar cambios
    const handleSave: FormEventHandler = (e) => {
        e.preventDefault();

        const formData = {
            entries: entries.map(entry => {
                // Preparar rechazos de flor local
                const rejections: Array<{
                    category_id: number;
                    subcategory_id: number | null;
                    quantity: number;
                    detail: string | null;
                }> = [];

                categories.forEach(cat => {
                    const catQuantity = Number(entry.localFlower[`cat_${cat.id}`]) || 0;
                    if (catQuantity > 0) {
                        rejections.push({
                            category_id: cat.id,
                            subcategory_id: null,
                            quantity: catQuantity,
                            detail: entry.localFlower[`cat_${cat.id}_detail`] || null,
                        });
                    }

                    cat.active_subcategories?.forEach(sub => {
                        const subQuantity = Number(entry.localFlower[`sub_${sub.id}`]) || 0;
                        if (subQuantity > 0) {
                            rejections.push({
                                category_id: cat.id,
                                subcategory_id: sub.id,
                                quantity: subQuantity,
                                detail: entry.localFlower[`sub_${sub.id}_detail`] || null,
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
                        cm_40: Number(entry.exportable.cm_40) || '',
                        cm_50: Number(entry.exportable.cm_50) || '',
                        cm_60: Number(entry.exportable.cm_60) || '',
                        cm_70: Number(entry.exportable.cm_70) || '',
                        cm_80: Number(entry.exportable.cm_80) || '',
                        cm_90: Number(entry.exportable.cm_90) || '',
                        cm_100: Number(entry.exportable.cm_100) || '',
                        cm_110: Number(entry.exportable.cm_110) || '',
                        cm_120: Number(entry.exportable.cm_120) || '',
                        sobrante: Number(entry.exportable.sobrante) || '',
                    },
                    prices: {
                        price_40: Number(entry.prices.price_40) || '',
                        price_50: Number(entry.prices.price_50) || '',
                        price_60: Number(entry.prices.price_60) || '',
                        price_70: Number(entry.prices.price_70) || '',
                        price_80: Number(entry.prices.price_80) || '',
                        price_90: Number(entry.prices.price_90) || '',
                        price_100: Number(entry.prices.price_100) || '',
                        price_110: Number(entry.prices.price_110) || '',
                        price_120: Number(entry.prices.price_120) || '',
                        price_sobrante:
                            Number(entry.prices.price_sobrante) || '',
                    },
                    total_price: calculateEntryTotalPrice(entry),
                    rejections,
                };
            }),
        };

        setProcessing(true);
        router.put(`/delivery-flow/${group.id}`, formData, {
            onSuccess: () => {
                // Redirigir al index después de guardar
                router.visit('/delivery-flow', {
                    onSuccess: () => {
                        // El mensaje de éxito se mostrará en el index si lo implementamos
                    }
                });
            },
            onError: () => {
                setProcessing(false);
            },
            onFinish: () => {
                // No resetear processing aquí porque vamos a redirigir
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Entrega #${group.id}`} />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Entrega #{group.id}</h1>
                    <p className="text-sm text-muted-foreground">
                        Edita las variedades, clasificación exportable y flor local
                    </p>
                </div>

                {/* Mensajes */}
                {successMessage && (
                    <Alert className="border-green-500 bg-green-50">
                        <Check className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-700">{successMessage}</AlertDescription>
                    </Alert>
                )}

                {pageErrors.general && (
                    <Alert className="border-destructive bg-destructive/10">
                        <AlertCircle className="h-4 w-4 text-destructive" />
                        <AlertDescription className="text-destructive">{pageErrors.general}</AlertDescription>
                    </Alert>
                )}

                {/* Info de la entrega */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Truck className="h-5 w-5 text-muted-foreground" />
                            <CardTitle>Información de la Entrega</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <div>
                                <p className="text-xs text-muted-foreground">Proveedor</p>
                                <p className="font-medium">{group.supplier.name}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Fecha de Entrega</p>
                                <p className="font-medium">{formatDate(group.entry_datetime).short}</p>
                                <p className="text-xs text-muted-foreground capitalize">{formatDate(group.entry_datetime).long}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Total Variedades</p>
                                <p className="font-medium">{entries.length}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Total Tallos</p>
                                <p className="text-2xl font-bold text-primary">{globalTotals.totalQuantity}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Resumen de progreso */}
                <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-3">
                    <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-center">
                        <p className="text-xs text-green-600">Exportable</p>
                        <p className="text-2xl font-bold text-green-700">{globalTotals.totalExportable}</p>
                    </div>
                    <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-center">
                        <p className="text-xs text-amber-600">Flor Local</p>
                        <p className="text-2xl font-bold text-amber-700">{globalTotals.totalLocal}</p>
                    </div>
                    <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-center">
                        <p className="text-xs text-blue-600">Clasificado</p>
                        <p className="text-2xl font-bold text-blue-700">{globalTotals.totalClassified}</p>
                    </div>
                    <div className={`rounded-lg border p-3 text-center ${
                        globalTotals.remaining === 0
                            ? 'border-green-500 bg-green-50'
                            : globalTotals.remaining < 0
                                ? 'border-red-500 bg-red-50'
                                : 'border-amber-500 bg-amber-50'
                    }`}>
                        <p className="text-xs text-muted-foreground">Restante</p>
                        <p className={`text-2xl font-bold ${
                            globalTotals.remaining === 0
                                ? 'text-green-600'
                                : globalTotals.remaining < 0
                                    ? 'text-red-600'
                                    : 'text-amber-600'
                        }`}>{globalTotals.remaining}</p>
                        {globalTotals.remaining < 0 && (
                            <p className="text-xs text-red-600 mt-1">⚠️ Excede el total</p>
                        )}
                    </div>
                    <div className={`rounded-lg border p-3 text-center ${
                        globalTotals.progress > 100
                            ? 'border-red-500 bg-red-50'
                            : globalTotals.progress === 100
                                ? 'border-green-500 bg-green-50'
                                : ''
                    }`}>
                        <p className="text-xs text-muted-foreground">Progreso</p>
                        <div className="flex items-center justify-center gap-2 mt-1">
                            <div className="h-3 w-16 bg-secondary rounded-full overflow-hidden">
                                <div
                                    className={`h-full transition-all ${
                                        globalTotals.progress > 100
                                            ? 'bg-red-500'
                                            : globalTotals.progress === 100
                                                ? 'bg-green-500'
                                                : 'bg-primary'
                                    }`}
                                    style={{ width: `${Math.min(globalTotals.progress, 100)}%` }}
                                />
                            </div>
                            <span className={`text-lg font-bold ${
                                globalTotals.progress > 100 ? 'text-red-600' : ''
                            }`}>{globalTotals.progress}%</span>
                        </div>
                        {globalTotals.progress > 100 && (
                            <p className="text-xs text-red-600 mt-1">⚠️ Se sobrepasó del 100%</p>
                        )}
                    </div>
                    {/* Total de precio */}
                    <div className="rounded-lg border-2 border-emerald-400 bg-gradient-to-br from-emerald-50 to-green-50 p-3 text-center shadow-sm">
                        <p className="text-xs text-emerald-600 font-medium">💰 Total Exportable</p>
                        <p className="text-2xl font-bold text-emerald-700">${globalTotals.totalPrice.toFixed(2)}</p>
                    </div>
                </div>

                <form onSubmit={handleSave} className="space-y-4">
                    {/* Lista de entradas */}
                    {entries.map((entry, index) => {
                        const totals = getEntryTotals(entry);
                        return (
                            <Card key={entry.id}
                                  className={`overflow-hidden ${entry.isNew ? 'border-2 border-dashed border-primary/50' : ''}`}>
                                {/* Header */}
                                <div className="flex flex-col gap-3 bg-muted/50 px-4 py-3 border-b">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <Badge variant={entry.isNew ? "default" : "secondary"}>
                                                {entry.isNew ? 'Nuevo' : `#${index + 1}`}
                                            </Badge>
                                            <div>
                                                <span className="font-semibold">{entry.species_name}</span>
                                                <span className="mx-2 text-muted-foreground">-</span>
                                                <span>{entry.variety_name}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 text-sm">
                                            <span>Exp: <strong
                                                className="text-green-600">{totals.totalExportable}</strong></span>
                                            <span>Local: <strong className="text-amber-600">{totals.totalLocal}</strong></span>
                                            <span
                                                className={totals.remaining === 0 ? 'text-green-600' : totals.remaining < 0 ? 'text-destructive' : 'text-amber-600'}>
                                                Rest: <strong>{totals.remaining}</strong>
                                                {totals.remaining === 0 && <Check className="inline ml-1 h-4 w-4" />}
                                            </span>
                                            {entry.isNew && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => removeEntry(entry.id)}
                                                    className="text-destructive hover:text-destructive"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Sección de cantidad de tallos */}
                                    <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-border/50">
                                        {entry.isNew ? (
                                            /* Para entradas nuevas, solo mostrar campo de cantidad */
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm text-muted-foreground">Cantidad:</span>
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    value={entry.quantity}
                                                    onChange={(e) => updateEntryQuantity(entry.id, e.target.value)}
                                                    className="h-8 w-24 text-center"
                                                    placeholder="0"
                                                />
                                                <span className="text-sm text-muted-foreground">tallos</span>
                                            </div>
                                        ) : (
                                            /* Para entradas existentes, mostrar original y campos de modificación */
                                            <>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm text-muted-foreground">Original:</span>
                                                    <span
                                                        className="font-semibold text-primary">{entry.originalQuantity}</span>
                                                    <span className="text-sm text-muted-foreground">tallos</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm text-green-600">+ Aumentar:</span>
                                                    <Input
                                                        type="number"
                                                        min="0"
                                                        value={entry.addQuantity}
                                                        onChange={(e) => updateAddQuantity(entry.id, e.target.value)}
                                                        className="h-8 w-20 text-center border-green-300 focus:border-green-500"
                                                        placeholder="0"
                                                    />
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm text-red-600">- Quitar:</span>
                                                    <Input
                                                        type="number"
                                                        min="0"
                                                        max={entry.originalQuantity + (Number(entry.addQuantity) || 0)}
                                                        value={entry.removeQuantity}
                                                        onChange={(e) => updateRemoveQuantity(entry.id, e.target.value)}
                                                        className="h-8 w-20 text-center border-red-300 focus:border-red-500"
                                                        placeholder="0"
                                                    />
                                                </div>
                                                <div className="flex items-center gap-2 ml-auto">
                                                    <span className="text-sm font-medium">Total:</span>
                                                    <Badge variant="outline" className={`text-base px-3 py-1 ${
                                                        Number(entry.quantity) !== entry.originalQuantity
                                                            ? 'bg-blue-50 border-blue-300 text-blue-700'
                                                            : ''
                                                    }`}>
                                                        {entry.quantity || 0} tallos
                                                    </Badge>
                                                    {Number(entry.quantity) !== entry.originalQuantity && (
                                                        <span className="text-xs text-blue-600">
                                                            ({Number(entry.quantity) > entry.originalQuantity ? '+' : ''}{Number(entry.quantity) - entry.originalQuantity})
                                                        </span>
                                                    )}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Exportable */}
                                <Collapsible open={entry.exportableOpen}
                                             onOpenChange={() => toggleExportable(entry.id)}>
                                    <CollapsibleTrigger asChild>
                                        <div
                                            className="flex items-center justify-between px-4 py-2 cursor-pointer hover:bg-muted/30 border-b">
                                            <div className="flex items-center gap-2">
                                                <Ruler className="h-4 w-4 text-green-600" />
                                                <span className="text-sm font-medium">Exportable</span>
                                                {totals.totalExportable > 0 && (
                                                    <Badge
                                                        className="bg-green-100 text-green-700 text-xs">{totals.totalExportable}</Badge>
                                                )}
                                            </div>
                                            {entry.exportableOpen ? <ChevronUp className="h-4 w-4" /> :
                                                <ChevronDown className="h-4 w-4" />}
                                        </div>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent>
                                        <div className="p-4 border-b space-y-4">
                                            {/* Grid de tamaños con precios */}
                                            <div className="grid gap-2 sm:grid-cols-5 lg:grid-cols-10">
                                                {stemSizes.map(({ key, priceKey, label, unit }) => {
                                                    const qty = Number(entry.exportable[key as keyof typeof entry.exportable]) || 0;
                                                    const price = Number(entry.prices[priceKey as keyof typeof entry.prices]) || 0;
                                                    const subtotal = qty * price;

                                                    return (
                                                        <div key={key}
                                                             className="space-y-1 p-2 rounded-lg bg-muted/30 border">
                                                            <Label className="text-xs text-center block font-semibold">
                                                                {label}{unit &&
                                                                <span className="text-muted-foreground"> {unit}</span>}
                                                            </Label>
                                                            <Input
                                                                type="number"
                                                                min="0"
                                                                value={entry.exportable[key as keyof typeof entry.exportable]}
                                                                onChange={(e) => updateEntryExportable(entry.id, key, e.target.value)}
                                                                className="text-center h-8 text-sm"
                                                                placeholder="0"
                                                            />
                                                            <div className="pt-1 border-t">
                                                                <Label
                                                                    className="text-[10px] text-center block text-muted-foreground">
                                                                    Precio $
                                                                </Label>
                                                                <Input
                                                                    type="text"
                                                                    value={entry.prices[priceKey as keyof typeof entry.prices]}
                                                                    onChange={(e) => updateEntryPrice(entry.id, priceKey, e.target.value)}
                                                                    className="text-center h-7 text-xs"
                                                                    placeholder="0.00"
                                                                />
                                                            </div>
                                                            {subtotal > 0 && (
                                                                <div className="text-center pt-1 border-t">
                                                                    <span
                                                                        className="text-[10px] text-green-600 font-medium">
                                                                        ${subtotal.toFixed(2)}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>

                                            {/* Total de la variedad */}
                                            {calculateEntryTotalPrice(entry) > 0 && (
                                                <div className="flex justify-end pt-3 border-t">
                                                    <div
                                                        className="bg-green-50 border border-green-200 rounded-lg px-4 py-2 text-right">
                                                        <span
                                                            className="text-xs text-green-600 block">Total Exportable</span>
                                                        <span className="text-xl font-bold text-green-700">
                                                            ${calculateEntryTotalPrice(entry).toFixed(2)}
                                                        </span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </CollapsibleContent>
                                </Collapsible>

                                {/* Flor Local */}
                                <Collapsible open={entry.localFlowerOpen}
                                             onOpenChange={() => toggleLocalFlower(entry.id)}>
                                    <CollapsibleTrigger asChild>
                                        <div
                                            className="flex items-center justify-between px-4 py-2 cursor-pointer hover:bg-muted/30">
                                            <div className="flex items-center gap-2">
                                                <Flower2 className="h-4 w-4 text-amber-600" />
                                                <span className="text-sm font-medium">Flor Local</span>
                                                {totals.totalLocal > 0 && (
                                                    <Badge
                                                        className="bg-amber-100 text-amber-700 text-xs">{totals.totalLocal}</Badge>
                                                )}
                                            </div>
                                            {entry.localFlowerOpen ? <ChevronUp className="h-4 w-4" /> :
                                                <ChevronDown className="h-4 w-4" />}
                                        </div>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent>
                                        <div className="p-4 space-y-4">
                                            {categories.length === 0 ? (
                                                <p className="text-sm text-muted-foreground text-center py-4">
                                                    No hay categorías de rechazo configuradas
                                                </p>
                                            ) : (
                                                categories.map((category) => (
                                                    <div key={category.id} className="space-y-2">
                                                        <h4 className="text-sm font-medium">{category.name}</h4>

                                                        {(!category.active_subcategories || category.active_subcategories.length === 0) ? (
                                                            <div className="grid gap-2 sm:grid-cols-2 ml-4">
                                                                <Input
                                                                    type="number"
                                                                    min="0"
                                                                    value={entry.localFlower[`cat_${category.id}`] || ''}
                                                                    onChange={(e) => updateEntryLocalFlower(entry.id, `cat_${category.id}`, e.target.value)}
                                                                    placeholder="Cantidad"
                                                                    className="h-8"
                                                                />
                                                                <Input
                                                                    type="text"
                                                                    value={entry.localFlower[`cat_${category.id}_detail`] || ''}
                                                                    onChange={(e) => updateEntryLocalFlower(entry.id, `cat_${category.id}_detail`, e.target.value)}
                                                                    placeholder="Detalle (opcional)"
                                                                    className="h-8 uppercase"
                                                                />
                                                            </div>
                                                        ) : (
                                                            <div className="space-y-2 ml-4">
                                                                {category.active_subcategories.map((sub) => (
                                                                    <div key={sub.id}
                                                                         className="grid gap-2 sm:grid-cols-3 items-center">
                                                                        <span
                                                                            className="text-sm text-muted-foreground">{sub.name}</span>
                                                                        <Input
                                                                            type="number"
                                                                            min="0"
                                                                            value={entry.localFlower[`sub_${sub.id}`] || ''}
                                                                            onChange={(e) => updateEntryLocalFlower(entry.id, `sub_${sub.id}`, e.target.value)}
                                                                            placeholder="Cantidad"
                                                                            className="h-8"
                                                                        />
                                                                        <Input
                                                                            type="text"
                                                                            value={entry.localFlower[`sub_${sub.id}_detail`] || ''}
                                                                            onChange={(e) => updateEntryLocalFlower(entry.id, `sub_${sub.id}_detail`, e.target.value)}
                                                                            placeholder="Detalle"
                                                                            className="h-8 uppercase"
                                                                        />
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </CollapsibleContent>
                                </Collapsible>
                            </Card>
                        );
                    })}

                    {/* Formulario para agregar nueva variedad */}
                    <Card className="overflow-hidden border-2 border-dashed">
                        <CardHeader className="bg-muted/30 py-3">
                            <CardTitle className="text-base flex items-center gap-2">
                                <Plus className="h-4 w-4" />
                                Agregar Nueva Variedad
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4">
                            <div className="flex flex-wrap items-end gap-3">
                                {/* Especie */}
                                <div className="relative min-w-[150px] flex-1 space-y-1">
                                    <Label className="text-xs">Especie *</Label>
                                    <Input
                                        type="text"
                                        value={newSpeciesName}
                                        onChange={(e) => handleSpeciesChange(e.target.value)}
                                        onFocus={() => {
                                            if (newSpeciesName.trim() && filteredSpecies.length > 0) {
                                                setShowSpeciesSuggestions(true);
                                            }
                                        }}
                                        onBlur={() => setTimeout(() => setShowSpeciesSuggestions(false), 200)}
                                        placeholder="Ej: ROSA"
                                        className="h-9 uppercase"
                                        autoComplete="off"
                                    />
                                    {showSpeciesSuggestions && filteredSpecies.length > 0 && (
                                        <div
                                            className="absolute top-full left-0 right-0 z-50 mt-1 max-h-40 overflow-auto rounded-md border bg-popover shadow-md">
                                            {filteredSpecies.map((species) => (
                                                <button
                                                    key={species.id}
                                                    type="button"
                                                    className="w-full px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground"
                                                    onMouseDown={(e) => e.preventDefault()}
                                                    onClick={() => selectSpecies(species)}
                                                >
                                                    {species.name.toUpperCase()}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Variedad */}
                                <div className="relative min-w-[150px] flex-1 space-y-1">
                                    <Label className="text-xs">Variedad *</Label>
                                    <Input
                                        type="text"
                                        value={newVarietyName}
                                        onChange={(e) => handleVarietyChange(e.target.value)}
                                        onFocus={() => {
                                            if (newVarietyName.trim() && filteredVarieties.length > 0) {
                                                setShowVarietySuggestions(true);
                                            }
                                        }}
                                        onBlur={() => setTimeout(() => setShowVarietySuggestions(false), 200)}
                                        placeholder="Ej: FREEDOM"
                                        className="h-9 uppercase"
                                        autoComplete="off"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                setShowVarietySuggestions(false);
                                                addNewEntry();
                                            }
                                        }}
                                    />
                                    {showVarietySuggestions && filteredVarieties.length > 0 && (
                                        <div
                                            className="absolute top-full left-0 right-0 z-50 mt-1 max-h-40 overflow-auto rounded-md border bg-popover shadow-md">
                                            {filteredVarieties.map((variety) => (
                                                <button
                                                    key={variety.id}
                                                    type="button"
                                                    className="w-full px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground"
                                                    onMouseDown={(e) => e.preventDefault()}
                                                    onClick={() => selectVariety(variety)}
                                                >
                                                    {variety.name.toUpperCase()}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <Button
                                    type="button"
                                    onClick={addNewEntry}
                                    disabled={!newSpeciesName.trim() || !newVarietyName.trim()}
                                    size="sm"
                                    className="h-9"
                                >
                                    <Plus className="mr-1 h-4 w-4" />
                                    Agregar
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Botones */}
                    <div className="flex justify-end gap-4 pt-4 border-t">
                        <Button type="button" variant="outline" asChild>
                            <Link href="/delivery-flow">
                                <X className="mr-2 h-4 w-4" />
                                Volver
                            </Link>
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Guardando...' : (
                                <>
                                    <Save className="mr-2 h-4 w-4" />
                                    Guardar Cambios
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}

