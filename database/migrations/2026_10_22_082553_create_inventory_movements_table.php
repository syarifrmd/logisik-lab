<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('inventory_movements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('workspace_id')->constrained('practice_workspaces')->cascadeOnDelete();
            $table->foreignId('product_id')->constrained('products')->cascadeOnDelete();
            $table->foreignId('stock_transaction_id')->constrained('stock_transactions')->cascadeOnDelete();
            $table->string('movement_kind', 10); // original, reversal
            $table->string('stock_condition', 10); // good, damaged
            $table->integer('quantity_delta'); // signed: positive for in, negative for out
            $table->date('effective_date');
            $table->timestamp('created_at')->nullable();

            $table->index(['workspace_id', 'product_id', 'stock_condition', 'effective_date'], 'im_ledger_index');
            $table->index(['workspace_id', 'stock_transaction_id'], 'im_txn_index');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inventory_movements');
    }
};
