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
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
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
}

interface ProductEntry {
    id: number;
    supplier: Supplier;
    species: Species;
    variety: Variety;
    delivery_date: string;
    quantity: number;
}

interface Category {
    id: number;
    name: string;
}

interface Subcategory {
    id: number;
    name: string;
}

interface Rejection {
    id: number;
    quantity: number;
    detail: string | null;
    category: Category;
    subcategory: Subcategory | null;
}

interface Classification {
    id: number;
    product_entry_id: number;
    product_entry: ProductEntry;
    total_classified: number;
    local_quantity: number;
    local_reason: string | null;
    local_is_complete: boolean;
    rejections: Rejection[];
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
        title: 'Flor Local',
        href: '/local-flowers',
    },
];

export default function LocalFlowersIndex({ classifications }: Props) {
    const handleDelete = (classification: Classification) => {
        if (
            confirm(
                `¿Estás seguro de eliminar este registro de flor local?`
            )
        ) {
            router.delete(`/local-flowers/${classification.id}`);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString('es-EC', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
            timeZone: 'America/Guayaquil',
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Flor Local" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">Flor Local / Nacional</h1>
                        <p className="text-sm text-muted-foreground">
                            Registro de flores desechadas para venta local
                        </p>
                    </div>
                </div>

                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Fecha</TableHead>
                                <TableHead>Proveedor</TableHead>
                                <TableHead>Especie / Variedad</TableHead>
                                <TableHead className="text-center">Total Ingreso</TableHead>
                                <TableHead className="text-center">Exportable</TableHead>
                                <TableHead className="text-center">Flor Local</TableHead>
                                <TableHead className="min-w-[200px]">Razón del Desecho</TableHead>
                                <TableHead className="w-16">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {classifications.data.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={8}
                                        className="py-8 text-center text-muted-foreground"
                                    >
                                        No hay registros de flor local
                                    </TableCell>
                                </TableRow>
                            ) : (
                                classifications.data.map((classification) => (
                                    <TableRow key={classification.id}>
                                        <TableCell className="font-medium text-sm">
                                            {formatDate(classification.product_entry.delivery_date)}
                                        </TableCell>
                                        <TableCell>
                                            {classification.product_entry.supplier.name}
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-muted-foreground text-xs">
                                                {classification.product_entry.species.name}
                                            </span>
                                            <br />
                                            <span className="font-medium">
                                                {classification.product_entry.variety.name}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-center font-bold">
                                            {classification.product_entry.quantity}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                                {classification.total_classified}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Badge variant="secondary" className="bg-amber-100 text-amber-800 border-amber-200">
                                                {classification.local_quantity}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {classification.rejections && classification.rejections.length > 0 ? (
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <div className="space-y-1 cursor-help">
                                                                {classification.rejections.slice(0, 2).map((rejection, idx) => (
                                                                    <div key={idx} className="flex items-center gap-1 text-xs">
                                                                        <Badge variant="outline" className="text-xs py-0">
                                                                            {rejection.category.name}
                                                                        </Badge>
                                                                        <span className="text-muted-foreground">
                                                                            {rejection.subcategory?.name && `- ${rejection.subcategory.name}`}
                                                                        </span>
                                                                        <span className="font-medium">({rejection.quantity})</span>
                                                                    </div>
                                                                ))}
                                                                {classification.rejections.length > 2 && (
                                                                    <span className="text-xs text-muted-foreground">
                                                                        +{classification.rejections.length - 2} más...
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </TooltipTrigger>
                                                        <TooltipContent className="max-w-sm">
                                                            <div className="space-y-2">
                                                                {classification.rejections.map((rejection, idx) => (
                                                                    <div key={idx} className="text-sm">
                                                                        <span className="font-medium">{rejection.category.name}</span>
                                                                        {rejection.subcategory?.name && (
                                                                            <span className="text-muted-foreground"> - {rejection.subcategory.name}</span>
                                                                        )}
                                                                        <span className="ml-2">({rejection.quantity})</span>
                                                                        {rejection.detail && (
                                                                            <p className="text-xs text-muted-foreground">{rejection.detail}</p>
                                                                        )}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            ) : (
                                                <span className="text-muted-foreground text-sm">-</span>
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
                                                        <Link href={`/product-entries/${classification.product_entry_id}/local-flower`}>
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

                {/* Paginación */}
                {classifications.last_page > 1 && (
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                            Mostrando {classifications.data.length} de {classifications.total} registros
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

