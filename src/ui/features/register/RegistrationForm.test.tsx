import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MESSAGES } from '@/domain/messages';
import type { Register } from '@/application/register';
import { RegistrationForm } from './RegistrationForm';

function makeRegister(): ReturnType<typeof vi.fn<Register>> {
  return vi.fn<Register>().mockResolvedValue({ kind: 'success' });
}

describe('RegistrationForm', () => {
  it('T024: muestra los campos y controles en el orden de Figma', () => {
    const register = makeRegister();
    render(<RegistrationForm register={register} onSuccess={vi.fn()} onLogin={vi.fn()} />);

    expect(screen.getByRole('heading', { name: 'Crea tu cuenta' })).toBeInTheDocument();
    expect(screen.getByLabelText('Nombre completo')).toBeRequired();
    expect(screen.getByLabelText('Correo electrónico')).toBeRequired();
    expect(screen.getByLabelText('Contraseña')).toBeRequired();
    expect(screen.getByLabelText('Confirmar contraseña')).toBeRequired();
    expect(
      screen.getByRole('checkbox', { name: 'Acepto los términos y condiciones' }),
    ).toBeRequired();
    expect(screen.getByRole('button', { name: 'términos y condiciones' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Crear cuenta' })).toHaveAttribute('type', 'submit');
    expect(screen.getByText('o regístrate con')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Google' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Apple' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Inicia sesión' })).toBeInTheDocument();

    const formText =
      screen.getByRole('heading', { name: 'Crea tu cuenta' }).closest('form')?.textContent ?? '';
    const orderedContent = [
      formText.indexOf('Crea tu cuenta'),
      formText.indexOf('Nombre completo'),
      formText.indexOf('Correo electrónico'),
      formText.indexOf('Contraseña'),
      formText.indexOf('Confirmar contraseña'),
      formText.indexOf('Acepto los'),
      formText.indexOf('términos y condiciones'),
      formText.indexOf('Crear cuenta'),
      formText.indexOf('o regístrate con'),
      formText.indexOf('Google'),
      formText.indexOf('Apple'),
      formText.indexOf('Inicia sesión'),
    ];
    expect(orderedContent).toEqual([...orderedContent].sort((a, b) => a - b));

    const controls = screen
      .getAllByRole('textbox')
      .map((control) => control.getAttribute('aria-label') ?? control.getAttribute('name'));
    expect(controls).toEqual(['fullName', 'email']);
    expect(register).not.toHaveBeenCalled();
  });

  it('T026: valida el envío vacío, enfoca el primer campo y limpia errores campo por campo', async () => {
    const user = userEvent.setup();
    const register = makeRegister();
    render(<RegistrationForm register={register} onSuccess={vi.fn()} onLogin={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: 'Crear cuenta' }));

    const fullName = screen.getByLabelText('Nombre completo');
    expect(fullName).toHaveFocus();
    expect(screen.getByText(MESSAGES.FULL_NAME_REQUIRED)).toBeInTheDocument();
    expect(screen.getByText(MESSAGES.EMAIL_REQUIRED)).toBeInTheDocument();
    expect(screen.getByText(MESSAGES.PASSWORD_REQUIRED)).toBeInTheDocument();
    expect(screen.getByText(MESSAGES.CONFIRM_PASSWORD_REQUIRED)).toBeInTheDocument();
    expect(screen.getByText(MESSAGES.TERMS_REQUIRED)).toBeInTheDocument();
    expect(register).not.toHaveBeenCalled();

    await user.type(fullName, 'Diego Martínez');
    expect(screen.queryByText(MESSAGES.FULL_NAME_REQUIRED)).not.toBeInTheDocument();
    expect(screen.getByText(MESSAGES.EMAIL_REQUIRED)).toBeInTheDocument();
  });

  it('T027: mantiene toggles independientes y conservan los valores', async () => {
    const user = userEvent.setup();
    render(<RegistrationForm register={makeRegister()} onSuccess={vi.fn()} onLogin={vi.fn()} />);

    const password = screen.getByLabelText('Contraseña') as HTMLInputElement;
    const confirmation = screen.getByLabelText('Confirmar contraseña') as HTMLInputElement;
    expect(password.type).toBe('password');
    expect(confirmation.type).toBe('password');
    await user.type(password, 'S3creto!');
    await user.type(confirmation, 'S3creto!');

    const toggles = screen.getAllByRole('button', { name: 'Mostrar contraseña' });
    expect(toggles).toHaveLength(2);
    const firstToggle = toggles.at(0);
    if (!firstToggle) throw new Error('Expected the password visibility toggle');
    await user.click(firstToggle);

    expect(password).toHaveAttribute('type', 'text');
    expect(confirmation).toHaveAttribute('type', 'password');
    expect(password).toHaveValue('S3creto!');
    expect(confirmation).toHaveValue('S3creto!');
    expect(screen.getByRole('button', { name: 'Ocultar contraseña' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('T028: placeholders informan sin enviar ni limpiar valores', async () => {
    const user = userEvent.setup();
    const register = makeRegister();
    render(<RegistrationForm register={register} onSuccess={vi.fn()} onLogin={vi.fn()} />);

    const name = screen.getByLabelText('Nombre completo');
    await user.type(name, 'Diego');
    await user.click(screen.getByRole('button', { name: 'Google' }));
    expect(screen.getByRole('status')).toHaveTextContent(MESSAGES.GOOGLE_REGISTRATION_UNAVAILABLE);
    expect(name).toHaveValue('Diego');

    await user.click(screen.getByRole('button', { name: 'Apple' }));
    expect(screen.getByRole('status')).toHaveTextContent(MESSAGES.APPLE_REGISTRATION_UNAVAILABLE);
    expect(name).toHaveValue('Diego');

    await user.click(screen.getByRole('button', { name: 'términos y condiciones' }));
    expect(screen.getByRole('status')).toHaveTextContent(MESSAGES.TERMS_UNAVAILABLE);
    expect(
      screen.getByRole('checkbox', { name: 'Acepto los términos y condiciones' }),
    ).not.toBeChecked();
    expect(register).not.toHaveBeenCalled();
  });

  it('envía datos válidos una sola vez y comunica el éxito al contenedor', async () => {
    const user = userEvent.setup();
    const register = makeRegister();
    const onSuccess = vi.fn();
    const onLogin = vi.fn();
    render(<RegistrationForm register={register} onSuccess={onSuccess} onLogin={onLogin} />);

    await user.type(screen.getByLabelText('Nombre completo'), 'Diego Martínez');
    await user.type(screen.getByLabelText('Correo electrónico'), 'diego@example.com');
    await user.type(screen.getByLabelText('Contraseña'), 'Clave123!');
    await user.type(screen.getByLabelText('Confirmar contraseña'), 'Clave123!');
    await user.click(screen.getByRole('checkbox', { name: 'Acepto los términos y condiciones' }));
    await user.click(screen.getByRole('button', { name: 'Crear cuenta' }));

    expect(register).toHaveBeenCalledOnce();
    expect(register).toHaveBeenCalledWith({
      fullName: 'Diego Martínez',
      email: 'diego@example.com',
      password: 'Clave123!',
      confirmPassword: 'Clave123!',
      termsAccepted: true,
    });
    expect(onSuccess).toHaveBeenCalledOnce();
    expect(onLogin).not.toHaveBeenCalled();
  });

  it('reporta los errores del caso de uso junto al formulario y no confirma éxito', async () => {
    const user = userEvent.setup();
    const register = vi.fn<Register>().mockResolvedValue({ kind: 'email-already-registered' });
    const onSuccess = vi.fn();
    render(<RegistrationForm register={register} onSuccess={onSuccess} onLogin={vi.fn()} />);

    await user.type(screen.getByLabelText('Nombre completo'), 'Diego Martínez');
    await user.type(screen.getByLabelText('Correo electrónico'), 'diego@example.com');
    await user.type(screen.getByLabelText('Contraseña'), 'Clave123!');
    await user.type(screen.getByLabelText('Confirmar contraseña'), 'Clave123!');
    await user.click(screen.getByRole('checkbox', { name: 'Acepto los términos y condiciones' }));
    await user.click(screen.getByRole('button', { name: 'Crear cuenta' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(MESSAGES.EMAIL_ALREADY_REGISTERED);
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it('mantiene el estado pendiente y evita envíos repetidos', async () => {
    const user = userEvent.setup();
    let finishRegistration: ((result: { kind: 'success' }) => void) | undefined;
    const register = vi.fn<Register>(
      () =>
        new Promise((resolve) => {
          finishRegistration = resolve;
        }),
    );
    render(<RegistrationForm register={register} onSuccess={vi.fn()} onLogin={vi.fn()} />);

    await user.type(screen.getByLabelText('Nombre completo'), 'Diego Martínez');
    await user.type(screen.getByLabelText('Correo electrónico'), 'diego@example.com');
    await user.type(screen.getByLabelText('Contraseña'), 'Clave123!');
    await user.type(screen.getByLabelText('Confirmar contraseña'), 'Clave123!');
    await user.click(screen.getByRole('checkbox', { name: 'Acepto los términos y condiciones' }));
    await user.click(screen.getByRole('button', { name: 'Crear cuenta' }));

    const submit = screen.getByRole('button', { name: 'Creando cuenta…' });
    expect(submit).toBeDisabled();
    expect(submit).toHaveAttribute('aria-busy', 'true');
    await user.click(submit);
    expect(register).toHaveBeenCalledOnce();

    if (!finishRegistration) throw new Error('Expected registration to be pending');
    finishRegistration({ kind: 'success' });
  });

  it('muestra un mensaje seguro y permite reintentar si falla el adaptador', async () => {
    const user = userEvent.setup();
    const register = vi
      .fn<Register>()
      .mockRejectedValueOnce(new Error('internal failure'))
      .mockResolvedValueOnce({ kind: 'success' });
    const onSuccess = vi.fn();
    render(<RegistrationForm register={register} onSuccess={onSuccess} onLogin={vi.fn()} />);

    await user.type(screen.getByLabelText('Nombre completo'), 'Diego Martínez');
    await user.type(screen.getByLabelText('Correo electrónico'), 'diego@example.com');
    await user.type(screen.getByLabelText('Contraseña'), 'Clave123!');
    await user.type(screen.getByLabelText('Confirmar contraseña'), 'Clave123!');
    await user.click(screen.getByRole('checkbox', { name: 'Acepto los términos y condiciones' }));
    await user.click(screen.getByRole('button', { name: 'Crear cuenta' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(MESSAGES.REGISTRATION_UNAVAILABLE);
    expect(screen.queryByText('internal failure')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Crear cuenta' }));
    expect(register).toHaveBeenCalledTimes(2);
    expect(onSuccess).toHaveBeenCalledOnce();
  });
});
