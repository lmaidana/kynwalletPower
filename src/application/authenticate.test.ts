import type { AuthGateway } from './ports/AuthGateway';
import { createAuthenticate } from './authenticate';

describe('createAuthenticate', () => {
  it('delega con el correo normalizado y la contraseña sin modificar', async () => {
    const gateway: AuthGateway = {
      authenticate: vi.fn().mockResolvedValue({ kind: 'success', displayName: 'Ana' }),
      register: vi.fn().mockResolvedValue({ kind: 'success' }),
    };
    const result = await createAuthenticate(gateway)({
      email: ' Ana@Example.test ',
      password: ' con espacios ',
    });
    expect(gateway.authenticate).toHaveBeenCalledWith({
      email: 'ana@example.test',
      password: ' con espacios ',
    });
    expect(result).toEqual({ kind: 'success', displayName: 'Ana' });
  });

  it('AC-012: mantiene la contraseña exacta al autenticar una cuenta registrada', async () => {
    const gateway: AuthGateway = {
      authenticate: vi.fn().mockResolvedValue({ kind: 'invalid-credentials' }),
      register: vi.fn().mockResolvedValue({ kind: 'success' }),
    };
    const password = 'Abcdef1! ';

    await createAuthenticate(gateway)({
      email: 'ANA@example.test ',
      password,
    });

    expect(gateway.authenticate).toHaveBeenCalledWith({
      email: 'ana@example.test',
      password,
    });
  });

  it('FR-019: si el gateway lanza una excepción devuelve unavailable', async () => {
    const gateway: AuthGateway = {
      authenticate: vi.fn().mockRejectedValue(new Error('x')),
      register: vi.fn().mockResolvedValue({ kind: 'success' }),
    };
    await expect(createAuthenticate(gateway)({ email: 'a@b.co', password: 'p' })).resolves.toEqual({
      kind: 'unavailable',
    });
  });
});
