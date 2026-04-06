/* ── Mock data for Research Lab showcase ── */

export interface NotebookEntry {
  id: string;
  title: string;
  date: string;
  author: string;
  tags: string[];
  excerpt: string;
  latex?: string;
  protocols: ProtocolStep[];
}

export interface ProtocolStep {
  step: number;
  title: string;
  description: string;
  reagents: string[];
  duration: string;
  safety?: string;
}

export interface Experiment {
  id: string;
  title: string;
  status: 'planned' | 'in-progress' | 'completed' | 'failed';
  pi: string;
  startDate: string;
  endDate?: string;
  protocols: string[];
  description: string;
  progress: number;
}

export interface Sample {
  id: string;
  barcode: string;
  name: string;
  type: string;
  location: string;
  status: 'available' | 'in-use' | 'expired' | 'quarantined';
  expiresAt: string;
  custodyChain: { who: string; when: string; action: string }[];
}

export interface Instrument {
  id: string;
  name: string;
  model: string;
  status: 'online' | 'maintenance' | 'offline';
  location: string;
  nextAvailable: string;
  bookings: { user: string; date: string; slot: string; duration: string }[];
}

export interface Dataset {
  id: string;
  name: string;
  experiment: string;
  format: string;
  size: string;
  quality: 'high' | 'medium' | 'low';
  columns: { name: string; type: string; nullable: boolean }[];
  createdAt: string;
  records: number;
}

export interface NotebookNode {
  id: string;
  title: string;
  children?: NotebookNode[];
}

/* ── Notebook tree ── */
export const notebookTree: NotebookNode[] = [
  {
    id: 'project-alpha',
    title: 'Project Alpha',
    children: [
      { id: 'cell-culture-log', title: 'Cell Culture Log' },
      { id: 'pcr-optimization', title: 'PCR Optimization' },
      { id: 'gel-electrophoresis-results', title: 'Gel Electrophoresis Results' },
    ],
  },
  {
    id: 'project-beta',
    title: 'Project Beta',
    children: [
      { id: 'mass-spec-calibration', title: 'Mass Spec Calibration' },
      { id: 'hplc-method-dev', title: 'HPLC Method Development' },
    ],
  },
  {
    id: 'general',
    title: 'General',
    children: [
      { id: 'lab-meeting-notes', title: 'Lab Meeting Notes' },
      { id: 'equipment-maintenance', title: 'Equipment Maintenance' },
    ],
  },
];

