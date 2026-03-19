import { tags } from 'decantr/tags';
import { onMount } from 'decantr/core';
import { css } from 'decantr/css';
import { Button, Card, Input, icon } from 'decantr/components';

const { div, span, h2, p, a } = tags;

export default function LoginPage() {
  onMount(() => { document.title = 'Sign In — CloudLaunch'; });

  return div({ class: css('d-page-enter _flex _center _hfull _p4 lp-brand-bg') },
    Card({ class: css('_w[400px] _mw[100%]') },
      Card.Body({ class: css('_flex _col _gap4 _p6') },
        div({ class: css('_flex _col _aic _gap2 _mb2') },
          div({ class: css('_w12 _h12 _flex _center _rfull _bgprimary/10 _mb2') },
            icon('cloud', { size: '1.5rem', class: css('_fgprimary') })
          ),
          h2({ class: css('_heading4 _bold') }, 'Sign in to CloudLaunch'),
          p({ class: css('_textsm _fgmuted') }, 'Welcome back. Enter your credentials to continue.')
        ),

        Input({ label: 'Email', type: 'email', placeholder: 'you@company.com' }),
        Input({ label: 'Password', type: 'password', placeholder: 'Enter your password' }),

        Button({ variant: 'primary', class: css('_wfull') }, 'Sign In'),

        div({ class: css('_flex _aic _jcsb _textsm') },
          a({ href: '#', class: css('_fgprimary _nounder') }, 'Forgot password?'),
          a({ href: '#', class: css('_fgprimary _nounder') }, 'Sign up')
        ),

        div({ class: css('_flex _aic _gap3 _py2') },
          div({ class: css('_flex1 _borderB') }),
          span({ class: css('_textxs _fgmuted') }, 'or'),
          div({ class: css('_flex1 _borderB') })
        ),

        div({ class: css('_flex _col _gap2') },
          Button({ variant: 'outline', class: css('_wfull _flex _aic _jcc _gap2') },
            icon('github', { size: '1em' }), 'Continue with GitHub'
          ),
          Button({ variant: 'outline', class: css('_wfull _flex _aic _jcc _gap2') },
            icon('chrome', { size: '1em' }), 'Continue with Google'
          )
        )
      )
    )
  );
}
