import emailjs from '@emailjs/browser';

const emailjsInit = () => {
  const publicKey = import.meta.env.VITE_EMAIL_USER_ID;
  
  if (publicKey) {
    try {
      emailjs.init(publicKey);
      return true;
    } catch (error) {
      console.error('Error al inicializar EmailJS:', error);
      return false;
    }
  } else {
    console.error('No se pudo inicializar EmailJS: clave pública no disponible');
    return false;
  }
};

// Inicializar EmailJS
const initialized = emailjsInit();

export const sendCustomEmail = async (data) => {
  // Obtener variables de entorno directamente
  const serviceId = import.meta.env.VITE_EMAIL_SERVICE_ID;
  const templateId = import.meta.env.VITE_EMAIL_TEMPLATE_ID;
  
  // Verificar que la configuración sea correcta
  const configStatus = {
    inicializado: initialized,
    serviceId: !!serviceId,
    templateId: !!templateId
  };
  
  // Verificar que las variables estén disponibles
  if (!initialized || !serviceId || !templateId) {
    console.error("Error: Configuración de EmailJS incompleta", configStatus);
    return Promise.reject(
      new Error("No se pudo enviar el correo: configuración incompleta")
    );
  }

  // Preparar los datos del email con valores por defecto
  const emailData = {
    name: data.name || "Sin nombre",
    email: data.email || "Sin email",
    phone: data.phone || "Sin teléfono",
    message: data.message || "Sin mensaje"
  };

  // Enviar el email y retornar la promesa para manejarla en el componente
  try {
    const response = await emailjs
      .send(serviceId, templateId, emailData);
    console.log("Email enviado correctamente");
    return response;
  } catch (error) {
    console.error("Error al enviar email:", error);
    throw error;
  }
};

