import { useEffect, useState } from "react";
import { Image, View } from "react-native";

import FallbackAvatar from "../../../assets/illustarations/avatar-fallback.jpg";

type AvatarProps = {
  name?: string | null;
  size: number;
  uri?: string | null;
};

export function Avatar({ size, uri }: AvatarProps) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [uri]);

  const showPhoto = Boolean(uri) && !failed;

  return (
    <View
      style={{
        backgroundColor: "#EAF6FC",
        borderRadius: size / 2,
        height: size,
        overflow: "hidden",
        width: size,
      }}
    >
      <Image
        accessibilityIgnoresInvertColors
        onError={showPhoto ? () => setFailed(true) : undefined}
        resizeMode="cover"
        source={showPhoto ? { uri: uri ?? "" } : FallbackAvatar}
        style={{ height: size, width: size }}
      />
    </View>
  );
}
