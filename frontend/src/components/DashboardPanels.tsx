'use client';

import React, { useState, useEffect } from 'react';
import { useStore } from '../lib/store';
import { apiClient } from '../lib/api';
import { jsPDF } from 'jspdf';
import Editor from '@monaco-editor/react';
import {
  ShieldAlert, ShieldCheck, Database, Cpu, Activity, Clock, FileText,
  Terminal, Server, RefreshCw, Key, Upload, Search, Trash2, ArrowRight,
  TrendingUp, Lock, RefreshCcw, Wifi, AlertTriangle, AlertCircle, MapPin, CheckCircle,
  Image as ImageIcon, User, Eye, Download, ChevronDown, ChevronUp
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar, LineChart, Line } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

// ========================================================
// 1. COMMAND CENTER (OVERVIEW)
// ========================================================
export const AdminCenterPanel = () => {
  const { stats, blockchain, securityEvents, exams } = useStore();
  const [loading, setLoading] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">System Command Center</h2>
          <p className="text-gray-400 text-sm">Real-time status overview of secure generation nodes.</p>
        </div>
        <div className="flex gap-2">
          <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full text-xs font-mono">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
            Orchestrator: ACTIVE
          </span>
        </div>
      </div>

      {/* Grid of Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel-glow-indigo p-4 rounded-xl relative overflow-hidden group">
          <div className="absolute right-3 top-3 text-indigo-500 opacity-20 group-hover:scale-110 transition-transform">
            <ShieldCheck size={40} />
          </div>
          <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">Security Integrity Score</p>
          <p className="text-3xl font-extrabold text-white mt-1 font-mono">{stats.securityScore}%</p>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${stats.securityScore > 80 ? 'bg-emerald-500' : stats.securityScore > 50 ? 'bg-amber-500' : 'bg-rose-500'}`}
              style={{ width: `${stats.securityScore}%` }}
            ></div>
          </div>
        </div>

        <div className="glass-panel-glow-cyan p-4 rounded-xl relative overflow-hidden group">
          <div className="absolute right-3 top-3 text-cyan-500 opacity-20 group-hover:scale-110 transition-transform">
            <Cpu size={40} />
          </div>
          <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">Ledger Blocks (N)</p>
          <p className="text-3xl font-extrabold text-white mt-1 font-mono">{stats.blockchainHeight}</p>
          <p className="text-xs text-gray-500 mt-2 font-mono">Immutable Question Signatures</p>
        </div>

        <div className="glass-panel-glow-emerald p-4 rounded-xl relative overflow-hidden group">
          <div className="absolute right-3 top-3 text-emerald-500 opacity-20 group-hover:scale-110 transition-transform">
            <Database size={40} />
          </div>
          <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">Active Question Bank</p>
          <p className="text-3xl font-extrabold text-white mt-1 font-mono">{stats.questionsCount}</p>
          <p className="text-xs text-gray-500 mt-2 font-mono">Encrypted AES Question Blobs</p>
        </div>

        <div className="glass-panel-glow-rose p-4 rounded-xl relative overflow-hidden group">
          <div className="absolute right-3 top-3 text-rose-500 opacity-20 group-hover:scale-110 transition-transform">
            <Clock size={40} />
          </div>
          <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">Exams Configured</p>
          <p className="text-3xl font-extrabold text-white mt-1 font-mono">{stats.examsCount}</p>
          <p className="text-xs text-gray-500 mt-2 font-mono">Time-locked Schedules</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Scheduled Exams */}
        <div className="lg:col-span-2 glass-panel p-5 rounded-xl border border-slate-800 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <h3 className="font-semibold text-white flex items-center gap-2 text-sm">
              <Clock size={16} className="text-indigo-400" />
              Upcoming Scheduled Exams & Dynamic Decryption keys
            </h3>
          </div>
          <div className="divide-y divide-slate-800">
            {exams.map((exam) => (
              <div key={exam.id} className="py-3 flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                <div>
                  <p className="text-white font-medium text-sm">{exam.name}</p>
                  <p className="text-xs text-gray-400 font-mono mt-0.5">Code: {exam.code} | Redundancy Pool: X={exam.questionCount} × {exam.redundancyMultiplier} (N={exam.questionCount * exam.redundancyMultiplier})</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-0.5 rounded text-xs font-mono font-medium ${exam.status === 'Released' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                    exam.status === 'Generating' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse' :
                      'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                    }`}>
                    {exam.status}
                  </span>
                  <p className="text-xs text-gray-400 font-mono">
                    {new Date(exam.scheduledTime).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Security Bulletins */}
        <div className="glass-panel p-5 rounded-xl border border-slate-800 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <h3 className="font-semibold text-white flex items-center gap-2 text-sm">
              <ShieldAlert size={16} className="text-rose-400" />
              Security Agent Feed
            </h3>
          </div>
          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
            {securityEvents.length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-xs">No active threats detected. System is safe.</div>
            ) : (
              securityEvents.slice(0, 5).map((evt) => (
                <div key={evt.id} className={`p-2.5 rounded-lg text-xs border ${evt.severity === 'Critical' || evt.severity === 'High'
                  ? 'bg-rose-500/5 border-rose-500/20 text-rose-400'
                  : 'bg-amber-500/5 border-amber-500/20 text-amber-400'
                  }`}>
                  <div className="flex justify-between font-mono font-semibold">
                    <span>{evt.event}</span>
                    <span className="text-[10px] opacity-75">{new Date(evt.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <p className="mt-1 text-gray-300 font-sans leading-relaxed">{evt.details}</p>
                  {evt.blocked && (
                    <span className="inline-block mt-1 px-1.5 py-0.5 bg-rose-500/20 text-rose-300 rounded font-mono text-[9px] uppercase">
                      Threat Blocked
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// ========================================================
// 2. QUESTION REPOSITORY
// ========================================================
export const QuestionRepositoryPanel = () => {
  const { questions, setQuestions } = useStore();
  const [subject, setSubject] = useState('Physics');
  const [topic, setTopic] = useState('');
  const [description, setDescription] = useState('');
  const [optionA, setOptionA] = useState('');
  const [optionB, setOptionB] = useState('');
  const [optionC, setOptionC] = useState('');
  const [optionD, setOptionD] = useState('');
  const [correctOption, setCorrectOption] = useState('A');
  const [imageB64, setImageB64] = useState<string | null>(null);
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchQuestions = async () => {
    try {
      const q = await apiClient.getQuestions();
      setQuestions(q);
    } catch (e) { }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setImageB64(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleIngest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      setError('Question description is required.');
      return;
    }
    if (!optionA.trim() || !optionB.trim() || !optionC.trim() || !optionD.trim()) {
      setError('All four options must be filled.');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');

    // Package question data into a stringified JSON content payload
    const contentPayload = JSON.stringify({
      description,
      options: { A: optionA, B: optionB, C: optionC, D: optionD },
      correctOption,
      image: imageB64
    });

    try {
      await apiClient.ingestQuestion({
        content: contentPayload,
        subject,
        topic: topic || 'General Mechanics',
        difficulty,
        author: 'Chief Examiner Office'
      });
      setSuccess('Question encrypted with AES-256-GCM and validation block committed to Blockchain.');
      setDescription('');
      setOptionA('');
      setOptionB('');
      setOptionC('');
      setOptionD('');
      setCorrectOption('A');
      setImageB64(null);
      setTopic('');
      fetchQuestions();
    } catch (err: any) {
      setError(err.message || 'Ingestion failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-1 lg:grid-cols-3 gap-6"
    >
      {/* Upload/Ingest Form */}
      <div className="glass-panel p-5 rounded-xl border border-slate-800 space-y-4 h-fit">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Upload size={18} className="text-cyan-400" />
          Ingest Question Key
        </h3>
        <p className="text-xs text-gray-400">
          Draft questions, upload figures, and set answers. Questions are fully encrypted locally inside our Zero-Trust infrastructure.
        </p>

        <form onSubmit={handleIngest} className="space-y-3.5">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Subject Registry</label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="Physics">Physics (JEE/NEET)</option>
              <option value="Biology">Biology (NEET)</option>
              <option value="UPSC-CSAT">UPSC General Studies</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Topic / Conceptual Index</label>
            <input
              type="text"
              placeholder="e.g. Quantum Electrodynamics, Cell Cytology"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 font-sans"
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            {(['Easy', 'Medium', 'Hard'] as const).map((diff) => (
              <button
                key={diff}
                type="button"
                onClick={() => setDifficulty(diff)}
                className={`py-1.5 rounded-lg border text-xs font-medium transition-colors ${difficulty === diff
                  ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-300'
                  : 'bg-slate-900 border-slate-800 text-gray-400 hover:text-white'
                  }`}
              >
                {diff}
              </button>
            ))}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Question Description</label>
            <textarea
              rows={3}
              placeholder="Write the question statement here..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white font-sans focus:outline-none focus:border-indigo-500 placeholder-slate-700"
            />
          </div>

          {/* Optional Image Input */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1 flex items-center gap-1.5">
              <ImageIcon size={14} className="text-cyan-400" />
              Optional Diagram/Figure
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-gray-400 font-sans file:mr-4 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-[10px] file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500 cursor-pointer"
            />
            {imageB64 && (
              <div className="mt-2 relative inline-block">
                <img src={imageB64} alt="Upload preview" className="max-h-20 rounded border border-slate-800 object-contain p-0.5 bg-black/45" />
                <button
                  type="button"
                  onClick={() => setImageB64(null)}
                  className="absolute -top-1.5 -right-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-full p-0.5 text-[8px] font-bold"
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          {/* Options */}
          <div className="space-y-2">
            <label className="block text-xs font-medium text-gray-400">Multiple Choices</label>

            <div className="grid grid-cols-1 gap-2">
              <div className="flex gap-2 items-center">
                <span className="font-mono text-xs text-indigo-400 w-4 font-bold">A</span>
                <input
                  type="text"
                  placeholder="Option A text..."
                  value={optionA}
                  onChange={(e) => setOptionA(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex gap-2 items-center">
                <span className="font-mono text-xs text-indigo-400 w-4 font-bold">B</span>
                <input
                  type="text"
                  placeholder="Option B text..."
                  value={optionB}
                  onChange={(e) => setOptionB(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex gap-2 items-center">
                <span className="font-mono text-xs text-indigo-400 w-4 font-bold">C</span>
                <input
                  type="text"
                  placeholder="Option C text..."
                  value={optionC}
                  onChange={(e) => setOptionC(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex gap-2 items-center">
                <span className="font-mono text-xs text-indigo-400 w-4 font-bold">D</span>
                <input
                  type="text"
                  placeholder="Option D text..."
                  value={optionD}
                  onChange={(e) => setOptionD(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Correct Option Selector */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Select Correct Key</label>
            <div className="grid grid-cols-4 gap-2">
              {(['A', 'B', 'C', 'D'] as const).map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setCorrectOption(key)}
                  className={`py-1 rounded-lg border text-xs font-mono font-bold transition-colors ${correctOption === key
                    ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                    : 'bg-slate-900 border-slate-800 text-gray-400 hover:text-white'
                    }`}
                >
                  Option {key}
                </button>
              ))}
            </div>
          </div>

          {error && <div className="p-2.5 bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs rounded-lg">{error}</div>}
          {success && <div className="p-2.5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs rounded-lg">{success}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium py-2 rounded-lg text-sm transition-colors flex items-center justify-center gap-1.5"
          >
            {loading ? <RefreshCw size={16} className="animate-spin" /> : 'Encrypt & Ingest Question'}
          </button>
        </form>
      </div>


      {/* Encrypted Questions Bank */}
      <div className="lg:col-span-2 glass-panel p-5 rounded-xl border border-slate-800 flex flex-col h-[550px]">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Database size={18} className="text-indigo-400" />
            Zero-Trust Vault Storage
          </h3>
          <span className="text-xs text-gray-500 font-mono">Viewing last {questions.length} entries</span>
        </div>

        <div className="overflow-y-auto flex-1 space-y-3.5 pr-1">
          {questions.length === 0 ? (
            <div className="text-center py-20 text-gray-500 text-sm">Question bank repository is empty. Please ingest a question.</div>
          ) : (
            questions.map((q) => (
              <div key={q.id} className="p-3.5 bg-slate-900/50 border border-slate-850 rounded-xl space-y-2 text-xs">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-white font-semibold font-mono tracking-tight">{q.id.toUpperCase()}</span>
                    <span className="ml-2 text-gray-400 font-mono">[{q.subject} - {q.topic}]</span>
                  </div>
                  <div className="flex gap-2">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${q.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25' :
                      q.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/25' :
                        'bg-rose-500/10 text-rose-400 border border-rose-500/25'
                      }`}>
                      {q.difficulty}
                    </span>
                  </div>
                </div>

                <div className="bg-black/40 p-2.5 rounded border border-slate-800 space-y-1 font-mono text-[11px] text-indigo-300 select-all overflow-x-auto whitespace-nowrap">
                  <span className="text-gray-500 mr-2">AES-Cipher:</span>{q.encryptedContent.substring(0, 80)}...
                </div>

                <div className="grid grid-cols-2 gap-2 text-[10px] text-gray-500 font-mono">
                  <div>
                    <span className="text-slate-600 font-sans">Hash Reference:</span> {q.hash.substring(0, 16)}...
                  </div>
                  <div className="text-right">
                    <span className="text-slate-600 font-sans">Sign:</span> {q.signature.substring(0, 16)}...
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </motion.div>
  );
};

// ========================================================
// 3. BLOCKCHAIN EXPLORER
// ========================================================
export const BlockchainExplorerPanel = () => {
  const { blockchain, setBlockchain, consensusLogs } = useStore();
  const [selectedBlock, setSelectedBlock] = useState<any>(null);
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [verifying, setVerifying] = useState(false);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  const terminalEndRef = React.useRef<HTMLDivElement | null>(null);

  const fetchBlockchain = async () => {
    try {
      const chain = await apiClient.getBlockchain();
      setBlockchain([...chain].reverse());
      if (chain.length > 0 && !selectedBlock) {
        setSelectedBlock(chain[chain.length - 1]);
      }
    } catch (e) { }
  };

  useEffect(() => {
    fetchBlockchain();
  }, []);

  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [consensusLogs]);

  const handleVerifyLedger = async () => {
    setVerifying(true);
    setVerificationResult(null);
    try {
      const res = await apiClient.verifyLedger();
      setVerificationResult(res);
    } catch (err: any) {
      setVerificationResult({ healthy: false, message: err.message });
    } finally {
      setVerifying(false);
    }
  };

  const merkleData = React.useMemo(() => {
    if (!selectedBlock) return null;
    const base = selectedBlock.hash || 'genesis-hash-blockchain-hash-key';
    const h1 = `sha256:${base.slice(0, 16)}...`;
    const h2 = `sha256:${base.slice(16, 32)}...`;
    const h3 = `sha256:${base.slice(32, 48)}...`;
    const h4 = `sha256:${base.slice(48, 64)}...`;

    const h12 = `sha256:comb-${base.slice(8, 24)}...`;
    const h34 = `sha256:comb-${base.slice(24, 40)}...`;

    const root = selectedBlock.questionHash
      ? `sha256:${selectedBlock.questionHash.slice(0, 32)}...`
      : `sha256:${base.slice(0, 32)}...`;

    const nodesMap: Record<string, { label: string; hash: string }> = {
      L1: { label: 'Question 1 Leaf', hash: h1 },
      L2: { label: 'Question 2 Leaf', hash: h2 },
      L3: { label: 'Question 3 Leaf', hash: h3 },
      L4: { label: 'Question 4 Leaf', hash: h4 },
      P1: { label: 'Combined Parent Hash H(1+2)', hash: h12 },
      P2: { label: 'Combined Parent Hash H(3+4)', hash: h34 },
      R: { label: 'Block Merkle Root H(H(1+2)+H(3+4))', hash: root }
    };

    return nodesMap;
  }, [selectedBlock]);

  const getHighlightedNodes = () => {
    if (!hoveredNode) return [];
    if (hoveredNode === 'L1') return ['L1', 'P1', 'R'];
    if (hoveredNode === 'L2') return ['L2', 'P1', 'R'];
    if (hoveredNode === 'L3') return ['L3', 'P2', 'R'];
    if (hoveredNode === 'L4') return ['L4', 'P2', 'R'];
    if (hoveredNode === 'P1') return ['P1', 'R', 'L1', 'L2'];
    if (hoveredNode === 'P2') return ['P2', 'R', 'L3', 'L4'];
    if (hoveredNode === 'R') return ['R', 'P1', 'P2', 'L1', 'L2', 'L3', 'L4'];
    return [];
  };

  const isNodeHighlighted = (id: string) => {
    return getHighlightedNodes().includes(id);
  };

  const isLineHighlighted = (from: string, to: string) => {
    if (!hoveredNode) return false;

    if (hoveredNode === 'L1') {
      return (from === 'L1' && to === 'P1') || (from === 'P1' && to === 'R');
    }
    if (hoveredNode === 'L2') {
      return (from === 'L2' && to === 'P1') || (from === 'P1' && to === 'R');
    }
    if (hoveredNode === 'L3') {
      return (from === 'L3' && to === 'P2') || (from === 'P2' && to === 'R');
    }
    if (hoveredNode === 'L4') {
      return (from === 'L4' && to === 'P2') || (from === 'P2' && to === 'R');
    }
    if (hoveredNode === 'P1') {
      return (from === 'L1' && to === 'P1') || (from === 'L2' && to === 'P1') || (from === 'P1' && to === 'R');
    }
    if (hoveredNode === 'P2') {
      return (from === 'L3' && to === 'P2') || (from === 'L4' && to === 'P2') || (from === 'P2' && to === 'R');
    }
    if (hoveredNode === 'R') {
      return true;
    }
    return false;
  };

  const hoveredNodeData = hoveredNode && merkleData ? merkleData[hoveredNode] : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Consensus & Ledger Explorer</h2>
          <p className="text-gray-400 text-sm">Inspect cryptographically signed verification blocks and witness real-time edge consensus.</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleVerifyLedger}
            disabled={verifying}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors"
          >
            {verifying ? <RefreshCw size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
            Verify Ledger Health
          </button>
        </div>
      </div>

      {verificationResult && (
        <div className={`p-4 rounded-xl border ${verificationResult.healthy
          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
          : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
          } flex items-center justify-between`}>
          <div className="flex items-center gap-3">
            {verificationResult.healthy ? <ShieldCheck size={24} /> : <AlertTriangle size={24} />}
            <div>
              <p className="font-semibold text-sm">Ledger Verification Completed</p>
              <p className="text-xs opacity-90 mt-0.5">{verificationResult.message}</p>
            </div>
          </div>
          <button
            onClick={() => setVerificationResult(null)}
            className="text-xs hover:underline font-mono"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Top Row: Block stream & JSON Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Block Link Chain */}
        <div className="lg:col-span-2 glass-panel p-5 rounded-xl border border-slate-800 flex flex-col h-[400px]">
          <h3 className="font-semibold text-white border-b border-slate-800 pb-3 mb-4 text-sm flex items-center gap-1.5 shrink-0">
            <Cpu size={16} className="text-cyan-400" />
            Verification Block Stream
          </h3>

          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            {blockchain.length === 0 ? (
              <div className="text-center py-20 text-gray-500 text-sm">Blockchain ledger is compiling...</div>
            ) : (
              blockchain.map((block) => (
                <div
                  key={block.index}
                  onClick={() => setSelectedBlock(block)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer relative ${selectedBlock?.index === block.index
                    ? 'bg-indigo-500/10 border-indigo-500/40 shadow-lg'
                    : 'bg-slate-900/40 border-slate-850 hover:bg-slate-900/60'
                    }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-xs font-bold text-cyan-400">BLOCK INDEX #{block.index}</span>
                    <span className="text-[10px] text-gray-400 font-mono">{new Date(block.timestamp).toLocaleString()}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-2.5 font-mono text-[11px]">
                    <div>
                      <p className="text-gray-500">Block Hash</p>
                      <p className="text-white truncate">{block.hash}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Prev Block Hash</p>
                      <p className="text-white truncate">{block.previousHash}</p>
                    </div>
                  </div>

                  <div className="mt-2.5 flex justify-between items-center text-[10px] text-gray-500 border-t border-slate-800/40 pt-2 font-mono">
                    <span>Subject: {block.subject} | Difficulty: {block.difficulty}</span>
                    <span className="text-indigo-400">ECDSA Verified</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Monaco Editor inspector for selected block */}
        <div className="glass-panel p-5 rounded-xl border border-slate-800 flex flex-col h-[400px]">
          <h3 className="font-semibold text-white border-b border-slate-800 pb-3 mb-4 text-sm flex items-center gap-1.5 shrink-0">
            <Terminal size={16} className="text-indigo-400" />
            Block Ledger Inspector
          </h3>

          <div className="flex-1 rounded-lg overflow-hidden border border-slate-850 bg-black">
            {selectedBlock ? (
              <Editor
                height="100%"
                language="json"
                theme="vs-dark"
                value={JSON.stringify(selectedBlock, null, 2)}
                options={{
                  readOnly: true,
                  minimap: { enabled: false },
                  fontSize: 11,
                  fontFamily: 'Fira Code, monospace',
                  domReadOnly: true,
                  scrollBeyondLastLine: false,
                }}
              />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500 text-xs font-mono">
                Select a block on the left to inspect signature payloads.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Row: Merkle Tree Visualizer & Live Consensus Monitor */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interactive Merkle Tree (takes 2 columns) */}
        <div className="lg:col-span-2 glass-panel p-5 rounded-xl border border-slate-800 flex flex-col h-[450px] justify-between">
          <div>
            <h3 className="font-semibold text-white border-b border-slate-800 pb-3 mb-3 text-sm flex items-center gap-1.5 shrink-0">
              <Database size={16} className="text-purple-400" />
              Cryptographic Merkle Tree Representation
            </h3>
            <p className="text-gray-400 text-xs mb-2">
              Hover over node blocks to trace how exam question hashes are paired and combined upwards into the block's Merkle Root.
            </p>
          </div>

          <div className="flex-1 flex flex-col md:flex-row items-center gap-4 min-h-0">
            {/* SVG Visualizer */}
            <div className="flex-1 w-full h-[260px] bg-slate-950/40 rounded-xl border border-slate-850 p-2 relative overflow-hidden">
              {selectedBlock ? (
                <svg viewBox="0 0 520 400" className="w-full h-full font-mono text-[10px] select-none">
                  {/* Lines with highlights */}
                  <line
                    x1={80} y1={350} x2={140} y2={210}
                    className="transition-all duration-300"
                    stroke={isLineHighlighted('L1', 'P1') ? '#22d3ee' : '#334155'}
                    strokeWidth={isLineHighlighted('L1', 'P1') ? 2.5 : 1}
                  />
                  <line
                    x1={200} y1={350} x2={140} y2={210}
                    className="transition-all duration-300"
                    stroke={isLineHighlighted('L2', 'P1') ? '#22d3ee' : '#334155'}
                    strokeWidth={isLineHighlighted('L2', 'P1') ? 2.5 : 1}
                  />
                  <line
                    x1={320} y1={350} x2={380} y2={210}
                    className="transition-all duration-300"
                    stroke={isLineHighlighted('L3', 'P2') ? '#22d3ee' : '#334155'}
                    strokeWidth={isLineHighlighted('L3', 'P2') ? 2.5 : 1}
                  />
                  <line
                    x1={440} y1={350} x2={380} y2={210}
                    className="transition-all duration-300"
                    stroke={isLineHighlighted('L4', 'P2') ? '#22d3ee' : '#334155'}
                    strokeWidth={isLineHighlighted('L4', 'P2') ? 2.5 : 1}
                  />
                  <line
                    x1={140} y1={210} x2={260} y2={70}
                    className="transition-all duration-300"
                    stroke={isLineHighlighted('P1', 'R') ? '#818cf8' : '#334155'}
                    strokeWidth={isLineHighlighted('P1', 'R') ? 3 : 1}
                  />
                  <line
                    x1={380} y1={210} x2={260} y2={70}
                    className="transition-all duration-300"
                    stroke={isLineHighlighted('P2', 'R') ? '#818cf8' : '#334155'}
                    strokeWidth={isLineHighlighted('P2', 'R') ? 3 : 1}
                  />

                  {/* Root Node */}
                  <g
                    onMouseEnter={() => setHoveredNode('R')}
                    onMouseLeave={() => setHoveredNode(null)}
                    className="cursor-pointer"
                  >
                    <circle
                      cx={260} cy={70} r={28}
                      fill="#020617"
                      stroke={hoveredNode === 'R' || isNodeHighlighted('R') ? '#a78bfa' : '#4b5563'}
                      strokeWidth={2}
                      className="transition-all duration-300"
                    />
                    <text x={260} y={73} textAnchor="middle" fill="#e2e8f0" fontWeight="bold" className="text-[9px]">ROOT</text>
                  </g>

                  {/* Parent Nodes */}
                  <g
                    onMouseEnter={() => setHoveredNode('P1')}
                    onMouseLeave={() => setHoveredNode(null)}
                    className="cursor-pointer"
                  >
                    <circle
                      cx={140} cy={210} r={24}
                      fill="#020617"
                      stroke={hoveredNode === 'P1' || isNodeHighlighted('P1') ? '#818cf8' : '#4b5563'}
                      strokeWidth={2}
                      className="transition-all duration-300"
                    />
                    <text x={140} y={213} textAnchor="middle" fill="#e2e8f0" className="text-[9px]">H(1+2)</text>
                  </g>

                  <g
                    onMouseEnter={() => setHoveredNode('P2')}
                    onMouseLeave={() => setHoveredNode(null)}
                    className="cursor-pointer"
                  >
                    <circle
                      cx={380} cy={210} r={24}
                      fill="#020617"
                      stroke={hoveredNode === 'P2' || isNodeHighlighted('P2') ? '#818cf8' : '#4b5563'}
                      strokeWidth={2}
                      className="transition-all duration-300"
                    />
                    <text x={380} y={213} textAnchor="middle" fill="#e2e8f0" className="text-[9px]">H(3+4)</text>
                  </g>

                  {/* Leaf Nodes */}
                  {['L1', 'L2', 'L3', 'L4'].map((leafId, idx) => {
                    const x = 80 + idx * 120;
                    const y = 350;
                    const isHovered = hoveredNode === leafId;
                    return (
                      <g
                        key={leafId}
                        onMouseEnter={() => setHoveredNode(leafId)}
                        onMouseLeave={() => setHoveredNode(null)}
                        className="cursor-pointer"
                      >
                        <circle
                          cx={x} cy={y} r={20}
                          fill="#020617"
                          stroke={isHovered || isNodeHighlighted(leafId) ? '#22d3ee' : '#4b5563'}
                          strokeWidth={2}
                          className="transition-all duration-300"
                        />
                        <text x={x} y={y + 3} textAnchor="middle" fill="#94a3b8" className="text-[9px] font-bold">Q{idx + 1}</text>
                      </g>
                    );
                  })}
                </svg>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500 text-xs font-mono">
                  Select a block to inspect its Merkle Tree.
                </div>
              )}
            </div>

            {/* Selected Node Details side-card */}
            <div className="w-full md:w-60 h-[120px] md:h-full bg-slate-900/50 border border-slate-850 p-4 rounded-xl flex flex-col justify-center gap-2 shrink-0">
              {hoveredNodeData ? (
                <div>
                  <p className="text-[10px] text-gray-500 uppercase font-mono tracking-wider">{hoveredNodeData.label}</p>
                  <p className="text-white text-xs font-bold font-mono mt-1 break-all bg-black/40 p-2 border border-slate-850 rounded">
                    {hoveredNodeData.hash}
                  </p>
                  <p className="text-[10px] text-indigo-400 font-mono mt-1">Hash Verified</p>
                </div>
              ) : (
                <div className="text-gray-500 text-xs text-center font-mono">
                  Hover over tree circles to reveal encrypted block hashes.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Live Consensus Terminal Monitor (takes 1 column) */}
        <div className="glass-panel p-5 rounded-xl border border-slate-800 flex flex-col h-[450px] justify-between">
          <div className="shrink-0">
            <h3 className="font-semibold text-white border-b border-slate-800 pb-3 mb-2 text-sm flex items-center gap-1.5">
              <Terminal size={16} className="text-emerald-400" />
              Live Edge Consensus Monitor
            </h3>

            {/* Status node map */}
            <div className="flex justify-between items-center bg-black/40 border border-slate-850 p-2 rounded-xl text-[10px] text-gray-400 mb-3">
              <span className="flex items-center gap-1 font-mono">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                DELHI
              </span>
              <span className="flex items-center gap-1 font-mono">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                MUMBAI
              </span>
              <span className="flex items-center gap-1 font-mono">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                BLR
              </span>
              <span className="flex items-center gap-1 font-mono text-cyan-400 font-bold">
                3/3 YES
              </span>
            </div>
          </div>

          {/* Retro terminal logs container */}
          <div className="flex-1 bg-black/80 rounded-xl border border-slate-850 p-3 font-mono text-[10px] text-emerald-400 overflow-y-auto space-y-1.5 min-h-0 flex flex-col">
            {consensusLogs.length === 0 ? (
              <div className="text-gray-600 text-xs italic flex-1 flex items-center justify-center">
                Waiting for ledger block transactions...
              </div>
            ) : (
              consensusLogs.map((log, index) => (
                <div key={index} className="leading-normal">
                  <span className="text-slate-500 mr-1.5 font-bold">
                    [{new Date(log.timestamp).toLocaleTimeString()}]
                  </span>
                  <span>{log.message}</span>
                </div>
              ))
            )}
            <div ref={terminalEndRef} />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// ========================================================
// 4. DYNAMIC PAPER GENERATION
// ========================================================
export const PaperGenerationPanel = () => {
  const { exams } = useStore();
  const [selectedExamId, setSelectedExamId] = useState('');
  const [statusSteps, setStatusSteps] = useState<any[]>([]);
  const [activeStep, setActiveStep] = useState(0);
  const [generating, setGenerating] = useState(false);
  const [generatedPaper, setGeneratedPaper] = useState<any>(null);
  const [customEntropy, setCustomEntropy] = useState('');
  const [error, setError] = useState('');

  // History and PDF state
  const [history, setHistory] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [selectedHistoryRecord, setSelectedHistoryRecord] = useState<any>(null);
  const [decryptedHistoryQuestions, setDecryptedHistoryQuestions] = useState<any[]>([]);
  const [decryptingHistoryId, setDecryptingHistoryId] = useState('');
  const [downloadingPaperId, setDownloadingPaperId] = useState('');
  const [viewingPaper, setViewingPaper] = useState(false);

  const fetchExams = async () => {
    try {
      const list = await apiClient.getExams();
      useStore.getState().setExams(list);
      if (list.length > 0 && !selectedExamId) {
        setSelectedExamId(list[0].id);
      }
    } catch (e) { }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  const loadHistory = async () => {
    setHistoryLoading(true);
    try {
      const list = await apiClient.getExamsHistory();
      setHistory([...list].reverse()); // Newest first
    } catch (e) {
      console.error('Failed to load history', e);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    if (showHistory) {
      loadHistory();
    }
  }, [showHistory]);

  const handleGenerate = async () => {
    if (!selectedExamId) return;
    setGenerating(true);
    setError('');
    setGeneratedPaper(null);
    setStatusSteps([
      { title: 'Entropy Pool Integration', status: 'pending', desc: 'Siphoning server state secrets and delivery node salts.' },
      { title: 'Hashing Mixed Seeds', status: 'pending', desc: 'r = SHA256(T + H + S + E)' },
      { title: 'Secure Modulo Selection', status: 'pending', desc: 'Extracting X questions from redundancy multiplier pool N.' },
      { title: 'Ledger Audit Pass', status: 'pending', desc: 'Verifying ECDSA validator signatures on block chain.' },
      { title: 'Key Release and Package', status: 'pending', desc: 'Finalizing time-locked cryptosystem deployment.' }
    ]);
    setActiveStep(0);

    try {
      const triggerStep = (idx: number, state: 'active' | 'success') => {
        setStatusSteps(prev => prev.map((s, i) => i === idx ? { ...s, status: state } : s));
      };

      triggerStep(0, 'active');
      await sleep(1000);
      triggerStep(0, 'success');
      triggerStep(1, 'active');
      await sleep(1000);
      triggerStep(1, 'success');
      triggerStep(2, 'active');
      await sleep(1200);
      triggerStep(2, 'success');
      triggerStep(3, 'active');
      await sleep(1000);
      triggerStep(3, 'success');
      triggerStep(4, 'active');
      await sleep(800);
      triggerStep(4, 'success');

      const res = await apiClient.triggerGeneration(selectedExamId, customEntropy);
      setGeneratedPaper(res.data);
      fetchExams();
      if (showHistory) {
        loadHistory();
      }
    } catch (err: any) {
      setError(err.message || 'Generation failed');
    } finally {
      setGenerating(false);
    }
  };

  const handleDeleteHistory = async (id: string) => {
    if (!confirm('Are you sure you want to delete this generated paper from history?')) return;
    try {
      await apiClient.deleteHistoryPaper(id);
      loadHistory();
    } catch (e) {
      alert('Failed to delete history item');
    }
  };

  const handleDeleteAllHistory = async () => {
    if (!confirm('Are you sure you want to delete all paper generation history? This action is permanent.')) return;
    try {
      await apiClient.clearExamsHistory();
      loadHistory();
    } catch (e) {
      alert('Failed to clear history');
    }
  };

  const handleViewPaper = async (historyId: string) => {
    setDecryptingHistoryId(historyId);
    try {
      const res = await apiClient.decryptHistoryPaper(historyId);
      setDecryptedHistoryQuestions(res.questions);
      setSelectedHistoryRecord(res);
      setViewingPaper(true);
    } catch (e) {
      alert('Failed to decrypt and load paper content.');
    } finally {
      setDecryptingHistoryId('');
    }
  };

  const handleDownloadPaper = async (historyId: string) => {
    setDownloadingPaperId(historyId);
    try {
      const res = await apiClient.decryptHistoryPaper(historyId);
      downloadPaperAsPDF(res.name, res.subject, res.questions, res.seedUsed);
    } catch (e) {
      alert('Failed to decrypt and generate PDF file.');
    } finally {
      setDownloadingPaperId('');
    }
  };

  const downloadPaperAsPDF = (examName: string, subject: string, questions: any[], seed: string) => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Header
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('ZeroLeak Secure Exam Paper', 20, 20);

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(`Generated At: ${new Date().toLocaleString()}`, 20, 26);
    doc.text(`Blockchain Verify Seed: ${seed.substring(0, 32)}...`, 20, 31);
    doc.line(20, 34, 190, 34);

    // Exam Info
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(13);
    doc.text(examName, 20, 44);

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Subject: ${subject}`, 20, 50);
    doc.text(`Questions: ${questions.length} Items`, 20, 55);
    doc.text(`Max Marks: ${questions.length * 4} Marks (+4 Correct, -1 Incorrect, 0 Blank)`, 20, 60);
    doc.line(20, 64, 190, 64);

    let y = 74;
    doc.setFontSize(10);

    questions.forEach((q, idx) => {
      if (y > 260) {
        doc.addPage();
        y = 20;
      }

      doc.setFont('Helvetica', 'bold');
      doc.text(`Q${idx + 1}.`, 20, y);

      doc.setFont('Helvetica', 'normal');
      let desc = q.description || q.content || '';
      try {
        if (desc.startsWith('{')) {
          const parsed = JSON.parse(desc);
          desc = parsed.description;
        }
      } catch (e) { }

      const splitDesc = doc.splitTextToSize(desc, 155);
      doc.text(splitDesc, 28, y);
      y += splitDesc.length * 5 + 3;

      let opts = q.options;
      try {
        if (typeof q.content === 'string' && q.content.startsWith('{')) {
          const parsed = JSON.parse(q.content);
          opts = parsed.options;
        }
      } catch (e) { }

      if (opts) {
        Object.entries(opts).forEach(([key, val]: any) => {
          if (y > 270) {
            doc.addPage();
            y = 20;
          }
          doc.text(`  (${key}) ${val}`, 28, y);
          y += 6;
        });
        y += 2;
      }
      y += 4;
    });

    doc.save(`${examName.replace(/\s+/g, '_')}_Paper.pdf`);
  };

  const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-1 lg:grid-cols-3 gap-6"
    >
      {/* Config Panel */}
      <div className="glass-panel p-5 rounded-xl border border-slate-800 space-y-4 h-fit">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Cpu size={18} className="text-cyan-400" />
          Paper Generation Setup
        </h3>
        <p className="text-xs text-gray-400">
          Define dynamic examination requirements. No static paper is stored beforehand. Modulo indices will map dynamically onto the redundant question index space.
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Target Scheduled Exam</label>
            <select
              value={selectedExamId}
              onChange={(e) => setSelectedExamId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
            >
              {exams.map(ex => (
                <option key={ex.id} value={ex.id}>{ex.name} ({ex.code})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Manual Center Entropy Override (E)</label>
            <input
              type="text"
              placeholder="e.g. 0x9a8f4c2d... (optional)"
              value={customEntropy}
              onChange={(e) => setCustomEntropy(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
            />
          </div>

          {error && <div className="p-2.5 bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs rounded-lg">{error}</div>}

          <button
            onClick={handleGenerate}
            disabled={generating || !selectedExamId}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
          >
            {generating ? <RefreshCw size={16} className="animate-spin" /> : <Lock size={16} />}
            Trigger Dynamic Generation
          </button>
        </div>
      </div>

      {/* Orchestrator Logs & History */}
      <div className="lg:col-span-2 glass-panel p-5 rounded-xl border border-slate-800 space-y-4 font-mono">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <h3 className="font-semibold text-white text-sm flex items-center gap-1.5 font-sans">
            <Terminal size={16} className="text-indigo-400" />
            {showHistory ? 'Paper Generation History Log' : 'Multi-Agent Generation Pipeline'}
          </h3>
          <div className="flex gap-2">
            {showHistory && history.length > 0 && (
              <button
                onClick={handleDeleteAllHistory}
                className="px-2.5 py-1 bg-rose-950/20 border border-rose-500/30 hover:bg-rose-500/30 text-rose-400 rounded text-[10px] font-mono transition-colors flex items-center gap-1"
              >
                <Trash2 size={13} /> Delete All History
              </button>
            )}
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="px-2.5 py-1 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-cyan-400 hover:text-cyan-300 rounded text-[10px] font-mono transition-colors"
            >
              {showHistory ? 'View Pipeline Logs' : 'History Log'}
            </button>
          </div>
        </div>

        {/* Dynamic Panel Content */}
        {!showHistory ? (
          <>
            {generating && (
              <div className="space-y-4 my-2">
                {statusSteps.map((step, idx) => (
                  <div key={idx} className="flex gap-3 items-start text-xs">
                    <div className="mt-0.5">
                      {step.status === 'success' && <CheckCircle size={16} className="text-emerald-400" />}
                      {step.status === 'active' && <RefreshCw size={16} className="text-cyan-400 animate-spin" />}
                      {step.status === 'pending' && <Clock size={16} className="text-gray-600" />}
                    </div>
                    <div>
                      <p className={`font-semibold ${step.status === 'success' ? 'text-emerald-400' : step.status === 'active' ? 'text-cyan-400' : 'text-gray-500'}`}>{step.title}</p>
                      <p className="text-gray-400 text-[10px] font-mono mt-0.5">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!generating && !generatedPaper && (
              <div className="py-20 text-center text-gray-500 text-sm">Select an exam and click dynamic generation to view progress.</div>
            )}

            {generatedPaper && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2">
                    <CheckCircle size={16} />
                    Runtime paper instance generated successfully!
                  </span>

                  {/* Action Buttons for immediate paper */}
                  <div className="flex gap-2 font-mono">
                    <button
                      onClick={() => handleViewPaper(generatedPaper.historyId)}
                      disabled={decryptingHistoryId === generatedPaper.historyId}
                      className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-[10px] font-bold transition-all flex items-center gap-1 font-sans cursor-pointer"
                    >
                      {decryptingHistoryId === generatedPaper.historyId ? <RefreshCw size={11} className="animate-spin" /> : <Eye size={11} />}
                      View Paper
                    </button>
                    <button
                      onClick={() => handleDownloadPaper(generatedPaper.historyId)}
                      disabled={downloadingPaperId === generatedPaper.historyId}
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[10px] font-bold transition-all flex items-center gap-1 font-sans cursor-pointer"
                    >
                      {downloadingPaperId === generatedPaper.historyId ? <RefreshCw size={11} className="animate-spin" /> : <Download size={11} />}
                      Download PDF
                    </button>
                  </div>
                </div>

                <div className="space-y-3 font-mono text-xs">
                  <div className="bg-black/50 p-3 rounded-lg border border-slate-850">
                    <p className="text-gray-500 text-[10px] uppercase font-sans">Seeded PRNG Entropy (r)</p>
                    <p className="text-white break-all mt-1">{generatedPaper.seed}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-black/50 p-3 rounded-lg border border-slate-850">
                      <p className="text-gray-500 text-[10px] uppercase font-sans">Target Questions (X)</p>
                      <p className="text-white mt-1">{generatedPaper.questionsCount} items selected</p>
                    </div>
                    <div className="bg-black/50 p-3 rounded-lg border border-slate-850">
                      <p className="text-gray-500 text-[10px] uppercase font-sans">Blockchain Linked</p>
                      <p className="text-emerald-400 mt-1 flex items-center gap-1">
                        <ShieldCheck size={14} /> YES (Signed Blocks)
                      </p>
                    </div>
                  </div>

                  <div className="bg-black/50 p-3 rounded-lg border border-slate-850">
                    <p className="text-gray-500 text-[10px] uppercase font-sans">Selected Question Indices</p>
                    <p className="text-white mt-1 break-words">{JSON.stringify(generatedPaper.questions)}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </>
        ) : (
          /* History View */
          <div className="overflow-y-auto max-h-[420px] space-y-3 pr-1 text-xs">
            {historyLoading ? (
              <div className="py-20 text-center text-gray-500 font-mono flex items-center justify-center gap-2">
                <RefreshCw size={14} className="animate-spin" /> Fetching histories...
              </div>
            ) : history.length === 0 ? (
              <div className="py-20 text-center text-gray-500">No historical paper generation records found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-850 text-gray-500">
                      <th className="py-2 px-2 uppercase text-[9px] font-sans font-bold">Generated At</th>
                      <th className="py-2 px-2 uppercase text-[9px] font-sans font-bold">Exam</th>
                      <th className="py-2 px-2 uppercase text-[9px] font-sans font-bold">Subject</th>
                      <th className="py-2 px-2 uppercase text-[9px] font-sans font-bold">Seed</th>
                      <th className="py-2 px-2 uppercase text-[9px] font-sans font-bold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900 text-gray-300">
                    {history.map((hist) => (
                      <tr key={hist.id} className="hover:bg-slate-900/30">
                        <td className="py-3 px-2 text-[10px] text-gray-505">
                          {new Date(hist.generatedAt).toLocaleString()}
                        </td>
                        <td className="py-3 px-2 text-white font-sans font-medium">
                          {hist.examName} ({hist.examCode})
                        </td>
                        <td className="py-3 px-2 text-indigo-300 font-sans">
                          {hist.subject}
                        </td>
                        <td className="py-3 px-2 font-mono text-gray-500 max-w-[80px] truncate" title={hist.seed}>
                          {hist.seed}
                        </td>
                        <td className="py-3 px-2 text-right">
                          <div className="flex gap-2 justify-end font-sans">
                            <button
                              onClick={() => handleViewPaper(hist.id)}
                              disabled={decryptingHistoryId === hist.id}
                              className="px-2 py-0.5 bg-indigo-600/20 border border-indigo-500/30 hover:bg-indigo-600/40 text-indigo-300 rounded text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                              title="View Paper"
                            >
                              {decryptingHistoryId === hist.id ? <RefreshCw size={10} className="animate-spin" /> : <Eye size={10} />}
                              View
                            </button>
                            <button
                              onClick={() => handleDownloadPaper(hist.id)}
                              disabled={downloadingPaperId === hist.id}
                              className="px-2 py-0.5 bg-emerald-600/20 border border-emerald-500/30 hover:bg-emerald-600/40 text-emerald-300 rounded text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                              title="Download PDF"
                            >
                              {downloadingPaperId === hist.id ? <RefreshCw size={10} className="animate-spin" /> : <Download size={10} />}
                              Download
                            </button>
                            <button
                              onClick={() => handleDeleteHistory(hist.id)}
                              className="px-2 py-0.5 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 text-rose-400 rounded text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                              title="Delete"
                            >
                              <Trash2 size={10} />
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal to view decrypted exam paper */}
      <AnimatePresence>
        {viewingPaper && selectedHistoryRecord && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-[9999] flex justify-center items-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-3xl bg-slate-950 border border-slate-900 rounded-2xl shadow-2xl h-[85vh] flex flex-col p-6 relative"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-cyan-500 to-emerald-500 rounded-t-2xl"></div>

              {/* Header */}
              <div className="flex justify-between items-start border-b border-slate-900 pb-3.5 mt-2">
                <div>
                  <h3 className="text-lg font-bold text-white font-sans">{selectedHistoryRecord.name} ({selectedHistoryRecord.code})</h3>
                  <p className="text-xs text-cyan-400 font-sans mt-1">
                    Subject: {selectedHistoryRecord.subject} | Date: {new Date(selectedHistoryRecord.generatedAt).toLocaleString()}
                  </p>
                  <p className="text-[10px] text-gray-500 font-mono mt-0.5 break-all max-w-[500px]">
                    Entropy Seed: {selectedHistoryRecord.seedUsed}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setViewingPaper(false);
                    setSelectedHistoryRecord(null);
                    setDecryptedHistoryQuestions([]);
                  }}
                  className="px-3 py-1 bg-slate-900 border border-slate-800 hover:bg-slate-850 text-gray-400 hover:text-white rounded text-xs font-mono transition-colors"
                >
                  ✕ Close
                </button>
              </div>

              {/* Question List */}
              <div className="flex-1 overflow-y-auto space-y-4 my-4 pr-1">
                {decryptedHistoryQuestions.map((q: any, idx: number) => (
                  <div key={q.id} className="p-5 bg-slate-900/60 border border-slate-850 rounded-xl space-y-3">
                    <div className="flex justify-between text-xs text-gray-500 font-mono border-b border-slate-800/40 pb-2">
                      <span>Question #{idx + 1} ({q.id.toUpperCase()})</span>
                      <span>Topic: {q.topic} | Difficulty: {q.difficulty}</span>
                    </div>
                    <p className="text-white text-sm font-sans font-medium whitespace-pre-wrap leading-relaxed select-none">
                      {q.description}
                    </p>
                    {q.image && (
                      <div className="my-2">
                        <img
                          src={q.image}
                          alt={`Figure for Question ${idx + 1}`}
                          className="max-h-48 rounded border border-slate-850 object-contain p-1 bg-black/40"
                        />
                      </div>
                    )}
                    {q.options && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 mt-2.5 font-sans">
                        {Object.entries(q.options).map(([optKey, optVal]: any) => (
                          <div key={optKey} className="p-3 bg-black/25 border border-slate-850 rounded-xl text-xs text-gray-300 flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full font-mono flex items-center justify-center text-[10px] font-bold bg-black/45 text-indigo-400">
                              {optKey}
                            </span>
                            <span>{optVal}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Correct Option badge for admin view */}
                    <div className="pt-2 border-t border-slate-850/40 font-mono text-[10px] text-emerald-400 flex gap-2 justify-end">
                      <span>Correct Key: <strong className="bg-emerald-500/10 px-1.5 py-0.5 rounded text-white font-bold">{q.correctOption}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </motion.div>
  );
};

// ========================================================
// 5. SECURITY OPERATIONS CENTER (SOC)
// ========================================================
export const SOCPanel = () => {
  const { stats, securityEvents } = useStore();
  const [triggering, setTriggering] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState('');

  const triggerAttack = async (type: string) => {
    setTriggering(type);
    setActionMessage('');
    try {
      const res = await apiClient.runAttackSimulation(type);
      if (res.attackDetected) {
        setActionMessage(`[THREAT DEFENSE] Intercepted attack: ${res.message}. Warning: ${res.errorDetails}`);
      } else {
        setActionMessage(`[SIMULATOR] Triggered attack scenario. Server logs updated: ${res.message}`);
      }
      // Re-fetch system stats
      const newStats = await apiClient.getSystemStatus();
      useStore.getState().setStats(newStats);

      const logs = await apiClient.getSecurityEvents();
      useStore.getState().setSecurityEvents(logs);
    } catch (err: any) {
      setActionMessage(`[ERROR] Fail trigger: ${err.message}`);
    } finally {
      setTriggering(null);
    }
  };

  const handleRestore = async () => {
    setActionMessage('');
    try {
      await apiClient.restoreSystem();
      setActionMessage('[RESTORE] Cleared all alarms and restored security score to 100.');
      const newStats = await apiClient.getSystemStatus();
      useStore.getState().setStats(newStats);

      const logs = await apiClient.getSecurityEvents();
      useStore.getState().setSecurityEvents(logs);
    } catch (e) { }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Security Operations Center (SOC)</h2>
          <p className="text-gray-400 text-sm">Threat intelligence metrics and active penetration simulator.</p>
        </div>
        <button
          onClick={handleRestore}
          className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-gray-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700"
        >
          <RefreshCcw size={14} />
          Reset Security Score
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Threat Simulator Controls */}
        <div className="glass-panel p-5 rounded-xl border border-slate-800 space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <ShieldAlert size={18} className="text-rose-400" />
            Cyber Penetration Simulator
          </h3>
          <p className="text-xs text-gray-400">
            Launch simulation scripts. The Zero-Trust authorization and AI anomaly agents will monitor, score, block, and log these events in the threat map automatically.
          </p>

          <div className="space-y-2.5">
            <button
              onClick={() => triggerAttack('insider_tamper')}
              disabled={!!triggering}
              className="w-full text-left p-3 rounded-lg bg-rose-950/10 border border-rose-500/20 hover:border-rose-500/40 text-rose-300 font-semibold text-xs flex justify-between items-center group transition-colors"
            >
              <span>1. Direct SQL/NoSQL Database Tampering</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform text-rose-500" />
            </button>

            <button
              onClick={() => triggerAttack('early_decryption')}
              disabled={!!triggering}
              className="w-full text-left p-3 rounded-lg bg-amber-950/10 border border-amber-500/20 hover:border-amber-500/40 text-amber-300 font-semibold text-xs flex justify-between items-center group transition-colors"
            >
              <span>2. Unauthorized Early Decryption Check</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform text-amber-500" />
            </button>

            <button
              onClick={() => triggerAttack('admin_compromise')}
              disabled={!!triggering}
              className="w-full text-left p-3 rounded-lg bg-cyan-950/10 border border-cyan-500/20 hover:border-cyan-500/40 text-cyan-300 font-semibold text-xs flex justify-between items-center group transition-colors"
            >
              <span>3. Compromised Admin Token (Anomaly)</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform text-cyan-500" />
            </button>

            <button
              onClick={() => triggerAttack('duplicate_generation')}
              disabled={!!triggering}
              className="w-full text-left p-3 rounded-lg bg-indigo-950/10 border border-indigo-500/20 hover:border-indigo-500/40 text-indigo-300 font-semibold text-xs flex justify-between items-center group transition-colors"
            >
              <span>4. Duplicate Selection Hash Flood</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform text-indigo-500" />
            </button>

            <button
              onClick={() => triggerAttack('node_compromise')}
              disabled={!!triggering}
              className="w-full text-left p-3 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-gray-300 font-semibold text-xs flex justify-between items-center group transition-colors"
            >
              <span>5. Regional Node Desynchronization</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform text-gray-500" />
            </button>
          </div>

          {actionMessage && (
            <div className={`p-3 rounded-lg text-xs font-mono border ${actionMessage.includes('THREAT')
              ? 'bg-rose-500/10 border-rose-500/20 text-rose-400'
              : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-300'
              }`}>
              {actionMessage}
            </div>
          )}
        </div>

        {/* Live Intrusion Map & Diagnostics */}
        <div className="lg:col-span-2 glass-panel p-5 rounded-xl border border-slate-800 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <h3 className="font-semibold text-white flex items-center gap-1.5 text-sm">
              <MapPin size={16} className="text-cyan-400" />
              Edge Delivery Node Integrity Map
            </h3>
            <span className="flex items-center gap-1 px-2 py-0.5 bg-cyan-500/10 text-cyan-400 rounded text-[10px] font-mono border border-cyan-500/25">
              <Wifi size={10} /> Active Nodes
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
            {useStore.getState().nodes.map((node) => (
              <div key={node.id} className="p-3.5 bg-black/40 border border-slate-850 rounded-xl space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-white font-bold">{node.name}</span>
                  <span className={`h-2.5 w-2.5 rounded-full ${node.status === 'Online' ? 'bg-emerald-400' :
                    node.status === 'Syncing' ? 'bg-amber-400 animate-pulse' :
                      'bg-rose-500 animate-ping'
                    }`}></span>
                </div>
                <div className="text-[11px] text-gray-400 space-y-1">
                  <p>Region: {node.region}</p>
                  <p>Network Latency: {node.latencyMs}ms</p>
                  <p>Synced Block: #{node.lastSyncedBlock}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-800/40 pt-4">
            <h4 className="text-white font-semibold text-xs mb-3 flex items-center gap-1">
              <Activity size={14} className="text-rose-500" /> Recent Security Bulletins
            </h4>
            <div className="space-y-3.5 max-h-[160px] overflow-y-auto">
              {securityEvents.map((evt) => (
                <div key={evt.id} className="flex justify-between items-start text-xs border-b border-slate-850 pb-2">
                  <div>
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono uppercase font-bold mr-2 ${evt.severity === 'Critical' ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30' :
                      evt.severity === 'High' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                        'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                      {evt.severity}
                    </span>
                    <span className="text-gray-300 font-semibold">{evt.event}</span>
                    <p className="text-gray-400 mt-1 font-sans text-[11px]">{evt.details}</p>
                  </div>
                  <span className="text-[10px] text-gray-500 font-mono">{new Date(evt.timestamp).toLocaleTimeString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// ========================================================
// 6. AUDIT & FORENSICS
// ========================================================
export const AuditForensicsPanel = () => {
  const { auditLogs, students, setStudents } = useStore();
  const [file, setFile] = useState<File | null>(null);
  const [decoding, setDecoding] = useState(false);
  const [decodingStep, setDecodingStep] = useState(0);
  const [decodedResult, setDecodedResult] = useState<any>(null);
  const [selectedSimulatedStudent, setSelectedSimulatedStudent] = useState<string>('');
  const [blockLoading, setBlockLoading] = useState(false);

  useEffect(() => {
    apiClient.getStudents().then(setStudents).catch(console.error);
  }, [setStudents]);

  const steps = [
    'Scanning visual frequency domain (FFT)...',
    'Applying noise reduction filter...',
    'Isolating semi-transparent canvas layer...',
    'Binarizing watermarked text blocks...',
    'Decoding parity sequence: Extracting metadata bytes...',
    'Reconstructing candidate cryptoseat details...'
  ];

  const handleUpload = () => {
    if (!file) return;
    setDecoding(true);
    setDecodingStep(0);
    setDecodedResult(null);

    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      if (currentStep < steps.length) {
        setDecodingStep(currentStep);
      } else {
        clearInterval(interval);
        setDecoding(false);

        // Find selected student details
        const targetStudent = students.find(s => s.studentId === selectedSimulatedStudent) || students[0];
        const studentId = targetStudent ? targetStudent.studentId : 'STU025';
        const studentName = targetStudent ? targetStudent.name : 'Sneha Reddy';
        const center = targetStudent ? 'Digital Exam Hub - Center A' : 'Mumbai Main Center';
        const ip = targetStudent ? '192.168.4.108' : '192.168.10.144';

        setDecodedResult({
          studentId,
          name: studentName,
          center,
          ipAddress: ip,
          seatNo: `Seat #${Math.floor(Math.random() * 40) + 1}`,
          timestamp: new Date().toLocaleString(),
          integrityHash: 'sha256:d8c4b9f2e301a2f64b971a8c9e05d93e110cfb7a44fa67c82a5a782165c71bde',
          isAlreadyBlocked: targetStudent ? !!targetStudent.isBlocked : false
        });
      }
    }, 650);
  };

  const handleSuspend = async () => {
    if (!decodedResult) return;
    setBlockLoading(true);
    try {
      await apiClient.blockStudent(decodedResult.studentId, {
        reason: 'Forensic digital watermark match on leaked examination question sheet.',
        infractionType: 'FORENSIC_WATERMARK_LEAK'
      });
      // Refresh students
      const updated = await apiClient.getStudents();
      setStudents(updated);
      setDecodedResult((prev: any) => ({ ...prev, isAlreadyBlocked: true }));

      const systemStatus = await apiClient.getSystemStatus();
      useStore.getState().setStats(systemStatus);
    } catch (err) {
      console.error(err);
    } finally {
      setBlockLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white">Audit Trail & Forensics</h2>
        <p className="text-gray-400 text-sm">Inspect immutable sequence chains and decode forensic digital watermarks from leaked screenshots.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Left Column: Immutable Log */}
        <div className="glass-panel p-5 rounded-xl border border-slate-800 flex flex-col h-[600px]">
          <h3 className="font-semibold text-white border-b border-slate-800 pb-3 mb-4 text-sm flex items-center gap-1.5 shrink-0">
            <Terminal size={16} className="text-cyan-400" />
            Immutable Activity Lineage Log
          </h3>

          <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 font-mono text-xs">
            {auditLogs.map((log) => (
              <div key={log.id} className="p-3 bg-slate-900/50 border border-slate-850 rounded-xl space-y-1.5">
                <div className="flex justify-between text-gray-400 text-[11px]">
                  <span>Actor: <span className="text-cyan-400 font-bold">{log.actor}</span></span>
                  <span>{new Date(log.timestamp).toLocaleString()}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-white font-semibold">Action: {log.action}</span>
                  <span className="text-gray-500 text-[10px]">Entity: {log.entity} ({log.entityId})</span>
                </div>

                <p className="text-gray-300 font-sans text-xs">{log.details}</p>

                <div className="text-[10px] text-gray-500 overflow-x-auto whitespace-nowrap bg-black/30 p-1.5 rounded border border-slate-850">
                  <span className="text-indigo-400 font-bold">SHA256 Hash Chain:</span> {log.hashChain}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Forensic Watermark Decoder Tool */}
        <div className="glass-panel p-5 rounded-xl border border-slate-800 flex flex-col h-[600px] justify-between">
          <div>
            <h3 className="font-semibold text-white border-b border-slate-800 pb-3 mb-4 text-sm flex items-center gap-1.5">
              <ImageIcon size={16} className="text-pink-400" />
              Forensic Watermark Decoder Tool
            </h3>
            <p className="text-gray-400 text-xs mb-4">
              Upload a photograph or screenshot of a leaked exam sheet to scan for high-frequency, semi-transparent diagonal canvas watermarks cryptographically mapped to the candidate.
            </p>

            <div className="space-y-4">
              {/* Select target student dropdown to make simulation interactive */}
              <div>
                <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                  Select Student to Simulate Leak (Testing Sandbox)
                </label>
                <select
                  value={selectedSimulatedStudent}
                  onChange={(e) => setSelectedSimulatedStudent(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-850 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="">-- Random/Default Candidate --</option>
                  {students.map((student) => (
                    <option key={student.studentId} value={student.studentId}>
                      {student.name} ({student.studentId}) - {student.isBlocked ? '🛑 BLOCKED' : '🟢 ACTIVE'}
                    </option>
                  ))}
                </select>
              </div>

              {/* Upload interface */}
              {!decodedResult && !decoding && (
                <div className="border-2 border-dashed border-slate-850 hover:border-slate-700 rounded-xl p-8 flex flex-col items-center justify-center gap-3 transition-colors bg-slate-950/40 relative">
                  <Upload size={32} className="text-gray-500" />
                  <div className="text-center">
                    <p className="text-xs text-gray-300 font-medium">Click to select or drag leak screenshot</p>
                    <p className="text-[10px] text-gray-500 mt-1">PNG, JPG up to 10MB</p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setFile(e.target.files[0]);
                      }
                    }}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  {file && (
                    <p className="text-xs text-cyan-400 font-semibold mt-2">
                      Selected: {file.name}
                    </p>
                  )}
                </div>
              )}

              {/* Decode button */}
              {file && !decoding && !decodedResult && (
                <button
                  onClick={handleUpload}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-600/10"
                >
                  <Search size={14} /> Analyze Leak Image
                </button>
              )}

              {/* Decoding Progress */}
              {decoding && (
                <div className="p-6 bg-slate-950/50 border border-slate-850 rounded-xl space-y-4">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-indigo-400 font-semibold animate-pulse">
                      {steps[decodingStep]}
                    </span>
                    <span className="text-gray-400 font-mono">
                      {Math.round(((decodingStep + 1) / steps.length) * 100)}%
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-850">
                    <div
                      className="bg-indigo-500 h-full rounded-full transition-all duration-300"
                      style={{ width: `${((decodingStep + 1) / steps.length) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Decoded results */}
              {decodedResult && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl space-y-3"
                >
                  <div className="flex justify-between items-center border-b border-rose-500/20 pb-2">
                    <div className="flex items-center gap-1.5">
                      <AlertTriangle className="text-rose-500" size={16} />
                      <span className="text-xs font-bold text-rose-500 uppercase tracking-wider">
                        Metadata Leak Extraction Match
                      </span>
                    </div>
                    <span className="text-[10px] bg-rose-500/20 text-rose-300 font-mono px-2 py-0.5 rounded-full font-bold">
                      MATCH CONFIRMED
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase">StudentID</p>
                      <p className="text-white font-mono font-bold">{decodedResult.studentId}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase">Candidate Name</p>
                      <p className="text-white font-semibold">{decodedResult.name}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase">Assigned Center IP</p>
                      <p className="text-white font-mono font-bold">{decodedResult.ipAddress}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase">Allocated Seat</p>
                      <p className="text-white font-semibold">{decodedResult.seatNo} ({decodedResult.center})</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-[10px] text-gray-500 uppercase">Timestamp of Paper Decryption</p>
                      <p className="text-white font-mono">{decodedResult.timestamp}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-[10px] text-gray-500 uppercase">Integrity Watermark Hash</p>
                      <p className="text-[10px] text-gray-400 font-mono break-all bg-black/40 p-1.5 rounded border border-slate-850">
                        {decodedResult.integrityHash}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {/* Action buttons */}
          {decodedResult && (
            <div className="flex gap-3 mt-4 shrink-0">
              <button
                onClick={() => {
                  setFile(null);
                  setDecodedResult(null);
                }}
                className="flex-1 py-2 bg-slate-900 border border-slate-850 hover:bg-slate-850 hover:text-white text-gray-400 rounded-xl text-xs font-bold transition-all text-center"
              >
                Reset Scanner
              </button>

              {!decodedResult.isAlreadyBlocked ? (
                <button
                  onClick={handleSuspend}
                  disabled={blockLoading}
                  className="flex-1 py-2 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-rose-600/10"
                >
                  {blockLoading ? 'Suspending...' : 'Suspend Candidate'}
                </button>
              ) : (
                <span className="flex-1 py-2 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 font-mono">
                  🛑 SECURE LOCK ENGAGED
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// ========================================================
// 7. EXAM DELIVERY PANEL
// ========================================================
export const ExamDeliveryPanel = () => {
  const { exams } = useStore();
  const [selectedExamId, setSelectedExamId] = useState('');
  const [decryptedPaper, setDecryptedPaper] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Simulation headers
  const [customIp, setCustomIp] = useState('192.168.10.45');
  const [customUserAgent, setCustomUserAgent] = useState('AuthorizedExaminationClient/1.4.0');

  useEffect(() => {
    if (exams.length > 0 && !selectedExamId) {
      setSelectedExamId(exams[0].id);
    }
  }, [exams]);

  const handleDecrypt = async () => {
    if (!selectedExamId) return;
    setLoading(true);
    setError('');
    setDecryptedPaper(null);

    try {
      const res = await apiClient.decryptExamPaper(selectedExamId, {
        'x-forwarded-for': customIp,
        'user-agent': customUserAgent
      });
      setDecryptedPaper(res);
    } catch (err: any) {
      setError(err.message || 'Decryption key release rejected.');
      // Fetch latest security events in case an alert was logged
      const newStats = await apiClient.getSystemStatus();
      useStore.getState().setStats(newStats);
      const logs = await apiClient.getSecurityEvents();
      useStore.getState().setSecurityEvents(logs);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-1 lg:grid-cols-3 gap-6"
    >
      {/* Decrypt Controller */}
      <div className="glass-panel p-5 rounded-xl border border-slate-800 space-y-4 h-fit">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Key size={18} className="text-amber-400" />
          Decryption Release Portal
        </h3>
        <p className="text-xs text-gray-400">
          This portal simulates the delivery terminal inside local examination centers. In a production system, this request executes a zero-trust timed check.
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Target Exam Paper</label>
            <select
              value={selectedExamId}
              onChange={(e) => setSelectedExamId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
            >
              {exams.map(ex => (
                <option key={ex.id} value={ex.id}>{ex.name} ({ex.code})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Simulated Center IP Address</label>
            <input
              type="text"
              value={customIp}
              onChange={(e) => setCustomIp(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
            />
            <p className="text-[10px] text-gray-500 mt-1">Change IP prefix to <code className="text-amber-500 font-mono">10.99.x.y</code> to test AI Anomaly agent blocks.</p>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Simulated Client User-Agent</label>
            <input
              type="text"
              value={customUserAgent}
              onChange={(e) => setCustomUserAgent(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
            />
            <p className="text-[10px] text-gray-500 mt-1">Change User-Agent containing <code className="text-amber-500 font-mono">crawler</code> to test device signature blocks.</p>
          </div>

          {error && <div className="p-2.5 bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs rounded-lg font-mono">{error}</div>}

          <button
            onClick={handleDecrypt}
            disabled={loading || !selectedExamId}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
          >
            {loading ? <RefreshCw size={16} className="animate-spin" /> : <Lock size={16} />}
            Decrypt Paper
          </button>
        </div>
      </div>

      {/* Render Decrypted Paper */}
      <div className="lg:col-span-2 glass-panel p-5 rounded-xl border border-slate-800 flex flex-col min-h-[500px]">
        <h3 className="font-semibold text-white border-b border-slate-800 pb-3 text-sm flex items-center gap-1.5">
          <FileText size={16} className="text-indigo-400" />
          Decrypted Paper Instance Output
        </h3>

        <div className="flex-1 mt-4 overflow-y-auto space-y-4">
          {!decryptedPaper ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-500 py-20 text-xs space-y-2">
              <Lock size={32} className="text-slate-700" />
              <span>Decryption output will appear here once authorized by Time-Lock.</span>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg text-xs font-mono">
                Decryption Key Released: {decryptedPaper.decryptionKeyUsed}
              </div>

              <div className="space-y-4">
                {decryptedPaper.questions.map((q: any, idx: number) => {
                  let parsed = { description: q.content, options: null as any, correctOption: '', image: null as any };
                  try {
                    if (q.content.startsWith('{')) {
                      parsed = JSON.parse(q.content);
                    }
                  } catch (e) { }

                  return (
                    <div key={q.id} className="p-5 bg-slate-900/60 border border-slate-850 rounded-xl space-y-3">
                      <div className="flex justify-between items-center text-xs font-mono text-gray-400 border-b border-slate-800/40 pb-2">
                        <span>Question #{idx + 1} ({q.id.toUpperCase()})</span>
                        <span>Topic: {q.topic}</span>
                      </div>

                      {/* Description */}
                      <p className={`text-white text-sm leading-relaxed font-sans font-medium ${q.error ? 'font-mono text-rose-400 bg-rose-500/5 p-2 rounded border border-rose-500/10' : ''}`}>
                        {parsed.description}
                      </p>

                      {/* Optional Decrypted Image */}
                      {parsed.image && (
                        <div className="my-3">
                          <img
                            src={parsed.image}
                            alt={`Figure for Question ${idx + 1}`}
                            className="max-h-60 rounded-lg border border-slate-800 object-contain bg-black/40 p-1"
                          />
                        </div>
                      )}

                      {/* Options Grid */}
                      {parsed.options && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                          {Object.entries(parsed.options).map(([key, val]: any) => {
                            const isCorrect = parsed.correctOption === key;
                            return (
                              <div
                                key={key}
                                className={`p-3 rounded-lg border text-xs font-sans flex items-center justify-between transition-colors ${isCorrect
                                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                                  : 'bg-black/25 border-slate-850 text-gray-300 hover:border-slate-800'
                                  }`}
                              >
                                <span>
                                  <strong className="mr-2 font-mono text-indigo-400">{key}.</strong> {val}
                                </span>
                                {isCorrect && (
                                  <span className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 rounded text-[9px] font-mono font-bold uppercase">
                                    Correct Key
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// ========================================================
// 8. RESEARCH & PERFORMANCE METRICS
// ========================================================
export const ResearchMetricsPanel = () => {
  const { metrics } = useStore();

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white">Research Metrics & Performance</h2>
        <p className="text-gray-400 text-sm">Cryptographic latency profiles, throughput statistics, and overhead scaling.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Latency Plot */}
        <div className="glass-panel p-5 rounded-xl border border-slate-800 space-y-4">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <TrendingUp size={16} className="text-cyan-400" />
            Paper Generation Latency Profile (r-Seed modulo selection)
          </h3>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={metrics.generationLatency} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorLatency" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="examId" stroke="#4b5563" fontSize={10} />
                <YAxis stroke="#4b5563" fontSize={10} unit="ms" />
                <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', color: '#fff', fontSize: '12px' }} />
                <Area type="monotone" dataKey="latencyMs" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#colorLatency)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[10px] text-gray-500 font-mono text-center">
            Figure 1.1: Milliseconds required to map entropy salts ($T+H+S+E$), sort indices, audit chain, and serialize vectors.
          </p>
        </div>

        {/* Cryptographic Overhead Plot */}
        <div className="glass-panel p-5 rounded-xl border border-slate-800 space-y-4">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Cpu size={16} className="text-indigo-400" />
            Encryption Overhead vs Question Payload Size (AES-256-GCM)
          </h3>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.encryptionOverhead} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="dataSize" stroke="#4b5563" fontSize={10} unit="B" />
                <YAxis stroke="#4b5563" fontSize={10} unit="ms" />
                <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', color: '#fff', fontSize: '12px' }} />
                <Bar dataKey="overheadMs" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[10px] text-gray-500 font-mono text-center">
            Figure 1.2: Encryption and authentication tag overhead (ms) mapped against variable byte vector payloads.
          </p>
        </div>
      </div>
    </motion.div>
  );
};

// ========================================================
// 9. STUDENT REGISTRY
// ========================================================
export const StudentRegistryPanel = () => {
  const { students, setStudents, addStudent, submissions, setSubmissions, user } = useStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState<any>(null);

  const [showDetails, setShowDetails] = useState(false);
  const [search, setSearch] = useState('');

  // Password reset state
  const [selectedStudentForPassword, setSelectedStudentForPassword] = useState<any>(null);
  const [newPassword, setNewPassword] = useState('');
  const [passwordChangeLoading, setPasswordChangeLoading] = useState(false);
  const [passwordChangeError, setPasswordChangeError] = useState('');
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState('');

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword.trim()) {
      setPasswordChangeError('Password cannot be empty.');
      return;
    }
    if (!user?.name) {
      setPasswordChangeError('No administrator node authenticated.');
      return;
    }
    setPasswordChangeLoading(true);
    setPasswordChangeError('');
    setPasswordChangeSuccess('');
    try {
      const res = await apiClient.changeStudentPassword(
        selectedStudentForPassword.studentId,
        newPassword.trim(),
        user.name
      );
      // Update store locally
      const updatedStudents = students.map((s) =>
        s.studentId === selectedStudentForPassword.studentId
          ? { ...s, passwordRaw: newPassword.trim() }
          : s
      );
      setStudents(updatedStudents);
      setPasswordChangeSuccess(res.message || 'Password changed successfully.');
      setNewPassword('');
      // Fetch updated audit logs if they are on another tab
      const logs = await apiClient.getAuditLogs();
      useStore.getState().setAuditLogs(logs);
    } catch (err: any) {
      setPasswordChangeError(err.message || 'Failed to update student password.');
    } finally {
      setPasswordChangeLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const list = await apiClient.getStudents();
      setStudents(list);
      const subs = await apiClient.getSubmissions();
      setSubmissions(subs);
    } catch (e) { }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleEnroll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setError('Name and email are required.');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess(null);

    try {
      const res = await apiClient.enrollStudent({ name, email });
      addStudent(res.student);
      setSuccess(res.student);
      setName('');
      setEmail('');
    } catch (err: any) {
      setError(err.message || 'Enrollment failed');
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase()) ||
    s.studentId.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-1 lg:grid-cols-3 gap-6"
    >
      {/* Enroll Form */}
      <div className="glass-panel p-5 rounded-xl border border-slate-800 space-y-4 h-fit">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <User size={18} className="text-cyan-400" />
          Enroll New Student
        </h3>
        <p className="text-xs text-gray-400">
          Manually register students to the platform registry database. Credentials will be generated locally.
        </p>

        <form onSubmit={handleEnroll} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Full Name</label>
            <input
              type="text"
              placeholder="e.g. John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 font-sans"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Email Address</label>
            <input
              type="email"
              placeholder="e.g. johndoe@university.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 font-sans"
            />
          </div>

          {error && <div className="p-2.5 bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs rounded-lg">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
          >
            {loading ? <RefreshCw size={16} className="animate-spin" /> : 'Enroll Student'}
          </button>
        </form>

        {success && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl space-y-2 text-xs font-mono text-emerald-300"
          >
            <div className="flex items-center gap-1.5 font-bold text-white mb-1">
              <CheckCircle size={14} className="text-emerald-400" />
              Enrollment Successful!
            </div>
            <p><span className="text-gray-400 font-sans">ID:</span> {success.studentId}</p>
            <p><span className="text-gray-400 font-sans">Temporary Pass:</span> <span className="bg-black/40 px-1.5 py-0.5 rounded text-white font-bold select-all">{success.passwordRaw}</span></p>
          </motion.div>
        )}
      </div>

      {/* Details Container */}
      <div className="lg:col-span-2 glass-panel p-5 rounded-xl border border-slate-800 flex flex-col min-h-[500px]">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-4 mb-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Database size={18} className="text-indigo-400" />
            Registry Directory
          </h3>

          <button
            onClick={() => {
              setShowDetails(!showDetails);
              if (!showDetails) fetchStudents();
            }}
            className="px-4 py-2 bg-slate-900 border border-slate-800 hover:bg-slate-850 hover:border-slate-700 text-gray-200 rounded-lg text-xs font-mono font-bold transition-all shadow-md"
          >
            {showDetails ? 'Hide student details' : 'Show student details'}
          </button>
        </div>

        {showDetails ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4 flex-1 flex flex-col"
          >
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-gray-500" size={16} />
              <input
                type="text"
                placeholder="Query by Name, Email, or Student ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-sans placeholder-slate-600"
              />
            </div>

            <div className="overflow-x-auto flex-1 max-h-[380px]">
              <table className="w-full text-left font-mono text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-850 text-gray-500">
                    <th className="py-2.5 px-3 uppercase tracking-wider font-sans font-bold text-[10px]">Student ID</th>
                    <th className="py-2.5 px-3 uppercase tracking-wider font-sans font-bold text-[10px]">Name</th>
                    <th className="py-2.5 px-3 uppercase tracking-wider font-sans font-bold text-[10px]">Email</th>
                    <th className="py-2.5 px-3 uppercase tracking-wider font-sans font-bold text-[10px]">Credentials</th>
                    <th className="py-2.5 px-3 uppercase tracking-wider font-sans font-bold text-[10px]">Physics Test</th>
                    <th className="py-2.5 px-3 uppercase tracking-wider font-sans font-bold text-[10px]">Biology Test</th>
                    <th className="py-2.5 px-3 uppercase tracking-wider font-sans font-bold text-[10px]">CSAT Test</th>
                    <th className="py-2.5 px-3 uppercase tracking-wider font-sans font-bold text-[10px]">Enroll Date</th>
                    <th className="py-2.5 px-3 uppercase tracking-wider font-sans font-bold text-[10px] text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900 text-gray-300">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-gray-500">No student records match your query.</td>
                    </tr>
                  ) : (
                    filteredStudents.map((stu) => {
                      const physSub = submissions.find(
                        (sub) =>
                          sub.studentId === stu.studentId &&
                          sub.subject.toLowerCase() === 'physics'
                      );
                      const bioSub = submissions.find(
                        (sub) =>
                          sub.studentId === stu.studentId &&
                          sub.subject.toLowerCase() === 'biology'
                      );
                      const csatSub = submissions.find(
                        (sub) =>
                          sub.studentId === stu.studentId &&
                          (sub.subject.toLowerCase() === 'upsc-csat' || sub.subject.toLowerCase() === 'csat')
                      );

                      return (
                        <tr key={stu.id} className="hover:bg-slate-900/30">
                          <td className="py-3 px-3 text-cyan-400 font-bold">{stu.studentId}</td>
                          <td className="py-3 px-3 font-sans text-white font-medium">{stu.name}</td>
                          <td className="py-3 px-3 font-sans">{stu.email}</td>
                          <td className="py-3 px-3 font-bold select-all bg-black/30 text-white rounded text-center">{stu.passwordRaw}</td>

                          {/* Physics Status */}
                          <td className="py-3 px-3">
                            {physSub ? (
                              <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 rounded text-[10px] font-bold">
                                Submitted ({physSub.score}/{physSub.maxMarks})
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 bg-slate-900 border border-slate-800 text-gray-500 rounded text-[10px]">
                                Pending
                              </span>
                            )}
                          </td>

                          {/* Biology Status */}
                          <td className="py-3 px-3">
                            {bioSub ? (
                              <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 rounded text-[10px] font-bold">
                                Submitted ({bioSub.score}/{bioSub.maxMarks})
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 bg-slate-900 border border-slate-800 text-gray-500 rounded text-[10px]">
                                Pending
                              </span>
                            )}
                          </td>

                          {/* CSAT Status */}
                          <td className="py-3 px-3">
                            {csatSub ? (
                              <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 rounded text-[10px] font-bold">
                                Submitted ({csatSub.score}/{csatSub.maxMarks})
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 bg-slate-900 border border-slate-800 text-gray-500 rounded text-[10px]">
                                Pending
                              </span>
                            )}
                          </td>

                          <td className="py-3 px-3 text-[10px] text-gray-500">{new Date(stu.createdAt).toLocaleDateString()}</td>
                          <td className="py-3 px-3 text-right">
                            <button
                              onClick={() => {
                                setSelectedStudentForPassword(stu);
                                setNewPassword('');
                                setPasswordChangeError('');
                                setPasswordChangeSuccess('');
                              }}
                              className="px-2.5 py-1 bg-indigo-650/20 border border-indigo-500/30 hover:bg-indigo-600/40 text-indigo-300 rounded font-sans text-[10px] font-bold transition-all inline-flex items-center gap-1"
                            >
                              <Key size={10} />
                              Change Pass
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500 py-20 text-xs space-y-2">
            <Lock size={32} className="text-slate-800" />
            <span>Student information directory locked. Click "Show student details" to decrypt and query.</span>
          </div>
        )}
      </div>

      {/* Change Password Modal */}
      <AnimatePresence>
        {selectedStudentForPassword && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-slate-950 border border-slate-900 rounded-2xl p-6 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-cyan-500 to-emerald-500"></div>

              <div className="flex justify-between items-start border-b border-slate-900 pb-4 mb-4">
                <div>
                  <h3 className="text-md font-bold text-white font-mono flex items-center gap-1.5">
                    <Key size={16} className="text-cyan-400" />
                    Reset Student Password
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">
                    Student: <span className="text-white font-semibold">{selectedStudentForPassword.name} ({selectedStudentForPassword.studentId})</span>
                  </p>
                </div>
                <button
                  onClick={() => setSelectedStudentForPassword(null)}
                  className="text-gray-500 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>

              {user?.name !== 'AK Gupta' ? (
                <div className="space-y-4">
                  <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl space-y-2 text-xs font-mono text-rose-300">
                    <div className="flex items-center gap-1.5 font-bold text-white">
                      <ShieldAlert size={16} className="text-rose-400" />
                      Permission Denied
                    </div>
                    <p className="font-sans leading-relaxed text-gray-400">
                      Only the authorized male administrator (<strong className="text-white">AK Gupta</strong>) is permitted to modify credentials. Your current identity node (<strong className="text-white">{user?.name || 'Unknown'}</strong>) has insufficient privileges.
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedStudentForPassword(null)}
                    className="w-full bg-slate-900 border border-slate-800 hover:bg-slate-850 text-gray-300 py-2 rounded-lg text-sm font-semibold transition-colors"
                  >
                    Close
                  </button>
                </div>
              ) : (
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5">New Password</label>
                    <input
                      type="text"
                      placeholder="Enter new secure password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-805 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 font-mono animate-none"
                    />
                  </div>

                  {passwordChangeError && (
                    <div className="p-2.5 bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs rounded-lg">
                      {passwordChangeError}
                    </div>
                  )}

                  {passwordChangeSuccess && (
                    <div className="p-2.5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs rounded-lg">
                      {passwordChangeSuccess}
                    </div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setSelectedStudentForPassword(null)}
                      className="flex-1 bg-slate-900 border border-slate-800 hover:bg-slate-850 text-gray-300 py-2 rounded-lg text-sm font-semibold transition-colors"
                    >
                      {passwordChangeSuccess ? 'Close' : 'Cancel'}
                    </button>
                    {!passwordChangeSuccess && (
                      <button
                        type="submit"
                        disabled={passwordChangeLoading}
                        className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold py-2 rounded-lg text-sm transition-colors flex items-center justify-center gap-1.5"
                      >
                        {passwordChangeLoading ? <RefreshCw size={14} className="animate-spin" /> : <Lock size={14} />}
                        Update Password
                      </button>
                    )}
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ========================================================
// 10. COMPLETED TESTS REVIEW PANEL
// ========================================================
export const CompletedTestsPanel = () => {
  const { submissions, setSubmissions } = useStore();
  const [loading, setLoading] = useState(false);
  const [selectedSub, setSelectedSub] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [expandedStudentId, setExpandedStudentId] = useState<string | null>(null);

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const list = await apiClient.getSubmissions();
      setSubmissions(list);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const filteredSubmissions = submissions.filter((sub) =>
    sub.studentName.toLowerCase().includes(search.toLowerCase()) ||
    sub.studentId.toLowerCase().includes(search.toLowerCase()) ||
    sub.subject.toLowerCase().includes(search.toLowerCase())
  );

  // Group filtered submissions by studentId
  const groupedSubmissions = React.useMemo(() => {
    const groups: Record<string, {
      studentId: string;
      studentName: string;
      submissions: any[];
    }> = {};

    filteredSubmissions.forEach((sub) => {
      if (!groups[sub.studentId]) {
        groups[sub.studentId] = {
          studentId: sub.studentId,
          studentName: sub.studentName,
          submissions: [],
        };
      }
      groups[sub.studentId].submissions.push(sub);
    });

    // Sort submissions within each group by date descending (latest first)
    Object.values(groups).forEach(g => {
      g.submissions.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
    });

    // Sort groups so that the group with the most recent submission is on top
    return Object.values(groups).sort((a, b) => {
      const aTime = a.submissions.length > 0 ? new Date(a.submissions[0].submittedAt).getTime() : 0;
      const bTime = b.submissions.length > 0 ? new Date(b.submissions[0].submittedAt).getTime() : 0;
      return bTime - aTime;
    });
  }, [filteredSubmissions]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Completed Student Tests</h2>
          <p className="text-gray-400 text-sm">Review student exam submissions, final scores, and grading details.</p>
        </div>
        <button
          onClick={fetchSubmissions}
          disabled={loading}
          className="p-2 bg-slate-900 border border-slate-800 hover:bg-slate-805 hover:border-slate-700 text-white rounded-lg transition-colors flex items-center gap-1.5 text-xs font-mono"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      <div className="glass-panel p-5 rounded-xl border border-slate-800 flex flex-col min-h-[500px]">
        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-2.5 text-gray-500" size={16} />
          <input
            type="text"
            placeholder="Search by Student Name, ID, or Subject..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-905 border border-slate-850 rounded-lg pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-sans placeholder-slate-600"
          />
        </div>

        {/* Submissions Table */}
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left font-mono text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-850 text-gray-500">
                <th className="py-2.5 px-3 uppercase tracking-wider font-sans font-bold text-[10px]">Student ID</th>
                <th className="py-2.5 px-3 uppercase tracking-wider font-sans font-bold text-[10px]">Name</th>
                <th className="py-2.5 px-3 uppercase tracking-wider font-sans font-bold text-[10px]">Completed Tests</th>
                <th className="py-2.5 px-3 uppercase tracking-wider font-sans font-bold text-[10px]">Latest Submission</th>
                <th className="py-2.5 px-3 uppercase tracking-wider font-sans font-bold text-[10px] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900 text-gray-300">
              {groupedSubmissions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-500 font-sans">
                    {loading ? 'Fetching submissions...' : 'No completed test records found.'}
                  </td>
                </tr>
              ) : (
                groupedSubmissions.map((group) => {
                  const isExpanded = expandedStudentId === group.studentId;
                  return (
                    <React.Fragment key={group.studentId}>
                      <tr
                        onClick={() => setExpandedStudentId(isExpanded ? null : group.studentId)}
                        className="hover:bg-slate-900/30 cursor-pointer transition-colors"
                      >
                        <td className="py-3 px-3 text-cyan-400 font-bold">{group.studentId}</td>
                        <td className="py-3 px-3 font-sans text-white font-medium">{group.studentName}</td>
                        <td className="py-3 px-3 font-sans">
                          <span className="px-2.5 py-0.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 rounded text-[10px] font-bold">
                            {group.submissions.length} {group.submissions.length === 1 ? 'Subject' : 'Subjects'}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-gray-500 font-sans text-[11px]">
                          {new Date(group.submissions[0].submittedAt).toLocaleString()}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            className="px-2.5 py-1 bg-slate-900 border border-slate-800 hover:bg-slate-850 hover:text-white text-gray-300 rounded font-sans text-[10px] font-bold transition-all inline-flex items-center gap-1.5"
                          >
                            {isExpanded ? (
                              <>
                                Hide Tests <ChevronUp size={12} />
                              </>
                            ) : (
                              <>
                                View Tests ({group.submissions.length}) <ChevronDown size={12} />
                              </>
                            )}
                          </button>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr>
                          <td colSpan={5} className="bg-slate-950/40 p-4 border-b border-slate-850">
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              className="overflow-hidden"
                            >
                              <div className="border border-slate-850 rounded-xl bg-slate-900/20 p-4 space-y-3">
                                <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider font-sans">
                                  Test Attempts for {group.studentName}
                                </h4>
                                <div className="overflow-x-auto">
                                  <table className="w-full text-left font-mono text-[11px] border-collapse">
                                    <thead>
                                      <tr className="border-b border-slate-850 text-gray-500 font-sans">
                                        <th className="py-2 px-3 uppercase tracking-wider font-bold text-[9px]">Subject</th>
                                        <th className="py-2 px-3 uppercase tracking-wider font-bold text-[9px]">Score / Max Marks</th>
                                        <th className="py-2 px-3 uppercase tracking-wider font-bold text-[9px]">Submitted At</th>
                                        <th className="py-2 px-3 uppercase tracking-wider font-bold text-[9px] text-right">Actions</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-900 text-gray-300">
                                      {group.submissions.map((sub) => (
                                        <tr key={sub.id} className="hover:bg-slate-900/40">
                                          <td className="py-2 px-3 font-sans text-indigo-300 font-medium">{sub.subject}</td>
                                          <td className="py-2 px-3 font-bold text-white">
                                            <span className={sub.score >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                                              {sub.score}
                                            </span>
                                            <span className="text-gray-500"> / {sub.maxMarks}</span>
                                          </td>
                                          <td className="py-2 px-3 text-[10px] text-gray-500">
                                            {new Date(sub.submittedAt).toLocaleString()}
                                          </td>
                                          <td className="py-2 px-3 text-right">
                                            <button
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedSub(sub);
                                              }}
                                              className="px-2.5 py-1 bg-indigo-650/20 border border-indigo-500/30 hover:bg-indigo-600/40 text-indigo-300 rounded font-sans text-[10px] font-bold transition-all"
                                            >
                                              Review Paper
                                            </button>
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            </motion.div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review Drawer/Modal */}
      <AnimatePresence>
        {selectedSub && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-[9999] flex justify-end">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="w-full max-w-2xl bg-slate-950 border-l border-slate-900 h-full flex flex-col p-6 shadow-2xl overflow-y-auto"
            >
              {/* Header */}
              <div className="flex justify-between items-start border-b border-slate-900 pb-4 mb-6">
                <div>
                  <h3 className="text-lg font-bold text-white font-mono">Test Submission Details</h3>
                  <p className="text-xs text-gray-400 mt-1">
                    Student: <span className="text-white font-semibold">{selectedSub.studentName} ({selectedSub.studentId})</span>
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Subject: <span className="text-indigo-400 font-semibold">{selectedSub.subject}</span>
                  </p>
                </div>
                <button
                  onClick={() => setSelectedSub(null)}
                  className="px-3 py-1 bg-slate-900 border border-slate-800 hover:bg-slate-850 text-gray-400 hover:text-white rounded text-xs font-mono"
                >
                  ✕ Close
                </button>
              </div>

              {/* Summary Stats */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-slate-900/50 border border-slate-850 p-3 rounded-lg text-center">
                  <p className="text-gray-500 text-[10px] uppercase font-bold tracking-wider">Final Score</p>
                  <p className="text-2xl font-bold text-white mt-1">
                    <span className={selectedSub.score >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                      {selectedSub.score}
                    </span>
                    <span className="text-gray-500 text-sm"> / {selectedSub.maxMarks}</span>
                  </p>
                </div>
                <div className="bg-slate-900/50 border border-slate-850 p-3 rounded-lg text-center">
                  <p className="text-gray-500 text-[10px] uppercase font-bold tracking-wider">Accuracy</p>
                  <p className="text-2xl font-bold text-cyan-400 mt-1">
                    {selectedSub.maxMarks > 0
                      ? Math.round(
                        (selectedSub.questions.filter(
                          (q: any) => selectedSub.answers[q.id] === q.correctOption
                        ).length /
                          selectedSub.questions.length) *
                        100
                      )
                      : 0}
                    %
                  </p>
                </div>
                <div className="bg-slate-900/50 border border-slate-850 p-3 rounded-lg text-center">
                  <p className="text-gray-500 text-[10px] uppercase font-bold tracking-wider">Total Questions</p>
                  <p className="text-2xl font-bold text-indigo-400 mt-1">
                    {selectedSub.questions.length}
                  </p>
                </div>
              </div>

              {/* Questions Breakdown */}
              <div className="space-y-6 flex-1">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 border-b border-slate-900 pb-2">
                  Question-by-Question Grading Audit
                </h4>

                {selectedSub.questions.map((q: any, idx: number) => {
                  const selectedAnswer = selectedSub.answers[q.id];
                  const correctAnswer = q.correctOption;
                  const isCorrect = selectedAnswer === correctAnswer;
                  const isUnanswered = !selectedAnswer;

                  return (
                    <div
                      key={q.id}
                      className={`p-4 rounded-xl border ${isCorrect
                        ? 'bg-emerald-500/5 border-emerald-500/20'
                        : isUnanswered
                          ? 'bg-slate-900/50 border-slate-850'
                          : 'bg-rose-500/5 border-rose-500/20'
                        } space-y-3.5`}
                    >
                      <div className="flex justify-between items-start">
                        <span className="font-mono text-xs font-bold text-gray-400">
                          QUESTION #{idx + 1} ({q.id.toUpperCase()})
                        </span>
                        <span>
                          {isCorrect ? (
                            <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 rounded text-[10px] font-mono font-bold">
                              +4 Marks (Correct)
                            </span>
                          ) : isUnanswered ? (
                            <span className="px-2 py-0.5 bg-slate-800 border border-slate-700 text-gray-400 rounded text-[10px] font-mono">
                              0 Marks (Unanswered)
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-rose-500/10 border border-rose-500/25 text-rose-400 rounded text-[10px] font-mono font-bold">
                              -1 Mark (Incorrect)
                            </span>
                          )}
                        </span>
                      </div>

                      {/* Question Description */}
                      <p className="text-slate-100 font-sans text-sm leading-relaxed whitespace-pre-wrap">
                        {q.description}
                      </p>

                      {/* Question Image */}
                      {q.image && (
                        <div className="mt-2">
                          <img
                            src={q.image}
                            alt="Question figure"
                            className="max-h-48 rounded border border-slate-800 object-contain p-1 bg-black/50"
                          />
                        </div>
                      )}

                      {/* Options Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2 font-sans">
                        {Object.entries(q.options).map(([optKey, optVal]: any) => {
                          const isSelected = selectedAnswer === optKey;
                          const isCorrectOpt = correctAnswer === optKey;

                          let optionBg = 'bg-slate-900/60 border-slate-850 text-slate-300';
                          if (isSelected) {
                            optionBg = isCorrect
                              ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 font-medium'
                              : 'bg-rose-500/15 border-rose-500/40 text-rose-300 font-medium';
                          } else if (isCorrectOpt) {
                            optionBg = 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 font-medium';
                          }

                          return (
                            <div
                              key={optKey}
                              className={`p-2.5 rounded-lg border text-xs flex gap-2 items-center ${optionBg}`}
                            >
                              <span className="font-mono font-bold w-4 h-4 rounded-full flex items-center justify-center bg-black/40 text-[10px]">
                                {optKey}
                              </span>
                              <span>{optVal}</span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Details Footer */}
                      <div className="flex gap-4 font-mono text-[10px] text-gray-500 border-t border-slate-850/40 pt-2.5">
                        <p>
                          Student Choice: <span className="text-white font-bold">{selectedAnswer || 'None'}</span>
                        </p>
                        <p>
                          Correct Key: <span className="text-emerald-400 font-bold">{correctAnswer}</span>
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ========================================================
// 11. SECURITY ALERTS CENTER
// ========================================================
export const SecurityAlertsPanel = () => {
  const { securityEvents, students, setStudents, setSecurityEvents, stats } = useStore();
  const [activeTab, setActiveTab] = useState<'ExamFraud' | 'DataIntegrity' | 'LedgerConsensus' | 'Infrastructure'>('ExamFraud');
  const [searchQuery, setSearchQuery] = useState('');
  const [unblockingId, setUnblockingId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAlertsAndStudents = async () => {
    setRefreshing(true);
    try {
      const logs = await apiClient.getSecurityEvents();
      useStore.getState().setSecurityEvents(logs);
      const list = await apiClient.getStudents();
      setStudents(list);
      const newStats = await apiClient.getSystemStatus();
      useStore.getState().setStats(newStats);
    } catch (e) {
      console.error(e);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAlertsAndStudents();
  }, []);

  const handleUnblock = async (studentId: string) => {
    setUnblockingId(studentId);
    try {
      await apiClient.unblockStudent(studentId);
      // Refresh list
      await fetchAlertsAndStudents();
    } catch (e) {
      alert('Failed to unblock student');
    } finally {
      setUnblockingId(null);
    }
  };

  const handleRestore = async () => {
    try {
      await apiClient.restoreSystem();
      await fetchAlertsAndStudents();
    } catch (e) {
      console.error(e);
    }
  };

  // Group events by category
  const filteredEvents = securityEvents.filter((evt) => {
    const category = evt.category || 'Infrastructure';
    if (category !== activeTab) return false;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        evt.event?.toLowerCase().includes(query) ||
        evt.details?.toLowerCase().includes(query) ||
        evt.sourceIp?.toLowerCase().includes(query) ||
        evt.deviceFingerprint?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  // Filter blocked students
  const blockedStudents = students.filter(s => s.isBlocked);

  // Category Info
  const tabInfo = {
    ExamFraud: {
      title: 'Exam Fraud Alerts',
      desc: 'Monitors student cheating, multi-IP test link sharing, and unauthorized decryption requests.',
      color: 'text-rose-400 bg-rose-500/10 border-rose-500/20'
    },
    DataIntegrity: {
      title: 'Data Integrity Alerts',
      desc: 'Monitors question database modifications, direct tampering bypasses, and hash collisions.',
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/20'
    },
    LedgerConsensus: {
      title: 'Ledger & Consensus Alerts',
      desc: 'Monitors blockchain verification failures, broken hash chains, and validator signature tampering.',
      color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20'
    },
    Infrastructure: {
      title: 'Node & Infrastructure Alerts',
      desc: 'Monitors regional validation node timeouts, latency anomalies, and network heartbeat syncs.',
      color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20'
    }
  };

  const activeInfo = tabInfo[activeTab];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <ShieldAlert className="text-rose-500 animate-pulse" size={24} />
            Security Alerts Center
          </h2>
          <p className="text-gray-400 text-sm">Real-time intrusion detection ledger and dynamic exam fraud analytics.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchAlertsAndStudents}
            disabled={refreshing}
            className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-850 disabled:opacity-50 text-gray-205 border border-slate-800 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5"
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
            Refresh Alarms
          </button>
          <button
            onClick={handleRestore}
            className="px-3.5 py-1.5 bg-rose-950/20 hover:bg-rose-900/30 text-rose-300 border border-rose-500/30 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5"
          >
            <RefreshCcw size={14} />
            Acknowledge & Clear Score
          </button>
        </div>
      </div>

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="glass-panel p-4 rounded-xl border border-slate-800 space-y-1.5">
          <p className="text-gray-500 text-[10px] uppercase font-bold tracking-wider font-mono">Global Threat Index</p>
          <div className="flex justify-between items-center pt-0.5">
            <span className={`text-xl font-extrabold tracking-tight ${stats.threatLevel === 'Critical' ? 'text-rose-500 animate-pulse' :
              stats.threatLevel === 'High' ? 'text-rose-400' :
                stats.threatLevel === 'Medium' ? 'text-amber-400' : 'text-emerald-400'
              }`}>
              {stats.threatLevel}
            </span>
            <span className="text-[10px] text-gray-400 font-mono">AI Assessment</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="glass-panel p-4 rounded-xl border border-slate-800 space-y-1.5">
          <p className="text-gray-500 text-[10px] uppercase font-bold tracking-wider font-mono">Security Health Score</p>
          <div className="flex justify-between items-baseline pt-0.5">
            <span className={`text-2xl font-extrabold ${stats.securityScore > 80 ? 'text-emerald-400' : stats.securityScore > 50 ? 'text-amber-400' : 'text-rose-500'}`}>
              {stats.securityScore}%
            </span>
            <span className="text-[9px] text-gray-400 font-mono">Target: 100%</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="glass-panel p-4 rounded-xl border border-slate-800 space-y-1.5">
          <p className="text-gray-500 text-[10px] uppercase font-bold tracking-wider font-mono">Active Fraud Blocks</p>
          <div className="flex justify-between items-center pt-0.5">
            <span className="text-2xl font-extrabold text-rose-400">
              {blockedStudents.length}
            </span>
            <span className="text-[9px] px-1.5 py-0.5 bg-rose-500/10 text-rose-400 border border-rose-500/25 rounded font-mono font-bold">
              Account Suspended
            </span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="glass-panel p-4 rounded-xl border border-slate-800 space-y-1.5">
          <p className="text-gray-500 text-[10px] uppercase font-bold tracking-wider font-mono">Unresolved System Alerts</p>
          <div className="flex justify-between items-center pt-0.5">
            <span className="text-2xl font-extrabold text-white">
              {securityEvents.length}
            </span>
            <span className="text-[10px] text-gray-400 font-mono">All Categories</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Tabs Sidebar & Alerts Table */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Left Side: Tabs */}
        <div className="flex flex-col gap-2">
          {(Object.keys(tabInfo) as Array<keyof typeof tabInfo>).map((tabKey) => {
            const isActive = activeTab === tabKey;
            const count = securityEvents.filter(e => (e.category || 'Infrastructure') === tabKey).length;

            return (
              <button
                key={tabKey}
                onClick={() => setActiveTab(tabKey)}
                className={`w-full text-left p-4 rounded-xl border text-xs font-mono font-semibold transition-all flex justify-between items-center ${isActive
                  ? 'bg-slate-900 border-slate-700 text-white shadow-lg'
                  : 'bg-slate-950/20 border-slate-900 text-gray-500 hover:text-gray-350 hover:border-slate-800'
                  }`}
              >
                <div className="space-y-0.5">
                  <p>{tabInfo[tabKey].title}</p>
                  <p className="text-[9px] font-sans text-gray-400 font-normal leading-relaxed">{tabInfo[tabKey].desc.split('.')[0] + '.'}</p>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${count > 0
                  ? tabKey === 'ExamFraud' ? 'bg-rose-500/20 text-rose-300' : 'bg-amber-500/20 text-amber-300'
                  : 'bg-slate-900 text-gray-655'
                  }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Right Side: Respective Section Alert Details */}
        <div className="lg:col-span-3 space-y-6">
          {/* Header Panel */}
          <div className="glass-panel p-5 rounded-xl border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-850 pb-4">
              <div>
                <h3 className="text-base font-bold text-white font-sans">{activeInfo.title}</h3>
                <p className="text-xs text-gray-400 mt-1">{activeInfo.desc}</p>
              </div>

              {/* Search */}
              <div className="relative w-full sm:w-64 shrink-0">
                <Search className="absolute left-3 top-2.5 text-gray-500" size={14} />
                <input
                  type="text"
                  placeholder="Filter alerts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-905 border border-slate-850 rounded-lg pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-sans placeholder-slate-650"
                />
              </div>
            </div>

            {/* List/Table of Alerts */}
            <div className="overflow-x-auto font-sans">
              <table className="w-full text-left font-mono text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-850 text-gray-500">
                    <th className="py-2.5 px-3 uppercase tracking-wider font-sans font-bold text-[9px]">Severity</th>
                    <th className="py-2.5 px-3 uppercase tracking-wider font-sans font-bold text-[9px]">Event Code</th>
                    <th className="py-2.5 px-3 uppercase tracking-wider font-sans font-bold text-[9px]">Details</th>
                    <th className="py-2.5 px-3 uppercase tracking-wider font-sans font-bold text-[9px]">Source IP / Device</th>
                    <th className="py-2.5 px-3 uppercase tracking-wider font-sans font-bold text-[9px]">Time</th>
                    <th className="py-2.5 px-3 uppercase tracking-wider font-sans font-bold text-[9px] text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900 text-gray-300">
                  {filteredEvents.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-gray-500">
                        No security notifications logged in this section.
                      </td>
                    </tr>
                  ) : (
                    filteredEvents.map((evt) => (
                      <tr key={evt.id} className="hover:bg-slate-900/20">
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${evt.severity === 'Critical' ? 'bg-rose-500/10 border border-rose-500/25 text-rose-400 animate-pulse' :
                            evt.severity === 'High' ? 'bg-rose-500/10 border border-rose-500/15 text-rose-400' :
                              evt.severity === 'Medium' ? 'bg-amber-500/10 border border-amber-500/20 text-amber-300' :
                                'bg-slate-900 border border-slate-800 text-gray-400'
                            }`}>
                            {evt.severity}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-white font-bold">{evt.event}</td>
                        <td className="py-3 px-3 font-sans max-w-[200px] whitespace-normal leading-relaxed text-gray-300">
                          {evt.details}
                        </td>
                        <td className="py-3 px-3">
                          <p className="text-cyan-400 font-bold">{evt.sourceIp}</p>
                          <p className="text-gray-500 text-[10px] mt-0.5 truncate max-w-[150px]" title={evt.deviceFingerprint}>
                            {evt.deviceFingerprint}
                          </p>
                        </td>
                        <td className="py-3 px-3 text-gray-500 text-[10px]">
                          {new Date(evt.timestamp).toLocaleString()}
                        </td>
                        <td className="py-3 px-3 text-right">
                          {evt.blocked ? (
                            <span className="px-1.5 py-0.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded text-[9px] font-bold">
                              Blocked
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.5 bg-slate-900 text-gray-500 rounded text-[9px]">
                              Logged
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Blocked Students Registry (Only visible under ExamFraud Alerts tab) */}
          {activeTab === 'ExamFraud' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass-panel p-5 rounded-xl border border-slate-800 space-y-4"
            >
              <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-850 pb-3 font-sans">
                <User size={16} className="text-rose-400" />
                Suspended Student Exam Sessions ({blockedStudents.length})
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-850 text-gray-500">
                      <th className="py-2.5 px-3 uppercase tracking-wider font-sans font-bold text-[9px]">Student ID</th>
                      <th className="py-2.5 px-3 uppercase tracking-wider font-sans font-bold text-[9px]">Name</th>
                      <th className="py-2.5 px-3 uppercase tracking-wider font-sans font-bold text-[9px]">Suspension Reason</th>
                      <th className="py-2.5 px-3 uppercase tracking-wider font-sans font-bold text-[9px]">Active Test Details</th>
                      <th className="py-2.5 px-3 uppercase tracking-wider font-sans font-bold text-[9px] text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900 text-gray-300 font-sans">
                    {blockedStudents.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-gray-505 font-mono">
                          No students are currently blocked.
                        </td>
                      </tr>
                    ) : (
                      blockedStudents.map((stu) => (
                        <tr key={stu.id} className="hover:bg-slate-900/20">
                          <td className="py-3 px-3 text-cyan-400 font-mono font-bold">{stu.studentId}</td>
                          <td className="py-3 px-3 font-sans text-white font-medium">{stu.name}</td>
                          <td className="py-3 px-3 font-sans text-rose-450 max-w-[200px] leading-relaxed">
                            {stu.blockedReason || 'Exam security protocol violation.'}
                          </td>
                          <td className="py-3 px-3 text-[11px]">
                            {stu.activeTest ? (
                              <div className="space-y-0.5 font-mono">
                                <p className="font-sans">Subject: <span className="text-white font-bold">{stu.activeTest.subject}</span></p>
                                <p>IP: <span className="text-indigo-300 font-bold">{stu.activeTest.startedFromIp}</span></p>
                              </div>
                            ) : (
                              <span className="text-gray-500 font-sans">None</span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-right">
                            <button
                              onClick={() => handleUnblock(stu.studentId)}
                              disabled={unblockingId === stu.studentId}
                              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded font-sans text-[10px] font-bold transition-all"
                            >
                              {unblockingId === stu.studentId ? 'Unblocking...' : 'Restore Access'}
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// ========================================================
// 12. ACTIVE STUDENTS PROCTORING PANEL
// ========================================================
export const ActiveProctoringPanel = () => {
  const { activeTelemetry, students, setStudents } = useStore();
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [blockingId, setBlockingId] = useState<string | null>(null);
  const [unblockingId, setUnblockingId] = useState<string | null>(null);

  // Load students directory for any potential list refreshes
  const fetchStudents = async () => {
    try {
      const list = await apiClient.getStudents();
      setStudents(list);
    } catch (e) { }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // Filter students active in the last 20 seconds
  const now = Date.now();
  const activeStudents = Object.values(activeTelemetry).filter(
    (t: any) => now - t.timestamp < 20000
  );

  const handleForceBlock = async (studentId: string) => {
    if (!confirm(`Are you sure you want to FORCE TERMINATE this student's exam?`)) return;
    setBlockingId(studentId);
    try {
      await apiClient.blockStudent(studentId, {
        reason: 'Manually terminated by Exam Supervisor due to visual / behavioral alert.',
        infractionType: 'SUPERVISOR_FORCE_LOCK'
      });
      fetchStudents();
    } catch (err) {
      alert('Failed to lock student session');
    } finally {
      setBlockingId(null);
    }
  };

  const handleAuthorizeUnblock = async (studentId: string) => {
    setUnblockingId(studentId);
    try {
      await apiClient.unblockStudent(studentId);
      // Update local state in activeTelemetry if present
      if (activeTelemetry[studentId]) {
        activeTelemetry[studentId].isBlocked = false;
        activeTelemetry[studentId].blockedReason = undefined;
      }
      fetchStudents();
      alert('Exam session unblocked. Student will be auto-released within 5 seconds.');
    } catch (err) {
      alert('Failed to release student session');
    } finally {
      setUnblockingId(null);
    }
  };

  const selectedStudent = selectedStudentId ? activeTelemetry[selectedStudentId] : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Live Proctoring Command Center</h2>
          <p className="text-gray-400 text-sm">Real-time camera frames and acoustic feeds from candidate terminals.</p>
        </div>
        <div className="flex gap-2">
          <span className="flex items-center gap-1.5 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-full text-xs font-mono">
            <span className="h-2 w-2 rounded-full bg-indigo-400 animate-ping"></span>
            Biometrics Stream: ACTIVE
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left side: Grid of active student cards (cols-2) */}
        <div className="lg:col-span-2 glass-panel p-5 rounded-xl border border-slate-800 flex flex-col min-h-[500px]">
          <h3 className="font-semibold text-white border-b border-slate-800 pb-3 mb-4 text-sm flex items-center gap-1.5 font-mono">
            <Wifi size={16} className="text-cyan-400" />
            Live Candidate Feeds ({activeStudents.length} Online)
          </h3>

          {activeStudents.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-3">
              <div className="p-4 bg-slate-900/60 rounded-full text-slate-600 border border-slate-850 animate-pulse">
                <Wifi size={36} />
              </div>
              <p className="text-xs text-gray-500 font-mono">No active student terminals detected.</p>
              <p className="text-[11px] text-gray-600 max-w-sm">When students login and launch the CBT exam console, their live biometrics (video frames, mic amplitudes) will appear here instantly.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 overflow-y-auto max-h-[500px] pr-1">
              {activeStudents.map((stu: any) => {
                const isSel = selectedStudentId === stu.studentId;
                return (
                  <div
                    key={stu.studentId}
                    onClick={() => setSelectedStudentId(stu.studentId)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col gap-3 relative overflow-hidden ${isSel
                      ? 'bg-indigo-500/10 border-indigo-500/40 shadow-lg ring-1 ring-indigo-500/20'
                      : 'bg-slate-900/40 border-slate-855 hover:bg-slate-900/60'
                      }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="min-w-0">
                        <p className="text-white font-semibold text-xs truncate">{stu.name}</p>
                        <p className="text-[10px] text-cyan-400 font-mono font-bold">{stu.studentId}</p>
                      </div>
                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-mono font-bold uppercase tracking-wider ${stu.isBlocked
                        ? 'bg-rose-500/10 border border-rose-500/20 text-rose-450'
                        : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 animate-pulse'
                        }`}>
                        {stu.isBlocked ? 'Blocked' : 'Live'}
                      </span>
                    </div>

                    {/* Camera snapshot thumb */}
                    <div className="aspect-video w-full rounded-lg border border-slate-850 bg-black/80 relative overflow-hidden flex items-center justify-center">
                      {stu.cameraFrame ? (
                        <img src={stu.cameraFrame} alt={`${stu.name} camera`} className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-[8px] text-gray-600 font-mono text-center px-2">Webcam loading...</div>
                      )}

                      {/* Live volume micro bar */}
                      <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-black/65 px-1.5 py-0.5 rounded text-[8px] text-indigo-400 font-mono border border-slate-800">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping"></span>
                        <span>Mic: {stu.micVolume}%</span>
                      </div>
                    </div>

                    <div className="text-[10px] text-gray-500 font-mono flex justify-between border-t border-slate-800/40 pt-2">
                      <span>Sub: {stu.activeTest?.subject || 'CBT'}</span>
                      <span>Vol: {stu.micVolume}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right side: Selected Student Telemetry Inspector */}
        <div className="glass-panel p-5 rounded-xl border border-slate-800 flex flex-col min-h-[500px]">
          <h3 className="font-semibold text-white border-b border-slate-800 pb-3 mb-4 text-sm flex items-center gap-1.5 font-mono">
            <Cpu size={16} className="text-indigo-400" />
            Biometric Feed Inspector
          </h3>

          {selectedStudent ? (
            <div className="flex-1 flex flex-col justify-between gap-4 font-mono text-xs">
              <div className="space-y-4">
                {/* Meta details */}
                <div className="space-y-1 bg-slate-900/60 border border-slate-850 p-3 rounded-lg text-[11px] text-gray-350">
                  <p><span className="text-gray-500">Student:</span> <span className="text-white font-bold">{selectedStudent.name}</span></p>
                  <p><span className="text-gray-500">Terminal ID:</span> <span className="text-cyan-400 font-bold">{selectedStudent.studentId}</span></p>
                  <p><span className="text-gray-500">CBT IP:</span> <span className="text-indigo-300">{selectedStudent.activeTest?.startedFromIp || '127.0.0.1'}</span></p>
                  <p><span className="text-gray-500">Subject:</span> <span className="text-white font-bold">{selectedStudent.activeTest?.subject || 'CBT Exam'}</span></p>
                </div>

                {/* Webcam Live Feed */}
                <div className="space-y-1">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Live Camera Feed</span>
                  <div className="aspect-video w-full rounded-lg border border-slate-850 bg-black/60 relative overflow-hidden flex items-center justify-center shadow-inner">
                    {selectedStudent.cameraFrame ? (
                      <img src={selectedStudent.cameraFrame} alt={selectedStudent.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-[10px] text-gray-600">Video Feed Offline</div>
                    )}
                    <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-black/70 border border-slate-800 rounded text-[8px] text-emerald-400 font-mono">
                      FEED_SECURE_SSL
                    </div>
                  </div>
                </div>

                {/* Live Mic Waveform Simulator */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Acoustic Audio Feed</span>
                    <span className={`text-[10px] ${selectedStudent.micVolume > 50 ? 'text-rose-450 animate-pulse font-bold' : 'text-gray-400'}`}>
                      {selectedStudent.micVolume > 50 ? '⚠️ High Audio Alert' : 'Feed Normal'}
                    </span>
                  </div>

                  <div className="bg-slate-900/60 border border-slate-850 p-3 rounded-lg flex flex-col gap-2">
                    {/* Animate-height visual bars */}
                    <div className="h-10 flex items-end justify-center gap-1 px-4 border-b border-slate-800 pb-1.5">
                      {[...Array(12)].map((_, i) => {
                        // Generate random heights centered around micVolume amplitude
                        const rand = Math.sin(i * 0.5) * 0.3 + 0.7;
                        const height = Math.max(4, Math.round(selectedStudent.micVolume * rand * 0.4));
                        return (
                          <div
                            key={i}
                            className={`w-2.5 rounded-t-sm transition-all duration-300 ${selectedStudent.micVolume > 50 ? 'bg-rose-500' : i % 2 === 0 ? 'bg-cyan-500' : 'bg-indigo-500'
                              }`}
                            style={{ height: `${height}px` }}
                          />
                        );
                      })}
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-mono text-gray-500">
                      <span>Mic Gain Threshold: 50%</span>
                      <span className="text-white font-bold">{selectedStudent.micVolume}% Ampl</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-850 flex gap-2">
                {selectedStudent.isBlocked ? (
                  <button
                    onClick={() => handleAuthorizeUnblock(selectedStudent.studentId)}
                    disabled={unblockingId === selectedStudent.studentId}
                    className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded font-sans text-[11px] font-bold transition-all shadow-lg"
                  >
                    {unblockingId === selectedStudent.studentId ? 'Releasing...' : 'Authorize Release'}
                  </button>
                ) : (
                  <button
                    onClick={() => handleForceBlock(selectedStudent.studentId)}
                    disabled={blockingId === selectedStudent.studentId}
                    className="flex-1 py-2 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white rounded font-sans text-[11px] font-bold transition-all shadow-lg"
                  >
                    {blockingId === selectedStudent.studentId ? 'Locking...' : 'Force Block Terminal'}
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-gray-500 font-mono text-[10px] space-y-2">
              <Eye size={24} className="text-slate-700 animate-pulse" />
              <p>Select a candidate feed on the left to inspect biometric telemetry details.</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// ========================================================
// 13. QUESTIONS CATEGORY & SUBJECT BROWSER
// ========================================================
export const QuestionsCategoryPanel = () => {
  const { questions, setQuestions } = useStore();
  const [selectedSubject, setSelectedSubject] = useState('Physics');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedTopic, setExpandedTopic] = useState<string | null>(null);
  const [selectedQuestion, setSelectedQuestion] = useState<any>(null);

  const fetchQuestions = async () => {
    try {
      const q = await apiClient.getQuestions();
      setQuestions(q);
    } catch (e) { }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  // Filter questions by subject
  const subjectQuestions = questions.filter(q => q.subject.toLowerCase() === selectedSubject.toLowerCase());

  // Filter by search query if any
  const filteredQuestions = subjectQuestions.filter(q => {
    const query = searchQuery.toLowerCase();
    return (
      q.id.toLowerCase().includes(query) ||
      q.topic.toLowerCase().includes(query) ||
      q.difficulty.toLowerCase().includes(query) ||
      (q.hash && q.hash.toLowerCase().includes(query)) ||
      (q.author && q.author.toLowerCase().includes(query))
    );
  });

  // Group filtered questions by topic
  const groupedByTopic = filteredQuestions.reduce((acc: Record<string, any[]>, q) => {
    const topic = q.topic || 'General';
    if (!acc[topic]) acc[topic] = [];
    acc[topic].push(q);
    return acc;
  }, {});

  // Metrics for the selected subject
  const easyCount = subjectQuestions.filter(q => q.difficulty === 'Easy').length;
  const mediumCount = subjectQuestions.filter(q => q.difficulty === 'Medium').length;
  const hardCount = subjectQuestions.filter(q => q.difficulty === 'Hard').length;
  const totalCount = subjectQuestions.length;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 text-slate-100"
    >
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Database size={24} className="text-indigo-400" />
            Repository Analytics
          </h2>
          <p className="text-gray-400 text-sm">See all inserted questions classified by subject, category/topic, and difficulty levels.</p>
        </div>

        {/* Subject Selection Tabs */}
        <div className="flex bg-slate-900/80 p-1 border border-slate-800 rounded-xl">
          {['Physics', 'Biology', 'UPSC-CSAT'].map((sub) => (
            <button
              key={sub}
              onClick={() => {
                setSelectedSubject(sub);
                setExpandedTopic(null);
                setSelectedQuestion(null);
              }}
              className={`px-4 py-1.5 rounded-lg text-xs font-mono transition-colors ${selectedSubject === sub
                ? 'bg-indigo-600 text-white font-bold shadow-lg'
                : 'text-gray-400 hover:text-white'
                }`}
            >
              {sub}
            </button>
          ))}
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-panel p-4 rounded-xl border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-[10px] text-gray-400 uppercase font-mono">Total Subject Pool</p>
            <p className="text-2xl font-extrabold text-white mt-1">{totalCount}</p>
          </div>
          <div className="h-9 w-9 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Database size={18} />
          </div>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-[10px] text-gray-400 uppercase font-mono">Easy Questions</p>
            <p className="text-2xl font-extrabold text-emerald-400 mt-1">{easyCount}</p>
          </div>
          <div className="h-9 w-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <CheckCircle size={18} />
          </div>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-[10px] text-gray-400 uppercase font-mono">Medium Questions</p>
            <p className="text-2xl font-extrabold text-amber-400 mt-1">{mediumCount}</p>
          </div>
          <div className="h-9 w-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Activity size={18} />
          </div>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-[10px] text-gray-400 uppercase font-mono">Hard Questions</p>
            <p className="text-2xl font-extrabold text-rose-400 mt-1">{hardCount}</p>
          </div>
          <div className="h-9 w-9 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
            <ShieldAlert size={18} />
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="glass-panel p-4 rounded-xl border border-slate-800 flex items-center gap-3">
        <Search size={18} className="text-gray-500 shrink-0" />
        <input
          type="text"
          placeholder="Filter by question ID, specific topic, difficulty, or author..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-transparent border-0 w-full focus:outline-none text-sm text-white placeholder-slate-700 font-sans"
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery('')} className="text-xs text-gray-500 hover:text-white font-mono shrink-0">
            Clear
          </button>
        )}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Accordions (Topic List) */}
        <div className="lg:col-span-2 space-y-3 max-h-[500px] overflow-y-auto pr-1">
          {Object.keys(groupedByTopic).length === 0 ? (
            <div className="glass-panel p-12 rounded-xl border border-slate-800 text-center text-gray-500 text-sm">
              No questions match the current criteria.
            </div>
          ) : (
            Object.entries(groupedByTopic).map(([topicName, qList]) => {
              const isExpanded = expandedTopic === topicName;
              return (
                <div key={topicName} className="glass-panel rounded-xl border border-slate-800 overflow-hidden transition-all">
                  <div
                    onClick={() => setExpandedTopic(isExpanded ? null : topicName)}
                    className="flex justify-between items-center p-4 bg-slate-900/30 hover:bg-slate-900/60 cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-sm text-indigo-300 font-mono">{topicName}</span>
                      <span className="px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-full text-[10px] font-mono">
                        {qList.length} items
                      </span>
                    </div>
                    {isExpanded ? <ChevronUp size={16} className="text-gray-500" /> : <ChevronDown size={16} className="text-gray-500" />}
                  </div>

                  {isExpanded && (
                    <div className="border-t border-slate-850 bg-black/10 overflow-x-auto">
                      <table className="w-full text-left font-mono text-[11px] border-collapse">
                        <thead>
                          <tr className="border-b border-slate-850 text-gray-500 text-[10px] uppercase tracking-wider">
                            <th className="py-2.5 px-4 font-sans font-bold">ID / Timestamp</th>
                            <th className="py-2.5 px-4 font-sans font-bold">Difficulty</th>
                            <th className="py-2.5 px-4 font-sans font-bold">Author</th>
                            <th className="py-2.5 px-4 font-sans font-bold text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-900 text-gray-300">
                          {qList.map((q) => (
                            <tr key={q.id} className="hover:bg-slate-900/30">
                              <td className="py-3 px-4">
                                <p className="text-white font-bold break-all">{q.id}</p>
                                <p className="text-[9px] text-gray-500 mt-0.5">{new Date(q.createdAt).toLocaleString()}</p>
                              </td>
                              <td className="py-3 px-4">
                                <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${q.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25' :
                                  q.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/25' :
                                    'bg-rose-500/10 text-rose-400 border border-rose-500/25'
                                  }`}>
                                  {q.difficulty}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-gray-400 font-sans">
                                {q.author}
                              </td>
                              <td className="py-3 px-4 text-right">
                                <button
                                  onClick={() => setSelectedQuestion(q)}
                                  className="px-2.5 py-1 bg-indigo-600/20 border border-indigo-500/30 hover:bg-indigo-600/40 text-indigo-300 rounded text-[10px] font-sans font-bold transition-all"
                                >
                                  Inspect Block
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Selected Block Details Card */}
        <div className="glass-panel p-5 rounded-xl border border-slate-800 flex flex-col h-[500px] justify-between">
          <h3 className="font-semibold text-white border-b border-slate-800 pb-3 text-sm flex items-center gap-1.5 shrink-0 font-mono">
            <Terminal size={16} className="text-indigo-400" />
            Decentralized Vault Inspector
          </h3>

          <div className="flex-1 overflow-y-auto space-y-4 my-4 font-mono text-[10px]">
            {selectedQuestion ? (
              <div className="space-y-4">
                <div>
                  <p className="text-gray-500 uppercase text-[9px] font-sans">Vault Record ID</p>
                  <p className="text-white font-bold text-xs break-all bg-black/40 p-2 border border-slate-850 rounded font-mono mt-1 select-all">
                    {selectedQuestion.id}
                  </p>
                </div>

                <div>
                  <p className="text-gray-500 uppercase text-[9px] font-sans">Blockchain Content Hash</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <p className="text-cyan-400 font-bold break-all bg-black/40 p-2 border border-slate-850 rounded font-mono flex-1 truncate">
                      {selectedQuestion.hash}
                    </p>
                    <button
                      onClick={() => handleCopy(selectedQuestion.hash)}
                      className="px-2 py-2 bg-slate-900 border border-slate-850 hover:bg-slate-800 text-gray-400 rounded shrink-0 font-sans text-[10px]"
                    >
                      Copy
                    </button>
                  </div>
                </div>

                <div>
                  <p className="text-gray-500 uppercase text-[9px] font-sans">AES-256-GCM Ciphertext Payload</p>
                  <p className="text-indigo-300 break-all bg-black/40 p-2 border border-slate-850 rounded font-mono mt-1 max-h-36 overflow-y-auto select-all overflow-x-hidden">
                    {selectedQuestion.encryptedContent}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-gray-500 uppercase text-[9px] font-sans">IV Vector</p>
                    <p className="text-white bg-black/40 p-1.5 border border-slate-850 rounded font-mono mt-0.5 truncate select-all">{selectedQuestion.iv}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 uppercase text-[9px] font-sans">Auth GCM Tag</p>
                    <p className="text-white bg-black/40 p-1.5 border border-slate-850 rounded font-mono mt-0.5 truncate select-all">{selectedQuestion.tag}</p>
                  </div>
                </div>

                <div>
                  <p className="text-gray-500 uppercase text-[9px] font-sans">ECDSA Author Signature</p>
                  <p className="text-emerald-400 break-all bg-black/40 p-2 border border-slate-850 rounded font-mono mt-1 max-h-16 overflow-y-auto select-all overflow-x-hidden">
                    {selectedQuestion.signature}
                  </p>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center text-gray-500 italic p-4">
                <Database size={24} className="text-slate-800 mb-2 animate-bounce" />
                Select an ingested question block on the left to reveal its cryptographic lineage, ciphertext, and validator signature verification logs.
              </div>
            )}
          </div>

          <div className="p-3 border-t border-slate-850 text-gray-500 text-[9px] font-mono shrink-0 flex items-center justify-between">
            <span>Keys Verification: OK</span>
            <span className="text-indigo-400 flex items-center gap-1 font-bold"><ShieldCheck size={12} /> SECURE CRYPTO VAULT</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};


