Explora el catálogo y detalles de los planes.
Contrata planes.
Consulta el historial en Mis Contrataciones.
Envía y recibe mensajes en el chat de una contratación.
Actualiza su perfil básico.
Asesor comercial

Accede al panel de asesor.
Crea, edita y elimina planes.
Ve todas las contrataciones.
Cambia el estado de las contrataciones.
Chatea con los usuarios en cada contratación.
Navegación principal
Catálogo

Listado de planes activos y filtrados.
Búsqueda por texto y filtro por segmento.
Acceso al detalle del plan.
Detalle del plan

Visualización de atributos del plan.
Acción de contratar (requiere sesión).
Si es asesor, acceso a edición del plan.
Autenticación

Login y registro de usuario.
Creación automática de perfil en Supabase al registrarse.
Persistencia de sesión.
Mis Contrataciones

Listado de contrataciones del usuario.
Filtros por estado (todas, pendiente, aprobada, rechazada).
Acceso al chat de cada contratación.
Perfil

Visualización y actualización de datos del perfil.
Módulo Asesor

Dashboard: listado de planes y accesos rápidos.
Crear/Editar plan: formulario con soporte de imagen.
Contrataciones: listado global, cambio de estado y acceso al chat.
Chats: vista de conversaciones por contratación.
Catálogo de planes
Muestra planes activos con tarjetas que incluyen precio, datos y resumen.
Filtro por segmento: básico, intermedio y premium.
Búsqueda por nombre o descripción.
Botón de acceso al detalle del plan.
Estados de UI:
Cargando: indicador de progreso.
Sin resultados: mensajes vacíos informativos.
Detalle de plan
Contenido
Campos principales: nombre, precio, datos, minutos, sms, velocidades, beneficios, descripción, segmento e imagen.
Acciones
Contratar: crea una solicitud vinculada al usuario autenticado.
Editar: visible solo para asesores.
Navegación de regreso al catálogo.
Autenticación y perfiles
Registro y login con Supabase Auth.
Creación automática del registro en la tabla perfiles al registrarse.
Perfil con rol por defecto usuario_registrado.
Actualización restringida al propio usuario.
Detección de sesión para permitir o denegar acciones protegidas.
Contrataciones
Flujo de creación
Desde el detalle del plan, el usuario elige Contratar.
Si no hay sesión, el sistema redirige al login con retorno al detalle.
Se crea una contratación con estado pendiente.
Gestión de estados
Estados: pendiente, aprobada, rechazada.
Asesores pueden actualizar el estado desde el módulo correspondiente.
Listados
Usuarios: ven únicamente sus contrataciones.
Asesores: ven todas las contrataciones.
Chat por contratación
Conversación ligada a una contratación concreta.
Participantes: usuario que contrata y asesores.
Envío y visualización de mensajes en orden cronológico.
Control de acceso:
Usuario: solo ve mensajes de sus contrataciones.
Asesor: ve todos los mensajes.
Gestión de planes para asesores
Crear plan
Formulario con campos del plan.
Subida de imagen a Supabase Storage (bucket planes-imagenes).
Almacenamiento de la URL pública de la imagen.
Editar plan
Actualización de campos.
Reemplazo de imagen con borrado del archivo previo si aplica.
Visibilidad
Campo activo define si el plan aparece en el catálogo.
Manejo de imágenes
Subida al bucket planes-imagenes.
Obtención de URL pública para mostrar en el catálogo y detalle.
Eliminación y reemplazo de imágenes al editar un plan.
Seguridad y reglas de acceso (alto nivel)
Perfiles

Lectura: usuarios autenticados.
Inserción: a través de trigger al registrar usuario en Auth.
Actualización: solo por el propietario del perfil.
Planes

Lectura: planes activos visibles en catálogo.
Inserción/actualización/eliminación: solo por asesores.
Contrataciones

Lectura:
Usuario: sus propias contrataciones.
Asesor: todas las contrataciones.
Inserción: usuario autenticado para sí mismo.
Actualización: asesores.
Mensajes de chat

Lectura:
Usuario: mensajes de sus contrataciones.
Asesor: todos los mensajes.
Inserción: por el usuario autenticado como remitente.
Estados, errores y feedback
Indicadores de carga en listados y acciones largas (por ejemplo, contratar).
Mensajes de error claros cuando:
No hay sesión para acciones protegidas.
No se pudo completar la contratación.
No se encuentran resultados en búsquedas o filtros.
Confirmaciones de éxito al crear contrataciones y al guardar planes.
Diseño y experiencia de uso
Interfaz basada en componentes de Ionic.
Headers con color principal y botones outline en color blanco para un mayor contraste.
Diseño responsivo para móvil y web.
Controles accesibles y consistentes entre vistas.
Estructura funcional de módulos
Páginas

catalogo, detalle-plan, login, registro, perfil, mis-contrataciones
asesor: dashboard, crear-plan, contrataciones, chats
chat: conversación por contratación
Servicios

auth: autenticación y sesión.
supabase: cliente centralizado y utilidades de Storage.
planes: operaciones CRUD de planes y listados de catálogo.
contrataciones: creación y consulta según rol.
chat: envío y consulta de mensajes.
