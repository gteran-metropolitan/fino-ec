import { Plus, Truck } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import type { ExistingSpecies, ExistingVariety } from '../_types';

interface SupplierVariety {
    id: number;
    species_name: string;
    variety_name: string;
}

interface Supplier {
    id: number;
    code: string;
    name: string;
}

interface VarietySelectorProps {
    supplier: Supplier;
    deliveryDate: string;
    deliveryTime: string;
    onDateChange: (date: string) => void;
    onTimeChange: (time: string) => void;
    onBack: () => void;
    groupedVarieties: Record<string, SupplierVariety[]>;
    onSelectVariety: (variety: SupplierVariety) => void;
    // Manual variety
    newSpeciesName: string;
    newVarietyName: string;
    onSpeciesChange: (value: string) => void;
    onVarietyChange: (value: string) => void;
    showSpeciesSuggestions: boolean;
    showVarietySuggestions: boolean;
    setShowSpeciesSuggestions: (show: boolean) => void;
    setShowVarietySuggestions: (show: boolean) => void;
    filteredSpecies: ExistingSpecies[];
    filteredVarieties: ExistingVariety[];
    onSelectSpecies: (species: ExistingSpecies) => void;
    onSelectVariety2: (variety: ExistingVariety) => void;
    onAddManualVariety: () => void;
}

export function VarietySelector({
    supplier,
    deliveryDate,
    deliveryTime,
    onDateChange,
    onTimeChange,
    onBack,
    groupedVarieties,
    onSelectVariety,
    newSpeciesName,
    newVarietyName,
    onSpeciesChange,
    onVarietyChange,
    showSpeciesSuggestions,
    showVarietySuggestions,
    setShowSpeciesSuggestions,
    setShowVarietySuggestions,
    filteredSpecies,
    filteredVarieties,
    onSelectSpecies,
    onSelectVariety2,
    onAddManualVariety,
}: VarietySelectorProps) {
    const hasRegisteredVarieties = Object.keys(groupedVarieties).length > 0;

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Truck className="h-5 w-5 text-muted-foreground" />
                        <CardTitle>Paso 2: Datos de la Entrega</CardTitle>
                    </div>
                    <Button type="button" variant="outline" size="sm" onClick={onBack}>
                        Cambiar proveedor
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Info del proveedor */}
                <div className="rounded-lg border bg-muted/30 p-4">
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <div>
                            <p className="text-xs text-muted-foreground">Proveedor</p>
                            <p className="font-medium">{supplier.name}</p>
                            <p className="text-xs text-muted-foreground">Código: {supplier.code}</p>
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="deliveryDate" className="text-xs">
                                Fecha de Entrega
                            </Label>
                            <Input
                                id="deliveryDate"
                                type="date"
                                value={deliveryDate}
                                onChange={(e) => onDateChange(e.target.value)}
                                className="h-9"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="deliveryTime" className="text-xs">
                                Hora de Entrega
                            </Label>
                            <Input
                                id="deliveryTime"
                                type="time"
                                value={deliveryTime}
                                onChange={(e) => onTimeChange(e.target.value)}
                                className="h-9"
                            />
                        </div>
                    </div>
                </div>

                {/* Variedades registradas del proveedor */}
                {hasRegisteredVarieties && (
                    <div className="space-y-3">
                        <Label className="text-base font-medium">Variedades Registradas del Proveedor</Label>
                        <p className="text-sm text-muted-foreground">Haz clic en una variedad para agregarla</p>
                        <div className="space-y-3">
                            {Object.entries(groupedVarieties).map(([speciesName, varieties]) => (
                                <div key={speciesName} className="space-y-2">
                                    <h4 className="text-sm font-medium text-muted-foreground">{speciesName}</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {varieties.map((sv) => (
                                            <Button
                                                key={sv.id}
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => onSelectVariety(sv)}
                                                className="gap-1"
                                            >
                                                <Plus className="h-3 w-3" />
                                                {sv.variety_name}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Agregar variedad manual */}
                <div className="space-y-3 border-t pt-4">
                    <Label className="text-base font-medium">Agregar Variedad Manualmente</Label>
                    {!hasRegisteredVarieties && (
                        <p className="text-sm text-amber-600">
                            Este proveedor no tiene variedades registradas. Agrega las variedades manualmente.
                        </p>
                    )}
                    <div className="flex flex-wrap items-end gap-3">
                        {/* Especie */}
                        <div className="relative min-w-[150px] flex-1 space-y-1">
                            <Label className="text-xs">Especie *</Label>
                            <Input
                                type="text"
                                value={newSpeciesName}
                                onChange={(e) => onSpeciesChange(e.target.value)}
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
                                <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-40 overflow-auto rounded-md border bg-popover shadow-md">
                                    {filteredSpecies.map((species) => (
                                        <button
                                            key={species.id}
                                            type="button"
                                            className="w-full px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground"
                                            onMouseDown={(e) => e.preventDefault()}
                                            onClick={() => onSelectSpecies(species)}
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
                                onChange={(e) => onVarietyChange(e.target.value)}
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
                                        onAddManualVariety();
                                    }
                                }}
                            />
                            {showVarietySuggestions && filteredVarieties.length > 0 && (
                                <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-40 overflow-auto rounded-md border bg-popover shadow-md">
                                    {filteredVarieties.map((variety) => (
                                        <button
                                            key={variety.id}
                                            type="button"
                                            className="w-full px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground"
                                            onMouseDown={(e) => e.preventDefault()}
                                            onClick={() => onSelectVariety2(variety)}
                                        >
                                            {variety.name.toUpperCase()}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <Button
                            type="button"
                            onClick={onAddManualVariety}
                            disabled={!newSpeciesName.trim() || !newVarietyName.trim()}
                            size="sm"
                            className="h-9"
                        >
                            <Plus className="mr-1 h-4 w-4" />
                            Agregar
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

