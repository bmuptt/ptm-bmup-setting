<?php

namespace App\Http\Controllers;

use App\Http\Requests\CoreUpdateRequest;
use App\Services\CoreService;
use Illuminate\Http\JsonResponse;

/**
 * @OA\Tag(
 *     name="Core",
 *     description="Endpoints untuk mengelola core settings"
 * )
 */
class CoreController extends Controller
{
    public function __construct(
        private CoreService $coreService
    ) {}

    /**
     * @OA\Get(
     *     path="/api/setting/core",
     *     summary="Get Core Settings",
     *     description="Mengambil data core settings",
     *     tags={"Core"},
     *     @OA\Response(
     *         response=200,
     *         description="Data core settings berhasil diambil",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="data", type="object",
     *                 @OA\Property(property="id", type="integer", example=1),
     *                 @OA\Property(property="name", type="string", example="PTM-BMUP"),
     *                 @OA\Property(property="description", type="string", example="Platform Training Management"),
     *                 @OA\Property(property="logo", type="string", example="http://localhost:8000/storage/logos/logo.png"),
     *                 @OA\Property(property="created_by", type="integer", example=1),
     *                 @OA\Property(property="updated_by", type="integer", example=1),
     *                 @OA\Property(property="created_at", type="string", format="date-time"),
     *                 @OA\Property(property="updated_at", type="string", format="date-time")
     *             )
     *         )
     *     )
     * )
     */
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

    /**
     * @OA\Patch(
     *     path="/api/setting/core",
     *     summary="Update Core Settings",
     *     description="Update core settings dengan file upload support",
     *     tags={"Core"},
     *     security={{"cookieAuth": {}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\MediaType(
     *             mediaType="multipart/form-data",
     *             @OA\Schema(
     *                 @OA\Property(property="name", type="string", example="PTM-BMUP Updated"),
     *                 @OA\Property(property="description", type="string", example="Updated Platform Training Management"),
     *                 @OA\Property(property="logo", type="string", format="binary", description="Logo file upload"),
     *                 @OA\Property(property="status_file", type="integer", example=1, description="0: no change, 1: replace/delete file")
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Core settings berhasil diupdate",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Core updated successfully"),
     *             @OA\Property(property="data", type="object",
     *                 @OA\Property(property="id", type="integer", example=1),
     *                 @OA\Property(property="name", type="string", example="PTM-BMUP Updated"),
     *                 @OA\Property(property="description", type="string", example="Updated Platform Training Management"),
     *                 @OA\Property(property="logo", type="string", example="http://localhost:8000/storage/logos/logo.png"),
     *                 @OA\Property(property="created_by", type="integer", example=1),
     *                 @OA\Property(property="updated_by", type="integer", example=1),
     *                 @OA\Property(property="created_at", type="string", format="date-time"),
     *                 @OA\Property(property="updated_at", type="string", format="date-time")
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Unauthorized",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="Unauthorized")
     *         )
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Validation error",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="The given data was invalid."),
     *             @OA\Property(property="errors", type="object")
     *         )
     *     )
     * )
     */
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
