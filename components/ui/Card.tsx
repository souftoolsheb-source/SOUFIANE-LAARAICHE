import React from 'react';
import styles from './Card.module.css';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  headerAction?: React.ReactNode;
  isInteractive?: boolean;
}

export const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  headerAction,
  isInteractive = false,
  children,
  className,
  ...props
}) => {
  return (
    <div
      className={`${styles.card} ${isInteractive ? styles.cardInteractive : ''} ${className || ''}`}
      {...props}
    >
      {(title || headerAction) && (
        <div className={styles.cardHeader}>
          <div>
            {title && <h3 className={styles.cardTitle}>{title}</h3>}
            {subtitle && <p className={styles.cardSubtitle}>{subtitle}</p>}
          </div>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      <div className={styles.cardContent}>{children}</div>
    </div>
  );
};
