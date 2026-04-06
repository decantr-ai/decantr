/* -- Mock Data: Private Equity Deal Room -- */

export interface Deal {
  id: string;
  name: string;
  company: string;
  sector: string;
  stage: 'sourcing' | 'due-diligence' | 'negotiation' | 'closing' | 'closed' | 'passed';
  targetSize: string;
  ev: string;
  ebitda: string;
  multiple: string;
  lead: string;
  leadAvatar: string;
  createdAt: string;
  lastActivity: string;
  confidentiality: 'restricted' | 'standard' | 'public';
}

export interface Document {
  id: string;
  name: string;
  type: 'pdf' | 'spreadsheet' | 'presentation' | 'legal' | 'image';
  size: string;
  folder: string;
  uploadedBy: string;
  uploadedAt: string;
  version: number;
  watermarked: boolean;
  status: 'final' | 'draft' | 'under-review';
  dealId: string;
}

export interface Investor {
  id: string;
  name: string;
  firm: string;
  initials: string;
  email: string;
  role: 'lead' | 'co-investor' | 'observer' | 'advisor';
  status: 'active' | 'pending' | 'inactive';
  lastAccess: string;
  documentsViewed: number;
  ndaSigned: boolean;
}

export interface QaThread {
  id: string;
  subject: string;
  category: string;
  askedBy: string;
  askedByAvatar: string;
  assignedTo: string;
  status: 'open' | 'answered' | 'closed';
  priority: 'high' | 'medium' | 'low';
  createdAt: string;
  replies: number;
  dealId: string;
}

export interface AuditEntry {
  id: string;
  actor: string;
  actorAvatar: string;
  action: string;
  resource: string;
  timestamp: string;
  ip: string;
  type: 'view' | 'download' | 'upload' | 'access' | 'sign' | 'comment';
}

export interface StageGate {
  id: string;
  name: string;
  status: 'complete' | 'active' | 'pending';
  approvals: number;
  required: number;
  deadline: string;
}

export interface Kpi {
  label: string;
  value: string;
  change: number;
  icon: string;
}

export interface Fund {
  id: string;
  name: string;
  initials: string;
  vintage: string;
  aum: string;
  activeDeals: number;
}

/* -- Funds -- */

export const funds: Fund[] = [
  { id: 'f-1', name: 'Meridian Capital Partners', initials: 'MC', vintage: '2024', aum: '$2.8B', activeDeals: 7 },
  { id: 'f-2', name: 'Harrington Growth Equity', initials: 'HG', vintage: '2023', aum: '$1.4B', activeDeals: 4 },
  { id: 'f-3', name: 'Ashworth & Associates', initials: 'AA', vintage: '2025', aum: '$680M', activeDeals: 3 },
];

/* -- Deals -- */

export const deals: Deal[] = [
  { id: 'd-1', name: 'Project Atlas', company: 'Atlas Infrastructure Holdings', sector: 'Infrastructure', stage: 'due-diligence', targetSize: '$240M', ev: '$1.2B', ebitda: '$180M', multiple: '6.7x', lead: 'Victoria Ashworth', leadAvatar: 'VA', createdAt: '2026-02-15', lastActivity: '2h ago', confidentiality: 'restricted' },
  { id: 'd-2', name: 'Project Mercury', company: 'Mercury FinTech Ltd', sector: 'Financial Services', stage: 'negotiation', targetSize: '$85M', ev: '$420M', ebitda: '$62M', multiple: '6.8x', lead: 'James Harrington', leadAvatar: 'JH', createdAt: '2026-01-08', lastActivity: '45m ago', confidentiality: 'restricted' },
  { id: 'd-3', name: 'Project Horizon', company: 'Horizon Healthcare Systems', sector: 'Healthcare', stage: 'closing', targetSize: '$320M', ev: '$1.8B', ebitda: '$245M', multiple: '7.3x', lead: 'Victoria Ashworth', leadAvatar: 'VA', createdAt: '2025-11-20', lastActivity: '1d ago', confidentiality: 'restricted' },
  { id: 'd-4', name: 'Project Vanguard', company: 'Vanguard Logistics Corp', sector: 'Logistics', stage: 'sourcing', targetSize: '$150M', ev: '$780M', ebitda: '$110M', multiple: '7.1x', lead: 'Robert Chen', leadAvatar: 'RC', createdAt: '2026-03-28', lastActivity: '3h ago', confidentiality: 'standard' },
  { id: 'd-5', name: 'Project Sterling', company: 'Sterling Digital Media', sector: 'TMT', stage: 'closed', targetSize: '$95M', ev: '$510M', ebitda: '$72M', multiple: '7.1x', lead: 'James Harrington', leadAvatar: 'JH', createdAt: '2025-08-12', lastActivity: '14d ago', confidentiality: 'standard' },
  { id: 'd-6', name: 'Project Apex', company: 'Apex Manufacturing Inc', sector: 'Industrials', stage: 'passed', targetSize: '$200M', ev: '$980M', ebitda: '$142M', multiple: '6.9x', lead: 'Victoria Ashworth', leadAvatar: 'VA', createdAt: '2025-10-05', lastActivity: '32d ago', confidentiality: 'standard' },
  { id: 'd-7', name: 'Project Beacon', company: 'Beacon SaaS Platform', sector: 'Technology', stage: 'due-diligence', targetSize: '$120M', ev: '$680M', ebitda: '$88M', multiple: '7.7x', lead: 'Robert Chen', leadAvatar: 'RC', createdAt: '2026-03-10', lastActivity: '5h ago', confidentiality: 'restricted' },
];

