import { useEffect } from "react";
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import { useRouter } from "expo-router";
import { Image, Linking, Pressable, ScrollView, View, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Text } from "@/components/ui";
import AudioPreviewSource from "../../../assets/audio.mp3";
import ChevronIcon from "../../../assets/icons/chevron.svg";
import EditIcon from "../../../assets/icons/edit.svg";
import ExternalLinkIcon from "../../../assets/icons/external-link.svg";
import InstagramIcon from "../../../assets/icons/instagra-vnu.svg";
import PauseIcon from "../../../assets/icons/pause.svg";
import PlayIcon from "../../../assets/icons/play.svg";
import SpotifyIcon from "../../../assets/icons/spotify-vnu.svg";
import TelegramIcon from "../../../assets/icons/telegram-vnu.svg";
import ProfileImage from "../../../assets/rappers/image copy.png";

const MAX_CONTENT_WIDTH = 430;
const BODY_FONT_SIZE = 16;
const SMALL_FONT_SIZE = 12;
const SECTION_GAP = 26;

const tags = ["hip-hop", "rage", "ken carson"];
const socials = [
  { Icon: InstagramIcon, id: "instagram", label: "@222blank", url: "https://instagram.com/222blank" },
  { Icon: SpotifyIcon, id: "spotify", label: "@222blank", url: "https://open.spotify.com" },
  { Icon: TelegramIcon, id: "telegram", label: "@222blank", url: "https://t.me/222blank" },
];

function SectionTitle({ children }: { children: string }) {
  return (
    <Text
      className="font-semibold"
      style={{ color: "#B2B2B2", fontSize: BODY_FONT_SIZE, lineHeight: 20 }}
    >
      {children}
    </Text>
  );
}

function Tag({ label }: { label: string }) {
  return (
    <View
      style={{
        backgroundColor: "#9F9F9F",
        borderRadius: 14,
        paddingHorizontal: 11,
        paddingVertical: 5,
      }}
    >
      <Text className="font-semibold text-white" style={{ fontSize: SMALL_FONT_SIZE, lineHeight: 14 }}>
        {label}
      </Text>
    </View>
  );
}

function PreviewPlayer({ width }: { width: number }) {
  const player = useAudioPlayer(AudioPreviewSource, { updateInterval: 150 });
  const status = useAudioPlayerStatus(player);
  const isPlaying = status.playing;

  useEffect(() => {
    return () => {
      player.pause();
    };
  }, [player]);

  const togglePlayback = async () => {
    if (isPlaying) {
      player.pause();
      return;
    }

    if (status.didJustFinish || (status.duration > 0 && status.currentTime >= status.duration - 0.15)) {
      await player.seekTo(0);
    }

    player.play();
  };

  return (
    <View
      className="flex-row items-center bg-[#F7F7F7]"
      style={{
        boxSizing: "border-box",
        borderRadius: 20,
        height: 58,
        paddingLeft: 18,
        paddingRight: 14,
        width,
      }}
    >
      <Text
        className="min-w-0 flex-1 font-semibold text-black"
        numberOfLines={1}
        style={{ fontSize: BODY_FONT_SIZE, lineHeight: 20 }}
      >
        Banger
      </Text>

      <Pressable
        accessibilityLabel={isPlaying ? "Pause preview" : "Play preview"}
        accessibilityRole="button"
        hitSlop={8}
        onPress={() => void togglePlayback()}
        style={({ pressed }) => ({
          alignItems: "center",
          borderRadius: 22,
          height: 44,
          justifyContent: "center",
          transform: [{ scale: pressed ? 0.97 : 1 }],
          width: 44,
        })}
      >
        {isPlaying ? <PauseIcon height={28} width={28} /> : <PlayIcon height={28} width={28} />}
      </Pressable>
    </View>
  );
}

function SocialRow({ Icon, label, url }: (typeof socials)[number]) {
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
      <Icon height={24} width={24} />
      <Text
        className="flex-1 font-semibold text-black"
        numberOfLines={1}
        style={{ fontSize: BODY_FONT_SIZE, lineHeight: 20, marginLeft: 16 }}
      >
        {label}
      </Text>
      <ExternalLinkIcon height={20} width={20} />
    </Pressable>
  );
}

