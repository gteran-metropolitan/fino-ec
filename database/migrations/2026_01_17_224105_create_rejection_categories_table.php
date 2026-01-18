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
        // Tabla de categorías principales (Enfermedades, Plagas, Daño Mecánico, etc.)
        Schema::create('rejection_categories', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // Tabla de subcategorías (Botrytis, Trips, etc.)
        Schema::create('rejection_subcategories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('rejection_category_id')->constrained('rejection_categories')->onDelete('cascade');
            $table->string('name');
            $table->string('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // Tabla pivote para registrar múltiples razones de rechazo por clasificación
        Schema::create('classification_rejections', function (Blueprint $table) {
            $table->id();
            $table->foreignId('stem_classification_id')->constrained('stem_classifications')->onDelete('cascade');
            $table->foreignId('rejection_category_id')->constrained('rejection_categories');
            $table->foreignId('rejection_subcategory_id')->nullable()->constrained('rejection_subcategories');
            $table->integer('quantity')->default(0);
            $table->text('detail')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('classification_rejections');
        Schema::dropIfExists('rejection_subcategories');
        Schema::dropIfExists('rejection_categories');
    }
};
