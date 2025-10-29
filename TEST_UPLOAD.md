# Testing S3 Upload Flow

## Quick Manual Test (Recommended)

### Step 1: Access the Dashboard
1. Open http://localhost:3000
2. Click "Sign In"
3. Enter the password: `pitchbase2024`
4. Click "Sign In"

### Step 2: Create a New Pitch with PDF Upload
1. Navigate to http://localhost:3000/dashboard/pitches/new
2. Fill in the form:
   - **Title**: Test Upload
   - **Ticker**: TEST
   - **Summary**: Testing S3 upload functionality
   - (Other fields optional)
3. Scroll to "PDF Upload" section
4. Click "Choose File" and select a PDF
5. Wait for "Uploading..." to complete
6. Click "Create Pitch"

### Step 3: Verify Upload
1. Check the browser console for any errors
2. The PDF should now be stored in your S3 bucket: `pitchbase-pdfs`
3. The pitch should be created with the PDF URL pointing to S3

## What Happens Behind the Scenes

1. **Request Signed URL**: Frontend requests `/api/upload` with file info
2. **Get Upload URL**: Server generates a presigned S3 URL (valid for 1 hour)
3. **Upload to S3**: Frontend uploads file directly to S3 using the presigned URL
4. **Save URL**: The S3 URL is saved in the database with the pitch
5. **Display PDF**: PDF is accessible via the stored S3 URL

## Current S3 Configuration

From `.env.local`:
- **Bucket**: pitchbase-pdfs
- **Region**: us-east-2
- **Endpoint**: https://pitchbase-pdfs.s3.us-east-2.amazonaws.com

## Testing API Endpoints Directly

### Test Upload Endpoint
```bash
# This will return 401 (expected - requires auth)
curl -X POST http://localhost:3000/api/upload \
  -H "Content-Type: application/json" \
  -d '{
    "filename": "test.pdf",
    "contentType": "application/pdf",
    "type": "pdf"
  }'
```

### Check if Server is Running
```bash
curl http://localhost:3000/api/pitches
# Should return list of pitches (200 OK)
```

## Troubleshooting

### Server Not Running
```bash
npm run dev
```

### Authentication Issues
- Make sure you're signed in as an admin or author
- Check browser console for auth errors
- Try signing out and back in

### S3 Upload Fails
- Check `.env.local` has correct S3 credentials
- Verify S3 bucket exists and is accessible
- Check browser network tab for S3 upload errors

### PDF Not Displaying
- Verify the file URL is saved correctly in database
- Check if S3 bucket allows public read access (or use presigned URLs for viewing)


