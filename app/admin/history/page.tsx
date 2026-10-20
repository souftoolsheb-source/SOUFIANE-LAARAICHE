'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { ar, formatBytes, formatArabicDateTime } from '@/lib/i18n';
import type { DownloadItem } from '@/lib/types';

export default function HistoryPage() {
  const [historyItems, setHistoryItems] = useState<DownloadItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [isClearing, setIsClearing] = useState(false);

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/downloads');
      const data = await res.json();
      if (data?.history) {
        setHistoryItems(data.history);
      }
    } catch {
      // quiet
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleClear = async () => {
    if (!confirm('هل أنت متأكد من تفريغ سجل التنزيلات السابقة؟')) return;
    setIsClearing(true);
    try {
      await fetch('/api/downloads/clear', { method: 'POST' });
      await fetchHistory();
    } catch {
      // quiet
    } finally {
      setIsClearing(false);
    }
  };

  const filteredItems = historyItems.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.requestedBy.includes(searchQuery);

    const matchesType =
      filterType === 'all' || item.type === filterType;

    return matchesSearch && matchesType;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)' }}>
            {ar.history.title}
          </h1>
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', marginTop: 'var(--space-1)' }}>
            {ar.history.description}
          </p>
        </div>

        <Button
          variant="danger"
          size="sm"
          onClick={handleClear}
          isLoading={isClearing}
          disabled={historyItems.length === 0}
        >
          {ar.history.clearHistory}
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <Card>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--space-4)', alignItems: 'center' }}>
          <Input
            placeholder={ar.history.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'flex-end' }}>
            {['all', 'video', 'audio', 'document'].map((type) => (
              <Button
                key={type}
                variant={filterType === type ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setFilterType(type)}
              >
                {type === 'all'
                  ? ar.history.filterAll
                  : type === 'video'
                  ? ar.history.filterVideo
                  : type === 'audio'
                  ? ar.history.filterAudio
                  : ar.history.filterDocument}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {/* History Table */}
      <Card>
        {filteredItems.length === 0 ? (
          <EmptyState
            title={ar.history.noResults}
            description="جرب البحث بكلمة أخرى أو تغيير معيار التصفية لعرض السجلات."
          />
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-tertiary)', fontSize: 'var(--font-size-xs)' }}>
                  <th style={{ padding: 'var(--space-3) var(--space-4)' }}>الملف / العنوان</th>
                  <th style={{ padding: 'var(--space-3) var(--space-4)' }}>النوع</th>
                  <th style={{ padding: 'var(--space-3) var(--space-4)' }}>الحجم</th>
                  <th style={{ padding: 'var(--space-3) var(--space-4)' }}>الطالب</th>
                  <th style={{ padding: 'var(--space-3) var(--space-4)' }}>الحالة</th>
                  <th style={{ padding: 'var(--space-3) var(--space-4)' }}>التاريخ</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => (
                  <tr
                    key={item.id}
                    style={{
                      borderBottom: '1px solid var(--border-subtle)',
                      fontSize: 'var(--font-size-sm)',
                      color: 'var(--text-primary)',
                    }}
                  >
                    <td style={{ padding: 'var(--space-4)' }}>
                      <strong>{item.title}</strong>
                      <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }} className="tabular-numbers">
                        {item.url}
                      </div>
                    </td>
                    <td style={{ padding: 'var(--space-4)' }}>
                      <span className="code-inline">{item.type}</span>
                    </td>
                    <td style={{ padding: 'var(--space-4)' }}>
                      <span className="tabular-numbers">{formatBytes(item.fileSizeBytes)}</span>
                    </td>
                    <td style={{ padding: 'var(--space-4)' }}>
                      <span className="tabular-numbers">{item.requestedBy}</span>
                    </td>
                    <td style={{ padding: 'var(--space-4)' }}>
                      <Badge
                        variant={
                          item.status === 'completed'
                            ? 'success'
                            : item.status === 'failed'
                            ? 'danger'
                            : 'warning'
                        }
                      >
                        {item.status === 'completed'
                          ? ar.status.completed
                          : item.status === 'failed'
                          ? ar.status.failed
                          : ar.status.cancelled}
                      </Badge>
                    </td>
                    <td style={{ padding: 'var(--space-4)', fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>
                      {formatArabicDateTime(item.completedAt || item.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
