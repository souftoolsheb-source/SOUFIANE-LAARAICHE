import React from 'react';
import type { WhatsAppConnectionStatus } from '@/lib/types';
import { ar } from '@/lib/i18n';
import styles from './StatusBeacon.module.css';

interface StatusBeaconProps {
  status: WhatsAppConnectionStatus;
  customLabel?: string;
  showLabel?: boolean;
}

export const StatusBeacon: React.FC<StatusBeaconProps> = ({
  status,
  customLabel,
  showLabel = true,
}) => {
  let statusClass = styles.statusDisconnected;
  let defaultLabel = ar.status.disconnected;

  switch (status) {
    case 'connected':
      statusClass = styles.statusConnected;
      defaultLabel = ar.status.connected;
      break;
    case 'pairing':
      statusClass = styles.statusPairing;
      defaultLabel = ar.status.pairing;
      break;
    case 'error':
      statusClass = styles.statusError;
      defaultLabel = ar.status.error;
      break;
    default:
      statusClass = styles.statusDisconnected;
      defaultLabel = ar.status.disconnected;
  }

  const label = customLabel || defaultLabel;

  return (
    <div
      className={`${styles.beaconWrapper} ${statusClass}`}
      role="status"
      aria-live="polite"
    >
      <div className={styles.beaconDotWrapper} aria-hidden="true">
        <span className={styles.beaconPulse} />
        <span className={styles.beaconDot} />
      </div>
      {showLabel && <span>{label}</span>}
    </div>
  );
};
