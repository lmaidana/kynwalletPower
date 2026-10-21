import { useId, type ReactNode, type Ref } from 'react';
import styles from './Checkbox.module.css';

type CheckboxProps = {
  label: string;
  ariaLabel?: string;
  checked: boolean;
  required?: boolean;
  onChange: (checked: boolean) => void;
  children?: ReactNode;
  error?: string;
  disabled?: boolean;
  onBlur?: () => void;
  ref?: Ref<HTMLInputElement>;
};

export function Checkbox({
  label,
  ariaLabel,
  checked,
  required,
  onChange,
  children,
  error,
  disabled,
  onBlur,
  ref,
}: CheckboxProps) {
  const id = useId();
  const errorId = `${id}-error`;
  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <input
          id={id}
          ref={ref}
          type="checkbox"
          className={styles.box}
          aria-label={ariaLabel}
          checked={checked}
          required={required}
          onChange={(event) => onChange(event.target.checked)}
          disabled={disabled}
          onBlur={onBlur}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
        />
        <label htmlFor={id} className={styles.label}>
          {label}
        </label>
        {children}
      </div>
      {error && (
        <p id={errorId} className={styles.error}>
          {error}
        </p>
      )}
    </div>
  );
}
