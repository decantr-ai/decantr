import { tags } from 'decantr/tags';
import { onMount } from 'decantr/core';
import { css } from 'decantr/css';
import { Button, Card, Checkbox, Input, icon } from 'decantr/components';
import { navigate } from 'decantr/router';

const { div, span, h2, p, a } = tags;

export default function LoginPage() {
  onMount(() => { document.title = 'Sign In — SaaS Dashboard'; });

  return div({ class: css('d-mesh _flex _center _hfull _p4') },
    Card({ class: css('d-glass _w[400px] _mw[100%]') },
      Card.Body({ class: css('_flex _col _gap4 _p6') },
        div({ class: css('_flex _col _aic _gap2 _mb2') },
          div({ class: css('aura-glow _w12 _h12 _flex _center _rfull _bgprimary/10 _mb2') },
            icon('layout-dashboard', { size: '1.5rem', class: css('_fgprimary') })
          ),
          h2({ class: css('d-gradient-text _heading4 _bold') }, 'SaaS Dashboard'),
          p({ class: css('_textsm _fgmuted') }, 'Sign in to your account')
        ),

        Input({ label: 'Email', type: 'email', placeholder: 'you@company.com' }),
        Input({ label: 'Password', type: 'password', placeholder: 'Enter your password' }),

        div({ class: css('_flex _aic _jcsb') },
          Checkbox({ label: 'Remember me' }),
          a({ href: '#', class: css('_textsm _fgprimary _nounder') }, 'Forgot password?')
        ),

        Button({
          variant: 'primary',
          class: css('aura-glow _wfull'),
          onclick: () => navigate('/')
        }, 'Sign In'),

        div({ class: css('_tc _textsm _fgmuted') },
          span({}, 'Don\'t have an account? '),
          a({ href: '#', class: css('_fgprimary _nounder') }, 'Sign up')
        )
      )
    )
  );
}
