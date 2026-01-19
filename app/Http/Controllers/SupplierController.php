<?php

namespace App\Http\Controllers;

use App\Models\Species;
use App\Models\Supplier;
use App\Models\SupplierVariety;
use App\Models\Variety;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class SupplierController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $suppliers = Supplier::query()
            ->with(['supplierVarieties.species', 'supplierVarieties.variety'])
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return Inertia::render('suppliers/index', [
            'suppliers' => $suppliers,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $species = Species::where('is_active', true)->orderBy('name')->get(['id', 'name']);
        $varieties = Variety::where('is_active', true)
            ->with('species:id,name')
            ->orderBy('name')
            ->get(['id', 'name', 'species_id']);

        return Inertia::render('suppliers/create', [
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
            'code' => ['required', 'string', 'max:20', 'unique:suppliers,code'],
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:suppliers'],
            'phone' => ['required', 'string', 'max:20'],
            'ruc' => ['required', 'string', 'max:20', 'unique:suppliers'],
            'is_active' => ['boolean'],
            'varieties' => ['array'],
            'varieties.*.species_name' => ['required_with:varieties', 'string', 'max:255'],
            'varieties.*.variety_name' => ['required_with:varieties', 'string', 'max:255'],
        ]);

        DB::transaction(function () use ($validated) {
            $supplier = Supplier::create([
                'code' => $validated['code'],
                'name' => $validated['name'],
                'email' => $validated['email'],
                'phone' => $validated['phone'],
                'ruc' => $validated['ruc'],
                'is_active' => $validated['is_active'] ?? true,
            ]);

            // Guardar las variedades del proveedor
            if (!empty($validated['varieties'])) {
                foreach ($validated['varieties'] as $varietyData) {
                    // Buscar o crear la especie
                    $species = Species::firstOrCreate(
                        ['name' => trim($varietyData['species_name'])],
                        ['is_active' => true]
                    );

                    // Buscar o crear la variedad
                    $variety = Variety::firstOrCreate(
                        [
                            'name' => trim($varietyData['variety_name']),
                            'species_id' => $species->id,
                        ],
                        ['is_active' => true]
                    );

                    // Crear la relación con el proveedor
                    SupplierVariety::firstOrCreate([
                        'supplier_id' => $supplier->id,
                        'species_id' => $species->id,
                        'variety_id' => $variety->id,
                    ], [
                        'is_active' => true,
                    ]);
                }
            }
        });

        return redirect()->route('suppliers.index')
            ->with('success', 'Proveedor creado exitosamente.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Supplier $supplier)
    {
        return Inertia::render('suppliers/show', [
            'supplier' => $supplier,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Supplier $supplier): Response
    {
        $supplier->load(['supplierVarieties.species', 'supplierVarieties.variety']);

        $species = Species::where('is_active', true)->orderBy('name')->get(['id', 'name']);
        $varieties = Variety::where('is_active', true)
            ->with('species:id,name')
            ->orderBy('name')
            ->get(['id', 'name', 'species_id']);

        // Transformar las variedades del proveedor para el formulario
        $supplierVarieties = $supplier->supplierVarieties->map(function ($sv) {
            return [
                'id' => $sv->id,
                'species_name' => $sv->species->name,
                'variety_name' => $sv->variety->name,
            ];
        });

        return Inertia::render('suppliers/edit', [
            'supplier' => $supplier,
            'supplierVarieties' => $supplierVarieties,
            'speciesList' => $species,
            'varietiesList' => $varieties,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Supplier $supplier): RedirectResponse
    {
        $validated = $request->validate([
            'code' => ['required', 'string', 'max:20', Rule::unique('suppliers')->ignore($supplier->id)],
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('suppliers')->ignore($supplier->id)],
            'phone' => ['required', 'string', 'max:20'],
            'ruc' => ['required', 'string', 'size:13', Rule::unique('suppliers')->ignore($supplier->id)],
            'is_active' => ['boolean'],
            'varieties' => ['array'],
            'varieties.*.species_name' => ['required_with:varieties', 'string', 'max:255'],
            'varieties.*.variety_name' => ['required_with:varieties', 'string', 'max:255'],
        ]);

        DB::transaction(function () use ($validated, $supplier) {
            $supplier->update([
                'code' => $validated['code'],
                'name' => $validated['name'],
                'email' => $validated['email'],
                'phone' => $validated['phone'],
                'ruc' => $validated['ruc'],
                'is_active' => $validated['is_active'] ?? $supplier->is_active,
            ]);

            // Eliminar variedades actuales y recrear
            $supplier->supplierVarieties()->delete();

            // Guardar las nuevas variedades del proveedor
            if (!empty($validated['varieties'])) {
                foreach ($validated['varieties'] as $varietyData) {
                    // Buscar o crear la especie
                    $species = Species::firstOrCreate(
                        ['name' => trim($varietyData['species_name'])],
                        ['is_active' => true]
                    );

                    // Buscar o crear la variedad
                    $variety = Variety::firstOrCreate(
                        [
                            'name' => trim($varietyData['variety_name']),
                            'species_id' => $species->id,
                        ],
                        ['is_active' => true]
                    );

                    // Crear la relación con el proveedor
                    SupplierVariety::create([
                        'supplier_id' => $supplier->id,
                        'species_id' => $species->id,
                        'variety_id' => $variety->id,
                        'is_active' => true,
                    ]);
                }
            }
        });

        return redirect()->route('suppliers.index')
            ->with('success', 'Proveedor actualizado exitosamente.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Supplier $supplier): RedirectResponse
    {
        $supplier->delete();

        return redirect()->route('suppliers.index')
            ->with('success', 'Proveedor eliminado exitosamente.');
    }

    /**
     * Toggle supplier active status.
     */
    public function toggleActive(Supplier $supplier)
    {
        $supplier->update(['is_active' => ! $supplier->is_active]);

        $status = $supplier->is_active ? 'activado' : 'desactivado';

        return back()->with('success', "Proveedor {$status} exitosamente.");
    }
}
