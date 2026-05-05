// ── Case Law Data ──

export interface CaseLaw {
  id: string;
  name: string;
  citation: string;
  court: string;
  year: number;
  status: 'good-law' | 'caution' | 'overruled' | 'superseded';
  summary: string;
  citedBy: number;
  cites: string[];
  topics: string[];
}

export const caseLaw: CaseLaw[] = [
  {
    id: 'brown-v-board',
    name: 'Brown v. Board of Education',
    citation: '347 U.S. 483 (1954)',
    court: 'Supreme Court',
    year: 1954,
    status: 'good-law',
    summary: 'Declared state laws establishing separate public schools for Black and white students to be unconstitutional, overturning Plessy v. Ferguson.',
    citedBy: 4821,
    cites: ['plessy-v-ferguson', 'sweatt-v-painter'],
    topics: ['Equal Protection', 'Education', 'Civil Rights'],
  },
  {
    id: 'miranda-v-arizona',
    name: 'Miranda v. Arizona',
    citation: '384 U.S. 436 (1966)',
    court: 'Supreme Court',
    year: 1966,
    status: 'good-law',
    summary: 'Established that the Fifth Amendment privilege against self-incrimination requires law enforcement to advise suspects of their rights before interrogation.',
    citedBy: 3592,
    cites: ['escobedo-v-illinois'],
    topics: ['Criminal Procedure', 'Fifth Amendment', 'Due Process'],
  },
  {
    id: 'roe-v-wade',
    name: 'Roe v. Wade',
    citation: '410 U.S. 113 (1973)',
    court: 'Supreme Court',
    year: 1973,
    status: 'overruled',
    summary: 'Held that the Constitution protected a right to abortion. Later overruled by Dobbs v. Jackson Women\'s Health Organization.',
    citedBy: 2894,
    cites: ['griswold-v-connecticut'],
    topics: ['Privacy', 'Due Process', 'Constitutional Rights'],
  },
  {
    id: 'marbury-v-madison',
    name: 'Marbury v. Madison',
    citation: '5 U.S. 137 (1803)',
    court: 'Supreme Court',
    year: 1803,
    status: 'good-law',
    summary: 'Established the principle of judicial review, giving the Supreme Court the power to declare laws unconstitutional.',
    citedBy: 6234,
    cites: [],
    topics: ['Constitutional Law', 'Judicial Review', 'Separation of Powers'],
  },
  {
    id: 'plessy-v-ferguson',
    name: 'Plessy v. Ferguson',
    citation: '163 U.S. 537 (1896)',
    court: 'Supreme Court',
    year: 1896,
    status: 'overruled',
    summary: 'Upheld the constitutionality of racial segregation under the "separate but equal" doctrine. Overruled by Brown v. Board of Education.',
    citedBy: 1456,
    cites: [],
    topics: ['Equal Protection', 'Civil Rights', 'Segregation'],
  },
  {
    id: 'gideon-v-wainwright',
    name: 'Gideon v. Wainwright',
    citation: '372 U.S. 335 (1963)',
    court: 'Supreme Court',
    year: 1963,
    status: 'good-law',
    summary: 'Held that the Sixth Amendment right to counsel applies to state criminal proceedings through the Fourteenth Amendment.',
    citedBy: 2187,
    cites: [],
    topics: ['Right to Counsel', 'Sixth Amendment', 'Due Process'],
  },
  {
    id: 'citizens-united',
    name: 'Citizens United v. FEC',
    citation: '558 U.S. 310 (2010)',
    court: 'Supreme Court',
    year: 2010,
    status: 'good-law',
    summary: 'Held that the First Amendment prohibits the government from restricting independent expenditures for political communications by corporations.',
    citedBy: 1823,
    cites: [],
    topics: ['First Amendment', 'Campaign Finance', 'Corporate Rights'],
  },
  {
    id: 'obergefell-v-hodges',
    name: 'Obergefell v. Hodges',
    citation: '576 U.S. 644 (2015)',
    court: 'Supreme Court',
    year: 2015,
    status: 'good-law',
    summary: 'Held that the fundamental right to marry is guaranteed to same-sex couples by both the Due Process Clause and the Equal Protection Clause.',
    citedBy: 1245,
    cites: [],
    topics: ['Equal Protection', 'Due Process', 'Marriage Equality'],
  },
  {
    id: 'griswold-v-connecticut',
    name: 'Griswold v. Connecticut',
    citation: '381 U.S. 479 (1965)',
    court: 'Supreme Court',
    year: 1965,
    status: 'good-law',
    summary: 'Established the right to marital privacy, finding that the Bill of Rights implies a right to privacy.',
    citedBy: 2567,
    cites: [],
    topics: ['Privacy', 'Due Process', 'Constitutional Rights'],
  },
  {
    id: 'escobedo-v-illinois',
    name: 'Escobedo v. Illinois',
    citation: '378 U.S. 478 (1964)',
    court: 'Supreme Court',
    year: 1964,
    status: 'caution',
    summary: 'Held that criminal suspects have a right to counsel during police interrogations under the Sixth Amendment.',
    citedBy: 987,
    cites: ['gideon-v-wainwright'],
    topics: ['Right to Counsel', 'Criminal Procedure', 'Sixth Amendment'],
  },
  {
    id: 'sweatt-v-painter',
    name: 'Sweatt v. Painter',
    citation: '339 U.S. 629 (1950)',
    court: 'Supreme Court',
    year: 1950,
    status: 'good-law',
    summary: 'Ruled that the separate law school for Black students offered by the State of Texas did not provide equal education.',
    citedBy: 672,
    cites: ['plessy-v-ferguson'],
    topics: ['Equal Protection', 'Education', 'Civil Rights'],
  },
];

