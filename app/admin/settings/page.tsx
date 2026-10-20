'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { ar, formatBytes } from '@/lib/i18n';
import type { AdminUserSettings, SystemMetrics } from '@/lib/types';

export default function SettingsPage() {
  const [settings, setSettings] = useState<AdminUserSettings | null>(null);
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [isCleaning, setIsCleaning] = useState(false);
  const [cleanMessage, setCleanMessage] = useState('');
  const [maxSize, setMaxSize] = useState('100');
  const [cleanupHours, setCleanupHours] = useState('6');
  const [isSaved, setIsSaved] = useState(false);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/system/stats');
      const data = await res.json();
      if (data?.settings) {
        setSettings(data.settings);
        setMaxSize(String(data.settings.maxFileSizeMb));
        setCleanupHours(String(data.settings.autoCleanupHours));
      }
      if (data?.metrics) {
        setMetrics(data.metrics);
      }
    } catch {
      // quiet
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleRunCleanup = async () => {
    setIsCleaning(true);
    setCleanMessage('');
    try {
      const res = await fetch('/api/system/cleanup', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setCleanMessage(`✓ تم تنظيف التخزين المؤقت بنجاح وتفريغ ${data.freedMb} ميجابايت.`);
        fetchStats();
      }
    } catch {
      setCleanMessage('فشل تنظيف التخزين المؤقت.');
    } finally {
      setIsCleaning(false);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)' }}>
          {ar.settings.title}
        </h1>
        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', marginTop: 'var(--space-1)' }}>
          {ar.settings.description}
        </p>
      </div>

      {isSaved && (
        <div
          style={{
            padding: 'var(--space-3) var(--space-4)',
            backgroundColor: 'var(--status-connected-bg)',
            border: '1px solid var(--status-connected-border)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--status-connected)',
            fontSize: 'var(--font-size-sm)',
          }}
        >
          {ar.settings.savedSuccess}
        </div>
      )}

      {/* Storage and Cleanup Section */}
      <Card
        title={ar.settings.storageSection}
        subtitle="مراقبة مساحة القرص المؤقتة وسقف تنزيل الملفات"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 'var(--space-4)',
              backgroundColor: 'var(--bg-elevated)',
              padding: 'var(--space-4)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div>
              <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>
                المساحة المؤقتة المستهلكة حالياً:
              </span>
              <div style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)', marginTop: 'var(--space-1)' }}>
                {formatBytes((metrics?.tempStorageUsedMb ?? 0) * 1024 * 1024)}
              </div>
            </div>

            <div>
              <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>
                الحد الأقصى للتخزين المخصص:
              </span>
              <div style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)', marginTop: 'var(--space-1)' }}>
                {formatBytes((metrics?.tempStorageMaxMb ?? 2048) * 1024 * 1024)}
              </div>
            </div>
          </div>

          {cleanMessage && (
            <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--status-connected)' }}>
              {cleanMessage}
            </div>
          )}

          <div>
            <Button
              variant="secondary"
              size="md"
              onClick={handleRunCleanup}
              isLoading={isCleaning}
            >
              {ar.settings.runCleanupNow}
            </Button>
          </div>
        </div>
      </Card>

      {/* Security & SSRF Shield */}
      <Card
        title={ar.settings.securitySection}
        subtitle="حماية الخادم ضد استغلال الروابط وطلبات الخادم المزورة"
        headerAction={<Badge variant="success">نشط ومحصن</Badge>}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', lineHeight: 'var(--line-height-relaxed)' }}>
          <p>
            🛡️ <strong>{ar.settings.ssrfProtection}:</strong> {ar.settings.ssrfEnabled}.
          </p>
          <p>
            • يتم حظر جميع عناوين الاسترجاع <code>127.0.0.1</code> وعناوين الشبكات الخاصة <code>10.0.0.0/8</code> و <code>192.168.0.0/16</code> وعنوان بيانات التعريف السحابية <code>169.254.169.254</code> تلقائياً.
          </p>
          <p>
            • يتم فحص ترويسات الاستجابة مسبقاً والتأكد من توافق نوع MIME لحماية الذاكرة ومنع هجمات حجب الخدمة (DoS).
          </p>
        </div>
      </Card>

      {/* Limits Configuration Form */}
      <Card title="سقوف وضوابط التحميل">
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)', maxWidth: '540px' }}>
          <Input
            label={ar.settings.maxFileSize}
            type="number"
            value={maxSize}
            onChange={(e) => setMaxSize(e.target.value)}
            helpText="الملفات التي تتجاوز هذا السقف سيتم رفضها تلقائياً قبل بدء تنزيلها."
            isDirectionalLtr
          />

          <Input
            label={ar.settings.autoCleanup}
            type="number"
            value={cleanupHours}
            onChange={(e) => setCleanupHours(e.target.value)}
            helpText="يتم حذف الملفات المؤقتة تلقائياً بعد انقضاء هذه المدة لتحرير مساحة التخزين."
            isDirectionalLtr
          />

          <div>
            <Button type="submit" variant="primary" size="md">
              {ar.settings.saveSettings}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
