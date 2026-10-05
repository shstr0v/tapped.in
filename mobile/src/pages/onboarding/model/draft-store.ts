import { create } from "zustand";

import type {
  CollaborationStatus,
  ExperienceLevel,
  MusicProfileRole,
} from "@/entities/music-profile";

type OnboardingDraft = {
  artistName: string;
  audioUrl: string;
  bio: string;
  bpmMax: string;
  bpmMin: string;
  collaboration: CollaborationStatus;
  genres: string[];
  influences: string;
  level: ExperienceLevel;
  location: string;
  moods: string[];
  role: MusicProfileRole;
  title: string;
  typeBeats: string[];
};

type OnboardingDraftState = OnboardingDraft & {
  reset: () => void;
  set: (patch: Partial<OnboardingDraft>) => void;
};

const initialDraft: OnboardingDraft = {
  artistName: "",
  audioUrl: "",
  bio: "",
  bpmMax: "",
  bpmMin: "",
  collaboration: "open",
  genres: [],
  influences: "",
  level: "beginner",
  location: "",
  moods: [],
  role: "artist",
  title: "",
  typeBeats: [],
};

export const useOnboardingDraft = create<OnboardingDraftState>((set) => ({
  ...initialDraft,
  reset: () => set(initialDraft),
  set: (patch) => set(patch),
}));
