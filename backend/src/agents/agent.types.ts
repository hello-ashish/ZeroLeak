export interface AgentResult<T> {
  success: boolean;
  agentName: string;
  message: string;
  data?: T;
  timestamp: number;
}

export class IngestionPayload {
  content!: string;
  subject!: string;
  topic!: string;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  author!: string;
}

export interface PaperGenerationConfig {
  examId: string;
  forceEntropySource?: string; // simulation parameter
}

export interface AnomalyReport {
  anomalyScore: number; // 0 to 100
  threatDetected: boolean;
  reason?: string;
  details?: string;
}

export interface SyncStatus {
  nodeId: string;
  synced: boolean;
  latencyMs: number;
  lastBlockIndex: number;
}
