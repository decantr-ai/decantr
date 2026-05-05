// Mock data for Evergreen Health & Wellness Portal

export type VitalStatus = 'normal' | 'elevated' | 'high' | 'low';

export interface Vital {
  id: string;
  name: string;
  value: string;
  unit: string;
  status: VitalStatus;
  statusLabel: string;
  lastReading: string;
  trend: number[];
  range: string;
}

export const vitals: Vital[] = [
  {
    id: 'bp',
    name: 'Blood Pressure',
    value: '118/76',
    unit: 'mmHg',
    status: 'normal',
    statusLabel: 'Normal',
    lastReading: '2 hours ago',
    trend: [120, 118, 122, 119, 121, 117, 118],
    range: '90/60 – 120/80',
  },
  {
    id: 'hr',
    name: 'Resting Heart Rate',
    value: '68',
    unit: 'bpm',
    status: 'normal',
    statusLabel: 'Normal',
    lastReading: 'This morning',
    trend: [72, 70, 68, 71, 69, 67, 68],
    range: '60 – 100 bpm',
  },
  {
    id: 'glucose',
    name: 'Blood Glucose',
    value: '142',
    unit: 'mg/dL',
    status: 'elevated',
    statusLabel: 'Slightly Elevated',
    lastReading: 'Before breakfast',
    trend: [128, 132, 138, 140, 145, 141, 142],
    range: '70 – 140 mg/dL',
  },
  {
    id: 'o2',
    name: 'Oxygen Saturation',
    value: '98',
    unit: '%',
    status: 'normal',
    statusLabel: 'Normal',
    lastReading: 'Yesterday',
    trend: [97, 98, 98, 97, 98, 99, 98],
    range: '95 – 100%',
  },
  {
    id: 'temp',
    name: 'Body Temperature',
    value: '98.4',
    unit: '°F',
    status: 'normal',
    statusLabel: 'Normal',
    lastReading: 'This morning',
    trend: [98.2, 98.4, 98.6, 98.3, 98.5, 98.4, 98.4],
    range: '97.0 – 99.0 °F',
  },
  {
    id: 'weight',
    name: 'Weight',
    value: '152',
    unit: 'lbs',
    status: 'normal',
    statusLabel: 'Normal',
    lastReading: '2 days ago',
    trend: [154, 153, 153, 152, 152, 151, 152],
    range: 'Healthy range',
  },
];

export interface Provider {
  id: string;
  name: string;
  title: string;
  specialty: string;
  avatar: string;
  available: boolean;
}

export const providers: Provider[] = [
  { id: 'dr1', name: 'Dr. Mira Patel', title: 'MD', specialty: 'Primary Care', avatar: 'MP', available: true },
  { id: 'dr2', name: 'Dr. James Okafor', title: 'MD', specialty: 'Cardiology', avatar: 'JO', available: true },
  { id: 'dr3', name: 'Dr. Lena Chen', title: 'MD', specialty: 'Endocrinology', avatar: 'LC', available: false },
  { id: 'dr4', name: 'Dr. Samir Haddad', title: 'MD', specialty: 'Internal Medicine', avatar: 'SH', available: true },
];

export interface Appointment {
  id: string;
  type: 'in-person' | 'telehealth';
  providerId: string;
  providerName: string;
  specialty: string;
  date: string;
  time: string;
  duration: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  location: string;
  reason: string;
}

