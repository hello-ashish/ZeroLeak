import { Controller, Get, Post, Body, Query, Headers, HttpException, HttpStatus, Logger, Param, Delete } from '@nestjs/common';
import { DatabaseService, Question, Block, Exam, SecurityEvent, AuditLog } from './database/database.service';
import { AgentsService } from './agents/agents.service';
import { IngestionPayload } from './agents/agent.types';
import { CryptoUtil } from './crypto/crypto.util';
import { EventsGateway } from './events/events.gateway';

@Controller('api')
export class AppController {
  private readonly logger = new Logger('AppController');

  constructor(
    private readonly db: DatabaseService,
    private readonly agents: AgentsService,
    private readonly events: EventsGateway
  ) {}

  // ==========================================
  // SYSTEM STATS & SETTINGS
  // ==========================================
  @Get('system/status')
  getSystemStatus() {
    return {
      securityScore: this.db.data.systemConfig.securityScore,
      threatLevel: this.db.data.systemConfig.threatLevel,
      questionsCount: this.db.data.questions.length,
      blockchainHeight: this.db.data.blockchain.length,
      examsCount: this.db.data.exams.length,
      nodesCount: this.db.data.nodes.length,
      timestamp: Date.now()
    };
  }

  @Post('system/restore')
  restoreSystem() {
    this.agents.restoreSystemSecurity();
    return { success: true, message: 'System threat status cleared and security score restored to 100.' };
  }

  @Get('nodes')
  getNodes() {
    return this.db.data.nodes;
  }

  // ==========================================
  // QUESTION MANAGEMENT
  // ==========================================
  @Get('questions')
  getQuestions(@Query('subject') subject?: string) {
    let questions = this.db.data.questions;
    if (subject) {
      questions = questions.filter(q => q.subject.toLowerCase() === subject.toLowerCase());
    }
    return [...questions].reverse();
  }

  @Post('questions/ingest')
  async ingestQuestion(@Body() payload: IngestionPayload) {
    return this.agents.ingestQuestion(payload);
  }

  // ==========================================
  // BLOCKCHAIN EXPLORER
  // ==========================================
  @Get('blockchain')
  getBlockchain() {
    return this.db.data.blockchain;
  }

  @Get('blockchain/verify')
  async verifyLedger() {
    const result = await this.agents.verifyChainIntegrity();
    if (!result.healthy) {
      // Log critical tampering alert
      this.agents.logSecurityAlert(
        'LEDGER_CORRUPTION_DETECTED',
        'Critical',
        `Blockchain ledger verification failed. Corrupted block: #${result.corruptedBlockIndex}. Reason: ${result.reason}`
      );
      return {
        message: `Ledger compromised at Block #${result.corruptedBlockIndex}. Reason: ${result.reason}`,
        ...result
      };
    }

    return {
      healthy: true,
      message: 'Ledger integrity verified successfully. All block link hashes, parent keys, and validator signatures match.'
    };
  }

  // ==========================================
  // EXAM AND PAPER GENERATION
  // ==========================================
  @Get('exams')
  getExams() {
    return this.db.data.exams;
  }

  @Get('exams/history')
  getExamsHistory() {
    return this.db.data.paperHistory || [];
  }

  @Get('exams/history/:id/decrypt')
  async decryptHistoryPaper(@Param('id') id: string) {
    const history = (this.db.data.paperHistory || []).find(h => h.id === id);
    if (!history) {
      throw new HttpException('History record not found', HttpStatus.NOT_FOUND);
    }

    const kmsKey = this.db.data.systemConfig.kmsMasterKey;

    const decryptedQuestions = history.questionIds.map(qId => {
      const q = this.db.data.questions.find(quest => quest.id === qId);
      if (!q) return null;
      try {
        const plainText = CryptoUtil.decrypt(q.encryptedContent, kmsKey, q.iv, q.tag);
        const parsed = JSON.parse(plainText);
        return {
          id: q.id,
          subject: q.subject,
          topic: q.topic,
          difficulty: q.difficulty,
          content: plainText,
          description: parsed.description,
          options: parsed.options,
          correctOption: parsed.correctOption,
          image: parsed.image || null,
          hash: q.hash
        };
      } catch (err: any) {
        return {
          id: q.id,
          subject: q.subject,
          topic: q.topic,
          difficulty: q.difficulty,
          content: `[DECRYPTION_ERROR: Invalid key or block tampered]`,
          hash: q.hash,
          error: true
        };
      }
    }).filter(Boolean);

    return {
      success: true,
      historyId: history.id,
      examId: history.examId,
      name: history.examName,
      code: history.examCode,
      subject: history.subject,
      generatedAt: history.generatedAt,
      seedUsed: history.seed,
      questions: decryptedQuestions
    };
  }

