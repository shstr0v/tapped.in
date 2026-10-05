import { useState } from "react";
import { router } from "expo-router";

import { Text } from "@/components/ui";
import { useRequestEmailCode, useVerifyEmailCode } from "@/features/auth/sign-in";
import LoginIllustration from "../../../assets/illustarations/login.jpg";

import { AUTH_COLORS, AuthButton, AuthError, AuthField, AuthLink, AuthShell, CodeInput } from "./ui/auth-kit";

const CODE_LENGTH = 6;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function SignInPage() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"email" | "code">("email");
  const requestCode = useRequestEmailCode();
  const verifyCode = useVerifyEmailCode();

  const trimmedEmail = email.trim();
  const emailValid = EMAIL_PATTERN.test(trimmedEmail);

  const sendCode = () => {
    verifyCode.reset();
    requestCode.mutate(
      { email: trimmedEmail },
      {
        onSuccess: () => {
          setCode("");
          setStep("code");
        },
      },
    );
  };

  const verify = (value = code) => {
    if (value.length !== CODE_LENGTH || verifyCode.isPending) {
      return;
    }
    verifyCode.mutate(
      { code: value, email: trimmedEmail },
      {
        onSuccess: ({ user }) =>
          router.replace(user.onboarding_status === "required" ? "/(onboarding)/profile" : "/(tabs)/feed"),
      },
    );
  };

  const backToEmail = () => {
    verifyCode.reset();
    setCode("");
    setStep("email");
  };

  if (step === "code") {
    return (
      <AuthShell
        illustration={LoginIllustration}
        onBack={backToEmail}
        subtitle={`We sent a ${CODE_LENGTH}-digit code to ${trimmedEmail}`}
        title="Check your inbox"
      >
        <CodeInput
          error={verifyCode.isError}
          length={CODE_LENGTH}
          onChange={(value) => {
            if (verifyCode.isError) verifyCode.reset();
            setCode(value);
          }}
          onComplete={verify}
          value={code}
        />
        <AuthError>{verifyCode.isError ? "That code didn't work. Check it or request a new one." : null}</AuthError>
        <AuthButton
          disabled={code.length !== CODE_LENGTH}
          loading={verifyCode.isPending}
          onPress={() => verify()}
        >
          {verifyCode.isPending ? "Logging in" : "Log in"}
        </AuthButton>
        <AuthLink
          action={requestCode.isPending ? "Sending…" : "Resend code"}
          onPress={() => !requestCode.isPending && sendCode()}
          prompt="Didn't get it?"
        />
        <AuthError>{requestCode.isError ? "Couldn't resend the code. Try again in a moment." : null}</AuthError>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      footer={<AuthLink action="Sign up" onPress={() => router.replace("/(auth)/sign-up")} prompt="New here?" />}
      illustration={LoginIllustration}
      subtitle="Enter your email and we'll send you a login code."
      title="Welcome back"
    >
      <AuthField
        autoCapitalize="none"
        autoComplete="email"
        autoCorrect={false}
        autoFocus
        error={requestCode.isError}
        inputMode="email"
        keyboardType="email-address"
        label="Email"
        onChangeText={(value) => {
          if (requestCode.isError) requestCode.reset();
          setEmail(value);
        }}
        onSubmitEditing={() => emailValid && sendCode()}
        placeholder="you@example.com"
        returnKeyType="send"
        textContentType="emailAddress"
        value={email}
      />
      <AuthError>{requestCode.isError ? "We couldn't send a code to this email. Try again." : null}</AuthError>
      <AuthButton disabled={!emailValid} loading={requestCode.isPending} onPress={sendCode}>
        {requestCode.isPending ? "Sending code" : "Continue"}
      </AuthButton>
      <Text className="text-center font-medium" style={{ color: AUTH_COLORS.subtle, fontSize: 12, lineHeight: 17 }}>
        No passwords. We'll email you a one-time code.
      </Text>
    </AuthShell>
  );
}
