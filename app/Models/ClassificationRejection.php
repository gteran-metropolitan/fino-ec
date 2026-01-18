<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ClassificationRejection extends Model
{
    use HasFactory;

    protected $fillable = [
        'stem_classification_id',
        'rejection_category_id',
        'rejection_subcategory_id',
        'quantity',
        'detail',
    ];

    protected function casts(): array
    {
        return [
            'quantity' => 'integer',
        ];
    }

    public function stemClassification(): BelongsTo
    {
        return $this->belongsTo(StemClassification::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(RejectionCategory::class, 'rejection_category_id');
    }

    public function subcategory(): BelongsTo
    {
        return $this->belongsTo(RejectionSubcategory::class, 'rejection_subcategory_id');
    }
}
