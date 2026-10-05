import { type ReactNode, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, TextInput, View, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Avatar, Text } from "@/components/ui";
import type {
  CollaborationStatus,
  ExperienceLevel,
  MusicProfile,
  MusicProfileRole,
  SocialPlatform,
  UpdateMusicProfileRequest,
} from "@/entities/music-profile";
import type { User } from "@/entities/user";
import { ApiError, profilesApi, uploadsApi, usersApi } from "@/shared/api";
import ChevronIcon from "../../../assets/icons/chevron.svg";
import EditIcon from "../../../assets/icons/edit.svg";

const MAX_CONTENT_WIDTH = 430;
const BODY_FONT_SIZE = 16;
const SMALL_FONT_SIZE = 12;
const FIELD_HEIGHT = 48;

const GENRES = ["Trap", "Rage", "Hyperpop", "R&B", "Drill", "Melodic", "Boom Bap", "Pop", "Afrobeats", "Lo-fi"];
const MOODS = ["Dark", "Chill", "Energetic", "Sad", "Hype", "Romantic", "Aggressive", "Dreamy"];
const TYPE_BEATS = ["Travis Scott", "Playboi Carti", "Drake", "Future", "Lil Uzi Vert", "The Weeknd", "Ken Carson"];
const EXPERIENCE: ExperienceLevel[] = ["beginner", "intermediate", "advanced", "pro"];
const COLLABORATION: { label: string; value: CollaborationStatus }[] = [
  { label: "Open", value: "open" },
  { label: "Artists", value: "looking_for_artists" },
  { label: "Producers", value: "looking_for_producers" },
  { label: "Closed", value: "closed" },
];
const SOCIALS: SocialPlatform[] = ["instagram", "spotify", "youtube", "soundcloud", "other"];

type UploadState = "idle" | "uploading" | "uploaded" | "error";

