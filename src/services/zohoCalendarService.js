/**
 * Servicio para interactuar con la API de Zoho Calendar
 */

const ZOHO_CLIENT_ID = import.meta.env.VITE_ZOHO_CLIENT_ID;
const ZOHO_CLIENT_SECRET = import.meta.env.VITE_ZOHO_CLIENT_SECRET;
const ZOHO_CALENDAR_BASE_URL = import.meta.env.VITE_ZOHO_CALENDAR_BASE_URL;

// Token de acceso
let accessToken = null;
let tokenExpiry = null;

/**
 * Obtiene un token de acceso para la API de Zoho Calendar
 * @returns {Promise<string>} Token de acceso
 */
async function getAccessToken() {
  // Si ya tenemos un token válido, lo devolvemos
  if (accessToken && tokenExpiry && new Date() < tokenExpiry) {
    return accessToken;
  }

  try {
    // Solicitar nuevo token usando el flujo de autorización adecuado
    // Nota: Este es un ejemplo simplificado, la autenticación real requiere 
    // el flujo OAuth completo que normalmente requiere interacción del usuario
    const response = await fetch('https://accounts.zoho.com/oauth/v2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: ZOHO_CLIENT_ID,
        client_secret: ZOHO_CLIENT_SECRET,
        grant_type: 'client_credentials',
        scope: 'ZohoCalendar.calendar.READ,ZohoCalendar.event.CREATE'
      })
    });

    if (!response.ok) {
      throw new Error(`Error al obtener token: ${response.status}`);
    }

    const data = await response.json();
    accessToken = data.access_token;
    
    // Establecer la expiración del token (usualmente 1 hora)
    const expiresIn = data.expires_in || 3600;
    tokenExpiry = new Date();
    tokenExpiry.setSeconds(tokenExpiry.getSeconds() + expiresIn);

    return accessToken;
  } catch (error) {
    console.error('Error al obtener token de acceso de Zoho:', error);
    throw error;
  }
}

/**
 * Obtiene las franjas horarias disponibles para consultas
 * @param {Date} startDate - Fecha de inicio para buscar disponibilidad
 * @param {Date} endDate - Fecha de fin para buscar disponibilidad
 * @returns {Promise<Array>} - Lista de franjas horarias disponibles
 */
export async function getAvailableSlots(startDate, endDate) {
  try {
    const token = await getAccessToken();
    
    // Formato de fecha para la API: YYYY-MM-DD
    const formatDate = (date) => date.toISOString().split('T')[0];
    const startDateStr = formatDate(startDate);
    const endDateStr = formatDate(endDate);
    
    // Obtener eventos existentes para verificar disponibilidad
    const response = await fetch(`${ZOHO_CALENDAR_BASE_URL}/calendar/events?from=${startDateStr}&to=${endDateStr}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Error al obtener eventos: ${response.status}`);
    }

    const data = await response.json();
    const existingEvents = data.events || [];
    
    // Generar franjas disponibles (ejemplo simplificado)
    // Horario de consultas: 9 AM a 5 PM, de lunes a viernes
    const availableSlots = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      // Omitir fines de semana
      const dayOfWeek = currentDate.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        // Franjas horarias cada hora
        for (let hour = 9; hour < 17; hour++) {
          const slotStart = new Date(currentDate);
          slotStart.setHours(hour, 0, 0, 0);
          
          const slotEnd = new Date(slotStart);
          slotEnd.setHours(slotStart.getHours() + 1);
          
          // Verificar si la franja está disponible (no hay eventos que se superpongan)
          const isAvailable = !existingEvents.some(event => {
            const eventStart = new Date(event.start_time);
            const eventEnd = new Date(event.end_time);
            return (slotStart < eventEnd && slotEnd > eventStart);
          });
          
          if (isAvailable) {
            availableSlots.push({
              startTime: slotStart.toISOString(),
              endTime: slotEnd.toISOString(),
              date: formatDate(currentDate),
              available: true
            });
          }
        }
      }
      
      // Avanzar al siguiente día
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return availableSlots;
  } catch (error) {
    console.error('Error al obtener franjas disponibles:', error);
    return [];
  }
}

/**
 * Agenda una consultoría en Zoho Calendar
 * @param {Object} consultationData - Datos de la consultoría
 * @returns {Promise<Object>} - Resultado de la operación
 */
export async function scheduleConsultation(consultationData) {
  try {
    const { name, email, startTime, endTime, message } = consultationData;
    
    const token = await getAccessToken();
    
    // Crear evento en el calendario
    const eventData = {
      title: `Consultoría con ${name}`,
      start_time: startTime,
      end_time: endTime,
      all_day: false,
      description: `Consultoría solicitada por: ${name}\nEmail: ${email}\nMensaje: ${message}`,
      location: 'Virtual (Google Meet / Zoom)',
      attendees: [
        {
          email: email,
          name: name,
          type: 'external'
        }
      ],
      reminder: {
        minutes: 15,
        type: 'email'
      }
    };
    
    const response = await fetch(`${ZOHO_CALENDAR_BASE_URL}/calendar/events`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(eventData)
    });
    
    if (!response.ok) {
      throw new Error(`Error al crear evento: ${response.status}`);
    }
    
    const data = await response.json();
    return {
      success: true,
      eventId: data.id,
      message: 'Consultoría agendada exitosamente'
    };
  } catch (error) {
    console.error('Error al agendar consultoría:', error);
    return {
      success: false,
      message: 'No se pudo agendar la consultoría. Por favor, intenta de nuevo más tarde.'
    };
  }
}
