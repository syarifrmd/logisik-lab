<?php

namespace Database\Factories;

use App\Enums\StockCondition;
use App\Enums\TransactionType;
use App\Models\PracticeWorkspace;
use App\Models\Product;
use App\Models\StockTransaction;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<StockTransaction>
 */
class StockTransactionFactory extends Factory
{
    public function definition(): array
    {
        return [
            'workspace_id' => PracticeWorkspace::factory(),
            'product_id' => Product::factory(),
            'transaction_number' => 'BM-'.now()->format('Ymd').'-'.str_pad((string) fake()->unique()->numberBetween(1, 9999), 4, '0', STR_PAD_LEFT),
            'type' => TransactionType::Inbound->value,
            'transaction_date' => today(),
            'external_document_number' => fake()->numerify('DOC-####'),
            'supplier' => fake()->company(),
            'recipient' => null,
            'reason' => null,
            'storage_location' => fake()->word(),
            'stock_condition' => StockCondition::Good->value,
            'quantity' => fake()->numberBetween(1, 100),
            'unit_price' => fake()->randomFloat(2, 1000, 50000),
            'total_amount' => 0,
            'notes' => null,
            'product_snapshot' => [],
            'idempotency_key' => fake()->unique()->uuid(),
            'request_hash' => null,
            'voided_at' => null,
            'void_reason' => null,
        ];
    }
}
