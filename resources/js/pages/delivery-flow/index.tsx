/**
 * PÁGINA DE ÍNDICE - DELIVERY FLOW
 * 
 * Esta página muestra la lista de entregas del día actual.
 * 
 * Funcionalidad principal:
 * - Listar todas las entregas de flores del día
 * - Mostrar el progreso de clasificación de cada entrega
 * - Permitir acceder a la clasificación de cada entrega
 * - Eliminar entregas completas
 * 
 * Conceptos clave:
 * - Una "entrega" (ProductEntryGroup) agrupa todas las variedades que llegaron juntas
 * - Cada entrega tiene un progreso que indica cuánto se ha clasificado
 * - El progreso se calcula: (clasificados + locales) / total recibido
 */

import { Head, Link, router } from '@inertiajs/react';
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
import { type BreadcrumbItem } from '@/types';

// ============================================================================
// TIPOS DE DATOS
// ============================================================================

/**
 * Proveedor - Información básica del proveedor de flores
 */
interface Supplier {
    id: number;              // ID único del proveedor
    name: string;            // Nombre del proveedor
    code?: string;           // Código del proveedor (opcional)
}

/**
 * Especie - Tipo de flor (Rosa, Clavel, etc.)
 */
interface Species {
    id: number;
    name: string;
}

/**
 * Variedad - Variedad específica de una especie
 */
interface Variety {
    id: number;
    name: string;
}

/**
 * Clasificación - Datos de clasificación de tallos
 * Indica cuántos tallos se han clasificado y si está completo
 */
interface Classification {
    id: number;
    total_classified: number;        // Total de tallos clasificados como exportables
    is_complete: boolean;            // ¿Se clasificó todo?
    local_quantity: number;          // Tallos clasificados como flor local
    local_is_complete: boolean;      // ¿Se clasificó toda la flor local?
}

/**
 * Entrada de producto - Una variedad en una entrega
 */
interface ProductEntry {
    id: number;
    species: Species;
    variety: Variety;
    quantity: number;                         // Cantidad recibida
    stem_classification: Classification | null; // null si aún no se ha clasificado
}

/**
 * Grupo de entrega - Representa una entrega completa de un proveedor
 * Incluye totales calculados por el backend
 */
interface ProductEntryGroup {
    id: number;
    supplier: Supplier;
    entry_datetime: string;              // Fecha y hora de entrega (ISO 8601)
    notes: string | null;
    entries: ProductEntry[];
    
    // Totales calculados (agregados por el backend)
    total_stems: number;                 // Total de tallos recibidos en toda la entrega
    total_classified: number;            // Total de tallos clasificados como exportables
    total_local: number;                 // Total de tallos clasificados como flor local
    is_complete: boolean;                // ¿Se clasificó completamente la entrega?
}

/**
 * Datos paginados - Laravel pagina los resultados
 */
