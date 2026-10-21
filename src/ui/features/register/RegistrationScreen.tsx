import type { Register } from '@/application/register';
import { RegistrationForm } from './RegistrationForm';
import { LoginScreen } from '@/ui/features/login/LoginScreen';

type RegistrationScreenProps = {
  register: Register;
  onSuccess: () => void;
  onLogin: () => void;
};

export function RegistrationScreen({ register, onSuccess, onLogin }: RegistrationScreenProps) {
  return (
    <LoginScreen
      brandContent={{
        title: (
          <>
            Comienza tu
            <br />
            camino financiero.
          </>
        ),
        subtitle:
          'Crea tu cuenta en minutos y empieza a enviar, recibir y administrar tu dinero desde cualquier lugar.',
        variant: 'registration',
      }}
      formLayout="registration"
    >
      <RegistrationForm register={register} onSuccess={onSuccess} onLogin={onLogin} />
    </LoginScreen>
  );
}
