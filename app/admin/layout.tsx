'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { StatusBeacon } from '@/components/ui/StatusBeacon';
import { Button } from '@/components/ui/Button';
import { ar } from '@/lib/i18n';
import type { WhatsAppConnectionStatus } from '@/lib/types';
import styles from './admin.module.css';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [status, setStatus] = useState<WhatsAppConnectionStatus>('disconnected');

  const navItems = [
    { href: '/admin/overview', label: ar.nav.overview, icon: '📊' },
    { href: '/admin/connection', label: ar.nav.connection, icon: '🔗' },
    { href: '/admin/downloads', label: ar.nav.downloads, icon: '⚡' },
    { href: '/admin/history', label: ar.nav.history, icon: '📁' },
    { href: '/admin/commands', label: ar.nav.commands, icon: '⚙️' },
    { href: '/admin/logs', label: ar.nav.logs, icon: '📋' },
    { href: '/admin/settings', label: ar.nav.settings, icon: '🛡️' },
  ];

  const fetchStatus = () => {
    fetch('/api/whatsapp/status')
      .then((res) => res.json())
      .then((data) => {
        if (data?.session?.status) {
          setStatus(data.session.status);
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 6000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch {
      router.push('/login');
    }
  };

  return (
    <div className={styles.adminLayout}>
      {/* Mobile Drawer Backdrop */}
      {isMobileOpen && (
        <div
          className={styles.mobileBackdrop}
          onClick={() => setIsMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`${styles.sidebar} ${isMobileOpen ? styles.sidebarOpen : ''}`}
      >
        <div className={styles.sidebarHeader}>
          <BrandLogo href="/admin/overview" />
        </div>

        <nav className={styles.sidebarNav}>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileOpen(false)}
                className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
                aria-current={isActive ? 'page' : undefined}
              >
                <span aria-hidden="true">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className={styles.sidebarFooter}>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            style={{ width: '100%', justifyContent: 'flex-start' }}
          >
            <span>🚪</span>
            <span>{ar.nav.logout}</span>
          </Button>
        </div>
      </aside>

      {/* Main Wrapper */}
      <div className={styles.mainWrapper}>
        <header className={styles.topBar}>
          <div className={styles.topBarStart}>
            <button
              type="button"
              className={styles.hamburgerBtn}
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              aria-label="تبديل القائمة الجانبية"
            >
              ☰
            </button>
            <StatusBeacon status={status} />
          </div>

          <div className={styles.topBarActions}>
            <Link href="/" target="_blank">
              <Button variant="ghost" size="sm">
                <span>الواجهة العامة ↗</span>
              </Button>
            </Link>
            <Button variant="secondary" size="sm" onClick={handleLogout}>
              {ar.nav.logout}
            </Button>
          </div>
        </header>

        <main className={styles.contentContainer}>{children}</main>
      </div>
    </div>
  );
}
