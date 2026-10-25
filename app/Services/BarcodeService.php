<?php

namespace App\Services;

use Picqer\Barcode\BarcodeGeneratorSVG;

class BarcodeService
{
    public function svg(string $code, float $widthFactor = 2, float $height = 80): string
    {
        $generator = new BarcodeGeneratorSVG;
        $barcode = $generator->getBarcode(
            $code,
            BarcodeGeneratorSVG::TYPE_CODE_128,
            $widthFactor,
            $height,
        );

        return sprintf(
            '<svg xmlns="http://www.w3.org/2000/svg" width="100%%" height="%1$F" viewBox="0 0 %2$d %1$F" preserveAspectRatio="xMidYMid meet"><rect width="100%%" height="100%%" fill="#fff"/><g transform="translate(%3$d 0)">%4$s</g></svg>',
            $height,
            $this->barcodeWidth($barcode) + 2 * $this->quietZone($widthFactor),
            $this->quietZone($widthFactor),
            preg_replace('/<\?xml.*?\?>|<!DOCTYPE.*?>/s', '', $barcode),
        );
    }

    private function quietZone(float $widthFactor): int
    {
        return (int) ceil(10 * $widthFactor);
    }

    private function barcodeWidth(string $barcode): int
    {
        preg_match('/viewBox="0 0 ([0-9.]+) /', $barcode, $matches);

        return (int) ceil((float) ($matches[1] ?? 0));
    }
}
