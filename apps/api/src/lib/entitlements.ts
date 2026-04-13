export type UserTier = 'free' | 'pro' | 'team' | 'enterprise';

export interface OrganizationEntitlementSummary {
  id: string;
  slug: string;
  name: string;
  tier: 'team' | 'enterprise';
  role: 'owner' | 'admin' | 'member';
  seat_limit: number;
  member_count: number;
  stripe_subscription_id: string | null;
}

export interface CommercialEntitlements {
  tier: UserTier;
  personal_private_packages: boolean;
  org_collaboration: boolean;
  org_private_packages: boolean;
  shared_packages: boolean;
  audit_logs: boolean;
  approval_workflows: boolean;
  support_level: 'community' | 'priority' | 'enterprise';
}

export interface CommercialLimits {
  api_requests_per_minute: number | null;
  personal_content_items: number | null;
  personal_private_packages: number | null;
  org_content_items: number | null;
  team_seats: number | null;
}

export interface CommercialUsage {
  api_requests_30d: number;
  personal_content_items: number;
  personal_private_packages: number;
  org_content_items: number;
  seats_used: number;
  seats_limit: number;
}

export function getCommercialEntitlements(tier: UserTier): CommercialEntitlements {
  switch (tier) {
    case 'enterprise':
      return {
        tier,
        personal_private_packages: true,
        org_collaboration: true,
        org_private_packages: true,
        shared_packages: true,
        audit_logs: true,
        approval_workflows: true,
        support_level: 'enterprise',
      };
    case 'team':
      return {
        tier,
        personal_private_packages: true,
        org_collaboration: true,
        org_private_packages: true,
        shared_packages: true,
        audit_logs: true,
        approval_workflows: false,
        support_level: 'priority',
      };
    case 'pro':
      return {
        tier,
        personal_private_packages: true,
        org_collaboration: false,
        org_private_packages: false,
        shared_packages: false,
        audit_logs: false,
        approval_workflows: false,
        support_level: 'priority',
      };
    case 'free':
    default:
      return {
        tier: 'free',
        personal_private_packages: false,
        org_collaboration: false,
        org_private_packages: false,
        shared_packages: false,
        audit_logs: false,
        approval_workflows: false,
        support_level: 'community',
      };
  }
}

export function getCommercialLimits(
  tier: UserTier,
  activeOrg: OrganizationEntitlementSummary | null,
): CommercialLimits {
  switch (tier) {
    case 'enterprise':
      return {
        api_requests_per_minute: null,
        personal_content_items: null,
        personal_private_packages: null,
        org_content_items: null,
        team_seats: activeOrg?.seat_limit ?? null,
      };
    case 'team':
      return {
        api_requests_per_minute: 600,
        personal_content_items: 500,
        personal_private_packages: 250,
        org_content_items: null,
        team_seats: activeOrg?.seat_limit ?? 1,
      };
    case 'pro':
      return {
        api_requests_per_minute: 300,
        personal_content_items: 100,
        personal_private_packages: 100,
        org_content_items: null,
        team_seats: null,
      };
    case 'free':
    default:
      return {
        api_requests_per_minute: 60,
        personal_content_items: 5,
        personal_private_packages: 0,
        org_content_items: 0,
        team_seats: null,
      };
  }
}
