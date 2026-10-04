import { create } from "zustand";

type SessionState = {
  isHydrated: boolean;
  setHydrated: (isHydrated: boolean) => void;
  setSid: (sid: string | null) => void;
  sid: string | null;
};

export const useSession = create<SessionState>((set) => ({
  isHydrated: false,
  setHydrated: (isHydrated) => set({ isHydrated }),
  setSid: (sid) => set({ sid }),
  sid: null,
}));
