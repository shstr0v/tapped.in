import { type ComponentProps } from "react";
import { Tabs } from "expo-router";

import { AppTabBar } from "./tab-bar";

type TabBarProps = ComponentProps<typeof AppTabBar>;

const hidden = {
  href: null,
  tabBarStyle: { display: "none" as const },
};

export function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: "#FFFFFF" },
      }}
      tabBar={(props) => <AppTabBar {...(props as unknown as TabBarProps)} />}
    >
      <Tabs.Screen name="index" options={hidden} />
      <Tabs.Screen name="feed" options={{ title: "Home" }} />
      <Tabs.Screen name="chats" options={{ title: "Chats" }} />
      <Tabs.Screen name="chat/[id]" options={hidden} />
      <Tabs.Screen name="notifications" options={hidden} />
      <Tabs.Screen name="my-profile" options={hidden} />
      <Tabs.Screen name="connections" options={hidden} />
      <Tabs.Screen name="edit-profile" options={hidden} />
      <Tabs.Screen name="upload-beat" options={hidden} />
    </Tabs>
  );
}
