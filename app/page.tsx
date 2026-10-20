'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { StatusBeacon } from '@/components/ui/StatusBeacon';
import { Button } from '@/components/ui/Button';
import { ar } from '@/lib/i18n';
import type { WhatsAppConnectionStatus } from '@/lib/types';
import styles from './page.module.css';

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  time: string;
}

export default function HomePage() {
  const [status, setStatus] = useState<WhatsAppConnectionStatus>('disconnected');
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);
  const [inputMsg, setInputMsg] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      sender: 'bot',
      text: '👋 أهلاً بك في منصة بوت واتساب برو. يمكنك تجربة الأوامر الحقيقية هنا مباشرة عبر إرسال /help أو /status أو طرح استفسار عبر /ask.',
      time: 'الآن',
    },
  ]);

  useEffect(() => {
    fetch('/api/whatsapp/status')
      .then((res) => res.json())
      .then((data) => {
        if (data?.session?.status) {
          setStatus(data.session.status);
        }
      })
      .catch(() => {});
  }, []);

  const handleCopy = (cmd: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiedCmd(cmd);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  const handleSendChat = async (messageText?: string) => {
    const textToSend = messageText || inputMsg;
    if (!textToSend.trim() || isSending) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}-user`,
      sender: 'user',
      text: textToSend.trim(),
      time: new Intl.DateTimeFormat('ar-EG', { hour: '2-digit', minute: '2-digit' }).format(new Date()),
    };

    setChatMessages((prev) => [...prev, userMessage]);
    setInputMsg('');
    setIsSending(true);

    try {
      const res = await fetch('/api/commands/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: textToSend }),
      });

      const data = await res.json();
      const botReply: ChatMessage = {
        id: `msg-${Date.now()}-bot`,
        sender: 'bot',
        text: data.reply || data.error || 'تم استلام الرسالة.',
        time: new Intl.DateTimeFormat('ar-EG', { hour: '2-digit', minute: '2-digit' }).format(new Date()),
      };

      setChatMessages((prev) => [...prev, botReply]);
    } catch {
      setChatMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now()}-err`,
          sender: 'bot',
          text: 'تعذر الاتصال بالخادم لمعالجة الرسالة.',
          time: 'الآن',
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className={styles.pageContainer}>
      {/* Top Bar Header */}
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <BrandLogo href="/" />
          <div className={styles.headerActions}>
            <StatusBeacon status={status} />
            <Link href="/login">
              <Button variant="primary" size="sm">
                {ar.nav.login}
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Hero */}
      <main>
        <section className={styles.heroSection}>
          <div className={styles.heroInner}>
            <div className={styles.heroContent}>
              <span className={styles.heroKicker}>
                <span>⚡</span>
                <span>{ar.publicLanding.heroKicker}</span>
              </span>
              <h1 className={styles.heroTitle}>
                {ar.publicLanding.heroTitle}
              </h1>
              <p className={styles.heroSubtitle}>
                {ar.publicLanding.heroSubtitle}
              </p>
              <div className={styles.heroCtas}>
                <Link href="/login">
                  <Button variant="primary" size="lg">
                    {ar.publicLanding.adminPortalCta}
                  </Button>
                </Link>
                <a href="#commands">
                  <Button variant="secondary" size="lg">
                    {ar.publicLanding.supportedCommandsTitle}
                  </Button>
                </a>
              </div>
            </div>

            {/* REAL Interactive Live WhatsApp Chat Window */}
            <div className={styles.previewWindow}>
              <div className={styles.previewHeader}>
                <div className={styles.previewTitleGroup}>
                  <div className={styles.avatarDot}>W</div>
                  <div>
                    <strong style={{ fontSize: 'var(--font-size-sm)', display: 'block' }}>
                      بوت واتساب برو
                    </strong>
                    <span style={{ fontSize: '11px', color: status === 'connected' ? 'var(--status-connected)' : 'var(--text-tertiary)' }}>
                      {status === 'connected' ? 'المقبس متصل ومستقر' : 'وضع المعالجة التجريبية المباشرة'}
                    </span>
                  </div>
                </div>
                <StatusBeacon status={status} showLabel={false} />
              </div>

              {/* Chat Thread */}
              <div className={styles.previewBody} style={{ maxHeight: '340px', overflowY: 'auto' }}>
                {chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={msg.sender === 'user' ? styles.chatBubbleUser : styles.chatBubbleBot}
                    style={{ whiteSpace: 'pre-line' }}
                  >
                    {msg.text}
                    <span className={styles.chatTime}>{msg.time}</span>
                  </div>
                ))}
                {isSending && (
                  <div className={styles.chatBubbleBot} style={{ color: 'var(--text-tertiary)' }}>
                    ⏳ جاري التفكير ومعالجة الأمر عبر السيرفر...
                  </div>
                )}
              </div>

              {/* Real Input Form */}
              <div
                style={{
                  padding: 'var(--space-3) var(--space-4)',
                  backgroundColor: 'var(--bg-elevated)',
                  borderTop: '1px solid var(--border-subtle)',
                  display: 'flex',
                  gap: 'var(--space-2)',
                }}
              >
                <input
                  type="text"
                  value={inputMsg}
                  onChange={(e) => setInputMsg(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSendChat();
                  }}
                  placeholder="اكتب أمراً (/help أو /status أو /ask)..."
                  style={{
                    flex: 1,
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border-medium)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0 var(--space-3)',
                    height: '36px',
                    fontSize: 'var(--font-size-sm)',
                    color: 'var(--text-primary)',
                  }}
                  disabled={isSending}
                />
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleSendChat()}
                  isLoading={isSending}
                  style={{ height: '36px' }}
                >
                  إرسال
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Supported Commands Section */}
        <section id="commands" className={styles.commandsSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              {ar.publicLanding.supportedCommandsTitle}
            </h2>
            <p className={styles.sectionSubtitle}>
              الأوامر المعتمدة في النظام. يمكنك النقر على الأمر لتجربته فوراً في الدردشة أعلاه أو نسخه.
            </p>
          </div>

          <div className={styles.commandsTableWrapper}>
            <table className={styles.commandsTable}>
              <thead>
                <tr>
                  <th style={{ width: '25%' }}>الأمر</th>
                  <th style={{ width: '50%' }}>الوظيفة والشرح</th>
                  <th style={{ width: '25%', textAlign: 'left' }}>التجربة والنسخ</th>
                </tr>
              </thead>
              <tbody>
                {ar.publicLanding.commandsList.map((item) => (
                  <tr key={item.cmd}>
                    <td>
                      <span className="code-inline">{item.cmd}</span>
                    </td>
                    <td>{item.desc}</td>
                    <td style={{ textAlign: 'left' }}>
                      <div style={{ display: 'inline-flex', gap: 'var(--space-2)' }}>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            const sampleCmd = item.cmd.includes('[')
                              ? item.cmd.replace('[رابط]', 'https://archive.org/sample.mp4').replace('[سؤال]', 'ما هي عاصمة سلطنة عمان؟')
                              : item.cmd;
                            handleSendChat(sampleCmd);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                        >
                          تجربة
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopy(item.cmd)}
                        >
                          {copiedCmd === item.cmd ? ar.actions.copied : ar.actions.copy}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className={styles.footer}>
        <p>
          بوت واتساب برو — منظومة خادمة متطورة لإدارة وتنزيل الوسائط وأتمتة المهام.
        </p>
      </footer>
    </div>
  );
}
