import { createClient } from '@/lib/supabase/server';
import { AccountSettings } from '@/components/account-settings';

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="flex flex-col gap-6">
      <h3 className="text-lg font-semibold">Settings</h3>
      <AccountSettings
        user={{
          email: user?.email,
          display_name: user?.user_metadata?.display_name || '',
          username: user?.user_metadata?.username || '',
        }}
      />
    </div>
  );
}
