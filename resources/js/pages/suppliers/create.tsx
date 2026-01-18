import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
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

export default function CreateSupplier() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        phone: '',
        ruc: '',
        is_active: true,
    });

    const [rucError, setRucError] = useState<string | undefined>(undefined);

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
            onSuccess: () => reset(),
        });
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
                            <Label htmlFor="name">Nombre</Label>
                            <Input
                                id="name"
                                type="text"
                                value={data.name}
                                onChange={(e) => handleNameChange(e.target.value)}
                                required
                                autoFocus
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

