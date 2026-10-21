import { useState } from 'react';
import type { Authenticate } from '@/application/authenticate';
import type { Register } from '@/application/register';
import { MESSAGES } from '@/domain/messages';
import { LoginForm } from '@/ui/features/login/LoginForm';
import { LoginScreen } from '@/ui/features/login/LoginScreen';
import { RegistrationScreen } from '@/ui/features/register/RegistrationScreen';

type AppProps = {
  authenticate: Authenticate;
  register: Register;
};

export function App({ authenticate, register }: AppProps) {
  const [view, setView] = useState<'login' | 'register'>('login');
  const [registrationSuccess, setRegistrationSuccess] = useState<string | null>(null);

  const openRegistration = () => {
    setRegistrationSuccess(null);
    setView('register');
  };

  const finishRegistration = () => {
    setRegistrationSuccess(MESSAGES.REGISTRATION_SUCCESS);
    setView('login');
  };

  if (view === 'register') {
    return (
      <RegistrationScreen
        register={register}
        onSuccess={finishRegistration}
        onLogin={() => setView('login')}
      />
    );
  }

  return (
    <LoginScreen>
      <LoginForm
        authenticate={authenticate}
        onRegister={openRegistration}
        registrationSuccess={registrationSuccess}
      />
    </LoginScreen>
  );
}
