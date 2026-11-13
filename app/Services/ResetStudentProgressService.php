<?php

namespace App\Services;

use App\Models\Product;
use App\Models\ShipmentDocument;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use RuntimeException;

class ResetStudentProgressService
{
    /**
     * Reset all practice data for a student while preserving their account.
     */
    public function reset(User $student): void
    {
        $workspace = $student->workspace()->first();

        if ($workspace === null) {
            return;
        }

        $files = DB::transaction(function () use ($workspace): array {
            $files = Product::query()
                ->where('workspace_id', $workspace->id)
                ->whereNotNull('photo_path')
                ->pluck('photo_path')
                ->all();

            $files = array_merge(
                $files,
                ShipmentDocument::query()
                    ->whereHas('shipment', fn ($query) => $query->where('workspace_id', $workspace->id))
                    ->whereNotNull('attachment_path')
                    ->pluck('attachment_path')
                    ->all(),
            );

            $workspace->delete();

            return $files;
        });

        $disk = Storage::disk('private');

        foreach (array_unique($files) as $file) {
            if ($disk->exists($file) && ! $disk->delete($file)) {
                throw new RuntimeException("Gagal menghapus berkas progres: {$file}");
            }
        }
    }
}
