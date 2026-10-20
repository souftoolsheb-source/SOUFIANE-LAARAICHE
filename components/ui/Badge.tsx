import React from 'react';
import styles from './Badge.module.css';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  className,
}) => {
  let variantClass = styles.variantDefault;
  if (variant === 'success') variantClass = styles.variantSuccess;
  else if (variant === 'warning') variantClass = styles.variantWarning;
  else if (variant === 'danger') variantClass = styles.variantDanger;
  else if (variant === 'info') variantClass = styles.variantInfo;

  return (
    <span className={`${styles.badge} ${variantClass} ${className || ''}`}>
      <span className={styles.dot} aria-hidden="true" />
      <span>{children}</span>
    </span>
  );
};
