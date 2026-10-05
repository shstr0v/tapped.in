import { type ReactNode, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import { useRouter } from "expo-router";
import { Pause, Play } from "lucide-react-native";
import { Image, ImageBackground, Pressable, View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Screen } from "@/components/layout/screen";
import { TAB_BAR_BODY_HEIGHT } from "@/widgets/navigation";
import { Avatar, Text } from "@/components/ui";
import type { RecommendationCard } from "@/entities/recommendation";
import { useSwipeProfile } from "@/features/feed/swipe-profile";
import { profilesApi, recommendationsApi } from "@/shared/api";
import type { SwipeAction } from "@/shared/api/endpoints/swipes";
import ConnectIcon from "../../../assets/icons/connect.svg";
import NotificationIcon from "../../../assets/icons/notifications.svg";
import RejectIcon from "../../../assets/icons/reject.svg";
import SearchIcon from "../../../assets/icons/search.svg";
import { FeedNotice, FeedSkeleton } from "./ui/feed-states";
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
const FEED_PAGE_SIZE = 20;
const PREFETCH_THRESHOLD = 3;

const rapperImages = [RapperImageOne, RapperImageTwo, RapperImageThree] as const;

function stopPlayback(player: { pause: () => void }) {
  player.pause();
  const media = (player as { media?: { pause: () => void; src: string; load: () => void } }).media;
  if (!media) {
    return;
  }
  media.pause();
  media.src = "";
  media.load();
}

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

function useFeedQueue() {
  const feedQuery = useQuery({
    queryFn: () => recommendationsApi.feed({ limit: FEED_PAGE_SIZE }),
    queryKey: ["recommendations", "feed"],
  });
  const [queue, setQueue] = useState<RecommendationCard[]>([]);
  const handledIds = useRef(new Set<string>());

  useEffect(() => {
    if (!feedQuery.data) {
      return;
    }

    setQueue((current) => {
      const queuedIds = new Set(current.map((card) => card.profile.id));
      const fresh = feedQuery.data.filter(
        (card) => !queuedIds.has(card.profile.id) && !handledIds.current.has(card.profile.id),
      );

      return fresh.length ? [...current, ...fresh] : current;
    });
  }, [feedQuery.data]);

  const { isFetching, refetch } = feedQuery;

  useEffect(() => {
    if (feedQuery.isSuccess && queue.length <= PREFETCH_THRESHOLD && !isFetching) {
      void refetch();
    }
    // Only react to the queue shrinking, not to every fetch status change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queue.length]);

  const dismiss = useCallback((profileId: string) => {
    handledIds.current.add(profileId);
    setQueue((current) => current.filter((card) => card.profile.id !== profileId));
  }, []);

  return { dismiss, feedQuery, queue };
}

export function FeedPage() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { height, width } = useWindowDimensions();
  const { dismiss, feedQuery, queue } = useFeedQueue();
  const swipe = useSwipeProfile();
  const me = useQuery({
    queryFn: () => profilesApi.getMe(),
    queryKey: ["profiles", "me"],
  });
  const [swipeCount, setSwipeCount] = useState(0);

  const card = queue[0] ?? null;
  const profile = card?.profile.user_account;
  const previewBeat = card?.profile.preview_beat ?? null;
  const imageUrl = card?.profile.image_url ?? profile?.avatar_url ?? null;
  const cardImage = imageUrl ? { uri: imageUrl } : rapperImages[swipeCount % rapperImages.length];

  const previewPlayer = useAudioPlayer(previewBeat?.audio_url ?? null, { updateInterval: 500 });
  const previewStatus = useAudioPlayerStatus(previewPlayer);
  const previewPlayerRef = useRef(previewPlayer);
  previewPlayerRef.current = previewPlayer;

  useLayoutEffect(() => {
    const player = previewPlayer;
    return () => {
      stopPlayback(player);
    };
  }, [previewPlayer]);

  useEffect(() => {
    if (!previewBeat?.audio_url || !previewStatus.isLoaded) {
      return;
    }

    const player = previewPlayer;
    player.seekTo(0);
    player.play();

    return () => {
      player.pause();
    };
  }, [card?.profile.id, previewBeat?.audio_url, previewPlayer, previewStatus.isLoaded]);

  const handleSwipe = (action: SwipeAction) => {
    if (!card) {
      return;
    }

    stopPlayback(previewPlayerRef.current);
    swipe.mutate({ action, target_profile_id: card.profile.id });
    dismiss(card.profile.id);
    setSwipeCount((value) => value + 1);
  };

  const togglePreview = () => {
    if (previewStatus.playing) {
      previewPlayer.pause();
    } else {
      previewPlayer.play();
    }
  };

  const metrics = useMemo(() => {
    const contentWidth = Math.max(288, Math.min(MAX_CONTENT_WIDTH, width - PAGE_PADDING * 2));
    const availableCardHeight =
      height -
      insets.top -
      PAGE_PADDING -
      HEADER_HEIGHT -
      CARD_TOP_GAP -
      ACTION_TOP_GAP -
      ACTION_BUTTON_SIZE -
      PAGE_PADDING -
      TAB_BAR_BODY_HEIGHT -
      Math.max(insets.bottom, 8);
    const cardHeight = Math.min(contentWidth / CARD_ASPECT_RATIO, Math.max(availableCardHeight, 0));

    return {
      cardHeight,
      cardRadius: width < 380 ? 26 : 32,
      contentWidth,
      overlayAvatarSize: 42,
      searchFontSize: width < 360 ? 18 : 20,
      scoreFontSize: width < 360 ? 22 : 24,
    };
  }, [height, insets.bottom, insets.top, width]);

  const isLoading = feedQuery.isPending || (!card && feedQuery.isFetching);
  const retry = () => void feedQuery.refetch();

  return (
    <Screen className="bg-white px-0 py-0" edges={["top", "left", "right"]} scroll={false}>
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
            <Avatar name={me.data?.artist_name} size={32} uri={me.data?.avatar_url} />
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

        {card && profile ? (
          <>
        <View style={{ marginTop: CARD_TOP_GAP }}>
        <ImageBackground
          className="overflow-hidden bg-[#EEEDE8]"
          imageStyle={{ borderRadius: metrics.cardRadius }}
          resizeMode="cover"
          source={cardImage}
          style={{
            borderRadius: metrics.cardRadius,
            height: metrics.cardHeight,
            overflow: "hidden",
            width: "100%",
          }}
        >
          <Pressable
            accessibilityLabel={`Open ${profile.name}'s profile`}
            accessibilityRole="button"
            onPress={() => router.push(`/profile/${card.profile.id}`)}
            style={{ flex: 1 }}
          />
          <View className="gap-2.5 bg-black/55 px-4 pb-4 pt-3.5">
            <Pressable
              accessibilityLabel={`Open ${profile.name}'s profile`}
              accessibilityRole="button"
              onPress={() => router.push(`/profile/${card.profile.id}`)}
            >
              <View className="flex-row items-center gap-3">
                <Image
                  accessibilityIgnoresInvertColors
                  resizeMode={profile.avatar_url ? "cover" : "contain"}
                  source={profile.avatar_url ? { uri: profile.avatar_url } : LogoSource}
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
                    numberOfLines={1}
                    style={{
                      fontSize: metrics.scoreFontSize,
                      lineHeight: metrics.scoreFontSize + 4,
                    }}
                  >
                    {profile.name}
                  </Text>
                  <Text
                    className="font-medium text-white/85"
                    numberOfLines={1}
                    style={{
                      fontSize: 14,
                      lineHeight: 18,
                    }}
                  >
                    {[
                      profile.role === "artist" ? "Rapper" : "Producer",
                      profile.location,
                      `${card.match.score * 10}pts`,
                    ]
                      .filter(Boolean)
                      .join(" • ")}
                  </Text>
                </View>
              </View>

              {profile.bio ? (
                <Text
                  className="text-white/85"
                  numberOfLines={2}
                  style={{ fontSize: 14, lineHeight: 18 }}
                >
                  {profile.bio}
                </Text>
              ) : null}

              {profile.tags.length ? (
                <View className="flex-row flex-wrap gap-1.5">
                  {profile.tags.slice(0, 3).map((tag) => (
                    <View className="rounded-full bg-white/35 px-2.5 py-1.5" key={tag}>
                      <Text className="font-semibold text-white" style={{ fontSize: 12, lineHeight: 14 }}>
                        {tag}
                      </Text>
                    </View>
                  ))}
                </View>
              ) : null}
            </Pressable>

              {previewBeat ? (
                <Pressable
                  accessibilityLabel={previewStatus.playing ? "Pause preview" : "Play preview"}
                  accessibilityRole="button"
                  className="flex-row items-center gap-3 rounded-2xl bg-white/20 p-2"
                  onPress={togglePreview}
                >
                  <View className="h-9 w-9 items-center justify-center rounded-full bg-white">
                    {previewStatus.playing ? (
                      <Pause color="#050505" size={18} />
                    ) : (
                      <Play color="#050505" size={18} />
                    )}
                  </View>
                  <View className="min-w-0 flex-1">
                    <Text
                      className="font-semibold text-white"
                      numberOfLines={1}
                      style={{ fontSize: 14, lineHeight: 18 }}
                    >
                      {previewBeat.title}
                    </Text>
                    <Text
                      className="text-white/75"
                      numberOfLines={1}
                      style={{ fontSize: 12, lineHeight: 16 }}
                    >
                      {[previewBeat.genre, previewBeat.bpm ? `${previewBeat.bpm} BPM` : null]
                        .filter(Boolean)
                        .join(" • ") || "Featured work"}
                    </Text>
                  </View>
                </Pressable>
              ) : null}
            </View>
        </ImageBackground>
        </View>

        <View
          className="flex-row items-center justify-center"
          style={{ gap: 36, paddingTop: ACTION_TOP_GAP }}
        >
          <HomeIconButton
            label="Like"
            onPress={() => handleSwipe("like")}
            size={ACTION_BUTTON_SIZE}
            tone="accept"
          >
            <ConnectIcon height={ICON_SIZE} width={ICON_SIZE} />
          </HomeIconButton>

          <HomeIconButton
            label="Skip"
            onPress={() => handleSwipe("skip")}
            size={ACTION_BUTTON_SIZE}
            tone="reject"
          >
            <RejectIcon height={ICON_SIZE} width={ICON_SIZE} />
          </HomeIconButton>
        </View>
          </>
        ) : isLoading ? (
          <View style={{ marginTop: CARD_TOP_GAP }}>
            <FeedSkeleton
              actionSize={ACTION_BUTTON_SIZE}
              cardHeight={metrics.cardHeight}
              cardRadius={metrics.cardRadius}
            />
          </View>
        ) : (
          <View className="flex-1 items-center justify-center px-4">
            <FeedNotice kind={feedQuery.isError ? "error" : "empty"} onPress={retry} />
          </View>
        )}
        </View>
      </View>
    </Screen>
  );
}
