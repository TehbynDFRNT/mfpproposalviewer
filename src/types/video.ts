/**
 * Types related to 3D videos and upload functionality
 */
import React from 'react';
import { UploadStatus } from '@/components/Drawings/FileUploadStatus';

/**
 * Represents a video record from the database
 */
export interface VideoRecord {
  video_type: string;
  video_path: string;
  created_at: string;
  compression_status?: 'pending' | 'processing' | 'completed' | 'failed';
  compressed_path?: string | null;
  rendi_command_id?: string | null;
  compression_error?: string | null;
}

/**
 * Status tracking for file uploads including file reference
 */
export interface UploadStatusRecord {
  status: UploadStatus;
  message: string;
  file: File | null;
}

/**
 * Map of upload statuses by video type
 */
export type StatusMap = Record<string, UploadStatusRecord>;

/**
 * Result of an upload operation
 */
export interface UploadResult {
  success: boolean;
  message: string;
}

/**
 * Result of batch upload operations
 */
export interface BatchUploadResult {
  success: boolean;
  results: Record<string, string>;
}

/**
 * Map of file references by section ID
 */
export type FileRefMap = {
  [key: string]: React.RefObject<HTMLInputElement | null>;
};