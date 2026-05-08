'use server';

import { createClient } from '@/lib/supabase/server';
import { api } from '@/lib/api';

type ContentPayload = {
  type: string;
  slug: string;
  version: string;
  visibility: string;
  data: Record<string, unknown>;
  namespace?: string;
};

type ThumbnailUploadTargetInput = {
  file_name: string;
  target: 'community' | 'organization' | 'personal';
  org_slug?: string;
};

async function getToken() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new Error('Not authenticated');
  }
  return session.access_token;
}

export async function createThumbnailUploadTargetAction(input: ThumbnailUploadTargetInput) {
  const token = await getToken();
  try {
    const uploadTarget = await api.createThumbnailUploadTarget(token, input);
    return { uploadTarget };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Failed to create thumbnail upload target' };
  }
}

export async function publishContentAction(input: {
  target: 'community' | 'organization' | 'personal';
  orgSlug?: string;
  payload: ContentPayload;
}) {
  const token = await getToken();
  try {
    if (input.target === 'organization') {
      if (!input.orgSlug) {
        return { error: 'Select an organization before publishing an organization package.' };
      }
      await api.publishOrgContent(token, input.orgSlug, input.payload);
    } else {
      await api.publishContent(token, input.payload);
    }

    return { success: true };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Failed to publish content.' };
  }
}
