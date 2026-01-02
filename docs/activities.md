# Activities API

## GET List Activities

Endpoint:
- GET `http://localhost:3200/api/setting/landing/activities`

Sorting:
- `sort_order` asc (null paling akhir), lalu `id` desc

Curl:
```bash
curl -X GET 'http://localhost:3200/api/setting/landing/activities' \
  -H 'Accept: application/json'
```

Response (200):
```json
{
  "success": true,
  "message": "Activities retrieved successfully",
  "count": 1,
  "data": [
    {
      "id": 1,
      "icon_id": 1,
      "title": "Sparring Partner",
      "subtitle": "Kunjungan ke PTM lain atau menerima kunjungan untuk menambah pengalaman dan relasi.",
      "is_published": true,
      "sort_order": 1,
      "created_at": "2025-12-28T00:00:00.000Z",
      "updated_at": "2025-12-28T00:00:00.000Z",
      "icon": {
        "id": 1,
        "name": "mdi-table-tennis",
        "label": "Table Tennis",
        "is_active": true
      }
    }
  ]
}
```

## GET List Published Activities (Landing)

Endpoint:
- GET `http://localhost:3200/api/setting/landing/activities/landing`

Catatan:
- Hanya mengembalikan data `is_published=true`.

Sorting:
- `sort_order` asc (null paling akhir), lalu `id` desc

Curl:
```bash
curl -X GET 'http://localhost:3200/api/setting/landing/activities/landing' \
  -H 'Accept: application/json'
```

Response (200):
```json
{
  "success": true,
  "message": "Activities retrieved successfully",
  "count": 2,
  "data": [
    {
      "id": 1,
      "icon_id": 1,
      "title": "A1",
      "subtitle": "S1",
      "is_published": true,
      "sort_order": 1,
      "created_at": "2025-12-28T00:00:00.000Z",
      "updated_at": "2025-12-28T00:00:00.000Z",
      "icon": {
        "id": 1,
        "name": "mdi-table-tennis",
        "label": "Table Tennis",
        "is_active": true
      }
    },
    {
      "id": 3,
      "icon_id": 1,
      "title": "A3",
      "subtitle": "S3",
      "is_published": true,
      "sort_order": 3,
      "created_at": "2025-12-28T00:00:00.000Z",
      "updated_at": "2025-12-28T00:00:00.000Z",
      "icon": {
        "id": 1,
        "name": "mdi-table-tennis",
        "label": "Table Tennis",
        "is_active": true
      }
    }
  ]
}
```

## GET Detail Activity

Endpoint:
- GET `http://localhost:3200/api/setting/landing/activities/{id}`

Curl:
```bash
curl -X GET 'http://localhost:3200/api/setting/landing/activities/1' \
  -H 'Accept: application/json'
```

Response (200):
```json
{
  "success": true,
  "message": "Activity retrieved successfully",
  "data": {
    "id": 1,
    "icon_id": 1,
    "title": "Sparring Partner",
    "subtitle": "Kunjungan ke PTM lain atau menerima kunjungan untuk menambah pengalaman dan relasi.",
    "is_published": true,
    "sort_order": 1,
    "created_at": "2025-12-28T00:00:00.000Z",
    "updated_at": "2025-12-28T00:00:00.000Z",
    "icon": {
      "id": 1,
      "name": "mdi-table-tennis",
      "label": "Table Tennis",
      "is_active": true
    }
  }
}
```

## POST Create Activity

Endpoint:
- POST `http://localhost:3200/api/setting/landing/activities`

Body (JSON):
- `icon_id` (required): id icon (angka/string angka)
- `title` (required)
- `subtitle` (required)
- `is_published` (optional, default true)

Curl:
```bash
curl -X POST 'http://localhost:3200/api/setting/landing/activities' \
  -H 'Accept: application/json' \
  -H 'Content-Type: application/json' \
  --data-raw '{
    "icon_id": "1",
    "title": "Sparring Partner",
    "subtitle": "Kunjungan ke PTM lain atau menerima kunjungan untuk menambah pengalaman dan relasi.",
    "is_published": true
  }'
```

Response (201):
```json
{
  "success": true,
  "message": "Activity created successfully",
  "data": {
    "id": 1,
    "icon_id": 1,
    "title": "Sparring Partner",
    "subtitle": "Kunjungan ke PTM lain atau menerima kunjungan untuk menambah pengalaman dan relasi.",
    "is_published": true,
    "sort_order": 1,
    "created_at": "2025-12-28T00:00:00.000Z",
    "updated_at": "2025-12-28T00:00:00.000Z"
  }
}
```

Response (400 Validation):
```json
{
  "errors": [
    "The icon_id is invalid!"
  ]
}
```

## PUT Update Activity

Endpoint:
- PUT `http://localhost:3200/api/setting/landing/activities/{id}`

Body (JSON):
- `icon_id` (required): id icon (angka/string angka)
- `title` (required)
- `subtitle` (required)
- `is_published` (optional, default tetap seperti sebelumnya)

Curl:
```bash
curl -X PUT 'http://localhost:3200/api/setting/landing/activities/1' \
  -H 'Accept: application/json' \
  -H 'Content-Type: application/json' \
  --data-raw '{
    "icon_id": "1",
    "title": "New Title",
    "subtitle": "New Subtitle",
    "is_published": false
  }'
```

Response (200):
```json
{
  "success": true,
  "message": "Activity updated successfully",
  "data": {
    "id": 1,
    "icon_id": 1,
    "title": "New Title",
    "subtitle": "New Subtitle",
    "is_published": false,
    "sort_order": 1,
    "created_at": "2025-12-28T00:00:00.000Z",
    "updated_at": "2025-12-28T00:00:00.000Z"
  }
}
```

## DELETE Delete Activity

Endpoint:
- DELETE `http://localhost:3200/api/setting/landing/activities/{id}`

Curl:
```bash
curl -X DELETE 'http://localhost:3200/api/setting/landing/activities/1' \
  -H 'Accept: application/json'
```

Response (200):
```json
{
  "success": true,
  "message": "Activity deleted successfully"
}
```

## PUT Sort Activities (vue-draggable)

Endpoint:
- PUT `http://localhost:3200/api/setting/landing/activities/sort`

Body (JSON):
- `ids` (required): array id activity mengikuti urutan dari frontend

Curl:
```bash
curl -X PUT 'http://localhost:3200/api/setting/landing/activities/sort' \
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
  "message": "Activities sorted successfully"
}
```

Response (400 Validation):
```json
{
  "errors": [
    "Some activities were not found!"
  ]
}
```
