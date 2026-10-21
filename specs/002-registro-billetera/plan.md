# Implementation Plan: Pantalla de Registro de KynWallet

**Branch**: `002-registro-billetera` | **Date**: 2026-10-20 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/002-registro-billetera/spec.md`

## Summary

Agregar una pantalla de registro a la SPA existente de KynWallet y conectarla al flujo de login.
La pantalla se basará en el frame `04 · Registro` de Figma (nodo `31:2`) y reutilizará el
layout, campos, botones, casillas, alertas, divisor, botones sociales, estilos y tokens de la
funcionalidad Login.

El registro validará nombre, correo, contraseña, confirmación y términos en dominio/aplicación.
El mismo `InMemoryAuthGateway` que autentica el login será responsable de comprobar unicidad y
añadir usuarios a su colección en memoria. La raíz de composición inyectará los casos de uso a
la UI; `App` cambiará entre login y registro mediante estado local de navegación, sin incorporar
un router ni persistencia. Un registro exitoso llevará al login y mostrará allí una confirmación.

La implementación seguirá React + TypeScript + Vite, la Clean Architecture ligera del proyecto,
y el ciclo TDD con Vitest y Testing Library. No se requieren dependencias nuevas.

## Technical Context

**Language/Version**: TypeScript 5.x (`strict`), Node.js ≥ 20 LTS para herramientas

**Primary Dependencies**: React 19, Vite 8, `@fontsource-variable/inter` (sin dependencias nuevas)

**Storage**: Colección mutable en memoria perteneciente a una única instancia de
`InMemoryAuthGateway`; se inicializa con las cuentas ficticias de `VITE_DEMO_USERS` y se pierde
al recargar o cerrar la aplicación

**Testing**: Vitest 5, React Testing Library, `@testing-library/user-event`, jsdom,
`axe-core` (helper propio en `src/test/a11y.ts`), `@vitest/coverage-v8`

**Target Platform**: Navegadores modernos (las dos últimas versiones de Chrome, Firefox, Safari
y Edge), desde 320 px hasta escritorio

**Project Type**: Aplicación web de página única (SPA), solo frontend

**Performance Goals**: validación local en menos de 1 s, sin espera artificial de red; la
transición a login ocurre inmediatamente después de confirmar el alta

**Constraints**: Sin backend, base de datos, servicios externos ni almacenamiento persistente;
WCAG 2.1 AA; sin contraseñas en logs, URL ni Web Storage; sin scroll horizontal desde 320 px

**Scale/Scope**: Una pantalla nueva integrada en el flujo de autenticación existente; no incluye
integración social real, destinos legales ni funciones de billetera

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after design.*

| Principio / Regla | Cumplimiento en el diseño | Estado |
|---|---|---|
| I. TDD | Cada cambio de regla, caso de uso, adaptador, navegación y UI comenzará con pruebas automatizadas fallidas; los casos se mapearán a AC/FR | ✅ |
| II. SOLID | Validación en dominio, orquestación en aplicación, colección en el adaptador y presentación en UI; contratos inyectados desde `main.tsx` | ✅ |
| III. Clean Architecture | Se mantienen las capas existentes; `domain/` no depende de React, aplicación ni infraestructura; no se crea una arquitectura paralela | ✅ |
| IV. DRY/KISS/YAGNI | Se reutilizan `AuthGateway`, `InMemoryAuthGateway`, componentes y tokens; una única colección, sin router, librería de formularios o estado global | ✅ |
| V. Seguridad | Datos solo ficticios; contraseñas nunca se registran ni persisten; el usuario se informa que la demo no es un servicio de producción | ✅ con limitación propia de demo |
| VI. BRD/ARD | No se identificaron BRD ni ARD para la feature (supuesto de la spec) | ✅ N/A |
| 7. Dependencias | No se añaden paquetes; se mantienen los análisis de dependencias y licencias existentes | ✅ |
| 8.1 Pruebas | Unitarias de reglas y aplicación, pruebas del adaptador e integración UI; cobertura nueva y global ≥ 80 % | ✅ |
| 8.2 Convenciones | React + TypeScript, CSS Modules; ESLint, Prettier y `tsc --noEmit` | ✅ |
| 8.3 Documentación | Se actualizarán los contratos y documentación de feature afectados junto con la implementación | ✅ |
| 8.4 Accesibilidad AA | Etiquetas, errores asociados/anunciados, foco visible, teclado y validación automatizada con axe | ✅ |
| 8.5 Reutilización | Se reutilizan componentes compartidos y el patrón de estado del formulario Login | ✅ |
| 8.6 Sistema de diseño | Se reutilizan tokens; se conserva contraste AA en colores funcionales derivados aprobables del Login | ✅ con revisión visual |
| 9.2 Trazabilidad | Pruebas nombradas por AC/FR; requisitos relacionados con el placeholder de Login se alinean antes de implementación | ⚠️ requiere resolver la compatibilidad indicada en Riesgos |
| 9.3/9.4 Revisión y controles | Se deben ejecutar los controles existentes de `npm run verify` y revisión requerida por el proceso | ⚠️ el directorio del proyecto aún no es repositorio git |

**Resultado del gate**: APROBADO para planificación, condicionado a resolver la compatibilidad
del enlace de registro descrita en Riesgos y a mantener la limitación de demostración. No se
propone cambiar la arquitectura ni incorporar dependencias.

**Re-check post-diseño**: la integración usa el puerto/adaptador existentes y la raíz de
composición; no se introducen nuevas capas ni persistencia. Confirmar trazabilidad, contraste y
pruebas de integración después de diseñar los contratos.

## Architecture Proposal

Se conserva la arquitectura actual:

```text
src/
├── domain/          # Reglas, tipos y mensajes puros
├── application/     # Casos de uso e interfaces de puerto
├── infrastructure/  # Gateway en memoria y carga de cuentas ficticias
├── ui/              # Pantallas, formularios, componentes y estilos
├── App.tsx          # Estado de navegación Login/Registro
└── main.tsx         # Única raíz de composición e inyección
```

No se crea una segunda fuente de usuarios ni un repositorio paralelo. `main.tsx` construye una
instancia de `InMemoryAuthGateway` desde las cuentas de demostración y obtiene de ella los casos
de uso `authenticate` y `register`. `App` recibe ambos y alterna entre las vistas mediante estado
React local. El adaptador mantiene el conjunto mutable en la memoria de esa instancia: la
operación de registro comprueba unicidad y agrega el usuario antes de devolver éxito; la
autenticación consulta inmediatamente la misma colección.

La navegación no cambia `window.location`, porque una recarga terminaría la sesión de memoria.
El enlace de registro al login y la navegación de vuelta se resuelven dentro de `App`; tras un
registro exitoso, el aviso de confirmación se pasa a la vista de Login y se muestra allí.

## Componentes a Reutilizar

| Componente/patrón existente | Uso previsto |
|---|---|
| `LoginScreen` y `BrandPanel` | Reutilizar la estructura de dos paneles. Permitir el copy del panel `04 · Registro` mediante props/configuración de contenido sin duplicar el layout ni alterar el copy de Login. |
| `TextField` | Nombre completo y correo; conservar etiquetas, `aria-invalid`, asociación de errores y soporte de refs. |
| `PasswordField` | Contraseña y confirmación con estados de visibilidad independientes, labels y mensajes asociados. |
| `Checkbox` | Casilla obligatoria de aceptación de términos; se puede extender de forma compatible si requiere slot/link dentro de su etiqueta. |
| `Button` | Acción "Crear cuenta", estados `loading`/disabled y enlaces de acción siguiendo sus variantes existentes. |
| `Alert` | Errores de negocio, avisos de proveedores/términos y confirmación de cuenta creada. |
| `Divider` | Texto "o regístrate con". |
| `SocialButton` | Google y Apple sin integración; reutilizar `onClick` para avisos informativos. |
| Tokens y CSS Modules | Colores accesibles, tipografía Inter, dimensiones, radios y estilos responsivos existentes. |
| `BrandPanel` SVG/assets | Reusar los assets locales existentes; añadir un asset de registro solo si el diseño lo requiere y no existe un recurso equivalente local. |
| Patrón `loginReducer` / `useLoginForm` | Mantener validación visible al blur/submit, reducción explícita de estado, bloqueo de envíos y foco en primer error; no compartir reducer si sus estados son distintos. |
| `expectNoA11yViolations`, fixtures y stubs | Reutilizar helpers de a11y y convenciones de pruebas existentes; añadir fixtures de registro sin secretos reales. |

## Nuevos Componentes Necesarios

Solo se añaden componentes específicos de la feature cuando la reutilización directa no cubra
sus responsabilidades:

- `RegistrationScreen`: compone el shell existente, título, `RegistrationForm`, controles
  sociales y enlace "Inicia sesión".
- `RegistrationForm`: presenta y conecta los campos, aceptación de términos, errores y acción
  principal; no contiene reglas de negocio.
- `registrationReducer` y `useRegistrationForm`: estado local del formulario, eventos, loading,
  validación al blur/submit, avisos y control de foco. Mantener el estado de visibilidad de cada
  contraseña dentro de sus componentes `PasswordField`.

No se planifica un router, contexto global, store, servicio de red, nueva librería UI ni
componente social adicional. Si `LoginScreen` no puede expresar ambas variantes sin
condicionales de feature, se extraerá únicamente el shell compartido a un componente pequeño
dentro de `ui/layout`; esta decisión se toma en Phase 0/1 para evitar duplicar paneles.

## Cambios por Capa

### Domain

- Extender `src/domain/auth.ts` con tipos del intento de registro, campos de validación y
  resultado discriminado del alta. Reutilizar `DemoAccount` (`email`, `password`,
  `displayName`) como representación de cuenta en lugar de crear un modelo de usuario duplicado;
  mapear el nombre completo normalizado a `displayName`.
- Añadir las reglas puras de registro en `src/domain/validation.ts` o en un módulo hermano si
  mantener separados los contratos de login y registro mejora la cohesión:
  nombre obligatorio/máximo 80, email obligatorio/formato/máximo 254, contraseña 8–128 más
  mayúscula/número/símbolo, confirmación exacta y términos aceptados.
- Reutilizar `normalizeEmail` para recortar y convertir el correo a minúsculas. No normalizar ni
  recortar la contraseña. Recortar solo extremos del nombre y conservar sus espacios interiores.
- Añadir en `src/domain/messages.ts` los textos canónicos de validación, duplicidad, avisos y
  confirmación, evitando cadenas inconsistentes en componentes.
- Los criterios de Unicode para mayúscula, número y carácter especial deben definirse
  explícitamente en pruebas unitarias; espacios Unicode no satisfacen la regla de carácter
  especial.

### Application

- Ampliar el puerto `src/application/ports/AuthGateway.ts` con una operación de registro y sus
  tipos de entrada/resultado; mantener la operación `authenticate` existente y su contrato.
- Crear un caso de uso de registro (p. ej. `src/application/register.ts`) que valide datos de
  negocio, normalice nombre/correo según la especificación, cree el DTO de cuenta y delegue
  atomicidad/unicidad al puerto.
- Mantener `createAuthenticate` y `Authenticate` compatibles; los errores inesperados del
  registro se convierten en un resultado explícito no exitoso, sin incluir datos sensibles ni
  reportar éxito aparente.
- El alta debe devolver resultado explícito (`success`, `email-already-registered`,
  `unavailable` o equivalente acordado en contrato); la UI convierte variantes a mensajes de
  dominio, no inspecciona excepciones técnicas.

### Infrastructure

- Modificar `src/infrastructure/InMemoryAuthGateway.ts` para conservar una colección mutable
  privada inicializada desde las cuentas cargadas y compartirla entre `register` y
  `authenticate`.
- Comprobar el correo normalizado contra la colección inicial y todos los usuarios registrados
  durante la sesión; si existe, devolver duplicado sin modificar la lista.
- Añadir la cuenta una sola vez antes de devolver éxito. La adición y comprobación ocurren
  dentro de la misma operación síncrona previa a resolver la promesa para impedir duplicados por
  envíos repetidos.
- Preservar la lógica de login: email sin distinguir mayúsculas ni espacios periféricos;
  contraseña exacta. La configuración `VITE_DEMO_USERS` sigue siendo solo el conjunto inicial,
  no el lugar de escritura de usuarios nuevos.
- No añadir localStorage, sessionStorage, cookies, API, archivo de configuración escribible ni
  base de datos. Una recarga crea una instancia nueva y elimina las cuentas creadas en runtime.
- Considerar explícitamente el estado de configuración inicial inválida (`null`): mantener el
  resultado de login existente y definir un resultado de registro no exitoso que no mutile la
  colección inexistente.

### UI

- Añadir la vista/formulario de registro bajo `src/ui/features/register/`, siguiendo el patrón y
  convenciones de `src/ui/features/login/`: TSX, CSS Modules, hook/reducer cuando el flujo lo
  requiera y pruebas junto al código.
- Actualizar `src/App.tsx` para recibir `authenticate` y el caso de uso `register`, y manejar el
  modo Login/Registro y el aviso de éxito sin instalar router ni alterar el estado interno del
  login.
- Actualizar `src/main.tsx` como única raíz de composición: crear un solo gateway y derivar
  ambos casos de uso de esa instancia.
- Extender de forma compatible la configuración del panel de marca para mostrar "Comienza tu
  camino financiero." y el texto de apoyo de Figma en la vista de registro, manteniendo intactos
  el copy y comportamiento visual del Login.
- Añadir los avisos "disponible próximamente" para Google/Apple y el aviso de disponibilidad de
  términos; los controles no navegan, no envían el formulario ni borran valores.
- En éxito, cambiar la vista a Login y mostrar "Cuenta creada correctamente. Ahora puedes iniciar
  sesión."; mover el foco al aviso o encabezado como especifica AC-013.
- Revisar el acceso actual "Regístrate" del Login: la spec de Login define todos sus controles
  fuera de alcance como placeholders, mientras que esta feature requiere una pantalla de
  registro accesible. La modificación de ese enlace debe limitarse a navegar a Registro y
  quedar trazada como cambio de compatibilidad autorizado; no activar otros placeholders.
- Adaptar el CSS al frame Figma y a viewports de 320 px o más, con scroll vertical permitido y
  sin scroll horizontal. Mantener los tokens derivados que cumplen contraste AA.

## Modelo de Datos

| Entidad/DTO | Campos | Reglas y ciclo de vida |
|---|---|---|
| `DemoAccount` (existente) | `email`, `password`, `displayName` | Fuente compartida de autenticación. Email normalizado, único; password exacta y transitoria; displayName corresponde al nombre recortado. |
| `RegistrationInput` (nuevo) | `fullName`, `email`, `password`, `confirmPassword`, `termsAccepted` | Datos del formulario; no se persiste ni se registra. Confirmación y aceptación no se incluyen en la cuenta final. |
| `RegistrationResult` (nuevo) | variante `success`, `email-already-registered` o `unavailable` | Unión discriminada; éxito no retorna contraseña. |
| Colección de cuentas (adaptador existente) | Lista privada mutable de `DemoAccount` | Incluye cuentas ficticias iniciales y registros en sesión. Se destruye con la instancia al recargar/cerrar; nunca se serializa. |
| `RegistrationFormState` (UI) | status, valores, touched, errores, aceptación, aviso | Estado efímero de UI; no guarda copias después de salir de la vista ni se persiste. |

**Invariante de integración**: el gateway que recibe `register(account)` debe ser exactamente la
instancia consultada por `authenticate(credentials)`. Una instancia distinta o una colección
duplicada incumple AC-010/AC-012.

## Estrategia de Validación

- Validación pura en `domain`, con prioridad predecible: nombre, correo (obligatorio, formato,
  longitud, duplicado cuando corresponda), contraseña (obligatorio, longitud, reglas de
  complejidad), confirmación y términos.
- En blur se muestra error del campo visitado; en submit se evalúan todos los campos, se marcan
  como visitados y se enfoca el primer inválido en orden nombre, correo, contraseña,
  confirmación y términos.
- Los cambios de valores revalidan y eliminan únicamente errores corregidos, conservando errores
  independientes.
- Email: trim, normalización lowercase, validación de formato y longitud ≤ 254; la misma función
  se reutiliza para búsqueda de duplicados y autenticación.
- Nombre: trim solo periférico; valor vacío después del trim inválido; longitud máxima 80.
- Password: 8–128 caracteres sin trim; al menos una mayúscula Unicode, un número decimal y un
  carácter de puntuación/símbolo Unicode que no sea espacio en blanco.
- Confirmación: obligatoria y comparación literal con la contraseña original.
- Duplicidad: autoridad en el adaptador, no solo en la validación UI, para garantizar unicidad
  en el punto de escritura. La UI puede mostrar una comprobación temprana si no duplica la regla
  de persistencia.
- Errores accesibles mediante `aria-invalid`, `aria-describedby` y `role=alert`/`status` de
  `TextField` y `Alert`; foco programático solo después de submit inválido.

## Estrategia de Navegación

- Sin dependencia de routing. `App` mantiene un estado finito de vista (`login` o `register`) y
  callbacks explícitos hacia las pantallas.
- "Regístrate" en Login abre la vista Registro una vez que se autorice la excepción de
  compatibilidad señalada en Riesgos; "Inicia sesión" en Registro vuelve a la vista Login sin
  invocar el caso de uso de registro.
- El submit exitoso agrega el usuario primero, y solo con resultado `success` cambia a Login.
  `App` mantiene el aviso de éxito durante esa transición y lo descarta al iniciar un nuevo
  flujo o cuando deje de ser aplicable.
- Ninguna transición navega a URL ni recarga el documento; así se mantiene viva la colección
  durante la sesión activa.
- Los avisos de Google, Apple y términos usan acciones locales que no cambian vista ni valores.

## Estrategia de Persistencia en Memoria

- La única colección es privada al `InMemoryAuthGateway`; se crea una vez en `main.tsx` a partir
  de `loadDemoAccounts(import.meta.env.VITE_DEMO_USERS)`.
- El adaptador ofrece lectura implícita vía `authenticate` y escritura controlada mediante el
  método del puerto `register`; la UI no modifica directamente la colección.
- La mutación acepta una cuenta solo si el correo normalizado aún no existe; el usuario se
  incorpora a la lista compartida y queda disponible inmediatamente para login.
- Las cuentas registradas viven hasta la destrucción de la instancia de la SPA (recarga, cierre
  de pestaña o cierre de aplicación). No sobreviven a otro tab, ventana, recarga o sesión.
- En caso de configuración inicial ausente/inválida se devuelve error de disponibilidad explícito;
  no se crea una colección de éxito vacía ni se muestra una confirmación engañosa.
- Los valores sensibles de password existen solo en el estado activo del formulario y de la
  cuenta en memoria requerida por el login de demostración; no se incluyen en resultados,
  avisos, logs, URL, almacenamiento persistente ni herramientas de diagnóstico.

## Dependencias Afectadas

| Dependencia/archivo | Tipo de cambio | Motivo |
|---|---|---|
| `src/domain/auth.ts`, `validation.ts`, `messages.ts` | Ampliar | Tipos, reglas y mensajes de registro reutilizables por la UI. |
| `src/application/ports/AuthGateway.ts` | Ampliar contrato existente | Añadir la operación de alta sin sustituir autenticación. |
| `src/application/register.ts` | Nuevo | Caso de uso de registro validado e inyectable. |
| `src/infrastructure/InMemoryAuthGateway.ts` | Modificar | Unicidad, escritura en memoria y lectura posterior por login. |
| `src/main.tsx` | Modificar | Compartir una instancia gateway entre `authenticate` y `register`. |
| `src/App.tsx` | Modificar | Navegación local Login/Registro y confirmación post-alta. |
| `src/ui/features/register/` | Nuevo | Pantalla, formulario, hook/reducer y CSS Modules del registro. |
| `src/ui/features/login/` | Modificación acotada | Enlace "Regístrate" y visualización del aviso de alta si se aprueba la alineación de spec. |
| `src/ui/layout/BrandPanel/`, `src/ui/features/login/LoginScreen` | Modificación compatible | Permitir copy del panel de Registro compartiendo el layout; preservar Login. |
| `src/ui/components/` | Reutilización; posible ampliación menor | Usar controles actuales; extender Checkbox/Alert solo si el contrato lo requiere. |
| `specs/001-login-billetera/spec.md`, `contracts/ui-login.md` | Alinear antes de implementación | Actualizar el comportamiento del enlace "Regístrate" si se decide que abra Registro. |
| `specs/002-registro-billetera/` | Documentación de feature | Especificación y este plan; `tasks.md` se generará en fase posterior, no como parte de este plan. |
| `package.json`, `package-lock.json` | Sin cambios previstos | Las herramientas y bibliotecas necesarias ya existen. |

## Risks and Mitigations

| Riesgo | Impacto | Mitigación / decisión requerida |
|---|---|---|
| La spec de Login indica que "Regístrate" es placeholder, pero Registro necesita una ruta de entrada | El formulario nuevo podría no ser alcanzable desde la app; modificarlo directamente contradice el contrato anterior | Antes de implementación, aprobar la actualización de FR-016/US5 de Login y de `contracts/ui-login.md` para que solo "Regístrate" navegue a Registro; preservar los demás placeholders. Registrar la aprobación y la trazabilidad bajo Constitución 9.2. |
| `AuthGateway` y `InMemoryAuthGateway` hoy modelan autenticación sobre un array de solo lectura | Un registro podría guardarse en un objeto distinto y no autenticar después | Ampliar el contrato de forma aditiva y compartir la misma instancia creada por `main.tsx`; cubrir mediante prueba de integración register → authenticate. |
| Validación avanzada incompatible con las cuentas iniciales de demo | El login permite cuentas cuya contraseña solo cumple longitud y podrían no cumplir complejidad | Aplicar las reglas fuertes al alta nueva; no cambiar las reglas de carga/login de cuentas iniciales salvo requisito aprobado. Separar claramente la validación de registro de `isValidPasswordLength`. |
| Doble submit o dos altas con el mismo email | Duplicados o confirmación inconsistente | Bloqueo UI durante submit y unicidad atómica en el método síncrono de inserción del adaptador; probar submits repetidos. |
| Tokens exactos de Figma no alcanzan contraste AA | Incumplimiento constitucional de accesibilidad | Reutilizar `--brand-700`, `--neutral-600`, `--neutral-border` y otros tokens accesibles existentes; verificar contraste visual/axe según precedente del Login. |
| Nombre del usuario no coincide con el `displayName` esperado por el login | Bienvenida vacía o distinta a registro | Normalizar nombre una vez en el caso de uso y mapear a `displayName`; prueba end-to-end de mensaje de bienvenida. |
| Mensaje de éxito se pierde al cambiar de vista | Usuario no recibe confirmación solicitada | Mantenerlo en el estado de navegación de `App` y pasarlo al Login como aviso accesible; probar foco y anuncio. |
| Colección de credenciales en cliente no es seguridad de producción | Riesgo de que la demo se interprete como registro real | Mantener datos ficticios, no persistir ni registrar password; indicar explícitamente en la documentación/avisos que es una demostración y que las cuentas se pierden al recargar. |
| Acceso a términos sin destino legal aprobado | El usuario puede asumir que aceptó un contrato real | El enlace solo muestra aviso; la casilla requiere acción explícita y no presenta contenido legal no proporcionado. |
| El repositorio no está inicializado como Git | No se puede completar revisión por PR/trazabilidad de commits según 9.3 | Resolver el estado del repositorio con el responsable antes de integrar; no inicializar ni crear commits desde este plan. |

## Testing Strategy

Todo comportamiento nuevo seguirá Rojo → Verde → Refactorizar. Las pruebas de dominio y
aplicación preceden al código de producción, luego se añaden pruebas del adaptador y finalmente
pruebas de integración/renderizado.

| Nivel | Cobertura prevista | Trazabilidad |
|---|---|---|
| Unitario de dominio | Nombre vacío/límite 80, email requerido/formato/límite/normalización, contraseña requerida/límites/mayúscula/número/símbolo, exclusión de whitespace como especial, confirmación literal y términos | AC-002–AC-009, FR-003–FR-009 |
| Unitario de aplicación | Validación bloquea gateway; normalización de nombre/email; resultados de éxito, duplicado y no disponibilidad; password no aparece en resultado | FR-003–FR-009, FR-017–FR-018 |
| Unitario de infraestructura | Correo duplicado normalizado contra seed y registro previo; inserción única; la cuenta añadida autentica; contraseña exacta; configuración inválida; recarga/instancia nueva vacía | AC-004, AC-010–AC-012, AC-020 |
| Componente/UI | Mensajes y clearing de errores, submit Enter, bloqueo doble, foco en primer error, toggles independientes, términos obligatorios, placeholders sin submit, enlace a Login y aviso de confirmación | AC-006–AC-017 |
| Integración App | Navegación Login ⇄ Registro; registro con gateway compartido y login posterior en la misma sesión; alta seguida de confirmación; sin navegación de documento | AC-010–AC-014 |
| Accesibilidad | `expectNoA11yViolations`, etiquetas/errores asociados, roles de alert/status, teclado, foco visible y nombres accesibles | AC-015, AC-018 |
| Responsive/visual | Anchos 320 px y escritorio 1440 × 1024; orden/contenido frente a Figma y ausencia de overflow horizontal | AC-001, AC-019 |
| Suite del proyecto | ESLint, Prettier, typecheck, tests con cobertura, build, auditoría de dependencias/licencias y secret scan vía `npm run verify` | Constitución 8 y 9 |

Las pruebas vivirán junto a cada módulo `*.test.ts(x)` y usarán fixtures ficticios. No se
registrarán contraseñas reales ni se utilizarán valores secretos versionados. Se mantendrá el
umbral de cobertura existente del 80 % y se añadirá cobertura específica para resultados de
duplicidad y estados de error.

## Project Structure

### Documentation (this feature)

```text
specs/002-registro-billetera/
├── spec.md                 # Contrato de comportamiento aprobado
├── plan.md                 # Este archivo
├── research.md             # Decisiones técnicas y resolución de compatibilidad
├── data-model.md           # DTOs y estados si se requieren para implementación
├── quickstart.md           # Ejecución manual del flujo de registro
├── contracts/
│   ├── registration-gateway.md
│   └── ui-registration.md
└── tasks.md                # Fase posterior; no se genera en esta solicitud
```

Los documentos `research.md`, `data-model.md`, `quickstart.md`, contratos y `tasks.md` son
artefactos potenciales de las fases posteriores del flujo SDD. Este plan no los crea.

### Source Code (repository root)

```text
src/
├── main.tsx                         # Instancia compartida de gateway y casos de uso
├── App.tsx                          # Navegación local y estado de confirmación
├── domain/
│   ├── auth.ts                      # Tipos de registro y resultado
│   ├── validation.ts                # Reglas compartidas y específicas del registro
│   └── messages.ts                  # Mensajes únicos
├── application/
│   ├── ports/AuthGateway.ts         # authenticate + register
│   ├── authenticate.ts              # Caso existente, preservado
│   └── register.ts                  # Caso nuevo
├── infrastructure/
│   ├── InMemoryAuthGateway.ts       # Colección compartida mutable
│   └── loadDemoAccounts.ts          # Cuentas iniciales, sin cambios de fuente
├── ui/
│   ├── components/                  # Componentes compartidos existentes
│   ├── layout/BrandPanel/            # Copy parametrizable, estructura y assets existentes
│   └── features/
│       ├── login/                    # Cambios limitados a navegación/aviso autorizados
│       └── register/
│           ├── RegistrationScreen.tsx
│           ├── RegistrationForm.tsx
│           ├── registrationReducer.ts
│           ├── useRegistrationForm.ts
│           ├── RegistrationScreen.module.css
│           └── *.test.ts(x)
└── test/                             # Helpers, fixtures y stubs existentes ampliados
```

**Structure Decision**: mantener el proyecto único en la raíz y sus cuatro capas existentes.
Las pruebas permanecen junto al código y la única raíz de composición continúa siendo
`src/main.tsx`. No se crean paquetes ni carpetas raíz adicionales.

## Complexity Tracking

| Violación / desviación | Por qué es necesaria | Alternativa más simple rechazada porque |
|---|---|---|
| Extender `AuthGateway` con registro | Un único puerto/adaptador permite que las cuentas añadidas estén disponibles inmediatamente para `authenticate`, preservando la separación de capas | Un arreglo local a la pantalla o un segundo gateway no sería visible al Login y duplicaría la fuente de usuarios |
| Estado de navegación local en `App` | Se requieren dos vistas en la SPA y conservar el objeto en memoria sin navegación que recargue | Un router/dependencia externa es innecesario para dos vistas; enlaces con recarga destruyen los registros de la sesión |
| Validación fuerte solo en Registro | La spec exige complejidad para nuevas cuentas, mientras el Login actual acepta credenciales de demo por longitud | Aplicar la nueva regla al loader/login podría invalidar cuentas ficticias existentes y modificar requisitos ajenos |
| Cambio de "Regístrate" en Login | Proporciona una entrada visible a la pantalla de registro | Mantenerlo como placeholder deja la nueva función inaccesible; requiere aprobación y ajuste trazable de la spec/contrato de Login |

## Implementation Notes

- El plan supone que el contenido y la especificación de Registro prevalecen para el nuevo flujo,
  pero no reemplazan los controles preexistentes de Login. Cualquier actualización del
  comportamiento de Login se limitará al enlace "Regístrate", su navegación a Registro y la
  capacidad de mostrar confirmación post-alta.
- El diseño de `04 · Registro` tiene textos e ilustración de marca diferentes al `BrandPanel` de
  Login. Reutilizar el layout no debe copiar por accidente el titular, subtítulo ni contenido de
  tarjeta del login.
- La contraseña de usuario permanece en memoria para permitir autenticación durante la sesión
  de demostración. Esto no constituye almacenamiento seguro ni autenticación apta para
  producción; no debe describirse de ese modo.
- No se deben actualizar `package.json` ni `package-lock.json` salvo que una futura decisión
  técnica justificada identifique una necesidad que no puedan cubrir las dependencias actuales.
