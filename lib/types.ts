/**
 * WhatsApp Bot Pro — Domain Types & Interfaces
 */

export type WhatsAppConnectionStatus =
  | 'disconnected'
  | 'pairing'
  | 'connected'
  | 'error';

export interface WhatsAppSessionState {
  status: WhatsAppConnectionStatus;
  phoneNumber?: string;
  pairingCode?: string;
  pairingCodeExpiresAt?: number; // epoch ms
  connectedAt?: string;
  deviceInfo?: {
    platform?: string;
    pushName?: string;
    phoneModel?: string;
  };
  lastError?: string;
  reconnectAttempts: number;
}

export type DownloadStatus =
  | 'queued'
  | 'downloading'
  | 'completed'
  | 'failed'
  | 'cancelled';

export type DownloadType = 'video' | 'audio' | 'document' | 'image';

export interface DownloadItem {
  id: string;
  url: string;
  sourceDomain: string;
  title: string;
  type: DownloadType;
  status: DownloadStatus;
  progressPercent: number;
  downloadSpeed?: string; // e.g. "2.4 MB/s"
  fileSizeBytes?: number;
  extractedFileName?: string;
  requestedBy: string; // WhatsApp sender e.g. "+966 50 123 4567"
  createdAt: string;
  completedAt?: string;
  errorReason?: string;
}

export interface BotCommandRule {
  id: string;
  trigger: string; // e.g. "/video"
  description: string;
  category: 'media' | 'system' | 'ai' | 'utility';
  enabled: boolean;
  rateLimitPerMinute: number;
  requiresAdmin: boolean;
  usageCount: number;
  thinkingModeEnabled?: boolean; // uses gemini-4-argon with high thinking
}

export type LogLevel = 'info' | 'success' | 'warn' | 'error';

export interface SystemLogEntry {
  id: string;
  timestamp: string;
  level: LogLevel;
  source: 'whatsapp_socket' | 'downloader' | 'auth' | 'system' | 'gemini_ai';
  message: string;
  details?: Record<string, unknown>;
}

export interface SystemMetrics {
  uptimeSeconds: number;
  activeDownloads: number;
  totalDownloadsSuccess: number;
  totalDownloadsFailed: number;
  memoryUsageMb: number;
  tempStorageUsedMb: number;
  tempStorageMaxMb: number;
  processedMessagesCount: number;
}

export interface AdminUserSettings {
  maxFileSizeMb: number;
  autoCleanupHours: number;
  geminiThinkingEnabled: boolean;
  allowedDomains: string[];
  rateLimitPerUserPerMinute: number;
}
