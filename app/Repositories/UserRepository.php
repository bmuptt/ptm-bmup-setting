<?php

namespace App\Repositories;

use App\Repositories\Contracts\UserRepositoryInterface;
use App\Exceptions\ValidationException;
use Illuminate\Support\Facades\Http;
use Illuminate\Http\Client\RequestException;
use Illuminate\Support\Facades\Log;

class UserRepository implements UserRepositoryInterface
{
    /**
     * Create a new user in be-app-management
     * 
     * @param array $userData
     * @return array
     * @throws \Exception
     */
    public function createUser(array $userData): array
    {
        try {
            $token = request()->cookie('token');
            $url = env('API_URL_CORE') . '/app-management/user';
            
            // Filter out null values and ensure proper formatting
            $filteredUserData = array_filter($userData, function($value) {
                return $value !== null && $value !== '';
            });
            
            // Ensure birthdate is properly formatted if present
            if (isset($filteredUserData['birthdate'])) {
                // Convert to Y-m-d format if it's a datetime
                $filteredUserData['birthdate'] = date('Y-m-d', strtotime($filteredUserData['birthdate']));
            }
            
            // Log curl command for debugging
            $curlCommand = "curl -X POST '{$url}' ";
            $curlCommand .= "-H 'Content-Type: application/x-www-form-urlencoded' ";
            $curlCommand .= "-H 'Cookie: token={$token}' ";
            $curlCommand .= "-d '" . http_build_query($filteredUserData) . "'";
            
            Log::info('CURL Command for create user:', [
                'curl' => $curlCommand,
                'url' => $url,
                'original_data' => $userData,
                'filtered_data' => $filteredUserData
            ]);
            
            $response = Http::withHeaders([
                'Cookie' => "token={$token}"
            ])->asForm()->post($url, $filteredUserData);

            if ($response->successful()) {
                return $response->json();
            }

            // Handle validation errors from be-app-management
            if ($response->status() === 400) {
                $errorData = $response->json();
                
                Log::info('Validation error from be-app-management service', [
                    'response' => $errorData,
                    'request_data' => $filteredUserData
                ]);
                
                // Check if response has errors array format
                if (isset($errorData['errors']) && is_array($errorData['errors'])) {
                    $errorMessages = [];
                    foreach ($errorData['errors'] as $field => $messages) {
                        if (is_array($messages)) {
                            $errorMessages = array_merge($errorMessages, $messages);
                        } else {
                            $errorMessages[] = $messages;
                        }
                    }
                    
                    throw new ValidationException(
                        'Validation failed from be-app-management',
                        400,
                        ['errors' => $errorMessages, 'source' => 'be-app-management']
                    );
                }
                
                // Fallback for old format
                throw new ValidationException(
                    $errorData['message'] ?? 'Validation failed from be-app-management',
                    400,
                    array_merge($errorData, ['source' => 'be-app-management'])
                );
            }

            // Handle other client errors
            if ($response->clientError()) {
                $errorData = $response->json();
                throw new \Exception(
                    $errorData['message'] ?? 'Client error occurred',
                    $response->status()
                );
            }

            // Handle server errors
            throw new \Exception(
                'Server error occurred while creating user',
                $response->status()
            );

        } catch (RequestException $e) {
            throw new \Exception(
                'Failed to connect to user management service: ' . $e->getMessage(),
                500
            );
        }
    }
}