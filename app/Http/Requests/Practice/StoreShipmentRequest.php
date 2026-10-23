<?php

namespace App\Http\Requests\Practice;

use Illuminate\Foundation\Http\FormRequest;

class StoreShipmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'idempotency_key' => ['required', 'string', 'max:100'],
            'shipment_type' => ['required', 'string', 'in:domestic,export,import'],
            'origin' => ['required', 'string', 'max:150'],
            'destination' => ['required', 'string', 'max:150'],
            'origin_country' => ['required', 'string', 'max:100'],
            'destination_country' => ['required', 'string', 'max:100'],
            'incoterms' => ['nullable', 'string', 'max:30'],
            'customs_document_type' => ['nullable', 'string', 'in:PEB,PIB'],
            'customs_document_number' => ['nullable', 'string', 'max:100'],
            'tariffs_and_taxes' => ['nullable', 'numeric', 'min:0'],
            'transport_mode' => ['required', 'string', 'in:land,sea,air'],
            'fleet_type' => ['required', 'string', 'max:100'],
            'driver_name' => ['nullable', 'string', 'max:150'],
            'carrier_service' => ['nullable', 'string', 'max:150'],
            'tracking_number' => ['nullable', 'string', 'max:100'],
            'mode_selection_reason' => ['required', 'string', 'max:1000'],
            'estimated_cost' => ['required', 'numeric', 'min:0'],
            'cargo_type' => ['required', 'string', 'in:general,fragile,liquid,perishable,other'],
            'cargo_type_details' => ['nullable', 'string', 'max:150'],
            'total_weight_kg' => ['required', 'numeric', 'gt:0', 'max:999999.999'],
            'volume_m3' => ['nullable', 'numeric', 'gt:0', 'max:999999.999'],
            'packaging_type' => ['required', 'string', 'in:box,pallet,crate,container,other'],
            'packaging_type_details' => ['nullable', 'string', 'max:150'],
            'handling_instructions' => ['required', 'string', 'max:1000'],
            'special_notes' => ['nullable', 'string', 'max:1000'],
            'shipping_date' => ['required', 'date'],
            'estimated_arrival_date' => ['required', 'date', 'after_or_equal:shipping_date'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.stock_transaction_id' => ['nullable', 'integer'],
            'items.*.product_id' => ['nullable', 'integer'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
            'items.*.stock_condition' => ['nullable', 'string', 'in:good,damaged'],
        ];
    }

    public function messages(): array
    {
        return [
            'shipment_type.required' => 'Jenis pengiriman wajib dipilih.',
            'origin.required' => 'Asal pengiriman wajib diisi.',
            'destination.required' => 'Tujuan pengiriman wajib diisi.',
            'transport_mode.required' => 'Moda transportasi wajib dipilih.',
            'fleet_type.required' => 'Jenis armada/kendaraan wajib diisi.',
            'mode_selection_reason.required' => 'Dasar pemilihan moda wajib diisi.',
            'cargo_type.required' => 'Jenis muatan wajib dipilih.',
            'total_weight_kg.required' => 'Berat total wajib diisi.',
            'total_weight_kg.gt' => 'Berat total harus lebih dari 0 kg.',
            'packaging_type.required' => 'Jenis kemasan wajib dipilih.',
            'handling_instructions.required' => 'Cara penanganan wajib diisi.',
            'shipping_date.required' => 'Tanggal pengiriman wajib diisi.',
            'estimated_arrival_date.required' => 'Estimasi tiba wajib diisi.',
            'estimated_arrival_date.after_or_equal' => 'Estimasi tiba tidak boleh sebelum tanggal pengiriman.',
            'items.required' => 'Minimal satu barang harus dipilih.',
            'items.min' => 'Minimal satu barang harus dipilih.',
        ];
    }
}
