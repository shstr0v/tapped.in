import { useRouter } from "expo-router";
import { Image, Pressable, View, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Text } from "@/components/ui";
import ChevronIcon from "../../../assets/icons/chevron.svg";
import TodayAvatar from "../../../assets/rappers/image copy.png";
import YesterdayAvatar from "../../../assets/rappers/image copy 2.png";

const PAGE_PADDING = 16;
const MAX_CONTENT_WIDTH = 430;
const BODY_FONT_SIZE = 16;

type NotificationItem = {
  avatar: typeof TodayAvatar;
  id: string;
  isUnread: boolean;
  message: string;
};

const notificationGroups: { title: string; items: NotificationItem[] }[] = [
  {
    items: [
      {
        avatar: TodayAvatar,
        id: "today-request",
        isUnread: true,
        message: "You’ve received a request!",
      },
      {
        avatar: TodayAvatar,
        id: "today-accepted",
        isUnread: false,
        message: "222blank has accepted your request",
      },
    ],
    title: "Today",
  },
  {
    items: [
      {
        avatar: YesterdayAvatar,
        id: "yesterday-request",
        isUnread: true,
        message: "You’ve received a request!",
      },
      {
        avatar: YesterdayAvatar,
        id: "yesterday-accepted",
        isUnread: false,
        message: "222blank has accepted your request",
      },
    ],
    title: "Yesterday",
  },
];

function NotificationRow({ item }: { item: NotificationItem }) {
  return (
    <View
      className="flex-row items-center"
      style={{
        boxSizing: "border-box",
        backgroundColor: item.isUnread ? "#E6E6E6" : "#F7F8FA",
        borderRadius: 20,
        gap: 12,
        height: 56,
        alignSelf: "stretch",
        overflow: "hidden",
        width: "100%",
      }}
    >
      <Image
        accessibilityIgnoresInvertColors
        resizeMode="cover"
        source={item.avatar}
        style={{
          borderRadius: 18,
          height: 36,
          marginLeft: 14,
          width: 36,
        }}
      />

      <Text
        className="font-semibold"
        ellipsizeMode="tail"
        numberOfLines={1}
        style={{
          color: item.isUnread ? "#050505" : "#B2B2B2",
          flex: 1,
          flexShrink: 1,
          fontSize: BODY_FONT_SIZE,
          lineHeight: 20,
          marginRight: item.isUnread ? 0 : 14,
          minWidth: 0,
        }}
      >
        {item.message}
      </Text>

      {item.isUnread ? (
        <View
          accessibilityLabel="Unread"
          style={{
            backgroundColor: "#3478F6",
            borderRadius: 8,
            height: 16,
            marginRight: 14,
            width: 16,
          }}
        />
      ) : null}
    </View>
  );
}

export function NotificationsPage() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const contentWidth = Math.max(288, Math.min(MAX_CONTENT_WIDTH, width - PAGE_PADDING * 2 - 2));

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View
        className="flex-1 items-center"
        style={{
          paddingBottom: PAGE_PADDING,
          paddingHorizontal: PAGE_PADDING,
          paddingTop: 34,
        }}
      >
        <View style={{ width: contentWidth }}>
          <Pressable
            accessibilityLabel="Back"
            accessibilityRole="button"
            className="flex-row items-center self-start"
            onPress={() => router.replace("/(tabs)/feed")}
            style={({ pressed }) => ({
              minHeight: 32,
              transform: [{ scale: pressed ? 0.97 : 1 }],
            })}
          >
            <ChevronIcon height={20} width={20} />
            <Text
              className="font-semibold"
              style={{
                color: "#B2B2B2",
                fontSize: BODY_FONT_SIZE,
                lineHeight: 20,
              }}
            >
              Back
            </Text>
          </Pressable>

          <View style={{ gap: 28, paddingTop: 28 }}>
            {notificationGroups.map((group) => (
              <View key={group.title}>
                <Text
                  className="font-semibold"
                  style={{
                    color: "#B2B2B2",
                    fontSize: BODY_FONT_SIZE,
                    lineHeight: 20,
                    marginBottom: 12,
                  }}
                >
                  {group.title}
                </Text>

                <View style={{ gap: 12 }}>
                  {group.items.map((item) => (
                    <NotificationRow item={item} key={item.id} />
                  ))}
                </View>
              </View>
            ))}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
