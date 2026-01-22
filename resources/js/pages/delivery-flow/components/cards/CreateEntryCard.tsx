import { usePage } from '@inertiajs/react';
import { Check, ChevronDown, ChevronUp, Flower2, Ruler, Trash2 } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { SharedData } from '@/types';

import type { Category, ExportableData, PricesData } from '../../_types';
import { STEM_SIZES } from '../../_utils';

// Tipo para la entrada de variedad en el formulario de creación
interface VarietyEntry {
    id: string;
    species_name: string;
    variety_name: string;
    quantity: string;
    exportable: ExportableData;
    prices: PricesData;
    localFlower: Record<string, string>;
    exportableOpen: boolean;
    localFlowerOpen: boolean;
}

interface EntryTotals {
    quantity: number;
    totalExportable: number;
    totalLocal: number;
    remaining: number;
}

interface CreateEntryCardProps {
    entry: VarietyEntry;
    index: number;
    totals: EntryTotals;
    categories: Category[];
    totalPrice: number;
    onRemove: () => void;
    onQuantityChange: (value: string) => void;
    onExportableChange: (key: string, value: string) => void;
    onPriceChange: (key: string, value: string) => void;
    onLocalFlowerChange: (key: string, value: string) => void;
    onToggleExportable: () => void;
    onToggleLocalFlower: () => void;
}

