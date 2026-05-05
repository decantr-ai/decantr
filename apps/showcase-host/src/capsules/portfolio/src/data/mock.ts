export interface Project {
  id: string;
  title: string;
  category: string;
  description: string;
  longDescription: string;
  image: string;
  tags: string[];
  year: number;
  role: string;
  client: string;
  gallery: string[];
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  readingTime: string;
  category: string;
  image: string;
  content: string;
}

export interface Skill {
  name: string;
  level: number;
  category: string;
  icon: string;
}

export const bio = {
  name: 'Alex Mercer',
  title: 'Creative Developer & Designer',
  tagline: 'I craft digital experiences that live at the intersection of design and engineering.',
  about: `I'm a creative developer with 8+ years of experience building interfaces that feel as good as they look. I believe the best digital products are born from deep collaboration between design and engineering — and I thrive in that space.

My work spans brand identities, interactive installations, data visualizations, and full-stack web applications. I'm drawn to projects that push boundaries and demand both technical precision and creative vision.

When I'm not building, I'm writing about design systems, mentoring junior developers, or exploring generative art with WebGL and GLSL shaders.`,
  location: 'San Francisco, CA',
  email: 'alex@mercer.studio',
  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
  social: {
    github: 'https://github.com',
    twitter: 'https://twitter.com',
    linkedin: 'https://linkedin.com',
    dribbble: 'https://dribbble.com',
  },
};

export const projects: Project[] = [
  {
    id: 'aurora-dashboard',
    title: 'Aurora Dashboard',
    category: 'Web Application',
    description: 'A real-time analytics dashboard with fluid data visualizations and dark-mode-first design.',
    longDescription: `Aurora Dashboard reimagines how teams interact with complex data. Built for a fintech startup, the interface prioritizes clarity through generous whitespace, fluid animations, and a thoughtfully crafted dark palette that reduces eye strain during long monitoring sessions.

The visualization layer uses WebGL for rendering thousands of data points at 60fps, while the component architecture ensures every widget is independently configurable and theme-aware.`,
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop',
    tags: ['React', 'WebGL', 'D3.js', 'TypeScript'],
    year: 2025,
    role: 'Lead Developer & Designer',
    client: 'Nexus Finance',
    gallery: [
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=1200&h=800&fit=crop',
    ],
  },
  {
    id: 'meridian-brand',
    title: 'Meridian Brand Identity',
    category: 'Branding',
    description: 'Complete brand system for a sustainable architecture firm — logo, type, color, and digital guidelines.',
    longDescription: `Meridian needed a brand that communicated precision, sustainability, and forward-thinking design. The identity system draws from architectural geometry — clean lines, deliberate spacing, and a restrained color palette that evokes natural materials.

Deliverables included a responsive logo system, custom typeface pairings, a comprehensive color system with accessibility-checked contrast ratios, and a 120-page digital brand guideline.`,
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&h=600&fit=crop',
    tags: ['Branding', 'Typography', 'Figma', 'Motion'],
    year: 2025,
    role: 'Brand Designer',
    client: 'Meridian Architecture',
    gallery: [
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=1200&h=800&fit=crop',
    ],
  },
  {
    id: 'pulse-music',
    title: 'Pulse Music Player',
    category: 'Mobile App',
    description: 'A gesture-driven music player with audio-reactive visuals and haptic feedback integration.',
    longDescription: `Pulse transforms the listening experience into something tangible. Every interaction — scrubbing through a track, adjusting volume, switching playlists — is driven by fluid gestures with haptic feedback that makes the interface feel physical.

The audio-reactive visualization engine analyzes frequency data in real time, generating abstract artwork unique to every song. The result is a music player that doesn't just play audio — it creates a visual companion for every track.`,
    image: 'https://images.unsplash.com/photo-1614680376593-902f74cf0d41?w=800&h=600&fit=crop',
    tags: ['React Native', 'Web Audio API', 'Canvas', 'Haptics'],
    year: 2024,
    role: 'Full-Stack Developer',
    client: 'Personal Project',
    gallery: [
      'https://images.unsplash.com/photo-1614680376593-902f74cf0d41?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200&h=800&fit=crop',
    ],
  },
  {
    id: 'terraform-docs',
    title: 'Terraform Documentation',
    category: 'Design System',
    description: 'A developer documentation site with interactive code playgrounds and intelligent search.',
    longDescription: `Technical documentation doesn't have to be dry. Terraform's docs site combines clean reading typography with interactive code blocks that let developers experiment without leaving the page.

The search system uses semantic indexing to surface relevant results even with imprecise queries. Every page loads in under 200ms thanks to aggressive prefetching and edge caching.`,
    image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=600&fit=crop',
    tags: ['Next.js', 'MDX', 'Algolia', 'Edge Functions'],
    year: 2024,
    role: 'Frontend Architect',
    client: 'Terraform Labs',
    gallery: [
      'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&h=800&fit=crop',
    ],
  },
  {
    id: 'solstice-ecommerce',
    title: 'Solstice Commerce',
    category: 'Web Application',
    description: 'A luxury e-commerce platform with 3D product previews and personalized shopping experiences.',
    longDescription: `Solstice pushes the boundaries of online retail with Three.js-powered 3D product previews, AI-driven personalization, and micro-interactions that make browsing feel premium. The checkout flow was redesigned to reduce abandonment by 34%.

Performance was critical — the site achieves a 98 Lighthouse score while delivering rich visual experiences through progressive loading and GPU-accelerated animations.`,
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&fit=crop',
    tags: ['Three.js', 'Next.js', 'Stripe', 'AI/ML'],
    year: 2024,
    role: 'Tech Lead',
    client: 'Solstice Luxury',
    gallery: [
      'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=1200&h=800&fit=crop',
    ],
  },
  {
    id: 'wavelength-viz',
    title: 'Wavelength Data Viz',
    category: 'Data Visualization',
    description: 'An interactive climate data visualization exploring 150 years of temperature anomalies.',
    longDescription: `Wavelength tells the story of climate change through interactive data visualization. Users can explore 150 years of global temperature data, filtering by region, season, and emission scenario.

Built with D3.js and Canvas for performance, the visualization handles millions of data points while maintaining smooth 60fps interactions. The narrative layer guides casual visitors through the data while giving researchers tools for deep exploration.`,
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop',
    tags: ['D3.js', 'Canvas', 'Python', 'Data Science'],
    year: 2023,
    role: 'Creative Developer',
    client: 'Climate Research Institute',
    gallery: [
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=1200&h=800&fit=crop',
    ],
  },
];

