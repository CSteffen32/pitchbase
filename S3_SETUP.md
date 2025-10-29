# S3 Bucket CORS Configuration

## The Problem
When uploading files directly from the browser to S3 using presigned URLs, the browser's CORS (Cross-Origin Resource Sharing) policy blocks the request unless your S3 bucket is configured to allow it.

## Solution: Configure CORS on Your S3 Bucket

### Option 1: Using AWS Console

1. Go to AWS S3 Console: https://console.aws.amazon.com/s3/
2. Click on your bucket: `pitchbase-pdfs`
3. Go to the **Permissions** tab
4. Scroll down to **Cross-origin resource sharing (CORS)**
5. Click **Edit**
6. Paste this configuration:

```json
[
  {
    "AllowedHeaders": [
      "*"
    ],
    "AllowedMethods": [
      "GET",
      "PUT",
      "POST",
      "HEAD"
    ],
    "AllowedOrigins": [
      "http://localhost:3000",
      "https://*.vercel.app"
    ],
    "ExposeHeaders": [
      "ETag"
    ],
    "MaxAgeSeconds": 3000
  }
]
```

7. Click **Save changes**

### Option 2: Using AWS CLI

```bash
aws s3api put-bucket-cors \
  --bucket pitchbase-pdfs \
  --cors-configuration file://S3_CORS_CONFIG.json \
  --region us-east-2
```

### Option 3: Update AllowedOrigins

Once you deploy to production, update the `AllowedOrigins` array to include:
- Your production domain (e.g., `https://pitchbase.com`)
- Vercel domains if using Vercel
- Keep `http://localhost:3000` for development

Example:
```json
"AllowedOrigins": [
  "http://localhost:3000",
  "https://pitchbase.com",
  "https://pitchbase.vercel.app"
]
```

## Alternative: Server-Side Upload

If CORS configuration is not possible, we can modify the upload flow to upload through your Next.js server instead of directly from the browser. This bypasses CORS entirely. Would you like me to implement this alternative?

## Verify CORS is Working

After configuring CORS:

1. Try uploading a PDF again
2. Check the browser console - you should not see CORS errors
3. The upload should complete successfully

## Testing

You can test if CORS is configured by checking the response headers:

```bash
curl -I -X OPTIONS https://pitchbase-pdfs.s3.us-east-2.amazonaws.com/ \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: PUT"
```

You should see CORS headers in the response.

