import type { CreateFeaturedUploadRequest, MusicUpload } from "@/entities/music-upload";

import { apiRequest } from "../http-client";

export type PresignedUploadRequest = {
  content_type: string;
  file_name: string;
  folder?: string;
  upload_type?: "audio" | "avatar" | "beat";
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

  uploadToPresignedUrl: async (
    uploadUrl: string,
    fileUri: string,
    contentType: string,
    onProgress?: (loaded: number, total: number) => void,
  ) => {
    const file = await fetch(fileUri);
    const body = await file.blob();

    if (!onProgress) {
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
      return;
    }

    await putWithProgress(uploadUrl, body, contentType, onProgress);
  },
};

function putWithProgress(
  uploadUrl: string,
  body: Blob,
  contentType: string,
  onProgress: (loaded: number, total: number) => void,
) {
  return new Promise<void>((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open("PUT", uploadUrl);
    request.setRequestHeader("Content-Type", contentType);
    request.upload.onprogress = (event) => {
      if (event.lengthComputable && event.total > 0) {
        onProgress(event.loaded, event.total);
      }
    };
    request.onload = () => {
      if (request.status >= 200 && request.status < 300) {
        resolve();
        return;
      }
      reject(new Error("Upload failed"));
    };
    request.onerror = () => reject(new Error("Upload failed"));
    request.onabort = () => reject(new Error("Upload failed"));
    request.send(body);
  });
}
