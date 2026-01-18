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
            'Rosa' => [
                'Explorer',
                'Pink Floyd',
                'Freedom',
                'Vendela',
                'Red Naomi',
                'Mondial',
                'Brighton',
                'High & Magic',
            ],
            'Clavel' => [
                'Nobbio',
                'Baltico',
                'Nelson',
                'Prado',
                'Tempo',
            ],
            'Gypsophila' => [
                'Million Stars',
                'Xlence',
                'New Love',
            ],
            'Lirio' => [
                'Casablanca',
                'Stargazer',
                'Siberia',
            ],
            'Crisantemo' => [
                'Anastasia',
                'Bacardi',
                'Zembla',
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
