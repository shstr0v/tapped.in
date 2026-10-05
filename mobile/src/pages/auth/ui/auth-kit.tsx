import { type ReactNode, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  type ImageSourcePropType,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  type TextInputProps,
  type TextStyle,
  View,
  useWindowDimensions,
} from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Eye, EyeOff } from "lucide-react-native";

import { Text } from "@/components/ui";
import ChevronIcon from "../../../../assets/icons/chevron.svg";

export const AUTH_COLORS = {
  border: "#E3E3E3",
  borderFocus: "#111111",
  danger: "#E5484D",
  dangerSurface: "#FFF1F1",
  field: "#F6F6F6",
  ink: "#050505",
  muted: "#8F8F8F",
  subtle: "#A3A3A3",
  text: "#111111",
};

const MAX_CONTENT_WIDTH = 430;
export const labelStyle: TextStyle = { color: "#737373", fontSize: 13, fontWeight: "600", lineHeight: 16, paddingLeft: 4 };

type AuthShellProps = {
  children: ReactNode;
  footer?: ReactNode;
  illustration: ImageSourcePropType;
  onBack?: () => void;
  subtitle: string;
  title: string;
};

export function AuthShell({ children, footer, illustration, onBack, subtitle, title }: AuthShellProps) {
  const { height, width } = useWindowDimensions();
  const pagePadding = width < 380 ? 20 : 24;
  const compact = height < 760;
  const artSize = compact ? 120 : 148;

  const goBack = onBack ?? (() => (router.canGoBack() ? router.back() : router.replace("/")));

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} className="flex-1">
        <ScrollView
          contentContainerStyle={{
            alignItems: "center",
            flexGrow: 1,
            paddingBottom: compact ? 16 : 22,
            paddingHorizontal: pagePadding,
            paddingTop: compact ? 6 : 10,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={{ flex: 1, maxWidth: MAX_CONTENT_WIDTH, width: "100%" }}>
            <Pressable
              accessibilityLabel="Go back"
              accessibilityRole="button"
              hitSlop={8}
              onPress={goBack}
              style={({ pressed }) => [styles.backButton, { opacity: pressed ? 0.6 : 1 }]}
            >
              <ChevronIcon height={20} width={20} />
              <Text className="font-semibold" style={{ color: "#B2B2B2", fontSize: 16, lineHeight: 20 }}>
                Back
              </Text>
            </Pressable>

            <View className="items-center" style={{ marginTop: compact ? 0 : 4 }}>
              <Image
                accessibilityIgnoresInvertColors
                resizeMode="contain"
                source={illustration}
                style={{ height: artSize, marginBottom: compact ? 12 : 16, width: artSize }}
              />
              <Text
                className="text-center font-bold text-black"
                style={{ fontSize: compact ? 26 : 28, lineHeight: compact ? 30 : 33, maxWidth: 340 }}
              >
                {title}
              </Text>
              <Text
                className="text-center font-medium"
                style={{ color: AUTH_COLORS.muted, fontSize: 16, lineHeight: 21, marginTop: 8, maxWidth: 320 }}
              >
                {subtitle}
              </Text>
            </View>

            <View style={{ gap: 14, marginTop: compact ? 24 : 32 }}>{children}</View>

            {footer ? (
              <View style={{ flex: 1, justifyContent: "flex-end", paddingTop: 24 }}>{footer}</View>
            ) : null}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

type AuthFieldProps = TextInputProps & {
  error?: boolean;
  label: string;
};

export function AuthField({ error, label, onBlur, onFocus, secureTextEntry, style, ...props }: AuthFieldProps) {
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(true);
  const isPassword = !!secureTextEntry;

  return (
    <View style={{ flex: 1, gap: 6 }}>
      <Text style={labelStyle}>
        {label}
      </Text>
      <View
        style={[
          styles.field,
          {
            backgroundColor: focused ? "#FFFFFF" : AUTH_COLORS.field,
            borderColor: error ? AUTH_COLORS.danger : focused ? AUTH_COLORS.borderFocus : "transparent",
          },
        ]}
      >
        <TextInput
          onBlur={(event) => {
            setFocused(false);
            onBlur?.(event);
          }}
          onFocus={(event) => {
            setFocused(true);
            onFocus?.(event);
          }}
          placeholderTextColor={AUTH_COLORS.subtle}
          secureTextEntry={isPassword && hidden}
          style={[styles.fieldInput, style]}
          {...props}
        />
        {isPassword ? (
          <Pressable
            accessibilityLabel={hidden ? "Show password" : "Hide password"}
            accessibilityRole="button"
            hitSlop={10}
            onPress={() => setHidden((value) => !value)}
            style={styles.fieldIcon}
          >
            {hidden ? (
              <Eye color={AUTH_COLORS.muted} size={20} strokeWidth={2} />
            ) : (
              <EyeOff color={AUTH_COLORS.muted} size={20} strokeWidth={2} />
            )}
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

type AuthButtonProps = {
  children: string;
  disabled?: boolean;
  loading?: boolean;
  onPress: () => void;
  variant?: "primary" | "secondary";
};

export function AuthButton({ children, disabled, loading, onPress, variant = "primary" }: AuthButtonProps) {
  const isPrimary = variant === "primary";
  const inactive = disabled || loading;
  const color = isPrimary ? "#FFFFFF" : AUTH_COLORS.text;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ busy: loading, disabled: inactive }}
      disabled={inactive}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: isPrimary ? AUTH_COLORS.ink : "#FFFFFF",
          borderColor: isPrimary ? AUTH_COLORS.ink : AUTH_COLORS.border,
          opacity: disabled && !loading ? 0.35 : 1,
          transform: [{ scale: pressed ? 0.96 : 1 }],
        },
      ]}
    >
      {loading ? <ActivityIndicator color={color} size="small" style={{ marginRight: 8 }} /> : null}
      <Text className="font-semibold" style={{ color, fontSize: 16, lineHeight: 20 }}>
        {children}
      </Text>
    </Pressable>
  );
}

