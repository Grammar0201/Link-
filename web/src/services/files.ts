import { del, http, post } from '@/lib/http';
import type { FileUploadResponse, PdfDocument } from '@/types';

export async function uploadPdf(formData: FormData) {
  return post<FileUploadResponse>('/api/files/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
}

export async function fetchUserFiles(userId: number) {
  const res = await http.get<PdfDocument[]>(`/api/files/${userId}`, {
    validateStatus: (status) => (status ?? 0) === 200 || (status ?? 0) === 404,
  });
  if (res.status === 404) {
    return [] as PdfDocument[];
  }
  return res.data ?? [];
}

export async function removeFile(fileId: number) {
  return del<string | { message?: string; error?: string }>(`/api/files/delete/${fileId}`);
}
