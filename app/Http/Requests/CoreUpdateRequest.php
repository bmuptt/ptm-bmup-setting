<?php

namespace App\Http\Requests;

use App\Services\HtmlSanitizerService;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class CoreUpdateRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => 'sometimes|string|max:255',
            'logo' => 'sometimes|image|mimes:jpeg,png,jpg,gif|max:2048',
            'status_logo' => 'required|string|in:0,1',
            'description' => 'sometimes|string',
            'address' => 'sometimes|string',
            'maps' => 'sometimes|nullable|string|max:500',
            'primary_color' => 'sometimes|string|max:7|regex:/^#[0-9A-F]{6}$/i',
            'secondary_color' => 'sometimes|string|max:7|regex:/^#[0-9A-F]{6}$/i',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'name.string' => 'Name must be a string',
            'name.max' => 'Name cannot exceed 255 characters',
            'logo.image' => 'Logo must be an image',
            'logo.mimes' => 'Logo must be in format: jpeg, png, jpg, gif',
            'logo.max' => 'Logo size cannot exceed 2MB',
            'status_logo.required' => 'Status logo is required',
            'status_logo.string' => 'Status logo must be a string',
            'status_logo.in' => 'Status logo must be 0 (no change) or 1 (changed/deleted)',
            'description.string' => 'Description must be a string',
            'address.string' => 'Address must be a string',
            'maps.string' => 'Maps must be a string',
            'maps.max' => 'Maps cannot exceed 500 characters',
            'primary_color.string' => 'Primary color must be a string',
            'primary_color.max' => 'Primary color cannot exceed 7 characters',
            'primary_color.regex' => 'Primary color must be in hex format (#RRGGBB)',
            'secondary_color.string' => 'Secondary color must be a string',
            'secondary_color.max' => 'Secondary color cannot exceed 7 characters',
            'secondary_color.regex' => 'Secondary color must be in hex format (#RRGGBB)',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation()
    {
        // Sanitize HTML content in description field
        if ($this->has('description') && !empty($this->description)) {
            $sanitizer = new HtmlSanitizerService();
            $this->merge([
                'description' => $sanitizer->sanitize($this->description)
            ]);
        }
    }

    /**
     * Handle a failed validation attempt.
     */
    protected function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(
            response()->json([
                'errors' => $validator->errors()->all()
            ], 400)
        );
    }
}
