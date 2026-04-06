// ── Civic Metrics ──
export const civicMetrics = [
  { label: 'Active Petitions', value: 47, change: '+12%', trend: 'up' as const },
  { label: 'Votes Cast', value: 3842, change: '+8%', trend: 'up' as const },
  { label: 'Open Requests', value: 156, change: '-5%', trend: 'down' as const },
  { label: 'Meeting Hours', value: 284, change: '+3%', trend: 'up' as const },
];

// ── Petitions ──
export interface Petition {
  id: string;
  title: string;
  description: string;
  category: string;
  author: string;
  signatures: number;
  goal: number;
  status: 'active' | 'closed' | 'pending';
  createdAt: string;
  comments: Comment[];
  votes: { yes: number; no: number; abstain: number };
}

export interface Comment {
  id: string;
  author: string;
  text: string;
  date: string;
}

export const petitions: Petition[] = [
  {
    id: 'p1', title: 'Expand Downtown Bike Lanes', description: 'Proposal to add protected bike lanes on Main St and Oak Ave to improve cyclist safety and reduce traffic congestion in the downtown core.',
    category: 'Transportation', author: 'James Chen', signatures: 847, goal: 1000, status: 'active', createdAt: '2026-03-15',
    comments: [
      { id: 'c1', author: 'Sarah Kim', text: 'This would make my commute so much safer. Full support!', date: '2026-03-18' },
      { id: 'c2', author: 'David Park', text: 'What about parking for businesses on Main St?', date: '2026-03-19' },
      { id: 'c3', author: 'Lisa Torres', text: 'Portland did this and saw a 40% increase in cycling. Great idea.', date: '2026-03-20' },
    ],
    votes: { yes: 623, no: 187, abstain: 37 },
  },
  {
    id: 'p2', title: 'Community Garden on Elm Street', description: 'Convert the vacant lot at 450 Elm Street into a community garden with raised beds, composting station, and a small gathering pavilion.',
    category: 'Parks & Rec', author: 'Maria Santos', signatures: 524, goal: 500, status: 'active', createdAt: '2026-02-28',
    comments: [
      { id: 'c4', author: 'Tom Wilson', text: 'Our neighborhood needs this. Count me in for volunteer hours.', date: '2026-03-02' },
    ],
    votes: { yes: 412, no: 89, abstain: 23 },
  },
  {
    id: 'p3', title: 'Increase Library Weekend Hours', description: 'Extend library hours to 9 PM on Saturdays and open on Sundays from 10 AM to 6 PM to serve working families.',
    category: 'Public Services', author: 'Rachel Green', signatures: 1203, goal: 1500, status: 'active', createdAt: '2026-01-10',
    comments: [
      { id: 'c5', author: 'Mike Brown', text: 'As a single parent, weekend library access is essential.', date: '2026-01-15' },
      { id: 'c6', author: 'Anna Lee', text: 'The current hours make it impossible for many families.', date: '2026-01-18' },
    ],
    votes: { yes: 956, no: 201, abstain: 46 },
  },
  {
    id: 'p4', title: 'Install LED Streetlights on Oak Avenue', description: 'Replace aging sodium vapor streetlights with energy-efficient LED fixtures along Oak Avenue from 1st to 12th Street.',
    category: 'Infrastructure', author: 'Carlos Ruiz', signatures: 356, goal: 750, status: 'active', createdAt: '2026-03-01',
    comments: [],
    votes: { yes: 287, no: 52, abstain: 17 },
  },
  {
    id: 'p5', title: 'Ban Single-Use Plastics in City Buildings', description: 'Eliminate single-use plastic cups, utensils, and bags from all city-owned buildings and events.',
    category: 'Environment', author: 'Priya Sharma', signatures: 980, goal: 1000, status: 'active', createdAt: '2026-02-14',
    comments: [
      { id: 'c7', author: 'Kevin Liu', text: 'Long overdue. Many cities have already done this.', date: '2026-02-20' },
    ],
    votes: { yes: 789, no: 145, abstain: 46 },
  },
  {
    id: 'p6', title: 'Restore Historic City Hall Facade', description: 'Fund restoration of the deteriorating limestone facade of the 1892 City Hall building to preserve our architectural heritage.',
    category: 'Heritage', author: 'Eleanor Wright', signatures: 445, goal: 500, status: 'closed', createdAt: '2025-11-05',
    comments: [],
    votes: { yes: 380, no: 42, abstain: 23 },
  },
];

export const petitionCategories = ['All', 'Transportation', 'Parks & Rec', 'Public Services', 'Infrastructure', 'Environment', 'Heritage'];

