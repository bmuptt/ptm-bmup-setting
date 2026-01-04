# Blog Posts API

Modul ini untuk management Blog Post dari CMS (butuh auth token), dan endpoint publik untuk halaman landing.

Catatan:
- Content dikirim dari frontend sebagai HTML (WYSIWYG) dan akan disanitize di backend (DOMPurify) sebelum disimpan.
- Cover dan OG Image (jika upload) disimpan ke folder terpisah:
  - `storage/images/blog/covers`
  - `storage/images/blog/og-images`
- Sorting stabil: jika ada sorting utama lain, tetap pakai `id desc` sebagai tie-breaker.

## GET List Blog Posts (Landing)

Endpoint:
- GET `http://localhost:3200/api/setting/blog-posts/landing`

Query (optional):
- `page` (default 1)
- `limit` (default 10, max 50)

Catatan:
- Hanya mengembalikan data `status=published`.
- Sorting: `published_at desc`, lalu `id desc`.

Curl:
```bash
curl -X GET 'http://localhost:3200/api/setting/blog-posts/landing?page=1&limit=10' \
  -H 'Accept: application/json'
```

Response (200):
```json
{
  "success": true,
  "message": "Blog posts retrieved successfully",
  "page": 1,
  "limit": 10,
  "total": 2,
  "totalPages": 1,
  "data": [
    {
      "id": 1,
      "slug": "newer-post",
      "title": "Newer",
      "excerpt": null,
      "content": "<p>New</p>",
      "cover_image_url": null,
      "status": "published",
      "published_at": "2026-01-02T00:00:00.000Z",
      "is_featured": true,
      "meta_title": null,
      "meta_description": null,
      "og_image_url": null,
      "created_by": 0,
      "updated_by": 0,
      "created_at": "2026-01-02T00:00:00.000Z",
      "updated_at": "2026-01-02T00:00:00.000Z"
    }
  ]
}
```

## GET List Blog Posts Featured (Landing)

Endpoint:
- GET `http://localhost:3200/api/setting/blog-posts/landing/featured`

Query (optional):
- `limit` (default 10, max 50)

Catatan:
- Hanya mengembalikan data `status=published` dan `is_featured=true`.

Curl:
```bash
curl -X GET 'http://localhost:3200/api/setting/blog-posts/landing/featured?limit=10' \
  -H 'Accept: application/json'
```

Response (200):
```json
{
  "success": true,
  "message": "Featured blog posts retrieved successfully",
  "count": 1,
  "data": [
    {
      "id": 1,
      "slug": "featured-post",
      "title": "Featured Post",
      "excerpt": null,
      "content": "# Featured",
      "cover_image_url": null,
      "status": "published",
      "published_at": "2026-01-02T00:00:00.000Z",
      "is_featured": true,
      "meta_title": null,
      "meta_description": null,
      "og_image_url": null,
      "created_by": 0,
      "updated_by": 0,
      "created_at": "2026-01-02T00:00:00.000Z",
      "updated_at": "2026-01-02T00:00:00.000Z"
    }
  ]
}
```

## GET Detail Blog Post (Landing)

Endpoint:
- GET `http://localhost:3200/api/setting/blog-posts/landing/{slug}`

Curl:
```bash
curl -X GET 'http://localhost:3200/api/setting/blog-posts/landing/my-post' \
  -H 'Accept: application/json'
```

Response (200):
```json
{
  "success": true,
  "message": "Blog post retrieved successfully",
  "data": {
    "id": 1,
    "slug": "my-post",
    "title": "My Post",
    "excerpt": null,
    "content": "<h2>HTML content</h2>",
    "cover_image_url": null,
    "status": "published",
    "published_at": "2026-01-02T00:00:00.000Z",
    "is_featured": false,
    "meta_title": null,
    "meta_description": null,
    "og_image_url": null,
    "created_by": 0,
    "updated_by": 0,
    "created_at": "2026-01-02T00:00:00.000Z",
    "updated_at": "2026-01-02T00:00:00.000Z"
  }
}
```

## GET List Blog Posts (CMS)

Endpoint:
- GET `http://localhost:3200/api/setting/blog-posts`

Query (optional):
- `page` (default 1)
- `limit` (default 10, max 100)
- `search` (search di `title` dan `excerpt`)
- `status` (`draft|published|not_published`)
- `is_featured` (`true|false|1|0`)
- `order_by` (`published_at|updated_at|title`) (default `created_at`)
- `order_dir` (`asc|desc`) (default `desc`)

Catatan:
- Sorting: `{order_by} {order_dir}`, lalu `id desc`.

