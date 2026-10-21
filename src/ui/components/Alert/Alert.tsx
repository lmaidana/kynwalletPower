import type { ReactNode, Ref } from 'react';
import styles from './Alert.module.css';

type AlertProps = {
  tone: 'error' | 'info';
  children: ReactNode;
  ref?: Ref<HTMLDivElement>;
  tabIndex?: number;
};

/** Mensaje global anunciado por tecnologías de asistencia (FR-015). */
export function Alert({ tone, children, ref, tabIndex }: AlertProps) {
  return (
    <div
      ref={ref}
      role={tone === 'error' ? 'alert' : 'status'}
      className={`${styles.alert} ${styles[tone]}`}
      tabIndex={tabIndex}
    >
      {children}
    </div>
  );
}
