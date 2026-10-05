import { Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Text } from "@/components/ui";
import HomeIcon from "../../../assets/icons/Home.svg";
import MessagesIcon from "../../../assets/icons/messages.svg";

export const TAB_BAR_BODY_HEIGHT = 52;

const ACTIVE = "#111111";
const INACTIVE = "#6F6F6F";

const TABS = [
  { Icon: HomeIcon, label: "Home", name: "feed" },
  { Icon: MessagesIcon, label: "Chats", name: "chats" },
] as const;

const HIDDEN_ROUTES = new Set([
  "index",
  "notifications",
  "my-profile",
  "connections",
  "edit-profile",
  "upload-beat",
  "chat/[id]",
]);

type TabBarProps = {
  descriptors: Record<string, { options: { tabBarStyle?: { display?: string } | null } }>;
  navigation: {
    emit: (event: { canPreventDefault: boolean; target: string; type: "tabPress" }) => {
      defaultPrevented: boolean;
    };
    navigate: (name: string) => void;
  };
  state: {
    index: number;
    routes: { key: string; name: string }[];
  };
};

export function AppTabBar({ descriptors, navigation, state }: TabBarProps) {
  const insets = useSafeAreaInsets();
  const focused = state.routes[state.index];
  const focusedStyle = descriptors[focused?.key ?? ""]?.options.tabBarStyle;
  const hiddenByStyle =
    focusedStyle != null &&
    typeof focusedStyle === "object" &&
    !Array.isArray(focusedStyle) &&
    "display" in focusedStyle &&
    focusedStyle.display === "none";

  if (!focused || hiddenByStyle || HIDDEN_ROUTES.has(focused.name)) {
    return null;
  }

  return (
    <View
      style={{
        backgroundColor: "#FFFFFF",
        borderTopColor: "#ECECEC",
        borderTopWidth: 1,
        flexDirection: "row",
        paddingBottom: Math.max(insets.bottom, 8),
        paddingTop: 6,
      }}
    >
      {TABS.map((tab) => {
        const route = state.routes.find((item) => item.name === tab.name);
        const selected = focused.name === tab.name;
        const color = selected ? ACTIVE : INACTIVE;

        return (
          <Pressable
            accessibilityLabel={tab.label}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            key={tab.name}
            onPress={() => {
              if (!route) {
                return;
              }
              const event = navigation.emit({
                canPreventDefault: true,
                target: route.key,
                type: "tabPress",
              });
              if (!selected && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            }}
            style={({ pressed }) => ({
              alignItems: "center",
              flex: 1,
              gap: 2,
              justifyContent: "center",
              minHeight: TAB_BAR_BODY_HEIGHT - 6,
              opacity: pressed ? 0.7 : 1,
              transform: [{ scale: pressed ? 0.97 : 1 }],
            })}
          >
            <tab.Icon color={color} height={26} width={26} />
            <Text
              style={{
                color,
                fontSize: 12,
                fontWeight: selected ? "600" : "500",
                lineHeight: 16,
              }}
            >
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
