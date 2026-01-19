import { Head, Link, useForm } from '@inertiajs/react';
import { Plus, Trash2, X } from 'lucide-react';
import { FormEventHandler, useEffect, useState } from 'react';

import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

interface Species {
    id: number;
    name: string;
}

interface Variety {
    id: number;
    name: string;
    species_id: number;
}

interface VarietyItem {
    species_name: string;
    variety_name: string;
}

// Estructura agrupada por especie
interface SpeciesGroup {
    species_name: string;
    varieties: string[];
}

interface Props {
    speciesList: Species[];
    varietiesList: Variety[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Panel',
        href: '/dashboard',
    },
    {
        title: 'Proveedores',
        href: '/suppliers',
    },
    {
        title: 'Crear Proveedor',
        href: '/suppliers/create',
    },
];

export default function CreateSupplier({ speciesList, varietiesList }: Props) {
    // Estado para grupos de especies con sus variedades
    const [speciesGroups, setSpeciesGroups] = useState<SpeciesGroup[]>([]);

    // Estados para autocompletado
    const [speciesSuggestions, setSpeciesSuggestions] = useState<{ [key: number]: Species[] }>({});
    const [varietySuggestions, setVarietySuggestions] = useState<{ [key: string]: Variety[] }>({});
    const [showSpeciesSuggestions, setShowSpeciesSuggestions] = useState<{ [key: number]: boolean }>({});
    const [showVarietySuggestions, setShowVarietySuggestions] = useState<{ [key: string]: boolean }>({});

    // Input temporal para nueva variedad
    const [newVarietyInput, setNewVarietyInput] = useState<{ [key: number]: string }>({});

    const { data, setData, post, processing, errors, reset } = useForm({
        code: '',
        name: '',
        email: '',
        phone: '',
        ruc: '',
        is_active: true,
        varieties: [] as VarietyItem[],
    });

    const [rucError, setRucError] = useState<string | undefined>(undefined);

    // Convertir speciesGroups a formato plano para enviar al backend
    useEffect(() => {
        const flatVarieties: VarietyItem[] = [];
        speciesGroups.forEach(group => {
            group.varieties.forEach(varietyName => {
                flatVarieties.push({
                    species_name: group.species_name,
                    variety_name: varietyName,
                });
            });
        });
        setData('varieties', flatVarieties);
    }, [speciesGroups]);

    // Validar que solo contenga letras y espacios
    const handleNameChange = (value: string) => {
        const sanitized = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/g, '');
        setData('name', sanitized);
    };

    // Validar que solo contenga números y máximo 13 dígitos
    const handleRucChange = (value: string) => {
        const sanitized = value.replace(/[^0-9]/g, '').slice(0, 13);
        setData('ruc', sanitized);

        if (sanitized.length > 0 && sanitized.length !== 13) {
            setRucError('El RUC debe tener exactamente 13 dígitos');
        } else {
            setRucError(undefined);
        }
    };

    // Validar que solo contenga números y algunos caracteres de teléfono
    const handlePhoneChange = (value: string) => {
        const sanitized = value.replace(/[^0-9+\-\s]/g, '');
        setData('phone', sanitized);
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        // Validar RUC antes de enviar
        if (data.ruc.length !== 13) {
            setRucError('El RUC debe tener exactamente 13 dígitos');
            return;
        }

        post('/suppliers', {
            onSuccess: () => {
                reset();
                setSpeciesGroups([]);
            },
        });
    };

    // Agregar nuevo grupo de especie
    const addSpeciesGroup = () => {
        setSpeciesGroups([...speciesGroups, { species_name: '', varieties: [] }]);
    };

    // Eliminar grupo de especie
    const removeSpeciesGroup = (index: number) => {
        setSpeciesGroups(speciesGroups.filter((_, i) => i !== index));
    };

    // Actualizar nombre de especie
    const updateSpeciesName = (index: number, value: string) => {
        const newGroups = [...speciesGroups];
        newGroups[index] = { ...newGroups[index], species_name: value };
        setSpeciesGroups(newGroups);
    };

    // Manejar cambio en input de especie con autocompletado
    const handleSpeciesChange = (index: number, value: string) => {
        updateSpeciesName(index, value);
        if (value.length > 0) {
            const filtered = speciesList.filter((s) =>
                s.name.toLowerCase().includes(value.toLowerCase())
            );
            setSpeciesSuggestions({ ...speciesSuggestions, [index]: filtered });
            setShowSpeciesSuggestions({ ...showSpeciesSuggestions, [index]: filtered.length > 0 });
        } else {
            setShowSpeciesSuggestions({ ...showSpeciesSuggestions, [index]: false });
        }
    };

    // Seleccionar especie de sugerencias
    const selectSpecies = (index: number, species: Species) => {
        updateSpeciesName(index, species.name);
        setShowSpeciesSuggestions({ ...showSpeciesSuggestions, [index]: false });
    };

    // Manejar input de nueva variedad
    const handleVarietyInputChange = (groupIndex: number, value: string) => {
        setNewVarietyInput({ ...newVarietyInput, [groupIndex]: value });
        const key = `${groupIndex}`;
        if (value.length > 0) {
            // Filtrar variedades que correspondan a la especie seleccionada
            const speciesName = speciesGroups[groupIndex]?.species_name;
            const species = speciesList.find(s => s.name.toLowerCase() === speciesName?.toLowerCase());

            let filtered = varietiesList.filter((v) =>
                v.name.toLowerCase().includes(value.toLowerCase())
            );

            // Si hay especie seleccionada, filtrar por ella
            if (species) {
                filtered = filtered.filter(v => v.species_id === species.id);
            }

            setVarietySuggestions({ ...varietySuggestions, [key]: filtered });
            setShowVarietySuggestions({ ...showVarietySuggestions, [key]: filtered.length > 0 });
        } else {
            setShowVarietySuggestions({ ...showVarietySuggestions, [key]: false });
        }
    };

    // Agregar variedad al grupo
    const addVarietyToGroup = (groupIndex: number, varietyName: string) => {
        if (!varietyName.trim()) return;

        const newGroups = [...speciesGroups];
        if (!newGroups[groupIndex].varieties.includes(varietyName.trim())) {
            newGroups[groupIndex].varieties = [...newGroups[groupIndex].varieties, varietyName.trim()];
            setSpeciesGroups(newGroups);
        }
        setNewVarietyInput({ ...newVarietyInput, [groupIndex]: '' });
        setShowVarietySuggestions({ ...showVarietySuggestions, [`${groupIndex}`]: false });
    };

    // Eliminar variedad del grupo
    const removeVarietyFromGroup = (groupIndex: number, varietyName: string) => {
        const newGroups = [...speciesGroups];
        newGroups[groupIndex].varieties = newGroups[groupIndex].varieties.filter(v => v !== varietyName);
        setSpeciesGroups(newGroups);
    };

    // Seleccionar variedad de sugerencias
    const selectVariety = (groupIndex: number, variety: Variety) => {
        addVarietyToGroup(groupIndex, variety.name);

        // Si la especie está vacía, auto-llenarla
        if (!speciesGroups[groupIndex].species_name) {
            const species = speciesList.find(s => s.id === variety.species_id);
            if (species) {
                updateSpeciesName(groupIndex, species.name);
            }
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Crear Proveedor" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Crear Nuevo Proveedor</h1>
                    <p className="text-sm text-muted-foreground">
                        Completa el formulario para registrar un nuevo proveedor.
                    </p>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    <div className="grid gap-6 lg:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="code">Código de Proveedor</Label>
                            <Input
                                id="code"
                                type="text"
                                value={data.code}
                                onChange={(e) => setData('code', e.target.value.toUpperCase())}
                                required
                                autoFocus
                                placeholder="Ej: PROV001"
                                className="font-mono"
                                maxLength={20}
                            />
                            <InputError message={errors.code} />
                            <p className="text-xs text-muted-foreground">
                                Código único para identificar al proveedor
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="name">Nombre</Label>
                            <Input
                                id="name"
                                type="text"
                                value={data.name}
                                onChange={(e) => handleNameChange(e.target.value)}
                                required
                                placeholder="Nombre del proveedor"
                            />
                            <InputError message={errors.name} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="ruc">RUC</Label>
                            <Input
                                id="ruc"
                                type="text"
                                inputMode="numeric"
                                value={data.ruc}
                                onChange={(e) => handleRucChange(e.target.value)}
                                required
                                placeholder="1234567890001"
                                maxLength={13}
                                className={rucError ? 'border-destructive' : ''}
                            />
                            <div className="flex justify-between">
                                <InputError message={errors.ruc || rucError} />
                                <span className={`text-xs ${data.ruc.length === 13 ? 'text-green-600' : 'text-muted-foreground'}`}>
                                    {data.ruc.length}/13 dígitos
                                </span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                required
                                placeholder="correo@ejemplo.com"
                                pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
                            />
                            <InputError message={errors.email} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phone">Celular</Label>
                            <Input
                                id="phone"
                                type="tel"
                                inputMode="numeric"
                                value={data.phone}
                                onChange={(e) => handlePhoneChange(e.target.value)}
                                required
                                placeholder="0991234567"
                            />
                            <InputError message={errors.phone} />
                        </div>
                    </div>

                    {/* Sección de Especies y Variedades */}
                    <div className="space-y-4 rounded-lg border p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <Label className="text-base font-semibold">Especies y Variedades que provee</Label>
                                <p className="text-sm text-muted-foreground">
                                    Selecciona una especie y agrega las variedades que el proveedor entrega
                                </p>
                            </div>
                            <Button type="button" variant="outline" size="sm" onClick={addSpeciesGroup}>
                                <Plus className="mr-2 h-4 w-4" />
                                Agregar Especie
                            </Button>
                        </div>

                        {speciesGroups.length === 0 ? (
                            <div className="text-center py-6 text-muted-foreground border rounded-lg border-dashed">
                                <p>No hay especies registradas</p>
                                <p className="text-sm">Haz clic en "Agregar Especie" para comenzar</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {speciesGroups.map((group, groupIndex) => (
                                    <div key={groupIndex} className="rounded-lg border bg-muted/30 p-4 space-y-3">
                                        <div className="flex items-start gap-4">
                                            {/* Input de Especie */}
                                            <div className="flex-1 space-y-2 relative">
                                                <Label htmlFor={`species_${groupIndex}`}>Especie</Label>
                                                <Input
                                                    id={`species_${groupIndex}`}
                                                    type="text"
                                                    value={group.species_name}
                                                    onChange={(e) => handleSpeciesChange(groupIndex, e.target.value)}
                                                    onFocus={() => group.species_name && handleSpeciesChange(groupIndex, group.species_name)}
                                                    onBlur={() => setTimeout(() => setShowSpeciesSuggestions({ ...showSpeciesSuggestions, [groupIndex]: false }), 200)}
                                                    placeholder="Ej: Rosa, Clavel, Gypsophila..."
                                                    autoComplete="off"
                                                />
                                                {showSpeciesSuggestions[groupIndex] && speciesSuggestions[groupIndex]?.length > 0 && (
                                                    <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg max-h-32 overflow-auto">
                                                        {speciesSuggestions[groupIndex].map((species) => (
                                                            <button
                                                                key={species.id}
                                                                type="button"
                                                                className="w-full px-3 py-2 text-left hover:bg-muted text-sm"
                                                                onClick={() => selectSpecies(groupIndex, species)}
                                                            >
                                                                {species.name}
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Botón eliminar especie */}
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => removeSpeciesGroup(groupIndex)}
                                                className="text-destructive hover:text-destructive mt-8"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>

                                        {/* Variedades */}
                                        <div className="space-y-2 pl-4 border-l-2 border-muted-foreground/20">
                                            <Label className="text-sm">Variedades de {group.species_name || 'esta especie'}</Label>

                                            {/* Variedades agregadas */}
                                            {group.varieties.length > 0 && (
                                                <div className="flex flex-wrap gap-2 mb-2">
                                                    {group.varieties.map((varietyName, vIndex) => (
                                                        <Badge key={vIndex} variant="secondary" className="gap-1 pr-1">
                                                            {varietyName}
                                                            <button
                                                                type="button"
                                                                onClick={() => removeVarietyFromGroup(groupIndex, varietyName)}
                                                                className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                                                            >
                                                                <X className="h-3 w-3" />
                                                            </button>
                                                        </Badge>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Input para agregar variedad */}
                                            <div className="flex gap-2 relative">
                                                <div className="flex-1 relative">
                                                    <Input
                                                        type="text"
                                                        value={newVarietyInput[groupIndex] || ''}
                                                        onChange={(e) => handleVarietyInputChange(groupIndex, e.target.value)}
                                                        onFocus={() => newVarietyInput[groupIndex] && handleVarietyInputChange(groupIndex, newVarietyInput[groupIndex])}
                                                        onBlur={() => setTimeout(() => setShowVarietySuggestions({ ...showVarietySuggestions, [`${groupIndex}`]: false }), 200)}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') {
                                                                e.preventDefault();
                                                                addVarietyToGroup(groupIndex, newVarietyInput[groupIndex] || '');
                                                            }
                                                        }}
                                                        placeholder="Ej: Explorer, Freedom, Pink Floyd..."
                                                        autoComplete="off"
                                                        className="text-sm"
                                                    />
                                                    {showVarietySuggestions[`${groupIndex}`] && varietySuggestions[`${groupIndex}`]?.length > 0 && (
                                                        <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg max-h-32 overflow-auto">
                                                            {varietySuggestions[`${groupIndex}`].map((variety) => (
                                                                <button
                                                                    key={variety.id}
                                                                    type="button"
                                                                    className="w-full px-3 py-2 text-left hover:bg-muted text-sm"
                                                                    onClick={() => selectVariety(groupIndex, variety)}
                                                                >
                                                                    {variety.name}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => addVarietyToGroup(groupIndex, newVarietyInput[groupIndex] || '')}
                                                    disabled={!newVarietyInput[groupIndex]?.trim()}
                                                >
                                                    <Plus className="h-4 w-4" />
                                                </Button>
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                Escribe y presiona Enter o haz clic en + para agregar
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex items-center space-x-2 rounded-lg border p-4">
                        <Checkbox
                            id="is_active"
                            checked={data.is_active}
                            onCheckedChange={(checked) =>
                                setData('is_active', checked as boolean)
                            }
                        />
                        <div className="space-y-0.5">
                            <Label htmlFor="is_active" className="cursor-pointer">
                                Proveedor activo
                            </Label>
                            <p className="text-xs text-muted-foreground">
                                Los proveedores inactivos no aparecerán en las listas de selección.
                            </p>
                        </div>
                        <InputError message={errors.is_active} />
                    </div>

                    <div className="flex justify-end gap-4 pt-4 border-t">
                        <Button type="button" variant="outline" asChild>
                            <Link href="/suppliers">Cancelar</Link>
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Creando...' : 'Crear Proveedor'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}

