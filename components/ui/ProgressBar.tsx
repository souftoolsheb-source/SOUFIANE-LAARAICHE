import React from 'react';
import styles from './ProgressBar.module.css';

interface ProgressBarProps {
  progress?: number; // 0 to 100
  isIndeterminate?: boolean;
  label?: string;
  speedText?: string;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress = 0,
  isIndeterminate = false,
  label,
  speedText,
  className,
}) => {
  const clamped = Math.min(100, Math.max(0, progress));

  return (
    <div className={`${styles.progressContainer} ${className || ''}`}>
      {(label || speedText || !isIndeterminate) && (
        <div className={styles.labelRow}>
          {label && <span>{label}</span>}
          {speedText && (
            <span className="tabular-numbers" style={{ marginInlineStart: 'auto' }}>
              {speedText}
            </span>
          )}
          {!isIndeterminate && (
            <span className="tabular-numbers" style={{ marginInlineStart: speedText ? 'var(--space-2)' : 'auto' }}>
              %{clamped}
            </span>
          )}
        </div>
      )}
      <div
        className={styles.track}
        role="progressbar"
        aria-valuenow={isIndeterminate ? undefined : clamped}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={`${styles.fill} ${
            isIndeterminate ? styles.fillIndeterminate : ''
          }`}
          style={isIndeterminate ? undefined : { width: `${clamped}%` }}
        />
      </div>
    </div>
  );
};
