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
        Schema::create('shipments', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('workspace_id')->constrained('practice_workspaces')->cascadeOnDelete();
            $table->string('shipment_number', 50);
            $table->string('shipment_type', 20); // domestic, export, import
            $table->string('origin', 150);
            $table->string('destination', 150);
            $table->string('origin_country', 100)->default('Indonesia');
            $table->string('destination_country', 100)->default('Indonesia');
            $table->string('incoterms', 30)->nullable();
            $table->string('customs_document_type', 20)->nullable(); // PEB, PIB
            $table->string('customs_document_number', 100)->nullable();
            $table->decimal('tariffs_and_taxes', 18, 2)->default(0);
            $table->string('transport_mode', 20); // land, sea, air
            $table->string('fleet_type', 100);
            $table->string('driver_name', 150)->nullable();
            $table->string('carrier_service', 150)->nullable();
            $table->string('tracking_number', 100)->nullable();
            $table->text('mode_selection_reason');
            $table->decimal('estimated_cost', 18, 2)->default(0);
            $table->string('cargo_type', 50); // general, fragile, liquid, perishable, other
            $table->string('cargo_type_details', 150)->nullable();
            $table->decimal('total_weight_kg', 10, 3);
            $table->decimal('volume_m3', 10, 3)->nullable();
            $table->string('packaging_type', 50); // box, pallet, crate, container, other
            $table->string('packaging_type_details', 150)->nullable();
            $table->text('handling_instructions');
            $table->text('special_notes')->nullable();
            $table->date('shipping_date');
            $table->date('estimated_arrival_date');
            $table->date('received_date')->nullable();
            $table->string('status', 30)->default('scheduled'); // scheduled, shipped, in_transit, received, cancelled
            $table->text('cancellation_reason')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->string('idempotency_key', 100);
            $table->timestamps();

            $table->unique(['workspace_id', 'shipment_number']);
            $table->unique(['workspace_id', 'idempotency_key']);
            $table->index(['workspace_id', 'status']);
            $table->index(['workspace_id', 'shipping_date']);
        });

        Schema::create('shipment_items', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('shipment_id')->constrained('shipments')->cascadeOnDelete();
            $table->foreignId('stock_transaction_id')->nullable()->constrained('stock_transactions')->nullOnDelete();
            $table->foreignId('product_id')->nullable()->constrained('products')->nullOnDelete();
            $table->string('product_code_snapshot', 32);
            $table->string('product_name_snapshot', 150);
            $table->string('category_snapshot', 80);
            $table->string('base_unit_snapshot', 30);
            $table->string('stock_condition', 20)->default('good');
            $table->integer('quantity');
            $table->timestamps();

            $table->index(['shipment_id', 'stock_transaction_id']);
        });

        Schema::create('shipment_documents', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('shipment_id')->constrained('shipments')->cascadeOnDelete();
            $table->string('document_type', 50);
            $table->string('document_number', 100);
            $table->date('document_date')->nullable();
            $table->text('notes')->nullable();
            $table->string('attachment_path')->nullable();
            $table->string('attachment_name')->nullable();
            $table->timestamps();

            $table->index(['shipment_id', 'document_type']);
        });

        Schema::create('shipment_status_histories', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('shipment_id')->constrained('shipments')->cascadeOnDelete();
            $table->string('from_status', 30)->nullable();
            $table->string('to_status', 30);
            $table->text('notes')->nullable();
            $table->timestamp('created_at')->useCurrent();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('shipment_status_histories');
        Schema::dropIfExists('shipment_documents');
        Schema::dropIfExists('shipment_items');
        Schema::dropIfExists('shipments');
    }
};
