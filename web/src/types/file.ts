import type { User } from './user';

export interface PdfDocument {
  id: number;
  fileName: string;
  filePath: string;
  category?: string | null;
  uploadTime?: string | null;
  fileRoot?: string | null;
  user?: Pick<User, 'id' | 'username'> | null;
}

export interface FileUploadResponse {
  message?: string;
  error?: string;
}
