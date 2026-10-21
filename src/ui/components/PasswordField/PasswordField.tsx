import { useState } from 'react';
import eyeIcon from '@/ui/assets/eye.svg';
import { TextField, type TextFieldProps } from '../TextField/TextField';
import styles from './PasswordField.module.css';

export type PasswordFieldProps = Omit<TextFieldProps, 'type' | 'endAdornment'> & {
  visibilityIcon?: string;
};

/** Campo de contraseña con control accesible de visibilidad (FR-013). */
export function PasswordField({ visibilityIcon = eyeIcon, ...props }: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);
  return (
    <TextField
      {...props}
      type={visible ? 'text' : 'password'}
      endAdornment={
        <button
          type="button"
          className={styles.toggle}
          aria-pressed={visible}
          aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          onClick={() => setVisible((current) => !current)}
        >
          <img src={visibilityIcon} alt="" width={20} height={12} />
        </button>
      }
    />
  );
}
