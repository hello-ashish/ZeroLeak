import { Injectable, OnModuleInit } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

export interface Question {
  id: string;
  encryptedContent: string; // Encrypted with AES-256
  iv: string;
  tag: string;
  subject: string;
  topic: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  hash: string;            // SHA-256 of plain content
  author: string;
  publicKey: string;       // Public key of creator
  signature: string;      // Creator signature
  createdAt: number;
}

export interface Block {
  index: number;
  timestamp: number;
  questionHash: string;
  subject: string;
  difficulty: string;
  validatorSignature: string;
  previousHash: string;
  hash: string;
  auditRef: string;
}

export interface Exam {
  id: string;
  name: string;
  code: string; // e.g. NEET-2026
  subject: string;
  scheduledTime: number;
  durationMinutes: number;
  questionCount: number;
  redundancyMultiplier: number; // n
  status: 'Scheduled' | 'Generating' | 'Released' | 'Completed';
  entropyInputs: {
    timestamp?: string;
    prevBlockHash?: string;
    secretSeed?: string;
    centerEntropy?: string;
  };
  generatedPaper?: {
    seedUsed: string;
    selectedQuestionIds: string[];
    generatedAt: number;
  };
  decryptionKeyHex?: string; // Released after time-lock expires
}

export interface SecurityEvent {
  id: string;
  timestamp: number;
  event: string;
  sourceIp: string;
  deviceFingerprint: string;
  severity: 'Info' | 'Low' | 'Medium' | 'High' | 'Critical';
  agent: string;
  details: string;
  blocked: boolean;
  category?: 'ExamFraud' | 'DataIntegrity' | 'LedgerConsensus' | 'Infrastructure';
}

export interface AuditLog {
  id: string;
  timestamp: number;
  actor: string;
  action: string;
  entity: string;
  entityId: string;
  hashChain: string;
  details: string;
}

export interface NodeStatus {
  id: string;
  name: string;
  region: string;
  status: 'Online' | 'Offline' | 'Syncing';
  latencyMs: number;
  lastSyncedBlock: number;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  studentId: string;
  passwordRaw: string;
  createdAt: number;
  isBlocked?: boolean;
  blockedReason?: string;
  activeTest?: {
    subject: string;
    startedFromIp: string;
    startedAt: number;
    questionIds: string[];
    userAgent: string;
  };
}

export interface TestSubmission {
  id: string;
  studentId: string;
  studentName: string;
  subject: string;
  score: number;
  maxMarks: number;
  submittedAt: number;
  answers: Record<string, string>; // questionId -> selectedOption
  questions: {
    id: string;
    description: string;
    options: Record<string, string>;
    correctOption: string;
    image?: string;
  }[];
}

export interface PaperHistory {
  id: string;
  examId: string;
  examName: string;
  examCode: string;
  subject: string;
  generatedAt: number;
  seed: string;
  questionIds: string[];
  entropyInputs: {
    timestamp?: string;
    prevBlockHash?: string;
    secretSeed?: string;
    centerEntropy?: string;
  };
}

@Injectable()
export class DatabaseService implements OnModuleInit {
  private dbPath = process.env.DATABASE_PATH || 
    (fs.existsSync(path.join(process.cwd(), 'db.json')) 
      ? path.join(process.cwd(), 'db.json') 
      : path.join(process.cwd(), '..', 'db.json'));
  
  public data = {
    questions: [] as Question[],
    blockchain: [] as Block[],
    exams: [] as Exam[],
    securityEvents: [] as SecurityEvent[],
    auditLogs: [] as AuditLog[],
    nodes: [] as NodeStatus[],
    students: [] as Student[],
    submissions: [] as TestSubmission[],
    paperHistory: [] as PaperHistory[],
    systemConfig: {
      kmsMasterKey: '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
      securityScore: 100,
      threatLevel: 'Low' as 'Low' | 'Medium' | 'High' | 'Critical',
      mfaSecret: 'BDEPGS-ADMIN-MFA-SECRET-KEY',
      trustedAdminPublicKey: '',
      trustedAdminPrivateKey: ''
    }
  };

  onModuleInit() {
    this.loadDatabase();
    this.seedDatabaseIfNeeded();
  }

