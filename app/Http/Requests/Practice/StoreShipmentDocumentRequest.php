<?php

namespace App\Http\Requests\Practice;

use Illuminate\Foundation\Http\FormRequest;

class StoreShipmentDocumentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'document_type' => ['required', 'string', 'max:50'],
            'document_number' => ['required', 'string', 'max:100'],
            'document_date' => ['nullable', 'date'],
            'notes' => ['nullable', 'string', 'max:500'],
            'file' => ['nullable', 'file', 'mimes:pdf,jpeg,png,jpg', 'max:5120'], // 5MB
        ];
    }

    public function messages(): array
    {
        return [
            'document_type.required' => 'Jenis dokumen wajib dipilih.',
            'document_number.required' => 'Nomor dokumen wajib diisi.',
            'file.mimes' => 'Format file lampiran harus PDF, JPEG, atau PNG.',
            'file.max' => 'Ukuran lampiran maksimal 5 MB.',
        ];
    }
}
