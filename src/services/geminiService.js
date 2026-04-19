import { GoogleGenAI } from "@google/genai";

const isDev = import.meta.env.DEV;
const logger = {
  log: (...args) => isDev && console.log(...args),
  error: (...args) => isDev && console.error(...args),
  warn: (...args) => isDev && console.warn(...args),
};

function sanitizeUserInput(input) {
  return String(input)
    .slice(0, 500)
    .replace(/[<>]/g, "")
    .trim();
}

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// Flag para determinar si la API está disponible
const isApiAvailable = !!API_KEY;

// Inicializar el cliente de Google Generative AI
let ai;
if (isApiAvailable) {
  try {
    ai = new GoogleGenAI({ apiKey: API_KEY });
    logger.log('Gemini API inicializada correctamente');
  } catch (error) {
    logger.error('Error al inicializar Gemini API:', error);
  }
} else {
  logger.warn('Gemini API no disponible: usando respuestas predefinidas');
}

// Contexto del portfolio según el idioma del visitante
function getPortfolioContext(language = 'es') {
  if (language.startsWith('en')) {
    return `
You are the virtual assistant of RVSolutions Plus, Roberto J. Vargas's technology company.

## About Roberto J. Vargas and RVSolutions Plus
- Founder and Tech Lead of RVSolutions Plus, based in Panama City, Panama
- Full Stack Developer with over 7 years of experience in web development
- Specialized in React, Next.js, Node.js, TypeScript, Tailwind CSS, PostgreSQL, MongoDB
- Builds modern applications with clean architectures, SOLID principles, and best practices
- Has worked on projects in e-commerce, fintech, healthcare, education, and government sectors
- Services offered: custom web development, technology consulting, technical leadership, training/mentoring
- Email: rvargas@rv-solutions.net

## Your role
- You are the first point of contact for visitors of Roberto's portfolio
- Your main goal is to assist the visitor and, when relevant, connect them with RVSolutions Plus services
- Be concise, professional, and direct — visitors value clear answers

## Behavior rules
1. Respond ONLY about: Roberto's services, web technology, software development, IT consulting, and consultation scheduling
2. For out-of-scope questions (weather, politics, unrelated personal topics), kindly redirect toward what you can help with
3. For technical questions, provide useful and accurate answers
4. Suggest scheduling a consultation when the visitor shows interest in hiring services
5. Keep responses under 200 words — concise and valuable
6. Tone: professional, friendly, without being commercially aggressive
`;
  }

  // Contexto en español (idioma por defecto)
  return `
Eres el asistente virtual de RVSolutions Plus, la empresa de tecnología de Roberto J. Vargas.

## Sobre Roberto J. Vargas y RVSolutions Plus
- Fundador y Tech Lead de RVSolutions Plus, basado en Ciudad de Panamá, Panamá
- Full Stack Developer con más de 7 años de experiencia en desarrollo web
- Especializado en React, Next.js, Node.js, TypeScript, Tailwind CSS, PostgreSQL, MongoDB
- Construye aplicaciones modernas con arquitecturas limpias, SOLID, y mejores prácticas
- Ha trabajado en proyectos de e-commerce, fintech, salud, educación y gobierno
- Ofrece: desarrollo web a medida, consultoría tecnológica, liderazgo técnico, formación/mentoring
- Email: rvargas@rv-solutions.net

## Tu rol
- Eres el primer punto de contacto de los visitantes del portafolio de Roberto
- Tu objetivo principal es ayudar al visitante y, cuando sea relevante, conectarlo con los servicios de RVSolutions Plus
- Sé conciso, profesional y directo — los visitantes valoran respuestas claras

## Reglas de comportamiento
1. Responde ÚNICAMENTE sobre: servicios de Roberto, tecnología web, desarrollo de software, consultoría IT, y agendamiento de consultorías
2. Para preguntas fuera de scope (clima, política, temas personales no relacionados), redirige amablemente hacia lo que puedes ayudar
3. Para preguntas técnicas, da respuestas útiles y precisas
4. Sugiere agendar una consultoría cuando el visitante muestre interés en contratar servicios
5. Mantén respuestas bajo 200 palabras — conciso y de valor
6. Tono: profesional, amigable, sin ser comercialmente agresivo
`;
}

