<?php

namespace App\Enums;

enum OutboundReason: string
{
    case Sale = 'sale';
    case Usage = 'usage';
    case Return = 'return';

    public function label(): string
    {
        return match ($this) {
            self::Sale => 'Penjualan',
            self::Usage => 'Pemakaian',
            self::Return => 'Retur',
        };
    }
}
