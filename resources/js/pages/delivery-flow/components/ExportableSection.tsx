import { ChevronDown, ChevronUp, Ruler } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import type { EditableEntry, ExportableData, PricesData } from '../_types';
import { calculateEntryTotalPrice, STEM_SIZES } from '../_utils';

interface ExportableSectionProps {
    entry: EditableEntry;
    totalExportable: number;
    isOpen: boolean;
    onToggle: () => void;
    onExportableChange: (key: string, value: string) => void;
    onPriceChange: (key: string, value: string) => void;
}

export function ExportableSection({
    entry,
    totalExportable,
    isOpen,
    onToggle,
    onExportableChange,
    onPriceChange,
}: ExportableSectionProps) {
    const totalPrice = calculateEntryTotalPrice(entry);

    return (
        <Collapsible open={isOpen} onOpenChange={onToggle}>
            <CollapsibleTrigger asChild>
                <div className="flex cursor-pointer items-center justify-between border-b px-4 py-2 hover:bg-muted/30">
                    <div className="flex items-center gap-2">
                        <Ruler className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium">Exportable</span>
                        {totalExportable > 0 && (
                            <Badge className="bg-green-100 text-xs text-green-700">{totalExportable}</Badge>
                        )}
                    </div>
                    {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </div>
            </CollapsibleTrigger>
            <CollapsibleContent>
                <div className="space-y-4 border-b p-4">
                    {/* Grid de tamaños con precios */}
                    <div className="grid gap-2 sm:grid-cols-5 lg:grid-cols-10">
                        {STEM_SIZES.map(({ key, priceKey, label, unit }) => {
                            const qty = Number(entry.exportable[key as keyof ExportableData]) || 0;
                            const price = Number(entry.prices[priceKey as keyof PricesData]) || 0;
                            const subtotal = qty * price;

                            return (
                                <div key={key} className="space-y-1 rounded-lg border bg-muted/30 p-2">
                                    <Label className="block text-center text-xs font-semibold">
                                        {label}
                                        {unit && <span className="text-muted-foreground"> {unit}</span>}
                                    </Label>
                                    <Input
                                        type="text"
                                        inputMode="numeric"
                                        value={entry.exportable[key as keyof ExportableData] || ''}
                                        onChange={(e) => onExportableChange(key, e.target.value)}
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
                                            value={entry.prices[priceKey as keyof PricesData] || ''}
                                            onChange={(e) => onPriceChange(priceKey, e.target.value)}
                                            className="h-7 text-center text-xs"
                                            placeholder="0.00"
                                        />
                                    </div>
                                    {subtotal > 0 && (
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

                    {/* Total de la variedad */}
                    {totalPrice > 0 && (
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
    );
}

