import type { RegistrationInput } from '@/domain/auth';
import { MESSAGES } from '@/domain/messages';
import {
  initialRegistrationState,
  registrationReducer,
  type RegistrationState,
} from './registrationReducer';

const validValues: RegistrationInput = {
  fullName: 'Diego Martínez',
  email: 'diego@example.com',
  password: 'Clave123!',
  confirmPassword: 'Clave123!',
  termsAccepted: true,
};

describe('registrationReducer', () => {
  it('T025: actualiza valores y valida al abandonar un campo', () => {
    const state = registrationReducer(initialRegistrationState, {
      type: 'change',
      field: 'email',
      value: 'incorrecto',
    });
    const blurred = registrationReducer(state, { type: 'blur', field: 'email' });

    expect(blurred.values.email).toBe('incorrecto');
    expect(blurred.touched.email).toBe(true);
    expect(blurred.fieldErrors.email).toBe(MESSAGES.EMAIL_INVALID);
  });

  it('T025: submit inválido marca los campos y no pasa a pending', () => {
    const state = registrationReducer(initialRegistrationState, { type: 'submit' });

    expect(state.status).toBe('editing');
    expect(state.touched).toEqual({
      fullName: true,
      email: true,
      password: true,
      confirmPassword: true,
      termsAccepted: true,
    });
    expect(state.fieldErrors.fullName).toBe(MESSAGES.FULL_NAME_REQUIRED);
    expect(state.fieldErrors.termsAccepted).toBe(MESSAGES.TERMS_REQUIRED);
  });

  it('T025: al corregir un campo elimina únicamente su error', () => {
    const invalid = registrationReducer(initialRegistrationState, { type: 'submit' });
    const corrected = registrationReducer(invalid, {
      type: 'change',
      field: 'fullName',
      value: validValues.fullName,
    });

    expect(corrected.fieldErrors.fullName).toBeUndefined();
    expect(corrected.fieldErrors.email).toBe(MESSAGES.EMAIL_REQUIRED);
  });

  it('T025: cambia el estado de pending y no acepta un segundo submit', () => {
    const editing = {
      ...initialRegistrationState,
      values: validValues,
    } satisfies RegistrationState;
    const pending = registrationReducer(editing, { type: 'submit' });
    const repeated = registrationReducer(pending, { type: 'submit' });

    expect(pending.status).toBe('submitting');
    expect(repeated).toBe(pending);
  });

  it('T025: conserva un estado de error de negocio hasta editar un dato', () => {
    const failed = registrationReducer(
      { ...initialRegistrationState, values: validValues },
      { type: 'result', result: { kind: 'email-already-registered' } },
    );
    expect(failed.resultError).toBe('email-already-registered');
  });
});
