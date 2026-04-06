import { css } from '@decantr/css';
import { useState } from 'react';
import { caseLaw } from '../data/mock';
import { CaseBriefCard } from '../components/CaseBriefCard';

const SAMPLE_MEMO = `# Research Memorandum

## Question Presented

Whether the doctrine established in Brown v. Board of Education extends to contemporary challenges in digital access to educational resources.

## Brief Answer

The principles of Brown remain controlling authority. Courts have consistently applied equal protection analysis to educational access cases, and the reasoning extends naturally to digital contexts.

## Discussion

The Supreme Court's holding in Brown v. Board of Education, 347 U.S. 483 (1954), declared that separate educational facilities are inherently unequal. This foundational principle has been cited over 4,800 times and remains good law.

Subsequent decisions have expanded the scope of equal protection in education. In Sweatt v. Painter, 339 U.S. 629 (1950), the Court recognized that equality in education extends beyond physical facilities to include intangible factors.

## Conclusion

Based on the analysis above, the firm should advise the client that strong precedent supports a challenge under the Equal Protection Clause.`;

export function ResearchMemoPage() {
  const [content, setContent] = useState(SAMPLE_MEMO);
  const supportingCases = caseLaw.filter((c) => ['brown-v-board', 'sweatt-v-painter', 'gideon-v-wainwright'].includes(c.id));

  return (
    <div className={css('_flex _gap4')} style={{ minHeight: 'calc(100vh - 120px)' }}>
      {/* Editor */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div className={css('_flex _aic _jcsb')} style={{ marginBottom: '0.75rem' }}>
          <h2 className="counsel-header" style={{ fontSize: '1.125rem' }}>Research Memo</h2>
          <div className={css('_flex _gap2')}>
            <button className="d-interactive" data-variant="ghost" style={{ padding: '0.25rem 0.75rem', fontSize: '0.8125rem' }}>Preview</button>
            <button className="d-interactive" data-variant="primary" style={{ padding: '0.25rem 0.75rem', fontSize: '0.8125rem' }}>Save Draft</button>
          </div>
        </div>
        <textarea
          className="d-control counsel-prose"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          style={{
            flex: 1,
            resize: 'none',
            fontFamily: 'Georgia, serif',
            fontSize: '0.9375rem',
            lineHeight: 1.8,
            padding: '1.5rem',
            minHeight: 400,
            maxWidth: 'none',
          }}
        />
      </div>

      {/* Supporting cases sidebar */}
      <div style={{ width: 320, flexShrink: 0 }}>
        <p className="d-label" style={{ borderLeft: '2px solid var(--d-accent)', paddingLeft: '0.5rem', marginBottom: '0.75rem' }}>
          Supporting Cases
        </p>
        <div className={css('_flex _col _gap3')}>
          {supportingCases.map((c) => (
            <CaseBriefCard key={c.id} caseItem={c} compact />
          ))}
        </div>
      </div>
    </div>
  );
}
