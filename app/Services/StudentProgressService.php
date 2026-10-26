<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Database\Eloquent\Builder;

class StudentProgressService
{
    /** @param Builder<User> $query
     * @return Builder<User>
     */
    public function withProgress(Builder $query): Builder
    {
        return $query->with(['workspace' => fn ($workspace) => $workspace
            ->withCount([
                'products as product_count' => fn ($products) => $products->whereNull('archived_at'),
                'stockTransactions as inbound_count' => fn ($transactions) => $transactions->where('type', 'inbound')->whereNull('voided_at'),
                'stockTransactions as outbound_count' => fn ($transactions) => $transactions->where('type', 'outbound')->whereNull('voided_at'),
                'shipments as shipment_count' => fn ($shipments) => $shipments->where('status', '!=', 'cancelled'),
                'shipments as received_count' => fn ($shipments) => $shipments->where('status', 'received'),
            ])
            ->withSum('products as stock_good', 'stock_good')
            ->withSum('products as stock_damaged', 'stock_damaged')]);
    }

    /** @return array{product_count: int, inbound_count: int, outbound_count: int, shipment_count: int, received_count: int, stock_good: int, stock_damaged: int, completed_steps: int, total_steps: int, percentage: int, last_activity_at: string|null} */
    public function summarize(User $student): array
    {
        $workspace = $student->workspace;
        $counts = [];
        foreach (['product_count', 'inbound_count', 'outbound_count', 'shipment_count', 'received_count', 'stock_good', 'stock_damaged'] as $attribute) {
            $counts[$attribute] = (int) ($workspace?->getAttribute($attribute) ?? 0);
        }
        $completed = collect(['product_count', 'inbound_count', 'outbound_count', 'shipment_count', 'received_count'])
            ->filter(fn (string $attribute) => $counts[$attribute] > 0)->count();

        return [...$counts, 'completed_steps' => $completed, 'total_steps' => 5, 'percentage' => $completed * 20, 'last_activity_at' => $workspace?->last_activity_at?->toIso8601String()];
    }
}
