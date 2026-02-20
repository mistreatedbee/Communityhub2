export type MembershipRole = 'OWNER' | 'ADMIN' | 'MODERATOR' | 'MEMBER';
export type MembershipStatus = 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'BANNED';

export type MembershipLike = {
  tenantId: string;
  role: string;
  status: string;
};

export type NormalizedMembership = {
  tenantId: string;
  role: MembershipRole;
  status: MembershipStatus;
};

const rolePriority: Record<MembershipRole, number> = {
  MEMBER: 1,
  MODERATOR: 2,
  ADMIN: 3,
  OWNER: 4
};

export function normalizeMembershipRole(value: string): MembershipRole {
  const normalized = String(value || '').toUpperCase();
  if (normalized === 'OWNER' || normalized === 'ADMIN' || normalized === 'MODERATOR') {
    return normalized;
  }
  return 'MEMBER';
}

export function normalizeMembershipStatus(value: string): MembershipStatus {
  const normalized = String(value || '').toUpperCase();
  if (normalized === 'PENDING' || normalized === 'ACTIVE' || normalized === 'SUSPENDED' || normalized === 'BANNED') {
    return normalized;
  }
  return 'PENDING';
}

export function normalizeMemberships<T extends MembershipLike>(memberships: T[] | undefined | null): NormalizedMembership[] {
  return (memberships || []).map((m) => ({
    tenantId: m.tenantId,
    role: normalizeMembershipRole(m.role),
    status: normalizeMembershipStatus(m.status)
  }));
}

export function getEligibleMemberships(memberships: NormalizedMembership[]): NormalizedMembership[] {
  return memberships.filter((m) => m.status === 'ACTIVE' || m.status === 'PENDING');
}

export function isAdminLikeRole(role: MembershipRole): boolean {
  return role === 'OWNER' || role === 'ADMIN' || role === 'MODERATOR';
}

export function pickHighestRoleMembership(memberships: NormalizedMembership[]): NormalizedMembership | null {
  if (!memberships.length) return null;
  return memberships
    .slice()
    .sort((a, b) => {
      if (a.status !== b.status) return a.status === 'ACTIVE' ? -1 : 1;
      return rolePriority[b.role] - rolePriority[a.role];
    })[0];
}

export function getDefaultTenantRoute(slug: string, membership: NormalizedMembership): string {
  if (membership.status === 'PENDING') {
    return `/c/${slug}/pending`;
  }
  return isAdminLikeRole(membership.role) ? `/c/${slug}/admin` : `/c/${slug}/app`;
}
