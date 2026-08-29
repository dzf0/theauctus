-- Make media bucket public so video URLs work without auth
UPDATE storage.buckets SET public = true WHERE id = 'media';

-- Drop the restrictive view policy
DROP POLICY IF EXISTS "Users can view own media" ON storage.objects;

-- Allow anyone to view media files (needed for video player)
CREATE POLICY "Anyone can view media" ON storage.objects FOR SELECT
  USING (bucket_id = 'media');
