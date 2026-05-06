export interface Article {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  readingTime: string;
  category: string;
  image: string;
  featured: boolean;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  articleCount: number;
  icon: string;
}

export interface Draft {
  id: string;
  title: string;
  excerpt: string;
  status: 'draft' | 'review' | 'scheduled';
  updatedAt: string;
  wordCount: number;
}

export interface NewsletterIssue {
  id: string;
  title: string;
  description: string;
  date: string;
  readingTime: string;
  subscriberCount: number;
}

export const author = {
  name: 'Elena Vasquez',
  title: 'Editor-in-Chief',
  bio: 'Writing about technology, design, and the spaces between. Former staff writer at The Atlantic. Exploring how we build for the web.',
  avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=face',
  location: 'Brooklyn, NY',
  email: 'elena@theparagraph.co',
  subscribers: 12400,
};

export const articles: Article[] = [
  {
    id: 'design-tokens-language',
    title: 'Design Tokens Are a Language, Not a Library',
    excerpt: 'Tokens bridge the gap between design and engineering. But treating them as just another dependency misses the point entirely.',
    content: `Tokens bridge the gap between design and engineering. But treating them as just another dependency misses the point entirely. They are a shared vocabulary — a contract between disciplines that enables autonomy without chaos.

When a designer says "use the primary background," both they and the engineer should resolve that to the same value, regardless of platform. That's the promise of design tokens. But the reality is messier than the pitch decks suggest.

The most successful token systems I've encountered share three traits: they're semantic (naming conveys intent, not value), they're layered (primitives compose into decisions), and they're documented with context (when to use each token, and why).

Start with the smallest possible set. Five colors, four spacing values, two type scales. Let real usage reveal what's missing rather than pre-building for imaginary scenarios. A lean token vocabulary that everyone understands beats an exhaustive dictionary that nobody reads.`,
    author: 'Elena Vasquez',
    date: '2026-03-28',
    readingTime: '7 min',
    category: 'Design Systems',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&h=500&fit=crop',
    featured: true,
  },
  {
    id: 'quiet-interface',
    title: 'The Quiet Interface',
    excerpt: 'The best interfaces don\'t announce themselves. They recede, letting content breathe. A meditation on restraint in digital product design.',
    content: `The best interfaces don't announce themselves. They recede, letting content and user intent occupy the foreground. This is harder than it sounds — restraint requires confidence.

Every element you add to a screen competes for attention. A subtle border here, a badge there, a tooltip that fires on hover. Individually harmless. Collectively, noise. The quiet interface asks a different question: what can we remove?

Typography does the heavy lifting in a quiet interface. A clear hierarchy — one dominant heading, supporting body text, subdued metadata — replaces the need for boxes, dividers, and color coding. When the type is well-set, the structure reveals itself.

White space isn't empty. It's active. It creates relationships, establishes rhythm, and gives the eye a place to rest. Generous margins around a paragraph signal importance. Tight spacing between a label and its value signals belonging. The quiet interface speaks through spacing.`,
    author: 'Elena Vasquez',
    date: '2026-03-21',
    readingTime: '5 min',
    category: 'Design',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&h=500&fit=crop',
    featured: true,
  },
  {
    id: 'typescript-narrowing',
    title: 'TypeScript Narrowing: Beyond the Basics',
    excerpt: 'Discriminated unions, assertion functions, and the subtle art of making impossible states unrepresentable.',
    content: `Type narrowing is where TypeScript shifts from a type-annotation layer into a genuine design tool. It lets you encode business rules directly into the type system, making illegal states uncompilable.

Discriminated unions are the workhorse. A tagged union with a "kind" field lets TypeScript narrow automatically inside switch statements. But the real power emerges when you combine them with exhaustiveness checks — a default case that accepts "never" ensures you handle every variant.

Assertion functions are underused. A function signature like "asserts value is User" tells TypeScript to narrow the type after the call returns. This is perfect for validation boundaries: parse incoming data, assert its shape, and enjoy full type safety downstream.

The goal isn't to add types to JavaScript. It's to make your data model so precise that entire categories of bugs become structurally impossible. That's the shift from "TypeScript as linter" to "TypeScript as design language."`,
    author: 'Marcus Chen',
    date: '2026-03-14',
    readingTime: '9 min',
    category: 'Engineering',
    image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=500&fit=crop',
    featured: false,
  },
  {
    id: 'reading-on-screens',
    title: 'We Forgot How to Read on Screens',
    excerpt: 'Infinite scroll trained us to skim. Can thoughtful typesetting and pacing bring deep reading back to the browser?',
    content: `The average time spent on a long-form article online is 72 seconds. That's not reading — it's reconnaissance. We scan headlines, sample opening paragraphs, and move on. Infinite scroll trained us to treat text as a stream to be sampled, not a narrative to be followed.

But the problem isn't attention spans. It's the reading environment. A 2,000-word article sandwiched between a sticky nav, a newsletter popup, a cookie banner, and a "related articles" sidebar never had a chance. The content is fine. The container is hostile.

The fix is environmental. Strip the chrome. Set the text at a comfortable measure — 65 to 75 characters per line. Use generous line-height (1.6 to 1.8 for body text). Let paragraphs breathe with vertical spacing. Choose a typeface that's been optimized for screen rendering.

These aren't aesthetic preferences. They're ergonomic requirements. Just as a well-designed chair supports the body for hours of sitting, well-set text supports the mind for sustained reading.`,
    author: 'Elena Vasquez',
    date: '2026-03-07',
    readingTime: '6 min',
    category: 'Typography',
    image: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=800&h=500&fit=crop',
    featured: false,
  },
  {
    id: 'css-layers-cascade',
    title: 'CSS Cascade Layers Changed Everything',
    excerpt: 'Forget specificity wars. @layer gives you explicit control over which styles win — and it works today.',
    content: `For twenty years, CSS specificity was a puzzle with no clean solution. Important declarations fought inline styles, component libraries clashed with global resets, and utility classes needed ever-more-specific selectors to win.

Cascade layers solve this. The @layer rule lets you declare explicit priority tiers. A style in a higher layer always beats a style in a lower layer, regardless of specificity. Reset < tokens < treatments < decorators < utilities < app. Done.

This changes how you architect CSS. Instead of fighting the cascade, you design it. Base treatments go in the treatments layer. Theme-specific decorators go in the decorators layer. One-off overrides go in the app layer. Conflicts resolve predictably because you defined the resolution order upfront.

The mental model shift is profound: stop thinking about which selector is more specific and start thinking about which layer a style belongs to.`,
    author: 'Priya Sharma',
    date: '2026-02-28',
    readingTime: '8 min',
    category: 'Engineering',
    image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&h=500&fit=crop',
    featured: false,
  },
  {
    id: 'accessibility-debt',
    title: 'Accessibility Debt Is Design Debt',
    excerpt: 'When we defer accessibility, we\'re not cutting corners on compliance. We\'re building interfaces that exclude people.',
    content: `Every time a team says "we'll add accessibility later," they're making a design decision. They're deciding that some users don't matter yet. That's not a technical shortcut — it's an ethical choice dressed up as a prioritization call.

Accessibility debt compounds faster than technical debt. A missing heading structure is easy to fix in a component. But when fifty pages use that component, each with its own navigation assumptions, retrofitting becomes archaeology.

The argument for building accessible from day one isn't moral (though it is). It's economic. Screen reader testing catches layout bugs that sighted testing misses. Keyboard navigation reveals focus management problems that affect all users. Color contrast requirements push you toward better visual hierarchy.

Accessible interfaces aren't a tax on good design. They're a forcing function for it.`,
    author: 'Elena Vasquez',
    date: '2026-02-20',
    readingTime: '5 min',
    category: 'Accessibility',
    image: 'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=800&h=500&fit=crop',
    featured: false,
  },
  {
    id: 'component-api-design',
    title: 'Designing Component APIs That Last',
    excerpt: 'Props are your public interface. Get them wrong and every consumer pays the tax. A guide to API design for UI components.',
    content: `A component's prop interface is its most important design decision. More than its visual appearance, more than its internal implementation. Props are the contract you offer to every consumer, and contracts are hard to change.

Start with the minimum viable API. A Button needs children and an onClick. Maybe a variant. Resist the urge to add size, color, leftIcon, rightIcon, isLoading, isDisabled, as, and tooltip in the first version. Every prop you add is a prop you maintain forever.

Composition over configuration. Instead of a leftIcon prop, let consumers pass any element as children. Instead of an isLoading prop with a built-in spinner, export a Spinner component they can compose. This keeps your API surface small and your component flexible.

Name props for what they do, not how they look. "variant" over "color." "density" over "size." "emphasis" over "bold." Semantic names survive redesigns. Visual names become lies when the design changes.`,
    author: 'Marcus Chen',
    date: '2026-02-12',
    readingTime: '10 min',
    category: 'Engineering',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=500&fit=crop',
    featured: false,
  },
  {
    id: 'editorial-design-web',
    title: 'Bringing Editorial Design to the Web',
    excerpt: 'Print has centuries of typographic wisdom. The web has div soup. It\'s time we closed the gap.',
    content: `Open any well-designed magazine. Notice the hierarchy: a dominant headline, a supporting deck, a byline set in a contrasting weight, body text at a comfortable measure with generous leading. Every element has a role. Nothing is arbitrary.

Now open most websites. The hierarchy is there, technically — h1 through h6 exist. But the craft is missing. Headlines are bold because the component library defaults to bold. Body text spans the full viewport because nobody set a max-width. Line-height is 1.5 because that's what the reset says.

Editorial design on the web requires the same intentionality as print. Set your measure. Choose your scale. Decide where the eye enters the page and how it flows through the content. Use whitespace to create tempo — tight for urgency, generous for contemplation.

The tools are there. CSS Grid, container queries, variable fonts, cascade layers. The web can match print's typographic sophistication. We just have to decide it matters.`,
    author: 'Elena Vasquez',
    date: '2026-02-05',
    readingTime: '6 min',
    category: 'Typography',
    image: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=800&h=500&fit=crop',
    featured: false,
  },
];