// ── Activity Feed ──
export const activityFeed = [
  { id: 'a1', type: 'petition' as const, text: 'New petition: "Expand Downtown Bike Lanes" reached 800 signatures', time: '2 hours ago' },
  { id: 'a2', type: 'vote' as const, text: 'Council voted 5-2 to approve Q2 infrastructure spending', time: '5 hours ago' },
  { id: 'a3', type: 'meeting' as const, text: 'Planning Commission meeting scheduled for April 10', time: '1 day ago' },
  { id: 'a4', type: 'request' as const, text: 'Pothole report #SR-2341 on Maple Dr marked as resolved', time: '1 day ago' },
  { id: 'a5', type: 'petition' as const, text: '"Community Garden on Elm Street" reached its signature goal!', time: '2 days ago' },
  { id: 'a6', type: 'vote' as const, text: 'Public comment period open for zoning amendment ZA-2026-04', time: '3 days ago' },
];

// ── Budget ──
export interface BudgetCategory {
  id: string;
  name: string;
  allocated: number;
  spent: number;
  color: string;
  subcategories: { name: string; amount: number }[];
}

export const budgetYear = 2026;
export const totalBudget = 142_500_000;

export const budgetCategories: BudgetCategory[] = [
  { id: 'public-safety', name: 'Public Safety', allocated: 38_200_000, spent: 29_800_000, color: '#1D4ED8',
    subcategories: [
      { name: 'Police Department', amount: 22_100_000 },
      { name: 'Fire & Rescue', amount: 12_400_000 },
      { name: 'Emergency Services', amount: 3_700_000 },
    ] },
  { id: 'infrastructure', name: 'Infrastructure', allocated: 28_500_000, spent: 21_200_000, color: '#4338CA',
    subcategories: [
      { name: 'Roads & Bridges', amount: 14_200_000 },
      { name: 'Water & Sewer', amount: 8_900_000 },
      { name: 'Public Buildings', amount: 5_400_000 },
    ] },
  { id: 'education', name: 'Education', allocated: 24_800_000, spent: 19_600_000, color: '#15803D',
    subcategories: [
      { name: 'K-12 Schools', amount: 18_200_000 },
      { name: 'Libraries', amount: 3_800_000 },
      { name: 'Adult Education', amount: 2_800_000 },
    ] },
  { id: 'parks-recreation', name: 'Parks & Recreation', allocated: 15_200_000, spent: 11_400_000, color: '#A16207',
    subcategories: [
      { name: 'Park Maintenance', amount: 7_600_000 },
      { name: 'Recreation Programs', amount: 4_800_000 },
      { name: 'Community Centers', amount: 2_800_000 },
    ] },
  { id: 'health-services', name: 'Health Services', allocated: 18_400_000, spent: 14_100_000, color: '#B91C1C',
    subcategories: [
      { name: 'Public Health', amount: 9_200_000 },
      { name: 'Mental Health', amount: 5_600_000 },
      { name: 'Senior Services', amount: 3_600_000 },
    ] },
  { id: 'administration', name: 'Administration', allocated: 17_400_000, spent: 13_900_000, color: '#6B7280',
    subcategories: [
      { name: 'City Management', amount: 6_800_000 },
      { name: 'Finance & HR', amount: 5_400_000 },
      { name: 'IT & Technology', amount: 5_200_000 },
    ] },
];

export const budgetKpis = [
  { label: 'Total Budget', value: '$142.5M', sub: 'FY 2026' },
  { label: 'Spent YTD', value: '$110.0M', sub: '77.2% utilized' },
  { label: 'Remaining', value: '$32.5M', sub: 'On track' },
  { label: 'Capital Projects', value: '24', sub: '18 on schedule' },
];

// ── Meetings ──
export interface Meeting {
  id: string;
  title: string;
  body: string;
  date: string;
  time: string;
  location: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  agendaItems: AgendaItem[];
  votes: MeetingVote[];
}

export interface AgendaItem {
  id: string;
  title: string;
  time: string;
  speaker: string;
  type: 'presentation' | 'discussion' | 'vote' | 'public-comment';
}

export interface MeetingVote {
  id: string;
  item: string;
  result: 'passed' | 'failed' | 'tabled';
  yea: number;
  nay: number;
  abstain: number;
}

