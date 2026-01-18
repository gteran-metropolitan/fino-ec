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
                'name' => 'Enfermedades',
                'description' => 'Enfermedades que afectan la calidad de la flor',
                'subcategories' => [
                    ['name' => 'Botrytis', 'description' => 'Moho gris que afecta pétalos y tallos'],
                    ['name' => 'Velloso', 'description' => 'Mildiu velloso en hojas'],
                    ['name' => 'Oídio', 'description' => 'Polvo blanco en hojas y tallos'],
                    ['name' => 'Roya', 'description' => 'Manchas anaranjadas en hojas'],
                    ['name' => 'Fusarium', 'description' => 'Marchitez vascular'],
                ],
            ],
            [
                'name' => 'Plagas',
                'description' => 'Insectos y ácaros que dañan la flor',
                'subcategories' => [
                    ['name' => 'Trips', 'description' => 'Insectos pequeños que raspan pétalos'],
                    ['name' => 'Pulgones', 'description' => 'Áfidos que succionan savia'],
                    ['name' => 'Ácaros', 'description' => 'Arañitas rojas o blancas'],
                    ['name' => 'Mosca Blanca', 'description' => 'Insectos blancos voladores'],
                    ['name' => 'Minadores', 'description' => 'Larvas que hacen túneles en hojas'],
                ],
            ],
            [
                'name' => 'Daño Mecánico',
                'description' => 'Daños físicos durante el manejo',
                'subcategories' => [
                    ['name' => 'Tallo Quebrado', 'description' => 'Rotura del tallo'],
                    ['name' => 'Pétalos Dañados', 'description' => 'Magulladuras o rasgaduras en pétalos'],
                    ['name' => 'Cabeza Torcida', 'description' => 'Deformación de la flor'],
                    ['name' => 'Corte Irregular', 'description' => 'Mal corte en la base del tallo'],
                ],
            ],
            [
                'name' => 'Defectos de Calidad',
                'description' => 'Problemas de calidad inherentes',
                'subcategories' => [
                    ['name' => 'Color Deslavado', 'description' => 'Pérdida de intensidad del color'],
                    ['name' => 'Tamaño Insuficiente', 'description' => 'Cabeza muy pequeña'],
                    ['name' => 'Malformación', 'description' => 'Forma anormal de la flor'],
                    ['name' => 'Apertura Prematura', 'description' => 'Flor muy abierta'],
                    ['name' => 'Pétalos Quemados', 'description' => 'Daño por sol o químicos'],
                ],
            ],
            [
                'name' => 'Otros',
                'description' => 'Otras razones de rechazo',
                'subcategories' => [
                    ['name' => 'Deshidratación', 'description' => 'Flor marchita por falta de agua'],
                    ['name' => 'Contaminación', 'description' => 'Residuos o suciedad'],
                    ['name' => 'Sin Especificar', 'description' => 'Razón no categorizada'],
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
