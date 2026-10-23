<?php

namespace App\Http\Requests\Practice;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class StoreProductRequest extends FormRequest
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
        $workspaceId = $this->user()?->workspace?->id;

        return [
            'code' => ['nullable', 'string', 'min:3', 'max:32', 'regex:/^[A-Z0-9-]+$/'],
            'name' => ['required', 'string', 'min:2', 'max:150'],
            'category' => ['required', 'string', 'min:2', 'max:80'],
            'specification' => ['nullable', 'string', 'max:500'],
            'base_unit' => ['required', 'string', 'max:30'],
            'cost_price' => ['required', 'numeric', 'min:0', 'max:999999999.99'],
            'selling_price' => ['required', 'numeric', 'min:0', 'max:999999999.99'],
            'stock_good' => ['required', 'integer', 'min:0', 'max:1000000'],
            'stock_date' => ['nullable', 'date', 'before_or_equal:today'],
            'photo' => ['nullable', 'image', 'mimes:jpeg,png,webp', 'max:2048'],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function messages(): array
    {
        return [
            'code.regex' => 'Kode hanya boleh berisi huruf besar, angka, dan tanda hubung.',
            'code.min' => 'Kode minimal 3 karakter.',
            'name.required' => 'Nama barang wajib diisi.',
            'name.min' => 'Nama barang minimal 2 karakter.',
            'category.required' => 'Kategori wajib diisi.',
            'base_unit.required' => 'Satuan dasar wajib diisi.',
            'cost_price.required' => 'Harga pokok wajib diisi.',
            'selling_price.required' => 'Harga jual wajib diisi.',
            'stock_good.required' => 'Stok awal wajib diisi (boleh 0).',
            'stock_good.integer' => 'Stok awal harus berupa bilangan bulat.',
            'photo.image' => 'File harus berupa gambar.',
            'photo.max' => 'Ukuran foto maksimal 2 MB.',
        ];
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            if ($this->input('stock_good', 0) > 0 && ! $this->has('stock_date')) {
                $validator->errors()->add('stock_date', 'Tanggal saldo awal wajib diisi bila stok awal > 0.');
            }
        });
    }
}
