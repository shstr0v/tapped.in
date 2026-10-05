import { useEffect, useRef, useState } from "react";
import * as DocumentPicker from "expo-document-picker";
import { useRouter } from "expo-router";
import { Music } from "lucide-react-native";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Text } from "@/components/ui";
import {
  BEAT_PICKER_TYPES,
  formatFileSize,
  resolveBeatContentType,
  UploadBeatError,
  useUploadBeat,
} from "@/features/uploads/upload-beat";
import ChevronIcon from "../../../assets/icons/chevron.svg";

import { SelectedFile } from "./ui/selected-file";

const MAX_CONTENT_WIDTH = 430;
const BODY_FONT_SIZE = 16;
const GENRES = ["Trap", "Rage", "Hyperpop", "R&B", "Drill", "Melodic", "Boom Bap", "Pop", "Afrobeats", "Lo-fi"];

const STAGE_MESSAGE = {
  create: "The audio is uploaded. Saving the beat failed. Try again.",
  presign: "Couldn't start the upload. Check your connection and try again.",
  storage: "The audio didn't upload. Try again.",
} as const;

type Activity = "create" | "done" | "idle" | "upload";

type SelectedAudio = {
  contentType: string;
  name: string;
  size: number | null;
  uri: string;
};

function ctaLabel(activity: Activity, progress: number | null, savedKey: boolean) {
  if (activity === "done") return "Beat uploaded";
  if (activity === "create") return "Saving...";
  if (activity === "upload") return progress === null ? "Uploading..." : `Uploading ${progress}%`;
  if (savedKey) return "Save beat";
  return "Upload beat";
}

