#!/bin/bash

# Exit on any error
set -e

# Check if a file argument was provided
if [ $# -lt 1 ]; then
  echo "Usage: $0 <component_file_path> [user_request]"
  echo "Example: $0 src/app/proposal/[customerUuid]/components/sections/CustomerInfoCards.tsx \"Update to use the snapshot prop\""
  exit 1
fi

COMPONENT_PATH="$1"
USER_REQUEST="${2:-UserRequest}"  # Use the provided user request or default to 'UserRequest'

# Check if component file exists
if [ ! -f "$COMPONENT_PATH" ]; then
  echo "Error: Component file not found: $COMPONENT_PATH"
  exit 1
fi

SNAPSHOT_PATH="src/app/lib/types/snapshot.ts"
PROMPT_TEMPLATE_PATH="docs/prompt.md"

# Check if required files exist
if [ ! -f "$SNAPSHOT_PATH" ]; then
  echo "Error: Snapshot file not found: $SNAPSHOT_PATH"
  exit 1
fi

if [ ! -f "$PROMPT_TEMPLATE_PATH" ]; then
  echo "Error: Prompt template not found: $PROMPT_TEMPLATE_PATH"
  exit 1
fi

# Create component name from file path
COMPONENT_NAME=$(basename "$COMPONENT_PATH" .tsx)

# Create a temporary directory for files
TEMP_DIR=$(mktemp -d)
TEMP_OUTPUT="$TEMP_DIR/output.md"

# Read the content of files
SNAPSHOT_CONTENT=$(cat "$SNAPSHOT_PATH")
COMPONENT_CONTENT=$(cat "$COMPONENT_PATH")

# Escape special characters in USER_REQUEST for sed
# This handles cases with quotes, slashes, etc. in the user request
ESCAPED_USER_REQUEST=$(printf '%s\n' "$USER_REQUEST" | sed 's/[\/&]/\\&/g')

# Process the template with simple string replacements
cat "$PROMPT_TEMPLATE_PATH" | \
  sed "s|<ComponentName>|$COMPONENT_NAME|g" | \
  sed "s|src/app/proposal/.../<ComponentName>.tsx|$COMPONENT_PATH|g" | \
  sed "s|UserRequest|$ESCAPED_USER_REQUEST|g" > "$TEMP_OUTPUT"

# Use a simple but effective approach for code block replacement
# First for snapshot.ts
SNAPSHOT_MARKER_LINE_NUM=$(grep -n "// — paste your current snapshot.ts here —" "$TEMP_OUTPUT" | cut -d':' -f1)
if [ -n "$SNAPSHOT_MARKER_LINE_NUM" ]; then
  # Split the file into before and after parts
  head -n $(($SNAPSHOT_MARKER_LINE_NUM-1)) "$TEMP_OUTPUT" > "$TEMP_DIR/before.md"
  tail -n +$(($SNAPSHOT_MARKER_LINE_NUM+1)) "$TEMP_OUTPUT" > "$TEMP_DIR/after.md"
  
  # Create the new file with the replacement
  cat "$TEMP_DIR/before.md" > "$TEMP_DIR/new_output.md"
  echo "$SNAPSHOT_CONTENT" >> "$TEMP_DIR/new_output.md"
  cat "$TEMP_DIR/after.md" >> "$TEMP_DIR/new_output.md"
  
  # Update the output file
  mv "$TEMP_DIR/new_output.md" "$TEMP_OUTPUT"
fi

# Now for Component code
COMPONENT_MARKER_LINE_NUM=$(grep -n "// — copy the JSX/type code you want to change here —" "$TEMP_OUTPUT" | cut -d':' -f1)
if [ -n "$COMPONENT_MARKER_LINE_NUM" ]; then
  # Split the file into before and after parts
  head -n $(($COMPONENT_MARKER_LINE_NUM-1)) "$TEMP_OUTPUT" > "$TEMP_DIR/before.md"
  tail -n +$(($COMPONENT_MARKER_LINE_NUM+1)) "$TEMP_OUTPUT" > "$TEMP_DIR/after.md"
  
  # Create the new file with the replacement
  cat "$TEMP_DIR/before.md" > "$TEMP_DIR/new_output.md"
  echo "$COMPONENT_CONTENT" >> "$TEMP_DIR/new_output.md"
  cat "$TEMP_DIR/after.md" >> "$TEMP_DIR/new_output.md"
  
  # Update the output file
  mv "$TEMP_DIR/new_output.md" "$TEMP_OUTPUT"
fi

# Read the final output
OUTPUT=$(cat "$TEMP_OUTPUT")

# Clean up temporary files
rm -rf "$TEMP_DIR"

# Check the operating system and use appropriate clipboard command
if [[ "$OSTYPE" == "darwin"* ]]; then
  # macOS
  echo "$OUTPUT" | pbcopy
  echo "Prompt copied to clipboard"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
  # Linux with xclip
  if command -v xclip > /dev/null; then
    echo "$OUTPUT" | xclip -selection clipboard
    echo "Prompt copied to clipboard"
  elif command -v xsel > /dev/null; then
    echo "$OUTPUT" | xsel --clipboard
    echo "Prompt copied to clipboard"
  else
    echo "Error: Neither xclip nor xsel found. Install one of them to use clipboard."
    exit 1
  fi
elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
  # Windows with clip
  echo "$OUTPUT" | clip
  echo "Prompt copied to clipboard"
else
  echo "Unsupported operating system for clipboard operations"
  exit 1
fi

echo "Prompt copied to clipboard. Don't forget to describe the desired behavior in the 'Desired behavior' section."