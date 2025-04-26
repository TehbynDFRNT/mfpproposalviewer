#!/bin/bash

# Define the target files
PROPOSAL_DIR="/Users/tehbynnova/Code/MyProjects/Web/mfp/src/app/proposal"
PROPOSAL_DATA="/Users/tehbynnova/Code/MyProjects/Web/mfp/src/lib/getProposalData.ts"
SUPABASE_CLIENT="/Users/tehbynnova/Code/MyProjects/Web/mfp/src/lib/supabaseClient.ts"
PROPOSAL_TYPES="/Users/tehbynnova/Code/MyProjects/Web/mfp/src/types/proposal.ts"

# Create a temporary file
TEMP_FILE=$(mktemp)

# Add files with headers to the temp file
# Proposal page files
echo -e "# Proposal Dynamic Route Files\n" >> "$TEMP_FILE"
echo -e "## page.tsx\n\`\`\`tsx" >> "$TEMP_FILE"
cat "$PROPOSAL_DIR/[customerUuid]/page.tsx" >> "$TEMP_FILE"
echo -e "\`\`\`\n" >> "$TEMP_FILE"

echo -e "## ProposalViewer.client.tsx (partial - file is too large)\n\`\`\`tsx" >> "$TEMP_FILE"
head -n 100 "$PROPOSAL_DIR/[customerUuid]/ProposalViewer.client.tsx" >> "$TEMP_FILE"
echo -e "// ... (file continues)\n\`\`\`\n" >> "$TEMP_FILE"

echo -e "## error.tsx\n\`\`\`tsx" >> "$TEMP_FILE"
cat "$PROPOSAL_DIR/[customerUuid]/error.tsx" >> "$TEMP_FILE"
echo -e "\`\`\`\n" >> "$TEMP_FILE"

echo -e "## loading.tsx\n\`\`\`tsx" >> "$TEMP_FILE"
cat "$PROPOSAL_DIR/[customerUuid]/loading.tsx" >> "$TEMP_FILE"
echo -e "\`\`\`\n" >> "$TEMP_FILE"

# Library files
echo -e "# Library Files\n" >> "$TEMP_FILE"
echo -e "## getProposalData.ts\n\`\`\`typescript" >> "$TEMP_FILE"
cat "$PROPOSAL_DATA" >> "$TEMP_FILE"
echo -e "\`\`\`\n" >> "$TEMP_FILE"

echo -e "## supabaseClient.ts\n\`\`\`typescript" >> "$TEMP_FILE"
cat "$SUPABASE_CLIENT" >> "$TEMP_FILE"
echo -e "\`\`\`\n" >> "$TEMP_FILE"

# Type definitions
echo -e "# Type Definitions\n" >> "$TEMP_FILE"
echo -e "## proposal.ts\n\`\`\`typescript" >> "$TEMP_FILE"
cat "$PROPOSAL_TYPES" >> "$TEMP_FILE"
echo -e "\`\`\`\n" >> "$TEMP_FILE"

# Copy to clipboard
if command -v pbcopy > /dev/null; then
  # macOS
  cat "$TEMP_FILE" | pbcopy
  echo "Files copied to clipboard (macOS)."
elif command -v xclip > /dev/null; then
  # Linux with xclip
  cat "$TEMP_FILE" | xclip -selection clipboard
  echo "Files copied to clipboard (Linux with xclip)."
elif command -v xsel > /dev/null; then
  # Linux with xsel
  cat "$TEMP_FILE" | xsel --clipboard --input
  echo "Files copied to clipboard (Linux with xsel)."
elif command -v clip.exe > /dev/null; then
  # Windows
  cat "$TEMP_FILE" | clip.exe
  echo "Files copied to clipboard (Windows)."
else
  echo "No clipboard command found. Content saved to $TEMP_FILE"
  exit 1
fi

# Cleanup
rm "$TEMP_FILE"