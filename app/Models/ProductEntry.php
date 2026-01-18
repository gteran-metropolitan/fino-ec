<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class ProductEntry extends Model
{
    use HasFactory;

    protected $fillable = [
        'supplier_id',
        'species_id',
        'variety_id',
        'delivery_date',
        'quantity',
    ];

    protected function casts(): array
    {
        return [
            'delivery_date' => 'datetime',
            'quantity' => 'integer',
        ];
    }

    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class);
    }

    public function species(): BelongsTo
    {
        return $this->belongsTo(Species::class);
    }

    public function variety(): BelongsTo
    {
        return $this->belongsTo(Variety::class);
    }

    public function stemClassification(): HasOne
    {
        return $this->hasOne(StemClassification::class);
    }
}
