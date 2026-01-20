import { Head, Link, router } from '@inertiajs/react';
import { Edit, Flower2, MoreHorizontal, Plus, Ruler, Trash2 } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
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
import { formatDateEC } from '@/lib/date-utils';
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
}

interface StemClassification {
    id: number;
    total_classified: number;
    is_complete: boolean;
    local_quantity: number;
    local_is_complete: boolean;
}

interface ProductEntry {
    id: number;
    supplier: Supplier;
    species: Species;
    variety: Variety;
    delivery_date: string;
    quantity: number;
    created_at: string;
    stem_classification: StemClassification | null;
}

interface PaginatedEntries {
    data: ProductEntry[];
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
    entries: PaginatedEntries;
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
];

export default function ProductEntriesIndex({ entries }: Props) {
    const handleDelete = (entry: ProductEntry) => {
        if (
            confirm(
                `¿Estás seguro de eliminar este ingreso de ${entry.variety.name}?`
            )
        ) {
            router.delete(`/product-entries/${entry.id}`);
        }
    };


    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Ingreso de Productos" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">Ingreso de Productos</h1>
                        <p className="text-sm text-muted-foreground">
                            Registra las entregas de tus proveedores
                        </p>
                    </div>
                    <Button asChild>
                        <Link href="/product-entries/create">
                            <Plus className="mr-2 h-4 w-4" />
                            Nuevo Ingreso
                        </Link>
                    </Button>
                </div>

                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Fecha de Entrega</TableHead>
                                <TableHead>Proveedor</TableHead>
                                <TableHead>Especie</TableHead>
                                <TableHead>Variedad</TableHead>
                                <TableHead className="text-right">Cantidad</TableHead>
                                <TableHead className="text-center">Estado</TableHead>
                                <TableHead className="w-16">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {entries.data.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={7}
                                        className="py-8 text-center text-muted-foreground"
                                    >
                                        No hay ingresos registrados
                                    </TableCell>
                                </TableRow>
                            ) : (
                                entries.data.map((entry) => (
                                    <TableRow key={entry.id}>
                                        <TableCell className="font-medium">
                                            <div>
                                                <p>{formatDateEC(entry.delivery_date).short}</p>
                                                <p className="text-xs text-muted-foreground capitalize">{formatDateEC(entry.delivery_date).long}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell>{entry.supplier.name}</TableCell>
                                        <TableCell>{entry.species.name}</TableCell>
                                        <TableCell>{entry.variety.name}</TableCell>
                                        <TableCell className="text-right">{entry.quantity}</TableCell>
                                        <TableCell className="text-center">
                                            <div className="flex flex-col gap-1 items-center">
                                                {entry.stem_classification ? (
                                                    <>
                                                        {/* Estado Exportable */}
                                                        <Badge
                                                            variant="outline"
                                                            className={`text-xs ${
                                                                entry.stem_classification.total_classified > 0
                                                                    ? 'bg-green-50 text-green-700 border-green-200'
                                                                    : ''
                                                            }`}
                                                        >
                                                            Exp: {entry.stem_classification.total_classified}
                                                        </Badge>
                                                        {/* Estado Flor Local */}
                                                        {entry.stem_classification.local_is_complete ? (
                                                            <Badge
                                                                variant="outline"
                                                                className="text-xs bg-amber-50 text-amber-700 border-amber-200"
                                                            >
                                                                Local: {entry.stem_classification.local_quantity}
                                                            </Badge>
                                                        ) : (
                                                            <Badge variant="outline" className="text-xs text-muted-foreground">
                                                                Local: -
                                                            </Badge>
                                                        )}
                                                    </>
                                                ) : (
                                                    <Badge variant="outline" className="text-xs">
                                                        Sin clasificar
                                                    </Badge>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-56">
                                                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                                                        Clasificación
                                                    </div>
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/product-entries/${entry.id}/classify`} className="flex items-center justify-between">
                                                            <span className="flex items-center">
                                                                <Ruler className="mr-2 h-4 w-4 text-green-600" />
                                                                Exportable
                                                            </span>
                                                            {entry.stem_classification ? (
                                                                entry.stem_classification.total_classified > 0 ? (
                                                                    <Badge variant="outline" className="ml-2 text-xs bg-green-50 text-green-700 border-green-200">
                                                                        {entry.stem_classification.total_classified}
                                                                    </Badge>
                                                                ) : null
                                                            ) : (
                                                                <Badge variant="outline" className="ml-2 text-xs">Pendiente</Badge>
                                                            )}
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        asChild
                                                        disabled={!entry.stem_classification}
                                                    >
                                                        <Link
                                                            href={entry.stem_classification ? `/product-entries/${entry.id}/local-flower` : '#'}
                                                            className={`flex items-center justify-between ${!entry.stem_classification ? 'opacity-50 pointer-events-none' : ''}`}
                                                        >
                                                            <span className="flex items-center">
                                                                <Flower2 className="mr-2 h-4 w-4 text-amber-600" />
                                                                Flor Local
                                                            </span>
                                                            {entry.stem_classification?.local_quantity ? (
                                                                <Badge variant="outline" className="ml-2 text-xs bg-amber-50 text-amber-700 border-amber-200">
                                                                    {entry.stem_classification.local_quantity}
                                                                </Badge>
                                                            ) : !entry.stem_classification ? (
                                                                <span className="text-xs text-muted-foreground">Requiere exportable</span>
                                                            ) : (
                                                                <Badge variant="outline" className="ml-2 text-xs">Pendiente</Badge>
                                                            )}
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                                                        Acciones
                                                    </div>
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/product-entries/${entry.id}/edit`}>
                                                            <Edit className="mr-2 h-4 w-4" />
                                                            Editar Ingreso
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => handleDelete(entry)}
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
                {entries.last_page > 1 && (
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                            Mostrando {entries.data.length} de {entries.total} ingresos
                        </p>
                        <div className="flex gap-2">
                            {entries.links.map((link, index) => (
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

