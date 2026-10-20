'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { EmptyState } from '@/components/ui/EmptyState';
import { ar, formatBytes, formatArabicDateTime } from '@/lib/i18n';
import type { DownloadItem } from '@/lib/types';

export default function DownloadsPage() {
  const [activeItems, setActiveItems] = useState<DownloadItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [manualUrl, setManualUrl] = useState('');
  const [manualType, setManualType] = useState<'video' | 'audio' | 'document'>('video');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const fetchDownloads = async () => {
    try {
      const res = await fetch('/api/downloads');
      const data = await res.json();
      if (data?.active) {
        setActiveItems(data.active);
      }
    } catch {
      // quiet
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDownloads();
    const interval = setInterval(fetchDownloads, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleCancel = async (id: string) => {
    try {
      await fetch('/api/downloads/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      fetchDownloads();
    } catch {
      // quiet
    }
  };

  const handleCreateDownload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualUrl) return;

    setIsSubmitting(true);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/downloads/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: manualUrl,
          type: manualType,
          requestedBy: '+966 50 (المشرف يدوي)',
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setStatusMessage({ text: data.error || 'فشل بدء التنزيل.', type: 'error' });
      } else {
        setStatusMessage({ text: 'تمت إضافة الرابط لطابور المعالجة بنجاح.', type: 'success' });
        setManualUrl('');
        fetchDownloads();
      }
    } catch {
      setStatusMessage({ text: 'حدث خطأ في الاتصال بالخادم.', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)' }}>
            {ar.downloads.title}
          </h1>
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', marginTop: 'var(--space-1)' }}>
            {ar.downloads.description}
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={fetchDownloads}>
          تحديث الطابور
        </Button>
      </div>

      {/* Manual Link Injection Test (Admin Diagnostic with SSRF validation) */}
      <Card
        title="إرسال رابط تجريبي للطابور"
        subtitle="اختبار محرك التحميل وفحص أمان النطاقات (SSRF Protection)"
      >
        <form onSubmit={handleCreateDownload} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {statusMessage && (
            <div
              style={{
                padding: 'var(--space-3) var(--space-4)',
                borderRadius: 'var(--radius-sm)',
                fontSize: 'var(--font-size-sm)',
                backgroundColor: statusMessage.type === 'error' ? 'var(--status-error-bg)' : 'var(--status-connected-bg)',
                border: `1px solid ${statusMessage.type === 'error' ? 'var(--status-error-border)' : 'var(--status-connected-border)'}`,
                color: statusMessage.type === 'error' ? 'var(--status-error)' : 'var(--status-connected)',
              }}
            >
              {statusMessage.text}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr auto', gap: 'var(--space-4)', alignItems: 'flex-end' }}>
            <Input
              label="رابط الوسائط أو الملف المباشر"
              placeholder="https://example.com/video.mp4"
              value={manualUrl}
              onChange={(e) => setManualUrl(e.target.value)}
              isDirectionalLtr
              disabled={isSubmitting}
            />

            <div>
              <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', marginBottom: 'var(--space-1-5)' }}>
                نوع الوسائط
              </label>
              <select
                value={manualType}
                onChange={(e) => setManualType(e.target.value as any)}
                style={{
                  width: '100%',
                  height: '40px',
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0 var(--space-3)',
                  color: 'var(--text-primary)',
                  fontSize: 'var(--font-size-sm)',
                }}
              >
                <option value="video">فيديو (MP4)</option>
                <option value="audio">ملف صوتي (MP3)</option>
                <option value="document">مستند عام (Document)</option>
              </select>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isSubmitting}
              style={{ height: '40px' }}
            >
              بدء الاستخراج
            </Button>
          </div>
        </form>
      </Card>

      {/* Active Queue List */}
      <Card
        title={`العمليات قيد التنفيذ (${activeItems.length})`}
        subtitle="يتم تحديث التقدم والسرعة لحظياً"
      >
        {activeItems.length === 0 ? (
          <EmptyState
            title={ar.downloads.emptyTitle}
            description={ar.downloads.emptyDesc}
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {activeItems.map((item) => (
              <div
                key={item.id}
                style={{
                  backgroundColor: 'var(--bg-elevated)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: 'var(--space-5)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--space-3)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
                  <div>
                    <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--text-primary)' }}>
                      {item.title}
                    </h3>
                    <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-1)', fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>
                      <span>المصدر: <strong className="tabular-numbers">{item.sourceDomain}</strong></span>
                      <span>·</span>
                      <span>طالب التحميل: <strong className="tabular-numbers">{item.requestedBy}</strong></span>
                      <span>·</span>
                      <time>{formatArabicDateTime(item.createdAt)}</time>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                    <Badge variant={item.status === 'downloading' ? 'info' : 'warning'}>
                      {item.status === 'downloading' ? ar.status.downloading : ar.status.queued}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCancel(item.id)}
                    >
                      {ar.downloads.cancelDownload}
                    </Button>
                  </div>
                </div>

                <ProgressBar
                  progress={item.progressPercent}
                  speedText={item.downloadSpeed}
                  label={formatBytes(item.fileSizeBytes)}
                />
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
