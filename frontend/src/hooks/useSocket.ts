import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useStore } from '../lib/store';

export const useSocket = () => {
  const socketRef = useRef<Socket | null>(null);
  
  const {
    addBlock,
    addSecurityEvent,
    addAuditLog,
    updateExam,
    setStats,
    setNodes,
    addLatencyMetric,
    addOverheadMetric,
    stats
  } = useStore();

  useEffect(() => {
    // Connect to NestJS socket server on port 5001
    const socket = io('http://localhost:5001', {
      transports: ['websocket'],
      autoConnect: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('[WebSocket] Connected to secure event stream on port 5001');
    });

    socket.on('disconnect', () => {
      console.log('[WebSocket] Disconnected from secure event stream');
    });

    // Realtime handlers
    socket.on('blockchain_block', (block) => {
      console.log('[WebSocket] New block committed:', block);
      addBlock(block);
      setStats({ blockchainHeight: block.index });
    });

    socket.on('security_event', (event) => {
      console.warn('[WebSocket] Threat alert detected:', event);
      addSecurityEvent(event);
    });

    socket.on('audit_log', (log) => {
      console.log('[WebSocket] Audit entry written:', log);
      addAuditLog(log);
    });

    socket.on('exam_update', (exam) => {
      console.log('[WebSocket] Exam state transition:', exam);
      updateExam(exam);
    });

    socket.on('nodes_sync', (nodes) => {
      setNodes(nodes);
    });

    socket.on('system_config_update', (config) => {
      setStats({
        securityScore: config.securityScore,
        threatLevel: config.threatLevel
      });
    });

    socket.on('metrics_update', (metric) => {
      if (metric.type === 'generation_latency') {
        addLatencyMetric({
          timestamp: metric.timestamp,
          latencyMs: metric.latencyMs,
          examId: metric.examId
        });
      } else if (metric.type === 'encryption_overhead') {
        addOverheadMetric({
          timestamp: metric.timestamp,
          dataSize: metric.dataSize,
          overheadMs: metric.overheadMs
        });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [addBlock, addSecurityEvent, addAuditLog, updateExam, setStats, setNodes, addLatencyMetric, addOverheadMetric]);

  return socketRef.current;
};
