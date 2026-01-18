import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type User } from '@/types';

interface Role {
    value: string;
    label: string;
}

interface Props {
    user: User;
    roles: Role[];
}

export default function EditUser({ user, roles }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dashboard',
            href: '/dashboard',
        },
        {
            title: 'Gestión de Usuarios',
            href: '/users',
        },
        {
            title: `Editar: ${user.name}`,
            href: `/users/${user.id}/edit`,
        },
    ];

    const { data, setData, put, processing, errors } = useForm({
        name: user.name,
        email: user.email,
        password: '',
        password_confirmation: '',
        role: user.role,
        is_active: user.is_active,
    });

    // Validar que solo contenga letras y espacios
    const handleNameChange = (value: string) => {
        const sanitized = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/g, '');
        setData('name', sanitized);
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(`/users/${user.id}`);
    };

    const allRoles = user.role === 'super_admin'
        ? [{ value: 'super_admin', label: 'Super Admin' }, ...roles]
        : roles;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Editar Usuario: ${user.name}`} />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Editar Usuario</h1>
                    <p className="text-sm text-muted-foreground">
                        Modifica la información del usuario. Deja los campos de contraseña vacíos si no deseas cambiarla.
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
                                placeholder="Nombre completo"
                            />
                            <InputError message={errors.name} />
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
                            <Label htmlFor="password">Nueva Contraseña (opcional)</Label>
                            <Input
                                id="password"
                                type="password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                placeholder="Dejar vacío para mantener la actual"
                            />
                            <InputError message={errors.password} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password_confirmation">Confirmar Nueva Contraseña</Label>
                            <Input
                                id="password_confirmation"
                                type="password"
                                value={data.password_confirmation}
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                placeholder="Repite la nueva contraseña"
                            />
                            <InputError message={errors.password_confirmation} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="role">Rol</Label>
                            <Select
                                value={data.role}
                                onValueChange={(value) => setData('role', value as User['role'])}
                                disabled={user.role === 'super_admin'}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecciona un rol" />
                                </SelectTrigger>
                                <SelectContent>
                                    {allRoles.map((role) => (
                                        <SelectItem key={role.value} value={role.value}>
                                            {role.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {user.role === 'super_admin' && (
                                <p className="text-sm text-muted-foreground">
                                    El rol de Super Admin no puede ser modificado.
                                </p>
                            )}
                            <InputError message={errors.role} />
                        </div>
                    </div>

                    <div className="flex items-center space-x-2 rounded-lg border p-4">
                        <Checkbox
                            id="is_active"
                            checked={data.is_active}
                            onCheckedChange={(checked) => setData('is_active', checked as boolean)}
                            disabled={user.role === 'super_admin'}
                        />
                        <div className="space-y-0.5">
                            <Label htmlFor="is_active" className="cursor-pointer">
                                Usuario activo
                            </Label>
                            {user.role === 'super_admin' ? (
                                <p className="text-xs text-muted-foreground">
                                    El Super Admin siempre está activo.
                                </p>
                            ) : (
                                <p className="text-xs text-muted-foreground">
                                    Los usuarios inactivos no podrán iniciar sesión en el sistema.
                                </p>
                            )}
                        </div>
                        <InputError message={errors.is_active} />
                    </div>

                    <div className="flex justify-end gap-4 pt-4 border-t">
                        <Button type="button" variant="outline" asChild>
                            <Link href="/users">Cancelar</Link>
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Guardando...' : 'Guardar Cambios'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}