export const blogPosts: BlogPost[] = [
  {
    id: 'design-systems-at-scale',
    title: 'Building Design Systems That Actually Scale',
    excerpt: 'Most design systems fail not because of bad components, but because of bad contracts. Here\'s how to build systems that grow with your team.',
    date: '2026-03-15',
    readingTime: '8 min read',
    category: 'Design Systems',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&h=400&fit=crop',
    content: `Most design systems fail not because of bad components, but because of bad contracts between design and engineering. After building systems for teams of 5 to 500, here's what I've learned.

## The Contract Problem

A button component isn't just a visual element — it's a contract. It promises consistent behavior, accessible interactions, and predictable styling across every surface it appears on. When that contract breaks, trust erodes.

The best design systems I've worked with treat every component as an API. They have versioning, deprecation policies, and migration guides. They document not just *what* a component does, but *why* it exists and *when* to use it.

## Tokens Over Themes

Design tokens are the foundation of any scalable system. They create a shared vocabulary between designers and engineers that survives team changes, rebrandings, and platform expansions.

Start with primitive tokens (colors, spacing, typography), compose them into semantic tokens (background-primary, gap-content), and let components consume only semantic tokens. This indirection is what makes theming possible without touching component code.

## The Testing Gap

Visual regression testing catches pixel-level changes, but it misses the interactions that make or break a component. Invest in interaction testing: keyboard navigation, screen reader announcements, focus management, and state transitions.

A component that looks right but can't be operated with a keyboard is a broken component.`,
  },
  {
    id: 'webgl-generative-art',
    title: 'Getting Started with Generative Art in WebGL',
    excerpt: 'A practical introduction to creating generative artwork using GLSL shaders and the Web Audio API for audio-reactive visuals.',
    date: '2026-02-28',
    readingTime: '12 min read',
    category: 'Creative Coding',
    image: 'https://images.unsplash.com/photo-1614680376593-902f74cf0d41?w=800&h=400&fit=crop',
    content: `Generative art bridges the gap between programming and visual expression. With WebGL and GLSL shaders, your browser becomes an infinite canvas. Let me walk you through the fundamentals.

## Why WebGL?

Canvas 2D is great for simple shapes, but when you need millions of pixels updated 60 times per second, you need the GPU. WebGL gives you direct access to graphics hardware through GLSL — a C-like language that runs on every pixel simultaneously.

## Your First Shader

A fragment shader receives coordinates and outputs a color. That's it. The magic comes from the math you use to transform those coordinates into colors.

Start with simple gradients, add noise functions for organic textures, and layer multiple effects to create complex compositions. The feedback loop between code and visual output is incredibly rewarding.

## Audio Reactivity

The Web Audio API's AnalyserNode gives you real-time frequency data from any audio source. Pass this data to your shader as a uniform, and suddenly your visuals dance with the music.

Map bass frequencies to large, slow movements and high frequencies to small, fast details. The key is subtlety — the best audio-reactive visuals feel organic, not mechanical.`,
  },
  {
    id: 'performance-dark-mode',
    title: 'The Performance Cost of Dark Mode (And How to Fix It)',
    excerpt: 'Dark mode isn\'t free. From repaints to color calculations, here\'s what it costs and how to make it fast.',
    date: '2026-02-10',
    readingTime: '6 min read',
    category: 'Performance',
    image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=400&fit=crop',
    content: `Dark mode is no longer optional — users expect it. But implementing it naively can introduce performance issues that are easy to miss. Here's what I've learned from optimizing dark mode across large applications.

## The Repaint Problem

Toggling a class on the root element triggers a full-page repaint. For complex layouts with many layers, this can cause a visible flash. The fix: use CSS custom properties and color-scheme media queries so the browser can optimize the transition.

## Color Calculations at Scale

Using color-mix() and relative color functions is powerful but expensive at scale. If you have hundreds of elements each computing colors at paint time, you'll notice. Pre-compute your palette in CSS custom properties and reference them directly.

## Images and Contrast

The most overlooked dark mode issue is image contrast. A product photo shot on a white background looks terrible on a dark surface. Use mix-blend-mode or apply subtle borders to give images definition against dark backgrounds.

## Testing

Don't just test light and dark — test the transition between them. Users toggle modes frequently, and the switch should feel instant and flicker-free.`,
  },
  {
    id: 'accessibility-beyond-checklist',
    title: 'Accessibility Beyond the Checklist',
    excerpt: 'WCAG compliance is the floor, not the ceiling. How to build experiences that genuinely include everyone.',
    date: '2026-01-20',
    readingTime: '10 min read',
    category: 'Accessibility',
    image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&h=400&fit=crop',
    content: `Passing an accessibility audit is necessary but not sufficient. Real accessibility means building experiences that work for the full spectrum of human ability. Here's how to move beyond the checklist.

## Focus Management Is UX

Most accessibility work focuses on ARIA labels and color contrast. These matter, but focus management is where the real UX lives. When a user opens a modal, where does focus go? When they close it, where does focus return? These transitions should feel natural, not jarring.

## Keyboard Navigation Patterns

Every interactive element needs a keyboard story. Not just "can I reach it with Tab" but "does the interaction model make sense?" A dropdown menu should use arrow keys, not Tab. A date picker should support both keyboard entry and arrow key navigation.

## The Cognitive Load Question

Accessibility isn't just about sensory and motor abilities. Cognitive accessibility — clear language, predictable layouts, minimal distractions — benefits everyone. A well-designed empty state with a single clear action helps both a screen reader user and a stressed-out CEO.

## Test With Real Users

Automated tools catch about 30% of accessibility issues. The rest require human testing. Build relationships with users who rely on assistive technology and include them in your design process from the start.`,
  },
];

