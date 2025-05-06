# /snapshot

## Description
Copies the content of snapshot.ts and the specified component file to the clipboard for easy refactoring.

## Usage
```
/snapshot path/to/component/file.tsx
```

## Examples
```
/snapshot src/components/sections/CustomerInfoCards.tsx
```

## Implementation
When this command is issued, run:
```bash
/Users/tehbynnova/Code/MyProjects/Web/mfp/scripts/copy-files-to-clipboard.sh $1
```

The script will:
1. Copy the contents of the `snapshot.ts` file
2. Append the contents of the specified component file
3. Add clear headers to separate the files
4. Copy everything to the clipboard
5. Notify when the operation is complete

Use this command when you need to refactor a component to work with the new flat data structure.