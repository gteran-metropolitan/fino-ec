import { Head, Link, router } from '@inertiajs/react';
import {
    Check,
    ChevronDown,
    ChevronUp,
    Flower2,
    Plus,
    Ruler,
    Save,
    Search,
    Trash2,
    Truck,
    UserPlus,
    X,
} from 'lucide-react';
import { FormEventHandler, useState } from 'react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
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
import AppLayout from '@/layouts/app-layout';
import http from '@/lib/http';
import { type BreadcrumbItem } from '@/types';

interface SupplierVariety {
    id: number;
    species_id: number;
    species_name: string;
    variety_id: number;
    variety_name: string;
}

interface Supplier {
    id: number;
    code: string;
    name: string;
    email?: string;
    phone?: string;
    ruc?: string;
    supplier_varieties?: {
        id: number;
        species: { id: number; name: string };
        variety: { id: number; name: string };
    }[];
}

interface Subcategory {
    id: number;
    name: string;
    description: string | null;
}

interface Category {
    id: number;
    name: string;
    description: string | null;
    active_subcategories: Subcategory[];
}

interface ExistingSpecies {
    id: number;
    name: string;
}

interface ExistingVariety {
    id: number;
    name: string;
    species_id: number;
}

// Interfaz para entrega existente del día
interface ExistingDelivery {
    id: number;
    entry_datetime: string;
    total_entries: number;
    total_stems: number;
}

// Estructura para cada variedad ingresada con su clasificación
interface VarietyEntry {
    id: string; // ID único local
    species_name: string;
    variety_name: string;
    quantity: string;
    // Clasificación exportable
    exportable: {
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
    };
    // Flor local (por categoría/subcategoría)
    localFlower: Record<string, string>;
    // Estados de secciones expandidas
    exportableOpen: boolean;
    localFlowerOpen: boolean;
}

interface Props {
    categories: Category[];
    existingSpecies: ExistingSpecies[];
    existingVarieties: ExistingVariety[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Panel', href: '/dashboard' },
    { title: 'Entrega y Postcosecha', href: '/delivery-flow' },
    { title: 'Nueva Entrega', href: '/delivery-flow/create' },
];

const stemSizes = [
    { key: 'cm_40', label: '40', unit: 'cm' },
    { key: 'cm_50', label: '50', unit: 'cm' },
    { key: 'cm_60', label: '60', unit: 'cm' },
    { key: 'cm_70', label: '70', unit: 'cm' },
    { key: 'cm_80', label: '80', unit: 'cm' },
    { key: 'cm_90', label: '90', unit: 'cm' },
    { key: 'cm_100', label: '100', unit: 'cm' },
    { key: 'cm_110', label: '110', unit: 'cm' },
    { key: 'cm_120', label: '120', unit: 'cm' },
    { key: 'sobrante', label: 'Sobrante', unit: '' },
];

// Obtener fecha y hora de Ecuador
const getEcuadorDateTime = () => {
    const now = new Date();
    const ecuadorOffset = -5 * 60;
    const localOffset = now.getTimezoneOffset();
    const ecuadorTime = new Date(
        now.getTime() + (localOffset + ecuadorOffset) * 60000,
    );
    return {
        date: ecuadorTime.toISOString().split('T')[0],
        time: ecuadorTime.toTimeString().slice(0, 5),
    };
};

const createEmptyExportable = () => ({
    cm_40: '',
    cm_50: '',
    cm_60: '',
    cm_70: '',
    cm_80: '',
    cm_90: '',
    cm_100: '',
    cm_110: '',
    cm_120: '',
    sobrante: '',
});

export default function CreateDeliveryFlow({ categories, existingSpecies = [], existingVarieties = [] }: Props) {
    const ecuadorNow = getEcuadorDateTime();

    // Paso actual del flujo
    const [currentStep, setCurrentStep] = useState<'supplier' | 'entry'>(
        'supplier',
    );

    // Búsqueda de proveedor
    const [supplierCode, setSupplierCode] = useState('');
    const [searchingSupplier, setSearchingSupplier] = useState(false);
    const [searchMessage, setSearchMessage] = useState('');
    const [showCreateSupplier, setShowCreateSupplier] = useState(false);

    // Datos del nuevo proveedor
    const [newSupplier, setNewSupplier] = useState({
        code: '',
        name: '',
        email: '',
        phone: '',
        ruc: '',
    });
    const [newSupplierErrors, setNewSupplierErrors] = useState<
        Record<string, string>
    >({});
    const [creatingSupplier, setCreatingSupplier] = useState(false);

    // Datos básicos de la entrega
    const [supplierId, setSupplierId] = useState('');
    const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(
        null,
    );
    const [deliveryDate, setDeliveryDate] = useState(ecuadorNow.date);
    const [deliveryTime, setDeliveryTime] = useState(ecuadorNow.time);

    // Variedades del proveedor
    const [supplierVarieties, setSupplierVarieties] = useState<
        SupplierVariety[]
    >([]);
    const [availableVarieties, setAvailableVarieties] = useState<
        SupplierVariety[]
    >([]);

    // Entradas de variedades con clasificación
    const [entries, setEntries] = useState<VarietyEntry[]>([]);

    const [processing, setProcessing] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    // Estado para entrega existente del día
    const [existingDelivery, setExistingDelivery] = useState<ExistingDelivery | null>(null);
    const [showExistingDeliveryDialog, setShowExistingDeliveryDialog] = useState(false);

    // Estado para agregar variedad manual
    const [newSpeciesName, setNewSpeciesName] = useState('');
    const [newVarietyName, setNewVarietyName] = useState('');

    // Estados para autocompletado
    const [showSpeciesSuggestions, setShowSpeciesSuggestions] = useState(false);
    const [showVarietySuggestions, setShowVarietySuggestions] = useState(false);
    const [filteredSpecies, setFilteredSpecies] = useState<ExistingSpecies[]>([]);
    const [filteredVarieties, setFilteredVarieties] = useState<ExistingVariety[]>([]);

    // Buscar proveedor por código
    const handleSearchSupplier = async () => {
        if (!supplierCode.trim()) {
            setSearchMessage('Ingresa un código de proveedor para buscar.');
            return;
        }

        setSearchingSupplier(true);
        setSearchMessage('');

        try {
            const { data } = await http.post('/delivery-flow/search-supplier', {
                code: supplierCode.trim(),
            });

            if (data.found) {
                // Proveedor encontrado
                setSelectedSupplier(data.supplier);
                setSupplierId(data.supplier.id.toString());
                loadSupplierVarieties(data.supplier);

                // Verificar si tiene entrega del día
                if (data.existing_delivery) {
                    setExistingDelivery(data.existing_delivery);
                    setShowExistingDeliveryDialog(true);
                } else {
                    setCurrentStep('entry');
                }
                setSearchMessage('');
            } else {
                // No encontrado - mostrar mensaje y opción de crear
                setSearchMessage(data.message);
                setNewSupplier((prev) => ({
                    ...prev,
                    code: supplierCode.trim(),
                }));
            }
        } catch (error: unknown) {
            console.error('Error en búsqueda:', error);
            const axiosError = error as { response?: { status?: number } };
            if (axiosError.response?.status === 419) {
                setSearchMessage('La sesión ha expirado. Por favor, recarga la página.');
            } else {
                setSearchMessage('Error de conexión al buscar el proveedor. Verifica tu conexión.');
            }
        } finally {
            setSearchingSupplier(false);
        }
    };

    // Continuar con nueva entrega (ignorar la existente)
    const handleContinueNewDelivery = () => {
        setShowExistingDeliveryDialog(false);
        setExistingDelivery(null);
        setCurrentStep('entry');
    };

    // Ir a editar la entrega existente
    const handleEditExistingDelivery = () => {
        if (existingDelivery) {
            router.visit(`/delivery-flow/${existingDelivery.id}`);
        }
    };

    // Cargar variedades del proveedor seleccionado
    const loadSupplierVarieties = (supplier: Supplier) => {
        if (supplier.supplier_varieties) {
            const varieties = supplier.supplier_varieties.map((sv) => ({
                id: sv.id,
                species_id: sv.species.id,
                species_name: sv.species.name,
                variety_id: sv.variety.id,
                variety_name: sv.variety.name,
            }));
            setSupplierVarieties(varieties);
            setAvailableVarieties(varieties);
            setEntries([]);
        } else {
            setSupplierVarieties([]);
            setAvailableVarieties([]);
            setEntries([]);
        }
    };

    // Validar datos del nuevo proveedor
    const validateNewSupplier = () => {
        const errors: Record<string, string> = {};

        if (!newSupplier.code.trim()) {
            errors.code = 'El código es requerido.';
        }

        if (!newSupplier.name.trim()) {
            errors.name = 'El nombre es requerido.';
        } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(newSupplier.name)) {
            errors.name = 'El nombre solo puede contener letras.';
        }

        if (!newSupplier.email.trim()) {
            errors.email = 'El correo es requerido.';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newSupplier.email)) {
            errors.email = 'El correo debe ser válido.';
        }

