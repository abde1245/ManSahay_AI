
export enum Role {
  USER = 'user',
  MODEL = 'model',
  SYSTEM = 'system'
}

export interface WebSource {
  title: string;
  uri: string;
}

export interface Message {
  id: string;
  role: Role;
  text: string;
  timestamp: Date;
  widget?: 'emergency' | 'booking' | 'coping-breathing' | 'coping-journal' | 'coping-grounding' | 'coping-art' | 'assessment';
  widgetData?: any;
  sources?: WebSource[];
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  analysis: RiskAnalysis;
  lastModified: Date;
}

export interface EmergencyContact {
  name: string;
  relation: string;
  phone: string;
  imageUrl?: string;
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  location: string;
  imageUrl: string;
  price: string;
  slots: string[];
  available?: string;
}

export interface Appointment {
  id: string;
  doctorId: string;
  doctorName: string;
  specialty: string;
  date: string;
  location: string;
  notes?: string;
}

export enum AnalysisState {
  STABLE = 'Stable',
  ELEVATED = 'Elevated Stress',
  DISTRESS = 'Significant Distress',
  HIGH_RISK = 'Crisis / High Risk',
}

export interface RiskAnalysis {
  level: AnalysisState;
  sentiment: string;
  reason: string;
  lastUpdated: Date;
}

export type AssessmentType = 'PHQ9' | 'GAD7' | 'SLEEP';

export interface Track {
  title: string;
  url: string;
  category: string;
  tags: string[];
}

export interface MusicState {
  isPlaying: boolean;
  currentTrack: Track;
  volume: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  joinDate: Date;
}

export type ResourceType = 'report' | 'journal' | 'file' | 'image';
export type ResourceOrigin = 'user' | 'system';

export interface Resource {
  id: string;
  title: string;
  type: ResourceType;
  origin: ResourceOrigin;
  content: string;
  mimeType?: string;
  summary?: string;
  date: Date;
  metadata?: any;
  remarks?: string;
}

export type MoodType = 'excellent' | 'good' | 'neutral' | 'sad' | 'anxious' | 'overwhelmed' | 'angry';

export interface JournalEntry {
  id: string;
  title: string;
  content: string;
  mood: MoodType;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  prompt?: string;
  wordCount: number;
  isDraft?: boolean;
}

export interface ChatContext {
  appointments: Appointment[];
  mood: string;
  resources: Resource[];
  location?: string;
  localTime?: string;
  currentMusicTrack?: Track;
}