  @Delete('exams/history/:id')
  deleteHistoryPaper(@Param('id') id: string) {
    this.db.data.paperHistory = (this.db.data.paperHistory || []).filter(h => h.id !== id);
    this.db.saveDatabase();
    return { success: true, message: `History item ${id} deleted successfully.` };
  }

  @Delete('exams/history')
  clearExamsHistory() {
    this.db.data.paperHistory = [];
    this.db.saveDatabase();
    return { success: true, message: 'All paper generation histories deleted successfully.' };
  }

  @Post('exams/generate')
  async triggerGeneration(@Body() body: { examId: string; forceEntropySource?: string }) {
    if (!body.examId) {
      throw new HttpException('Missing examId', HttpStatus.BAD_REQUEST);
    }
    return this.agents.generatePaper({
      examId: body.examId,
      forceEntropySource: body.forceEntropySource
    });
  }

  @Post('exams/decrypt')
  async decryptExamPaper(
    @Body() body: { examId: string },
    @Headers('x-forwarded-for') xForwardedFor?: string,
    @Headers('user-agent') userAgent?: string
  ) {
    const ip = xForwardedFor || '127.0.0.1';
    const agent = userAgent || 'Mozilla/5.0';

    if (!body.examId) {
      throw new HttpException('Missing examId', HttpStatus.BAD_REQUEST);
    }

    const key = await this.agents.requestTimedDecryption(body.examId, ip, agent);
    
    // Fetch and decrypt questions
    const exam = this.db.data.exams.find(e => e.id === body.examId);
    if (!exam || !exam.generatedPaper) {
      throw new HttpException('Exam paper has not been generated yet.', HttpStatus.BAD_REQUEST);
    }

    const decryptedQuestions = exam.generatedPaper.selectedQuestionIds.map(id => {
      const q = this.db.data.questions.find(quest => quest.id === id);
      if (!q) return null;
      try {
        const plainText = CryptoUtil.decrypt(q.encryptedContent, key, q.iv, q.tag);
        return {
          id: q.id,
          subject: q.subject,
          topic: q.topic,
          difficulty: q.difficulty,
          content: plainText,
          hash: q.hash
        };
      } catch (err: any) {
        return {
          id: q.id,
          subject: q.subject,
          topic: q.topic,
          difficulty: q.difficulty,
          content: `[DECRYPTION_ERROR: Invalid key or block tampered]`,
          hash: q.hash,
          error: true
        };
      }
    }).filter(Boolean);

    return {
      success: true,
      examId: exam.id,
      name: exam.name,
      decryptionKeyUsed: key.substring(0, 8) + '...',
      questions: decryptedQuestions,
      decryptedAt: Date.now()
    };
  }

  // ==========================================
  // AUDIT & THREAT LOGS
  // ==========================================
  @Get('audit-logs')
  getAuditLogs() {
    return [...this.db.data.auditLogs].reverse().slice(0, 100);
  }

  @Get('security-events')
  getSecurityEvents() {
    return [...this.db.data.securityEvents].reverse().slice(0, 100);
  }

  // ==========================================
  // STUDENT ENROLLMENT SYSTEM
  // ==========================================
  @Get('students')
  getStudents() {
    return this.db.data.students || [];
  }