export const meetings: Meeting[] = [
  {
    id: 'm1', title: 'City Council Regular Session', body: 'City Council', date: '2026-04-10', time: '7:00 PM', location: 'Council Chambers, City Hall', status: 'upcoming',
    agendaItems: [
      { id: 'ai1', title: 'Call to Order & Roll Call', time: '7:00 PM', speaker: 'Mayor Thompson', type: 'presentation' },
      { id: 'ai2', title: 'Public Comment Period', time: '7:10 PM', speaker: 'Open', type: 'public-comment' },
      { id: 'ai3', title: 'Q2 Budget Amendment Discussion', time: '7:30 PM', speaker: 'CFO Williams', type: 'discussion' },
      { id: 'ai4', title: 'Vote: Downtown Bike Lane Project', time: '8:00 PM', speaker: 'Council', type: 'vote' },
      { id: 'ai5', title: 'Zoning Amendment ZA-2026-04', time: '8:30 PM', speaker: 'Planning Dir. Garcia', type: 'discussion' },
    ],
    votes: [],
  },
  {
    id: 'm2', title: 'Planning Commission Meeting', body: 'Planning Commission', date: '2026-04-03', time: '6:30 PM', location: 'Room 201, City Hall', status: 'completed',
    agendaItems: [
      { id: 'ai6', title: 'Zoning Variance Request: 100 Oak St', time: '6:30 PM', speaker: 'Applicant', type: 'presentation' },
      { id: 'ai7', title: 'Public Comment', time: '7:00 PM', speaker: 'Open', type: 'public-comment' },
      { id: 'ai8', title: 'Vote: Variance Approval', time: '7:30 PM', speaker: 'Commission', type: 'vote' },
    ],
    votes: [
      { id: 'v1', item: 'Zoning Variance: 100 Oak St', result: 'passed', yea: 5, nay: 2, abstain: 0 },
    ],
  },
  {
    id: 'm3', title: 'Parks & Recreation Board', body: 'Parks Board', date: '2026-03-28', time: '5:00 PM', location: 'Community Center', status: 'completed',
    agendaItems: [
      { id: 'ai9', title: 'Community Garden Proposal Review', time: '5:00 PM', speaker: 'Board Chair', type: 'discussion' },
      { id: 'ai10', title: 'Summer Programs Budget', time: '5:45 PM', speaker: 'Dir. Martinez', type: 'presentation' },
      { id: 'ai11', title: 'Vote: Elm Street Garden', time: '6:15 PM', speaker: 'Board', type: 'vote' },
    ],
    votes: [
      { id: 'v2', item: 'Elm Street Community Garden', result: 'passed', yea: 6, nay: 1, abstain: 0 },
      { id: 'v3', item: 'Summer Programs Budget Increase', result: 'passed', yea: 5, nay: 1, abstain: 1 },
    ],
  },
  {
    id: 'm4', title: 'Budget Committee Work Session', body: 'Budget Committee', date: '2026-03-20', time: '4:00 PM', location: 'Conference Room A', status: 'completed',
    agendaItems: [
      { id: 'ai12', title: 'FY2026 Q1 Expenditure Review', time: '4:00 PM', speaker: 'CFO Williams', type: 'presentation' },
      { id: 'ai13', title: 'Capital Projects Status Update', time: '4:45 PM', speaker: 'Dir. Johnson', type: 'presentation' },
    ],
    votes: [],
  },
];

export const meetingBodies = ['All', 'City Council', 'Planning Commission', 'Parks Board', 'Budget Committee'];

// ── Service Requests ──
export interface ServiceRequest {
  id: string;
  title: string;
  description: string;
  category: string;
  status: 'new' | 'assigned' | 'in-progress' | 'resolved';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  location: string;
  reporter: string;
  assignee: string | null;
  createdAt: string;
  updatedAt: string;
  timeline: TimelineEvent[];
}

export interface TimelineEvent {
  id: string;
  action: string;
  actor: string;
  date: string;
}

