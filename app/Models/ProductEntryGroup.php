<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ProductEntryGroup extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<string>
     */
    protected $fillable = [
        'supplier_id',
        'entry_datetime',
        'notes',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'entry_datetime' => 'datetime',
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
     * Relación con las entradas de producto.
     */
    public function entries(): HasMany
    {
        return $this->hasMany(ProductEntry::class);
    }

    /**
     * Obtener el total de tallos de todas las entradas.
     */
    public function getTotalStemsAttribute(): int
    {
        return $this->entries->sum('quantity');
    }
}

