import { css } from '@decantr/css';

type AvatarSize = 'sm' | 'md' | 'lg';

interface AvatarProps {
  name: string;
  src?: string;
  size?: AvatarSize;
}

const sizeClass: Record<AvatarSize, string> = {
  sm: 'carbon-avatar-sm',
  md: 'carbon-avatar-md',
  lg: 'carbon-avatar-lg',
};

export function Avatar({ name, src, size = 'md' }: AvatarProps) {
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className={css('') + 'carbon-avatar ' + sizeClass[size]} aria-label={name}>
      {src ? (
        <img src={src} alt={name} className={css('_wfull _hfull')} style={{ objectFit: 'cover' }} />
      ) : (
        initials
      )}
    </div>
  );
}