/* -- Documents -- */

export const documents: Document[] = [
  { id: 'doc-1', name: 'Confidential Information Memorandum', type: 'pdf', size: '4.2 MB', folder: 'CIM', uploadedBy: 'Victoria Ashworth', uploadedAt: '2026-02-16', version: 3, watermarked: true, status: 'final', dealId: 'd-1' },
  { id: 'doc-2', name: 'Financial Model - Base Case', type: 'spreadsheet', size: '8.7 MB', folder: 'Financials', uploadedBy: 'Robert Chen', uploadedAt: '2026-03-01', version: 5, watermarked: false, status: 'under-review', dealId: 'd-1' },
  { id: 'doc-3', name: 'Management Presentation', type: 'presentation', size: '12.3 MB', folder: 'Presentations', uploadedBy: 'James Harrington', uploadedAt: '2026-02-20', version: 2, watermarked: true, status: 'final', dealId: 'd-1' },
  { id: 'doc-4', name: 'Share Purchase Agreement (Draft)', type: 'legal', size: '1.8 MB', folder: 'Legal', uploadedBy: 'Victoria Ashworth', uploadedAt: '2026-03-15', version: 1, watermarked: true, status: 'draft', dealId: 'd-1' },
  { id: 'doc-5', name: 'Due Diligence Report - Commercial', type: 'pdf', size: '6.4 MB', folder: 'DD Reports', uploadedBy: 'Robert Chen', uploadedAt: '2026-03-20', version: 2, watermarked: true, status: 'final', dealId: 'd-1' },
  { id: 'doc-6', name: 'Environmental Assessment', type: 'pdf', size: '3.1 MB', folder: 'DD Reports', uploadedBy: 'Victoria Ashworth', uploadedAt: '2026-03-22', version: 1, watermarked: true, status: 'under-review', dealId: 'd-1' },
  { id: 'doc-7', name: 'Target Company Org Chart', type: 'image', size: '890 KB', folder: 'Operations', uploadedBy: 'James Harrington', uploadedAt: '2026-02-18', version: 1, watermarked: false, status: 'final', dealId: 'd-1' },
  { id: 'doc-8', name: 'Non-Disclosure Agreement', type: 'legal', size: '420 KB', folder: 'Legal', uploadedBy: 'Victoria Ashworth', uploadedAt: '2026-02-14', version: 1, watermarked: false, status: 'final', dealId: 'd-1' },
  { id: 'doc-9', name: 'Financial Model - Upside Case', type: 'spreadsheet', size: '9.1 MB', folder: 'Financials', uploadedBy: 'Robert Chen', uploadedAt: '2026-03-25', version: 2, watermarked: false, status: 'draft', dealId: 'd-1' },
  { id: 'doc-10', name: 'Tax Structure Memo', type: 'legal', size: '2.2 MB', folder: 'Legal', uploadedBy: 'Victoria Ashworth', uploadedAt: '2026-03-28', version: 1, watermarked: true, status: 'under-review', dealId: 'd-1' },
];

/* -- Investors -- */

