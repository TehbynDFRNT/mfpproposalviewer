# Rendi Video Compression Integration

This document describes the integration of Rendi's FFmpeg-as-a-Service for automatic video compression with Supabase Realtime updates.

## Architecture Overview

```
User Upload → Storage Upload → DB Insert → Call Edge Function → Rendi API
                    ↓              ↓              ↓
                Success?      Success?      Trigger Compression
                    ↓              ↓              ↓
              File Ready     Record Ready    Polling Loop
                                   ↓              ↓
                          Realtime Event    Compression Complete
                                   ↓              ↓
                            UI Updates ← DB Update ← Downloads Result
```

## Key Components

### 1. Upload Flow (`/src/lib/uploadHandler.ts`)
- Videos are uploaded to `3d-renders/{projectId}/{videoType}-{timestamp}.mp4`
- Database record created with `compression_status: 'pending'`
- After successful upload & DB insert, directly calls Edge Function via:
  ```typescript
  await supabase.functions.invoke('video-compress', {
    body: { bucketId: '3d-renders', name: filePath }
  });
  ```
  - Uses Supabase client for auth-aware, environment-agnostic calls
  - Automatically includes user JWT if authenticated
  - Works in both local dev and production

### 2. Edge Function (`video-compress.ts`)
- Triggers on OBJECT_FINALIZED for `.mp4` files
- Creates signed URL and sends to Rendi API
- Polls for completion and downloads result to `compressed/`
- Optionally deletes source file if `DELETE_SOURCE=true`

### 3. Video Playback (`/src/components/Drawings/VideoPreview.tsx`)
- Automatically uses compressed video when available
- Falls back to original if compression pending/failed
- Shows compression status indicator

## Database Schema

New fields added to the `3d` table:
- `compression_status`: enum ('pending', 'processing', 'completed', 'failed')
- `compressed_path`: Path to compressed video
- `rendi_command_id`: Rendi job tracking ID
- `compression_error`: Error message if compression fails
- `updated_at`: Last update timestamp

## Environment Variables

Required environment variables:
```env
# Next.js App
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Edge Function
SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_KEY=your-service-role-key
RENDI_API_KEY=your-rendi-api-key
POLL_MS=5000          # Optional: polling interval (default 5s)
TIMEOUT_S=240         # Optional: timeout in seconds (default 4min)
DELETE_SOURCE=false   # Optional: delete original after compression
```

## Setup Instructions

### Supabase Realtime Configuration

1. **Enable Realtime on `3d` table**
   - Go to Supabase Dashboard → Database → Realtime
   - Toggle ON for table `3d` (enable UPDATE events)

2. **Configure RLS Policy (if enabled)**
   ```sql
   -- Allow users to see updates on their projects
   CREATE POLICY "realtime_3d_updates" ON public."3d"
   FOR SELECT USING (true);
   ```

3. **Verify Realtime Publication**
   ```sql
   -- Check if table is in realtime publication
   SELECT * FROM pg_publication_tables 
   WHERE pubname = 'supabase_realtime' AND tablename = '3d';
   
   -- If missing, add it:
   ALTER PUBLICATION supabase_realtime ADD TABLE public."3d";
   ```

### Database & Edge Function Setup

4. **Run Database Migration**
   ```sql
   -- Execute the migration script in Supabase SQL editor
   -- File: /supabase/migrations/add_video_compression_fields.sql
   ```

5. **Deploy Edge Function**
   - Deploy the `video-compress.ts` Edge Function  
   - Configure Storage trigger for OBJECT_FINALIZED events on `3d-renders` bucket
   - The Edge Function will update the database, triggering realtime events

6. **Update Environment Variables**
   - Add the required environment variables to your deployment

## API Endpoints

### Realtime Subscription (No API needed!)
The app uses Supabase Realtime instead of polling:
- `useCompressionRealtime` hook subscribes to database changes
- Instant updates when Edge Function updates compression status
- No API calls needed for status checks

### `/api/trigger-compression` (POST) - Optional
Manual endpoint for testing/re-processing
```json
{
  "projectId": "uuid",
  "videoType": "pool-selection-section"
}
```

## Compression Settings

Default FFmpeg command (from Edge Function):
```bash
-i {{in_1}} -c:v libx264 -preset veryfast -crf 26 -movflags +faststart {{out_1}}
```

- `crf 26`: Higher quality than 28 (lower = better quality)
- `preset veryfast`: Fast encoding
- `movflags +faststart`: Optimizes for web streaming

## Monitoring

Track compression status:
- Check `compression_status` in database
- Monitor Rendi dashboard for job status
- Watch Realtime events in Supabase Dashboard → Realtime → Logs
- Check Edge Function logs for processing errors

## Testing Realtime Updates

1. **Upload a video** 
   - UI should show "Pending" status immediately
   
2. **Edge Function triggers**
   - Watch browser console for "Realtime update received" logs
   - UI updates to "Processing" without any API calls
   
3. **Compression completes**
   - UI automatically updates to "Optimized"
   - Video switches to compressed version instantly
   
4. **No polling or refresh needed**
   - All updates happen via WebSocket connection
   - Check Network tab - no polling requests

## Troubleshooting

1. **Videos not compressing**
   - Verify Edge Function is deployed
   - Check Rendi API key is valid
   - Ensure webhook URL is accessible

2. **Compression failures**
   - Check `compression_error` field in database
   - Review Rendi job logs
   - Verify input video format is supported

3. **Playback issues**
   - Ensure Supabase Storage bucket permissions are correct
   - Check if compressed video path exists
   - Verify video URL generation logic