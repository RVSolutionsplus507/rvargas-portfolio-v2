import { memo, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import assistentImage from "@/assets/asistente.webp";

const formatTime = () => {
  const now = new Date();
  return now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false });
};

const TypingIndicator = () => (
  <div className="flex items-end gap-2 justify-start">
    <Avatar className="h-6 w-6 flex-shrink-0 ring-1 ring-green-200 dark:ring-green-800 shadow-sm">
      <AvatarImage src={assistentImage} alt="Ambar" />
      <AvatarFallback className="bg-green-600 text-white text-[10px] font-bold">AM</AvatarFallback>
    </Avatar>
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-3 rounded-2xl rounded-bl-sm shadow-sm">
      <div className="flex items-center gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500 animate-bounce [animation-delay:0ms]" />
        <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500 animate-bounce [animation-delay:150ms]" />
        <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500 animate-bounce [animation-delay:300ms]" />
      </div>
    </div>
  </div>
);

const ChatHistory = ({ chatHistory, setChatHistory, handleScheduleConsult, isProcessing }) => {
  const chatContainerRef = useRef(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [chatHistory, isProcessing]);

  return (
    <div
      ref={chatContainerRef}
      className="h-full overflow-y-auto px-4 py-4 space-y-3 bg-slate-50/80 dark:bg-slate-950/50 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600 scrollbar-track-transparent"
    >
      {chatHistory.length === 0 ? (
        /* Estado vacío — bienvenida */
        <div className="flex flex-col items-center justify-center h-full text-center gap-4 py-6">
          <div className="relative">
            <Avatar className="h-16 w-16 ring-4 ring-green-100 dark:ring-green-900 shadow-xl">
              <AvatarImage src={assistentImage} alt="Ambar, asistente de Portafolio de Roberto" />
              <AvatarFallback className="bg-gradient-to-br from-green-600 to-emerald-600 text-white text-xl font-bold">AM</AvatarFallback>
            </Avatar>
            <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 ring-2 ring-white dark:ring-slate-950" />
            </span>
          </div>

          <div>
            <p className="font-semibold text-slate-800 dark:text-slate-100 text-sm">
              Ambar
            </p>
            <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
              Portafolio de Roberto
            </p>
          </div>

          <p className="text-slate-600 dark:text-slate-300 text-sm max-w-[220px] leading-relaxed">
            Hola, soy Ambar, asistente de Portafolio de Roberto. ¿En qué puedo ayudarte hoy?
          </p>

          {/* Sugerencias rápidas */}
          <div className="flex flex-col gap-2 w-full max-w-[260px]">
            <button
              className="w-full text-left text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-green-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all duration-200 shadow-sm hover:shadow-md"
              onClick={() => {
                setChatHistory([
                  { type: "user", content: "¿Qué servicios ofreces?", time: formatTime() },
                  { type: "assistant", content: "Ofrezco servicios de desarrollo web, aplicaciones móviles, consultoría tecnológica, y soluciones a medida para empresas. ¿Hay alguno en particular que te interese conocer más?", time: formatTime() }
                ]);
              }}
            >
              💼 ¿Qué servicios ofreces?
            </button>
            <button
              className="w-full text-left text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-green-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all duration-200 shadow-sm hover:shadow-md"
              onClick={handleScheduleConsult}
            >
              📅 Quiero agendar una consulta
            </button>
          </div>
        </div>
      ) : (
        <>
          {chatHistory.map((message, index) => (
            <div
              key={index}
              className={`flex items-end gap-2 ${message.type === "user" ? "justify-end" : "justify-start"}`}
            >
              {/* Avatar del asistente (izquierda) */}
              {message.type === "assistant" && (
                <Avatar className="h-6 w-6 flex-shrink-0 ring-1 ring-green-200 dark:ring-green-800 shadow-sm">
                  <AvatarImage src={assistentImage} alt="Ambar" />
                  <AvatarFallback className="bg-green-600 text-white text-[10px] font-bold">AM</AvatarFallback>
                </Avatar>
              )}

              <div className={`flex flex-col gap-1 max-w-[75%] ${message.type === "user" ? "items-end" : "items-start"}`}>
                <div
                  className={`px-3.5 py-2.5 text-sm leading-relaxed shadow-sm ${
                    message.type === "user"
                      ? "bg-gradient-to-br from-green-600 to-emerald-600 text-white rounded-2xl rounded-br-sm"
                      : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-2xl rounded-bl-sm"
                  }`}
                >
                  {message.content}
                </div>
                {/* Timestamp */}
                <span className="text-[10px] text-slate-400 dark:text-slate-500 px-1">
                  {message.time || formatTime()}
                </span>
              </div>

              {/* Espaciador para mensajes del usuario (equilibra el avatar del asistente) */}
              {message.type === "user" && <div className="w-6 flex-shrink-0" />}
            </div>
          ))}

          {/* Typing indicator */}
          {isProcessing && <TypingIndicator />}
        </>
      )}
    </div>
  );
};

ChatHistory.propTypes = {
  chatHistory: PropTypes.arrayOf(
    PropTypes.shape({
      type: PropTypes.string.isRequired,
      content: PropTypes.string.isRequired,
      time: PropTypes.string
    })
  ).isRequired,
  setChatHistory: PropTypes.func.isRequired,
  handleScheduleConsult: PropTypes.func.isRequired,
  isProcessing: PropTypes.bool
};

ChatHistory.defaultProps = {
  isProcessing: false
};

const MemoizedChatHistory = memo(ChatHistory);
MemoizedChatHistory.displayName = 'ChatHistory';

export default MemoizedChatHistory;
