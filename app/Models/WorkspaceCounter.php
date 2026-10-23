<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $workspace_id
 * @property string $counter_type
 * @property Carbon $counter_date
 * @property int $next_number
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read PracticeWorkspace $workspace
 */
#[Fillable(['workspace_id', 'counter_type', 'counter_date', 'next_number'])]
class WorkspaceCounter extends Model
{
    protected $guarded = [];

    /**
     * @return BelongsTo<PracticeWorkspace, $this>
     */
    public function workspace(): BelongsTo
    {
        return $this->belongsTo(PracticeWorkspace::class);
    }

    protected function casts(): array
    {
        return [
            'counter_date' => 'date',
            'next_number' => 'integer',
        ];
    }
}
