import { Head, Link, router, usePage } from '@inertiajs/react';
import { AlertCircle, Check, ChevronDown, ChevronUp, Edit, Flower2, Ruler, Save, Truck, X } from 'lucide-react';
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
    cm_50: number;
    cm_60: number;
    cm_70: number;
    cm_80: number;
    cm_90: number;
    cm_100: number;
    cm_110: number;
    cm_120: number;
    sobrante: number;
    total_classified: number;
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

interface Props {
    group: ProductEntryGroup;
    categories: Category[];
}

// Estado editable de una entrada
interface EditableEntry {
    id: number;
    species_name: string;
    variety_name: string;
    quantity: string;
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
    localFlower: Record<string, string>;
    exportableOpen: boolean;
    localFlowerOpen: boolean;
}

const stemSizes = [
    { key: 'cm_40', label: '40', unit: 'cm' },
    { key: 'cm_50', label: '50', unit: 'cm' },
    { key: 'cm_60', label: '60', unit: 'cm' },
    { key: 'cm_70', label: '70', unit: 'cm' },
    { key: 'cm_80', label: '80', unit: 'cm' },
    { key: 'cm_90', label: '90', unit: 'cm' },
    { key: 'cm_100', label: '100', unit: 'cm' },
    { key: 'cm_110', label: '110', unit: 'cm' },
    { key: 'cm_120', label: '120', unit: 'cm' },
    { key: 'sobrante', label: 'Sobrante', unit: '' },
];

