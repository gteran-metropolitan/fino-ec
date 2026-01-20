import { Head, Link } from '@inertiajs/react';
import { Check, Save, X } from 'lucide-react';
import { type FormEventHandler } from 'react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

import type { Category, ExistingSpecies, ExistingVariety } from './_types';
import { useCreateDelivery } from './_useCreateDelivery';
import { calculateEntryTotalPrice } from './_utils';
import {
    CreateEntryCard,
    CreateSupplierDialog,
    ExistingDeliveryDialog,
    ProgressSummary,
    SupplierSearch,
    VarietySelector,
} from './components';

interface Props {
    categories: Category[];
    existingSpecies: ExistingSpecies[];
    existingVarieties: ExistingVariety[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Panel', href: '/dashboard' },
    { title: 'Entrega y Postcosecha', href: '/delivery-flow' },
    { title: 'Nueva Entrega', href: '/delivery-flow/create' },
];

export default function CreateDeliveryFlow({ categories, existingSpecies = [], existingVarieties = [] }: Props) {
    const delivery = useCreateDelivery({ categories, existingSpecies, existingVarieties });

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        delivery.save();
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Nueva Entrega" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Nueva Entrega y Postcosecha</h1>
                    <p className="text-sm text-muted-foreground">
                        Registra la entrega completa: variedades, clasificación exportable y flor local
                    </p>
                </div>

                {/* Success Message */}
                {delivery.successMessage && (
                    <Alert className="border-green-500 bg-green-50">
                        <Check className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-700">{delivery.successMessage}</AlertDescription>
                    </Alert>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Step 1: Supplier Search */}
                    {delivery.currentStep === 'supplier' && (
                        <SupplierSearch
                            supplierCode={delivery.supplierCode}
                            onCodeChange={delivery.setSupplierCode}
                            onSearch={delivery.searchSupplier}
                            searching={delivery.searchingSupplier}
                            searchMessage={delivery.searchMessage}
                            onShowCreateSupplier={() => delivery.setShowCreateSupplier(true)}
                        />
                    )}

                    {/* Step 2: Entry Data */}
                    {delivery.currentStep === 'entry' && delivery.selectedSupplier && (
                        <>
                            <VarietySelector
                                supplier={delivery.selectedSupplier}
                                deliveryDate={delivery.deliveryDate}
                                deliveryTime={delivery.deliveryTime}
                                onDateChange={delivery.setDeliveryDate}
                                onTimeChange={delivery.setDeliveryTime}
                                onBack={delivery.backToSupplier}
                                groupedVarieties={delivery.groupedAvailableVarieties}
                                onSelectVariety={delivery.addVariety}
                                newSpeciesName={delivery.newSpeciesName}
                                newVarietyName={delivery.newVarietyName}
                                onSpeciesChange={delivery.handleSpeciesChange}
                                onVarietyChange={delivery.handleVarietyChange}
                                showSpeciesSuggestions={delivery.showSpeciesSuggestions}
                                showVarietySuggestions={delivery.showVarietySuggestions}
                                setShowSpeciesSuggestions={delivery.setShowSpeciesSuggestions}
                                setShowVarietySuggestions={delivery.setShowVarietySuggestions}
                                filteredSpecies={delivery.filteredSpecies}
                                filteredVarieties={delivery.filteredVarieties}
                                onSelectSpecies={delivery.selectSpecies}
                                onSelectVariety2={delivery.selectVariety}
                                onAddManualVariety={delivery.addManualVariety}
                            />

                            {/* Progress Summary */}
                            {delivery.entries.length > 0 && <ProgressSummary totals={delivery.globalTotals} />}

                            {/* Entry Cards */}
                            {delivery.entries.map((entry, index) => (
                                <CreateEntryCard
                                    key={entry.id}
                                    entry={entry}
                                    index={index}
                                    totals={delivery.getEntryTotals(entry)}
                                    categories={categories}
                                    totalPrice={calculateEntryTotalPrice(entry as any)}
                                    onRemove={() => delivery.removeEntry(entry.id)}
                                    onQuantityChange={(value) => delivery.updateQuantity(entry.id, value)}
                                    onExportableChange={(key, value) => delivery.updateExportable(entry.id, key, value)}
                                    onPriceChange={(key, value) => delivery.updatePrice(entry.id, key, value)}
                                    onLocalFlowerChange={(key, value) => delivery.updateLocalFlower(entry.id, key, value)}
                                    onToggleExportable={() => delivery.toggleExportable(entry.id)}
                                    onToggleLocalFlower={() => delivery.toggleLocalFlower(entry.id)}
                                />
                            ))}

                            {/* Empty State */}
                            {delivery.entries.length === 0 && (
                                <div className="rounded-lg border border-dashed py-8 text-center text-muted-foreground">
                                    <p>No has seleccionado ninguna variedad</p>
                                    <p className="text-sm">Selecciona de las variedades registradas o agrega manualmente</p>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex justify-end gap-4 border-t pt-4">
                                <Button type="button" variant="outline" asChild>
                                    <Link href="/delivery-flow">
                                        <X className="mr-2 h-4 w-4" />
                                        Cancelar
                                    </Link>
                                </Button>
                                <Button type="submit" disabled={delivery.processing || !delivery.canSave}>
                                    {delivery.processing ? (
                                        'Guardando...'
                                    ) : (
                                        <>
                                            <Save className="mr-2 h-4 w-4" />
                                            Guardar Entrega
                                        </>
                                    )}
                                </Button>
                            </div>
                        </>
                    )}
                </form>

                {/* Create Supplier Dialog */}
                <CreateSupplierDialog
                    open={delivery.showCreateSupplier}
                    onOpenChange={delivery.setShowCreateSupplier}
                    supplierData={delivery.newSupplier}
                    onSupplierDataChange={delivery.setNewSupplier}
                    errors={delivery.newSupplierErrors}
                    creating={delivery.creatingSupplier}
                    onSubmit={delivery.createSupplier}
                />

                {/* Existing Delivery Dialog */}
                <ExistingDeliveryDialog
                    open={delivery.showExistingDeliveryDialog}
                    onOpenChange={delivery.setShowExistingDeliveryDialog}
                    delivery={delivery.existingDelivery}
                    onContinueNew={delivery.continueNewDelivery}
                    onEditExisting={delivery.editExistingDelivery}
                />
            </div>
        </AppLayout>
    );
}