  @Post('students/enroll')
  async enrollStudent(@Body() body: { name: string; email: string }) {
    const { name, email } = body;
    if (!name || !email) {
      throw new HttpException('Name and email are required.', HttpStatus.BAD_REQUEST);
    }

    // Generate STU-2026-XXXX format ID
    const randHex = Math.floor(Math.random() * 9000 + 1000).toString();
    const studentId = `STU-2026-${randHex}`;

    // Generate secure random readable password
    const chars = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789';
    let passwordRaw = '';
    for (let i = 0; i < 8; i++) {
      passwordRaw += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    const newStudent = {
      id: `stu-${Date.now()}`,
      name,
      email,
      studentId,
      passwordRaw,
      createdAt: Date.now()
    };

    this.db.data.students = this.db.data.students || [];
    this.db.data.students.push(newStudent);
    this.db.saveDatabase();

    // Log this action to the Audit ledger
    this.agents.writeAuditLog(
      'ADMIN',
      'ENROLL_STUDENT',
      'Student',
      newStudent.id,
      `Manually enrolled student: ${name} (${email}) with studentId: ${studentId}`
    );

    return {
      success: true,
      student: newStudent
    };
  }

  // ==========================================
  // CYBER-ATTACK SIMULATOR ENGINE
  // ==========================================
  @Post('simulation/attack')
  async runAttackSimulation(@Body() body: { type: string }) {
    const { type } = body;
    this.logger.warn(`[AttackSimulator] Initiating simulated cyber attack: ${type}`);

    if (type === 'insider_tamper') {
      // Modify a random question directly in the local repository without going through blockchain
      if (this.db.data.questions.length === 0) {
        throw new HttpException('No questions in repository to tamper with.', HttpStatus.BAD_REQUEST);
      }
      const randIdx = Math.floor(Math.random() * this.db.data.questions.length);
      const target = this.db.data.questions[randIdx];
      
      const originalContent = target.encryptedContent;
      // Change one character in the ciphertext to simulate direct DB manipulation
      target.encryptedContent = target.encryptedContent.replace(/[0-9a-f]/, '7');
      this.db.saveDatabase();

      // Log threat internally
      this.agents.logSecurityAlert(
        'REPOSITORY_INTEGRITY_COMPROMISE',
        'High',
        `Unauthorized write detected on Question Database table at row ID: ${target.id}. Signature verification hash failed.`,
        '10.150.12.8',
        'Direct Database Injector'
      );

      this.agents.writeAuditLog(
        'DB_ROOT_EXPLOIT',
        'TAMPER_QUESTION_RECORD',
        'Question',
        target.id,
        'Direct database block update executed bypassing application verification.'
      );

      return {
        success: true,
        message: 'Simulated DB Tampering completed. The question record has been modified in database storage. Run Ledger Verification to check.',
        details: `Modified question: ${target.id}`
      };
    }

    if (type === 'early_decryption') {
      // Trigger a direct key retrieval request for an exam scheduled far in the future
      const targetExam = this.db.data.exams.find(e => e.status === 'Scheduled');
      if (!targetExam) {
        throw new HttpException('No scheduled exams available for early attack simulation.', HttpStatus.BAD_REQUEST);
      }

      // Simulate a request from center IP 4-5 hours early
      try {
        await this.agents.requestTimedDecryption(targetExam.id, '198.51.100.45', 'EducationalCenterTerminal-04');
      } catch (err: any) {
        return {
          success: false,
          attackDetected: true,
          message: 'Attack intercepted! Early decryption attempts are blocked by the Time-Lock authorization service.',
          errorDetails: err.message
        };
      }

      return {
        success: true,
        message: 'Attack completed but warning was bypassed. This shouldn\'t occur.'
      };
    }

    if (type === 'admin_compromise') {
      // Simulate access using admin credentials but from a compromised agent or network
      const targetExam = this.db.data.exams[0];
      try {
        await this.agents.requestTimedDecryption(targetExam.id, '10.99.4.15', 'python-requests/2.28 (crawler-simulation)');
      } catch (err: any) {
        return {
          success: false,
          attackDetected: true,
          message: 'Attack blocked! Zero-Trust authorization system flagged behavioral anomaly.',
          errorDetails: err.message
        };
      }
      return { success: true };
    }

    if (type === 'duplicate_generation') {
      const exam = this.db.data.exams[0];
      this.agents.logSecurityAlert(
        'DUPLICATE_GENERATION_ATTEMPT',
        'Medium',
        `Suspicious duplicate generation requests received for exam: ${exam.name}. Blocking repeated selection.`,
        '192.168.4.10',
        'AdminConsole-NodeB'
      );
      return {
        success: false,
        attackDetected: true,
        message: 'Security Monitor blocked duplicate generation attempt to prevent entropy searching.'
      };
    }

    if (type === 'node_compromise') {
      // Simulate node tampering: force node out-of-sync
      const targetNode = this.db.data.nodes[1];
      targetNode.status = 'Offline';
      targetNode.latencyMs = 999;
      this.db.saveDatabase();

      this.agents.logSecurityAlert(
        'NODE_COMMUNICATION_TIMEOUT',
        'High',
        `Network Node ${targetNode.name} in region ${targetNode.region} failed heartbeat validation. Possible routing attack.`,
        '10.80.20.1',
        'NodeDaemon'
      );

      return {
        success: true,
        message: 'Simulated node offline failure completed. Threat map updated.'
      };
    }

    throw new HttpException('Unknown attack type', HttpStatus.BAD_REQUEST);
  }

  // ==========================================
  // STUDENT WORKFLOWS (CBT)
  // ==========================================
  @Post('students/login')
  async studentLogin(
    @Body() body: { studentId: string; passwordRaw: string },
    @Headers('x-forwarded-for') xForwardedFor?: string,
    @Headers('user-agent') userAgent?: string
  ) {
    const { studentId, passwordRaw } = body;
    const ip = xForwardedFor || '127.0.0.1';
    const agent = userAgent || 'Mozilla/5.0';

    if (!studentId || !passwordRaw) {
      throw new HttpException('Student ID and password are required.', HttpStatus.BAD_REQUEST);
    }

    const students = this.db.data.students || [];
    const student = students.find(
      (s) => s.studentId === studentId && s.passwordRaw === passwordRaw
    );

    if (!student) {
      throw new HttpException('Invalid Student ID or Password.', HttpStatus.UNAUTHORIZED);
    }

    if (student.isBlocked) {
      throw new HttpException(
        student.blockedReason || 'This student account has been blocked due to security violations.',
        HttpStatus.FORBIDDEN
      );
    }

    // Check if active test is running from a different IP
    if (student.activeTest && student.activeTest.startedFromIp !== ip) {
      // Block the student immediately
      student.isBlocked = true;
      student.blockedReason = `Multi-device login attempt during active test (Original IP: ${student.activeTest.startedFromIp}, New IP: ${ip})`;
      
      this.agents.logSecurityAlert(
        'MULTIPLE_IP_ACCESS',
        'Critical',
        `Student ${student.name} (${student.studentId}) blocked. Running test opened on another IP address. Original: ${student.activeTest.startedFromIp}, New: ${ip}`,
        ip,
        agent
      );
      this.db.saveDatabase();

      throw new HttpException(
        'This student account is blocked due to security violations (multi-IP access detected).',
        HttpStatus.FORBIDDEN
      );
    }

    // Support resuming test if same IP
    let resumeDetails = null;
    if (student.activeTest && student.activeTest.startedFromIp === ip) {
      // Decrypt the existing questions
      const kmsKey = this.db.data.systemConfig.kmsMasterKey;
      const decryptedQuestions = student.activeTest.questionIds.map((qId) => {
        const q = this.db.data.questions.find((quest) => quest.id === qId);
        if (!q) return null;
        try {
          const plainText = CryptoUtil.decrypt(q.encryptedContent, kmsKey, q.iv, q.tag);
          const parsed = JSON.parse(plainText);
          return {
            id: q.id,
            description: parsed.description,
            options: parsed.options,
            image: parsed.image || null
          };
        } catch (err) {
          return {
            id: q.id,
            description: `[DECRYPTION ERROR] Failed to load question ${q.id}.`,
            options: { A: 'Error', B: 'Error', C: 'Error', D: 'Error' },
            image: null
          };
        }
      }).filter(Boolean);

      resumeDetails = {
        subject: student.activeTest.subject,
        questions: decryptedQuestions,
        startedAt: student.activeTest.startedAt
      };
    }

    return {
      success: true,
      student: {
        id: student.id,
        name: student.name,
        email: student.email,
        studentId: student.studentId
      },
      activeTest: resumeDetails
    };
  }

  @Post('students/start-test')
  async studentStartTest(
    @Body() body: { studentId: string; subject: string },
    @Headers('x-forwarded-for') xForwardedFor?: string,
    @Headers('user-agent') userAgent?: string
  ) {
    const { studentId, subject } = body;
    const ip = xForwardedFor || '127.0.0.1';
    const agent = userAgent || 'Mozilla/5.0';

    if (!studentId || !subject) {
      throw new HttpException('Student ID and Subject are required.', HttpStatus.BAD_REQUEST);
    }

    // Verify student exists
    const students = this.db.data.students || [];
    const student = students.find((s) => s.studentId === studentId);
    if (!student) {
      throw new HttpException('Student record not found.', HttpStatus.NOT_FOUND);
    }

    if (student.isBlocked) {
      throw new HttpException(
        student.blockedReason || 'This student account has been blocked due to security violations.',
        HttpStatus.FORBIDDEN
      );
    }

    // Check if student has already submitted a test for this subject
    const submissions = this.db.data.submissions || [];
    const alreadySubmitted = submissions.some(
      (sub) =>
        sub.studentId === studentId &&
        sub.subject.toLowerCase() === subject.toLowerCase()
    );

    if (alreadySubmitted) {
      throw new HttpException(
        `You have already submitted a test for subject: ${subject}. Each subject can only be tested once.`,
        HttpStatus.BAD_REQUEST
      );
    }

    // Check if there is an active test
    if (student.activeTest) {
      if (student.activeTest.startedFromIp !== ip) {
        // Block student due to access from another IP address
        student.isBlocked = true;
        student.blockedReason = `Running test opened on another IP address (Original IP: ${student.activeTest.startedFromIp}, Request IP: ${ip})`;
        
        this.agents.logSecurityAlert(
          'MULTIPLE_IP_ACCESS',
          'Critical',
          `Student ${student.name} (${student.studentId}) blocked. Running test opened on another IP address. Original: ${student.activeTest.startedFromIp}, New: ${ip}`,
          ip,
          agent
        );
        this.db.saveDatabase();

        throw new HttpException(
          'Access Denied. Account blocked due to security violations (multi-IP access detected).',
          HttpStatus.FORBIDDEN
        );
      }

      // Resume test flow
      const kmsKey = this.db.data.systemConfig.kmsMasterKey;
      const decryptedQuestions = student.activeTest.questionIds.map((qId) => {
        const q = this.db.data.questions.find((quest) => quest.id === qId);
        if (!q) return null;
        try {
          const plainText = CryptoUtil.decrypt(q.encryptedContent, kmsKey, q.iv, q.tag);
          const parsed = JSON.parse(plainText);
          return {
            id: q.id,
            description: parsed.description,
            options: parsed.options,
            image: parsed.image || null
          };
        } catch (err) {
          return {
            id: q.id,
            description: `[DECRYPTION ERROR] Failed to load question ${q.id}.`,
            options: { A: 'Error', B: 'Error', C: 'Error', D: 'Error' },
            image: null
          };
        }
      }).filter(Boolean);

      return {
        success: true,
        questions: decryptedQuestions,
        resumed: true,
        startedAt: student.activeTest.startedAt,
        student: {
          id: student.id,
          name: student.name,
          email: student.email,
          studentId: student.studentId
        }
      };
    }

    // Filter questions by subject
    const subjectQuestions = this.db.data.questions.filter(
      (q) => q.subject.toLowerCase() === subject.toLowerCase()
    );

    const totalTarget = 80;
    if (subjectQuestions.length < totalTarget) {
      throw new HttpException(
        `Insufficient questions available for subject: ${subject}. Required: ${totalTarget}, Available: ${subjectQuestions.length}`,
        HttpStatus.BAD_REQUEST
      );
    }

    // Group eligible questions by difficulty
    const easyPool = subjectQuestions.filter(q => q.difficulty === 'Easy');
    const mediumPool = subjectQuestions.filter(q => q.difficulty === 'Medium');
    const hardPool = subjectQuestions.filter(q => q.difficulty === 'Hard');

    // Balancing rule: 30% Easy (24), 40% Medium (32), 30% Hard (24)
    const easyCount = 24;
    const hardCount = 24;
    const mediumCount = 32;

    const selected: Question[] = [];

    const selectDifficultyFromPool = (pool: Question[], count: number) => {
      const shuffled = [...pool];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = shuffled[i];
        shuffled[i] = shuffled[j];
        shuffled[j] = temp;
      }
      let selectedForThisDifficulty = 0;
      for (const q of shuffled) {
        if (selectedForThisDifficulty >= count) break;

        // Match with remaining questions in the question paper which is being prepared
        const matchesExisting = selected.some(
          (existingQ) => existingQ.id === q.id || existingQ.hash === q.hash
        );

        if (matchesExisting) {
          this.logger.warn(`Duplicate question matched during student test preparation: ${q.id} (Hash: ${q.hash.substring(0, 10)}). Selecting alternative...`);
          this.agents.logSecurityAlert(
            'DUPLICATE_QUESTION_SELECTION_ATTEMPT',
            'Medium',
            `Intercepted duplicate question selection during student test preparation. ID: ${q.id}, Hash: ${q.hash.substring(0, 10)}`
          );
          continue;
        }

        selected.push(q);
        selectedForThisDifficulty++;
      }
    };

    selectDifficultyFromPool(easyPool, easyCount);
    selectDifficultyFromPool(mediumPool, mediumCount);
    selectDifficultyFromPool(hardPool, hardCount);

    if (selected.length < totalTarget) {
      throw new HttpException(
        `Insufficient unique questions available across difficulties for subject: ${subject}. Required: ${totalTarget}, Unique Selected: ${selected.length}`,
        HttpStatus.BAD_REQUEST
      );
    }

    const kmsKey = this.db.data.systemConfig.kmsMasterKey;

    // Decrypt on-the-fly and strip the correct option to prevent cheating
    const decryptedQuestions = selected.map((q) => {
      try {
        const plainText = CryptoUtil.decrypt(q.encryptedContent, kmsKey, q.iv, q.tag);
        const parsed = JSON.parse(plainText);
        
        return {
          id: q.id,
          description: parsed.description,
          options: parsed.options,
          image: parsed.image || null
        };
      } catch (err) {
        return {
          id: q.id,
          description: `[DECRYPTION ERROR] Failed to load question ${q.id}.`,
          options: { A: 'Error', B: 'Error', C: 'Error', D: 'Error' },
          image: null
        };
      }
    });

    // Record the active test session
    student.activeTest = {
      subject,
      startedFromIp: ip,
      startedAt: Date.now(),
      questionIds: selected.map((q) => q.id),
      userAgent: agent
    };
    this.db.saveDatabase();

    return {
      success: true,
      questions: decryptedQuestions
    };
  }

