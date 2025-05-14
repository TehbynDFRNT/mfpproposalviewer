#!/bin/bash

echo "Copying related dialog files to clipboard..."

echo "=== AcceptProposalDialog.tsx ===" > /tmp/dialog_files.txt
cat "/Users/tehbynnova/Code/MyProjects/Web/MFPProposalViewer/src/components/modals/AcceptProposalDialog.tsx" >> /tmp/dialog_files.txt

echo -e "\n\n=== AcceptProposalSuccessDialog.tsx ===" >> /tmp/dialog_files.txt
cat "/Users/tehbynnova/Code/MyProjects/Web/MFPProposalViewer/src/components/modals/AcceptProposalSuccessDialog.tsx" >> /tmp/dialog_files.txt

echo -e "\n\n=== RequestChangesDialog.tsx ===" >> /tmp/dialog_files.txt
cat "/Users/tehbynnova/Code/MyProjects/Web/MFPProposalViewer/src/components/modals/RequestChangesDialog.tsx" >> /tmp/dialog_files.txt

echo -e "\n\n=== ChangeRequestSuccessDialog.tsx ===" >> /tmp/dialog_files.txt
cat "/Users/tehbynnova/Code/MyProjects/Web/MFPProposalViewer/src/components/modals/ChangeRequestSuccessDialog.tsx" >> /tmp/dialog_files.txt

echo -e "\n\n=== Footer.tsx ===" >> /tmp/dialog_files.txt
cat "/Users/tehbynnova/Code/MyProjects/Web/MFPProposalViewer/src/components/Footer/Footer.tsx" >> /tmp/dialog_files.txt

echo -e "\n\n=== accept-proposal/route.ts ===" >> /tmp/dialog_files.txt
cat "/Users/tehbynnova/Code/MyProjects/Web/MFPProposalViewer/src/app/api/accept-proposal/route.ts" >> /tmp/dialog_files.txt

echo -e "\n\n=== change-request/route.ts ===" >> /tmp/dialog_files.txt
cat "/Users/tehbynnova/Code/MyProjects/Web/MFPProposalViewer/src/app/api/change-request/route.ts" >> /tmp/dialog_files.txt

# Copy to clipboard - macOS specific
cat /tmp/dialog_files.txt | pbcopy

echo "All related files copied to clipboard!"