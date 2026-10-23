<?php

namespace App\Enums;

enum StockCondition: string
{
    case Good = 'good';
    case Damaged = 'damaged';

    public function label(): string
    {
        return match ($this) {
            self::Good => 'Baik',
            self::Damaged => 'Rusak',
        };
    }
}
