<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Contracts\Validation\Validator;
use App\Models\Member;

class CreateUserRequest extends FormRequest
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
            'member_id' => [
                'required',
                'integer',
                'exists:members,id',
                function ($attribute, $value, $fail) {
                    $member = Member::find($value);
                    if ($member && $member->user_id !== null) {
                        $fail('Member already has a user account');
                    }
                    if ($member && empty($member->email)) {
                        $fail('Member email is required to create user account');
                    }
                },
            ],
            'role_id' => 'required|integer',
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array
     */
    public function messages(): array
    {
        return [
            'member_id.required' => 'Member ID is required',
            'member_id.integer' => 'Member ID must be an integer',
            'member_id.exists' => 'Member not found',
            'role_id.required' => 'Role ID is required',
            'role_id.integer' => 'Role ID must be an integer',
        ];
    }

    /**
     * Handle a failed validation attempt.
     *
     * @param  \Illuminate\Contracts\Validation\Validator  $validator
     * @return void
     *
     * @throws \Illuminate\Http\Exceptions\HttpResponseException
     */
    protected function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(
            response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()->all()
            ], 400)
        );
    }
}