<?php

namespace Database\Factories;

use App\Models\PracticeWorkspace;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<PracticeWorkspace>
 */
class PracticeWorkspaceFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'last_activity_at' => null,
        ];
    }
}
