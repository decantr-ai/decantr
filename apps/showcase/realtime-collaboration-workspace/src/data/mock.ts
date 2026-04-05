/* ── Mock data for Realtime Collaboration Workspace showcase ── */

export interface Collaborator {
  id: string;
  name: string;
  initials: string;
  color: string;
  status: 'active' | 'idle' | 'offline';
  cursor?: { line: number; x: number };
}

export interface DocNode {
  id: string;
  title: string;
  icon: string;
  children?: DocNode[];
}

export interface Document {
  id: string;
  title: string;
  icon: string;
  updatedAt: string;
  updatedBy: string;
  blocks: DocBlock[];
}

export interface DocBlock {
  id: string;
  type: 'h1' | 'h2' | 'h3' | 'p' | 'ul' | 'quote' | 'code';
  content: string;
  items?: string[];
}

export interface Comment {
  id: string;
  author: string;
  initials: string;
  color: string;
  body: string;
  timestamp: string;
  resolved?: boolean;
  replies?: { author: string; initials: string; color: string; body: string; timestamp: string }[];
}

export interface Revision {
  id: string;
  author: string;
  initials: string;
  color: string;
  summary: string;
  timestamp: string;
  current?: boolean;
}

export interface ActivityItem {
  id: string;
  type: 'edit' | 'comment' | 'share' | 'create' | 'mention';
  actor: string;
  initials: string;
  color: string;
  target: string;
  timestamp: string;
}

export interface RecentDoc {
  id: string;
  title: string;
  icon: string;
  updatedAt: string;
  collaborators: string[];
}

export interface KanbanCard {
  id: string;
  title: string;
  assignee: string;
  initials: string;
  color: string;
  labels: string[];
}

export interface KanbanColumn {
  id: string;
  title: string;
  cards: KanbanCard[];
}

export interface Member {
  id: string;
  name: string;
  email: string;
  initials: string;
  color: string;
  role: 'Owner' | 'Admin' | 'Editor' | 'Viewer';
  lastActive: string;
}

/* ── Collaborators with warm colors ── */
export const collaborators: Collaborator[] = [
  { id: 'c1', name: 'Mira Chen', initials: 'MC', color: '#2E8B8B', status: 'active', cursor: { line: 3, x: 180 } },
  { id: 'c2', name: 'Jordan Reese', initials: 'JR', color: '#E07B4C', status: 'active', cursor: { line: 7, x: 64 } },
  { id: 'c3', name: 'Priya Shah', initials: 'PS', color: '#B8860B', status: 'active', cursor: { line: 11, x: 220 } },
  { id: 'c4', name: 'Sam Okafor', initials: 'SO', color: '#8B4789', status: 'idle' },
  { id: 'c5', name: 'Lia Park', initials: 'LP', color: '#5C7F3C', status: 'idle' },
  { id: 'c6', name: 'Theo Blake', initials: 'TB', color: '#C74E5B', status: 'offline' },
];

/* ── Page tree ── */
export const pageTree: DocNode[] = [
  {
    id: 'getting-started',
    title: 'Welcome to Lumen',
    icon: '👋',
    children: [
      { id: 'onboarding', title: 'Onboarding Checklist', icon: '✅' },
      { id: 'quickstart', title: 'Quick Start Guide', icon: '🚀' },
    ],
  },
  {
    id: 'product',
    title: 'Product',
    icon: '📦',
    children: [
      { id: 'roadmap', title: 'Q2 Roadmap', icon: '🗺️' },
      { id: 'specs', title: 'Feature Specs', icon: '📐' },
      { id: 'research', title: 'User Research', icon: '🔍' },
    ],
  },
  {
    id: 'design',
    title: 'Design',
    icon: '🎨',
    children: [
      { id: 'system', title: 'Design System', icon: '🧩' },
      { id: 'reviews', title: 'Design Reviews', icon: '👀' },
    ],
  },
  {
    id: 'engineering',
    title: 'Engineering',
    icon: '⚙️',
    children: [
      { id: 'architecture', title: 'Architecture Notes', icon: '🏛️' },
      { id: 'runbooks', title: 'Runbooks', icon: '📘' },
      { id: 'postmortems', title: 'Postmortems', icon: '🔎' },
    ],
  },
  {
    id: 'meetings',
    title: 'Meetings',
    icon: '🗓️',
    children: [
      { id: 'weekly-sync', title: 'Weekly Sync Notes', icon: '📝' },
      { id: 'retros', title: 'Retrospectives', icon: '🔄' },
    ],
  },
];

