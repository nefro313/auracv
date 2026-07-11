import { UserMetaData, UserProfile } from "@/lib/user.types";

/**
 * Local autosave for the studio editor.
 *
 * The editor's working state lives only in React memory, so a reload, a tab
 * crash, or an unreliable mobile `beforeunload` would drop any edits made since
 * the last explicit Save. We mirror the in-progress portfolio to `localStorage`
 * (debounced by the caller) and restore it on load, so unsaved work survives.
 *
 * Keyed per user id so two accounts on one browser never see each other's draft.
 */
export interface StudioDraft {
  resumeJson: UserProfile;
  metaJson: UserMetaData;
  /** ISO timestamp of the last autosave — handy for messaging/debugging. */
  savedAt: string;
}

const PREFIX = "auracv:studio-draft:";
const keyFor = (userId: string) => `${PREFIX}${userId}`;

export function loadDraft(userId: string): StudioDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(keyFor(userId));
    return raw ? (JSON.parse(raw) as StudioDraft) : null;
  } catch {
    // Corrupt JSON or storage disabled — treat as "no draft".
    return null;
  }
}

export function saveDraft(userId: string, draft: StudioDraft): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(keyFor(userId), JSON.stringify(draft));
  } catch {
    // Quota exceeded / private-mode restrictions — autosave is best-effort.
  }
}

export function clearDraft(userId: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(keyFor(userId));
  } catch {
    // Ignore — nothing we can do, and it's not worth surfacing.
  }
}