export function getCaseById(id: string): CaseLaw | undefined {
  return caseLaw.find((c) => c.id === id);
}

// ── Contract Data ──

export interface Contract {
  id: string;
  title: string;
  client: string;
  type: string;
  status: 'draft' | 'review' | 'executed' | 'expired';
  lastModified: string;
  version: number;
  assignee: string;
}

export const contracts: Contract[] = [
  { id: 'c1', title: 'Master Services Agreement', client: 'Meridian Corp.', type: 'MSA', status: 'review', lastModified: '2026-04-01', version: 3, assignee: 'J. Chen' },
  { id: 'c2', title: 'Non-Disclosure Agreement', client: 'Atlas Holdings', type: 'NDA', status: 'executed', lastModified: '2026-03-15', version: 1, assignee: 'S. Park' },
  { id: 'c3', title: 'Employment Agreement', client: 'Internal', type: 'Employment', status: 'draft', lastModified: '2026-04-03', version: 2, assignee: 'M. Torres' },
  { id: 'c4', title: 'Software License Agreement', client: 'TechFlow Inc.', type: 'License', status: 'review', lastModified: '2026-03-28', version: 4, assignee: 'J. Chen' },
  { id: 'c5', title: 'Lease Agreement', client: 'Pinnacle Real Estate', type: 'Lease', status: 'executed', lastModified: '2026-02-14', version: 1, assignee: 'A. Rivera' },
  { id: 'c6', title: 'Settlement Agreement', client: 'Westbrook Ltd.', type: 'Settlement', status: 'expired', lastModified: '2025-11-30', version: 1, assignee: 'S. Park' },
  { id: 'c7', title: 'Partnership Agreement', client: 'Sterling & Associates', type: 'Partnership', status: 'draft', lastModified: '2026-04-04', version: 1, assignee: 'M. Torres' },
];

// ── Contract Diff Data ──

export interface DiffLine {
  type: 'add' | 'remove' | 'context';
  text: string;
  author?: string;
}

