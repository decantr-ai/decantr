'use server';

import { revalidatePath } from 'next/cache';
import { api, type AdminTelemetryAliasPatch, type AdminTelemetryAliasWrite } from '@/lib/api';
import { requireAdminRequestContext } from '@/lib/admin-workspace';

function readNullableText(formData: FormData, key: string) {
  const value = formData.get(key);
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed || null;
}

function readAliasWrite(formData: FormData): AdminTelemetryAliasWrite {
  return {
    identity_type: readNullableText(formData, 'identity_type') as AdminTelemetryAliasWrite['identity_type'],
    identity_id: readNullableText(formData, 'identity_id') ?? '',
    actor_type: readNullableText(formData, 'actor_type') as AdminTelemetryAliasWrite['actor_type'],
    user_ref: readNullableText(formData, 'user_ref'),
    org_ref: readNullableText(formData, 'org_ref'),
    label: readNullableText(formData, 'label'),
  };
}

function readAliasPatch(formData: FormData): AdminTelemetryAliasPatch {
  return {
    actor_type: readNullableText(formData, 'actor_type') as AdminTelemetryAliasPatch['actor_type'],
    user_ref: readNullableText(formData, 'user_ref'),
    org_ref: readNullableText(formData, 'org_ref'),
    label: readNullableText(formData, 'label'),
  };
}

export async function upsertTelemetryAlias(formData: FormData) {
  const { token, adminKey } = await requireAdminRequestContext();
  await api.upsertAdminTelemetryAlias(token, adminKey, readAliasWrite(formData));
  revalidatePath('/admin/telemetry');
  revalidatePath('/admin/telemetry/usage');
  revalidatePath('/admin/reports');
}

export async function updateTelemetryAlias(aliasId: string, formData: FormData) {
  const { token, adminKey } = await requireAdminRequestContext();
  await api.updateAdminTelemetryAlias(token, adminKey, aliasId, readAliasPatch(formData));
  revalidatePath('/admin/telemetry');
  revalidatePath('/admin/telemetry/usage');
  revalidatePath('/admin/reports');
}

export async function deleteTelemetryAlias(aliasId: string, _formData?: FormData) {
  const { token, adminKey } = await requireAdminRequestContext();
  await api.deleteAdminTelemetryAlias(token, adminKey, aliasId);
  revalidatePath('/admin/telemetry');
  revalidatePath('/admin/telemetry/usage');
  revalidatePath('/admin/reports');
}
