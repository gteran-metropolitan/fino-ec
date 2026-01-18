<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Variety extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'species_id',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public function species(): BelongsTo
    {
        return $this->belongsTo(Species::class);
    }

    public function productEntries(): HasMany
    {
        return $this->hasMany(ProductEntry::class);
    }
}
