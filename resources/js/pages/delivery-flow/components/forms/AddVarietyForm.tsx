import { Plus } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import type { ExistingSpecies, ExistingVariety } from '../../_types';

interface AddVarietyFormProps {
    existingSpecies: ExistingSpecies[];
    existingVarieties: ExistingVariety[];
    onAdd: (speciesName: string, varietyName: string) => void;
}

export function AddVarietyForm({ existingSpecies, existingVarieties, onAdd }: AddVarietyFormProps) {
    const [speciesName, setSpeciesName] = useState('');
    const [varietyName, setVarietyName] = useState('');
    const [showSpeciesSuggestions, setShowSpeciesSuggestions] = useState(false);
    const [showVarietySuggestions, setShowVarietySuggestions] = useState(false);
    const [filteredSpecies, setFilteredSpecies] = useState<ExistingSpecies[]>([]);
    const [filteredVarieties, setFilteredVarieties] = useState<ExistingVariety[]>([]);

    const handleSpeciesChange = (value: string) => {
        const upperValue = value.toUpperCase().replace(/[^A-ZÁÉÍÓÚÑÜ\s]/g, '');
        setSpeciesName(upperValue);

        if (upperValue.trim()) {
            const filtered = existingSpecies.filter((s) => s.name.toUpperCase().includes(upperValue.trim()));
            setFilteredSpecies(filtered);
            setShowSpeciesSuggestions(filtered.length > 0);
        } else {
            setFilteredSpecies([]);
            setShowSpeciesSuggestions(false);
        }
    };

    const handleVarietyChange = (value: string) => {
        const upperValue = value.toUpperCase().replace(/[^A-ZÁÉÍÓÚÑÜ0-9\s-]/g, '');
        setVarietyName(upperValue);

        if (upperValue.trim()) {
            const currentSpecies = existingSpecies.find(
                (s) => s.name.toUpperCase() === speciesName.trim().toUpperCase()
            );

            let filtered: ExistingVariety[];
            if (currentSpecies) {
                filtered = existingVarieties.filter(
                    (v) => v.species_id === currentSpecies.id && v.name.toUpperCase().includes(upperValue.trim())
                );
            } else {
                filtered = existingVarieties.filter((v) => v.name.toUpperCase().includes(upperValue.trim()));
            }
            setFilteredVarieties(filtered);
            setShowVarietySuggestions(filtered.length > 0);
        } else {
            setFilteredVarieties([]);
            setShowVarietySuggestions(false);
        }
    };

    const selectSpecies = (species: ExistingSpecies) => {
        setSpeciesName(species.name.toUpperCase());
        setShowSpeciesSuggestions(false);
    };

    const selectVariety = (variety: ExistingVariety) => {
        setVarietyName(variety.name.toUpperCase());
        if (!speciesName.trim()) {
            const species = existingSpecies.find((s) => s.id === variety.species_id);
            if (species) {
                setSpeciesName(species.name.toUpperCase());
            }
        }
        setShowVarietySuggestions(false);
    };

    const handleAdd = () => {
        if (speciesName.trim() && varietyName.trim()) {
            onAdd(speciesName.trim(), varietyName.trim());
            setSpeciesName('');
            setVarietyName('');
        }
    };

    const canAdd = speciesName.trim() && varietyName.trim();

    return (
        <Card className="overflow-hidden border-2 border-dashed">
            <CardHeader className="bg-muted/30 py-3">
                <CardTitle className="flex items-center gap-2 text-base">
                    <Plus className="h-4 w-4" />
                    Agregar Nueva Variedad
                </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
                <div className="flex flex-wrap items-end gap-3">
                    {/* Especie */}
                    <div className="relative min-w-[150px] flex-1 space-y-1">
                        <Label className="text-xs">Especie *</Label>
                        <Input
                            type="text"
                            value={speciesName}
                            onChange={(e) => handleSpeciesChange(e.target.value)}
                            onFocus={() => {
                                if (speciesName.trim() && filteredSpecies.length > 0) {
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
                                        onClick={() => selectSpecies(species)}
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
                            value={varietyName}
                            onChange={(e) => handleVarietyChange(e.target.value)}
                            onFocus={() => {
                                if (varietyName.trim() && filteredVarieties.length > 0) {
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
                                    handleAdd();
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
                                        onClick={() => selectVariety(variety)}
                                    >
                                        {variety.name.toUpperCase()}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <Button type="button" onClick={handleAdd} disabled={!canAdd} size="sm" className="h-9">
                        <Plus className="mr-1 h-4 w-4" />
                        Agregar
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

