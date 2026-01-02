# Training Schedules API (Jadwal Latihan)

Modul ini untuk management Jadwal Latihan dari CMS, termasuk sorting (vue-draggable), dan list published untuk landing/schedule page.

Sorting:
- `display_order` asc, lalu `id` desc

Catatan format waktu:
- Request `start_time` dan `end_time`: `HH:mm` atau `HH:mm:ss`
- Response `start_time` dan `end_time`: `HH:mm`
- Jika `member_id` terisi, response menambahkan field `member` (basic member data).

Catatan `day_of_week`:
- Menggunakan ISO-8601: `1=Monday` … `7=Sunday`
- Mapping untuk FE:
  - 1: Senin
  - 2: Selasa
  - 3: Rabu
  - 4: Kamis
  - 5: Jumat
  - 6: Sabtu
  - 7: Minggu

## GET List Training Schedules (Landing)

Endpoint:
- GET `http://localhost:3200/api/setting/training-schedules/landing`

Catatan:
- Hanya mengembalikan data `is_published=true`.

Curl:
```bash
curl -X GET 'http://localhost:3200/api/setting/training-schedules/landing' \
  -H 'Accept: application/json'
```

Response (200):
```json
{
  "success": true,
  "message": "Training schedules retrieved successfully",
  "count": 2,
  "data": [
    {
      "id": 1,
      "day_of_week": 1,
      "start_time": "09:00",
      "end_time": "10:00",
      "category": "Latihan Umum",
      "member_id": 12,
      "display_order": 1,
      "is_published": true,
      "member": {
        "id": 12,
        "name": "Pelatih A",
        "username": "pelatih_a",
        "photo": null,
        "active": true
      },
      "created_by": 0,
      "updated_by": 0,
      "created_at": "2026-01-02T00:00:00.000Z",
      "updated_at": "2026-01-02T00:00:00.000Z"
    },
    {
      "id": 2,
      "day_of_week": 3,
      "start_time": "19:00",
      "end_time": "21:00",
      "category": "Junior",
      "member_id": 15,
      "display_order": 2,
      "is_published": true,
      "member": {
        "id": 15,
        "name": "Pelatih B",
        "username": "pelatih_b",
        "photo": null,
        "active": true
      },
      "created_by": 0,
      "updated_by": 0,
      "created_at": "2026-01-02T00:00:00.000Z",
      "updated_at": "2026-01-02T00:00:00.000Z"
    }
  ]
}
```

## GET List Training Schedules (CMS)

Endpoint:
- GET `http://localhost:3200/api/setting/training-schedules`

Query (optional):
- `is_published` (`true|false|1|0`)

Curl:
```bash
curl -X GET 'http://localhost:3200/api/setting/training-schedules?is_published=true' \
  -H 'Accept: application/json'
```

Response (200):
```json
{
  "success": true,
  "message": "Training schedules retrieved successfully",
  "count": 1,
  "data": [
    {
      "id": 1,
      "day_of_week": 1,
      "start_time": "09:00",
      "end_time": "10:00",
      "category": "Latihan Umum",
      "member_id": 12,
      "display_order": 1,
      "is_published": true,
      "member": {
        "id": 12,
        "name": "Pelatih A",
        "username": "pelatih_a",
        "photo": null,
        "active": true
      },
      "created_by": 1,
      "updated_by": 1,
      "created_at": "2026-01-02T00:00:00.000Z",
      "updated_at": "2026-01-02T00:00:00.000Z"
    }
  ]
}
```

## GET Detail Training Schedule (CMS)

Endpoint:
- GET `http://localhost:3200/api/setting/training-schedules/{id}`

Curl:
```bash
curl -X GET 'http://localhost:3200/api/setting/training-schedules/1' \
  -H 'Accept: application/json'
```

Response (200):
```json
{
  "success": true,
  "message": "Training schedule retrieved successfully",
  "data": {
    "id": 1,
    "day_of_week": 1,
    "start_time": "09:00",
    "end_time": "10:00",
    "category": "Latihan Umum",
    "member_id": 12,
    "display_order": 1,
    "is_published": true,
    "member": {
      "id": 12,
      "name": "Pelatih A",
      "username": "pelatih_a",
      "photo": null,
      "active": true
    },
    "created_by": 1,
    "updated_by": 1,
    "created_at": "2026-01-02T00:00:00.000Z",
    "updated_at": "2026-01-02T00:00:00.000Z"
  }
}
```

