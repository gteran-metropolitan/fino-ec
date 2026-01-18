<?php

namespace App\Http\Controllers;

use App\Models\ProductEntry;
use App\Models\ProductEntryGroup;
use App\Models\Species;
use App\Models\Supplier;
use App\Models\SupplierVariety;
use App\Models\Variety;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ProductEntryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        $entries = ProductEntry::query()
            ->with(['group.supplier', 'species', 'variety', 'stemClassification'])
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        // Transformar datos para la vista
        $transformedEntries = $entries->through(function ($entry) {
            return [
                'id' => $entry->id,
                'supplier' => $entry->group->supplier,
                'species' => $entry->species,
                'variety' => $entry->variety,
                'delivery_date' => $entry->group->entry_datetime,
                'quantity' => $entry->quantity,
                'created_at' => $entry->created_at,
                'stem_classification' => $entry->stemClassification,
                'group_id' => $entry->product_entry_group_id,
            ];
        });

        return Inertia::render('product-entries/index', [
            'entries' => $transformedEntries,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        $suppliers = Supplier::where('is_active', true)
            ->with(['supplierVarieties.species', 'supplierVarieties.variety'])
            ->orderBy('name')
            ->get();

        $species = Species::where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name']);

        $varieties = Variety::where('is_active', true)
            ->with('species:id,name')
            ->orderBy('name')
            ->get(['id', 'name', 'species_id']);

        return Inertia::render('product-entries/create', [
            'suppliers' => $suppliers,
            'speciesList' => $species,
            'varietiesList' => $varieties,
        ]);
    }

    /**
     * Store a newly created resource in storage.
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
        ]);

        // Combinar fecha y hora
        $entryDateTime = $validated['delivery_date'] . ' ' . $validated['delivery_time'] . ':00';

        DB::transaction(function () use ($validated, $entryDateTime) {
            // Crear el grupo de entrada
            $group = ProductEntryGroup::create([
                'supplier_id' => $validated['supplier_id'],
                'entry_datetime' => $entryDateTime,
            ]);

            // Crear cada entrada
            foreach ($validated['entries'] as $entryData) {
                // Buscar o crear la especie
                $species = Species::firstOrCreate(
                    ['name' => trim($entryData['species_name'])],
                    ['is_active' => true]
                );

                // Buscar o crear la variedad
                $variety = Variety::firstOrCreate(
                    [
                        'name' => trim($entryData['variety_name']),
                        'species_id' => $species->id,
                    ],
                    ['is_active' => true]
                );

                // Crear la entrada de producto
                ProductEntry::create([
                    'product_entry_group_id' => $group->id,
                    'species_id' => $species->id,
                    'variety_id' => $variety->id,
                    'quantity' => $entryData['quantity'],
                ]);

                // Asociar la variedad al proveedor si no existe
                SupplierVariety::firstOrCreate([
                    'supplier_id' => $validated['supplier_id'],
                    'species_id' => $species->id,
                    'variety_id' => $variety->id,
                ], [
                    'is_active' => true,
                ]);
            }
        });

        return redirect()->route('product-entries.index')
            ->with('success', 'Ingreso registrado exitosamente.');
    }

    /**
     * Display the specified resource.
     */
    public function show(ProductEntry $productEntry): Response
    {
        $productEntry->load(['group.supplier', 'species', 'variety']);

        return Inertia::render('product-entries/show', [
            'entry' => $productEntry,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(ProductEntry $productEntry): Response
    {
        $productEntry->load(['group.supplier', 'species', 'variety']);

        $suppliers = Supplier::where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name']);

        $species = Species::where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name']);

        $varieties = Variety::where('is_active', true)
            ->with('species:id,name')
            ->orderBy('name')
            ->get(['id', 'name', 'species_id']);

        // Transformar para la vista
        $entryData = [
            'id' => $productEntry->id,
            'supplier_id' => $productEntry->group->supplier_id,
            'species' => $productEntry->species,
            'variety' => $productEntry->variety,
            'delivery_date' => $productEntry->group->entry_datetime->format('Y-m-d'),
            'delivery_time' => $productEntry->group->entry_datetime->format('H:i'),
            'quantity' => $productEntry->quantity,
        ];

        return Inertia::render('product-entries/edit', [
            'entry' => $entryData,
            'suppliers' => $suppliers,
            'speciesList' => $species,
            'varietiesList' => $varieties,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, ProductEntry $productEntry): RedirectResponse
    {
        $validated = $request->validate([
            'supplier_id' => ['required', 'exists:suppliers,id'],
            'species_name' => ['required', 'string', 'max:255'],
            'variety_name' => ['required', 'string', 'max:255'],
            'delivery_date' => ['required', 'date'],
            'delivery_time' => ['required', 'date_format:H:i'],
            'quantity' => ['required', 'integer', 'min:1'],
        ]);

        // Combinar fecha y hora
        $deliveryDateTime = $validated['delivery_date'] . ' ' . $validated['delivery_time'] . ':00';

        // Buscar o crear la especie
        $species = Species::firstOrCreate(
            ['name' => trim($validated['species_name'])],
            ['is_active' => true]
        );

        // Buscar o crear la variedad
        $variety = Variety::firstOrCreate(
            [
                'name' => trim($validated['variety_name']),
                'species_id' => $species->id,
            ],
            ['is_active' => true]
        );

        // Actualizar el grupo
        $productEntry->group->update([
            'supplier_id' => $validated['supplier_id'],
            'entry_datetime' => $deliveryDateTime,
        ]);

        // Actualizar la entrada
        $productEntry->update([
            'species_id' => $species->id,
            'variety_id' => $variety->id,
            'quantity' => $validated['quantity'],
        ]);

        return redirect()->route('product-entries.index')
            ->with('success', 'Ingreso actualizado exitosamente.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(ProductEntry $productEntry): RedirectResponse
    {
        $group = $productEntry->group;
        $productEntry->delete();

        // Si el grupo ya no tiene entradas, eliminarlo
        if ($group->entries()->count() === 0) {
            $group->delete();
        }

        return redirect()->route('product-entries.index')
            ->with('success', 'Ingreso eliminado exitosamente.');
    }

    /**
     * Obtener las variedades de un proveedor.
     */
    public function getSupplierVarieties(Supplier $supplier): \Illuminate\Http\JsonResponse
    {
        $varieties = $supplier->supplierVarieties()
            ->where('is_active', true)
            ->with(['species', 'variety'])
            ->get()
            ->map(function ($sv) {
                return [
                    'id' => $sv->id,
                    'species_id' => $sv->species_id,
                    'species_name' => $sv->species->name,
                    'variety_id' => $sv->variety_id,
                    'variety_name' => $sv->variety->name,
                ];
            });

        return response()->json($varieties);
    }
}

