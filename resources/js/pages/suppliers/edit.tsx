import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

interface Supplier {
    id: number;
    name: string;
    email: string;
    phone: string;
    ruc: string;
    is_active: boolean;
}

interface Props {
    supplier: Supplier;
}

export default function EditSupplier({ supplier }: Props) {
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
            title: `Editar: ${supplier.name}`,
            href: `/suppliers/${supplier.id}/edit`,
        },
    ];

    const { data, setData, put, processing, errors } = useForm({
        name: supplier.name,
        email: supplier.email,
        phone: supplier.phone,
        ruc: supplier.ruc,
        is_active: supplier.is_active,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(`/suppliers/${supplier.id}`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Editar Proveedor: ${supplier.name}`} />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="max-w-2xl">
                    <Card>
                        <CardHeader>
                            <CardTitle>Editar Proveedor</CardTitle>
                            <CardDescription>
                                Modifica la información del proveedor.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={submit} className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Nombre</Label>
                                    <Input
                                        id="name"
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
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
                                        type="number"
                                        value={data.ruc}
                                        onChange={(e) => setData('ruc', e.target.value)}
                                        required
                                        placeholder="1234567890"
                                    />
                                    <InputError message={errors.ruc} />
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
                                    />
                                    <InputError message={errors.email} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="phone">Celular</Label>
                                    <Input
                                        id="phone"
                                        type="tel"
                                        value={data.phone}
                                        onChange={(e) => setData('phone', e.target.value)}
                                        required
                                        placeholder="+57 300 123 4567"
                                    />
                                    <InputError message={errors.phone} />
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="is_active"
                                        checked={data.is_active}
                                        onCheckedChange={(checked) =>
                                            setData('is_active', checked as boolean)
                                        }
                                    />
                                    <Label htmlFor="is_active" className="cursor-pointer">
                                        Proveedor activo
                                    </Label>
                                    <InputError message={errors.is_active} />
                                </div>

                                <div className="flex justify-end gap-4">
                                    <Button type="button" variant="outline" asChild>
                                        <Link href="/suppliers">Cancelar</Link>
                                    </Button>
                                    <Button type="submit" disabled={processing}>
                                        {processing ? 'Guardando...' : 'Guardar Cambios'}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}

