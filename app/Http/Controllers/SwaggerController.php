<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

/**
 * @OA\Info(
 *     title="PTM-BMUP-Setting API",
 *     version="1.0.0",
 *     description="API untuk mengelola setting PTM-BMUP termasuk Core dan Member management"
 * )
 * 
 * @OA\Server(
 *     url="http://localhost:8000",
 *     description="Development/Local Environment"
 * )
 * 
 * @OA\Server(
 *     url="https://staging-api.example.com",
 *     description="Staging Environment"
 * )
 * 
 * @OA\Server(
 *     url="https://api.example.com",
 *     description="Production Environment"
 * )
 * 
 * @OA\SecurityScheme(
 *     securityScheme="cookieAuth",
 *     type="apiKey",
 *     in="cookie",
 *     name="token",
 *     description="JWT Token dari be-app-management project (httponly cookie)"
 * )
 * 
 * @OA\SecurityScheme(
 *     securityScheme="bearerAuth",
 *     type="http",
 *     scheme="bearer",
 *     bearerFormat="JWT",
 *     description="Bearer token untuk testing (opsional)"
 * )
 * 
 * @OA\Tag(
 *     name="Authentication",
 *     description="Endpoints untuk authentication (dari be-app-management project)"
 * )
 * 
 * @OA\Tag(
 *     name="Core",
 *     description="Endpoints untuk mengelola core settings"
 * )
 * 
 * @OA\Tag(
 *     name="Members",
 *     description="Endpoints untuk mengelola members"
 * )
 */
class SwaggerController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/documentation",
     *     summary="Swagger Documentation",
     *     description="Dokumentasi lengkap API PTM-BMUP-Setting",
     *     tags={"Documentation"},
     *     @OA\Response(
     *         response=200,
     *         description="Swagger UI"
     *     )
     * )
     */
    public function index()
    {
        return view('vendor.l5-swagger.index', [
            'documentation' => 'default',
            'documentationTitle' => 'PTM-BMUP-Setting API',
            'urlsToDocs' => [
                'PTM-BMUP-Setting API' => url('api/documentation.json')
            ],
            'operationsSorter' => null,
            'configUrl' => null,
            'validatorUrl' => null,
            'useAbsolutePath' => false,
        ]);
    }

    public function json()
    {
        return response()->file(storage_path('api-docs/api-docs.json'));
    }
}
