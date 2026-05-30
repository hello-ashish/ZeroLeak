import { create } from 'zustand';

export type PageType = 
  | 'landing' 
  | 'admin' 
  | 'questions' 
  | 'blockchain' 
  | 'generator' 
  | 'soc' 
  | 'audit' 
  | 'delivery' 
  | 'metrics'
  | 'students'
  | 'completed-tests'
  | 'alerts'
  | 'proctoring';

interface User {
  name: string;
  role: 'SuperAdmin' | 'ExamController' | 'CenterSupervisor';
  token: string;
}

interface Stats {
  securityScore: number;
  threatLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  questionsCount: number;
  blockchainHeight: number;
  examsCount: number;
  nodesCount: number;
}

interface BdepgsState {
  page: PageType;
  user: User | null;
  mfaVerified: boolean;
  stats: Stats;
  questions: any[];
  blockchain: any[];
  exams: any[];
  auditLogs: any[];
  securityEvents: any[];
  nodes: any[];
  students: any[];
  submissions: any[];
  activeTelemetry: Record<string, any>;
  consensusLogs: { blockIndex: number; message: string; timestamp: number }[];
  metrics: {
    generationLatency: { timestamp: number; latencyMs: number; examId: string }[];
    encryptionOverhead: { timestamp: number; dataSize: number; overheadMs: number }[];
  };
  
  // Setters
  setPage: (page: PageType) => void;
  setUser: (user: User | null) => void;
  setMfaVerified: (verified: boolean) => void;
  setStats: (stats: Partial<Stats>) => void;
  setQuestions: (questions: any[]) => void;
  addQuestion: (question: any) => void;
  setBlockchain: (blocks: any[]) => void;
  addBlock: (block: any) => void;
  setExams: (exams: any[]) => void;
  updateExam: (exam: any) => void;
  setAuditLogs: (logs: any[]) => void;
  addAuditLog: (log: any) => void;
  setSecurityEvents: (events: any[]) => void;
  addSecurityEvent: (event: any) => void;
  setNodes: (nodes: any[]) => void;
  setStudents: (students: any[]) => void;
  addStudent: (student: any) => void;
  setSubmissions: (submissions: any[]) => void;
  addSubmission: (submission: any) => void;
  updateStudentTelemetry: (telemetry: any) => void;
  addConsensusLog: (log: { blockIndex: number; message: string; timestamp: number }) => void;
  addLatencyMetric: (metric: { timestamp: number; latencyMs: number; examId: string }) => void;
  addOverheadMetric: (metric: { timestamp: number; dataSize: number; overheadMs: number }) => void;
  resetState: () => void;
}

const initialStats: Stats = {
  securityScore: 100,
  threatLevel: 'Low',
  questionsCount: 0,
  blockchainHeight: 0,
  examsCount: 0,
  nodesCount: 3
};

export const useStore = create<BdepgsState>((set) => ({
  page: 'landing',
  user: null,
  mfaVerified: false,
  stats: initialStats,
  questions: [],
  blockchain: [],
  exams: [],
  auditLogs: [],
  securityEvents: [],
  nodes: [],
  students: [],
  submissions: [],
  activeTelemetry: {},
  consensusLogs: [],
  metrics: {
    generationLatency: [],
    encryptionOverhead: []
  },

  setPage: (page) => set({ page }),
  setUser: (user) => set({ user }),
  setMfaVerified: (verified) => set({ mfaVerified: verified }),
  setStats: (newStats) => set((state) => ({ stats: { ...state.stats, ...newStats } })),
  setQuestions: (questions) => set({ questions }),
  addQuestion: (question) => set((state) => ({ questions: [question, ...state.questions] })),
  setBlockchain: (blockchain) => set({ blockchain }),
  addBlock: (block) => set((state) => ({ blockchain: [block, ...state.blockchain] })),
  setExams: (exams) => set({ exams }),
  updateExam: (updatedExam) => set((state) => ({
    exams: state.exams.map((e) => e.id === updatedExam.id ? updatedExam : e)
  })),
  setAuditLogs: (auditLogs) => set({ auditLogs }),
  addAuditLog: (log) => set((state) => ({ auditLogs: [log, ...state.auditLogs] })),
  setSecurityEvents: (securityEvents) => set({ securityEvents }),
  addSecurityEvent: (event) => set((state) => ({ securityEvents: [event, ...state.securityEvents] })),
  setNodes: (nodes) => set({ nodes }),
  setStudents: (students) => set({ students }),
  addStudent: (student) => set((state) => ({ students: [student, ...state.students] })),
  setSubmissions: (submissions) => set({ submissions }),
  addSubmission: (submission) => set((state) => ({ submissions: [submission, ...state.submissions] })),
  updateStudentTelemetry: (telemetry) => set((state) => {
    const updated = { ...state.activeTelemetry };
    updated[telemetry.studentId] = {
      ...updated[telemetry.studentId],
      ...telemetry,
      lastSeen: Date.now()
    };
    return { activeTelemetry: updated };
  }),
  addConsensusLog: (log) => set((state) => ({
    consensusLogs: [...state.consensusLogs.slice(-49), log]
  })),
  addLatencyMetric: (metric) => set((state) => ({
    metrics: {
      ...state.metrics,
      generationLatency: [...state.metrics.generationLatency.slice(-19), metric]
    }
  })),
  addOverheadMetric: (metric) => set((state) => ({
    metrics: {
      ...state.metrics,
      encryptionOverhead: [...state.metrics.encryptionOverhead.slice(-19), metric]
    }
  })),
  resetState: () => set({
    user: null,
    mfaVerified: false,
    page: 'landing',
    stats: initialStats,
    questions: [],
    blockchain: [],
    exams: [],
    auditLogs: [],
    securityEvents: [],
    nodes: [],
    students: [],
    submissions: [],
    activeTelemetry: {},
    consensusLogs: []
  })
}));
