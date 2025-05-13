import { useState, useEffect } from "react";
import { generateResponse, isSchedulingQuery } from "@/services/geminiService";
import { setupCSRF } from "@/lib/utils";
import { sendCustomEmail } from "@/services/emailService";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import confetti from 'canvas-confetti';

const useVirtualAssistant = () => {
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
  
  const developmentPhrases = [
    "Hola, soy el asistente virtual de Roberto. ¿En qué puedo ayudarte?",
    "Puedo ayudarte a resolver tus necesidades de desarrollo web y tecnología",
    "Roberto ofrece soluciones a medida para tu empresa o proyecto personal",
    "Consulta por servicios de desarrollo web, consultoría y más"
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
    setChatHistory(prev => [...prev, { type: "user", content: userQuestion.trim() }]);
    
    const question = userQuestion.trim();
    setUserQuestion("");
    setIsProcessing(true);
    
    try {
      // Comprobar si es una solicitud de agenda (usando await ya que es una función async)
      const isScheduling = await isSchedulingQuery(question);
      console.log("¿Es solicitud de agenda?", isScheduling, "para pregunta:", question);
    
      if (isScheduling) {
      // Mostrar formulario de consultoría
      setChatHistory(prev => [
        ...prev, 
        { 
          type: "assistant", 
          content: "¡Claro! Estaré encantado de ayudarte a programar una consultoría. Por favor, completa el siguiente formulario para que pueda agendarte en mi calendario." 
        }
      ]);
      
      setShowConsultForm(true);
    } else {
        // Generar respuesta usando la API de Gemini
        const response = await generateResponse(question, chatHistory);
        
        // Agregar respuesta al historial
        setChatHistory(prev => [...prev, { type: "assistant", content: response }]);
      }
    } catch (error) {
      console.error("Error al procesar la solicitud:", error);
      setChatHistory(prev => [
        ...prev, 
        { 
          type: "assistant", 
          content: "Lo siento, ha ocurrido un error al procesar tu pregunta. Por favor, intenta de nuevo más tarde." 
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
          content: "Por favor, selecciona una fecha y hora para tu consultoría." 
        }
      ]);
      return;
    }
    
    setIsSubmitting(true);
    
    // Formatear la fecha para el email
    const formattedDate = format(selectedDate, 'PPP', { locale: es });
    
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
      .then(response => {
        console.log("Email enviado correctamente:", response);
        
        // Mostrar efecto de confetti al enviar el formulario correctamente
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
        
        // Mostrar mensaje de éxito
        setChatHistory(prev => [
          ...prev, 
          { 
            type: "assistant", 
            content: `¡Gracias ${userName}! Tu solicitud de consultoría para el ${formattedDate} a las ${selectedTime} ha sido enviada. Pronto te contactaré por correo electrónico para confirmar la cita.` 
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
        console.error("Error al enviar solicitud de consultoría:", error);
        setChatHistory(prev => [
          ...prev, 
          { 
            type: "assistant", 
            content: "Lo siento, hubo un error al enviar tu solicitud. Por favor, intenta de nuevo o contacta directamente por correo: rvargas@rv-solutions.net" 
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
