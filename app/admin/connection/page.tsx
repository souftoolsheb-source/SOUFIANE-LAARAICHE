'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { StatusBeacon } from '@/components/ui/StatusBeacon';
import { Modal } from '@/components/ui/Modal';
import { ar, formatArabicDateTime } from '@/lib/i18n';
import type { WhatsAppSessionState } from '@/lib/types';
import styles from './connection.module.css';

export default function ConnectionPage() {
  const [session, setSession] = useState<WhatsAppSessionState | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isPairingLoading, setIsPairingLoading] = useState(false);
  const [isDisconnectLoading, setIsDisconnectLoading] = useState(false);
  const [isConfirmLoading, setIsConfirmLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [secondsRemaining, setSecondsRemaining] = useState<number>(0);
  const [showDisconnectModal, setShowDisconnectModal] = useState(false);

  const fetchSessionStatus = async () => {
    try {
      const res = await fetch('/api/whatsapp/status');
      const data = await res.json();
      if (data?.session) {
        setSession(data.session);
        if (data.session.pairingCodeExpiresAt) {
          const sec = Math.max(
            0,
            Math.floor((data.session.pairingCodeExpiresAt - Date.now()) / 1000)
          );
          setSecondsRemaining(sec);
        }
      }
    } catch {
      // quiet handling
    }
  };

  useEffect(() => {
    fetchSessionStatus();
    const interval = setInterval(fetchSessionStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  // Countdown timer for pairing code
  useEffect(() => {
    if (secondsRemaining <= 0) return;
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [secondsRemaining]);

  const handleRequestPairingCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber) {
      setErrorMessage(ar.errors.invalidPhone);
      return;
    }

    setIsPairingLoading(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/whatsapp/pair', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer pro_admin_authenticated_token_9921',
        },
        body: JSON.stringify({ phoneNumber }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMessage(data.error || 'تعذر توليد رمز الاقتران.');
        setIsPairingLoading(false);
        return;
      }

      await fetchSessionStatus();
    } catch {
      setErrorMessage('حدث خطأ في الاتصال بالخادم.');
    } finally {
      setIsPairingLoading(false);
    }
  };

  const handleConfirmPairing = async () => {
    setIsConfirmLoading(true);
    try {
      const res = await fetch('/api/whatsapp/confirm-pairing', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer pro_admin_authenticated_token_9921',
        },
      });
      const data = await res.json();
      if (data.success) {
        await fetchSessionStatus();
      } else {
        setErrorMessage(data.error || 'تعذر تأكيد الاقتران.');
      }
    } catch {
      setErrorMessage('فشل تأكيد الاتصال.');
    } finally {
      setIsConfirmLoading(false);
    }
  };

  const handleDisconnect = async () => {
    setIsDisconnectLoading(true);
    try {
      const res = await fetch('/api/whatsapp/disconnect', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer pro_admin_authenticated_token_9921',
        },
      });
      const data = await res.json();
      if (data.success) {
        setShowDisconnectModal(false);
        await fetchSessionStatus();
      }
    } catch {
      setErrorMessage('تعذر إنهاء الجلسة.');
    } finally {
      setIsDisconnectLoading(false);
    }
  };

  const handleReconnect = async () => {
    try {
      await fetch('/api/whatsapp/reconnect', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer pro_admin_authenticated_token_9921',
        },
      });
      await fetchSessionStatus();
    } catch {
      // quiet
    }
  };

  const isConnected = session?.status === 'connected';
  const isPairing = session?.status === 'pairing';

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>{ar.connection.title}</h1>
          <p className={styles.subtitle}>{ar.connection.description}</p>
        </div>
        <StatusBeacon
          status={session?.status || 'disconnected'}
          showLabel={true}
        />
      </div>

      {/* Advisory Banner regarding Baileys unofficial status */}
      <div className={styles.warningBox}>
        <span>⚠️</span>
        <div>{ar.connection.warningBaileys}</div>
      </div>

      {errorMessage && (
        <div
          style={{
            padding: 'var(--space-3) var(--space-4)',
            backgroundColor: 'var(--status-error-bg)',
            border: '1px solid var(--status-error-border)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--status-error)',
            fontSize: 'var(--font-size-sm)',
          }}
        >
          {errorMessage}
        </div>
      )}

      {/* Active Connected State */}
      {isConnected ? (
        <div className={styles.connectedCard}>
          <div>
            <h2 style={{ fontSize: 'var(--font-size-xl)', color: 'var(--status-connected)', marginBottom: 'var(--space-1)' }}>
              ✓ البوت متصل بنجاح وجاهز لاستقبال الأوامر
            </h2>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
              جلسة المقبس نشطة وتستقبل الرسائل عبر خادم Baileys المعزول.
            </p>
          </div>

          <div className={styles.detailsGrid}>
            <div className={styles.detailTile}>
              <span className={styles.detailLabel}>{ar.connection.connectedPhone}</span>
              <span className={styles.detailValue} style={{ direction: 'ltr', textAlign: 'right' }}>
                {session?.phoneNumber}
              </span>
            </div>

            <div className={styles.detailTile}>
              <span className={styles.detailLabel}>{ar.connection.connectedSince}</span>
              <span className={styles.detailValue}>
                {formatArabicDateTime(session?.connectedAt)}
              </span>
            </div>

            <div className={styles.detailTile}>
              <span className={styles.detailLabel}>العميل الخادمي</span>
              <span className={styles.detailValue}>
                {session?.deviceInfo?.platform || 'Baileys Multi-Device'}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
            <Button
              variant="danger"
              size="md"
              onClick={() => setShowDisconnectModal(true)}
            >
              {ar.connection.disconnectButton}
            </Button>
            <Button variant="secondary" size="md" onClick={handleReconnect}>
              {ar.connection.reconnectButton}
            </Button>
          </div>
        </div>
      ) : isPairing && session?.pairingCode ? (
        /* Pairing Code In-Flight State */
        <div className={styles.pairingBox}>
          <div>
            <h2 style={{ fontSize: 'var(--font-size-xl)', color: 'var(--status-pairing)', marginBottom: 'var(--space-1)' }}>
              بانتظار إدخال رمز الاقتران على الهاتف
            </h2>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
              تم توليد الرمز الخادمي الرسمي للرقم ({session.phoneNumber}).
            </p>
          </div>

          {/* Big Code Card */}
          <div
            style={{
              padding: 'var(--space-4)',
              backgroundColor: 'var(--bg-elevated)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--font-size-xs)',
              color: 'var(--text-secondary)',
              lineHeight: 'var(--line-height-relaxed)',
            }}
          >
            💡 <strong>ملاحظة هامة حول وضع المعاينة:</strong> نظراً لأن هذا التطبيق يعمل في بيئة معاينة سحابية (AI Studio Preview) بدون خادم WebSocket دائم متصل بسيرفرات واتساب الرسمية، يتم تفعيل بوت المقبس واستقبال الأوامر بالضغط مباشرة على زر <strong>«تأكيد الربط»</strong> أدناه بعد توليد الرمز، مما يربط رقمك بالمنظومة فوراً.
          </div>

          <div className={styles.codeCard}>
            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>
              رمز اقتران واتساب (للتوثيق الداخلي):
            </span>
            <div className={styles.codeDigits}>
              {session.pairingCode}
            </div>
            <div className={styles.timer}>
              <span>⏱️</span>
              <span>
                {ar.connection.codeExpiresIn} {secondsRemaining} {ar.connection.seconds}
              </span>
            </div>
          </div>

          {/* Steps */}
          <div>
            <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-semibold)', marginBottom: 'var(--space-3)' }}>
              {ar.connection.pairingStepsTitle}
            </h3>
            <div className={styles.stepsList}>
              <div className={styles.stepItem}>
                <span className={styles.stepNumber}>1</span>
                <span>{ar.connection.step1}</span>
              </div>
              <div className={styles.stepItem}>
                <span className={styles.stepNumber}>2</span>
                <span>{ar.connection.step2}</span>
              </div>
              <div className={styles.stepItem}>
                <span className={styles.stepNumber}>3</span>
                <span>{ar.connection.step3}</span>
              </div>
              <div className={styles.stepItem}>
                <span className={styles.stepNumber}>4</span>
                <span>{ar.connection.step4}</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
            <Button
              variant="primary"
              size="md"
              onClick={handleConfirmPairing}
              isLoading={isConfirmLoading}
            >
              تم إدخال الرمز في الهاتف وتأكيد الربط
            </Button>
            <Button
              variant="secondary"
              size="md"
              onClick={() => {
                setSession((prev) => prev ? { ...prev, status: 'disconnected', pairingCode: undefined } : null);
              }}
            >
              إلغاء وطلب رقم آخر
            </Button>
          </div>
        </div>
      ) : (
        /* Disconnected / New Pairing Form */
        <Card
          title="طلب رمز اقتران جديد"
          subtitle="أدخل رقم هاتف الشريحة المخصصة للبوت لبدء مصادقة الجهاز المقترن"
        >
          <form onSubmit={handleRequestPairingCode} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)', maxWidth: '520px' }}>
            <Input
              label={ar.connection.phoneLabel}
              placeholder={ar.connection.phonePlaceholder}
              helpText={ar.connection.phoneHelp}
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              isDirectionalLtr
              disabled={isPairingLoading}
            />

            <div>
              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={isPairingLoading}
              >
                {ar.connection.requestPairingCode}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Disconnect Confirmation Modal */}
      <Modal
        isOpen={showDisconnectModal}
        onClose={() => setShowDisconnectModal(false)}
        title="تأكيد إنهاء الجلسة وفصل الحساب"
        subtitle="سيتم قطع اتصال المقبس بواتساب وحذف مفاتيح المصادقة المخزنة على الخادم."
        footerActions={
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDisconnectModal(false)}
            >
              {ar.actions.cancel}
            </Button>
            <Button
              variant="danger"
              size="sm"
              isLoading={isDisconnectLoading}
              onClick={handleDisconnect}
            >
              تأكيد إنهاء الجلسة
            </Button>
          </>
        }
      >
        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', lineHeight: 'var(--line-height-relaxed)' }}>
          هل أنت متأكد من رغبتك في فصل الحساب؟ سيتوقف البوت عن استقبال أي أوامر أو تنزيل ملفات من الدردشات حتى تقوم بإعادة ربطه برمز جديد.
        </p>
      </Modal>
    </div>
  );
}
