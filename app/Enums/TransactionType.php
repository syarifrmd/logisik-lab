<?php

namespace App\Enums;

enum TransactionType: string
{
    case Opening = 'opening';
    case Inbound = 'inbound';
    case Outbound = 'outbound';

    public function label(): string
    {
        return match ($this) {
            self::Opening => 'Saldo Awal',
            self::Inbound => 'Barang Masuk',
            self::Outbound => 'Barang Keluar',
        };
    }

    public function numberPrefix(): string
    {
        return match ($this) {
            self::Opening => 'SA',
            self::Inbound => 'BM',
            self::Outbound => 'BK',
        };
    }
}