/* ── Notebook entries ── */
export const notebookEntries: NotebookEntry[] = [
  {
    id: 'cell-culture-log',
    title: 'Cell Culture Log — HeLa Passage 42',
    date: '2026-04-04',
    author: 'Dr. Sarah Chen',
    tags: ['cell-culture', 'HeLa', 'passage'],
    excerpt: 'Confluency reached 85% at 72h post-seeding. Cells show normal morphology with minimal floating debris. Proceed with trypsinization protocol.',
    latex: 'C(t) = C_0 \\cdot e^{\\mu t}, \\quad \\mu = 0.023 \\, h^{-1}',
    protocols: [
      {
        step: 1,
        title: 'Aspirate Media',
        description: 'Remove spent media from T-75 flask using vacuum aspirator.',
        reagents: ['DMEM (spent)'],
        duration: '1 min',
      },
      {
        step: 2,
        title: 'Wash with PBS',
        description: 'Add 5 mL PBS (Ca²⁺/Mg²⁺-free) and gently swirl.',
        reagents: ['PBS (1X, sterile)', 'Ca²⁺/Mg²⁺-free'],
        duration: '2 min',
        safety: 'BSL-2',
      },
      {
        step: 3,
        title: 'Trypsinize',
        description: 'Add 2 mL 0.25% Trypsin-EDTA. Incubate at 37°C for 3-5 min.',
        reagents: ['Trypsin-EDTA (0.25%)', 'CO₂ incubator'],
        duration: '5 min',
        safety: 'BSL-2',
      },
      {
        step: 4,
        title: 'Neutralize & Seed',
        description: 'Add 8 mL complete media to neutralize. Transfer to new flask at 1:4 split ratio.',
        reagents: ['DMEM + 10% FBS', 'T-75 flask (new)'],
        duration: '3 min',
      },
    ],
  },
  {
    id: 'pcr-optimization',
    title: 'PCR Optimization — BRCA1 Exon 11',
    date: '2026-04-03',
    author: 'Dr. James Liu',
    tags: ['PCR', 'BRCA1', 'optimization'],
    excerpt: 'Gradient PCR across 55-68°C annealing range. Optimal band intensity at 62°C with no non-specific amplification.',
    latex: 'T_m = 81.5 + 16.6 \\log_{10}[Na^+] + 41 \\cdot (\\%GC) - \\frac{675}{N}',
    protocols: [
      {
        step: 1,
        title: 'Prepare Master Mix',
        description: 'Combine reagents on ice. 25 μL reaction volume per tube.',
        reagents: ['Taq polymerase (5U/μL)', 'dNTP mix (10mM)', '10X PCR buffer', 'MgCl₂ (25mM)', 'Forward primer (10μM)', 'Reverse primer (10μM)', 'Template DNA (50ng/μL)'],
        duration: '10 min',
      },
      {
        step: 2,
        title: 'Load Thermocycler',
        description: 'Set gradient from 55°C to 68°C across 8 columns. 30 cycles.',
        reagents: ['PCR tubes (0.2mL)'],
        duration: '90 min',
      },
    ],
  },
  {
    id: 'gel-electrophoresis-results',
    title: 'Gel Electrophoresis — Apr 2 Run',
    date: '2026-04-02',
    author: 'Dr. Sarah Chen',
    tags: ['gel', 'electrophoresis', 'imaging'],
    excerpt: 'Ran 1.5% agarose gel at 100V for 45 min. Clear bands at expected 850bp and 1200bp positions. Ladder (1kb) confirms sizing.',
    protocols: [],
  },
  {
    id: 'mass-spec-calibration',
    title: 'Mass Spec Calibration — Q-TOF',
    date: '2026-04-01',
    author: 'Dr. Maria Gonzalez',
    tags: ['mass-spec', 'calibration', 'Q-TOF'],
    excerpt: 'ESI-positive mode calibration with sodium formate clusters. Mass accuracy < 2 ppm across 100-2000 m/z range.',
    latex: 'm/z = \\frac{M + zH^+}{z}',
    protocols: [],
  },
  {
    id: 'hplc-method-dev',
    title: 'HPLC Method Development — Caffeine Assay',
    date: '2026-03-30',
    author: 'Dr. James Liu',
    tags: ['HPLC', 'method-dev', 'caffeine'],
    excerpt: 'C18 column, gradient elution ACN:H₂O with 0.1% TFA. Retention time 4.2 min at flow rate 1.0 mL/min.',
    protocols: [],
  },
  {
    id: 'lab-meeting-notes',
    title: 'Lab Meeting — Week 14',
    date: '2026-04-04',
    author: 'Lab Group',
    tags: ['meeting', 'weekly'],
    excerpt: 'Discussed Project Alpha timeline. Sarah to complete cell viability assay by Friday. James presenting at symposium next week.',
    protocols: [],
  },
  {
    id: 'equipment-maintenance',
    title: 'Equipment Maintenance Schedule',
    date: '2026-04-01',
    author: 'Lab Manager',
    tags: ['maintenance', 'equipment'],
    excerpt: 'Centrifuge #3 bearing replacement scheduled. UV-Vis lamp replacement completed. Autoclave validation passed.',
    protocols: [],
  },
];

/* ── Experiments ── */
export const experiments: Experiment[] = [
  {
    id: 'exp-001',
    title: 'BRCA1 Expression Analysis in HeLa Cells',
    status: 'in-progress',
    pi: 'Dr. Sarah Chen',
    startDate: '2026-03-15',
    protocols: ['Cell Culture', 'Western Blot', 'qPCR'],
    description: 'Quantitative analysis of BRCA1 mRNA and protein levels across different passage numbers.',
    progress: 65,
  },
  {
    id: 'exp-002',
    title: 'Caffeine Extraction from Green Tea',
    status: 'completed',
    pi: 'Dr. James Liu',
    startDate: '2026-02-01',
    endDate: '2026-03-20',
    protocols: ['Extraction', 'HPLC Analysis', 'Mass Spec'],
    description: 'Optimized solid-liquid extraction followed by HPLC and LC-MS confirmation.',
    progress: 100,
  },
  {
    id: 'exp-003',
    title: 'Protein Crystallization Screen — Lysozyme',
    status: 'planned',
    pi: 'Dr. Maria Gonzalez',
    startDate: '2026-04-15',
    protocols: ['Hanging Drop', 'Sitting Drop', 'X-ray Diffraction'],
    description: 'Systematic crystallization screening using Hampton Research Crystal Screen I and II.',
    progress: 0,
  },
  {
    id: 'exp-004',
    title: 'CRISPR-Cas9 Knockdown of TP53',
    status: 'in-progress',
    pi: 'Dr. Sarah Chen',
    startDate: '2026-03-25',
    protocols: ['Guide RNA Design', 'Transfection', 'Selection', 'Sequencing'],
    description: 'Targeted knockout of TP53 in A549 cell line for downstream functional studies.',
    progress: 35,
  },
  {
    id: 'exp-005',
    title: 'Water Quality Analysis — Campus Wells',
    status: 'failed',
    pi: 'Dr. James Liu',
    startDate: '2026-01-10',
    endDate: '2026-02-28',
    protocols: ['ICP-OES', 'Ion Chromatography', 'TOC Analysis'],
    description: 'Heavy metal and anion screening of campus well water. Failed QC due to contaminated blanks.',
    progress: 80,
  },
  {
    id: 'exp-006',
    title: 'Nanoparticle Synthesis — Gold Colloids',
    status: 'planned',
    pi: 'Dr. Maria Gonzalez',
    startDate: '2026-04-20',
    protocols: ['Turkevich Method', 'DLS', 'UV-Vis', 'TEM'],
    description: 'Citrate reduction synthesis of 20nm gold nanoparticles with size characterization.',
    progress: 0,
  },
];

