'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ar } from '@/lib/i18n';
import styles from './login.module.css';

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setErrorMessage('يرجى كتابة كلمة مرور الإدارة.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMessage(data.error || 'كلمة المرور غير صحيحة.');
        setIsLoading(false);
        return;
      }

      // Successful login
      router.push('/admin/overview');
    } catch {
      setErrorMessage('حدث خطأ في الاتصال بالخادم. يرجى إعادة المحاولة.');
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <header className={styles.loginHeader}>
        <BrandLogo href="/" />
        <Link href="/">
          <Button variant="ghost" size="sm">
            {ar.nav.backToHome}
          </Button>
        </Link>
      </header>

      <main className={styles.loginMain}>
        <div className={styles.loginCard}>
          <div className={styles.cardHeader}>
            <h1 className={styles.cardTitle}>دخول لوحة الإدارة</h1>
            <p className={styles.cardSubtitle}>
              يرجى إدخال كلمة مرور المشرف للوصول إلى إدارة مقبس واتساب، طابور التنزيل وإعدادات الأمان.
            </p>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            {errorMessage && (
              <div className={styles.alertBox} role="alert">
                <span>⚠️</span>
                <span>{errorMessage}</span>
              </div>
            )}

            <Input
              label="كلمة مرور المشرف"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              disabled={isLoading}
              isDirectionalLtr
              helpText="كلمة المرور الافتراضية للنظام التجريبي: admin12345"
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              style={{ width: '100%', marginTop: 'var(--space-2)' }}
            >
              تسجيل الدخول
            </Button>

            <div className={styles.infoBox}>
              🔒 الجلسة محمية بملفات تعريف ارتباط مشفرة (HTTP-Only) ومعزولة بالكامل عن الواجهة العامة للمستخدمين.
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
