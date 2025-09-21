<?php

use App\Services\ConfigKeyService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Mocks\AuthMock;

uses(RefreshDatabase::class, AuthMock::class);

beforeEach(function () {
    $this->mockAuthMiddleware();
});

describe('ConfigKey Service', function () {
    it('can get api key from config', function () {
        config(['services.tinymce.api_key' => 'test-api-key']);
        
        $service = new ConfigKeyService();
        $apiKey = $service->getApiKey();
        
        expect($apiKey)->toBe('test-api-key');
    });

    it('returns null when api key is not configured', function () {
        config(['services.tinymce.api_key' => null]);
        
        $service = new ConfigKeyService();
        $apiKey = $service->getApiKey();
        
        expect($apiKey)->toBeNull();
    });

    it('can check if api key is configured', function () {
        config(['services.tinymce.api_key' => 'test-api-key']);
        
        $service = new ConfigKeyService();
        $isConfigured = $service->isConfigured();
        
        expect($isConfigured)->toBeTrue();
    });

    it('returns false when api key is not configured', function () {
        config(['services.tinymce.api_key' => null]);
        
        $service = new ConfigKeyService();
        $isConfigured = $service->isConfigured();
        
        expect($isConfigured)->toBeFalse();
    });

    it('can get full config array', function () {
        config(['services.tinymce.api_key' => 'test-api-key']);
        
        $service = new ConfigKeyService();
        $config = $service->getConfig();
        
        expect($config)->toHaveKey('api_key');
        expect($config)->toHaveKey('is_configured');
        expect($config['api_key'])->toBe('test-api-key');
        expect($config['is_configured'])->toBeTrue();
    });
});

describe('ConfigKey API Endpoints', function () {
    it('can get config keys via api', function () {
        config(['services.tinymce.api_key' => 'test-api-key']);
        
        $response = $this->call('GET', '/api/setting/config-key', [], ['token' => 'test-token']);
        
        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'tinymce' => [
                        'api_key',
                        'is_configured'
                    ]
                ]
            ])
            ->assertJson([
                'success' => true,
                'message' => 'Config keys retrieved successfully',
                'data' => [
                    'tinymce' => [
                        'api_key' => 'test-api-key',
                        'is_configured' => true
                    ]
                ]
            ]);
    });

    it('returns config with null api key when not configured', function () {
        config(['services.tinymce.api_key' => null]);
        
        $response = $this->call('GET', '/api/setting/config-key', [], ['token' => 'test-token']);
        
        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'tinymce' => [
                        'api_key',
                        'is_configured'
                    ]
                ]
            ])
            ->assertJson([
                'success' => true,
                'message' => 'Config keys retrieved successfully',
                'data' => [
                    'tinymce' => [
                        'api_key' => null,
                        'is_configured' => false
                    ]
                ]
            ]);
    });
});