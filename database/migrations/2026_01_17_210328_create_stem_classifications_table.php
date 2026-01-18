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
        Schema::create('stem_classifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_entry_id')->constrained('product_entries')->onDelete('cascade');
            $table->integer('cm_40')->default(0);
            $table->integer('cm_50')->default(0);
            $table->integer('cm_60')->default(0);
            $table->integer('cm_70')->default(0);
            $table->integer('cm_80')->default(0);
            $table->integer('cm_90')->default(0);
            $table->integer('cm_100')->default(0);
            $table->integer('cm_110')->default(0);
            $table->integer('cm_120')->default(0);
            $table->integer('sobrante')->default(0);
            $table->integer('total_classified')->default(0);
            $table->boolean('is_complete')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('stem_classifications');
    }
};
