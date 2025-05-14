#!/bin/bash

# Test script to convert a single file's imports
# Usage: ./test-convert.sh <filepath>

if [ -z "$1" ]; then
  echo "Please provide a file path to convert"
  echo "Usage: ./test-convert.sh <filepath>"
  exit 1
fi

# Make a backup of the file
cp "$1" "$1.bak"

echo "Converting imports in file: $1"
echo "Original file backed up to: $1.bak"

# Run the relative-to-alias command on the file
relative-to-alias -s "$1" -a @ -ap ./src -e js,jsx,ts,tsx

# Show the difference
echo "Showing changes made:"
diff "$1.bak" "$1"

echo "Conversion complete! Check the diff above to see changes."
echo "To restore the original file: mv $1.bak $1"