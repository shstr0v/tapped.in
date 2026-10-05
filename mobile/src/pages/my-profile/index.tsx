import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  Animated,
  Easing,
  Image,
  Linking,
  Pressable,
  ScrollView,
  View,
  useWindowDimensions,
  type ViewStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Avatar, Text } from "@/components/ui";
import type { MusicProfile, SocialPlatform } from "@/entities/music-profile";
import type { User } from "@/entities/user";
import { connectionsApi, profilesApi, usersApi } from "@/shared/api";
import ChevronIcon from "../../../assets/icons/chevron.svg";
import EditIcon from "../../../assets/icons/edit.svg";
import ExternalLinkIcon from "../../../assets/icons/external-link.svg";
import InstagramIcon from "../../../assets/icons/instagra-vnu.svg";
import PauseIcon from "../../../assets/icons/pause.svg";
import PlayIcon from "../../../assets/icons/play.svg";
import SpotifyIcon from "../../../assets/icons/spotify-vnu.svg";
import ConnectionsEmptyArt from "../../../assets/illustarations/connections-empty.jpg";
import ErrorArt from "../../../assets/illustarations/feed-error.jpg";

const MAX_CONTENT_WIDTH = 430;
const BODY_FONT_SIZE = 16;
const SMALL_FONT_SIZE = 12;
const SECTION_GAP = 20;

const ROLE_LABEL = { artist: "Rapper", producer: "Producer" } as const;
const COLLABORATION_LABEL = {
  closed: "Not collaborating",
  looking_for_artists: "Looking for artists",
  looking_for_producers: "Looking for producers",
  open: "Open to collaborate",
} as const;

const platformIcons: Partial<Record<SocialPlatform, typeof InstagramIcon>> = {
  instagram: InstagramIcon,
  spotify: SpotifyIcon,
};

function SectionTitle({ children }: { children: string }) {
  return (
    <Text className="font-semibold" style={{ color: "#B2B2B2", fontSize: BODY_FONT_SIZE, lineHeight: 20 }}>
      {children}
    </Text>
  );
}

function Tag({ label }: { label: string }) {
  return (
    <View style={{ backgroundColor: "#9F9F9F", borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 }}>
      <Text className="font-semibold text-white" style={{ fontSize: SMALL_FONT_SIZE, lineHeight: 14 }}>
        {label}
      </Text>
    </View>
  );
}

function socialLabel(url: string) {
  try {
    const path = new URL(url).pathname.replace(/^\/+/, "");
    const handle = path.split("/").filter(Boolean)[0];
    return handle ? `@${handle}` : url;
  } catch {
    return url;
  }
}

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) {
    return "0:00";
  }
  const total = Math.floor(seconds);
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
}

