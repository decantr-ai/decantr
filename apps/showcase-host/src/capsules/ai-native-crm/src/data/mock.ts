/* ── Mock Data: AI-Native CRM (Lumen) ── */

export interface Kpi {
  label: string;
  value: string;
  change: number;
}

export type DealStage = 'lead' | 'qualified' | 'proposal' | 'negotiation' | 'won' | 'lost';

export interface AIEnrichment {
  companySize: string;
  industry: string;
  recentNews: string;
  techStack: string[];
  intentSignal: 'hot' | 'warm' | 'cold';
  lastEnriched: string;
}

export interface Contact {
  id: string;
  name: string;
  avatar: string;
  title: string;
  company: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  tags: string[];
  owner: string;
  lastContact: string;
  score: number;
  ai: AIEnrichment;
}

export interface Deal {
  id: string;
  name: string;
  company: string;
  contactId: string;
  value: number;
  stage: DealStage;
  probability: number;
  owner: string;
  closeDate: string;
  created: string;
  nextStep: string;
  aiInsight: string;
}

export interface ActivityEvent {
  id: string;
  type: 'call' | 'email' | 'meeting' | 'note' | 'deal' | 'ai';
  title: string;
  description: string;
  time: string;
  actor: string;
}

export interface EmailMessage {
  id: string;
  threadId: string;
  from: string;
  fromEmail: string;
  to: string;
  subject: string;
  preview: string;
  body: string;
  time: string;
  read: boolean;
  category: 'prospecting' | 'negotiation' | 'support' | 'internal';
  aiSummary?: string;
  aiSuggestedReply?: string;
}

export interface Meeting {
  id: string;
  title: string;
  time: string;
  duration: number;
  attendees: string[];
  contactId?: string;
  dealId?: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  transcript?: string;
  aiRecap?: string;
  actionItems?: string[];
}

export interface GraphNode {
  id: string;
  label: string;
  type: 'contact' | 'company' | 'deal';
  x: number;
  y: number;
}

export interface GraphEdge {
  from: string;
  to: string;
  strength: number;
  label?: string;
}

// ── KPIs ──
export const dashboardKpis: Kpi[] = [
  { label: 'Pipeline Value', value: '$1.24M', change: 12.4 },
  { label: 'Open Deals', value: '38', change: 8.1 },
  { label: 'Win Rate', value: '34%', change: 3.2 },
  { label: 'Avg Deal Size', value: '$32.6k', change: -2.1 },
];

