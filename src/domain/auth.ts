export type LoginCredentials = {
  email: string;
  password: string;
};

export type AuthResult =
  | { kind: 'success'; displayName: string }
  | { kind: 'invalid-credentials' }
  | { kind: 'unavailable' };

export type DemoAccount = {
  email: string;
  password: string;
  displayName: string;
};

export type RegistrationInput = {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  termsAccepted: boolean;
};

export type RegistrationErrors = Partial<Record<keyof RegistrationInput, string>>;

export type RegistrationResult =
  { kind: 'success' } | { kind: 'email-already-registered' } | { kind: 'unavailable' };
