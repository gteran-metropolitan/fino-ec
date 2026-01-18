<?php

namespace App\Http\Controllers;

use App\Models\ProductEntry;
use App\Models\StemClassification;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StemClassificationController extends Controller
{
    /**
     * Display a listing of classifications.
     */
    public function index(): Response
    {
        $classifications = StemClassification::query()
            ->with(['productEntry.supplier', 'productEntry.species', 'productEntry.variety'])
            ->orderBy('updated_at', 'desc')
            ->paginate(20);

        return Inertia::render('classifications/index', [
            'classifications' => $classifications,
        ]);
    }

    /**
     * Show the form for classifying stems.
     */
    public function create(ProductEntry $productEntry): Response
    {
        $productEntry->load(['supplier', 'species', 'variety', 'stemClassification']);

        return Inertia::render('product-entries/classify', [
            'entry' => $productEntry,
            'classification' => $productEntry->stemClassification,
        ]);
    }

    /**
     * Store or update the stem classification.
     */
    public function store(Request $request, ProductEntry $productEntry): RedirectResponse
    {
        $validated = $request->validate([
            'cm_40' => ['nullable', 'integer', 'min:0'],
            'cm_50' => ['nullable', 'integer', 'min:0'],
            'cm_60' => ['nullable', 'integer', 'min:0'],
            'cm_70' => ['nullable', 'integer', 'min:0'],
            'cm_80' => ['nullable', 'integer', 'min:0'],
            'cm_90' => ['nullable', 'integer', 'min:0'],
            'cm_100' => ['nullable', 'integer', 'min:0'],
            'cm_110' => ['nullable', 'integer', 'min:0'],
            'cm_120' => ['nullable', 'integer', 'min:0'],
            'sobrante' => ['nullable', 'integer', 'min:0'],
        ]);

        // Convertir valores vacíos/null a 0
        $fields = ['cm_40', 'cm_50', 'cm_60', 'cm_70', 'cm_80', 'cm_90', 'cm_100', 'cm_110', 'cm_120', 'sobrante'];
        foreach ($fields as $field) {
            $validated[$field] = (int) ($validated[$field] ?? 0);
        }

        $totalClassified = array_sum(array_intersect_key($validated, array_flip($fields)));

        // Validar que el total no exceda la cantidad del ingreso
        if ($totalClassified > $productEntry->quantity) {
            return back()->withErrors([
                'total' => 'El total clasificado no puede exceder la cantidad del ingreso (' . $productEntry->quantity . ')',
            ]);
        }

        $validated['total_classified'] = $totalClassified;
        $validated['is_complete'] = $totalClassified === $productEntry->quantity;

        StemClassification::updateOrCreate(
            ['product_entry_id' => $productEntry->id],
            $validated
        );

        return redirect()->route('product-entries.index')
            ->with('success', 'Clasificación guardada exitosamente.');
    }

    /**
     * Remove the specified classification.
     */
    public function destroy(StemClassification $classification): RedirectResponse
    {
        $classification->delete();

        return redirect()->route('classifications.index')
            ->with('success', 'Clasificación eliminada exitosamente.');
    }
}
