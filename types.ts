
export interface WeekData {
  week: number;
  title: string;
  focus: string;
  tools: string[];
  build_asset: string;
  core_question: string;
  phase: string;
}

export enum AssetStatus {
  LOCKED = 'locked',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed'
}

export interface UserAsset {
  week: number;
  status: AssetStatus;
  data: any;
  generatedAsset?: string;
  completedAt?: string;
}

export interface AppState {
  currentWeek: number;
  progress: Record<number, UserAsset>;
}

export interface VaultEntry {
  id: string;
  labUsed: string;
  title: string;
  content: string;
  createdAt: string;
  week?: number;
}

export enum AppSection {
  DASHBOARD = 'dashboard',
  CURRICULUM = 'curriculum',
  WORKSPACE = 'workspace',
  ECOSYSTEM = 'ecosystem',
  VAULT = 'vault',
  MODULE = 'module'
}

export interface Message {
  role: 'user' | 'model';
  text: string;
  isThinking?: boolean;
}

export type AspectRatio = '1:1' | '2:3' | '3:2' | '3:4' | '4:3' | '9:16' | '16:9' | '21:9';
export type ImageSize = '1K' | '2K' | '4K';