export async function generateResponse(userMessage, chatHistory = [], language = 'es') {
  const portfolioContext = getPortfolioContext(language);

  // Si la API no está disponible, usar respuestas predefinidas
  if (!isApiAvailable) {
    logger.log("API no disponible, usando fallback");
    return getFallbackResponse(userMessage, language);
  }

  const sanitizedMessage = sanitizeUserInput(userMessage);

  try {
    logger.log("Enviando consulta a Gemini");

    const modelName = "gemini-2.0-flash";

    // Construir un prompt completo que incluya el contexto del portfolio y la pregunta
    // Este enfoque es más directo y asegura que el modelo considere el contexto
    const isEnglish = language.startsWith('en');
    const historyLabel = isEnglish ? 'CONVERSATION HISTORY' : 'HISTORIAL DE CONVERSACIÓN';
    const userLabel = isEnglish ? 'User' : 'Usuario';
    const assistantLabel = isEnglish ? 'Assistant' : 'Asistente';
    const questionLabel = isEnglish ? 'USER QUESTION' : 'PREGUNTA DEL USUARIO';

    const prompt = `
${portfolioContext}

===
${historyLabel}:
${chatHistory.slice(-3).map(msg =>
  `${msg.type === "user" ? userLabel : assistantLabel}: ${msg.content}`
).join('\n')}

===
${questionLabel}: ${sanitizedMessage}

===
RESPONSE:
`;

    logger.log(`Usando modelo: ${modelName}`);

    // Usar generateContent en lugar de chat para mantener el control total sobre el prompt
    const historyText = chatHistory.slice(-4).map(msg =>
      `${msg.type === "user" ? userLabel : "Ambar"}: ${msg.content}`
    ).join('\n');

    const response = await ai.models.generateContent({
      model: modelName,
      contents: sanitizedMessage,
      config: {
        systemInstruction: `${portfolioContext}\n\n${historyLabel}:\n${historyText}`,
        temperature: 0.7,
        maxOutputTokens: 800,
      },
    });

    const text = response.text;
    if (text && text.trim()) return text.trim();

    logger.error("Respuesta vacía de Gemini");
    return getFallbackResponse(sanitizedMessage, language);
  } catch (error) {
    logger.error("Error al generar respuesta con Gemini:", error);
    return getFallbackResponse(sanitizedMessage, language);
  }
}

export async function isSchedulingQuery(message, language = 'es') {
  const lowerMessage = message.toLowerCase();

  // Verificaciones rápidas sin necesidad de usar la API

  // 1. Si es una pregunta (contiene signo de interrogación), probablemente no es una solicitud de agenda
  if (message.includes('?')) {
    return false;
  }

  // 2. Detectores rápidos de frases que claramente indican una solicitud de agenda
  const schedulingPhrases = [
    'quiero agendar', 'quisiera una cita', 'necesito una consulta',
    'me gustaría reservar', 'programar una reunión', 'contacta', 'agenda'
  ];

  // Frases en inglés cuando el idioma es inglés
  if (language.startsWith('en')) {
    schedulingPhrases.push(
      'i want to schedule',
      'i need a consultation',
      'book a meeting',
      'schedule a call',
      'schedule a consultation',
      'book a consultation'
    );
  }

  if (schedulingPhrases.some(phrase => lowerMessage.includes(phrase))) {
    return true;
  }

  // 3. Palabras clave que indican que definitivamente NO es una solicitud de agenda
  const nonSchedulingTerms = [
    'javascript', 'typescript', 'react', 'código', 'programación',
    'qué es', 'cómo funciona', 'cuánto cuesta', 'precio', 'explain', 'explica'
  ];

  if (nonSchedulingTerms.some(term => lowerMessage.includes(term))) {
    return false;
  }

  // Si no se pudo determinar con las reglas rápidas y la API está disponible, usar Gemini
  if (isApiAvailable) {
    try {
      // Instrucción explícita para la tarea de detección de agenda
      const instructionMessage = {
        role: "user",
        parts: [{ text: `INSTRUCCIONES: Tu única tarea es determinar si un mensaje contiene una solicitud explícita para agendar una reunión o consultoría. Responde solo con "sí" o "no". Las preguntas sobre disponibilidad, servicios o información general NO son solicitudes de agenda.` }]
      };

      // Crear una sesión de chat específica para esta consulta
      const chat = ai.chats.create({
        model: "gemini-2.0-flash",
        history: [instructionMessage]
      });

      // Enviar el mensaje para análisis
      const response = await chat.sendMessage({
        message: `¿Este mensaje solicita explícitamente agendar una reunión o consultoría?: "${message}"`,
        generationConfig: {
          temperature: 0.1,  // Baja temperatura para respuestas más deterministas
          maxOutputTokens: 5 // Solo necesitamos una respuesta corta
        }
      });


      // Extraer texto con manejo para diferentes estructuras
      let responseText = "";

      try {
        // v1.x: response.text es string
        if (response && typeof response.text === 'string') {
          responseText = response.text;
        } else if (response?.candidates?.[0]?.content?.parts?.[0]?.text) {
          responseText = response.candidates[0].content.parts[0].text;
        }
      } catch (textError) {
        logger.error("Error al extraer texto de respuesta:", textError);
        return false;
      }

      responseText = responseText.toLowerCase().trim();
      return responseText.includes("sí") || responseText.includes("si");

    } catch (error) {
      logger.error("Error en la detección de agenda con Gemini:", error);
      // Método de fallback - verificación básica basada en palabras clave
      return basicSchedulingCheck(lowerMessage);
    }
  } else {
    // Si la API no está disponible, usar verificación básica
    return basicSchedulingCheck(lowerMessage);
  }
}


