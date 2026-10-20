'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { ar, formatNumber } from '@/lib/i18n';
import type { BotCommandRule } from '@/lib/types';

export default function CommandsPage() {
  const [commands, setCommands] = useState<BotCommandRule[]>([]);
  const [testInput, setTestInput] = useState('/ask ما هي أهمية وضع التفكير العميق في تحليل الروابط؟');
  const [testOutput, setTestOutput] = useState('');
  const [isTesting, setIsTesting] = useState(false);

  const fetchCommands = async () => {
    try {
      const res = await fetch('/api/commands');
      const data = await res.json();
      if (data?.commands) {
        setCommands(data.commands);
      }
    } catch {
      // quiet
    }
  };

  useEffect(() => {
    fetchCommands();
  }, []);

  const handleToggle = async (id: string) => {
    try {
      const res = await fetch('/api/commands/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (data?.success) {
        fetchCommands();
      }
    } catch {
      // quiet
    }
  };

  const handleTestCommand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testInput) return;

    setIsTesting(true);
    setTestOutput('جاري تشغيل المعالجة واستدعاء محرك التفكير المتقدم...');

    try {
      const res = await fetch('/api/commands/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: testInput }),
      });

      const data = await res.json();
      if (data.reply) {
        setTestOutput(data.reply);
      } else {
        setTestOutput(data.error || 'تعذر الحصول على رد.');
      }
    } catch {
      setTestOutput('حدث خطأ في الاتصال بالخادم.');
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)' }}>
          {ar.commands.title}
        </h1>
        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', marginTop: 'var(--space-1)' }}>
          {ar.commands.description}
        </p>
      </div>

      {/* Gemini Thinking Engine Feature Banner */}
      <Card
        title={ar.commands.thinkingModeLabel}
        subtitle={ar.commands.thinkingModeDesc}
        headerAction={
          <Badge variant="success">مفعل (gemini-4-argon · HIGH)</Badge>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', lineHeight: 'var(--line-height-relaxed)' }}>
            يتولى هذا المحرك تحليل الروابط المشفرة واستخراج البيانات الوصفية والإجابة عن الاستفسارات التحليلية للمستخدمين عبر الأمر <code>/ask</code> بأعلى مستوى استدلال منطقي.
          </p>

          {/* Interactive Live Testing Console */}
          <div
            style={{
              backgroundColor: 'var(--bg-canvas)',
              border: '1px solid var(--border-medium)',
              borderRadius: 'var(--radius-md)',
              padding: 'var(--space-5)',
            }}
          >
            <form onSubmit={handleTestCommand} style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
              <div style={{ flex: 1 }}>
                <Input
                  value={testInput}
                  onChange={(e) => setTestInput(e.target.value)}
                  placeholder="أدخل أمراً للتجربة (مثال: /help أو /ask أو /status)"
                  isDirectionalLtr
                  disabled={isTesting}
                />
              </div>
              <Button type="submit" variant="primary" size="md" isLoading={isTesting}>
                تجربة الأمر
              </Button>
            </form>

            {testOutput && (
              <div
                style={{
                  backgroundColor: 'var(--bg-elevated)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: 'var(--space-4)',
                  fontSize: 'var(--font-size-sm)',
                  color: 'var(--text-primary)',
                  whiteSpace: 'pre-wrap',
                  lineHeight: 'var(--line-height-normal)',
                }}
              >
                {testOutput}
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Commands Management Table */}
      <Card
        title="قواعد وأوامر البوت النشطة"
        subtitle="يمكنك تعطيل أو تفعيل أي أمر مع مراقبة عدد مرات الاستخدام وحدود التكرار"
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-tertiary)', fontSize: 'var(--font-size-xs)' }}>
                <th style={{ padding: 'var(--space-3) var(--space-4)' }}>{ar.commands.trigger}</th>
                <th style={{ padding: 'var(--space-3) var(--space-4)' }}>الوظيفة والشرح</th>
                <th style={{ padding: 'var(--space-3) var(--space-4)' }}>{ar.commands.category}</th>
                <th style={{ padding: 'var(--space-3) var(--space-4)' }}>{ar.commands.rateLimit}</th>
                <th style={{ padding: 'var(--space-3) var(--space-4)' }}>{ar.commands.usage}</th>
                <th style={{ padding: 'var(--space-3) var(--space-4)' }}>{ar.commands.status}</th>
                <th style={{ padding: 'var(--space-3) var(--space-4)', textAlign: 'left' }}>الإجراء</th>
              </tr>
            </thead>
            <tbody>
              {commands.map((cmd) => (
                <tr
                  key={cmd.id}
                  style={{
                    borderBottom: '1px solid var(--border-subtle)',
                    fontSize: 'var(--font-size-sm)',
                    color: 'var(--text-primary)',
                  }}
                >
                  <td style={{ padding: 'var(--space-4)' }}>
                    <span className="code-inline">{cmd.trigger}</span>
                  </td>
                  <td style={{ padding: 'var(--space-4)' }}>{cmd.description}</td>
                  <td style={{ padding: 'var(--space-4)' }}>
                    <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>
                      {ar.commands.categories[cmd.category]}
                    </span>
                  </td>
                  <td style={{ padding: 'var(--space-4)' }}>
                    <span className="tabular-numbers">{cmd.rateLimitPerMinute} / دقيقة</span>
                  </td>
                  <td style={{ padding: 'var(--space-4)' }}>
                    <span className="tabular-numbers">{formatNumber(cmd.usageCount)}</span>
                  </td>
                  <td style={{ padding: 'var(--space-4)' }}>
                    <Badge variant={cmd.enabled ? 'success' : 'default'}>
                      {cmd.enabled ? 'مفعل' : 'معطل'}
                    </Badge>
                  </td>
                  <td style={{ padding: 'var(--space-4)', textAlign: 'left' }}>
                    <Button
                      variant={cmd.enabled ? 'danger' : 'secondary'}
                      size="sm"
                      onClick={() => handleToggle(cmd.id)}
                    >
                      {cmd.enabled ? 'تعطيل' : 'تفعيل'}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
