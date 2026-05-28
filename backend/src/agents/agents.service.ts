import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { DatabaseService, Question, Block, Exam, SecurityEvent, AuditLog, NodeStatus, PaperHistory } from '../database/database.service';
import { EventsGateway } from '../events/events.gateway';
import { CryptoUtil } from '../crypto/crypto.util';
import { IngestionPayload, AgentResult, AnomalyReport, PaperGenerationConfig } from './agent.types';

@Injectable()
export class AgentsService {
  private readonly logger = new Logger('AgentCoordinator');

  constructor(
    private readonly db: DatabaseService,
    private readonly events: EventsGateway
  ) {}

  // ==========================================
  // 1. QUESTION INGESTION AGENT
  // ==========================================
  async ingestQuestion(payload: IngestionPayload): Promise<AgentResult<Question>> {
    const startTime = Date.now();
    try {
      this.logger.log(`[QuestionIngestionAgent] Validating and encrypting new question...`);
      
      // Basic Validation
      if (!payload.content || payload.content.trim().length === 0) {
        throw new Error('Question content cannot be empty.');
      }
      
      // Auto-tagging / AI Classification Simulation
      const difficulty = payload.difficulty || this.estimateDifficulty(payload.content);
      const hash = CryptoUtil.hash(payload.content);
      
      // Duplicate detection
      const duplicate = this.db.data.questions.find(q => q.hash === hash);
      if (duplicate) {
        this.logSecurityAlert('DUPLICATE_INGESTION_ATTEMPT', 'Medium', `Duplicate question hash: ${hash.substring(0, 16)}... submitted by ${payload.author}`);
        throw new Error('Duplicate question detected in repository.');
      }

      // Cryptographic secure encryption (using KMS Key)
      const kmsKey = this.db.data.systemConfig.kmsMasterKey;
      const encrypted = CryptoUtil.encrypt(payload.content, kmsKey);

      // Sign the ingest payload using system private key
      const signature = CryptoUtil.signData(hash, this.db.data.systemConfig.trustedAdminPrivateKey);

      const question: Question = {
        id: `q-${payload.subject.toLowerCase()}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        encryptedContent: encrypted.encrypted,
        iv: encrypted.iv,
        tag: encrypted.tag,
        subject: payload.subject,
        topic: payload.topic || 'General',
        difficulty,
        hash,
        author: payload.author,
        publicKey: this.db.data.systemConfig.trustedAdminPublicKey,
        signature,
        createdAt: Date.now()
      };

      // Store in DB
      this.db.data.questions.push(question);
      this.db.saveDatabase();

      // Trigger blockchain verification agent
      const block = await this.commitToBlockchain(question);

      // Audit Log
      this.writeAuditLog(
        payload.author,
        'INGEST_QUESTION',
        'Question',
        question.id,
        `Ingested and encrypted question. Assigned difficulty ${difficulty}. Blockchain Block #${block.index}`
      );

      // Broadcast new question event
      this.events.server.emit('question_ingested', { questionId: question.id, difficulty, blockIndex: block.index });

      const overhead = Date.now() - startTime;
      this.events.broadcastMetricsUpdate({
        type: 'encryption_overhead',
        dataSize: payload.content.length,
        overheadMs: overhead,
        timestamp: Date.now()
      });

      return {
        success: true,
        agentName: 'Question Ingestion Agent',
        message: 'Question successfully encrypted and committed to blockchain verification.',
        data: question,
        timestamp: Date.now()
      };
    } catch (e: any) {
      this.logger.error(`Ingestion failure: ${e.message}`);
      throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
  }

  private estimateDifficulty(content: string): 'Easy' | 'Medium' | 'Hard' {
    const wordCount = content.split(' ').length;
    const technicalKeywords = ['integral', 'quantum', 'schrodinger', 'mitochondria', 'homeostasis', 'electromagnetic', 'derivative', 'chromosome'];
    let matches = 0;
    technicalKeywords.forEach(kw => {
      if (content.toLowerCase().includes(kw)) matches++;
    });

    if (wordCount > 35 || matches >= 2) return 'Hard';
    if (wordCount > 20 || matches >= 1) return 'Medium';
    return 'Easy';
  }

  // ==========================================
  // 2. BLOCKCHAIN VERIFICATION AGENT
  // ==========================================
  async commitToBlockchain(question: Question): Promise<Block> {
    this.logger.log(`[BlockchainVerificationAgent] Generating validation block for question hash: ${question.hash.substring(0, 10)}`);

    const prevBlock = this.db.data.blockchain[this.db.data.blockchain.length - 1];
    const prevHash = prevBlock ? prevBlock.hash : '0000000000000000000000000000000000000000000000000000000000000000';
    const index = prevBlock ? prevBlock.index + 1 : 1;

    // Block structure compilation
    const hashPayload = `${index}-${question.hash}-${question.subject}-${question.difficulty}-${prevHash}`;
    const blockHash = CryptoUtil.hash(hashPayload);

    // Sign the block
    const validatorSignature = CryptoUtil.signData(blockHash, this.db.data.systemConfig.trustedAdminPrivateKey);

    const block: Block = {
      index,
      timestamp: Date.now(),
      questionHash: question.hash,
      subject: question.subject,
      difficulty: question.difficulty,
      validatorSignature,
      previousHash: prevHash,
      hash: blockHash,
      auditRef: `audit-ingest-${index}`
    };

    this.db.data.blockchain.push(block);
    this.db.saveDatabase();

    // Broadcast block added
    this.events.broadcastBlockAdded(block);

    // Run region node syncing simulator via Load Balancing agent
    this.replicateNodes(index);

    return block;
  }

  // Verification of the integrity of the blockchain
  async verifyChainIntegrity(): Promise<{ healthy: boolean; corruptedBlockIndex?: number; reason?: string }> {
    const chain = this.db.data.blockchain;
    for (let i = 0; i < chain.length; i++) {
      const current = chain[i];
      const prevHash = i === 0 ? '0000000000000000000000000000000000000000000000000000000000000000' : chain[i - 1].hash;

      // Check linked hash
      if (current.previousHash !== prevHash) {
        return { healthy: false, corruptedBlockIndex: current.index, reason: 'Broken link hash.' };
      }

      // Check recalculated block hash
      const hashPayload = `${current.index}-${current.questionHash}-${current.subject}-${current.difficulty}-${current.previousHash}`;
      const recalculated = CryptoUtil.hash(hashPayload);
      if (current.hash !== recalculated) {
        return { healthy: false, corruptedBlockIndex: current.index, reason: 'Block data has been modified.' };
      }

      // Verify validator signature
      const validSig = CryptoUtil.verifySignature(current.hash, current.validatorSignature, this.db.data.systemConfig.trustedAdminPublicKey);
      if (!validSig) {
        return { healthy: false, corruptedBlockIndex: current.index, reason: 'Invalid block validator signature.' };
      }
    }
    return { healthy: true };
  }

  // ==========================================
  // 3. DYNAMIC PAPER GENERATION AGENT
  // ==========================================
  async generatePaper(config: PaperGenerationConfig): Promise<AgentResult<any>> {
    const startTime = Date.now();
    const exam = this.db.data.exams.find(e => e.id === config.examId);
    if (!exam) {
      throw new HttpException('Exam not found', HttpStatus.NOT_FOUND);
    }

    try {
      this.logger.log(`[DynamicPaperGenerationAgent] Beginning runtime paper generation for ${exam.name}`);
      
      // Update Exam Status
      exam.status = 'Generating';
      this.events.broadcastExamUpdate(exam);

      // Step 1: Entropy Aggregation
      this.events.broadcastPaperGenerationProgress({ examId: exam.id, step: 1, totalSteps: 5, message: 'Aggregating distributed entropy pools...' });
      await this.sleep(800);
      
      const T = Date.now().toString(); // Timestamp
      const latestBlock = this.db.data.blockchain[this.db.data.blockchain.length - 1];
      const H = latestBlock ? latestBlock.hash : '0000000000000000000000000000000000000000000000000000000000000000';
      const S = CryptoUtil.hash(this.db.data.systemConfig.kmsMasterKey); // Distributed Server seed
      const E = config.forceEntropySource || CryptoUtil.hash(Math.random().toString()); // Center Entropy pool
      
      exam.entropyInputs = { timestamp: T, prevBlockHash: H, secretSeed: S, centerEntropy: E };
      this.db.saveDatabase();

      // Step 2: Random Seed Calculation
      this.events.broadcastPaperGenerationProgress({ examId: exam.id, step: 2, totalSteps: 5, message: 'Mixing entropy and calculating seed formula: r = SHA256(T + H + S + E)' });
      await this.sleep(800);
      
      const r = CryptoUtil.generateEntropyMix(T, H, S, E);

      // Step 3: Modulo Selection & Difficulty Balancing
      this.events.broadcastPaperGenerationProgress({ examId: exam.id, step: 3, totalSteps: 5, message: 'Selecting questions with seeded cryptographically secure PRNG...' });
      await this.sleep(1000);

      // Filter questions matching exam subject
      const eligibleQuestions = this.db.data.questions.filter(q => q.subject.toLowerCase() === exam.subject.toLowerCase());
      
      // Required redundant pool N = X * n
      const requiredPoolSize = exam.questionCount * exam.redundancyMultiplier;
      
      if (eligibleQuestions.length < requiredPoolSize) {
        this.logger.warn(`Pool size ${eligibleQuestions.length} is less than requested redundancy pool ${requiredPoolSize}. Proceeding with available pool.`);
      }

      // Group eligible questions by difficulty
      const easyPool = eligibleQuestions.filter(q => q.difficulty === 'Easy');
      const mediumPool = eligibleQuestions.filter(q => q.difficulty === 'Medium');
      const hardPool = eligibleQuestions.filter(q => q.difficulty === 'Hard');

      // Balancing rule: 30% Easy, 40% Medium, 30% Hard
      const easyCount = Math.round(exam.questionCount * 0.3);
      const hardCount = Math.round(exam.questionCount * 0.3);
      const mediumCount = exam.questionCount - (easyCount + hardCount);

      const prng = CryptoUtil.seededRandom(r);
      const selectedIds: string[] = [];

      const selectFromPool = (pool: Question[], count: number) => {
        const poolCopy = [...pool];
        for (let i = 0; i < count; i++) {
          if (poolCopy.length === 0) break;
          // Seeded random modulo index selection
          const idx = Math.floor(prng() * poolCopy.length);
          const selected = poolCopy.splice(idx, 1)[0];
          selectedIds.push(selected.id);
        }
      };

      selectFromPool(easyPool, easyCount);
      selectFromPool(mediumPool, mediumCount);
      selectFromPool(hardPool, hardCount);

      // Step 4: Blockchain Integrity Audit
      this.events.broadcastPaperGenerationProgress({ examId: exam.id, step: 4, totalSteps: 5, message: 'Validating selection against immutable blockchain registry...' });
      await this.sleep(800);

      // Check blockchain verification agent records for each selected question
      for (const id of selectedIds) {
        const question = eligibleQuestions.find(q => q.id === id);
        if (!question) continue;
        
        // Find block on chain
        const block = this.db.data.blockchain.find(b => b.questionHash === question.hash);
        if (!block) {
          throw new Error(`Audit Failure: Ingested question ${id} does not exist on blockchain ledger!`);
        }
        
        // Verify signature
        const verified = CryptoUtil.verifySignature(block.hash, block.validatorSignature, this.db.data.systemConfig.trustedAdminPublicKey);
        if (!verified) {
          throw new Error(`Audit Failure: Blockchain validation signature mismatch for block index ${block.index}!`);
        }
      }

      // Step 5: Final Packaging and Encryption
      this.events.broadcastPaperGenerationProgress({ examId: exam.id, step: 5, totalSteps: 5, message: 'Creating signed paper instance packages and caching delivery tickets...' });
      await this.sleep(600);

      exam.generatedPaper = {
        seedUsed: r,
        selectedQuestionIds: selectedIds,
        generatedAt: Date.now()
      };

      // Save to generation history
      const historyItem: PaperHistory = {
        id: `paper-hist-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        examId: exam.id,
        examName: exam.name,
        examCode: exam.code,
        subject: exam.subject,
        generatedAt: Date.now(),
        seed: r,
        questionIds: selectedIds,
        entropyInputs: { timestamp: T, prevBlockHash: H, secretSeed: S, centerEntropy: E }
      };
      this.db.data.paperHistory = this.db.data.paperHistory || [];
      this.db.data.paperHistory.push(historyItem);
      
      // Simulate Release time check (In real system, decryption key is released ONLY at exam start)
      // Since it is an MVP, we pre-generate a timed key that the user can unlock via Time-Lock agent
      exam.decryptionKeyHex = this.db.data.systemConfig.kmsMasterKey;
      exam.status = 'Released';
      this.db.saveDatabase();
      this.events.broadcastExamUpdate(exam);

      // Write Audit log
      this.writeAuditLog(
        'SYSTEM_SCHEDULER',
        'GENERATE_PAPER',
        'Exam',
        exam.id,
        `Seeded paper generated for ${exam.name}. Questions count: ${selectedIds.length}. Entropy Seed: ${r.substring(0, 16)}`
      );

      const latency = Date.now() - startTime;
      this.events.broadcastMetricsUpdate({
        type: 'generation_latency',
        examId: exam.id,
        latencyMs: latency,
        timestamp: Date.now()
      });

      return {
        success: true,
        agentName: 'Dynamic Paper Generation Agent',
        message: 'Runtime paper generated successfully. Ready for Time-Locked authorization release.',
        data: {
          examId: exam.id,
          seed: r,
          questionsCount: selectedIds.length,
          questions: selectedIds,
          historyId: historyItem.id
        },
        timestamp: Date.now()
      };

    } catch (e: any) {
      exam.status = 'Scheduled';
      this.db.saveDatabase();
      this.events.broadcastExamUpdate(exam);
      this.logger.error(`Dynamic generation failure: ${e.message}`);
      
      this.logSecurityAlert('GENERATION_FAILURE', 'High', `Failed paper generation for exam: ${exam.name}. Reason: ${e.message}`);
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  private inferCategory(event: string): 'ExamFraud' | 'DataIntegrity' | 'LedgerConsensus' | 'Infrastructure' {
    const ev = event.toUpperCase();
    if (
      ev.includes('IP_ACCESS') ||
      ev.includes('DECRYPTION_ATTACK') ||
      ev.includes('ANOMALY_DETECTION') ||
      ev.includes('UNAUTHORIZED_ACCESS') ||
      ev.includes('CHEATING') ||
      ev.includes('SPOOF') ||
      ev.includes('MULTIPLE_IP')
    ) {
      return 'ExamFraud';
    }
    if (ev.includes('TAMPER') || ev.includes('INGESTION') || ev.includes('INTEGRITY_COMPROMISE')) {
      return 'DataIntegrity';
    }
    if (ev.includes('LEDGER') || ev.includes('CORRUPTION') || ev.includes('BLOCK') || ev.includes('CONSENSUS')) {
      return 'LedgerConsensus';
    }
    return 'Infrastructure';
  }

  // ==========================================
  // 4. SECURITY MONITORING AGENT
  // ==========================================
  logSecurityAlert(
    event: string,
    severity: 'Info' | 'Low' | 'Medium' | 'High' | 'Critical',
    details: string,
    ip = '127.0.0.1',
    device = 'System Console',
    category?: 'ExamFraud' | 'DataIntegrity' | 'LedgerConsensus' | 'Infrastructure'
  ): SecurityEvent {
    const alert: SecurityEvent = {
      id: `sec-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: Date.now(),
      event,
      sourceIp: ip,
      deviceFingerprint: device,
      severity,
      agent: 'Security Monitoring Agent',
      details,
      blocked: severity === 'High' || severity === 'Critical',
      category: category || this.inferCategory(event)
    };

    this.db.data.securityEvents.push(alert);
    
    // Decrement security score based on severity
    let deduction = 0;
    if (severity === 'Low') deduction = 2;
    if (severity === 'Medium') deduction = 10;
    if (severity === 'High') deduction = 25;
    if (severity === 'Critical') deduction = 50;

    this.db.data.systemConfig.securityScore = Math.max(0, this.db.data.systemConfig.securityScore - deduction);

    // Update global threat level
    const score = this.db.data.systemConfig.securityScore;
    if (score < 40) this.db.data.systemConfig.threatLevel = 'Critical';
    else if (score < 70) this.db.data.systemConfig.threatLevel = 'High';
    else if (score < 90) this.db.data.systemConfig.threatLevel = 'Medium';
    else this.db.data.systemConfig.threatLevel = 'Low';

    this.db.saveDatabase();

    // Broadcast Security Alert & System status
    this.events.broadcastSecurityEvent(alert);
    this.events.server.emit('system_config_update', {
      securityScore: this.db.data.systemConfig.securityScore,
      threatLevel: this.db.data.systemConfig.threatLevel
    });

    return alert;
  }

  // Restore security score simulation
  restoreSystemSecurity() {
    this.db.data.systemConfig.securityScore = 100;
    this.db.data.systemConfig.threatLevel = 'Low';
    this.db.data.securityEvents = this.db.data.securityEvents.filter(e => e.severity === 'Info' || e.severity === 'Low');
    this.db.saveDatabase();

    this.events.server.emit('system_config_update', {
      securityScore: 100,
      threatLevel: 'Low'
    });

    this.writeAuditLog(
      'ADMIN',
      'RESTORE_SECURITY_SCORE',
      'SystemConfig',
      'global',
      'Admin reset active alerts and restored system security score to 100.'
    );
  }

  // ==========================================
  // 5. TIME-LOCK AUTHORIZATION AGENT
  // ==========================================
  async requestTimedDecryption(examId: string, ip: string, device: string): Promise<string> {
    const exam = this.db.data.exams.find(e => e.id === examId);
    if (!exam) {
      throw new HttpException('Exam not found', HttpStatus.NOT_FOUND);
    }

    this.logger.log(`[TimeLockAuthorizationAgent] Evaluating timed access for ${exam.name}`);

    // AI Anomaly agent checks parameters before decrypting
    const anomaly = await this.detectBehavioralAnomaly(ip, device, examId);
    if (anomaly.threatDetected) {
      this.logSecurityAlert('BLOCKED_BY_AI_ANOMALY_DETECTION', 'Critical', `Access blocked. AI Anomaly Agent detected threat: ${anomaly.reason}. IP: ${ip}`, ip, device);
      throw new HttpException(`Access Blocked by AI Threat Intelligence: ${anomaly.reason}`, HttpStatus.FORBIDDEN);
    }

    // Time Check: Exam scheduled time vs Current Time
    const now = Date.now();
    const earlyWindow = 300000; // 5 minutes buffer
    
    // In order to make it easily testable, we allow decryption if simulated early window is bypassed
    // We add a visual simulation mode: if the exam's status is 'Released', we allow key retrieval,
    // but if the time is early AND it hasn't been explicitly released by admin, we block and trigger Timing Attack alert
    if (now < exam.scheduledTime - earlyWindow && exam.status !== 'Released') {
      this.logSecurityAlert('EARLY_DECRYPTION_ATTACK', 'High', `Unauthorized early decryption attempt on ${exam.code}. Scheduled: ${new Date(exam.scheduledTime).toLocaleTimeString()}. Attempt: ${new Date(now).toLocaleTimeString()}`, ip, device);
      throw new HttpException('Decryption key locked. Authorized access is restricted to the active exam window only.', HttpStatus.FORBIDDEN);
    }

    this.writeAuditLog(
      'EXAM_CENTER_DELIVERY',
      'DECRYPT_PAPER_KEY_RELEASE',
      'Exam',
      examId,
      `Decryption key released under verified time-lock session for Center IP: ${ip}`
    );

    return exam.decryptionKeyHex || this.db.data.systemConfig.kmsMasterKey;
  }

  // ==========================================
  // 6. AUDIT & FORENSICS AGENT
  // ==========================================
  writeAuditLog(actor: string, action: string, entity: string, entityId: string, details: string): AuditLog {
    const prevLog = this.db.data.auditLogs[this.db.data.auditLogs.length - 1];
    const prevHash = prevLog ? prevLog.hashChain : 'genesis-chain-hash-000';

    const index = this.db.data.auditLogs.length + 1;
    const payload = `${index}-${actor}-${action}-${entity}-${entityId}-${prevHash}`;
    const newHash = CryptoUtil.hash(payload);

    const log: AuditLog = {
      id: `audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: Date.now(),
      actor,
      action,
      entity,
      entityId,
      hashChain: newHash,
      details
    };

    this.db.data.auditLogs.push(log);
    this.db.saveDatabase();

    // Broadcast audit
    this.events.broadcastAuditLog(log);

    return log;
  }

  // ==========================================
  // 7. EXAMINATION DELIVERY AGENT
  // ==========================================
  async authorizeCenter(centerId: string, ipRange: string): Promise<AgentResult<any>> {
    this.writeAuditLog(
      'ADMIN',
      'AUTHORIZE_CENTER',
      'DeliveryCenter',
      centerId,
      `Authorized examination delivery terminal node. IP: ${ipRange}`
    );

    return {
      success: true,
      agentName: 'Examination Delivery Agent',
      message: `Center ${centerId} registered. Controlled printing token allocated.`,
      data: { centerId, authorizedIp: ipRange, sessionToken: CryptoUtil.hash(centerId + Date.now()) },
      timestamp: Date.now()
    };
  }

  // ==========================================
  // 8. AI ANOMALY DETECTION AGENT
  // ==========================================
  async detectBehavioralAnomaly(ip: string, device: string, examId: string): Promise<AnomalyReport> {
    this.logger.log(`[AIAnomalyDetectionAgent] Assessing threat score for terminal request...`);
    
    // Anomaly simulation rules:
    // 1. IP is a known malicious IP (simulation payload triggers)
    // 2. High request frequency within 1 sec
    // 3. Requesting paper decryption outside expected geofence (simulated via IP header details)
    
    if (ip.startsWith('10.99.')) {
      return {
        anomalyScore: 92,
        threatDetected: true,
        reason: 'Suspicious IP prefix matching insider threat database profile.',
        details: `IP ${ip} identified as blacklisted router node.`
      };
    }

    if (device.toLowerCase().includes('crawler') || device.toLowerCase().includes('python-requests')) {
      return {
        anomalyScore: 85,
        threatDetected: true,
        reason: 'Automated script signature detected in request headers.',
        details: `User agent: ${device} is blocklisted.`
      };
    }

    return {
      anomalyScore: 5,
      threatDetected: false
    };
  }

  // ==========================================
  // 9. LOAD BALANCING & DISTRIBUTION AGENT
  // ==========================================
  private replicateNodes(blockIndex: number) {
    this.logger.log(`[LoadBalancingAgent] Synchronizing ledger node networks to block index #${blockIndex}...`);
    
    // Simulate real-time latency and replication
    this.db.data.nodes.forEach(node => {
      node.status = 'Syncing';
      node.latencyMs = Math.floor(Math.random() * 25) + 5;
    });
    this.events.broadcastNodeSync(this.db.data.nodes);

    setTimeout(() => {
      this.db.data.nodes.forEach(node => {
        node.status = 'Online';
        node.lastSyncedBlock = blockIndex;
      });
      this.db.saveDatabase();
      this.events.broadcastNodeSync(this.db.data.nodes);
    }, 1200);
  }

  // Helper Sleep
  private sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
