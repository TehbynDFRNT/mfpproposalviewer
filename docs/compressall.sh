#!/usr/bin/env bash
# ------------------------------------------------------------------
# Trigger Supabase Edge Function `video-compress`
# for a set of object keys in the public `3d-renders` bucket.
#
# Prerequisites:
#   • EDGE FUNCTION must be deployed with --no-verify-jwt
#   • Bucket name is 3d-renders
#   • You know your Supabase project ref  (mapshmozorhiewusdgor)
#   • You have the project’s anonymous API key (NEXT_PUBLIC_SUPABASE_ANON_KEY)
# ------------------------------------------------------------------

PROJECT="mapshmozorhiewusdgor"
APIKEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1hcHNobW96b3JoaWV3dXNkZ29yIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczOTc1ODk4OSwiZXhwIjoyMDU1MzM0OTg5fQ.isDGTbtCQeN71Q6h5vcgLnF3PugYO_2LqWZqVfZTrC8"   # <-- Service role key for Edge Function access
FUNC_URL="https://${PROJECT}.supabase.co/functions/v1/video-compress?apikey=${APIKEY}"

# list all object keys you want to compress
FILES=(
  "950c2710-6ecd-4972-aa01-6f65661c76bd/fencing-section-1750813638093.mp4"
  "950c2710-6ecd-4972-aa01-6f65661c76bd/pool-selection-section-1750900715268.mp4"
  "950c2710-6ecd-4972-aa01-6f65661c76bd/proposal-summary-section-1750900792401.mp4"
  "950c2710-6ecd-4972-aa01-6f65661c76bd/concrete-paving-section-1750909234404.mp4"
  "950c2710-6ecd-4972-aa01-6f65661c76bd/water-feature-section-1750909281046.mp4"
  "950c2710-6ecd-4972-aa01-6f65661c76bd/add-ons-section-1750912327027.mp4"
  "950c2710-6ecd-4972-aa01-6f65661c76bd/filtration-maintenance-section-1750917474884.mp4"
)

# loop through the array and POST each job
for KEY in "${FILES[@]}"; do
  echo "▶︎ triggering compression for ${KEY}"
  curl -s -w "  → HTTP %{http_code}\n" -X POST "${FUNC_URL}" \
       -H "Content-Type: application/json" \
       -d "{\"bucketId\":\"3d-renders\",\"name\":\"${KEY}\"}"
done
