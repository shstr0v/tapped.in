import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import {
  Animated,
  Easing,
  Image,
  Pressable,
  ScrollView,
  TextInput,
  View,
  useWindowDimensions,
  type ViewStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Avatar, Text } from "@/components/ui";
import type { Connection } from "@/entities/connection";
import type { MusicProfile } from "@/entities/music-profile";
import { connectionsApi, profilesApi } from "@/shared/api";
import ChevronIcon from "../../../assets/icons/chevron.svg";
import SearchIcon from "../../../assets/icons/search.svg";
import ConnectionsEmptyArt from "../../../assets/illustarations/connections-empty.jpg";
import ErrorArt from "../../../assets/illustarations/feed-error.jpg";

const MAX_CONTENT_WIDTH = 430;
const BODY_FONT_SIZE = 16;
const ROLE_LABEL = { artist: "Rapper", producer: "Producer" } as const;

function otherProfile(connection: Connection, myId?: string) {
  if (myId && connection.requester_profile_id === myId) {
    return connection.receiver_profile;
  }
  if (myId && connection.receiver_profile_id === myId) {
    return connection.requester_profile;
  }
  return connection.receiver_profile ?? connection.requester_profile;
}

function secondaryLine(profile: MusicProfile) {
  return [ROLE_LABEL[profile.role], profile.location].filter(Boolean).join(" • ");
}

function matches(profile: MusicProfile, query: string) {
  return [profile.artist_name, profile.role, profile.location, ...(profile.identity?.genres ?? [])]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
    .includes(query);
}