  private loadDatabase() {
    try {
      if (fs.existsSync(this.dbPath)) {
        const fileContent = fs.readFileSync(this.dbPath, 'utf8');
        this.data = JSON.parse(fileContent);
        console.log(`[Database] Database loaded successfully from ${this.dbPath}`);
      } else {
        this.saveDatabase();
        console.log(`[Database] Initial database created at ${this.dbPath}`);
      }
    } catch (error) {
      console.error(`[Database] Error loading database:`, error);
    }
  }

  public saveDatabase() {
    try {
      fs.writeFileSync(this.dbPath, JSON.stringify(this.data, null, 2), 'utf8');
    } catch (error) {
      console.error(`[Database] Error saving database:`, error);
    }
  }

  private seedDatabaseIfNeeded() {
    let changed = false;

    // 1. Generate keys for mock Admin / Author if missing
    if (!this.data.systemConfig.trustedAdminPublicKey) {
      console.log('[Database] Generating cryptographic system keys...');
      const crypto = require('crypto');
      const { publicKey, privateKey } = crypto.generateKeyPairSync('ec', {
        namedCurve: 'secp256k1',
        publicKeyEncoding: { type: 'spki', format: 'pem' },
        privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
      });

      this.data.systemConfig.trustedAdminPublicKey = publicKey;
      this.data.systemConfig.trustedAdminPrivateKey = privateKey;
      changed = true;
    }

    // 2. Seed Nodes if missing
    if (!this.data.nodes || this.data.nodes.length === 0) {
      console.log('[Database] Initializing edge nodes configuration...');
      this.data.nodes = [
        { id: 'node-north-1', name: 'Delhi Main Node', region: 'North', status: 'Online', latencyMs: 12, lastSyncedBlock: 0 },
        { id: 'node-south-1', name: 'Bengaluru Secondary', region: 'South', status: 'Online', latencyMs: 22, lastSyncedBlock: 0 },
        { id: 'node-west-1', name: 'Mumbai Edge Gateway', region: 'West', status: 'Online', latencyMs: 18, lastSyncedBlock: 0 }
      ];
      changed = true;
    }

    // 3. Seed empty scheduled exams for testing if missing
    if (!this.data.exams || this.data.exams.length === 0) {
      console.log('[Database] Seeding empty exam templates...');
      this.data.exams = [
        {
          id: 'exam-jee-main',
          name: 'JEE Main 2026 - Physics',
          code: 'JEE-PHY-2026',
          subject: 'Physics',
          scheduledTime: Date.now() + 3600000, // 1 hour from now
          durationMinutes: 180,
          questionCount: 80,
          redundancyMultiplier: 3, // Requires only 240 questions in pool to fully test
          status: 'Scheduled',
          entropyInputs: {}
        },
        {
          id: 'exam-neet-2026',
          name: 'NEET 2026 - Biology',
          code: 'NEET-BIO-2026',
          subject: 'Biology',
          scheduledTime: Date.now() + 7200000,
          durationMinutes: 180,
          questionCount: 80,
          redundancyMultiplier: 3, // Requires only 240 questions in pool to fully test
          status: 'Scheduled',
          entropyInputs: {}
        }
      ];
      changed = true;
    } else {
      // Force questionCount to 80 for JEE/NEET exams for testing
      let modified = false;
      this.data.exams.forEach(ex => {
        if (ex.questionCount !== 80 && (ex.id === 'exam-jee-main' || ex.id === 'exam-neet-2026')) {
          ex.questionCount = 80;
          modified = true;
        }
      });
      if (modified) changed = true;
    }

    // 4. Seed genesis audit log if missing
    if (!this.data.auditLogs || this.data.auditLogs.length === 0) {
      this.data.auditLogs = [
        {
          id: 'audit-init',
          timestamp: Date.now() - 1000,
          actor: 'SYSTEM_ROOT',
          action: 'INITIALIZE_LEDGER',
          entity: 'BLOCKCHAIN',
          entityId: '0',
          hashChain: 'genesis-chain-hash-001',
          details: 'Blockchain ledger initialized with genesis requirements.'
        }
      ];
      changed = true;
    }

    if (changed) {
      this.saveDatabase();
      console.log('[Database] Seeding complete. Updated missing base entries.');
    }
  }
}