        if (!newSupplier.phone.trim()) {
            errors.phone = 'El celular es requerido.';
        } else if (!/^\d{10}$/.test(newSupplier.phone)) {
            errors.phone = 'El celular debe tener exactamente 10 dígitos.';
        }

        if (!newSupplier.ruc.trim()) {
            errors.ruc = 'El RUC es requerido.';
        } else if (!/^\d{13}$/.test(newSupplier.ruc)) {
            errors.ruc = 'El RUC debe tener exactamente 13 dígitos.';
        }

        setNewSupplierErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Crear nuevo proveedor
    const handleCreateSupplier = async () => {
        if (!validateNewSupplier()) return;

        setCreatingSupplier(true);

        try {
            const { data } = await http.post('/delivery-flow/quick-supplier', newSupplier);

            if (data.success) {
                // Proveedor creado exitosamente
                setSelectedSupplier(data.supplier);
                setSupplierId(data.supplier.id.toString());
                loadSupplierVarieties(data.supplier);
                setShowCreateSupplier(false);
                setCurrentStep('entry');
                setSuccessMessage(
                    'Proveedor creado exitosamente. Ahora puedes ingresar la entrega.',
                );
                // Limpiar formulario
                setNewSupplier({
                    code: '',
                    name: '',
                    email: '',
                    phone: '',
                    ruc: '',
                });
                setNewSupplierErrors({});
                setSearchMessage('');
            } else {
                // Errores de validación del servidor
                if (data.errors) {
                    setNewSupplierErrors(data.errors);
                } else {
                    setNewSupplierErrors({
                        general: data.message || 'Error al crear el proveedor.',
                    });
                }
            }
        } catch (error: unknown) {
            const axiosError = error as { response?: { data?: { errors?: Record<string, string>; message?: string } } };
            if (axiosError.response?.data?.errors) {
                setNewSupplierErrors(axiosError.response.data.errors);
            } else {
                setNewSupplierErrors({
                    general: axiosError.response?.data?.message || 'Error de conexión. Intenta de nuevo.',
                });
            }
        } finally {
            setCreatingSupplier(false);
        }
    };

    // Volver al paso de selección de proveedor
    const handleBackToSupplier = () => {
        setCurrentStep('supplier');
        setSelectedSupplier(null);
        setSupplierId('');
        setSupplierVarieties([]);
        setAvailableVarieties([]);
        setEntries([]);
    };

    // Contador para IDs únicos
    const [entryCounter, setEntryCounter] = useState(0);

    // Manejar cambio de especie con autocompletado y mayúsculas
    const handleSpeciesChange = (value: string) => {
        // Convertir a mayúsculas y filtrar caracteres no permitidos
        const upperValue = value.toUpperCase().replace(/[^A-ZÁÉÍÓÚÑÜ\s]/g, '');
        setNewSpeciesName(upperValue);

        // Filtrar sugerencias
        if (upperValue.trim()) {
            const filtered = existingSpecies.filter(s =>
                s.name.toUpperCase().includes(upperValue.trim())
            );
            setFilteredSpecies(filtered);
            setShowSpeciesSuggestions(filtered.length > 0);
        } else {
            setFilteredSpecies([]);
            setShowSpeciesSuggestions(false);
        }
    };

