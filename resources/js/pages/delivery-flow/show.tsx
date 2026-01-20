import { Head, Link, usePage } from '@inertiajs/react';
import { AlertCircle, Save, X } from 'lucide-react';
import { type FormEventHandler } from 'react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

import type { Category, ExistingSpecies, ExistingVariety, ProductEntryGroup } from './_types';
import { useDeliveryEntries } from './_useDeliveryEntries';
import { AddVarietyForm, DeliveryHeader, EntryCard, ProgressSummary } from './components';

interface Props {
    group: ProductEntryGroup;
    categories: Category[];
    existingSpecies?: ExistingSpecies[];
    existingVarieties?: ExistingVariety[];
}

export default function ShowDeliveryFlow({ group, categories, existingSpecies = [], existingVarieties = [] }: Props) {
    const pageErrors = usePage().props.errors as Record<string, string>;

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Panel', href: '/dashboard' },
        { title: 'Entrega y Postcosecha', href: '/delivery-flow' },
        { title: `Entrega #${group.id}`, href: `/delivery-flow/${group.id}` },
    ];

    const {
        entries,
        processing,
        globalTotals,
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
        getEntryTotals,
    } = useDeliveryEntries({ group, categories });

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        saveChanges();
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

                {/* Error Message */}
                {pageErrors.general && (
                    <Alert className="border-destructive bg-destructive/10">
                        <AlertCircle className="h-4 w-4 text-destructive" />
                        <AlertDescription className="text-destructive">{pageErrors.general}</AlertDescription>
                    </Alert>
                )}

                {/* Delivery Info */}
                <DeliveryHeader group={group} entriesCount={entries.length} globalTotals={globalTotals} />

                {/* Progress Summary */}
                <ProgressSummary totals={globalTotals} />

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Entry Cards */}
                    {entries.map((entry, index) => (
                        <EntryCard
                            key={entry.id}
                            entry={entry}
                            index={index}
                            totals={getEntryTotals(entry)}
                            categories={categories}
                            onRemove={() => removeEntry(entry.id)}
                            onQuantityChange={(value) => updateQuantity(entry.id, value)}
                            onAddQuantityChange={(value) => updateAddQuantity(entry.id, value)}
                            onRemoveQuantityChange={(value) => updateRemoveQuantity(entry.id, value)}
                            onExportableChange={(key, value) => updateExportable(entry.id, key, value)}
                            onPriceChange={(key, value) => updatePrice(entry.id, key, value)}
                            onLocalFlowerChange={(key, value) => updateLocalFlower(entry.id, key, value)}
                            onToggleExportable={() => toggleExportable(entry.id)}
                            onToggleLocalFlower={() => toggleLocalFlower(entry.id)}
                        />
                    ))}

                    {/* Add Variety Form */}
                    <AddVarietyForm
                        existingSpecies={existingSpecies}
                        existingVarieties={existingVarieties}
                        onAdd={addNewEntry}
                    />

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-4 border-t pt-4">
                        <Button type="button" variant="outline" asChild>
                            <Link href="/delivery-flow">
                                <X className="mr-2 h-4 w-4" />
                                Volver
                            </Link>
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? (
                                'Guardando...'
                            ) : (
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

