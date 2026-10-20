import type {
  WhatsAppSessionState,
  DownloadItem,
  BotCommandRule,
  SystemLogEntry,
  SystemMetrics,
  AdminUserSettings,
} from '@/lib/types';
import { GoogleGenAI } from '@google/genai';

// In-memory persistent state across requests in the Node process
interface AppServerState {
  whatsapp: WhatsAppSessionState;
  downloads: DownloadItem[];
  commands: BotCommandRule[];
  logs: SystemLogEntry[];
  settings: AdminUserSettings;
  processedMessagesCount: number;
  startTime: number;
}

// Global singleton across hot reloads in Node
declare global {
  // eslint-disable-next-line no-var
  var __APP_STATE__: AppServerState | undefined;
}

// Real bot command definitions with zero fake usage counts
const initialCommands: BotCommandRule[] = [
  {
    id: 'cmd-1',
    trigger: '/help',
    description: 'عرض رسالة الترحيب وقائمة الأوامر المتاحة وإرشادات التنزيل',
    category: 'system',
    enabled: true,
    rateLimitPerMinute: 15,
    requiresAdmin: false,
    usageCount: 0,
  },
  {
    id: 'cmd-2',
    trigger: '/video',
    description: 'استخراج وتنزيل مقاطع الفيديو من الروابط العامة المدعومة',
    category: 'media',
    enabled: true,
    rateLimitPerMinute: 6,
    requiresAdmin: false,
    usageCount: 0,
  },
  {
    id: 'cmd-3',
    trigger: '/audio',
    description: 'استخلاص الصوت من مقاطع الفيديو وتحويله إلى صيغة صوتية نقية',
    category: 'media',
    enabled: true,
    rateLimitPerMinute: 8,
    requiresAdmin: false,
    usageCount: 0,
  },
  {
    id: 'cmd-4',
    trigger: '/get',
    description: 'تنزيل مباشر للمستندات والملفات العامة مع التحقق من الأمان والحجم',
    category: 'media',
    enabled: true,
    rateLimitPerMinute: 5,
    requiresAdmin: false,
    usageCount: 0,
  },
  {
    id: 'cmd-5',
    trigger: '/ask',
    description: 'طرح استفسارات ذكية ومعالجتها بمحرك التفكير المتقدم (Gemini 4 Argon)',
    category: 'ai',
    enabled: true,
    rateLimitPerMinute: 10,
    requiresAdmin: false,
    usageCount: 0,
    thinkingModeEnabled: true,
  },
  {
    id: 'cmd-6',
    trigger: '/status',
    description: 'فحص حالة اتصال البوت وصحة السيرفر وسرعة الاستجابة',
    category: 'system',
    enabled: true,
    rateLimitPerMinute: 5,
    requiresAdmin: true,
    usageCount: 0,
  },
];

export function getAppState(): AppServerState {
  if (!global.__APP_STATE__) {
    global.__APP_STATE__ = {
      whatsapp: {
        status: 'disconnected',
        reconnectAttempts: 0,
      },
      downloads: [], // Zero mock downloads: pure real state
      commands: initialCommands,
      logs: [], // Zero mock logs: populated only by real operations
      settings: {
        maxFileSizeMb: 100,
        autoCleanupHours: 6,
        geminiThinkingEnabled: true,
        allowedDomains: [
          'archive.org',
          'wikimedia.org',
          'github.com',
          'raw.githubusercontent.com',
          'w3.org',
          'youtube.com',
          'youtu.be',
          'tiktok.com',
          'instagram.com',
          'twitter.com',
          'x.com',
        ],
        rateLimitPerUserPerMinute: 8,
      },
      processedMessagesCount: 0,
      startTime: Date.now(),
    };
  }
  return global.__APP_STATE__;
}

/**
 * Calculate dynamic real-time metrics strictly from real data
 */
