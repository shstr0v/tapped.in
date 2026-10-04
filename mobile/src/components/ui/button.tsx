import { type ReactNode } from "react";
import { Pressable, type PressableProps } from "react-native";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/shared/lib/cn";

import { Text } from "./text";

const buttonVariants = cva(
  "min-h-12 flex-row items-center justify-center gap-2 rounded-lg px-4",
  {
    defaultVariants: {
      size: "md",
      variant: "primary",
    },
    variants: {
      size: {
        icon: "h-12 w-12 px-0",
        md: "h-12",
        sm: "h-10 px-3",
      },
      variant: {
        destructive: "bg-destructive",
        ghost: "bg-transparent",
        outline: "border border-border bg-card",
        primary: "bg-primary",
        secondary: "bg-muted",
      },
    },
  },
);

const textVariants = {
  destructive: "text-white",
  ghost: "text-foreground",
  outline: "text-foreground",
  primary: "text-primary-foreground",
  secondary: "text-foreground",
} as const;

type ButtonProps = PressableProps &
  VariantProps<typeof buttonVariants> & {
    children: ReactNode;
    className?: string;
    textClassName?: string;
  };

export function Button({
  children,
  className,
  disabled,
  size,
  textClassName,
  variant = "primary",
  ...props
}: ButtonProps) {
  const resolvedVariant = variant ?? "primary";

  return (
    <Pressable
      accessibilityRole="button"
      className={cn(buttonVariants({ size, variant: resolvedVariant }), disabled && "opacity-50", className)}
      disabled={disabled}
      {...props}
    >
      {typeof children === "string" ? (
        <Text className={cn("font-semibold", textVariants[resolvedVariant], textClassName)}>
          {children}
        </Text>
      ) : (
        children
      )}
    </Pressable>
  );
}
