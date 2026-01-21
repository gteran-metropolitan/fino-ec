# 📚 Guía de Aprendizaje: Delivery Flow

Esta guía te explica paso a paso cada concepto de **React**, **TypeScript** e **Inertia.js** usado en el módulo de entregas (delivery-flow).

---

## 📁 Estructura del Módulo

```
delivery-flow/
├── index.tsx           → Página principal (lista de entregas del día)
├── create.tsx          → Página para crear nueva entrega
├── edit.tsx            → Página para editar info de entrega
├── show.tsx            → Página para ver/editar variedades de una entrega
├── _types.ts           → Definiciones de tipos TypeScript
├── _utils.ts           → Funciones utilitarias (helpers)
├── _useDeliveryEntries.ts → Hook personalizado para manejar entradas
├── _useCreateDelivery.ts  → Hook personalizado para crear entregas
└── components/         → Componentes reutilizables
```

---

## 🎯 Conceptos Clave Explicados

### 1️⃣ ¿Qué es TypeScript?

TypeScript es JavaScript con "tipos". Los tipos te ayudan a evitar errores diciéndole al código qué tipo de dato esperas.

```typescript
// ❌ JavaScript puro - No sabes qué es "supplier"
function showName(supplier) {
  return supplier.name; // ¿Qué propiedades tiene supplier?
}

// ✅ TypeScript - Sabes exactamente qué es "supplier"
interface Supplier {
  id: number;      // id es un número
  name: string;    // name es texto
  code?: string;   // code es texto OPCIONAL (el ? lo indica)
}

function showName(supplier: Supplier) {
  return supplier.name; // TypeScript sabe que supplier tiene .name
}
```

### 2️⃣ ¿Qué es una Interface?

Una **interface** es como un "contrato" que define la forma de un objeto:

```typescript
// Definimos cómo debe lucir un Proveedor
interface Supplier {
  id: number;        // Siempre debe tener un id numérico
  name: string;      // Siempre debe tener un nombre texto
  code?: string;     // PUEDE tener un código (el ? es opcional)
}

// Ahora TypeScript nos avisa si falta algo
const proveedor: Supplier = {
  id: 1,
  name: "Juan"
  // code es opcional, no es necesario ponerlo
};
```

### 3️⃣ ¿Qué es Props en React?

**Props** (propiedades) son los datos que le pasas a un componente desde afuera:

```tsx
// Los Props son como los ingredientes de una receta
interface Props {
  groups: PaginatedGroups;  // Este componente NECESITA una lista de grupos
}

// El componente recibe esos "ingredientes" y los usa
export default function DeliveryFlowIndex({ groups }: Props) {
  // groups está disponible aquí gracias a los Props
  return <div>{groups.data.length} entregas</div>;
}
```

### 4️⃣ ¿Qué es useState?

**useState** es un "hook" de React que te permite guardar y cambiar valores que el usuario puede modificar:

```tsx
import { useState } from 'react';

function Ejemplo() {
  // useState retorna 2 cosas:
  // 1. El valor actual (nombre)
  // 2. Una función para cambiarlo (setNombre)
  const [nombre, setNombre] = useState('');
  //     ^^^^^^  ^^^^^^^^^         ^^^
  //     valor   función para      valor inicial
  //     actual  cambiar

  return (
    <input 
      value={nombre}                          // Muestra el valor actual
      onChange={(e) => setNombre(e.target.value)} // Cambia cuando escribes
    />
  );
}
```

### 5️⃣ ¿Qué es Inertia.js?

**Inertia.js** es el "puente" entre tu backend (Laravel/PHP) y tu frontend (React). Te permite:

- **Navegar** entre páginas sin recargar
- **Enviar formularios** al servidor
- **Recibir datos** del servidor directamente como Props

```tsx
import { Head, Link, router } from '@inertiajs/react';

// Head: Cambia el título de la pestaña del navegador
<Head title="Mi Página" />

// Link: Navega a otra página SIN recargar (como un SPA)
<Link href="/delivery-flow/create">Nueva Entrega</Link>

// router: Para acciones programáticas
router.visit('/otra-pagina');           // Navegar
router.post('/api/endpoint', datos);    // Enviar POST
router.delete('/api/item/1');           // Enviar DELETE
```

---

## 📄 Archivos Explicados con Comentarios

A continuación tienes cada archivo con comentarios "humanos" para que entiendas cada línea.

---

## 📝 _types.ts (Explicado)

Este archivo define TODOS los tipos de datos que usa el módulo:

