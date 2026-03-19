/**
 * Section 3: Code Comparison — Traditional React vs Decantr Essence
 */
import { css } from 'decantr/css';
import { tags } from 'decantr/tags';
import { Card, CodeBlock, createHighlighter } from 'decantr/components';

const { div, section, h2, h3, p } = tags;

const REACT_CODE = `// Traditional React Dashboard
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@emotion/react';
import { AuthProvider, useAuth } from './auth';
import { Sidebar, Header, KPICard, DataTable, Chart } from './components';
import { theme } from './theme';
import './styles.css';

// 847 lines of boilerplate, hooks, providers, and components...
// Just to get a basic dashboard running.`;

const ESSENCE_CODE = `// Decantr Essence — 30 lines → 14-page dashboard
{
  "terroir": "saas-dashboard",
  "vintage": {
    "style": "auradecantism",
    "mode": "dark"
  },
  "character": ["professional", "data-rich"],
  "structure": [
    { "id": "overview", "blend": ["kpi-grid", "chart-grid", "data-table"] },
    { "id": "analytics", "blend": ["filter-bar", "chart-grid"] },
    { "id": "users", "blend": ["filter-bar", "data-table"] },
    { "id": "settings", "blend": ["form-sections"] }
  ],
  "tannins": ["auth", "realtime-data"]
}`;

export function VisionComparisonSection() {
  const panel = (label, code, lang) =>
    Card({ class: css('d-glass _flex _col _gap0 _overflow[hidden]') },
      Card.Header({},
        h3({ class: css('_textsm _fgmuted _uppercase _tracking[0.05em]') }, label)
      ),
      Card.Body({ class: css('_p0') },
        CodeBlock({ language: lang, highlight: createHighlighter, maxHeight: '300px' }, code)
      )
    );

  return section({ class: css('_py24 _px6') },
    div({ class: css('_mw[1100px] _mx[auto] _flex _col _gap8') },
      div({ class: css('_tc') },
        h2({ class: css('_heading2 _fgfg _mb3') }, 'Traditional vs AI-Native'),
        p({ class: css('_fgmuted _mw[600px] _mx[auto]') },
          'AI doesn\'t think in JSX and hooks. It thinks in registries, tokens, and compositions.'
        )
      ),
      div({ class: css('_grid _gc1 _lg:gc2 _gap6') },
        panel('React + TypeScript', REACT_CODE, 'javascript'),
        panel('Decantr Essence', ESSENCE_CODE, 'json')
      ),
      p({ class: css('_tc _fgmuted _textsm _italic') },
        '30 lines of essence.json generates the same dashboard that takes 847 lines of traditional React.'
      )
    )
  );
}
