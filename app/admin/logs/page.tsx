'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { ar, formatArabicDateTime } from '@/lib/i18n';
import type { SystemLogEntry, LogLevel } from '@/lib/types';

export default function LogsPage() {
  const [logs, setLogs] = useState<SystemLogEntry[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchLogs = async () => {
    try {
      const url =
        selectedLevel === 'all'
          ? '/api/logs'
          : `/api/logs?level=${selectedLevel}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data?.logs) {
        setLogs(data.logs);
      }
    } catch {
      // quiet
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [selectedLevel]);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(fetchLogs, 5000);
    return () => clearInterval(interval);
  }, [autoRefresh, selectedLevel]);

  const handleClearLogs = async () => {
    try {
      await fetch('/api/logs', { method: 'DELETE' });
      setLogs([]);
    } catch {
      // quiet
    }
  };

  const getSourceLabel = (src: SystemLogEntry['source']) => {
    switch (src) {
      case 'whatsapp_socket':
        return 'مقبس واتساب';
      case 'downloader':
        return 'محرك التنزيل';
      case 'auth':
        return 'المصادقة والأمان';
      case 'gemini_ai':
        return 'نموذج التفكير';
      default:
        return 'النظام العام';
    }
  };

  const getBadgeVariant = (lvl: LogLevel) => {
    switch (lvl) {
      case 'success':
        return 'success';
      case 'warn':
        return 'warning';
      case 'error':
        return 'danger';
      default:
        return 'info';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)' }}>
            {ar.logs.title}
          </h1>
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', marginTop: 'var(--space-1)' }}>
            {ar.logs.description}
          </p>
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <Button
            variant={autoRefresh ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            {autoRefresh ? '✓ التحديث الحي نشط' : 'التحديث الحي متوقف'}
          </Button>
          <Button variant="ghost" size="sm" onClick={handleClearLogs}>
            {ar.logs.clearLogs}
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <Card>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            {['all', 'info', 'success', 'warn', 'error'].map((lvl) => (
              <Button
                key={lvl}
                variant={selectedLevel === lvl ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setSelectedLevel(lvl)}
              >
                {lvl === 'all'
                  ? 'الكل'
                  : lvl === 'info'
                  ? 'معلومات'
                  : lvl === 'success'
                  ? 'نجاح'
                  : lvl === 'warn'
                  ? 'تحذيرات'
                  : 'أخطاء'}
              </Button>
            ))}
          </div>

          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>
            إجمالي السجلات المعروضة: <strong className="tabular-numbers">{logs.length}</strong>
          </span>
        </div>
      </Card>

      {/* Logs Stream Container */}
      <Card>
        {logs.length === 0 ? (
          <EmptyState
            title={ar.logs.emptyLogs}
            description="ستظهر السجلات التشغيلية تلقائياً فور بدء نشاط البوت أو تفاعل المستخدمين."
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {logs.map((log) => (
              <div
                key={log.id}
                style={{
                  backgroundColor: 'var(--bg-elevated)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: 'var(--space-4)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--space-1-5)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 'var(--font-size-xs)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                    <Badge variant={getBadgeVariant(log.level)}>
                      {getSourceLabel(log.source)}
                    </Badge>
                  </div>
                  <time className="tabular-numbers" style={{ color: 'var(--text-tertiary)' }}>
                    {formatArabicDateTime(log.timestamp)}
                  </time>
                </div>

                <div
                  style={{
                    fontSize: 'var(--font-size-sm)',
                    color: log.level === 'error' ? 'var(--status-error)' : 'var(--text-primary)',
                    fontFamily: log.source === 'whatsapp_socket' ? 'var(--font-family-mono)' : 'inherit',
                  }}
                >
                  {log.message}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
