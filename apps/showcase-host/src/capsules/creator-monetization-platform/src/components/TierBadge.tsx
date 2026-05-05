import { Lock } from 'lucide-react';

export function TierBadge({ tier }: { tier: 'free' | 'fan' | 'super' | 'patron' }) {
  const labels = { free: 'Public', fan: 'Fan', super: 'Super Fan', patron: 'Patron' };
  return (
    <span className="studio-badge-tier" data-tier={tier}>
      {tier !== 'free' && <Lock size={10} />}
      {labels[tier]}
    </span>
  );
}
