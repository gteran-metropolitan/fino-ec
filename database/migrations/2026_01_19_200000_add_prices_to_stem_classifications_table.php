<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('stem_classifications', function (Blueprint $table) {
            // Precios unitarios por tamaño de tallo
            $table->decimal('price_40', 10, 2)->default(0)->after('cm_40');
            $table->decimal('price_50', 10, 2)->default(0)->after('cm_50');
            $table->decimal('price_60', 10, 2)->default(0)->after('cm_60');
            $table->decimal('price_70', 10, 2)->default(0)->after('cm_70');
            $table->decimal('price_80', 10, 2)->default(0)->after('cm_80');
            $table->decimal('price_90', 10, 2)->default(0)->after('cm_90');
            $table->decimal('price_100', 10, 2)->default(0)->after('cm_100');
            $table->decimal('price_110', 10, 2)->default(0)->after('cm_110');
            $table->decimal('price_120', 10, 2)->default(0)->after('cm_120');
            $table->decimal('price_sobrante', 10, 2)->default(0)->after('sobrante');

            // Total calculado de la variedad
            $table->decimal('total_price', 12, 2)->default(0)->after('total_classified');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('stem_classifications', function (Blueprint $table) {
            $table->dropColumn([
                'price_40',
                'price_50',
                'price_60',
                'price_70',
                'price_80',
                'price_90',
                'price_100',
                'price_110',
                'price_120',
                'price_sobrante',
                'total_price',
            ]);
        });
    }
};

