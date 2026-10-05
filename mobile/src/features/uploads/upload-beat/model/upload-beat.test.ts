import { beatsApi, uploadsApi } from "@/shared/api";

import { UploadBeatError, uploadBeat } from "./upload-beat";

jest.mock("@/shared/api", () => ({
  beatsApi: {
    create: jest.fn(),
  },
  uploadsApi: {
    createPresignedUrl: jest.fn(),
    uploadToPresignedUrl: jest.fn(),
  },
}));

const api = {
  create: jest.mocked(beatsApi.create),
  presign: jest.mocked(uploadsApi.createPresignedUrl),
  upload: jest.mocked(uploadsApi.uploadToPresignedUrl),
};

const input = {
  contentType: "audio/mpeg",
  fileName: "night.mp3",
  fileUri: "file:///night.mp3",
  title: "Night drive",
};

const beat = {
  audio_key: "beats/user/file.mp3",
  audio_url: "https://bucket.s3.amazonaws.com/beats/user/file.mp3",
  bpm: null,
  created_at: "2026-10-05T00:00:00Z",
  description: null,
  genre: null,
  id: "beat-1",
  is_featured: true,
  owner_id: "user-1",
  profile_id: "profile-1",
  tags: [],
  title: "Night drive",
};

beforeEach(() => {
  api.create.mockReset();
  api.presign.mockReset();
  api.upload.mockReset();
  api.presign.mockResolvedValue({
    file_url: beat.audio_url,
    key: "beats/user/file.mp3",
    upload_url: "https://s3.example/put",
  });
  api.upload.mockResolvedValue(undefined);
  api.create.mockResolvedValue(beat);
});

describe("uploadBeat", () => {
  it("uploads to the presigned url and creates the beat with the object key", async () => {
    await uploadBeat({ ...input, description: "  hook  ", genre: "Trap" });

    expect(api.presign).toHaveBeenCalledWith({
      content_type: "audio/mpeg",
      file_name: "night.mp3",
      upload_type: "beat",
    });
    expect(api.upload).toHaveBeenCalledWith(
      "https://s3.example/put",
      "file:///night.mp3",
      "audio/mpeg",
      undefined,
    );
    expect(api.create).toHaveBeenCalledWith({
      audio_key: "beats/user/file.mp3",
      description: "hook",
      genre: "Trap",
      tags: ["Trap"],
      title: "Night drive",
    });
  });

  it("stops when the presigned url request fails", async () => {
    api.presign.mockRejectedValue(new Error("offline"));

    await expect(uploadBeat(input)).rejects.toMatchObject({ stage: "presign", audioKey: null });
    expect(api.upload).not.toHaveBeenCalled();
    expect(api.create).not.toHaveBeenCalled();
  });

  it("stops when storage upload fails", async () => {
    api.upload.mockRejectedValue(new Error("s3"));

    await expect(uploadBeat(input)).rejects.toMatchObject({ stage: "storage", audioKey: null });
    expect(api.create).not.toHaveBeenCalled();
  });

  it("keeps the object key when beat creation fails so a retry can skip the upload", async () => {
    api.create.mockRejectedValueOnce(new Error("save failed"));

    const error = await uploadBeat(input).catch((reason: unknown) => reason);

    expect(error).toBeInstanceOf(UploadBeatError);
    expect(error).toMatchObject({
      audioKey: "beats/user/file.mp3",
      stage: "create",
    });

    await uploadBeat({ ...input, audioKey: "beats/user/file.mp3", title: "Night drive " });

    expect(api.presign).toHaveBeenCalledTimes(1);
    expect(api.upload).toHaveBeenCalledTimes(1);
    expect(api.create).toHaveBeenLastCalledWith(expect.objectContaining({ audio_key: "beats/user/file.mp3" }));
  });
});
