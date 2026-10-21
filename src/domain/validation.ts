import type { LoginCredentials, RegistrationErrors, RegistrationInput } from './auth';
import { MESSAGES } from './messages';

export const FULL_NAME_MAX_LENGTH = 80;
export const EMAIL_MAX_LENGTH = 254;
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 128;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const UPPERCASE_PATTERN = /\p{Lu}/u;
const DECIMAL_DIGIT_PATTERN = /\p{Nd}/u;
const SPECIAL_CHARACTER_PATTERN = /[\p{P}\p{S}]/u;

export type CredentialErrors = Partial<Record<keyof LoginCredentials, string>>;

/** Normaliza un correo para validarlo y compararlo: sin espacios periféricos y en minúsculas. */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/** Recorta espacios periféricos sin alterar los espacios interiores del nombre. */
export function normalizeFullName(fullName: string): string {
  return fullName.trim();
}

export function isValidEmail(email: string): boolean {
  const normalized = normalizeEmail(email);
  return normalized.length <= EMAIL_MAX_LENGTH && EMAIL_PATTERN.test(normalized);
}

export function isValidPasswordLength(password: string): boolean {
  return password.length >= PASSWORD_MIN_LENGTH && password.length <= PASSWORD_MAX_LENGTH;
}

function validateEmail(email: string): string | undefined {
  if (normalizeEmail(email) === '') return MESSAGES.EMAIL_REQUIRED;
  if (!isValidEmail(email)) return MESSAGES.EMAIL_INVALID;
  return undefined;
}

function validatePassword(password: string): string | undefined {
  // La contraseña se valida sin recortar (FR-004).
  if (password === '') return MESSAGES.PASSWORD_REQUIRED;
  if (password.length < PASSWORD_MIN_LENGTH) return MESSAGES.PASSWORD_TOO_SHORT;
  if (password.length > PASSWORD_MAX_LENGTH) return MESSAGES.PASSWORD_TOO_LONG;
  return undefined;
}

/** Reglas de FR-003 y FR-004. Devuelve {} si las credenciales son válidas. */
export function validateCredentials({ email, password }: LoginCredentials): CredentialErrors {
  const errors: CredentialErrors = {};
  const emailError = validateEmail(email);
  const passwordError = validatePassword(password);
  if (emailError) errors.email = emailError;
  if (passwordError) errors.password = passwordError;
  return errors;
}

function validateFullName(fullName: string): string | undefined {
  const normalized = normalizeFullName(fullName);
  if (normalized === '') return MESSAGES.FULL_NAME_REQUIRED;
  if (normalized.length > FULL_NAME_MAX_LENGTH) return MESSAGES.FULL_NAME_TOO_LONG;
  return undefined;
}

function validateRegistrationEmail(email: string): string | undefined {
  const normalized = normalizeEmail(email);
  if (normalized === '') return MESSAGES.EMAIL_REQUIRED;
  if (normalized.length > EMAIL_MAX_LENGTH) return MESSAGES.EMAIL_TOO_LONG;
  if (!EMAIL_PATTERN.test(normalized)) return MESSAGES.EMAIL_INVALID;
  return undefined;
}

function validateRegistrationPassword(password: string): string | undefined {
  if (password === '') return MESSAGES.PASSWORD_REQUIRED;
  if (password.length < PASSWORD_MIN_LENGTH) return MESSAGES.PASSWORD_TOO_SHORT;
  if (password.length > PASSWORD_MAX_LENGTH) return MESSAGES.PASSWORD_TOO_LONG;
  if (!UPPERCASE_PATTERN.test(password)) return MESSAGES.PASSWORD_MISSING_UPPERCASE;
  if (!DECIMAL_DIGIT_PATTERN.test(password)) return MESSAGES.PASSWORD_MISSING_NUMBER;
  if (!SPECIAL_CHARACTER_PATTERN.test(password)) return MESSAGES.PASSWORD_MISSING_SPECIAL;
  return undefined;
}

function validatePasswordConfirmation(
  password: string,
  confirmPassword: string,
): string | undefined {
  if (confirmPassword === '') return MESSAGES.CONFIRM_PASSWORD_REQUIRED;
  if (password !== confirmPassword) return MESSAGES.PASSWORDS_DO_NOT_MATCH;
  return undefined;
}

/**
 * Valida los datos del alta. La unicidad del email se comprueba en el adaptador al registrar.
 * Devuelve {} cuando los datos cumplen las reglas locales.
 */
export function validateRegistration({
  fullName,
  email,
  password,
  confirmPassword,
  termsAccepted,
}: RegistrationInput): RegistrationErrors {
  const errors: RegistrationErrors = {};
  const fullNameError = validateFullName(fullName);
  const emailError = validateRegistrationEmail(email);
  const passwordError = validateRegistrationPassword(password);
  const confirmationError = validatePasswordConfirmation(password, confirmPassword);

  if (fullNameError) errors.fullName = fullNameError;
  if (emailError) errors.email = emailError;
  if (passwordError) errors.password = passwordError;
  if (confirmationError) errors.confirmPassword = confirmationError;
  if (!termsAccepted) errors.termsAccepted = MESSAGES.TERMS_REQUIRED;
  return errors;
}
