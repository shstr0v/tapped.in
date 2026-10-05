import { resolveBeatContentType } from "./audio-file";

describe("resolveBeatContentType", () => {
  it("maps the audio formats the beat upload accepts", () => {
    expect(resolveBeatContentType("night.mp3", "audio/mpeg")).toBe("audio/mpeg");
    expect(resolveBeatContentType("hook.m4a", "audio/mp4")).toBe("audio/mp4");
    expect(resolveBeatContentType("voice.aac", null)).toBe("audio/aac");
    expect(resolveBeatContentType("demo.WAV", "audio/x-wav")).toBe("audio/wav");
    expect(resolveBeatContentType("loop.mp4", "application/octet-stream")).toBe("audio/mp4");
  });

  it("uses a known mime type when the file has no extension", () => {
    expect(resolveBeatContentType("recording", "audio/mp3")).toBe("audio/mpeg");
    expect(resolveBeatContentType("recording", "audio/x-m4a")).toBe("audio/mp4");
  });

  it("rejects formats the backend does not accept", () => {
    expect(resolveBeatContentType("idea.flac", "audio/flac")).toBeNull();
    expect(resolveBeatContentType("idea.ogg", "audio/ogg")).toBeNull();
    expect(resolveBeatContentType("notes.txt", "text/plain")).toBeNull();
  });
});
