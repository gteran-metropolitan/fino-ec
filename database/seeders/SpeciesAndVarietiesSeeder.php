<?php

namespace Database\Seeders;

use App\Models\Species;
use App\Models\Variety;
use Illuminate\Database\Seeder;

class SpeciesAndVarietiesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $speciesData = [
            'ROSA' => [
                'EXPLORER',
                'PINK FLOYD',
                'FREEDOM',
                'VENDELA',
                'RED NAOMI',
                'MONDIAL',
                'BRIGHTON',
                'HIGH & MAGIC',
            ],
            'CLAVEL' => [
                'NOBBIO',
                'BALTICO',
                'NELSON',
                'PRADO',
                'TEMPO',
            ],
            'GYPSOPHILA' => [
                'MILLION STARS',
                'XLENCE',
                'NEW LOVE',
            ],
            'LIRIO' => [
                'CASABLANCA',
                'STARGAZER',
                'SIBERIA',
            ],
            'CRISANTEMO' => [
                'ANASTASIA',
                'BACARDI',
                'ZEMBLA',
            ],
        ];

        foreach ($speciesData as $speciesName => $varieties) {
            $species = Species::firstOrCreate(
                ['name' => $speciesName],
                ['is_active' => true]
            );

            foreach ($varieties as $varietyName) {
                Variety::firstOrCreate(
                    [
                        'name' => $varietyName,
                        'species_id' => $species->id,
                    ],
                    ['is_active' => true]
                );
            }
        }
    }
}
