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
        'cm_50',
        'cm_60',
        'cm_70',
        'cm_80',
        'cm_90',
        'cm_100',
        'cm_110',
        'cm_120',
        'sobrante',
        'total_classified',
        'is_complete',
        'local_quantity',
        'local_reason',
        'local_is_complete',
    ];

    protected function casts(): array
    {
        return [
            'cm_40' => 'integer',
            'cm_50' => 'integer',
            'cm_60' => 'integer',
            'cm_70' => 'integer',
            'cm_80' => 'integer',
            'cm_90' => 'integer',
            'cm_100' => 'integer',
            'cm_110' => 'integer',
            'cm_120' => 'integer',
            'sobrante' => 'integer',
            'total_classified' => 'integer',
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
