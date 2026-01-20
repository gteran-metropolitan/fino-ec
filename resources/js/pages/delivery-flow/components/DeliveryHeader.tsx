import { Truck } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import type { GlobalTotals, ProductEntryGroup } from '../_types';
import { formatDateEC } from '../_utils';

interface DeliveryHeaderProps {
    group: ProductEntryGroup;
    entriesCount: number;
    globalTotals: GlobalTotals;
}

export function DeliveryHeader({ group, entriesCount, globalTotals }: DeliveryHeaderProps) {
    const formattedDate = formatDateEC(group.entry_datetime);

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-2">
                    <Truck className="h-5 w-5 text-muted-foreground" />
                    <CardTitle>Información de la Entrega</CardTitle>
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div>
                        <p className="text-xs text-muted-foreground">Proveedor</p>
                        <p className="font-medium">{group.supplier.name}</p>
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground">Fecha de Entrega</p>
                        <p className="font-medium">{formattedDate.short}</p>
                        <p className="text-xs text-muted-foreground capitalize">{formattedDate.long}</p>
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground">Total Variedades</p>
                        <p className="font-medium">{entriesCount}</p>
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground">Total Tallos</p>
                        <p className="text-2xl font-bold text-primary">{globalTotals.totalQuantity}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

