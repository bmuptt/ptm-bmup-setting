<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class MemberStoreRequest extends FormRequest
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
            'name' => 'required|string|max:255',
            'email' => 'nullable|email|max:255|unique:members,email',
            'gender' => 'required|string|in:Male,Female',
            'birthdate' => 'required|date|before:today',
            'address' => 'required|string|max:500',
            'phone' => 'required|string|max:20',
            'photo' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'active' => 'required|boolean',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Name is required',
            'name.string' => 'Name must be a string',
            'name.max' => 'Name cannot exceed 255 characters',
            'email.email' => 'Email must be a valid email address',
            'email.max' => 'Email cannot exceed 255 characters',
            'email.unique' => 'This email is already registered',
            'gender.required' => 'Gender is required',
            'gender.string' => 'Gender must be a string',
            'gender.in' => 'Gender must be either Male or Female',
            'birthdate.required' => 'Birthdate is required',
            'birthdate.date' => 'Birthdate must be a valid date',
            'birthdate.before' => 'Birthdate must be before today',
            'address.required' => 'Address is required',
            'address.string' => 'Address must be a string',
            'address.max' => 'Address cannot exceed 500 characters',
            'phone.required' => 'Phone is required',
            'phone.string' => 'Phone must be a string',
            'phone.max' => 'Phone cannot exceed 20 characters',
            'photo.image' => 'Photo must be an image',
            'photo.mimes' => 'Photo must be in format: jpeg, png, jpg, gif',
            'photo.max' => 'Photo size cannot exceed 2MB',
            'active.required' => 'Active status is required',
            'active.boolean' => 'Active must be true or false',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation()
    {
        // Convert string "null" to actual null for email
        if ($this->has('email') && $this->email === 'null') {
            $this->merge(['email' => null]);
        }

        // Convert active field to boolean
        if ($this->has('active')) {
            $active = $this->active;
            
            
            // Convert string/numeric values to boolean
            if (in_array($active, ['true', '1', 1, true])) {
                $this->merge(['active' => true]);
            } elseif (in_array($active, ['false', '0', 0, false])) {
                $this->merge(['active' => false]);
            }
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
