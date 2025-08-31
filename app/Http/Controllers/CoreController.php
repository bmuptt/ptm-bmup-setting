<?php

namespace App\Http\Controllers;

use App\Http\Requests\CoreUpdateRequest;
use App\Services\CoreService;
use Illuminate\Http\JsonResponse;

class CoreController extends Controller
{
    public function __construct(
        private CoreService $coreService
    ) {}

    public function show(): JsonResponse
    {
        try {
            $data = $this->coreService->getDetail();
            
            return response()->json([
                'success' => true,
                'data' => $data
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], $e->getCode() ?: 500);
        }
    }

    public function update(CoreUpdateRequest $request): JsonResponse
    {
        try {
            $data = $this->coreService->update(
                $request->validated(),
                $request->file('logo'),
                $request->user()->id ?? null
            );
            
            return response()->json([
                'success' => true,
                'message' => 'Core updated successfully',
                'data' => $data
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], $e->getCode() ?: 500);
        }
    }
}