export const investors: Investor[] = [
  { id: 'inv-1', name: 'Victoria Ashworth', firm: 'Meridian Capital', initials: 'VA', email: 'v.ashworth@meridian.pe', role: 'lead', status: 'active', lastAccess: '2m ago', documentsViewed: 42, ndaSigned: true },
  { id: 'inv-2', name: 'James Harrington', firm: 'Harrington Growth', initials: 'JH', email: 'j.harrington@hge.com', role: 'co-investor', status: 'active', lastAccess: '1h ago', documentsViewed: 38, ndaSigned: true },
  { id: 'inv-3', name: 'Robert Chen', firm: 'Pacific Ventures', initials: 'RC', email: 'r.chen@pacificvc.com', role: 'co-investor', status: 'active', lastAccess: '3h ago', documentsViewed: 31, ndaSigned: true },
  { id: 'inv-4', name: 'Sarah Nakamura', firm: 'Evergreen Capital', initials: 'SN', email: 's.nakamura@evergreen.pe', role: 'observer', status: 'active', lastAccess: '1d ago', documentsViewed: 18, ndaSigned: true },
  { id: 'inv-5', name: 'Michael Torres', firm: 'Pinnacle Advisory', initials: 'MT', email: 'm.torres@pinnacle.com', role: 'advisor', status: 'active', lastAccess: '2d ago', documentsViewed: 12, ndaSigned: true },
  { id: 'inv-6', name: 'Elena Volkova', firm: 'Nordic Partners', initials: 'EV', email: 'e.volkova@nordic.pe', role: 'co-investor', status: 'pending', lastAccess: 'never', documentsViewed: 0, ndaSigned: false },
  { id: 'inv-7', name: 'David Okonkwo', firm: 'Summit Equity', initials: 'DO', email: 'd.okonkwo@summit.pe', role: 'observer', status: 'inactive', lastAccess: '21d ago', documentsViewed: 5, ndaSigned: true },
];

/* -- Q&A Threads -- */

export const qaThreads: QaThread[] = [
  { id: 'qa-1', subject: 'Revenue recognition policy for long-term contracts', category: 'Financial', askedBy: 'Robert Chen', askedByAvatar: 'RC', assignedTo: 'Victoria Ashworth', status: 'open', priority: 'high', createdAt: '2026-04-04', replies: 3, dealId: 'd-1' },
  { id: 'qa-2', subject: 'Customer concentration risk - top 10 clients', category: 'Commercial', askedBy: 'James Harrington', askedByAvatar: 'JH', assignedTo: 'Robert Chen', status: 'answered', priority: 'high', createdAt: '2026-04-02', replies: 5, dealId: 'd-1' },
  { id: 'qa-3', subject: 'Key person dependency in management team', category: 'Operational', askedBy: 'Sarah Nakamura', askedByAvatar: 'SN', assignedTo: 'Victoria Ashworth', status: 'open', priority: 'medium', createdAt: '2026-04-03', replies: 2, dealId: 'd-1' },
  { id: 'qa-4', subject: 'Environmental liability exposure', category: 'Legal', askedBy: 'Michael Torres', askedByAvatar: 'MT', assignedTo: 'James Harrington', status: 'answered', priority: 'medium', createdAt: '2026-03-30', replies: 4, dealId: 'd-1' },
  { id: 'qa-5', subject: 'IP ownership and licensing agreements', category: 'Legal', askedBy: 'Robert Chen', askedByAvatar: 'RC', assignedTo: 'Victoria Ashworth', status: 'closed', priority: 'low', createdAt: '2026-03-25', replies: 6, dealId: 'd-1' },
  { id: 'qa-6', subject: 'Working capital normalization adjustments', category: 'Financial', askedBy: 'James Harrington', askedByAvatar: 'JH', assignedTo: 'Robert Chen', status: 'open', priority: 'high', createdAt: '2026-04-05', replies: 1, dealId: 'd-1' },
  { id: 'qa-7', subject: 'Regulatory compliance timeline', category: 'Legal', askedBy: 'Sarah Nakamura', askedByAvatar: 'SN', assignedTo: 'Michael Torres', status: 'answered', priority: 'medium', createdAt: '2026-04-01', replies: 3, dealId: 'd-1' },
];

/* -- Audit Trail -- */