export const categories: Category[] = [
  { id: 'design-systems', name: 'Design Systems', description: 'Tokens, components, and the architecture of visual consistency.', articleCount: 4, icon: 'Layers' },
  { id: 'engineering', name: 'Engineering', description: 'TypeScript, architecture patterns, and frontend infrastructure.', articleCount: 6, icon: 'Code2' },
  { id: 'typography', name: 'Typography', description: 'Type on screen — measure, hierarchy, and the craft of reading.', articleCount: 3, icon: 'Type' },
  { id: 'design', name: 'Design', description: 'Visual craft, restraint, and the philosophy of digital interfaces.', articleCount: 5, icon: 'Palette' },
  { id: 'accessibility', name: 'Accessibility', description: 'Building for everyone. Beyond compliance, toward inclusion.', articleCount: 2, icon: 'Eye' },
  { id: 'performance', name: 'Performance', description: 'Speed as a feature. Metrics, optimizations, and user perception.', articleCount: 3, icon: 'Zap' },
];

export const drafts: Draft[] = [
  { id: 'draft-1', title: 'The Case for Semantic HTML in 2026', excerpt: 'Why native elements still beat custom components for most use cases.', status: 'draft', updatedAt: '2026-04-02', wordCount: 1240 },
  { id: 'draft-2', title: 'Container Queries Changed My Layout Strategy', excerpt: 'Moving from viewport-based to component-based responsive design.', status: 'review', updatedAt: '2026-04-01', wordCount: 2100 },
  { id: 'draft-3', title: 'Color Systems That Scale', excerpt: 'From hand-picked palettes to algorithmic color generation.', status: 'draft', updatedAt: '2026-03-30', wordCount: 890 },
  { id: 'draft-4', title: 'Motion Design for Developers', excerpt: 'A practical guide to meaningful animation in web interfaces.', status: 'scheduled', updatedAt: '2026-03-28', wordCount: 3200 },
  { id: 'draft-5', title: 'The RSS Renaissance', excerpt: 'Why independent publishing is making a quiet comeback.', status: 'draft', updatedAt: '2026-03-25', wordCount: 560 },
];

