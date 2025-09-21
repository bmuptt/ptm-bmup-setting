<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class MemberUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $memberId = $this->route('id');
        
        return [
            'name' => 'sometimes|required|string|max:255',
            'email' => 'sometimes|nullable|email|max:255|unique:members,email,' . $memberId,
            'gender' => 'sometimes|required|string|in:Male,Female',
            'birthdate' => 'sometimes|required|date|before:today',
            'address' => 'sometimes|required|string|max:500',
            'phone' => 'sometimes|required|string|max:20',
            'photo' => 'sometimes|nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'active' => 'sometimes|required|boolean',
            'status_file' => 'sometimes|required|integer|in:0,1',
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Name is required',
            'name.string' => 'Name must be a string',
            'name.max' => 'Name cannot exceed 255 characters',
            'email.email' => 'Email must be a valid email address',
            'email.unique' => 'Email has already been taken',
            'gender.required' => 'Gender is required',
            'gender.in' => 'Gender must be Male or Female',
            'birthdate.required' => 'Birthdate is required',
            'birthdate.date' => 'Birthdate must be a valid date',
            'birthdate.before' => 'Birthdate must be before today',
            'address.required' => 'Address is required',
            'address.string' => 'Address must be a string',
            'address.max' => 'Address cannot exceed 500 characters',
            'phone.required' => 'Phone is required',
            'phone.string' => 'Phone must be a string',
            'phone.max' => 'Phone cannot exceed 20 characters',
            'photo.image' => 'Photo must be an image file',
            'photo.mimes' => 'Photo must be a file of type: jpeg, png, jpg, gif',
            'photo.max' => 'Photo may not be greater than 2MB',
            'active.required' => 'Active status is required',
            'active.boolean' => 'Active must be true or false',
            'status_file.required' => 'Status file is required',
            'status_file.integer' => 'Status file must be an integer',
            'status_file.in' => 'Status file must be 0 or 1',
        ];
    }

    protected function prepareForValidation()
    {
        // Convert string "null" to actual null for email
        if ($this->has('email') && $this->email === 'null') {
            $this->merge(['email' => null]);
        }

        if ($this->has('active')) {
            $active = $this->active;
            if (in_array($active, ['true', '1', 1, true])) {
                $this->merge(['active' => true]);
            } elseif (in_array($active, ['false', '0', 0, false])) {
                $this->merge(['active' => false]);
            }
        }

        // Convert status_file to integer
        if ($this->has('status_file')) {
            $statusFile = $this->status_file;
            if (in_array($statusFile, ['0', '1', 0, 1])) {
                $this->merge(['status_file' => (int) $statusFile]);
            }
        }
    }

    protected function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(
            response()->json([
                'errors' => $validator->errors()->all()
            ], 400)
        );
    }
}