export const appointments: Appointment[] = [
  {
    id: 'apt-1042',
    type: 'telehealth',
    providerId: 'dr1',
    providerName: 'Dr. Mira Patel',
    specialty: 'Primary Care',
    date: '2026-04-08',
    time: '10:30 AM',
    duration: '30 min',
    status: 'upcoming',
    location: 'Video visit',
    reason: 'Annual wellness check',
  },
  {
    id: 'apt-1041',
    type: 'in-person',
    providerId: 'dr2',
    providerName: 'Dr. James Okafor',
    specialty: 'Cardiology',
    date: '2026-04-15',
    time: '2:00 PM',
    duration: '45 min',
    status: 'upcoming',
    location: 'Evergreen Heart Center, Suite 304',
    reason: 'Follow-up consultation',
  },
  {
    id: 'apt-1040',
    type: 'telehealth',
    providerId: 'dr3',
    providerName: 'Dr. Lena Chen',
    specialty: 'Endocrinology',
    date: '2026-04-22',
    time: '9:00 AM',
    duration: '30 min',
    status: 'upcoming',
    location: 'Video visit',
    reason: 'Glucose management review',
  },
  {
    id: 'apt-1039',
    type: 'in-person',
    providerId: 'dr1',
    providerName: 'Dr. Mira Patel',
    specialty: 'Primary Care',
    date: '2026-03-20',
    time: '11:00 AM',
    duration: '30 min',
    status: 'completed',
    location: 'Evergreen Primary Care, Suite 210',
    reason: 'Flu symptoms',
  },
  {
    id: 'apt-1038',
    type: 'telehealth',
    providerId: 'dr4',
    providerName: 'Dr. Samir Haddad',
    specialty: 'Internal Medicine',
    date: '2026-03-05',
    time: '3:30 PM',
    duration: '20 min',
    status: 'completed',
    location: 'Video visit',
    reason: 'Medication review',
  },
];

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  refillsRemaining: number;
  nextRefill: string;
  prescribedBy: string;
  adherence: number;
  instructions: string;
}

export const medications: Medication[] = [
  {
    id: 'med-1',
    name: 'Metformin',
    dosage: '500 mg',
    frequency: 'Twice daily with meals',
    refillsRemaining: 3,
    nextRefill: '2026-04-28',
    prescribedBy: 'Dr. Lena Chen',
    adherence: 94,
    instructions: 'Take with breakfast and dinner. Drink plenty of water.',
  },
  {
    id: 'med-2',
    name: 'Lisinopril',
    dosage: '10 mg',
    frequency: 'Once daily, morning',
    refillsRemaining: 5,
    nextRefill: '2026-05-12',
    prescribedBy: 'Dr. Mira Patel',
    adherence: 98,
    instructions: 'Take in the morning, same time each day.',
  },
  {
    id: 'med-3',
    name: 'Atorvastatin',
    dosage: '20 mg',
    frequency: 'Once daily, bedtime',
    refillsRemaining: 2,
    nextRefill: '2026-04-18',
    prescribedBy: 'Dr. James Okafor',
    adherence: 89,
    instructions: 'Take at bedtime. Avoid grapefruit.',
  },
  {
    id: 'med-4',
    name: 'Vitamin D3',
    dosage: '2000 IU',
    frequency: 'Once daily',
    refillsRemaining: 0,
    nextRefill: '2026-04-10',
    prescribedBy: 'Dr. Mira Patel',
    adherence: 76,
    instructions: 'Take with a meal containing fat for best absorption.',
  },
];

export interface HealthRecord {
  id: string;
  name: string;
  type: 'lab' | 'imaging' | 'note' | 'form' | 'prescription';
  category: string;
  date: string;
  provider: string;
  sizeKb: number;
  summary: string;
}

export const healthRecords: HealthRecord[] = [
  { id: 'rec-1', name: 'Comprehensive Metabolic Panel', type: 'lab', category: 'Lab Results', date: '2026-03-28', provider: 'Evergreen Lab', sizeKb: 142, summary: 'Most values in range. Glucose slightly elevated.' },
  { id: 'rec-2', name: 'Lipid Panel', type: 'lab', category: 'Lab Results', date: '2026-03-28', provider: 'Evergreen Lab', sizeKb: 98, summary: 'LDL improved from last reading.' },
  { id: 'rec-3', name: 'Chest X-Ray', type: 'imaging', category: 'Imaging', date: '2026-02-14', provider: 'Evergreen Imaging', sizeKb: 4820, summary: 'Normal findings. No abnormalities detected.' },
  { id: 'rec-4', name: 'Annual Physical Notes', type: 'note', category: 'Visit Notes', date: '2026-03-20', provider: 'Dr. Mira Patel', sizeKb: 34, summary: 'Overall health excellent. Continue current plan.' },
  { id: 'rec-5', name: 'Cardiology Consultation', type: 'note', category: 'Visit Notes', date: '2026-02-28', provider: 'Dr. James Okafor', sizeKb: 48, summary: 'BP management strategy reviewed.' },
  { id: 'rec-6', name: 'New Patient Intake Form', type: 'form', category: 'Forms', date: '2021-05-12', provider: 'Evergreen Care', sizeKb: 22, summary: 'Initial medical history.' },
  { id: 'rec-7', name: 'EKG Report', type: 'imaging', category: 'Imaging', date: '2026-02-14', provider: 'Dr. James Okafor', sizeKb: 340, summary: 'Normal sinus rhythm.' },
  { id: 'rec-8', name: 'Prescription: Metformin', type: 'prescription', category: 'Prescriptions', date: '2026-01-18', provider: 'Dr. Lena Chen', sizeKb: 12, summary: '500 mg twice daily.' },
];

