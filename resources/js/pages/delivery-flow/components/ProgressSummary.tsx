/**
 * COMPONENTE: ProgressSummary
 * 
 * Muestra un resumen visual del progreso de clasificación de una entrega.
 * 
 * Este componente presenta 6 métricas clave en tarjetas:
 * 1. Total Exportable - Tallos aptos para exportación
 * 2. Flor Local - Tallos destinados al mercado local (rechazos)
 * 3. Total Clasificado - Suma de exportables + locales
 * 4. Restante - Tallos pendientes de clasificar
 * 5. Progreso - Porcentaje de clasificación completa
 * 6. Total Precio - Valor en dólares de los exportables
 * 
 * Indicadores visuales:
 * - Verde: Todo está bien (100% completo, sin restantes)
 * - Amarillo: En proceso (hay tallos sin clasificar)
 * - Rojo: Error (se clasificó más de lo recibido)
 */

import type { GlobalTotals } from '../_types';

/**
 * Props del componente
 */
interface ProgressSummaryProps {
    totals: GlobalTotals;  // Totales calculados de toda la entrega
}

export function ProgressSummary({ totals }: ProgressSummaryProps) {
    return (
        // Grid responsive: 3 columnas en tablet, 6 en desktop
        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
            
            {/* ========================================================
                TARJETA 1: Total Exportable
                Muestra cuántos tallos son aptos para exportación
            ======================================================== */}
            <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-center">
                <p className="text-xs text-green-600">Exportable</p>
                <p className="text-2xl font-bold text-green-700">{totals.totalExportable}</p>
            </div>

            {/* ========================================================
                TARJETA 2: Flor Local
                Muestra cuántos tallos van al mercado local (rechazos)
            ======================================================== */}
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-center">
                <p className="text-xs text-amber-600">Flor Local</p>
                <p className="text-2xl font-bold text-amber-700">{totals.totalLocal}</p>
            </div>

            {/* ========================================================
                TARJETA 3: Total Clasificado
                Suma de exportables + locales (debe ser <= cantidad recibida)
            ======================================================== */}
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-center">
                <p className="text-xs text-blue-600">Clasificado</p>
                <p className="text-2xl font-bold text-blue-700">{totals.totalClassified}</p>
            </div>

            {/* ========================================================
                TARJETA 4: Restante
                Tallos que aún faltan por clasificar
                
                Estados:
                - Verde (0): Perfecto, todo clasificado
                - Amarillo (>0): Faltan tallos por clasificar
                - Rojo (<0): ERROR - se clasificó más de lo recibido
            ======================================================== */}
            <div
                className={`rounded-lg border p-3 text-center ${
                    totals.remaining === 0
                        ? 'border-green-500 bg-green-50'      // Todo clasificado
                        : totals.remaining < 0
                          ? 'border-red-500 bg-red-50'        // Error: excedido
                          : 'border-amber-500 bg-amber-50'    // Falta clasificar
                }`}
            >
                <p className="text-xs text-muted-foreground">Restante</p>
                <p
                    className={`text-2xl font-bold ${
                        totals.remaining === 0
                            ? 'text-green-600'
                            : totals.remaining < 0
                              ? 'text-red-600'
                              : 'text-amber-600'
                    }`}
                >
                    {totals.remaining}
                </p>
                {/* Advertencia si hay error */}
                {totals.remaining < 0 && <p className="mt-1 text-xs text-red-600">⚠️ Excede el total</p>}
            </div>

            {/* ========================================================
                TARJETA 5: Progreso
                Porcentaje de clasificación (0-100%)
                
                Incluye:
                - Barra de progreso visual
                - Porcentaje numérico
                - Advertencia si excede 100%
            ======================================================== */}
            <div
                className={`rounded-lg border p-3 text-center ${
                    totals.progress > 100
                        ? 'border-red-500 bg-red-50'          // Error: >100%
                        : totals.progress === 100
                          ? 'border-green-500 bg-green-50'    // Completo: 100%
                          : ''                                // En proceso: 0-99%
                }`}
            >
                <p className="text-xs text-muted-foreground">Progreso</p>
                <div className="mt-1 flex items-center justify-center gap-2">
                    {/* Barra de progreso */}
                    <div className="h-3 w-16 overflow-hidden rounded-full bg-secondary">
                        <div
                            className={`h-full transition-all ${
                                totals.progress > 100
                                    ? 'bg-red-500'      // Rojo si excede
                                    : totals.progress === 100
                                      ? 'bg-green-500'  // Verde si completo
                                      : 'bg-primary'    // Azul si en proceso
                            }`}
                            // Limitar al 100% visualmente
                            style={{ width: `${Math.min(totals.progress, 100)}%` }}
                        />
                    </div>
                    {/* Porcentaje numérico */}
                    <span className={`text-lg font-bold ${totals.progress > 100 ? 'text-red-600' : ''}`}>
                        {totals.progress}%
                    </span>
                </div>
                {/* Advertencia si excede 100% */}
                {totals.progress > 100 && <p className="mt-1 text-xs text-red-600">⚠️ Se sobrepasó del 100%</p>}
            </div>

            {/* ========================================================
                TARJETA 6: Total Precio
                Valor total en dólares de los tallos exportables
                
                Cálculo: Suma de (cantidad × precio) para cada tamaño
                Se destaca visualmente por ser la métrica financiera clave
            ======================================================== */}
            <div className="rounded-lg border-2 border-emerald-400 bg-gradient-to-br from-emerald-50 to-green-50 p-3 text-center shadow-sm">
                <p className="text-xs font-medium text-emerald-600">💰 Total Exportable</p>
                <p className="text-2xl font-bold text-emerald-700">${totals.totalPrice.toFixed(2)}</p>
            </div>
        </div>
    );
}

