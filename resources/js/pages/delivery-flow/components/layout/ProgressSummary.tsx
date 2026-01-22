import { usePage } from '@inertiajs/react';

import type { SharedData } from '@/types';

import type { GlobalTotals } from '../../_types';

interface ProgressSummaryProps {
    totals: GlobalTotals;
}

export function ProgressSummary({ totals }: ProgressSummaryProps) {
    // Si es digitador, no mostrar este componente
    const { isDataEntryUser } = usePage<SharedData>().props;

    if (isDataEntryUser) {
        return null;
    }

    return (
        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {/* Exportable */}
            <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-center">
                <p className="text-xs text-green-600">Exportable</p>
                <p className="text-2xl font-bold text-green-700">{totals.totalExportable}</p>
            </div>

            {/* Flor Local */}
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-center">
                <p className="text-xs text-amber-600">Flor Local</p>
                <p className="text-2xl font-bold text-amber-700">{totals.totalLocal}</p>
            </div>

            {/* Clasificado */}
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-center">
                <p className="text-xs text-blue-600">Clasificado</p>
                <p className="text-2xl font-bold text-blue-700">{totals.totalClassified}</p>
            </div>

            {/* Restante */}
            <div
                className={`rounded-lg border p-3 text-center ${
                    totals.remaining === 0
                        ? 'border-green-500 bg-green-50'
                        : totals.remaining < 0
                          ? 'border-red-500 bg-red-50'
                          : 'border-amber-500 bg-amber-50'
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
                {totals.remaining < 0 && <p className="mt-1 text-xs text-red-600">⚠️ Excede el total</p>}
            </div>

            {/* Progreso */}
            <div
                className={`rounded-lg border p-3 text-center ${
                    totals.progress > 100
                        ? 'border-red-500 bg-red-50'
                        : totals.progress === 100
                          ? 'border-green-500 bg-green-50'
                          : ''
                }`}
            >
                <p className="text-xs text-muted-foreground">Progreso</p>
                <div className="mt-1 flex items-center justify-center gap-2">
                    <div className="h-3 w-16 overflow-hidden rounded-full bg-secondary">
                        <div
                            className={`h-full transition-all ${
                                totals.progress > 100
                                    ? 'bg-red-500'
                                    : totals.progress === 100
                                      ? 'bg-green-500'
                                      : 'bg-primary'
                            }`}
                            style={{ width: `${Math.min(totals.progress, 100)}%` }}
                        />
                    </div>
                    <span className={`text-lg font-bold ${totals.progress > 100 ? 'text-red-600' : ''}`}>
                        {totals.progress}%
                    </span>
                </div>
                {totals.progress > 100 && <p className="mt-1 text-xs text-red-600">⚠️ Se sobrepasó del 100%</p>}
            </div>

            {/* Total Precio */}
            <div className="rounded-lg border-2 border-emerald-400 bg-gradient-to-br from-emerald-50 to-green-50 p-3 text-center shadow-sm">
                <p className="text-xs font-medium text-emerald-600">💰 Total Exportable</p>
                <p className="text-2xl font-bold text-emerald-700">${totals.totalPrice.toFixed(2)}</p>
            </div>
        </div>
    );
}