export const auditEntries: AuditEntry[] = [
  { id: 'ae-1', actor: 'Victoria Ashworth', actorAvatar: 'VA', action: 'viewed', resource: 'Confidential Information Memorandum', timestamp: '2026-04-06 14:32:01', ip: '203.0.113.42', type: 'view' },
  { id: 'ae-2', actor: 'Robert Chen', actorAvatar: 'RC', action: 'downloaded', resource: 'Financial Model - Base Case', timestamp: '2026-04-06 13:18:22', ip: '203.0.113.18', type: 'download' },
  { id: 'ae-3', actor: 'James Harrington', actorAvatar: 'JH', action: 'uploaded', resource: 'Management Presentation v2', timestamp: '2026-04-06 11:45:17', ip: '198.51.100.7', type: 'upload' },
  { id: 'ae-4', actor: 'Victoria Ashworth', actorAvatar: 'VA', action: 'signed', resource: 'Share Purchase Agreement (Draft)', timestamp: '2026-04-06 10:22:08', ip: '203.0.113.42', type: 'sign' },
  { id: 'ae-5', actor: 'Sarah Nakamura', actorAvatar: 'SN', action: 'accessed', resource: 'Project Atlas Data Room', timestamp: '2026-04-06 09:14:45', ip: '198.51.100.55', type: 'access' },
  { id: 'ae-6', actor: 'Michael Torres', actorAvatar: 'MT', action: 'commented on', resource: 'Environmental Assessment', timestamp: '2026-04-06 08:08:33', ip: '203.0.113.9', type: 'comment' },
  { id: 'ae-7', actor: 'Robert Chen', actorAvatar: 'RC', action: 'viewed', resource: 'Due Diligence Report - Commercial', timestamp: '2026-04-05 17:52:17', ip: '203.0.113.18', type: 'view' },
  { id: 'ae-8', actor: 'Elena Volkova', actorAvatar: 'EV', action: 'accessed', resource: 'Investor Portal', timestamp: '2026-04-05 15:34:21', ip: '198.51.100.88', type: 'access' },
  { id: 'ae-9', actor: 'James Harrington', actorAvatar: 'JH', action: 'downloaded', resource: 'Tax Structure Memo', timestamp: '2026-04-05 14:22:11', ip: '198.51.100.7', type: 'download' },
  { id: 'ae-10', actor: 'Victoria Ashworth', actorAvatar: 'VA', action: 'uploaded', resource: 'Financial Model - Upside Case v2', timestamp: '2026-04-05 12:18:04', ip: '203.0.113.42', type: 'upload' },
];

/* -- Stage Gates -- */

export const stageGates: StageGate[] = [
  { id: 'sg-1', name: 'NDA Execution', status: 'complete', approvals: 3, required: 3, deadline: '2026-02-15' },
  { id: 'sg-2', name: 'Initial Screening', status: 'complete', approvals: 4, required: 4, deadline: '2026-02-28' },
  { id: 'sg-3', name: 'Due Diligence', status: 'active', approvals: 2, required: 5, deadline: '2026-04-30' },
  { id: 'sg-4', name: 'IC Approval', status: 'pending', approvals: 0, required: 3, deadline: '2026-05-15' },
  { id: 'sg-5', name: 'Closing', status: 'pending', approvals: 0, required: 2, deadline: '2026-06-01' },
];

/* -- KPIs -- */

export const overviewKpis: Kpi[] = [
  { label: 'Active Deals', value: '5', change: 2, icon: 'briefcase' },
  { label: 'Total Pipeline', value: '$1.01B', change: 12.4, icon: 'trending-up' },
  { label: 'Documents', value: '284', change: 8.1, icon: 'file-text' },
  { label: 'Open Q&A Items', value: '14', change: -3.2, icon: 'message-circle' },
];

/* -- Deal Pipeline Summary -- */

export const pipelineSummary = [
  { stage: 'Sourcing', count: 1, value: '$150M', color: 'var(--d-info)' },
  { stage: 'Due Diligence', count: 2, value: '$360M', color: 'var(--d-warning)' },
  { stage: 'Negotiation', count: 1, value: '$85M', color: 'var(--d-primary)' },
  { stage: 'Closing', count: 1, value: '$320M', color: 'var(--d-success)' },
];

/* -- Marketing / Landing Page -- */