function PreviewPlayer({ title, url }: { title: string; url: string }) {
  const player = useAudioPlayer(url, { updateInterval: 250 });
  useAudioPlayerStatus(player);
  const [failed, setFailed] = useState(false);
  const [live, setLive] = useState({ current: 0, duration: 0, loaded: false, paused: true });
  const ended = live.duration > 0 && live.current >= live.duration - 0.2;
  const isPlaying = !live.paused && !ended;
  const progress = live.duration > 0 ? Math.min(live.current / live.duration, 1) : 0;

  useEffect(() => {
    setFailed(false);
    const subscription = (
      player as unknown as {
        addListener: (
          event: string,
          listener: (status: { error?: string | null }) => void,
        ) => { remove: () => void };
      }
    ).addListener("playbackStatusUpdate", (next) => {
      if (next.error) {
        setFailed(true);
      }
    });
    const timer = setInterval(() => {
      setLive({
        current: player.currentTime,
        duration: player.duration,
        loaded: player.isLoaded,
        paused: player.paused,
      });
    }, 250);

    return () => {
      clearInterval(timer);
      subscription.remove();
      player.pause();
    };
  }, [player, url]);

  const togglePlayback = () => {
    if (isPlaying) {
      player.pause();
      return;
    }
    if (ended) {
      player.seekTo(0);
    }
    player.play();
  };

  return (
    <View style={{ backgroundColor: "#F7F7F7", borderRadius: 16, gap: 8, paddingHorizontal: 14, paddingVertical: 10 }}>
      <View style={{ alignItems: "center", flexDirection: "row", gap: 8 }}>
        <View style={{ flex: 1, gap: 2, minWidth: 0 }}>
          <Text className="font-semibold text-black" numberOfLines={1} style={{ fontSize: 15, lineHeight: 20 }}>
            {title}
          </Text>
          {live.duration > 0 ? (
            <Text style={{ color: "#8F8F8F", fontSize: 12, fontVariant: ["tabular-nums"], fontWeight: "500", lineHeight: 16 }}>
              {formatTime(ended ? 0 : live.current)} / {formatTime(live.duration)}
            </Text>
          ) : null}
        </View>
        <Pressable
          accessibilityLabel={isPlaying ? "Pause preview" : "Play preview"}
          accessibilityRole="button"
          disabled={failed}
          hitSlop={8}
          onPress={togglePlayback}
          style={({ pressed }) => ({
            alignItems: "center",
            height: 40,
            justifyContent: "center",
            transform: [{ scale: pressed ? 0.96 : 1 }],
            width: 40,
          })}
        >
          {!live.loaded && !failed ? (
            <ActivityIndicator color="#111111" size="small" />
          ) : isPlaying ? (
            <PauseIcon height={24} width={24} />
          ) : (
            <PlayIcon height={24} width={24} />
          )}
        </Pressable>
      </View>
      {live.duration > 0 ? (
        <View style={{ backgroundColor: "#E6E6E6", borderRadius: 2, height: 3, overflow: "hidden" }}>
          <View style={{ backgroundColor: "#111111", height: 3, width: `${progress * 100}%` }} />
        </View>
      ) : null}
      {failed ? (
        <Text style={{ color: "#8F8F8F", fontSize: 13, fontWeight: "500", lineHeight: 18 }}>
          Couldn't play this preview.
        </Text>
      ) : null}
    </View>
  );
}

function SocialRow({
  label,
  platform,
  url,
}: {
  label: string;
  platform: SocialPlatform;
  url: string;
}) {
  const Icon = platformIcons[platform];

  return (
    <Pressable
      accessibilityRole="link"
      onPress={() => void Linking.openURL(url)}
      style={({ pressed }) => ({
        alignItems: "center",
        flexDirection: "row",
        height: 42,
        transform: [{ scale: pressed ? 0.98 : 1 }],
      })}
    >
      {Icon ? <Icon height={24} width={24} /> : null}
      <Text
        className="flex-1 font-semibold text-black"
        numberOfLines={1}
        style={{ fontSize: BODY_FONT_SIZE, lineHeight: 20, marginLeft: Icon ? 16 : 0 }}
      >
        {label}
      </Text>
      <ExternalLinkIcon height={20} width={20} />
    </Pressable>
  );
}

function BackButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      accessibilityLabel="Back"
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => ({
        alignItems: "center",
        alignSelf: "flex-start",
        flexDirection: "row",
        minHeight: 32,
        transform: [{ scale: pressed ? 0.97 : 1 }],
      })}
    >
      <ChevronIcon height={20} width={20} />
      <Text className="font-semibold" style={{ color: "#B2B2B2", fontSize: BODY_FONT_SIZE, lineHeight: 20 }}>
        Back
      </Text>
    </Pressable>
  );
}

