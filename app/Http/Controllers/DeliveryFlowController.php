<?php

namespace App\Http\Controllers;

use App\Models\ClassificationRejection;
use App\Models\ProductEntry;
use App\Models\ProductEntryGroup;
use App\Models\RejectionCategory;
use App\Models\Species;
use App\Models\StemClassification;
use App\Models\Supplier;
use App\Models\SupplierVariety;
use App\Models\Variety;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DeliveryFlowController extends Controller
{
    /**
     * Display a listing of delivery groups.
     */
    public function index(): Response
    {
        $groups = ProductEntryGroup::query()
            ->with([
                'supplier',
                'entries.stemClassification',
            ])
            ->orderBy('entry_datetime', 'desc')
            ->paginate(15);

        // Transformar datos
        $transformedGroups = $groups->through(function ($group) {
            $totalStems = $group->entries->sum('quantity');
            $totalClassified = 0;
            $totalLocal = 0;

            foreach ($group->entries as $entry) {
                if ($entry->stemClassification) {
                    $totalClassified += $entry->stemClassification->total_classified;
                    $totalLocal += $entry->stemClassification->local_quantity;
                }
            }

            return [
                'id' => $group->id,
                'supplier' => $group->supplier,
                'entry_datetime' => $group->entry_datetime,
                'notes' => $group->notes,
                'entries' => $group->entries->map(fn ($e) => [
                    'id' => $e->id,
                    'quantity' => $e->quantity,
                    'stem_classification' => $e->stemClassification,
                ]),
                'total_stems' => $totalStems,
                'total_classified' => $totalClassified,
                'total_local' => $totalLocal,
                'is_complete' => $totalStems > 0 && ($totalClassified + $totalLocal) === $totalStems,
            ];
        });

        return Inertia::render('delivery-flow/index', [
            'groups' => $transformedGroups,
        ]);
    }

    /**
     * Show the form for creating a new delivery.
     */
    public function create(): Response
    {
        $categories = RejectionCategory::with('activeSubcategories')
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        // Obtener especies existentes para autocompletado
        $existingSpecies = Species::where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name']);

        // Obtener variedades existentes para autocompletado
        $existingVarieties = Variety::where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'species_id']);

        return Inertia::render('delivery-flow/create', [
            'categories' => $categories,
            'existingSpecies' => $existingSpecies,
            'existingVarieties' => $existingVarieties,
        ]);
    }

    /**
     * Store a newly created delivery with all classifications.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'supplier_id' => ['required', 'exists:suppliers,id'],
            'delivery_date' => ['required', 'date'],
            'delivery_time' => ['required', 'date_format:H:i'],
            'entries' => ['required', 'array', 'min:1'],
            'entries.*.species_name' => ['required', 'string', 'max:255'],
            'entries.*.variety_name' => ['required', 'string', 'max:255'],
            'entries.*.quantity' => ['required', 'integer', 'min:1'],
            'entries.*.exportable' => ['nullable', 'array'],
            'entries.*.exportable.cm_40' => ['nullable', 'integer', 'min:0'],
            'entries.*.exportable.cm_50' => ['nullable', 'integer', 'min:0'],
            'entries.*.exportable.cm_60' => ['nullable', 'integer', 'min:0'],
            'entries.*.exportable.cm_70' => ['nullable', 'integer', 'min:0'],
            'entries.*.exportable.cm_80' => ['nullable', 'integer', 'min:0'],
            'entries.*.exportable.cm_90' => ['nullable', 'integer', 'min:0'],
            'entries.*.exportable.cm_100' => ['nullable', 'integer', 'min:0'],
            'entries.*.exportable.cm_110' => ['nullable', 'integer', 'min:0'],
            'entries.*.exportable.cm_120' => ['nullable', 'integer', 'min:0'],
            'entries.*.exportable.sobrante' => ['nullable', 'integer', 'min:0'],
            'entries.*.prices' => ['nullable', 'array'],
            'entries.*.prices.price_40' => ['nullable', 'numeric', 'min:0'],
            'entries.*.prices.price_50' => ['nullable', 'numeric', 'min:0'],
            'entries.*.prices.price_60' => ['nullable', 'numeric', 'min:0'],
            'entries.*.prices.price_70' => ['nullable', 'numeric', 'min:0'],
            'entries.*.prices.price_80' => ['nullable', 'numeric', 'min:0'],
            'entries.*.prices.price_90' => ['nullable', 'numeric', 'min:0'],
            'entries.*.prices.price_100' => ['nullable', 'numeric', 'min:0'],
            'entries.*.prices.price_110' => ['nullable', 'numeric', 'min:0'],
            'entries.*.prices.price_120' => ['nullable', 'numeric', 'min:0'],
            'entries.*.prices.price_sobrante' => ['nullable', 'numeric', 'min:0'],
            'entries.*.total_price' => ['nullable', 'numeric', 'min:0'],
            'entries.*.rejections' => ['nullable', 'array'],
            'entries.*.rejections.*.category_id' => ['required', 'exists:rejection_categories,id'],
            'entries.*.rejections.*.subcategory_id' => ['nullable', 'exists:rejection_subcategories,id'],
            'entries.*.rejections.*.quantity' => ['required', 'integer', 'min:1'],
            'entries.*.rejections.*.detail' => ['nullable', 'string', 'max:500'],
        ]);

        $entryDateTime = $validated['delivery_date'].' '.$validated['delivery_time'].':00';

        DB::transaction(function () use ($validated, $entryDateTime) {
            // Crear grupo de entrada
            $group = ProductEntryGroup::create([
                'supplier_id' => $validated['supplier_id'],
                'entry_datetime' => $entryDateTime,
            ]);

            foreach ($validated['entries'] as $entryData) {
                // Buscar o crear especie
                $species = Species::firstOrCreate(
                    ['name' => trim($entryData['species_name'])],
                    ['is_active' => true]
                );

                // Buscar o crear variedad
                $variety = Variety::firstOrCreate(
                    [
                        'name' => trim($entryData['variety_name']),
                        'species_id' => $species->id,
                    ],
                    ['is_active' => true]
                );

                // Crear entrada de producto
                $productEntry = ProductEntry::create([
                    'product_entry_group_id' => $group->id,
                    'species_id' => $species->id,
                    'variety_id' => $variety->id,
                    'quantity' => $entryData['quantity'],
                ]);

                // Asociar variedad al proveedor
                SupplierVariety::firstOrCreate([
                    'supplier_id' => $validated['supplier_id'],
                    'species_id' => $species->id,
                    'variety_id' => $variety->id,
                ], [
                    'is_active' => true,
                ]);

                // Si tiene datos de exportable, crear clasificación
                $exportable = $entryData['exportable'] ?? [];
                $prices = $entryData['prices'] ?? [];
                $rejections = $entryData['rejections'] ?? [];

                $totalExportable = array_sum($exportable);
                $totalLocal = collect($rejections)->sum('quantity');
                $totalPrice = $entryData['total_price'] ?? 0;

                if ($totalExportable > 0 || $totalLocal > 0) {
                    $classification = StemClassification::create([
                        'product_entry_id' => $productEntry->id,
                        'cm_40' => $exportable['cm_40'] ?? 0,
                        'price_40' => $prices['price_40'] ?? 0,
                        'cm_50' => $exportable['cm_50'] ?? 0,
                        'price_50' => $prices['price_50'] ?? 0,
                        'cm_60' => $exportable['cm_60'] ?? 0,
                        'price_60' => $prices['price_60'] ?? 0,
                        'cm_70' => $exportable['cm_70'] ?? 0,
                        'price_70' => $prices['price_70'] ?? 0,
                        'cm_80' => $exportable['cm_80'] ?? 0,
                        'price_80' => $prices['price_80'] ?? 0,
                        'cm_90' => $exportable['cm_90'] ?? 0,
                        'price_90' => $prices['price_90'] ?? 0,
                        'cm_100' => $exportable['cm_100'] ?? 0,
                        'price_100' => $prices['price_100'] ?? 0,
                        'cm_110' => $exportable['cm_110'] ?? 0,
                        'price_110' => $prices['price_110'] ?? 0,
                        'cm_120' => $exportable['cm_120'] ?? 0,
                        'price_120' => $prices['price_120'] ?? 0,
                        'sobrante' => $exportable['sobrante'] ?? 0,
                        'price_sobrante' => $prices['price_sobrante'] ?? 0,
                        'total_classified' => $totalExportable,
                        'total_price' => $totalPrice,
                        'is_complete' => ($totalExportable + $totalLocal) === $entryData['quantity'],
                        'local_quantity' => $totalLocal,
                        'local_is_complete' => $totalLocal > 0,
                        'local_reason' => $totalLocal > 0 ? 'Ver detalle de rechazos' : null,
                    ]);

                    // Crear rechazos si existen
                    foreach ($rejections as $rejection) {
                        ClassificationRejection::create([
                            'stem_classification_id' => $classification->id,
                            'rejection_category_id' => $rejection['category_id'],
                            'rejection_subcategory_id' => $rejection['subcategory_id'] ?? null,
                            'quantity' => $rejection['quantity'],
                            'detail' => $rejection['detail'] ?? null,
                        ]);
                    }
                }
            }
        });

        return redirect()->route('delivery-flow.index')
            ->with('success', 'Entrega registrada exitosamente.');
    }

    /**
     * Display the specified delivery for editing classifications.
     */
    public function show(ProductEntryGroup $deliveryFlow): Response
    {
        $deliveryFlow->load([
            'supplier',
            'entries.species',
            'entries.variety',
            'entries.stemClassification.rejections',
        ]);

        $categories = RejectionCategory::with('activeSubcategories')
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        // Obtener especies existentes para autocompletado
        $existingSpecies = Species::where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name']);

        // Obtener variedades existentes para autocompletado
        $existingVarieties = Variety::where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'species_id']);

        return Inertia::render('delivery-flow/show', [
            'group' => $deliveryFlow,
            'categories' => $categories,
            'existingSpecies' => $existingSpecies,
            'existingVarieties' => $existingVarieties,
        ]);
    }

    /**
     * Show form for editing delivery info (not classifications).
     */
    public function edit(ProductEntryGroup $deliveryFlow): Response
    {
        $deliveryFlow->load(['supplier', 'entries.species', 'entries.variety']);

        $suppliers = Supplier::where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('delivery-flow/edit', [
            'group' => $deliveryFlow,
            'suppliers' => $suppliers,
        ]);
    }

    /**
     * Update classifications for all entries.
     */
    public function update(Request $request, ProductEntryGroup $deliveryFlow): RedirectResponse
    {
        $validated = $request->validate([
            'entries' => ['required', 'array'],
            'entries.*.id' => ['required'],
            'entries.*.isNew' => ['nullable', 'boolean'],
            'entries.*.species_name' => ['nullable', 'string', 'max:255'],
            'entries.*.variety_name' => ['nullable', 'string', 'max:255'],
            'entries.*.quantity' => ['nullable', 'integer', 'min:0'],
            'entries.*.exportable' => ['required', 'array'],
            'entries.*.exportable.cm_40' => ['nullable', 'integer', 'min:0'],
            'entries.*.exportable.cm_50' => ['nullable', 'integer', 'min:0'],
            'entries.*.exportable.cm_60' => ['nullable', 'integer', 'min:0'],
            'entries.*.exportable.cm_70' => ['nullable', 'integer', 'min:0'],
            'entries.*.exportable.cm_80' => ['nullable', 'integer', 'min:0'],
            'entries.*.exportable.cm_90' => ['nullable', 'integer', 'min:0'],
            'entries.*.exportable.cm_100' => ['nullable', 'integer', 'min:0'],
            'entries.*.exportable.cm_110' => ['nullable', 'integer', 'min:0'],
            'entries.*.exportable.cm_120' => ['nullable', 'integer', 'min:0'],
            'entries.*.exportable.sobrante' => ['nullable', 'integer', 'min:0'],
            'entries.*.prices' => ['nullable', 'array'],
            'entries.*.prices.price_40' => ['nullable', 'numeric', 'min:0'],
            'entries.*.prices.price_50' => ['nullable', 'numeric', 'min:0'],
            'entries.*.prices.price_60' => ['nullable', 'numeric', 'min:0'],
            'entries.*.prices.price_70' => ['nullable', 'numeric', 'min:0'],
            'entries.*.prices.price_80' => ['nullable', 'numeric', 'min:0'],
            'entries.*.prices.price_90' => ['nullable', 'numeric', 'min:0'],
            'entries.*.prices.price_100' => ['nullable', 'numeric', 'min:0'],
            'entries.*.prices.price_110' => ['nullable', 'numeric', 'min:0'],
            'entries.*.prices.price_120' => ['nullable', 'numeric', 'min:0'],
            'entries.*.prices.price_sobrante' => ['nullable', 'numeric', 'min:0'],
            'entries.*.total_price' => ['nullable', 'numeric', 'min:0'],
            'entries.*.rejections' => ['nullable', 'array'],
            'entries.*.rejections.*.category_id' => ['required', 'exists:rejection_categories,id'],
            'entries.*.rejections.*.subcategory_id' => ['nullable', 'exists:rejection_subcategories,id'],
            'entries.*.rejections.*.quantity' => ['required', 'integer', 'min:1'],
            'entries.*.rejections.*.detail' => ['nullable', 'string', 'max:500'],
        ]);

        DB::transaction(function () use ($validated, $deliveryFlow) {
            foreach ($validated['entries'] as $entryData) {
                $isNew = isset($entryData['isNew']) && $entryData['isNew'];
                $productEntry = null;

                if ($isNew) {
                    // Crear nueva entrada
                    if (empty($entryData['species_name']) || empty($entryData['variety_name'])) {
                        continue;
                    }

                    // Buscar o crear especie
                    $species = Species::firstOrCreate(
                        ['name' => strtoupper(trim($entryData['species_name']))],
                        ['is_active' => true]
                    );

                    // Buscar o crear variedad
                    $variety = Variety::firstOrCreate(
                        [
                            'name' => strtoupper(trim($entryData['variety_name'])),
                            'species_id' => $species->id,
                        ],
                        ['is_active' => true]
                    );

                    // Crear entrada de producto
                    $productEntry = ProductEntry::create([
                        'product_entry_group_id' => $deliveryFlow->id,
                        'species_id' => $species->id,
                        'variety_id' => $variety->id,
                        'quantity' => $entryData['quantity'] ?? 0,
                    ]);

                    // Asociar variedad al proveedor
                    SupplierVariety::firstOrCreate([
                        'supplier_id' => $deliveryFlow->supplier_id,
                        'species_id' => $species->id,
                        'variety_id' => $variety->id,
                    ], [
                        'is_active' => true,
                    ]);
                } else {
                    // Actualizar entrada existente
                    $productEntry = ProductEntry::find($entryData['id']);
                    if (! $productEntry || $productEntry->product_entry_group_id !== $deliveryFlow->id) {
                        continue;
                    }

                    // Actualizar cantidad si se proporcionó
                    if (isset($entryData['quantity'])) {
                        $productEntry->update(['quantity' => $entryData['quantity']]);
                    }
                }

                $exportable = $entryData['exportable'];
                $prices = $entryData['prices'] ?? [];
                $rejections = $entryData['rejections'] ?? [];

                $totalExportable = array_sum($exportable);
                $totalLocal = collect($rejections)->sum('quantity');
                $totalPrice = $entryData['total_price'] ?? 0;

                // Actualizar o crear clasificación
                $classification = StemClassification::updateOrCreate(
                    ['product_entry_id' => $productEntry->id],
                    [
                        'cm_40' => $exportable['cm_40'] ?? 0,
                        'price_40' => $prices['price_40'] ?? 0,
                        'cm_50' => $exportable['cm_50'] ?? 0,
                        'price_50' => $prices['price_50'] ?? 0,
                        'cm_60' => $exportable['cm_60'] ?? 0,
                        'price_60' => $prices['price_60'] ?? 0,
                        'cm_70' => $exportable['cm_70'] ?? 0,
                        'price_70' => $prices['price_70'] ?? 0,
                        'cm_80' => $exportable['cm_80'] ?? 0,
                        'price_80' => $prices['price_80'] ?? 0,
                        'cm_90' => $exportable['cm_90'] ?? 0,
                        'price_90' => $prices['price_90'] ?? 0,
                        'cm_100' => $exportable['cm_100'] ?? 0,
                        'price_100' => $prices['price_100'] ?? 0,
                        'cm_110' => $exportable['cm_110'] ?? 0,
                        'price_110' => $prices['price_110'] ?? 0,
                        'cm_120' => $exportable['cm_120'] ?? 0,
                        'price_120' => $prices['price_120'] ?? 0,
                        'sobrante' => $exportable['sobrante'] ?? 0,
                        'price_sobrante' => $prices['price_sobrante'] ?? 0,
                        'total_classified' => $totalExportable,
                        'total_price' => $totalPrice,
                        'is_complete' => ($totalExportable + $totalLocal) === $productEntry->quantity,
                        'local_quantity' => $totalLocal,
                        'local_is_complete' => $totalLocal > 0,
                        'local_reason' => $totalLocal > 0 ? 'Ver detalle de rechazos' : null,
                    ]
                );

                // Actualizar rechazos
                $classification->rejections()->delete();
                foreach ($rejections as $rejection) {
                    ClassificationRejection::create([
                        'stem_classification_id' => $classification->id,
                        'rejection_category_id' => $rejection['category_id'],
                        'rejection_subcategory_id' => $rejection['subcategory_id'] ?? null,
                        'quantity' => $rejection['quantity'],
                        'detail' => $rejection['detail'] ?? null,
                    ]);
                }
            }
        });

        return back()->with('success', 'Clasificaciones actualizadas exitosamente.');
    }

    /**
     * Update basic delivery info.
     */
    public function updateInfo(Request $request, ProductEntryGroup $deliveryFlow): RedirectResponse
    {
        $validated = $request->validate([
            'supplier_id' => ['required', 'exists:suppliers,id'],
            'delivery_date' => ['required', 'date'],
            'delivery_time' => ['required', 'date_format:H:i'],
            'notes' => ['nullable', 'string', 'max:500'],
        ]);

        $entryDateTime = $validated['delivery_date'].' '.$validated['delivery_time'].':00';

        $deliveryFlow->update([
            'supplier_id' => $validated['supplier_id'],
            'entry_datetime' => $entryDateTime,
            'notes' => $validated['notes'] ?? null,
        ]);

        return redirect()->route('delivery-flow.show', $deliveryFlow)
            ->with('success', 'Información actualizada exitosamente.');
    }

    /**
     * Remove the specified delivery.
     */
    public function destroy(ProductEntryGroup $deliveryFlow): RedirectResponse
    {
        // Eliminar en cascada: rechazos -> clasificaciones -> entradas -> grupo
        foreach ($deliveryFlow->entries as $entry) {
            if ($entry->stemClassification) {
                $entry->stemClassification->rejections()->delete();
                $entry->stemClassification->delete();
            }
            $entry->delete();
        }
        $deliveryFlow->delete();

        return redirect()->route('delivery-flow.index')
            ->with('success', 'Entrega eliminada exitosamente.');
    }

    /**
     * Search supplier by code.
     */
    public function searchSupplier(Request $request): \Illuminate\Http\JsonResponse
    {
        $code = $request->input('code');

        if (! $code) {
            return response()->json([
                'found' => false,
                'message' => 'El código es requerido.',
            ]);
        }

        $supplier = Supplier::where('code', $code)
            ->where('is_active', true)
            ->with(['supplierVarieties.species', 'supplierVarieties.variety'])
            ->first();

        if (! $supplier) {
            return response()->json([
                'found' => false,
                'message' => "El proveedor con código '{$code}' no existe. ¿Deseas crear uno nuevo?",
            ]);
        }

        // Verificar si tiene entrega del día actual
        $today = now()->setTimezone('America/Guayaquil')->startOfDay();
        $existingDelivery = ProductEntryGroup::where('supplier_id', $supplier->id)
            ->whereDate('entry_datetime', $today)
            ->withCount('entries')
            ->first();

        $response = [
            'found' => true,
            'supplier' => $supplier,
        ];

        if ($existingDelivery) {
            $totalStems = $existingDelivery->entries()->sum('quantity');
            $response['existing_delivery'] = [
                'id' => $existingDelivery->id,
                'entry_datetime' => $existingDelivery->entry_datetime,
                'total_entries' => $existingDelivery->entries_count,
                'total_stems' => $totalStems,
            ];
        }

        return response()->json($response);
    }

    /**
     * Store a new supplier quickly during delivery flow.
     */
    public function storeQuickSupplier(Request $request): \Illuminate\Http\JsonResponse
    {
        $validated = $request->validate([
            'code' => ['required', 'string', 'max:20', 'unique:suppliers,code'],
            'name' => ['required', 'string', 'max:255', 'regex:/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/'],
            'email' => ['required', 'email', 'max:255', 'unique:suppliers,email'],
            'phone' => ['required', 'string', 'digits:10'],
            'ruc' => ['required', 'string', 'digits:13', 'unique:suppliers,ruc'],
        ], [
            'code.required' => 'El código de proveedor es requerido.',
            'code.unique' => 'Este código ya está registrado.',
            'name.required' => 'El nombre es requerido.',
            'name.regex' => 'El nombre solo puede contener letras.',
            'email.required' => 'El correo es requerido.',
            'email.email' => 'El correo debe ser válido.',
            'email.unique' => 'Este correo ya está registrado.',
            'phone.required' => 'El celular es requerido.',
            'phone.digits' => 'El celular debe tener exactamente 10 dígitos.',
            'ruc.required' => 'El RUC es requerido.',
            'ruc.digits' => 'El RUC debe tener exactamente 13 dígitos.',
            'ruc.unique' => 'Este RUC ya está registrado.',
        ]);

        $supplier = Supplier::create([
            'code' => $validated['code'],
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'],
            'ruc' => $validated['ruc'],
            'is_active' => true,
        ]);

        $supplier->load(['supplierVarieties.species', 'supplierVarieties.variety']);

        return response()->json([
            'success' => true,
            'supplier' => $supplier,
            'message' => 'Proveedor creado exitosamente.',
        ]);
    }
}
