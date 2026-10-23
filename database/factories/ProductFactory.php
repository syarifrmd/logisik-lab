<?php

namespace Database\Factories;

use App\Models\PracticeWorkspace;
use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Product>
 */
class ProductFactory extends Factory
{
    public function definition(): array
    {
        return [
            'workspace_id' => PracticeWorkspace::factory(),
            'code' => 'BRG'.str_pad((string) fake()->unique()->numberBetween(1, 999), 3, '0', STR_PAD_LEFT),
            'name' => fake()->words(2, true),
            'category' => fake()->randomElement(['ATK', 'Elektronik', 'Furnitur']),
            'specification' => fake()->optional()->sentence(),
            'base_unit' => fake()->randomElement(['pcs', 'box', 'unit']),
            'cost_price' => fake()->randomFloat(2, 1000, 100000),
            'selling_price' => fake()->randomFloat(2, 2000, 150000),
            'photo_path' => null,
            'stock_good' => 0,
            'stock_damaged' => 0,
            'archived_at' => null,
        ];
    }

    public function withStock(int $good = 0, int $damaged = 0): static
    {
        return $this->state(fn (array $attributes) => [
            'stock_good' => $good,
            'stock_damaged' => $damaged,
        ]);
    }

    public function archived(): static
    {
        return $this->state(fn (array $attributes) => [
            'archived_at' => now(),
        ]);
    }
}