/* ── Samples ── */
export const samples: Sample[] = [
  {
    id: 'smp-001',
    barcode: 'LAB-2026-04-0001',
    name: 'HeLa P42 Lysate',
    type: 'Cell Lysate',
    location: 'Freezer A, Shelf 2, Box 14',
    status: 'available',
    expiresAt: '2026-10-04',
    custodyChain: [
      { who: 'Dr. Sarah Chen', when: '2026-04-04 14:30', action: 'Created' },
      { who: 'Lab Tech Amy', when: '2026-04-04 15:00', action: 'Stored in -80°C' },
    ],
  },
  {
    id: 'smp-002',
    barcode: 'LAB-2026-04-0002',
    name: 'BRCA1 PCR Product (62°C)',
    type: 'DNA',
    location: 'Fridge B, Rack 3',
    status: 'in-use',
    expiresAt: '2026-05-03',
    custodyChain: [
      { who: 'Dr. James Liu', when: '2026-04-03 16:00', action: 'Created' },
      { who: 'Dr. James Liu', when: '2026-04-03 17:00', action: 'Gel loaded' },
    ],
  },
  {
    id: 'smp-003',
    barcode: 'LAB-2026-03-0089',
    name: 'Green Tea Extract #4',
    type: 'Chemical Extract',
    location: 'Fridge A, Shelf 1',
    status: 'available',
    expiresAt: '2026-06-30',
    custodyChain: [
      { who: 'Dr. James Liu', when: '2026-03-18 10:00', action: 'Created' },
    ],
  },
  {
    id: 'smp-004',
    barcode: 'LAB-2026-02-0045',
    name: 'Calibration Standard Mix A',
    type: 'Reference Standard',
    location: 'Chemical Store, Bay 7',
    status: 'expired',
    expiresAt: '2026-03-31',
    custodyChain: [
      { who: 'Lab Manager', when: '2026-02-15 09:00', action: 'Received' },
      { who: 'Dr. Maria Gonzalez', when: '2026-03-01 11:00', action: 'Opened' },
    ],
  },
  {
    id: 'smp-005',
    barcode: 'LAB-2026-04-0003',
    name: 'A549 Transfected Pool',
    type: 'Cell Suspension',
    location: 'Incubator C, Shelf 1',
    status: 'in-use',
    expiresAt: '2026-04-10',
    custodyChain: [
      { who: 'Dr. Sarah Chen', when: '2026-04-02 09:00', action: 'Created' },
      { who: 'Dr. Sarah Chen', when: '2026-04-04 09:00', action: 'Media changed' },
    ],
  },
  {
    id: 'smp-006',
    barcode: 'LAB-2026-01-0012',
    name: 'Well Water Sample — Lot 3',
    type: 'Environmental',
    location: 'Cold Room, Rack 12',
    status: 'quarantined',
    expiresAt: '2026-07-10',
    custodyChain: [
      { who: 'Dr. James Liu', when: '2026-01-15 08:00', action: 'Collected' },
      { who: 'QC Team', when: '2026-03-01 14:00', action: 'Quarantined — contamination detected' },
    ],
  },
];

