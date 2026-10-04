import type { CreateFeaturedUploadRequest, MusicUpload } from "@/entities/music-upload";

import { apiRequest } from "../http-client";

export type PresignedUploadRequest = {
  content_type: string;
  file_name: string;
  folder?: string;
};

export type PresignedUploadResponse = {
  file_url: string;
  key: string;
  upload_url: string;
};

export const uploadsApi = {
  createPresignedUrl: (data: PresignedUploadRequest) =>
    apiRequest<PresignedUploadResponse>("/uploads/presigned-url", {
      body: data,
      method: "POST",
    }),

  createFeatured: (data: CreateFeaturedUploadRequest) =>
    apiRequest<MusicUpload>("/uploads/featured", {
      body: data,
      method: "POST",
    }),

  delete: (uploadId: string) =>
    apiRequest<void>(`/uploads/${uploadId}`, {
      method: "DELETE",
    }),

  listMine: () => apiRequest<MusicUpload[]>("/uploads/me"),

  uploadToPresignedUrl: async (uploadUrl: string, fileUri: string, contentType: string) => {
    const file = await fetch(fileUri);
    const body = await file.blob();
    const response = await fetch(uploadUrl, {
      body,
      headers: {
        "Content-Type": contentType,
      },
      method: "PUT",
    });

    if (!response.ok) {
      throw new Error("Upload failed");
    }
  },
};
