#!/bin/bash

# Script to export Rendi integration files in event flow order
# Creates a text file with all code changes for documentation

OUTPUT_FILE="docs/rendi-integration-code.txt"
PROJECT_ROOT="/Users/tehbynnova/Code/MyProjects/Web/MFPProposalViewer"

# Clear output file if it exists
> "$PROJECT_ROOT/$OUTPUT_FILE"

echo "Exporting Rendi Video Compression Integration Files..." 
echo "====================================================="

# Function to append file contents with header
append_file() {
    local file_path=$1
    local description=$2
    
    echo "" >> "$PROJECT_ROOT/$OUTPUT_FILE"
    echo "=================================================================================" >> "$PROJECT_ROOT/$OUTPUT_FILE"
    echo "FILE: $file_path" >> "$PROJECT_ROOT/$OUTPUT_FILE"
    echo "DESCRIPTION: $description" >> "$PROJECT_ROOT/$OUTPUT_FILE"
    echo "=================================================================================" >> "$PROJECT_ROOT/$OUTPUT_FILE"
    echo "" >> "$PROJECT_ROOT/$OUTPUT_FILE"
    
    if [ -f "$PROJECT_ROOT/$file_path" ]; then
        cat "$PROJECT_ROOT/$file_path" >> "$PROJECT_ROOT/$OUTPUT_FILE"
    else
        echo "[FILE NOT FOUND]" >> "$PROJECT_ROOT/$OUTPUT_FILE"
    fi
    
    echo "" >> "$PROJECT_ROOT/$OUTPUT_FILE"
}

# Header
echo "RENDI VIDEO COMPRESSION INTEGRATION - CODE EXPORT" > "$PROJECT_ROOT/$OUTPUT_FILE"
echo "Generated on: $(date)" >> "$PROJECT_ROOT/$OUTPUT_FILE"
echo "=================================================" >> "$PROJECT_ROOT/$OUTPUT_FILE"
echo "" >> "$PROJECT_ROOT/$OUTPUT_FILE"
echo "This document contains all code changes for integrating Rendi video compression" >> "$PROJECT_ROOT/$OUTPUT_FILE"
echo "Files are ordered by event flow: Upload → Compression → Retrieval" >> "$PROJECT_ROOT/$OUTPUT_FILE"

# 1. Database Schema (Foundation)
append_file "supabase/migrations/add_video_compression_fields.sql" \
    "Database migration - Adds compression tracking fields"

# 2. Type Definitions
append_file "src/types/video.ts" \
    "TypeScript types - Updated VideoRecord interface"

# 3. Upload Flow
append_file "src/lib/uploadHandler.ts" \
    "Upload handler - Saves videos and creates DB records with compression status"

# 4. Video Data Fetching
append_file "src/hooks/use-videos.ts" \
    "Videos hook - Fetches video data including compression status"

# 5. Compression Status Checking
append_file "src/app/api/check-compression-status/route.ts" \
    "API endpoint - Checks if compressed videos exist and updates DB"

append_file "src/hooks/use-compression-check.ts" \
    "Compression check hook - Periodically checks for compression completion"

# 6. Manual Compression Trigger (Optional)
append_file "src/app/api/trigger-compression/route.ts" \
    "API endpoint - Manually trigger compression for testing"

# 7. Video Display & UI
append_file "src/components/Drawings/VideoPreview.tsx" \
    "Video preview component - Shows videos with compression status indicators"

# 8. Main Integration Point
append_file "src/app/drawings/[customerUuid]/client/DrawingsViewer.client.tsx" \
    "Drawings viewer - Main component that uses compression checking"

# 9. Documentation
append_file "docs/rendi-integration.md" \
    "Integration documentation - Setup and usage guide"

# Footer
echo "" >> "$PROJECT_ROOT/$OUTPUT_FILE"
echo "=================================================================================" >> "$PROJECT_ROOT/$OUTPUT_FILE"
echo "END OF EXPORT" >> "$PROJECT_ROOT/$OUTPUT_FILE"
echo "Total files: 10 (4 created, 6 modified)" >> "$PROJECT_ROOT/$OUTPUT_FILE"
echo "=================================================================================" >> "$PROJECT_ROOT/$OUTPUT_FILE"

echo "Export complete! Output saved to: $OUTPUT_FILE"

# Make the output file path relative for easier access
cd "$PROJECT_ROOT"
echo "You can view the file at: ./$OUTPUT_FILE"