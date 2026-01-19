<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class StemClassification extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_entry_id',
        'cm_40',
        'price_40',
        'cm_50',
        'price_50',
        'cm_60',
        'price_60',
        'cm_70',
        'price_70',
        'cm_80',
        'price_80',
        'cm_90',
        'price_90',
        'cm_100',
        'price_100',
        'cm_110',
        'price_110',
        'cm_120',
        'price_120',
        'sobrante',
        'price_sobrante',
        'total_classified',
        'total_price',
        'is_complete',
        'local_quantity',
        'local_reason',
        'local_is_complete',
    ];

    protected function casts(): array
    {
        return [
            'cm_40' => 'integer',
            'price_40' => 'decimal:2',
            'cm_50' => 'integer',
            'price_50' => 'decimal:2',
            'cm_60' => 'integer',
            'price_60' => 'decimal:2',
            'cm_70' => 'integer',
            'price_70' => 'decimal:2',
            'cm_80' => 'integer',
            'price_80' => 'decimal:2',
            'cm_90' => 'integer',
            'price_90' => 'decimal:2',
            'cm_100' => 'integer',
            'price_100' => 'decimal:2',
            'cm_110' => 'integer',
            'price_110' => 'decimal:2',
            'cm_120' => 'integer',
            'price_120' => 'decimal:2',
            'sobrante' => 'integer',
            'price_sobrante' => 'decimal:2',
            'total_classified' => 'integer',
            'total_price' => 'decimal:2',
            'is_complete' => 'boolean',
            'local_quantity' => 'integer',
            'local_is_complete' => 'boolean',
        ];
    }

    public function productEntry(): BelongsTo
    {
        return $this->belongsTo(ProductEntry::class);
    }

    public function rejections(): HasMany
    {
        return $this->hasMany(ClassificationRejection::class);
    }
}
