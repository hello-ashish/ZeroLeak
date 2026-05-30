'use client';

import React, { useEffect, useState } from 'react';
import { useStore, PageType } from '../lib/store';
import { useSocket } from '../hooks/useSocket';
import { apiClient } from '../lib/api';
import {
  ShieldCheck, ShieldAlert, Key, Database, Cpu, Clock, Terminal, Activity,
  Settings, LogOut, ArrowRight, User, AlertCircle, RefreshCw, Layers, Lock, Globe, HardDrive, CheckCircle, Eye
} from 'lucide-react';
import {
  AdminCenterPanel, QuestionRepositoryPanel, BlockchainExplorerPanel,
  PaperGenerationPanel, SOCPanel, AuditForensicsPanel, ExamDeliveryPanel, ResearchMetricsPanel,
  StudentRegistryPanel, CompletedTestsPanel, SecurityAlertsPanel, ActiveProctoringPanel
} from '../components/DashboardPanels';
import { motion, AnimatePresence } from 'framer-motion';

export default function MainPage() {
  // Activate sockets
  useSocket();

  const {
    page, setPage,
    user, setUser,
    mfaVerified, setMfaVerified,
    stats, setStats,
    setQuestions, setBlockchain, setExams, setSecurityEvents, setAuditLogs, setNodes
  } = useStore();

  const [loading, setLoading] = useState(true);

  // Auth Inputs
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('••••••••');
  const [mfaCode, setMfaCode] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'SuperAdmin' | 'ExamController' | 'CenterSupervisor'>('SuperAdmin');

  // Load initial statistics and states
  const loadSystemData = async () => {
    try {
      const systemStats = await apiClient.getSystemStatus();
      setStats(systemStats);

      const qs = await apiClient.getQuestions();
      setQuestions(qs);

      const chain = await apiClient.getBlockchain();
      setBlockchain(chain);

      const ex = await apiClient.getExams();
      setExams(ex);

      const secs = await apiClient.getSecurityEvents();
      setSecurityEvents(secs);

      const audits = await apiClient.getAuditLogs();
      setAuditLogs(audits);

      const nodes = await apiClient.getNodes();
      setNodes(nodes);

    } catch (e) {
      console.error('Failed to load system data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSystemData();
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);

    setTimeout(() => {
      if (mfaCode !== '123456') {
        setAuthError('MFA Authentication Failed. Please enter valid passcode "123456".');
        setAuthLoading(false);
        return;
      }

      setUser({
        name: username === 'admin' ? 'Dr. AK Gupta' : 'Supervisor Node-04',
        role: selectedRole,
        token: 'bdepgs-jwt-token-session-0123'
      });
      setMfaVerified(true);
      setPage('admin');
      setAuthLoading(false);
    }, 1000);
  };

  const handleLogout = () => {
    setUser(null);
    setMfaVerified(false);
    setPage('landing');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030712] flex flex-col items-center justify-center text-white space-y-4 font-mono">
        <RefreshCw className="animate-spin text-indigo-500" size={36} />
        <p className="text-sm">Decrypting Security Console Infrastructure...</p>
      </div>
    );
  }

  // ==========================================
  // VIEW 1: FUTURISTIC LANDING PAGE
  // ==========================================
  if (page === 'landing') {
    return (
      <div className="min-h-screen bg-[#030712] text-slate-100 cyber-grid relative overflow-hidden flex flex-col">
        {/* Glow overlay */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-500/10 blur-[120px] pointer-events-none"></div>

        {/* Top Navbar */}
        <header className="border-b border-slate-900 bg-slate-950/40 backdrop-blur-md px-6 py-4 flex justify-between items-center z-50">
          <div className="flex items-center gap-2">
            <Layers className="text-indigo-400" size={24} />
            <span className="font-mono font-extrabold tracking-widest text-white text-lg">ZeroLeak</span>
          </div>
          <button
            onClick={() => setPage('admin')}
            className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-mono rounded-lg text-sm transition-colors flex items-center gap-1.5 font-bold shadow-lg shadow-indigo-600/15"
          >
            Launch Terminal <ArrowRight size={14} />
          </button>
        </header>

        {/* Main Hero */}
        <main className="flex-1 max-w-6xl mx-auto px-6 py-16 flex flex-col items-center text-center justify-center z-40 space-y-8">
          <div className="space-y-4">
            <span className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 rounded-full font-mono text-xs uppercase tracking-widest">
              Zero-Existence Cryptography Protocol
            </span>
            <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight leading-tight max-w-4xl">
              Blockchain-Based Dynamic <br />
              <span className="bg-gradient-to-r from-indigo-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
                Examination Paper Generation
              </span>
            </h1>
            <p className="text-slate-400 max-w-2xl text-base md:text-lg leading-relaxed">
              ZeroLeak stops exam paper leaks at their source. No final exam paper exists anywhere in the world until minutes before the examination, assembled dynamically using decentralized entropy and verified on an immutable ledger.
            </p>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => setPage('admin')}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-mono font-semibold transition-colors flex items-center gap-2 shadow-lg shadow-indigo-600/15"
            >
              Access Admin Console <ArrowRight size={16} />
            </button>
            <a
              href="#protocol"
              className="px-6 py-3 bg-slate-900 hover:bg-slate-850 text-gray-300 border border-slate-800 rounded-lg font-mono text-sm transition-colors flex items-center justify-center"
            >
              Inspect Protocol Architecture
            </a>
          </div>

          {/* Key Architecture Visualizer Diagram */}
          <section id="protocol" className="w-full glass-panel p-6 md:p-8 rounded-2xl border border-slate-850 text-left mt-12 space-y-6">
            <h3 className="text-lg font-bold text-white font-mono flex items-center gap-2">
              <Terminal size={18} className="text-cyan-400" />
              Dynamic Seed Mixing Protocol & Lineage
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
              <div className="p-4 bg-slate-900/60 border border-slate-850 rounded-xl space-y-1 font-mono text-xs">
                <p className="text-indigo-400 font-bold">1. Input Entropy</p>
                <ul className="text-gray-400 space-y-1 mt-2">
                  <li>• Release Time ($T$)</li>
                  <li>• Ledger Hash ($H$)</li>
                  <li>• System Seed ($S$)</li>
                  <li>• Center Salt ($E$)</li>
                </ul>
              </div>

              <div className="text-center text-gray-500 font-mono text-xl py-2 hidden md:block">→</div>

              <div className="p-4 bg-slate-900/60 border border-indigo-500/20 rounded-xl text-center space-y-2">
                <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-400 rounded text-[10px] font-mono border border-indigo-500/25">SHA-256</span>
                <p className="font-mono text-xs text-white break-all">r = SHA256(T + H + S + E)</p>
              </div>

              <div className="text-center text-gray-500 font-mono text-xl py-2 hidden md:block">→</div>

              <div className="p-4 bg-slate-900/60 border border-slate-850 rounded-xl space-y-1 font-mono text-xs">
                <p className="text-emerald-400 font-bold">2. Seeded Selection</p>
                <ul className="text-gray-400 space-y-1 mt-2">
                  <li>• Modulo Indexing</li>
                  <li>• Balancing Rules</li>
                  <li>• Ledger Verification</li>
                  <li>• Time-locked Keys</li>
                </ul>
              </div>

              <div className="text-center text-gray-500 font-mono text-xl py-2 hidden md:block">→</div>

              <div className="p-4 bg-slate-900/60 border border-cyan-500/20 rounded-xl text-center space-y-2">
                <span className="px-2 py-0.5 bg-cyan-500/10 text-cyan-400 rounded text-[10px] font-mono border border-cyan-500/25">RELEASE</span>
                <p className="font-mono text-xs text-white">Unique Exam Package (X Questions)</p>
              </div>
            </div>

            <div className="p-4 bg-slate-900/40 border border-slate-850 rounded-xl text-xs text-slate-400 leading-relaxed font-sans">
              <span className="text-white font-semibold">Security Assertion:</span> The redundancy pool $N$ ($N = X \times n$) contains thousands of fully encrypted questions. Since the combined seed $r$ is completely unpredictable prior to $T$, the selected indices cannot be solved beforehand, guaranteeing 100% security against leakage.
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-900 py-6 text-center text-xs text-gray-600 font-mono">
          ZeroLeak Secure Infrastructure Platform • Research MVP Prototype • © 2026
        </footer>
      </div>
    );
  }

  // ==========================================
  // VIEW 2: AUTH / ZERO-TRUST LOGIN WITH MFA
  // ==========================================
  if (user === null) {
    return (
      <div className="min-h-screen bg-[#030712] text-slate-100 cyber-grid flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md glass-panel p-6 rounded-2xl border border-indigo-500/20 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-cyan-500 to-emerald-500"></div>

          <div className="text-center space-y-2 mb-6">
            <div className="inline-flex p-3 bg-indigo-500/10 rounded-full text-indigo-400 border border-indigo-500/20 mb-2">
              <Lock size={28} />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white font-mono uppercase">Zero-Trust Terminal Authorization</h2>
            <p className="text-xs text-gray-400">Select role and verify your 6-digit temporal MFA code.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase font-mono">Authorized Security Role</label>
              <div className="grid grid-cols-3 gap-2">
                {(['SuperAdmin', 'ExamController', 'CenterSupervisor'] as const).map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setSelectedRole(role)}
                    className={`py-1.5 rounded-lg border text-[10px] font-mono transition-colors ${selectedRole === role
                        ? 'bg-indigo-500/15 border-indigo-500/40 text-indigo-300 font-bold'
                        : 'bg-slate-900 border-slate-800 text-gray-500 hover:text-white'
                      }`}
                  >
                    {role === 'SuperAdmin' ? 'Super Admin' : role === 'ExamController' ? 'Controller' : 'Supervisor'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1 uppercase font-mono">System Identity Node</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1 uppercase font-mono">Hardware Security Key Pass</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-semibold text-gray-400 uppercase font-mono">MFA Passcode (TOTP)</label>
                <span className="text-[10px] text-amber-500 font-mono">Demo: enter "123456"</span>
              </div>
              <input
                type="text"
                placeholder="000000"
                value={mfaCode}
                onChange={(e) => setMfaCode(e.target.value)}
                maxLength={6}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm font-mono text-center tracking-widest text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            {authError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-400 text-xs flex gap-2 font-mono">
                <AlertCircle size={16} className="shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={authLoading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-mono font-bold py-2.5 rounded-lg text-sm transition-colors flex items-center justify-center gap-1.5"
            >
              {authLoading ? <RefreshCw size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
              Authenticate Node Session
            </button>
          </form>

          <button
            onClick={() => setPage('landing')}
            className="w-full mt-4 text-center text-xs text-gray-500 hover:text-white font-mono"
          >
            ← Back to Product Overview
          </button>
        </motion.div>
      </div>
    );
  }

  // ==========================================
  // VIEW 3: FULL ADMIN COMMAND CENTER DASHBOARD
  // ==========================================
  const renderPanel = () => {
    switch (page) {
      case 'admin':
        return <AdminCenterPanel />;
      case 'proctoring':
        return <ActiveProctoringPanel />;
      case 'questions':
        return <QuestionRepositoryPanel />;
      case 'blockchain':
        return <BlockchainExplorerPanel />;
      case 'generator':
        return <PaperGenerationPanel />;
      case 'soc':
        return <SOCPanel />;
      case 'audit':
        return <AuditForensicsPanel />;
      case 'delivery':
        return <ExamDeliveryPanel />;
      case 'metrics':
        return <ResearchMetricsPanel />;
      case 'students':
        return <StudentRegistryPanel />;
      case 'completed-tests':
        return <CompletedTestsPanel />;
      case 'alerts':
        return <SecurityAlertsPanel />;
      default:
        return <AdminCenterPanel />;
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 flex flex-col font-sans">

      {/* Top Header Status Bar */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md px-6 py-3.5 flex justify-between items-center z-40 shrink-0">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setPage('landing')}>
            <Layers className="text-indigo-400" size={20} />
            <span className="font-mono font-extrabold tracking-widest text-white text-md">ZeroLeak</span>
          </div>

          {/* Quick Metrics Bar */}
          <div className="hidden md:flex items-center gap-4 text-xs font-mono border-l border-slate-800 pl-6 text-gray-400">
            <div className="flex items-center gap-1.5">
              <Activity size={14} className="text-cyan-400" />
              <span>Score:</span>
              <span className={`font-bold ${stats.securityScore > 80 ? 'text-emerald-400' : stats.securityScore > 50 ? 'text-amber-400' : 'text-rose-500'}`}>
                {stats.securityScore}%
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Globe size={14} className="text-indigo-400" />
              <span>Nodes:</span>
              <span className="text-white font-bold">{stats.nodesCount} Online</span>
            </div>
            <div className="flex items-center gap-1.5">
              <HardDrive size={14} className="text-emerald-400" />
              <span>Height:</span>
              <span className="text-white font-bold">#{stats.blockchainHeight}</span>
            </div>
          </div>
        </div>

        {/* User profile and logout */}
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-2 border border-slate-850 px-2.5 py-1 rounded bg-slate-900/40">
            <User size={12} className="text-indigo-400" />
            <span className="text-gray-300 font-semibold">{user.name}</span>
            <span className="px-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded text-[9px]">
              {user.role}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="p-1.5 hover:bg-slate-905 hover:text-white text-gray-500 rounded transition-colors"
            title="Disconnect Terminal"
          >
            <LogOut size={16} />
          </button>
        </div>
      </header>

      {/* Main Body */}
      <div className="flex flex-1 overflow-hidden">

        {/* Navigation Sidebar */}
        <aside className="w-64 border-r border-slate-900 bg-slate-950/40 flex flex-col shrink-0">
          <nav className="p-4 space-y-1.5 flex-1 font-mono text-xs">
            <p className="px-2 text-[10px] text-gray-600 uppercase font-bold tracking-wider mb-2">Systems Controls</p>

            <button
              onClick={() => setPage('admin')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors ${page === 'admin'
                  ? 'bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-bold'
                  : 'text-gray-400 hover:text-white border border-transparent'
                }`}
            >
              <Cpu size={15} /> Command Center
            </button>

            <button
              onClick={() => setPage('questions')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors ${page === 'questions'
                  ? 'bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-bold'
                  : 'text-gray-400 hover:text-white border border-transparent'
                }`}
            >
              <Database size={15} /> Encrypted Repository
            </button>

            <button
              onClick={() => setPage('blockchain')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors ${page === 'blockchain'
                  ? 'bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-bold'
                  : 'text-gray-400 hover:text-white border border-transparent'
                }`}
            >
              <Layers size={15} /> Ledger Explorer
            </button>

            <button
              onClick={() => setPage('generator')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors ${page === 'generator'
                  ? 'bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-bold'
                  : 'text-gray-400 hover:text-white border border-transparent'
                }`}
            >
              <Clock size={15} /> Paper Generator
            </button>

            <button
              onClick={() => setPage('students')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors ${page === 'students'
                  ? 'bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-bold'
                  : 'text-gray-400 hover:text-white border border-transparent'
                }`}
            >
              <User size={15} /> Student Registry
            </button>

            <button
              onClick={() => setPage('completed-tests')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors ${page === 'completed-tests'
                  ? 'bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-bold'
                  : 'text-gray-400 hover:text-white border border-transparent'
                }`}
            >
              <CheckCircle size={15} /> Completed Tests
            </button>

            <p className="px-2 text-[10px] text-gray-600 uppercase font-bold tracking-wider mt-5 mb-2">Cyber Operations</p>

            <button
              onClick={() => setPage('alerts')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors ${page === 'alerts'
                  ? 'bg-rose-500/10 border border-rose-500/20 text-rose-300 font-bold'
                  : 'text-gray-400 hover:text-white border border-transparent'
                }`}
            >
              <ShieldAlert size={15} className="text-rose-400" /> Security Alerts
            </button>

            <button
              onClick={() => setPage('soc')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors ${page === 'soc'
                  ? 'bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-bold'
                  : 'text-gray-400 hover:text-white border border-transparent'
                }`}
            >
              <ShieldAlert size={15} /> Threat Monitor (SOC)
            </button>

            <button
              onClick={() => setPage('proctoring')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors ${page === 'proctoring'
                  ? 'bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-bold'
                  : 'text-gray-400 hover:text-white border border-transparent'
                }`}
            >
              <Eye size={15} className="text-cyan-400" /> Active Proctoring
            </button>

            <button
              onClick={() => setPage('audit')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors ${page === 'audit'
                  ? 'bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-bold'
                  : 'text-gray-400 hover:text-white border border-transparent'
                }`}
            >
              <Terminal size={15} /> Audit & Forensics
            </button>

            <button
              onClick={() => setPage('delivery')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors ${page === 'delivery'
                  ? 'bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-bold'
                  : 'text-gray-400 hover:text-white border border-transparent'
                }`}
            >
              <Key size={15} /> Delivery Decrypter
            </button>

            <button
              onClick={() => setPage('metrics')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors ${page === 'metrics'
                  ? 'bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-bold'
                  : 'text-gray-400 hover:text-white border border-transparent'
                }`}
            >
              <Activity size={15} /> Research Metrics
            </button>
          </nav>

          <div className="p-4 border-t border-slate-900 bg-black/20 text-[10px] text-gray-500 font-mono space-y-1">
            <p>Session ID: bde-012a</p>
            <p>API Endpoint: localhost:5001</p>
            <p>HSM Hardware Status: OK</p>
          </div>
        </aside>

        {/* Dynamic Panels Output Area */}
        <main className="flex-1 overflow-y-auto p-6 bg-slate-950/40">
          <AnimatePresence mode="wait">
            <div key={page}>
              {renderPanel()}
            </div>
          </AnimatePresence>
        </main>
      </div>

    </div>
  );
}
