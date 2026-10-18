import emailjs from '@emailjs/browser';
import type { EmailJSResponseStatus } from '@emailjs/browser';
import { buildEmailPayload } from './emailPayload';
import type { CustomEmailData } from './emailPayload';

export type { CustomEmailData };

const isDev = import.meta.env.DEV;
const logger = {
  log: (...args: unknown[]): void => {
    if (isDev) console.log(...args);
  },
  error: (...args: unknown[]): void => {
    if (isDev) console.error(...args);
  },
};

const emailjsInit = (): boolean => {
  const publicKey = import.meta.env.VITE_EMAIL_USER_ID;
  
  if (publicKey) {
    try {
      // blockHeadless descarta bots sin navegador real; limitRate repite en el SDK el tope de 1 envío por minuto
      emailjs.init({ publicKey, blockHeadless: true, limitRate: { id: 'contact', throttle: 60000 } });
      return true;
    } catch (error) {
      logger.error('Error al inicializar EmailJS:', error);
      return false;
    }
  } else {
    logger.error('No se pudo inicializar EmailJS: clave pública no disponible');
    return false;
  }
};

const initialized = emailjsInit();

export const sendCustomEmail = async (data: CustomEmailData): Promise<EmailJSResponseStatus> => {
  const serviceId = import.meta.env.VITE_EMAIL_SERVICE_ID;
  const templateId = import.meta.env.VITE_EMAIL_TEMPLATE_ID;
  
  const configStatus = {
    inicializado: initialized,
    serviceId: !!serviceId,
    templateId: !!templateId
  };
  
  if (!initialized || !serviceId || !templateId) {
    logger.error("Error: Configuración de EmailJS incompleta", configStatus);
    return Promise.reject(
      new Error("No se pudo enviar el correo: configuración incompleta")
    );
  }

  const emailData = buildEmailPayload(data);

  try {
    const response = await emailjs
      .send(serviceId, templateId, emailData);
    logger.log("Email enviado correctamente");
    return response;
  } catch (error) {
    logger.error("Error al enviar email:", error);
    throw error;
  }
};

