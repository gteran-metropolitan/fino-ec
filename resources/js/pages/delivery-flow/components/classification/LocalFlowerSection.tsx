import { ChevronDown, ChevronUp, Flower2 } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';

import type { Category, EditableEntry } from '../../_types';

interface LocalFlowerSectionProps {
    entry: EditableEntry;
    categories: Category[];
    totalLocal: number;
    isOpen: boolean;
    onToggle: () => void;
    onLocalFlowerChange: (key: string, value: string) => void;
}

export function LocalFlowerSection({
    entry,
    categories,
    totalLocal,
    isOpen,
    onToggle,
    onLocalFlowerChange,
}: LocalFlowerSectionProps) {
    return (
        <Collapsible open={isOpen} onOpenChange={onToggle}>
            <CollapsibleTrigger asChild>
                <div className="flex cursor-pointer items-center justify-between px-4 py-2 hover:bg-muted/30">
                    <div className="flex items-center gap-2">
                        <Flower2 className="h-4 w-4 text-amber-600" />
                        <span className="text-sm font-medium">Flor Local</span>
                        {totalLocal > 0 && (
                            <Badge className="bg-amber-100 text-xs text-amber-700">{totalLocal}</Badge>
                        )}
                    </div>
                    {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
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
                                            onChange={(e) => onLocalFlowerChange(`cat_${category.id}`, e.target.value)}
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
                                                    onChange={(e) => onLocalFlowerChange(`sub_${sub.id}`, e.target.value)}
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
    );
}

