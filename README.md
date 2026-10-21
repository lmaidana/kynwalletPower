# KynWallet · Acceso y registro (demo)

Demostración funcional, solo del lado del cliente, de las pantallas de acceso y registro de la
billetera virtual KynWallet. El inicio de sesión reproduce el diseño de Figma
([01 · Login](https://www.figma.com/design/f7uDsv8sh6ZOtK2OitTqtg/Billetera-Virtual---Prototipos?node-id=2-2)),
y el registro el frame
([04 · Registro](https://www.figma.com/design/64wSz2kYuIR1KrXD9NMRts/Billetera-Virtual---Prototipos--Copy-?node-id=31-2)).
Ambos validan sus campos y usan cuentas ficticias, sin backend ni base de datos.

Especificaciones, plan y tareas: [`specs/`](specs/).

## Registro de demostración

- Desde Login, selecciona **Regístrate** para abrir el formulario; **Inicia sesión** vuelve al
  formulario de acceso sin recargar la aplicación.
- Completa el nombre, el correo, la contraseña y su confirmación, y acepta los términos. La
  contraseña requiere entre 8 y 128 caracteres, una mayúscula, un número y un carácter especial.
- Al crear la cuenta, se añade a la misma colección en memoria que consulta Login. El mensaje de
  confirmación aparece en Login y puedes autenticarte con el correo (sin distinguir mayúsculas ni
  espacios periféricos) y la contraseña exacta.
- Las nuevas cuentas existen solo durante la vida de la aplicación en esa pestaña. Se pierden al
  recargar o cerrar la aplicación y no se escriben en `localStorage`, `sessionStorage` ni cookies.
- Las cuentas iniciales de demostración siguen configurándose mediante `VITE_DEMO_USERS`, tal
  como se describe en Configuración; el registro no las modifica.
- Google y Apple, así como el enlace de términos, son marcadores visuales y muestran avisos. No
  hay autenticación social real ni destino legal.
- Esta aplicación es exclusivamente una demostración de frontend. No introduzcas datos
  personales ni contraseñas reales; la colección en memoria no es un sistema de cuentas seguro
  ni una alternativa a un backend de autenticación.

## Requisitos

- Node.js 20 LTS o superior y npm 10 o superior.

## Configuración

```bash
npm install
cp .env.example .env.local
```

Edita `.env.local` y define al menos una cuenta **ficticia** en `VITE_DEMO_USERS`:

```dotenv
VITE_DEMO_USERS=[{"email":"tu.correo@example.com","password":"minimo-8-caracteres","displayName":"Tu Nombre"}]
```

- `password`: de 8 a 128 caracteres. `displayName`: de 1 a 80 caracteres. Los correos no se pueden repetir.
- `.env.local` no se versiona: la Constitución del proyecto (regla 5.3) prohíbe credenciales en el
  código fuente o en archivos versionados.
- ⚠️ Al ser una aplicación solo-cliente, el valor de `VITE_DEMO_USERS` queda incluido en el bundle
  compilado. Usa únicamente cuentas ficticias.
- Si la variable falta o es inválida, la pantalla muestra "Servicio de acceso no disponible".

## Scripts

| Comando                           | Descripción                                                                                                                                           |
| --------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run dev`                     | Servidor de desarrollo en <http://localhost:5173>                                                                                                     |
| `npm run build`                   | Typecheck y build de producción en `dist/`                                                                                                            |
| `npm run preview`                 | Sirve el build de producción                                                                                                                          |
| `npm test`                        | Ejecuta las pruebas una vez                                                                                                                           |
| `npm run test:watch`              | Pruebas en modo observación                                                                                                                           |
| `npm run test:coverage`           | Pruebas con cobertura (umbral: 80 %)                                                                                                                  |
| `npm run lint` / `npm run format` | ESLint / Prettier                                                                                                                                     |
| `npm run verify`                  | Todos los controles de cumplimiento: lint, formato, tipos, pruebas con cobertura, build, auditoría de dependencias y licencias, y escaneo de secretos |

## Arquitectura

Clean Architecture ligera. Las dependencias apuntan hacia el dominio y ESLint lo verifica:

```text
src/
├── domain/          # Tipos, reglas de validación y textos. Sin React.
├── application/     # Caso de uso `authenticate` y puerto `AuthGateway`
├── infrastructure/  # `InMemoryAuthGateway` (simulación, 1 s) y `loadDemoAccounts`
├── ui/
│   ├── styles/      # Tokens de Figma (`tokens.css`) y estilos globales
│   ├── components/  # Button, TextField, PasswordField, Checkbox, SocialButton, Divider, Alert
│   ├── layout/      # BrandPanel
│   ├── features/login/  # LoginScreen, LoginForm, WelcomeView, reducer y hook
│   └── features/register/ # RegistrationScreen, RegistrationForm, reducer y hook
├── App.tsx
└── main.tsx         # Raíz de composición (inyección de dependencias)
```

Las pruebas viven junto al código (`*.test.ts(x)`). Cada caso se nombra con el escenario o
requisito que verifica (por ejemplo, `US2-1`, `FR-012`) para mantener la trazabilidad.

## Notas de diseño

- **Contraste (pendiente de aprobación de diseño):** varios colores de Figma no alcanzan
  WCAG 2.1 AA (botón 2.83:1, enlaces 3.56:1, textos secundarios 3.28:1, bordes 1.40:1). Se
  usan variantes más oscuras del mismo tono (`--brand-700`, `--neutral-600`, `--neutral-border`
  en `src/ui/styles/tokens.css`). Detalle en `specs/001-login-billetera/research.md` (R3).
- Los iconos de Google, Apple y del control de visibilidad son los marcadores de posición del
  diseño de Figma.
- Fuera de alcance: recuperar contraseña, acceso con Google/Apple, persistencia de "Recordarme"
  y bloqueo por intentos fallidos. Al activarlos se muestra un aviso.
