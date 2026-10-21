# Feature Specification: Pantalla de Registro de KynWallet

**Feature Branch**: `002-registro-billetera`

**Created**: 2026-10-20

**Status**: Draft

**Input**: User description: "Construir una pantalla web de registro para KynWallet que permita
crear una cuenta con nombre completo, correo electrónico y contraseña, validar los datos y los
términos, guardar el usuario en memoria durante la sesión activa y permitir iniciar sesión con
esas credenciales. El alcance es una demostración funcional frontend, sin backend ni base de
datos, basada en el diseño de Figma y alineada con la Constitución y la especificación existente
de inicio de sesión."

**Diseño de referencia**: Figma, frame `04 · Registro` (nodo `31:2`, 1440 × 1024):
[diseño de registro KynWallet](https://www.figma.com/design/64wSz2kYuIR1KrXD9NMRts/Billetera-Virtual---Prototipos--Copy-?node-id=31-2).
El frame muestra un panel de marca con el logotipo, el titular "Comienza tu camino financiero.",
texto de apoyo y una tarjeta ilustrativa ("Kyn Card", número enmascarado, titular y vencimiento);
el panel de formulario contiene el título "Crea tu cuenta", los campos "Nombre completo",
"Correo electrónico", "Contraseña" y "Confirmar contraseña", aceptación de términos, botón
"Crear cuenta", divisor "o regístrate con", accesos visuales Google y Apple, y el enlace
"Inicia sesión". Figma define la composición visual de referencia; las validaciones y estados
interactivos se especifican a continuación.

## Overview

Esta funcionalidad incorpora el registro de nuevos usuarios a la demostración de KynWallet.
Permite capturar y validar los datos de una cuenta, añadirla a una colección compartida en memoria
y dirigir al usuario al inicio de sesión existente para autenticarse con las credenciales creadas.

El flujo se ejecuta íntegramente en el cliente. Los usuarios creados permanecen disponibles
mientras la aplicación siga activa en la misma sesión de ejecución; no sobreviven a una recarga o
cierre de la aplicación.

## Business Context

Un visitante nuevo necesita completar un registro claro y confiable antes de poder acceder a la
billetera. La demostración debe mostrar un recorrido completo y comprobable desde el formulario
de alta hasta el inicio de sesión, sin representar una creación de cuenta real en un servicio
financiero.

El registro debe integrarse con el flujo existente de inicio de sesión. Mantener colecciones
separadas para registro y autenticación no es aceptable: una cuenta creada correctamente debe
estar disponible para login inmediatamente, sin recargar la aplicación.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Crear una cuenta con datos válidos (Priority: P1)

Como nuevo usuario, quiero completar mis datos y aceptar los términos, para crear una cuenta de
demostración y comenzar el flujo de acceso.

**Why this priority**: crear una cuenta es el objetivo principal de esta funcionalidad.

**Independent Test**: completar los cuatro campos con datos válidos, aceptar los términos y
verificar la confirmación, la inclusión del usuario en memoria y la transición al login.

**Acceptance Scenarios**: AC-001 a AC-011.

---

### User Story 2 - Iniciar sesión con la cuenta recién creada (Priority: P1)

Como usuario que acaba de registrarse, quiero llegar al inicio de sesión y usar las credenciales
que acabo de crear, para continuar el flujo sin perder la cuenta durante la sesión activa.

**Why this priority**: el registro no entrega valor demostrable si el flujo de login existente no
reconoce la cuenta nueva.

**Independent Test**: registrar una cuenta, llegar al login, autenticar con el correo y la
contraseña registrados y comprobar que el login existente reconoce las credenciales.

**Acceptance Scenarios**: AC-012 a AC-014.

---

### User Story 3 - Corregir errores y controlar la visibilidad de las contraseñas (Priority: P2)

Como usuario, quiero recibir indicaciones claras junto a los campos y poder mostrar u ocultar
cada contraseña, para corregir el formulario con confianza.

**Why this priority**: la validación accionable, la accesibilidad y la revisión de los datos
reducen errores antes de crear la cuenta.

**Independent Test**: enviar el formulario vacío, corregir errores campo por campo y alternar
individualmente la visibilidad de la contraseña y su confirmación.

**Acceptance Scenarios**: AC-002 a AC-010 y AC-015.

---

### User Story 4 - Usar los accesos visuales y el enlace de términos sin confusión (Priority: P3)

Como usuario de la demostración, quiero que los controles visuales sin integración real indiquen
su disponibilidad, para entender qué acciones puede completar la aplicación.

**Why this priority**: conserva la intención del diseño sin implementar autenticación social ni
una página legal que no se proporcionó.

**Independent Test**: activar Google, Apple y el enlace de términos y verificar los avisos
informativos sin que se envíe el registro ni se alteren los campos.

**Acceptance Scenarios**: AC-016 y AC-017.

## Functional Requirements

- **FR-001**: La pantalla DEBE reproducir la estructura, los textos y la jerarquía visual del
  frame `04 · Registro` de Figma: panel de marca, formulario, casilla de términos, botón
  principal, divisor, botones sociales y enlace al login. Debe reutilizar los tokens existentes
  y, si algún color del frame no alcanza el contraste requerido, usar la variante accesible del
  mismo sistema visual.
- **FR-002**: El formulario DEBE permitir ingresar nombre completo, correo electrónico,
  contraseña y confirmación de contraseña, además de aceptar los términos y condiciones.
- **FR-003**: El nombre completo DEBE ser obligatorio después de eliminar espacios periféricos y
  NO DEBE superar 80 caracteres. El nombre almacenado DEBE conservar el texto ingresado después
  de eliminar dichos espacios.
- **FR-004**: El correo DEBE ser obligatorio, tener formato válido y NO DEBE superar 254
  caracteres. Se DEBEN eliminar espacios periféricos antes de validarlo y normalizarlo a
  minúsculas para comparar y almacenarlo.
- **FR-005**: El correo normalizado DEBE ser único en la colección compartida de usuarios. Un
  intento con un correo ya existente DEBE rechazarse e informar claramente que la cuenta ya
  está registrada.
- **FR-006**: La contraseña DEBE ser obligatoria, tener entre 8 y 128 caracteres, incluir al
  menos una letra mayúscula, un número y un carácter especial. La contraseña NO DEBE recortarse
  ni normalizarse.
- **FR-007**: La confirmación DEBE ser obligatoria y coincidir exactamente con la contraseña,
  incluidos mayúsculas, minúsculas y espacios.
- **FR-008**: El usuario DEBE aceptar explícitamente los términos y condiciones antes de poder
  crear la cuenta.
- **FR-009**: Los errores de validación DEBEN mostrarse junto al control correspondiente al
  abandonar el campo o enviar el formulario, y DEBEN desaparecer al corregir el valor. La
  validación DEBE impedir la creación de la cuenta mientras haya errores.
- **FR-010**: Al enviar datos válidos, el sistema DEBE añadir el usuario a la misma colección en
  memoria que consulta el flujo de inicio de sesión existente. No DEBE requerir backend ni base
  de datos.
- **FR-011**: Tras crear correctamente la cuenta, el sistema DEBE mostrar una confirmación visual
  y dirigir al usuario al inicio de sesión existente. La confirmación DEBE ser visible en la
  pantalla de login al terminar la transición.
- **FR-012**: El enlace "Inicia sesión" DEBE llevar al formulario de login existente sin crear
  una cuenta.
- **FR-013**: Los campos de contraseña DEBEN ocultar el valor inicialmente y proporcionar
  controles accesibles e independientes para mostrarlo u ocultarlo.
- **FR-014**: Google y Apple DEBEN ser controles visuales sin integración externa. Al activarlos,
  DEBEN mostrar un aviso de que el registro con el proveedor estará disponible próximamente.
- **FR-015**: El enlace "términos y condiciones" DEBE permanecer visible y activable. Al no
  existir un destino legal proporcionado, su activación DEBE mostrar un aviso informativo y NO
  DEBE cambiar de página ni aceptar los términos automáticamente.
- **FR-016**: El formulario DEBE poder enviarse con Enter, impedir envíos duplicados mientras
  procesa una solicitud y mover el foco al primer campo inválido al fallar la validación.
- **FR-017**: Los errores inesperados DEBEN presentarse con un mensaje comprensible y sin
  información técnica o datos sensibles.
- **FR-018**: El sistema NO DEBE registrar contraseñas ni exponerlas en mensajes, logs, URL o
  almacenamiento persistente del navegador.

## Non Functional Requirements

- **NFR-001**: La pantalla DEBE cumplir WCAG 2.1 nivel AA: etiquetas asociadas, errores
  vinculados y anunciados por tecnologías de asistencia, mensajes de resultado anunciados,
  foco visible y contraste suficiente.
- **NFR-002**: La pantalla DEBE ser operable solo con teclado, con orden de foco lógico y
  activación estándar de los controles.
- **NFR-003**: La interfaz DEBE adaptarse desde 320 px hasta escritorio sin desplazamiento
  horizontal. En anchos reducidos, el panel de marca puede simplificarse u ocultarse, pero el
  logotipo y el formulario deben seguir disponibles. El contenido debe poder desplazarse
  verticalmente cuando la altura de la ventana no permita mostrarlo completo.
- **NFR-004**: La colección de usuarios registrados DEBE existir solo en memoria de la aplicación
  durante la sesión de ejecución. NO DEBE guardarse en cookies, `localStorage`, `sessionStorage`
  ni servicios externos.
- **NFR-005**: La validación local DEBERÍA responder en menos de un segundo desde la acción del
  usuario; el registro no debe simular una espera de red.
- **NFR-006**: La implementación DEBE respetar la Constitución del proyecto: TDD, separación de
  capas, reutilización de componentes y tokens existentes, y ausencia de dependencias externas
  innecesarias.

## Acceptance Criteria

1. **AC-001 — Diseño y contenido**
   - **Given** el usuario abre la pantalla de registro en un viewport de escritorio de
     1440 × 1024, **When** se muestra el formulario, **Then** se presenta la composición de
     Figma con el panel de marca, el titular "Comienza tu camino financiero.", el texto de
     apoyo, la tarjeta ilustrativa, el formulario "Crea tu cuenta", los campos "Nombre
     completo", "Correo electrónico", "Contraseña" y "Confirmar contraseña", los términos,
     "Crear cuenta", "o regístrate con", Google, Apple y "Inicia sesión" en ese orden visual.

2. **AC-002 — Nombre completo**
   - **Given** el campo de nombre está vacío o contiene solo espacios, **When** se abandona el
     campo o se intenta enviar, **Then** se muestra "Ingresa tu nombre completo" y el registro
     no se procesa.
   - **Given** el nombre excede 80 caracteres después de recortar espacios periféricos,
     **When** se valida, **Then** se muestra "El nombre completo no puede superar 80 caracteres".

3. **AC-003 — Correo obligatorio, formato y longitud**
   - **Given** el campo de correo está vacío o contiene solo espacios, **When** se abandona el
     campo o se intenta enviar, **Then** se muestra "Ingresa tu correo electrónico".
   - **Given** el correo no cumple un formato válido, **When** se valida, **Then** se muestra
     "Ingresa un correo electrónico válido".
   - **Given** el correo supera 254 caracteres, **When** se valida, **Then** se muestra
     "El correo electrónico no puede superar 254 caracteres".
   - **Given** el correo contiene espacios al inicio o al final, **When** se valida o se usa
     para buscar duplicados, **Then** esos espacios se eliminan antes de continuar.

4. **AC-004 — Correo ya registrado**
   - **Given** la colección en memoria contiene el correo normalizado ingresado,
     **When** el usuario intenta registrarlo de nuevo, **Then** el sistema muestra
     "Este correo ya está registrado. Inicia sesión o usa otro correo." y no crea otra cuenta.
   - **Given** el correo existente está escrito con diferente capitalización o espacios
     periféricos, **When** se compara con el correo ingresado, **Then** se considera el mismo
     correo y se rechaza el duplicado.

5. **AC-005 — Reglas de contraseña**
   - **Given** la contraseña está vacía, **When** se intenta enviar, **Then** se muestra
     "Ingresa tu contraseña".
   - **Given** la contraseña tiene menos de 8 caracteres o más de 128, **When** se valida,
     **Then** se muestra, respectivamente, "La contraseña debe tener al menos 8 caracteres" o
     "La contraseña no puede superar 128 caracteres".
   - **Given** la contraseña no incluye una mayúscula, un número o un carácter especial,
     **When** se valida, **Then** se muestra el mensaje específico correspondiente a cada regla
     incumplida y no se procesa el registro.

6. **AC-006 — Confirmación de contraseña**
   - **Given** la confirmación está vacía, **When** se intenta enviar, **Then** se muestra
     "Confirma tu contraseña".
   - **Given** la confirmación no coincide exactamente con la contraseña, **When** se valida,
     **Then** se muestra "Las contraseñas no coinciden" y el usuario no se registra.
   - **Given** la contraseña incluye espacios iniciales o finales, **When** se compara con la
     confirmación, **Then** ambos valores se comparan sin recortar ni normalizar.

7. **AC-007 — Aceptación obligatoria de términos**
   - **Given** todos los campos son válidos pero la casilla de términos no está marcada,
     **When** el usuario envía el formulario, **Then** se muestra "Debes aceptar los términos y
     condiciones para crear tu cuenta" y no se crea el usuario.
   - **Given** el usuario marca la casilla, **When** vuelve a validar el formulario,
     **Then** el requisito de aceptación queda satisfecho para ese intento.

8. **AC-008 — Envío bloqueado y foco en errores**
   - **Given** uno o más campos tienen errores o falta aceptar los términos, **When** se envía
     el formulario, **Then** no se añade ningún usuario y el foco se mueve al primer control
     inválido en el orden nombre, correo, contraseña, confirmación y términos.

9. **AC-009 — Corrección de errores**
   - **Given** se muestra un error de validación junto a un campo, **When** el usuario corrige
     ese campo para que cumpla su regla, **Then** desaparece el error correspondiente sin
     ocultar errores independientes de otros campos.

10. **AC-010 — Creación en memoria**
    - **Given** todos los campos son válidos, el correo no existe y los términos están
      aceptados, **When** el usuario presiona "Crear cuenta", **Then** el nuevo usuario se añade
      una sola vez a la colección compartida en memoria y queda disponible para autenticación en
      la misma sesión.

11. **AC-011 — Envío repetido**
    - **Given** un envío válido está en curso, **When** el usuario activa de nuevo "Crear cuenta"
      o envía con Enter, **Then** se procesa un solo registro y no se crean cuentas duplicadas.

12. **AC-012 — Login con la cuenta nueva**
    - **Given** el usuario acaba de registrarse y sigue en la misma sesión de ejecución,
      **When** inicia sesión con el correo registrado (ignorando espacios periféricos y
      mayúsculas/minúsculas) y la contraseña exacta, **Then** el flujo existente reconoce la
      cuenta y autentica al usuario.
    - **Given** se cambia la capitalización o se añaden espacios a la contraseña,
      **When** se intenta iniciar sesión, **Then** la contraseña se compara exactamente y no se
      transforma para autenticar.

13. **AC-013 — Confirmación y transición al login**
    - **Given** el registro termina correctamente, **When** se abandona la pantalla de registro,
      **Then** se muestra una confirmación visible en el login con el mensaje "Cuenta creada
      correctamente. Ahora puedes iniciar sesión." y el foco se coloca en el aviso o encabezado
      del login.

14. **AC-014 — Enlace de inicio de sesión**
    - **Given** el usuario está en el formulario de registro, **When** activa "Inicia sesión",
      **Then** se muestra el formulario de login existente y no se añade ningún usuario.

15. **AC-015 — Mostrar u ocultar contraseñas**
    - **Given** una contraseña está oculta, **When** el usuario activa su control de visibilidad,
      **Then** solo ese campo pasa a ser visible y el control anuncia "Ocultar contraseña".
    - **Given** una contraseña está visible, **When** el usuario activa de nuevo su control,
      **Then** ese campo se oculta y el control anuncia "Mostrar contraseña".
    - **Given** el usuario opera los controles con teclado o lector de pantalla, **When** cambia
      su estado, **Then** ambos controles son alcanzables, tienen nombre accesible y funcionan
      independientemente.

16. **AC-016 — Google y Apple**
    - **Given** se muestra el registro, **When** el usuario activa Google o Apple, **Then** se
      muestra el aviso correspondiente "El registro con Google estará disponible próximamente"
      o "El registro con Apple estará disponible próximamente"; no se inicia una integración ni
      se envía el formulario.

17. **AC-017 — Enlace de términos**
    - **Given** se muestra el registro, **When** el usuario activa "términos y condiciones",
      **Then** se muestra "Los términos y condiciones estarán disponibles próximamente", sin
      cambiar de página ni marcar la casilla.

18. **AC-018 — Accesibilidad y teclado**
    - **Given** el usuario navega con teclado o tecnología de asistencia, **When** recorre,
      completa y envía el formulario, **Then** cada campo tiene una etiqueta asociada, los
      errores están vinculados y se anuncian, el foco es visible y los mensajes de confirmación
      se anuncian sin depender solo del color.

19. **AC-019 — Diseño adaptable**
    - **Given** la pantalla se muestra con un ancho de viewport de 320 px o superior,
      **When** se renderiza el registro, **Then** el contenido permanece utilizable y no hay
      desplazamiento horizontal; a 320 px el formulario, los controles y el botón principal no
      quedan recortados.

20. **AC-020 — Fin de la sesión en memoria**
    - **Given** existe un usuario creado durante la sesión de ejecución, **When** se recarga o
      se cierra y vuelve a abrir la aplicación, **Then** ese usuario ya no está disponible,
      salvo que también forme parte de la configuración externa de cuentas de demostración.

## Edge Cases

- El usuario envía el formulario vacío: se muestran los errores de todos los campos obligatorios
  y de aceptación, no se añade ningún usuario y el foco va al primer error.
- El correo tiene espacios periféricos o distinta capitalización respecto de una cuenta
  existente: se detecta como duplicado.
- El usuario pega texto en cualquier campo: se acepta y se valida con las mismas reglas que el
  texto escrito.
- El nombre o correo exceden su límite, o la contraseña excede 128 caracteres: el registro se
  rechaza con el mensaje asociado y sin truncar silenciosamente el valor.
- La contraseña contiene espacios: se conservan para longitud y comparación exacta; los espacios
  por sí solos no cuentan como carácter especial.
- El usuario activa Google, Apple o el enlace legal mientras hay datos escritos: se muestra el
  aviso y se conservan los valores; no se envía el formulario.
- Se producen dos activaciones consecutivas de registro: se acepta como máximo una creación para
  el envío en curso y el correo no puede quedar duplicado.
- La aplicación se recarga o se cierra: se pierden las cuentas creadas solo en memoria; no se
  intenta recuperarlas de almacenamiento del navegador.
- El viewport es estrecho o bajo: se permite desplazamiento vertical y no se recortan campos,
  errores, términos ni acción principal.
- Una condición inesperada impide completar el registro: se informa el fallo sin exponer
  detalles técnicos ni contraseñas, y no se muestra una confirmación de éxito.

## Validation Rules

| Campo | Regla | Mensaje |
|---|---|---|
| Nombre completo | Obligatorio después de recortar espacios periféricos | "Ingresa tu nombre completo" |
| Nombre completo | Máximo 80 caracteres después de recortar espacios periféricos | "El nombre completo no puede superar 80 caracteres" |
| Correo electrónico | Obligatorio después de recortar espacios periféricos | "Ingresa tu correo electrónico" |
| Correo electrónico | Formato válido | "Ingresa un correo electrónico válido" |
| Correo electrónico | Máximo 254 caracteres | "El correo electrónico no puede superar 254 caracteres" |
| Correo electrónico | Único tras recortar espacios y convertir a minúsculas | "Este correo ya está registrado. Inicia sesión o usa otro correo." |
| Contraseña | Obligatoria, sin recortar | "Ingresa tu contraseña" |
| Contraseña | Entre 8 y 128 caracteres | "La contraseña debe tener al menos 8 caracteres" / "La contraseña no puede superar 128 caracteres" |
| Contraseña | Al menos una letra mayúscula Unicode | "Incluye al menos una letra mayúscula" |
| Contraseña | Al menos un dígito decimal | "Incluye al menos un número" |
| Contraseña | Al menos un signo de puntuación o símbolo; el espacio en blanco no cuenta | "Incluye al menos un carácter especial (por ejemplo: !, @ o #)" |
| Confirmación | Obligatoria | "Confirma tu contraseña" |
| Confirmación | Coincidencia exacta con la contraseña | "Las contraseñas no coinciden" |
| Términos | Casilla marcada explícitamente | "Debes aceptar los términos y condiciones para crear tu cuenta" |

Las reglas de correo y contraseña deben permanecer compatibles con las restricciones del login
existente. El correo se compara sin distinguir mayúsculas y espacios periféricos; la contraseña
se conserva y compara exactamente.

## Key Entities

- **Usuario registrado**: cuenta de demostración con nombre completo, correo normalizado y
  contraseña. Se mantiene en la colección compartida en memoria durante la sesión de ejecución.
- **Colección de usuarios**: fuente compartida que incluye las cuentas de demostración iniciales
  disponibles y las cuentas registradas durante la sesión; es consultada por el registro y el
  login para unicidad y autenticación.
- **Intento de registro**: valores ingresados, aceptación de términos y resultado de validación o
  creación. No se persiste como historial.

## Assumptions

- La sesión activa significa la vida de la aplicación en memoria en la pestaña actual; una
  recarga o cierre de la aplicación finaliza esa sesión de demostración.
- La colección inicial puede contener cuentas ficticias suministradas por la configuración
  existente de demostración. Las cuentas nuevas se añaden a esa misma colección sin modificar la
  configuración ni el código fuente.
- Se recorta el nombre y el correo únicamente en sus extremos; se conserva el espacio interior
  del nombre. El correo se almacena en minúsculas para comparación y login.
- Las contraseñas aceptan entre 8 y 128 caracteres; deben incluir una mayúscula Unicode, un
  dígito decimal y un signo de puntuación o símbolo Unicode. Los espacios no satisfacen la regla
  de carácter especial y nunca se eliminan.
- El diseño de referencia solo contiene el estado visual inicial. Los estados de error, envío,
  confirmación y los avisos se derivan de los requisitos de esta especificación.
- Figma no proporciona contenido ni destino para los términos; mientras no se suministre uno, el
  enlace presenta el aviso informativo definido en AC-017.
- La interfaz se presenta en español.
- Todos los datos de usuario utilizados en la demostración son ficticios; la pantalla no debe
  usarse para registrar información personal o credenciales reales.
- No se identificaron BRD ni ARD para esta funcionalidad. Si se incorporan, esta especificación
  DEBE alinearse con ellos según el Principio VI de la Constitución.

## Dependencies

- La pantalla y el caso de uso de inicio de sesión existentes, especificados en
  [la spec de login](../001-login-billetera/spec.md), deben reconocer los usuarios de la misma
  colección en memoria.
- La raíz de composición y el límite de autenticación existentes deben permitir que el registro
  y el login consulten esa colección compartida sin duplicar fuentes de datos ni invertir las
  dependencias de Clean Architecture.
- La implementación debe reutilizar los componentes, estilos y tokens ya presentes en el
  proyecto cuando satisfagan el diseño, conforme a los Principios III y IV y a las reglas 8.5 y
  8.6 de la Constitución.
- La disponibilidad del archivo de diseño de Figma es necesaria para la verificación visual.
- No se requieren servicios externos, backend, base de datos ni nuevas dependencias para esta
  demostración.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Un usuario puede completar el registro con datos válidos en menos de 2 minutos en
  una prueba de usabilidad sin asistencia.
- **SC-002**: El 100 % de los escenarios de aceptación AC-001 a AC-020 está cubierto por pruebas
  automatizadas de la funcionalidad y del flujo integrado con login.
- **SC-003**: El 100 % de los campos obligatorios y reglas de validación produce el mensaje
  definido y bloquea el registro cuando corresponde.
- **SC-004**: El 100 % de las cuentas creadas correctamente puede autenticarse en el login
  existente durante la misma sesión de ejecución.
- **SC-005**: El 100 % de los intentos con correos duplicados normalizados se rechaza y no
  incrementa el número de cuentas en memoria.
- **SC-006**: La pantalla puede completarse con teclado y no presenta incumplimientos WCAG 2.1
  AA en la auditoría de accesibilidad acordada.
- **SC-007**: A 320 px de ancho no existe desplazamiento horizontal ni controles de registro
  recortados.
- **SC-008**: Una recarga elimina las cuentas creadas durante la sesión y el análisis de
  almacenamiento confirma que no se guardaron en cookies, Web Storage ni servicios externos.

## Non Goals

- Implementar backend, API, base de datos, persistencia de cuentas o sincronización entre
  pestañas, dispositivos o sesiones.
- Proporcionar seguridad de autenticación de producción, gestión de identidad, autorización,
  verificación de correo, recuperación de contraseña, protección antifraude o bloqueo por
  intentos.
- Integrar OAuth u otros flujos reales con Google, Apple o proveedores externos.
- Definir, alojar o presentar el texto legal real de términos y condiciones; la aceptación se
  limita al estado de la casilla durante el flujo de demostración.
- Implementar funciones de billetera, pagos, transferencias, tarjetas reales ni procesamiento de
  datos financieros.
- Mantener las cuentas registradas después de cerrar o recargar la aplicación.
- Cambiar el diseño o el comportamiento existente del login más allá de lo necesario para que
  reconozca las cuentas creadas durante la sesión y presente la confirmación de registro.
