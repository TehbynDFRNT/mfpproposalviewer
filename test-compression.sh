#!/bin/bash

# Test the video-compress Edge Function locally

EDGE_FUNCTION_URL="https://mapshmozorhiewusdgor.supabase.co/functions/v1/video-compress"
ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1hcHNobW96b3JoaWV3dXNkZ29yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTQwNDM2MDQsImV4cCI6MjAyOTYxOTYwNH0.K98a3Y-WJvM0l93fBKbd3Wx-fI0IExkJJKqC7KLKrXw"

# Test with the provided video file
curl -X POST "$EDGE_FUNCTION_URL" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ANON_KEY" \
  -d '{
    "bucketId": "3d-renders",
    "name": "acec1f18-4af6-41d9-9b36-41aedf697d5f/water-feature-section-1750923102402.mp4"
  }' \
  -v