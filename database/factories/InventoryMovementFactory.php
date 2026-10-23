<?php

namespace Database\Factories;

use App\Enums\MovementKind;
use App\Enums\StockCondition;
use App\Models\InventoryMovement;
use App\Models\PracticeWorkspace;
use App\Models\Product;
use App\Models\StockTransaction;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<InventoryMovement>
 */
class InventoryMovementFactory extends Factory
{
    public function definition(): array
    {
        return [
            'workspace_id' => PracticeWorkspace::factory(),
            'product_id' => Product::factory(),
            'stock_transaction_id' => StockTransaction::factory(),
            'movement_kind' => MovementKind::Original->value,
            'stock_condition' => StockCondition::Good->value,
            'quantity_delta' => fake()->numberBetween(1, 100),
            'effective_date' => today(),
        ];
    }
}