function splitList(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function unique(values: string[]) {
  return [...new Set(values)];
}

function Field({
  label,
  multiline,
  onChangeText,
  placeholder,
  value,
  keyboardType,
}: {
  keyboardType?: "default" | "number-pad" | "url";
  label: string;
  multiline?: boolean;
  onChangeText: (value: string) => void;
  placeholder?: string;
  value: string;
}) {
  return (
    <View style={{ flex: 1, gap: 6 }}>
      <Text className="font-semibold" style={{ color: "#B2B2B2", fontSize: SMALL_FONT_SIZE, lineHeight: 14 }}>
        {label}
      </Text>
      <TextInput
        autoCapitalize={keyboardType === "url" ? "none" : "sentences"}
        keyboardType={keyboardType ?? "default"}
        multiline={multiline}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#B2B2B2"
        style={{
          backgroundColor: "#F7F8FA",
          borderRadius: 16,
          color: "#050505",
          fontSize: BODY_FONT_SIZE,
          fontWeight: "600",
          height: multiline ? 88 : FIELD_HEIGHT,
          paddingHorizontal: 16,
          paddingTop: multiline ? 14 : 0,
          textAlignVertical: multiline ? "top" : "center",
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

function Chip({ active, label, onPress }: { active: boolean; label: string; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => ({
        backgroundColor: active ? "#050505" : "#F7F8FA",
        borderRadius: 18,
        paddingHorizontal: 14,
        paddingVertical: 8,
        transform: [{ scale: pressed ? 0.96 : 1 }],
      })}
    >
      <Text className="font-semibold" style={{ color: active ? "#FFFFFF" : "#666666", fontSize: 14, lineHeight: 18 }}>
        {label}
      </Text>
    </Pressable>
  );
}

function toggle(list: string[], value: string) {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
}

type Draft = {
  artistName: string;
  avatarUrl: string | null;
  bio: string;
  bpmMax: string;
  bpmMin: string;
  collaboration: CollaborationStatus;
  experience: ExperienceLevel;
  genres: string[];
  influences: string;
  location: string;
  moods: string[];
  previewTitle: string;
  previewUrl: string | null;
  role: MusicProfileRole;
  socials: Record<SocialPlatform, string>;
  typeBeats: string[];
  username: string;
};

function draftFrom(profile: MusicProfile, user: User | undefined): Draft {
  const socials = Object.fromEntries(SOCIALS.map((platform) => [platform, ""])) as Record<SocialPlatform, string>;
  profile.socials.forEach((social) => {
    socials[social.platform] = social.url;
  });

  return {
    artistName: profile.artist_name,
    avatarUrl: profile.avatar_url,
    bio: profile.bio ?? "",
    bpmMax: profile.identity?.bpm_max?.toString() ?? "",
    bpmMin: profile.identity?.bpm_min?.toString() ?? "",
    collaboration: profile.collaboration_status,
    experience: profile.experience_level,
    genres: profile.identity?.genres ?? [],
    influences: (profile.identity?.influences ?? []).join(", "),
    location: profile.location ?? "",
    moods: profile.identity?.moods ?? [],
    previewTitle: profile.featured_upload?.title ?? "",
    previewUrl: null,
    role: profile.role,
    socials,
    typeBeats: profile.identity?.type_beats ?? [],
    username: user?.account?.username ?? "",
  };
}

function toPayload(draft: Draft): UpdateMusicProfileRequest {
  const bpmMin = draft.bpmMin ? Number.parseInt(draft.bpmMin, 10) : null;
  const bpmMax = draft.bpmMax ? Number.parseInt(draft.bpmMax, 10) : null;

  return {
    artist_name: draft.artistName.trim(),
    avatar_url: draft.avatarUrl,
    bio: draft.bio.trim() || null,
    collaboration_status: draft.collaboration,
    experience_level: draft.experience,
    identity: {
      bpm_max: Number.isFinite(bpmMax) ? bpmMax : null,
      bpm_min: Number.isFinite(bpmMin) ? bpmMin : null,
      genres: draft.genres,
      influences: splitList(draft.influences),
      moods: draft.moods,
      type_beats: draft.typeBeats,
    },
    location: draft.location.trim() || null,
    role: draft.role,
    socials: SOCIALS.filter((platform) => draft.socials[platform].trim()).map((platform) => ({
      platform,
      url: draft.socials[platform].trim(),
    })),
  };
}

function EditProfileForm({ profile, user }: { profile: MusicProfile; user: User | undefined }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { width } = useWindowDimensions();
  const contentWidth = Math.max(280, Math.min(MAX_CONTENT_WIDTH, width - 32));
  const initial = useMemo(() => draftFrom(profile, user), [profile, user]);
  const [draft, setDraft] = useState(initial);
  const [avatarStatus, setAvatarStatus] = useState<UploadState>("idle");
  const [previewStatus, setPreviewStatus] = useState<UploadState>("idle");
  const [error, setError] = useState("");

  const patch = (next: Partial<Draft>) => setDraft((current) => ({ ...current, ...next }));
  const dirty = JSON.stringify(toPayload(draft)) !== JSON.stringify(toPayload(initial)) || draft.previewUrl !== null || draft.username.trim() !== initial.username.trim();
  const canSave = dirty && draft.artistName.trim().length > 0 && avatarStatus !== "uploading" && previewStatus !== "uploading";
  const canEditUsername = Boolean(user?.account?.gender);

  const save = useMutation({
    mutationFn: async () => {
      const updated = await profilesApi.updateMe(toPayload(draft));
      if (canEditUsername && draft.username.trim() && draft.username.trim() !== initial.username) {
        await usersApi.updateMe({
          avatar_url: draft.avatarUrl,
          first_name: user?.account?.first_name || draft.artistName.trim(),
          gender: user?.account?.gender ?? "other",
          last_name: user?.account?.last_name,
          username: draft.username.trim(),
        });
      }
      if (draft.previewUrl) {
        await uploadsApi.createFeatured({
          audio_url: draft.previewUrl,
          bpm: draft.bpmMax ? Number.parseInt(draft.bpmMax, 10) : null,
          genre: draft.genres[0] ?? null,
          tags: draft.genres,
          title: draft.previewTitle.trim() || "Preview",
        });
      }
      return updated;
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(["profiles", "me"], updated);
      void queryClient.invalidateQueries({ queryKey: ["profiles", "me"] });
      void queryClient.invalidateQueries({ queryKey: ["users", "me"] });
      router.replace("/my-profile");
    },
    onError: (reason) => {
      setError(reason instanceof ApiError ? reason.detail : "Couldn't save your profile. Try again.");
    },
  });

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
    const presigned = await uploadsApi.createPresignedUrl({ content_type: contentType, file_name: fileName, folder });
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
    if (result.canceled) return;
    const asset = result.assets[0];
    setAvatarStatus("uploading");
    try {
      const fileUrl = await uploadFile({
        contentType: asset.mimeType ?? "image/jpeg",
        fileName: asset.fileName ?? "avatar.jpg",
        folder: "avatars",
        uri: asset.uri,
      });
      patch({ avatarUrl: fileUrl });
      setAvatarStatus("uploaded");
    } catch {
      setAvatarStatus("error");
    }
  };

  const pickPreviewBeat = async () => {
    const result = await DocumentPicker.getDocumentAsync({ copyToCacheDirectory: true, type: "audio/*" });
    if (result.canceled) return;
    const asset = result.assets[0];
    setPreviewStatus("uploading");
    try {
      const fileUrl = await uploadFile({
        contentType: asset.mimeType ?? "audio/mpeg",
        fileName: asset.name,
        folder: "preview-beats",
        uri: asset.uri,
      });
      patch({ previewUrl: fileUrl, previewTitle: draft.previewTitle || asset.name.replace(/\.[^.]+$/, "") });
      setPreviewStatus("uploaded");
    } catch {
      setPreviewStatus("error");
    }
  };

  const genreOptions = unique([...GENRES, ...draft.genres]);
  const moodOptions = unique([...MOODS, ...draft.moods]);
  const typeBeatOptions = unique([...TYPE_BEATS, ...draft.typeBeats]);

  return (
    <>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ alignItems: "center", paddingBottom: 24, paddingTop: 16 }}
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
              opacity: pressed ? 0.6 : 1,
            })}
          >
            <ChevronIcon height={20} width={20} />
            <Text className="font-semibold" style={{ color: "#B2B2B2", fontSize: BODY_FONT_SIZE, lineHeight: 20 }}>
              Back
            </Text>
          </Pressable>

          <Section title="Profile">
            <View className="flex-row items-center" style={{ gap: 14 }}>
              <Avatar name={draft.artistName} size={68} uri={draft.avatarUrl} />
              <Pressable
                accessibilityRole="button"
                onPress={() => void pickAvatar()}
                style={({ pressed }) => ({
                  alignItems: "center",
                  backgroundColor: "#F7F8FA",
                  borderRadius: 16,
                  flex: 1,
                  height: FIELD_HEIGHT,
                  justifyContent: "center",
                  transform: [{ scale: pressed ? 0.98 : 1 }],
                })}
              >
                <Text className="font-semibold text-black" style={{ fontSize: BODY_FONT_SIZE, lineHeight: 20 }}>
                  {avatarStatus === "uploading" ? "Uploading" : "Change avatar"}
                </Text>
              </Pressable>
            </View>
            <Field label="Name" onChangeText={(artistName) => patch({ artistName })} value={draft.artistName} />
            {canEditUsername ? (
              <Field
                label="Username"
                onChangeText={(username) => patch({ username: username.replace(/\s/g, "") })}
                value={draft.username}
              />
            ) : null}
            <Field label="Location" onChangeText={(location) => patch({ location })} value={draft.location} />
            <Field label="Bio" multiline onChangeText={(bio) => patch({ bio })} value={draft.bio} />
            <View style={{ gap: 8 }}>
              <Text className="font-semibold" style={{ color: "#B2B2B2", fontSize: SMALL_FONT_SIZE, lineHeight: 14 }}>
                Role
              </Text>
              <View className="flex-row" style={{ gap: 8 }}>
                <Chip active={draft.role === "artist"} label="Rapper" onPress={() => patch({ role: "artist" })} />
                <Chip active={draft.role === "producer"} label="Producer" onPress={() => patch({ role: "producer" })} />
              </View>
            </View>
          </Section>

          <Section title="Experience">
            <View className="flex-row flex-wrap" style={{ gap: 8 }}>
              {EXPERIENCE.map((level) => (
                <Chip active={draft.experience === level} key={level} label={level} onPress={() => patch({ experience: level })} />
              ))}
            </View>
          </Section>

          <Section title="Collaboration">
            <View className="flex-row flex-wrap" style={{ gap: 8 }}>
              {COLLABORATION.map((option) => (
                <Chip
                  active={draft.collaboration === option.value}
                  key={option.value}
                  label={option.label}
                  onPress={() => patch({ collaboration: option.value })}
                />
              ))}
            </View>
          </Section>

          <Section title="Genres">
            <View className="flex-row flex-wrap" style={{ gap: 8 }}>
              {genreOptions.map((genre) => (
                <Chip active={draft.genres.includes(genre)} key={genre} label={genre} onPress={() => patch({ genres: toggle(draft.genres, genre) })} />
              ))}
            </View>
          </Section>

          <Section title="Moods">
            <View className="flex-row flex-wrap" style={{ gap: 8 }}>
              {moodOptions.map((mood) => (
                <Chip active={draft.moods.includes(mood)} key={mood} label={mood} onPress={() => patch({ moods: toggle(draft.moods, mood) })} />
              ))}
            </View>
          </Section>

          <Section title="Type beats">
            <View className="flex-row flex-wrap" style={{ gap: 8 }}>
              {typeBeatOptions.map((beat) => (
                <Chip
                  active={draft.typeBeats.includes(beat)}
                  key={beat}
                  label={beat}
                  onPress={() => patch({ typeBeats: toggle(draft.typeBeats, beat) })}
                />
              ))}
            </View>
          </Section>

          <Section title="Inspirations">
            <Field label="Comma separated" onChangeText={(influences) => patch({ influences })} placeholder="Metro Boomin, Kanye" value={draft.influences} />
            <View className="flex-row" style={{ gap: 8 }}>
              <Field keyboardType="number-pad" label="BPM min" onChangeText={(bpmMin) => patch({ bpmMin: bpmMin.replace(/\D/g, "") })} value={draft.bpmMin} />
              <Field keyboardType="number-pad" label="BPM max" onChangeText={(bpmMax) => patch({ bpmMax: bpmMax.replace(/\D/g, "") })} value={draft.bpmMax} />
            </View>
          </Section>

          <Section title="Socials">
            {SOCIALS.map((platform) => (
              <Field
                key={platform}
                keyboardType="url"
                label={platform}
                onChangeText={(url) => patch({ socials: { ...draft.socials, [platform]: url } })}
                placeholder="https://"
                value={draft.socials[platform]}
              />
            ))}
          </Section>

          <Section title="Preview">
            <Pressable
              accessibilityRole="button"
              onPress={() => void pickPreviewBeat()}
              style={({ pressed }) => ({
                alignItems: "center",
                backgroundColor: "#F7F8FA",
                borderRadius: 16,
                height: FIELD_HEIGHT,
                justifyContent: "center",
                transform: [{ scale: pressed ? 0.98 : 1 }],
              })}
            >
              <Text className="font-semibold text-black" style={{ fontSize: BODY_FONT_SIZE, lineHeight: 20 }}>
                {previewStatus === "uploading" ? "Uploading" : previewStatus === "uploaded" ? "Audio ready" : "Replace audio"}
              </Text>
            </Pressable>
            <Field label="Track title" onChangeText={(previewTitle) => patch({ previewTitle })} value={draft.previewTitle} />
          </Section>

          {avatarStatus === "error" || previewStatus === "error" ? (
            <Text className="font-semibold" style={{ color: "#E5484D", fontSize: SMALL_FONT_SIZE, lineHeight: 16 }}>
              Upload failed. Try that file again.
            </Text>
          ) : null}
          {error ? (
            <Text className="font-semibold" style={{ color: "#E5484D", fontSize: SMALL_FONT_SIZE, lineHeight: 16 }}>
              {error}
            </Text>
          ) : null}
        </View>
      </ScrollView>

      <View style={{ alignItems: "center", paddingBottom: 12, paddingTop: 8 }}>
        <Pressable
          accessibilityRole="button"
          disabled={!canSave || save.isPending}
          onPress={() => {
            setError("");
            save.mutate();
          }}
          style={({ pressed }) => ({
            alignItems: "center",
            backgroundColor: "#000000",
            borderRadius: 28,
            flexDirection: "row",
            gap: 14,
            height: 56,
            justifyContent: "center",
            opacity: !canSave || save.isPending ? 0.35 : 1,
            transform: [{ scale: pressed && canSave ? 0.98 : 1 }],
            width: contentWidth,
          })}
        >
          <Text className="font-semibold text-white" style={{ fontSize: BODY_FONT_SIZE, lineHeight: 20 }}>
            {save.isPending ? "Saving" : "Save"}
          </Text>
          <EditIcon height={24} width={24} />
        </Pressable>
      </View>
    </>
  );
}

