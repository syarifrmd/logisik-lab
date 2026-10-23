<?php

namespace App\Models;

use App\Enums\MovementKind;
use App\Enums\StockCondition;
use Database\Factories\InventoryMovementFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $workspace_id
 * @property int $product_id
 * @property int $stock_transaction_id
 * @property string $movement_kind
 * @property string $stock_condition
 * @property int $quantity_delta
 * @property Carbon $effective_date
 * @property Carbon|null $created_at
 * @property-read PracticeWorkspace $workspace
 * @property-read Product $product
 * @property-read StockTransaction $stockTransaction
 */
#[Fillable(['workspace_id', 'product_id', 'stock_transaction_id', 'movement_kind', 'stock_condition', 'quantity_delta', 'effective_date'])]
class InventoryMovement extends Model
{
    /** @use HasFactory<InventoryMovementFactory> */
    use HasFactory;

    public const UPDATED_AT = null;

    protected $guarded = [];

    /**
     * @return BelongsTo<PracticeWorkspace, $this>
     */
    public function workspace(): BelongsTo
    {
        return $this->belongsTo(PracticeWorkspace::class);
    }

    /**
     * @return BelongsTo<Product, $this>
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * @return BelongsTo<StockTransaction, $this>
     */
    public function stockTransaction(): BelongsTo
    {
        return $this->belongsTo(StockTransaction::class);
    }

    public function getMovementKindEnumAttribute(): ?MovementKind
    {
        return MovementKind::tryFrom($this->movement_kind);
    }

    public function getStockConditionEnumAttribute(): ?StockCondition
    {
        return StockCondition::tryFrom($this->stock_condition);
    }

    protected function casts(): array
    {
        return [
            'effective_date' => 'date',
            'quantity_delta' => 'integer',
        ];
    }
}
