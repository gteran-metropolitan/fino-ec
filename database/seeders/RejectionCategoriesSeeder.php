<?php

namespace Database\Seeders;

use App\Models\RejectionCategory;
use App\Models\RejectionSubcategory;
use Illuminate\Database\Seeder;

class RejectionCategoriesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            [
                'name' => 'ENFERMEDADES',
                'description' => 'Enfermedades que afectan la calidad de la flor',
                'subcategories' => [
                    ['name' => 'BOTRYTIS', 'description' => 'Moho gris que afecta pétalos y tallos'],
                    ['name' => 'VELLOSO', 'description' => 'Mildiu velloso en hojas'],
                    ['name' => 'OÍDIO', 'description' => 'Polvo blanco en hojas y tallos'],
                    ['name' => 'ROYA', 'description' => 'Manchas anaranjadas en hojas'],
                    ['name' => 'FUSARIUM', 'description' => 'Marchitez vascular'],
                ],
            ],
            [
                'name' => 'PLAGAS',
                'description' => 'Insectos y ácaros que dañan la flor',
                'subcategories' => [
                    ['name' => 'TRIPS', 'description' => 'Insectos pequeños que raspan pétalos'],
                    ['name' => 'PULGONES', 'description' => 'Áfidos que succionan savia'],
                    ['name' => 'ÁCAROS', 'description' => 'Arañitas rojas o blancas'],
                    ['name' => 'MOSCA BLANCA', 'description' => 'Insectos blancos voladores'],
                    ['name' => 'MINADORES', 'description' => 'Larvas que hacen túneles en hojas'],
                ],
            ],
            [
                'name' => 'DAÑO MECÁNICO',
                'description' => 'Daños físicos durante el manejo',
                'subcategories' => [
                    ['name' => 'TALLO QUEBRADO', 'description' => 'Rotura del tallo'],
                    ['name' => 'PÉTALOS DAÑADOS', 'description' => 'Magulladuras o rasgaduras en pétalos'],
                    ['name' => 'CABEZA TORCIDA', 'description' => 'Deformación de la flor'],
                    ['name' => 'CORTE IRREGULAR', 'description' => 'Mal corte en la base del tallo'],
                ],
            ],
            [
                'name' => 'DEFECTOS DE CALIDAD',
                'description' => 'Problemas de calidad inherentes',
                'subcategories' => [
                    ['name' => 'COLOR DESLAVADO', 'description' => 'Pérdida de intensidad del color'],
                    ['name' => 'TAMAÑO INSUFICIENTE', 'description' => 'Cabeza muy pequeña'],
                    ['name' => 'MALFORMACIÓN', 'description' => 'Forma anormal de la flor'],
                    ['name' => 'APERTURA PREMATURA', 'description' => 'Flor muy abierta'],
                    ['name' => 'PÉTALOS QUEMADOS', 'description' => 'Daño por sol o químicos'],
                ],
            ],
            [
                'name' => 'OTROS',
                'description' => 'Otras razones de rechazo',
                'subcategories' => [
                    ['name' => 'DESHIDRATACIÓN', 'description' => 'Flor marchita por falta de agua'],
                    ['name' => 'CONTAMINACIÓN', 'description' => 'Residuos o suciedad'],
                    ['name' => 'SIN ESPECIFICAR', 'description' => 'Razón no categorizada'],
                ],
            ],
        ];

        foreach ($categories as $categoryData) {
            $subcategories = $categoryData['subcategories'];
            unset($categoryData['subcategories']);

            $category = RejectionCategory::create($categoryData);

            foreach ($subcategories as $subcategoryData) {
                $category->subcategories()->create($subcategoryData);
            }
        }
    }
}