export function AuthError({ children }: { children: string | null }) {
  if (!children) {
    return null;
  }

  return (
    <View accessibilityLiveRegion="polite" style={styles.error}>
      <Text className="font-medium" style={{ color: AUTH_COLORS.danger, fontSize: 14, lineHeight: 19 }}>
        {children}
      </Text>
    </View>
  );
}

type AuthLinkProps = {
  action: string;
  onPress: () => void;
  prompt: string;
};

export function AuthLink({ action, onPress, prompt }: AuthLinkProps) {
  return (
    <Pressable accessibilityRole="link" hitSlop={8} onPress={onPress} style={styles.link}>
      <Text className="text-center font-medium" style={{ color: AUTH_COLORS.subtle, fontSize: 14 }}>
        {prompt}{" "}
        <Text className="font-semibold" style={{ color: AUTH_COLORS.text, fontSize: 14 }}>
          {action}
        </Text>
      </Text>
    </Pressable>
  );
}

type SegmentedProps<T extends string> = {
  label: string;
  onChange: (value: T) => void;
  options: { label: string; value: T }[];
  value: T;
};

export function AuthSegmented<T extends string>({ label, onChange, options, value }: SegmentedProps<T>) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={labelStyle}>
        {label}
      </Text>
      <View style={styles.segmented}>
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <Pressable
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              key={option.value}
              onPress={() => onChange(option.value)}
              style={[styles.segment, selected && styles.segmentSelected]}
            >
              <Text
                className="font-semibold"
                style={{ color: selected ? AUTH_COLORS.text : AUTH_COLORS.muted, fontSize: 15 }}
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

type CodeInputProps = {
  error?: boolean;
  length?: number;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  value: string;
};

export function CodeInput({ error, length = 6, onChange, onComplete, value }: CodeInputProps) {
  const inputRef = useRef<TextInput>(null);
  const [focused, setFocused] = useState(true);

  return (
    <Pressable accessibilityLabel="Verification code" onPress={() => inputRef.current?.focus()}>
      <View style={{ flexDirection: "row", gap: 8 }}>
        {Array.from({ length }, (_, index) => {
          const char = value[index] ?? "";
          const active = focused && index === Math.min(value.length, length - 1);
          return (
            <View
              key={index}
              style={[
                styles.codeCell,
                {
                  backgroundColor: active || char ? "#FFFFFF" : AUTH_COLORS.field,
                  borderColor: error
                    ? AUTH_COLORS.danger
                    : active
                      ? AUTH_COLORS.borderFocus
                      : char
                        ? AUTH_COLORS.border
                        : "transparent",
                },
              ]}
            >
              <Text className="font-bold" style={{ color: AUTH_COLORS.text, fontSize: 22, fontVariant: ["tabular-nums"] }}>
                {char}
              </Text>
            </View>
          );
        })}
      </View>
      <TextInput
        autoComplete="one-time-code"
        autoFocus
        caretHidden
        keyboardType="number-pad"
        maxLength={length}
        onBlur={() => setFocused(false)}
        onChangeText={(text) => {
          const digits = text.replace(/\D/g, "").slice(0, length);
          onChange(digits);
          if (digits.length === length) {
            onComplete?.(digits);
          }
        }}
        onFocus={() => setFocused(true)}
        ref={inputRef}
        style={styles.hiddenInput}
        textContentType="oneTimeCode"
        value={value}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  backButton: {
    alignItems: "center",
    alignSelf: "flex-start",
    flexDirection: "row",
    gap: 2,
    marginLeft: -6,
    minHeight: 44,
    paddingRight: 8,
  },
  button: {
    alignItems: "center",
    borderRadius: 28,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    height: 56,
    justifyContent: "center",
    width: "100%",
  },
  codeCell: {
    alignItems: "center",
    borderRadius: 16,
    borderWidth: 1.5,
    flex: 1,
    height: 58,
    justifyContent: "center",
  },
  error: {
    backgroundColor: AUTH_COLORS.dangerSurface,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  field: {
    alignItems: "center",
    borderRadius: 18,
    borderWidth: 1.5,
    flexDirection: "row",
    height: 56,
  },
  fieldIcon: {
    alignItems: "center",
    height: 44,
    justifyContent: "center",
    marginRight: 6,
    width: 44,
  },
  fieldInput: {
    color: AUTH_COLORS.text,
    flex: 1,
    fontSize: 16,
    height: "100%",
    outlineStyle: "none",
    paddingHorizontal: 18,
  } as TextStyle,
  hiddenInput: {
    height: 1,
    opacity: 0,
    outlineStyle: "none",
    position: "absolute",
    width: 1,
  } as TextStyle,
  link: {
    alignItems: "center",
    minHeight: 44,
    justifyContent: "center",
  },
  segment: {
    alignItems: "center",
    borderRadius: 14,
    flex: 1,
    justifyContent: "center",
  },
  segmentSelected: {
    backgroundColor: "#FFFFFF",
    elevation: 1,
    shadowColor: "#000000",
    shadowOffset: { height: 1, width: 0 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  segmented: {
    backgroundColor: AUTH_COLORS.field,
    borderRadius: 18,
    flexDirection: "row",
    height: 56,
    padding: 4,
  },
});
