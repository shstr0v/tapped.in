import { View } from "react-native";
import { router } from "expo-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { MusicIdentityRequest } from "@/entities/music-profile";
import { profilesApi } from "@/shared/api";

import { useOnboardingDraft } from "./model/draft-store";
import { ChipGroup, Field, FormError, OnboardingShell, Section, toOptions } from "./ui/onboarding-kit";

const GENRES = ["Trap", "Rage", "Hyperpop", "R&B", "Drill", "Melodic", "Boom Bap", "Pop", "Afrobeats", "Lo-fi"];
const MOODS = ["Dark", "Chill", "Energetic", "Sad", "Hype", "Romantic", "Aggressive", "Dreamy"];
const TYPE_BEATS = ["Travis Scott", "Playboi Carti", "Drake", "Future", "Lil Uzi Vert", "The Weeknd", "Ken Carson"];

export function OnboardingMusicPage() {
  const draft = useOnboardingDraft();
  const queryClient = useQueryClient();

  const saveIdentity = useMutation({
    mutationFn: (identity: MusicIdentityRequest) => profilesApi.updateMe({ identity }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["profiles", "me"] });
    },
  });

  const bpmMin = draft.bpmMin ? Number.parseInt(draft.bpmMin, 10) : null;
  const bpmMax = draft.bpmMax ? Number.parseInt(draft.bpmMax, 10) : null;
  const bpmError =
    (bpmMin !== null && (bpmMin < 40 || bpmMin > 250)) || (bpmMax !== null && (bpmMax < 40 || bpmMax > 250))
      ? "BPM should be between 40 and 250"
      : bpmMin !== null && bpmMax !== null && bpmMin > bpmMax
        ? "Min BPM can't be higher than max"
        : null;
  const canContinue = draft.genres.length > 0 && !bpmError;

  const submit = () => {
    if (!canContinue) return;
    saveIdentity.mutate(
      {
        bpm_max: bpmMax,
        bpm_min: bpmMin,
        genres: draft.genres,
        influences: draft.influences
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        moods: draft.moods,
        type_beats: draft.typeBeats,
      },
      { onSuccess: () => router.push("/(onboarding)/upload") },
    );
  };

  return (
    <OnboardingShell
      continueDisabled={!canContinue}
      hint={draft.genres.length === 0 ? "Pick at least one genre" : null}
      loading={saveIdentity.isPending}
      onContinue={submit}
      secondary={{ label: "Skip for now", onPress: () => router.push("/(onboarding)/upload") }}
      step={1}
      subtitle="We use this to match you with people who share your vibe."
      title="What's your sound?"
    >
      <Section hint="Choose any" label="Genres">
        <ChipGroup multi onChange={(genres) => draft.set({ genres })} options={toOptions(GENRES)} value={draft.genres} />
      </Section>

      <Section hint="Choose any" label="Moods">
        <ChipGroup multi onChange={(moods) => draft.set({ moods })} options={toOptions(MOODS)} value={draft.moods} />
      </Section>

      <Section hint="Choose any" label="Type beats">
        <ChipGroup
          multi
          onChange={(typeBeats) => draft.set({ typeBeats })}
          options={toOptions(TYPE_BEATS)}
          value={draft.typeBeats}
        />
      </Section>

      <Section hint="Comma separated" label="Influences">
        <Field
          autoCapitalize="words"
          onChangeText={(influences) => draft.set({ influences })}
          placeholder="Kanye, Metro Boomin"
          value={draft.influences}
        />
      </Section>

      <Section error={bpmError} hint="Optional" label="BPM range">
        <View style={{ flexDirection: "row", gap: 8 }}>
          <View style={{ flex: 1 }}>
            <Field
              error={!!bpmError}
              keyboardType="number-pad"
              maxLength={3}
              onChangeText={(value) => draft.set({ bpmMin: value.replace(/\D/g, "") })}
              placeholder="Min"
              value={draft.bpmMin}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Field
              error={!!bpmError}
              keyboardType="number-pad"
              maxLength={3}
              onChangeText={(value) => draft.set({ bpmMax: value.replace(/\D/g, "") })}
              placeholder="Max"
              value={draft.bpmMax}
            />
          </View>
        </View>
      </Section>

      <FormError>{saveIdentity.isError ? "We couldn't save your sound. Try again." : null}</FormError>
    </OnboardingShell>
  );
}
