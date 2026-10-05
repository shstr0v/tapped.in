type SessionSidResolver = () => Promise<string | null> | string | null;
type SessionSidWriter = (sid: string) => Promise<void> | void;
type SessionClearer = () => Promise<void> | void;

let sessionSidResolver: SessionSidResolver | null = null;
let sessionSidWriter: SessionSidWriter | null = null;
let sessionClearer: SessionClearer | null = null;

export function setSessionSidResolver(resolver: SessionSidResolver) {
  sessionSidResolver = resolver;
}

export function setSessionSidWriter(writer: SessionSidWriter) {
  sessionSidWriter = writer;
}

export function setSessionClearer(clearer: SessionClearer) {
  sessionClearer = clearer;
}

export function clearApiSessionHandlers() {
  sessionSidResolver = null;
  sessionSidWriter = null;
  sessionClearer = null;
}

export async function resolveSessionSid() {
  return (await sessionSidResolver?.()) ?? null;
}

export async function persistSessionSid(sid: string) {
  await sessionSidWriter?.(sid);
}

export async function clearPersistedSession() {
  await sessionClearer?.();
}
