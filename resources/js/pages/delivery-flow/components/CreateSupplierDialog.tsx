import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface NewSupplierData {
    code: string;
    name: string;
    email: string;
    phone: string;
    ruc: string;
}

interface CreateSupplierDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    supplierData: NewSupplierData;
    onSupplierDataChange: (data: NewSupplierData) => void;
    errors: Record<string, string>;
    creating: boolean;
    onSubmit: () => void;
}

export function CreateSupplierDialog({
    open,
    onOpenChange,
    supplierData,
    onSupplierDataChange,
    errors,
    creating,
    onSubmit,
}: CreateSupplierDialogProps) {
    const handleChange = (field: keyof NewSupplierData, value: string) => {
        onSupplierDataChange({ ...supplierData, [field]: value });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Crear Nuevo Proveedor</DialogTitle>
                    <DialogDescription>
                        Completa los datos del nuevo proveedor para registrarlo en el sistema.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="new_code">Código *</Label>
                        <Input
                            id="new_code"
                            value={supplierData.code}
                            onChange={(e) => handleChange('code', e.target.value.toUpperCase())}
                            className="uppercase"
                        />
                        {errors.code && <p className="text-xs text-destructive">{errors.code}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="new_name">Nombre *</Label>
                        <Input
                            id="new_name"
                            value={supplierData.name}
                            onChange={(e) => handleChange('name', e.target.value)}
                        />
                        {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="new_email">Correo *</Label>
                        <Input
                            id="new_email"
                            type="email"
                            value={supplierData.email}
                            onChange={(e) => handleChange('email', e.target.value)}
                        />
                        {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="new_phone">Celular * (10 dígitos)</Label>
                            <Input
                                id="new_phone"
                                type="text"
                                inputMode="numeric"
                                value={supplierData.phone}
                                onChange={(e) => handleChange('phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
                                maxLength={10}
                            />
                            {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="new_ruc">RUC * (13 dígitos)</Label>
                            <Input
                                id="new_ruc"
                                type="text"
                                inputMode="numeric"
                                value={supplierData.ruc}
                                onChange={(e) => handleChange('ruc', e.target.value.replace(/\D/g, '').slice(0, 13))}
                                maxLength={13}
                            />
                            {errors.ruc && <p className="text-xs text-destructive">{errors.ruc}</p>}
                        </div>
                    </div>
                    {errors.general && (
                        <div className="rounded-md border border-destructive bg-destructive/10 p-3 text-sm text-destructive">
                            {errors.general}
                        </div>
                    )}
                </div>
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                        Cancelar
                    </Button>
                    <Button type="button" onClick={onSubmit} disabled={creating}>
                        {creating ? 'Creando...' : 'Crear Proveedor'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

