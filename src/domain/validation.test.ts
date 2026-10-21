import { MESSAGES } from './messages';
import {
  normalizeEmail,
  normalizeFullName,
  validateCredentials,
  validateRegistration,
} from './validation';

describe('normalizeEmail', () => {
  it('US1-3: recorta espacios periféricos y convierte a minúsculas', () => {
    expect(normalizeEmail('  Demo@Example.COM ')).toBe('demo@example.com');
  });

  it('no altera el contenido interior', () => {
    expect(normalizeEmail('a.b+c@d.com')).toBe('a.b+c@d.com');
  });
});

describe('validateCredentials (data-model.md)', () => {
  const valid = { email: 'ana@example.test', password: 'secreto-123' };

  it('credenciales válidas → {}', () => {
    expect(validateCredentials(valid)).toEqual({});
  });

  it.each(['', '   '])('correo vacío tras trim (%j) → EMAIL_REQUIRED', (email) => {
    expect(validateCredentials({ ...valid, email }).email).toBe(MESSAGES.EMAIL_REQUIRED);
  });

  it.each(['usuario@', 'usuario.com', 'a@b.c', 'a b@c.com'])(
    'US3-2: correo sin formato válido (%s) → EMAIL_INVALID',
    (email) => {
      expect(validateCredentials({ ...valid, email }).email).toBe(MESSAGES.EMAIL_INVALID);
    },
  );

  it('correo de > 254 caracteres → EMAIL_INVALID', () => {
    const email = `${'a'.repeat(245)}@example.test`;
    expect(email.length).toBeGreaterThan(254);
    expect(validateCredentials({ ...valid, email }).email).toBe(MESSAGES.EMAIL_INVALID);
  });

  it('acepta el correo con espacios periféricos', () => {
    expect(validateCredentials({ ...valid, email: '  Ana@Example.test ' })).toEqual({});
  });

  it('contraseña vacía → PASSWORD_REQUIRED', () => {
    expect(validateCredentials({ ...valid, password: '' }).password).toBe(
      MESSAGES.PASSWORD_REQUIRED,
    );
  });

  it('US3-3: contraseña de < 8 caracteres → PASSWORD_TOO_SHORT', () => {
    expect(validateCredentials({ ...valid, password: '1234567' }).password).toBe(
      MESSAGES.PASSWORD_TOO_SHORT,
    );
  });

  it('contraseña de > 128 caracteres → PASSWORD_TOO_LONG', () => {
    expect(validateCredentials({ ...valid, password: 'x'.repeat(129) }).password).toBe(
      MESSAGES.PASSWORD_TOO_LONG,
    );
  });

  it('la contraseña no se recorta: 7 caracteres + espacios cuenta los espacios', () => {
    expect(validateCredentials({ ...valid, password: ' 123456 ' })).toEqual({});
    expect(validateCredentials({ ...valid, password: '        ' })).toEqual({});
  });
});

describe('normalizeFullName (AC-002)', () => {
  it('AC-002: recorta únicamente los espacios periféricos', () => {
    expect(normalizeFullName('  Ana María López  ')).toBe('Ana María López');
  });

  it('AC-002: conserva los espacios interiores', () => {
    expect(normalizeFullName(' Ana  María López ')).toBe('Ana  María López');
  });
});