export function EditProfilePage() {
  const router = useRouter();
  const profile = useQuery({ queryFn: () => profilesApi.getMe(), queryKey: ["profiles", "me"] });
  const user = useQuery({ queryFn: () => usersApi.getMe(), queryKey: ["users", "me"] });

  if (profile.isPending) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View style={{ gap: 16, padding: 16 }}>
          <View style={{ backgroundColor: "#E8E8E8", borderRadius: 8, height: 16, width: 72 }} />
          <View style={{ backgroundColor: "#F3F3F3", borderRadius: 16, height: 68, width: "100%" }} />
          <View style={{ backgroundColor: "#F3F3F3", borderRadius: 16, height: 48, width: "100%" }} />
          <View style={{ backgroundColor: "#F3F3F3", borderRadius: 16, height: 48, width: "100%" }} />
          <View style={{ backgroundColor: "#F3F3F3", borderRadius: 16, height: 88, width: "100%" }} />
        </View>
      </SafeAreaView>
    );
  }

  if (profile.isError || !profile.data) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white" style={{ padding: 24 }}>
        <Text style={{ color: "#111111", fontSize: 22, fontWeight: "700", textAlign: "center" }}>
          We couldn't load your profile
        </Text>
        <Pressable
          onPress={() => void profile.refetch()}
          style={{ alignItems: "center", backgroundColor: "#050505", borderRadius: 28, height: 52, justifyContent: "center", marginTop: 20, width: 220 }}
        >
          <Text className="font-semibold text-white">Try again</Text>
        </Pressable>
        <Pressable onPress={() => router.replace("/my-profile")} style={{ marginTop: 16, minHeight: 44, justifyContent: "center" }}>
          <Text className="font-semibold" style={{ color: "#B2B2B2" }}>
            Back
          </Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <EditProfileForm key={profile.data.updated_at} profile={profile.data} user={user.data} />
    </SafeAreaView>
  );
}
