import { Text as RNText, type TextProps as RNTextProps } from "react-native";

import { cn } from "@/shared/lib/cn";

type TextVariant = "body" | "caption" | "heading" | "label" | "muted" | "title";

type TextProps = RNTextProps & {
  className?: string;
  variant?: TextVariant;
};

const variants: Record<TextVariant, string> = {
  body: "text-base text-foreground",
  caption: "text-xs text-muted-foreground",
  heading: "text-2xl font-semibold text-foreground",
  label: "text-sm font-medium text-foreground",
  muted: "text-sm text-muted-foreground",
  title: "text-4xl font-bold text-foreground",
};

export function Text({ className, variant = "body", ...props }: TextProps) {
  return <RNText className={cn(variants[variant], className)} {...props} />;
}
