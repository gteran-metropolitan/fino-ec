import { Head, Link, router, usePage } from '@inertiajs/react';
import { AlertTriangle, CheckCircle2, Clock, Eye, MoreHorizontal, Plus, Trash2 } from 'lucide-react';

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
import { formatDateEC, getTodayTitleEC, isTodayEC } from '@/lib/date-utils';
import { type BreadcrumbItem, type SharedData } from '@/types';

interface Supplier {
    id: number;
    name: string;
    code?: string;
}

interface Species {
    id: number;
    name: string;
}

interface Variety {
    id: number;
    name: string;
}

interface Classification {
    id: number;
    total_classified: number;
    is_complete: boolean;
    local_quantity: number;
    local_is_complete: boolean;
}

interface ProductEntry {
    id: number;
    species: Species;
    variety: Variety;
    quantity: number;
    stem_classification: Classification | null;
}

interface ProductEntryGroup {
    id: number;
    supplier: Supplier;
    entry_datetime: string;
    notes: string | null;
    entries: ProductEntry[];
    total_stems: number;
    total_classified: number;
    total_local: number;
    is_complete: boolean;
}

interface PaginatedGroups {
    data: ProductEntryGroup[];
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
    groups: PaginatedGroups;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Panel', href: '/dashboard' },
    { title: 'Entrega y Postcosecha', href: '/delivery-flow' },
];

export default function DeliveryFlowIndex({ groups }: Props) {
    // Si es digitador, tiene vista restringida
    const { isDataEntryUser } = usePage<SharedData>().props;

    const handleDelete = (group: ProductEntryGroup) => {
        if (confirm(`¿Estás seguro de eliminar esta entrega de ${group.supplier.name}? Se eliminarán todos los ingresos asociados.`)) {
            router.delete(`/delivery-flow/${group.id}`);
        }
    };

    // Filtrar solo las entregas del día actual
    const todayGroups = groups.data.filter(group => isTodayEC(group.entry_datetime));

    const getProgress = (group: ProductEntryGroup) => {
        if (group.total_stems === 0) return 0;
        return Math.round(((group.total_classified + group.total_local) / group.total_stems) * 100);
    };

    const getStatusBadge = (group: ProductEntryGroup) => {
        const progress = getProgress(group);
        if (progress > 100) {
            return (
                <Badge className="bg-red-100 text-red-700 border-red-200">
                    <AlertTriangle className="mr-1 h-3 w-3" />
                    Excedido ({progress}%)
                </Badge>
            );
        }
        if (progress === 100) {
            return (
                <Badge className="bg-green-100 text-green-700 border-green-200">
                    <CheckCircle2 className="mr-1 h-3 w-3" />
                    Completo
                </Badge>
            );
        }
        if (progress > 0) {
            return (
                <Badge className="bg-amber-100 text-amber-700 border-amber-200">
                    <Clock className="mr-1 h-3 w-3" />
                    En Proceso ({progress}%)
                </Badge>
            );
        }
        return (
            <Badge variant="outline" className="text-muted-foreground">
                <Clock className="mr-1 h-3 w-3" />
                Pendiente
            </Badge>
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Entrega y Postcosecha" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Entrega y Postcosecha
                        </h1>
                        <p className="text-sm text-muted-foreground capitalize">
                            {getTodayTitleEC()}
                        </p>
                    </div>
                    <Button asChild>
                        <Link href="/delivery-flow/create">
                            <Plus className="mr-2 h-4 w-4" />
                            Nueva Entrega
                        </Link>
                    </Button>
                </div>

                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Fecha de Entrega</TableHead>
                                <TableHead>Proveedor</TableHead>
                                <TableHead className="text-center">
                                    Variedades
                                </TableHead>
                                {/* Ocultar columnas de totales para digitadores */}
                                {!isDataEntryUser && (
                                    <>
                                        <TableHead className="text-right">
                                            Total Tallos
                                        </TableHead>
                                        <TableHead className="text-center">
                                            Progreso
                                        </TableHead>
                                        <TableHead className="text-center">
                                            Estado
                                        </TableHead>
                                    </>
                                )}
                                <TableHead className="w-16">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {todayGroups.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={isDataEntryUser ? 4 : 7}
                                        className="py-12 text-center text-muted-foreground"
                                    >
                                        <div className="flex flex-col items-center gap-2">
                                            <p>
                                                No hay entregas registradas hoy
                                            </p>
                                            <Button
                                                asChild
                                                variant="outline"
                                                size="sm"
                                            >
                                                <Link href="/delivery-flow/create">
                                                    <Plus className="mr-2 h-4 w-4" />
                                                    Crear primera entrega del
                                                    día
                                                </Link>
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                todayGroups.map((group) => (
                                    <TableRow
                                        key={group.id}
                                        className="cursor-pointer hover:bg-muted/50"
                                        onClick={() =>
                                            router.visit(
                                                `/delivery-flow/${group.id}`,
                                            )
                                        }
                                    >
                                        <TableCell className="font-medium">
                                            <div>
                                                <p className="text-base">
                                                    {formatDateEC(group.entry_datetime).short}
                                                </p>
                                                <p className="text-xs text-muted-foreground capitalize">
                                                    {formatDateEC(group.entry_datetime).long}
                                                </p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <p className="font-medium">
                                                    Código del proveedor:{' '}
                                                    {group.supplier.code}
                                                </p>
                                                {group.supplier.code && (
                                                    <p className="text-xs text-muted-foreground">
                                                        {' '}
                                                        {group.supplier.name}
                                                    </p>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Badge variant="secondary">
                                                {group.entries.length}
                                            </Badge>
                                        </TableCell>
                                        {/* Ocultar celdas de totales para digitadores */}
                                        {!isDataEntryUser && (
                                            <>
                                                <TableCell className="text-right font-medium">
                                                    {group.total_stems.toLocaleString()}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <div className="h-2 w-20 overflow-hidden rounded-full bg-secondary">
                                                            <div
                                                                className={`h-full transition-all ${
                                                                    getProgress(group) >
                                                                    100
                                                                        ? 'bg-red-500'
                                                                        : getProgress(
                                                                                group,
                                                                            ) === 100
                                                                          ? 'bg-green-500'
                                                                          : 'bg-primary'
                                                                }`}
                                                                style={{
                                                                    width: `${Math.min(getProgress(group), 100)}%`,
                                                                }}
                                                            />
                                                        </div>
                                                        <span
                                                            className={`w-12 text-xs ${
                                                                getProgress(group) > 100
                                                                    ? 'font-medium text-red-600'
                                                                    : 'text-muted-foreground'
                                                            }`}
                                                        >
                                                            {getProgress(group)}%
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    {getStatusBadge(group)}
                                                </TableCell>
                                            </>
                                        )}
                                        <TableCell
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                    >
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem asChild>
                                                        <Link
                                                            href={`/delivery-flow/${group.id}`}
                                                        >
                                                            <Eye className="mr-2 h-4 w-4" />
                                                            Editar entrega /
                                                            Agregar entrega
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() =>
                                                            handleDelete(group)
                                                        }
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

                {/* Resumen del día - ocultar para digitadores */}
                {!isDataEntryUser && todayGroups.length > 0 && (
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <p>
                            {todayGroups.length} entrega
                            {todayGroups.length !== 1 ? 's' : ''} hoy
                        </p>
                        <p>
                            Total:{' '}
                            {todayGroups
                                .reduce((sum, g) => sum + g.total_stems, 0)
                                .toLocaleString()}{' '}
                            tallos
                        </p>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