/* ── Documents keyed by id ── */
export const documents: Record<string, Document> = {
  roadmap: {
    id: 'roadmap',
    title: 'Q2 Roadmap',
    icon: '🗺️',
    updatedAt: '3 minutes ago',
    updatedBy: 'Mira Chen',
    blocks: [
      { id: 'b1', type: 'h1', content: 'Q2 Roadmap' },
      { id: 'b2', type: 'p', content: 'This document outlines our shared commitments for the upcoming quarter. We focus on three pillars: presence, performance, and polish.' },
      { id: 'b3', type: 'h2', content: 'Goals' },
      { id: 'b4', type: 'ul', content: '', items: [
        'Ship real-time presence indicators across all editing surfaces',
        'Reduce document load time to under 200ms at p95',
        'Publish the new collaboration guidelines for the whole team',
      ] },
      { id: 'b5', type: 'h2', content: 'Timeline' },
      { id: 'b6', type: 'p', content: 'Week 1–2 focuses on foundations. Week 3–6 is feature work. The final weeks are reserved for polish and dogfooding with the broader team.' },
      { id: 'b7', type: 'quote', content: 'Real-time is not a feature — it is how we work together.' },
      { id: 'b8', type: 'h3', content: 'Success Criteria' },
      { id: 'b9', type: 'p', content: 'We will measure success by team adoption, not feature count. If people reach for Lumen first when starting a document, we have succeeded.' },
    ],
  },
  welcome: {
    id: 'welcome',
    title: 'Welcome to Lumen',
    icon: '👋',
    updatedAt: '1 hour ago',
    updatedBy: 'Priya Shah',
    blocks: [
      { id: 'w1', type: 'h1', content: 'Welcome to Lumen' },
      { id: 'w2', type: 'p', content: 'Lumen is our shared workspace for writing, planning, and thinking together. Everything lives on one page tree and everyone sees changes as they happen.' },
      { id: 'w3', type: 'h2', content: 'What to do first' },
      { id: 'w4', type: 'ul', content: '', items: [
        'Create your first page from the + button in the sidebar',
        'Invite a teammate and say hello in a comment',
        'Explore the slash menu — type / on any line',
      ] },
    ],
  },
};

/* ── Comments ── */
export const comments: Comment[] = [
  {
    id: 'cm1',
    author: 'Jordan Reese',
    initials: 'JR',
    color: '#E07B4C',
    body: 'Should we split goal 2 into load time and render time? They have different owners.',
    timestamp: '12 min ago',
    replies: [
      { author: 'Mira Chen', initials: 'MC', color: '#2E8B8B', body: 'Good call — let\'s split it in the next revision.', timestamp: '8 min ago' },
    ],
  },
  {
    id: 'cm2',
    author: 'Priya Shah',
    initials: 'PS',
    color: '#B8860B',
    body: 'Love the quote. Can we add a line about async collaboration too?',
    timestamp: '25 min ago',
  },
  {
    id: 'cm3',
    author: 'Sam Okafor',
    initials: 'SO',
    color: '#8B4789',
    body: 'Timeline looks tight but doable. I\'ll sync with engineering on week 3 scope.',
    timestamp: '1 hour ago',
    resolved: true,
  },
];

/* ── Revision history ── */
export const revisions: Revision[] = [
  { id: 'r1', author: 'Mira Chen', initials: 'MC', color: '#2E8B8B', summary: 'Added success criteria section', timestamp: '3 min ago', current: true },
  { id: 'r2', author: 'Jordan Reese', initials: 'JR', color: '#E07B4C', summary: 'Revised timeline and goals', timestamp: '1 hour ago' },
  { id: 'r3', author: 'Priya Shah', initials: 'PS', color: '#B8860B', summary: 'Added roadmap quote', timestamp: '3 hours ago' },
  { id: 'r4', author: 'Mira Chen', initials: 'MC', color: '#2E8B8B', summary: 'Initial draft', timestamp: 'Yesterday' },
];

