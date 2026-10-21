import type { RegistrationErrors, RegistrationInput, RegistrationResult } from '@/domain/auth';
import { validateRegistration } from '@/domain/validation';
import type { RegisterResult } from '@/application/register';

export type RegistrationField = keyof RegistrationInput;
export type RegistrationTextField = Exclude<RegistrationField, 'termsAccepted'>;
export type RegistrationState = {
  status: 'editing' | 'submitting' | 'success';
  values: RegistrationInput;
  touched: Record<RegistrationField, boolean>;
  fieldErrors: RegistrationErrors;
  resultError: Exclude<RegistrationResult['kind'], 'success'> | null;
  notice: string | null;
};

type RegistrationChangeAction = {
  [Field in RegistrationField]: {
    type: 'change';
    field: Field;
    value: RegistrationInput[Field];
  };
}[RegistrationField];

export type RegistrationAction =
  | RegistrationChangeAction
  | { type: 'blur'; field: RegistrationField }
  | { type: 'showNotice'; message: string }
  | { type: 'submit' }
  | { type: 'result'; result: RegisterResult };

export const initialRegistrationState: RegistrationState = {
  status: 'editing',
  values: {
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    termsAccepted: false,
  },
  touched: {
    fullName: false,
    email: false,
    password: false,
    confirmPassword: false,
    termsAccepted: false,
  },
  fieldErrors: {},
  resultError: null,
  notice: null,
};

const registrationFields: RegistrationField[] = [
  'fullName',
  'email',
  'password',
  'confirmPassword',
  'termsAccepted',
];

function allFieldsTouched(): RegistrationState['touched'] {
  return {
    fullName: true,
    email: true,
    password: true,
    confirmPassword: true,
    termsAccepted: true,
  };
}

function visibleErrors(
  values: RegistrationInput,
  touched: RegistrationState['touched'],
): RegistrationErrors {
  const errors = validateRegistration(values);
  const visible: RegistrationErrors = {};
  for (const field of registrationFields) {
    if (touched[field] && errors[field]) visible[field] = errors[field];
  }
  return visible;
}

export function registrationReducer(
  state: RegistrationState,
  action: RegistrationAction,
): RegistrationState {
  switch (action.type) {
    case 'change': {
      const values = { ...state.values };
      switch (action.field) {
        case 'fullName':
          values.fullName = action.value;
          break;
        case 'email':
          values.email = action.value;
          break;
        case 'password':
          values.password = action.value;
          break;
        case 'confirmPassword':
          values.confirmPassword = action.value;
          break;
        case 'termsAccepted':
          values.termsAccepted = action.value;
          break;
      }
      return {
        ...state,
        status: state.status === 'success' ? 'editing' : state.status,
        values,
        fieldErrors: visibleErrors(values, state.touched),
        resultError: null,
        notice: null,
      };
    }

    case 'blur': {
      const touched = { ...state.touched, [action.field]: true };
      return { ...state, touched, fieldErrors: visibleErrors(state.values, touched) };
    }

    case 'showNotice':
      return { ...state, notice: action.message };

    case 'submit': {
      if (state.status === 'submitting') return state;
      const touched = allFieldsTouched();
      const fieldErrors = visibleErrors(state.values, touched);
      return {
        ...state,
        status: Object.keys(fieldErrors).length === 0 ? 'submitting' : 'editing',
        touched,
        fieldErrors,
        resultError: null,
        notice: null,
      };
    }

    case 'result': {
      if (action.result.kind === 'success') {
        return { ...state, status: 'success', resultError: null };
      }
      if (action.result.kind === 'invalid-input') {
        const touched = allFieldsTouched();
        return {
          ...state,
          status: 'editing',
          touched,
          fieldErrors: action.result.errors,
          resultError: null,
        };
      }
      return { ...state, status: 'editing', resultError: action.result.kind };
    }
  }
}