Curl:
```bash
curl -X GET 'http://localhost:3200/api/setting/blog-posts?page=1&limit=10&status=draft&search=hello' \
  -H 'Accept: application/json'
```

Response (200):
```json
{
  "success": true,
  "message": "Blog posts retrieved successfully",
  "page": 1,
  "limit": 10,
  "total": 1,
  "totalPages": 1,
  "data": []
}
```

## GET Detail Blog Post (CMS)

Endpoint:
- GET `http://localhost:3200/api/setting/blog-posts/{id}`

Curl:
```bash
curl -X GET 'http://localhost:3200/api/setting/blog-posts/1' \
  -H 'Accept: application/json'
```

## POST Create Blog Post (CMS)

Endpoint:
- POST `http://localhost:3200/api/setting/blog-posts`

Body (multipart/form-data):
- `title` (required)
- `excerpt` (optional, nullable)
- `content` (required, HTML)
- `status` (optional): `draft|published|not_published` (default `draft`)
- `is_featured` (optional): `true|false|1|0` (default `false`)
- `meta_title` (optional, nullable)
- `meta_description` (optional, nullable)
- `cover` (optional): file image (cover blog)
- `og_image` (optional): file image (og image)

Catatan:
- Saat create, `slug` otomatis dari `title` dan dijamin unik.
- Jika upload `cover`, API akan mengisi `cover_image_url` otomatis.
- Jika upload `og_image`, API akan mengisi `og_image_url` otomatis.

Curl:
```bash
curl -X POST 'http://localhost:3200/api/setting/blog-posts' \
  -H 'Accept: application/json' \
  --form 'title=Hello World' \
  --form 'content=<p>Hello</p>' \
  --form 'status=draft' \
  --form 'is_featured=false' \
  --form 'cover=@/path/to/cover.jpg' \
  --form 'og_image=@/path/to/og.jpg'
```

Response (201):
```json
{
  "success": true,
  "message": "Blog post created successfully",
  "data": {
    "id": 1,
    "slug": "hello-world",
    "title": "Hello World",
    "excerpt": null,
    "content": "<p>Hello</p>",
    "cover_image_url": "http://localhost:3200/storage/images/blog/covers/cover-123.png",
    "status": "draft",
    "published_at": null,
    "is_featured": false,
    "meta_title": null,
    "meta_description": null,
    "og_image_url": "http://localhost:3200/storage/images/blog/og-images/og-123.png",
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
    "The title is required!",
    "The content is required!"
  ]
}
```

## Update Blog Post (CMS)

Endpoint:
- PUT `http://localhost:3200/api/setting/blog-posts/{id}?_method=PUT`

Query:
- `_method=PUT`: required untuk method-override (request pakai POST)

Body (multipart/form-data):
- Field content (semua optional): `title`, `excerpt`, `content`, `status`, `is_featured`, `meta_title`, `meta_description`
- `status_file_cover` (required): `0|1`
  - `0`: tidak ada perubahan cover (keep cover sebelumnya). Jangan upload `cover`.
  - `1`: ada perubahan cover:
    - jika upload `cover`: ganti cover
    - jika tidak upload `cover`: hapus cover
- `status_file_og_image` (required): `0|1` (aturan sama dengan cover)
- `cover` (conditional): file image
- `og_image` (conditional): file image

Curl:
```bash
curl -X POST 'http://localhost:3200/api/setting/blog-posts/1?_method=PUT' \
  -H 'Accept: application/json' \
  --form 'title=Hello World Updated' \
  --form 'status=published' \
  --form 'status_file_cover=1' \
  --form 'status_file_og_image=0' \
  --form 'cover=@/path/to/new-cover.jpg'
```

## Publish Blog Post (CMS)

Endpoint:
- PUT `http://localhost:3200/api/setting/blog-posts/{id}/publish`

Catatan:
- Set `status=published`.
- Jika sebelumnya belum published, maka `published_at` akan di-set ke waktu sekarang.

Curl:
```bash
curl -X PUT 'http://localhost:3200/api/setting/blog-posts/1/publish' \
  -H 'Accept: application/json'
```

## Unpublish Blog Post (CMS)

Endpoint:
- PUT `http://localhost:3200/api/setting/blog-posts/{id}/unpublish`

Catatan:
- Set `status=not_published` dan `published_at=null`.

Curl:
```bash
curl -X PUT 'http://localhost:3200/api/setting/blog-posts/1/unpublish' \
  -H 'Accept: application/json'
```

## DELETE Blog Post (CMS)

Endpoint:
- DELETE `http://localhost:3200/api/setting/blog-posts/{id}`

Curl:
```bash
curl -X DELETE 'http://localhost:3200/api/setting/blog-posts/1' \
  -H 'Accept: application/json'
```
