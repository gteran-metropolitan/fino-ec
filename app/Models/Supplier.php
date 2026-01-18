<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Supplier extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<string>
     */
    protected $fillable = [
        'name',
        'email',
        'phone',
        'ruc',
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
     * Relación con las variedades del proveedor.
     */
    public function supplierVarieties(): HasMany
    {
        return $this->hasMany(SupplierVariety::class);
    }

    /**
     * Relación con las variedades activas del proveedor.
     */
    public function activeSupplierVarieties(): HasMany
    {
        return $this->hasMany(SupplierVariety::class)->where('is_active', true);
    }

    /**
     * Relación con los grupos de entrada de productos.
     */
    public function productEntryGroups(): HasMany
    {
        return $this->hasMany(ProductEntryGroup::class);
    }
}

