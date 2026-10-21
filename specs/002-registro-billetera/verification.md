# Verificación de aceptación — Registro

**Fecha**: 2026-10-20  
**Alcance**: verificación final de Phase 7; no incluye la implementación de navegación de fases
posteriores.

## Resultado por criterios

| Criterios | Resultado | Evidencia |
| --- | --- | --- |
| AC-001 | Aprobado | Frame Figma `31:2` comparado en 1440 × 1024; pruebas de pantalla y contenido de marca en `RegistrationScreen.test.tsx`. |
| AC-002–AC-009 | Aprobado | Pruebas de validación de dominio y formulario; envío vacío enfoca el primer campo, corrige errores de forma independiente y no delega si hay errores. |
| AC-010–AC-012 | Aprobado | Pruebas de integración de `App` registran y autentican por la misma instancia; correo normalizado y contraseña exacta. |
| AC-011 | Aprobado | Pruebas de formulario/reducer bloquean la acción mientras la creación está pendiente; el gateway mantiene unicidad. |
| AC-013–AC-014 | Aprobado | Pruebas de navegación local, confirmación anunciada y foco en el aviso; volver a Login no registra ni recarga. |
| AC-015 | Aprobado | Pruebas de controles de contraseña independientes, ocultos al inicio y con nombres accesibles. |
| AC-016–AC-018 | Aprobado | Axe en Login, Registro, errores, avisos y confirmación; errores vinculados con `aria-describedby`, roles de anuncio y controles etiquetados. |
| AC-019 | Aprobado | Revisión en navegador a 320, 480, 960, 1280 y 1440 px: formulario y acción principal visibles, sin desbordamiento horizontal. |
| AC-020 | Aprobado | Prueba del gateway confirma que una instancia nueva no conserva usuarios creados por la anterior. |

## Recorrido reproducible

1. Ejecutar `npm run dev` y abrir la URL local.
2. Seleccionar **Regístrate**; verificar que la URL no cambie.
3. Intentar **Crear cuenta** vacío; verificar errores y foco en **Nombre completo**.
4. Completar los campos con datos ficticios válidos, aceptar términos y crear la cuenta.
5. Verificar que aparece en Login el aviso “Cuenta creada correctamente. Ahora puedes iniciar
   sesión.” y que recibe el foco.
6. Iniciar sesión con el correo registrado (variando mayúsculas/espacios periféricos) y la
   contraseña exacta; comprobar la bienvenida. Cambiar la contraseña y verificar el error genérico.
7. Volver a Registro y reintentar el mismo correo; comprobar el error de duplicidad y que no hay
   confirmación de éxito.
8. Activar Google, Apple y términos; comprobar avisos sin mutación de campos ni envío.
9. Repetir inspección en los anchos indicados y recargar para confirmar el límite de sesión en
   memoria.

## Controles automatizados

- `npm run test:coverage`: 20 archivos, 177 pruebas aprobadas; cobertura de statements 95,78 %,
  branches 92,85 %, functions 100 % y lines 97,74 %.
- `npm run typecheck`, `npm run lint` y `npm run build`: aprobados.
- `npm run audit:deps`: aprobado; 0 vulnerabilidades.
- `npm run audit:licenses` y `npm run scan:secrets`: aprobados.
- Prettier pasa para los archivos modificados en Phase 7. El chequeo global `npm run format`
  falla en 48 archivos no modificados en esta fase; por ello, `npm run verify` no termina
  correctamente. No se reformatearon archivos ajenos al alcance.