    // Manejar cambio de variedad con autocompletado y mayúsculas
    const handleVarietyChange = (value: string) => {
        // Convertir a mayúsculas y filtrar caracteres no permitidos
        const upperValue = value.toUpperCase().replace(/[^A-ZÁÉÍÓÚÑÜ0-9\s-]/g, '');
        setNewVarietyName(upperValue);

        // Filtrar sugerencias basadas en la especie seleccionada
        if (upperValue.trim()) {
            // Buscar el ID de la especie actual si existe
            const currentSpecies = existingSpecies.find(s =>
                s.name.toUpperCase() === newSpeciesName.trim().toUpperCase()
            );

            let filtered: ExistingVariety[];
            if (currentSpecies) {
                // Filtrar variedades de esa especie específica
                filtered = existingVarieties.filter(v =>
                    v.species_id === currentSpecies.id &&
                    v.name.toUpperCase().includes(upperValue.trim())
                );
            } else {
                // Filtrar todas las variedades
                filtered = existingVarieties.filter(v =>
                    v.name.toUpperCase().includes(upperValue.trim())
                );
            }
            setFilteredVarieties(filtered);
            setShowVarietySuggestions(filtered.length > 0);
        } else {
            setFilteredVarieties([]);
            setShowVarietySuggestions(false);
        }
    };

    // Seleccionar especie de las sugerencias
    const selectSpecies = (species: ExistingSpecies) => {
        setNewSpeciesName(species.name.toUpperCase());
        setShowSpeciesSuggestions(false);
    };

    // Seleccionar variedad de las sugerencias
    const selectVariety = (variety: ExistingVariety) => {
        setNewVarietyName(variety.name.toUpperCase());
        // Si no hay especie seleccionada, autocompletar con la especie de la variedad
        if (!newSpeciesName.trim()) {
            const species = existingSpecies.find(s => s.id === variety.species_id);
            if (species) {
                setNewSpeciesName(species.name.toUpperCase());
            }
        }
        setShowVarietySuggestions(false);
    };

    // Agregar variedad a las entradas
    const addVariety = (sv: SupplierVariety) => {
        const newEntry: VarietyEntry = {
            id: `entry-${entryCounter}`,
            species_name: sv.species_name,
            variety_name: sv.variety_name,
            quantity: '',
            exportable: createEmptyExportable(),
            localFlower: {},
            exportableOpen: false,
            localFlowerOpen: false,
        };
        setEntryCounter((prev) => prev + 1);
        setEntries([...entries, newEntry]);
        setAvailableVarieties(availableVarieties.filter((v) => v.id !== sv.id));
    };

    // Agregar variedad manualmente (cuando el proveedor no tiene variedades registradas)
    const addManualVariety = () => {
        if (!newSpeciesName.trim() || !newVarietyName.trim()) {
            return;
        }

        const newEntry: VarietyEntry = {
            id: `entry-${entryCounter}`,
            species_name: newSpeciesName.trim(),
            variety_name: newVarietyName.trim(),
            quantity: '',
            exportable: createEmptyExportable(),
            localFlower: {},
            exportableOpen: false,
            localFlowerOpen: false,
        };
        setEntryCounter((prev) => prev + 1);
        setEntries([...entries, newEntry]);
        setNewSpeciesName('');
        setNewVarietyName('');
    };

    // Eliminar entrada
    const removeEntry = (entryId: string) => {
        const entry = entries.find((e) => e.id === entryId);
        if (entry) {
            const originalVariety = supplierVarieties.find(
                (sv) =>
                    sv.species_name === entry.species_name &&
                    sv.variety_name === entry.variety_name,
            );
            if (originalVariety) {
                setAvailableVarieties([...availableVarieties, originalVariety]);
            }
        }
        setEntries(entries.filter((e) => e.id !== entryId));
    };

    // Actualizar cantidad de una entrada
    const updateEntryQuantity = (entryId: string, quantity: string) => {
        setEntries(
            entries.map((e) => (e.id === entryId ? { ...e, quantity } : e)),
        );
    };

    // Actualizar exportable de una entrada
    const updateEntryExportable = (
        entryId: string,
        key: string,
        value: string,
    ) => {
        const cleanValue = value.replace(/^0+(?=\d)/, '');
        if (cleanValue === '' || /^\d+$/.test(cleanValue)) {
            setEntries(
                entries.map((e) =>
                    e.id === entryId
                        ? {
                              ...e,
                              exportable: {
                                  ...e.exportable,
                                  [key]: cleanValue,
                              },
                          }
                        : e,
                ),
            );
        }
    };

    // Actualizar flor local de una entrada
    const updateEntryLocalFlower = (
        entryId: string,
        key: string,
        value: string,
    ) => {
        if (key.endsWith('_detail')) {
            // Convertir a MAYÚSCULAS para los campos de detalle
            const upperValue = value.toUpperCase();
            setEntries(
                entries.map((e) =>
                    e.id === entryId
                        ? {
                              ...e,
                              localFlower: { ...e.localFlower, [key]: upperValue },
                          }
                        : e,
                ),
            );
        } else {
            const cleanValue = value.replace(/^0+(?=\d)/, '');
            if (cleanValue === '' || /^\d+$/.test(cleanValue)) {
                setEntries(
                    entries.map((e) =>
                        e.id === entryId
                            ? {
                                  ...e,
                                  localFlower: {
                                      ...e.localFlower,
                                      [key]: cleanValue,
                                  },
                              }
                            : e,
                    ),
                );
            }
        }
    };

    // Toggle secciones
    const toggleExportable = (entryId: string) => {
        setEntries(
            entries.map((e) =>
                e.id === entryId
                    ? { ...e, exportableOpen: !e.exportableOpen }
                    : e,
            ),
        );
    };

    const toggleLocalFlower = (entryId: string) => {
        setEntries(
            entries.map((e) =>
                e.id === entryId
                    ? { ...e, localFlowerOpen: !e.localFlowerOpen }
                    : e,
            ),
        );
    };

