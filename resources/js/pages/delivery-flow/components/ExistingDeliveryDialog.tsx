import {
    AlertTriangle,
    CalendarClock,
    Flower,
    Layers,
    Pencil,
    PlusCircle,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';


import { formatDateEC } from '../_utils';

interface ExistingDelivery {
    id: number;
    entry_datetime: string;
    total_entries: number;
    total_stems: number;
}

interface ExistingDeliveryDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    delivery: ExistingDelivery | null;
    onContinueNew: () => void;
    onEditExisting: () => void;
}

export function ExistingDeliveryDialog({
    open,
    onOpenChange,
    delivery,
    onContinueNew,
    onEditExisting,
}: ExistingDeliveryDialogProps) {
    if (!delivery) return null;

    const formattedDate = formatDateEC(delivery.entry_datetime);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[520px]">
                <DialogHeader className="space-y-2">
                    <DialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-amber-500" />
                        Entrega existente detectada
                    </DialogTitle>
                    <DialogDescription>
                        Este proveedor ya registró una entrega hoy. Elige cómo
                        deseas continuar.
                    </DialogDescription>
                </DialogHeader>

                {/* Info Card */}
                <div className="space-y-4 py-4">
                    <div className="rounded-xl border bg-muted/40 p-4">
                        <div className="grid gap-3 text-sm">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <CalendarClock className="h-4 w-4" />
                                    Fecha y hora
                                </div>
                                <span className="font-medium">
                                    {formattedDate.short}
                                </span>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Layers className="h-4 w-4" />
                                    Variedades ingresadas
                                </div>
                                <span className="font-medium">
                                    {delivery.total_entries}
                                </span>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Flower className="h-4 w-4" />
                                    Total de tallos
                                </div>
                                <span className="font-medium">
                                    {delivery.total_stems}
                                </span>
                            </div>
                        </div>
                    </div>

                    <p className="text-sm text-muted-foreground">
                        👉 Puedes <strong>editar la entrega existente</strong>{' '}
                        para añadir más productos, o{' '}
                        <strong>crear una nueva entrega</strong> si deseas
                        manejarla por separado.
                    </p>
                </div>

                {/* Actions */}
                <DialogFooter className="flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onContinueNew}
                        className="w-full sm:w-auto"
                    >
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Nueva entrega
                    </Button>

                    <Button
                        type="button"
                        onClick={onEditExisting}
                        className="w-full sm:w-auto"
                    >
                        <Pencil className="mr-2 h-4 w-4" />
                        Editar entrega existente
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