export interface TelehealthSession {
  id: string;
  appointmentId: string;
  providerName: string;
  providerAvatar: string;
  specialty: string;
  startedAt: string;
  duration: string;
  status: 'connecting' | 'live' | 'ended';
}

export const currentTelehealthSession: TelehealthSession = {
  id: 'sess-2026-04-08-1030',
  appointmentId: 'apt-1042',
  providerName: 'Dr. Mira Patel',
  providerAvatar: 'MP',
  specialty: 'Primary Care',
  startedAt: '10:30 AM',
  duration: '00:12:34',
  status: 'live',
};

export const sessionNotes = [
  { time: '10:32', text: 'Patient reports feeling well overall. Energy levels stable.' },
  { time: '10:35', text: 'Glucose readings reviewed. Slight upward trend noted.' },
  { time: '10:38', text: 'Discussed dietary adjustments and exercise routine.' },
  { time: '10:41', text: 'Medication adherence excellent. No changes needed.' },
];

// Marketing
export const marketingFeatures = [
  { icon: 'calendar', title: 'Simple Appointment Booking', description: 'Book in-person or telehealth visits with your care team in three taps. Real availability. No phone tag.' },
  { icon: 'heart', title: 'Vitals That Make Sense', description: 'Track blood pressure, glucose, heart rate, and more with color-coded, clearly-labeled status indicators.' },
  { icon: 'video', title: 'Calm Telehealth Rooms', description: 'Quiet video visits with your provider. Large controls. Captions on by default. HIPAA-secure.' },
  { icon: 'pill', title: 'Medication Management', description: 'Dose reminders, refill tracking, and adherence insights — so nothing falls through the cracks.' },
  { icon: 'folder', title: 'Secure Records Vault', description: 'Lab results, imaging, visit notes — all in one encrypted place. Download or share with anyone you choose.' },
  { icon: 'shield', title: 'Privacy First', description: 'HIPAA-compliant, end-to-end encrypted. You own your data and decide who sees it, always.' },
];

export const testimonials = [
  { quote: "Finally a patient portal that feels designed for humans. I can see my labs, refill meds, and message my doctor without three logins.", author: 'Marcus Thompson', role: 'Patient since 2022', avatar: 'MT' },
  { quote: "The vitals dashboard helped me understand my blood pressure trends in a way no paper chart ever did. My cardiologist loves it too.", author: 'Joan Whitfield', role: 'Patient since 2020', avatar: 'JW' },
  { quote: "Telehealth visits are smooth. Large buttons, clear audio, and my doctor can see my vitals right in the call. Huge for my mom.", author: 'Priya Raman', role: 'Caregiver', avatar: 'PR' },
];

export const marketingStats = [
  { value: '250k+', label: 'Patients served' },
  { value: '98%', label: 'Satisfaction rate' },
  { value: '4.9★', label: 'App store rating' },
  { value: 'HIPAA', label: 'Compliant' },
];

// Upcoming appointments (calendar-view)
export const upcomingDays = [
  { day: 8, month: 'Apr', events: 1, label: 'Dr. Patel, 10:30 AM' },
  { day: 15, month: 'Apr', events: 1, label: 'Dr. Okafor, 2:00 PM' },
  { day: 22, month: 'Apr', events: 1, label: 'Dr. Chen, 9:00 AM' },
];

// Sessions for settings
export const activeSessions = [
  { id: 's1', device: 'MacBook Pro — Safari', location: 'Seattle, WA', lastActive: 'Active now', current: true },
  { id: 's2', device: 'iPhone 15 — Evergreen app', location: 'Seattle, WA', lastActive: '2 hours ago', current: false },
  { id: 's3', device: 'iPad — Safari', location: 'Seattle, WA', lastActive: 'Yesterday', current: false },
];