// ── Contacts with AI enrichment ──
export const contacts: Contact[] = [
  {
    id: 'c1', name: 'Jordan Park', avatar: 'JP', title: 'VP Engineering', company: 'Northwind Labs',
    email: 'jordan@northwind.io', phone: '+1 415 555 0112', location: 'San Francisco, CA',
    linkedin: 'linkedin.com/in/jordanpark', tags: ['champion', 'decision-maker'],
    owner: 'Ava Chen', lastContact: '2d ago', score: 92,
    ai: { companySize: '250-500', industry: 'Developer Tools', recentNews: 'Raised $42M Series B',
      techStack: ['AWS', 'Kubernetes', 'Datadog'], intentSignal: 'hot', lastEnriched: '6h ago' },
  },
  {
    id: 'c2', name: 'Priya Nair', avatar: 'PN', title: 'Head of Ops', company: 'Meridian Health',
    email: 'priya@meridian.health', phone: '+1 646 555 0119', location: 'New York, NY',
    linkedin: 'linkedin.com/in/priyanair', tags: ['champion'],
    owner: 'Ava Chen', lastContact: '5h ago', score: 88,
    ai: { companySize: '1000-5000', industry: 'Healthtech', recentNews: 'Expanded to 3 new states',
      techStack: ['Azure', 'Snowflake', 'dbt'], intentSignal: 'hot', lastEnriched: '2h ago' },
  },
  {
    id: 'c3', name: 'Marcus Weir', avatar: 'MW', title: 'CFO', company: 'Axiom Retail',
    email: 'marcus@axiom.co', phone: '+1 312 555 0183', location: 'Chicago, IL',
    linkedin: 'linkedin.com/in/marcusweir', tags: ['budget-owner'],
    owner: 'Sam Rivera', lastContact: '1w ago', score: 74,
    ai: { companySize: '500-1000', industry: 'Retail', recentNews: 'New CEO appointed Q3',
      techStack: ['GCP', 'BigQuery', 'Looker'], intentSignal: 'warm', lastEnriched: '1d ago' },
  },
  {
    id: 'c4', name: 'Elena Voss', avatar: 'EV', title: 'Director of Sales', company: 'Brightline Fin',
    email: 'elena@brightline.fi', phone: '+1 206 555 0144', location: 'Seattle, WA',
    linkedin: 'linkedin.com/in/elenavoss', tags: ['power-user'],
    owner: 'Ava Chen', lastContact: '3d ago', score: 81,
    ai: { companySize: '100-250', industry: 'Fintech', recentNews: 'Launched B2B API platform',
      techStack: ['AWS', 'Postgres', 'Stripe'], intentSignal: 'warm', lastEnriched: '8h ago' },
  },
  {
    id: 'c5', name: 'Tobias Reyes', avatar: 'TR', title: 'Product Manager', company: 'Vector Studio',
    email: 'tobias@vector.studio', phone: '+1 512 555 0167', location: 'Austin, TX',
    linkedin: 'linkedin.com/in/tobiasreyes', tags: ['influencer'],
    owner: 'Sam Rivera', lastContact: '2w ago', score: 58,
    ai: { companySize: '50-100', industry: 'Design', recentNews: 'Acquired by Figma (rumor)',
      techStack: ['Vercel', 'Next.js', 'Supabase'], intentSignal: 'cold', lastEnriched: '3d ago' },
  },
  {
    id: 'c6', name: 'Hana Suzuki', avatar: 'HS', title: 'CTO', company: 'Plexus Robotics',
    email: 'hana@plexus.ai', phone: '+1 408 555 0191', location: 'San Jose, CA',
    linkedin: 'linkedin.com/in/hanasuzuki', tags: ['decision-maker', 'technical'],
    owner: 'Ava Chen', lastContact: '4d ago', score: 86,
    ai: { companySize: '100-250', industry: 'Robotics', recentNews: 'DoD contract awarded',
      techStack: ['Azure', 'ROS', 'PyTorch'], intentSignal: 'hot', lastEnriched: '4h ago' },
  },
  {
    id: 'c7', name: 'Dmitri Orlov', avatar: 'DO', title: 'VP Marketing', company: 'Orbital SaaS',
    email: 'dmitri@orbital.com', phone: '+1 617 555 0133', location: 'Boston, MA',
    linkedin: 'linkedin.com/in/dmitriorlov', tags: ['champion'],
    owner: 'Jamie Fox', lastContact: '1d ago', score: 79,
    ai: { companySize: '250-500', industry: 'MarTech', recentNews: 'Rebranded product suite',
      techStack: ['AWS', 'HubSpot', 'Segment'], intentSignal: 'warm', lastEnriched: '12h ago' },
  },
  {
    id: 'c8', name: 'Sienna Ross', avatar: 'SR', title: 'Head of Procurement', company: 'Cobalt Industries',
    email: 'sienna@cobalt.co', phone: '+1 303 555 0155', location: 'Denver, CO',
    linkedin: 'linkedin.com/in/siennaross', tags: ['budget-owner', 'gatekeeper'],
    owner: 'Sam Rivera', lastContact: '6d ago', score: 67,
    ai: { companySize: '1000-5000', industry: 'Manufacturing', recentNews: 'New Colorado facility',
      techStack: ['SAP', 'Oracle', 'Salesforce'], intentSignal: 'warm', lastEnriched: '1d ago' },
  },
];

