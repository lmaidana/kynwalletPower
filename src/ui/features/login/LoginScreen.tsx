import type { ReactNode } from 'react';
import { BrandPanel } from '@/ui/layout/BrandPanel/BrandPanel';
import styles from './LoginScreen.module.css';

type BrandContent = {
  title: ReactNode;
  subtitle: string;
  variant?: 'registration';
};

type LoginScreenProps = {
  children: ReactNode;
  brandContent?: BrandContent;
  formLayout?: 'registration';
};

export function LoginScreen({ children, brandContent, formLayout }: LoginScreenProps) {
  return (
    <div className={styles.screen}>
      <BrandPanel content={brandContent} />
      <main className={styles.formPanel}>
        <div
          className={[styles.content, formLayout === 'registration' && styles.registrationContent]
            .filter(Boolean)
            .join(' ')}
        >
          {children}
        </div>
      </main>
    </div>
  );
}
