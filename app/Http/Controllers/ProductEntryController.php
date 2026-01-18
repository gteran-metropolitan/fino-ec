<?php

namespace App\Http\Controllers;

use App\Models\ProductEntry;
use App\Models\Species;
use App\Models\Supplier;
use App\Models\Variety;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
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
            ->with(['supplier', 'species', 'variety', 'stemClassification'])
            ->orderBy('delivery_date', 'desc')
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        return Inertia::render('product-entries/index', [
            'entries' => $entries,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
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

        ProductEntry::create([
            'supplier_id' => $validated['supplier_id'],
            'species_id' => $species->id,
            'variety_id' => $variety->id,
            'delivery_date' => $deliveryDateTime,
            'quantity' => $validated['quantity'],
        ]);

        return redirect()->route('product-entries.index')
            ->with('success', 'Ingreso registrado exitosamente.');
    }

    /**
     * Display the specified resource.
     */
    public function show(ProductEntry $productEntry): Response
    {
        $productEntry->load(['supplier', 'species', 'variety']);

        return Inertia::render('product-entries/show', [
            'entry' => $productEntry,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(ProductEntry $productEntry): Response
    {
        $productEntry->load(['supplier', 'species', 'variety']);

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

        return Inertia::render('product-entries/edit', [
            'entry' => $productEntry,
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

        $productEntry->update([
            'supplier_id' => $validated['supplier_id'],
            'species_id' => $species->id,
            'variety_id' => $variety->id,
            'delivery_date' => $deliveryDateTime,
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
        $productEntry->delete();

        return redirect()->route('product-entries.index')
            ->with('success', 'Ingreso eliminado exitosamente.');
    }
}