// ── Deals across pipeline ──
export const deals: Deal[] = [
  { id: 'd1', name: 'Northwind Labs — Annual Platform', company: 'Northwind Labs', contactId: 'c1',
    value: 120000, stage: 'negotiation', probability: 75, owner: 'Ava Chen', closeDate: '2026-04-28',
    created: '2026-02-10', nextStep: 'Legal redline review',
    aiInsight: 'Champion highly engaged. Budget confirmed. Competing with Vendor X.' },
  { id: 'd2', name: 'Meridian Health — Enterprise Tier', company: 'Meridian Health', contactId: 'c2',
    value: 240000, stage: 'proposal', probability: 55, owner: 'Ava Chen', closeDate: '2026-05-15',
    created: '2026-02-22', nextStep: 'Security review call',
    aiInsight: 'Enterprise deal. Expect 2-3 stakeholders to join next call.' },
  { id: 'd3', name: 'Axiom Retail — Pilot Expansion', company: 'Axiom Retail', contactId: 'c3',
    value: 48000, stage: 'qualified', probability: 40, owner: 'Sam Rivera', closeDate: '2026-05-30',
    created: '2026-03-01', nextStep: 'ROI case study share',
    aiInsight: 'New CEO may pause non-essential spend. Reconfirm priority.' },
  { id: 'd4', name: 'Brightline Fin — Multi-seat', company: 'Brightline Fin', contactId: 'c4',
    value: 36000, stage: 'negotiation', probability: 68, owner: 'Ava Chen', closeDate: '2026-04-18',
    created: '2026-02-05', nextStep: 'Contract sent',
    aiInsight: 'Discount requested. Counter with longer term.' },
  { id: 'd5', name: 'Vector Studio — Team Plan', company: 'Vector Studio', contactId: 'c5',
    value: 12000, stage: 'lead', probability: 15, owner: 'Sam Rivera', closeDate: '2026-06-12',
    created: '2026-03-18', nextStep: 'Discovery call',
    aiInsight: 'Acquisition rumor creates uncertainty. Monitor.' },
  { id: 'd6', name: 'Plexus Robotics — Gov Contract', company: 'Plexus Robotics', contactId: 'c6',
    value: 320000, stage: 'proposal', probability: 62, owner: 'Ava Chen', closeDate: '2026-05-08',
    created: '2026-01-28', nextStep: 'Compliance docs',
    aiInsight: 'DoD win unlocks budget. Fast-track procurement possible.' },
  { id: 'd7', name: 'Orbital SaaS — Platform Deal', company: 'Orbital SaaS', contactId: 'c7',
    value: 84000, stage: 'qualified', probability: 45, owner: 'Jamie Fox', closeDate: '2026-05-20',
    created: '2026-03-04', nextStep: 'Stakeholder mapping',
    aiInsight: 'Recent rebrand may delay procurement. Schedule exec touch.' },
  { id: 'd8', name: 'Cobalt Industries — Manufacturing', company: 'Cobalt Industries', contactId: 'c8',
    value: 180000, stage: 'lead', probability: 20, owner: 'Sam Rivera', closeDate: '2026-06-30',
    created: '2026-03-20', nextStep: 'Send product brief',
    aiInsight: 'Gatekeeper engaged. Need to reach technical decision-maker.' },
  { id: 'd9', name: 'Northwind Labs — Add-on Module', company: 'Northwind Labs', contactId: 'c1',
    value: 28000, stage: 'won', probability: 100, owner: 'Ava Chen', closeDate: '2026-03-15',
    created: '2026-02-01', nextStep: 'Implementation kickoff',
    aiInsight: 'Closed. Expand to analytics module next quarter.' },
  { id: 'd10', name: 'Helix AI — Starter', company: 'Helix AI', contactId: 'c5',
    value: 9600, stage: 'lost', probability: 0, owner: 'Jamie Fox', closeDate: '2026-03-22',
    created: '2026-02-18', nextStep: 'Nurture',
    aiInsight: 'Lost to in-house build. Recheck in 6 months.' },
  { id: 'd11', name: 'Meridian Health — Training', company: 'Meridian Health', contactId: 'c2',
    value: 18000, stage: 'qualified', probability: 50, owner: 'Ava Chen', closeDate: '2026-05-05',
    created: '2026-03-10', nextStep: 'Training scope call',
    aiInsight: 'Add-on to core deal. Bundle for discount.' },
  { id: 'd12', name: 'Brightline Fin — API Credits', company: 'Brightline Fin', contactId: 'c4',
    value: 22000, stage: 'lead', probability: 25, owner: 'Ava Chen', closeDate: '2026-06-10',
    created: '2026-03-22', nextStep: 'Volume tier proposal',
    aiInsight: 'B2B API launch drives credit demand. High velocity possible.' },
];

export const pipelineStages: { key: DealStage; label: string; color: string }[] = [
  { key: 'lead', label: 'Lead', color: '#a78bfa' },
  { key: 'qualified', label: 'Qualified', color: '#60a5fa' },
  { key: 'proposal', label: 'Proposal', color: '#22d3ee' },
  { key: 'negotiation', label: 'Negotiation', color: '#fbbf24' },
  { key: 'won', label: 'Won', color: '#34d399' },
  { key: 'lost', label: 'Lost', color: '#f87171' },
];

