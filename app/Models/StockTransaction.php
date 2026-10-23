<?php

namespace App\Models;

use App\Enums\OutboundReason;
use App\Enums\StockCondition;
use App\Enums\TransactionType;
use Database\Factories\StockTransactionFactory;
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
 * @property int $product_id
 * @property string $transaction_number
 * @property string $type
 * @property Carbon $transaction_date
 * @property string|null $external_document_number
 * @property string|null $supplier
 * @property string|null $recipient
 * @property string|null $reason
 * @property string|null $storage_location
 * @property string $stock_condition
 * @property int $quantity
 * @property string $unit_price
 * @property string $total_amount
 * @property string|null $notes
 * @property array $product_snapshot
 * @property string $idempotency_key
 * @property string|null $request_hash
 * @property Carbon|null $voided_at
 * @property string|null $void_reason
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read PracticeWorkspace $workspace
 * @property-read Product $product
 * @property-read Collection<int, InventoryMovement> $inventoryMovements
 */
#[Fillable(['workspace_id', 'product_id', 'transaction_number', 'type', 'transaction_date', 'external_document_number', 'supplier', 'recipient', 'reason', 'storage_location', 'stock_condition', 'quantity', 'unit_price', 'total_amount', 'notes', 'product_snapshot', 'idempotency_key', 'request_hash', 'voided_at', 'void_reason'])]
#[Hidden(['product_snapshot'])]
class StockTransaction extends Model
{
    /** @use HasFactory<StockTransactionFactory> */
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
     * @return BelongsTo<Product, $this>
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * @return HasMany<InventoryMovement, $this>
     */
    public function inventoryMovements(): HasMany
    {
        return $this->hasMany(InventoryMovement::class);
    }

    public function getIsVoidedAttribute(): bool
    {
        return $this->voided_at !== null;
    }

    public function getTypeEnumAttribute(): ?TransactionType
    {
        return TransactionType::tryFrom($this->type);
    }

    public function getStockConditionEnumAttribute(): ?StockCondition
    {
        return StockCondition::tryFrom($this->stock_condition);
    }

    public function getReasonEnumAttribute(): ?OutboundReason
    {
        return $this->reason !== null ? OutboundReason::tryFrom($this->reason) : null;
    }

    protected function casts(): array
    {
        return [
            'transaction_date' => 'date',
            'quantity' => 'integer',
            'unit_price' => 'decimal:2',
            'total_amount' => 'decimal:2',
            'product_snapshot' => 'array',
            'voided_at' => 'datetime',
        ];
    }
}