export const contractDiffLines: DiffLine[] = [
  { type: 'context', text: '1. DEFINITIONS' },
  { type: 'context', text: '"Confidential Information" means any proprietary data, trade secrets,' },
  { type: 'remove', text: 'know-how, or other business information disclosed by either party.', author: 'J. Chen' },
  { type: 'add', text: 'know-how, intellectual property, or other business information disclosed by either party, whether in written, oral, or electronic form.', author: 'S. Park' },
  { type: 'context', text: '' },
  { type: 'context', text: '2. OBLIGATIONS' },
  { type: 'context', text: 'The Receiving Party agrees to:' },
  { type: 'remove', text: '(a) maintain the confidentiality of all Confidential Information;', author: 'J. Chen' },
  { type: 'add', text: '(a) maintain the strict confidentiality of all Confidential Information using no less than reasonable care;', author: 'S. Park' },
  { type: 'add', text: '(b) restrict access to Confidential Information to employees and agents who have a need to know;', author: 'S. Park' },
  { type: 'remove', text: '(b) not disclose such information to any third party without prior consent.', author: 'J. Chen' },
  { type: 'add', text: '(c) not disclose such information to any third party without prior written consent of the Disclosing Party.', author: 'S. Park' },
  { type: 'context', text: '' },
  { type: 'context', text: '3. TERM' },
  { type: 'remove', text: 'This Agreement shall remain in effect for two (2) years from the Effective Date.', author: 'J. Chen' },
  { type: 'add', text: 'This Agreement shall remain in effect for three (3) years from the Effective Date, with automatic renewal for successive one-year periods.', author: 'S. Park' },
  { type: 'context', text: '' },
  { type: 'context', text: '4. GOVERNING LAW' },
  { type: 'context', text: 'This Agreement shall be governed by the laws of the State of Delaware.' },
];

// ── Matter Data ──

export interface Matter {
  id: string;
  title: string;
  client: string;
  type: string;
  status: 'active' | 'pending' | 'closed' | 'on-hold';
  priority: 'high' | 'medium' | 'low';
  assignee: string;
  openDate: string;
  dueDate: string;
  billableHours: number;
  budget: number;
}

export const matters: Matter[] = [
  { id: 'm1', title: 'Meridian Corp. IP Dispute', client: 'Meridian Corp.', type: 'Litigation', status: 'active', priority: 'high', assignee: 'J. Chen', openDate: '2026-01-15', dueDate: '2026-06-30', billableHours: 142.5, budget: 75000 },
  { id: 'm2', title: 'Atlas Holdings Acquisition', client: 'Atlas Holdings', type: 'M&A', status: 'active', priority: 'high', assignee: 'S. Park', openDate: '2026-02-01', dueDate: '2026-05-15', billableHours: 89.0, budget: 120000 },
  { id: 'm3', title: 'TechFlow Compliance Review', client: 'TechFlow Inc.', type: 'Regulatory', status: 'pending', priority: 'medium', assignee: 'M. Torres', openDate: '2026-03-10', dueDate: '2026-07-01', billableHours: 23.5, budget: 35000 },
  { id: 'm4', title: 'Sterling Partnership Formation', client: 'Sterling & Associates', type: 'Corporate', status: 'active', priority: 'low', assignee: 'A. Rivera', openDate: '2026-03-20', dueDate: '2026-08-01', billableHours: 16.0, budget: 25000 },
  { id: 'm5', title: 'Pinnacle Lease Renegotiation', client: 'Pinnacle Real Estate', type: 'Real Estate', status: 'on-hold', priority: 'low', assignee: 'J. Chen', openDate: '2025-12-01', dueDate: '2026-04-15', billableHours: 34.0, budget: 15000 },
  { id: 'm6', title: 'Westbrook Settlement Enforcement', client: 'Westbrook Ltd.', type: 'Litigation', status: 'closed', priority: 'medium', assignee: 'S. Park', openDate: '2025-09-01', dueDate: '2026-02-28', billableHours: 78.5, budget: 45000 },
];

// ── Activity Feed Data ──

export interface Activity {
  id: string;
  type: 'note' | 'document' | 'billing' | 'status' | 'deadline';
  author: string;
  message: string;
  timestamp: string;
}

