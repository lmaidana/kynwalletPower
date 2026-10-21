import { loadDemoAccounts } from './loadDemoAccounts';

const valid = { email: ' Ana@Example.test ', password: 'secreto-123', displayName: 'Ana' };
const raw = (value: unknown) => JSON.stringify(value);

describe('loadDemoAccounts', () => {
  it('JSON válido → cuentas con correo normalizado', () => {
    expect(loadDemoAccounts(raw([valid]))).toEqual([
      { email: 'ana@example.test', password: 'secreto-123', displayName: 'Ana' },
    ]);
  });

  it('FR-006: las cuentas iniciales mantienen las reglas de login, sin complejidad de registro', () => {
    expect(loadDemoAccounts(raw([{ ...valid, password: 'secreto-123' }]))).toEqual([
      { email: 'ana@example.test', password: 'secreto-123', displayName: 'Ana' },
    ]);
  });

  it.each([
    ['indefinido', undefined],
    ['vacío', ''],
    ['JSON inválido', '{no-json'],
    ['no es arreglo', raw(valid)],
    ['arreglo vacío', raw([])],
  ])('devuelve null si la configuración es %s', (_label, value) => {
    expect(loadDemoAccounts(value)).toBeNull();
  });

  it.each([
    ['email: obligatorio', { ...valid, email: '' }],
    ['email: formato válido', { ...valid, email: 'ana@' }],
    ['password: obligatorio', { ...valid, password: '' }],
    ['password: 8–128 caracteres (corta)', { ...valid, password: '1234567' }],
    ['password: 8–128 caracteres (larga)', { ...valid, password: 'x'.repeat(129) }],
    ['displayName: obligatorio', { ...valid, displayName: '' }],
    ['displayName: 1–80 caracteres', { ...valid, displayName: 'x'.repeat(81) }],
    ['tipos incorrectos', { ...valid, password: 12345678 }],
    ['no es objeto', 'cuenta'],
  ])('devuelve null si una cuenta incumple "%s"', (_rule, account) => {
    expect(loadDemoAccounts(raw([account]))).toBeNull();
  });

  it('devuelve null si hay correos duplicados (sin distinguir mayúsculas)', () => {
    expect(loadDemoAccounts(raw([valid, { ...valid, email: 'ANA@example.test' }]))).toBeNull();
  });
});
