import { router } from "expo-router";
import { Image, Pressable, ScrollView, StyleSheet, View, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Text } from "@/components/ui";
import WelcomeIllustration from "../../../assets/illustarations/welcome.png";

const MAX_CONTENT_WIDTH = 430;
const BODY_FONT_SIZE = 16;
const SMALL_FONT_SIZE = 12;

type WelcomeButtonProps = {
  children: string;
  onPress: () => void;
  variant: "primary" | "secondary";
};

function WelcomeButton({ children, onPress, variant }: WelcomeButtonProps) {
  const isPrimary = variant === "primary";

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: isPrimary ? "#050505" : "#FFFFFF",
          borderColor: isPrimary ? "#050505" : "#E3E3E3",
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
      ]}
    >
      <Text
        className="font-semibold"
        style={{
          color: isPrimary ? "#FFFFFF" : "#111111",
          fontSize: BODY_FONT_SIZE,
          lineHeight: 20,
        }}
      >
        {children}
      </Text>
    </Pressable>
  );
}

export function WelcomePage() {
  const { height, width } = useWindowDimensions();
  const pagePadding = width < 380 ? 20 : 24;
  const contentWidth = Math.min(MAX_CONTENT_WIDTH, width - pagePadding * 2);
  const heroSize = Math.min(contentWidth + 28, height * 0.43);
  const compact = height < 760;

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          alignItems: "center",
          flexGrow: 1,
          paddingBottom: compact ? 16 : 22,
          paddingHorizontal: pagePadding,
          paddingTop: compact ? 10 : 22,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View
          className="flex-1 items-center"
          style={{
            justifyContent: "space-between",
            maxWidth: MAX_CONTENT_WIDTH,
            width: "100%",
          }}
        >
          <View className="items-center" style={{ width: "100%" }}>
            <Image
              accessibilityIgnoresInvertColors
              resizeMode="contain"
              source={WelcomeIllustration}
              style={{
                height: heroSize,
                marginBottom: compact ? 10 : 18,
                width: heroSize,
              }}
            />

            <Text
              className="text-center font-bold text-black"
              style={{
                fontSize: compact ? 27 : 30,
                lineHeight: compact ? 31 : 34,
                maxWidth: 360,
              }}
            >
              Make Music. Find Your People.
            </Text>

            <Text
              className="text-center font-medium"
              style={{
                color: "#8F8F8F",
                fontSize: BODY_FONT_SIZE,
                lineHeight: 20,
                marginTop: 10,
                maxWidth: 340,
              }}
            >
              Discover artists, producers, and collaborators who match your sound.
            </Text>
          </View>

          <View style={{ paddingTop: compact ? 22 : 34, width: "100%" }}>
            <View style={{ gap: 12, width: "100%" }}>
              <WelcomeButton onPress={() => router.push("/(auth)/sign-up")} variant="primary">
                Create a new Account
              </WelcomeButton>
              <WelcomeButton onPress={() => router.push("/(auth)/sign-in")} variant="secondary">
                Login
              </WelcomeButton>
            </View>

            <Text
              className="text-center font-medium"
              style={{
                color: "#A3A3A3",
                fontSize: SMALL_FONT_SIZE,
                lineHeight: 17,
                marginTop: compact ? 20 : 28,
              }}
            >
              By using this app, you agree to accept our{"\n"}
              <Text className="font-semibold" style={{ color: "#737373", fontSize: SMALL_FONT_SIZE }}>
                Terms of Use
              </Text>{" "}
              and{" "}
              <Text className="font-semibold" style={{ color: "#737373", fontSize: SMALL_FONT_SIZE }}>
                Privacy Policy.
              </Text>
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    borderRadius: 28,
    borderWidth: StyleSheet.hairlineWidth,
    height: 56,
    justifyContent: "center",
    minHeight: 44,
    width: "100%",
  },
});
