<?php

namespace App\Enums;

enum MovementKind: string
{
    case Original = 'original';
    case Reversal = 'reversal';
}
