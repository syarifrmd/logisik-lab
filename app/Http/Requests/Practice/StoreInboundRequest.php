<?php

namespace App\Http\Requests\Practice;

use Illuminate\Foundation\Http\FormRequest;

class StoreInboundRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'product_id' => ['required', 'integer', 'exists:products,id'],
            'transaction_date' => ['required', 'date', 'before_or_equal:today'],
            'external_document_number' => ['required', 'string', 'max:100'],
            'supplier' => ['required', 'string', 'max:150'],
            'stock_condition' => ['required', 'string', 'in:good,damaged'],
            'storage_location' => ['required', 'string', 'max:150'],
            'quantity' => ['required', 'integer', 'min:1', 'max:1000000'],
            'unit_price' => ['required', 'numeric', 'min:0', 'max:999999999.99'],
            'notes' => ['nullable', 'string', 'max:1000'],
            'idempotency_key' => ['required', 'string', 'max:100'],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function messages(): array
    {
        return [
            'product_id.required' => 'Barang wajib dipilih.',
            'product_id.exists' => 'Barang tidak ditemukan.',
            'transaction_date.required' => 'Tanggal masuk wajib diisi.',
            'transaction_date.before_or_equal' => 'Tanggal masuk tidak boleh melebihi hari ini.',
            'external_document_number.required' => 'Nomor dokumen penerimaan wajib diisi.',
            'supplier.required' => 'Supplier wajib diisi.',
            'stock_condition.required' => 'Kondisi barang wajib dipilih.',
            'stock_condition.in' => 'Kondisi barang harus Baik atau Rusak.',
            'storage_location.required' => 'Lokasi penyimpanan wajib diisi.',
            'quantity.required' => 'Jumlah wajib diisi.',
            'quantity.min' => 'Jumlah harus lebih dari 0.',
            'quantity.integer' => 'Jumlah harus bilangan bulat.',
            'unit_price.required' => 'Harga pokok wajib diisi.',
            'idempotency_key.required' => 'Token idempotensi wajib diisi.',
        ];
    }
}