/* ── Activity feed ── */
export const activity: ActivityItem[] = [
  { id: 'a1', type: 'edit', actor: 'Mira Chen', initials: 'MC', color: '#2E8B8B', target: 'Q2 Roadmap', timestamp: '3 min ago' },
  { id: 'a2', type: 'comment', actor: 'Jordan Reese', initials: 'JR', color: '#E07B4C', target: 'Q2 Roadmap', timestamp: '12 min ago' },
  { id: 'a3', type: 'mention', actor: 'Priya Shah', initials: 'PS', color: '#B8860B', target: 'Design Reviews', timestamp: '40 min ago' },
  { id: 'a4', type: 'share', actor: 'Sam Okafor', initials: 'SO', color: '#8B4789', target: 'User Research', timestamp: '1 hour ago' },
  { id: 'a5', type: 'create', actor: 'Lia Park', initials: 'LP', color: '#5C7F3C', target: 'Runbook: Deploys', timestamp: '2 hours ago' },
  { id: 'a6', type: 'edit', actor: 'Theo Blake', initials: 'TB', color: '#C74E5B', target: 'Weekly Sync Notes', timestamp: '3 hours ago' },
];

/* ── Recent documents ── */
export const recentDocs: RecentDoc[] = [
  { id: 'roadmap', title: 'Q2 Roadmap', icon: '🗺️', updatedAt: '3 min ago', collaborators: ['MC', 'JR', 'PS'] },
  { id: 'weekly-sync', title: 'Weekly Sync Notes', icon: '📝', updatedAt: '3 hours ago', collaborators: ['TB', 'LP'] },
  { id: 'research', title: 'User Research', icon: '🔍', updatedAt: 'Yesterday', collaborators: ['SO', 'MC'] },
  { id: 'system', title: 'Design System', icon: '🧩', updatedAt: '2 days ago', collaborators: ['PS', 'JR', 'LP', 'MC'] },
  { id: 'architecture', title: 'Architecture Notes', icon: '🏛️', updatedAt: '3 days ago', collaborators: ['SO', 'TB'] },
];

/* ── Kanban board for roadmap tasks ── */
export const kanban: KanbanColumn[] = [
  {
    id: 'backlog',
    title: 'Backlog',
    cards: [
      { id: 'k1', title: 'Draft collaboration guidelines', assignee: 'Priya Shah', initials: 'PS', color: '#B8860B', labels: ['docs'] },
      { id: 'k2', title: 'Spec real-time presence API', assignee: 'Sam Okafor', initials: 'SO', color: '#8B4789', labels: ['api', 'spec'] },
    ],
  },
  {
    id: 'in-progress',
    title: 'In Progress',
    cards: [
      { id: 'k3', title: 'Build remote cursor overlay', assignee: 'Mira Chen', initials: 'MC', color: '#2E8B8B', labels: ['frontend'] },
      { id: 'k4', title: 'Optimize document load time', assignee: 'Jordan Reese', initials: 'JR', color: '#E07B4C', labels: ['perf'] },
    ],
  },
  {
    id: 'review',
    title: 'In Review',
    cards: [
      { id: 'k5', title: 'Inline comment thread UI', assignee: 'Lia Park', initials: 'LP', color: '#5C7F3C', labels: ['design'] },
    ],
  },
  {
    id: 'done',
    title: 'Done',
    cards: [
      { id: 'k6', title: 'Presence avatar component', assignee: 'Mira Chen', initials: 'MC', color: '#2E8B8B', labels: ['frontend'] },
      { id: 'k7', title: 'Activity feed schema', assignee: 'Theo Blake', initials: 'TB', color: '#C74E5B', labels: ['api'] },
    ],
  },
];

/* ── Workspace members ── */
export const members: Member[] = [
  { id: 'm1', name: 'Mira Chen', email: 'mira@lumen.team', initials: 'MC', color: '#2E8B8B', role: 'Owner', lastActive: 'Active now' },
  { id: 'm2', name: 'Jordan Reese', email: 'jordan@lumen.team', initials: 'JR', color: '#E07B4C', role: 'Admin', lastActive: 'Active now' },
  { id: 'm3', name: 'Priya Shah', email: 'priya@lumen.team', initials: 'PS', color: '#B8860B', role: 'Editor', lastActive: 'Active now' },
  { id: 'm4', name: 'Sam Okafor', email: 'sam@lumen.team', initials: 'SO', color: '#8B4789', role: 'Editor', lastActive: '20 min ago' },
  { id: 'm5', name: 'Lia Park', email: 'lia@lumen.team', initials: 'LP', color: '#5C7F3C', role: 'Editor', lastActive: '2 hours ago' },
  { id: 'm6', name: 'Theo Blake', email: 'theo@lumen.team', initials: 'TB', color: '#C74E5B', role: 'Viewer', lastActive: 'Yesterday' },
];
