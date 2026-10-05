const EXTENSION_TYPE: Record<string, string> = {
  aac: "audio/aac",
  m4a: "audio/mp4",
  mp3: "audio/mpeg",
  mp4: "audio/mp4",
  mpeg: "audio/mpeg",
  wav: "audio/wav",
};

const MIME_TYPE: Record<string, string> = {
  "audio/aac": "audio/aac",
  "audio/m4a": "audio/mp4",
  "audio/mp3": "audio/mpeg",
  "audio/mp4": "audio/mp4",
  "audio/mpeg": "audio/mpeg",
  "audio/mpeg3": "audio/mpeg",
  "audio/vnd.wave": "audio/wav",
  "audio/wav": "audio/wav",
  "audio/wave": "audio/wav",
  "audio/x-aac": "audio/aac",
  "audio/x-m4a": "audio/mp4",
  "audio/x-mpeg": "audio/mpeg",
  "audio/x-wav": "audio/wav",
};

export const BEAT_PICKER_TYPES = ["audio/mpeg", "audio/mp4", "audio/aac", "audio/wav", "audio/x-wav"] as const;

export function resolveBeatContentType(fileName: string, mimeType?: string | null) {
  const extension = fileName.includes(".") ? (fileName.split(".").pop()?.toLowerCase() ?? "") : "";
  if (extension) {
    return EXTENSION_TYPE[extension] ?? null;
  }

  const mime = mimeType?.split(";")[0]?.trim().toLowerCase() ?? "";
  return MIME_TYPE[mime] ?? null;
}

export function formatFileSize(size: number | null | undefined) {
  if (size == null || !Number.isFinite(size) || size < 0) {
    return null;
  }
  if (size < 1024) {
    return `${Math.round(size)} B`;
  }
  if (size < 1024 * 1024) {
    const kilobytes = size / 1024;
    return `${kilobytes >= 10 ? Math.round(kilobytes) : kilobytes.toFixed(1)} KB`;
  }
  const megabytes = size / (1024 * 1024);
  return `${megabytes >= 10 ? megabytes.toFixed(0) : megabytes.toFixed(1)} MB`;
}
