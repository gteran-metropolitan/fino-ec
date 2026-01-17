<?php

namespace App\Http\Controllers;

use App\Models\Supplier;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
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
        return Inertia::render('suppliers/create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:suppliers'],
            'phone' => ['required', 'string', 'max:20'],
            'ruc' => ['required', 'string', 'max:20', 'unique:suppliers'],
            'is_active' => ['boolean'],
        ]);

        Supplier::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'],
            'ruc' => $validated['ruc'],
            'is_active' => $validated['is_active'] ?? true,
        ]);

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
        return Inertia::render('suppliers/edit', [
            'supplier' => $supplier,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Supplier $supplier): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('suppliers')->ignore($supplier->id)],
            'phone' => ['required', 'string', 'max:20'],
            'ruc' => ['required', 'integer', Rule::unique('suppliers')->ignore($supplier->id)],
            'is_active' => ['boolean'],
        ]);

        $supplier->update([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'],
            'ruc' => $validated['ruc'],
            'is_active' => $validated['is_active'] ?? $supplier->is_active,
        ]);

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
