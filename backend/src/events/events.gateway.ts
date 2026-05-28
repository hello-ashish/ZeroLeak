import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
@Injectable()
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private activeClients = new Set<string>();

  handleConnection(client: Socket) {
    this.activeClients.add(client.id);
    console.log(`[WebSocket] Client connected: ${client.id} (Total: ${this.activeClients.size})`);
    
    // Send initial greeting with connection details
    client.emit('system_status', {
      connected: true,
      timestamp: Date.now(),
      clientId: client.id,
      version: '1.0.0-MVP'
    });
  }

  handleDisconnect(client: Socket) {
    this.activeClients.add(client.id);
    this.activeClients.delete(client.id);
    console.log(`[WebSocket] Client disconnected: ${client.id} (Total: ${this.activeClients.size})`);
  }

  // Broadcaster methods that agents/controllers can call
  broadcastBlockAdded(block: any) {
    if (this.server) {
      this.server.emit('blockchain_block', block);
    }
  }

  broadcastSecurityEvent(event: any) {
    if (this.server) {
      this.server.emit('security_event', event);
    }
  }

  broadcastAuditLog(log: any) {
    if (this.server) {
      this.server.emit('audit_log', log);
    }
  }

  broadcastExamUpdate(exam: any) {
    if (this.server) {
      this.server.emit('exam_update', exam);
    }
  }

  broadcastMetricsUpdate(metrics: any) {
    if (this.server) {
      this.server.emit('metrics_update', metrics);
    }
  }

  broadcastPaperGenerationProgress(progress: { examId: string; step: number; totalSteps: number; message: string; data?: any }) {
    if (this.server) {
      this.server.emit('generation_progress', progress);
    }
  }

  broadcastNodeSync(nodes: any[]) {
    if (this.server) {
      this.server.emit('nodes_sync', nodes);
    }
  }

  @SubscribeMessage('ping')
  handlePing(client: Socket, data: any): string {
    return 'pong';
  }
}
