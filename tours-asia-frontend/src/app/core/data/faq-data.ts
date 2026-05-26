export interface FaqEntry {
  id: string;
  label: string;
  keywords: string[];
  answer: string;
}

export const FAQ_ENTRIES: FaqEntry[] = [
  {
    id: 'reservar',
    label: '¿Cómo reservo un tour?',
    keywords: [
      'reservar', 'reserva', 'reservación', 'comprar', 'contratar', 'agendar',
      'cómo reservo', 'hacer reserva', 'pasos', 'proceso',
    ],
    answer:
      'Para reservar un tour:\n\n' +
      '1. Entra a **Tours** y elige el que te interese.\n' +
      '2. Pulsa **Reservar ahora** (necesitas iniciar sesión o registrarte).\n' +
      '3. Completa fecha, horario, número de adultos y niños.\n' +
      '4. Ingresa tus datos de contacto y confirma.\n\n' +
      'Recibirás la reserva en estado *pendiente* hasta que el equipo la confirme.',
  },
  {
    id: 'login',
    label: '¿Cómo inicio sesión?',
    keywords: [
      'iniciar sesión', 'login', 'loguear', 'entrar', 'cuenta', 'registrarme',
      'registro', 'crear cuenta', 'contraseña', 'acceso',
    ],
    answer:
      'Puedes **iniciar sesión** desde el menú superior o en `/login`.\n\n' +
      'Si aún no tienes cuenta, usa **Registrarse** (`/registro`) con tu correo y contraseña.\n\n' +
      'Las reservas y **Mis reservas** solo están disponibles con sesión iniciada.',
  },
  {
    id: 'mis-reservas',
    label: '¿Dónde veo mis reservas?',
    keywords: [
      'mis reservas', 'ver reserva', 'estado', 'pendiente', 'confirmada',
      'cancelada', 'rechazada', 'historial', 'seguimiento',
    ],
    answer:
      'Con sesión iniciada, abre **Mis reservas** en el menú (`/mis-reservas`).\n\n' +
      'Ahí verás fecha, tour, total y estado: **pendiente**, **confirmada**, **rechazada** o **cancelada**.\n' +
      'Puedes abrir cada reserva para ver el detalle.',
  },
  {
    id: 'cancelar',
    label: '¿Puedo cancelar una reserva?',
    keywords: [
      'cancelar', 'cancelación', 'anular', 'devolver', 'reembolso', 'devolución',
    ],
    answer:
      'Las cancelaciones se gestionan con el equipo de Tours Asia.\n\n' +
      'Revisa el estado en **Mis reservas**. Si necesitas cancelar, contacta soporte indicando el número de reserva y tu correo.\n' +
      'Las políticas de reembolso pueden variar según la fecha del tour.',
  },
  {
    id: 'pago',
    label: '¿Cómo funciona el pago?',
    keywords: [
      'pago', 'pagar', 'precio', 'costo', 'tarjeta', 'efectivo', 'total',
      'cuánto cuesta', 'dinero', 'factura',
    ],
    answer:
      'El **precio por persona** aparece en la ficha de cada tour. En el checkout se calcula el total según adultos y niños.\n\n' +
      'La pantalla de reserva muestra **Pago seguro**; al confirmar, tu solicitud queda registrada y el equipo validará el pago según el proceso acordado.',
  },
  {
    id: 'idiomas',
    label: '¿En qué idiomas son los tours?',
    keywords: [
      'idioma', 'idiomas', 'español', 'inglés', 'guía', 'hablan', 'traducción',
    ],
    answer:
      'Muchos tours se realizan en **español** con guías locales.\n\n' +
      'Al reservar puedes elegir idioma preferido (español, inglés, portugués, japonés o chino, según disponibilidad del tour).\n' +
      'Los detalles de cada tour están en su página de descripción.',
  },
  {
    id: 'ninos',
    label: '¿Puedo llevar niños?',
    keywords: [
      'niños', 'niño', 'menores', 'familia', 'bebé', 'infantil', 'adultos',
    ],
    answer:
      'Sí. En el paso de reserva puedes indicar **adultos** y **niños**.\n\n' +
      'El total se calcula con esas cantidades. Revisa en la ficha del tour qué incluye el precio para menores.',
  },
  {
    id: 'horarios',
    label: '¿Qué horarios hay?',
    keywords: [
      'horario', 'hora', 'horarios', 'mañana', 'tarde', 'franja', 'cuándo',
      'punto de encuentro', 'meeting', 'encuentro',
    ],
    answer:
      'Cada tour tiene **franjas horarias** disponibles (por ejemplo 09:00 AM). Las verás al reservar en el selector de horario.\n\n' +
      'El **punto de encuentro** también aparece en la información del tour antes de confirmar.',
  },
  {
    id: 'incluye',
    label: '¿Qué incluye el tour?',
    keywords: [
      'incluye', 'incluido', 'no incluye', 'equipaje', 'comida', 'transporte',
      'entradas', 'servicios',
    ],
    answer:
      'En la página de detalle de cada tour encontrarás listas de **qué incluye** y **qué no incluye** (transporte, entradas, comidas, etc.).\n\n' +
      'Revisa esa sección antes de reservar para evitar sorpresas.',
  },
  {
    id: 'destinos',
    label: '¿Qué destinos ofrecen?',
    keywords: [
      'destino', 'destinos', 'país', 'países', 'asia', 'dónde viajan', 'lugares',
      'tokio', 'bangkok', 'bali', 'vietnam',
    ],
    answer:
      'En **Inicio** verás destinos populares de Asia. Cada destino agrupa varios **tours**.\n\n' +
      'Entra a un destino o visita `/tours` para explorar duración, precio y valoraciones.',
  },
  {
    id: 'contacto',
    label: '¿Cómo contacto soporte?',
    keywords: [
      'contacto', 'soporte', 'ayuda', 'teléfono', 'correo', 'email', 'whatsapp',
      'hablar', 'humano', 'agente',
    ],
    answer:
      'Para casos que el asistente no resuelva, escribe a **soporte@toursasia.com** con tu nombre, correo y número de reserva (si aplica).\n\n' +
      'Te responderemos lo antes posible en horario laboral.',
  },
];

export const FAQ_SUGGESTIONS = FAQ_ENTRIES.map((e) => ({
  id: e.id,
  label: e.label,
}));

export const ASSISTANT_WELCOME =
  '¡Hola! Soy el asistente de **Tours Asia**. Puedo ayudarte con preguntas frecuentes sobre reservas, pagos, idiomas y más.\n\n' +
  'Elige una opción abajo o escribe tu pregunta.';

export const ASSISTANT_FALLBACK =
  'No encontré una respuesta exacta para eso. Prueba con otra redacción o elige una de las preguntas sugeridas.\n\n' +
  'También puedes escribir palabras como *reservar*, *cancelar*, *pago* o *mis reservas*.';
