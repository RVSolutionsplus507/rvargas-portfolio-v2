import { useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import { generateResponse, isSchedulingQuery } from "@/services/geminiService";
import { setupCSRF } from "@/lib/utils";
import { sendCustomEmail } from "@/services/emailService";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { enUS } from "date-fns/locale";
import confetti from 'canvas-confetti';

const getTimestamp = () =>
  new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false });

const useVirtualAssistant = () => {
  const { t, i18n } = useTranslation('virtualassistant');

  const [isOpen, setIsOpen] = useState(false);
  const [currentPhrase, setCurrentPhrase] = useState(0);
  const [userQuestion, setUserQuestion] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const [consultMessage, setConsultMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showConsultForm, setShowConsultForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState("");
  const [csrfToken, setCsrfToken] = useState("");

  // Frases rotativas traducidas via i18n
  const developmentPhrases = [
    t('phrases.0'),
    t('phrases.1'),
    t('phrases.2'),
    t('phrases.3'),
  ];


  const timeSlots = [
    "9:00", "9:30", "10:00", "10:30", "11:00", "11:30",
    "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
    "15:00", "15:30", "16:00", "16:30", "17:00", "17:30"
  ];

  useEffect(() => {
    const token = setupCSRF();
    setCsrfToken(token);
  }, []);

  // Efecto para cambiar la frase actual cada 6 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPhrase((prev) => (prev + 1) % developmentPhrases.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [developmentPhrases.length]);

  // Función para deshabilitar fechas no disponibles (fines de semana)
  const disabledDays = (date) => {
    // Verificar que date es válida
    if (!date || !(date instanceof Date) || isNaN(date)) {
      return true; // Deshabilitar si no es una fecha válida
    }

    // Deshabilitar sábados (6) y domingos (0)
    const day = date.getDay();
    if (day === 0 || day === 6) {
      return true;
    }

    // Deshabilitar fechas pasadas
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dateToCheck = new Date(date);
    dateToCheck.setHours(0, 0, 0, 0);

    return dateToCheck < today;
  };

  // Función para deshabilitar fechas más allá de 30 días
  const disableFutureDays = (date) => {
    // Verificar que date es válida
    if (!date || !(date instanceof Date) || isNaN(date)) {
      return true; // Deshabilitar si no es una fecha válida
    }

    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    thirtyDaysFromNow.setHours(23, 59, 59, 999);

    const dateToCheck = new Date(date);
    dateToCheck.setHours(0, 0, 0, 0);

    return dateToCheck > thirtyDaysFromNow;
  };

  // Manejadores de eventos
  const handleSubmitQuestion = async () => {
    if (!userQuestion.trim()) return;

    // Agregar pregunta del usuario al historial
    setChatHistory(prev => [...prev, { type: "user", content: userQuestion.trim(), time: getTimestamp() }]);

    const question = userQuestion.trim();
    setUserQuestion("");
    setIsProcessing(true);

    try {
      // Comprobar si es una solicitud de agenda (usando await ya que es una función async)
      const isScheduling = await isSchedulingQuery(question, i18n.language);

      if (isScheduling) {
        // Mostrar formulario de consultoría
        setChatHistory(prev => [
          ...prev,
          {
            type: "assistant",
            content: t('scheduling_response'),
            time: getTimestamp()
          }
        ]);

        setShowConsultForm(true);
      } else {
        // Generar respuesta usando la API de Gemini
        const response = await generateResponse(question, chatHistory, i18n.language);

        // Agregar respuesta al historial
        setChatHistory(prev => [...prev, { type: "assistant", content: response, time: getTimestamp() }]);
      }
    } catch (error) {
      console.error("Error al procesar la solicitud:", error);
      setChatHistory(prev => [
        ...prev,
        {
          type: "assistant",
          content: t('error_response'),
          time: getTimestamp()
        }
      ]);
    }

    setIsProcessing(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmitQuestion();
    }
  };

  const handleScheduleConsult = () => {
    setShowConsultForm(true);
  };

  const handleSubmitConsult = (e) => {
    e.preventDefault();

    if (!selectedDate || !selectedTime) {
      setChatHistory(prev => [
        ...prev,
        {
          type: "assistant",
          content: t('select_date_time')
        }
      ]);
      return;
    }

    setIsSubmitting(true);

    // Seleccionar el locale de date-fns según el idioma activo
    const dateLocale = i18n.language.startsWith('en') ? enUS : es;

    // Formatear la fecha para el email con el locale correcto
    const formattedDate = format(selectedDate, 'PPP', { locale: dateLocale });

    // Crear un formato de mensaje que se adapte mejor a la plantilla de EmailJS
    // Asegurando que todos los campos están correctamente formateados
    const dataWithToken = {
      name: userName,
      email: userEmail,
      phone: userPhone || "No proporcionado", // Usar el teléfono real si está disponible
      message: `SOLICITUD DE CONSULTORÍA: \n\nNombre: ${userName} \nEmail: ${userEmail} \nTeléfono: ${userPhone || "No proporcionado"} \nFecha: ${formattedDate} \nHora: ${selectedTime} \n\nDetalles: ${consultMessage}`,
      csrfToken
    };

    // Enviar el email (ahora devuelve una promesa)
    sendCustomEmail(dataWithToken)
      .then(() => {

        // Mostrar efecto de confetti al enviar el formulario correctamente
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });

        // Mostrar mensaje de éxito traducido
        setChatHistory(prev => [
          ...prev,
          {
            type: "assistant",
            content: t('success_response', { name: userName, date: formattedDate, time: selectedTime }),
            time: getTimestamp()
          }
        ]);

        // Limpiar formulario
        setUserName("");
        setUserEmail("");
        setUserPhone("");
        setConsultMessage("");
        setSelectedDate(null);
        setSelectedTime("");
      })
      .catch(error => {
        console.error("Error al enviar solicitud:", error);
        setChatHistory(prev => [
          ...prev,
          {
            type: "assistant",
            content: t('error_consult'),
            time: getTimestamp()
          }
        ]);
      })
      .finally(() => {
        setIsSubmitting(false);
        setShowConsultForm(false);
      });
  };

  return {
    isOpen,
    setIsOpen,
    currentPhrase,
    userQuestion,
    setUserQuestion,
    chatHistory,
    setChatHistory,
    userName,
    setUserName,
    userEmail,
    setUserEmail,
    userPhone,
    setUserPhone,
    consultMessage,
    setConsultMessage,
    isSubmitting,
    isProcessing,
    showConsultForm,
    setShowConsultForm,
    selectedDate,
    setSelectedDate,
    selectedTime,
    setSelectedTime,

    // Datos
    developmentPhrases,
    timeSlots,

    // Funciones
    disabledDays,
    disableFutureDays,
    handleSubmitQuestion,
    handleKeyPress,
    handleScheduleConsult,
    handleSubmitConsult
  };
};

export default useVirtualAssistant;
