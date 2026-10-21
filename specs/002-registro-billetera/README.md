# Registro de demostración

La pantalla de Registro es parte del flujo frontend de KynWallet y comparte el gateway en memoria
con Inicio de sesión. Para probarlo, inicia la aplicación con `npm run dev`, selecciona
**Regístrate**, completa todos los campos, acepta los términos y crea una cuenta ficticia. La
aplicación vuelve a Login, muestra una confirmación y permite autenticarse con el correo
normalizado y la contraseña exacta que se registraron.

Las cuentas nuevas solo existen mientras vive la instancia de la aplicación en esa pestaña; se
pierden al recargar o cerrar. No hay backend, base de datos ni almacenamiento persistente de
cuentas nuevas. `VITE_DEMO_USERS` sirve únicamente para cargar las cuentas ficticias iniciales.

Google y Apple no autentican; muestran avisos de disponibilidad futura. El enlace de términos
tampoco navega a un destino legal. No introduzcas información personal ni contraseñas reales:
esta demostración no ofrece seguridad de autenticación de producción.

Consulta [la especificación](./spec.md), [el plan](./plan.md) y [las tareas](./tasks.md) para las
reglas, arquitectura y criterios detallados.
