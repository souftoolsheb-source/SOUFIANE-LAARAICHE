import React from 'react';
import Link from 'next/link';
import styles from './BrandLogo.module.css';

interface BrandLogoProps {
  href?: string;
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  href = '/',
  showSubtitle = true,
}) => {
  const content = (
    <div className={styles.logoContainer}>
      <div className={styles.iconWrapper} aria-hidden="true">
        <svg
          className={styles.svgIcon}
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Dual geometric companion nodes symbolizing secure socket pairing */}
          <circle
            cx="11"
            cy="16"
            r="7"
            stroke="var(--accent-emerald)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <circle
            cx="21"
            cy="16"
            r="7"
            stroke="var(--text-secondary)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray="2 3"
          />
          {/* Central synchronized heartbeat node */}
          <circle cx="16" cy="16" r="2.5" fill="var(--accent-emerald)" />
          {/* Subtle directional beacon rays */}
          <path
            d="M16 7V5M16 27V25"
            stroke="var(--accent-emerald)"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </div>
      <div className={styles.textGroup}>
        <span className={styles.brandName}>بوت واتساب برو</span>
        {showSubtitle && (
          <span className={styles.brandKicker}>WhatsApp Bot Pro</span>
        )}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} style={{ textDecoration: 'none' }}>
        {content}
      </Link>
    );
  }

  return content;
};
