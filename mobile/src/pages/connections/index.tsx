import { useMemo, useState } from "react";
import { useRouter } from "expo-router";
import { Image, Pressable, ScrollView, TextInput, View, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Text } from "@/components/ui";
import ChevronIcon from "../../../assets/icons/chevron.svg";
import SearchIcon from "../../../assets/icons/search.svg";
import ThreeDotsIcon from "../../../assets/icons/three-dots.svg";
import AvatarImage from "../../../assets/rappers/image copy.png";

const MAX_CONTENT_WIDTH = 430;
const BODY_FONT_SIZE = 16;

const connections = Array.from({ length: 10 }, (_, index) => ({
  id: `connection-${index}`,
  name: index % 2 === 0 ? "222blank" : "atlanta rapper",
  score: 800,
}));

function ConnectionRow({ score }: { score: number }) {
  return (
    <View
      className="flex-row items-center bg-[#F7F8FA]"
      style={{
        borderRadius: 20,
        height: 72,
        paddingHorizontal: 16,
        width: "100%",
      }}
    >
      <Image
        accessibilityIgnoresInvertColors
        resizeMode="cover"
        source={AvatarImage}
        style={{ borderRadius: 26, height: 52, width: 52 }}
      />

      <Text
        className="flex-1 font-semibold text-black"
        style={{ fontSize: BODY_FONT_SIZE, lineHeight: 20, marginLeft: 16 }}
      >
        {score}pts
      </Text>

      <ThreeDotsIcon height={24} width={24} />
    </View>
  );
}

export function ConnectionsPage() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [query, setQuery] = useState("");
  const contentWidth = Math.max(280, Math.min(MAX_CONTENT_WIDTH, width - 32));

  const filteredConnections = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return connections;
    }

    return connections.filter((connection) =>
      `${connection.name} ${connection.score}pts`.toLowerCase().includes(normalizedQuery),
    );
  }, [query]);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          alignItems: "center",
          paddingBottom: 24,
          paddingTop: 16,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={{ width: contentWidth }}>
          <Pressable
            accessibilityLabel="Back"
            accessibilityRole="button"
            className="flex-row items-center self-start"
            onPress={() => router.replace("/my-profile")}
            style={({ pressed }) => ({
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

          <View
            className="flex-row items-center bg-[#F7F8FA]"
            style={{
              borderRadius: 20,
              height: 56,
              marginTop: 18,
              paddingHorizontal: 18,
              width: "100%",
            }}
          >
            <SearchIcon height={24} width={24} />
            <TextInput
              autoCapitalize="none"
              autoCorrect={false}
              onChangeText={setQuery}
              placeholder="Search"
              placeholderTextColor="#B2B2B2"
              returnKeyType="search"
              style={{
                color: "#050505",
                flex: 1,
                fontSize: BODY_FONT_SIZE,
                fontWeight: "600",
                lineHeight: 20,
                marginLeft: 14,
                padding: 0,
              }}
              value={query}
            />
          </View>

          <View style={{ gap: 14, marginTop: 24 }}>
            {filteredConnections.map((connection) => (
              <ConnectionRow key={connection.id} score={connection.score} />
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
