const IMPERSONATION_KEY = 'communityhub.impersonation';

export type ImpersonationState = {
  userId: string;
  tenantId: string | null;
  startedAt: string;
};

export function setImpersonation(state: ImpersonationState) {
  localStorage.setItem(IMPERSONATION_KEY, JSON.stringify(state));
}

export function getImpersonation(): ImpersonationState | null {
  const raw = localStorage.getItem(IMPERSONATION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as ImpersonationState;
  } catch {
    return null;
  }
}

export function clearImpersonation() {
  localStorage.removeItem(IMPERSONATION_KEY);
}
