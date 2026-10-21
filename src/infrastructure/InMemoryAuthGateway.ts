import type { AuthGateway } from '@/application/ports/AuthGateway';
import type { AuthResult, DemoAccount, LoginCredentials, RegistrationResult } from '@/domain/auth';
import { normalizeEmail } from '@/domain/validation';

const DEFAULT_DELAY_MS = 1000;

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/** Autenticación simulada en memoria (contracts/auth-gateway.md, research.md R5). */
export class InMemoryAuthGateway implements AuthGateway {
  private readonly accounts: DemoAccount[] | null;
  private readonly delayMs: number;

  constructor(accounts: readonly DemoAccount[] | null, options: { delayMs?: number } = {}) {
    this.accounts = accounts ? [...accounts] : null;
    this.delayMs = options.delayMs ?? DEFAULT_DELAY_MS;
  }

  async register(account: DemoAccount): Promise<RegistrationResult> {
    try {
      if (!this.accounts) return { kind: 'unavailable' };

      const email = normalizeEmail(account.email);
      const exists = this.accounts.some((candidate) => normalizeEmail(candidate.email) === email);
      if (exists) return { kind: 'email-already-registered' };

      this.accounts.push({ ...account, email });
      return { kind: 'success' };
    } catch {
      return { kind: 'unavailable' };
    }
  }

  async authenticate(credentials: LoginCredentials): Promise<AuthResult> {
    await wait(this.delayMs);
    try {
      if (!this.accounts) return { kind: 'unavailable' };
      const email = normalizeEmail(credentials.email);
      const account = this.accounts.find((candidate) => normalizeEmail(candidate.email) === email);
      // Correo inexistente y contraseña incorrecta producen el mismo resultado (FR-010).
      if (!account || account.password !== credentials.password) {
        return { kind: 'invalid-credentials' };
      }
      return { kind: 'success', displayName: account.displayName };
    } catch {
      return { kind: 'unavailable' };
    }
  }
}
