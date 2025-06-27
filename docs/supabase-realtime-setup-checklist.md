# Supabase Realtime Setup Checklist

Complete these steps to enable realtime compression status updates:

## ✅ Supabase Dashboard Configuration

- [ ] **Enable Realtime on `3d` table**
  - Navigate to: Database → Realtime
  - Find table `3d` and toggle ON
  - Enable UPDATE events

- [ ] **Check RLS Policies** 
  - If RLS is enabled, run:
  ```sql
  CREATE POLICY "realtime_3d_updates" ON public."3d"
  FOR SELECT USING (true);
  ```

- [ ] **Verify Realtime Publication**
  - Run in SQL Editor:
  ```sql
  -- Check current status
  SELECT * FROM pg_publication_tables 
  WHERE pubname = 'supabase_realtime' AND tablename = '3d';
  
  -- Add if missing
  ALTER PUBLICATION supabase_realtime ADD TABLE public."3d";
  ```

## ✅ Database Migration

- [ ] **Run compression fields migration**
  - Execute `/supabase/migrations/add_video_compression_fields.sql`

## ✅ Edge Function Verification

- [ ] **Confirm Edge Function updates DB**
  - The `video-compress` function should update these fields:
    - `compression_status` 
    - `rendi_command_id`
    - `compressed_path`
    - `compression_error`
    - `updated_at`

## ✅ Client-Side Code

- [ ] **Removed polling infrastructure**
  - ✅ Deleted `/api/check-compression-status`
  - ✅ Deleted `use-compression-check` hook
  
- [ ] **Added realtime subscription**
  - ✅ Created `use-compression-realtime` hook
  - ✅ Updated `DrawingsViewer` to use realtime

## ✅ Testing

- [ ] **Test realtime updates**
  1. Open browser console
  2. Upload a video
  3. Watch for "Realtime update received" logs
  4. Verify UI updates without polling

- [ ] **Check Network tab**
  - No polling requests to `/api/check-compression-status`
  - WebSocket connection to Supabase Realtime

## ✅ Production Deployment

- [ ] **Environment variables set**
  - All Supabase keys configured
  - Rendi API key configured

- [ ] **Monitor initial uploads**
  - Check Supabase Realtime logs
  - Verify compression completes
  - Confirm UI updates instantly