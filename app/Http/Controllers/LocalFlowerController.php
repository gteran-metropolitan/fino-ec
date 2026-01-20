<?php

namespace App\Http\Controllers;

use App\Models\ClassificationRejection;
use App\Models\ProductEntry;
use App\Models\RejectionCategory;
use App\Models\StemClassification;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LocalFlowerController extends Controller
{
    /**
     * Display a listing of local flower classifications.
     */
    public function index(): Response
    {
        $classifications = StemClassification::query()
            ->with([
                'productEntry.supplier',
                'productEntry.species',
                'productEntry.variety',
                'rejections.category',
                'rejections.subcategory',
            ])
            ->where('local_quantity', '>', 0)
            ->orderBy('updated_at', 'desc')
            ->paginate(20);

        return Inertia::render('local-flowers/index', [
            'classifications' => $classifications,
        ]);
    }

    /**
     * Show the form for adding local flower quantity.
     */
    public function create(ProductEntry $productEntry): Response|RedirectResponse
    {
        $productEntry->load(['supplier', 'species', 'variety', 'stemClassification.rejections']);

        // Si no tiene clasificación exportable, no puede agregar flor local
        if (! $productEntry->stemClassification) {
            return redirect()->route('product-entries.classify', $productEntry)
                ->with('error', 'Primero debe clasificar el exportable.');
        }

        $categories = RejectionCategory::with('activeSubcategories')
            ->where('is_active', true)
            ->get();

        return Inertia::render('local-flowers/create', [
            'entry' => $productEntry,
            'classification' => $productEntry->stemClassification,
            'categories' => $categories,
        ]);
    }

    /**
     * Store or update the local flower quantity.
     */
    public function store(Request $request, ProductEntry $productEntry): RedirectResponse
    {
        $validated = $request->validate([
            'rejections' => ['required', 'array', 'min:1'],
            'rejections.*.category_id' => ['required', 'exists:rejection_categories,id'],
            'rejections.*.subcategory_id' => ['nullable', 'exists:rejection_subcategories,id'],
            'rejections.*.quantity' => ['required', 'integer', 'min:1'],
            'rejections.*.detail' => ['nullable', 'string', 'max:500'],
        ]);

        $classification = $productEntry->stemClassification;

        if (! $classification) {
            return back()->withErrors([
                'general' => 'Primero debe clasificar el exportable.',
            ]);
        }

        // Calcular total de flor local
        $localQuantity = collect($validated['rejections'])->sum('quantity');

        // Calcular el total (exportable + flor local)
        $totalWithLocal = $classification->total_classified + $localQuantity;

        // Validar que el total sea exactamente igual a la cantidad del ingreso
        if ($totalWithLocal !== $productEntry->quantity) {
            $difference = $productEntry->quantity - $totalWithLocal;
            if ($difference > 0) {
                return back()->withErrors([
                    'total' => "Faltan {$difference} unidades para completar el total de {$productEntry->quantity}. Exportable: {$classification->total_classified}, Flor Local: {$localQuantity}",
                ]);
            } else {
                $excess = abs($difference);

                return back()->withErrors([
                    'total' => "Excede por {$excess} unidades el total de {$productEntry->quantity}. Exportable: {$classification->total_classified}, Flor Local: {$localQuantity}",
                ]);
            }
        }

        // Eliminar rechazos anteriores
        $classification->rejections()->delete();

        // Crear nuevos rechazos
        foreach ($validated['rejections'] as $rejection) {
            ClassificationRejection::create([
                'stem_classification_id' => $classification->id,
                'rejection_category_id' => $rejection['category_id'],
                'rejection_subcategory_id' => $rejection['subcategory_id'] ?? null,
                'quantity' => $rejection['quantity'],
                'detail' => $rejection['detail'] ?? null,
            ]);
        }

        // Actualizar la clasificación
        $classification->update([
            'local_quantity' => $localQuantity,
            'local_reason' => 'Ver detalle de rechazos',
            'local_is_complete' => true,
        ]);

        return redirect()->route('local-flowers.index')
            ->with('success', 'Flor local registrada exitosamente.');
    }

    /**
     * Remove the local flower data from classification.
     */
    public function destroy(StemClassification $classification): RedirectResponse
    {
        // Eliminar rechazos
        $classification->rejections()->delete();

        // Resetear datos de flor local
        $classification->update([
            'local_quantity' => 0,
            'local_reason' => null,
            'local_is_complete' => false,
        ]);

        return redirect()->route('local-flowers.index')
            ->with('success', 'Registro de flor local eliminado exitosamente.');
    }
}
