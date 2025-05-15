'use client';

import * as React from "react";
import { cn } from "@/lib/utils";
import { FileUploadStatus, UploadStatus } from "@/components/Drawings/FileUploadStatus";
 
// Local Label component
const Label = ({ 
  className, 
  htmlFor, 
  ...props 
}: React.LabelHTMLAttributes<HTMLLabelElement>) => {
  return (
    <label
      htmlFor={htmlFor}
      className={cn(
        "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
        className
      )}
      {...props}
    />
  );
};

// Local Input component
const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = "Input";

export interface InputFileProps {
  id: string;
  label: string;
  accept?: string;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  status?: UploadStatus;
  statusMessage?: string;
  selectedFile?: File | null;
}

export const InputFile = React.forwardRef<HTMLInputElement, InputFileProps>(
  function InputFile(
    {
      id,
      label,
      accept,
      onChange,
      status = 'idle',
      statusMessage,
      selectedFile
    }: InputFileProps,
    ref
  ) {
    return (
      <div className="grid w-full items-center gap-1.5">
        <Label htmlFor={id}>{label}</Label>
        <Input
          id={id}
          type="file"
          accept={accept}
          onChange={onChange}
          ref={ref}
          className="cursor-pointer file:text-[#DB9D6A] file:rounded-md file:bg-white file:border-[#DB9D6A]/50 file:font-semibold hover:file:bg-[#DB9D6A]/5"
        />
        <FileUploadStatus
          status={status}
          message={statusMessage}
          file={selectedFile}
        />
      </div>
    );
  }
);