interface PaginatedGroups {
    data: ProductEntryGroup[];           // Los datos de la página actual
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

/**
 * Props del componente - Datos que recibe desde el backend
 */
interface Props {
    groups: PaginatedGroups;             // Entregas paginadas desde Laravel
}

// ============================================================================
// CONFIGURACIÓN DE NAVEGACIÓN
// ============================================================================

/**
 * Breadcrumbs - Migas de pan para la navegación
 * Muestra: Panel > Entrega y Postcosecha
 */
const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Panel', href: '/dashboard' },
    { title: 'Entrega y Postcosecha', href: '/delivery-flow' },
];

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export default function DeliveryFlowIndex({ groups }: Props) {
    
    // ========================================================================
    // FUNCIONES AUXILIARES
    // ========================================================================
    
    /**
     * Manejar eliminación de una entrega
     * 
     * Solicita confirmación al usuario antes de eliminar.
     * Al eliminar una entrega, se eliminan también todas sus variedades asociadas.
     */
    const manejarEliminacionDeEntrega = (grupoDeEntrega: ProductEntryGroup) => {
        const mensajeConfirmacion = `¿Estás seguro de eliminar esta entrega de ${grupoDeEntrega.supplier.name}? Se eliminarán todos los ingresos asociados.`;
        
        if (confirm(mensajeConfirmacion)) {
            router.delete(`/delivery-flow/${grupoDeEntrega.id}`);
        }
    };

    /**
     * Obtener entregas del día actual
     * 
     * Filtra solo las entregas que fueron hechas hoy (en timezone de Ecuador).
     * Esto permite que la página muestre solo el trabajo del día.
     */
    const entregasDeHoy = groups.data.filter(grupo => 
        isTodayEC(grupo.entry_datetime)
    );

    /**
     * Calcular porcentaje de progreso de clasificación
     * 
     * El progreso indica qué porcentaje de los tallos recibidos ya han sido
     * clasificados (como exportables o flor local).
     * 
     * Fórmula: (clasificados + locales) / total recibido × 100
     * 
     * Retorna 0 si no hay tallos (para evitar división por cero).
     * Puede retornar más de 100 si hay un error de clasificación.
     */
    const calcularPorcentajeDeProgreso = (grupoDeEntrega: ProductEntryGroup): number => {
        // Si no hay tallos, el progreso es 0
        if (grupoDeEntrega.total_stems === 0) return 0;
        
        // Sumar tallos clasificados (exportables + locales)
        const tallosClasificados = grupoDeEntrega.total_classified + grupoDeEntrega.total_local;
        
        // Calcular porcentaje y redondear
        const porcentaje = (tallosClasificados / grupoDeEntrega.total_stems) * 100;
        return Math.round(porcentaje);
    };

    /**
     * Obtener badge de estado según el progreso
     * 
     * Retorna un componente Badge con el color y texto apropiado
     * según el estado de clasificación:
     * 
     * - Excedido (>100%): Rojo - hay un error, se clasificó más de lo recibido
     * - Completo (100%): Verde - toda la entrega está clasificada
     * - En Proceso (1-99%): Amarillo - se está trabajando en la clasificación
     * - Pendiente (0%): Gris - aún no se ha empezado a clasificar
     */
    const obtenerBadgeDeEstado = (grupoDeEntrega: ProductEntryGroup) => {
        const progreso = calcularPorcentajeDeProgreso(grupoDeEntrega);
        
        // Caso 1: Clasificación excedida (ERROR)
        if (progreso > 100) {
            return (
                <Badge className="bg-red-100 text-red-700 border-red-200">
                    <AlertTriangle className="mr-1 h-3 w-3" />
                    Excedido ({progreso}%)
                </Badge>
            );
        }
        
        // Caso 2: Clasificación completa (ÉXITO)
        if (progreso === 100) {
            return (
                <Badge className="bg-green-100 text-green-700 border-green-200">
                    <CheckCircle2 className="mr-1 h-3 w-3" />
                    Completo
                </Badge>
            );
        }
        
        // Caso 3: Clasificación en proceso
        if (progreso > 0) {
            return (
                <Badge className="bg-amber-100 text-amber-700 border-amber-200">
                    <Clock className="mr-1 h-3 w-3" />
                    En Proceso ({progreso}%)
                </Badge>
            );
        }
        
        // Caso 4: Sin clasificar (pendiente)
        return (
            <Badge variant="outline" className="text-muted-foreground">
                <Clock className="mr-1 h-3 w-3" />
                Pendiente
            </Badge>
        );
    };

    // ========================================================================
    // RENDERIZADO
    // ========================================================================
    
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Entrega y Postcosecha" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                {/* Encabezado de la página */}
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

                {/* Tabla de entregas del día */}
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Fecha de Entrega</TableHead>
                                <TableHead>Proveedor</TableHead>
                                <TableHead className="text-center">
                                    Variedades
                                </TableHead>
                                <TableHead className="text-right">
                                    Total Tallos
                                </TableHead>
                                <TableHead className="text-center">
                                    Progreso
                                </TableHead>
                                <TableHead className="text-center">
                                    Estado
                                </TableHead>
                                <TableHead className="w-16">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {entregasDeHoy.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={7}
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
                                entregasDeHoy.map((grupo) => (
                                    <TableRow
                                        key={grupo.id}
                                        className="cursor-pointer hover:bg-muted/50"
                                        onClick={() =>
                                            router.visit(
                                                `/delivery-flow/${grupo.id}`,
                                            )
                                        }
                                    >
                                        {/* Fecha de entrega */}
                                        <TableCell className="font-medium">
                                            <div>
                                                <p className="text-base">
                                                    {formatDateEC(grupo.entry_datetime).short}
                                                </p>
                                                <p className="text-xs text-muted-foreground capitalize">
                                                    {formatDateEC(grupo.entry_datetime).long}
                                                </p>
                                            </div>
                                        </TableCell>
                                        
                                        {/* Proveedor */}
                                        <TableCell>
                                            <div>
                                                <p className="font-medium">
                                                    Código del proveedor:{' '}
                                                    {grupo.supplier.code}
                                                </p>
                                                {grupo.supplier.code && (
                                                    <p className="text-xs text-muted-foreground">
                                                        {' '}
                                                        {grupo.supplier.name}
                                                    </p>
                                                )}
                                            </div>
                                        </TableCell>
                                        
                                        {/* Número de variedades */}
                                        <TableCell className="text-center">
                                            <Badge variant="secondary">
                                                {grupo.entries.length}
                                            </Badge>
                                        </TableCell>
                                        
                                        {/* Total de tallos */}
                                        <TableCell className="text-right font-medium">
                                            {grupo.total_stems.toLocaleString()}
                                        </TableCell>
                                        
                                        {/* Barra de progreso */}
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <div className="h-2 w-20 overflow-hidden rounded-full bg-secondary">
                                                    <div
                                                        className={`h-full transition-all ${
                                                            calcularPorcentajeDeProgreso(grupo) >
                                                            100
                                                                ? 'bg-red-500'
                                                                : calcularPorcentajeDeProgreso(
                                                                        grupo,
                                                                    ) === 100
                                                                  ? 'bg-green-500'
                                                                  : 'bg-primary'
                                                        }`}
                                                        style={{
                                                            width: `${Math.min(calcularPorcentajeDeProgreso(grupo), 100)}%`,
                                                        }}
                                                    />
                                                </div>
                                                <span
                                                    className={`w-12 text-xs ${
                                                        calcularPorcentajeDeProgreso(grupo) > 100
                                                            ? 'font-medium text-red-600'
                                                            : 'text-muted-foreground'
                                                    }`}
                                                >
                                                    {calcularPorcentajeDeProgreso(grupo)}%
                                                </span>
                                            </div>
                                        </TableCell>
                                        
                                        {/* Badge de estado */}
                                        <TableCell className="text-center">
                                            {obtenerBadgeDeEstado(grupo)}
                                        </TableCell>
                                        
                                        {/* Menú de acciones */}
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
                                                            href={`/delivery-flow/${grupo.id}`}
                                                        >
                                                            <Eye className="mr-2 h-4 w-4" />
                                                            Editar entrega /
                                                            Agregar entrega
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() =>
                                                            manejarEliminacionDeEntrega(grupo)
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

                {/* Resumen del día */}
                {entregasDeHoy.length > 0 && (
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <p>
                            {entregasDeHoy.length} entrega
                            {entregasDeHoy.length !== 1 ? 's' : ''} hoy
                        </p>
                        <p>
                            Total:{' '}
                            {entregasDeHoy
                                .reduce((suma, g) => suma + g.total_stems, 0)
                                .toLocaleString()}{' '}
                            tallos
                        </p>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