export const activities: Activity[] = [
  { id: 'a1', type: 'document', author: 'J. Chen', message: 'Uploaded revised complaint (v3)', timestamp: '2026-04-05T14:30:00' },
  { id: 'a2', type: 'billing', author: 'S. Park', message: 'Logged 3.5 hours — Document review', timestamp: '2026-04-05T11:00:00' },
  { id: 'a3', type: 'note', author: 'M. Torres', message: 'Opposing counsel requested 2-week extension for discovery deadline.', timestamp: '2026-04-04T16:45:00' },
  { id: 'a4', type: 'status', author: 'J. Chen', message: 'Matter status changed from Pending to Active', timestamp: '2026-04-04T09:15:00' },
  { id: 'a5', type: 'deadline', author: 'System', message: 'Response brief due in 14 days', timestamp: '2026-04-03T08:00:00' },
  { id: 'a6', type: 'document', author: 'A. Rivera', message: 'Filed motion for summary judgment', timestamp: '2026-04-02T15:20:00' },
  { id: 'a7', type: 'billing', author: 'J. Chen', message: 'Logged 5.0 hours — Deposition preparation', timestamp: '2026-04-01T17:00:00' },
  { id: 'a8', type: 'note', author: 'S. Park', message: 'Reviewed client testimony transcripts. Several inconsistencies noted.', timestamp: '2026-03-31T14:00:00' },
];

// ── Citation Graph Data ──

export interface GraphNode {
  id: string;
  label: string;
  citation: string;
  x: number;
  y: number;
  status: CaseLaw['status'];
}

export interface GraphEdge {
  from: string;
  to: string;
}

export function buildCitationGraph(caseIds?: string[]): { nodes: GraphNode[]; edges: GraphEdge[] } {
  const subset = caseIds ? caseLaw.filter((c) => caseIds.includes(c.id)) : caseLaw.slice(0, 8);
  const idSet = new Set(subset.map((c) => c.id));

  const nodes: GraphNode[] = subset.map((c, i) => {
    const col = i % 4;
    const row = Math.floor(i / 4);
    return {
      id: c.id,
      label: c.name.length > 20 ? c.name.slice(0, 18) + '...' : c.name,
      citation: c.citation,
      x: 120 + col * 200,
      y: 80 + row * 140,
      status: c.status,
    };
  });

  const edges: GraphEdge[] = [];
  for (const c of subset) {
    for (const cited of c.cites) {
      if (idSet.has(cited)) {
        edges.push({ from: c.id, to: cited });
      }
    }
  }

  return { nodes, edges };
}

// ── Testimonials ──

export interface Testimonial {
  id: string;
  quote: string;
  author: string;
  title: string;
  firm: string;
}

export const testimonials: Testimonial[] = [
  { id: 't1', quote: 'Our research time dropped by 60%. The citation graph alone pays for itself.', author: 'Katherine Wells', title: 'Senior Partner', firm: 'Wells & Hartfield LLP' },
  { id: 't2', quote: 'Contract redlining with tracked changes saves our associates hours per review cycle.', author: 'David Morimoto', title: 'Managing Partner', firm: 'Morimoto Legal Group' },
  { id: 't3', quote: 'The billable hour tracking integrated directly into matter cards is a game-changer.', author: 'Sarah Okonkwo', title: 'Legal Operations Director', firm: 'Cascade Partners' },
];

// ── Marketing Features ──

export interface Feature {
  icon: string;
  title: string;
  description: string;
}

export const features: Feature[] = [
  { icon: 'Search', title: 'Case Law Research', description: 'Search across millions of cases with intelligent filters. Shepardize citations instantly.' },
  { icon: 'GitCompareArrows', title: 'Contract Redlining', description: 'Track changes with author attribution. Side-by-side diff comparison for every version.' },
  { icon: 'Scale', title: 'Matter Management', description: 'Track matters from intake to close. Monitor billable hours, deadlines, and budgets.' },
  { icon: 'Network', title: 'Citation Graphs', description: 'Visualize how cases cite each other. Identify key authorities and trace legal reasoning.' },
  { icon: 'Clock', title: 'Billing Tracking', description: 'Integrated time tracking with urgency indicators. Never miss a billable entry.' },
  { icon: 'Shield', title: 'Shepardize', description: 'Verify case validity in real-time. Automatic warnings for overruled or superseded decisions.' },
];

