import { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  Image,
  Pressable,
  StyleSheet,
  View,
  type TextStyle,
  type ViewStyle,
} from "react-native";

import { Text } from "@/components/ui";
import EmptyArt from "../../../../assets/illustarations/feed-empty.jpg";
import ErrorArt from "../../../../assets/illustarations/feed-error.jpg";

const BONE = "#E8E8E8";
const CARD = "#F5F5F5";

type FeedSkeletonProps = {
  actionSize: number;
  cardHeight: number;
  cardRadius: number;
};

export function FeedSkeleton({ actionSize, cardHeight, cardRadius }: FeedSkeletonProps) {
  const opacity = useRef(new Animated.Value(0.55)).current;

  useEffect(() => {
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
  }, [opacity]);

  const bone = (style: ViewStyle) => <Animated.View style={[{ backgroundColor: BONE, opacity }, style]} />;

  return (
    <View>
      <View style={[styles.card, { borderRadius: cardRadius, height: cardHeight }]}>
        <View style={{ gap: 10 }}>
          <View style={styles.identity}>
            {bone(styles.avatar)}
            <View style={{ flex: 1, gap: 8 }}>
              {bone(styles.name)}
              {bone(styles.meta)}
            </View>
          </View>
          {bone(styles.line)}
          {bone(styles.lineShort)}
          <View style={styles.tags}>
            {bone(styles.tag)}
            {bone(styles.tagWide)}
            {bone(styles.tag)}
          </View>
          <View style={styles.track}>
            {bone(styles.play)}
            <View style={{ flex: 1, gap: 7 }}>
              {bone(styles.trackTitle)}
              {bone(styles.trackMeta)}
            </View>
          </View>
        </View>
      </View>

      <View style={styles.actions}>
        {bone({ borderRadius: actionSize / 2, height: actionSize, width: actionSize })}
        {bone({ borderRadius: actionSize / 2, height: actionSize, width: actionSize })}
      </View>
    </View>
  );
}

type FeedNoticeProps = {
  kind: "empty" | "error";
  onPress: () => void;
};

export function FeedNotice({ kind, onPress }: FeedNoticeProps) {
  const isError = kind === "error";

  return (
    <View style={styles.notice}>
      <Image
        accessibilityIgnoresInvertColors
        resizeMode="contain"
        source={isError ? ErrorArt : EmptyArt}
        style={styles.art}
      />
      <Text style={text.title}>{isError ? "Something went wrong" : "You're all caught up"}</Text>
      <Text style={text.subtitle}>
        {isError
          ? "We couldn't load your feed."
          : "We couldn't find anyone new for you right now. Check back later."}
      </Text>
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        style={({ pressed }) => [
          styles.button,
          isError ? styles.buttonPrimary : styles.buttonSecondary,
          { transform: [{ scale: pressed ? 0.96 : 1 }] },
        ]}
      >
        <Text style={[text.button, { color: isError ? "#FFFFFF" : "#111111" }]}>
          {isError ? "Try again" : "Refresh"}
        </Text>
      </Pressable>
    </View>
  );
}

const text: Record<"button" | "subtitle" | "title", TextStyle> = {
  button: { fontSize: 16, fontWeight: "600", lineHeight: 20 },
  subtitle: {
    color: "#8F8F8F",
    fontSize: 15,
    fontWeight: "500",
    lineHeight: 20,
    marginTop: 6,
    textAlign: "center",
  },
  title: { color: "#111111", fontSize: 22, fontWeight: "700", lineHeight: 27, textAlign: "center" },
};

const styles = StyleSheet.create({
  actions: {
    flexDirection: "row",
    gap: 36,
    justifyContent: "center",
    paddingTop: 16,
  },
  art: {
    height: 148,
    marginBottom: 4,
    width: 148,
  },
  avatar: {
    borderRadius: 21,
    height: 42,
    width: 42,
  },
  button: {
    alignItems: "center",
    borderRadius: 28,
    height: 52,
    justifyContent: "center",
    marginTop: 16,
    width: "100%",
  },
  buttonPrimary: {
    backgroundColor: "#050505",
  },
  buttonSecondary: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E3E3E3",
    borderWidth: StyleSheet.hairlineWidth,
  },
  card: {
    backgroundColor: CARD,
    justifyContent: "flex-end",
    overflow: "hidden",
    padding: 16,
    width: "100%",
  },
  identity: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
  },
  line: {
    borderRadius: 6,
    height: 12,
    width: "92%",
  },
  lineShort: {
    borderRadius: 6,
    height: 12,
    width: "64%",
  },
  meta: {
    borderRadius: 6,
    height: 12,
    width: "55%",
  },
  name: {
    borderRadius: 7,
    height: 16,
    width: "46%",
  },
  notice: {
    alignItems: "center",
    maxWidth: 320,
    width: "100%",
  },
  play: {
    borderRadius: 18,
    height: 36,
    width: 36,
  },
  tag: {
    borderRadius: 12,
    height: 26,
    width: 64,
  },
  tagWide: {
    borderRadius: 12,
    height: 26,
    width: 88,
  },
  tags: {
    flexDirection: "row",
    gap: 6,
  },
  track: {
    alignItems: "center",
    backgroundColor: "#EFEFEF",
    borderRadius: 16,
    flexDirection: "row",
    gap: 12,
    padding: 8,
  },
  trackMeta: {
    borderRadius: 5,
    height: 10,
    width: "40%",
  },
  trackTitle: {
    borderRadius: 6,
    height: 12,
    width: "62%",
  },
});
