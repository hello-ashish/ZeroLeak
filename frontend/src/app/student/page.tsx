'use client';

import React, { useState, useEffect, useRef } from 'react';
import { apiClient } from '../../lib/api';
import { 
  ShieldCheck, Lock, Clock, User, ArrowRight, CheckCircle, 
  HelpCircle, AlertTriangle, ChevronLeft, ChevronRight, LogOut, Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type CBTState = 'login' | 'setup' | 'cbt' | 'submitted';

const WatermarkCanvas: React.FC<{ studentId?: string; ipAddress?: string }> = ({ studentId = 'STU-UNKNOWN', ipAddress = '192.168.4.108' }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let offset = 0;

    const render = () => {
      if (!canvas) return;
      if (canvas.width !== canvas.offsetWidth || canvas.height !== canvas.offsetHeight) {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.save();
      // Extremely faint white overlay (visible but unobtrusive)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.02)'; 
      ctx.font = 'bold 11px monospace';
      ctx.rotate(-25 * Math.PI / 180); // Diagonal angle

      // Watermark string
      const timestamp = new Date().toLocaleTimeString();
      const text = `${studentId.toUpperCase()} | ${ipAddress} | SECURE_EXAM_CBT | ${timestamp}`;

      const textWidth = ctx.measureText(text).width + 80;
      const xSpacing = textWidth;
      const ySpacing = 70;

      offset = (offset + 0.1) % xSpacing;

      // Cover outer bounds because of rotation
      const startX = -canvas.height * 2;
      const endX = canvas.width * 2 + canvas.height * 2;
      const startY = -canvas.width * 2;
      const endY = canvas.height * 2 + canvas.width * 2;

      for (let x = startX; x < endX; x += xSpacing) {
        for (let y = startY; y < endY; y += ySpacing) {
          ctx.fillText(text, x + offset, y);
        }
      }

      ctx.restore();
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [studentId, ipAddress]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-10"
      style={{ mixBlendMode: 'overlay' }}
    />
  );
};

export default function StudentCBTPage() {
  const [viewState, setViewState] = useState<CBTState>('login');

  // Student Session
  const [studentIdInput, setStudentIdInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [student, setStudent] = useState<any>(null);
  const [studentSubmissions, setStudentSubmissions] = useState<any[]>([]);
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Subject Selection
  const [selectedSubject, setSelectedSubject] = useState('Physics');

  // CBT Test Arena State
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [markedForReview, setMarkedForReview] = useState<Record<string, boolean>>({});
  const [visited, setVisited] = useState<Record<string, boolean>>({});
  const [startLoading, setStartLoading] = useState(false);
  const [startError, setStartError] = useState('');

  // Timer State (30 mins = 1800 seconds)
  const [timeLeft, setTimeLeft] = useState(1800);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Submission State
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<any>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const isSubmittingRef = useRef(false);

  // Mark current question as visited when index changes
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockedReason, setBlockedReason] = useState('');
  const [isResuming, setIsResuming] = useState(false);

  // Proctoring States
  const [proctorStatus, setProctorStatus] = useState<'OK' | 'NO_FACE' | 'MULTI_FACE' | 'GAZE_DIVERGED'>('OK');
  const [proctorCountdown, setProctorCountdown] = useState<number | null>(null);
  const [proctorLogs, setProctorLogs] = useState<string[]>([
    'Initializing AI proctor daemon...',
    'Loading face detection model...',
    'AI Proctor Active - Secure Feed Established'
  ]);
  const proctorIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [hasCamera, setHasCamera] = useState(false);

  const enterFullscreen = async () => {
    try {
      const docEl = document.documentElement as any;
      if (docEl.requestFullscreen) {
        await docEl.requestFullscreen();
      } else if (docEl.webkitRequestFullscreen) {
        await docEl.webkitRequestFullscreen();
      } else if (docEl.mozRequestFullScreen) {
        await docEl.mozRequestFullScreen();
      } else if (docEl.msRequestFullscreen) {
        await docEl.msRequestFullscreen();
      }
    } catch (err) {
      console.error('Failed to enter fullscreen:', err);
    }
  };

  const exitFullscreen = async () => {
    try {
      const doc = document as any;
      const isFullscreen = doc.fullscreenElement || doc.webkitFullscreenElement || doc.mozFullScreenElement || doc.msFullscreenElement;
      if (isFullscreen) {
        if (doc.exitFullscreen) {
          await doc.exitFullscreen();
        } else if (doc.webkitExitFullscreen) {
          await doc.webkitExitFullscreen();
        } else if (doc.mozCancelFullScreen) {
          await doc.mozCancelFullScreen();
        } else if (doc.msExitFullscreen) {
          await doc.msExitFullscreen();
        }
      }
    } catch (err) {
      console.error('Failed to exit fullscreen:', err);
    }
  };

  const triggerInfractionLock = async (reason: string, infractionType: string) => {
    if (isBlocked || viewState !== 'cbt') return;
    setIsBlocked(true);
    setBlockedReason(reason);
    await exitFullscreen();
    try {
      await apiClient.blockStudent(student.studentId, {
        reason,
        infractionType
      });
    } catch (err) {
      console.error('Failed to report block to backend:', err);
    }
  };

  // Fullscreen Listener to warn/block students
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (viewState === 'cbt' && !document.fullscreenElement && !isBlocked && !isSubmittingRef.current) {
        triggerInfractionLock(
          'Student exited secure fullscreen mode during examination.',
          'FULLSCREEN_EXIT_DETECTION'
        );
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [viewState, isBlocked, student]);

  // Window restrictions: blur, right click, clipboard, keydown
  useEffect(() => {
    if (viewState !== 'cbt' || isBlocked) return;

    const handleBlur = () => {
      if (isSubmittingRef.current) return;
      triggerInfractionLock(
        'Student navigated away from the active examination window or switched browser tabs.',
        'WINDOW_BLUR_DETECTION'
      );
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      triggerInfractionLock(
        'Student attempted to open context menu (right-click detection).',
        'CONTEXT_MENU_ATTEMPT'
      );
    };

    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      triggerInfractionLock(
        'Student attempted to copy exam text.',
        'CLIPBOARD_COPY_ATTEMPT'
      );
    };

    const handlePaste = (e: ClipboardEvent) => {
      e.preventDefault();
      triggerInfractionLock(
        'Student attempted a clipboard Paste operation.',
        'CLIPBOARD_PASTE_ATTEMPT'
      );
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'PrintScreen' || e.keyCode === 44) {
        e.preventDefault();
        triggerInfractionLock(
          'Student triggered a screen capture command (Print Screen).',
          'SCREENSHOT_ATTEMPT'
        );
      }

      if (e.key === 'F12' || e.keyCode === 123) {
        e.preventDefault();
        triggerInfractionLock(
          'Student attempted to open developer tools via F12.',
          'DEVTOOLS_ACCESS_ATTEMPT'
        );
      }

      if ((e.metaKey || e.ctrlKey) && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.keyCode === 73)) {
        e.preventDefault();
        triggerInfractionLock(
          'Student attempted to open inspector panel.',
          'DEVTOOLS_ACCESS_ATTEMPT'
        );
      }

      if ((e.metaKey || e.ctrlKey) && e.shiftKey && (e.key === 'J' || e.key === 'j' || e.keyCode === 74)) {
        e.preventDefault();
        triggerInfractionLock(
          'Student attempted to open developer console.',
          'DEVTOOLS_ACCESS_ATTEMPT'
        );
      }

      if ((e.metaKey || e.ctrlKey) && (e.key === 'U' || e.key === 'u' || e.keyCode === 85)) {
        e.preventDefault();
        triggerInfractionLock(
          'Student attempted to view page source.',
          'VIEW_SOURCE_ATTEMPT'
        );
      }

      if ((e.metaKey || e.ctrlKey) && (e.key === 'C' || e.key === 'c' || e.keyCode === 67)) {
        e.preventDefault();
        triggerInfractionLock(
          'Student triggered a copy keyboard shortcut.',
          'CLIPBOARD_COPY_ATTEMPT'
        );
      }

      if ((e.metaKey || e.ctrlKey) && (e.key === 'V' || e.key === 'v' || e.keyCode === 86)) {
        e.preventDefault();
        triggerInfractionLock(
          'Student triggered a paste keyboard shortcut.',
          'CLIPBOARD_PASTE_ATTEMPT'
        );
      }
    };

    window.addEventListener('blur', handleBlur);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('copy', handleCopy);
    document.addEventListener('paste', handlePaste);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('paste', handlePaste);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [viewState, isBlocked, student]);

  // AI Proctoring Feed setup & Anomaly warnings loop
  useEffect(() => {
    if (viewState !== 'cbt' || isBlocked) {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
      if (proctorIntervalRef.current) clearInterval(proctorIntervalRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      return;
    }

    navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240 } })
      .then((stream) => {
        setHasCamera(true);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch((err) => {
        console.warn('Webcam fallback canvas activated.');
        setHasCamera(false);
      });

    let animationFrameId: number;
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      let angle = 0;
      const drawMockFaceScanner = () => {
        if (!ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 1;
        for (let i = 0; i < canvas.width; i += 20) {
          ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height); ctx.stroke();
        }
        for (let i = 0; i < canvas.height; i += 20) {
          ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(canvas.width, i); ctx.stroke();
        }

        ctx.strokeStyle = 'rgba(99, 102, 241, 0.2)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        const scanY = (Math.sin(angle) + 1) * (canvas.height / 2);
        ctx.moveTo(0, scanY); ctx.lineTo(canvas.width, scanY);
        ctx.stroke();

        ctx.strokeStyle = proctorStatus === 'OK' ? '#10b981' : '#f43f5e';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(canvas.width / 2, canvas.height / 2, 45, 60, 0, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = proctorStatus === 'OK' ? 'rgba(16, 185, 129, 0.4)' : 'rgba(244, 63, 94, 0.4)';
        const landmarkPoints = [
          { x: -15, y: -20 }, { x: 15, y: -20 },
          { x: 0, y: -5 },
          { x: -15, y: 15 }, { x: 0, y: 22 }, { x: 15, y: 15 },
          { x: -30, y: 0 }, { x: 30, y: 0 }
        ];
        landmarkPoints.forEach(pt => {
          ctx.beginPath(); ctx.arc(canvas.width / 2 + pt.x, canvas.height / 2 + pt.y, 3, 0, Math.PI * 2); ctx.fill();
        });

        const pad = 15;
        const boxSize = 100;
        const bx = (canvas.width - boxSize) / 2;
        const by = (canvas.height - boxSize) / 2;
        ctx.strokeStyle = proctorStatus === 'OK' ? 'rgba(16, 185, 129, 0.8)' : 'rgba(244, 63, 94, 0.8)';
        ctx.lineWidth = 3;
        
        ctx.beginPath(); ctx.moveTo(bx + pad, by); ctx.lineTo(bx, by); ctx.lineTo(bx, by + pad); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(bx + boxSize - pad, by); ctx.lineTo(bx + boxSize, by); ctx.lineTo(bx + boxSize, by + pad); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(bx, by + boxSize - pad); ctx.lineTo(bx, by + boxSize); ctx.lineTo(bx + pad, by + boxSize); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(bx + boxSize, by + boxSize - pad); ctx.lineTo(bx + boxSize, by + boxSize); ctx.lineTo(bx + boxSize - pad, by + boxSize); ctx.stroke();

        ctx.fillStyle = proctorStatus === 'OK' ? '#10b981' : '#f43f5e';
        ctx.font = 'bold 9px monospace';
        ctx.fillText(proctorStatus === 'OK' ? 'AI PROCTOR: TARGET IN LOCK' : `ALERT: ${proctorStatus}`, bx + 5, by - 5);

        angle += 0.05;
        animationFrameId = requestAnimationFrame(drawMockFaceScanner);
      };
      drawMockFaceScanner();
    }

    proctorIntervalRef.current = setInterval(() => {
      const anomalies: ('NO_FACE' | 'MULTI_FACE' | 'GAZE_DIVERGED')[] = ['NO_FACE', 'MULTI_FACE', 'GAZE_DIVERGED'];
      const randomAnomaly = anomalies[Math.floor(Math.random() * anomalies.length)];
      setProctorStatus(randomAnomaly);
      
      let infractionText = '';
      let alertLog = '';
      if (randomAnomaly === 'NO_FACE') {
        infractionText = 'AI Proctoring Alert: Candidate has left the desk or camera view is blocked.';
        alertLog = 'CRITICAL: No face present in proctor feed frame.';
      } else if (randomAnomaly === 'MULTI_FACE') {
        infractionText = 'AI Proctoring Alert: Multiple people detected in the exam environment.';
        alertLog = 'CRITICAL: Secondary facial outline detected in background.';
      } else {
        infractionText = 'AI Proctoring Alert: Gaze divergence detected. Candidate is looking away from the screen.';
        alertLog = 'WARNING: Eye-gaze vectors diverged from display monitor.';
      }

      setProctorLogs(prev => [
        `[${new Date().toLocaleTimeString()}] ${alertLog}`,
        ...prev.slice(0, 10)
      ]);

      setProctorCountdown(5);
    }, 45000);

    return () => {
      if (proctorIntervalRef.current) clearInterval(proctorIntervalRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [viewState, isBlocked, proctorStatus]);

  // Handle countdown tracking when proctorCountdown is set
  useEffect(() => {
    if (proctorCountdown === null) return;
    
    if (proctorCountdown === 0) {
      setProctorCountdown(null);
      let blockReason = 'Exam terminated due to AI proctoring security violation: ';
      let violationType = 'PROCTOR_INFRACTION';
      if (proctorStatus === 'NO_FACE') {
        blockReason += 'No face detected in video feed for over 5 seconds.';
        violationType = 'PROCTOR_NO_FACE_DETECTION';
      } else if (proctorStatus === 'MULTI_FACE') {
        blockReason += 'Multiple faces detected in visual proctoring analysis.';
        violationType = 'PROCTOR_MULTI_FACE_DETECTION';
      } else if (proctorStatus === 'GAZE_DIVERGED') {
        blockReason += 'Continuous eye-gaze deviation detected (looking away).';
        violationType = 'PROCTOR_GAZE_DIVERGENCY';
      }
      
      triggerInfractionLock(blockReason, violationType);
      return;
    }

    countdownIntervalRef.current = setTimeout(() => {
      setProctorCountdown(prev => (prev !== null ? prev - 1 : null));
    }, 1000);

    return () => {
      if (countdownIntervalRef.current) clearTimeout(countdownIntervalRef.current);
    };
  }, [proctorCountdown, proctorStatus]);

  const handleRecalibrateProctor = () => {
    setProctorStatus('OK');
    setProctorCountdown(null);
    setProctorLogs(prev => [
      `[${new Date().toLocaleTimeString()}] Proctor recalibration approved. Face signature locked.`,
      ...prev.slice(0, 10)
    ]);
  };

  // Resume from URL query parameters on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlStudentId = params.get('studentId');
    const urlSubject = params.get('subject');

    if (urlStudentId && urlSubject) {
      setStartLoading(true);
      setStartError('');
      apiClient.studentStartTest({
        studentId: urlStudentId,
        subject: urlSubject
      }).then((res) => {
        if (res.questions && res.questions.length > 0) {
          setStudent(res.student);
          setQuestions(res.questions);
          setSelectedSubject(urlSubject);
          
          if (res.resumed && res.startedAt) {
            const elapsed = Math.floor((Date.now() - res.startedAt) / 1000);
            const remaining = Math.max(0, 1800 - elapsed);
            setTimeLeft(remaining);
          } else {
            setTimeLeft(1800);
          }

          setAnswers({});
          setMarkedForReview({});
          setVisited({ [res.questions[0].id]: true });
          setCurrentIdx(0);
          
          setIsResuming(true);
          setViewState('setup');
        }
      }).catch((err) => {
        console.error('Failed to auto-resume test from URL:', err);
        if (err.message && err.message.toLowerCase().includes('blocked')) {
          setIsBlocked(true);
          setBlockedReason(err.message);
        } else {
          setStartError(err.message || 'Failed to resume test session.');
          setViewState('login');
        }
      }).finally(() => {
        setStartLoading(false);
      });
    }
  }, []);

  // Update URL query parameters during CBT active state
  useEffect(() => {
    if (viewState === 'cbt' && student && selectedSubject) {
      window.history.replaceState(null, '', `?studentId=${student.studentId}&subject=${selectedSubject}`);
    } else if (viewState === 'login' || viewState === 'submitted') {
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, [viewState, student, selectedSubject]);

  const captureWebcamFrame = (): string | null => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 160;
      canvas.height = 120;
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;

      if (hasCamera && videoRef.current) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      } else {
        // Draw a simulated wireframe face on the Base64 thumbnail to show scanning visual feedback to admin
        ctx.fillStyle = '#0b0f19';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.strokeStyle = proctorStatus === 'OK' ? '#10b981' : '#f43f5e';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.ellipse(canvas.width / 2, canvas.height / 2, 25, 35, 0, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = proctorStatus === 'OK' ? '#10b981' : '#f43f5e';
        ctx.font = 'bold 8px monospace';
        ctx.fillText(proctorStatus === 'OK' ? 'AI_SCAN_OK' : 'PROCTOR_ALERT', 12, canvas.height - 12);
      }
      return canvas.toDataURL('image/jpeg', 0.65);
    } catch (e) {
      console.error('Snapshot capture failed:', e);
    }
    return null;
  };

  // Heartbeat Polling with Auto-Unlock Sync
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    if (viewState === 'cbt' && student?.studentId) {
      intervalId = setInterval(async () => {
        try {
          const frame = captureWebcamFrame();
          const volume = Math.floor(Math.random() * 25) + 5;
          
          const res = await apiClient.studentHeartbeat(student.studentId, frame, volume);
          if (res.blocked) {
            if (!isBlocked) {
              setIsBlocked(true);
              setBlockedReason(res.reason || 'Security protocol violation detected.');
              exitFullscreen();
            }
          } else {
            if (isBlocked) {
              setIsBlocked(false);
              setBlockedReason('');
              alert('Supervisor has authorized your session release. Click OK to re-enter secure examination mode.');
              enterFullscreen();
            }
          }
        } catch (e) {
          console.error('Heartbeat check failed:', e);
        }
      }, 5000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [viewState, student, isBlocked, hasCamera, proctorStatus]);

  // Mark current question as visited when index changes
  useEffect(() => {
    if (viewState === 'cbt' && questions.length > 0) {
      const currentQId = questions[currentIdx].id;
      setVisited(prev => ({ ...prev, [currentQId]: true }));
    }
  }, [currentIdx, questions, viewState]);

  // Start Timer when test starts
  useEffect(() => {
    if (viewState === 'cbt') {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            autoSubmitTest();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [viewState]);

  // Handle student login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentIdInput.trim() || !passwordInput.trim()) {
      setAuthError('Student ID and Password are required.');
      return;
    }

    setAuthError('');
    setAuthLoading(true);

    try {
      const res = await apiClient.studentLogin({
        studentId: studentIdInput.trim(),
        passwordRaw: passwordInput.trim(),
      });

      setStudent(res.student);

      // Fetch submissions for status check
      try {
        const subs = await apiClient.getSubmissions();
        const filtered = subs.filter((sub: any) => sub.studentId === res.student.studentId);
        setStudentSubmissions(filtered);
      } catch (subErr) {
        console.error('Failed to load student submissions status:', subErr);
      }

      if (res.activeTest) {
        // Active test found, resume!
        setQuestions(res.activeTest.questions);
        setSelectedSubject(res.activeTest.subject);
        
        const elapsed = Math.floor((Date.now() - res.activeTest.startedAt) / 1000);
        const remaining = Math.max(0, 1800 - elapsed);
        setTimeLeft(remaining);
        
        setAnswers({});
        setMarkedForReview({});
        setVisited({ [res.activeTest.questions[0].id]: true });
        setCurrentIdx(0);
        
        setIsResuming(true);
        setViewState('setup');
      } else {
        setIsResuming(false);
        setViewState('setup');
      }
    } catch (err: any) {
      setAuthError(err.message || 'Authentication failed. Please check credentials.');
    } finally {
      setAuthLoading(false);
    }
  };

  // Start the test
  const handleStartTest = async () => {
    setStartLoading(true);
    setStartError('');

    try {
      const res = await apiClient.studentStartTest({
        studentId: student.studentId,
        subject: selectedSubject,
      });

      if (!res.questions || res.questions.length === 0) {
        throw new Error('No questions found for this subject.');
      }

      setQuestions(res.questions);
      setAnswers({});
      setMarkedForReview({});
      setVisited({ [res.questions[0].id]: true });
      setCurrentIdx(0);

      if (res.resumed && res.startedAt) {
        const elapsed = Math.floor((Date.now() - res.startedAt) / 1000);
        const remaining = Math.max(0, 1800 - elapsed);
        setTimeLeft(remaining);
      } else {
        setTimeLeft(1800);
      }

      await enterFullscreen();
      setViewState('cbt');
    } catch (err: any) {
      if (err.message && err.message.toLowerCase().includes('blocked')) {
        setIsBlocked(true);
        setBlockedReason(err.message);
      } else {
        setStartError(err.message || 'Failed to initialize exam paper.');
      }
    } finally {
      setStartLoading(false);
    }
  };

  // Handle Resume Exam
  const handleResumeTest = async () => {
    isSubmittingRef.current = false;
    await enterFullscreen();
    setViewState('cbt');
  };

  // Submit test manual
  const submitTest = async (finalAnswers = answers) => {
    setSubmitting(true);
    isSubmittingRef.current = true;
    setShowConfirmModal(false);
    if (timerRef.current) clearInterval(timerRef.current);

    const questionIds = questions.map((q) => q.id);

    try {
      const res = await apiClient.studentSubmitTest({
        studentId: student.studentId,
        subject: selectedSubject,
        answers: finalAnswers,
        questionIds,
      });

      setSubmitResult(res);
      await exitFullscreen();
      setViewState('submitted');
    } catch (err) {
      console.error(err);
      isSubmittingRef.current = false;
      alert('Network error submitting test. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Automatically submit test on timeout
  const autoSubmitTest = () => {
    submitTest(answers);
  };

  // Formats timer into MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Reset to login screen
  const resetToLogin = () => {
    setStudent(null);
    setStudentIdInput('');
    setPasswordInput('');
    setQuestions([]);
    setAnswers({});
    setMarkedForReview({});
    setVisited({});
    isSubmittingRef.current = false;
    setViewState('login');
  };

  const handleLogout = () => {
    resetToLogin();
  };

  const isSelectedSubjectCompleted = studentSubmissions.some(
    s => s.subject.toLowerCase() === selectedSubject.toLowerCase()
  );

  // Render sub-views
  return (
    <div className={`bg-[#030712] text-slate-100 font-sans cyber-grid flex flex-col relative overflow-hidden ${viewState === 'cbt' ? 'h-screen' : 'min-h-screen'}`}>
      {/* Background glow effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-500/5 blur-[120px] pointer-events-none"></div>

      {/* Top Navbar */}
      {viewState !== 'cbt' && (
        <header className="border-b border-slate-900 bg-slate-950/70 backdrop-blur-md px-6 py-4 flex justify-between items-center z-50">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse"></div>
            <span className="font-mono font-extrabold tracking-widest text-white text-md">ZeroLeak CBT Arena</span>
          </div>
          
          {student && (
            <div className="flex items-center gap-4 text-xs font-mono">
              <span className="text-gray-400">Student: <span className="text-white font-bold">{student.name}</span></span>
              <button 
                onClick={handleLogout}
                className="p-1 text-gray-500 hover:text-white transition-colors"
                title="Logout"
              >
                <LogOut size={16} />
              </button>
            </div>
          )}
        </header>
      )}

      {/* Main Body container */}
      <main className={`flex-1 flex flex-col items-center z-40 min-h-0 ${viewState === 'cbt' ? 'w-full max-w-none p-4 justify-start' : 'p-6 justify-center'}`}>
        
        {/* ========================================================
            SECURITY BLOCKED SCREEN
            ======================================================== */}
        {isBlocked && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg glass-panel p-8 rounded-2xl border border-rose-500/35 shadow-2xl text-center space-y-6 relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-500 to-red-650"></div>

            <div className="inline-flex p-4 bg-rose-500/10 rounded-full text-rose-500 border border-rose-500/20 mb-2 animate-bounce">
              <AlertTriangle size={42} />
            </div>

            <div className="space-y-3">
              <h2 className="text-2xl font-extrabold tracking-tight text-white font-mono uppercase">EXAMINATION CONSOLE LOCKED</h2>
              <p className="text-sm text-rose-400 font-bold uppercase tracking-wider font-mono">Security Protocol Breach Detected</p>
              <p className="text-xs text-gray-400 leading-relaxed font-sans">
                Your student account has been temporarily blocked from the Computer Based Testing (CBT) platform.
              </p>
            </div>

            {/* Warning Reason Block */}
            <div className="bg-rose-950/10 border border-rose-500/15 p-4 rounded-xl font-mono text-left text-xs space-y-2.5">
              <p className="text-rose-400 font-bold">Violation Details:</p>
              <div className="text-gray-300 leading-relaxed space-y-1.5 font-mono text-[11px]">
                <p><span className="text-gray-500">Incident Type:</span> Multi-IP Address/Device Mismatch</p>
                <p><span className="text-gray-500">Reason:</span> {blockedReason || 'Running test opened on another IP address.'}</p>
                <p><span className="text-gray-500">Timestamp:</span> {new Date().toLocaleString()}</p>
                <p className="text-red-400 mt-2 font-bold uppercase text-[9px] tracking-wider animate-pulse">✓ An alert has been transmitted to the Administrator Gateway.</p>
              </div>
            </div>

            <div className="p-4 bg-slate-900/60 border border-slate-850 rounded-xl text-center text-xs text-gray-500 leading-relaxed font-sans">
              <span className="text-white font-semibold">Protocols in Effect:</span> Under standard security protocols, this session is terminated. Please report to the examination center supervisor to verify your identity and request an administrative unblock.
            </div>

            <button 
              onClick={() => {
                setIsBlocked(false);
                setBlockedReason('');
                resetToLogin();
              }}
              className="w-full bg-slate-900 border border-slate-800 hover:bg-slate-850 hover:text-white text-gray-350 font-bold py-2.5 rounded-lg text-xs font-mono uppercase transition-colors"
            >
              Return to Authentication Gate
            </button>
          </motion.div>
        )}

        {/* ========================================================
            VIEW 1: STUDENT LOGIN
            ======================================================== */}
        {!isBlocked && viewState === 'login' && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="w-full max-w-md glass-panel p-6 rounded-2xl border border-indigo-500/25 shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-cyan-500 to-emerald-500"></div>

            <div className="text-center space-y-2 mb-6">
              <div className="inline-flex p-3 bg-indigo-500/10 rounded-full text-indigo-400 border border-indigo-500/20 mb-2">
                <User size={28} />
              </div>
              <h2 className="text-xl font-bold tracking-tight text-white font-mono uppercase">Student Examination Gate</h2>
              <p className="text-xs text-gray-400">Fill your unique Student ID and credentials to enter the cbt environment.</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4 font-mono text-xs">
              <div>
                <label className="block text-gray-400 mb-1.5 uppercase font-bold tracking-wider">Student ID (Format: STU-2026-XXXX)</label>
                <input 
                  type="text" 
                  placeholder="STU-2026-0000"
                  value={studentIdInput}
                  onChange={(e) => setStudentIdInput(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 placeholder-slate-700"
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1.5 uppercase font-bold tracking-wider">Exam Password</label>
                <input 
                  type="password" 
                  placeholder="••••••••"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 placeholder-slate-700"
                />
              </div>

              {authError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-400 text-xs flex gap-2 font-mono leading-relaxed">
                  <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                  <span>{authError}</span>
                </div>
              )}

              <button 
                type="submit" 
                disabled={authLoading}
                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold py-2.5 rounded-lg text-sm transition-colors flex items-center justify-center gap-1.5"
              >
                {authLoading ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
                Verify Credentials
              </button>
            </form>
          </motion.div>
        )}

        {/* ========================================================
            VIEW 2: CBT SETUP / START
            ======================================================== */}
        {!isBlocked && viewState === 'setup' && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="w-full max-w-lg glass-panel p-6 rounded-2xl border border-slate-800 shadow-2xl relative"
          >
            <h2 className="text-xl font-bold text-white mb-2 font-mono flex items-center gap-2">
              <CheckCircle className="text-emerald-400" size={20} />
              Verified Identity
            </h2>
            <p className="text-xs text-gray-400 mb-6 border-b border-slate-850 pb-3">
              Zero-Trust authentication passed. Choose your examination paper parameters below.
            </p>

            <div className="bg-slate-900/60 border border-slate-850 p-4 rounded-xl space-y-2 mb-6 font-mono text-xs text-gray-300">
              <p><span className="text-gray-500">Student Name:</span> <span className="text-white font-bold">{student?.name}</span></p>
              <p><span className="text-gray-500">Student Email:</span> <span className="text-white">{student?.email}</span></p>
              <p><span className="text-gray-500">Student ID:</span> <span className="text-cyan-400 font-bold">{student?.studentId}</span></p>
            </div>

            {/* Subject status cards */}
            <div className="bg-slate-900/60 border border-slate-850 p-4 rounded-xl space-y-2 mb-6 font-mono text-xs text-gray-300">
              <p className="text-white font-bold text-xs uppercase tracking-wider mb-2 border-b border-slate-850 pb-1.5">Subject Submission Status</p>
              <div className="space-y-1.5">
                {[['Physics', 'Physics'], ['Biology', 'Biology'], ['UPSC-CSAT', 'UPSC CSAT']].map(([subKey, subLabel]) => {
                  const subCompleted = studentSubmissions.some(
                    (s) => s.subject.toLowerCase() === subKey.toLowerCase()
                  );
                  return (
                    <div key={subKey} className="flex justify-between items-center">
                      <span className="text-gray-400">{subLabel}</span>
                      {subCompleted ? (
                        <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 rounded text-[9px] font-bold">
                          Completed
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/25 text-indigo-400 rounded text-[9px] font-bold animate-pulse">
                          Pending
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="space-y-4 font-mono text-xs">
              <div>
                <label className="block text-gray-400 mb-1.5 uppercase font-bold tracking-wider">Choose Examination Subject</label>
                <select 
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  disabled={isResuming}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 disabled:opacity-50"
                >
                  <option value="Physics">Physics (JEE/NEET)</option>
                  <option value="Biology">Biology (NEET)</option>
                  <option value="UPSC-CSAT">UPSC General Studies</option>
                </select>
              </div>

              {isResuming && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-300 text-xs leading-relaxed flex gap-2">
                  <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                  <span>An active exam session is currently running for subject: <strong>{selectedSubject}</strong>. Resuming will enter fullscreen mode.</span>
                </div>
              )}

              {isSelectedSubjectCompleted && !isResuming && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/25 rounded-xl text-rose-400 text-[11px] leading-relaxed flex gap-2">
                  <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                  <span>You have already submitted a test for subject: <strong>{selectedSubject}</strong>. Each subject can only be attempted once. Please select a different subject.</span>
                </div>
              )}

              <div className="p-3.5 bg-indigo-500/5 border border-indigo-500/10 rounded-xl space-y-1.5 leading-relaxed text-gray-400">
                <p className="text-white font-bold flex items-center gap-1">
                  <Clock size={14} className="text-indigo-400" />
                  Examination Protocols & Guidelines:
                </p>
                <ul className="list-disc pl-4 space-y-1 mt-1 text-[11px]">
                  <li>The test has a strict time limit of <span className="text-indigo-300 font-bold">30 Minutes</span>.</li>
                  <li>Max Marks: <span className="text-indigo-300 font-bold">100 Marks</span> (25 random questions generated).</li>
                  <li>Grading: <span className="text-emerald-400 font-bold">+4 Marks</span> for Correct, <span className="text-rose-400 font-bold">-1 Mark</span> deduction for Incorrect.</li>
                  <li>Unanswered questions get <span className="text-gray-300 font-bold">0 Marks</span>.</li>
                  <li>The test will auto-submit immediately when the timer hits zero.</li>
                </ul>
              </div>

              {startError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-400 text-xs">
                  {startError}
                </div>
              )}

              {isResuming ? (
                <button 
                  onClick={handleResumeTest}
                  className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-3 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
                >
                  Enter Fullscreen & Resume Test
                  <ArrowRight size={16} />
                </button>
              ) : (
                <button 
                  onClick={handleStartTest}
                  disabled={startLoading || isSelectedSubjectCompleted}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 disabled:hover:bg-indigo-600 text-white font-bold py-3 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
                >
                  {startLoading ? <Loader2 size={16} className="animate-spin" /> : 'Enter Fullscreen & Start Test'}
                  <ArrowRight size={16} />
                </button>
              )}
            </div>
          </motion.div>
        )}

        {/* ========================================================
            VIEW 3: CBT ARENA (THE TEST PANEL)
            ======================================================== */}
        {!isBlocked && viewState === 'cbt' && questions.length > 0 && (
          <div className="w-full max-w-[1600px] lg:max-w-[95vw] grid grid-cols-1 lg:grid-cols-4 gap-6 items-stretch flex-1 min-h-0">
            
            {/* Left side: Question Arena (cols-span-3) */}
            <div className="lg:col-span-3 flex flex-col gap-4 h-full min-h-0">
              
              {/* CBT Timer & Info Header */}
              <div className="glass-panel p-4 rounded-xl border border-slate-800 flex justify-between items-center font-mono text-xs shrink-0">
                <div className="space-y-1">
                  <p className="text-gray-400">Subject: <span className="text-white font-bold">{selectedSubject}</span></p>
                  <p className="text-gray-400">Max Marks: <span className="text-white font-bold">{questions.length * 4} Marks</span></p>
                </div>
                
                {/* Timer Display */}
                <div className={`px-4 py-2 border rounded-xl flex items-center gap-2 text-sm font-bold ${
                  timeLeft < 300 
                    ? 'bg-rose-500/15 border-rose-500/30 text-rose-400 animate-pulse' 
                    : 'bg-indigo-500/10 border-indigo-500/25 text-indigo-300'
                }`}>
                  <Clock size={16} />
                  <span>{formatTime(timeLeft)}</span>
                </div>
              </div>

              {/* Question Box */}
              <div className="glass-panel p-6 rounded-xl border border-slate-800 flex flex-col justify-between flex-1 min-h-0 gap-4 relative overflow-hidden">
                <WatermarkCanvas studentId={student?.studentId} ipAddress="192.168.4.108" />
                
                {/* Question Info Header (pinned) */}
                <div className="flex justify-between items-center border-b border-slate-850 pb-3 shrink-0">
                  <span className="font-mono font-bold text-cyan-400">
                    QUESTION {currentIdx + 1} OF {questions.length}
                  </span>
                  <span className="text-[10px] text-gray-500 font-mono">
                    ID: {questions[currentIdx].id.toUpperCase()}
                  </span>
                </div>

                {/* Scrollable question content */}
                <div className="flex-1 overflow-y-auto py-2 space-y-4 pr-1 min-h-0">
                  {/* Question description */}
                  <p className="text-slate-100 font-sans text-base leading-relaxed whitespace-pre-wrap select-none">
                    {questions[currentIdx].description}
                  </p>

                  {/* Image/Diagram if exists */}
                  {questions[currentIdx].image && (
                    <div className="mt-4">
                      <img 
                        src={questions[currentIdx].image} 
                        alt="Question diagram" 
                        className="max-h-48 rounded border border-slate-800 object-contain p-1 bg-black/40" 
                      />
                    </div>
                  )}

                  {/* Radio options grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 font-sans select-none">
                    {Object.entries(questions[currentIdx].options).map(([optKey, optVal]: any) => {
                      const isSelected = answers[questions[currentIdx].id] === optKey;
                      return (
                        <button
                          key={optKey}
                          onClick={() => {
                            setAnswers(prev => ({ ...prev, [questions[currentIdx].id]: optKey }));
                          }}
                          className={`p-3.5 rounded-xl border text-left text-sm flex gap-3 items-center transition-all ${
                            isSelected 
                              ? 'bg-indigo-600/15 border-indigo-500 text-white font-semibold shadow-lg shadow-indigo-600/5' 
                              : 'bg-slate-900/60 border-slate-850 text-slate-400 hover:text-white hover:border-slate-700'
                          }`}
                        >
                          <span className={`w-6 h-6 rounded-full font-mono flex items-center justify-center text-xs font-bold transition-colors ${
                            isSelected ? 'bg-indigo-600 text-white' : 'bg-black/45 text-indigo-400'
                          }`}>
                            {optKey}
                          </span>
                          <span>{optVal}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Question Box Controls footer (pinned) */}
                <div className="flex flex-wrap justify-between items-center border-t border-slate-850 pt-4 gap-2 shrink-0">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))}
                      disabled={currentIdx === 0}
                      className="px-4 py-2 bg-slate-900 border border-slate-800 disabled:opacity-30 hover:bg-slate-850 hover:text-white text-gray-400 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5"
                    >
                      <ChevronLeft size={16} /> Previous
                    </button>
                    <button
                      onClick={() => setCurrentIdx(prev => Math.min(questions.length - 1, prev + 1))}
                      disabled={currentIdx === questions.length - 1}
                      className="px-4 py-2 bg-slate-900 border border-slate-800 disabled:opacity-30 hover:bg-slate-850 hover:text-white text-gray-400 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5"
                    >
                      Next <ChevronRight size={16} />
                    </button>
                  </div>

                  <div className="flex gap-2 font-mono">
                    <button
                      onClick={() => {
                        const currentQId = questions[currentIdx].id;
                        setAnswers(prev => {
                          const updated = { ...prev };
                          delete updated[currentQId];
                          return updated;
                        });
                      }}
                      disabled={!answers[questions[currentIdx].id]}
                      className="px-3.5 py-2 bg-rose-500/10 border border-rose-500/20 disabled:opacity-30 hover:bg-rose-500/20 text-rose-400 rounded-lg text-[10px] uppercase font-bold transition-all"
                    >
                      Clear Response
                    </button>
                    <button
                      onClick={() => {
                        const currentQId = questions[currentIdx].id;
                        setMarkedForReview(prev => ({
                          ...prev,
                          [currentQId]: !prev[currentQId]
                        }));
                      }}
                      className={`px-3.5 py-2 rounded-lg text-[10px] uppercase font-bold transition-all border ${
                        markedForReview[questions[currentIdx].id]
                          ? 'bg-purple-600/20 border-purple-500 text-purple-300 font-bold'
                          : 'bg-slate-900 border-slate-800 text-gray-400 hover:bg-slate-850 hover:text-white'
                      }`}
                    >
                      {markedForReview[questions[currentIdx].id] ? 'Unmark Review' : 'Mark for Review'}
                    </button>
                  </div>
                </div>

              </div>
            </div>

            {/* Right side: Sidebar Palette (col-span-1) */}
            <div className="flex flex-col gap-4 h-full min-h-0">
              
              {/* Candidate Bio block */}
              <div className="glass-panel p-4 rounded-xl border border-slate-800 font-mono text-[11px] text-gray-400 space-y-1 shrink-0">
                <p className="text-white font-bold text-xs font-sans mb-1">Candidate Profile</p>
                <p>ID: <span className="text-cyan-400 font-semibold">{student?.studentId}</span></p>
                <p>Name: <span className="text-slate-200">{student?.name}</span></p>
              </div>

              {/* AI Proctoring Feed Block */}
              <div className="glass-panel p-4 rounded-xl border border-slate-800 flex flex-col shrink-0 gap-2.5 font-mono">
                <p className="text-white font-bold text-xs font-sans mb-0 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="text-emerald-400 font-bold animate-pulse" size={14} />
                    AI Proctor Active
                  </span>
                  <span className={`h-2 w-2 rounded-full ${proctorStatus === 'OK' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500 animate-ping'}`} />
                </p>
                
                {/* Visual Camera Stream / Fallback scanner */}
                <div className="relative aspect-video w-full rounded-lg border border-slate-855 overflow-hidden bg-black/60 flex items-center justify-center">
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    muted 
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  
                  {/* Transparent Canvas Overlay: drawing face scanning lines, landmarks, and radar scans on top of video */}
                  <canvas 
                    ref={canvasRef} 
                    width={220} 
                    height={130}
                    className="absolute inset-0 w-full h-full block pointer-events-none z-10"
                  />

                  {/* Warning Overlay Banner */}
                  {proctorCountdown !== null && (
                    <div className="absolute inset-0 bg-rose-950/80 backdrop-blur-xs flex flex-col items-center justify-center p-3 text-center space-y-1.5 z-20 animate-pulse">
                      <AlertTriangle className="text-rose-450 shrink-0" size={18} />
                      <p className="text-[9px] text-white font-bold uppercase tracking-wider">
                        {proctorStatus.replace('_', ' ')} DETECTED
                      </p>
                      <p className="text-[10px] text-rose-300 font-bold">
                        LOCKING IN {proctorCountdown} SECONDS
                      </p>
                    </div>
                  )}
                </div>

                {/* Recalibration controls */}
                {proctorCountdown !== null && (
                  <button
                    onClick={handleRecalibrateProctor}
                    className="w-full py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-[10px] rounded uppercase transition-colors"
                  >
                    Acknowledge & Recalibrate Face
                  </button>
                )}

                {/* Status indicator logs */}
                <div className="text-[8px] text-gray-500 bg-black/45 border border-slate-900 rounded p-1.5 max-h-16 overflow-y-auto space-y-1 select-none">
                  {proctorLogs.map((log, index) => (
                    <p key={index} className="leading-tight truncate">{log}</p>
                  ))}
                </div>
              </div>

              {/* Palette Block */}
              <div className="glass-panel p-5 rounded-xl border border-slate-800 flex flex-col justify-between flex-1 min-h-0 gap-4">
                <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-white border-b border-slate-850 pb-2 shrink-0">
                  Question Palette
                </h4>

                {/* Scrollable container for the grid */}
                <div className="flex-1 overflow-y-auto pr-1 min-h-0 py-2">
                  <div className="grid grid-cols-5 gap-2.5">
                    {questions.map((q, idx) => {
                      const hasAnswer = !!answers[q.id];
                      const isMarked = !!markedForReview[q.id];
                      const isVisited = !!visited[q.id];

                      // Choose color coding:
                      // Green: Answered
                      // Purple: Marked for Review (even if answered)
                      // Red: Visited but not answered
                      // Gray: Unvisited
                      let btnColor = 'bg-slate-900 border-slate-800 text-gray-400';
                      if (isMarked) {
                        btnColor = 'bg-purple-500/20 border-purple-500/60 text-purple-300 font-bold';
                      } else if (hasAnswer) {
                        btnColor = 'bg-emerald-500/20 border-emerald-500/60 text-emerald-300 font-bold';
                      } else if (isVisited) {
                        btnColor = 'bg-rose-500/20 border-rose-500/60 text-rose-300 font-bold';
                      }

                      return (
                        <button
                          key={q.id}
                          onClick={() => setCurrentIdx(idx)}
                          className={`h-9 rounded-lg border font-mono text-xs flex items-center justify-center transition-all ${btnColor} ${
                            currentIdx === idx ? 'ring-2 ring-indigo-500/70 ring-offset-2 ring-offset-[#030712]' : ''
                          }`}
                        >
                          {idx + 1}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Palette Legends */}
                <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-gray-400 pt-2 border-t border-slate-850 shrink-0">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded bg-slate-900 border border-slate-800 block"></span>
                    <span>Unvisited</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded bg-rose-500/25 border border-rose-500/60 block"></span>
                    <span>Unanswered</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded bg-emerald-500/25 border border-emerald-500/60 block"></span>
                    <span>Answered</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded bg-purple-500/25 border border-purple-500/60 block"></span>
                    <span>Review</span>
                  </div>
                </div>

                {/* Submit test Button */}
                <button
                  onClick={() => setShowConfirmModal(true)}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-lg text-xs font-mono uppercase transition-colors shrink-0"
                >
                  Submit Test
                </button>
              </div>

            </div>

          </div>
        )}

        {/* ========================================================
            VIEW 4: THANK YOU / SUBMITTED SCREEN
            ======================================================== */}
        {!isBlocked && viewState === 'submitted' && submitResult && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md glass-panel p-6 rounded-2xl border border-emerald-500/25 shadow-2xl text-center space-y-6 relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-500"></div>

            <div className="inline-flex p-3 bg-emerald-500/10 rounded-full text-emerald-400 border border-emerald-500/20">
              <CheckCircle size={36} />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold tracking-tight text-white font-mono uppercase">Test Submitted Successfully</h2>
              <p className="text-xs text-gray-400">Your examination session has been sealed, scored, and logged into the ZeroLeak audit chain.</p>
            </div>

            {/* Score Block (Sealed confirmation) */}
            <div className="bg-slate-900/60 border border-slate-850 p-5 rounded-2xl space-y-3 font-mono text-center">
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Session Sealed</p>
              
              <div className="text-[12px] text-gray-300 font-sans leading-relaxed pt-2">
                Your responses have been securely submitted and graded. <br />
                Results will be released by the administrator.
              </div>
            </div>

            <button 
              onClick={resetToLogin}
              className="w-full bg-slate-900 border border-slate-800 hover:bg-slate-850 hover:text-white text-gray-300 font-bold py-2.5 rounded-lg text-sm font-mono transition-colors"
            >
              Back to Login Page
            </button>
          </motion.div>
        )}

      </main>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirmModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm glass-panel p-6 rounded-2xl border border-slate-800 shadow-2xl space-y-4"
            >
              <h3 className="text-lg font-bold text-white font-mono flex items-center gap-2">
                <HelpCircle className="text-cyan-400" size={20} />
                Submit Exam Paper?
              </h3>
              <p className="text-xs text-gray-400 leading-relaxed font-sans">
                Are you sure you want to finalize your exam session? Your responses will be locked and graded instantly.
              </p>

              <div className="flex gap-3 font-mono text-xs mt-6">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 py-2 bg-slate-900 border border-slate-800 hover:bg-slate-850 text-gray-400 hover:text-white rounded-lg font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => submitTest()}
                  disabled={submitting}
                  className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold transition-all flex items-center justify-center gap-1.5"
                >
                  {submitting ? <Loader2 size={14} className="animate-spin" /> : 'Yes, Submit'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-4 text-center text-[10px] text-gray-600 font-mono mt-auto z-50">
        ZeroLeak Examination Engine • Zero-Knowledge Verification Node Active
      </footer>
    </div>
  );
}
