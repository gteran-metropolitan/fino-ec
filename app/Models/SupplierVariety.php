<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SupplierVariety extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<string>
     */
    protected $fillable = [
        'supplier_id',
        'species_id',
        'variety_id',
        'is_active',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    /**
     * Relación con el proveedor.
     */
    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class);
    }

    /**
     * Relación con la especie.
     */
    public function species(): BelongsTo
    {
        return $this->belongsTo(Species::class);
    }

    /**
     * Relación con la variedad.
     */
    public function variety(): BelongsTo
    {
        return $this->belongsTo(Variety::class);
    }
}

