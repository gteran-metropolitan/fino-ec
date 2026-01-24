import { Head, Link, useForm } from '@inertiajs/react';
import { Save, Truck, X } from 'lucide-react';
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { formatDateEC } from '@/lib/date-utils';
import { type BreadcrumbItem } from '@/types';

interface Supplier {
    id: number;
    name: string;
}

interface ProductEntryGroup {
    id: number;
    supplier_id: number;
    supplier: Supplier;
    entry_datetime: string;
    notes: string | null;
}

interface Props {
    group: ProductEntryGroup;
    suppliers: Supplier[];
}

export default function EditDeliveryFlow({ group, suppliers }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Panel', href: '/dashboard' },
        { title: 'Entrega y Postcosecha', href: '/delivery-flow' },
        { title: `Editar Entrega #${group.id}`, href: `/delivery-flow/${group.id}/edit` },
    ];

    // Parsear fecha y hora en zona horaria de Ecuador
    const formattedDate = formatDateEC(group.entry_datetime);
    const dateStr = formattedDate.inputDate;
    const timeStr = formattedDate.inputTime;

    const { data, setData, patch, processing, errors } = useForm({
        supplier_id: group.supplier_id.toString(),
        delivery_date: dateStr,
        delivery_time: timeStr,
        notes: group.notes || '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        patch(`/delivery-flow/${group.id}/info`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Editar Entrega #${group.id}`} />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Editar Información de Entrega</h1>
                    <p className="text-sm text-muted-foreground">
                        Modifica la información básica de la entrega (proveedor, fecha, notas)
                    </p>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Truck className="h-5 w-5 text-muted-foreground" />
                                <CardTitle>Información de la Entrega</CardTitle>
                            </div>
                            <CardDescription>
                                Los cambios aquí solo afectan la información general, no las clasificaciones
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 sm:grid-cols-3">
                                <div className="space-y-2">
                                    <Label htmlFor="supplier_id">Proveedor *</Label>
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
                                    <Label htmlFor="delivery_date">Fecha de Entrega *</Label>
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
                                    <Label htmlFor="delivery_time">Hora de Entrega *</Label>
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

                            <div className="space-y-2">
                                <Label htmlFor="notes">Notas (opcional)</Label>
                                <Textarea
                                    id="notes"
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                    placeholder="Notas adicionales sobre la entrega..."
                                    rows={3}
                                />
                                <InputError message={errors.notes} />
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-4 pt-4 border-t">
                        <Button type="button" variant="outline" asChild>
                            <Link href={`/delivery-flow/${group.id}`}>
                                <X className="mr-2 h-4 w-4" />
                                Cancelar
                            </Link>
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Guardando...' : (
                                <>
                                    <Save className="mr-2 h-4 w-4" />
                                    Guardar Cambios
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}

