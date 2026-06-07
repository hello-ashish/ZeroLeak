const BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001').replace(/\/$/, '') + '/api';

export const apiClient = {
  async getSystemStatus() {
    const res = await fetch(`${BASE_URL}/system/status`);
    if (!res.ok) throw new Error('Failed to fetch system status');
    return res.json();
  },

  async restoreSystem() {
    const res = await fetch(`${BASE_URL}/system/restore`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to restore system');
    return res.json();
  },

  async getQuestions(subject?: string) {
    const url = subject ? `${BASE_URL}/questions?subject=${subject}` : `${BASE_URL}/questions`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch questions');
    return res.json();
  },

  async ingestQuestion(payload: { content: string; subject: string; topic: string; difficulty?: string; author: string }) {
    const res = await fetch(`${BASE_URL}/questions/ingest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.message || 'Failed to ingest question');
    }
    return res.json();
  },

  async getBlockchain() {
    const res = await fetch(`${BASE_URL}/blockchain`);
    if (!res.ok) throw new Error('Failed to fetch blockchain');
    return res.json();
  },

  async verifyLedger() {
    const res = await fetch(`${BASE_URL}/blockchain/verify`);
    if (!res.ok) throw new Error('Failed to verify ledger integrity');
    return res.json();
  },

  async getExams() {
    const res = await fetch(`${BASE_URL}/exams`);
    if (!res.ok) throw new Error('Failed to fetch exams');
    return res.json();
  },

  async getNodes() {
    const res = await fetch(`${BASE_URL}/nodes`);
    if (!res.ok) throw new Error('Failed to fetch node states');
    return res.json();
  },

  async triggerGeneration(examId: string, forceEntropySource?: string) {
    const res = await fetch(`${BASE_URL}/exams/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ examId, forceEntropySource })
    });
    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.message || 'Failed to generate exam paper');
    }
    return res.json();
  },

  async decryptExamPaper(examId: string, customHeaders: Record<string, string> = {}) {
    const res = await fetch(`${BASE_URL}/exams/decrypt`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        ...customHeaders
      },
      body: JSON.stringify({ examId })
    });
    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.message || 'Time-Lock decrypter rejected access');
    }
    return res.json();
  },

  async runAttackSimulation(type: string) {
    const res = await fetch(`${BASE_URL}/simulation/attack`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type })
    });
    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.message || 'Failed to execute attack simulation');
    }
    return res.json();
  },

  async getAuditLogs() {
    const res = await fetch(`${BASE_URL}/audit-logs`);
    if (!res.ok) throw new Error('Failed to fetch audit logs');
    return res.json();
  },

  async getSecurityEvents() {
    const res = await fetch(`${BASE_URL}/security-events`);
    if (!res.ok) throw new Error('Failed to fetch security events');
    return res.json();
  },

  async getStudents() {
    const res = await fetch(`${BASE_URL}/students`);
    if (!res.ok) throw new Error('Failed to fetch enrolled students');
    return res.json();
  },

  async enrollStudent(payload: { name: string; email: string }) {
    const res = await fetch(`${BASE_URL}/students/enroll`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.message || 'Failed to enroll student');
    }
    return res.json();
  },

  async studentLogin(payload: { studentId: string; passwordRaw: string }) {
    const res = await fetch(`${BASE_URL}/students/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.message || 'Failed to authenticate student');
    }
    return res.json();
  },

  async studentStartTest(payload: { studentId: string; subject: string }) {
    const res = await fetch(`${BASE_URL}/students/start-test`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.message || 'Failed to start test');
    }
    return res.json();
  },

  async studentSubmitTest(payload: {
    studentId: string;
    subject: string;
    answers: Record<string, string>;
    questionIds: string[];
  }) {
    const res = await fetch(`${BASE_URL}/students/submit-test`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.message || 'Failed to submit test');
    }
    return res.json();
  },

  async getSubmissions() {
    const res = await fetch(`${BASE_URL}/submissions`);
    if (!res.ok) throw new Error('Failed to fetch test submissions');
    return res.json();
  },

  async getExamsHistory() {
    const res = await fetch(`${BASE_URL}/exams/history`);
    if (!res.ok) throw new Error('Failed to fetch paper history');
    return res.json();
  },

  async decryptHistoryPaper(id: string) {
    const res = await fetch(`${BASE_URL}/exams/history/${id}/decrypt`);
    if (!res.ok) throw new Error('Failed to decrypt historical paper');
    return res.json();
  },

  async deleteHistoryPaper(id: string) {
    const res = await fetch(`${BASE_URL}/exams/history/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to delete paper history entry');
    return res.json();
  },

  async clearExamsHistory() {
    const res = await fetch(`${BASE_URL}/exams/history`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to clear paper histories');
    return res.json();
  },

  async unblockStudent(studentId: string) {
    const res = await fetch(`${BASE_URL}/students/${studentId}/unblock`, {
      method: 'POST'
    });
    if (!res.ok) throw new Error('Failed to unblock student');
    return res.json();
  },

  async blockStudent(studentId: string, payload: { reason: string; infractionType: string }) {
    const res = await fetch(`${BASE_URL}/students/${studentId}/block`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to block student');
    return res.json();
  },

  async studentHeartbeat(studentId: string, cameraFrame?: string | null, micVolume?: number) {
    const res = await fetch(`${BASE_URL}/students/heartbeat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId, cameraFrame, micVolume })
    });
    if (!res.ok) throw new Error('Failed to fetch heartbeat status');
    return res.json();
  },

  async changeStudentPassword(studentId: string, passwordRaw: string, adminName: string) {
    const res = await fetch(`${BASE_URL}/students/${studentId}/change-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ passwordRaw, adminName })
    });
    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.message || 'Failed to change student password');
    }
    return res.json();
  }
};
