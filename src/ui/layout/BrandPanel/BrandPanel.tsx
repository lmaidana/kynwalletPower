import logoMark from '@/ui/assets/logo-mark.svg';
import registrationLogoDot from '@/ui/assets/registration-logo-dot.svg';
import registrationLogoDotSecondary from '@/ui/assets/registration-logo-dot-secondary.svg';
import type { ReactNode } from 'react';
import styles from './BrandPanel.module.css';

/** Panel de marca del diseño (Figma, nodo 2:3). */
export function BrandPanel({
  content,
}: {
  content?: {
    title: ReactNode;
    subtitle: string;
    variant?: 'registration';
  };
}) {
  const registrationLogo = content?.variant === 'registration';
  return (
    <header
      className={[styles.panel, registrationLogo && styles.registrationPanel]
        .filter(Boolean)
        .join(' ')}
    >
      <div
        className={[styles.logo, registrationLogo && styles.registrationLogo]
          .filter(Boolean)
          .join(' ')}
      >
        {registrationLogo ? (
          <span className={styles.registrationLogoMark} aria-hidden="true">
            <img src={registrationLogoDot} alt="" width={10} height={28} />
            <img src={registrationLogoDotSecondary} alt="" width={14} height={14} />
          </span>
        ) : (
          <img src={logoMark} alt="" width={20} height={44} />
        )}
        <span className={styles.logoText}>KynWallet</span>
      </div>

      <div className={styles.headline}>
        <p className={styles.title}>
          {content?.title ?? (
            <>
              Tu dinero,
              <br />
              sin fronteras.
            </>
          )}
        </p>
        <p className={styles.subtitle}>
          {content?.subtitle ??
            'Envía, recibe y paga en segundos. Una billetera pensada para tu día a día.'}
        </p>
      </div>

      <div className={styles.card} aria-hidden="true">
        <div className={styles.cardTop}>
          <span className={styles.cardName}>Kyn Card</span>
          <span className={styles.chip} />
        </div>
        <span className={styles.cardNumber}>{'5294  ••••  ••••  4827'}</span>
        <div className={styles.cardBottom}>
          <span>STEVEN LUNA</span>
          <span>12/29</span>
        </div>
      </div>
    </header>
  );
}