function ConnectionsStrip({ onPress, width }: { onPress: () => void; width: number }) {
  const avatars = Array.from({ length: 6 }, (_, index) => index);

  return (
    <Pressable
      accessibilityLabel="Open connections"
      accessibilityRole="button"
      className="flex-row items-center bg-[#F7F7F7]"
      onPress={onPress}
      style={{
        boxSizing: "border-box",
        borderRadius: 18,
        height: 62,
        paddingHorizontal: 16,
        width,
      }}
    >
      <View className="min-w-0 flex-1 flex-row items-center">
        {avatars.map((avatar) => (
          <Image
            accessibilityIgnoresInvertColors
            key={avatar}
            resizeMode="cover"
            source={ProfileImage}
            style={{
              borderColor: "#F7F7F7",
              borderRadius: 20,
              borderWidth: 2,
              height: 40,
              marginLeft: avatar === 0 ? 0 : -11,
              width: 40,
            }}
          />
        ))}
        <View
          className="items-center justify-center"
          style={{
            backgroundColor: "#E1E1E1",
            borderColor: "#F7F7F7",
            borderRadius: 20,
            borderWidth: 2,
            height: 40,
            marginLeft: -11,
            width: 50,
          }}
        >
          <Text className="font-semibold text-black" style={{ fontSize: BODY_FONT_SIZE, lineHeight: 20 }}>
            +500
          </Text>
        </View>
      </View>
      <ChevronIcon height={20} style={{ transform: [{ rotate: "180deg" }] }} width={20} />
    </Pressable>
  );
}

export function MyProfilePage() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const contentWidth = Math.max(280, Math.min(MAX_CONTENT_WIDTH, width - 32));

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          alignItems: "center",
          paddingBottom: 18,
          paddingTop: 16,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={{ width: contentWidth }}>
          <Pressable
            accessibilityLabel="Back"
            accessibilityRole="button"
            onPress={() => router.replace("/(tabs)/feed")}
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

          <View className="flex-row items-center" style={{ gap: 18, marginTop: 26 }}>
            <Image
              accessibilityIgnoresInvertColors
              resizeMode="cover"
              source={ProfileImage}
              style={{ borderRadius: 42, height: 84, width: 84 }}
            />
            <View className="min-w-0 flex-1" style={{ gap: 8 }}>
              <Text className="font-semibold text-black" style={{ fontSize: BODY_FONT_SIZE, lineHeight: 20 }}>
                800pts
              </Text>
              <Text
                className="font-semibold"
                numberOfLines={1}
                style={{ color: "#666666", fontSize: BODY_FONT_SIZE, lineHeight: 20 }}
              >
                Rapper • Atlanta, US
              </Text>
            </View>
          </View>

          <View className="flex-row flex-wrap" style={{ gap: 10, marginTop: 28 }}>
            {tags.map((tag) => (
              <Tag key={tag} label={tag} />
            ))}
          </View>

          <View style={{ gap: 14, marginTop: SECTION_GAP }}>
            <SectionTitle>Preview</SectionTitle>
            <PreviewPlayer width={contentWidth} />
          </View>

          <View style={{ gap: 14, marginTop: SECTION_GAP }}>
            <SectionTitle>Socials</SectionTitle>
            <View
              style={{
                backgroundColor: "#F7F7F7",
                borderRadius: 20,
                boxSizing: "border-box",
                padding: 18,
                width: contentWidth,
              }}
            >
              {socials.map((social) => (
                <SocialRow {...social} key={social.id} />
              ))}
            </View>
          </View>

          <View style={{ gap: 14, marginTop: SECTION_GAP }}>
            <SectionTitle>Connections</SectionTitle>
            <ConnectionsStrip onPress={() => router.push("/connections")} width={contentWidth} />
          </View>
        </View>
      </ScrollView>

      <View
        style={{
          alignItems: "center",
          paddingBottom: 12,
        }}
      >
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
            height: 56,
            justifyContent: "center",
            transform: [{ scale: pressed ? 0.98 : 1 }],
            width: contentWidth,
          })}
        >
          <Text className="font-semibold text-white" style={{ fontSize: BODY_FONT_SIZE, lineHeight: 20 }}>
            Edit
          </Text>
          <EditIcon height={24} width={24} />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