export const newsletterArchive: NewsletterIssue[] = [
  { id: 'issue-24', title: 'On Restraint', description: 'Why the best design decisions are the ones you don\'t make. Plus: cascade layers in production, and a typography tool worth bookmarking.', date: '2026-03-29', readingTime: '4 min', subscriberCount: 12400 },
  { id: 'issue-23', title: 'The Reading Stack', description: 'Long-form links on design systems, web typography, and building for accessibility. Curated from the past two weeks.', date: '2026-03-15', readingTime: '3 min', subscriberCount: 12200 },
  { id: 'issue-22', title: 'Tools of the Trade', description: 'The software, workflows, and mental models I use to write, design, and ship. A behind-the-scenes look at the editorial process.', date: '2026-03-01', readingTime: '5 min', subscriberCount: 11900 },
  { id: 'issue-21', title: 'Design Tokens Deep Dive', description: 'Everything I\'ve learned about token architecture after implementing systems for three different organizations.', date: '2026-02-15', readingTime: '6 min', subscriberCount: 11500 },
  { id: 'issue-20', title: 'Year in Review', description: 'The articles, ideas, and conversations that shaped my thinking in 2025. A retrospective.', date: '2026-02-01', readingTime: '4 min', subscriberCount: 11200 },
  { id: 'issue-19', title: 'Writing for the Web', description: 'How screen reading differs from print reading, and what that means for how we structure our prose.', date: '2026-01-15', readingTime: '5 min', subscriberCount: 10800 },
  { id: 'issue-18', title: 'Accessible by Default', description: 'The shift from "adding accessibility" to building with it from the start. Case studies and patterns.', date: '2026-01-01', readingTime: '4 min', subscriberCount: 10500 },
  { id: 'issue-17', title: 'Component Boundaries', description: 'Where to draw the line between a component and a composition. Principles for sustainable component architecture.', date: '2025-12-15', readingTime: '5 min', subscriberCount: 10100 },
];

export const testimonials = [
  {
    quote: 'The Paragraph is the only newsletter I read start to finish. Elena\'s writing on design systems is clear, practical, and refreshingly honest.',
    name: 'Sarah Kim',
    role: 'Design Lead, Stripe',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
  },
  {
    quote: 'Finally, someone writing about web typography with the depth it deserves. Every issue teaches me something I can use immediately.',
    name: 'James Okonkwo',
    role: 'Senior Engineer, Vercel',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
  },
  {
    quote: 'I\'ve redesigned our entire token system based on Elena\'s articles. The clarity of her thinking translates directly into better architecture.',
    name: 'Aiko Tanaka',
    role: 'Staff Designer, Figma',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face',
  },
];