export function calculateRealMetrics(): SystemMetrics {
  const state = getAppState();
  const activeDownloads = state.downloads.filter(
    (d) => d.status === 'downloading' || d.status === 'queued'
  ).length;

  const totalDownloadsSuccess = state.downloads.filter(
    (d) => d.status === 'completed'
  ).length;

  const totalDownloadsFailed = state.downloads.filter(
    (d) => d.status === 'failed'
  ).length;

  const totalBytesUsed = state.downloads.reduce((acc, curr) => {
    return acc + (curr.fileSizeBytes || 0);
  }, 0);

  const tempStorageUsedMb = Math.round((totalBytesUsed / (1024 * 1024)) * 10) / 10;
  const memoryUsageMb = Math.round(process.memoryUsage().heapUsed / (1024 * 1024));

  return {
    uptimeSeconds: Math.floor((Date.now() - state.startTime) / 1000),
    activeDownloads,
    totalDownloadsSuccess,
    totalDownloadsFailed,
    memoryUsageMb,
    tempStorageUsedMb,
    tempStorageMaxMb: 2048,
    processedMessagesCount: state.processedMessagesCount,
  };
}

/**
 * Validate URL to prevent Server-Side Request Forgery (SSRF)
 */
export function validateUrlForSsrf(urlString: string): {
  valid: boolean;
  reason?: string;
  hostname?: string;
} {
  try {
    const url = new URL(urlString);
    if (!['http:', 'https:'].includes(url.protocol)) {
      return { valid: false, reason: 'البروتوكول غير مدعوم، يجب أن يكون http أو https.' };
    }

    const host = url.hostname.toLowerCase();
    // Block loopback, localhost, and cloud metadata
    if (
      host === 'localhost' ||
      host === '127.0.0.1' ||
      host === '::1' ||
      host === '169.254.169.254' ||
      host.endsWith('.internal') ||
      host.endsWith('.local')
    ) {
      return { valid: false, reason: 'العنوان يشير إلى شبكة داخلية محظورة لحماية الخادم.' };
    }

    // Check private IPv4 blocks
    const ipParts = host.split('.').map(Number);
    if (ipParts.length === 4 && ipParts.every((p) => !isNaN(p))) {
      const [p0, p1] = ipParts;
      if (
        p0 === 10 ||
        p0 === 127 ||
        (p0 === 172 && p1 >= 16 && p1 <= 31) ||
        (p0 === 192 && p1 === 168)
      ) {
        return { valid: false, reason: 'حظر الاتصال بعناوين IP الخاصة (RFC 1918).' };
      }
    }

    return { valid: true, hostname: host };
  } catch {
    return { valid: false, reason: 'صيغة الرابط غير صحيحة.' };
  }
}

/**
 * Generate official 8-character pairing code formatted as XXXX-XXXX
 */
export function generatePairingCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let p1 = '';
  let p2 = '';
  for (let i = 0; i < 4; i++) {
    p1 += chars.charAt(Math.floor(Math.random() * chars.length));
    p2 += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${p1}-${p2}`;
}

/**
 * Add sanitized system log entry
 */
export function addSystemLog(
  level: SystemLogEntry['level'],
  source: SystemLogEntry['source'],
  message: string,
  details?: Record<string, unknown>
): void {
  const state = getAppState();
  const entry: SystemLogEntry = {
    id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    timestamp: new Date().toISOString(),
    level,
    source,
    message,
    details,
  };
  state.logs.unshift(entry);
  if (state.logs.length > 250) {
    state.logs.pop();
  }
}

/**
 * Execute Gemini Thinking query with gemini-4-argon and HIGH thinking level
 */
export async function executeGeminiThinkingQuery(promptText: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return 'محرك الذكاء الاصطناعي قيد التكوين (مفتاح GEMINI_API_KEY غير مضاف). تم تلقي الأمر بنجاح.';
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    // Use gemini-4-argon with thinkingLevel: HIGH per project instructions
    const response = await ai.models.generateContent({
      model: 'gemini-4-argon',
      contents: promptText,
      config: {
        thinkingConfig: {
          thinkingLevel: 'HIGH' as any,
        },
      },
    });

    return response.text || 'لم يتم استلام نص استجابة من نموذج التفكير.';
  } catch (err: any) {
    addSystemLog('error', 'gemini_ai', `تعذر استدعاء نموذج التفكير: ${err?.message || err}`);
    return `تعذر تشغيل نموذج التفكير حالياً: ${err?.message || 'خطأ غير معروف'}`;
  }
}
