import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-6)',
        backgroundColor: 'var(--bg-canvas)',
        color: 'var(--text-primary)',
        textAlign: 'center',
        gap: 'var(--space-4)',
      }}
    >
      <span style={{ fontSize: '4rem', fontWeight: 'bold', color: 'var(--accent-emerald)' }}>
        404
      </span>
      <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'bold' }}>
        الصفحة غير موجودة
      </h1>
      <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', fontSize: 'var(--font-size-sm)' }}>
        الصفحة التي تبحث عنها قد تم نقلها أو أنها غير متوفرة حالياً في المنظومة.
      </p>
      <Link href="/">
        <Button variant="primary" size="md">
          العودة للرئيسية
        </Button>
      </Link>
    </div>
  );
}
