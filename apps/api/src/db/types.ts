export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          username: string;
          display_name: string | null;
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
          username?: string;
          display_name?: string | null;
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
          username?: string;
          display_name?: string | null;
          tier?: 'free' | 'pro' | 'team' | 'enterprise';
          stripe_customer_id?: string | null;
          reputation_score?: number;
          trusted?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
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
        Relationships: [
          {
            foreignKeyName: 'organizations_owner_id_fkey';
            columns: ['owner_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
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
        Relationships: [
          {
            foreignKeyName: 'org_members_org_id_fkey';
            columns: ['org_id'];
            isOneToOne: false;
            referencedRelation: 'organizations';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'org_members_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
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
        Relationships: [
          {
            foreignKeyName: 'api_keys_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      content: {
        Row: {
          id: string;
          type: 'pattern' | 'theme' | 'blueprint' | 'archetype' | 'shell';
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
          type: 'pattern' | 'theme' | 'blueprint' | 'archetype' | 'shell';
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
          type?: 'pattern' | 'theme' | 'blueprint' | 'archetype' | 'shell';
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
        Relationships: [
          {
            foreignKeyName: 'content_owner_id_fkey';
            columns: ['owner_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
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
        Relationships: [
          {
            foreignKeyName: 'content_versions_content_id_fkey';
            columns: ['content_id'];
            isOneToOne: false;
            referencedRelation: 'content';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'content_versions_created_by_fkey';
            columns: ['created_by'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
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
        Relationships: [
          {
            foreignKeyName: 'moderation_queue_content_id_fkey';
            columns: ['content_id'];
            isOneToOne: false;
            referencedRelation: 'content';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'moderation_queue_submitted_by_fkey';
            columns: ['submitted_by'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      stripe_events: {
        Row: {
          event_id: string;
          event_type: string;
          processed_at: string;
        };
        Insert: {
          event_id: string;
          event_type: string;
          processed_at?: string;
        };
        Update: {
          event_id?: string;
          event_type?: string;
          processed_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      increment_reputation: {
        Args: {
          user_id_param: string;
          amount: number;
        };
        Returns: void;
      };
      search_content: {
        Args: {
          search_query: string;
          content_type?: string | null;
          content_namespace?: string | null;
          result_limit?: number;
          result_offset?: number;
        };
        Returns: Array<{
          id: string;
          type: string;
          slug: string;
          namespace: string;
          version: string;
          data: Record<string, unknown>;
          published_at: string | null;
          owner_display_name: string | null;
          owner_username: string | null;
          total_count: number;
        }>;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