export const skills: Skill[] = [
  { name: 'React', level: 95, category: 'Frontend', icon: 'Code2' },
  { name: 'TypeScript', level: 92, category: 'Frontend', icon: 'FileCode' },
  { name: 'Next.js', level: 90, category: 'Frontend', icon: 'Globe' },
  { name: 'CSS/Design Systems', level: 94, category: 'Frontend', icon: 'Palette' },
  { name: 'WebGL/Three.js', level: 82, category: 'Frontend', icon: 'Box' },
  { name: 'D3.js', level: 85, category: 'Frontend', icon: 'BarChart3' },
  { name: 'Node.js', level: 88, category: 'Backend', icon: 'Server' },
  { name: 'PostgreSQL', level: 80, category: 'Backend', icon: 'Database' },
  { name: 'GraphQL', level: 78, category: 'Backend', icon: 'GitBranch' },
  { name: 'Docker', level: 75, category: 'DevOps', icon: 'Container' },
  { name: 'Figma', level: 90, category: 'Design', icon: 'Figma' },
  { name: 'Motion Design', level: 82, category: 'Design', icon: 'Clapperboard' },
  { name: 'Accessibility', level: 92, category: 'Craft', icon: 'Eye' },
  { name: 'Performance', level: 88, category: 'Craft', icon: 'Zap' },
  { name: 'Technical Writing', level: 85, category: 'Craft', icon: 'PenTool' },
];