```typescript
// ==============================================================
// TIPOS COMPARTIDOS PARA EL MÓDULO DELIVERY-FLOW
// ==============================================================
// Este archivo es como un "diccionario" que define la forma
// de todos los objetos que usamos en el módulo.
// ==============================================================

// Un Proveedor (la persona/empresa que entrega las flores)
export interface Supplier {
    id: number;        // Identificador único en la base de datos
    name: string;      // Nombre del proveedor (ej: "Flores Ecuador")
    code?: string;     // Código único opcional (ej: "FE001")
}

// Una Especie de flor (ej: Rosa, Clavel, Girasol)
export interface Species {
    id: number;
    name: string;      // Nombre de la especie (ej: "Rosa")
}

// Una Variedad específica de una especie (ej: "Rosa Roja", "Rosa Blanca")
export interface Variety {
    id: number;
    name: string;      // Nombre de la variedad (ej: "Freedom")
}

// Subcategoría de rechazo (razón específica del rechazo)
export interface Subcategory {
    id: number;
    name: string;              // Ej: "Pétalo dañado"
    description: string | null; // Descripción opcional
}

// Categoría de rechazo (razón general del rechazo)
export interface Category {
    id: number;
    name: string;                              // Ej: "Defecto físico"
    description: string | null;
    active_subcategories: Subcategory[];       // Lista de subcategorías
}

// Registro de un rechazo existente en la base de datos
export interface ExistingRejection {
    id: number;
    rejection_category_id: number;             // A qué categoría pertenece
    rejection_subcategory_id: number | null;   // A qué subcategoría (opcional)
    quantity: number;                          // Cuántos tallos rechazados
    detail: string | null;                     // Detalle adicional
}

// La clasificación de tallos de una entrada
// (cuántos tallos de cada tamaño y a qué precio)
export interface Classification {
    id: number;
    
    // Cantidad de tallos por tamaño (en centímetros)
    cm_40: number;    // Tallos de 40cm
    cm_50: number;    // Tallos de 50cm
    cm_60: number;    // Tallos de 60cm
    cm_70: number;    // Tallos de 70cm
    cm_80: number;    // Tallos de 80cm
    cm_90: number;    // Tallos de 90cm
    cm_100: number;   // Tallos de 100cm
    cm_110: number;   // Tallos de 110cm
    cm_120: number;   // Tallos de 120cm
    sobrante: number; // Tallos sobrantes
    
    // Precios por cada tamaño
    price_40: number;
    price_50: number;
    price_60: number;
    price_70: number;
    price_80: number;
    price_90: number;
    price_100: number;
    price_110: number;
    price_120: number;
    price_sobrante: number;
    
    // Totales calculados
    total_classified: number;  // Total de tallos clasificados
    total_price: number;       // Precio total
    is_complete: boolean;      // ¿Se clasificaron todos los tallos?
    
    // Flor local (no exportable)
    local_quantity: number;
    local_is_complete: boolean;
    
    // Rechazos asociados
    rejections: ExistingRejection[];
}

// Una entrada de producto (una variedad específica en una entrega)
export interface ProductEntry {
    id: number;
    species: Species;                        // Qué especie es
    variety: Variety;                        // Qué variedad es
    quantity: number;                        // Cuántos tallos entregaron
    stem_classification: Classification | null; // Su clasificación (puede no tener)
}

// Un grupo de entradas (una "entrega" completa de un proveedor)
export interface ProductEntryGroup {
    id: number;
    supplier: Supplier;              // Quién hizo la entrega
    entry_datetime: string;          // Cuándo se recibió
    notes: string | null;            // Notas adicionales
    entries: ProductEntry[];         // Lista de variedades entregadas
}

// ============================================================
// TIPOS PARA EL FORMULARIO DE EDICIÓN
// ============================================================

// Datos editables de clasificación exportable
// (usamos string porque vienen de inputs de texto)
export interface ExportableData {
    cm_40: string;
    cm_50: string;
    cm_60: string;
    cm_70: string;
    cm_80: string;
    cm_90: string;
    cm_100: string;
    cm_110: string;
    cm_120: string;
    sobrante: string;
}

// Datos editables de precios
export interface PricesData {
    price_40: string;
    price_50: string;
    price_60: string;
    price_70: string;
    price_80: string;
    price_90: string;
    price_100: string;
    price_110: string;
    price_120: string;
    price_sobrante: string;
}

// Estado editable de una entrada (lo que el usuario puede modificar)
export interface EditableEntry {
    id: number | string;        // ID (número si existe, string si es nuevo)
    isNew?: boolean;            // ¿Es una entrada nueva?
    species_name: string;       // Nombre de la especie
    variety_name: string;       // Nombre de la variedad
    quantity: string;           // Cantidad (string por el input)
    originalQuantity: number;   // Cantidad original (para calcular diferencias)
    addQuantity: string;        // Cantidad a agregar
    removeQuantity: string;     // Cantidad a quitar
    exportable: ExportableData; // Datos de exportación
    prices: PricesData;         // Precios
    localFlower: Record<string, string>; // Flor local por categoría
    exportableOpen: boolean;    // ¿Sección exportable abierta?
    localFlowerOpen: boolean;   // ¿Sección flor local abierta?
}

// Totales calculados de una entrada
export interface EntryTotals {
    quantity: number;           // Cantidad total
    totalExportable: number;    // Total exportable
    totalLocal: number;         // Total flor local
    totalClassified: number;    // Total clasificado
    remaining: number;          // Restante por clasificar
}

// Totales globales de todas las entradas
export interface GlobalTotals {
    totalQuantity: number;      // Cantidad total de tallos
    totalExportable: number;    // Total exportable
    totalLocal: number;         // Total flor local
    totalPrice: number;         // Precio total
    totalClassified: number;    // Total clasificado
    remaining: number;          // Restante por clasificar
    progress: number;           // Porcentaje de progreso (0-100)
}

// Configuración de un tamaño de tallo
export interface StemSize {
    key: string;       // Clave para el dato (ej: "cm_40")
    priceKey: string;  // Clave para el precio (ej: "price_40")
    label: string;     // Etiqueta para mostrar (ej: "40")
    unit: string;      // Unidad (ej: "cm" o vacío para sobrante)
}
```

