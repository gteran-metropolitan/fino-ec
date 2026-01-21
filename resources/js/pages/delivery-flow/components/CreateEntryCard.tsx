/**
 * COMPONENTE: CreateEntryCard
 * 
 * Tarjeta para crear/editar una entrada de producto en una entrega.
 * 
 * Este componente muestra:
 * 1. Información básica (especie, variedad, cantidad)
 * 2. Sección expandible de "Exportable" (clasificación por tamaños)
 * 3. Sección expandible de "Flor Local" (rechazos por categorías)
 * 
 * Conceptos clave:
 * - Una "entrada" representa una variedad específica en una entrega
 * - Los tallos se clasifican en dos grupos:
 *   a) Exportables: Por tamaño (40cm, 50cm, 60cm, etc.) con precio
 *   b) Flor Local: Rechazos por categorías (defectos, tamaño pequeño, etc.)
 * - El usuario debe clasificar todos los tallos recibidos
 * - El componente muestra un resumen en tiempo real de lo que falta por clasificar
 */

import { Check, ChevronDown, ChevronUp, Flower2, Ruler, Trash2 } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import type { Category } from '../_types';
import { STEM_SIZES } from '../_utils';

// ============================================================================
// TIPOS DE DATOS DEL COMPONENTE
// ============================================================================

/**
 * Entrada de variedad - Datos de una variedad mientras se está creando
 */
interface VarietyEntry {
    id: string;                              // ID temporal (único para React keys)
    species_name: string;                    // Nombre de la especie (ej: "Rosa")
    variety_name: string;                    // Nombre de la variedad (ej: "Freedom")
    quantity: string;                        // Cantidad recibida (como string para permitir edición)
    exportable: Record<string, string>;      // Cantidades por tamaño (cm_40, cm_50, etc.)
    prices: Record<string, string>;          // Precios por tamaño (price_40, price_50, etc.)
    localFlower: Record<string, string>;     // Rechazos por categoría (cat_1, sub_2, etc.)
    exportableOpen: boolean;                 // ¿Sección exportable expandida?
    localFlowerOpen: boolean;                // ¿Sección flor local expandida?
}

/**
 * Totales de una entrada - Resumen calculado en tiempo real
 */
interface EntryTotals {
    quantity: number;                        // Cantidad total recibida
    totalExportable: number;                 // Total clasificado como exportable
    totalLocal: number;                      // Total clasificado como flor local
    remaining: number;                       // Restante por clasificar (puede ser negativo)
}

/**
 * Props del componente - Todos los datos y callbacks necesarios
 */
interface CreateEntryCardProps {
    entry: VarietyEntry;                     // La entrada que se está editando
    index: number;                           // Posición en la lista (para el número de tarjeta)
    totals: EntryTotals;                     // Totales calculados
    categories: Category[];                  // Categorías de rechazo disponibles
    totalPrice: number;                      // Precio total calculado de exportables
    
