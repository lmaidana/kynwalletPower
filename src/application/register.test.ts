import type { AuthGateway } from './ports/AuthGateway';
import { createRegister } from './register';
import { MESSAGES } from '@/domain/messages';

describe('createRegister', () => {
  const validInput = {
    fullName: ' Ana María López ',
    email: ' Ana@Example.test ',
    password: 'Abcdef1!',
    confirmPassword: 'Abcdef1!',
    termsAccepted: true,
  };

  it('AC-008: datos inválidos no llaman al gateway', async () => {
    const gateway: AuthGateway = {
      authenticate: vi.fn(),
      register: vi.fn().mockResolvedValue({ kind: 'success' }),
    };

    await expect(
      createRegister(gateway)({ ...validInput, fullName: ' ', termsAccepted: false }),
    ).resolves.toEqual({
      kind: 'invalid-input',
      errors: {
        fullName: MESSAGES.FULL_NAME_REQUIRED,
        termsAccepted: MESSAGES.TERMS_REQUIRED,
      },
    });
    expect(gateway.register).not.toHaveBeenCalled();
  });

  it('AC-010, AC-012: normaliza nombre y email y delega una sola cuenta', async () => {
    const register = vi.fn().mockResolvedValue({ kind: 'success' });
    const gateway: AuthGateway = { authenticate: vi.fn(), register };

    await expect(createRegister(gateway)(validInput)).resolves.toEqual({ kind: 'success' });
    expect(register).toHaveBeenCalledTimes(1);
    expect(register).toHaveBeenCalledWith({
      email: 'ana@example.test',
      password: 'Abcdef1!',
      displayName: 'Ana María López',
    });
  });

  it('AC-010: no incluye confirmación ni aceptación en la cuenta delegada', async () => {
    const register = vi.fn().mockResolvedValue({ kind: 'success' });
    const gateway: AuthGateway = { authenticate: vi.fn(), register };

    await createRegister(gateway)(validInput);

    expect(register.mock.calls[0]?.[0]).not.toHaveProperty('confirmPassword');
    expect(register.mock.calls[0]?.[0]).not.toHaveProperty('termsAccepted');
  });

  it('AC-004: propaga el resultado de correo duplicado', async () => {
    const gateway: AuthGateway = {
      authenticate: vi.fn(),
      register: vi.fn().mockResolvedValue({ kind: 'email-already-registered' }),
    };

    await expect(createRegister(gateway)(validInput)).resolves.toEqual({
      kind: 'email-already-registered',
    });
  });

  it('FR-017: informa unavailable cuando el adaptador no permite registrar', async () => {
    const gateway: AuthGateway = {
      authenticate: vi.fn(),
      register: vi.fn().mockResolvedValue({ kind: 'unavailable' }),
    };

    await expect(createRegister(gateway)(validInput)).resolves.toEqual({ kind: 'unavailable' });
  });

  it('FR-017: transforma un fallo inesperado en resultado unavailable explícito', async () => {
    const gateway: AuthGateway = {
      authenticate: vi.fn(),
      register: vi.fn().mockRejectedValue(new Error('internal failure')),
    };
    const consoleError = vi.spyOn(console, 'error');

    await expect(createRegister(gateway)(validInput)).resolves.toEqual({ kind: 'unavailable' });
    expect(consoleError).not.toHaveBeenCalled();
    consoleError.mockRestore();
  });

  it('FR-018: nunca devuelve la contraseña en el resultado del registro', async () => {
    const gateway: AuthGateway = {
      authenticate: vi.fn(),
      register: vi.fn().mockResolvedValue({ kind: 'success' }),
    };

    const result = await createRegister(gateway)(validInput);

    expect(JSON.stringify(result)).not.toContain(validInput.password);
  });
});