// ── Activity feed ──
export const activityEvents: ActivityEvent[] = [
  { id: 'a1', type: 'ai', title: 'AI enriched 3 contacts', description: 'Northwind Labs, Meridian Health, Plexus Robotics — intent scores updated', time: '12m ago', actor: 'Lumen AI' },
  { id: 'a2', type: 'meeting', title: 'Demo call completed', description: 'Jordan Park (Northwind Labs) — 45 min', time: '2h ago', actor: 'Ava Chen' },
  { id: 'a3', type: 'email', title: 'Replied to proposal thread', description: 'Meridian Health — negotiation', time: '4h ago', actor: 'Ava Chen' },
  { id: 'a4', type: 'deal', title: 'Deal moved to Negotiation', description: 'Brightline Fin — Multi-seat ($36k)', time: '6h ago', actor: 'Ava Chen' },
  { id: 'a5', type: 'call', title: 'Discovery call logged', description: 'Hana Suzuki (Plexus Robotics)', time: 'Yesterday', actor: 'Ava Chen' },
  { id: 'a6', type: 'note', title: 'Added internal note', description: 'Axiom deal — new CEO impact', time: 'Yesterday', actor: 'Sam Rivera' },
  { id: 'a7', type: 'ai', title: 'AI suggested next steps', description: '12 deals have recommended next actions', time: '1d ago', actor: 'Lumen AI' },
];

// ── Emails ──
export const emails: EmailMessage[] = [
  {
    id: 'e1', threadId: 't1', from: 'Jordan Park', fromEmail: 'jordan@northwind.io', to: 'ava@lumen.crm',
    subject: 'Re: Contract redlines', preview: "Ava — attaching the legal team's feedback on sections 3 and 7...",
    body: "Ava,\n\nAttaching the legal team's feedback on sections 3 and 7. We're close but need clarity on the data residency clause. Can we jump on a 15 min call tomorrow?\n\n— Jordan",
    time: '38m ago', read: false, category: 'negotiation',
    aiSummary: 'Northwind legal has minor concerns on data residency. Requests 15 min call tomorrow.',
    aiSuggestedReply: "Jordan — absolutely, sending a calendar invite for 11am PT. I'll bring our data residency one-pager.",
  },
  {
    id: 'e2', threadId: 't2', from: 'Priya Nair', fromEmail: 'priya@meridian.health', to: 'ava@lumen.crm',
    subject: 'Security review scheduled', preview: 'Looping in our CISO for Thursday 2pm. Please share SOC2 Type II...',
    body: "Hi Ava,\n\nLooping in our CISO for Thursday 2pm. Please share SOC2 Type II report and SIG-lite ahead of time.\n\nThanks,\nPriya",
    time: '2h ago', read: false, category: 'negotiation',
    aiSummary: 'CISO review Thursday 2pm. Needs SOC2 Type II + SIG-lite beforehand.',
  },
  {
    id: 'e3', threadId: 't3', from: 'Elena Voss', fromEmail: 'elena@brightline.fi', to: 'ava@lumen.crm',
    subject: 'Discount ask', preview: 'Would you consider 18% off for a 3-year commit? Our board needs...',
    body: "Ava,\n\nWould you consider 18% off for a 3-year commit? Our board needs a sharp price point to approve.\n\nBest,\nElena",
    time: '5h ago', read: true, category: 'negotiation',
    aiSummary: 'Requests 18% discount for 3-year commit.',
    aiSuggestedReply: "Elena — 18% is steep, but we can get to 15% on a 3-year with annual prepay. Want me to run that by my team?",
  },
  {
    id: 'e4', threadId: 't4', from: 'Marcus Weir', fromEmail: 'marcus@axiom.co', to: 'ava@lumen.crm',
    subject: 'Pausing for Q3 planning', preview: "Our new CEO wants a full budget review before Q3. Let's reconnect...",
    body: "Ava,\n\nOur new CEO wants a full budget review before Q3. Let's reconnect in early May.\n\nMarcus",
    time: '1d ago', read: true, category: 'prospecting',
    aiSummary: 'Deal paused due to CEO-driven budget review. Restart in early May.',
  },
  {
    id: 'e5', threadId: 't5', from: 'Hana Suzuki', fromEmail: 'hana@plexus.ai', to: 'ava@lumen.crm',
    subject: 'Gov contract — lets move fast', preview: 'DoD award announced. We need to accelerate procurement...',
    body: "Ava,\n\nDoD award announced. We need to accelerate procurement. Can you send a multi-year proposal by Friday?\n\nHana",
    time: '1d ago', read: false, category: 'negotiation',
    aiSummary: 'DoD contract won. Urgent: multi-year proposal needed by Friday.',
    aiSuggestedReply: "Hana — congrats on the DoD win. Proposal in your inbox by Thursday EOD. 3yr and 5yr options included.",
  },
  {
    id: 'e6', threadId: 't6', from: 'Sam Rivera', fromEmail: 'sam@lumen.crm', to: 'ava@lumen.crm',
    subject: 'Pipeline sync Friday', preview: 'Ava, can we move pipeline review to Friday 10am?', body: '',
    time: '2d ago', read: true, category: 'internal',
  },
];

