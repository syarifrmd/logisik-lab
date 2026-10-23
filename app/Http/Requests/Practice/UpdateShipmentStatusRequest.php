<?php

namespace App\Http\Requests\Practice;

use Illuminate\Foundation\Http\FormRequest;

class UpdateShipmentStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'status' => ['required', 'string', 'in:shipped,in_transit,received'],
            'received_date' => ['nullable', 'date', 'before_or_equal:today'],
        ];
    }

    public function messages(): array
    {
        return [
            'status.required' => 'Status baru wajib ditentukan.',
            'status.in' => 'Status harus Dikirim, Dalam Perjalanan, atau Diterima.',
            'received_date.before_or_equal' => 'Tanggal diterima tidak boleh melebihi hari ini.',
        ];
    }
}