function ProfileSkeleton({ width }: { width: number }) {
  const opacity = useRef(new Animated.Value(0.55)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { duration: 1100, easing: Easing.inOut(Easing.ease), toValue: 1, useNativeDriver: true }),
        Animated.timing(opacity, { duration: 1100, easing: Easing.inOut(Easing.ease), toValue: 0.55, useNativeDriver: true }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, [opacity]);

  const bone = (style: ViewStyle) => (
    <Animated.View style={[{ backgroundColor: "#E8E8E8", opacity }, style]} />
  );

  return (
    <View style={{ width }}>
      <View className="flex-row items-center" style={{ gap: 18, marginTop: 26 }}>
        {bone({ borderRadius: 42, height: 84, width: 84 })}
        <View style={{ flex: 1, gap: 10 }}>
          {bone({ borderRadius: 7, height: 16, width: "55%" })}
          {bone({ borderRadius: 6, height: 14, width: "40%" })}
          {bone({ borderRadius: 6, height: 14, width: "70%" })}
        </View>
      </View>
      <View className="flex-row" style={{ gap: 10, marginTop: 28 }}>
        {bone({ borderRadius: 14, height: 24, width: 72 })}
        {bone({ borderRadius: 14, height: 24, width: 88 })}
        {bone({ borderRadius: 14, height: 24, width: 64 })}
      </View>
      <View style={{ gap: 14, marginTop: SECTION_GAP }}>
        {bone({ borderRadius: 6, height: 14, width: 80 })}
        {bone({ borderRadius: 20, height: 58, width })}
      </View>
      <View style={{ gap: 14, marginTop: SECTION_GAP }}>
        {bone({ borderRadius: 6, height: 14, width: 70 })}
        {bone({ borderRadius: 20, height: 120, width })}
      </View>
      {bone({ borderRadius: 28, height: 56, marginTop: SECTION_GAP, width })}
    </View>
  );
}

function ProfileError({ onRetry }: { onRetry: () => void }) {
  return (
    <View style={{ alignItems: "center", flex: 1, justifyContent: "center", paddingBottom: 48 }}>
      <Image accessibilityIgnoresInvertColors resizeMode="contain" source={ErrorArt} style={{ height: 132, width: 132 }} />
      <Text style={{ color: "#111111", fontSize: 22, fontWeight: "700", lineHeight: 27, marginTop: 12, textAlign: "center" }}>
        We couldn't load your profile
      </Text>
      <Text
        style={{
          color: "#8F8F8F",
          fontSize: 15,
          fontWeight: "500",
          lineHeight: 20,
          marginTop: 6,
          maxWidth: 280,
          textAlign: "center",
        }}
      >
        Something went wrong while loading your profile.
      </Text>
      <Pressable
        accessibilityRole="button"
        onPress={onRetry}
        style={({ pressed }) => ({
          alignItems: "center",
          backgroundColor: "#050505",
          borderRadius: 28,
          height: 52,
          justifyContent: "center",
          marginTop: 20,
          transform: [{ scale: pressed ? 0.96 : 1 }],
          width: "100%",
          maxWidth: 280,
        })}
      >
        <Text className="font-semibold text-white" style={{ fontSize: BODY_FONT_SIZE, lineHeight: 20 }}>
          Try again
        </Text>
      </Pressable>
    </View>
  );
}

