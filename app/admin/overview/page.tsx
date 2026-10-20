'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { StatusBeacon } from '@/components/ui/StatusBeacon';
import { formatBytes, formatArabicDateTime, formatNumber } from '@/lib/i18n';
import type {
  WhatsAppSessionState,
  DownloadItem,
  SystemMetrics,
  SystemLogEntry,
} from '@/lib/types';
import styles from './overview.module.css';

export default function OverviewPage() {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [whatsapp, setWhatsapp] = useState<WhatsAppSessionState | null>(null);
  const [activeDownloads, setActiveDownloads] = useState<DownloadItem[]>([]);
  const [recentLogs, setRecentLogs] = useState<SystemLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadDashboardData = async () => {
    try {
      const [statsRes, downloadsRes, logsRes] = await Promise.all([
        fetch('/api/system/stats').then((r) => r.json()),
        fetch('/api/downloads').then((r) => r.json()),
        fetch('/api/logs?level=all').then((r) => r.json()),
      ]);

      if (statsRes.metrics) setMetrics(statsRes.metrics);
      if (downloadsRes.active) setActiveDownloads(downloadsRes.active);
      if (logsRes.logs) setRecentLogs(logsRes.logs.slice(0, 4));

      const statusRes = await fetch('/api/whatsapp/status').then((r) => r.json());
      if (statusRes.session) setWhatsapp(statusRes.session);
    } catch {
      // handled quietly
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={styles.overviewGrid}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>لوحة مؤشرات النشاط</h1>
          <p className={styles.pageSubtitle}>
            ملخص حي لاتصال واتساب، طابور التنزيل الجاري، واستهلاك موارد النظام.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <Button variant="secondary" size="sm" onClick={loadDashboardData}>
            تحديث المؤشرات
          </Button>
          <Link href="/admin/connection">
            <Button variant="primary" size="sm">
              إدارة اتصال واتساب ↗
            </Button>
          </Link>
        </div>
      </div>

      {/* 4 Stat Cards Strip */}
      <div className={styles.statsStrip}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>التنزيلات النشطة حالياً</span>
          <span className={styles.statValue}>
            {formatNumber(metrics?.activeDownloads ?? activeDownloads.length)}
          </span>
          <span className={styles.statMeta}>طابور المعالجة اللحظي</span>
        </div>

        <div className={styles.statCard}>
          <span className={styles.statLabel}>إجمالي التنزيلات الناجحة</span>
          <span className={styles.statValue}>
            {formatNumber(metrics?.totalDownloadsSuccess ?? 0)}
          </span>
          <span className={styles.statMeta}>نسبة الإنجاز 98.2%</span>
        </div>

        <div className={styles.statCard}>
          <span className={styles.statLabel}>الرسائل والأوامر المعالجة</span>
          <span className={styles.statValue}>
            {formatNumber(metrics?.processedMessagesCount ?? 0)}
          </span>
          <span className={styles.statMeta}>عبر كافة الدردشات</span>
        </div>

        <div className={styles.statCard}>
          <span className={styles.statLabel}>التخزين المؤقت المستهلك</span>
          <span className={styles.statValue}>
            {formatBytes((metrics?.tempStorageUsedMb ?? 0) * 1024 * 1024)}
          </span>
          <span className={styles.statMeta}>
            من أصل {formatBytes((metrics?.tempStorageMaxMb ?? 2048) * 1024 * 1024)}
          </span>
        </div>
      </div>

      {/* Dual Section: WhatsApp Status & Active Downloads */}
      <div className={styles.dualSection}>
        {/* WhatsApp Connection Summary */}
        <Card
          title="حالة اتصال البوت"
          subtitle="المقبس الخادمي عبر تقنية Baileys Multi-Device"
          headerAction={
            <StatusBeacon
              status={whatsapp?.status || 'disconnected'}
              showLabel={true}
            />
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div
              style={{
                backgroundColor: 'var(--bg-elevated)',
                padding: 'var(--space-4)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-2)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-size-xs)' }}>
                <span style={{ color: 'var(--text-tertiary)' }}>الرقم المقترن:</span>
                <span className="tabular-numbers">
                  {whatsapp?.phoneNumber || 'لا يوجد رقم مقترن حالياً'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-size-xs)' }}>
                <span style={{ color: 'var(--text-tertiary)' }}>تاريخ بدء الجلسة:</span>
                <span>{formatArabicDateTime(whatsapp?.connectedAt)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-size-xs)' }}>
                <span style={{ color: 'var(--text-tertiary)' }}>معرف العميل الخادمي:</span>
                <span>{whatsapp?.deviceInfo?.platform || 'WhatsApp Companion Node'}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
              <Link href="/admin/connection" style={{ flex: 1 }}>
                <Button variant="secondary" size="sm" style={{ width: '100%' }}>
                  {whatsapp?.status === 'connected' ? 'فحص أو قطع الجلسة' : 'بدء الاقتران برقم هاتف'}
                </Button>
              </Link>
            </div>
          </div>
        </Card>

        {/* Active Download Queue Preview */}
        <Card
          title="طابور التنزيل النشط"
          subtitle="الملفات قيد المعالجة والاستخراج الآن"
          headerAction={
            <Link href="/admin/downloads">
              <Button variant="ghost" size="sm">
                عرض كامل الطابور ↗
              </Button>
            </Link>
          }
        >
          {activeDownloads.length === 0 ? (
            <div style={{ padding: 'var(--space-6)', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: 'var(--font-size-sm)' }}>
              لا توجد عمليات تنزيل نشطة في هذه اللحظة.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              {activeDownloads.map((dl) => (
                <div
                  key={dl.id}
                  style={{
                    backgroundColor: 'var(--bg-elevated)',
                    padding: 'var(--space-4)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'var(--space-2)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-primary)' }}>
                      {dl.title}
                    </strong>
                    <Badge variant={dl.status === 'downloading' ? 'info' : 'warning'}>
                      {dl.status === 'downloading' ? 'جاري التحميل' : 'في الانتظار'}
                    </Badge>
                  </div>
                  <ProgressBar
                    progress={dl.progressPercent}
                    speedText={dl.downloadSpeed}
                    label={formatBytes(dl.fileSizeBytes)}
                  />
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Recent System Activity Logs */}
      <Card
        title="أحدث سجلات النظام"
        subtitle="آخر العمليات التقنية وأحداث المقبس الموثقة"
        headerAction={
          <Link href="/admin/logs">
            <Button variant="ghost" size="sm">
              عرض كافة السجلات ↗
            </Button>
          </Link>
        }
      >
        <div className={styles.logList}>
          {recentLogs.length === 0 ? (
            <div style={{ padding: 'var(--space-4)', color: 'var(--text-tertiary)' }}>
              لا توجد سجلات بعد.
            </div>
          ) : (
            recentLogs.map((log) => (
              <div key={log.id} className={styles.logRow}>
                <div className={styles.logHeader}>
                  <span style={{ color: 'var(--text-secondary)' }}>
                    {log.source === 'whatsapp_socket'
                      ? 'مقبس واتساب'
                      : log.source === 'downloader'
                      ? 'محرك التنزيل'
                      : log.source === 'gemini_ai'
                      ? 'نموذج التفكير (Gemini)'
                      : 'النظام العام'}
                  </span>
                  <time className="tabular-numbers">
                    {formatArabicDateTime(log.timestamp)}
                  </time>
                </div>
                <div style={{ color: 'var(--text-primary)' }}>{log.message}</div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
