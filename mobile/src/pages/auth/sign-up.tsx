import { useState } from "react";
import { View } from "react-native";
import { router } from "expo-router";

import type { UserGender } from "@/entities/user";
import { useSignUp } from "@/features/auth/sign-up";
import SignUpIllustration from "../../../assets/illustarations/sign-up.jpg";

import { AuthButton, AuthError, AuthField, AuthLink, AuthSegmented, AuthShell } from "./ui/auth-kit";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD = 8;

const genderOptions: { label: string; value: UserGender }[] = [
  { label: "Male", value: "male" },
  { label: "Female", value: "female" },
  { label: "Other", value: "other" },
];

export function SignUpPage() {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [age, setAge] = useState("");
  const [password, setPassword] = useState("");
  const [gender, setGender] = useState<UserGender>("other");
  const signUp = useSignUp();

  const ageNumber = Number.parseInt(age, 10);
  const isValid =
    EMAIL_PATTERN.test(email.trim()) &&
    phone.trim().length >= 6 &&
    !!firstName.trim() &&
    !!lastName.trim() &&
    ageNumber > 0 &&
    ageNumber < 120 &&
    password.length >= MIN_PASSWORD;

  const submit = () => {
    if (!isValid) return;
    signUp.mutate(
      {
        age: ageNumber,
        email: email.trim(),
        first_name: firstName.trim(),
        gender,
        last_name: lastName.trim(),
        password,
        phone: phone.trim(),
      },
      { onSuccess: () => router.replace("/(onboarding)/profile") },
    );
  };

  return (
    <AuthShell
      footer={
        <AuthLink action="Log in" onPress={() => router.replace("/(auth)/sign-in")} prompt="Already have an account?" />
      }
      illustration={SignUpIllustration}
      subtitle="A few basics, then we'll set up your sound."
      title="Join the crew"
    >
      <View style={{ flexDirection: "row", gap: 12 }}>
        <AuthField
          autoComplete="given-name"
          label="First name"
          onChangeText={setFirstName}
          placeholder="Alex"
          textContentType="givenName"
          value={firstName}
        />
        <AuthField
          autoComplete="family-name"
          label="Last name"
          onChangeText={setLastName}
          placeholder="Rivera"
          textContentType="familyName"
          value={lastName}
        />
      </View>
      <AuthField
        autoCapitalize="none"
        autoComplete="email"
        autoCorrect={false}
        keyboardType="email-address"
        label="Email"
        onChangeText={setEmail}
        placeholder="you@example.com"
        textContentType="emailAddress"
        value={email}
      />
      <View style={{ flexDirection: "row", gap: 12 }}>
        <View style={{ flex: 2, flexDirection: "row" }}>
          <AuthField
            autoComplete="tel"
            keyboardType="phone-pad"
            label="Phone"
            onChangeText={setPhone}
            placeholder="+1 555 000 0000"
            textContentType="telephoneNumber"
            value={phone}
          />
        </View>
        <View style={{ flex: 1, flexDirection: "row" }}>
          <AuthField
            keyboardType="number-pad"
            label="Age"
            maxLength={3}
            onChangeText={(value) => setAge(value.replace(/\D/g, ""))}
            placeholder="21"
            value={age}
          />
        </View>
      </View>
      <AuthSegmented label="Gender" onChange={setGender} options={genderOptions} value={gender} />
      <AuthField
        autoComplete="new-password"
        label={`Password · at least ${MIN_PASSWORD} characters`}
        onChangeText={setPassword}
        onSubmitEditing={submit}
        placeholder="••••••••"
        returnKeyType="go"
        secureTextEntry
        textContentType="newPassword"
        value={password}
      />
      <AuthError>
        {signUp.isError ? "We couldn't create your account. This email or phone may already be in use." : null}
      </AuthError>
      <View style={{ marginTop: 6 }}>
        <AuthButton disabled={!isValid} loading={signUp.isPending} onPress={submit}>
          {signUp.isPending ? "Creating account" : "Create account"}
        </AuthButton>
      </View>
    </AuthShell>
  );
}