Response (404):
```json
{
  "success": false,
  "message": "Training schedule not found"
}
```

## POST Create Training Schedule (CMS)

Endpoint:
- POST `http://localhost:3200/api/setting/training-schedules`

Body (JSON):
- `day_of_week` (required): `1..7`
- `start_time` (required): `HH:mm` atau `HH:mm:ss`
- `end_time` (required): `HH:mm` atau `HH:mm:ss`
- `category` (required): max 100 char
- `member_id` (optional): bigint/number/string numeric, atau `null`
- `is_published` (optional): boolean

Curl:
```bash
curl -X POST 'http://localhost:3200/api/setting/training-schedules' \
  -H 'Accept: application/json' \
  -H 'Content-Type: application/json' \
  --data-raw '{
    "day_of_week": 1,
    "start_time": "09:00",
    "end_time": "10:00",
    "category": "Latihan Umum",
    "member_id": "12",
    "is_published": true
  }'
```

Response (201):
```json
{
  "success": true,
  "message": "Training schedule created successfully",
  "data": {
    "id": 1,
    "day_of_week": 1,
    "start_time": "09:00",
    "end_time": "10:00",
    "category": "Latihan Umum",
    "member_id": 12,
    "display_order": 1,
    "is_published": true,
    "created_by": 1,
    "updated_by": 1,
    "created_at": "2026-01-02T00:00:00.000Z",
    "updated_at": "2026-01-02T00:00:00.000Z"
  }
}
```

Response (400 Validation):
```json
{
  "errors": [
    "The day_of_week is invalid!",
    "The start_time is invalid!",
    "The end_time must be greater than start_time!"
  ]
}
```

## PUT Update Training Schedule (CMS)

Endpoint:
- PUT `http://localhost:3200/api/setting/training-schedules/{id}`

Curl:
```bash
curl -X PUT 'http://localhost:3200/api/setting/training-schedules/1' \
  -H 'Accept: application/json' \
  -H 'Content-Type: application/json' \
  --data-raw '{
    "day_of_week": 2,
    "start_time": "19:00",
    "end_time": "21:00",
    "category": "Junior",
    "member_id": "15",
    "is_published": false
  }'
```

Response (200):
```json
{
  "success": true,
  "message": "Training schedule updated successfully",
  "data": {
    "id": 1,
    "day_of_week": 2,
    "start_time": "19:00",
    "end_time": "21:00",
    "category": "Junior",
    "member_id": 15,
    "display_order": 1,
    "is_published": false,
    "created_by": 1,
    "updated_by": 1,
    "created_at": "2026-01-02T00:00:00.000Z",
    "updated_at": "2026-01-02T00:00:00.000Z"
  }
}
```

## DELETE Training Schedule (CMS)

Endpoint:
- DELETE `http://localhost:3200/api/setting/training-schedules/{id}`

Curl:
```bash
curl -X DELETE 'http://localhost:3200/api/setting/training-schedules/1' \
  -H 'Accept: application/json'
```

Response (200):
```json
{
  "success": true,
  "message": "Training schedule deleted successfully"
}
```

## PUT Sort Training Schedules (vue-draggable) (CMS)

Endpoint:
- PUT `http://localhost:3200/api/setting/training-schedules/sort`

Body (JSON):
- `ids` (required): array id training schedule mengikuti urutan dari frontend

Curl:
```bash
curl -X PUT 'http://localhost:3200/api/setting/training-schedules/sort' \
  -H 'Accept: application/json' \
  -H 'Content-Type: application/json' \
  --data-raw '{
    "ids": ["3", "1", "2"]
  }'
```

Response (200):
```json
{
  "success": true,
  "message": "Training schedules sorted successfully"
}
```

Response (400 Validation):
```json
{
  "errors": [
    "The ids must be unique!"
  ]
}
```

Response (400 Validation - Some ids not found):
```json
{
  "errors": [
    "Some training schedules were not found!"
  ]
}
```