    // Calcular totales para una entrada
    const getEntryTotals = (entry: VarietyEntry) => {
        const quantity = Number(entry.quantity) || 0;
        const totalExportable = Object.values(entry.exportable).reduce(
            (sum, val) => sum + (Number(val) || 0),
            0,
        );

        let totalLocal = 0;
        categories.forEach((cat) => {
            totalLocal += Number(entry.localFlower[`cat_${cat.id}`]) || 0;
            cat.active_subcategories?.forEach((sub) => {
                totalLocal += Number(entry.localFlower[`sub_${sub.id}`]) || 0;
            });
        });

        const totalClassified = totalExportable + totalLocal;
        const remaining = quantity - totalClassified;

        return {
            quantity,
            totalExportable,
            totalLocal,
            totalClassified,
            remaining,
        };
    };

    // Calcular totales generales
    const calculateGlobalTotals = () => {
        let totalQuantity = 0;
        let totalExportable = 0;
        let totalLocal = 0;

        entries.forEach((entry) => {
            const totals = getEntryTotals(entry);
            totalQuantity += totals.quantity;
            totalExportable += totals.totalExportable;
            totalLocal += totals.totalLocal;
        });

        return {
            totalQuantity,
            totalExportable,
            totalLocal,
            totalClassified: totalExportable + totalLocal,
            remaining: totalQuantity - (totalExportable + totalLocal),
        };
    };

    const globalTotals = calculateGlobalTotals();

    // Agrupar variedades disponibles por especie
    const groupedAvailableVarieties = availableVarieties.reduce(
        (acc, sv) => {
            if (!acc[sv.species_name]) {
                acc[sv.species_name] = [];
            }
            acc[sv.species_name].push(sv);
            return acc;
        },
        {} as Record<string, SupplierVariety[]>,
    );

    // Validar si se puede guardar
    const canSave =
        entries.length > 0 && entries.every((e) => Number(e.quantity) > 0);