function ProfileBody({
  profile,
  user,
  width,
}: {
  profile: MusicProfile;
  user: User | undefined;
  width: number;
}) {
  const router = useRouter();
  const connections = useQuery({
    queryFn: () => connectionsApi.list(),
    queryKey: ["connections"],
  });
  const identity = profile.identity;
  const tags = [...(identity?.genres ?? []), ...(identity?.moods ?? [])];
  const track = profile.featured_upload;
  const username = user?.account?.username;
  const roleLine = [
    ROLE_LABEL[profile.role],
    profile.location,
    profile.experience_level
      ? profile.experience_level.charAt(0).toUpperCase() + profile.experience_level.slice(1)
      : null,
  ]
    .filter(Boolean)
    .join(" • ");
  const bpm =
    identity?.bpm_min || identity?.bpm_max
      ? [identity?.bpm_min, identity?.bpm_max].filter((value) => value != null).join("–") + " BPM"
      : null;
  const accepted = (connections.data ?? []).filter((connection) => connection.status === "accepted");
  const faces = accepted
    .map((connection) =>
      connection.requester_profile_id === profile.id ? connection.receiver_profile : connection.requester_profile,
    )
    .filter((item) => item?.avatar_url)
    .slice(0, 6);
  const extra = Math.max(accepted.length - faces.length, 0);

  return (
    <>
      <ScrollView
        contentContainerStyle={{ alignItems: "center", paddingBottom: 16, paddingTop: 12 }}
        showsVerticalScrollIndicator={false}
        style={{ flex: 1, minHeight: 0 }}
      >
        <View style={{ width }}>
          <BackButton onPress={() => router.replace("/(tabs)/feed")} />

          <View className="flex-row items-center" style={{ gap: 14, marginTop: 16 }}>
            <Avatar name={profile.artist_name} size={84} uri={profile.avatar_url} />
            <View className="min-w-0 flex-1" style={{ gap: 4 }}>
              <Text className="font-semibold text-black" numberOfLines={1} style={{ fontSize: 20, lineHeight: 24 }}>
                {profile.artist_name}
              </Text>
              {username ? (
                <Text className="font-semibold" numberOfLines={1} style={{ color: "#8F8F8F", fontSize: 14, lineHeight: 18 }}>
                  @{username}
                </Text>
              ) : null}
              <Text className="font-semibold" numberOfLines={2} style={{ color: "#666666", fontSize: BODY_FONT_SIZE, lineHeight: 20 }}>
                {roleLine}
              </Text>
            </View>
          </View>

          {profile.bio ? (
            <Text style={{ color: "#111111", fontSize: 15, fontWeight: "500", lineHeight: 21, marginTop: 14 }}>
              {profile.bio}
            </Text>
          ) : null}

          {tags.length ? (
            <View className="flex-row flex-wrap" style={{ gap: 8, marginTop: 12 }}>
              {tags.map((tag) => (
                <Tag key={tag} label={tag} />
              ))}
            </View>
          ) : null}

          <View style={{ gap: 8, marginTop: SECTION_GAP }}>
            <SectionTitle>About</SectionTitle>
            <Text className="font-semibold text-black" style={{ fontSize: 15, lineHeight: 20 }}>
              {COLLABORATION_LABEL[profile.collaboration_status]}
              {bpm ? ` • ${bpm}` : ""}
            </Text>
            {identity?.type_beats.length ? (
              <View className="flex-row flex-wrap" style={{ gap: 8 }}>
                {identity.type_beats.map((tag) => (
                  <Tag key={tag} label={tag} />
                ))}
              </View>
            ) : null}
          </View>

          {identity?.influences.length ? (
            <View style={{ gap: 8, marginTop: SECTION_GAP }}>
              <SectionTitle>Inspired by</SectionTitle>
              <Text style={{ color: "#111111", fontSize: 15, fontWeight: "500", lineHeight: 20 }}>
                {identity.influences.join(", ")}
              </Text>
            </View>
          ) : null}

          <View style={{ gap: 8, marginTop: SECTION_GAP }}>
            <SectionTitle>Preview</SectionTitle>
            {track?.audio_url ? (
              <PreviewPlayer title={track.title} url={track.audio_url} />
            ) : (
              <Text style={{ color: "#8F8F8F", fontSize: 14, fontWeight: "500", lineHeight: 18 }}>
                No preview uploaded yet
              </Text>
            )}
            <Pressable
              accessibilityLabel={track?.audio_url ? "Upload a new beat" : "Upload a beat for feedback"}
              accessibilityRole="button"
              onPress={() => router.push("/upload-beat")}
              style={({ pressed }) => ({
                alignItems: "center",
                backgroundColor: track?.audio_url ? "#F7F7F7" : "#050505",
                borderRadius: 16,
                height: 48,
                justifyContent: "center",
                transform: [{ scale: pressed ? 0.98 : 1 }],
              })}
            >
              <Text
                className="font-semibold"
                style={{
                  color: track?.audio_url ? "#111111" : "#FFFFFF",
                  fontSize: BODY_FONT_SIZE,
                  lineHeight: 20,
                }}
              >
                {track?.audio_url ? "Upload a new beat" : "Upload a beat for feedback"}
              </Text>
            </Pressable>
          </View>

          {profile.socials.length ? (
            <View style={{ gap: 8, marginTop: SECTION_GAP }}>
              <SectionTitle>Socials</SectionTitle>
              <View style={{ backgroundColor: "#F7F7F7", borderRadius: 16, paddingHorizontal: 14, paddingVertical: 6, width }}>
                {profile.socials.map((social) => (
                  <SocialRow
                    key={social.id}
                    label={`${social.platform} · ${socialLabel(social.url)}`}
                    platform={social.platform}
                    url={social.url}
                  />
                ))}
              </View>
            </View>
          ) : null}

          <View style={{ gap: 8, marginTop: SECTION_GAP }}>
            <SectionTitle>Connections</SectionTitle>
            {connections.isSuccess && accepted.length === 0 ? (
              <View style={{ alignItems: "center", paddingTop: 4 }}>
                <Image
                  accessibilityIgnoresInvertColors
                  resizeMode="contain"
                  source={ConnectionsEmptyArt}
                  style={{ height: 72, width: 72 }}
                />
                <Text style={{ color: "#111111", fontSize: 15, fontWeight: "700", lineHeight: 20, marginTop: 6 }}>
                  No connections yet
                </Text>
                <Text
                  style={{
                    color: "#8F8F8F",
                    fontSize: 14,
                    fontWeight: "500",
                    lineHeight: 18,
                    marginTop: 4,
                    textAlign: "center",
                  }}
                >
                  People you connect with will appear here.
                </Text>
              </View>
            ) : (
              <Pressable
                accessibilityLabel="Open connections"
                accessibilityRole="button"
                className="flex-row items-center bg-[#F7F7F7]"
                onPress={() => router.push("/connections")}
                style={{ borderRadius: 18, height: 62, paddingHorizontal: 16, width }}
              >
                <View className="min-w-0 flex-1 flex-row items-center">
                  {faces.map((face, index) => (
                    <View key={face?.id ?? index} style={{ marginLeft: index === 0 ? 0 : -11 }}>
                      <Avatar name={face?.artist_name} size={40} uri={face?.avatar_url} />
                    </View>
                  ))}
                  {extra > 0 ? (
                    <Text
                      className="font-semibold text-black"
                      style={{ fontSize: BODY_FONT_SIZE, lineHeight: 20, marginLeft: 12 }}
                    >
                      +{extra}
                    </Text>
                  ) : null}
                </View>
                <ChevronIcon height={20} style={{ transform: [{ rotate: "180deg" }] }} width={20} />
              </Pressable>
            )}
          </View>
        </View>
      </ScrollView>

      <View style={{ alignItems: "center", paddingBottom: 12, paddingHorizontal: 16, paddingTop: 8 }}>
        <Pressable
          accessibilityLabel="Edit profile"
          accessibilityRole="button"
          onPress={() => router.push("/edit-profile")}
          style={({ pressed }) => ({
            alignItems: "center",
            backgroundColor: "#000000",
            borderRadius: 28,
            flexDirection: "row",
            gap: 14,
            height: 52,
            justifyContent: "center",
            maxWidth: MAX_CONTENT_WIDTH,
            transform: [{ scale: pressed ? 0.96 : 1 }],
            width: "100%",
          })}
        >
          <Text className="font-semibold text-white" style={{ fontSize: BODY_FONT_SIZE, lineHeight: 20 }}>
            Edit
          </Text>
          <EditIcon height={24} width={24} />
        </Pressable>
      </View>
    </>
  );
}

export function MyProfilePage() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const contentWidth = Math.max(280, Math.min(MAX_CONTENT_WIDTH, width - 32));
  const profile = useQuery({
    queryFn: () => profilesApi.getMe(),
    queryKey: ["profiles", "me"],
  });
  const user = useQuery({
    queryFn: () => usersApi.getMe(),
    queryKey: ["users", "me"],
  });

  return (
    <SafeAreaView className="flex-1 bg-white" style={{ flex: 1, minHeight: 0 }}>
      {profile.isPending ? (
        <View style={{ alignItems: "center", paddingHorizontal: 16, paddingTop: 16 }}>
          <View style={{ width: contentWidth }}>
            <BackButton onPress={() => router.replace("/(tabs)/feed")} />
            <ProfileSkeleton width={contentWidth} />
          </View>
        </View>
      ) : profile.isError || !profile.data ? (
        <View style={{ flex: 1, paddingHorizontal: 16, paddingTop: 16 }}>
          <BackButton onPress={() => router.replace("/(tabs)/feed")} />
          <ProfileError onRetry={() => void profile.refetch()} />
        </View>
      ) : (
        <ProfileBody profile={profile.data} user={user.data} width={contentWidth} />
      )}
    </SafeAreaView>
  );
}
