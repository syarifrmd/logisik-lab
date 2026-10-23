<?php

namespace App\Http\Requests\Practice;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class StoreOutboundRequest extends FormRequest
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
            'reason' => ['required', 'string', 'in:sale,usage,return'],
            'stock_condition' => ['required', 'string', 'in:good,damaged'],
            'quantity' => ['required', 'integer', 'min:1', 'max:1000000'],
            'unit_price' => ['required', 'numeric', 'min:0', 'max:999999999.99'],
            'recipient' => ['required', 'string', 'max:150'],
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
            'transaction_date.required' => 'Tanggal keluar wajib diisi.',
            'transaction_date.before_or_equal' => 'Tanggal keluar tidak boleh melebihi hari ini.',
            'external_document_number.required' => 'Nomor dokumen pengeluaran wajib diisi.',
            'reason.required' => 'Alasan keluar wajib dipilih.',
            'reason.in' => 'Alasan harus Penjualan, Pemakaian, atau Retur.',
            'stock_condition.required' => 'Kondisi stok wajib dipilih.',
            'stock_condition.in' => 'Kondisi stok harus Baik atau Rusak.',
            'quantity.required' => 'Jumlah wajib diisi.',
            'quantity.min' => 'Jumlah harus lebih dari 0.',
            'quantity.integer' => 'Jumlah harus bilangan bulat.',
            'unit_price.required' => 'Harga jual wajib diisi.',
            'recipient.required' => 'Tujuan/pelanggan wajib diisi.',
            'idempotency_key.required' => 'Token idempotensi wajib diisi.',
        ];
    }

    /**
     * Configure the validator instance.
     *
     * PRD D-07: Keluar Rusak hanya untuk Retur.
     */
    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            $condition = $this->input('stock_condition');
            $reason = $this->input('reason');

            if ($condition === 'damaged' && $reason !== 'return') {
                $validator->errors()->add(
                    'stock_condition',
                    'Pengeluaran barang rusak hanya diperbolehkan untuk alasan Retur.'
                );
            }
        });
    }
}