    // Guardar todo
    const handleSave: FormEventHandler = (e) => {
        e.preventDefault();

        const formData = {
            supplier_id: supplierId,
            delivery_date: deliveryDate,
            delivery_time: deliveryTime,
            entries: entries.map((entry) => {
                // Preparar rechazos de flor local
                const rejections: Array<{
                    category_id: number;
                    subcategory_id: number | null;
                    quantity: number;
                    detail: string | null;
                }> = [];

                categories.forEach((cat) => {
                    const catQuantity =
                        Number(entry.localFlower[`cat_${cat.id}`]) || 0;
                    if (catQuantity > 0) {
                        rejections.push({
                            category_id: cat.id,
                            subcategory_id: null,
                            quantity: catQuantity,
                            detail:
                                entry.localFlower[`cat_${cat.id}_detail`] ||
                                null,
                        });
                    }

                    cat.active_subcategories?.forEach((sub) => {
                        const subQuantity =
                            Number(entry.localFlower[`sub_${sub.id}`]) || 0;
                        if (subQuantity > 0) {
                            rejections.push({
                                category_id: cat.id,
                                subcategory_id: sub.id,
                                quantity: subQuantity,
                                detail:
                                    entry.localFlower[`sub_${sub.id}_detail`] ||
                                    null,
                            });
                        }
                    });
                });

                return {
                    species_name: entry.species_name,
                    variety_name: entry.variety_name,
                    quantity: Number(entry.quantity),
                    exportable: {
                        cm_40: Number(entry.exportable.cm_40) || 0,
                        cm_50: Number(entry.exportable.cm_50) || 0,
                        cm_60: Number(entry.exportable.cm_60) || 0,
                        cm_70: Number(entry.exportable.cm_70) || 0,
                        cm_80: Number(entry.exportable.cm_80) || 0,
                        cm_90: Number(entry.exportable.cm_90) || 0,
                        cm_100: Number(entry.exportable.cm_100) || 0,
                        cm_110: Number(entry.exportable.cm_110) || 0,
                        cm_120: Number(entry.exportable.cm_120) || 0,
                        sobrante: Number(entry.exportable.sobrante) || 0,
                    },
                    rejections,
                };
            }),
        };

        setProcessing(true);
        router.post('/delivery-flow', formData, {
            onSuccess: () => {
                setSuccessMessage('Entrega guardada exitosamente');
            },
            onFinish: () => setProcessing(false),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Nueva Entrega" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Nueva Entrega y Postcosecha
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Registra la entrega completa: variedades, clasificación
                        exportable y flor local
                    </p>
                </div>

                {successMessage && (
                    <Alert className="border-green-500 bg-green-50">
                        <Check className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-700">
                            {successMessage}
                        </AlertDescription>
                    </Alert>
                )}

                <form onSubmit={handleSave} className="space-y-6">
                    {/* Paso 1: Selección de Proveedor */}
                    {currentStep === 'supplier' && (
                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <Search className="h-5 w-5 text-muted-foreground" />
                                    <CardTitle>
                                        Paso 1: Buscar Proveedor
                                    </CardTitle>
                                </div>
                                <CardDescription>
                                    Ingresa el código del proveedor para
                                    buscarlo en el sistema
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-end gap-4">
                                    <div className="flex-1 space-y-2">
                                        <Label>Código de Proveedor *</Label>
                                        <Input
                                            type="text"
                                            value={supplierCode}
                                            onChange={(e) => {
                                                setSupplierCode(e.target.value);
                                                setSearchMessage('');
                                            }}
                                            onKeyDown={(e) =>
                                                e.key === 'Enter' &&
                                                (e.preventDefault(),
                                                handleSearchSupplier())
                                            }
                                            placeholder="Ej: PROV001"
                                            className="font-mono text-lg"
                                        />
                                    </div>
                                    <Button
                                        type="button"
                                        onClick={handleSearchSupplier}
                                        disabled={searchingSupplier}
                                    >
                                        {searchingSupplier ? (
                                            'Buscando...'
                                        ) : (
                                            <>
                                                <Search className="mr-2 h-4 w-4" />
                                                Buscar
                                            </>
                                        )}
                                    </Button>
                                </div>

                                {searchMessage && (
                                    <div className="space-y-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
                                        <p className="text-amber-800">
                                            {searchMessage}
                                        </p>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() =>
                                                setShowCreateSupplier(true)
                                            }
                                            className="border-amber-400 text-amber-700 hover:bg-amber-100"
                                        >
                                            <UserPlus className="mr-2 h-4 w-4" />
                                            Sí, crear nuevo proveedor
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Paso 2: Información básica de la entrega */}
                    {currentStep === 'entry' && selectedSupplier && (
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Truck className="h-5 w-5 text-muted-foreground" />
                                        <CardTitle>
                                            Información de la Entrega
                                        </CardTitle>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={handleBackToSupplier}
                                    >
                                        Cambiar Proveedor
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-4 sm:grid-cols-1">
                                    <div className="space-y-2">
                                        <Label>Proveedor</Label>
                                        <div className="rounded-lg bg-muted/50 p-3">
                                            <p className="font-medium">
                                                {selectedSupplier.name}
                                            </p>
                                            {selectedSupplier.code && (
                                                <p className="font-mono text-sm text-muted-foreground">
                                                    Código:{' '}
                                                    {selectedSupplier.code}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label>Fecha de Entrega *</Label>
                                            <Input
                                                type="date"
                                                value={deliveryDate}
                                                onChange={(e) =>
                                                    setDeliveryDate(
                                                        e.target.value,
                                                    )
                                                }
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Hora de Entrega *</Label>
                                            <Input
                                                type="time"
                                                value={deliveryTime}
                                                onChange={(e) =>
                                                    setDeliveryTime(
                                                        e.target.value,
                                                    )
                                                }
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Selección de variedades */}
                    {currentStep === 'entry' && selectedSupplier && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Variedades a Ingresar</CardTitle>
                                <CardDescription>
                                    {supplierVarieties.length > 0
                                        ? 'Selecciona las variedades que entrega el proveedor'
                                        : 'Agrega las variedades manualmente para este proveedor'}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Formulario para agregar variedad manual */}
                                <div className="rounded-lg border bg-muted/30 p-4">
                                    <p className="mb-3 text-sm font-medium">Agregar nueva variedad:</p>
                                    <div className="flex flex-wrap items-end gap-3">
                                        {/* Campo Especie con autocompletado */}
                                        <div className="relative min-w-[150px] flex-1 space-y-1">
                                            <Label className="text-xs">Especie *</Label>
                                            <Input
                                                type="text"
                                                value={newSpeciesName}
                                                onChange={(e) => handleSpeciesChange(e.target.value)}
                                                onFocus={() => {
                                                    if (newSpeciesName.trim() && filteredSpecies.length > 0) {
                                                        setShowSpeciesSuggestions(true);
                                                    }
                                                }}
                                                onBlur={() => {
                                                    // Delay para permitir click en sugerencia
                                                    setTimeout(() => setShowSpeciesSuggestions(false), 200);
                                                }}
                                                placeholder="Ej: ROSA"
                                                className="h-9 uppercase"
                                                autoComplete="off"
                                            />
                                            {/* Lista de sugerencias de especies */}
                                            {showSpeciesSuggestions && filteredSpecies.length > 0 && (
                                                <div className="absolute top-full left-0 right-0 z-50 mt-1 max-h-40 overflow-auto rounded-md border bg-popover shadow-md">
                                                    {filteredSpecies.map((species) => (
                                                        <button
                                                            key={species.id}
                                                            type="button"
                                                            className="w-full px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground"
                                                            onMouseDown={(e) => e.preventDefault()}
                                                            onClick={() => selectSpecies(species)}
                                                        >
                                                            {species.name.toUpperCase()}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        {/* Campo Variedad con autocompletado */}
                                        <div className="relative min-w-[150px] flex-1 space-y-1">
                                            <Label className="text-xs">Variedad *</Label>
                                            <Input
                                                type="text"
                                                value={newVarietyName}
                                                onChange={(e) => handleVarietyChange(e.target.value)}
                                                onFocus={() => {
                                                    if (newVarietyName.trim() && filteredVarieties.length > 0) {
                                                        setShowVarietySuggestions(true);
                                                    }
                                                }}
                                                onBlur={() => {
                                                    // Delay para permitir click en sugerencia
                                                    setTimeout(() => setShowVarietySuggestions(false), 200);
                                                }}
                                                placeholder="Ej: FREEDOM"
                                                className="h-9 uppercase"
                                                autoComplete="off"
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        setShowVarietySuggestions(false);
                                                        addManualVariety();
                                                    }
                                                }}
                                            />
                                            {/* Lista de sugerencias de variedades */}
                                            {showVarietySuggestions && filteredVarieties.length > 0 && (
                                                <div className="absolute top-full left-0 right-0 z-50 mt-1 max-h-40 overflow-auto rounded-md border bg-popover shadow-md">
                                                    {filteredVarieties.map((variety) => (
                                                        <button
                                                            key={variety.id}
                                                            type="button"
                                                            className="w-full px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground"
                                                            onMouseDown={(e) => e.preventDefault()}
                                                            onClick={() => selectVariety(variety)}
                                                        >
                                                            {variety.name.toUpperCase()}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <Button
                                            type="button"
                                            onClick={addManualVariety}
                                            disabled={!newSpeciesName.trim() || !newVarietyName.trim()}
                                            size="sm"
                                            className="h-9"
                                        >
                                            <Plus className="mr-1 h-4 w-4" />
                                            Agregar
                                        </Button>
                                    </div>
                                </div>

                                {/* Variedades registradas del proveedor */}
                                {supplierVarieties.length > 0 && (
                                    <div className="space-y-3">
                                        <p className="text-sm font-medium text-muted-foreground">
                                            O selecciona de las variedades registradas:
                                        </p>
                                        {availableVarieties.length === 0 ? (
                                            <p className="py-2 text-center text-sm text-muted-foreground">
                                                Ya agregaste todas las variedades disponibles
                                            </p>
                                        ) : (
                                            <div className="space-y-3">
                                                {Object.entries(groupedAvailableVarieties).map(
                                                    ([speciesName, varieties]) => (
                                                        <div key={speciesName} className="space-y-2">
                                                            <span className="text-sm font-medium text-muted-foreground">
                                                                {speciesName}:
                                                            </span>
                                                            <div className="ml-4 flex flex-wrap gap-2">
                                                                {varieties.map((sv) => (
                                                                    <Button
                                                                        key={sv.id}
                                                                        type="button"
                                                                        variant="outline"
                                                                        size="sm"
                                                                        onClick={() => addVariety(sv)}
                                                                        className="hover:bg-primary hover:text-primary-foreground"
                                                                    >
                                                                        <Plus className="mr-1 h-3 w-3" />
                                                                        {sv.variety_name}
                                                                    </Button>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ),
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Lista de entradas con clasificación */}
                    {entries.length > 0 && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-semibold">
                                    Productos Ingresados ({entries.length})
                                </h2>
                                <div className="flex gap-4 text-sm">
                                    <span>
                                        Total:{' '}
                                        <strong className="text-primary">
                                            {globalTotals.totalQuantity}
                                        </strong>
                                    </span>
                                    <span>
                                        Exportable:{' '}
                                        <strong className="text-green-600">
                                            {globalTotals.totalExportable}
                                        </strong>
                                    </span>
                                    <span>
                                        Local:{' '}
                                        <strong className="text-amber-600">
                                            {globalTotals.totalLocal}
                                        </strong>
                                    </span>
                                    <span
                                        className={
                                            globalTotals.remaining === 0
                                                ? 'text-green-600'
                                                : globalTotals.remaining < 0
                                                  ? 'text-destructive'
                                                  : 'text-amber-600'
                                        }
                                    >
                                        Restante:{' '}
                                        <strong>
                                            {globalTotals.remaining}
                                        </strong>
                                    </span>
                                </div>
                            </div>

                            {entries.map((entry, index) => {
                                const totals = getEntryTotals(entry);
                                return (
                                    <Card
                                        key={entry.id}
                                        className="overflow-hidden"
                                    >
                                        {/* Header de la variedad */}
                                        <div className="flex items-center justify-between border-b bg-muted/50 px-4 py-3">
                                            <div className="flex items-center gap-4">
                                                <Badge
                                                    variant="secondary"
                                                    className="text-xs"
                                                >
                                                    #{index + 1}
                                                </Badge>
                                                <div>
                                                    <span className="font-semibold">
                                                        {entry.species_name}
                                                    </span>
                                                    <span className="mx-2 text-muted-foreground">
                                                        -
                                                    </span>
                                                    <span>
                                                        {entry.variety_name}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="flex items-center gap-2">
                                                    <Label className="text-sm">
                                                        Cantidad:
                                                    </Label>
                                                    <Input
                                                        type="number"
                                                        min="1"
                                                        value={entry.quantity}
                                                        onChange={(e) =>
                                                            updateEntryQuantity(
                                                                entry.id,
                                                                e.target.value,
                                                            )
                                                        }
                                                        className="h-8 w-24"
                                                        placeholder="0"
                                                    />
                                                </div>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() =>
                                                        removeEntry(entry.id)
                                                    }
                                                    className="text-destructive hover:text-destructive"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>

                                        {/* Resumen de clasificación */}
                                        {entry.quantity &&
                                            Number(entry.quantity) > 0 && (
                                                <div className="flex gap-4 border-b bg-muted/20 px-4 py-2 text-sm">
                                                    <span>
                                                        Exp:{' '}
                                                        <strong className="text-green-600">
                                                            {
                                                                totals.totalExportable
                                                            }
                                                        </strong>
                                                    </span>
                                                    <span>
                                                        Local:{' '}
                                                        <strong className="text-amber-600">
                                                            {totals.totalLocal}
                                                        </strong>
                                                    </span>
                                                    <span
                                                        className={
                                                            totals.remaining ===
                                                            0
                                                                ? 'text-green-600'
                                                                : totals.remaining <
                                                                    0
                                                                  ? 'text-destructive'
                                                                  : 'text-amber-600'
                                                        }
                                                    >
                                                        Restante:{' '}
                                                        <strong>
                                                            {totals.remaining}
                                                        </strong>
                                                        {totals.remaining ===
                                                            0 && (
                                                            <Check className="ml-1 inline h-4 w-4" />
                                                        )}
                                                    </span>
                                                </div>
                                            )}

                                        {/* Sección Exportable */}
                                        <Collapsible
                                            open={entry.exportableOpen}
                                            onOpenChange={() =>
                                                toggleExportable(entry.id)
                                            }
                                        >
                                            <CollapsibleTrigger asChild>
                                                <div className="flex cursor-pointer items-center justify-between border-b px-4 py-2 hover:bg-muted/30">
                                                    <div className="flex items-center gap-2">
                                                        <Ruler className="h-4 w-4 text-green-600" />
                                                        <span className="text-sm font-medium">
                                                            Exportable
                                                        </span>
                                                        {totals.totalExportable >
                                                            0 && (
                                                            <Badge className="bg-green-100 text-xs text-green-700">
                                                                {
                                                                    totals.totalExportable
                                                                }
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    {entry.exportableOpen ? (
                                                        <ChevronUp className="h-4 w-4" />
                                                    ) : (
                                                        <ChevronDown className="h-4 w-4" />
                                                    )}
                                                </div>
                                            </CollapsibleTrigger>
                                            <CollapsibleContent>
                                                <div className="border-b p-4">
                                                    <div className="grid gap-3 sm:grid-cols-5 lg:grid-cols-10">
                                                        {stemSizes.map(
                                                            ({
                                                                key,
                                                                label,
                                                                unit,
                                                            }) => (
                                                                <div
                                                                    key={key}
                                                                    className="space-y-1"
                                                                >
                                                                    <Label className="block text-center text-xs">
                                                                        {label}
                                                                        {unit && (
                                                                            <span className="text-muted-foreground">
                                                                                {' '}
                                                                                {
                                                                                    unit
                                                                                }
                                                                            </span>
                                                                        )}
                                                                    </Label>
                                                                    <Input
                                                                        type="number"
                                                                        min="0"
                                                                        value={
                                                                            entry
                                                                                .exportable[
                                                                                key as keyof typeof entry.exportable
                                                                            ]
                                                                        }
                                                                        onChange={(
                                                                            e,
                                                                        ) =>
                                                                            updateEntryExportable(
                                                                                entry.id,
                                                                                key,
                                                                                e
                                                                                    .target
                                                                                    .value,
                                                                            )
                                                                        }
                                                                        className="h-8 text-center text-sm"
                                                                        placeholder="0"
                                                                    />
                                                                </div>
                                                            ),
                                                        )}
                                                    </div>
                                                </div>
                                            </CollapsibleContent>
                                        </Collapsible>

                                        {/* Sección Flor Local */}
                                        <Collapsible
                                            open={entry.localFlowerOpen}
                                            onOpenChange={() =>
                                                toggleLocalFlower(entry.id)
                                            }
                                        >
                                            <CollapsibleTrigger asChild>
                                                <div className="flex cursor-pointer items-center justify-between px-4 py-2 hover:bg-muted/30">
                                                    <div className="flex items-center gap-2">
                                                        <Flower2 className="h-4 w-4 text-amber-600" />
                                                        <span className="text-sm font-medium">
                                                            Flor Local
                                                        </span>
                                                        {totals.totalLocal >
                                                            0 && (
                                                            <Badge className="bg-amber-100 text-xs text-amber-700">
                                                                {
                                                                    totals.totalLocal
                                                                }
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    {entry.localFlowerOpen ? (
                                                        <ChevronUp className="h-4 w-4" />
                                                    ) : (
                                                        <ChevronDown className="h-4 w-4" />
                                                    )}
                                                </div>
                                            </CollapsibleTrigger>
                                            <CollapsibleContent>
                                                <div className="space-y-4 p-4">
                                                    {categories.map(
                                                        (category) => (
                                                            <div
                                                                key={
                                                                    category.id
                                                                }
                                                                className="space-y-2"
                                                            >
                                                                <h4 className="text-sm font-medium">
                                                                    {
                                                                        category.name
                                                                    }
                                                                </h4>

                                                                {!category.active_subcategories ||
                                                                category
                                                                    .active_subcategories
                                                                    .length ===
                                                                    0 ? (
                                                                    <div className="ml-4 grid gap-2 sm:grid-cols-2">
                                                                        <Input
                                                                            type="number"
                                                                            min="0"
                                                                            value={
                                                                                entry
                                                                                    .localFlower[
                                                                                    `cat_${category.id}`
                                                                                ] ||
                                                                                ''
                                                                            }
                                                                            onChange={(
                                                                                e,
                                                                            ) =>
                                                                                updateEntryLocalFlower(
                                                                                    entry.id,
                                                                                    `cat_${category.id}`,
                                                                                    e
                                                                                        .target
                                                                                        .value,
                                                                                )
                                                                            }
                                                                            placeholder="Cantidad"
                                                                            className="h-8"
                                                                        />
                                                                        <Input
                                                                            type="text"
                                                                            value={
                                                                                entry
                                                                                    .localFlower[
                                                                                    `cat_${category.id}_detail`
                                                                                ] ||
                                                                                ''
                                                                            }
                                                                            onChange={(
                                                                                e,
                                                                            ) =>
                                                                                updateEntryLocalFlower(
                                                                                    entry.id,
                                                                                    `cat_${category.id}_detail`,
                                                                                    e
                                                                                        .target
                                                                                        .value,
                                                                                )
                                                                            }
                                                                            placeholder="Detalle (opcional)"
                                                                            className="h-8 uppercase"
                                                                        />
                                                                    </div>
                                                                ) : (
                                                                    <div className="ml-4 space-y-2">
                                                                        {category.active_subcategories.map(
                                                                            (
                                                                                sub,
                                                                            ) => (
                                                                                <div
                                                                                    key={
                                                                                        sub.id
                                                                                    }
                                                                                    className="grid items-center gap-2 sm:grid-cols-3"
                                                                                >
                                                                                    <span className="text-sm text-muted-foreground">
                                                                                        {
                                                                                            sub.name
                                                                                        }
                                                                                    </span>
                                                                                    <Input
                                                                                        type="number"
                                                                                        min="0"
                                                                                        value={
                                                                                            entry
                                                                                                .localFlower[
                                                                                                `sub_${sub.id}`
                                                                                            ] ||
                                                                                            ''
                                                                                        }
                                                                                        onChange={(
                                                                                            e,
                                                                                        ) =>
                                                                                            updateEntryLocalFlower(
                                                                                                entry.id,
                                                                                                `sub_${sub.id}`,
                                                                                                e
                                                                                                    .target
                                                                                                    .value,
                                                                                            )
                                                                                        }
                                                                                        placeholder="Cantidad"
                                                                                        className="h-8"
                                                                                    />
                                                                                    <Input
                                                                                        type="text"
                                                                                        value={
                                                                                            entry
                                                                                                .localFlower[
                                                                                                `sub_${sub.id}_detail`
                                                                                            ] ||
                                                                                            ''
                                                                                        }
                                                                                        onChange={(
                                                                                            e,
                                                                                        ) =>
                                                                                            updateEntryLocalFlower(
                                                                                                entry.id,
                                                                                                `sub_${sub.id}_detail`,
                                                                                                e
                                                                                                    .target
                                                                                                    .value,
                                                                                            )
                                                                                        }
                                                                                        placeholder="Detalle"
                                                                                        className="h-8 uppercase"
                                                                                    />
                                                                                </div>
                                                                            ),
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ),
                                                    )}
                                                </div>
                                            </CollapsibleContent>
                                        </Collapsible>
                                    </Card>
                                );
                            })}
                        </div>
                    )}

                    {/* Mensaje cuando no hay entradas */}
                    {currentStep === 'entry' &&
                        selectedSupplier &&
                        entries.length === 0 && (
                            <div className="rounded-lg border border-dashed py-8 text-center text-muted-foreground">
                                <p>No has seleccionado ninguna variedad</p>
                                <p className="text-sm">
                                    Haz clic en las variedades de arriba para
                                    agregarlas
                                </p>
                            </div>
                        )}

                    {/* Botones de acción */}
                    {currentStep === 'entry' && selectedSupplier && (
                        <div className="flex justify-end gap-4 border-t pt-4">
                            <Button type="button" variant="outline" asChild>
                                <Link href="/delivery-flow">
                                    <X className="mr-2 h-4 w-4" />
                                    Cancelar
                                </Link>
                            </Button>
                            <Button
                                type="submit"
                                disabled={processing || !canSave}
                            >
                                {processing ? (
                                    'Guardando...'
                                ) : (
                                    <>
                                        <Save className="mr-2 h-4 w-4" />
                                        Guardar Entrega
                                    </>
                                )}
                            </Button>
                        </div>
                    )}
                </form>

                {/* Diálogo para crear nuevo proveedor */}
                <Dialog
                    open={showCreateSupplier}
                    onOpenChange={setShowCreateSupplier}
                >
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>Crear Nuevo Proveedor</DialogTitle>
                            <DialogDescription>
                                Ingresa los datos del nuevo proveedor para
                                registrarlo en el sistema.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            {newSupplierErrors.general && (
                                <Alert variant="destructive">
                                    <AlertDescription>
                                        {newSupplierErrors.general}
                                    </AlertDescription>
                                </Alert>
                            )}

                            <div className="space-y-2">
                                <Label>Código de Proveedor *</Label>
                                <Input
                                    type="text"
                                    value={newSupplier.code}
                                    onChange={(e) =>
                                        setNewSupplier((prev) => ({
                                            ...prev,
                                            code: e.target.value,
                                        }))
                                    }
                                    placeholder="Ej: PROV001"
                                    className="font-mono"
                                />
                                {newSupplierErrors.code && (
                                    <p className="text-sm text-destructive">
                                        {newSupplierErrors.code}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label>Nombre *</Label>
                                <Input
                                    type="text"
                                    value={newSupplier.name}
                                    onChange={(e) => {
                                        const value = e.target.value.replace(
                                            /[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g,
                                            '',
                                        );
                                        setNewSupplier((prev) => ({
                                            ...prev,
                                            name: value,
                                        }));
                                    }}
                                    placeholder="Nombre del proveedor"
                                />
                                {newSupplierErrors.name && (
                                    <p className="text-sm text-destructive">
                                        {newSupplierErrors.name}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label>Correo Electrónico *</Label>
                                <Input
                                    type="email"
                                    value={newSupplier.email}
                                    onChange={(e) =>
                                        setNewSupplier((prev) => ({
                                            ...prev,
                                            email: e.target.value,
                                        }))
                                    }
                                    placeholder="correo@ejemplo.com"
                                />
                                {newSupplierErrors.email && (
                                    <p className="text-sm text-destructive">
                                        {newSupplierErrors.email}
                                    </p>
                                )}
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label>Celular (10 dígitos) *</Label>
                                    <Input
                                        type="text"
                                        value={newSupplier.phone}
                                        onChange={(e) => {
                                            const value = e.target.value
                                                .replace(/\D/g, '')
                                                .slice(0, 10);
                                            setNewSupplier((prev) => ({
                                                ...prev,
                                                phone: value,
                                            }));
                                        }}
                                        placeholder="0999999999"
                                        maxLength={10}
                                    />
                                    {newSupplierErrors.phone && (
                                        <p className="text-sm text-destructive">
                                            {newSupplierErrors.phone}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label>RUC (13 dígitos) *</Label>
                                    <Input
                                        type="text"
                                        value={newSupplier.ruc}
                                        onChange={(e) => {
                                            const value = e.target.value
                                                .replace(/\D/g, '')
                                                .slice(0, 13);
                                            setNewSupplier((prev) => ({
                                                ...prev,
                                                ruc: value,
                                            }));
                                        }}
                                        placeholder="1234567890001"
                                        maxLength={13}
                                    />
                                    {newSupplierErrors.ruc && (
                                        <p className="text-sm text-destructive">
                                            {newSupplierErrors.ruc}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setShowCreateSupplier(false);
                                    setNewSupplierErrors({});
                                }}
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="button"
                                onClick={handleCreateSupplier}
                                disabled={creatingSupplier}
                            >
                                {creatingSupplier
                                    ? 'Creando...'
                                    : 'Crear Proveedor'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Diálogo de entrega existente del día */}
                <Dialog open={showExistingDeliveryDialog} onOpenChange={setShowExistingDeliveryDialog}>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-amber-600">
                                <Truck className="h-5 w-5" />
                                Entrega existente encontrada
                            </DialogTitle>
                            <DialogDescription className="pt-2">
                                Este proveedor ya realizó una entrega el día de hoy.
                            </DialogDescription>
                        </DialogHeader>

                        {existingDelivery && selectedSupplier && (
                            <div className="space-y-4">
                                {/* Info del proveedor */}
                                <div className="rounded-lg border bg-muted/30 p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                                            <Truck className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <p className="font-semibold">{selectedSupplier.name}</p>
                                            <p className="text-sm text-muted-foreground">{selectedSupplier.code}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Detalles de la entrega existente */}
                                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                                    <p className="text-sm font-medium text-amber-800 mb-3">
                                        Detalles de la entrega de hoy:
                                    </p>
                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                        <div>
                                            <p className="text-amber-600">Hora de entrega</p>
                                            <p className="font-semibold text-amber-900">
                                                {new Date(existingDelivery.entry_datetime).toLocaleTimeString('es-EC', {
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                    hour12: true,
                                                    timeZone: 'America/Guayaquil',
                                                })}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-amber-600">Variedades ingresadas</p>
                                            <p className="font-semibold text-amber-900">{existingDelivery.total_entries}</p>
                                        </div>
                                        <div className="col-span-2">
                                            <p className="text-amber-600">Total de tallos</p>
                                            <p className="text-2xl font-bold text-amber-900">{existingDelivery.total_stems.toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Pregunta */}
                                <div className="text-center py-2">
                                    <p className="text-sm text-muted-foreground">
                                        ¿Qué deseas hacer?
                                    </p>
                                </div>
                            </div>
                        )}

                        <DialogFooter className="flex-col gap-2 sm:flex-col">
                            <Button
                                type="button"
                                onClick={handleEditExistingDelivery}
                                className="w-full bg-amber-600 hover:bg-amber-700"
                            >
                                <Flower2 className="mr-2 h-4 w-4" />
                                Editar / Agregar a la entrega existente
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleContinueNewDelivery}
                                className="w-full"
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                Crear una nueva entrega de todas formas
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => {
                                    setShowExistingDeliveryDialog(false);
                                    setExistingDelivery(null);
                                    setSelectedSupplier(null);
                                    setSupplierId('');
                                }}
                                className="w-full text-muted-foreground"
                            >
                                Cancelar y buscar otro proveedor
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
