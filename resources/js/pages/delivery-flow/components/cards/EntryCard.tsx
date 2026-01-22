import { usePage } from '@inertiajs/react';
import { Check, Trash2 } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ExportableSection } from '@/pages/delivery-flow/components';
import { LocalFlowerSection } from '@/pages/delivery-flow/components';
import type { SharedData } from '@/types';

import type { Category, EditableEntry, EntryTotals } from '../../_types';


interface EntryCardProps {
    entry: EditableEntry;
    index: number;
    totals: EntryTotals;
    categories: Category[];
    onRemove: () => void;
    onQuantityChange: (value: string) => void;
    onAddQuantityChange: (value: string) => void;
    onRemoveQuantityChange: (value: string) => void;
    onExportableChange: (key: string, value: string) => void;
    onPriceChange: (key: string, value: string) => void;
    onLocalFlowerChange: (key: string, value: string) => void;
    onToggleExportable: () => void;
    onToggleLocalFlower: () => void;
}

export function EntryCard({
    entry,
    index,
    totals,
    categories,
    onRemove,
    onQuantityChange,
    onAddQuantityChange,
    onRemoveQuantityChange,
    onExportableChange,
    onPriceChange,
    onLocalFlowerChange,
    onToggleExportable,
    onToggleLocalFlower,
}: EntryCardProps) {
    // Si es digitador, tiene vista restringida
    const { isDataEntryUser } = usePage<SharedData>().props;

    return (
        <Card className={`overflow-hidden ${entry.isNew ? 'border-2 border-dashed border-primary/50' : ''}`}>
            {/* Header */}
            <div className="flex flex-col gap-3 border-b bg-muted/50 px-4 py-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Badge variant={entry.isNew ? 'default' : 'secondary'}>
                            {entry.isNew ? 'Nuevo' : `#${index + 1}`}
                        </Badge>
                        <div>
                            <span className="font-semibold">{entry.species_name}</span>
                            <span className="mx-2 text-muted-foreground">-</span>
                            <span>{entry.variety_name}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                        {/* Ocultar totales para digitadores */}
                        {!isDataEntryUser && (
                            <>
                                <span>
                                    Exp: <strong className="text-green-600">{totals.totalExportable}</strong>
                                </span>
                                <span>
                                    Local: <strong className="text-amber-600">{totals.totalLocal}</strong>
                                </span>
                                <span
                                    className={
                                        totals.remaining === 0
                                            ? 'text-green-600'
                                            : totals.remaining < 0
                                              ? 'text-destructive'
                                              : 'text-amber-600'
                                    }
                                >
                                    Rest: <strong>{totals.remaining}</strong>
                                    {totals.remaining === 0 && <Check className="ml-1 inline h-4 w-4" />}
                                </span>
                            </>
                        )}
                        {entry.isNew && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={onRemove}
                                className="text-destructive hover:text-destructive"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </div>

                {/* Sección de cantidad de tallos - ocultar para digitadores */}
                {!isDataEntryUser && (
                    <QuantitySection
                        entry={entry}
                        onQuantityChange={onQuantityChange}
                        onAddQuantityChange={onAddQuantityChange}
                        onRemoveQuantityChange={onRemoveQuantityChange}
                    />
                )}
            </div>

            {/* Exportable */}
            <ExportableSection
                entry={entry}
                totalExportable={totals.totalExportable}
                isOpen={entry.exportableOpen}
                onToggle={onToggleExportable}
                onExportableChange={onExportableChange}
                onPriceChange={onPriceChange}
            />

            {/* Flor Local */}
            <LocalFlowerSection
                entry={entry}
                categories={categories}
                totalLocal={totals.totalLocal}
                isOpen={entry.localFlowerOpen}
                onToggle={onToggleLocalFlower}
                onLocalFlowerChange={onLocalFlowerChange}
            />
        </Card>
    );
}

// Sub-componente para la sección de cantidad
interface QuantitySectionProps {
    entry: EditableEntry;
    onQuantityChange: (value: string) => void;
    onAddQuantityChange: (value: string) => void;
    onRemoveQuantityChange: (value: string) => void;
}

function QuantitySection({
    entry,
    onQuantityChange,
    onAddQuantityChange,
    onRemoveQuantityChange,
}: QuantitySectionProps) {
    if (entry.isNew) {
        return (
            <div className="flex flex-wrap items-center gap-4 border-t border-border/50 pt-2">
                <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Cantidad:</span>
                    <Input
                        type="text"
                        inputMode="numeric"
                        value={entry.quantity || ''}
                        onChange={(e) => onQuantityChange(e.target.value)}
                        className="h-8 w-24 text-center"
                        placeholder="0"
                    />
                    <span className="text-sm text-muted-foreground">tallos</span>
                </div>
            </div>
        );
    }

    const quantityChanged = Number(entry.quantity) !== entry.originalQuantity;
    const difference = Number(entry.quantity) - entry.originalQuantity;

    return (
        <div className="flex flex-wrap items-center gap-4 border-t border-border/50 pt-2">
            <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Original:</span>
                <span className="font-semibold text-primary">{entry.originalQuantity}</span>
                <span className="text-sm text-muted-foreground">tallos</span>
            </div>
            <div className="flex items-center gap-2">
                <span className="text-sm text-green-600">+ Aumentar:</span>
                <Input
                    type="text"
                    inputMode="numeric"
                    value={entry.addQuantity || ''}
                    onChange={(e) => onAddQuantityChange(e.target.value)}
                    className="h-8 w-20 border-green-300 text-center focus:border-green-500"
                    placeholder="0"
                />
            </div>
            <div className="flex items-center gap-2">
                <span className="text-sm text-red-600">- Quitar:</span>
                <Input
                    type="text"
                    inputMode="numeric"
                    value={entry.removeQuantity || ''}
                    onChange={(e) => onRemoveQuantityChange(e.target.value)}
                    className="h-8 w-20 border-red-300 text-center focus:border-red-500"
                    placeholder="0"
                />
            </div>
            <div className="ml-auto flex items-center gap-2">
                <span className="text-sm font-medium">Total:</span>
                <Badge
                    variant="outline"
                    className={`px-3 py-1 text-base ${
                        quantityChanged ? 'border-blue-300 bg-blue-50 text-blue-700' : ''
                    }`}
                >
                    {entry.quantity || 0} tallos
                </Badge>
                {quantityChanged && (
                    <span className="text-xs text-blue-600">
                        ({difference > 0 ? '+' : ''}
                        {difference})
                    </span>
                )}
            </div>
        </div>
    );
}

