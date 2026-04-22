import { createClient } from '@/lib/supabase/server';
import { api, deriveCommercialEntitlements, deriveCommercialLimits, type BillingStatus, type CommercialEntitlements, type CommercialLimits, type MeResponse, type OrganizationSummary } from '@/lib/api';
import { isAdmin } from '@/lib/admin';

type AuthUserLike = {
  id: string;
  email?: string | null;
  user_metadata?: Record<string, unknown> | null;
};

export interface WorkspaceIdentity {
  email: string;
  displayName: string | null;
  username: string | null;
  bio: string | null;
  shortLabel: string;
  initials: string;
  tierLabel: string;
}

export interface WorkspaceCapabilities {
  canAccessTeam: boolean;
  canAccessGovernance: boolean;
  canManageActiveOrganization: boolean;
  canAccessPrivateRegistry: boolean;
  canAccessAdmin: boolean;
  canUseOrganizationFeatures: boolean;
}

export interface WorkspaceSnapshot {
  me: MeResponse | null;
  billing: BillingStatus | null;
  organizations: OrganizationSummary[];
  activeOrganization: OrganizationSummary | null;
  entitlements: CommercialEntitlements;
  limits: CommercialLimits;
  tier: 'free' | 'pro' | 'team' | 'enterprise';
  isAdmin: boolean;
  identity: WorkspaceIdentity;
  capabilities: WorkspaceCapabilities;
}

export interface WorkspaceState extends WorkspaceSnapshot {
  authUser: AuthUserLike;
  token: string;
}

function getString(value: unknown): string | null {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;
}

function getInitials(value: string): string {
  return value
    .split(/[\s@._-]/)
    .filter(Boolean)
    .slice(0, 2)
    .map((segment) => segment[0]?.toUpperCase() ?? '')
    .join('') || 'YO';
}

function resolveWorkspaceIdentity(
  authUser: AuthUserLike,
  me: MeResponse | null,
  activeOrganization: OrganizationSummary | null,
  tier: WorkspaceState['tier'],
): WorkspaceIdentity {
  const metadata = authUser.user_metadata ?? {};
  const email = me?.email ?? authUser.email ?? '';
  const displayName =
    me?.display_name
    ?? getString(metadata.display_name)
    ?? getString(metadata.name)
    ?? null;
  const username =
    me?.username
    ?? getString(metadata.username)
    ?? getString(metadata.user_name)
    ?? null;
  const bio = getString(metadata.bio) ?? null;
  const shortLabel = displayName || username || email.split('@')[0] || 'Your workspace';
  const initials = getInitials(displayName || username || email || 'YO');
  const tierLabel =
    tier === 'enterprise'
      ? activeOrganization ? `${activeOrganization.name} enterprise` : 'Enterprise workspace'
      : tier === 'team'
      ? activeOrganization ? `${activeOrganization.name} team` : 'Team workspace'
      : tier === 'pro'
      ? 'Pro private packages'
      : 'Free plan';

  return {
    email,
    displayName,
    username,
    bio,
    shortLabel,
    initials,
    tierLabel,
  };
}

function resolveActiveOrganization(
  me: MeResponse | null,
  billing: BillingStatus | null,
): OrganizationSummary | null {
  const organizations = me?.organizations?.length
    ? me.organizations
    : billing?.organizations?.length
    ? billing.organizations
    : [];

  if (!organizations.length) {
    return null;
  }

  return organizations.find((org) => org.slug === me?.org_slug) ?? organizations[0] ?? null;
}

function resolveCapabilities(
  isAdminUser: boolean,
  entitlements: CommercialEntitlements,
  organizations: OrganizationSummary[],
  activeOrganization: OrganizationSummary | null,
): WorkspaceCapabilities {
  const hasOrganization = organizations.length > 0;
  const canUseOrganizationFeatures = hasOrganization && entitlements.org_collaboration;
  const canManageActiveOrganization = Boolean(
    activeOrganization && ['owner', 'admin'].includes(activeOrganization.role),
  );

  return {
    canAccessTeam: canUseOrganizationFeatures,
    canAccessGovernance: canUseOrganizationFeatures,
    canManageActiveOrganization,
    canAccessPrivateRegistry: Boolean(
      entitlements.private_registry_portal
      && activeOrganization
      && activeOrganization.tier === 'enterprise',
    ),
    canAccessAdmin: isAdminUser,
    canUseOrganizationFeatures,
  };
}

export async function getWorkspaceState(): Promise<WorkspaceState | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!user) {
    return null;
  }

  const token = session?.access_token ?? '';
  let me: MeResponse | null = null;
  let billing: BillingStatus | null = null;

  if (token) {
    try {
      [me, billing] = await Promise.all([
        api.getMe(token).catch(() => null),
        api.getBillingStatus(token).catch(() => null),
      ]);
    } catch {
      me = null;
      billing = null;
    }
  }

  const organizations = me?.organizations?.length
    ? me.organizations
    : billing?.organizations ?? [];
  const activeOrganization = resolveActiveOrganization(me, billing);
  const tier = me?.tier ?? billing?.tier ?? 'free';
  const entitlements = me?.entitlements ?? billing?.entitlements ?? deriveCommercialEntitlements(tier);
  const limits = me?.limits ?? billing?.limits ?? deriveCommercialLimits(tier, activeOrganization);
  const admin = isAdmin(user.email ?? '');
  const identity = resolveWorkspaceIdentity(
    {
      id: user.id,
      email: user.email,
      user_metadata: user.user_metadata,
    },
    me,
    activeOrganization,
    tier,
  );
  const capabilities = resolveCapabilities(admin, entitlements, organizations, activeOrganization);

  return {
    authUser: {
      id: user.id,
      email: user.email,
      user_metadata: user.user_metadata,
    },
    token,
    me,
    billing,
    organizations,
    activeOrganization,
    entitlements,
    limits,
    tier,
    isAdmin: admin,
    identity,
    capabilities,
  };
}

export function toClientWorkspaceState(workspace: WorkspaceState): WorkspaceSnapshot {
  return {
    me: workspace.me,
    billing: workspace.billing,
    organizations: workspace.organizations,
    activeOrganization: workspace.activeOrganization,
    entitlements: workspace.entitlements,
    limits: workspace.limits,
    tier: workspace.tier,
    isAdmin: workspace.isAdmin,
    identity: workspace.identity,
    capabilities: workspace.capabilities,
  };
}
