import { TEST_ACCOUNT } from '@/test/fixtures';
import { InMemoryAuthGateway } from './InMemoryAuthGateway';
import type { DemoAccount } from '@/domain/auth';

const gateway = (accounts = [TEST_ACCOUNT]) => new InMemoryAuthGateway(accounts, { delayMs: 0 });

describe('InMemoryAuthGateway (contracts/auth-gateway.md)', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('C1: correo con mayúsculas y espacios + contraseña exacta → success', async () => {
    const result = await gateway().authenticate({
      email: '  STEVEN.Luna@Example.test ',
      password: TEST_ACCOUNT.password,
    });
    expect(result).toEqual({ kind: 'success', displayName: 'Steven Luna' });
  });

  it.each([
    ['contraseña distinta', 'otra-clave-99'],
    ['diferencia de mayúsculas', 'FIXTURE-PASS-01'],
    ['espacios periféricos', ' fixture-pass-01 '],
  ])('C2: correo existente con %s → invalid-credentials', async (_label, password) => {
    const result = await gateway().authenticate({ email: TEST_ACCOUNT.email, password });
    expect(result).toEqual({ kind: 'invalid-credentials' });
  });

  it('C3: correo inexistente → resultado idéntico a C2', async () => {
    const unknown = await gateway().authenticate({
      email: 'nadie@example.test',
      password: TEST_ACCOUNT.password,
    });
    const wrongPassword = await gateway().authenticate({
      email: TEST_ACCOUNT.email,
      password: 'otra-clave-99',
    });
    expect(unknown).toEqual(wrongPassword);
  });

  it('C4: configuración ausente → unavailable', async () => {
    const result = await new InMemoryAuthGateway(null, { delayMs: 0 }).authenticate({
      email: TEST_ACCOUNT.email,
      password: TEST_ACCOUNT.password,
    });
    expect(result).toEqual({ kind: 'unavailable' });
  });

  it('C5: una excepción interna → unavailable sin rechazar la promesa', async () => {
    const broken = [
      {
        get email(): string {
          throw new Error('boom');
        },
        password: 'x',
        displayName: 'x',
      },
    ];
    await expect(
      gateway(broken).authenticate({ email: 'a@b.co', password: 'whatever1' }),
    ).resolves.toEqual({ kind: 'unavailable' });
  });

  it('C6: el resultado nunca contiene la contraseña', async () => {
    const result = await gateway().authenticate({
      email: TEST_ACCOUNT.email,
      password: TEST_ACCOUNT.password,
    });
    expect(JSON.stringify(result)).not.toContain(TEST_ACCOUNT.password);
  });

  it('FR-008: espera delayMs antes de responder (1000 ms por defecto)', async () => {
    vi.useFakeTimers();
    const onResolve = vi.fn();
    new InMemoryAuthGateway([TEST_ACCOUNT])
      .authenticate({ email: TEST_ACCOUNT.email, password: TEST_ACCOUNT.password })
      .then(onResolve);
    await vi.advanceTimersByTimeAsync(999);
    expect(onResolve).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1);
    expect(onResolve).toHaveBeenCalledOnce();
  });

  it('AC-010, AC-012: registra una cuenta y permite autenticarla en la misma instancia', async () => {
    const authGateway = gateway();
    const account: DemoAccount = {
      email: 'ana@example.test',
      password: 'Abcdef1!',
      displayName: 'Ana López',
    };

    await expect(authGateway.register(account)).resolves.toEqual({ kind: 'success' });
    await expect(
      authGateway.authenticate({ email: 'ana@example.test', password: 'Abcdef1!' }),
    ).resolves.toEqual({ kind: 'success', displayName: 'Ana López' });
  });

  it('AC-010: guarda una copia normalizada y no muta la lista inicial recibida', async () => {
    const initialAccounts = [TEST_ACCOUNT];
    const authGateway = gateway(initialAccounts);
    const account: DemoAccount = {
      email: ' Ana@Example.test ',
      password: 'Abcdef1!',
      displayName: ' Ana López ',
    };

    await authGateway.register(account);

    expect(initialAccounts).toHaveLength(1);
    expect(account).toEqual({
      email: ' Ana@Example.test ',
      password: 'Abcdef1!',
      displayName: ' Ana López ',
    });
    await expect(
      authGateway.authenticate({ email: 'ANA@example.test', password: 'Abcdef1!' }),
    ).resolves.toEqual({ kind: 'success', displayName: ' Ana López ' });
  });

  it('AC-004: rechaza correos duplicados normalizados en las cuentas iniciales', async () => {
    const authGateway = gateway();

    await expect(
      authGateway.register({
        email: `  ${TEST_ACCOUNT.email.toUpperCase()} `,
        password: 'Abcdef1!',
        displayName: 'Otra persona',
      }),
    ).resolves.toEqual({ kind: 'email-already-registered' });
  });

  it('AC-004, AC-011: rechaza un correo ya registrado aunque cambien mayúsculas y espacios', async () => {
    const authGateway = gateway();
    const account: DemoAccount = {
      email: 'ana@example.test',
      password: 'Abcdef1!',
      displayName: 'Ana López',
    };
    await authGateway.register(account);

    await expect(
      authGateway.register({
        ...account,
        email: '  ANA@EXAMPLE.TEST ',
        displayName: 'Ana duplicada',
      }),
    ).resolves.toEqual({ kind: 'email-already-registered' });
    await expect(
      authGateway.authenticate({ email: account.email, password: account.password }),
    ).resolves.toEqual({ kind: 'success', displayName: 'Ana López' });
  });

  it('AC-004: una cuenta registrada con email normalizado solo se añade una vez', async () => {
    const authGateway = gateway();
    const account: DemoAccount = {
      email: 'ana@example.test',
      password: 'Abcdef1!',
      displayName: 'Ana López',
    };

    await expect(authGateway.register(account)).resolves.toEqual({ kind: 'success' });
    await expect(authGateway.register(account)).resolves.toEqual({
      kind: 'email-already-registered',
    });
  });

  it('AC-020: una instancia nueva no conserva usuarios registrados en una instancia anterior', async () => {
    const firstSession = gateway();
    await firstSession.register({
      email: 'ana@example.test',
      password: 'Abcdef1!',
      displayName: 'Ana López',
    });

    const nextSession = gateway();

    await expect(
      nextSession.authenticate({ email: 'ana@example.test', password: 'Abcdef1!' }),
    ).resolves.toEqual({ kind: 'invalid-credentials' });
  });

  it('FR-010: el registro no está disponible si la configuración inicial es null', async () => {
    const authGateway = new InMemoryAuthGateway(null, { delayMs: 0 });

    await expect(
      authGateway.register({
        email: 'ana@example.test',
        password: 'Abcdef1!',
        displayName: 'Ana López',
      }),
    ).resolves.toEqual({ kind: 'unavailable' });
  });

  it('AC-012: email se normaliza y password se compara exactamente en las cuentas registradas', async () => {
    const authGateway = gateway();
    await authGateway.register({
      email: 'ana@example.test',
      password: 'Abcdef1! ',
      displayName: 'Ana López',
    });

    await expect(
      authGateway.authenticate({
        email: ' ANA@example.test ',
        password: 'Abcdef1! ',
      }),
    ).resolves.toEqual({ kind: 'success', displayName: 'Ana López' });
    await expect(
      authGateway.authenticate({
        email: 'ana@example.test',
        password: 'Abcdef1!',
      }),
    ).resolves.toEqual({ kind: 'invalid-credentials' });
  });
});
