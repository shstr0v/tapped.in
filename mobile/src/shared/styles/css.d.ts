declare module "*.css";

declare module "*.png" {
  const value: import("react-native").ImageSourcePropType;
  export default value;
}

declare module "*.svg" {
  import type { ComponentType } from "react";
  import type { SvgProps } from "react-native-svg";

  const content: ComponentType<SvgProps>;
  export default content;
}
