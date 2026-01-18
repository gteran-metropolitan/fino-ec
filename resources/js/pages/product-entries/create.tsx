import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler, useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

interface SupplierVariety {
    id: number;
    species_id: number;
    species_name: string;
    variety_id: number;
    variety_name: string;
}

interface Supplier {
    id: number;
    name: string;
    supplier_varieties?: {
        id: number;
        species: { id: number; name: string };
        variety: { id: number; name: string };
    }[];
}

interface Species {
    id: number;
    name: string;
}

interface Variety {
    id: number;
    name: string;
    species_id: number;
}

interface EntryItem {
    species_name: string;
    variety_name: string;
    quantity: string;
}

interface Props {
    suppliers: Supplier[];
    speciesList: Species[];
    varietiesList: Variety[];
}

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
        title: 'Nuevo Ingreso',
        href: '/product-entries/create',
    },
];

export default function CreateProductEntry({ suppliers, speciesList, varietiesList }: Props) {
    const [entries, setEntries] = useState<EntryItem[]>([
        { species_name: '', variety_name: '', quantity: '' }
    ]);
    const [supplierVarieties, setSupplierVarieties] = useState<SupplierVariety[]>([]);
    const [speciesSuggestions, setSpeciesSuggestions] = useState<{ [key: number]: Species[] }>({});
    const [varietySuggestions, setVarietySuggestions] = useState<{ [key: number]: Variety[] }>({});
    const [showSpeciesSuggestions, setShowSpeciesSuggestions] = useState<{ [key: number]: boolean }>({});
    const [showVarietySuggestions, setShowVarietySuggestions] = useState<{ [key: number]: boolean }>({});

    // Obtener fecha y hora de Ecuador (UTC-5)
    const getEcuadorDateTime = () => {
        const now = new Date();
        const ecuadorOffset = -5 * 60; // UTC-5 en minutos
        const localOffset = now.getTimezoneOffset();
        const ecuadorTime = new Date(now.getTime() + (localOffset + ecuadorOffset) * 60000);
        return {
            date: ecuadorTime.toISOString().split('T')[0],
            time: ecuadorTime.toTimeString().slice(0, 5),
        };
    };

    const ecuadorNow = getEcuadorDateTime();

    const { data, setData, post, processing, errors } = useForm({
        supplier_id: '',
        delivery_date: ecuadorNow.date,
        delivery_time: ecuadorNow.time,
        entries: entries,
    });

    // Actualizar entries en el form cuando cambian
    useEffect(() => {
        setData('entries', entries);
    }, [entries]);

    // Cargar variedades del proveedor cuando se selecciona
    useEffect(() => {
        if (data.supplier_id) {
            const supplier = suppliers.find(s => s.id.toString() === data.supplier_id);
            if (supplier?.supplier_varieties) {
                const varieties = supplier.supplier_varieties.map(sv => ({
                    id: sv.id,
                    species_id: sv.species.id,
                    species_name: sv.species.name,
                    variety_id: sv.variety.id,
                    variety_name: sv.variety.name,
                }));
                setSupplierVarieties(varieties);
            } else {
                setSupplierVarieties([]);
            }
        } else {
            setSupplierVarieties([]);
        }
    }, [data.supplier_id, suppliers]);

    const addEntry = () => {
        setEntries([...entries, { species_name: '', variety_name: '', quantity: '' }]);
    };

    const removeEntry = (index: number) => {
        if (entries.length > 1) {
            setEntries(entries.filter((_, i) => i !== index));
        }
    };

    const updateEntry = (index: number, field: keyof EntryItem, value: string) => {
        const newEntries = [...entries];
        newEntries[index] = { ...newEntries[index], [field]: value };
        setEntries(newEntries);
    };

    const handleSpeciesChange = (index: number, value: string) => {
        updateEntry(index, 'species_name', value);
        if (value.length > 0) {
            const filtered = speciesList.filter((s) =>
                s.name.toLowerCase().includes(value.toLowerCase())
            );
            setSpeciesSuggestions({ ...speciesSuggestions, [index]: filtered });
            setShowSpeciesSuggestions({ ...showSpeciesSuggestions, [index]: filtered.length > 0 });
        } else {
            setSpeciesSuggestions({ ...speciesSuggestions, [index]: [] });
            setShowSpeciesSuggestions({ ...showSpeciesSuggestions, [index]: false });
        }
    };

    const handleVarietyChange = (index: number, value: string) => {
        updateEntry(index, 'variety_name', value);
        if (value.length > 0) {
            const filtered = varietiesList.filter((v) =>
                v.name.toLowerCase().includes(value.toLowerCase())
            );
            setVarietySuggestions({ ...varietySuggestions, [index]: filtered });
            setShowVarietySuggestions({ ...showVarietySuggestions, [index]: filtered.length > 0 });
        } else {
            setVarietySuggestions({ ...varietySuggestions, [index]: [] });
            setShowVarietySuggestions({ ...showVarietySuggestions, [index]: false });
        }
    };

    const selectSpecies = (index: number, species: Species) => {
        updateEntry(index, 'species_name', species.name);
        setShowSpeciesSuggestions({ ...showSpeciesSuggestions, [index]: false });
    };

    const selectVariety = (index: number, variety: Variety) => {
        const newEntries = [...entries];
        newEntries[index] = {
            ...newEntries[index],
            variety_name: variety.name,
        };
        // Auto-llenar la especie si está vacía
        if (!newEntries[index].species_name) {
            const species = speciesList.find((s) => s.id === variety.species_id);
            if (species) {
                newEntries[index].species_name = species.name;
            }
        }
        setEntries(newEntries);
        setShowVarietySuggestions({ ...showVarietySuggestions, [index]: false });
    };

    const selectSupplierVariety = (index: number, sv: SupplierVariety) => {
        const newEntries = [...entries];
        newEntries[index] = {
            ...newEntries[index],
            species_name: sv.species_name,
            variety_name: sv.variety_name,
        };
        setEntries(newEntries);
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/product-entries');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Nuevo Ingreso de Producto" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Nuevo Ingreso</h1>
                    <p className="text-sm text-muted-foreground">
                        Registra una nueva entrega de producto con múltiples variedades
                    </p>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    {/* Datos del proveedor y fecha */}
                    <div className="grid gap-6 lg:grid-cols-3">
                        <div className="space-y-2">
                            <Label htmlFor="supplier_id">Proveedor</Label>
                            <Select
                                value={data.supplier_id}
                                onValueChange={(value) => setData('supplier_id', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecciona un proveedor" />
                                </SelectTrigger>
                                <SelectContent>
                                    {suppliers.map((supplier) => (
                                        <SelectItem key={supplier.id} value={supplier.id.toString()}>
                                            {supplier.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError message={errors.supplier_id} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="delivery_date">Fecha de Entrega</Label>
                            <Input
                                id="delivery_date"
                                type="date"
                                value={data.delivery_date}
                                onChange={(e) => setData('delivery_date', e.target.value)}
                                required
                            />
                            <InputError message={errors.delivery_date} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="delivery_time">Hora de Entrega</Label>
                            <Input
                                id="delivery_time"
                                type="time"
                                value={data.delivery_time}
                                onChange={(e) => setData('delivery_time', e.target.value)}
                                required
                            />
                            <InputError message={errors.delivery_time} />
                        </div>
                    </div>

                    {/* Variedades del proveedor seleccionado */}
                    {supplierVarieties.length > 0 && (
                        <div className="rounded-lg border p-4 bg-muted/30">
                            <Label className="text-sm font-medium mb-2 block">
                                Variedades registradas de este proveedor (clic para agregar):
                            </Label>
                            <div className="flex flex-wrap gap-2">
                                {supplierVarieties.map((sv) => (
                                    <Button
                                        key={sv.id}
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            // Buscar si hay una entrada vacía, si no agregar una nueva
                                            const emptyIndex = entries.findIndex(
                                                e => !e.species_name && !e.variety_name
                                            );
                                            if (emptyIndex >= 0) {
                                                selectSupplierVariety(emptyIndex, sv);
                                            } else {
                                                setEntries([
                                                    ...entries,
                                                    {
                                                        species_name: sv.species_name,
                                                        variety_name: sv.variety_name,
                                                        quantity: '',
                                                    },
                                                ]);
                                            }
                                        }}
                                    >
                                        {sv.species_name} - {sv.variety_name}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Entradas de productos */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label className="text-base font-semibold">Productos a ingresar</Label>
                            <Button type="button" variant="outline" size="sm" onClick={addEntry}>
                                <Plus className="mr-2 h-4 w-4" />
                                Agregar Variedad
                            </Button>
                        </div>

                        {entries.map((entry, index) => (
                            <div
                                key={index}
                                className="grid gap-4 lg:grid-cols-4 items-end p-4 rounded-lg border bg-card"
                            >
                                <div className="space-y-2 relative">
                                    <Label htmlFor={`species_${index}`}>Especie</Label>
                                    <Input
                                        id={`species_${index}`}
                                        type="text"
                                        value={entry.species_name}
                                        onChange={(e) => handleSpeciesChange(index, e.target.value)}
                                        onFocus={() =>
                                            entry.species_name && handleSpeciesChange(index, entry.species_name)
                                        }
                                        onBlur={() =>
                                            setTimeout(
                                                () =>
                                                    setShowSpeciesSuggestions({
                                                        ...showSpeciesSuggestions,
                                                        [index]: false,
                                                    }),
                                                200
                                            )
                                        }
                                        placeholder="Ej: Rosa, Clavel..."
                                        autoComplete="off"
                                    />
                                    {showSpeciesSuggestions[index] && speciesSuggestions[index]?.length > 0 && (
                                        <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg max-h-48 overflow-auto">
                                            {speciesSuggestions[index].map((species) => (
                                                <button
                                                    key={species.id}
                                                    type="button"
                                                    className="w-full px-3 py-2 text-left text-sm hover:bg-muted"
                                                    onMouseDown={() => selectSpecies(index, species)}
                                                >
                                                    {species.name}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                    <InputError message={(errors as any)[`entries.${index}.species_name`]} />
                                </div>

                                <div className="space-y-2 relative">
                                    <Label htmlFor={`variety_${index}`}>Variedad</Label>
                                    <Input
                                        id={`variety_${index}`}
                                        type="text"
                                        value={entry.variety_name}
                                        onChange={(e) => handleVarietyChange(index, e.target.value)}
                                        onFocus={() =>
                                            entry.variety_name && handleVarietyChange(index, entry.variety_name)
                                        }
                                        onBlur={() =>
                                            setTimeout(
                                                () =>
                                                    setShowVarietySuggestions({
                                                        ...showVarietySuggestions,
                                                        [index]: false,
                                                    }),
                                                200
                                            )
                                        }
                                        placeholder="Ej: Explorer, Pink Floyd..."
                                        autoComplete="off"
                                    />
                                    {showVarietySuggestions[index] && varietySuggestions[index]?.length > 0 && (
                                        <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg max-h-48 overflow-auto">
                                            {varietySuggestions[index].map((variety) => (
                                                <button
                                                    key={variety.id}
                                                    type="button"
                                                    className="w-full px-3 py-2 text-left text-sm hover:bg-muted"
                                                    onMouseDown={() => selectVariety(index, variety)}
                                                >
                                                    {variety.name}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                    <InputError message={(errors as any)[`entries.${index}.variety_name`]} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor={`quantity_${index}`}>Cantidad</Label>
                                    <Input
                                        id={`quantity_${index}`}
                                        type="number"
                                        min="1"
                                        value={entry.quantity}
                                        onChange={(e) => updateEntry(index, 'quantity', e.target.value)}
                                        required
                                        placeholder="Cantidad"
                                    />
                                    <InputError message={(errors as any)[`entries.${index}.quantity`]} />
                                </div>

                                <div>
                                    {entries.length > 1 && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeEntry(index)}
                                            className="text-destructive hover:text-destructive"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}
                        <InputError message={errors.entries} />
                    </div>

                    <div className="flex justify-end gap-4 pt-4 border-t">
                        <Button type="button" variant="outline" asChild>
                            <Link href="/product-entries">Cancelar</Link>
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Guardando...' : 'Registrar Ingreso'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}

