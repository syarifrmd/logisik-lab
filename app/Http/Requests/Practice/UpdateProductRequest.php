<?php

namespace App\Http\Requests\Practice;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProductRequest extends FormRequest
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
        $productId = $this->route('product')?->id;

        return [
            'name' => ['required', 'string', 'min:2', 'max:150'],
            'category' => ['required', 'string', 'min:2', 'max:80'],
            'specification' => ['nullable', 'string', 'max:500'],
            'base_unit' => ['required', 'string', 'max:30'],
            'cost_price' => ['required', 'numeric', 'min:0', 'max:999999999.99'],
            'selling_price' => ['required', 'numeric', 'min:0', 'max:999999999.99'],
            'photo' => ['nullable', 'image', 'mimes:jpeg,png,webp', 'max:2048'],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Nama barang wajib diisi.',
            'name.min' => 'Nama barang minimal 2 karakter.',
            'category.required' => 'Kategori wajib diisi.',
            'base_unit.required' => 'Satuan dasar wajib diisi.',
            'cost_price.required' => 'Harga pokok wajib diisi.',
            'selling_price.required' => 'Harga jual wajib diisi.',
        ];
    }
}
