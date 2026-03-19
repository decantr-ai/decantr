/**
 * Modification Test Corpus
 *
 * Tests changes to existing scaffolded projects.
 * Each entry specifies a base project and the modification request.
 */

export const modificationCorpus = [
  // ═══════════════════════════════════════════════════════════════════════════
  // STATE MANAGEMENT MODIFICATIONS
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: 'MOD-001',
    baseProject: 'saas-dashboard',
    prompt: `I'd like to persist my dashboard light/dark theme toggle so it remembers my preference`,
    difficulty: 'easy',
    expected: {
      behavior: 'should_ask', // Should ask: localStorage, cookie, or user profile API?
      acceptable_outcomes: [
        'localStorage persistence',
        'cookie persistence',
        'user preference API call',
      ],
      code_changes: {
        must_modify: ['src/app.js'],
        may_create: ['src/state/preferences.js'],
        should_not_create: ['src/utils/storage.js'], // Use framework primitives
      },
      framework_usage: {
        required: ['createPersisted'], // Should use Decantr's persistence primitive
        forbidden: ['raw localStorage.setItem'], // Should not bypass framework
      },
    },
    scoring: {
      tests_state_management: true,
      tests_persistence: true,
    },
  },

  {
    id: 'MOD-002',
    baseProject: 'saas-dashboard',
    prompt: `Add a global notification system. Toasts that can be triggered from anywhere in the app.`,
    difficulty: 'medium',
    expected: {
      code_changes: {
        must_modify: ['src/app.js'],
        may_create: ['src/state/notifications.js'],
      },
      framework_usage: {
        required: ['createStore', 'createSignal'],
        should_use_component: 'Toast', // Should use Decantr Toast component
      },
    },
    scoring: {
      tests_state_management: true,
      tests_component_usage: true,
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // NEW FEATURE / PAGE ADDITIONS
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: 'MOD-003',
    baseProject: 'content-site',
    prompt: `I'd like to add a new feature to my blog - a whole new page. It's going to be called Music.
    I'd like a simple music list, like Soundcloud where I can offer users the ability to hear
    my different types of music.`,
    difficulty: 'hard',
    expected: {
      behavior: 'should_create_pattern', // No music pattern exists - must create
      code_changes: {
        must_create: ['src/pages/music.js'],
        must_modify: ['src/app.js', 'decantr.essence.json'],
        may_create: ['src/patterns/music-player.js'], // Local pattern
      },
      essence_update: {
        must_add_page: {
          id: 'music',
          skeleton: ['sidebar-main', 'top-nav-main', 'full-bleed'],
        },
      },
      gap_detection: {
        missing_pattern: 'music-player',
        missing_component: 'AudioPlayer',
      },
    },
    scoring: {
      tests_novel_pattern_creation: true,
      tests_essence_update: true,
      tests_router_update: true,
    },
  },

  {
    id: 'MOD-004',
    baseProject: 'ecommerce',
    prompt: `Add a wishlist feature. Users should be able to save products they like
    and view them on a dedicated wishlist page.`,
    difficulty: 'medium',
    expected: {
      code_changes: {
        must_create: ['src/pages/wishlist.js'],
        must_modify: ['src/app.js', 'decantr.essence.json'],
      },
      essence_update: {
        must_add_page: { id: 'wishlist' },
        must_add_tannin: 'wishlist',
      },
      framework_usage: {
        required: ['createStore', 'createPersisted'],
      },
    },
    scoring: {
      tests_feature_addition: true,
      tests_state_management: true,
    },
  },

  {
    id: 'MOD-005',
    baseProject: 'saas-dashboard',
    prompt: `Add a new reports page with exportable PDF reports and scheduled email delivery options.`,
    difficulty: 'hard',
    expected: {
      code_changes: {
        must_create: ['src/pages/reports.js'],
        must_modify: ['decantr.essence.json'],
      },
      essence_update: {
        must_add_page: { id: 'reports' },
      },
      behavior: 'should_ask', // Should ask about PDF library preference, email service
    },
    scoring: {
      tests_complex_feature: true,
      tests_third_party_integration: true,
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // THIRD-PARTY INTEGRATIONS
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: 'MOD-006',
    baseProject: 'portfolio',
    prompt: `I'd like to wire up my header login button to Clerk OAuth, let's get started`,
    difficulty: 'hard',
    expected: {
      behavior: 'should_guide', // Should provide step-by-step integration guide
      code_changes: {
        must_modify: ['src/app.js'],
        may_create: ['src/auth/clerk.js'],
      },
      framework_usage: {
        should_mention: ['createAuth'], // Decantr's auth primitive
        integration_guidance: true,
      },
      env_vars: {
        should_mention: ['CLERK_PUBLISHABLE_KEY', 'CLERK_SECRET_KEY'],
      },
    },
    scoring: {
      tests_auth_integration: true,
      tests_guidance_quality: true,
    },
  },

  {
    id: 'MOD-007',
    baseProject: 'ecommerce',
    prompt: `Integrate Stripe for payments. Add a checkout flow with card input.`,
    difficulty: 'hard',
    expected: {
      behavior: 'should_guide',
      code_changes: {
        must_create: ['src/pages/checkout.js'],
        may_create: ['src/payments/stripe.js'],
      },
      env_vars: {
        should_mention: ['STRIPE_PUBLISHABLE_KEY'],
      },
    },
    scoring: {
      tests_payment_integration: true,
    },
  },

  {
    id: 'MOD-008',
    baseProject: 'content-site',
    prompt: `Add Google Analytics tracking to the site`,
    difficulty: 'easy',
    expected: {
      code_changes: {
        must_modify: ['public/index.html', 'src/app.js'],
      },
      framework_usage: {
        should_use: ['createTelemetry'], // Decantr's telemetry tannin
      },
    },
    scoring: {
      tests_analytics_integration: true,
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // DEPLOYMENT / BUILD
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: 'MOD-009',
    baseProject: 'portfolio',
    prompt: `I'd like to deploy this site to Vercel but it doesn't have a build option
    in the dropdown for Decantr, can you help?`,
    difficulty: 'easy',
    expected: {
      behavior: 'should_guide',
      guidance: {
        must_mention: ['npx decantr build', 'dist/', 'static site'],
        should_provide: ['vercel.json config', 'build command setting'],
      },
      no_code_changes: true, // Should just be guidance
    },
    scoring: {
      tests_deployment_guidance: true,
    },
  },

  {
    id: 'MOD-010',
    baseProject: 'saas-dashboard',
    prompt: `Set up GitHub Actions CI/CD pipeline for this project`,
    difficulty: 'medium',
    expected: {
      code_changes: {
        must_create: ['.github/workflows/ci.yml'],
      },
      guidance: {
        must_mention: ['npm test', 'npx decantr build', 'lint'],
      },
    },
    scoring: {
      tests_ci_setup: true,
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // STYLE / THEME MODIFICATIONS
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: 'MOD-011',
    baseProject: 'saas-dashboard',
    prompt: `Change the color scheme to use purple instead of blue as the primary color`,
    difficulty: 'easy',
    expected: {
      code_changes: {
        must_modify: ['public/index.html'], // CSS variables
      },
      essence_should_stay: true, // Cork should allow color changes
      compliance: {
        must_use: 'css-variables',
        forbidden: ['inline-styles', 'hardcoded-colors'],
      },
    },
    scoring: {
      tests_theme_modification: true,
      tests_compliance: true,
    },
  },

  {
    id: 'MOD-012',
    baseProject: 'portfolio',
    prompt: `Switch from dark mode to light mode as the default`,
    difficulty: 'easy',
    expected: {
      code_changes: {
        must_modify: ['src/app.js', 'decantr.essence.json'],
      },
      essence_update: {
        must_change: { 'vintage.mode': 'light' },
      },
    },
    scoring: {
      tests_mode_change: true,
    },
  },

  {
    id: 'MOD-013',
    baseProject: 'content-site',
    prompt: `I want rounder corners on all the cards and buttons`,
    difficulty: 'easy',
    expected: {
      code_changes: {
        must_modify: ['decantr.essence.json', 'public/index.html'],
      },
      essence_update: {
        must_change: { 'vintage.shape': 'pill' },
      },
    },
    scoring: {
      tests_shape_modification: true,
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // COMPONENT MODIFICATIONS
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: 'MOD-014',
    baseProject: 'saas-dashboard',
    prompt: `Add a new column to the users data table showing last login date`,
    difficulty: 'easy',
    expected: {
      code_changes: {
        must_modify: ['src/pages/users.js'],
      },
      compliance: {
        must_use: 'DataTable columns prop',
        forbidden: ['manual table HTML'],
      },
    },
    scoring: {
      tests_component_modification: true,
    },
  },

  {
    id: 'MOD-015',
    baseProject: 'ecommerce',
    prompt: `Add product reviews and ratings to the product detail page`,
    difficulty: 'medium',
    expected: {
      code_changes: {
        must_modify: ['src/pages/product-detail.js'],
        may_create: ['src/components/ReviewList.js', 'src/components/StarRating.js'],
      },
      framework_usage: {
        should_use: ['Rating component'], // If exists
      },
    },
    scoring: {
      tests_feature_addition: true,
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // NAVIGATION / ROUTING
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: 'MOD-016',
    baseProject: 'saas-dashboard',
    prompt: `Add breadcrumb navigation to all pages`,
    difficulty: 'medium',
    expected: {
      code_changes: {
        must_modify: ['src/app.js'],
      },
      framework_usage: {
        must_use: ['Breadcrumb component', 'useRoute'],
      },
    },
    scoring: {
      tests_navigation: true,
    },
  },

  {
    id: 'MOD-017',
    baseProject: 'docs-explorer',
    prompt: `Add keyboard navigation - arrow keys to move between sections,
    slash to focus search`,
    difficulty: 'medium',
    expected: {
      code_changes: {
        must_modify: ['src/app.js'],
      },
      framework_usage: {
        should_use: ['onMount', 'addEventListener'],
      },
    },
    scoring: {
      tests_keyboard_navigation: true,
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // DATA / API MODIFICATIONS
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: 'MOD-018',
    baseProject: 'saas-dashboard',
    prompt: `Replace the mock data with real API calls to our backend at api.example.com`,
    difficulty: 'medium',
    expected: {
      behavior: 'should_ask', // Should ask about auth, endpoints, etc.
      code_changes: {
        may_create: ['src/api/client.js'],
        must_modify: ['src/pages/overview.js'], // Or wherever data is fetched
      },
      framework_usage: {
        must_use: ['createQuery', 'queryClient'],
      },
    },
    scoring: {
      tests_api_integration: true,
    },
  },

  {
    id: 'MOD-019',
    baseProject: 'content-site',
    prompt: `Add a search feature that searches through all articles`,
    difficulty: 'medium',
    expected: {
      code_changes: {
        must_modify: ['src/app.js'],
        may_create: ['src/components/Search.js'],
      },
      framework_usage: {
        should_use: ['Command component', 'createSignal'],
      },
    },
    scoring: {
      tests_search_implementation: true,
    },
  },

  {
    id: 'MOD-020',
    baseProject: 'ecommerce',
    prompt: `Implement real-time inventory updates - show "Only X left!" when stock is low`,
    difficulty: 'hard',
    expected: {
      code_changes: {
        must_modify: ['src/pages/product-detail.js'],
      },
      framework_usage: {
        may_use: ['WebSocket', 'createSignal', 'createEffect'],
      },
      tannins: ['realtime-data'],
    },
    scoring: {
      tests_realtime_data: true,
    },
  },
];

export function stats() {
  const byDifficulty = { easy: 0, medium: 0, hard: 0 };
  const byBaseProject = {};

  for (const entry of modificationCorpus) {
    byDifficulty[entry.difficulty]++;
    byBaseProject[entry.baseProject] = (byBaseProject[entry.baseProject] || 0) + 1;
  }

  return {
    total: modificationCorpus.length,
    byDifficulty,
    byBaseProject,
  };
}