// ── Meetings ──
export const meetings: Meeting[] = [
  {
    id: 'm1', title: 'Northwind — Legal walkthrough', time: 'Today, 11:00 AM', duration: 30,
    attendees: ['Jordan Park', 'Ava Chen', 'Legal (Northwind)'], contactId: 'c1', dealId: 'd1',
    status: 'scheduled',
  },
  {
    id: 'm2', title: 'Meridian — Security review', time: 'Thu, 2:00 PM', duration: 60,
    attendees: ['Priya Nair', 'CISO (Meridian)', 'Ava Chen'], contactId: 'c2', dealId: 'd2',
    status: 'scheduled',
  },
  {
    id: 'm3', title: 'Plexus — Discovery', time: 'Yesterday, 3:30 PM', duration: 45,
    attendees: ['Hana Suzuki', 'Ava Chen'], contactId: 'c6', dealId: 'd6',
    status: 'completed',
    transcript: "Hana: We just won the DoD contract, so timeline is tight. Ava: Congrats — what does success look like on your side? Hana: Deployed in 3 regions by Q2 end. We need SSO, audit logs, and FedRAMP-ready posture. Ava: All three are in our Enterprise tier. Let's talk scale…",
    aiRecap: "Plexus won DoD contract; urgent 3-region deployment by Q2. Requires SSO, audit logs, FedRAMP posture. Enterprise tier fits. Pricing: scale-based.",
    actionItems: [
      'Send Enterprise tier proposal with FedRAMP addendum',
      'Share audit log demo video',
      'Schedule technical deep-dive with Plexus infra team',
      'Confirm timeline by EOW',
    ],
  },
  {
    id: 'm4', title: 'Brightline — Contract review', time: '2 days ago, 10:00 AM', duration: 30,
    attendees: ['Elena Voss', 'Ava Chen'], contactId: 'c4', dealId: 'd4',
    status: 'completed',
    aiRecap: 'Elena pushed back on per-seat pricing. Agreed to revisit volume tiers.',
    actionItems: ['Model 3-year volume tier', 'Send revised MSA'],
  },
];

// ── Relationship graph ──
export const graphNodes: GraphNode[] = [
  { id: 'g1', label: 'Northwind Labs', type: 'company', x: 300, y: 200 },
  { id: 'g2', label: 'Jordan Park', type: 'contact', x: 150, y: 150 },
  { id: 'g3', label: 'Casey Doyle', type: 'contact', x: 180, y: 280 },
  { id: 'g4', label: 'Meridian Health', type: 'company', x: 550, y: 250 },
  { id: 'g5', label: 'Priya Nair', type: 'contact', x: 680, y: 180 },
  { id: 'g6', label: 'Deal: Enterprise', type: 'deal', x: 680, y: 320 },
  { id: 'g7', label: 'Plexus Robotics', type: 'company', x: 400, y: 420 },
  { id: 'g8', label: 'Hana Suzuki', type: 'contact', x: 270, y: 480 },
  { id: 'g9', label: 'Deal: Gov', type: 'deal', x: 510, y: 500 },
  { id: 'g10', label: 'Brightline Fin', type: 'company', x: 150, y: 420 },
];

export const graphEdges: GraphEdge[] = [
  { from: 'g1', to: 'g2', strength: 0.9, label: 'VP Eng' },
  { from: 'g1', to: 'g3', strength: 0.6 },
  { from: 'g4', to: 'g5', strength: 0.85 },
  { from: 'g4', to: 'g6', strength: 1.0 },
  { from: 'g7', to: 'g8', strength: 0.88 },
  { from: 'g7', to: 'g9', strength: 1.0 },
  { from: 'g2', to: 'g5', strength: 0.3, label: 'ex-coworkers' },
  { from: 'g8', to: 'g2', strength: 0.4, label: 'mutual: K. Ito' },
  { from: 'g10', to: 'g3', strength: 0.5 },
];

// ── Chart data ──
export const pipelineByMonth = [
  { month: 'Jan', value: 680 },
  { month: 'Feb', value: 820 },
  { month: 'Mar', value: 950 },
  { month: 'Apr', value: 1240 },
];

export const winRateTrend = [34, 28, 36, 32, 38, 34, 41, 37, 34];
