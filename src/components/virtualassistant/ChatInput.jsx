import { memo } from 'react';
import PropTypes from 'prop-types';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const ChatInput = ({
  userQuestion,
  setUserQuestion,
  handleKeyPress,
  isProcessing,
  handleSubmitQuestion,
  handleScheduleConsult
}) => {
  return (
    <>
      {/* Entrada de texto para preguntas */}
      <div className="flex items-center gap-2">
        <Textarea
          placeholder="Escribe tu pregunta..."
          value={userQuestion}
          onChange={(e) => setUserQuestion(e.target.value)}
          onKeyDown={handleKeyPress}
          className="min-h-[60px] text-base"
          disabled={isProcessing}
          style={{ fontSize: '16px' }}
        />
        <Button
          onClick={handleSubmitQuestion}
          className="h-10 bg-green-600 hover:bg-green-500 text-white"
          disabled={!userQuestion.trim() || isProcessing}
        >
          {isProcessing ? "..." : "Enviar"}
        </Button>
      </div>
      
      {/* Botón para agendar consulta */}
      <div className="flex justify-center">
        <Button
          size="sm"
          className="bg-green-600 hover:bg-green-500 text-white"
          onClick={handleScheduleConsult}
        >
          Agendar una consultoría
        </Button>
      </div>
    </>
  );
};

// Definición de PropTypes para validación
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
