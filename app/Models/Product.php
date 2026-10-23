<?php

namespace App\Models;

use App\Enums\StockCondition;
use Database\Factories\ProductFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $workspace_id
 * @property string $code
 * @property string $name
 * @property string $category
 * @property string|null $specification
 * @property string $base_unit
 * @property string $cost_price
 * @property string $selling_price
 * @property string|null $photo_path
 * @property int $stock_good
 * @property int $stock_damaged
 * @property Carbon|null $archived_at
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read PracticeWorkspace $workspace
 * @property-read Collection<int, StockTransaction> $stockTransactions
 * @property-read Collection<int, InventoryMovement> $inventoryMovements
 */
#[Fillable(['workspace_id', 'code', 'name', 'category', 'specification', 'base_unit', 'cost_price', 'selling_price', 'photo_path', 'stock_good', 'stock_damaged', 'archived_at'])]
#[Hidden(['photo_path'])]
class Product extends Model
{
    /** @use HasFactory<ProductFactory> */
    use HasFactory;

    protected $guarded = [];

    /**
     * @return BelongsTo<PracticeWorkspace, $this>
     */
    public function workspace(): BelongsTo
    {
        return $this->belongsTo(PracticeWorkspace::class);
    }

    /**
     * @return HasMany<StockTransaction, $this>
     */
    public function stockTransactions(): HasMany
    {
        return $this->hasMany(StockTransaction::class);
    }

    /**
     * @return HasMany<InventoryMovement, $this>
     */
    public function inventoryMovements(): HasMany
    {
        return $this->hasMany(InventoryMovement::class);
    }

    public function getStockPhysicalAttribute(): int
    {
        return $this->stock_good + $this->stock_damaged;
    }

    public function getIsActiveAttribute(): bool
    {
        return $this->archived_at === null;
    }

    public function stockForCondition(StockCondition $condition): int
    {
        return $condition === StockCondition::Good ? $this->stock_good : $this->stock_damaged;
    }

    protected function casts(): array
    {
        return [
            'cost_price' => 'decimal:2',
            'selling_price' => 'decimal:2',
            'stock_good' => 'integer',
            'stock_damaged' => 'integer',
            'archived_at' => 'datetime',
        ];
    }
}
