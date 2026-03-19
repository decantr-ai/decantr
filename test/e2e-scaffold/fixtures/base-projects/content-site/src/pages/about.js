import { tags } from 'decantr/tags';

const { div, h1, h2, p, section } = tags;

export function AboutPage() {
  return div({ class: '_py12 _px6 _maxw[700px] _mx[auto]' },
    h1({ class: '_fs3xl _fwbold _mb8' }, 'About This Blog'),

    section({ class: '_mb12' },
      p({ class: '_fslg _fgmuted _lh[1.8] _mb4' },
        'Welcome to our blog! We are passionate about sharing knowledge and helping developers grow their skills.'
      ),
      p({ class: '_fgmuted _lh[1.8]' },
        'Our articles cover a wide range of topics including web development, best practices, performance optimization, and more.'
      ),
    ),

    section({ class: '_mb12' },
      h2({ class: '_fs2xl _fwbold _mb4' }, 'Our Mission'),
      p({ class: '_fgmuted _lh[1.8]' },
        'We believe that knowledge should be accessible to everyone. Our goal is to create clear, practical, and actionable content that helps developers at all levels improve their craft.'
      ),
    ),

    section({},
      h2({ class: '_fs2xl _fwbold _mb4' }, 'Get in Touch'),
      p({ class: '_fgmuted _lh[1.8]' },
        'Have questions or suggestions? We would love to hear from you. Reach out to us via email at hello@example.com.'
      ),
    )
  );
}
