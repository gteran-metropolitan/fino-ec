import { Head, Link, router } from '@inertiajs/react';
import { Edit, MoreHorizontal, Trash2 } from 'lucide-react';

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

interface ProductEntry {
    id: number;
    supplier: Supplier;
    species: Species;
    variety: Variety;
    delivery_date: string;
    quantity: number;
}

interface Classification {
    id: number;
    product_entry_id: number;
    product_entry: ProductEntry;
    cm_40: number;
    cm_50: number;
    cm_60: number;
    cm_70: number;
    cm_80: number;
    cm_90: number;
    cm_100: number;
    cm_110: number;
    cm_120: number;
    sobrante: number;
    total_classified: number;
    is_complete: boolean;
    created_at: string;
    updated_at: string;
}

interface PaginatedClassifications {
    data: Classification[];
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
    classifications: PaginatedClassifications;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Panel',
        href: '/dashboard',
    },
    {
        title: 'Exportable',
        href: '/classifications',
    },
];

const stemSizes = [
    { key: 'cm_40', label: '40' },
    { key: 'cm_50', label: '50' },
    { key: 'cm_60', label: '60' },
    { key: 'cm_70', label: '70' },
    { key: 'cm_80', label: '80' },
    { key: 'cm_90', label: '90' },
    { key: 'cm_100', label: '100' },
    { key: 'cm_110', label: '110' },
    { key: 'cm_120', label: '120' },
];

export default function ClassificationsIndex({ classifications }: Props) {
    const handleDelete = (classification: Classification) => {
        if (
            confirm(
                `¿Estás seguro de eliminar esta clasificación?`
            )
        ) {
            router.delete(`/classifications/${classification.id}`);
        }
    };


    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Exportable" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">Exportable</h1>
                        <p className="text-sm text-muted-foreground">
                            Clasificación de tallos válidos para exportación
                        </p>
                    </div>
                </div>

                <div className="rounded-md border overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="min-w-[120px]">Fecha</TableHead>
                                <TableHead className="min-w-[120px]">Proveedor</TableHead>
                                <TableHead className="min-w-[100px]">Variedad</TableHead>
                                <TableHead className="text-center min-w-[50px]">Total</TableHead>
                                {stemSizes.map(({ key, label }) => (
                                    <TableHead key={key} className="text-center min-w-11.25 text-xs">
                                        {label} <span className="font-extralight text-xs text-gray-400">cm</span>
                                    </TableHead>
                                ))}
                                <TableHead className="text-center min-w-[80px]">Sobrante</TableHead>
                                <TableHead className="text-center min-w-[80px]">Estado</TableHead>
                                <TableHead className="w-16">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {classifications.data.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={14}
                                        className="py-8 text-center text-muted-foreground"
                                    >
                                        No hay clasificaciones registradas
                                    </TableCell>
                                </TableRow>
                            ) : (
                                classifications.data.map((classification) => (
                                    <TableRow key={classification.id}>
                                        <TableCell className="font-medium text-xs">
                                            <div>
                                                <p>{formatDate(classification.product_entry.delivery_date).short}</p>
                                                <p className="text-xs text-muted-foreground capitalize">{formatDate(classification.product_entry.delivery_date).long}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-sm">
                                            {classification.product_entry.supplier.name}
                                        </TableCell>
                                        <TableCell className="text-sm">
                                            <span className="text-muted-foreground text-xs">
                                                {classification.product_entry.species.name}
                                            </span>
                                            <br />
                                            {classification.product_entry.variety.name}
                                        </TableCell>
                                        <TableCell className="text-center font-bold">
                                            {classification.product_entry.quantity}
                                        </TableCell>
                                        {stemSizes.map(({ key }) => {
                                            const value = classification[key as keyof Classification] as number;
                                            return (
                                                <TableCell
                                                    key={key}
                                                    className={`text-center text-sm ${
                                                        value > 0
                                                            ? 'font-medium text-foreground'
                                                            : 'text-muted-foreground/50'
                                                    }`}
                                                >
                                                    {value > 0 ? value : '-'}
                                                </TableCell>
                                            );
                                        })}
                                        <TableCell
                                            className={`text-center text-sm ${
                                                classification.sobrante > 0
                                                    ? 'font-medium text-foreground'
                                                    : 'text-muted-foreground/50'
                                            }`}
                                        >
                                            {classification.sobrante > 0 ? classification.sobrante : '-'}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {classification.is_complete ? (
                                                <Badge variant="default" className="bg-green-600 text-xs">
                                                    Completo
                                                </Badge>
                                            ) : (
                                                <Badge variant="secondary" className="bg-amber-500 text-white text-xs">
                                                    {classification.total_classified}/{classification.product_entry.quantity}
                                                </Badge>
                                            )}
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
                                                        <Link href={`/product-entries/${classification.product_entry_id}/classify`}>
                                                            <Edit className="mr-2 h-4 w-4" />
                                                            Editar
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => handleDelete(classification)}
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

                {/* Leyenda */}
                <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                    <span className="font-medium">Tamaños (cm):</span>
                    {stemSizes.slice(0, -1).map(({ label }) => (
                        <span key={label}>{label}</span>
                    ))}
                    <span>| Sob. = Sobrante</span>
                </div>

                {/* Paginación */}
                {classifications.last_page > 1 && (
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                            Mostrando {classifications.data.length} de {classifications.total} clasificaciones
                        </p>
                        <div className="flex gap-2">
                            {classifications.links.map((link, index) => (
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

