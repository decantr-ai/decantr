export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          tier: 'free' | 'pro' | 'team' | 'enterprise';
          stripe_customer_id: string | null;
          reputation_score: number;
          trusted: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          tier?: 'free' | 'pro' | 'team' | 'enterprise';
          stripe_customer_id?: string | null;
          reputation_score?: number;
          trusted?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          tier?: 'free' | 'pro' | 'team' | 'enterprise';
          stripe_customer_id?: string | null;
          reputation_score?: number;
          trusted?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      organizations: {
        Row: {
          id: string;
          name: string;
          slug: string;
          owner_id: string;
          tier: 'team' | 'enterprise';
          stripe_subscription_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          owner_id: string;
          tier: 'team' | 'enterprise';
          stripe_subscription_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          owner_id?: string;
          tier?: 'team' | 'enterprise';
          stripe_subscription_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      org_members: {
        Row: {
          org_id: string;
          user_id: string;
          role: 'owner' | 'admin' | 'member';
          created_at: string;
        };
        Insert: {
          org_id: string;
          user_id: string;
          role: 'owner' | 'admin' | 'member';
          created_at?: string;
        };
        Update: {
          org_id?: string;
          user_id?: string;
          role?: 'owner' | 'admin' | 'member';
          created_at?: string;
        };
      };
      api_keys: {
        Row: {
          id: string;
          user_id: string;
          org_id: string | null;
          key_hash: string;
          name: string;
          scopes: string[];
          last_used_at: string | null;
          created_at: string;
          revoked_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          org_id?: string | null;
          key_hash: string;
          name: string;
          scopes?: string[];
          last_used_at?: string | null;
          created_at?: string;
          revoked_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          org_id?: string | null;
          key_hash?: string;
          name?: string;
          scopes?: string[];
          last_used_at?: string | null;
          created_at?: string;
          revoked_at?: string | null;
        };
      };
      content: {
        Row: {
          id: string;
          type: 'pattern' | 'recipe' | 'theme' | 'blueprint' | 'archetype' | 'shell';
          slug: string;
          namespace: string;
          owner_id: string;
          org_id: string | null;
          visibility: 'public' | 'private';
          status: 'pending' | 'approved' | 'rejected' | 'published';
          version: string;
          data: Record<string, unknown>;
          created_at: string;
          updated_at: string;
          published_at: string | null;
        };
        Insert: {
          id?: string;
          type: 'pattern' | 'recipe' | 'theme' | 'blueprint' | 'archetype' | 'shell';
          slug: string;
          namespace: string;
          owner_id: string;
          org_id?: string | null;
          visibility?: 'public' | 'private';
          status?: 'pending' | 'approved' | 'rejected' | 'published';
          version: string;
          data: Record<string, unknown>;
          created_at?: string;
          updated_at?: string;
          published_at?: string | null;
        };
        Update: {
          id?: string;
          type?: 'pattern' | 'recipe' | 'theme' | 'blueprint' | 'archetype' | 'shell';
          slug?: string;
          namespace?: string;
          owner_id?: string;
          org_id?: string | null;
          visibility?: 'public' | 'private';
          status?: 'pending' | 'approved' | 'rejected' | 'published';
          version?: string;
          data?: Record<string, unknown>;
          created_at?: string;
          updated_at?: string;
          published_at?: string | null;
        };
      };
      content_versions: {
        Row: {
          id: string;
          content_id: string;
          version: string;
          data: Record<string, unknown>;
          created_at: string;
          created_by: string;
        };
        Insert: {
          id?: string;
          content_id: string;
          version: string;
          data: Record<string, unknown>;
          created_at?: string;
          created_by: string;
        };
        Update: {
          id?: string;
          content_id?: string;
          version?: string;
          data?: Record<string, unknown>;
          created_at?: string;
          created_by?: string;
        };
      };
      moderation_queue: {
        Row: {
          id: string;
          content_id: string;
          submitted_by: string;
          submitted_at: string;
          reviewed_by: string | null;
          reviewed_at: string | null;
          status: 'pending' | 'approved' | 'rejected';
          rejection_reason: string | null;
          notes: string | null;
        };
        Insert: {
          id?: string;
          content_id: string;
          submitted_by: string;
          submitted_at?: string;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          status?: 'pending' | 'approved' | 'rejected';
          rejection_reason?: string | null;
          notes?: string | null;
        };
        Update: {
          id?: string;
          content_id?: string;
          submitted_by?: string;
          submitted_at?: string;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          status?: 'pending' | 'approved' | 'rejected';
          rejection_reason?: string | null;
          notes?: string | null;
        };
      };
    };
  };
}
