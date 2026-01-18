import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler, useMemo } from 'react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
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
    classification: Classification | null;
}

const stemSizes = [
    { key: 'cm_40', label: '40 cm' },
    { key: 'cm_50', label: '50 cm' },
    { key: 'cm_60', label: '60 cm' },
    { key: 'cm_70', label: '70 cm' },
    { key: 'cm_80', label: '80 cm' },
    { key: 'cm_90', label: '90 cm' },
    { key: 'cm_100', label: '100 cm' },
    { key: 'cm_110', label: '110 cm' },
    { key: 'cm_120', label: '120 cm' },
    { key: 'sobrante', label: 'Sobrante' },
];

export default function ClassifyProductEntry({ entry, classification }: Props) {
    const pageErrors = usePage().props.errors as Record<string, string>;

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Panel',
            href: '/dashboard',
        },
        {
            title: 'Ingreso de Productos',
            href: '/product-entries',
        },
        {
            title: 'Clasificar',
            href: `/product-entries/${entry.id}/classify`,
        },
    ];

    const { data, setData, post, processing, errors } = useForm({
        cm_40: classification?.cm_40 || '',
        cm_50: classification?.cm_50 || '',
        cm_60: classification?.cm_60 || '',
        cm_70: classification?.cm_70 || '',
        cm_80: classification?.cm_80 || '',
        cm_90: classification?.cm_90 || '',
        cm_100: classification?.cm_100 || '',
        cm_110: classification?.cm_110 || '',
        cm_120: classification?.cm_120 || '',
        sobrante: classification?.sobrante || '',
    });

    // Calcular totales con useMemo para evitar setState en useEffect
    const totalClassified = useMemo(() => {
        return (
            (Number(data.cm_40) || 0) +
            (Number(data.cm_50) || 0) +
            (Number(data.cm_60) || 0) +
            (Number(data.cm_70) || 0) +
            (Number(data.cm_80) || 0) +
            (Number(data.cm_90) || 0) +
            (Number(data.cm_100) || 0) +
            (Number(data.cm_110) || 0) +
            (Number(data.cm_120) || 0) +
            (Number(data.sobrante) || 0)
        );
    }, [data]);

    const remaining = entry.quantity - totalClassified;

    const handleValueChange = (key: string, value: string) => {
        // Limpiar ceros a la izquierda (convierte "010" a "10")
        const cleanValue = value.replace(/^0+(?=\d)/, '');

        // Permitir campo vacío o números válidos
        if (cleanValue === '' || /^\d+$/.test(cleanValue)) {
            setData(key as keyof typeof data, cleanValue);
        }
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(`/product-entries/${entry.id}/classify`);
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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Clasificar Tallos" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Clasificar por Tamaño de Tallo</h1>
                    <p className="text-sm text-muted-foreground">
                        Distribuye la cantidad total entre los diferentes tamaños de tallo
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
                            <p className="text-xs text-muted-foreground">Cantidad Total</p>
                            <p className="text-2xl font-bold text-primary">{entry.quantity}</p>
                        </div>
                    </div>
                </div>

                {/* Contador de restantes */}
                <div className={`rounded-lg border p-4 text-center ${
                    remaining === 0
                        ? 'border-green-500 bg-green-50 dark:bg-green-950'
                        : remaining < 0
                            ? 'border-destructive bg-destructive/10'
                            : 'border-amber-500 bg-amber-50 dark:bg-amber-950'
                }`}>
                    <p className="text-sm text-muted-foreground">Restante por clasificar</p>
                    <p className={`text-4xl font-bold ${
                        remaining === 0
                            ? 'text-green-600'
                            : remaining < 0
                                ? 'text-destructive'
                                : 'text-amber-600'
                    }`}>
                        {remaining}
                    </p>
                    {remaining === 0 && (
                        <p className="mt-1 text-sm text-green-600">✓ Clasificación completa</p>
                    )}
                    {remaining < 0 && (
                        <p className="mt-1 text-sm text-destructive">⚠ Excede la cantidad total</p>
                    )}
                </div>

                <form onSubmit={submit} className="space-y-6">
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                        {stemSizes.map(({ key, label }) => (
                            <div key={key} className="space-y-2">
                                <Label htmlFor={key} className="text-center block">
                                    {label}
                                </Label>
                                <Input
                                    id={key}
                                    type="number"
                                    min="0"
                                    value={data[key as keyof typeof data]}
                                    onChange={(e) => handleValueChange(key, e.target.value)}
                                    className="text-center text-lg font-medium"
                                />
                                <InputError message={errors[key as keyof typeof errors]} />
                            </div>
                        ))}
                    </div>

                    {pageErrors.total && (
                        <div className="rounded-lg border border-destructive bg-destructive/10 p-3 text-center text-sm text-destructive">
                            {pageErrors.total}
                        </div>
                    )}

                    {/* Resumen */}
                    <div className="rounded-lg border p-4">
                        <h3 className="mb-3 font-medium">Resumen de Clasificación</h3>
                        <div className="grid gap-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Total del ingreso:</span>
                                <span className="font-medium">{entry.quantity}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Total clasificado:</span>
                                <span className="font-medium">{totalClassified}</span>
                            </div>
                            <div className="flex justify-between border-t pt-2">
                                <span className="text-muted-foreground">Restante:</span>
                                <span className={`font-bold ${
                                    remaining === 0
                                        ? 'text-green-600'
                                        : remaining < 0
                                            ? 'text-destructive'
                                            : 'text-amber-600'
                                }`}>
                                    {remaining}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-4 pt-4 border-t">
                        <Button type="button" variant="outline" asChild>
                            <Link href="/product-entries">Cancelar</Link>
                        </Button>
                        <Button
                            type="submit"
                            disabled={processing || remaining < 0}
                        >
                            {processing ? 'Guardando...' : 'Guardar Clasificación'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}

