import { css } from '@decantr/css';
import type { HTMLAttributes, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  hover?: boolean;
  glass?: boolean;
}

export function Card({ children, hover = false, glass = false, className = '', ...props }: CardProps) {
  return (
    <div
      className={
        css('_p4 _rounded') +
        (glass ? ' carbon-glass' : ' carbon-card') +
        (hover ? ' hover-lift' : '') +
        (className ? ' ' + className : '')
      }
      {...props}
    >
      {children}
    </div>
  );
}
