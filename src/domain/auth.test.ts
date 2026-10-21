import type { DemoAccount, RegistrationInput, RegistrationResult } from './auth';

describe('Registration domain contracts', () => {
  it('AC-010, AC-012: el input incluye confirmación y aceptación, pero la cuenta no', () => {
    const input: RegistrationInput = {
      fullName: ' Ana López ',
      email: 'ana@example.test',
      password: 'Abcdef1!',
      confirmPassword: 'Abcdef1!',
      termsAccepted: true,
    };
    const account: DemoAccount = {
      email: 'ana@example.test',
      password: 'Abcdef1!',
      displayName: 'Ana López',
    };

    expect(Object.keys(input)).toEqual([
      'fullName',
      'email',
      'password',
      'confirmPassword',
      'termsAccepted',
    ]);
    expect(Object.keys(account)).toEqual(['email', 'password', 'displayName']);
  });

  it('AC-004, AC-010: los resultados de registro son variantes de negocio discriminadas', () => {
    const results: RegistrationResult[] = [
      { kind: 'success' },
      { kind: 'email-already-registered' },
      { kind: 'unavailable' },
    ];

    expect(results.map(({ kind }) => kind)).toEqual([
      'success',
      'email-already-registered',
      'unavailable',
    ]);
  });
});