---

## 📝 index.tsx (Página Principal - Explicado)

```tsx
// ==============================================================
// PÁGINA PRINCIPAL DE ENTREGAS
// ==============================================================
// Muestra una tabla con todas las entregas del día actual.
// Permite ver el progreso de clasificación de cada entrega.
// ==============================================================

// 📦 IMPORTACIONES
// ---------------------------------------------------------------
// Importamos lo que necesitamos de Inertia.js
import { Head, Link, router } from '@inertiajs/react';

// Importamos iconos de lucide-react (librería de iconos)
import { AlertTriangle, CheckCircle2, Clock, Eye, MoreHorizontal, Plus, Trash2 } from 'lucide-react';

// Importamos componentes de UI (interfaz de usuario)
// Estos vienen de una carpeta de componentes reutilizables
import { Badge } from '@/components/ui/badge';       // Etiqueta con color
import { Button } from '@/components/ui/button';     // Botón
import { DropdownMenu, ... } from '@/components/ui/dropdown-menu'; // Menú desplegable
import { Table, ... } from '@/components/ui/table'; // Tabla

// Layout principal de la aplicación (navegación, sidebar, etc.)
import AppLayout from '@/layouts/app-layout';

// Utilidades para manejar fechas en formato Ecuador
import { formatDateEC, getTodayTitleEC, isTodayEC } from '@/lib/date-utils';

// Tipo para los breadcrumbs (migas de pan de navegación)
import { type BreadcrumbItem } from '@/types';


// 📝 DEFINICIÓN DE TIPOS (INTERFACES)
// ---------------------------------------------------------------
// Definimos la forma de los datos que esperamos recibir

interface Supplier {
    id: number;
    name: string;
    code?: string;  // El ? significa que es OPCIONAL
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
    stem_classification: Classification | null; // Puede ser null si no hay clasificación
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

// Tipo para datos paginados (cuando hay muchos registros)
interface PaginatedGroups {
    data: ProductEntryGroup[];  // Los registros actuales
    current_page: number;       // Página actual
    last_page: number;          // Última página
    per_page: number;           // Registros por página
    total: number;              // Total de registros
    links: Array<{              // Links para navegar entre páginas
        url: string | null;
        label: string;
        active: boolean;
    }>;
}

// Props = los datos que este componente recibe de Laravel/Inertia
interface Props {
    groups: PaginatedGroups;
}


// 🧭 BREADCRUMBS (Migas de pan)
// ---------------------------------------------------------------
// Esto muestra la ruta de navegación: Panel > Entrega y Postcosecha
const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Panel', href: '/dashboard' },
    { title: 'Entrega y Postcosecha', href: '/delivery-flow' },
];


// 🎨 COMPONENTE PRINCIPAL
// ---------------------------------------------------------------
// export default = este es el componente que se exporta y usa
// function DeliveryFlowIndex = nombre del componente
// ({ groups }: Props) = recibe "groups" de los Props

export default function DeliveryFlowIndex({ groups }: Props) {
    
    // 🗑️ FUNCIÓN PARA ELIMINAR UNA ENTREGA
    // -----------------------------------------------------------
    // handleDelete = manejador de eliminación
    // Recibe un grupo y pregunta confirmación antes de eliminar
    const handleDelete = (group: ProductEntryGroup) => {
        // confirm() muestra un popup de confirmación nativo del navegador
        if (confirm(`¿Estás seguro de eliminar esta entrega de ${group.supplier.name}?`)) {
            // router.delete() envía una petición DELETE al servidor
            router.delete(`/delivery-flow/${group.id}`);
        }
    };

    // 📅 FILTRAR ENTREGAS DE HOY
    // -----------------------------------------------------------
    // groups.data contiene TODAS las entregas
    // .filter() crea un nuevo array con solo las que cumplen la condición
    // isTodayEC() verifica si la fecha es de hoy (zona horaria Ecuador)
    const todayGroups = groups.data.filter(group => isTodayEC(group.entry_datetime));

    // 📊 CALCULAR PROGRESO DE UNA ENTREGA
    // -----------------------------------------------------------
    // Retorna un porcentaje de 0 a 100 (o más si se excedió)
    const getProgress = (group: ProductEntryGroup) => {
        // Si no hay tallos, el progreso es 0
        if (group.total_stems === 0) return 0;
        
        // Fórmula: (clasificados + local) / total * 100
        // Math.round() redondea al entero más cercano
        return Math.round(
            ((group.total_classified + group.total_local) / group.total_stems) * 100
        );
    };

    // 🏷️ OBTENER BADGE DE ESTADO
    // -----------------------------------------------------------
    // Retorna un componente Badge con color según el progreso
    const getStatusBadge = (group: ProductEntryGroup) => {
        const progress = getProgress(group);
        
        // Si el progreso supera 100%, algo está mal (excedido)
        if (progress > 100) {
            return (
                <Badge className="bg-red-100 text-red-700 border-red-200">
                    <AlertTriangle className="mr-1 h-3 w-3" />
                    Excedido ({progress}%)
                </Badge>
            );
        }
        
        // Si es exactamente 100%, está completo
        if (progress === 100) {
            return (
                <Badge className="bg-green-100 text-green-700 border-green-200">
                    <CheckCircle2 className="mr-1 h-3 w-3" />
                    Completo
                </Badge>
            );
        }
        
        // Si es mayor a 0% pero menor a 100%, está en proceso
        if (progress > 0) {
            return (
                <Badge className="bg-amber-100 text-amber-700 border-amber-200">
                    <Clock className="mr-1 h-3 w-3" />
                    En Proceso ({progress}%)
                </Badge>
            );
        }
        
        // Si es 0%, está pendiente
        return (
            <Badge variant="outline" className="text-muted-foreground">
                <Clock className="mr-1 h-3 w-3" />
                Pendiente
            </Badge>
        );
    };

    // 🎨 RENDERIZADO (lo que se muestra en pantalla)
    // -----------------------------------------------------------
    return (
        // AppLayout es el "marco" de la página (navegación, sidebar, etc.)
        <AppLayout breadcrumbs={breadcrumbs}>
            
            {/* Head cambia el título de la pestaña del navegador */}
            <Head title="Entrega y Postcosecha" />
            
            {/* Contenedor principal con padding y gap */}
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                
                {/* ENCABEZADO: Título + Botón Nueva Entrega */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Entrega y Postcosecha
                        </h1>
                        <p className="text-sm text-muted-foreground capitalize">
                            {getTodayTitleEC()} {/* Muestra la fecha de hoy formateada */}
                        </p>
                    </div>
                    
                    {/* Button asChild hace que el botón actúe como el Link */}
                    <Button asChild>
                        <Link href="/delivery-flow/create">
                            <Plus className="mr-2 h-4 w-4" />
                            Nueva Entrega
                        </Link>
                    </Button>
                </div>

                {/* TABLA DE ENTREGAS */}
                <div className="rounded-md border">
                    <Table>
                        {/* Encabezados de la tabla */}
                        <TableHeader>
                            <TableRow>
                                <TableHead>Fecha de Entrega</TableHead>
                                <TableHead>Proveedor</TableHead>
                                <TableHead className="text-center">Variedades</TableHead>
                                <TableHead className="text-right">Total Tallos</TableHead>
                                <TableHead className="text-center">Progreso</TableHead>
                                <TableHead className="text-center">Estado</TableHead>
                                <TableHead className="w-16">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        
                        {/* Cuerpo de la tabla */}
                        <TableBody>
                            {/* Si no hay entregas hoy, mostramos mensaje vacío */}
                            {todayGroups.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="py-12 text-center">
                                        <div className="flex flex-col items-center gap-2">
                                            <p>No hay entregas registradas hoy</p>
                                            <Button asChild variant="outline" size="sm">
                                                <Link href="/delivery-flow/create">
                                                    <Plus className="mr-2 h-4 w-4" />
                                                    Crear primera entrega del día
                                                </Link>
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                // Si hay entregas, las mapeamos a filas de tabla
                                // .map() recorre cada elemento y retorna algo
                                todayGroups.map((group) => (
                                    <TableRow
                                        key={group.id} // React necesita un key único para cada item
                                        className="cursor-pointer hover:bg-muted/50"
                                        onClick={() => router.visit(`/delivery-flow/${group.id}`)}
                                    >
                                        {/* Celda de fecha */}
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
                                        
                                        {/* Celda de proveedor */}
                                        <TableCell>
                                            <div>
                                                <p className="font-medium">
                                                    Código: {group.supplier.code}
                                                </p>
                                                {group.supplier.code && (
                                                    <p className="text-xs text-muted-foreground">
                                                        {group.supplier.name}
                                                    </p>
                                                )}
                                            </div>
                                        </TableCell>
                                        
                                        {/* Celda de cantidad de variedades */}
                                        <TableCell className="text-center">
                                            <Badge variant="secondary">
                                                {group.entries.length}
                                            </Badge>
                                        </TableCell>
                                        
                                        {/* Celda de total de tallos */}
                                        <TableCell className="text-right font-medium">
                                            {group.total_stems.toLocaleString()}
                                        </TableCell>
                                        
                                        {/* Celda de barra de progreso */}
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                {/* Barra de fondo */}
                                                <div className="h-2 w-20 overflow-hidden rounded-full bg-secondary">
                                                    {/* Barra de progreso */}
                                                    <div
                                                        className={`h-full transition-all ${
                                                            getProgress(group) > 100
                                                                ? 'bg-red-500'      // Rojo si excedido
                                                                : getProgress(group) === 100
                                                                  ? 'bg-green-500'  // Verde si completo
                                                                  : 'bg-primary'    // Azul si en proceso
                                                        }`}
                                                        style={{
                                                            // Math.min evita que la barra supere el 100% visual
                                                            width: `${Math.min(getProgress(group), 100)}%`,
                                                        }}
                                                    />
                                                </div>
                                                {/* Texto del porcentaje */}
                                                <span className="w-12 text-xs">
                                                    {getProgress(group)}%
                                                </span>
                                            </div>
                                        </TableCell>
                                        
                                        {/* Celda de estado */}
                                        <TableCell className="text-center">
                                            {getStatusBadge(group)}
                                        </TableCell>
                                        
                                        {/* Celda de acciones (menú desplegable) */}
                                        <TableCell onClick={(e) => e.stopPropagation()}>
                                            {/* stopPropagation evita que el click abra la entrega */}
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/delivery-flow/${group.id}`}>
                                                            <Eye className="mr-2 h-4 w-4" />
                                                            Ver/Editar
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => handleDelete(group)}
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

                {/* RESUMEN DEL DÍA */}
                {todayGroups.length > 0 && (
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <p>
                            {todayGroups.length} entrega{todayGroups.length !== 1 ? 's' : ''} hoy
                        </p>
                        <p>
                            Total: {todayGroups.reduce((sum, g) => sum + g.total_stems, 0).toLocaleString()} tallos
                            {/* reduce() suma todos los total_stems de todos los grupos */}
                        </p>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
```

---

## 📝 create.tsx (Crear Entrega - Explicado)

```tsx
// ==============================================================
// PÁGINA PARA CREAR NUEVA ENTREGA
// ==============================================================
// Esta página tiene 2 pasos:
// 1. Buscar/Crear proveedor
// 2. Agregar variedades y clasificación
// ==============================================================

import { Head, Link } from '@inertiajs/react';
import { Check, Save, X } from 'lucide-react';
import { type FormEventHandler } from 'react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

// Importamos tipos y el hook personalizado
import type { Category, ExistingSpecies, ExistingVariety } from './_types';
import { useCreateDelivery } from './_useCreateDelivery';
import { calculateEntryTotalPrice } from './_utils';

// Importamos componentes específicos de este módulo
import {
    CreateEntryCard,
    CreateSupplierDialog,
    ExistingDeliveryDialog,
    ProgressSummary,
    SupplierSearch,
    VarietySelector,
} from './components';

// Props que recibe este componente desde Laravel
interface Props {
    categories: Category[];                    // Categorías de rechazo
    existingSpecies: ExistingSpecies[];       // Especies que ya existen
    existingVarieties: ExistingVariety[];     // Variedades que ya existen
}

// Migas de pan para navegación
const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Panel', href: '/dashboard' },
    { title: 'Entrega y Postcosecha', href: '/delivery-flow' },
    { title: 'Nueva Entrega', href: '/delivery-flow/create' },
];

export default function CreateDeliveryFlow({ categories, existingSpecies = [], existingVarieties = [] }: Props) {
    
    // 🪝 HOOK PERSONALIZADO
    // -----------------------------------------------------------
    // useCreateDelivery es un "hook personalizado" que maneja
    // TODA la lógica de crear una entrega.
    // Retorna estados y funciones que usamos en el componente.
    const delivery = useCreateDelivery({ categories, existingSpecies, existingVarieties });

    // 📤 MANEJADOR DE ENVÍO DEL FORMULARIO
    // -----------------------------------------------------------
    // FormEventHandler es el tipo para funciones que manejan eventos de form
    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();  // Evita que el navegador recargue la página
        delivery.save();     // Llama a la función save del hook
    };

    // 🎨 RENDERIZADO
    // -----------------------------------------------------------
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Nueva Entrega" />
            
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Encabezado */}
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Nueva Entrega y Postcosecha
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Registra la entrega completa: variedades, clasificación exportable y flor local
                    </p>
                </div>

                {/* Mensaje de éxito (solo se muestra si hay mensaje) */}
                {delivery.successMessage && (
                    <Alert className="border-green-500 bg-green-50">
                        <Check className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-700">
                            {delivery.successMessage}
                        </AlertDescription>
                    </Alert>
                )}

                {/* Formulario principal */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    
                    {/* PASO 1: Búsqueda de Proveedor */}
                    {/* Solo se muestra cuando currentStep === 'supplier' */}
                    {delivery.currentStep === 'supplier' && (
                        <SupplierSearch
                            supplierCode={delivery.supplierCode}
                            onCodeChange={delivery.setSupplierCode}
                            onSearch={delivery.searchSupplier}
                            searching={delivery.searchingSupplier}
                            searchMessage={delivery.searchMessage}
                            onShowCreateSupplier={() => delivery.setShowCreateSupplier(true)}
                        />
                    )}

                    {/* PASO 2: Datos de la Entrega */}
                    {/* Solo se muestra cuando currentStep === 'entry' Y hay proveedor seleccionado */}
                    {delivery.currentStep === 'entry' && delivery.selectedSupplier && (
                        <>
                            {/* Selector de variedades */}
                            <VarietySelector
                                supplier={delivery.selectedSupplier}
                                deliveryDate={delivery.deliveryDate}
                                deliveryTime={delivery.deliveryTime}
                                onDateChange={delivery.setDeliveryDate}
                                onTimeChange={delivery.setDeliveryTime}
                                onBack={delivery.backToSupplier}
                                groupedVarieties={delivery.groupedAvailableVarieties}
                                onSelectVariety={delivery.addVariety}
                                // ... más props para autocompletado
                            />

                            {/* Resumen de progreso (solo si hay entradas) */}
                            {delivery.entries.length > 0 && (
                                <ProgressSummary totals={delivery.globalTotals} />
                            )}

                            {/* Tarjetas de cada entrada/variedad */}
                            {delivery.entries.map((entry, index) => (
                                <CreateEntryCard
                                    key={entry.id}  // React necesita key único
                                    entry={entry}
                                    index={index}
                                    totals={delivery.getEntryTotals(entry)}
                                    categories={categories}
                                    totalPrice={calculateEntryTotalPrice(entry)}
                                    onRemove={() => delivery.removeEntry(entry.id)}
                                    onQuantityChange={(value) => delivery.updateQuantity(entry.id, value)}
                                    // ... más callbacks para manejar cambios
                                />
                            ))}

                            {/* Estado vacío (cuando no hay variedades) */}
                            {delivery.entries.length === 0 && (
                                <div className="rounded-lg border border-dashed py-8 text-center text-muted-foreground">
                                    <p>No has seleccionado ninguna variedad</p>
                                    <p className="text-sm">
                                        Selecciona de las variedades registradas o agrega manualmente
                                    </p>
                                </div>
                            )}

                            {/* Botones de acción */}
                            <div className="flex justify-end gap-4 border-t pt-4">
                                <Button type="button" variant="outline" asChild>
                                    <Link href="/delivery-flow">
                                        <X className="mr-2 h-4 w-4" />
                                        Cancelar
                                    </Link>
                                </Button>
                                <Button 
                                    type="submit" 
                                    disabled={delivery.processing || !delivery.canSave}
                                >
                                    {delivery.processing ? 'Guardando...' : (
                                        <>
                                            <Save className="mr-2 h-4 w-4" />
                                            Guardar Entrega
                                        </>
                                    )}
                                </Button>
                            </div>
                        </>
                    )}
                </form>

                {/* DIÁLOGOS (modales) */}
                
                {/* Diálogo para crear nuevo proveedor */}
                <CreateSupplierDialog
                    open={delivery.showCreateSupplier}
                    onOpenChange={delivery.setShowCreateSupplier}
                    supplierData={delivery.newSupplier}
                    onSupplierDataChange={delivery.setNewSupplier}
                    errors={delivery.newSupplierErrors}
                    creating={delivery.creatingSupplier}
                    onSubmit={delivery.createSupplier}
                />

                {/* Diálogo cuando ya existe entrega del mismo proveedor hoy */}
                <ExistingDeliveryDialog
                    open={delivery.showExistingDeliveryDialog}
                    onOpenChange={delivery.setShowExistingDeliveryDialog}
                    delivery={delivery.existingDelivery}
                    onContinueNew={delivery.continueNewDelivery}
                    onEditExisting={delivery.editExistingDelivery}
                />
            </div>
        </AppLayout>
    );
}
```

---

## 📝 _useCreateDelivery.ts (Hook Personalizado - Explicado)

Este es el "cerebro" del formulario de creación. Un **hook personalizado** es una función que agrupa lógica reutilizable.

```typescript
// ==============================================================
// HOOK PERSONALIZADO: useCreateDelivery
// ==============================================================
// Un "hook" es una función especial de React que permite
// reutilizar lógica entre componentes.
// 
// Los hooks personalizados SIEMPRE empiezan con "use"
// ==============================================================

