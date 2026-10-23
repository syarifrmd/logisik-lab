<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Shipment extends Model
{
    use HasFactory;

    protected $guarded = ['id'];

    protected $casts = [
        'shipping_date' => 'date',
        'estimated_arrival_date' => 'date',
        'received_date' => 'date',
        'tariffs_and_taxes' => 'decimal:2',
        'estimated_cost' => 'decimal:2',
        'total_weight_kg' => 'decimal:3',
        'volume_m3' => 'decimal:3',
        'cancelled_at' => 'datetime',
    ];

    public function workspace(): BelongsTo
    {
        return $this->belongsTo(PracticeWorkspace::class, 'workspace_id');
    }

    public function items(): HasMany
    {
        return $this->hasMany(ShipmentItem::class);
    }

    public function documents(): HasMany
    {
        return $this->hasMany(ShipmentDocument::class);
    }

    public function statusHistories(): HasMany
    {
        return $this->hasMany(ShipmentStatusHistory::class);
    }
}
