import { memo, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Button } from "@/components/ui/button";

const ChatHistory = ({ chatHistory, setChatHistory, handleScheduleConsult }) => {
  // Referencia al contenedor del chat para controlar el scroll
  const chatContainerRef = useRef(null);

  // Efecto para desplazar hacia abajo cuando se añaden nuevos mensajes
  useEffect(() => {
    // Asegurar que la referencia existe
    if (chatContainerRef.current) {
      // Desplazar al fondo del contenedor
      const { scrollHeight } = chatContainerRef.current;
      chatContainerRef.current.scrollTo({
        top: scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [chatHistory]); // Se ejecutará cada vez que cambie el historial

  return (
    <div 
      ref={chatContainerRef}
      className="h-[300px] overflow-y-auto border border-gray-200 dark:border-zinc-700 rounded-md p-4 space-y-4 bg-gray-100/50 dark:bg-zinc-900/50"
    >
      {chatHistory.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-center">
          <p className="text-gray-500 dark:text-gray-400">
            Hola, soy el asistente virtual de Roberto. ¿En qué puedo ayudarte?
          </p>
          <div className="flex gap-2 mt-4">
            <Button 
              size="sm" 
              className="bg-green-600 hover:bg-green-500 text-white" 
              onClick={() => {
                setChatHistory([
                  { type: "user", content: "¿Qué servicios ofreces?" },
                  { type: "assistant", content: "Ofrezco servicios de desarrollo web, aplicaciones móviles, consultoría tecnológica, y soluciones a medida para empresas. ¿Hay alguno en particular que te interese conocer más?" }
                ]);
              }}
            >
              ¿Qué servicios ofreces?
            </Button>
            <Button 
              size="sm" 
              className="bg-green-600 hover:bg-green-500 text-white" 
              onClick={handleScheduleConsult}
            >
              Quiero una consulta
            </Button>
          </div>
        </div>
      ) : (
        chatHistory.map((message, index) => (
          <div 
            key={index} 
            className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
          >
            <div 
              className={`max-w-[80%] p-3 rounded-lg ${
                message.type === "user" 
                  ? "bg-green-600 text-white ml-auto" 
                  : "bg-gray-200 text-gray-800 dark:bg-zinc-700 dark:text-white"
              }`}
            >
              {message.content}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

// Definición de PropTypes para validación
ChatHistory.propTypes = {
  chatHistory: PropTypes.arrayOf(
    PropTypes.shape({
      type: PropTypes.string.isRequired,
      content: PropTypes.string.isRequired
    })
  ).isRequired,
  setChatHistory: PropTypes.func.isRequired,
  handleScheduleConsult: PropTypes.func.isRequired
};


const MemoizedChatHistory = memo(ChatHistory);
MemoizedChatHistory.displayName = 'ChatHistory';

export default MemoizedChatHistory;
