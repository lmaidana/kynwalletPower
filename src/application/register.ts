import type {
  DemoAccount,
  RegistrationErrors,
  RegistrationInput,
  RegistrationResult,
} from '@/domain/auth';
import { normalizeEmail, normalizeFullName, validateRegistration } from '@/domain/validation';
import type { AuthGateway } from './ports/AuthGateway';

export type RegisterResult =
  RegistrationResult | { kind: 'invalid-input'; errors: RegistrationErrors };

export type Register = (input: RegistrationInput) => Promise<RegisterResult>;

/** Valida los datos de alta y delega la creación de la cuenta en el puerto compartido. */
export function createRegister(gateway: AuthGateway): Register {
  return async (input) => {
    const errors = validateRegistration(input);
    if (Object.keys(errors).length > 0) return { kind: 'invalid-input', errors };

    const account: DemoAccount = {
      email: normalizeEmail(input.email),
      password: input.password,
      displayName: normalizeFullName(input.fullName),
    };

    try {
      return await gateway.register(account);
    } catch {
      return { kind: 'unavailable' };
    }
  };
}
