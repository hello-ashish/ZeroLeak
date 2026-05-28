import * as fs from 'fs';
import * as path from 'path';
import { CryptoUtil } from '../crypto/crypto.util';

const dbPath = path.join(__dirname, '..', '..', '..', 'db.json');

async function seed() {
  console.log(`[Seeder] Loading database from: ${dbPath}`);
  if (!fs.existsSync(dbPath)) {
    console.error(`[Seeder] Database not found at ${dbPath}`);
    process.exit(1);
  }

  const raw = fs.readFileSync(dbPath, 'utf8');
  const db = JSON.parse(raw);

  const kmsKey = db.systemConfig.kmsMasterKey;
  const privateKey = db.systemConfig.trustedAdminPrivateKey;
  const publicKey = db.systemConfig.trustedAdminPublicKey;

  console.log('[Seeder] Found keys in system config. Wiping existing questions and blocks before seeding.');
  
  db.questions = [];
  // Keep only the genesis block in the blockchain list
  const genesisBlock = db.blockchain.find((b: any) => b.index === 1) || {
    index: 1,
    timestamp: Date.now(),
    questionHash: "genesis-question-hash-value-000000",
    subject: "System",
    difficulty: "Easy",
    validatorSignature: "genesis-signature-value-00000000000",
    previousHash: "0000000000000000000000000000000000000000000000000000000000000000",
    hash: "genesis-block-hash-value-000000000000",
    auditRef: "genesis-audit-ref"
  };
  db.blockchain = [genesisBlock];
  db.submissions = [];
  db.auditLogs = [
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

  const subjects = ['Physics', 'Biology', 'UPSC-CSAT'];
  const difficulties = ['Easy', 'Medium', 'Hard'];

  console.log(`[Seeder] Generating 100 questions for subjects: ${subjects.join(', ')}...`);

  let blockIndex = genesisBlock.index;
  let lastBlockHash = genesisBlock.hash;

  for (const subject of subjects) {
    console.log(`[Seeder] Seeding 100 questions for subject: ${subject}`);
    for (let i = 1; i <= 100; i++) {
      const difficulty = difficulties[i % 3] as 'Easy' | 'Medium' | 'Hard';
      
      // Formulate unique question details
      const description = `${subject} Seeded Question #${i}: conceptual evaluation covering standard syllabus parameters. Find the correct option.`;
      const options = {
        A: `Concept definition statement A for ${subject} Q${i}`,
        B: `Concept definition statement B for ${subject} Q${i}`,
        C: `Concept definition statement C for ${subject} Q${i}`,
        D: `Concept definition statement D for ${subject} Q${i}`
      };
      const correctOption = ['A', 'B', 'C', 'D'][i % 4];

      const questionJson = JSON.stringify({
        description,
        options,
        correctOption,
        image: null
      });

      // Encrypt
      const encrypted = CryptoUtil.encrypt(questionJson, kmsKey);
      const hash = CryptoUtil.hash(questionJson);
      const signature = CryptoUtil.signData(hash, privateKey);

      const questionId = `q-${subject.toLowerCase()}-${Date.now()}-${i}-${Math.floor(Math.random() * 1000)}`;
      const question = {
        id: questionId,
        encryptedContent: encrypted.encrypted,
        iv: encrypted.iv,
        tag: encrypted.tag,
        subject,
        topic: 'Conceptual Seeding',
        difficulty,
        hash,
        author: 'SYSTEM_SEEDER',
        publicKey,
        signature,
        createdAt: Date.now()
      };

      db.questions.push(question);

      // Create blockchain block
      blockIndex++;
      const hashPayload = `${blockIndex}-${hash}-${subject}-${difficulty}-${lastBlockHash}`;
      const blockHash = CryptoUtil.hash(hashPayload);
      const validatorSignature = CryptoUtil.signData(blockHash, privateKey);

      const block = {
        index: blockIndex,
        timestamp: Date.now(),
        questionHash: hash,
        subject,
        difficulty,
        validatorSignature,
        previousHash: lastBlockHash,
        hash: blockHash,
        auditRef: `audit-ingest-${blockIndex}`
      };

      db.blockchain.push(block);
      lastBlockHash = blockHash;

      // Add audit log
      const prevAudit = db.auditLogs[db.auditLogs.length - 1];
      const prevAuditHash = prevAudit ? prevAudit.hashChain : 'genesis-chain-hash-000';
      const auditPayload = `${db.auditLogs.length + 1}-SYSTEM_SEEDER-INGEST_QUESTION-Question-${questionId}-${prevAuditHash}`;
      const auditHash = CryptoUtil.hash(auditPayload);

      db.auditLogs.push({
        id: `audit-${Date.now()}-${i}`,
        timestamp: Date.now(),
        actor: 'SYSTEM_SEEDER',
        action: 'INGEST_QUESTION',
        entity: 'Question',
        entityId: questionId,
        hashChain: auditHash,
        details: `Auto-seeded question during initialization. Blockchain Block #${blockIndex}`
      });
    }
  }

  // Update stats
  db.systemConfig.securityScore = 100;
  db.systemConfig.threatLevel = 'Low';

  console.log(`[Seeder] Writing database update back to disk...`);
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');
  console.log(`[Seeder] Seeding successful! Total questions: ${db.questions.length}. Blockchain height: ${db.blockchain.length}.`);
}

seed().catch(err => {
  console.error('[Seeder] Error during seed:', err);
});
