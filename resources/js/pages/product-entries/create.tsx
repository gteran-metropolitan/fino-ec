import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';

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

interface Supplier {
    id: number;
    name: string;
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
    const [speciesSuggestions, setSpeciesSuggestions] = useState<Species[]>([]);
    const [varietySuggestions, setVarietySuggestions] = useState<Variety[]>([]);
    const [showSpeciesSuggestions, setShowSpeciesSuggestions] = useState(false);
    const [showVarietySuggestions, setShowVarietySuggestions] = useState(false);

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
        species_name: '',
        variety_name: '',
        delivery_date: ecuadorNow.date,
        delivery_time: ecuadorNow.time,
        quantity: '',
    });

    const handleSpeciesChange = (value: string) => {
        setData('species_name', value);
        if (value.length > 0) {
            const filtered = speciesList.filter((s) =>
                s.name.toLowerCase().includes(value.toLowerCase())
            );
            setSpeciesSuggestions(filtered);
            setShowSpeciesSuggestions(filtered.length > 0);
        } else {
            setSpeciesSuggestions([]);
            setShowSpeciesSuggestions(false);
        }
    };

    const handleVarietyChange = (value: string) => {
        setData('variety_name', value);
        if (value.length > 0) {
            const filtered = varietiesList.filter((v) =>
                v.name.toLowerCase().includes(value.toLowerCase())
            );
            setVarietySuggestions(filtered);
            setShowVarietySuggestions(filtered.length > 0);
        } else {
            setVarietySuggestions([]);
            setShowVarietySuggestions(false);
        }
    };

    const selectSpecies = (species: Species) => {
        setData('species_name', species.name);
        setShowSpeciesSuggestions(false);
    };

    const selectVariety = (variety: Variety) => {
        setData('variety_name', variety.name);
        // Auto-llenar la especie si está vacía
        if (!data.species_name) {
            const species = speciesList.find((s) => s.id === variety.species_id);
            if (species) {
                setData('species_name', species.name);
            }
        }
        setShowVarietySuggestions(false);
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
                        Registra una nueva entrega de producto
                    </p>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    <div className="grid gap-6 lg:grid-cols-2">
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
                            <Label htmlFor="quantity">Cantidad</Label>
                            <Input
                                id="quantity"
                                type="number"
                                min="1"
                                value={data.quantity}
                                onChange={(e) => setData('quantity', e.target.value)}
                                required
                                placeholder="Ingresa la cantidad"
                            />
                            <InputError message={errors.quantity} />
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

                        <div className="space-y-2 relative">
                            <Label htmlFor="species_name">Especie</Label>
                            <Input
                                id="species_name"
                                type="text"
                                value={data.species_name}
                                onChange={(e) => handleSpeciesChange(e.target.value)}
                                onFocus={() => data.species_name && handleSpeciesChange(data.species_name)}
                                onBlur={() => setTimeout(() => setShowSpeciesSuggestions(false), 200)}
                                placeholder="Ej: Rosa, Clavel, Lirio..."
                                autoComplete="off"
                            />
                            {showSpeciesSuggestions && (
                                <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg max-h-48 overflow-auto">
                                    {speciesSuggestions.map((species) => (
                                        <button
                                            key={species.id}
                                            type="button"
                                            className="w-full px-3 py-2 text-left text-sm hover:bg-muted"
                                            onMouseDown={() => selectSpecies(species)}
                                        >
                                            {species.name}
                                        </button>
                                    ))}
                                </div>
                            )}
                            <InputError message={errors.species_name} />
                        </div>

                        <div className="space-y-2 relative">
                            <Label htmlFor="variety_name">Variedad</Label>
                            <Input
                                id="variety_name"
                                type="text"
                                value={data.variety_name}
                                onChange={(e) => handleVarietyChange(e.target.value)}
                                onFocus={() => data.variety_name && handleVarietyChange(data.variety_name)}
                                onBlur={() => setTimeout(() => setShowVarietySuggestions(false), 200)}
                                placeholder="Ej: Explorer, Pink Floyd..."
                                autoComplete="off"
                            />
                            {showVarietySuggestions && (
                                <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg max-h-48 overflow-auto">
                                    {varietySuggestions.map((variety) => (
                                        <button
                                            key={variety.id}
                                            type="button"
                                            className="w-full px-3 py-2 text-left text-sm hover:bg-muted"
                                            onMouseDown={() => selectVariety(variety)}
                                        >
                                            {variety.name}
                                        </button>
                                    ))}
                                </div>
                            )}
                            <InputError message={errors.variety_name} />
                        </div>
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

