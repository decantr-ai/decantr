import { tags } from 'decantr/tags';

const { div, h1, h2, p, section, ul, li } = tags;

export function AboutPage() {
  return div({ class: '_py12 _px6 _maxw[800px] _mx[auto]' },
    h1({ class: '_fs3xl _fwbold _mb8' }, 'About Me'),

    section({ class: '_mb12' },
      p({ class: '_fslg _fgmuted _lh[1.8]' },
        'I am a creative developer with over 5 years of experience building digital products. I specialize in creating beautiful, functional, and accessible web experiences.'
      ),
    ),

    section({ class: '_mb12' },
      h2({ class: '_fs2xl _fwbold _mb4' }, 'Skills'),
      ul({ class: '_grid _gc2 _gap4 _fgmuted' },
        ['JavaScript/TypeScript', 'React & Vue', 'Node.js', 'UI/UX Design', 'CSS & Animation', 'Performance Optimization'].map(skill =>
          li({ class: '_flex _itemscenter _gap2' },
            div({ class: '_w2 _h2 _roundedfull _bgprimary' }),
            skill
          )
        )
      ),
    ),

    section({},
      h2({ class: '_fs2xl _fwbold _mb4' }, 'Experience'),
      div({ class: '_flex _col _gap6' },
        [
          { company: 'Tech Corp', role: 'Senior Developer', period: '2022 - Present' },
          { company: 'Design Studio', role: 'Frontend Developer', period: '2020 - 2022' },
          { company: 'Startup Inc', role: 'Junior Developer', period: '2018 - 2020' },
        ].map(job =>
          div({ class: '_pb6 _bcborder _bb _last:bb0' },
            div({ class: '_fwbold' }, job.role),
            div({ class: '_fgprimary' }, job.company),
            div({ class: '_fgmuted _fssm' }, job.period),
          )
        )
      ),
    )
  );
}
