import { type ReactNode, useMemo, useState } from "react";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import {
  Image,
  Pressable,
  ScrollView,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Text } from "@/components/ui";
import type { MusicProfileRole } from "@/entities/music-profile";
import { profilesApi, uploadsApi } from "@/shared/api";
import ChevronIcon from "../../../assets/icons/chevron.svg";
import EditIcon from "../../../assets/icons/edit.svg";
import ProfileImage from "../../../assets/rappers/image copy.png";

const MAX_CONTENT_WIDTH = 430;
const BODY_FONT_SIZE = 16;
const SMALL_FONT_SIZE = 12;
const FIELD_HEIGHT = 54;

type UploadState = "idle" | "uploading" | "uploaded" | "error";

function splitList(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function Field({
  label,
  onChangeText,
  placeholder,
  value,
}: {
  label: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  value: string;
}) {
  return (
    <View style={{ gap: 8 }}>
      <Text className="font-semibold" style={{ color: "#B2B2B2", fontSize: SMALL_FONT_SIZE, lineHeight: 14 }}>
        {label}
      </Text>
      <TextInput
        autoCapitalize="none"
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#B2B2B2"
        style={{
          backgroundColor: "#F7F8FA",
          borderRadius: 18,
          color: "#050505",
          fontSize: BODY_FONT_SIZE,
          fontWeight: "600",
          height: FIELD_HEIGHT,
          lineHeight: 20,
          paddingHorizontal: 16,
        }}
        value={value}
      />
    </View>
  );
}

function Section({ children, title }: { children: ReactNode; title: string }) {
  return (
    <View style={{ gap: 12 }}>
      <Text className="font-semibold" style={{ color: "#B2B2B2", fontSize: BODY_FONT_SIZE, lineHeight: 20 }}>
        {title}
      </Text>
      <View style={{ gap: 12 }}>{children}</View>
    </View>
  );
}

function RoleButton({
  active,
  label,
  onPress,
}: {
  active: boolean;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => ({
        alignItems: "center",
        backgroundColor: active ? "#050505" : "#F7F8FA",
        borderRadius: 18,
        flex: 1,
        height: FIELD_HEIGHT,
        justifyContent: "center",
        transform: [{ scale: pressed ? 0.98 : 1 }],
      })}
    >
      <Text
        className="font-semibold"
        style={{ color: active ? "#FFFFFF" : "#B2B2B2", fontSize: BODY_FONT_SIZE, lineHeight: 20 }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function EditProfilePage() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const contentWidth = Math.max(280, Math.min(MAX_CONTENT_WIDTH, width - 32));

  const [artistName, setArtistName] = useState("222blank");
  const [avatarStatus, setAvatarStatus] = useState<UploadState>("idle");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [bio, setBio] = useState("Artist looking for hard rage production.");
  const [bpm, setBpm] = useState("145");
  const [genre, setGenre] = useState("rage");
  const [location, setLocation] = useState("Atlanta, US");
  const [previewStatus, setPreviewStatus] = useState<UploadState>("idle");
  const [previewTitle, setPreviewTitle] = useState("Banger");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [role, setRole] = useState<MusicProfileRole>("artist");
  const [saveStatus, setSaveStatus] = useState("");
  const [saving, setSaving] = useState(false);
  const [tags, setTags] = useState("hip-hop, rage, ken carson");

  const tagPreview = useMemo(() => splitList(tags).slice(0, 4), [tags]);

  const uploadFile = async ({
    contentType,
    fileName,
    folder,
    uri,
  }: {
    contentType: string;
    fileName: string;
    folder: string;
    uri: string;
  }) => {
    const presigned = await uploadsApi.createPresignedUrl({
      content_type: contentType,
      file_name: fileName,
      folder,
    });
    await uploadsApi.uploadToPresignedUrl(presigned.upload_url, uri, contentType);
    return presigned.file_url;
  };

  const pickAvatar = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setAvatarStatus("error");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.9,
    });

    if (result.canceled) {
      return;
    }

    const asset = result.assets[0];
    setAvatarStatus("uploading");
    try {
      const fileUrl = await uploadFile({
        contentType: asset.mimeType ?? "image/jpeg",
        fileName: asset.fileName ?? "avatar.jpg",
        folder: "avatars",
        uri: asset.uri,
      });
      setAvatarUrl(fileUrl);
      setAvatarStatus("uploaded");
    } catch {
      setAvatarStatus("error");
    }
  };

  const pickPreviewBeat = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      copyToCacheDirectory: true,
      type: "audio/*",
    });

    if (result.canceled) {
      return;
    }

    const asset = result.assets[0];
    setPreviewStatus("uploading");
    try {
      const fileUrl = await uploadFile({
        contentType: asset.mimeType ?? "audio/mpeg",
        fileName: asset.name,
        folder: "preview-beats",
        uri: asset.uri,
      });
      setPreviewUrl(fileUrl);
      setPreviewStatus("uploaded");
    } catch {
      setPreviewStatus("error");
    }
  };

  const complete = async () => {
    setSaving(true);
    setSaveStatus("");
    try {
      await profilesApi.updateMe({
        artist_name: artistName,
        avatar_url: avatarUrl,
        bio,
        experience_level: "intermediate",
        identity: {
          genres: splitList(tags),
          influences: [],
          moods: [],
          type_beats: splitList(tags),
        },
        location,
        role,
      });

      if (previewUrl) {
        await uploadsApi.createFeatured({
          audio_url: previewUrl,
          bpm: Number.isFinite(Number(bpm)) ? Number(bpm) : null,
          genre,
          tags: splitList(tags),
          title: previewTitle || "Preview",
        });
      }

      router.replace("/my-profile");
    } catch {
      setSaveStatus("Could not save. Check auth/backend.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          alignItems: "center",
          paddingBottom: 92,
          paddingTop: 16,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={{ gap: 24, width: contentWidth }}>
          <Pressable
            accessibilityLabel="Back"
            accessibilityRole="button"
            onPress={() => router.replace("/my-profile")}
            style={({ pressed }) => ({
              alignItems: "center",
              alignSelf: "flex-start",
              flexDirection: "row",
              minHeight: 32,
              transform: [{ scale: pressed ? 0.97 : 1 }],
            })}
          >
            <ChevronIcon height={20} width={20} />
            <Text
              className="font-semibold"
              style={{ color: "#B2B2B2", fontSize: BODY_FONT_SIZE, lineHeight: 20 }}
            >
              Back
            </Text>
          </Pressable>

          <Section title="Profile">
            <View className="flex-row items-center" style={{ gap: 14 }}>
              <Image
                accessibilityIgnoresInvertColors
                resizeMode="cover"
                source={avatarUrl ? { uri: avatarUrl } : ProfileImage}
                style={{ borderRadius: 34, height: 68, width: 68 }}
              />
              <Pressable
                accessibilityRole="button"
                onPress={() => void pickAvatar()}
                style={({ pressed }) => ({
                  alignItems: "center",
                  backgroundColor: "#F7F8FA",
                  borderRadius: 18,
                  flex: 1,
                  height: FIELD_HEIGHT,
                  justifyContent: "center",
                  transform: [{ scale: pressed ? 0.98 : 1 }],
                })}
              >
                <Text className="font-semibold text-black" style={{ fontSize: BODY_FONT_SIZE, lineHeight: 20 }}>
                  {avatarStatus === "uploading" ? "Uploading..." : "Change avatar"}
                </Text>
              </Pressable>
            </View>

            <Field label="Name" onChangeText={setArtistName} value={artistName} />
            <Field label="Location" onChangeText={setLocation} value={location} />
            <View style={{ gap: 8 }}>
              <Text
                className="font-semibold"
                style={{ color: "#B2B2B2", fontSize: SMALL_FONT_SIZE, lineHeight: 14 }}
              >
                Role
              </Text>
              <View className="flex-row" style={{ gap: 10 }}>
                <RoleButton active={role === "artist"} label="Rapper" onPress={() => setRole("artist")} />
                <RoleButton active={role === "producer"} label="Producer" onPress={() => setRole("producer")} />
              </View>
            </View>
            <Field label="Bio" onChangeText={setBio} value={bio} />
          </Section>

          <Section title="Tags">
            <Field label="Comma separated" onChangeText={setTags} value={tags} />
            <View className="flex-row flex-wrap" style={{ gap: 8 }}>
              {tagPreview.map((tag) => (
                <View
                  key={tag}
                  style={{
                    backgroundColor: "#9F9F9F",
                    borderRadius: 14,
                    paddingHorizontal: 11,
                    paddingVertical: 5,
                  }}
                >
                  <Text className="font-semibold text-white" style={{ fontSize: SMALL_FONT_SIZE, lineHeight: 14 }}>
                    {tag}
                  </Text>
                </View>
              ))}
            </View>
          </Section>

          <Section title="Preview beat">
            <Pressable
              accessibilityRole="button"
              onPress={() => void pickPreviewBeat()}
              style={({ pressed }) => ({
                alignItems: "center",
                backgroundColor: "#F7F8FA",
                borderRadius: 18,
                height: FIELD_HEIGHT,
                justifyContent: "center",
                transform: [{ scale: pressed ? 0.98 : 1 }],
              })}
            >
              <Text className="font-semibold text-black" style={{ fontSize: BODY_FONT_SIZE, lineHeight: 20 }}>
                {previewStatus === "uploading"
                  ? "Uploading..."
                  : previewStatus === "uploaded"
                    ? "Audio uploaded"
                    : "Upload audio"}
              </Text>
            </Pressable>
            <Field label="Title" onChangeText={setPreviewTitle} value={previewTitle} />
            <Field label="Genre" onChangeText={setGenre} value={genre} />
            <Field label="BPM" onChangeText={setBpm} value={bpm} />
          </Section>

          {saveStatus ? (
            <Text className="font-semibold" style={{ color: "#B2B2B2", fontSize: SMALL_FONT_SIZE, lineHeight: 14 }}>
              {saveStatus}
            </Text>
          ) : null}
        </View>
      </ScrollView>

      <View style={{ alignItems: "center", paddingBottom: 12 }}>
        <Pressable
          accessibilityLabel="Complete profile edits"
          accessibilityRole="button"
          onPress={() => void complete()}
          style={({ pressed }) => ({
            alignItems: "center",
            backgroundColor: "#000000",
            borderRadius: 28,
            flexDirection: "row",
            gap: 14,
            height: 56,
            justifyContent: "center",
            opacity: saving ? 0.7 : 1,
            transform: [{ scale: pressed ? 0.98 : 1 }],
            width: contentWidth,
          })}
        >
          <Text className="font-semibold text-white" style={{ fontSize: BODY_FONT_SIZE, lineHeight: 20 }}>
            {saving ? "Saving" : "Complete"}
          </Text>
          <EditIcon height={24} width={24} />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
