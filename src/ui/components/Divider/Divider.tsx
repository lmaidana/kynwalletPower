import type { ReactNode } from 'react';
import styles from './Divider.module.css';

export function Divider({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={[styles.divider, className].filter(Boolean).join(' ')}>
      <span className={styles.line} aria-hidden="true" />
      <span className={styles.text}>{children}</span>
      <span className={styles.line} aria-hidden="true" />
    </div>
  );
}