    // Callbacks para actualizar datos
    onRemove: () => void;                                    // Eliminar esta entrada
    onQuantityChange: (value: string) => void;               // Cambiar cantidad recibida
    onExportableChange: (key: string, value: string) => void; // Cambiar cantidad de un tamaño
    onPriceChange: (key: string, value: string) => void;     // Cambiar precio de un tamaño
    onLocalFlowerChange: (key: string, value: string) => void; // Cambiar cantidad de rechazo
    onToggleExportable: () => void;                          // Expandir/colapsar exportable
    onToggleLocalFlower: () => void;                         // Expandir/colapsar flor local
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export function CreateEntryCard({
    entry,
    index,
    totals,
    categories,
    totalPrice,
    onRemove,
    onQuantityChange,
    onExportableChange,
    onPriceChange,
    onLocalFlowerChange,
    onToggleExportable,
    onToggleLocalFlower,
}: CreateEntryCardProps) {
    return (
        <Card className="overflow-hidden">
            {/* ============================================================
                ENCABEZADO: Especie, Variedad, Cantidad y botón Eliminar
            ============================================================ */}
            <div className="flex items-center justify-between border-b bg-muted/50 px-4 py-3">
                <div className="flex items-center gap-4">
                    {/* Número de tarjeta */}
                    <Badge variant="secondary" className="text-xs">
                        #{index + 1}
                    </Badge>
                    
                    {/* Especie y Variedad */}
                    <div>
                        <span className="font-semibold">{entry.species_name}</span>
                        <span className="mx-2 text-muted-foreground">-</span>
                        <span>{entry.variety_name}</span>
                    </div>
                </div>
                
                <div className="flex items-center gap-4">
                    {/* Input de cantidad recibida */}
                    <div className="flex items-center gap-2">
                        <Label className="text-sm">Cantidad:</Label>
                        <Input
                            type="text"
                            inputMode="numeric"
                            value={entry.quantity || ''}
                            onChange={(e) => onQuantityChange(e.target.value)}
                            className="h-8 w-24"
                            placeholder="0"
                        />
                    </div>
                    
                    {/* Botón eliminar */}
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={onRemove}
                        className="text-destructive hover:text-destructive"
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* ============================================================
                RESUMEN: Muestra progreso de clasificación en tiempo real
                Solo se muestra si hay una cantidad ingresada
            ============================================================ */}
            {entry.quantity && Number(entry.quantity) > 0 && (
                <div className="flex gap-4 border-b bg-muted/20 px-4 py-2 text-sm">
                    {/* Total exportable (verde) */}
                    <span>
                        Exp: <strong className="text-green-600">{totals.totalExportable}</strong>
                    </span>
                    
                    {/* Total flor local (amarillo) */}
                    <span>
                        Local: <strong className="text-amber-600">{totals.totalLocal}</strong>
                    </span>
                    
                    {/* Restante por clasificar
                        - Verde si está completo (0)
                        - Rojo si se excedió (negativo)
                        - Amarillo si falta clasificar (positivo)
                    */}
                    <span
                        className={
                            totals.remaining === 0
                                ? 'text-green-600'
                                : totals.remaining < 0
                                  ? 'text-destructive'
                                  : 'text-amber-600'
                        }
                    >
                        Restante: <strong>{totals.remaining}</strong>
                        {totals.remaining === 0 && <Check className="ml-1 inline h-4 w-4" />}
                    </span>
                </div>
            )}

            {/* ============================================================
                SECCIÓN EXPORTABLE: Clasificación por tamaños con precios
                
                Los tallos exportables se clasifican por su longitud:
                - 40cm, 50cm, 60cm, 70cm, 80cm, 90cm, 100cm, 110cm, 120cm
                - Sobrante (tallos que no cumplen medidas estándar)
                
                Para cada tamaño se ingresa:
                1. Cantidad de tallos
                2. Precio por tallo
                3. Se calcula automáticamente el subtotal
                
                Al final se muestra el precio total de todos los exportables
            ============================================================ */}
            <Collapsible open={entry.exportableOpen} onOpenChange={onToggleExportable}>
                {/* Trigger: Barra clickeable para expandir/colapsar */}
                <CollapsibleTrigger asChild>
                    <div className="flex cursor-pointer items-center justify-between border-b px-4 py-2 hover:bg-muted/30">
                        <div className="flex items-center gap-2">
                            <Ruler className="h-4 w-4 text-green-600" />
                            <span className="text-sm font-medium">Exportable</span>
                            {/* Badge con total si hay tallos clasificados */}
                            {totals.totalExportable > 0 && (
                                <Badge className="bg-green-100 text-xs text-green-700">{totals.totalExportable}</Badge>
                            )}
                        </div>
                        {/* Icono de flecha */}
                        {entry.exportableOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </div>
                </CollapsibleTrigger>
                
                {/* Contenido expandible */}
                <CollapsibleContent>
                    <div className="space-y-4 border-b p-4">
                        {/* Grid de inputs para cada tamaño
                            - Responsive: 5 columnas en mobile, 10 en desktop
                            - Cada celda contiene: tamaño, cantidad, precio, subtotal
                        */}
                        <div className="grid gap-2 sm:grid-cols-5 lg:grid-cols-10">
                            {STEM_SIZES.map(({ key, priceKey, label, unit }) => {
                                // Calcular subtotal: cantidad × precio
                                const cantidadTallos = Number(entry.exportable[key]) || 0;
                                const precioPorTallo = Number(entry.prices[priceKey]) || 0;
                                const subtotal = cantidadTallos * precioPorTallo;

                                return (
                                    <div key={key} className="space-y-1 rounded-lg border bg-muted/30 p-2">
                                        {/* Etiqueta del tamaño */}
                                        <Label className="block text-center text-xs font-semibold">
                                            {label}
                                            {unit && <span className="text-muted-foreground"> {unit}</span>}
                                        </Label>
                                        
                                        {/* Input de cantidad */}
                                        <Input
                                            type="text"
                                            inputMode="numeric"
                                            value={entry.exportable[key] || ''}
                                            onChange={(e) => onExportableChange(key, e.target.value)}
                                            className="h-8 text-center text-sm"
                                            placeholder="0"
                                        />
                                        
                                        {/* Input de precio */}
                                        <div className="border-t pt-1">
                                            <Label className="block text-center text-[10px] text-muted-foreground">
                                                Precio $
                                            </Label>
                                            <Input
                                                type="text"
                                                inputMode="decimal"
                                                value={entry.prices[priceKey] || ''}
                                                onChange={(e) => onPriceChange(priceKey, e.target.value)}
                                                className="h-7 text-center text-xs"
                                                placeholder="0.00"
                                            />
                                        </div>
                                        
                                        {/* Subtotal calculado */}
                                        {subtotal > 0 && (
                                            <div className="border-t pt-1 text-center">
                                                <span className="text-[10px] font-medium text-green-600">
                                                    ${subtotal.toFixed(2)}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Total de precios (solo si hay algún precio) */}
                        {totalPrice > 0 && (
                            <div className="flex justify-end border-t pt-3">
                                <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-2 text-right">
                                    <span className="block text-xs text-green-600">Total Exportable</span>
                                    <span className="text-xl font-bold text-green-700">${totalPrice.toFixed(2)}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </CollapsibleContent>
            </Collapsible>

            {/* ============================================================
                SECCIÓN FLOR LOCAL: Clasificación de rechazos
                
                Los tallos que no son exportables se clasifican como "Flor Local"
                según la razón del rechazo:
                
                - Categorías: Grupos principales de rechazo (ej: Defectos, Daños)
                - Subcategorías: Clasificación detallada dentro de cada categoría
                
                Para cada categoría/subcategoría se puede ingresar:
                1. Cantidad de tallos rechazados
                2. Detalle adicional (opcional)
                
                Si una categoría tiene subcategorías, solo se pueden ingresar
                cantidades en las subcategorías (no en la categoría principal).
            ============================================================ */}
            <Collapsible open={entry.localFlowerOpen} onOpenChange={onToggleLocalFlower}>
                {/* Trigger: Barra clickeable para expandir/colapsar */}
                <CollapsibleTrigger asChild>
                    <div className="flex cursor-pointer items-center justify-between px-4 py-2 hover:bg-muted/30">
                        <div className="flex items-center gap-2">
                            <Flower2 className="h-4 w-4 text-amber-600" />
                            <span className="text-sm font-medium">Flor Local</span>
                            {/* Badge con total si hay tallos clasificados */}
                            {totals.totalLocal > 0 && (
                                <Badge className="bg-amber-100 text-xs text-amber-700">{totals.totalLocal}</Badge>
                            )}
                        </div>
                        {/* Icono de flecha */}
                        {entry.localFlowerOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </div>
                </CollapsibleTrigger>
                
                {/* Contenido expandible */}
                <CollapsibleContent>
                    <div className="space-y-4 p-4">
                        {/* Verificar si hay categorías configuradas */}
                        {categories.length === 0 ? (
                            <p className="py-4 text-center text-sm text-muted-foreground">
                                No hay categorías de rechazo configuradas
                            </p>
                        ) : (
                            // Iterar cada categoría de rechazo
                            categories.map((category) => (
                                <div key={category.id} className="space-y-2">
                                    {/* Nombre de la categoría */}
                                    <h4 className="text-sm font-medium">{category.name}</h4>

                                    {/* Caso 1: Categoría SIN subcategorías
                                        El usuario ingresa directamente en la categoría */}
                                    {!category.active_subcategories || category.active_subcategories.length === 0 ? (
                                        <div className="ml-4 grid gap-2 sm:grid-cols-2">
                                            {/* Input de cantidad */}
                                            <Input
                                                type="text"
                                                inputMode="numeric"
                                                value={entry.localFlower[`cat_${category.id}`] || ''}
                                                onChange={(e) =>
                                                    onLocalFlowerChange(`cat_${category.id}`, e.target.value)
                                                }
                                                placeholder="Cantidad"
                                                className="h-8"
                                            />
                                            {/* Input de detalle opcional */}
                                            <Input
                                                type="text"
                                                value={entry.localFlower[`cat_${category.id}_detail`] || ''}
                                                onChange={(e) =>
                                                    onLocalFlowerChange(`cat_${category.id}_detail`, e.target.value)
                                                }
                                                placeholder="Detalle (opcional)"
                                                className="h-8 uppercase"
                                            />
                                        </div>
                                    ) : (
                                        /* Caso 2: Categoría CON subcategorías
                                           El usuario ingresa en cada subcategoría */
                                        <div className="ml-4 space-y-2">
                                            {category.active_subcategories.map((subcategory) => (
                                                <div key={subcategory.id} className="grid items-center gap-2 sm:grid-cols-3">
                                                    {/* Nombre de la subcategoría */}
                                                    <span className="text-sm text-muted-foreground">{subcategory.name}</span>
                                                    
                                                    {/* Input de cantidad */}
                                                    <Input
                                                        type="text"
                                                        inputMode="numeric"
                                                        value={entry.localFlower[`sub_${subcategory.id}`] || ''}
                                                        onChange={(e) =>
                                                            onLocalFlowerChange(`sub_${subcategory.id}`, e.target.value)
                                                        }
                                                        placeholder="Cantidad"
                                                        className="h-8"
                                                    />
                                                    
                                                    {/* Input de detalle opcional */}
                                                    <Input
                                                        type="text"
                                                        value={entry.localFlower[`sub_${subcategory.id}_detail`] || ''}
                                                        onChange={(e) =>
                                                            onLocalFlowerChange(`sub_${subcategory.id}_detail`, e.target.value)
                                                        }
                                                        placeholder="Detalle"
                                                        className="h-8 uppercase"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </CollapsibleContent>
            </Collapsible>
        </Card>
    );
}

