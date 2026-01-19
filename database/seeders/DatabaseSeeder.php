<?php

namespace Database\Seeders;

use App\Models\Supplier;
use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Crear Super Admin si no existe
        User::firstOrCreate(
            ['email' => 'gteran@fino-system.com'],
            [
                'name' => 'Guillermo Terán',
                'email' => 'gteran@fino-system.com',
                'password' => 'Metro123',
                'role' => 'super_admin',
                'is_active' => true,
                'email_verified_at' => now(),
            ]
        );



        // Crear especies y variedades
        $this->call(SpeciesAndVarietiesSeeder::class);
    }
}