/* ── Instruments ── */
export const instruments: Instrument[] = [
  {
    id: 'inst-001',
    name: 'Q-TOF Mass Spectrometer',
    model: 'Agilent 6545 Q-TOF',
    status: 'online',
    location: 'Room 204, Mass Spec Suite',
    nextAvailable: '2026-04-06 09:00',
    bookings: [
      { user: 'Dr. Maria Gonzalez', date: '2026-04-06', slot: '09:00–12:00', duration: '3h' },
      { user: 'Dr. James Liu', date: '2026-04-07', slot: '13:00–17:00', duration: '4h' },
      { user: 'Grad Student Kim', date: '2026-04-08', slot: '09:00–11:00', duration: '2h' },
    ],
  },
  {
    id: 'inst-002',
    name: 'HPLC System',
    model: 'Waters Alliance e2695',
    status: 'online',
    location: 'Room 203, Chromatography Lab',
    nextAvailable: '2026-04-06 14:00',
    bookings: [
      { user: 'Dr. James Liu', date: '2026-04-06', slot: '14:00–18:00', duration: '4h' },
      { user: 'Lab Tech Amy', date: '2026-04-07', slot: '09:00–12:00', duration: '3h' },
    ],
  },
  {
    id: 'inst-003',
    name: 'Flow Cytometer',
    model: 'BD FACSAria III',
    status: 'maintenance',
    location: 'Room 201, Cell Analysis Core',
    nextAvailable: '2026-04-10 09:00',
    bookings: [],
  },
  {
    id: 'inst-004',
    name: 'Confocal Microscope',
    model: 'Zeiss LSM 900',
    status: 'online',
    location: 'Room 105, Imaging Suite',
    nextAvailable: '2026-04-06 10:00',
    bookings: [
      { user: 'Dr. Sarah Chen', date: '2026-04-06', slot: '10:00–12:00', duration: '2h' },
      { user: 'Grad Student Park', date: '2026-04-06', slot: '14:00–16:00', duration: '2h' },
    ],
  },
  {
    id: 'inst-005',
    name: 'Real-Time PCR System',
    model: 'Bio-Rad CFX96',
    status: 'online',
    location: 'Room 202, Molecular Biology',
    nextAvailable: '2026-04-06 08:00',
    bookings: [
      { user: 'Dr. Sarah Chen', date: '2026-04-07', slot: '08:00–12:00', duration: '4h' },
    ],
  },
  {
    id: 'inst-006',
    name: 'UV-Vis Spectrophotometer',
    model: 'Shimadzu UV-1900i',
    status: 'offline',
    location: 'Room 203, Chromatography Lab',
    nextAvailable: 'TBD — lamp replacement',
    bookings: [],
  },
];

/* ── Datasets ── */
export const datasets: Dataset[] = [
  {
    id: 'ds-001',
    name: 'BRCA1 qPCR Ct Values',
    experiment: 'EXP-001',
    format: 'CSV',
    size: '24 KB',
    quality: 'high',
    columns: [
      { name: 'sample_id', type: 'string', nullable: false },
      { name: 'gene', type: 'string', nullable: false },
      { name: 'ct_value', type: 'float64', nullable: false },
      { name: 'passage_number', type: 'int32', nullable: false },
      { name: 'replicate', type: 'int32', nullable: false },
      { name: 'timestamp', type: 'datetime', nullable: false },
    ],
    createdAt: '2026-04-03',
    records: 144,
  },
  {
    id: 'ds-002',
    name: 'Caffeine HPLC Peak Areas',
    experiment: 'EXP-002',
    format: 'CSV',
    size: '18 KB',
    quality: 'high',
    columns: [
      { name: 'run_id', type: 'string', nullable: false },
      { name: 'retention_time', type: 'float64', nullable: false },
      { name: 'peak_area', type: 'float64', nullable: false },
      { name: 'concentration_mg_ml', type: 'float64', nullable: true },
      { name: 'solvent_ratio', type: 'string', nullable: false },
    ],
    createdAt: '2026-03-18',
    records: 96,
  },
  {
    id: 'ds-003',
    name: 'Mass Spec Calibration Points',
    experiment: 'EXP-002',
    format: 'JSON',
    size: '8 KB',
    quality: 'medium',
    columns: [
      { name: 'mz_observed', type: 'float64', nullable: false },
      { name: 'mz_theoretical', type: 'float64', nullable: false },
      { name: 'ppm_error', type: 'float64', nullable: false },
      { name: 'intensity', type: 'float64', nullable: false },
    ],
    createdAt: '2026-04-01',
    records: 32,
  },
  {
    id: 'ds-004',
    name: 'Well Water ICP-OES Results',
    experiment: 'EXP-005',
    format: 'CSV',
    size: '42 KB',
    quality: 'low',
    columns: [
      { name: 'sample_location', type: 'string', nullable: false },
      { name: 'element', type: 'string', nullable: false },
      { name: 'concentration_ppb', type: 'float64', nullable: true },
      { name: 'detection_limit', type: 'float64', nullable: false },
      { name: 'blank_corrected', type: 'boolean', nullable: false },
      { name: 'qc_flag', type: 'string', nullable: true },
    ],
    createdAt: '2026-02-20',
    records: 480,
  },
  {
    id: 'ds-005',
    name: 'Cell Viability MTT Assay',
    experiment: 'EXP-001',
    format: 'XLSX',
    size: '15 KB',
    quality: 'high',
    columns: [
      { name: 'well', type: 'string', nullable: false },
      { name: 'absorbance_570nm', type: 'float64', nullable: false },
      { name: 'absorbance_630nm', type: 'float64', nullable: false },
      { name: 'viability_pct', type: 'float64', nullable: false },
      { name: 'treatment', type: 'string', nullable: false },
    ],
    createdAt: '2026-04-04',
    records: 96,
  },
];