export const serviceRequests: ServiceRequest[] = [
  {
    id: 'SR-2341', title: 'Pothole on Maple Drive', description: 'Large pothole near the intersection of Maple Dr and 5th Ave, approximately 2 feet wide.',
    category: 'Roads', status: 'resolved', priority: 'high', location: 'Maple Dr & 5th Ave', reporter: 'John Davis', assignee: 'Public Works Team A', createdAt: '2026-03-20', updatedAt: '2026-04-01',
    timeline: [
      { id: 't1', action: 'Request submitted', actor: 'John Davis', date: '2026-03-20' },
      { id: 't2', action: 'Assigned to Public Works Team A', actor: 'Dispatch', date: '2026-03-21' },
      { id: 't3', action: 'Repair in progress', actor: 'Public Works Team A', date: '2026-03-28' },
      { id: 't4', action: 'Repair completed', actor: 'Public Works Team A', date: '2026-04-01' },
    ],
  },
  {
    id: 'SR-2356', title: 'Broken Streetlight on Elm St', description: 'Streetlight at 230 Elm Street has been out for over a week. Safety concern for evening pedestrians.',
    category: 'Lighting', status: 'in-progress', priority: 'medium', location: '230 Elm Street', reporter: 'Lisa Torres', assignee: 'Electrical Crew B', createdAt: '2026-03-25', updatedAt: '2026-03-30',
    timeline: [
      { id: 't5', action: 'Request submitted', actor: 'Lisa Torres', date: '2026-03-25' },
      { id: 't6', action: 'Assigned to Electrical Crew B', actor: 'Dispatch', date: '2026-03-26' },
      { id: 't7', action: 'Parts ordered, repair scheduled', actor: 'Electrical Crew B', date: '2026-03-30' },
    ],
  },
  {
    id: 'SR-2370', title: 'Graffiti on Library Wall', description: 'Spray paint graffiti on the north-facing wall of the Central Library building.',
    category: 'Vandalism', status: 'assigned', priority: 'low', location: 'Central Library', reporter: 'Maria Santos', assignee: 'Maintenance Team C', createdAt: '2026-03-28', updatedAt: '2026-03-29',
    timeline: [
      { id: 't8', action: 'Request submitted', actor: 'Maria Santos', date: '2026-03-28' },
      { id: 't9', action: 'Assigned to Maintenance Team C', actor: 'Dispatch', date: '2026-03-29' },
    ],
  },
  {
    id: 'SR-2385', title: 'Fallen Tree Blocking Sidewalk', description: 'A large branch fell from the oak tree at Pine Park, blocking the main sidewalk path.',
    category: 'Parks', status: 'new', priority: 'urgent', location: 'Pine Park, Main Path', reporter: 'Kevin Liu', assignee: null, createdAt: '2026-04-04', updatedAt: '2026-04-04',
    timeline: [
      { id: 't10', action: 'Request submitted', actor: 'Kevin Liu', date: '2026-04-04' },
    ],
  },
  {
    id: 'SR-2392', title: 'Water Main Leak', description: 'Visible water pooling on the street near 456 Cedar Lane, possible underground pipe leak.',
    category: 'Water', status: 'in-progress', priority: 'urgent', location: '456 Cedar Lane', reporter: 'Tom Wilson', assignee: 'Water Dept Emergency', createdAt: '2026-04-03', updatedAt: '2026-04-05',
    timeline: [
      { id: 't11', action: 'Request submitted', actor: 'Tom Wilson', date: '2026-04-03' },
      { id: 't12', action: 'Emergency team dispatched', actor: 'Water Dept', date: '2026-04-03' },
      { id: 't13', action: 'Leak located, excavation underway', actor: 'Water Dept Emergency', date: '2026-04-05' },
    ],
  },
  {
    id: 'SR-2398', title: 'Overflowing Trash Bin at Bus Stop', description: 'Public trash bin at the Route 7 bus stop on Oak Ave has been overflowing for 3 days.',
    category: 'Sanitation', status: 'assigned', priority: 'medium', location: 'Oak Ave Bus Stop (Rt 7)', reporter: 'Priya Sharma', assignee: 'Sanitation Crew A', createdAt: '2026-04-04', updatedAt: '2026-04-05',
    timeline: [
      { id: 't14', action: 'Request submitted', actor: 'Priya Sharma', date: '2026-04-04' },
      { id: 't15', action: 'Assigned to Sanitation Crew A', actor: 'Dispatch', date: '2026-04-05' },
    ],
  },
];

export const requestCategories = ['All', 'Roads', 'Lighting', 'Vandalism', 'Parks', 'Water', 'Sanitation'];

// ── Community Quotes ──
export const communityQuotes = [
  { id: 'q1', text: 'Finally, a platform where my voice actually counts. I signed my first petition and it reached the council in days.', author: 'Sarah Kim', role: 'Ward 2 Resident' },
  { id: 'q2', text: 'Being able to track exactly where our tax dollars go has changed how I engage with local government.', author: 'David Park', role: 'Business Owner, Downtown' },
  { id: 'q3', text: 'I reported a broken streetlight and watched it get fixed in real-time. That transparency builds trust.', author: 'Lisa Torres', role: 'Ward 5 Resident' },
];

// ── Features for marketing ──
export const platformFeatures = [
  { title: 'Petition & Vote', description: 'Create petitions, gather signatures, and vote on issues that matter to your community.', icon: 'Vote' as const },
  { title: 'Budget Transparency', description: 'See exactly where taxpayer dollars flow with interactive Sankey visualizations.', icon: 'DollarSign' as const },
  { title: 'Meeting Archives', description: 'Access full meeting records, agendas, and vote results from every council session.', icon: 'Video' as const },
  { title: 'Service Requests', description: 'Report issues, track resolution status, and hold city services accountable.', icon: 'Wrench' as const },
  { title: 'WCAG AAA Accessible', description: 'Built to the highest accessibility standards. Every citizen can participate.', icon: 'Accessibility' as const },
  { title: 'Open Data', description: 'All civic data is open, searchable, and available for download.', icon: 'Database' as const },
];
