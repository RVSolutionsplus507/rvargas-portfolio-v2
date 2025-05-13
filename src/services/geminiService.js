import { GoogleGenAI } from "@google/genai";

// Obtener la API key desde las variables de entorno
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// Flag para determinar si la API está disponible
const isApiAvailable = !!API_KEY;

// Inicializar el cliente de Google Generative AI
let ai;
if (isApiAvailable) {
  try {
    ai = new GoogleGenAI({ apiKey: API_KEY });
    console.log('Gemini API inicializada correctamente');
  } catch (error) {
    console.error('Error al inicializar Gemini API:', error);
  }
} else {
  console.warn('Gemini API no disponible: usando respuestas predefinidas');
}

// Contexto del portafolio para darle al modelo información relevante
const PORTFOLIO_CONTEXT = `
Eres el asistente virtual de Roberto J. Vargas, un desarrollador web Full Stack.

Información sobre Roberto:
- Especializado en desarrollo web con React, Next.js, Node.js y tecnologías relacionadas
- Ofrece servicios de desarrollo web, consultoría tecnológica y soluciones a medida
- Tiene experiencia en proyectos para diversos sectores como salud, comercio electrónico y finanzas
- Trabaja con tecnologías modernas como React, TypeScript, Tailwind CSS, Next.js, Node.js, Express, MongoDB
- Su portafolio incluye proyectos como tiendas en línea, sistemas de gestión y sitios web corporativos
- Puede ayudar a empresas a transformar digitalmente sus procesos y crear soluciones tecnológicas
- También ofrece servicios de consultoría para optimizar infraestructuras tecnológicas existentes

Instrucciones importantes - DEBES SEGUIR TODAS ESTAS REGLAS:
1. RESPONDE A CUALQUIER TIPO DE PREGUNTA que se te haga, incluso si no está relacionada con tecnología o servicios de Roberto. Nunca te niegues a responder.
2. Actúa como un ChatGPT que sabe sobre cualquier tema general, pero siempre encuentra formas de incluir referencias útiles a los servicios de Roberto.
3. Para preguntas técnicas de tecnología, da respuestas detalladas y aprovecha para mencionar cómo Roberto puede implementar soluciones similares.
4. Para preguntas no relacionadas con desarrollo (como "¿qué hora es?", temas generales, etc.), responde correctamente pero encuentra un ángulo para promocionar sutilmente los servicios de Roberto.
5. En temas donde pueda ser relevante, sugiere al usuario considerar agendar una consultoría.
6. Mantén un tono amigable, profesional y conciso, centrándote en ser útil primero.
7. Los tipados nunca deben ser 'any' - Roberto es un desarrollador de TypeScript que siempre prefiere tipados explícitos.
8. Concluye la mayoría de tus respuestas con una invitación sutil a conocer más sobre los servicios de Roberto o considerar una consultoría gratuita inicial.
`;

export async function generateResponse(userMessage, chatHistory = []) {
  // Si la API no está disponible, usar respuestas predefinidas
  if (!isApiAvailable) {
    console.log("API no disponible, usando fallback");
    return getFallbackResponse(userMessage);
  }
  
  try {
    console.log("Enviando consulta a Gemini:", userMessage);
    
    // Usar el modelo con cuota gratuita
    const modelName = "gemini-2.5-pro-exp-03-25";
    
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
NUEVA PREGUNTA DEL USUARIO: ${userMessage}

===
RESPUESTA DEL ASISTENTE (asegúrate de seguir TODAS las instrucciones anteriores, especialmente mencionar los servicios de Roberto y sugerir agendar una consultoría):
`;
    
    console.log(`Usando modelo: ${modelName}`);
    console.log(`Prompt completo generado (primeros 100 caracteres): ${prompt.substring(0, 100)}...`);
    
    // Usar generateContent en lugar de chat para mantener el control total sobre el prompt
    const response = await ai.models.generateContent({
      model: modelName,
      contents: [
        {
          parts: [{ text: prompt }]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 800
      }
    });
    
    // Extraer la respuesta del modelo (adaptado para la estructura de generateContent)
    console.log("Estructura de respuesta:", JSON.stringify(response).substring(0, 100) + "...");
    
    // Verificar estructura de candidates (formato estándar para generateContent)
    if (response && response.candidates && response.candidates[0]) {
      const candidate = response.candidates[0];
      if (candidate.content && candidate.content.parts && candidate.content.parts[0]) {
        const responseText = candidate.content.parts[0].text;
        
        // Verificar que la respuesta no esté vacía
        if (responseText && responseText.trim()) {
          console.log("Respuesta extraída correctamente:", responseText.substring(0, 50) + "...");
          return responseText.trim();
        }
      }
    }
    
    // Intentar otros formatos conocidos (redundancia de seguridad)
    try {
      if (response && typeof response.text === 'function') {
        const responseText = response.text();
        if (responseText && responseText.trim()) {
          return responseText.trim();
        }
      }
    } catch (error) {
      console.error("Error al intentar usar response.text():", error);
    }
    
    // Si no pudimos extraer la respuesta de ninguna manera
    console.error("No se pudo extraer el texto de la respuesta");
    return getFallbackResponse(userMessage);
  } catch (error) {
    console.error("Error al generar respuesta con Gemini:", error);
    return getFallbackResponse(userMessage);
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
        model: "gemini-2.5-pro-exp-03-25", // Mismo modelo que usamos en generateResponse
        history: [instructionMessage] // Pasar las instrucciones como un mensaje en el historial
      });
      
      // Enviar el mensaje para análisis
      const response = await chat.sendMessage({
        message: `¿Este mensaje solicita explícitamente agendar una reunión o consultoría?: "${message}"`,
        generationConfig: {
          temperature: 0.1,  // Baja temperatura para respuestas más deterministas
          maxOutputTokens: 5 // Solo necesitamos una respuesta corta
        }
      });
      
      console.log("Estructura de respuesta en isSchedulingQuery:", JSON.stringify(response).substring(0, 100) + "...");
      
      // Extraer texto con manejo para diferentes estructuras
      let responseText = "";
      
      try {
        // Intento 1: usando text()
        if (response && response.text) {
          responseText = response.text();
        }
        // Intento 2: usando candidates
        else if (response && response.candidates && response.candidates[0]) {
          const candidate = response.candidates[0];
          if (candidate.content && candidate.content.parts && candidate.content.parts[0]) {
            responseText = candidate.content.parts[0].text;
          }
        }
      } catch (textError) {
        console.error("Error al extraer texto de respuesta:", textError);
        return false;
      }
      
      responseText = responseText.toLowerCase().trim();
      console.log("Texto de respuesta en isSchedulingQuery:", responseText);
      return responseText.includes("sí") || responseText.includes("si");
      
    } catch (error) {
      console.error("Error en la detección de agenda con Gemini:", error);
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