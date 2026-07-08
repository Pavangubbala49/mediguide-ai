export interface UserSession {
  email: string;
  name: string;
  role: 'patient' | 'doctor' | 'nurse' | 'researcher';
  token: string;
  isFirebase?: boolean;
}

// Get persisted user session from localStorage
export function getLocalUserSession(): UserSession | null {
  const data = localStorage.getItem('mediguide_user');
  if (data) {
    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  }
  return null;
}

// Save user session to localStorage
export function saveLocalUserSession(session: UserSession | null) {
  if (session) {
    localStorage.setItem('mediguide_user', JSON.stringify(session));
  } else {
    localStorage.removeItem('mediguide_user');
  }
}
