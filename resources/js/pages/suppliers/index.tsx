import { Head, Link, router } from '@inertiajs/react';
import { Edit, MoreHorizontal, Plus, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

interface SupplierVariety {
    id: number;
    species: { id: number; name: string };
    variety: { id: number; name: string };
}

interface Supplier {
    id: number;
    name: string;
    email: string;
    phone: string;
    ruc: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    supplier_varieties?: SupplierVariety[];
}

interface PaginatedSuppliers {
    data: Supplier[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
}

interface Props {
    suppliers: PaginatedSuppliers;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Proveedores',
        href: '/suppliers',
    },
];

export default function SuppliersIndex({ suppliers }: Props) {
    const handleToggleActive = (supplier: Supplier) => {
        if (
            confirm(
                `¿Estás seguro de ${supplier.is_active ? 'desactivar' : 'activar'} a ${supplier.name}?`
            )
        ) {
            router.patch(`/suppliers/${supplier.id}/toggle-active`);
        }
    };

    const handleDelete = (supplier: Supplier) => {
        if (
            confirm(
                `¿Estás seguro de eliminar a ${supplier.name}? Esta acción no se puede deshacer.`
            )
        ) {
            router.delete(`/suppliers/${supplier.id}`);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Proveedores" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Proveedores</h1>
                        <p className="text-muted-foreground">
                            Gestiona los proveedores del sistema
                        </p>
                    </div>
                    <Button asChild>
                        <Link href="/suppliers/create">
                            <Plus className="mr-2 h-4 w-4" />
                            Nuevo Proveedor
                        </Link>
                    </Button>
                </div>

                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nombre</TableHead>
                                <TableHead>RUC</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Celular</TableHead>
                                <TableHead>Variedades</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead className="w-20">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {suppliers.data.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={8}
                                        className="py-8 text-center text-muted-foreground"
                                    >
                                        No hay proveedores registrados
                                    </TableCell>
                                </TableRow>
                            ) : (
                                suppliers.data.map((supplier) => (
                                    <TableRow key={supplier.id}>
                                        <TableCell className="font-medium">{supplier.name}</TableCell>
                                        <TableCell>{supplier.ruc}</TableCell>
                                        <TableCell>{supplier.email}</TableCell>
                                        <TableCell>{supplier.phone}</TableCell>
                                        <TableCell>
                                            {supplier.supplier_varieties && supplier.supplier_varieties.length > 0 ? (
                                                <div className="flex flex-wrap gap-1 max-w-xs">
                                                    {supplier.supplier_varieties.slice(0, 3).map((sv) => (
                                                        <Badge key={sv.id} variant="secondary" className="text-xs">
                                                            {sv.species.name} - {sv.variety.name}
                                                        </Badge>
                                                    ))}
                                                    {supplier.supplier_varieties.length > 3 && (
                                                        <Badge variant="outline" className="text-xs">
                                                            +{supplier.supplier_varieties.length - 3} más
                                                        </Badge>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-muted-foreground text-sm">Sin variedades</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={supplier.is_active ? 'default' : 'outline'}>
                                                {supplier.is_active ? 'Activo' : 'Inactivo'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/suppliers/${supplier.id}/edit`}>
                                                            <Edit className="mr-2 h-4 w-4" />
                                                            Editar
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => handleToggleActive(supplier)}
                                                    >
                                                        {supplier.is_active ? (
                                                            <>
                                                                <ToggleLeft className="mr-2 h-4 w-4" />
                                                                Desactivar
                                                            </>
                                                        ) : (
                                                            <>
                                                                <ToggleRight className="mr-2 h-4 w-4" />
                                                                Activar
                                                            </>
                                                        )}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => handleDelete(supplier)}
                                                        className="text-destructive"
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        Eliminar
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Paginación */}
                {suppliers.last_page > 1 && (
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                            Mostrando {suppliers.data.length} de {suppliers.total} proveedores
                        </p>
                        <div className="flex gap-2">
                            {suppliers.links.map((link, index) => (
                                <Button
                                    key={index}
                                    variant={link.active ? 'default' : 'outline'}
                                    size="sm"
                                    disabled={!link.url}
                                    asChild={!!link.url}
                                >
                                    {link.url ? (
                                        <Link
                                            href={link.url}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ) : (
                                        <span dangerouslySetInnerHTML={{ __html: link.label }} />
                                    )}
                                </Button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

