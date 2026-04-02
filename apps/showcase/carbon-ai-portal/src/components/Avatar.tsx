import { css } from '@decantr/css';
import { User } from 'lucide-react';

interface AvatarProps {
  src?: string;
  alt?: string;
  size?: 'sm' | 'md' | 'lg';
  fallback?: string;
}

const sizeMap = {
  sm: { container: css('_w8 _h8'), icon: 14 },
  md: { container: css('_w10 _h10'), icon: 18 },
  lg: { container: css('_w12 _h12'), icon: 24 },
};

export function Avatar({ src, alt, size = 'md', fallback }: AvatarProps) {
  const s = sizeMap[size];

  if (src) {
    return (
      <img
        src={src}
        alt={alt || ''}
        className={css('_roundedfull _overhidden _shrink0') + ' ' + s.container}
        style={{ objectFit: 'cover' }}
      />
    );
  }

  return (
    <div
      className={
        css('_roundedfull _flex _aic _jcc _bgsurface _shrink0') +
        ' ' + s.container
      }
      aria-label={alt || fallback || 'User avatar'}
    >
      {fallback ? (
        <span className={css('_textsm _fontmedium _fgmuted')}>{fallback}</span>
      ) : (
        <User size={s.icon} className={css('_fgmuted')} />
      )}
    </div>
  );
}
