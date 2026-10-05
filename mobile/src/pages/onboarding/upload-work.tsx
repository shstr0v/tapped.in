import { router } from "expo-router";

import { useUploadFeaturedWork } from "@/features/uploads/upload-featured-work";

import { useOnboardingDraft } from "./model/draft-store";
import { Field, FormError, OnboardingShell, Section } from "./ui/onboarding-kit";

const URL_PATTERN = /^https?:\/\/\S+\.\S+/i;

export function UploadWorkPage() {
  const draft = useOnboardingDraft();
  const upload = useUploadFeaturedWork();

  const audioUrl = draft.audioUrl.trim();
  const urlError = audioUrl && !URL_PATTERN.test(audioUrl) ? "Paste a full link starting with https://" : null;
  const canContinue = !!draft.title.trim() && !!audioUrl && !urlError;

  const finish = () => {
    draft.reset();
    router.replace("/(tabs)/feed");
  };

  const submit = () => {
    if (!canContinue) return;
    upload.mutate({ audio_url: audioUrl, tags: [], title: draft.title.trim() }, { onSuccess: finish });
  };

  return (
    <OnboardingShell
      continueDisabled={!canContinue}
      continueLabel="Finish"
      loading={upload.isPending}
      onContinue={submit}
      secondary={{ label: "Skip for now", onPress: finish }}
      step={2}
      subtitle="Pin one track or beat so people can hear you first."
      title="Show your best work"
    >
      <Section label="Title">
        <Field
          maxLength={80}
          onChangeText={(title) => draft.set({ title })}
          placeholder="Track or beat name"
          returnKeyType="next"
          value={draft.title}
        />
      </Section>

      <Section error={urlError} label="Audio link">
        <Field
          autoCapitalize="none"
          autoCorrect={false}
          error={!!urlError}
          inputMode="url"
          keyboardType="url"
          onChangeText={(value) => draft.set({ audioUrl: value })}
          placeholder="https://soundcloud.com/…"
          textContentType="URL"
          value={draft.audioUrl}
        />
      </Section>

      <FormError>{upload.isError ? "We couldn't save this track. Check the link and try again." : null}</FormError>
    </OnboardingShell>
  );
}
