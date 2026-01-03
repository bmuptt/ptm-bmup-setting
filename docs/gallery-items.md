# Gallery Items API (Galeri)

Modul ini untuk management Galeri dari CMS, termasuk sorting (vue-draggable), dan list published untuk halaman landing/gallery.

Sorting:
- `display_order` asc, lalu `id` desc

## GET List Gallery Items (Landing)

Endpoint:
- GET `http://localhost:3200/api/setting/gallery-items/landing`

Catatan:
- Hanya mengembalikan data `is_published=true`.

Curl:
```bash
curl -X GET 'http://localhost:3200/api/setting/gallery-items/landing' \
  -H 'Accept: application/json'
```

Response (200):
```json
{
  "success": true,
  "message": "Gallery items retrieved successfully",
  "count": 2,
  "data": [
    {
      "id": 2,
      "image_url": "https://example.com/b.jpg",
      "title": "B",
      "display_order": 1,
      "is_published": true,
      "created_by": 0,
      "updated_by": 0,
      "created_at": "2026-01-02T00:00:00.000Z",
      "updated_at": "2026-01-02T00:00:00.000Z"
    },
    {
      "id": 1,
      "image_url": "https://example.com/a.jpg",
      "title": "A",
      "display_order": 1,
      "is_published": true,
      "created_by": 0,
      "updated_by": 0,
      "created_at": "2026-01-02T00:00:00.000Z",
      "updated_at": "2026-01-02T00:00:00.000Z"
    }
  ]
}
```

## GET List Gallery Items (CMS)

Endpoint:
- GET `http://localhost:3200/api/setting/gallery-items`

Query (optional):
- `is_published` (`true|false|1|0`)

Curl:
```bash
curl -X GET 'http://localhost:3200/api/setting/gallery-items?is_published=true' \
  -H 'Accept: application/json'
```

Response (200):
```json
{
  "success": true,
  "message": "Gallery items retrieved successfully",
  "count": 1,
  "data": [
    {
      "id": 1,
      "image_url": "https://example.com/a.jpg",
      "title": "A",
      "display_order": 1,
      "is_published": true,
      "created_by": 1,
      "updated_by": 1,
      "created_at": "2026-01-02T00:00:00.000Z",
      "updated_at": "2026-01-02T00:00:00.000Z"
    }
  ]
}
```

## GET Detail Gallery Item (CMS)

Endpoint:
- GET `http://localhost:3200/api/setting/gallery-items/{id}`

Curl:
```bash
curl -X GET 'http://localhost:3200/api/setting/gallery-items/1' \
  -H 'Accept: application/json'
```

Response (200):
```json
{
  "success": true,
  "message": "Gallery item retrieved successfully",
  "data": {
    "id": 1,
    "image_url": "https://example.com/a.jpg",
    "title": "A",
    "display_order": 1,
    "is_published": true,
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
  "errors": [
    "Gallery item not found"
  ]
}
```

## POST Create Gallery Item (CMS)

Endpoint:
- POST `http://localhost:3200/api/setting/gallery-items`

Body (multipart/form-data):
- `image` (required): file image
- `title` (required): max 255 char
- `is_published` (optional, default false): boolean

Catatan:
- Saat create, `display_order` otomatis menjadi urutan terakhir (`max(display_order) + 1`).

Curl:
```bash
curl -X POST 'http://localhost:3200/api/setting/gallery-items' \
  -H 'Accept: application/json' \
  --form 'title=Gallery A' \
  --form 'is_published=true' \
  --form 'image=@/path/to/image.jpg'
```

Response (201):
```json
{
  "success": true,
  "message": "Gallery item created successfully",
  "data": {
    "id": 1,
    "image_url": "http://localhost:3200/storage/images/gallery/image-1234567890.png",
    "title": "Gallery A",
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
    "The image is required!",
    "The title is required!"
  ]
}
```

## Update Gallery Item (CMS)

Endpoint:
- PUT `http://localhost:3200/api/setting/gallery-items/{id}?_method=PUT`

Query:
- `_method=PUT`: required untuk method-override (request pakai POST)

Body (multipart/form-data):
- `title` (required): max 255 char
- `is_published` (optional): jika tidak dikirim, nilai tetap seperti sebelumnya
- `status_file` (required): `0|1`
  - `0`: tidak ada perubahan file (keep image sebelumnya). Tidak perlu upload `image`.
  - `1`: ada perubahan file. Wajib upload `image`.
- `image` (conditional): file image (wajib jika `status_file=1`)

Curl:
```bash
curl -X POST 'http://localhost:3200/api/setting/gallery-items/1?_method=PUT' \
  -H 'Accept: application/json' \
  --form 'title=Gallery A Updated' \
  --form 'status_file=1' \
  --form 'is_published=false' \
  --form 'image=@/path/to/new-image.jpg'
```

Response (200):
```json
{
  "success": true,
  "message": "Gallery item updated successfully",
  "data": {
    "id": 1,
    "image_url": "http://localhost:3200/storage/images/gallery/new-image-1234567890.png",
    "title": "Gallery A Updated",
    "display_order": 1,
    "is_published": false,
    "created_by": 1,
    "updated_by": 1,
    "created_at": "2026-01-02T00:00:00.000Z",
    "updated_at": "2026-01-02T00:00:00.000Z"
  }
}
```

Contoh keep image (tanpa upload file):
```bash
curl -X POST 'http://localhost:3200/api/setting/gallery-items/1?_method=PUT' \
  -H 'Accept: application/json' \
  --form 'title=Gallery A Updated' \
  --form 'status_file=0'
```

## PUT Sort Gallery Items (CMS)

Endpoint:
- PUT `http://localhost:3200/api/setting/gallery-items/sort`

Body (JSON):
- `ids` (required): array id (angka atau string angka)

Rules:
- `ids` wajib unique.
- Semua id harus ada di database.
- `display_order` akan diupdate berdasarkan urutan array (index + 1).

Curl:
```bash
curl -X PUT 'http://localhost:3200/api/setting/gallery-items/sort' \
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
  "message": "Gallery items sorted successfully"
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

## DELETE Gallery Item (CMS)

Endpoint:
- DELETE `http://localhost:3200/api/setting/gallery-items/{id}`

Curl:
```bash
curl -X DELETE 'http://localhost:3200/api/setting/gallery-items/1' \
  -H 'Accept: application/json'
```

Response (200):
```json
{
  "success": true,
  "message": "Gallery item deleted successfully"
}
```
