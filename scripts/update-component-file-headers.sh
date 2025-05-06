#!/bin/bash

# This script updates the file header comments in component files
# to reflect their new locations after restructuring.

# Base directory
BASE_DIR="/Users/tehbynnova/Code/MyProjects/Web/mfp"

# Directory containing the components
COMPONENTS_DIR="$BASE_DIR/src/components"

# Find all TypeScript/React files in the components directory
find "$COMPONENTS_DIR" -type f \( -name "*.tsx" -o -name "*.ts" \) | while read -r FILE; do
  echo "Processing $FILE..."
  
  # Get the relative path from the base directory
  RELATIVE_PATH="${FILE#$BASE_DIR/}"
  
  # Check if there's an existing header comment
  if head -3 "$FILE" | grep -q "File:"; then
    # Replace the existing header comment
    TMP_FILE=$(mktemp)
    echo "/**" > "$TMP_FILE"
    echo " * File: $RELATIVE_PATH" >> "$TMP_FILE"
    echo " */" >> "$TMP_FILE"
    
    # Append the rest of the file, skipping the original header (first 3 lines)
    tail -n +4 "$FILE" >> "$TMP_FILE"
    
    # Replace the original file
    mv "$TMP_FILE" "$FILE"
    echo "  Updated header in $FILE"
  else
    # Add a new header comment at the beginning of the file
    TMP_FILE=$(mktemp)
    echo "/**" > "$TMP_FILE"
    echo " * File: $RELATIVE_PATH" >> "$TMP_FILE"
    echo " */" >> "$TMP_FILE"
    echo "" >> "$TMP_FILE"
    
    # Append the original file content
    cat "$FILE" >> "$TMP_FILE"
    
    # Replace the original file
    mv "$TMP_FILE" "$FILE"
    echo "  Added header to $FILE"
  fi
done

echo "All component file headers have been updated."