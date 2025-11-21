import { SessionCrypto } from "@/utils/sessionCrypto";

const STORAGE_KEY = "lucentag_autologin";

interface StoredSession {
  userId: string;
  email: string;
  userType: "farmer" | "buyer";
  token: string;
  timestamp: number;
}

export function storeSession(session: Omit<StoredSession, "timestamp">): void {
  try {
    const data: StoredSession = {
      ...session,
      timestamp: Date.now(),
    };

    const encrypted = SessionCrypto.encryptSessionData(data);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(encrypted));
  } catch (error) {
    console.error("Error storing session:", error);
  }
}

export function retrieveSession(): StoredSession | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    const encrypted = JSON.parse(stored);
    const session = SessionCrypto.decryptSessionData(encrypted) as StoredSession;

    if (!session) return null;

    const eightHours = 8 * 60 * 60 * 1000;
    if (Date.now() - session.timestamp > eightHours) {
      clearSession();
      return null;
    }

    return session;
  } catch (error) {
    console.error("Error retrieving session:", error);
    return null;
  }
}

export function clearSession(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function updateSessionTimestamp(): void {
  const session = retrieveSession();
  if (session) {
    storeSession({
      userId: session.userId,
      email: session.email,
      userType: session.userType,
      token: session.token,
    });
  }
}
