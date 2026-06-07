import * as fs from 'fs';
import * as path from 'path';
import { CryptoUtil } from '../crypto/crypto.util';

const dbPath = path.join(__dirname, '..', '..', '..', 'db.json');

// Subtopics for physics NEET questions
const TOPICS = [
  'Kinematics',
  'Laws of Motion',
  'Work, Energy & Power',
  'Rotational Motion',
  'Gravitation',
  'Elasticity & Fluids',
  'Thermodynamics',
  'Kinetic Theory of Gases',
  'Oscillations & Waves',
  'Electrostatics',
  'Current Electricity',
  'Magnetism & AC',
  'Ray Optics & Wave Optics',
  'Dual Nature of Matter',
  'Atoms & Nuclei',
  'Semiconductor Electronics'
];

interface GeneratedQuestion {
  description: string;
  options: { A: string; B: string; C: string; D: string };
  correctOption: string;
  topic: string;
}

// Deterministically generate a unique question based on difficulty and index
function generatePhysicsQuestion(difficulty: 'Easy' | 'Medium' | 'Hard', i: number): GeneratedQuestion {
  const topic = TOPICS[i % TOPICS.length];
  let description = '';
  let options = { A: '', B: '', C: '', D: '' };
  let correctOption = 'A';

  if (difficulty === 'Easy') {
    const templateIndex = i % 10;
    switch (templateIndex) {
      case 0: {
        const units = [
          { name: 'Magnetic Flux', unit: 'Weber' },
          { name: 'Inductance', unit: 'Henry' },
          { name: 'Capacitance', unit: 'Farad' },
          { name: 'Electric Potential', unit: 'Volt' },
          { name: 'Surface Tension', unit: 'N/m' }
        ];
        const choice = units[i % units.length];
        description = `Physics NEET Concept #${i}: What is the standard SI unit of ${choice.name}?`;
        options = {
          A: choice.unit,
          B: 'Tesla',
          C: 'Joule-second',
          D: 'Coulomb-meter'
        };
        correctOption = 'A';
        break;
      }
      case 1: {
        const mass = (i % 10) + 1;
        const speed = (i % 5) + 2;
        const ke = 0.5 * mass * speed * speed;
        description = `Physics NEET Concept #${i}: A body of mass ${mass} kg is moving with a constant speed of ${speed} m/s. Calculate the kinetic energy of the body in Joules.`;
        options = {
          A: `${ke * 1.5} J`,
          B: `${ke} J`,
          C: `${ke - 2} J`,
          D: `${ke + 10} J`
        };
        correctOption = 'B';
        break;
      }
      case 2: {
        const f = 10 + (i % 50);
        const m = 2 + (i % 10);
        const acc = (f / m).toFixed(2);
        description = `Physics NEET Concept #${i}: A constant force of ${f} N acts on a mass of ${m} kg starting from rest. What is the acceleration produced in m/s^2?`;
        options = {
          A: `${(parseFloat(acc) + 1).toFixed(2)} m/s^2`,
          B: `${(parseFloat(acc) * 0.8).toFixed(2)} m/s^2`,
          C: `${acc} m/s^2`,
          D: `${(parseFloat(acc) + 3.5).toFixed(2)} m/s^2`
        };
        correctOption = 'C';
        break;
      }
      case 3: {
        const val = 10 + (i % 90);
        description = `Physics NEET Concept #${i}: If the temperature of a gas is raised from ${val}°C to ${val + 100}°C, what is the absolute change in temperature in Kelvin?`;
        options = {
          A: '100 K',
          B: '273 K',
          C: '373 K',
          D: '0 K'
        };
        correctOption = 'A';
        break;
      }
      case 4: {
        const r1 = (i % 5) + 1;
        const r2 = (i % 8) + 2;
        const rSeries = r1 + r2;
        description = `Physics NEET Concept #${i}: Two resistors of values ${r1} ohms and ${r2} ohms are connected in series. Find their equivalent resistance in ohms.`;
        options = {
          A: `${rSeries} ohms`,
          B: `${(r1 * r2) / (r1 + r2)} ohms`,
          C: `${rSeries + 5} ohms`,
          D: `Zero`
        };
        correctOption = 'A';
        break;
      }
      case 5: {
        const wavelength = 400 + (i % 300);
        description = `Physics NEET Concept #${i}: Light wave of wavelength ${wavelength} nm travels from vacuum into a medium. Which of the following parameters remains constant?`;
        options = {
          A: 'Wavelength',
          B: 'Velocity',
          C: 'Frequency',
          D: 'Amplitude'
        };
        correctOption = 'C';
        break;
      }
      case 6: {
        const turns = 100 + (i % 200);
        description = `Physics NEET Concept #${i}: The magnetic flux linked with a coil of ${turns} turns changes from 2 Wb to 6 Wb. Calculate the change in total flux linkage.`;
        options = {
          A: `${4 * turns} Wb`,
          B: '4 Wb',
          C: `${2 * turns} Wb`,
          D: `${turns} Wb`
        };
        correctOption = 'A';
        break;
      }
      case 7: {
        const weight = 40 + (i % 40);
        description = `Physics NEET Concept #${i}: If a person's weight on Earth is ${weight} kg-wt, what will be their approximate weight on the surface of the Moon?`;
        options = {
          A: `${(weight / 2).toFixed(1)} kg-wt`,
          B: `${(weight / 6).toFixed(1)} kg-wt`,
          C: `Zero`,
          D: `${weight} kg-wt`
        };
        correctOption = 'B';
        break;
      }
      case 8: {
        const wl = 300 + (i % 200);
        description = `Physics NEET Concept #${i}: An electromagnetic wave has wavelength ${wl} nm. This wavelength lies in which region of the spectrum?`;
        options = {
          A: 'Infrared',
          B: 'X-rays',
          C: 'Ultraviolet',
          D: 'Microwave'
        };
        correctOption = 'C';
        break;
      }
      case 9: {
        description = `Physics NEET Concept #${i}: In a semiconductor at absolute zero temperature, the conduction band is:`;
        options = {
          A: 'Completely filled',
          B: 'Half-filled',
          C: 'Completely empty',
          D: 'Moderately populated'
        };
        correctOption = 'C';
        break;
      }
    }
  } else if (difficulty === 'Medium') {
    const templateIndex = i % 10;
    switch (templateIndex) {
      case 0: {
        const v = 20 + (i % 30);
        const theta = 30; // standard sin(30) = 0.5
        const hMax = ((v * v * 0.25) / 19.6).toFixed(2);
        description = `Physics NEET Concept #${i}: A projectile is fired from the ground with an initial velocity of ${v} m/s at an angle of 30 degrees to the horizontal. Calculate the maximum height reached (take g = 9.8 m/s^2).`;
        options = {
          A: `${(parseFloat(hMax) * 1.5).toFixed(2)} m`,
          B: `${hMax} m`,
          C: `${(parseFloat(hMax) - 5).toFixed(2)} m`,
          D: `${(parseFloat(hMax) + 12.3).toFixed(2)} m`
        };
        correctOption = 'B';
        break;
      }
      case 1: {
        const t2 = 300 + (i % 100);
        const t1 = t2 + 150 + (i % 150);
        const eff = ((1 - t2 / t1) * 100).toFixed(1);
        description = `Physics NEET Concept #${i}: A Carnot engine operates between reservoirs at temperatures T1 = ${t1} K and T2 = ${t2} K. Determine the thermodynamic efficiency.`;
        options = {
          A: `${eff}%`,
          B: `${(parseFloat(eff) - 10).toFixed(1)}%`,
          C: `${(parseFloat(eff) + 8).toFixed(1)}%`,
          D: '100%'
        };
        correctOption = 'A';
        break;
      }
      case 2: {
        const l = 0.5 + (i % 5) * 0.1;
        const n = 500 + (i % 500);
        const cur = 2 + (i % 4);
        const u = 4 * Math.PI * 1e-7;
        const b = ((u * n * cur) / l).toExponential(3);
        description = `Physics NEET Concept #${i}: A solenoid of length ${l.toFixed(1)} m has ${n} turns and carries a steady current of ${cur} A. Find the magnetic field strength at the center.`;
        options = {
          A: `${b} T`,
          B: '1.2 x 10^-5 T',
          C: '3.4 x 10^-2 T',
          D: 'Zero'
        };
        correctOption = 'A';
        break;
      }
      case 3: {
        const v = 50 + (i % 150);
        const wl = (12.27 / Math.sqrt(v)).toFixed(3);
        description = `Physics NEET Concept #${i}: What is the de Broglie wavelength of an electron accelerated through an electric potential difference of ${v} V?`;
        options = {
          A: `${(parseFloat(wl) + 0.5).toFixed(3)} Å`,
          B: `${(parseFloat(wl) * 1.5).toFixed(3)} Å`,
          C: `${wl} Å`,
          D: `${(parseFloat(wl) - 0.1).toFixed(3)} Å`
        };
        correctOption = 'C';
        break;
      }
      case 4: {
        const vMax = 100 + (i % 120);
        const r = 10 + (i % 40);
        const vRms = vMax / Math.sqrt(2);
        const iRms = (vRms / r).toFixed(2);
        description = `Physics NEET Concept #${i}: An AC generator voltage is given by v = ${vMax} sin(100 pi t) Volts. It is connected to a resistance of ${r} ohms. The RMS current value is:`;
        options = {
          A: `${(parseFloat(iRms) * 1.414).toFixed(2)} A`,
          B: `${iRms} A`,
          C: `${(parseFloat(iRms) / 2).toFixed(2)} A`,
          D: '0 A'
        };
        correctOption = 'B';
        break;
      }
      case 5: {
        const halfLife = 4 + (i % 6);
        const days = halfLife * 3;
        description = `Physics NEET Concept #${i}: A radioactive isotope has a half-life of ${halfLife} days. What fraction of the original sample remains undecayed after ${days} days?`;
        options = {
          A: '1/2',
          B: '1/4',
          C: '1/8',
          D: '1/16'
        };
        correctOption = 'C';
        break;
      }
      case 6: {
        const f = 10 + (i % 20);
        const m = 2; // magnification real
        const u = ((f * (m + 1)) / m).toFixed(1);
        description = `Physics NEET Concept #${i}: A concave mirror of focal length ${f} cm forms a real image magnified 2 times. Find the object distance from the mirror pole.`;
        options = {
          A: `${u} cm`,
          B: `${f} cm`,
          C: `${f * 2} cm`,
          D: `${(parseFloat(u) + 10).toFixed(1)} cm`
        };
        correctOption = 'A';
        break;
      }
      case 7: {
        const d = (0.2 + (i % 5) * 0.1).toFixed(1);
        const screenD = 1.5;
        const wl = 600; // nm
        const width = ((wl * 1e-9 * screenD) / (parseFloat(d) * 1e-3) * 1e3).toFixed(3); // in mm
        description = `Physics NEET Concept #${i}: In a double-slit experiment, the slits are separated by ${d} mm and the screen is placed 1.5 m away. For light of wavelength 600 nm, find the fringe width in mm.`;
        options = {
          A: '1.200 mm',
          B: `${width} mm`,
          C: '0.450 mm',
          D: '2.500 mm'
        };
        correctOption = 'B';
        break;
      }
      case 8: {
        const k = 100 + (i % 400);
        const x = 5 + (i % 10);
        const energy = (0.5 * k * (x / 100) * (x / 100)).toFixed(3);
        description = `Physics NEET Concept #${i}: A spring of spring constant ${k} N/m is stretched by ${x} cm from its equilibrium position. Calculate the potential energy stored.`;
        options = {
          A: `${(parseFloat(energy) * 2).toFixed(3)} J`,
          B: `${energy} J`,
          C: `${(parseFloat(energy) - 0.05).toFixed(3)} J`,
          D: `${(parseFloat(energy) + 1.25).toFixed(3)} J`
        };
        correctOption = 'B';
        break;
      }
      case 9: {
        const angle = 30 + (i % 15);
        description = `Physics NEET Concept #${i}: A block slides down a smooth inclined plane of inclination ${angle} degrees. What is the acceleration of the block down the incline? (take g = 10 m/s^2)`;
        options = {
          A: '10 m/s^2',
          B: `${(10 * Math.sin(angle * Math.PI / 180)).toFixed(2)} m/s^2`,
          C: `${(10 * Math.cos(angle * Math.PI / 180)).toFixed(2)} m/s^2`,
          D: '5 m/s^2'
        };
        correctOption = 'B';
        break;
      }
    }
  } else {
    // Hard questions
    const templateIndex = i % 10;
    switch (templateIndex) {
      case 0: {
        const m = 5 + (i % 10);
        const theta = 30; // degrees
        const mu = 0.3 + (i % 5) * 0.05;
        const g = 10;
        // F = mg sin(theta) + mu mg cos(theta)
        const rad = (theta * Math.PI) / 180;
        const f = (m * g * Math.sin(rad) + mu * m * g * Math.cos(rad)).toFixed(2);
        description = `Physics NEET Concept #${i}: A block of mass ${m} kg is placed on a rough inclined plane of angle 30 degrees. If the coefficient of static friction is ${mu.toFixed(2)}, find the minimum force required to slide the block up the plane.`;
        options = {
          A: `${f} N`,
          B: `${(parseFloat(f) * 0.7).toFixed(2)} N`,
          C: `${(parseFloat(f) + 15.2).toFixed(2)} N`,
          D: 'Zero'
        };
        correctOption = 'A';
        break;
      }
      case 1: {
        const amp = 10 + (i % 10);
        const ratio = 3; // KE/PE = 3
        // KE = 3PE => 1/2 k (A^2 - x^2) = 3 (1/2 k x^2) => A^2 - x^2 = 3x^2 => A^2 = 4x^2 => x = A/2
        const x = (amp / 2).toFixed(1);
        description = `Physics NEET Concept #${i}: A particle is executing simple harmonic motion (SHM) with amplitude ${amp} cm. At what displacement from the mean position is its kinetic energy 3 times its potential energy?`;
        options = {
          A: `${amp} cm`,
          B: `${(amp / Math.sqrt(2)).toFixed(2)} cm`,
          C: `${x} cm`,
          D: 'Zero'
        };
        correctOption = 'C';
        break;
      }
      case 2: {
        const l = 10 + (i % 10); // mH
        const c = 1 + (i % 5); // uF
        const r = 5 + (i % 15); // ohms
        // Q = (1/R) * sqrt(L/C)
        const lH = l * 1e-3;
        const cF = c * 1e-6;
        const q = ((1 / r) * Math.sqrt(lH / cF)).toFixed(2);
        description = `Physics NEET Concept #${i}: An LCR circuit contains L = ${l} mH, C = ${c} uF, and R = ${r} ohms connected in series. Calculate the quality factor Q of the circuit at resonance.`;
        options = {
          A: `${q}`,
          B: `${(parseFloat(q) * 1.5).toFixed(2)}`,
          C: `${(parseFloat(q) / 2).toFixed(2)}`,
          D: '1.0'
        };
        correctOption = 'A';
        break;
      }
      case 3: {
        const ringM = 2 + (i % 3);
        const ringR = 0.5 + (i % 3) * 0.1;
        const pm = (0.1 + (i % 5) * 0.05).toFixed(2);
        const w = 10 + (i % 20);
        // I1 = RingM * RingR^2
        // I2 = RingM * RingR^2 + 2 * pm * RingR^2 = (RingM + 2*pm)*RingR^2
        // w2 = w * I1 / I2 = w * RingM / (RingM + 2 * pm)
        const w2 = (w * ringM / (ringM + 2 * parseFloat(pm))).toFixed(2);
        description = `Physics NEET Concept #${i}: A thin circular ring of mass ${ringM} kg and radius ${ringR.toFixed(1)} m is rotating about its axis with angular velocity ${w} rad/s. Two point masses of ${pm} kg each are gently attached to opposite ends of its diameter. Find the new angular velocity.`;
        options = {
          A: `${(parseFloat(w2) + 2).toFixed(2)} rad/s`,
          B: `${w2} rad/s`,
          C: `${(parseFloat(w2) * 1.3).toFixed(2)} rad/s`,
          D: `${w} rad/s`
        };
        correctOption = 'B';
        break;
      }
      case 4: {
        const p = (i % 10) + 1; // x 10^-9 C-m
        const r = (i % 5) + 1;
        const k = 9e9;
        // V = k * p / r^2
        const v = (k * p * 1e-9 / (r * r)).toFixed(1);
        description = `Physics NEET Concept #${i}: Calculate the electrical potential in Volts at a distance of ${r} m on the axial line of an electric dipole of dipole moment ${p} x 10^-9 C-m in free space.`;
        options = {
          A: `${v} V`,
          B: `${(parseFloat(v) * 2).toFixed(1)} V`,
          C: `${(parseFloat(v) / 2).toFixed(1)} V`,
          D: 'Zero'
        };
        correctOption = 'A';
        break;
      }
      case 5: {
        const n1 = 3;
        const n2 = 2; // Balmer line
        // 1/wl = R * (1/4 - 1/9) = R * 5/36 => wl = 36 / 5R
        const rHyd = 1.097e7;
        const wl = (36 / (5 * rHyd) * 1e9).toFixed(1); // nm
        description = `Physics NEET Concept #${i}: In a hydrogen atom, an electron falls from orbit n = 3 to orbit n = 2. Find the wavelength of the emitted spectral line.`;
        options = {
          A: '121.6 nm',
          B: '486.1 nm',
          C: `${wl} nm`,
          D: '91.2 nm'
        };
        correctOption = 'C';
        break;
      }
      case 6: {
        const fluxT = 2 + (i % 3);
        const fluxConst = (i % 5) + 1;
        // phi = fluxT * t^2 + fluxConst * t
        // emf = d(phi)/dt = 2*fluxT*t + fluxConst at t = 2
        const emf = 2 * fluxT * 2 + fluxConst;
        description = `Physics NEET Concept #${i}: The magnetic flux linked with a coil is given by the relation phi = ${fluxT}t^2 + ${fluxConst}t + 5 (in milliwebers). What is the magnitude of induced EMF in mV at t = 2 seconds?`;
        options = {
          A: `${emf} mV`,
          B: `${emf + 10} mV`,
          C: `${emf - 3} mV`,
          D: 'Zero'
        };
        correctOption = 'A';
        break;
      }
      case 7: {
        const temp = 27 + (i % 100);
        // speed of sound v = sqrt(gamma * R * T / M)
        // Let's use helium gas: gamma = 5/3, M = 4e-3 kg/mol. T_K = temp + 273.
        const tk = temp + 273;
        const rVal = 8.314;
        const vSound = Math.sqrt((5 / 3) * rVal * tk / 4e-3).toFixed(1);
        description = `Physics NEET Concept #${i}: Find the speed of sound in helium gas at a temperature of ${temp}°C (take gamma = 5/3, R = 8.314 J/mol-K, Molar mass of Helium = 4 g/mol).`;
        options = {
          A: `${(parseFloat(vSound) - 50).toFixed(1)} m/s`,
          B: `${vSound} m/s`,
          C: `${(parseFloat(vSound) + 120).toFixed(1)} m/s`,
          D: '330 m/s'
        };
        correctOption = 'B';
        break;
      }
      case 8: {
        const fo = 100 + (i % 50);
        const fe = 2 + (i % 4);
        const mag = (fo / fe).toFixed(1);
        const len = (fo + fe).toFixed(1);
        description = `Physics NEET Concept #${i}: An astronomical telescope has an objective focal length of ${fo} cm and eyepiece of focal length ${fe} cm. Find its magnifying power and tube length respectively in normal adjustment.`;
        options = {
          A: `Magnification: ${mag}, Length: ${len} cm`,
          B: `Magnification: ${fe}, Length: ${fo} cm`,
          C: `Magnification: ${mag}, Length: ${(fo - fe).toFixed(1)} cm`,
          D: `Magnification: 1.0, Length: ${len} cm`
        };
        correctOption = 'A';
        break;
      }
      case 9: {
        const tension = 10 + (i % 40);
        const massPerLen = 1e-3 + (i % 5) * 1e-4;
        const len = 0.5 + (i % 3) * 0.1;
        // f = (1 / 2L) * sqrt(T / mu)
        const f = ( (1 / (2 * len)) * Math.sqrt(tension / massPerLen) ).toFixed(1);
        description = `Physics NEET Concept #${i}: A string of length ${len.toFixed(1)} m and mass per unit length ${massPerLen.toExponential(2)} kg/m is kept under a tension of ${tension} N. Find the fundamental frequency of transverse waves.`;
        options = {
          A: '150 Hz',
          B: `${f} Hz`,
          C: `${(parseFloat(f) * 2).toFixed(1)} Hz`,
          D: '50 Hz'
        };
        correctOption = 'B';
        break;
      }
    }
  }

  return {
    description,
    options,
    correctOption,
    topic
  };
}

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

  const subject = 'Physics';
  const difficulties: ('Easy' | 'Medium' | 'Hard')[] = ['Easy', 'Medium', 'Hard'];

  console.log('[Seeder] Generating exactly 3,000 unique Physics questions (1,000 Easy, 1,000 Medium, 1,000 Hard)...');

  let blockIndex = genesisBlock.index;
  let lastBlockHash = genesisBlock.hash;

  for (const difficulty of difficulties) {
    console.log(`[Seeder] Seeding 1,000 unique ${difficulty} questions...`);
    for (let i = 1; i <= 1000; i++) {
      // Deterministically generate question details
      const generated = generatePhysicsQuestion(difficulty, i);

      const questionJson = JSON.stringify({
        description: generated.description,
        options: generated.options,
        correctOption: generated.correctOption,
        image: null
      });

      // Encrypt
      const encrypted = CryptoUtil.encrypt(questionJson, kmsKey);
      const hash = CryptoUtil.hash(questionJson);
      const signature = CryptoUtil.signData(hash, privateKey);

      const questionId = `q-${subject.toLowerCase()}-${Date.now()}-${difficulty.toLowerCase()}-${i}`;
      const question = {
        id: questionId,
        encryptedContent: encrypted.encrypted,
        iv: encrypted.iv,
        tag: encrypted.tag,
        subject,
        topic: generated.topic,
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

      // Add periodic audit log every 50 questions to save space/time and not flood memory
      if (i % 50 === 0) {
        const prevAudit = db.auditLogs[db.auditLogs.length - 1];
        const prevAuditHash = prevAudit ? prevAudit.hashChain : 'genesis-chain-hash-001';
        const auditPayload = `${db.auditLogs.length + 1}-SYSTEM_SEEDER-BATCH_INGEST-Question-${difficulty}-${i}-${prevAuditHash}`;
        const auditHash = CryptoUtil.hash(auditPayload);

        db.auditLogs.push({
          id: `audit-${Date.now()}-${difficulty.toLowerCase()}-${i}`,
          timestamp: Date.now(),
          actor: 'SYSTEM_SEEDER',
          action: 'INGEST_QUESTION',
          entity: 'Question',
          entityId: questionId,
          hashChain: auditHash,
          details: `Auto-seeded 50 questions block. Difficulty: ${difficulty}, Batch Count: ${i}. Blockchain Height: ${blockIndex}`
        });
      }
    }
  }

  // Update stats
  db.systemConfig.securityScore = 100;
  db.systemConfig.threatLevel = 'Low';

  // Make sure we configure the NEET Physics exam correctly in database
  db.exams = db.exams || [];
  const neetExam = db.exams.find((e: any) => e.id === 'exam-neet-2026');
  if (neetExam) {
    neetExam.name = 'NEET 2026 - Physics';
    neetExam.code = 'NEET-PHY-2026';
    neetExam.subject = 'Physics';
    neetExam.questionCount = 80;
    neetExam.redundancyMultiplier = 3;
    neetExam.status = 'Scheduled';
    neetExam.entropyInputs = {};
    delete neetExam.generatedPaper;
  }

  const jeeExam = db.exams.find((e: any) => e.id === 'exam-jee-main');
  if (jeeExam) {
    jeeExam.name = 'JEE Main 2026 - Physics';
    jeeExam.code = 'JEE-PHY-2026';
    jeeExam.subject = 'Physics';
    jeeExam.questionCount = 80;
    jeeExam.redundancyMultiplier = 3;
    jeeExam.status = 'Scheduled';
    jeeExam.entropyInputs = {};
    delete jeeExam.generatedPaper;
  }

  console.log(`[Seeder] Writing database update back to disk...`);
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');
  console.log(`[Seeder] Seeding successful! Total questions: ${db.questions.length}. Blockchain height: ${db.blockchain.length}.`);
}

seed().catch(err => {
  console.error('[Seeder] Error during seed:', err);
});
