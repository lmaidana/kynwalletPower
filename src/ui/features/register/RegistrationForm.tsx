import { useRef, type FormEvent } from 'react';
import type { Register } from '@/application/register';
import registrationEye from '@/ui/assets/registration-eye.svg';
import registrationSocialDot from '@/ui/assets/registration-social-dot.svg';
import { MESSAGES } from '@/domain/messages';
import { Alert } from '@/ui/components/Alert/Alert';
import { Button } from '@/ui/components/Button/Button';
import { Checkbox } from '@/ui/components/Checkbox/Checkbox';
import { Divider } from '@/ui/components/Divider/Divider';
import { PasswordField } from '@/ui/components/PasswordField/PasswordField';
import { SocialButton } from '@/ui/components/SocialButton/SocialButton';
import { TextField } from '@/ui/components/TextField/TextField';
import { useRegistrationForm } from './useRegistrationForm';
import styles from './RegistrationForm.module.css';

type RegistrationFormProps = {
  register: Register;
  onSuccess: () => void;
  onLogin: () => void;
};

export function RegistrationForm({ register, onSuccess, onLogin }: RegistrationFormProps) {
  const { state, change, changeTerms, blur, submit, showNotice } = useRegistrationForm(
    register,
    onSuccess,
  );
  const fullNameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmPasswordRef = useRef<HTMLInputElement>(null);
  const termsRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void submit().then((errors) => {
      if (!errors) return;
      if (errors.fullName) fullNameRef.current?.focus();
      else if (errors.email) emailRef.current?.focus();
      else if (errors.password) passwordRef.current?.focus();
      else if (errors.confirmPassword) confirmPasswordRef.current?.focus();
      else if (errors.termsAccepted) termsRef.current?.focus();
    });
  };

  const pending = state.status === 'submitting';
  const resultError =
    state.resultError === 'email-already-registered'
      ? MESSAGES.EMAIL_ALREADY_REGISTERED
      : state.resultError === 'unavailable'
        ? MESSAGES.REGISTRATION_UNAVAILABLE
        : null;

  return (
    <form className={styles.form} noValidate onSubmit={handleSubmit}>
      <div className={styles.heading}>
        <h1 className={styles.title}>Crea tu cuenta</h1>
        <p className={styles.subtitle}>Completa tus datos para comenzar</p>
      </div>

      <TextField
        ref={fullNameRef}
        label="Nombre completo"
        name="fullName"
        autoComplete="name"
        placeholder="Ej: Diego Martínez"
        value={state.values.fullName}
        error={state.fieldErrors.fullName}
        required
        disabled={pending}
        onChange={(event) => change('fullName', event.target.value)}
        onBlur={() => blur('fullName')}
      />

      <TextField
        ref={emailRef}
        label="Correo electrónico"
        type="email"
        name="email"
        autoComplete="email"
        placeholder="tucorreo@ejemplo.com"
        value={state.values.email}
        error={state.fieldErrors.email}
        required
        disabled={pending}
        onChange={(event) => change('email', event.target.value)}
        onBlur={() => blur('email')}
      />

      <PasswordField
        ref={passwordRef}
        label="Contraseña"
        visibilityIcon={registrationEye}
        name="password"
        autoComplete="new-password"
        placeholder="••••••••"
        value={state.values.password}
        error={state.fieldErrors.password}
        required
        disabled={pending}
        onChange={(event) => change('password', event.target.value)}
        onBlur={() => blur('password')}
      />

      <PasswordField
        ref={confirmPasswordRef}
        label="Confirmar contraseña"
        visibilityIcon={registrationEye}
        name="confirmPassword"
        autoComplete="new-password"
        placeholder="••••••••"
        value={state.values.confirmPassword}
        error={state.fieldErrors.confirmPassword}
        required
        disabled={pending}
        onChange={(event) => change('confirmPassword', event.target.value)}
        onBlur={() => blur('confirmPassword')}
      />

      <Checkbox
        ref={termsRef}
        label="Acepto los"
        ariaLabel="Acepto los términos y condiciones"
        checked={state.values.termsAccepted}
        required
        error={state.fieldErrors.termsAccepted}
        disabled={pending}
        onChange={changeTerms}
        onBlur={() => blur('termsAccepted')}
      >
        <Button
          className={styles.termsLink}
          variant="link"
          onClick={() => showNotice(MESSAGES.TERMS_UNAVAILABLE)}
        >
          términos y condiciones
        </Button>
      </Checkbox>

      {resultError && <Alert tone="error">{resultError}</Alert>}
      {state.notice && <Alert tone="info">{state.notice}</Alert>}

      <Button type="submit" loading={pending} loadingLabel="Creando cuenta…" disabled={pending}>
        Crear cuenta
      </Button>

      <Divider className={styles.divider}>o regístrate con</Divider>

      <div className={styles.social}>
        <SocialButton
          provider="Google"
          icon={registrationSocialDot}
          onClick={() => showNotice(MESSAGES.GOOGLE_REGISTRATION_UNAVAILABLE)}
        />
        <SocialButton
          provider="Apple"
          icon={registrationSocialDot}
          onClick={() => showNotice(MESSAGES.APPLE_REGISTRATION_UNAVAILABLE)}
        />
      </div>

      <p className={styles.footer}>
        ¿Ya tienes cuenta?
        <Button variant="link" onClick={onLogin}>
          Inicia sesión
        </Button>
      </p>
    </form>
  );
}
