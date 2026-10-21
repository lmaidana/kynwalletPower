import { useCallback, useEffect, useReducer, useRef } from 'react';
import type { Register } from '@/application/register';
import type { RegistrationErrors } from '@/domain/auth';
import { validateRegistration } from '@/domain/validation';
import {
  initialRegistrationState,
  registrationReducer,
  type RegistrationField,
  type RegistrationTextField,
} from './registrationReducer';

export function useRegistrationForm(register: Register, onSuccess: () => void) {
  const [state, dispatch] = useReducer(registrationReducer, initialRegistrationState);
  const inFlight = useRef(false);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const change = useCallback((field: RegistrationTextField, value: string) => {
    dispatch({ type: 'change', field, value });
  }, []);

  const changeTerms = useCallback((checked: boolean) => {
    dispatch({ type: 'change', field: 'termsAccepted', value: checked });
  }, []);

  const blur = useCallback((field: RegistrationField) => dispatch({ type: 'blur', field }), []);

  const submit = useCallback(async (): Promise<RegistrationErrors | null> => {
    if (inFlight.current) return null;
    const errors = validateRegistration(state.values);
    dispatch({ type: 'submit' });
    if (Object.keys(errors).length > 0) return errors;

    inFlight.current = true;
    try {
      const result = await register(state.values);
      if (!mounted.current) return null;
      dispatch({ type: 'result', result });
      if (result.kind === 'success') onSuccess();
      if (result.kind === 'invalid-input') return result.errors;
      return null;
    } catch {
      if (mounted.current) {
        dispatch({ type: 'result', result: { kind: 'unavailable' } });
      }
      return null;
    } finally {
      inFlight.current = false;
    }
  }, [onSuccess, register, state.values]);

  const showNotice = useCallback((message: string) => {
    dispatch({ type: 'showNotice', message });
  }, []);

  return { state, change, changeTerms, blur, submit, showNotice };
}
