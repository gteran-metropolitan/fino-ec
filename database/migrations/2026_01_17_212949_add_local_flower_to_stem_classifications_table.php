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
            // Campos para Flor Local/Nacional
            $table->integer('local_quantity')->default(0)->after('sobrante');
            $table->text('local_reason')->nullable()->after('local_quantity');
            $table->boolean('local_is_complete')->default(false)->after('local_reason');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('stem_classifications', function (Blueprint $table) {
            $table->dropColumn(['local_quantity', 'local_reason', 'local_is_complete']);
        });
    }
};
