import React from 'react';
import { Check, AlertCircle, FileIcon, Loader2 } from 'lucide-react';
import { cn } from "@/app/drawings/[customerUuid]/lib/utils";

export type UploadStatus = 'idle' | 'success' | 'error' | 'selected' | 'loading';

interface FileUploadStatusProps {
  status: UploadStatus;
  message?: string;
  file?: File | null;
}

export function FileUploadStatus({ status, message, file }: FileUploadStatusProps) {
  if (status === 'idle') return null;
  
  const fileSize = file ? formatFileSize(file.size) : '';
  
  return (
    <div className={cn(
      "mt-3 p-2 rounded-md text-sm flex items-start",
      status === 'success' && "bg-green-50 text-green-700 border border-green-200",
      status === 'error' && "bg-red-50 text-red-700 border border-red-200",
      status === 'selected' && "bg-blue-50 text-blue-700 border border-blue-200",
      status === 'loading' && "bg-amber-50 text-amber-700 border border-amber-200"
    )}>
      <div className="mr-2 mt-0.5">
        {status === 'success' && <Check className="h-4 w-4 text-green-600" />}
        {status === 'error' && <AlertCircle className="h-4 w-4 text-red-600" />}
        {status === 'selected' && <FileIcon className="h-4 w-4 text-blue-600" />}
        {status === 'loading' && <Loader2 className="h-4 w-4 text-amber-600 animate-spin" />}
      </div>
      <div className="flex-1">
        {status === 'selected' && file && (
          <p className="font-medium">{file.name} ({fileSize})</p>
        )}
        {message && <p className={status === 'selected' ? "text-xs opacity-80" : ""}>{message}</p>}
      </div>
    </div>
  );
}

// Helper function to format file size
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}