---

description: "Task list for 002-registro-billetera"

---

# Tasks: Pantalla de Registro de KynWallet

**Input**: Design documents from `/specs/002-registro-billetera/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), decisión aprobada para alinear
el enlace "Regístrate" en `specs/001-login-billetera/`

**Tests**: OBLIGATORIAS. La Constitución (Principio I, TDD) exige escribir primero las pruebas,
verlas fallar y luego implementar. Cada grupo de comportamiento sigue Rojo → Verde →
Refactorizar.

**Organization**: Las tareas están agrupadas por fase y por historia para facilitar ejecución,
verificación y entrega incremental.

## Format: `[ID] [P?] [Story] Descripción`

- **[P]**: Puede ejecutarse en paralelo porque modifica archivos diferentes y no depende de una
  tarea pendiente.
- **[Story]**: Historia de usuario relacionada (US1–US4); las tareas transversales se marcan
  `[Shared]`.
- Cada tarea indica dependencias, requisitos trazados y resultado verificable.
- Las pruebas viven junto al código (`*.test.ts(x)`). Cada `it(...)` DEBE comenzar con el ID del
  criterio o requisito que verifica, por ejemplo `it('AC-004: rechaza correo duplicado', ...)`.
- Rutas relativas a la raíz del repositorio.

---

## Phase 1: Setup & Contract Alignment

**Purpose**: Confirmar la condición de integración con Login y preparar contratos sin crear
arquitectura o dependencias nuevas.

- [X] T001 [Shared] Actualizar `specs/001-login-billetera/spec.md` y
  `specs/001-login-billetera/contracts/ui-login.md` para que únicamente "Regístrate" navegue a
  la pantalla de Registro, manteniendo Google, Apple y los demás placeholders sin integración;
  registrar la aprobación requerida por el plan. **Dep**: ninguna. **Req**: FR-012 de Registro;
  riesgo de compatibilidad del plan. **Resultado**: contrato de Login alineado y decisión
  aprobada/documentada en la aclaración de `specs/001-login-billetera/spec.md`.
- [X] T002 [P] [Shared] Revisar `src/domain/auth.ts`, `src/domain/validation.ts`,
  `src/application/ports/AuthGateway.ts`, `src/infrastructure/InMemoryAuthGateway.ts`,
  `src/main.tsx`, componentes UI y sus pruebas para identificar contratos existentes que se
  ampliarán sin duplicarlos. **Dep**: ninguna. **Req**: FR-010, FR-012; NFR-006.
  **Resultado**: revisión completada. `main.tsx` compone una instancia de
  `InMemoryAuthGateway`; `AuthGateway` expone solo `authenticate`; el adaptador mantiene cuentas
  de solo lectura; `normalizeEmail` es reusable; `App` renderiza Login fijo; `LoginForm` presenta
  "Regístrate" como aviso; `TextField`, `PasswordField`, `Checkbox` y `Alert` ya cubren la
  semántica base de inputs y anuncios. No se modificó código ni se propuso otra arquitectura.
- [X] T003 [P] [Shared] Confirmar en `package.json` y `vite.config.ts` que Vitest, Testing
  Library, axe-core, CSS Modules y scripts `npm run verify` ya están disponibles; no modificar
  dependencias. **Dep**: ninguna. **Req**: NFR-006. **Resultado**: estrategia de pruebas
  confirmada usando únicamente herramientas instaladas: React Testing Library, Vitest, axe-core,
  CSS Modules y `verify` ya están configurados; no se modificaron manifiestos ni dependencias.

**Checkpoint**: Phase 1 completada. La decisión sobre el enlace de Login quedó registrada, se
revisaron los puntos de integración existentes y se confirmó que las herramientas necesarias ya
están disponibles. No se avanzó a Phase 2 ni se modificó código de producción.

---

## Phase 2: Domain — Model, Contracts & Validation (US1, US3)

**Purpose**: Definir tipos y reglas de negocio puros y verificarlos con pruebas antes de su
implementación.

### Tests first

- [X] T004 [US1] Escribir pruebas fallidas de normalización del nombre en
  `src/domain/validation.test.ts`: recorta solo espacios periféricos, conserva espacios
  interiores, rechaza vacío y rechaza más de 80 caracteres después de recortar. **Dep**: T002.
  **Req**: FR-003; AC-002. **Resultado**: pruebas identificadas `AC-002` que fallan ante la
  implementación actual. Implementación disponible; pruebas pasan.
- [X] T005 [US1] Escribir pruebas fallidas de validación del correo en
  `src/domain/validation.test.ts`: requerido, formato, máximo 254, trim y comparación
  insensible a mayúsculas. **Dep**: T002. **Req**: FR-004; AC-003, AC-004.
  **Resultado**: pruebas `AC-003`/`AC-004` establecen el contrato de correo y pasan.
- [X] T006 [US1, US3] Escribir pruebas fallidas de contraseña y confirmación en
  `src/domain/validation.test.ts`: longitudes 8–128, mayúscula Unicode, dígito decimal,
  puntuación/símbolo, espacios que no cuentan como carácter especial, valores sin trim y
  confirmación exacta. **Dep**: T002. **Req**: FR-006, FR-007; AC-005, AC-006.
  **Resultado**: cobertura de límites y clases de caracteres con identificadores AC en verde.
- [X] T007 [US1] Escribir pruebas fallidas de aceptación de términos y validación conjunta
  en `src/domain/validation.test.ts`: rechazo sin aceptación y orden estable de errores.
  **Dep**: T002. **Req**: FR-008, FR-009; AC-007, AC-008.
  **Resultado**: pruebas de validación integral con mensajes/campos esperados en verde.
- [X] T008 [P] [US1] Escribir pruebas de tipos/contrato en `src/domain/auth.test.ts` (o pruebas
  existentes apropiadas) para `RegistrationInput` y `RegistrationResult`; comprobar la forma de
  `DemoAccount` y que confirmación/aceptación no forman parte de la cuenta final. El mapeo de
  `fullName` a `displayName` corresponde al caso de uso de Application y se prueba en Phase 3.
  **Dep**: T002. **Req**: FR-003, FR-007, FR-010; AC-010, AC-012.
  **Resultado**: contrato tipado verificable sin modelo de usuario duplicado; pruebas pasan.

### Implementation

- [X] T009 [US1] Extender `src/domain/auth.ts` con `RegistrationInput`, errores de campos y
  resultado discriminado de registro; reutilizar `DemoAccount` y `displayName` para evitar
  duplicar la entidad de usuario. **Dep**: T008. **Req**: FR-002, FR-010.
  **Resultado**: tipos estrictos para formulario, cuenta creada y resultados de negocio; pruebas
  de tipos en verde.
- [X] T010 [US1, US3] Implementar reglas puras de nombre, correo, contraseña, confirmación y
  términos en `src/domain/validation.ts` o módulo de dominio dedicado, reutilizando
  `normalizeEmail` y manteniendo intactas las reglas de Login. **Dep**: T004, T005, T006, T007,
  T009. **Req**: FR-003–FR-009. **Resultado**: validación de registro determinista, probada y
  separada de presentación; suite completa y typecheck pasan.
- [X] T011 [US1, US3] Añadir a `src/domain/messages.ts` los mensajes canónicos de validación,
  correo duplicado, términos, proveedores, aviso legal, disponibilidad y alta exitosa. **Dep**:
  T009. **Req**: FR-005, FR-009, FR-011, FR-014, FR-015, FR-017.
  **Resultado**: fuente única de textos conforme a la especificación, sin duplicación entre UI;
  formatting y lint pasan.

**Checkpoint**: las reglas de dominio están cubiertas y todas las pruebas de T004–T008 pasan.

---

## Phase 3: Application — Registration Use Case (US1, US2)

**Purpose**: Orquestar la validación y registro a través del puerto compartido antes de integrar
el adaptador.

### Tests first

- [X] T012 [US1] Escribir pruebas fallidas del caso de uso en
  `src/application/register.test.ts`: datos inválidos no llaman al gateway; datos válidos
  normalizan nombre/email y delegan una sola cuenta; confirmación y términos no llegan a la
  cuenta final. **Dep**: T009–T010. **Req**: FR-003–FR-010; AC-002–AC-010.
  **Resultado**: pruebas con gateway stub pasan; validación inválida evita delegación y la
  cuenta creada usa nombre/email normalizados sin datos de confirmación/aceptación.
- [X] T013 [US1, US2] Escribir pruebas fallidas de resultados en
  `src/application/register.test.ts`: propaga duplicidad y disponibilidad como variantes
  explícitas; nunca devuelve ni registra contraseña. **Dep**: T009, T011.
  **Req**: FR-005, FR-017, FR-018; AC-004, AC-010. **Resultado**: duplicidad/unavailable son
  resultados explícitos; prueba confirma que la contraseña no aparece en el resultado ni en logs.
- [X] T014 [P] [US2] Escribir prueba de compatibilidad del caso existente de autenticación en
  `src/application/authenticate.test.ts`: el alta nueva puede consumirse por el contrato común
  sin cambiar el comportamiento de email normalizado y contraseña exacta. **Dep**: T002, T009.
  **Req**: FR-010; AC-012. **Resultado**: prueba confirma que el caso existente normaliza email
  pero transmite exactamente la contraseña; pruebas de autenticación pasan.

### Implementation

- [X] T015 [US1] Extender `src/application/ports/AuthGateway.ts` con la operación tipada de
  registro y sus resultados, conservando `authenticate` sin cambios incompatibles. **Dep**:
  T009. **Req**: FR-010; AC-010, AC-012. **Resultado**: puerto único para alta y login, con
  contratos explícitos. `register` queda opcional de forma transitoria para no romper la
  implementación actual del adaptador antes de Phase 4; el caso de uso devuelve `unavailable`
  explícitamente si el adaptador aún no soporta la operación.
- [X] T016 [US1] Implementar `src/application/register.ts` como caso de uso: validar los datos,
  normalizar el nombre/correo, mapear el nombre a `displayName` y delegar la inserción al puerto.
  **Dep**: T010–T012, T015. **Req**: FR-003–FR-010.
  **Resultado**: caso de uso sin dependencias de UI/infraestructura; resultados de validación,
  éxito, duplicado y fallo explícito cubiertos por T012/T013.
- [X] T017 [US2] Verificar y, si hace falta, ajustar `src/application/authenticate.ts` para que
  siga delegando en el mismo contrato compartido sin modificar la comparación exacta de
  contraseñas ni el resultado genérico actual. No fue necesario modificar el caso existente;
  la compatibilidad está cubierta por T014. **Dep**: T014–T016.
  **Req**: FR-010; AC-012. **Resultado**: pruebas existentes y T014 pasan sin regresión.

**Checkpoint**: el caso de uso distingue validación, duplicidad y disponibilidad, y Login sigue
funcionando mediante su contrato actual.

---

## Phase 4: Infrastructure — Shared In-Memory User Collection (US1, US2)

**Purpose**: Añadir altas en memoria y unicidad en la misma fuente que autentica Login.

### Tests first

- [X] T018 [US1] Escribir pruebas fallidas de registro para
  `src/infrastructure/InMemoryAuthGateway.test.ts`: añade una cuenta válida una sola vez y
  permite autenticarla inmediatamente mediante la misma instancia. **Dep**: T015.
  **Req**: FR-010; AC-010, AC-012. **Resultado**: la prueba falló antes de implementar `register`
  y pasa con la cuenta creada autenticable en la misma instancia.
- [X] T019 [US1] Escribir pruebas fallidas de duplicidad en
  `src/infrastructure/InMemoryAuthGateway.test.ts`: rechaza correo preexistente y registrado
  previamente aunque cambien mayúsculas o espacios periféricos; no altera el conjunto. **Dep**:
  T015, T018. **Req**: FR-005; AC-004, AC-011.
  **Resultado**: cobertura de duplicidad contra cuentas iniciales y registros de sesión; los
  intentos duplicados no mutan la colección.
- [X] T020 [US1] Escribir pruebas fallidas de estado unavailable y ciclo de vida:
  configuración inicial `null` no permite alta; una instancia nueva no incluye usuarios
  registrados por la instancia anterior (simulación de recarga/cierre). **Dep**: T015, T018.
  **Req**: FR-010, FR-017; AC-020. **Resultado**: configuración nula produce `unavailable` y
  una instancia nueva no conserva registros runtime.
- [X] T021 [US2] Añadir prueba de compatibilidad en
  `src/infrastructure/InMemoryAuthGateway.test.ts`: correo sigue normalizándose para buscar y la
  contraseña de toda cuenta (inicial o recién creada) sigue comparándose exactamente.
  **Dep**: T018. **Req**: FR-010, FR-018; AC-012.
  **Resultado**: email se normaliza y contraseña se compara exactamente para cuentas nuevas; las
  pruebas previas de Login siguen pasando.

### Implementation

- [X] T022 [US1, US2] Modificar `src/infrastructure/InMemoryAuthGateway.ts` para mantener una
  colección privada mutable inicializada con las cuentas del constructor y añadir operación
  `register` que normalice email, compruebe unicidad y agregue de forma síncrona antes de
  devolver éxito. **Dep**: T018–T021. **Req**: FR-005, FR-010, FR-017.
  **Resultado**: un solo gateway sirve registro y login; `register` es obligatorio en el puerto
  y las pruebas T018–T021 pasan.
- [X] T023 [US1] Confirmar que `src/infrastructure/loadDemoAccounts.ts` valida cuentas iniciales
  con las reglas actuales de Login y no impone complejidad nueva a registros existentes.
  Ajustar únicamente si una prueba de regresión demuestra necesidad. Se añadió una prueba de
  contrato; no fue necesario cambiar el loader. **Dep**: T021–T022.
  **Req**: FR-006, FR-010; AC-012. **Resultado**: cuentas ficticias preconfiguradas conservan
  compatibilidad y no requieren reglas de complejidad de registro; lógica del loader sin cambios.

**Checkpoint**: una cuenta registrada se autentica inmediatamente con la misma instancia;
duplicidad, configuración inválida y fin de sesión están cubiertos.

---

## Phase 5: UI — Registration Form and Screen (US1, US3, US4)

**Purpose**: Construir la vista según Figma reutilizando controles y patrones existentes.

### Tests first

- [X] T024 [US1] Escribir pruebas de `RegistrationForm` en
  `src/ui/features/register/RegistrationForm.test.tsx`: renderiza etiquetas, campos requeridos,
  términos, submit, divisor, botones sociales y enlace de login en orden esperado.
  **Dep**: T002, T009. **Req**: FR-001, FR-002; AC-001.
  **Resultado**: contenido, obligatoriedad y orden del formulario según Figma cubiertos por pruebas
  de componente.
- [X] T025 [P] [US3] Escribir pruebas fallidas del reducer/hook de registro en
  `src/ui/features/register/registrationReducer.test.ts`: edición, blur, submit inválido,
  limpieza individual de errores, loading y bloqueo de envíos repetidos. **Dep**: T010–T011.
  **Req**: FR-009, FR-016; AC-008, AC-009, AC-011.
  **Resultado**: transiciones reducer y estado pending/bloqueo de doble envío probados.
- [X] T026 [US3] Escribir pruebas fallidas de validación visible y foco en
  `RegistrationForm.test.tsx`: formulario vacío muestra errores, no invoca registro, mueve foco
  al primer campo inválido y se corrigen mensajes independientemente. **Dep**: T024–T025.
  **Req**: FR-009, FR-016; AC-002–AC-009.
  **Resultado**: envío inválido enfoca el primer campo y errores corregidos desaparecen sin
  ocultar errores de otros campos; el caso de uso no es invocado.
- [X] T027 [US3] Escribir pruebas fallidas para los controles de contraseña: los dos campos
  inician ocultos, sus toggles operan independientemente, tienen nombres accesibles y mantienen
  valor/estado al alternar. **Dep**: T024. **Req**: FR-013; AC-015.
  **Resultado**: se reutilizan dos instancias de PasswordField con visibilidad independiente,
  valores conservados y acciones accesibles.
- [X] T028 [US4] Escribir pruebas fallidas de placeholders y enlace legal: Google/Apple y
  términos muestran su aviso, conservan valores, no envían el formulario y no marcan la casilla.
  **Dep**: T024. **Req**: FR-014, FR-015; AC-016, AC-017.
  **Resultado**: los tres avisos se diferencian, conservan valores y no disparan registro ni
  aceptación accidental de términos.

### Implementation

- [X] T029 [US3] Implementar `registrationReducer.ts` y `useRegistrationForm.ts` con estado
  explícito, validación al blur/submit, revalidación de campos corregidos, control de pending,
  bloqueo de submit adicional y referencias para foco en primer error. **Dep**: T025–T026.
  **Req**: FR-009, FR-016; AC-008, AC-009, AC-011.
  **Resultado**: estado determinista con pending, deduplicación en vuelo y validación cubierta;
  la vista usa referencias para el primer campo inválido.
- [X] T030 [US1, US3] Implementar `RegistrationForm.tsx` usando `TextField`, dos
  `PasswordField`, `Checkbox`, `Button`, `Alert`, `Divider` y `SocialButton`; conectar errores,
  acciones y submit del caso de uso. **Dep**: T024, T026–T029, T016.
  **Req**: FR-001–FR-009, FR-013–FR-016.
  **Resultado**: formulario y validación conectados al caso de uso usando los controles UI ya
  existentes; pruebas de render, validación, envío, estados y errores pasan.
- [X] T031 [US4] Añadir al formulario los mensajes específicos de Google, Apple y términos
  mediante `Alert` o estado informativo existente, sin limpiar valores ni disparar submit.
  **Dep**: T028, T030. **Req**: FR-014, FR-015; AC-016, AC-017.
  **Resultado**: avisos informativos específicos anunciados con `Alert`; no navegan ni alteran el
  formulario.
- [X] T032 [US1, US3] Implementar estilos CSS Modules para `RegistrationForm`: tamaños, espaciado,
  orden, estados error/foco, layout de redes sociales y términos, reutilizando tokens accesibles
  y sin cambios globales innecesarios. **Dep**: T030. **Req**: FR-001, FR-009, FR-013.
  **Resultado**: módulo CSS con tokens existentes y ajustes responsive; geometría comprobada en
  viewport de referencia y anchos 320, 480, 960, 1280 y 1440 px sin desbordamiento horizontal.
- [X] T033 [US1] Crear `RegistrationScreen.tsx` que use el shell compartido y el contenido de
  marca de Registro ("Comienza tu camino financiero.", texto de apoyo y tarjeta ilustrativa)
  sin alterar el contenido de Login. **Dep**: T030, T032.
  **Req**: FR-001; AC-001. **Resultado**: pantalla compuesta con el shell compartido, copy y
  tarjeta de marca esperados, probado sin montar navegación de la SPA.
- [X] T034 [US1] Ajustar `BrandPanel`/`LoginScreen` mediante props de contenido compatibles para
  permitir los textos del frame de Registro y conservar el render actual de Login por defecto.
  **Dep**: T033. **Req**: FR-001; AC-001.
  **Resultado**: panel acepta copy/variante de marca opcionales; Login conserva su copy y
  composición por defecto mediante prueba de regresión.

**Checkpoint**: formulario y pantalla cumplen AC-001–AC-011 y AC-015–AC-017 con pruebas
componentes en verde.

---

## Phase 6: Navigation & Application Integration (US2, US1)

**Purpose**: Integrar las dos vistas en la SPA y conservar la instancia compartida sin recarga.

### Tests first

- [X] T035 [US2] Escribir pruebas fallidas de integración en `src/App.test.tsx`:
  navegación local Login → Registro mediante "Regístrate" y Registro → Login mediante
  "Inicia sesión", sin invocar registro ni recargar documento. **Dep**: T001, T024, T033.
  **Req**: FR-012; AC-014. **Resultado**: ambas transiciones verificadas en la SPA; volver a
  Login no invoca registro y la URL permanece intacta.
- [X] T036 [US2] Escribir pruebas fallidas de alta exitosa en `src/App.test.tsx`: una única
  instancia de gateway permite registrar y autenticar; el login muestra confirmación y foco en
  aviso/encabezado. **Dep**: T018, T024, T033, T035.
  **Req**: FR-010, FR-011; AC-010, AC-012, AC-013.
  **Resultado**: prueba de recorrido completa registra y autentica la cuenta mediante casos de
  uso unidos al mismo gateway; confirma el aviso en Login y el foco accesible.
- [X] T037 [US1, US2] Escribir pruebas fallidas para el registro fallido: correo duplicado
  y gateway unavailable mantienen el usuario en registro, muestran mensaje accionable, no
  presentan éxito y no cambian la colección. **Dep**: T019–T020, T030, T035.
  **Req**: FR-005, FR-017; AC-004 y edge case de error inesperado.
  **Resultado**: pruebas de integración cubren duplicado y gateway no disponible; Registro queda
  visible, muestra error y no indica éxito.

### Implementation

- [X] T038 [US2] Actualizar `src/ui/features/login/LoginForm.tsx` para convertir solo la acción
  "Regístrate" en callback de navegación y mantener sin cambios los demás placeholders definidos
  por Login. **Dep**: T001, T035. **Req**: FR-012 de Registro y contrato de Login alineado.
  **Resultado**: solo "Regístrate" invoca el callback de navegación; los demás placeholders
  conservan su comportamiento actual.
- [X] T039 [US2] Actualizar `src/App.tsx` para recibir `Authenticate` y el caso de uso `Register`,
  mantener estado de vista local y renderizar Login o RegistrationScreen con callbacks; no
  introducir router. **Dep**: T016–T017, T033, T035, T038.
  **Req**: FR-010, FR-012; AC-014. **Resultado**: App conmuta entre pantallas con estado React
  local y callbacks; no se añade router ni recarga.
- [X] T040 [US2] Actualizar `src/main.tsx` para construir un solo `InMemoryAuthGateway` y derivar
  ambos casos de uso de la misma instancia, conservando la raíz de composición actual.
  **Dep**: T016, T022, T039. **Req**: FR-010; AC-010, AC-012.
  **Resultado**: una instancia de gateway alimenta `createAuthenticate` y `createRegister`.
- [X] T041 [US2] Implementar en `App` el callback de alta exitosa: cambiar a Login, mostrar
  "Cuenta creada correctamente. Ahora puedes iniciar sesión.", anunciarlo y mover el foco al
  aviso/encabezado. **Dep**: T036, T039–T040.
  **Req**: FR-011; AC-013. **Resultado**: App vuelve a Login con aviso `status` anunciado y foco
  programático en la confirmación.
- [X] T042 [US1] Conectar resultados `email-already-registered` y `unavailable` a mensajes
  visibles en Registro; evitar mutaciones y confirmaciones de éxito ante cualquier resultado
  no exitoso. **Dep**: T031, T037, T039–T040.
  **Req**: FR-005, FR-017; AC-004. **Resultado**: resultados de duplicado/no disponible y
  excepciones se representan mediante errores comprensibles; no cambian de vista ni confirman
  éxito.

**Checkpoint**: recorrido Login → Registro → alta → Login → autenticación pasa sobre la misma
instancia; estados duplicado/unavailable permanecen en la pantalla y no producen falso éxito.

---

## Phase 7: Integration, Accessibility, Responsive & Polish (US1–US4)

**Purpose**: Cerrar todos los criterios de aceptación, validar accesibilidad/responsive y
ejecutar controles de Constitución.

- [X] T043 [P] [US1, US2] Completar pruebas de integración en `src/App.test.tsx` para usuario
  registrado que inicia sesión con correo normalizado y contraseña exacta, y falla con
  contraseña distinta. **Dep**: T036, T040–T042.
  **Req**: FR-010, FR-018; AC-012. **Resultado**: recorrido completo probado; la contraseña
  exacta autentica y una contraseña distinta se rechaza sin alterar Login.
- [X] T044 [P] [US1, US3, US4] Añadir pruebas de accesibilidad con `expectNoA11yViolations` para
  pantalla inicial, errores visibles, avisos de placeholders y confirmación en Login; verificar
  etiquetas, `aria-describedby`, roles de anuncio y nombres de toggles. **Dep**: T030–T034,
  T041–T042. **Req**: NFR-001, NFR-002; AC-015, AC-018.
  **Resultado**: axe no detecta violaciones en Login, Registro, errores, avisos ni confirmación;
  se verifican etiquetas, relaciones de error, anuncios y nombres accesibles.
- [X] T045 [P] [US1, US3] Verificar responsive a 320, 480, 960, 1280 y 1440 px mediante
  pruebas/componentes y revisión con navegador; corregir CSS de Registro/layout únicamente.
  **Dep**: T032–T034. **Req**: NFR-003; AC-019.
  **Resultado**: revisión en navegador completada en los cinco anchos; no hay overflow horizontal
  y el formulario/acción principal permanecen dentro del viewport.
- [X] T046 [P] [US1, US3] Añadir prueba de seguridad en UI: contraseña no aparece en
  `document.body.textContent`, URL, logs ni llamadas de almacenamiento persistente tras alta
  exitosa/fallida; comprobar que no se llama `Storage.prototype.setItem`.
  **Dep**: T030, T039–T042. **Req**: FR-018, NFR-004.
  **Resultado**: pruebas automatizadas de alta exitosa y fallida confirman que la contraseña no
  se filtra en texto, URL, logs ni Web Storage.
- [X] T047 [US1] Comparar visualmente la pantalla en 1440 × 1024 con Figma `04 · Registro`
  (nodo `31:2`): contenido, jerarquía, posiciones, estados iniciales y recursos; conservar los
  ajustes de contraste necesarios para WCAG AA. **Dep**: T033–T034, T045.
  **Req**: FR-001; AC-001. **Resultado**: frame y navegador comparados a 1440 × 1024; jerarquía,
  copy y geometría revisados, sin discrepancias pendientes en alcance.
- [X] T048 [P] [US1, US2] Actualizar documentación de uso relevante (`README.md` y documentación
  de feature existente) para describir el registro demo, que la cuenta vive solo en memoria,
  Login integrado, configuración inicial ficticia y límites de seguridad; no incluir
  credenciales. **Dep**: T040–T043. **Req**: FR-010, FR-018; NFR-004, NFR-006.
  **Resultado**: README raíz y guía de Registro documentan el flujo compartido, límites de
  memoria y seguridad, sin credenciales.
- [ ] T049 [US1–US4] Ejecutar `npm run verify` y corregir cualquier fallo de lint, formato,
  tipos, cobertura ≥ 80 %, build, auditoría de dependencias/licencias o escaneo de secretos.
  **Dep**: T043–T048. **Req**: NFR-006; Constitución 8.1–8.4, 9.4.
  **Resultado**: bloqueada por `npm run format`, que detecta 48 archivos preexistentes/no
  modificados en Phase 7. Lint, typecheck, 177 pruebas con cobertura, build, auditoría de
  dependencias/licencias y escaneo de secretos pasan por separado; el formato de los archivos
  modificados en Phase 7 también pasa. No se reformateó código ajeno al alcance.
- [X] T050 [US1–US4] Recorrer manualmente los criterios AC-001–AC-020 en los viewports y estados
  descritos, documentar resultados reproducibles y vincular fallos a sus tareas correctivas.
  **Dep**: T043–T049. **Req**: AC-001–AC-020.
  **Resultado**: evidencia reproducible para AC-001–AC-020 registrada en `verification.md`;
  la única incidencia de verificación abierta es el chequeo de formato global T049.

**Checkpoint**: criterios de aceptación, validación de accesibilidad, responsive, build y
controles de cumplimiento verificados antes de integración.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup & Contract Alignment)**: T001 es un gate para habilitar el enlace desde Login;
  T002–T003 son comprobaciones independientes. La decisión de compatibilidad debe estar aprobada
  antes de T035/T038.
- **Phase 2 (Domain)**: depende del reconocimiento de contratos de T002; bloquea Application,
  Infrastructure y la lógica de formulario. Las pruebas T004–T008 preceden a T009–T011.
- **Phase 3 (Application)**: depende de tipos/reglas T009–T011; las pruebas T012–T014 se escriben
  antes del puerto/caso de uso T015–T017.
- **Phase 4 (Infrastructure)**: depende del contrato T015; las pruebas T018–T021 preceden al
  cambio T022–T023.
- **Phase 5 (UI)**: depende de dominio y caso de uso; tests T024–T028 preceden reducer,
  formulario y pantalla T029–T034.
- **Phase 6 (Integration)**: requiere gateway y componentes; tests T035–T037 preceden
  navegación, composición y confirmación T038–T042.
- **Phase 7 (Polish)**: depende del recorrido integrado; T043–T050 cierran pruebas, diseño,
  documentación y controles.

### Within Each Feature

- Escribir las pruebas antes del código de producción y confirmar que fallan por la razón
  esperada (Constitución 1.1).
- Respetar el flujo de dependencias hacia el dominio; componentes UI no importan infraestructura
  (Constitución 3.2).
- Reutilizar la colección del gateway compartido; ninguna prueba debe pasar por un segundo
  repositorio en memoria.
- Ejecutar pruebas de los archivos afectados antes de cerrar cada grupo; ejecutar `npm run
  verify` en Phase 7.

### Parallel Opportunities

- Phase 1: T002 y T003 pueden ejecutarse en paralelo; T001 requiere aprobación documental
  independiente antes de la integración con Login.
- Domain tests: T004–T008 pueden trabajarse en paralelo en archivos separados si se coordinan
  las ediciones compartidas a `validation.test.ts`.
- Application tests: T012–T014 pueden desarrollarse en paralelo en archivos distintos.
- Infrastructure tests: T018–T021 pueden prepararse en paralelo por escenarios; consolidar las
  modificaciones al mismo archivo antes de implementar T022.
- UI tests: T024–T028 pueden ejecutarse en paralelo si los cambios no colisionan en el mismo
  archivo; dividir por pruebas de reducer y formulario.
- Phase 7: T044–T046 pueden ejecutarse en paralelo en archivos diferentes; T047 depende de
  estilos finales.

---

## Parallel Example: Domain Validation

```text
Task T004: pruebas de nombre completo y normalización (AC-002)
Task T005: pruebas de email, formato y longitud (AC-003, AC-004)
Task T006: pruebas de contraseña y confirmación exacta (AC-005, AC-006)
Task T007: pruebas de aceptación y validación conjunta (AC-007, AC-008)
```

Implementar las reglas después de que las pruebas correspondientes estén en rojo y coordinar
los cambios a `validation.test.ts` para evitar conflictos de edición.

## Implementation Strategy

### MVP First

1. Completar Phase 1 y obtener la decisión de compatibilidad con el enlace de Login.
2. Completar Domain, Application e Infrastructure hasta T023.
3. Completar la pantalla de registro y navegación integrada (T024–T042).
4. **DETENERSE Y VALIDAR**: AC-001, AC-004, AC-010–AC-014 mediante pruebas y recorrido manual.
5. Continuar con accesibilidad, responsive, documentación y verificación final.

### Incremental Delivery

1. Dominio y caso de uso → contrato de registro validado.
2. Gateway compartido → correo único y autenticación de cuenta creada.
3. UI de registro → formularios, mensajes, validaciones y placeholders.
4. Navegación local → enlace de login, confirmación y flujo end-to-end.
5. Polish → responsive, a11y, comparación visual y controles de `npm run verify`.

---

## Notes

- [P] significa archivos distintos y ausencia de dependencias pendientes; revisar colisiones al
  editar un archivo compartido.
- Trazabilidad Constitución 9.2: cada `it(...)` debe incluir `AC-xxx` o `FR-xxx`; cada cambio de
  comportamiento debe enlazarse a estas tareas en la revisión.
- No se añade dependencia, router, base de datos, API ni almacenamiento del navegador.
- No implementar la navegación desde "Regístrate" hasta que T001 esté resuelta y aprobada; no
  se deben ignorar silenciosamente los requisitos contradictorios del contrato previo.
- Las contraseñas deben usar datos ficticios exclusivamente; esta demo frontend no proporciona
  seguridad para cuentas reales.
