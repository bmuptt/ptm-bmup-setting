# Core API - Curl Examples

## Base URL
```
http://localhost:3200/api/setting/core
```

## 1. Get Core Configuration

```bash
curl --location 'http://localhost:3200/api/setting/core'
```

## 2. Update Core Configuration (Without File Upload)

### Basic Update
```bash
curl --location 'http://localhost:3200/api/setting/core?_method=PUT' \
--form 'name="Updated PTM BMUP"' \
--form 'description="Updated description for testing"' \
--form 'address="Jl. Updated Address No. 456, Jakarta"' \
--form 'primary_color="#ff5733"' \
--form 'secondary_color="#33ff57"' \
--form 'status_file="0"'
```

### Partial Update (Name Only)
```bash
curl --location 'http://localhost:3200/api/setting/core?_method=PUT' \
--form 'name="New Name Only"' \
--form 'status_file="0"'
```

### Minimal Update (No Changes)
```bash
curl --location 'http://localhost:3200/api/setting/core?_method=PUT' \
--form 'status_file="0"'
```

## 3. Update Core Configuration (With File Upload)

### Upload New File
```bash
curl --location 'http://localhost:3200/api/setting/core?_method=PUT' \
--form 'name="Updated with Logo"' \
--form 'description="Description with new logo"' \
--form 'address="Jl. Address with Logo"' \
--form 'primary_color="#ff0000"' \
--form 'secondary_color="#00ff00"' \
--form 'status_file="1"' \
--form 'logo=@"/C:/ardi/data_kerja/bmup/tugas/logo.png"'
```

### Remove File (status_file=1 without file)
```bash
curl --location 'http://localhost:3200/api/setting/core?_method=PUT' \
--form 'name="Remove Logo Test"' \
--form 'status_file="1"'
```

## 4. Testing Validation Errors

### Invalid status_file
```bash
curl --location 'http://localhost:3200/api/setting/core?_method=PUT' \
--form 'name="Test Name"' \
--form 'status_file="5"'
```

### Missing _method field
```bash
curl --location 'http://localhost:3200/api/setting/core' \
--form 'name="Test without method"' \
--form 'status_file="0"'
```

## 5. Testing Authentication

### Without Token (Expected: 401 Unauthorized)
```bash
curl --location 'http://localhost:3200/api/setting/core?_method=PUT' \
--form 'name="No Auth Test"' \
--form 'status_file="0"'
```

### Invalid Token (Expected: 401 Unauthorized)
```bash
curl --location 'http://localhost:3200/api/setting/core?_method=PUT' \
--form 'name="Invalid Auth Test"' \
--form 'status_file="0"'
```

## 6. Complete Update with All Fields

```bash
curl --location 'http://localhost:3200/api/setting/core?_method=PUT' \
--form 'name="Complete Update Test"' \
--form 'description="<p>This is a <strong>complete</strong> update test with HTML content</p>"' \
--form 'address="Jl. Complete Address No. 999, Jakarta Selatan"' \
--form 'primary_color="#3498db"' \
--form 'secondary_color="#e74c3c"' \
--form 'status_file="1"' \
--form 'logo=@"/path/to/your/logo.png"'
```

## 7. Testing File Upload Validation

### Invalid File Type
```bash
curl --location 'http://localhost:3200/api/setting/core?_method=PUT' \
--form 'name="Invalid File Test"' \
--form 'status_file="1"' \
--form 'logo=@"/path/to/document.pdf"'
```

## Notes for Postman:

1. **URL**: `http://localhost:3200/api/setting/core?_method=PUT`
2. **Method**: `POST`
3. **Headers**: 
   - Add your authentication token as needed
4. **Body**: 
   - Select `form-data`
   - Add all fields as text except file upload
   - **IMPORTANT**: Add `_method=PUT` in URL query parameter

## Expected Responses:

- **200 OK**: Update successful
- **400 Bad Request**: Validation error
- **401 Unauthorized**: Authentication error
- **500 Internal Server Error**: Server error

## File Upload Requirements:
- **Format**: PNG, JPG, JPEG
- **Size**: Maximum 5MB
- **Field name**: `logo`
- **Path**: Use absolute path with `@` prefix

## Field Descriptions:

- `name`: Core configuration name
- `description`: Core configuration description (supports HTML)
- `address`: Core configuration address
- `primary_color`: Primary color (hex format)
- `secondary_color`: Secondary color (hex format)
- `status_file`: File change status (0 = no change, 1 = change)
- `logo`: Logo image file (only when status_file = 1)
