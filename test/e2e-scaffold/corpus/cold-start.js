/**
 * Cold-Start Test Corpus
 *
 * Tests new project scaffolding from natural language prompts.
 * Each entry includes the prompt, expected outcomes, and scoring criteria.
 */

export const coldStartCorpus = [
  // ═══════════════════════════════════════════════════════════════════════════
  // PORTFOLIO / CREATIVE (5 tests)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: 'CS-001',
    prompt: `I want to create a Photography Portfolio website with a stormy theme of blues blacks and glowy stuff`,
    difficulty: 'medium',
    expected: {
      terroir: 'portfolio',
      vintage: {
        style: ['glassmorphism', 'auradecantism'], // either acceptable
        mode: 'dark',
      },
      structure: {
        min_pages: 3,
        required_pages: ['home', 'projects'],
        required_patterns: ['hero', 'card-grid'],
      },
      theme: {
        colors: ['blue', 'dark', 'glow'],
        vibe: ['stormy', 'dramatic', 'moody'],
      },
    },
    scoring: {
      intent_keywords: ['photography', 'portfolio', 'stormy', 'blue', 'glow'],
      visual_checks: ['dark-background', 'blue-accents', 'glow-effects'],
    },
  },

  {
    id: 'CS-002',
    prompt: `Create an artist portfolio for a 3D sculptor. I want it to feel like a gallery - lots of white space,
    the artwork should be the focus. Clean and minimal. Each piece should have its own detail page with
    multiple angles and a description.`,
    difficulty: 'medium',
    expected: {
      terroir: 'portfolio',
      vintage: {
        style: ['clean'],
        mode: 'light',
      },
      structure: {
        min_pages: 3,
        required_pages: ['home', 'projects', 'project-detail'],
        required_patterns: ['hero', 'card-grid'],
      },
      character: ['minimal', 'gallery', 'clean'],
    },
    scoring: {
      intent_keywords: ['artist', 'portfolio', 'gallery', 'minimal', 'detail page'],
      visual_checks: ['light-background', 'generous-whitespace', 'image-focused'],
    },
  },

  {
    id: 'CS-003',
    prompt: `Build me a portfolio for my UX design work. I want case studies with before/after comparisons,
    process documentation, and testimonials from clients. Modern and professional but not boring.`,
    difficulty: 'hard',
    expected: {
      terroir: 'portfolio',
      vintage: {
        style: ['auradecantism', 'clean'],
        mode: ['light', 'dark', 'auto'],
      },
      structure: {
        min_pages: 4,
        required_pages: ['home', 'projects', 'project-detail'],
        required_patterns: ['hero', 'card-grid', 'timeline'],
      },
      character: ['professional', 'modern'],
      tannins: ['case-studies'],
    },
    scoring: {
      intent_keywords: ['UX', 'case studies', 'process', 'testimonials', 'professional'],
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // CONTENT / BLOG (5 tests)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: 'CS-004',
    prompt: `Create me a stunningly beautiful blog website like Smashing Magazine. Use a similar color palette,
    ensure every blog article has the ability to have long form articles, and different types of article
    structures like that, for example maybe a buyers guide where I can post links to products`,
    difficulty: 'hard',
    expected: {
      terroir: 'content-site',
      vintage: {
        style: ['clean', 'auradecantism'],
        mode: ['light', 'auto'],
      },
      structure: {
        min_pages: 4,
        required_pages: ['home', 'articles', 'article-detail'],
        required_patterns: ['hero', 'card-grid', 'article-content'],
      },
      character: ['editorial', 'professional', 'readable'],
    },
    scoring: {
      intent_keywords: ['blog', 'magazine', 'long form', 'articles', 'buyers guide'],
      compliance_strict: ['no-inline-css', 'proper-typography'],
    },
  },

  {
    id: 'CS-005',
    prompt: `I'd like to create a site about rabbits and bunnies for my adoption shelter.
    It should have profiles for each rabbit available for adoption, an about page explaining
    our mission, and a contact form for adoption inquiries.`,
    difficulty: 'easy',
    expected: {
      terroir: 'content-site',
      vintage: {
        style: ['clean', 'auradecantism'],
        mode: ['light'],
      },
      structure: {
        min_pages: 4,
        required_pages: ['home', 'about', 'contact'],
        required_patterns: ['hero', 'card-grid', 'form-sections'],
      },
      character: ['friendly', 'warm', 'approachable'],
    },
    scoring: {
      intent_keywords: ['rabbits', 'adoption', 'shelter', 'profiles', 'contact'],
    },
  },

  {
    id: 'CS-006',
    prompt: `Build a tech news aggregator site. Headlines from different sources,
    categorized by topic (AI, startups, gadgets). Dark mode by default,
    clean reading experience, no clutter.`,
    difficulty: 'medium',
    expected: {
      terroir: 'content-site',
      vintage: {
        style: ['clean', 'auradecantism'],
        mode: 'dark',
      },
      structure: {
        min_pages: 3,
        required_patterns: ['card-grid', 'filter-bar'],
      },
      character: ['minimal', 'clean', 'focused'],
    },
    scoring: {
      intent_keywords: ['news', 'aggregator', 'categories', 'dark mode', 'clean'],
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SAAS / DASHBOARD (6 tests)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: 'CS-007',
    prompt: `I'd like to create an administrative backend panel that monitors call center operations
    for an enterprise team. It should wire up to mock data APIs, be visually stunning, and use
    a light theme with vibrant but pastel colors, like an enterprise color palette.`,
    difficulty: 'hard',
    expected: {
      terroir: 'saas-dashboard',
      vintage: {
        style: ['auradecantism', 'clean'],
        mode: 'light',
      },
      structure: {
        min_pages: 4,
        required_pages: ['overview', 'analytics'],
        required_patterns: ['kpi-grid', 'data-table', 'chart-grid'],
        required_skeleton: 'sidebar-main',
      },
      character: ['enterprise', 'professional', 'data-rich'],
      tannins: ['mock-data', 'realtime-data'],
    },
    scoring: {
      intent_keywords: ['admin', 'call center', 'enterprise', 'monitoring', 'pastel'],
      visual_checks: ['light-theme', 'pastel-accents', 'data-dense'],
    },
  },

  {
    id: 'CS-008',
    prompt: `Create a SaaS analytics dashboard for tracking website metrics.
    Real-time visitor counts, page views over time, bounce rates, geographic distribution.
    Similar to Google Analytics but simpler. Dark theme.`,
    difficulty: 'medium',
    expected: {
      terroir: 'saas-dashboard',
      vintage: {
        style: ['auradecantism'],
        mode: 'dark',
      },
      structure: {
        min_pages: 3,
        required_pages: ['overview', 'analytics'],
        required_patterns: ['kpi-grid', 'chart-grid'],
      },
      tannins: ['realtime-data', 'charts'],
    },
    scoring: {
      intent_keywords: ['analytics', 'dashboard', 'metrics', 'real-time', 'charts'],
    },
  },

  {
    id: 'CS-009',
    prompt: `Build a project management dashboard. Kanban boards, task lists, team members,
    deadlines. Think Trello meets Linear. Clean, fast, keyboard-first.`,
    difficulty: 'hard',
    expected: {
      terroir: 'saas-dashboard',
      vintage: {
        style: ['clean', 'auradecantism'],
        mode: ['light', 'dark', 'auto'],
      },
      structure: {
        min_pages: 4,
        required_patterns: ['kanban-board', 'data-table'],
      },
      character: ['productive', 'clean', 'fast'],
      tannins: ['keyboard-shortcuts'],
    },
    scoring: {
      intent_keywords: ['project management', 'kanban', 'tasks', 'keyboard'],
    },
  },

  {
    id: 'CS-010',
    prompt: `Customer support ticket dashboard. Ticket queue, priority sorting,
    agent assignment, response templates. Integration ready for Zendesk-like APIs.`,
    difficulty: 'medium',
    expected: {
      terroir: 'saas-dashboard',
      vintage: {
        style: ['clean', 'auradecantism'],
        mode: ['light', 'auto'],
      },
      structure: {
        min_pages: 4,
        required_patterns: ['data-table', 'filter-bar', 'inbox'],
      },
      tannins: ['auth', 'api-integration'],
    },
    scoring: {
      intent_keywords: ['support', 'tickets', 'queue', 'agents', 'priority'],
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // ECOMMERCE (4 tests)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: 'CS-011',
    prompt: `E-commerce store for vintage clothing. Curated collections, size guides,
    era-based categorization (60s, 70s, 80s). Retro aesthetic but modern UX.`,
    difficulty: 'medium',
    expected: {
      terroir: 'ecommerce',
      vintage: {
        style: ['retro', 'auradecantism'],
        mode: ['light', 'auto'],
      },
      structure: {
        min_pages: 5,
        required_pages: ['home', 'catalog', 'product-detail', 'cart'],
        required_patterns: ['hero', 'card-grid', 'filter-bar'],
      },
      tannins: ['cart', 'search', 'filtering'],
    },
    scoring: {
      intent_keywords: ['ecommerce', 'vintage', 'clothing', 'collections', 'retro'],
    },
  },

  {
    id: 'CS-012',
    prompt: `Online plant nursery store. Product pages with care instructions,
    difficulty ratings for each plant, seasonal availability.
    Green and earthy color scheme, feels organic.`,
    difficulty: 'medium',
    expected: {
      terroir: 'ecommerce',
      vintage: {
        style: ['clean', 'auradecantism'],
        mode: 'light',
      },
      structure: {
        min_pages: 5,
        required_pages: ['home', 'catalog', 'product-detail', 'cart'],
      },
      theme: {
        colors: ['green', 'earthy', 'organic'],
      },
    },
    scoring: {
      intent_keywords: ['plants', 'nursery', 'care instructions', 'green', 'organic'],
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SPECIALIZED DOMAINS (5 tests)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: 'CS-013',
    prompt: `Developer documentation site for my open source library.
    Getting started guide, API reference with code examples,
    version selector, search. Like Stripe's docs.`,
    difficulty: 'medium',
    expected: {
      terroir: 'docs-explorer',
      vintage: {
        style: ['clean'],
        mode: ['light', 'dark', 'auto'],
      },
      structure: {
        min_pages: 4,
        required_patterns: ['sidebar-nav', 'article-content'],
      },
      tannins: ['search', 'version-selector'],
    },
    scoring: {
      intent_keywords: ['documentation', 'API', 'code examples', 'search'],
    },
  },

  {
    id: 'CS-014',
    prompt: `Recipe sharing community platform. Users can submit recipes,
    rate and review others, create collections. Social features like following chefs.
    Warm, appetizing color palette.`,
    difficulty: 'hard',
    expected: {
      terroir: 'recipe-community',
      vintage: {
        style: ['auradecantism', 'clean'],
        mode: 'light',
      },
      structure: {
        min_pages: 5,
        required_patterns: ['card-grid', 'form-sections'],
      },
      tannins: ['auth', 'user-profiles', 'social'],
    },
    scoring: {
      intent_keywords: ['recipes', 'community', 'social', 'collections', 'reviews'],
    },
  },

  {
    id: 'CS-015',
    prompt: `Gaming community platform with tournament brackets,
    team profiles, match history, leaderboards.
    Esports aesthetic - dark, neon accents, aggressive typography.`,
    difficulty: 'hard',
    expected: {
      terroir: 'gaming-platform',
      vintage: {
        style: ['auradecantism', 'gaming-guild'],
        mode: 'dark',
      },
      structure: {
        min_pages: 5,
        required_patterns: ['leaderboard', 'card-grid'],
      },
      theme: {
        colors: ['dark', 'neon', 'aggressive'],
      },
    },
    scoring: {
      intent_keywords: ['gaming', 'esports', 'tournaments', 'leaderboards', 'neon'],
    },
  },

  {
    id: 'CS-016',
    prompt: `Financial portfolio tracker. Investment holdings, performance charts,
    goal progress, asset allocation pie charts.
    Professional, trustworthy feel. Dark mode option.`,
    difficulty: 'hard',
    expected: {
      terroir: 'financial-dashboard',
      vintage: {
        style: ['auradecantism', 'clean'],
        mode: ['dark', 'auto'],
      },
      structure: {
        min_pages: 4,
        required_patterns: ['kpi-grid', 'chart-grid', 'goal-tracker'],
      },
      character: ['professional', 'trustworthy', 'data-rich'],
    },
    scoring: {
      intent_keywords: ['financial', 'portfolio', 'investments', 'charts', 'goals'],
    },
  },

  {
    id: 'CS-017',
    prompt: `Cloud platform dashboard for managing servers, databases, and deployments.
    Resource monitoring, cost tracking, deployment logs.
    Like a simplified AWS console.`,
    difficulty: 'hard',
    expected: {
      terroir: 'cloud-platform',
      vintage: {
        style: ['auradecantism', 'clean'],
        mode: 'dark',
      },
      structure: {
        min_pages: 5,
        required_patterns: ['resource-overview', 'deploy-log', 'chart-grid'],
      },
      tannins: ['realtime-data', 'status-indicators'],
    },
    scoring: {
      intent_keywords: ['cloud', 'servers', 'deployments', 'monitoring', 'logs'],
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // VAGUE / MINIMAL PROMPTS (3 tests)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: 'CS-018',
    prompt: `Make me a landing page`,
    difficulty: 'easy',
    expected: {
      terroir: ['portfolio', 'content-site'], // either valid
      structure: {
        min_pages: 1,
        required_patterns: ['hero'],
      },
    },
    scoring: {
      expect_clarification: true, // Should ask what it's for
      intent_keywords: ['landing page'],
    },
  },

  {
    id: 'CS-019',
    prompt: `Dashboard`,
    difficulty: 'easy',
    expected: {
      terroir: 'saas-dashboard',
      structure: {
        min_pages: 1,
      },
    },
    scoring: {
      expect_clarification: true, // Should ask what kind of dashboard
    },
  },

  {
    id: 'CS-020',
    prompt: `I need a website for my business`,
    difficulty: 'easy',
    expected: {
      terroir: ['portfolio', 'content-site', 'ecommerce'], // depends on clarification
    },
    scoring: {
      expect_clarification: true, // Must ask what kind of business
    },
  },
];

export function stats() {
  const byDifficulty = { easy: 0, medium: 0, hard: 0 };
  const byTerroir = {};

  for (const entry of coldStartCorpus) {
    byDifficulty[entry.difficulty]++;
    const terroirs = Array.isArray(entry.expected.terroir)
      ? entry.expected.terroir
      : [entry.expected.terroir];
    for (const t of terroirs) {
      byTerroir[t] = (byTerroir[t] || 0) + 1;
    }
  }

  return {
    total: coldStartCorpus.length,
    byDifficulty,
    byTerroir,
  };
}
