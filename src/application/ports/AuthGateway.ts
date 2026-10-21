import type { AuthResult, DemoAccount, LoginCredentials, RegistrationResult } from '@/domain/auth';

/** Puerto compartido por los casos de uso de autenticación y registro. */
export interface AuthGateway {
  authenticate(credentials: LoginCredentials): Promise<AuthResult>;
  register(account: DemoAccount): Promise<RegistrationResult>;
}
