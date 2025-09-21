<?php

namespace App\Http\Controllers;

use App\Services\ConfigKeyService;
use Illuminate\Http\JsonResponse;

class ConfigKeyController extends Controller
{
    protected ConfigKeyService $configKeyService;

    public function __construct(ConfigKeyService $configKeyService)
    {
        $this->configKeyService = $configKeyService;
    }

    /**
     * Get TinyMCE configuration
     * 
     * @return JsonResponse
     */
    public function getConfig(): JsonResponse
    {
        try {
            $config = $this->configKeyService->getConfig();
            
            return response()->json([
                'success' => true,
                'message' => 'TinyMCE configuration retrieved successfully',
                'data' => $config
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve TinyMCE configuration',
                'errors' => [$e->getMessage()]
            ], 500);
        }
    }

    /**
     * Get TinyMCE API key only
     * 
     * @return JsonResponse
     */
    public function getApiKey(): JsonResponse
    {
        try {
            $apiKey = $this->configKeyService->getApiKey();
            
            return response()->json([
                'success' => true,
                'message' => 'TinyMCE API key retrieved successfully',
                'data' => [
                    'api_key' => $apiKey
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve TinyMCE API key',
                'errors' => [$e->getMessage()]
            ], 500);
        }
    }

    /**
     * Get config key for TinyMCE
     * 
     * @return JsonResponse
     */
    public function getConfigKey(): JsonResponse
    {
        try {
            $configKeys = [
                'tinymce' => [
                    'api_key' => $this->configKeyService->getApiKey(),
                    'is_configured' => $this->configKeyService->isConfigured(),
                ]
            ];
            
            return response()->json([
                'success' => true,
                'message' => 'Config keys retrieved successfully',
                'data' => $configKeys
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve config keys',
                'errors' => [$e->getMessage()]
            ], 500);
        }
    }
}