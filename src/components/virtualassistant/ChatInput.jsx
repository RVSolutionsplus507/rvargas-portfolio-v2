import { memo, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Textarea } from "@/components/ui/textarea";
import { CalendarIcon } from "@radix-ui/react-icons";

const SendIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
  </svg>
);

const ChatInput = ({
  userQuestion,
  setUserQuestion,
  handleKeyPress,
  isProcessing,
  handleSubmitQuestion,
  handleScheduleConsult
}) => {
  const textareaRef = useRef(null);

  // Auto-focus al montar
  useEffect(() => {
    if (textareaRef.current && !isProcessing) {
      textareaRef.current.focus();
    }
  }, [isProcessing]);

  return (
    <div className="flex flex-col gap-2.5">
      {/* Fila principal: textarea + botón enviar */}
      <div className="flex items-end gap-2">
        <Textarea
          ref={textareaRef}
          placeholder="Pregúntame sobre servicios, proyectos o tecnología..."
          value={userQuestion}
          onChange={(e) => setUserQuestion(e.target.value)}
          onKeyDown={handleKeyPress}
          disabled={isProcessing}
          rows={2}
          style={{ fontSize: '16px' }}
          className="
            flex-1 min-h-[52px] max-h-[120px] resize-none text-sm
            bg-white dark:bg-slate-800
            border-slate-200 dark:border-slate-700
            placeholder:text-slate-400 dark:placeholder:text-slate-500
            text-slate-900 dark:text-slate-100
            focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-0
            rounded-xl transition-all duration-200
            disabled:opacity-50 disabled:cursor-not-allowed
          "
        />

        {/* Botón enviar con gradiente */}
        <button
          onClick={handleSubmitQuestion}
          disabled={!userQuestion.trim() || isProcessing}
          aria-label="Enviar mensaje"
          className="
            flex-shrink-0 h-[52px] w-12
            bg-gradient-to-br from-green-600 to-emerald-600
            hover:from-green-500 hover:to-emerald-500
            disabled:from-slate-300 disabled:to-slate-400 dark:disabled:from-slate-700 dark:disabled:to-slate-600
            text-white disabled:text-slate-500 dark:disabled:text-slate-400
            rounded-xl shadow-md shadow-green-500/20
            hover:shadow-lg hover:shadow-green-500/30
            disabled:shadow-none
            transition-all duration-200
            flex items-center justify-center
            disabled:cursor-not-allowed
          "
        >
          {isProcessing ? (
            <span className="flex gap-0.5">
              <span className="w-1 h-1 rounded-full bg-current animate-bounce [animation-delay:0ms]" />
              <span className="w-1 h-1 rounded-full bg-current animate-bounce [animation-delay:150ms]" />
              <span className="w-1 h-1 rounded-full bg-current animate-bounce [animation-delay:300ms]" />
            </span>
          ) : (
            <SendIcon />
          )}
        </button>
      </div>

      {/* Fila secundaria: hint + botón agendar */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] text-slate-400 dark:text-slate-500">
          Enter para enviar · Shift+Enter nueva línea
        </span>

        <button
          onClick={handleScheduleConsult}
          className="
            flex items-center gap-1.5 px-3 py-1.5
            text-xs font-medium
            text-green-600 dark:text-green-400
            bg-green-50 dark:bg-green-900/20
            hover:bg-green-100 dark:hover:bg-green-900/40
            border border-green-200 dark:border-green-800
            rounded-full
            transition-all duration-200
            whitespace-nowrap
          "
        >
          <CalendarIcon className="w-3 h-3" />
          Agendar consulta
        </button>
      </div>
    </div>
  );
};

ChatInput.propTypes = {
  userQuestion: PropTypes.string.isRequired,
  setUserQuestion: PropTypes.func.isRequired,
  handleKeyPress: PropTypes.func.isRequired,
  isProcessing: PropTypes.bool.isRequired,
  handleSubmitQuestion: PropTypes.func.isRequired,
  handleScheduleConsult: PropTypes.func.isRequired
};

const MemoizedChatInput = memo(ChatInput);
MemoizedChatInput.displayName = 'ChatInput';

export default MemoizedChatInput;
