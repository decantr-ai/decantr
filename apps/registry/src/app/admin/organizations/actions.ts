'use server';

import { revalidatePath } from 'next/cache';
import { api } from '@/lib/api';
import { requireAdminRequestContext } from '@/lib/admin-workspace';

function readClassification(formData: FormData) {
  return {
    is_internal: formData.get('is_internal') === 'on',
    is_test: formData.get('is_test') === 'on',
  };
}

export async function updateOrganizationTelemetryClassification(
  slug: string,
  formData: FormData,
) {
  const { token, adminKey } = await requireAdminRequestContext();
  await api.updateAdminOrganizationTelemetry(token, adminKey, slug, readClassification(formData));
  revalidatePath('/admin/organizations');
  revalidatePath(`/admin/organizations/${slug}`);
}

export async function updateUserTelemetryClassification(
  slug: string,
  userId: string,
  formData: FormData,
) {
  const { token, adminKey } = await requireAdminRequestContext();
  await api.updateAdminUserTelemetry(token, adminKey, userId, readClassification(formData));
  revalidatePath('/admin/organizations');
  revalidatePath(`/admin/organizations/${slug}`);
}
