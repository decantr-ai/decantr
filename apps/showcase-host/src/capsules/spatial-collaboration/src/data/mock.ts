export interface Collaborator {
  id: string;
  name: string;
  initials: string;
  role: string;
  status: 'active' | 'idle' | 'away';
  color: string;
  cursor?: { x: number; y: number };
}

export interface CanvasObject {
  id: string;
  type: 'note' | 'image' | 'shape' | 'document' | 'frame';
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  layer: 'foreground' | 'midground' | 'background';
  content?: string;
  author?: string;
}

export interface Document {
  id: string;
  title: string;
  lastEdited: string;
  collaborators: number;
  status: 'draft' | 'review' | 'final';
}

export const COLLABORATORS: Collaborator[] = [
  { id: 'u1', name: 'Alex Chen', initials: 'AC', role: 'Designer', status: 'active', color: '#6B8AAE', cursor: { x: 340, y: 220 } },
  { id: 'u2', name: 'Jordan Park', initials: 'JP', role: 'Engineer', status: 'active', color: '#22C55E', cursor: { x: 620, y: 380 } },
  { id: 'u3', name: 'Sam Rivera', initials: 'SR', role: 'Product Lead', status: 'idle', color: '#F59E0B', cursor: { x: 180, y: 450 } },
  { id: 'u4', name: 'Casey Kim', initials: 'CK', role: 'Researcher', status: 'active', color: '#EF4444' },
  { id: 'u5', name: 'Morgan Liu', initials: 'ML', role: 'Designer', status: 'away', color: '#A78BFA' },
  { id: 'u6', name: 'Riley Nakamura', initials: 'RN', role: 'Engineer', status: 'active', color: '#F472B6' },
];

export const CANVAS_OBJECTS: CanvasObject[] = [
  {
    id: 'obj1', type: 'frame', title: 'Sprint Board',
    x: 60, y: 80, width: 320, height: 220, color: 'var(--d-primary)',
    layer: 'midground',
    content: 'Q2 sprint planning and task assignments',
  },
  {
    id: 'obj2', type: 'note', title: 'Architecture Decision',
    x: 420, y: 100, width: 240, height: 160, color: 'var(--d-accent)',
    layer: 'midground',
    content: 'Move to event-driven microservices for real-time collaboration layer',
    author: 'Alex Chen',
  },
  {
    id: 'obj3', type: 'document', title: 'Design System v3',
    x: 700, y: 60, width: 260, height: 180, color: 'var(--d-success)',
    layer: 'midground',
    content: 'Updated component library with spatial primitives',
    author: 'Morgan Liu',
  },
  {
    id: 'obj4', type: 'shape', title: 'Flow Diagram',
    x: 140, y: 350, width: 280, height: 200, color: 'var(--d-warning)',
    layer: 'midground',
    content: 'User onboarding flow visualization',
  },
  {
    id: 'obj5', type: 'note', title: 'Research Findings',
    x: 480, y: 320, width: 220, height: 140, color: '#A78BFA',
    layer: 'foreground',
    content: 'User testing results show 40% improvement in spatial navigation',
    author: 'Casey Kim',
  },
  {
    id: 'obj6', type: 'image', title: 'Wireframe Export',
    x: 750, y: 300, width: 200, height: 160, color: 'var(--d-text-muted)',
    layer: 'background',
    content: 'Mobile responsive wireframes for v2',
  },
];

export const DOCUMENTS: Document[] = [
  { id: 'd1', title: 'Product Roadmap Q2', lastEdited: '2 min ago', collaborators: 4, status: 'review' },
  { id: 'd2', title: 'Component Architecture', lastEdited: '15 min ago', collaborators: 3, status: 'draft' },
  { id: 'd3', title: 'User Research Report', lastEdited: '1 hour ago', collaborators: 2, status: 'final' },
  { id: 'd4', title: 'API Design Spec', lastEdited: '3 hours ago', collaborators: 5, status: 'draft' },
  { id: 'd5', title: 'Sprint Retrospective', lastEdited: '1 day ago', collaborators: 6, status: 'final' },
];

export const TEAM_MEMBERS = [
  { name: 'Elena Vasquez', role: 'CEO & Co-founder', bio: 'Former spatial computing lead at a major tech company. Believes collaborative work should feel as natural as being in the same room.', initials: 'EV' },
  { name: 'David Okonkwo', role: 'CTO & Co-founder', bio: 'Distributed systems architect. Built real-time collaboration infrastructure serving millions of concurrent users.', initials: 'DO' },
  { name: 'Yuki Tanaka', role: 'Head of Design', bio: 'Pioneering spatial UI paradigms. Previously designed immersive interfaces for gaming and virtual reality platforms.', initials: 'YT' },
  { name: 'Priya Sharma', role: 'Head of Engineering', bio: 'WebGL and GPU computing expert. Makes browsers do things they were never designed to do.', initials: 'PS' },
  { name: 'Marcus Webb', role: 'Head of Product', bio: 'Obsessed with removing friction from creative workflows. Champions user research-driven development.', initials: 'MW' },
  { name: 'Aisha Patel', role: 'Lead Researcher', bio: 'Cognitive science PhD focused on spatial cognition and how people organize information in 3D mental models.', initials: 'AP' },
];

export const VALUES = [
  { title: 'Spatial First', description: 'Information lives in space, not lists. We design for how humans naturally think and organize.', icon: 'Layers' as const },
  { title: 'Presence Matters', description: 'Collaboration is better when you can feel who is there. Real-time presence is a core primitive.', icon: 'Users' as const },
  { title: 'Depth Over Chrome', description: 'The canvas is the product. Every pixel of UI chrome must earn its place.', icon: 'Maximize' as const },
  { title: 'Fluid Motion', description: 'Transitions communicate relationships. Nothing teleports — everything flows.', icon: 'Wind' as const },
];

export const WORKSPACE_TOOLS = [
  { id: 'select', label: 'Select', shortcut: 'V' },
  { id: 'hand', label: 'Hand', shortcut: 'H' },
  { id: 'note', label: 'Note', shortcut: 'N' },
  { id: 'shape', label: 'Shape', shortcut: 'S' },
  { id: 'frame', label: 'Frame', shortcut: 'F' },
  { id: 'connect', label: 'Connect', shortcut: 'C' },
  { id: 'text', label: 'Text', shortcut: 'T' },
  { id: 'image', label: 'Image', shortcut: 'I' },
];
