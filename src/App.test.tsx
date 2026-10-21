import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createAuthenticate } from '@/application/authenticate';
import { createRegister, type Register } from '@/application/register';
import { MESSAGES } from '@/domain/messages';
import { InMemoryAuthGateway } from '@/infrastructure/InMemoryAuthGateway';
import { expectNoA11yViolations } from '@/test/a11y';
import { createAuthStub } from '@/test/authStub';
import { TEST_ACCOUNT } from '@/test/fixtures';
import { App } from './App';

const defaultRegister = vi.fn<Register>().mockResolvedValue({ kind: 'success' });

function renderApp(accounts: (typeof TEST_ACCOUNT)[] | null = [TEST_ACCOUNT]) {
  const gateway = new InMemoryAuthGateway(accounts, { delayMs: 0 });
  const authenticate = vi.fn(createAuthenticate(gateway));
  const register = vi.fn(createRegister(gateway));
  const view = render(<App authenticate={authenticate} register={register} />);
  return { ...view, gateway, authenticate, register };
}

describe('App · accesibilidad de la pantalla completa (FR-015, SC-005)', () => {
  it('vista de login sin violaciones', async () => {
    const { container } = render(
      <App authenticate={createAuthStub().authenticate} register={defaultRegister} />,
    );
    await expectNoA11yViolations(container);
  });

  it('vista de login con errores visibles sin violaciones', async () => {
    const { container } = render(
      <App authenticate={createAuthStub().authenticate} register={defaultRegister} />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Iniciar sesión' }));
    await userEvent.click(screen.getByRole('button', { name: 'Google' }));
    await expectNoA11yViolations(container);
  });

  it('vista de bienvenida sin violaciones', async () => {
    const { container } = render(
      <App authenticate={createAuthStub().authenticate} register={defaultRegister} />,
    );
    await userEvent.type(screen.getByLabelText('Correo electrónico'), TEST_ACCOUNT.email);
    await userEvent.type(screen.getByLabelText('Contraseña'), TEST_ACCOUNT.password);
    await userEvent.click(screen.getByRole('button', { name: 'Iniciar sesión' }));
    await screen.findByRole('heading', { name: /Bienvenido,/ });
    await expectNoA11yViolations(container);
  });
});

describe('App · integración Login y Registro', () => {
  it('T035: navega entre vistas sin recargar ni registrar al volver a Login', async () => {
    const user = userEvent.setup();
    const { register } = renderApp();
    const initialUrl = window.location.href;

    await user.click(screen.getByRole('button', { name: 'Regístrate' }));
    expect(screen.getByRole('heading', { name: 'Crea tu cuenta' })).toBeInTheDocument();
    expect(register).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Inicia sesión' }));
    expect(screen.getByRole('heading', { name: 'Bienvenido de nuevo' })).toBeInTheDocument();
    expect(register).not.toHaveBeenCalled();
    expect(window.location.href).toBe(initialUrl);
  });

  it('T036: registra y autentica con la misma instancia, mostrando y enfocando la confirmación', async () => {
    const user = userEvent.setup();
    const { authenticate, register, container } = renderApp();

    await user.click(screen.getByRole('button', { name: 'Regístrate' }));
    await user.type(screen.getByLabelText('Nombre completo'), 'Ana López');
    await user.type(screen.getByLabelText('Correo electrónico'), 'ANA@example.test');
    await user.type(screen.getByLabelText('Contraseña'), 'Clave123!');
    await user.type(screen.getByLabelText('Confirmar contraseña'), 'Clave123!');
    await user.click(screen.getByRole('checkbox', { name: 'Acepto los términos y condiciones' }));
    await user.click(screen.getByRole('button', { name: 'Crear cuenta' }));

    const confirmation = await screen.findByRole('status');
    expect(confirmation).toHaveTextContent(MESSAGES.REGISTRATION_SUCCESS);
    expect(confirmation).toHaveFocus();
    expect(screen.getByRole('heading', { name: 'Bienvenido de nuevo' })).toBeInTheDocument();
    expect(register).toHaveBeenCalledOnce();
    await expectNoA11yViolations(container);

    await user.type(screen.getByLabelText('Correo electrónico'), 'ana@example.test');
    await user.type(screen.getByLabelText('Contraseña'), 'Clave123!');
    await user.click(screen.getByRole('button', { name: 'Iniciar sesión' }));

    expect(
      await screen.findByRole('heading', { name: '¡Bienvenido, Ana López!' }),
    ).toBeInTheDocument();
    expect(authenticate).toHaveBeenCalledWith({
      email: 'ana@example.test',
      password: 'Clave123!',
    });

    await user.click(screen.getByRole('button', { name: 'Cerrar sesión' }));
    await user.type(screen.getByLabelText('Correo electrónico'), ' ANA@EXAMPLE.TEST ');
    await user.type(screen.getByLabelText('Contraseña'), 'clave123!');
    await user.click(screen.getByRole('button', { name: 'Iniciar sesión' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(MESSAGES.INVALID_CREDENTIALS);
    expect(
      screen.queryByRole('heading', { name: /Bienvenido, Ana López/ }),
    ).not.toBeInTheDocument();
  });

  it('T037: rechaza duplicados y mantiene la vista de registro sin confirmación', async () => {
    const user = userEvent.setup();
    const { register } = renderApp();

    await user.click(screen.getByRole('button', { name: 'Regístrate' }));
    await user.type(screen.getByLabelText('Nombre completo'), 'Otra persona');
    await user.type(screen.getByLabelText('Correo electrónico'), TEST_ACCOUNT.email.toUpperCase());
    await user.type(screen.getByLabelText('Contraseña'), 'Clave123!');
    await user.type(screen.getByLabelText('Confirmar contraseña'), 'Clave123!');
    await user.click(screen.getByRole('checkbox', { name: 'Acepto los términos y condiciones' }));
    await user.click(screen.getByRole('button', { name: 'Crear cuenta' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(MESSAGES.EMAIL_ALREADY_REGISTERED);
    expect(screen.getByRole('heading', { name: 'Crea tu cuenta' })).toBeInTheDocument();
    expect(screen.queryByText(MESSAGES.REGISTRATION_SUCCESS)).not.toBeInTheDocument();
    expect(register).toHaveBeenCalledOnce();

    await user.click(screen.getByRole('button', { name: 'Inicia sesión' }));
    await user.type(screen.getByLabelText('Correo electrónico'), TEST_ACCOUNT.email);
    await user.type(screen.getByLabelText('Contraseña'), TEST_ACCOUNT.password);
    await user.click(screen.getByRole('button', { name: 'Iniciar sesión' }));
    expect(
      await screen.findByRole('heading', { name: '¡Bienvenido, Steven Luna!' }),
    ).toBeInTheDocument();
  });

  it('T037: gateway no disponible comunica un fallo accionable y no cambia de vista', async () => {
    const user = userEvent.setup();
    const { register } = renderApp(null);

    await user.click(screen.getByRole('button', { name: 'Regístrate' }));
    await user.type(screen.getByLabelText('Nombre completo'), 'Ana López');
    await user.type(screen.getByLabelText('Correo electrónico'), 'ana@example.test');
    await user.type(screen.getByLabelText('Contraseña'), 'Clave123!');
    await user.type(screen.getByLabelText('Confirmar contraseña'), 'Clave123!');
    await user.click(screen.getByRole('checkbox', { name: 'Acepto los términos y condiciones' }));
    await user.click(screen.getByRole('button', { name: 'Crear cuenta' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(MESSAGES.REGISTRATION_UNAVAILABLE);
    expect(screen.getByRole('heading', { name: 'Crea tu cuenta' })).toBeInTheDocument();
    expect(screen.queryByText(MESSAGES.REGISTRATION_SUCCESS)).not.toBeInTheDocument();
    expect(register).toHaveBeenCalledOnce();
  });

  it('T044: Registro, errores de validación, avisos y confirmación son accesibles', async () => {
    const user = userEvent.setup();
    const { container } = renderApp();

    await user.click(screen.getByRole('button', { name: 'Regístrate' }));
    expect(screen.getByLabelText('Nombre completo')).toBeInTheDocument();
    expect(screen.getByLabelText('Correo electrónico')).toBeInTheDocument();
    expect(screen.getByLabelText('Contraseña')).toHaveAttribute('type', 'password');
    expect(screen.getByLabelText('Confirmar contraseña')).toHaveAttribute('type', 'password');
    await expectNoA11yViolations(container);

    await user.click(screen.getByRole('button', { name: 'Crear cuenta' }));
    const email = screen.getByLabelText('Correo electrónico');
    const emailError = email.getAttribute('aria-describedby');
    if (emailError === null) {
      throw new Error('The email input should reference its validation message.');
    }
    expect(document.getElementById(emailError)).toHaveTextContent(MESSAGES.EMAIL_REQUIRED);
    await expectNoA11yViolations(container);

    await user.click(screen.getByRole('button', { name: 'Google' }));
    expect(screen.getByRole('status')).toHaveTextContent(MESSAGES.GOOGLE_REGISTRATION_UNAVAILABLE);
    await expectNoA11yViolations(container);

    await user.click(screen.getByRole('button', { name: 'Apple' }));
    expect(screen.getByRole('status')).toHaveTextContent(MESSAGES.APPLE_REGISTRATION_UNAVAILABLE);
    await expectNoA11yViolations(container);

    await user.click(screen.getByRole('button', { name: 'términos y condiciones' }));
    expect(screen.getByRole('status')).toHaveTextContent(MESSAGES.TERMS_UNAVAILABLE);
    await expectNoA11yViolations(container);
  });

  it('T046: no expone ni persiste contraseñas durante altas exitosas o fallidas', async () => {
    const user = userEvent.setup();
    const password = 'Clave123!';
    const { container, register } = renderApp();
    const storageWrite = vi.spyOn(Storage.prototype, 'setItem');
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    const initialUrl = window.location.href;

    try {
      await user.click(screen.getByRole('button', { name: 'Regístrate' }));
      await user.type(screen.getByLabelText('Nombre completo'), 'Ana López');
      await user.type(screen.getByLabelText('Correo electrónico'), 'ana@example.test');
      await user.type(screen.getByLabelText('Contraseña'), password);
      await user.type(screen.getByLabelText('Confirmar contraseña'), password);
      await user.click(screen.getByRole('checkbox', { name: 'Acepto los términos y condiciones' }));
      await user.click(screen.getByRole('button', { name: 'Crear cuenta' }));
      await screen.findByText(MESSAGES.REGISTRATION_SUCCESS);

      expect(document.body.textContent).not.toContain(password);
      expect(window.location.href).not.toContain(password);
      expect(storageWrite).not.toHaveBeenCalled();
      expect(log).not.toHaveBeenCalled();
      expect(warn).not.toHaveBeenCalled();
      expect(error).not.toHaveBeenCalled();

      await user.click(screen.getByRole('button', { name: 'Regístrate' }));
      await user.type(screen.getByLabelText('Nombre completo'), 'Ana duplicada');
      await user.type(screen.getByLabelText('Correo electrónico'), ' ANA@EXAMPLE.TEST ');
      await user.type(screen.getByLabelText('Contraseña'), password);
      await user.type(screen.getByLabelText('Confirmar contraseña'), password);
      await user.click(screen.getByRole('checkbox', { name: 'Acepto los términos y condiciones' }));
      await user.click(screen.getByRole('button', { name: 'Crear cuenta' }));
      await screen.findByText(MESSAGES.EMAIL_ALREADY_REGISTERED);

      expect(document.body.textContent).not.toContain(password);
      expect(window.location.href).toBe(initialUrl);
      expect(storageWrite).not.toHaveBeenCalled();
      expect(log).not.toHaveBeenCalled();
      expect(warn).not.toHaveBeenCalled();
      expect(error).not.toHaveBeenCalled();
      expect(register).toHaveBeenCalledTimes(2);
      await expectNoA11yViolations(container);
    } finally {
      storageWrite.mockRestore();
      log.mockRestore();
      warn.mockRestore();
      error.mockRestore();
    }
  });
});
