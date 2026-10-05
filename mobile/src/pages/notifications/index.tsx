import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { Image, Pressable, View, useWindowDimensions, type ImageSourcePropType } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Text } from "@/components/ui";
import type { Notification } from "@/entities/notification";
import { notificationsApi } from "@/shared/api";
import ChevronIcon from "../../../assets/icons/chevron.svg";
import EmptyNotifications from "../../../assets/illustarations/notifications-empty.jpg";
import LogoSource from "../../../assets/logo.png";

const PAGE_PADDING = 16;
const MAX_CONTENT_WIDTH = 430;
const BODY_FONT_SIZE = 16;

type NotificationItem = {
  avatar: ImageSourcePropType;
  id: string;
  isUnread: boolean;
  message: string;
};

const GROUP_TITLES = ["Today", "Yesterday", "Earlier"] as const;

function messageFor(notification: Notification) {
  return notification.type === "connection_accepted"
    ? "Your connection request was accepted"
    : "You have new feedback";
}

function groupNotifications(notifications: Notification[]) {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);

  const groups = new Map<string, NotificationItem[]>();

  notifications.forEach((notification) => {
    const createdAt = new Date(notification.created_at);
    const title =
      createdAt >= startOfToday ? "Today" : createdAt >= startOfYesterday ? "Yesterday" : "Earlier";
    const items = groups.get(title) ?? [];
    items.push({
      avatar: LogoSource,
      id: notification.id,
      isUnread: !notification.is_read,
      message: messageFor(notification),
    });
    groups.set(title, items);
  });

  return GROUP_TITLES.filter((title) => groups.has(title)).map((title) => ({
    items: groups.get(title) ?? [],
    title,
  }));
}

function NotificationsEmpty() {
  return (
    <View style={{ alignItems: "center", flex: 1, justifyContent: "center", paddingBottom: 48 }}>
      <Image
        accessibilityIgnoresInvertColors
        resizeMode="contain"
        source={EmptyNotifications}
        style={{ height: 132, marginBottom: 16, width: 132 }}
      />
      <Text style={{ color: "#111111", fontSize: 22, fontWeight: "700", lineHeight: 27, textAlign: "center" }}>
        No new notifications
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
        You're all caught up. We'll let you know when something happens.
      </Text>
    </View>
  );
}

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
  const notifications = useQuery({
    queryFn: () => notificationsApi.list(),
    queryKey: ["notifications"],
  });
  const notificationGroups = groupNotifications(notifications.data ?? []);
  const isEmpty = notifications.isSuccess && notificationGroups.length === 0;

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
        <View style={{ flex: 1, width: contentWidth }}>
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

          {isEmpty ? (
            <NotificationsEmpty />
          ) : (
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
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}
