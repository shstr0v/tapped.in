import { useState } from "react";
import { router } from "expo-router";

import { Screen } from "@/components/layout/screen";
import { Button, Card, Chip, Input, Text } from "@/components/ui";
import type { UserGender } from "@/entities/user";
import { useSignUp } from "@/features/auth/sign-up";

const genders: UserGender[] = ["male", "female", "other"];

export function SignUpPage() {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [gender, setGender] = useState<UserGender>("other");
  const signUp = useSignUp();

  const submit = () => {
    signUp.mutate(
      {
        age: 18,
        email,
        first_name: firstName,
        gender,
        last_name: lastName,
        password,
        phone,
      },
      {
        onSuccess: () => router.replace("/(onboarding)/profile"),
      },
    );
  };

  return (
    <Screen>
      <Text variant="heading">Create your music identity</Text>
      <Text variant="muted">Start with the account fields required by the current backend.</Text>

      <Card className="gap-4">
        <Input autoCapitalize="none" keyboardType="email-address" onChangeText={setEmail} placeholder="Email" />
        <Input keyboardType="phone-pad" onChangeText={setPhone} placeholder="Phone" />
        <Input onChangeText={setFirstName} placeholder="First name" />
        <Input onChangeText={setLastName} placeholder="Last name" />
        <Input onChangeText={setPassword} placeholder="Password" secureTextEntry />
        <Text variant="label">Gender</Text>
        <Card className="flex-row gap-2 border-0 bg-transparent p-0 shadow-none">
          {genders.map((item) => (
            <Chip key={item} label={item} onPress={() => setGender(item)} selected={gender === item} />
          ))}
        </Card>
        {signUp.isError ? (
          <Text className="text-destructive" variant="muted">
            Could not create account with these details.
          </Text>
        ) : null}
        <Button
          disabled={signUp.isPending || !email || !phone || !firstName || !lastName || !password}
          onPress={submit}
        >
          {signUp.isPending ? "Creating" : "Create account"}
        </Button>
      </Card>
    </Screen>
  );
}
