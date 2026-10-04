import { type ReactNode, useEffect } from "react";

import { clearSessionSid, getSessionSid, setSessionSid, useSession } from "@/entities/session";
import {
  setSessionClearer,
  setSessionSidResolver,
  setSessionSidWriter,
} from "@/shared/api";

type SessionProviderProps = {
  children: ReactNode;
};

export function SessionProvider({ children }: SessionProviderProps) {
  const setHydrated = useSession((state) => state.setHydrated);
  const setSid = useSession((state) => state.setSid);

  useEffect(() => {
    setSessionSidResolver(getSessionSid);
    setSessionSidWriter(async (sid) => {
      await setSessionSid(sid);
      setSid(sid);
    });
    setSessionClearer(async () => {
      await clearSessionSid();
      setSid(null);
    });

    let isMounted = true;

    getSessionSid()
      .then((sid) => {
        if (isMounted) {
          setSid(sid);
        }
      })
      .finally(() => {
        if (isMounted) {
          setHydrated(true);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [setHydrated, setSid]);

  return children;
}