export default function ShowDeliveryFlow({ group, categories }: Props) {
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

            // Inicializar flor local
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
                species_name: entry.species.name,
                variety_name: entry.variety.name,
                quantity: entry.quantity.toString(),
                exportable: {
                    cm_40: classification?.cm_40?.toString() || '',
                    cm_50: classification?.cm_50?.toString() || '',
                    cm_60: classification?.cm_60?.toString() || '',
                    cm_70: classification?.cm_70?.toString() || '',
                    cm_80: classification?.cm_80?.toString() || '',
                    cm_90: classification?.cm_90?.toString() || '',
                    cm_100: classification?.cm_100?.toString() || '',
                    cm_110: classification?.cm_110?.toString() || '',
                    cm_120: classification?.cm_120?.toString() || '',
                    sobrante: classification?.sobrante?.toString() || '',
                },
                localFlower,
                exportableOpen: false,
                localFlowerOpen: false,
            };
        });
    };

    const [entries, setEntries] = useState<EditableEntry[]>(initializeEntries);
    const [processing, setProcessing] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    // Actualizar exportable
    const updateEntryExportable = (entryId: number, key: string, value: string) => {
        const cleanValue = value.replace(/^0+(?=\d)/, '');
        if (cleanValue === '' || /^\d+$/.test(cleanValue)) {
            setEntries(entries.map(e => e.id === entryId ? {
                ...e,
                exportable: { ...e.exportable, [key]: cleanValue }
            } : e));
        }
    };

    // Actualizar flor local
    const updateEntryLocalFlower = (entryId: number, key: string, value: string) => {
        if (key.endsWith('_detail')) {
            setEntries(entries.map(e => e.id === entryId ? {
                ...e,
                localFlower: { ...e.localFlower, [key]: value }
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
    const toggleExportable = (entryId: number) => {
        setEntries(entries.map(e => e.id === entryId ? { ...e, exportableOpen: !e.exportableOpen } : e));
    };

    const toggleLocalFlower = (entryId: number) => {
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

        entries.forEach(entry => {
            const totals = getEntryTotals(entry);
            totalQuantity += totals.quantity;
            totalExportable += totals.totalExportable;
            totalLocal += totals.totalLocal;
        });

        return {
            totalQuantity,
            totalExportable,
            totalLocal,
            totalClassified: totalExportable + totalLocal,
            remaining: totalQuantity - (totalExportable + totalLocal),
            progress: totalQuantity > 0 ? Math.round(((totalExportable + totalLocal) / totalQuantity) * 100) : 0,
        };
    };

    const globalTotals = calculateGlobalTotals();

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString('es-EC', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
            timeZone: 'America/Guayaquil',
        });
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
                    rejections,
                };
            }),
        };

        setProcessing(true);
        router.put(`/delivery-flow/${group.id}`, formData, {
            onSuccess: () => {
                setSuccessMessage('Cambios guardados exitosamente');
                setTimeout(() => setSuccessMessage(''), 3000);
            },
            onFinish: () => setProcessing(false),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Entrega #${group.id}`} />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">Entrega #{group.id}</h1>
                        <p className="text-sm text-muted-foreground">
                            Edita la clasificación exportable y flor local de cada variedad
                        </p>
                    </div>
                    <Button variant="outline" asChild>
                        <Link href={`/delivery-flow/${group.id}/edit`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar Información
                        </Link>
                    </Button>
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
                                <p className="font-medium">{formatDate(group.entry_datetime)}</p>
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
                <div className="grid gap-4 sm:grid-cols-5">
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
                                ? 'border-destructive bg-destructive/10'
                                : 'border-amber-500 bg-amber-50'
                    }`}>
                        <p className="text-xs text-muted-foreground">Restante</p>
                        <p className={`text-2xl font-bold ${
                            globalTotals.remaining === 0
                                ? 'text-green-600'
                                : globalTotals.remaining < 0
                                    ? 'text-destructive'
                                    : 'text-amber-600'
                        }`}>{globalTotals.remaining}</p>
                    </div>
                    <div className="rounded-lg border p-3 text-center">
                        <p className="text-xs text-muted-foreground">Progreso</p>
                        <div className="flex items-center justify-center gap-2 mt-1">
                            <div className="h-3 w-16 bg-secondary rounded-full overflow-hidden">
                                <div className="h-full bg-primary transition-all" style={{ width: `${globalTotals.progress}%` }} />
                            </div>
                            <span className="text-lg font-bold">{globalTotals.progress}%</span>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSave} className="space-y-4">
                    {/* Lista de entradas */}
                    {entries.map((entry, index) => {
                        const totals = getEntryTotals(entry);
                        return (
                            <Card key={entry.id} className="overflow-hidden">
                                {/* Header */}
                                <div className="flex items-center justify-between bg-muted/50 px-4 py-3 border-b">
                                    <div className="flex items-center gap-4">
                                        <Badge variant="secondary">#{index + 1}</Badge>
                                        <div>
                                            <span className="font-semibold">{entry.species_name}</span>
                                            <span className="mx-2 text-muted-foreground">-</span>
                                            <span>{entry.variety_name}</span>
                                        </div>
                                        <Badge variant="outline" className="text-primary">
                                            {entry.quantity} tallos
                                        </Badge>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm">
                                        <span>Exp: <strong className="text-green-600">{totals.totalExportable}</strong></span>
                                        <span>Local: <strong className="text-amber-600">{totals.totalLocal}</strong></span>
                                        <span className={totals.remaining === 0 ? 'text-green-600' : totals.remaining < 0 ? 'text-destructive' : 'text-amber-600'}>
                                            Rest: <strong>{totals.remaining}</strong>
                                            {totals.remaining === 0 && <Check className="inline ml-1 h-4 w-4" />}
                                        </span>
                                    </div>
                                </div>

                                {/* Exportable */}
                                <Collapsible open={entry.exportableOpen} onOpenChange={() => toggleExportable(entry.id)}>
                                    <CollapsibleTrigger asChild>
                                        <div className="flex items-center justify-between px-4 py-2 cursor-pointer hover:bg-muted/30 border-b">
                                            <div className="flex items-center gap-2">
                                                <Ruler className="h-4 w-4 text-green-600" />
                                                <span className="text-sm font-medium">Exportable</span>
                                                {totals.totalExportable > 0 && (
                                                    <Badge className="bg-green-100 text-green-700 text-xs">{totals.totalExportable}</Badge>
                                                )}
                                            </div>
                                            {entry.exportableOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                        </div>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent>
                                        <div className="p-4 border-b">
                                            <div className="grid gap-3 sm:grid-cols-5 lg:grid-cols-10">
                                                {stemSizes.map(({ key, label, unit }) => (
                                                    <div key={key} className="space-y-1">
                                                        <Label className="text-xs text-center block">
                                                            {label}{unit && <span className="text-muted-foreground"> {unit}</span>}
                                                        </Label>
                                                        <Input
                                                            type="number"
                                                            min="0"
                                                            value={entry.exportable[key as keyof typeof entry.exportable]}
                                                            onChange={(e) => updateEntryExportable(entry.id, key, e.target.value)}
                                                            className="text-center h-8 text-sm"
                                                            placeholder="0"
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </CollapsibleContent>
                                </Collapsible>

                                {/* Flor Local */}
                                <Collapsible open={entry.localFlowerOpen} onOpenChange={() => toggleLocalFlower(entry.id)}>
                                    <CollapsibleTrigger asChild>
                                        <div className="flex items-center justify-between px-4 py-2 cursor-pointer hover:bg-muted/30">
                                            <div className="flex items-center gap-2">
                                                <Flower2 className="h-4 w-4 text-amber-600" />
                                                <span className="text-sm font-medium">Flor Local</span>
                                                {totals.totalLocal > 0 && (
                                                    <Badge className="bg-amber-100 text-amber-700 text-xs">{totals.totalLocal}</Badge>
                                                )}
                                            </div>
                                            {entry.localFlowerOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                        </div>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent>
                                        <div className="p-4 space-y-4">
                                            {categories.map((category) => (
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
                                                                className="h-8"
                                                            />
                                                        </div>
                                                    ) : (
                                                        <div className="space-y-2 ml-4">
                                                            {category.active_subcategories.map((sub) => (
                                                                <div key={sub.id} className="grid gap-2 sm:grid-cols-3 items-center">
                                                                    <span className="text-sm text-muted-foreground">{sub.name}</span>
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
                                                                        className="h-8"
                                                                    />
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </CollapsibleContent>
                                </Collapsible>
                            </Card>
                        );
                    })}

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