function basicSchedulingCheck(lowerMessage) {
  const schedulingKeywords = ['agenda', 'cita', 'consulta', 'reunión', 'consultoría'];
  const intentPhrases = ['quiero', 'quisiera', 'necesito', 'busco', 'me gustaría'];

  // Debe contener al menos una palabra clave de agenda y una frase de intención
  const hasKeyword = schedulingKeywords.some(word => lowerMessage.includes(word));
  const hasIntent = intentPhrases.some(phrase => lowerMessage.includes(phrase));

  return hasKeyword && hasIntent;
}

function getFallbackResponse(userMessage, language = 'es') {
  const lowerMessage = userMessage.toLowerCase();
  const isEnglish = language.startsWith('en');

  if (isEnglish) {
    // Respuestas predefinidas en inglés
    const responses = {
      tech: {
        keywords: ['javascript', 'typescript', 'react', 'node', 'api', 'frontend', 'backend', 'code', 'programming', 'development', 'web'],
        response: "As a fullstack developer with over 7 years of experience, Roberto specializes in modern technologies like JavaScript, TypeScript, React, Node.js, and cloud architectures. He uses strict TypeScript typing to ensure robust and maintainable applications. If you need help with your project or have technical questions, consider scheduling a free initial consultation."
      },
      services: {
        keywords: ['price', 'cost', 'rate', 'service', 'offer', 'do you', 'consulting'],
        response: "Roberto offers fullstack web development services, technology consulting, and training/mentoring for developers. Prices vary depending on the project scope, always maintaining competitive rates. The first consultation is completely free and with no commitment — ideal for discussing your project and getting a personalized quote."
      },
      experience: {
        keywords: ['experience', 'years', 'worked', 'education', 'training', 'studied', 'projects', 'portfolio'],
        response: "With over 7 years in web development, Roberto has worked for startups, established companies, and as a freelancer in various sectors. He holds a Systems Engineering degree and stays up to date with the latest technologies. His experience includes frontend, backend, system architecture, and technical leadership. His portfolio includes e-commerce, fintech, education, and healthcare projects."
      },
      process: {
        keywords: ['process', 'methodology', 'agile', 'scrum', 'work', 'collaborate', 'project', 'timeline', 'time'],
        response: "Roberto follows agile methodologies adapted to each client, with constant communication and incremental deliveries. The typical process includes: 1) Free initial consultation to understand needs, 2) Detailed proposal with scope and estimates, 3) Iterative development with frequent reviews, and 4) Post-launch support. Each project is unique, so the methodology adapts to your specific needs."
      },
      contact: {
        keywords: ['contact', 'email', 'phone', 'available', 'availability', 'schedule', 'meeting'],
        response: "Roberto is available for consultations Monday through Friday with flexible hours. You can schedule a meeting directly using the form on this page. If you prefer to reach out by email first, you can use the contact section. All initial consultations are free and with no commitment."
      }
    };

    for (const category in responses) {
      if (responses[category].keywords.some(keyword => lowerMessage.includes(keyword))) {
        return responses[category].response;
      }
    }

    return `Thank you for your question. Roberto is a fullstack web developer specialized in JavaScript/TypeScript (with strict typing), React, Node.js, and other modern technologies. He offers development, consulting, and training services. For more detailed information, I recommend scheduling a free initial consultation where you can speak directly with him and get all your questions answered.`;
  }

  // Respuestas predefinidas en español (comportamiento original)
  const responses = {
    // Preguntas sobre tecnologías
    tech: {
      keywords: ['javascript', 'typescript', 'react', 'node', 'api', 'frontend', 'backend', 'código', 'programación', 'desarrollo', 'web'],
      response: "Como desarrollador fullstack con más de 7 años de experiencia, Roberto se especializa en tecnologías modernas como JavaScript, TypeScript, React, Node.js y arquitecturas cloud. Utiliza tipados estrictos en TypeScript para garantizar aplicaciones robustas y mantenibles. Si necesitas ayuda con tu proyecto o tienes preguntas técnicas, considera agendar una consultoría gratuita inicial."
    },

    // Preguntas sobre servicios y precios
    services: {
      keywords: ['precio', 'costo', 'tarifa', 'servicio', 'ofrece', 'haces', 'consultoría'],
      response: "Roberto ofrece servicios de desarrollo web fullstack, consultoría tecnológica, y formación/mentoring para desarrolladores. Los precios varían según el alcance del proyecto, pero siempre manteniendo tarifas competitivas. La primera consultoría es totalmente gratuita y sin compromiso, ideal para discutir tu proyecto y recibir un presupuesto personalizado."
    },

    // Preguntas sobre experiencia y formación
    experience: {
      keywords: ['experiencia', 'años', 'trabajado', 'educación', 'formación', 'estudi', 'proyectos', 'portfolio'],
      response: "Con más de 7 años en desarrollo web, Roberto ha trabajado para startups, empresas consolidadas y como freelance en diversos sectores. Es Ingeniero de Sistemas y se mantiene actualizado con las últimas tecnologías. Su experiencia incluye desarrollo frontend, backend, arquitectura de sistemas y liderazgo técnico. Su portfolio incluye proyectos de e-commerce, fintech, educación y salud."
    },

    // Preguntas sobre procesos y metodología
    process: {
      keywords: ['proceso', 'metodología', 'agile', 'scrum', 'trabajas', 'colaborar', 'proyecto', 'timeline', 'tiempo'],
      response: "Roberto sigue metodologías ágiles adaptadas a cada cliente, con comunicación constante y entregas incrementales. El proceso típico incluye: 1) Consultoría inicial gratuita para entender necesidades, 2) Propuesta detallada con alcance y estimaciones, 3) Desarrollo iterativo con revisiones frecuentes, y 4) Soporte posterior al lanzamiento. Cada proyecto es único, por lo que la metodología se adapta a tus necesidades específicas."
    },

    // Respuesta para cuestiones de contacto o agenda
    contact: {
      keywords: ['contacto', 'email', 'teléfono', 'disponible', 'disponibilidad', 'horario', 'reunión'],
      response: "Roberto está disponible para consultorías de lunes a viernes en horarios flexibles. Puedes agendar directamente una reunión usando el formulario en esta página. Si prefieres comunicarte primero por correo, puedes usar la sección de contacto. Todas las consultas iniciales son gratuitas y sin compromiso."
    }
  };

  // Verificar cada categoría y devolver la primera respuesta que coincida
  for (const category in responses) {
    if (responses[category].keywords.some(keyword => lowerMessage.includes(keyword))) {
      return responses[category].response;
    }
  }

  // Respuesta genérica si no hay coincidencias específicas
  return `Gracias por tu pregunta. Roberto es un desarrollador web fullstack especializado en JavaScript/TypeScript (con tipados estrictos), React, Node.js y otras tecnologías modernas. Ofrece servicios de desarrollo, consultoría y formación. Para obtener información más detallada, te recomiendo agendar una consultoría gratuita inicial donde podrás hablar directamente con él y resolver todas tus dudas.`;
}