export function UploadBeatPage() {
  const router = useRouter();
  const upload = useUploadBeat();
  const { width } = useWindowDimensions();
  const contentWidth = Math.max(280, Math.min(MAX_CONTENT_WIDTH, width - 32));
  const mounted = useRef(true);
  const submitLock = useRef(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [genre, setGenre] = useState<string | null>(null);
  const [file, setFile] = useState<SelectedAudio | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activity, setActivity] = useState<Activity>("idle");
  const [progress, setProgress] = useState<number | null>(null);
  const [audioKey, setAudioKey] = useState<string | null>(null);
  const [titleFocused, setTitleFocused] = useState(false);
  const [descriptionFocused, setDescriptionFocused] = useState(false);

  const busy = activity === "upload" || activity === "create";
  const canSubmit = Boolean(title.trim() && file) && !busy && activity !== "done";

  useEffect(() => {
    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (activity !== "done") return;
    const timeout = setTimeout(() => {
      if (router.canGoBack()) router.back();
      else router.replace("/my-profile");
    }, 900);
    return () => clearTimeout(timeout);
  }, [activity, router]);

  const leave = () => {
    if (busy) return;
    if (router.canGoBack()) router.back();
    else router.replace("/my-profile");
  };

  const pickAudio = async () => {
    if (busy) return;
    const result = await DocumentPicker.getDocumentAsync({
      copyToCacheDirectory: true,
      multiple: false,
      type: [...BEAT_PICKER_TYPES],
    });
    if (result.canceled) return;
    const asset = result.assets[0];
    const contentType = resolveBeatContentType(asset.name, asset.mimeType);
    if (!contentType) {
      setFileError("Choose an MP3, WAV, M4A, or AAC file.");
      return;
    }
    setFileError(null);
    setError(null);
    setAudioKey(null);
    setProgress(null);
    setFile({
      contentType,
      name: asset.name,
      size: typeof asset.size === "number" ? asset.size : null,
      uri: asset.uri,
    });
    setTitle((current) => (current.trim() ? current : asset.name.replace(/\.[^.]+$/, "")));
  };

  const clearFile = () => {
    if (busy) return;
    setFile(null);
    setAudioKey(null);
    setProgress(null);
    setFileError(null);
    setError(null);
  };

  const submit = () => {
    if (submitLock.current || !file || !title.trim() || activity === "done") return;
    submitLock.current = true;
    setError(null);
    setActivity(audioKey ? "create" : "upload");
    if (!audioKey) setProgress(null);

    upload.mutate(
      {
        audioKey,
        contentType: file.contentType,
        description,
        fileName: file.name,
        fileUri: file.uri,
        genre,
        onPhase: (phase) => {
          if (!mounted.current) return;
          setActivity(phase);
          if (phase === "create") setProgress(null);
        },
        onProgress: (loaded, total) => {
          if (!mounted.current || total <= 0) return;
          const next = Math.min(100, Math.round((loaded / total) * 100));
          setProgress((current) => (current === next ? current : next));
        },
        title,
      },
      {
        onError: (reason) => {
          submitLock.current = false;
          if (!mounted.current) return;
          setActivity("idle");
          setProgress(null);
          if (reason instanceof UploadBeatError) {
            if (reason.audioKey) setAudioKey(reason.audioKey);
            setError(STAGE_MESSAGE[reason.stage]);
            return;
          }
          setError("Something went wrong. Try again.");
        },
        onSuccess: () => {
          if (!mounted.current) return;
          setError(null);
          setProgress(null);
          setActivity("done");
        },
      },
    );
  };

  const showSpinner = (activity === "upload" && progress === null) || activity === "create";

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top", "bottom"]}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{ alignItems: "center", paddingBottom: 24, paddingTop: 12 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={{ gap: 22, width: contentWidth }}>
            <Pressable
              accessibilityLabel="Back"
              accessibilityRole="button"
              disabled={busy}
              onPress={leave}
              style={({ pressed }) => ({
                alignItems: "center",
                alignSelf: "flex-start",
                flexDirection: "row",
                minHeight: 32,
                opacity: busy ? 0.4 : pressed ? 0.6 : 1,
              })}
            >
              <ChevronIcon height={20} width={20} />
              <Text className="font-semibold" style={{ color: "#B2B2B2", fontSize: BODY_FONT_SIZE, lineHeight: 20 }}>
                Back
              </Text>
            </Pressable>

            <View style={{ gap: 6 }}>
              <Text className="font-bold text-black" style={{ fontSize: 28, lineHeight: 33 }}>
                Upload a beat
              </Text>
              <Text style={{ color: "#8F8F8F", fontSize: 15, fontWeight: "500", lineHeight: 20 }}>
                This becomes the beat on your profile.
              </Text>
            </View>

            <View style={{ gap: 6 }}>
              <Text className="font-semibold" style={{ color: "#B2B2B2", fontSize: 12, lineHeight: 14 }}>
                Title
              </Text>
              <TextInput
                editable={!busy}
                maxLength={120}
                onBlur={() => setTitleFocused(false)}
                onChangeText={setTitle}
                onFocus={() => setTitleFocused(true)}
                placeholder="Beat name"
                placeholderTextColor="#B2B2B2"
                returnKeyType="next"
                style={{
                  backgroundColor: titleFocused ? "#FFFFFF" : "#F7F8FA",
                  borderColor: titleFocused ? "#111111" : "transparent",
                  borderRadius: 16,
                  borderWidth: 1.5,
                  color: "#050505",
                  fontSize: BODY_FONT_SIZE,
                  fontWeight: "600",
                  height: 48,
                  paddingHorizontal: 16,
                }}
                value={title}
              />
            </View>

            <View style={{ gap: 6 }}>
              <Text className="font-semibold" style={{ color: "#B2B2B2", fontSize: 12, lineHeight: 14 }}>
                Audio
              </Text>
              {file ? (
                <SelectedFile
                  key={file.uri}
                  locked={busy}
                  name={file.name}
                  onRemove={clearFile}
                  onReplace={() => void pickAudio()}
                  sizeLabel={formatFileSize(file.size)}
                  uri={file.uri}
                />
              ) : (
                <Pressable
                  accessibilityRole="button"
                  disabled={busy}
                  onPress={() => void pickAudio()}
                  style={({ pressed }) => ({
                    alignItems: "center",
                    backgroundColor: "#F7F8FA",
                    borderRadius: 16,
                    flexDirection: "row",
                    gap: 12,
                    height: 48,
                    paddingHorizontal: 16,
                    transform: [{ scale: pressed ? 0.98 : 1 }],
                  })}
                >
                  <Music color="#111111" size={18} strokeWidth={2} />
                  <Text className="font-semibold text-black" style={{ fontSize: BODY_FONT_SIZE, lineHeight: 20 }}>
                    Choose an audio file
                  </Text>
                </Pressable>
              )}
              <Text style={{ color: "#A3A3A3", fontSize: 13, fontWeight: "500", lineHeight: 17, paddingLeft: 4 }}>
                MP3, WAV, M4A, or AAC
              </Text>
              {fileError ? (
                <Text style={{ color: "#E5484D", fontSize: 13, fontWeight: "500", lineHeight: 18 }}>{fileError}</Text>
              ) : null}
            </View>

            <View style={{ gap: 6 }}>
              <View style={{ alignItems: "baseline", flexDirection: "row", justifyContent: "space-between" }}>
                <Text className="font-semibold" style={{ color: "#B2B2B2", fontSize: 12, lineHeight: 14 }}>
                  Description
                </Text>
                <Text style={{ color: "#A3A3A3", fontSize: 12, fontWeight: "500", lineHeight: 16 }}>Optional</Text>
              </View>
              <TextInput
                editable={!busy}
                maxLength={500}
                multiline
                onBlur={() => setDescriptionFocused(false)}
                onChangeText={setDescription}
                onFocus={() => setDescriptionFocused(true)}
                placeholder="What should they listen for?"
                placeholderTextColor="#B2B2B2"
                style={{
                  backgroundColor: descriptionFocused ? "#FFFFFF" : "#F7F8FA",
                  borderColor: descriptionFocused ? "#111111" : "transparent",
                  borderRadius: 16,
                  borderWidth: 1.5,
                  color: "#050505",
                  fontSize: BODY_FONT_SIZE,
                  fontWeight: "600",
                  height: 88,
                  paddingHorizontal: 16,
                  paddingTop: 14,
                  textAlignVertical: "top",
                }}
                value={description}
              />
            </View>

            <View style={{ gap: 8 }}>
              <View style={{ alignItems: "baseline", flexDirection: "row", justifyContent: "space-between" }}>
                <Text className="font-semibold" style={{ color: "#B2B2B2", fontSize: 12, lineHeight: 14 }}>
                  Genre
                </Text>
                <Text style={{ color: "#A3A3A3", fontSize: 12, fontWeight: "500", lineHeight: 16 }}>Optional</Text>
              </View>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                {GENRES.map((option) => {
                  const selected = genre === option;
                  return (
                    <Pressable
                      accessibilityRole="button"
                      accessibilityState={{ selected }}
                      disabled={busy}
                      key={option}
                      onPress={() => setGenre((current) => (current === option ? null : option))}
                      style={({ pressed }) => ({
                        backgroundColor: selected ? "#050505" : "#F7F8FA",
                        borderRadius: 18,
                        opacity: busy ? 0.5 : 1,
                        paddingHorizontal: 14,
                        paddingVertical: 8,
                        transform: [{ scale: pressed && !busy ? 0.96 : 1 }],
                      })}
                    >
                      <Text
                        className="font-semibold"
                        style={{ color: selected ? "#FFFFFF" : "#111111", fontSize: 14, lineHeight: 18 }}
                      >
                        {option}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </View>
        </ScrollView>

        <View style={{ alignItems: "center", paddingBottom: 12, paddingHorizontal: 16, paddingTop: 8 }}>
          <View style={{ gap: 10, width: contentWidth }}>
            {error ? (
              <View
                accessibilityLiveRegion="polite"
                style={{ backgroundColor: "#FFF1F1", borderRadius: 16, paddingHorizontal: 16, paddingVertical: 12 }}
              >
                <Text style={{ color: "#E5484D", fontSize: 14, fontWeight: "500", lineHeight: 19 }}>{error}</Text>
              </View>
            ) : null}
            {activity === "done" ? (
              <Text
                className="text-center font-semibold text-black"
                style={{ fontSize: 15, lineHeight: 20 }}
              >
                Beat uploaded
              </Text>
            ) : null}
            {activity === "upload" && progress !== null ? (
              <View style={{ backgroundColor: "#E6E6E6", borderRadius: 2, height: 3, overflow: "hidden" }}>
                <View style={{ backgroundColor: "#111111", height: 3, width: `${progress}%` }} />
              </View>
            ) : null}
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ busy, disabled: !canSubmit }}
              disabled={!canSubmit}
              onPress={submit}
              style={({ pressed }) => ({
                alignItems: "center",
                backgroundColor: "#000000",
                borderRadius: 28,
                flexDirection: "row",
                gap: 8,
                height: 52,
                justifyContent: "center",
                opacity: title.trim() && file ? 1 : 0.35,
                transform: [{ scale: pressed && canSubmit ? 0.98 : 1 }],
              })}
            >
              {showSpinner ? <ActivityIndicator color="#FFFFFF" size="small" /> : null}
              <Text className="font-semibold text-white" style={{ fontSize: BODY_FONT_SIZE, lineHeight: 20 }}>
                {ctaLabel(activity, progress, Boolean(audioKey))}
              </Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
