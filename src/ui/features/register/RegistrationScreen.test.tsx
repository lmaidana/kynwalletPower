import { render, screen } from '@testing-library/react';
import type { Register } from '@/application/register';
import { LoginScreen } from '@/ui/features/login/LoginScreen';
import { RegistrationScreen } from './RegistrationScreen';

describe('RegistrationScreen', () => {
  const register = vi.fn<Register>().mockResolvedValue({ kind: 'success' });

  it('T033: compone el formulario con el contenido de marca de Figma', () => {
    const { container } = render(
      <RegistrationScreen register={register} onSuccess={vi.fn()} onLogin={vi.fn()} />,
    );

    expect(screen.getByRole('heading', { name: 'Crea tu cuenta' })).toBeInTheDocument();
    const brandTitle = container.querySelector('header .title');
    expect(brandTitle).toHaveTextContent('Comienza tu');
    expect(brandTitle).toHaveTextContent('camino financiero.');
    expect(
      screen.getByText(
        'Crea tu cuenta en minutos y empieza a enviar, recibir y administrar tu dinero desde cualquier lugar.',
      ),
    ).toBeInTheDocument();
    const logoDots = container.querySelectorAll('header img');
    expect(logoDots).toHaveLength(2);
    expect(logoDots[0]).toHaveAttribute('width', '10');
    expect(logoDots[0]).toHaveAttribute('height', '28');
    expect(logoDots[1]).toHaveAttribute('width', '14');
    expect(logoDots[1]).toHaveAttribute('height', '14');
    expect(screen.getByText('KynWallet')).toBeInTheDocument();
    expect(screen.getByText('Kyn Card')).toBeInTheDocument();
  });

  it('T034: conserva el contenido de marca de Login cuando no recibe copy alternativo', () => {
    const { container } = render(
      <LoginScreen>
        <h1>Bienvenido de nuevo</h1>
      </LoginScreen>,
    );

    const brandTitle = container.querySelector('header .title');
    expect(brandTitle).toHaveTextContent('Tu dinero,');
    expect(brandTitle).toHaveTextContent('sin fronteras.');
    expect(
      screen.getByText(
        'Envía, recibe y paga en segundos. Una billetera pensada para tu día a día.',
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Bienvenido de nuevo' })).toBeInTheDocument();
  });
});
