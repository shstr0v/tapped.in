import { type ReactNode, useEffect, useMemo, useState } from "react";
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import { useRouter } from "expo-router";
import {
  Image,
  ImageBackground,
  Pressable,
  View,
  useWindowDimensions,
} from "react-native";

import { Screen } from "@/components/layout/screen";
import { Text } from "@/components/ui";
import type { RecommendationCard } from "@/entities/recommendation";
import AudioPreviewSource from "../../../assets/audio.mp3";
import ConnectIcon from "../../../assets/icons/connect.svg";
import NotificationIcon from "../../../assets/icons/notifications.svg";
import RejectIcon from "../../../assets/icons/reject.svg";
import SearchIcon from "../../../assets/icons/search.svg";
import LogoSource from "../../../assets/logo.png";
import RapperImageTwo from "../../../assets/rappers/image copy 2.png";
import RapperImageOne from "../../../assets/rappers/image copy.png";
import RapperImageThree from "../../../assets/rappers/image.png";

const PAGE_PADDING = 16;
const ICON_SIZE = 24;
const ACTION_BUTTON_SIZE = 68;
const HEADER_HEIGHT = 56;
const CARD_ASPECT_RATIO = 0.52;
const CARD_TOP_GAP = 20;
const ACTION_TOP_GAP = 16;
const MAX_CONTENT_WIDTH = 430;

const rapperImages = [RapperImageOne, RapperImageTwo, RapperImageThree] as const;

const demoCards: RecommendationCard[] = [
  {
    match: {
      breakdown: {
        genres: 35,
        influences: 28,
        location: 8,
        type_beats: 18,
      },
      reasons: ["Same rage/trap lane", "Inspired by Carti and Ken Carson", "Open to local sessions"],
      score: 80,
    },
    profile: {
      id: "demo-profile-1",
      image_url: null,
      preview_beat: {
        audio_url: "https://example.com/demo.mp3",
        bpm: 145,
        description: "Dark rage beat with bright lead melodies.",
        genre: "Rage",
        id: "demo-upload-1",
        tags: ["hip-hop", "rage", "ken carson"],
        title: "Neon Knock",
      },
      user_account: {
        avatar_url: null,
        bio: "Rapper looking for fast, distorted production and local sessions.",
        collaboration_status: "open",
        experience_level: "intermediate",
        id: "demo-user-1",
        location: "Atlanta, US",
        name: "Kairo Beats",
        profile_id: "demo-profile-1",
        role: "artist",
        tags: ["hip-hop", "rage", "ken carson"],
      },
    },
  },
  {
    match: {
      breakdown: {
        genres: 32,
        influences: 25,
        location: 10,
        type_beats: 15,
      },
      reasons: ["Shared melodic trap taste", "Similar BPM range", "Looking for producers"],
      score: 74,
    },
    profile: {
      id: "demo-profile-2",
      image_url: null,
      preview_beat: {
        audio_url: "https://example.com/demo-2.mp3",
        bpm: 132,
        description: "Hook idea over a soft trap bounce.",
        genre: "Melodic Trap",
        id: "demo-upload-2",
        tags: ["melodic", "trap", "hooks"],
        title: "Late Text Demo",
      },
      user_account: {
        avatar_url: null,
        bio: "Artist writing melodic hooks and looking for long-term producer chemistry.",
        collaboration_status: "looking_for_producers",
        experience_level: "beginner",
        id: "demo-user-2",
        location: "Cluj, RO",
        name: "Mira V",
        profile_id: "demo-profile-2",
        role: "artist",
        tags: ["melodic", "trap", "hooks"],
      },
    },
  },
  {
    match: {
      breakdown: {
        genres: 30,
        influences: 24,
        location: 9,
        type_beats: 17,
      },
      reasons: ["Shared underground lane", "Dark trap references", "Available for sessions"],
      score: 77,
    },
    profile: {
      id: "demo-profile-3",
      image_url: null,
      preview_beat: {
        audio_url: "https://example.com/demo-3.mp3",
        bpm: 148,
        description: "Minimal drums with a cold synth loop.",
        genre: "Dark Trap",
        id: "demo-upload-3",
        tags: ["dark trap", "ambient", "hoodie"],
        title: "Cold Wall",
      },
      user_account: {
        avatar_url: null,
        bio: "Rapper looking for darker beats and low-key visuals.",
        collaboration_status: "open",
        experience_level: "intermediate",
        id: "demo-user-3",
        location: "New York, US",
        name: "Rell",
        profile_id: "demo-profile-3",
        role: "artist",
        tags: ["dark trap", "ambient", "hoodie"],
      },
    },
  },
];