import { router } from '@inertiajs/react';
import { useState } from 'react';
import http from '@/lib/http';  // Cliente HTTP (axios configurado)

// Importamos tipos y utilidades
import type { Category, ExistingSpecies, ExistingVariety } from './_types';
import { createEmptyExportable, createEmptyPrices, ... } from './_utils';

// Tipos específicos para este hook
export interface Supplier {
    id: number;
    code: string;
    name: string;
    // ...
}

// Props que recibe el hook
interface UseCreateDeliveryProps {
    categories: Category[];
    existingSpecies: ExistingSpecies[];
    existingVarieties: ExistingVariety[];
}

// LA FUNCIÓN DEL HOOK
export function useCreateDelivery({
    categories,
    existingSpecies,
    existingVarieties,
}: UseCreateDeliveryProps) {
    
    // Obtenemos fecha y hora actual de Ecuador
    const ecuadorNow = getEcuadorDateTime();

    // ==============================================================
    // ESTADOS (useState)
    // ==============================================================
    // Cada useState crea una "variable de estado" que React
    // puede actualizar y que causa re-renderizado cuando cambia
    
    // Estado para el paso actual del formulario
    // Puede ser 'supplier' (buscar proveedor) o 'entry' (agregar variedades)
    const [currentStep, setCurrentStep] = useState<'supplier' | 'entry'>('supplier');
    
    // Estados para búsqueda de proveedor
    const [supplierCode, setSupplierCode] = useState('');           // Código ingresado
    const [searchingSupplier, setSearchingSupplier] = useState(false); // ¿Buscando?
    const [searchMessage, setSearchMessage] = useState('');         // Mensaje de resultado
    const [showCreateSupplier, setShowCreateSupplier] = useState(false); // ¿Mostrar diálogo?
    
    // Estados para crear nuevo proveedor
    const [newSupplier, setNewSupplier] = useState({
        code: '',
        name: '',
        email: '',
        phone: '',
        ruc: '',
    });
    const [newSupplierErrors, setNewSupplierErrors] = useState<Record<string, string>>({});
    const [creatingSupplier, setCreatingSupplier] = useState(false);
    
    // Estados de la entrega
    const [supplierId, setSupplierId] = useState('');
    const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
    const [deliveryDate, setDeliveryDate] = useState(ecuadorNow.date);
    const [deliveryTime, setDeliveryTime] = useState(ecuadorNow.time);
    
    // Estados de variedades y entradas
    const [supplierVarieties, setSupplierVarieties] = useState<SupplierVariety[]>([]);
    const [availableVarieties, setAvailableVarieties] = useState<SupplierVariety[]>([]);
    const [entries, setEntries] = useState<VarietyEntry[]>([]);
    const [entryCounter, setEntryCounter] = useState(0);
    
    // Estados generales
    const [processing, setProcessing] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    
    // ==============================================================
    // FUNCIONES
    // ==============================================================
    
    // 🔍 BUSCAR PROVEEDOR
    // Hace una petición HTTP al servidor para buscar por código
    const searchSupplier = async () => {
        // Validación: no buscar si está vacío
        if (!supplierCode.trim()) {
            setSearchMessage('Ingresa un código de proveedor para buscar.');
            return;
        }

        // Activamos indicador de carga
        setSearchingSupplier(true);
        setSearchMessage('');

        try {
            // Hacemos POST al endpoint de búsqueda
            const { data } = await http.post('/delivery-flow/search-supplier', {
                code: supplierCode.trim(),
            });

            if (data.found) {
                // Proveedor encontrado
                setSelectedSupplier(data.supplier);
                setSupplierId(data.supplier.id.toString());
                loadSupplierVarieties(data.supplier);
                
                // Si ya tiene entrega hoy, mostramos diálogo
                if (data.existing_delivery) {
                    setExistingDelivery(data.existing_delivery);
                    setShowExistingDeliveryDialog(true);
                } else {
                    // Avanzamos al siguiente paso
                    setCurrentStep('entry');
                }
            } else {
                // Proveedor no encontrado
                setSearchMessage(data.message);
                setNewSupplier(prev => ({ ...prev, code: supplierCode.trim() }));
            }
        } catch (error) {
            // Error de conexión
            setSearchMessage('Error de conexión al buscar el proveedor.');
        } finally {
            // Siempre desactivamos el indicador de carga
            setSearchingSupplier(false);
        }
    };
    
    // ➕ AGREGAR VARIEDAD DEL PROVEEDOR
    // Cuando el usuario selecciona una variedad de la lista
    const addVariety = (sv: SupplierVariety) => {
        // Creamos una nueva entrada con datos vacíos
        const newEntry: VarietyEntry = {
            id: `entry-${entryCounter}`,        // ID único temporal
            species_name: sv.species_name,      // Nombre de la especie
            variety_name: sv.variety_name,      // Nombre de la variedad
            quantity: '',                        // Cantidad vacía
            exportable: createEmptyExportable(), // Exportable vacío
            prices: createEmptyPrices(),        // Precios vacíos
            localFlower: {},                    // Flor local vacía
            exportableOpen: true,               // Sección abierta por defecto
            localFlowerOpen: false,
        };
        
        // Incrementamos el contador para el próximo ID
        setEntryCounter(prev => prev + 1);
        
        // Agregamos la entrada a la lista
        setEntries([...entries, newEntry]);
        
        // Removemos de las variedades disponibles
        setAvailableVarieties(availableVarieties.filter(v => v.id !== sv.id));
    };
    
    // 🔢 ACTUALIZAR CANTIDAD
    // Cuando el usuario cambia la cantidad de tallos
    const updateQuantity = (entryId: string, value: string) => {
        // Limpiamos el valor (quitar ceros a la izquierda)
        const cleanValue = cleanNumericValue(value);
        
        // Solo actualizamos si es un número válido
        if (isValidNumber(cleanValue)) {
            // setEntries con función para actualizar
            // .map() recorre cada entrada y retorna una nueva versión
            setEntries(
                entries.map(e =>
                    e.id === entryId    // Si es la entrada que buscamos
                        ? { ...e, quantity: cleanValue }  // Actualizamos quantity
                        : e                                // Si no, la dejamos igual
                )
            );
        }
    };
    
    // 💾 GUARDAR LA ENTREGA
    const save = () => {
        // Preparamos los datos para enviar al servidor
        const formData = {
            supplier_id: supplierId,
            delivery_date: deliveryDate,
            delivery_time: deliveryTime,
            entries: entries.map(entry => ({
                species_name: entry.species_name,
                variety_name: entry.variety_name,
                quantity: Number(entry.quantity),
                exportable: {
                    cm_40: Number(entry.exportable.cm_40) || 0,
                    // ... más tamaños
                },
                prices: {
                    price_40: Number(entry.prices.price_40) || 0,
                    // ... más precios
                },
                rejections: [/* ... */],
            })),
        };

        setProcessing(true);
        
        // Enviamos con Inertia
        router.post('/delivery-flow', formData, {
            onSuccess: () => setSuccessMessage('Entrega guardada exitosamente'),
            onFinish: () => setProcessing(false),
        });
    };
    
    // ==============================================================
    // LO QUE RETORNA EL HOOK
    // ==============================================================
    // Retornamos todos los estados y funciones que el componente necesita
    return {
        // Estados
        currentStep,
        supplierCode,
        setSupplierCode,
        searchingSupplier,
        searchMessage,
        showCreateSupplier,
        setShowCreateSupplier,
        selectedSupplier,
        deliveryDate,
        setDeliveryDate,
        deliveryTime,
        setDeliveryTime,
        entries,
        processing,
        successMessage,
        canSave: entries.length > 0 && entries.every(e => Number(e.quantity) > 0),
        
        // Funciones
        searchSupplier,
        addVariety,
        updateQuantity,
        save,
        // ... más funciones
    };
}
```

---

## 🎓 Conceptos Importantes Resumidos

### Patrones Comunes en React

| Patrón | Descripción | Ejemplo |
|--------|-------------|---------|
| **useState** | Guardar y cambiar valores | `const [name, setName] = useState('')` |
| **Props** | Pasar datos a componentes | `<Component data={myData} />` |
| **map()** | Renderizar listas | `items.map(item => <Item key={item.id} />)` |
| **Eventos** | Responder a acciones | `onClick={handleClick}` |
| **Condicional** | Mostrar/ocultar | `{condition && <Component />}` |

### Sintaxis TypeScript

| Sintaxis | Significado |
|----------|-------------|
| `string` | Texto |
| `number` | Número |
| `boolean` | Verdadero/Falso |
| `Type[]` | Array de Type |
| `Type \| null` | Type o null |
| `prop?: Type` | Propiedad opcional |
| `Record<string, Type>` | Objeto con claves string |

### Inertia.js

| Función | Uso |
|---------|-----|
| `router.visit(url)` | Navegar a otra página |
| `router.post(url, data)` | Enviar datos (crear) |
| `router.put(url, data)` | Enviar datos (actualizar) |
| `router.delete(url)` | Eliminar |
| `<Link href={url}>` | Enlace de navegación |
| `<Head title="...">` | Cambiar título de página |

---

## 💡 Tips para Aprender

1. **Lee el código de arriba hacia abajo** - Los imports van primero, luego types, luego la función
2. **Busca los useState** - Son el "estado" del componente
3. **Busca las funciones handle** - Son los "manejadores de eventos"
4. **Sigue el flujo de datos** - Props entran → Estado interno → Render
5. **Usa console.log** - Para ver qué valores tienen las variables

¡Espero que esta guía te ayude a entender mejor React con TypeScript e Inertia! 🚀

