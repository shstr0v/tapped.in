import { useEffect, useState } from "react";
import { Animated, Easing, Image, Pressable, View, type ViewStyle } from "react-native";

import { Text } from "@/components/ui";
import { useReduceMotion } from "@/shared/lib/reduce-motion";
import FallbackAvatar from "../../../../assets/illustarations/avatar-fallback.jpg";
import ErrorArt from "../../../../assets/illustarations/feed-error.jpg";

const BONE = "#E8E8E8";

function usePulse() {
  const [opacity] = useState(() => new Animated.Value(0.7));
  const reduceMotion = useReduceMotion();

  useEffect(() => {
    if (reduceMotion) {
      opacity.setValue(0.7);
      return;
    }

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          duration: 1100,
          easing: Easing.inOut(Easing.ease),
          toValue: 1,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          duration: 1100,
          easing: Easing.inOut(Easing.ease),
          toValue: 0.55,
          useNativeDriver: true,
        }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, [opacity, reduceMotion]);

  return opacity;
}

export function ChatsSkeleton() {
  const opacity = usePulse();
  const bone = (style: ViewStyle) => <Animated.View style={[{ backgroundColor: BONE, opacity }, style]} />;

  return (
    <View style={{ gap: 14, marginTop: 8 }}>
      {Array.from({ length: 6 }, (_, index) => (
        <View key={index} style={{ alignItems: "center", flexDirection: "row", minHeight: 72 }}>
          {bone({ borderRadius: 26, height: 52, width: 52 })}
          <View style={{ flex: 1, gap: 8, marginLeft: 14 }}>
            {bone({ borderRadius: 6, height: 14, width: "46%" })}
            {bone({ borderRadius: 6, height: 12, width: "72%" })}
          </View>
          {bone({ borderRadius: 6, height: 10, width: 28 })}
        </View>
      ))}
    </View>
  );
}

export function ChatsEmpty() {
  return (
    <View style={{ alignItems: "center", flex: 1, justifyContent: "center", paddingBottom: 48 }}>
      <View style={{ alignItems: "center", flexDirection: "row" }}>
        <Image
          accessibilityIgnoresInvertColors
          source={FallbackAvatar}
          style={{
            backgroundColor: "#E7E7E7",
            borderColor: "rgba(0,0,0,0.08)",
            borderRadius: 36,
            borderWidth: 1,
            height: 72,
            opacity: 0.72,
            width: 72,
          }}
        />
        <View style={{ backgroundColor: "#E4E4E4", borderRadius: 1, height: 2, marginHorizontal: 14, width: 28 }} />
        <Image
          accessibilityIgnoresInvertColors
          source={FallbackAvatar}
          style={{
            backgroundColor: "#E7E7E7",
            borderColor: "rgba(0,0,0,0.08)",
            borderRadius: 36,
            borderWidth: 1,
            height: 72,
            opacity: 0.45,
            width: 72,
          }}
        />
      </View>
      <Text style={{ color: "#111111", fontSize: 22, fontWeight: "700", lineHeight: 27, marginTop: 22 }}>
        No chats yet
      </Text>
      <Text
        style={{
          color: "#6F6F6F",
          fontSize: 15,
          fontWeight: "500",
          lineHeight: 20,
          marginTop: 6,
          maxWidth: 260,
          textAlign: "center",
        }}
      >
        Connect with someone to start a conversation.
      </Text>
    </View>
  );
}

export function ChatsError({ onRetry }: { onRetry: () => void }) {
  return (
    <View style={{ alignItems: "center", flex: 1, justifyContent: "center", paddingBottom: 40 }}>
      <Image accessibilityIgnoresInvertColors resizeMode="contain" source={ErrorArt} style={{ height: 120, width: 120 }} />
      <Text style={{ color: "#111111", fontSize: 22, fontWeight: "700", lineHeight: 27, marginTop: 8, textAlign: "center" }}>
        Something went wrong
      </Text>
      <Text style={{ color: "#6F6F6F", fontSize: 15, fontWeight: "500", lineHeight: 20, marginTop: 6, textAlign: "center" }}>
        We could not load your chats.
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
          marginTop: 18,
          transform: [{ scale: pressed ? 0.97 : 1 }],
          width: "100%",
        })}
      >
        <Text className="font-semibold text-white" style={{ fontSize: 16 }}>
          Try again
        </Text>
      </Pressable>
    </View>
  );
}
