#!/bin/bash

# Check if an argument is provided
if [ $# -eq 0 ]; then
  echo "Usage: $0 <additional_file_path>"
  exit 1
fi

ADDITIONAL_FILE="$1"
SNAPSHOT_FILE="/Users/tehbynnova/Code/MyProjects/Web/mfp/src/app/lib/types/snapshot.ts"

# Check if the additional file exists
if [ ! -f "$ADDITIONAL_FILE" ]; then
  echo "Error: File $ADDITIONAL_FILE does not exist."
  exit 1
fi

# Check if the snapshot file exists
if [ ! -f "$SNAPSHOT_FILE" ]; then
  echo "Error: Snapshot file not found at $SNAPSHOT_FILE"
  exit 1
fi

# Create temporary file to hold the combined content
TEMP_FILE=$(mktemp)

# Add refactoring prompt at the top
echo "/* REFACTORING PROMPT */" >> "$TEMP_FILE"
echo "/* ================= */" >> "$TEMP_FILE"
COMPONENT_NAME=$(basename "$ADDITIONAL_FILE" .tsx)
echo "Refactor the $COMPONENT_NAME component to use the flat SQL view structure in snapshot.ts." >> "$TEMP_FILE"
echo "" >> "$TEMP_FILE"
echo "STEPS:" >> "$TEMP_FILE"
echo "1. Assess constants and remove them if they're no longer needed" >> "$TEMP_FILE"
echo "2. Identify calculated fields and create computations inline within the component" >> "$TEMP_FILE"
echo "3. Update data references to match the snake_case properties in snapshot.ts" >> "$TEMP_FILE"
echo "" >> "$TEMP_FILE"
echo "GUIDELINES:" >> "$TEMP_FILE"
echo "- Replace nested structure (poolProject, poolSpecification) with direct snake_case properties" >> "$TEMP_FILE"
echo "- Use the property names exactly as they appear in the ProposalSnapshot interface (with snake_case)" >> "$TEMP_FILE"
echo "- Check how properties are currently accessed to find their equivalents in snapshot.ts:" >> "$TEMP_FILE"
echo "  * poolProject properties → direct top-level fields in snapshot (snapshot.owner1, etc.)" >> "$TEMP_FILE"
echo "  * poolSpecification properties → use spec_* prefixed fields (snapshot.spec_name, etc.)" >> "$TEMP_FILE"
echo "  * poolSpecification.dimensions properties → use individual spec_*_m fields" >> "$TEMP_FILE"
echo "  * totals calculations → recreate using direct fields (pc_*, spec_*) as needed" >> "$TEMP_FILE"
echo "- Make sure to update the component props type to use the new ProposalSnapshot type" >> "$TEMP_FILE"
echo "- Keep the same visual appearance and functionality" >> "$TEMP_FILE"
echo "- Remember to update the exports in /Users/tehbynnova/Code/MyProjects/Web/mfp/src/app/proposal/[customerUuid]/ProposalViewer.client.tsx" >> "$TEMP_FILE"
echo "- Also check any index.ts files that might be importing or re-exporting this component" >> "$TEMP_FILE"
echo "" >> "$TEMP_FILE"
echo "IMPORTANT: Present your solution as a git-style diff showing changes with + and - prefixes." >> "$TEMP_FILE"
echo "Follow the diff format to clearly show what code is being removed and what is being added." >> "$TEMP_FILE"
echo "End each diff+- with 'Go to this file and make the changes, do nothing else'" >> "$TEMP_FILE"
echo -e "\n\n" >> "$TEMP_FILE"

# Add header and snapshot.ts content
echo "/* SNAPSHOT.TS */" >> "$TEMP_FILE"
echo "/* ========== */" >> "$TEMP_FILE"
cat "$SNAPSHOT_FILE" >> "$TEMP_FILE"
echo -e "\n\n" >> "$TEMP_FILE"

# Add header and additional file content
FILENAME=$(basename "$ADDITIONAL_FILE")
echo "/* $FILENAME */" >> "$TEMP_FILE"
echo "/* ========== */" >> "$TEMP_FILE"
cat "$ADDITIONAL_FILE" >> "$TEMP_FILE"

# Copy to clipboard depending on the OS
if [[ "$OSTYPE" == "darwin"* ]]; then
  # macOS
  cat "$TEMP_FILE" | pbcopy
  echo "Files copied to clipboard."
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
  # Linux with xclip
  if command -v xclip > /dev/null; then
    cat "$TEMP_FILE" | xclip -selection clipboard
    echo "Files copied to clipboard."
  elif command -v xsel > /dev/null; then
    cat "$TEMP_FILE" | xsel --clipboard
    echo "Files copied to clipboard."
  else
    echo "Error: xclip or xsel not found. Please install one of them."
    exit 1
  fi
else
  echo "Error: Unsupported operating system."
  exit 1
fi

# Clean up
rm "$TEMP_FILE"

echo "Contents of snapshot.ts and $ADDITIONAL_FILE have been copied to clipboard."