  @Post('students/submit-test')
  async studentSubmitTest(
    @Body() body: {
      studentId: string;
      subject: string;
      answers: Record<string, string>;
      questionIds: string[];
    }
  ) {
    const { studentId, subject, answers, questionIds } = body;
    if (!studentId || !subject || !questionIds || !answers) {
      throw new HttpException('Missing submission payload parameters.', HttpStatus.BAD_REQUEST);
    }

    // Verify student
    const students = this.db.data.students || [];
    const student = students.find((s) => s.studentId === studentId);
    if (!student) {
      throw new HttpException('Student record not found.', HttpStatus.NOT_FOUND);
    }

    if (student.isBlocked) {
      throw new HttpException(
        student.blockedReason || 'This student account has been blocked due to security violations.',
        HttpStatus.FORBIDDEN
      );
    }

    const kmsKey = this.db.data.systemConfig.kmsMasterKey;
    const questionsSnapshot: any[] = [];
    let score = 0;

    // Retrieve and decrypt each question to perform secure grading
    for (const qId of questionIds) {
      const q = this.db.data.questions.find((quest) => quest.id === qId);
      if (!q) continue;

      try {
        const plainText = CryptoUtil.decrypt(q.encryptedContent, kmsKey, q.iv, q.tag);
        const parsed = JSON.parse(plainText);
        
        const correctOption = parsed.correctOption || 'A';
        const studentChoice = answers[qId];

        if (studentChoice) {
          if (studentChoice === correctOption) {
            score += 4;
          } else {
            score -= 1;
          }
        } // Unanswered gets 0 marks

        questionsSnapshot.push({
          id: q.id,
          description: parsed.description,
          options: parsed.options,
          correctOption: correctOption,
          image: parsed.image || undefined
        });
      } catch (err) {
        questionsSnapshot.push({
          id: q.id,
          description: `[Decryption Error during grading]`,
          options: { A: 'Error', B: 'Error', C: 'Error', D: 'Error' },
          correctOption: 'A'
        });
      }
    }

    const maxMarks = questionIds.length * 4;

    const submission = {
      id: `sub-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      studentId: student.studentId,
      studentName: student.name,
      subject,
      score,
      maxMarks,
      submittedAt: Date.now(),
      answers,
      questions: questionsSnapshot
    };

    this.db.data.submissions = this.db.data.submissions || [];
    this.db.data.submissions.push(submission);

    // Clear active test session details
    student.activeTest = undefined;
    this.db.saveDatabase();

    // Log this action to the Audit ledger
    this.agents.writeAuditLog(
      'STUDENT',
      'SUBMIT_TEST',
      'TestSubmission',
      submission.id,
      `Student ${student.name} (${student.studentId}) submitted CBT test for ${subject}. Score: ${score}/${maxMarks}`
    );

    return {
      success: true,
      submissionId: submission.id,
      score,
      maxMarks
    };
  }

  @Post('students/heartbeat')
  async studentHeartbeat(
    @Body() body: { studentId: string; cameraFrame?: string; micVolume?: number },
    @Headers('x-forwarded-for') xForwardedFor?: string,
    @Headers('user-agent') userAgent?: string
  ) {
    const { studentId, cameraFrame, micVolume } = body;
    const ip = xForwardedFor || '127.0.0.1';
    const agent = userAgent || 'Mozilla/5.0';

    if (!studentId) {
      throw new HttpException('Student ID is required.', HttpStatus.BAD_REQUEST);
    }

    const students = this.db.data.students || [];
    const student = students.find((s) => s.studentId === studentId);
    if (!student) {
      throw new HttpException('Student record not found.', HttpStatus.NOT_FOUND);
    }

    if (student.isBlocked) {
      return { blocked: true, reason: student.blockedReason };
    }

    // If active test exists, check IP address mismatch
    if (student.activeTest && student.activeTest.startedFromIp !== ip) {
      // Block the student immediately
      student.isBlocked = true;
      student.blockedReason = `Running test accessed from another IP address (Original IP: ${student.activeTest.startedFromIp}, New IP: ${ip})`;
      
      this.agents.logSecurityAlert(
        'MULTIPLE_IP_ACCESS',
        'Critical',
        `Student ${student.name} (${student.studentId}) blocked. Running test opened on another IP address. Original: ${student.activeTest.startedFromIp}, New: ${ip}`,
        ip,
        agent
      );
      this.db.saveDatabase();

      return { blocked: true, reason: student.blockedReason };
    }

    // Broadcast live telemetry to admin dashboards
    this.events.server.emit('student_telemetry', {
      studentId: student.studentId,
      name: student.name,
      cameraFrame: cameraFrame || null,
      micVolume: micVolume !== undefined ? micVolume : Math.floor(Math.random() * 20) + 5,
      isBlocked: student.isBlocked,
      blockedReason: student.blockedReason,
      activeTest: student.activeTest,
      timestamp: Date.now()
    });

    return { blocked: false };
  }

  @Post('students/:studentId/block')
  async blockStudent(
    @Param('studentId') studentId: string,
    @Body() body: { reason: string; infractionType: string },
    @Headers('x-forwarded-for') xForwardedFor?: string,
    @Headers('user-agent') userAgent?: string
  ) {
    const { reason, infractionType } = body;
    const ip = xForwardedFor || '127.0.0.1';
    const agent = userAgent || 'Mozilla/5.0';

    const students = this.db.data.students || [];
    const student = students.find((s) => s.studentId === studentId);
    if (!student) {
      throw new HttpException('Student record not found.', HttpStatus.NOT_FOUND);
    }

    student.isBlocked = true;
    student.blockedReason = reason || 'Security protocol violation detected.';
    this.db.saveDatabase();

    // Log security alert in Security Monitoring Agent
    this.agents.logSecurityAlert(
      infractionType || 'STUDENT_EXAM_VIOLATION',
      'High',
      `Student ${student.name} (${student.studentId}) blocked. Reason: ${student.blockedReason}`,
      ip,
      agent,
      'ExamFraud'
    );

    this.agents.writeAuditLog(
      'SECURITY_AGENT',
      'BLOCK_STUDENT',
      'Student',
      student.id,
      `Blocked student: ${student.name} (${student.studentId}) for ${infractionType || 'CBT infraction'}. Details: ${reason}`
    );

    return { success: true, message: `Student ${student.studentId} blocked successfully.` };
  }

  @Post('students/:studentId/unblock')
  async unblockStudent(@Param('studentId') studentId: string) {
    const students = this.db.data.students || [];
    const student = students.find((s) => s.studentId === studentId);
    if (!student) {
      throw new HttpException('Student record not found.', HttpStatus.NOT_FOUND);
    }

    student.isBlocked = false;
    student.blockedReason = undefined;
    this.db.saveDatabase();

    // Log this action to the Audit ledger
    this.agents.writeAuditLog(
      'ADMIN',
      'UNBLOCK_STUDENT',
      'Student',
      student.id,
      `Unblocked student: ${student.name} (${student.studentId})`
    );

    return { success: true, message: `Student ${student.studentId} unblocked successfully.` };
  }

  @Post('students/:studentId/change-password')
  async changeStudentPassword(
    @Param('studentId') studentId: string,
    @Body() body: { passwordRaw: string; adminName: string }
  ) {
    const { passwordRaw, adminName } = body;
    if (!passwordRaw) {
      throw new HttpException('Password is required.', HttpStatus.BAD_REQUEST);
    }

    // Only the male admin (Dr. AK Gupta) is authorized
    if (adminName !== 'Dr. AK Gupta') {
      throw new HttpException('Unauthorized. Only male admin (Dr. AK Gupta) can change student passwords.', HttpStatus.FORBIDDEN);
    }

    const students = this.db.data.students || [];
    const student = students.find((s) => s.studentId === studentId);
    if (!student) {
      throw new HttpException('Student record not found.', HttpStatus.NOT_FOUND);
    }

    student.passwordRaw = passwordRaw;
    this.db.saveDatabase();

    // Log this action to the Audit ledger
    this.agents.writeAuditLog(
      'ADMIN',
      'CHANGE_STUDENT_PASSWORD',
      'Student',
      student.id,
      `Male Admin (${adminName}) changed password of student ${student.name} (${student.studentId})`
    );

    return { 
      success: true, 
      message: `Password for student ${student.studentId} updated successfully.`,
      student: {
        id: student.id,
        name: student.name,
        email: student.email,
        studentId: student.studentId,
        passwordRaw: student.passwordRaw
      }
    };
  }

  @Get('submissions')
  getSubmissions() {
    return this.db.data.submissions || [];
  }
}

