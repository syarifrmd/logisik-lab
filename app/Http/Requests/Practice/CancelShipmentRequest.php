<?php

namespace App\Http\Requests\Practice;

use Illuminate\Foundation\Http\FormRequest;

class CancelShipmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'reason' => ['required', 'string', 'min:5', 'max:500'],
        ];
    }

    public function messages(): array
    {
        return [
            'reason.required' => 'Alasan pembatalan pengiriman wajib diisi.',
            'reason.min' => 'Alasan pembatalan minimal 5 karakter.',
            'reason.max' => 'Alasan pembatalan maksimal 500 karakter.',
        ];
    }
}