export function CreateEntryCard({
    entry,
    index,
    totals,
    categories,
    totalPrice,
    onRemove,
    onQuantityChange,
    onExportableChange,
    onPriceChange,
    onLocalFlowerChange,
    onToggleExportable,
    onToggleLocalFlower,
}: CreateEntryCardProps) {
    // Si es digitador, tiene vista restringida
    const { isDataEntryUser } = usePage<SharedData>().props;

    return (
        <Card className="overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between border-b bg-muted/50 px-4 py-3">
                <div className="flex items-center gap-4">
                    <Badge variant="secondary" className="text-xs">
                        #{index + 1}
                    </Badge>
                    <div>
                        <span className="font-semibold">{entry.species_name}</span>
                        <span className="mx-2 text-muted-foreground">-</span>
                        <span>{entry.variety_name}</span>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Label className="text-sm">Cantidad:</Label>
                        <Input
                            type="text"
                            inputMode="numeric"
                            value={entry.quantity || ''}
                            onChange={(e) => onQuantityChange(e.target.value)}
                            className="h-8 w-24"
                            placeholder="0"
                        />
                    </div>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={onRemove}
                        className="text-destructive hover:text-destructive"
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Resumen - ocultar para digitadores */}
            {!isDataEntryUser && entry.quantity && Number(entry.quantity) > 0 && (
                <div className="flex gap-4 border-b bg-muted/20 px-4 py-2 text-sm">
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
                        Restante: <strong>{totals.remaining}</strong>
                        {totals.remaining === 0 && <Check className="ml-1 inline h-4 w-4" />}
                    </span>
                </div>
            )}

            {/* Exportable */}
            <Collapsible open={entry.exportableOpen} onOpenChange={onToggleExportable}>
                <CollapsibleTrigger asChild>
                    <div className="flex cursor-pointer items-center justify-between border-b px-4 py-2 hover:bg-muted/30">
                        <div className="flex items-center gap-2">
                            <Ruler className="h-4 w-4 text-green-600" />
                            <span className="text-sm font-medium">Exportable</span>
                            {/* Ocultar badge de total para digitadores */}
                            {!isDataEntryUser && totals.totalExportable > 0 && (
                                <Badge className="bg-green-100 text-xs text-green-700">{totals.totalExportable}</Badge>
                            )}
                        </div>
                        {entry.exportableOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                    <div className="space-y-4 border-b p-4">
                        <div className="grid gap-2 sm:grid-cols-5 lg:grid-cols-10">
                            {STEM_SIZES.map(({ key, priceKey, label, unit }) => {
                                // Usamos "as keyof" para decirle a TypeScript que key/priceKey son claves válidas
                                const exportableKey = key as keyof ExportableData;
                                const pricesKey = priceKey as keyof PricesData;

                                const qty = Number(entry.exportable[exportableKey]) || 0;
                                const price = Number(entry.prices[pricesKey]) || 0;
                                const subtotal = qty * price;

                                return (
                                    <div
                                        key={key}
                                        className="space-y-1 rounded-lg border bg-muted/30 p-2"
                                    >
                                        <Label className="block text-center text-xs font-semibold">
                                            {label}
                                            {unit && (
                                                <span className="text-muted-foreground">
                                                    {' '}
                                                    {unit}
                                                </span>
                                            )}
                                        </Label>
                                        <Input
                                            type="text"
                                            inputMode="numeric"
                                            value={
                                                entry.exportable[
                                                    exportableKey
                                                ] || ''
                                            }
                                            onChange={(e) =>
                                                onExportableChange(
                                                    key,
                                                    e.target.value,
                                                )
                                            }
                                            className="h-8 text-center text-sm"
                                            placeholder="0"
                                        />
                                        <div className="border-t pt-1">
                                            <Label className="block text-center text-[10px] text-muted-foreground">
                                                Precio $
                                            </Label>
                                            <Input
                                                type="text"
                                                inputMode="decimal"
                                                value={
                                                    entry.prices[pricesKey] ||
                                                    ''
                                                }
                                                onChange={(e) =>
                                                    onPriceChange(
                                                        priceKey,
                                                        e.target.value,
                                                    )
                                                }
                                                className="h-7 text-center text-xs"
                                                placeholder="0.00"
                                            />
                                        </div>
                                        {!isDataEntryUser && subtotal > 0 && (
                                            <div className="border-t pt-1 text-center">
                                                <span className="text-[10px] font-medium text-green-600">
                                                    ${subtotal.toFixed(2)}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Ocultar total precio para digitadores */}
                        {!isDataEntryUser && totalPrice > 0 && (
                            <div className="flex justify-end border-t pt-3">
                                <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-2 text-right">
                                    <span className="block text-xs text-green-600">Total Exportable</span>
                                    <span className="text-xl font-bold text-green-700">${totalPrice.toFixed(2)}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </CollapsibleContent>
            </Collapsible>

            {/* Flor Local */}
            <Collapsible open={entry.localFlowerOpen} onOpenChange={onToggleLocalFlower}>
                <CollapsibleTrigger asChild>
                    <div className="flex cursor-pointer items-center justify-between px-4 py-2 hover:bg-muted/30">
                        <div className="flex items-center gap-2">
                            <Flower2 className="h-4 w-4 text-amber-600" />
                            <span className="text-sm font-medium">Flor Local</span>
                            {/* Ocultar badge de total para digitadores */}
                            {!isDataEntryUser && totals.totalLocal > 0 && (
                                <Badge className="bg-amber-100 text-xs text-amber-700">{totals.totalLocal}</Badge>
                            )}
                        </div>
                        {entry.localFlowerOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                    <div className="space-y-4 p-4">
                        {categories.length === 0 ? (
                            <p className="py-4 text-center text-sm text-muted-foreground">
                                No hay categorías de rechazo configuradas
                            </p>
                        ) : (
                            categories.map((category) => (
                                <div key={category.id} className="space-y-2">
                                    <h4 className="text-sm font-medium">{category.name}</h4>

                                    {!category.active_subcategories || category.active_subcategories.length === 0 ? (
                                        <div className="ml-4 grid gap-2 sm:grid-cols-2">
                                            <Input
                                                type="text"
                                                inputMode="numeric"
                                                value={entry.localFlower[`cat_${category.id}`] || ''}
                                                onChange={(e) =>
                                                    onLocalFlowerChange(`cat_${category.id}`, e.target.value)
                                                }
                                                placeholder="Cantidad"
                                                className="h-8"
                                            />
                                            <Input
                                                type="text"
                                                value={entry.localFlower[`cat_${category.id}_detail`] || ''}
                                                onChange={(e) =>
                                                    onLocalFlowerChange(`cat_${category.id}_detail`, e.target.value)
                                                }
                                                placeholder="Detalle (opcional)"
                                                className="h-8 uppercase"
                                            />
                                        </div>
                                    ) : (
                                        <div className="ml-4 space-y-2">
                                            {category.active_subcategories.map((sub) => (
                                                <div key={sub.id} className="grid items-center gap-2 sm:grid-cols-3">
                                                    <span className="text-sm text-muted-foreground">{sub.name}</span>
                                                    <Input
                                                        type="text"
                                                        inputMode="numeric"
                                                        value={entry.localFlower[`sub_${sub.id}`] || ''}
                                                        onChange={(e) =>
                                                            onLocalFlowerChange(`sub_${sub.id}`, e.target.value)
                                                        }
                                                        placeholder="Cantidad"
                                                        className="h-8"
                                                    />
                                                    <Input
                                                        type="text"
                                                        value={entry.localFlower[`sub_${sub.id}_detail`] || ''}
                                                        onChange={(e) =>
                                                            onLocalFlowerChange(`sub_${sub.id}_detail`, e.target.value)
                                                        }
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
}

