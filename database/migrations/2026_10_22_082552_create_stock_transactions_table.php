<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('stock_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('workspace_id')->constrained('practice_workspaces')->cascadeOnDelete();
            $table->foreignId('product_id')->constrained('products')->cascadeOnDelete();
            $table->string('transaction_number', 50);
            $table->string('type', 20); // opening, inbound, outbound
            $table->date('transaction_date');
            $table->string('external_document_number', 100)->nullable();
            $table->string('supplier', 150)->nullable();
            $table->string('recipient', 150)->nullable();
            $table->string('reason', 30)->nullable(); // sale, usage, return
            $table->string('storage_location', 150)->nullable();
            $table->string('stock_condition', 10); // good, damaged
            $table->unsignedInteger('quantity');
            $table->decimal('unit_price', 18, 2);
            $table->decimal('total_amount', 18, 2);
            $table->text('notes')->nullable();
            $table->json('product_snapshot');
            $table->string('idempotency_key', 100);
            $table->string('request_hash', 64)->nullable();
            $table->timestamp('voided_at')->nullable();
            $table->text('void_reason')->nullable();
            $table->timestamps();

            $table->unique(['workspace_id', 'transaction_number']);
            $table->unique(['workspace_id', 'type', 'idempotency_key']);
            $table->index(['workspace_id', 'transaction_date']);
            $table->index(['workspace_id', 'product_id']);
            $table->index(['workspace_id', 'type', 'voided_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('stock_transactions');
    }
};
