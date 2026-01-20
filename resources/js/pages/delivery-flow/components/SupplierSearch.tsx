import { Search, UserPlus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface SupplierSearchProps {
    supplierCode: string;
    onCodeChange: (code: string) => void;
    onSearch: () => void;
    searching: boolean;
    searchMessage: string;
    onShowCreateSupplier: () => void;
}

export function SupplierSearch({
    supplierCode,
    onCodeChange,
    onSearch,
    searching,
    searchMessage,
    onShowCreateSupplier,
}: SupplierSearchProps) {
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            onSearch();
        }
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-2">
                    <Search className="h-5 w-5 text-muted-foreground" />
                    <CardTitle>Paso 1: Buscar Proveedor</CardTitle>
                </div>
                <CardDescription>Ingresa el código del proveedor para buscarlo en el sistema</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex gap-4">
                    <div className="flex-1 space-y-2">
                        <Label htmlFor="supplierCode">Código del Proveedor</Label>
                        <Input
                            id="supplierCode"
                            type="text"
                            value={supplierCode}
                            onChange={(e) => onCodeChange(e.target.value.toUpperCase())}
                            onKeyDown={handleKeyDown}
                            placeholder="Ej: AUTO1016"
                            className="uppercase"
                        />
                    </div>
                    <div className="flex items-end">
                        <Button type="button" onClick={onSearch} disabled={searching}>
                            {searching ? 'Buscando...' : 'Buscar'}
                        </Button>
                    </div>
                </div>

                {searchMessage && (
                    <div className="space-y-3">
                        <p className="text-sm text-amber-600">{searchMessage}</p>
                        <Button type="button" variant="outline" onClick={onShowCreateSupplier} className="gap-2">
                            <UserPlus className="h-4 w-4" />
                            Sí, crear nuevo proveedor
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

