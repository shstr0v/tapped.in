import { router } from "expo-router";

import type {
  CollaborationStatus,
  ExperienceLevel,
  MusicProfileRole,
} from "@/entities/music-profile";
import { useCompleteProfile } from "@/features/profile/complete-profile";

import { useOnboardingDraft } from "./model/draft-store";
import { ChipGroup, Field, FormError, OnboardingShell, Section } from "./ui/onboarding-kit";

const BIO_LIMIT = 160;

const roleOptions: { label: string; value: MusicProfileRole }[] = [
  { label: "Artist", value: "artist" },
  { label: "Producer", value: "producer" },
];

const levelOptions: { label: string; value: ExperienceLevel }[] = [
  { label: "Beginner", value: "beginner" },
  { label: "Intermediate", value: "intermediate" },
  { label: "Advanced", value: "advanced" },
  { label: "Pro", value: "pro" },
];

const collaborationOptions: { label: string; value: CollaborationStatus }[] = [
  { label: "Open to anything", value: "open" },
  { label: "Looking for artists", value: "looking_for_artists" },
  { label: "Looking for producers", value: "looking_for_producers" },
  { label: "Not right now", value: "closed" },
];

export function OnboardingProfilePage() {
  const draft = useOnboardingDraft();
  const completeProfile = useCompleteProfile();

  const name = draft.artistName.trim();
  const canContinue = name.length >= 2;

  const submit = () => {
    if (!canContinue) return;
    completeProfile.mutate(
      {
        artist_name: name,
        bio: draft.bio.trim() || null,
        collaboration_status: draft.collaboration,
        experience_level: draft.level,
        location: draft.location.trim() || null,
        role: draft.role,
        socials: [],
      },
      { onSuccess: () => router.push("/(onboarding)/music") },
    );
  };

  return (
    <OnboardingShell
      continueDisabled={!canContinue}
      hint={canContinue ? null : "Add your artist name to continue"}
      loading={completeProfile.isPending}
      onContinue={submit}
      step={0}
      subtitle="This is how other artists and producers will find you."
      title="Set up your profile"
    >
      <Section label="Artist name">
        <Field
          autoCapitalize="words"
          autoCorrect={false}
          autoFocus
          maxLength={40}
          onChangeText={(artistName) => draft.set({ artistName })}
          placeholder="e.g. Lil Cloud"
          returnKeyType="next"
          textContentType="nickname"
          value={draft.artistName}
        />
      </Section>

      <Section hint="Optional" label="Location">
        <Field
          autoCapitalize="words"
          onChangeText={(location) => draft.set({ location })}
          placeholder="City, country"
          returnKeyType="next"
          textContentType="addressCity"
          value={draft.location}
        />
      </Section>

      <Section hint={`${draft.bio.length}/${BIO_LIMIT}`} label="Bio">
        <Field
          maxLength={BIO_LIMIT}
          multiline
          onChangeText={(bio) => draft.set({ bio })}
          placeholder="Your sound in a sentence or two"
          value={draft.bio}
        />
      </Section>

      <Section hint="Choose one" label="I'm mainly an">
        <ChipGroup onChange={(role) => draft.set({ role })} options={roleOptions} value={draft.role} />
      </Section>

      <Section hint="Choose one" label="Experience">
        <ChipGroup onChange={(level) => draft.set({ level })} options={levelOptions} value={draft.level} />
      </Section>

      <Section hint="Choose one" label="Collaboration">
        <ChipGroup
          onChange={(collaboration) => draft.set({ collaboration })}
          options={collaborationOptions}
          value={draft.collaboration}
        />
      </Section>

      <FormError>{completeProfile.isError ? "We couldn't save your profile. Try again." : null}</FormError>
    </OnboardingShell>
  );
}
