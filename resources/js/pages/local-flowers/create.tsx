import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { Plus, Trash2 } from 'lucide-react';
import React, { FormEventHandler, useMemo, useState } from 'react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
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

interface Rejection {
    id?: number;
    category_id: string;
    subcategory_id: string;
    quantity: string;
    detail: string;
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
    total_classified: number;
    local_quantity: number;
    local_reason: string | null;
    local_is_complete: boolean;
    rejections: ExistingRejection[];
}

interface ProductEntry {
    id: number;
    supplier: Supplier;
    species: Species;
    variety: Variety;
    delivery_date: string;
    quantity: number;
    stem_classification: Classification | null;
}

interface Props {
    entry: ProductEntry;
    classification: Classification;
    categories: Category[];
}

export default function CreateLocalFlower({ entry, classification, categories }: Props) {
    const pageErrors = usePage().props.errors as Record<string, string>;

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Panel', href: '/dashboard' },
        { title: 'Flor Local', href: '/local-flowers' },
        { title: 'Registrar', href: `/product-entries/${entry.id}/local-flower` },
    ];

    // Inicializar con rechazos existentes o uno vacío
    const initialRejections: Rejection[] = classification.rejections?.length > 0
        ? classification.rejections.map(r => ({
            id: r.id,
            category_id: r.rejection_category_id.toString(),
            subcategory_id: r.rejection_subcategory_id?.toString() || '',
            quantity: r.quantity.toString(),
            detail: r.detail || '',
        }))
        : [{ category_id: '', subcategory_id: '', quantity: '', detail: '' }];

    const [rejections, setRejections] = useState<Rejection[]>(initialRejections);

    const { post, processing } = useForm();

    // Calcular el total de flor local
    const totalLocal = useMemo(() => {
        return rejections.reduce((sum, r) => sum + (Number(r.quantity) || 0), 0);
    }, [rejections]);

    // Calcular el restante que debe ir a flor local
    const expectedLocalQuantity = entry.quantity - classification.total_classified;

    // Validación en tiempo real
    const validationStatus = useMemo(() => {
        const total = classification.total_classified + totalLocal;
        const difference = entry.quantity - total;

        if (difference === 0) {
            return { valid: true, message: '✓ Los totales cuadran perfectamente', color: 'text-green-600' };
        } else if (difference > 0) {
            return { valid: false, message: `Faltan ${difference} unidades`, color: 'text-amber-600' };
        } else {
            return { valid: false, message: `Excede por ${Math.abs(difference)} unidades`, color: 'text-destructive' };
        }
    }, [totalLocal, classification.total_classified, entry.quantity]);

    const addRejection = () => {
        setRejections([...rejections, { category_id: '', subcategory_id: '', quantity: '', detail: '' }]);
    };

    const removeRejection = (index: number) => {
        if (rejections.length > 1) {
            setRejections(rejections.filter((_, i) => i !== index));
        }
    };

    const updateRejection = (index: number, field: keyof Rejection, value: string) => {
        const updated = [...rejections];
        updated[index] = { ...updated[index], [field]: value };

        // Si cambia la categoría, resetear subcategoría
        if (field === 'category_id') {
            updated[index].subcategory_id = '';
        }

        // Limpiar ceros a la izquierda en quantity
        if (field === 'quantity') {
            updated[index].quantity = value.replace(/^0+(?=\d)/, '');
        }

        setRejections(updated);
    };

    const getSubcategories = (categoryId: string): Subcategory[] => {
        const category = categories.find(c => c.id.toString() === categoryId);
        return category?.active_subcategories || [];
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        // Validar que todos los rechazos tengan categoría y cantidad
        const validRejections = rejections.filter(r => r.category_id && Number(r.quantity) > 0);

        if (validRejections.length === 0) {
            return;
        }

        // Enviar datos manualmente
        const formData = {
            rejections: validRejections.map(r => ({
                category_id: Number(r.category_id),
                subcategory_id: r.subcategory_id ? Number(r.subcategory_id) : null,
                quantity: Number(r.quantity),
                detail: r.detail || null,
            })),
        };

        post(`/product-entries/${entry.id}/local-flower`, {
            data: formData,
        });
    };

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

    const isFormValid = useMemo(() => {
        const hasValidRejections = rejections.some(r => r.category_id && Number(r.quantity) > 0);
        return hasValidRejections && validationStatus.valid;
    }, [rejections, validationStatus]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Registrar Flor Local" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Registrar Flor Local</h1>
                    <p className="text-sm text-muted-foreground">
                        Clasifica las flores desechadas por categoría y cantidad
                    </p>
                </div>

                {/* Info del ingreso */}
                <div className="rounded-lg border bg-muted/30 p-4">
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <div>
                            <p className="text-xs text-muted-foreground">Proveedor</p>
                            <p className="font-medium">{entry.supplier.name}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Especie / Variedad</p>
                            <p className="font-medium">{entry.species.name} - {entry.variety.name}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Fecha de Entrega</p>
                            <p className="font-medium">{formatDate(entry.delivery_date)}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Cantidad Total Ingreso</p>
                            <p className="text-2xl font-bold text-primary">{entry.quantity}</p>
                        </div>
                    </div>
                </div>

                {/* Resumen de distribución */}
                <div className="grid gap-4 sm:grid-cols-3">
                    <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-center dark:bg-green-950 dark:border-green-800">
                        <p className="text-xs text-green-600 dark:text-green-400">Exportable</p>
                        <p className="text-3xl font-bold text-green-700 dark:text-green-300">{classification.total_classified}</p>
                    </div>
                    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-center dark:bg-amber-950 dark:border-amber-800">
                        <p className="text-xs text-amber-600 dark:text-amber-400">Flor Local</p>
                        <p className="text-3xl font-bold text-amber-700 dark:text-amber-300">{totalLocal}</p>
                        <p className="text-xs text-muted-foreground mt-1">Esperado: {expectedLocalQuantity}</p>
                    </div>
                    <div className={`rounded-lg border p-4 text-center ${
                        validationStatus.valid
                            ? 'border-green-500 bg-green-50 dark:bg-green-950'
                            : 'border-destructive bg-destructive/10'
                    }`}>
                        <p className="text-xs text-muted-foreground">Total</p>
                        <p className={`text-3xl font-bold ${validationStatus.color}`}>
                            {classification.total_classified + totalLocal}
                        </p>
                        <p className={`text-xs mt-1 ${validationStatus.color}`}>
                            {validationStatus.message}
                        </p>
                    </div>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    {/* Lista de rechazos */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label className="text-base font-medium">Razones de Desecho</Label>
                            <Button type="button" variant="outline" size="sm" onClick={addRejection}>
                                <Plus className="mr-2 h-4 w-4" />
                                Agregar Razón
                            </Button>
                        </div>

                        {rejections.map((rejection, index) => (
                            <div key={index} className="rounded-lg border p-4 space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-muted-foreground">
                                        Razón #{index + 1}
                                    </span>
                                    {rejections.length > 1 && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => removeRejection(index)}
                                            className="text-destructive hover:text-destructive"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                    <div className="space-y-2">
                                        <Label>Categoría *</Label>
                                        <Select
                                            value={rejection.category_id}
                                            onValueChange={(value) => updateRejection(index, 'category_id', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Seleccionar..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {categories.map((cat) => (
                                                    <SelectItem key={cat.id} value={cat.id.toString()}>
                                                        {cat.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Subcategoría</Label>
                                        <Select
                                            value={rejection.subcategory_id}
                                            onValueChange={(value) => updateRejection(index, 'subcategory_id', value)}
                                            disabled={!rejection.category_id}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder={rejection.category_id ? "Seleccionar..." : "Primero selecciona categoría"} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {getSubcategories(rejection.category_id).map((sub) => (
                                                    <SelectItem key={sub.id} value={sub.id.toString()}>
                                                        {sub.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Cantidad *</Label>
                                        <Input
                                            type="number"
                                            min="0"
                                            value={rejection.quantity}
                                            onChange={(e) => updateRejection(index, 'quantity', e.target.value)}
                                            placeholder="0"
                                            className="text-center font-medium"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Detalle (opcional)</Label>
                                        <Input
                                            type="text"
                                            value={rejection.detail}
                                            onChange={(e) => updateRejection(index, 'detail', e.target.value)}
                                            placeholder="Información adicional..."
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {pageErrors.total && (
                        <div className="rounded-lg border border-destructive bg-destructive/10 p-3 text-center text-sm text-destructive">
                            {pageErrors.total}
                        </div>
                    )}

                    {pageErrors.general && (
                        <div className="rounded-lg border border-destructive bg-destructive/10 p-3 text-center text-sm text-destructive">
                            {pageErrors.general}
                        </div>
                    )}

                    <div className="flex justify-end gap-4 pt-4 border-t">
                        <Button type="button" variant="outline" asChild>
                            <Link href="/local-flowers">Cancelar</Link>
                        </Button>
                        <Button
                            type="submit"
                            disabled={processing || !isFormValid}
                        >
                            {processing ? 'Guardando...' : 'Guardar Flor Local'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}

