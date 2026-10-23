<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('workspace_id')->constrained('practice_workspaces')->cascadeOnDelete();
            $table->string('code', 32);
            $table->string('name');
            $table->string('category');
            $table->string('specification', 500)->nullable();
            $table->string('base_unit', 30);
            $table->decimal('cost_price', 18, 2)->default(0);
            $table->decimal('selling_price', 18, 2)->default(0);
            $table->string('photo_path', 255)->nullable();
            $table->unsignedInteger('stock_good')->default(0);
            $table->unsignedInteger('stock_damaged')->default(0);
            $table->timestamp('archived_at')->nullable();
            $table->timestamps();

            $table->unique(['workspace_id', 'code']);
            $table->index(['workspace_id', 'archived_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