function ConnectionRow({ onPress, profile }: { onPress: () => void; profile: MusicProfile }) {
  const detail = secondaryLine(profile);

  return (
    <Pressable
      accessibilityRole="button"
      className="flex-row items-center bg-[#F7F8FA]"
      onPress={onPress}
      style={({ pressed }) => ({
        borderRadius: 20,
        height: 72,
        opacity: pressed ? 0.7 : 1,
        paddingHorizontal: 16,
        width: "100%",
      })}
    >
      <Avatar name={profile.artist_name} size={52} uri={profile.avatar_url} />
      <View className="min-w-0 flex-1" style={{ marginLeft: 16 }}>
        <Text className="font-semibold text-black" numberOfLines={1} style={{ fontSize: BODY_FONT_SIZE, lineHeight: 20 }}>
          {profile.artist_name}
        </Text>
        {detail ? (
          <Text numberOfLines={1} style={{ color: "#8F8F8F", fontSize: 13, fontWeight: "500", lineHeight: 16, marginTop: 2 }}>
            {detail}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

function ConnectionsSkeleton() {
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

  const bone = (style: ViewStyle) => <Animated.View style={[{ backgroundColor: "#E8E8E8", opacity }, style]} />;

  return (
    <View style={{ gap: 14, marginTop: 24 }}>
      {Array.from({ length: 5 }, (_, index) => (
        <View
          key={index}
          className="flex-row items-center bg-[#F7F8FA]"
          style={{ borderRadius: 20, height: 72, paddingHorizontal: 16 }}
        >
          {bone({ borderRadius: 26, height: 52, width: 52 })}
          <View style={{ flex: 1, gap: 8, marginLeft: 16 }}>
            {bone({ borderRadius: 6, height: 14, width: "48%" })}
            {bone({ borderRadius: 6, height: 12, width: "32%" })}
          </View>
        </View>
      ))}
    </View>
  );
}

export function ConnectionsPage() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [query, setQuery] = useState("");
  const contentWidth = Math.max(280, Math.min(MAX_CONTENT_WIDTH, width - 32));
  const me = useQuery({ queryFn: () => profilesApi.getMe(), queryKey: ["profiles", "me"] });
  const connections = useQuery({ queryFn: () => connectionsApi.list(), queryKey: ["connections"] });

  const people = useMemo(() => {
    return (connections.data ?? [])
      .filter((connection) => connection.status === "accepted")
      .map((connection) => otherProfile(connection, me.data?.id))
      .filter((profile): profile is MusicProfile => Boolean(profile));
  }, [connections.data, me.data?.id]);

  const normalizedQuery = query.trim().toLowerCase();
  const visible = normalizedQuery ? people.filter((profile) => matches(profile, normalizedQuery)) : people;

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ alignItems: "center", flexGrow: 1, paddingBottom: 24, paddingTop: 16 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={{ flex: 1, width: contentWidth }}>
          <Pressable
            accessibilityLabel="Back"
            accessibilityRole="button"
            className="flex-row items-center self-start"
            onPress={() => router.replace("/my-profile")}
            style={({ pressed }) => ({ minHeight: 32, opacity: pressed ? 0.6 : 1 })}
          >
            <ChevronIcon height={20} width={20} />
            <Text className="font-semibold" style={{ color: "#B2B2B2", fontSize: BODY_FONT_SIZE, lineHeight: 20 }}>
              Back
            </Text>
          </Pressable>

          <View
            className="flex-row items-center bg-[#F7F8FA]"
            style={{ borderRadius: 20, height: 56, marginTop: 18, paddingHorizontal: 18 }}
          >
            <SearchIcon height={24} width={24} />
            <TextInput
              autoCapitalize="none"
              autoCorrect={false}
              onChangeText={setQuery}
              placeholder="Search"
              placeholderTextColor="#B2B2B2"
              style={{
                color: "#050505",
                flex: 1,
                fontSize: BODY_FONT_SIZE,
                fontWeight: "600",
                marginLeft: 14,
                padding: 0,
              }}
              value={query}
            />
            {query ? (
              <Pressable accessibilityLabel="Clear search" hitSlop={8} onPress={() => setQuery("")}>
                <Text className="font-semibold" style={{ color: "#B2B2B2", fontSize: 18, lineHeight: 20 }}>
                  ×
                </Text>
              </Pressable>
            ) : null}
          </View>

          {connections.isPending ? (
            <ConnectionsSkeleton />
          ) : connections.isError ? (
            <View style={{ alignItems: "center", flex: 1, justifyContent: "center", paddingBottom: 40 }}>
              <Image accessibilityIgnoresInvertColors resizeMode="contain" source={ErrorArt} style={{ height: 120, width: 120 }} />
              <Text style={{ color: "#111111", fontSize: 22, fontWeight: "700", lineHeight: 27, marginTop: 8, textAlign: "center" }}>
                Something went wrong
              </Text>
              <Text style={{ color: "#8F8F8F", fontSize: 15, fontWeight: "500", lineHeight: 20, marginTop: 6, textAlign: "center" }}>
                We couldn't load your connections.
              </Text>
              <Pressable
                onPress={() => void connections.refetch()}
                style={({ pressed }) => ({
                  alignItems: "center",
                  backgroundColor: "#050505",
                  borderRadius: 28,
                  height: 52,
                  justifyContent: "center",
                  marginTop: 18,
                  transform: [{ scale: pressed ? 0.96 : 1 }],
                  width: "100%",
                })}
              >
                <Text className="font-semibold text-white" style={{ fontSize: BODY_FONT_SIZE }}>
                  Try again
                </Text>
              </Pressable>
            </View>
          ) : people.length === 0 ? (
            <View style={{ alignItems: "center", flex: 1, justifyContent: "center", paddingBottom: 40 }}>
              <Image
                accessibilityIgnoresInvertColors
                resizeMode="contain"
                source={ConnectionsEmptyArt}
                style={{ height: 132, width: 132 }}
              />
              <Text style={{ color: "#111111", fontSize: 22, fontWeight: "700", lineHeight: 27, marginTop: 8 }}>
                No connections yet
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
                Start discovering people and your connections will show up here.
              </Text>
            </View>
          ) : visible.length === 0 ? (
            <Text
              style={{
                color: "#8F8F8F",
                fontSize: 15,
                fontWeight: "600",
                marginTop: 28,
                textAlign: "center",
              }}
            >
              No connections found
            </Text>
          ) : (
            <View style={{ gap: 14, marginTop: 24 }}>
              {visible.map((profile) => (
                <ConnectionRow
                  key={profile.id}
                  onPress={() => router.push(`/profile/${profile.id}`)}
                  profile={profile}
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
