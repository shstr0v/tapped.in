import { useState } from "react";
import { Link, router } from "expo-router";

import { Screen } from "@/components/layout/screen";
import { Button, Card, Input, Text } from "@/components/ui";
import { useEmailSignIn } from "@/features/auth/sign-in";
import { BRAND_NAME, BRAND_TAGLINE } from "@/shared/constants/brand";

export function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const signIn = useEmailSignIn();

  const submit = () => {
    signIn.mutate(
      { email, password },
      {
        onSuccess: () => router.replace("/(tabs)/feed"),
      },
    );
  };

  return (
    <Screen className="justify-center" scroll={false}>
      <Text variant="title">{BRAND_NAME}</Text>
      <Text variant="muted">{BRAND_TAGLINE}</Text>

      <Card className="gap-4">
        <Input
          autoCapitalize="none"
          keyboardType="email-address"
          onChangeText={setEmail}
          placeholder="Email"
          value={email}
        />
        <Input onChangeText={setPassword} placeholder="Password" secureTextEntry value={password} />
        {signIn.isError ? (
          <Text className="text-destructive" variant="muted">
            Could not sign in. Check your credentials and try again.
          </Text>
        ) : null}
        <Button disabled={signIn.isPending || !email || !password} onPress={submit}>
          {signIn.isPending ? "Signing in" : "Sign in"}
        </Button>
      </Card>

      <Link asChild href="/(auth)/sign-up">
        <Button variant="ghost">Create account</Button>
      </Link>
    </Screen>
  );
}
