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

const PORTFOLIO_CONTEXT = `
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

export async function generateResponse(userMessage, chatHistory = []) {
  // Si la API no está disponible, usar respuestas predefinidas
  if (!isApiAvailable) {
    logger.log("API no disponible, usando fallback");
    return getFallbackResponse(userMessage);
  }

  const sanitizedMessage = sanitizeUserInput(userMessage);

  try {
    logger.log("Enviando consulta a Gemini");
    
    const modelName = "gemini-2.0-flash";
    
    // Construir un prompt completo que incluya el contexto del portfolio y la pregunta
    // Este enfoque es más directo y asegura que el modelo considere el contexto
    const prompt = `
${PORTFOLIO_CONTEXT}

===
HISTORIAL DE CONVERSACIÓN:
${chatHistory.slice(-3).map(msg =>
  `${msg.type === "user" ? "Usuario" : "Asistente"}: ${msg.content}`
).join('\n')}

===
PREGUNTA DEL USUARIO: ${sanitizedMessage}

===
RESPUESTA:
`;
    
    logger.log(`Usando modelo: ${modelName}`);
    
    // Usar generateContent en lugar de chat para mantener el control total sobre el prompt
    const historyText = chatHistory.slice(-4).map(msg =>
      `${msg.type === "user" ? "Usuario" : "Ambar"}: ${msg.content}`
    ).join('\n');

    const response = await ai.models.generateContent({
      model: modelName,
      contents: sanitizedMessage,
      config: {
        systemInstruction: `${PORTFOLIO_CONTEXT}\n\nHistorial reciente:\n${historyText}`,
        temperature: 0.7,
        maxOutputTokens: 800,
      },
    });

    const text = response.text;
    if (text && text.trim()) return text.trim();

    logger.error("Respuesta vacía de Gemini");
    return getFallbackResponse(sanitizedMessage);
  } catch (error) {
    logger.error("Error al generar respuesta con Gemini:", error);
    return getFallbackResponse(sanitizedMessage);
  }
}

export async function isSchedulingQuery(message) {
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

function getFallbackResponse(userMessage) {
  const lowerMessage = userMessage.toLowerCase();
  
  // Objeto con categorías de preguntas y sus respuestas
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