export const platformFeatures = [
  { icon: 'shield', title: 'Bank-Grade Security', description: 'AES-256 encryption at rest, TLS 1.3 in transit. SOC 2 Type II certified with granular access controls per investor.' },
  { icon: 'file-text', title: 'Secure Document Vault', description: 'Dynamic watermarking, download restrictions, and view tracking on every document. Full version history maintained.' },
  { icon: 'git-branch', title: 'Stage Gate Workflows', description: 'Configurable deal stages with approval gates, automated notifications, and investment committee tracking.' },
  { icon: 'message-circle', title: 'Structured Q&A', description: 'Threaded Q&A with category tagging, assignment routing, and audit trail. Never lose a diligence question.' },
  { icon: 'users', title: 'Investor Portal', description: 'White-labeled portal with NDA tracking, document access analytics, and engagement scoring per investor.' },
  { icon: 'bar-chart-2', title: 'Deal Analytics', description: 'Pipeline visualization, engagement metrics, and time-to-close benchmarks across your portfolio.' },
];

export const testimonials = [
  { quote: 'We closed our $1.2B infrastructure fund with this platform. The watermarking and audit trail gave our LPs complete confidence.', author: 'Katherine Wells', title: 'Partner, Blackstone Infrastructure' },
  { quote: 'The Q&A management alone saved us 200+ hours during due diligence. Every question tracked, every answer logged.', author: 'Marcus Thornton', title: 'Managing Director, KKR' },
  { quote: 'Our investors praised the experience. Clean, professional, and they felt their information was truly secure.', author: 'Amara Osei', title: 'Head of Fundraising, Carlyle Group' },
];

export const pricingTiers = [
  { name: 'Essentials', price: 1500, period: '/mo', recommended: false, features: ['Up to 3 active deals', '10 investor seats', '50 GB storage', 'Basic watermarking', 'Email support', '90-day audit log'], cta: 'Start Trial' },
  { name: 'Professional', price: 4500, period: '/mo', recommended: true, features: ['Unlimited deals', '50 investor seats', '500 GB storage', 'Dynamic watermarking', 'Priority support + SLA', 'Stage gate workflows', 'Q&A management', 'Unlimited audit log'], cta: 'Start Trial' },
  { name: 'Enterprise', price: 12000, period: '/mo', recommended: false, features: ['Everything in Professional', 'Unlimited investors', '5 TB storage', 'White-label portal', 'Dedicated CSM', 'Custom integrations', 'On-premise deployment', 'SSO + SCIM'], cta: 'Contact Sales' },
];

export const platformStats = [
  { label: 'Deals Closed', value: '$180B+' },
  { label: 'Documents Secured', value: '12M+' },
  { label: 'Active Investors', value: '45K+' },
  { label: 'Uptime SLA', value: '99.99%' },
];

/* -- Quick Actions -- */

export const quickActions = [
  { label: 'Upload document', icon: 'upload', route: '/documents' },
  { label: 'Create new deal', icon: 'plus-circle', route: '/deals' },
  { label: 'Invite investor', icon: 'user-plus', route: '/investors' },
  { label: 'View audit trail', icon: 'shield', route: '/audit' },
];

/* -- Folders -- */

export const folders = [
  { name: 'CIM', count: 1, icon: 'folder' },
  { name: 'Financials', count: 2, icon: 'folder' },
  { name: 'Presentations', count: 1, icon: 'folder' },
  { name: 'Legal', count: 3, icon: 'folder' },
  { name: 'DD Reports', count: 2, icon: 'folder' },
  { name: 'Operations', count: 1, icon: 'folder' },
];

/* -- Notifications -- */

export interface Notification {
  id: string;
  title: string;
  description: string;
  time: string;
  read: boolean;
  type: 'document' | 'qa' | 'deal' | 'investor';
}

export const notifications: Notification[] = [
  { id: 'n-1', title: 'New Q&A question', description: 'Robert Chen asked about revenue recognition policy', time: '2h ago', read: false, type: 'qa' },
  { id: 'n-2', title: 'Document uploaded', description: 'Financial Model - Upside Case v2 added to Project Atlas', time: '5h ago', read: false, type: 'document' },
  { id: 'n-3', title: 'Stage gate approved', description: 'Initial Screening approved for Project Vanguard', time: '1d ago', read: true, type: 'deal' },
  { id: 'n-4', title: 'NDA pending signature', description: 'Elena Volkova has not yet signed the NDA', time: '2d ago', read: true, type: 'investor' },
];
