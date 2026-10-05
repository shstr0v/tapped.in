import type { Beat, CreateBeatRequest } from "@/entities/music-upload";
import { beatsApi, uploadsApi } from "@/shared/api";

export type UploadBeatStage = "create" | "presign" | "storage";

export class UploadBeatError extends Error {
  audioKey: string | null;
  stage: UploadBeatStage;

  constructor(stage: UploadBeatStage, audioKey: string | null = null) {
    super(stage);
    this.name = "UploadBeatError";
    this.stage = stage;
    this.audioKey = audioKey;
  }
}

export type UploadBeatInput = {
  audioKey?: string | null;
  contentType: string;
  description?: string | null;
  fileName: string;
  fileUri: string;
  genre?: string | null;
  onPhase?: (phase: "create" | "upload") => void;
  onProgress?: (loaded: number, total: number) => void;
  title: string;
};

function optionalText(value: string | null | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export async function uploadBeat(input: UploadBeatInput): Promise<Beat> {
  let audioKey = input.audioKey?.trim() || null;

  if (!audioKey) {
    input.onPhase?.("upload");
    let key = "";
    let uploadUrl = "";
    try {
      const presigned = await uploadsApi.createPresignedUrl({
        content_type: input.contentType,
        file_name: input.fileName,
        upload_type: "beat",
      });
      key = presigned.key;
      uploadUrl = presigned.upload_url;
    } catch {
      throw new UploadBeatError("presign");
    }

    try {
      await uploadsApi.uploadToPresignedUrl(uploadUrl, input.fileUri, input.contentType, input.onProgress);
    } catch {
      throw new UploadBeatError("storage");
    }

    audioKey = key;
  }

  input.onPhase?.("create");
  const genre = optionalText(input.genre);
  const body: CreateBeatRequest = {
    audio_key: audioKey,
    description: optionalText(input.description),
    genre,
    tags: genre ? [genre] : [],
    title: input.title.trim(),
  };

  try {
    return await beatsApi.create(body);
  } catch {
    throw new UploadBeatError("create", audioKey);
  }
}
