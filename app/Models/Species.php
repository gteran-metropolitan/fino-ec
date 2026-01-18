<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Species extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public function varieties(): HasMany
    {
        return $this->hasMany(Variety::class);
    }

    public function productEntries(): HasMany
    {
        return $this->hasMany(ProductEntry::class);
    }
}
