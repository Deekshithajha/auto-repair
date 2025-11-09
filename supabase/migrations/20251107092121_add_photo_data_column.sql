-- Add photo_data column to store base64 images directly in database
ALTER TABLE public.vehicle_photos
ADD COLUMN IF NOT EXISTS photo_data TEXT;

-- Make storage_path nullable since we'll be storing data directly in database
ALTER TABLE public.vehicle_photos
ALTER COLUMN storage_path DROP NOT NULL;

-- Add comment to explain the column
COMMENT ON COLUMN public.vehicle_photos.photo_data IS 'Base64 encoded image data stored directly in database';