// ── Timeline Data ──

export interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  description: string;
  type: 'filing' | 'hearing' | 'deadline' | 'milestone';
}

export const timelineEvents: TimelineEvent[] = [
  { id: 'te1', date: '2026-01-15', title: 'Case Filed', description: 'Initial complaint filed in Delaware District Court.', type: 'filing' },
  { id: 'te2', date: '2026-02-01', title: 'Service of Process', description: 'Defendant served via registered agent.', type: 'milestone' },
  { id: 'te3', date: '2026-02-28', title: 'Answer Filed', description: 'Defendant filed answer with counterclaims.', type: 'filing' },
  { id: 'te4', date: '2026-03-15', title: 'Discovery Conference', description: 'Initial discovery conference with Magistrate Judge.', type: 'hearing' },
  { id: 'te5', date: '2026-04-15', title: 'Discovery Deadline', description: 'All written discovery responses due.', type: 'deadline' },
  { id: 'te6', date: '2026-05-10', title: 'Depositions', description: 'Key witness depositions scheduled.', type: 'hearing' },
  { id: 'te7', date: '2026-06-15', title: 'Summary Judgment', description: 'Deadline for summary judgment motions.', type: 'deadline' },
  { id: 'te8', date: '2026-06-30', title: 'Trial Date', description: 'Trial scheduled before Hon. Judge Patterson.', type: 'milestone' },
];

// ── Settings Sections ──

export interface SettingsField {
  id: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'toggle' | 'select';
  value: string;
  options?: string[];
}

export const profileFields: SettingsField[] = [
  { id: 'name', label: 'Full Name', type: 'text', value: 'Jordan Chen' },
  { id: 'email', label: 'Email', type: 'email', value: 'j.chen@lexresearch.io' },
  { id: 'title', label: 'Title', type: 'text', value: 'Senior Associate' },
  { id: 'firm', label: 'Firm', type: 'text', value: 'Chen, Park & Associates LLP' },
  { id: 'bar', label: 'Bar Number', type: 'text', value: 'DE-2019-04523' },
];

export const securityFields: SettingsField[] = [
  { id: 'password', label: 'Current Password', type: 'password', value: '' },
  { id: 'new-password', label: 'New Password', type: 'password', value: '' },
  { id: 'confirm-password', label: 'Confirm Password', type: 'password', value: '' },
];

export const preferenceFields: SettingsField[] = [
  { id: 'citation-format', label: 'Citation Format', type: 'select', value: 'Bluebook', options: ['Bluebook', 'ALWD', 'Chicago', 'APA'] },
  { id: 'default-jurisdiction', label: 'Default Jurisdiction', type: 'select', value: 'Federal', options: ['Federal', 'Delaware', 'New York', 'California', 'Texas'] },
  { id: 'notifications', label: 'Email Notifications', type: 'toggle', value: 'true' },
  { id: 'deadline-reminders', label: 'Deadline Reminders', type: 'toggle', value: 'true' },
];

// ── Sessions ──

export interface Session {
  id: string;
  device: string;
  location: string;
  lastActive: string;
  current: boolean;
}

export const sessions: Session[] = [
  { id: 's1', device: 'Chrome on macOS', location: 'Wilmington, DE', lastActive: 'Now', current: true },
  { id: 's2', device: 'Safari on iPhone', location: 'Wilmington, DE', lastActive: '2 hours ago', current: false },
  { id: 's3', device: 'Firefox on Windows', location: 'Philadelphia, PA', lastActive: '3 days ago', current: false },
];