describe('validateRegistration (AC-002–AC-008)', () => {
  const valid = {
    fullName: 'Ana María López',
    email: 'ana@example.test',
    password: 'Abcdef1!',
    confirmPassword: 'Abcdef1!',
    termsAccepted: true,
  };

  it('AC-002: requiere un nombre no vacío después de recortar', () => {
    expect(validateRegistration({ ...valid, fullName: '   ' }).fullName).toBe(
      MESSAGES.FULL_NAME_REQUIRED,
    );
  });

  it('AC-002: rechaza nombres de más de 80 caracteres después de recortar', () => {
    expect(validateRegistration({ ...valid, fullName: ` ${'a'.repeat(81)} ` }).fullName).toBe(
      MESSAGES.FULL_NAME_TOO_LONG,
    );
  });

  it.each(['', '   '])('AC-003: requiere email (%j)', (email) => {
    expect(validateRegistration({ ...valid, email }).email).toBe(MESSAGES.EMAIL_REQUIRED);
  });

  it.each(['usuario@', 'usuario.com', 'a@b.c', 'a b@c.com'])(
    'AC-003: rechaza un email de formato inválido (%s)',
    (email) => {
      expect(validateRegistration({ ...valid, email }).email).toBe(MESSAGES.EMAIL_INVALID);
    },
  );

  it('AC-003: rechaza emails de más de 254 caracteres con un mensaje específico', () => {
    const email = `${'a'.repeat(245)}@example.test`;
    expect(email.length).toBeGreaterThan(254);
    expect(validateRegistration({ ...valid, email }).email).toBe(MESSAGES.EMAIL_TOO_LONG);
  });

  it('AC-003, AC-004: recorta y normaliza el email sin rechazar espacios periféricos', () => {
    expect(normalizeEmail('  Ana@Example.test ')).toBe('ana@example.test');
    expect(validateRegistration({ ...valid, email: '  Ana@Example.test ' })).toEqual({});
  });

  it('AC-005: requiere contraseña', () => {
    expect(validateRegistration({ ...valid, password: '', confirmPassword: '' }).password).toBe(
      MESSAGES.PASSWORD_REQUIRED,
    );
  });

  it('AC-005: aplica el mínimo y máximo de longitud antes de evaluar complejidad', () => {
    expect(
      validateRegistration({ ...valid, password: 'Ab1!xyz', confirmPassword: 'Ab1!xyz' }).password,
    ).toBe(MESSAGES.PASSWORD_TOO_SHORT);
    expect(
      validateRegistration({
        ...valid,
        password: `A1!${'x'.repeat(126)}`,
        confirmPassword: `A1!${'x'.repeat(126)}`,
      }).password,
    ).toBe(MESSAGES.PASSWORD_TOO_LONG);
  });

  it.each([
    ['abcdef1!', MESSAGES.PASSWORD_MISSING_UPPERCASE],
    ['Abcdefg!', MESSAGES.PASSWORD_MISSING_NUMBER],
    ['Abcdef1x', MESSAGES.PASSWORD_MISSING_SPECIAL],
  ])('AC-005: exige la regla de contraseña correspondiente para %s', (password, message) => {
    expect(validateRegistration({ ...valid, password, confirmPassword: password }).password).toBe(
      message,
    );
  });

  it('AC-005: considera mayúsculas Unicode y dígitos decimales', () => {
    expect(
      validateRegistration({
        ...valid,
        password: 'Éabcdef١!',
        confirmPassword: 'Éabcdef١!',
      }),
    ).toEqual({});
  });

  it('AC-005, AC-006: no recorta la contraseña y espacios no satisfacen carácter especial', () => {
    expect(
      validateRegistration({
        ...valid,
        password: ' Abcdef1 ',
        confirmPassword: ' Abcdef1 ',
      }).password,
    ).toBe(MESSAGES.PASSWORD_MISSING_SPECIAL);
  });

  it('AC-006: requiere confirmación', () => {
    expect(validateRegistration({ ...valid, confirmPassword: '' }).confirmPassword).toBe(
      MESSAGES.CONFIRM_PASSWORD_REQUIRED,
    );
  });

  it.each(['abcdef1!', 'Abcdef1! ', ' Abcdef1!'])(
    'AC-006: compara la confirmación exactamente (%j)',
    (confirmPassword) => {
      expect(validateRegistration({ ...valid, confirmPassword }).confirmPassword).toBe(
        MESSAGES.PASSWORDS_DO_NOT_MATCH,
      );
    },
  );

  it('AC-007: requiere aceptación explícita de términos', () => {
    expect(validateRegistration({ ...valid, termsAccepted: false }).termsAccepted).toBe(
      MESSAGES.TERMS_REQUIRED,
    );
  });

  it('AC-008: devuelve errores en orden estable de controles', () => {
    expect(
      Object.keys(
        validateRegistration({
          ...valid,
          fullName: '',
          email: '',
          password: '',
          confirmPassword: '',
          termsAccepted: false,
        }),
      ),
    ).toEqual(['fullName', 'email', 'password', 'confirmPassword', 'termsAccepted']);
  });

  it('AC-002–AC-007: devuelve {} cuando todos los datos cumplen las reglas', () => {
    expect(validateRegistration(valid)).toEqual({});
  });
});