type HomeIconButtonProps = {
  children: ReactNode;
  label: string;
  onPress?: () => void;
  size: number;
  tone: "accept" | "reject";
};

function HomeIconButton({ children, label, onPress, size, tone }: HomeIconButtonProps) {
  const backgroundColor = tone === "accept" ? "#DFF9DE" : "#FFD9D6";

  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => ({
        alignItems: "center",
        backgroundColor,
        borderRadius: size / 2,
        height: size,
        justifyContent: "center",
        minHeight: 44,
        minWidth: 44,
        transform: [{ scale: pressed ? 0.97 : 1 }],
        width: size,
      })}
    >
      {children}
    </Pressable>
  );
}

export function FeedPage() {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const { height, width } = useWindowDimensions();
  const card = demoCards[index % demoCards.length];
  const profile = card.profile.user_account;
  const rapperImage = rapperImages[index % rapperImages.length];
  const nextCard = () => setIndex((value) => value + 1);
  const previewAudioSource = card.profile.preview_beat.audio_url.includes("example.com")
    ? AudioPreviewSource
    : card.profile.preview_beat.audio_url;
  const previewPlayer = useAudioPlayer(previewAudioSource, { updateInterval: 500 });
  const previewStatus = useAudioPlayerStatus(previewPlayer);

  useEffect(() => {
    if (!previewStatus.isLoaded) {
      return;
    }

    let cancelled = false;

    const restartPreview = async () => {
      previewPlayer.pause();
      try {
        await previewPlayer.seekTo(0);
      } catch {
        // Keep feed usable if a native player rejects a fast seek.
      }
      if (!cancelled) {
        previewPlayer.play();
      }
    };

    void restartPreview();

    return () => {
      cancelled = true;
      previewPlayer.pause();
    };
  }, [index, previewPlayer, previewStatus.isLoaded]);

  const metrics = useMemo(() => {
    const contentWidth = Math.max(288, Math.min(MAX_CONTENT_WIDTH, width - PAGE_PADDING * 2));
    const availableCardHeight =
      height - PAGE_PADDING - HEADER_HEIGHT - CARD_TOP_GAP - ACTION_TOP_GAP - ACTION_BUTTON_SIZE - PAGE_PADDING;
    const cardHeight = Math.max(
      360,
      Math.min(contentWidth / CARD_ASPECT_RATIO, availableCardHeight),
    );

    return {
      cardHeight,
      cardRadius: width < 380 ? 26 : 32,
      contentWidth,
      overlayAvatarSize: 42,
      searchFontSize: width < 360 ? 18 : 20,
      scoreFontSize: width < 360 ? 22 : 24,
    };
  }, [height, width]);

  return (
    <Screen className="bg-white px-0 py-0" scroll={false}>
      <View
        className="flex-1 items-center"
        style={{
          paddingBottom: PAGE_PADDING,
          paddingHorizontal: PAGE_PADDING,
          paddingTop: PAGE_PADDING,
          width: "100%",
        }}
      >
        <View className="flex-1" style={{ maxWidth: MAX_CONTENT_WIDTH, width: "100%" }}>
        <View
          className="flex-row items-center bg-[#F5F6F8]"
          style={{
            borderRadius: 20,
            height: HEADER_HEIGHT,
            paddingHorizontal: 16,
            width: "100%",
          }}
        >
          <Pressable
            accessibilityLabel="Open profile"
            accessibilityRole="button"
            hitSlop={8}
            onPress={() => router.push("/my-profile")}
            style={({ pressed }) => ({
              alignItems: "center",
              borderRadius: 12,
              height: 40,
              justifyContent: "center",
              transform: [{ scale: pressed ? 0.97 : 1 }],
              width: 40,
            })}
          >
            <Image
              accessibilityIgnoresInvertColors
              resizeMode="contain"
              source={LogoSource}
              style={{
                borderRadius: 10,
                height: 32,
                width: 32,
              }}
            />
          </Pressable>

          <View className="min-w-0 flex-1 flex-row items-center justify-center gap-2 px-3">
            <SearchIcon height={ICON_SIZE} width={ICON_SIZE} />
            <Text
              className="font-semibold text-[#A8A8A8]"
              style={{
                fontSize: metrics.searchFontSize,
                lineHeight: metrics.searchFontSize + 2,
              }}
            >
              Search
            </Text>
          </View>

          <Pressable
            accessibilityLabel="Notifications"
            accessibilityRole="button"
            onPress={() => router.push("/notifications")}
            style={({ pressed }) => ({
              alignItems: "center",
              borderRadius: 20,
              height: 40,
              justifyContent: "center",
              transform: [{ scale: pressed ? 0.97 : 1 }],
              width: 40,
            })}
          >
            <NotificationIcon height={ICON_SIZE} width={ICON_SIZE} />
          </Pressable>
        </View>

        <ImageBackground
          className="overflow-hidden bg-[#EEEDE8]"
          imageStyle={{ borderRadius: metrics.cardRadius }}
          resizeMode="cover"
          source={rapperImage}
          style={{
            borderRadius: metrics.cardRadius,
            height: metrics.cardHeight,
            marginTop: CARD_TOP_GAP,
            overflow: "hidden",
            width: "100%",
          }}
        >
          <View className="flex-1 justify-end">
            <View className="gap-2.5 bg-black/55 px-4 pb-4 pt-3.5">
              <View className="flex-row items-center gap-3">
                <Image
                  accessibilityIgnoresInvertColors
                  resizeMode="contain"
                  source={LogoSource}
                  style={{
                    backgroundColor: "rgba(255,255,255,0.2)",
                    borderColor: "rgba(255,255,255,0.2)",
                    borderRadius: metrics.overlayAvatarSize / 2,
                    borderWidth: 1,
                    height: metrics.overlayAvatarSize,
                    width: metrics.overlayAvatarSize,
                  }}
                />

                <View className="min-w-0 flex-1">
                  <Text
                    className="font-bold text-white"
                    style={{
                      fontSize: metrics.scoreFontSize,
                      lineHeight: metrics.scoreFontSize + 4,
                    }}
                  >
                    {card.match.score * 10}pts
                  </Text>
                  <Text
                    className="font-medium text-white/85"
                    numberOfLines={1}
                    style={{
                      fontSize: 14,
                      lineHeight: 18,
                    }}
                  >
                    {profile.role === "artist" ? "Rapper" : "Producer"} • {profile.location}
                  </Text>
                </View>
              </View>

              <View className="flex-row flex-wrap gap-1.5">
                {profile.tags.slice(0, 3).map((tag) => (
                  <View className="rounded-full bg-white/35 px-2.5 py-1.5" key={tag}>
                    <Text className="font-semibold text-white" style={{ fontSize: 12, lineHeight: 14 }}>
                      {tag}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </ImageBackground>

        <View
          className="flex-row items-center justify-center"
          style={{ gap: 36, paddingTop: ACTION_TOP_GAP }}
        >
          <HomeIconButton label="Request" onPress={nextCard} size={ACTION_BUTTON_SIZE} tone="accept">
            <ConnectIcon height={ICON_SIZE} width={ICON_SIZE} />
          </HomeIconButton>

          <HomeIconButton label="Reject" onPress={nextCard} size={ACTION_BUTTON_SIZE} tone="reject">
            <RejectIcon height={ICON_SIZE} width={ICON_SIZE} />
          </HomeIconButton>
        </View>
        </View>
      </View>
    </Screen>
  );
}
