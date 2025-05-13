import { memo } from 'react';
import PropTypes from 'prop-types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import assistentImage from "@/assets/asistente.webp";
import ChatHistory from './ChatHistory';
import ConsultForm from './ConsultForm';
import ChatInput from './ChatInput';

const AssistantDialog = memo(({ 
  isOpen, 
  setIsOpen,
  chatHistory,
  setChatHistory,
  showConsultForm,
  setShowConsultForm,
  userName,
  setUserName,
  userEmail,
  setUserEmail,
  userPhone,
  setUserPhone,
  consultMessage,
  setConsultMessage,
  selectedDate,
  setSelectedDate,
  selectedTime,
  setSelectedTime,
  isSubmitting,
  userQuestion,
  setUserQuestion,
  isProcessing,
  handleSubmitConsult,
  handleSubmitQuestion,
  handleKeyPress,
  handleScheduleConsult,
  timeSlots
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-[90vw] md:max-w-md bg-white dark:bg-zinc-800 text-gray-900 dark:text-white border-gray-200 dark:border-zinc-700 max-h-[80vh] md:max-h-[90vh] overflow-y-auto scrollbar-green p-4 md:p-6">
        <DialogDescription className="sr-only">
          Asistente virtual para responder preguntas sobre Roberto Vargas y agendar citas
        </DialogDescription>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={assistentImage} alt="Asistente Virtual" />
              <AvatarFallback>VA</AvatarFallback>
            </Avatar>
            <span className="text-green-600 dark:text-green-600 font-semibold">
              Asistente Virtual de Roberto
            </span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col space-y-4">
          {/* Historial de chat */}
          <ChatHistory 
            chatHistory={chatHistory} 
            setChatHistory={setChatHistory} 
            handleScheduleConsult={handleScheduleConsult} 
          />

          {/* Formulario para agendar consulta o chat input */}
          {showConsultForm ? (
            <ConsultForm
              userName={userName}
              setUserName={setUserName}
              userEmail={userEmail}
              setUserEmail={setUserEmail}
              userPhone={userPhone}
              setUserPhone={setUserPhone}
              consultMessage={consultMessage}
              setConsultMessage={setConsultMessage}
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              selectedTime={selectedTime}
              setSelectedTime={setSelectedTime}
              isSubmitting={isSubmitting}
              handleSubmitConsult={handleSubmitConsult}
              setShowConsultForm={setShowConsultForm}
              timeSlots={timeSlots}
            />
          ) : (
            <ChatInput
              userQuestion={userQuestion}
              setUserQuestion={setUserQuestion}
              handleKeyPress={handleKeyPress}
              isProcessing={isProcessing}
              handleSubmitQuestion={handleSubmitQuestion}
              handleScheduleConsult={handleScheduleConsult}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
});

// Definición de PropTypes para validación
AssistantDialog.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  setIsOpen: PropTypes.func.isRequired,
  chatHistory: PropTypes.arrayOf(
    PropTypes.shape({
      type: PropTypes.string.isRequired,
      content: PropTypes.string.isRequired
    })
  ).isRequired,
  setChatHistory: PropTypes.func.isRequired,
  showConsultForm: PropTypes.bool.isRequired,
  setShowConsultForm: PropTypes.func.isRequired,
  
  // Props para formulario de consulta
  userName: PropTypes.string.isRequired,
  setUserName: PropTypes.func.isRequired,
  userEmail: PropTypes.string.isRequired,
  setUserEmail: PropTypes.func.isRequired,
  userPhone: PropTypes.string.isRequired,
  setUserPhone: PropTypes.func.isRequired,
  consultMessage: PropTypes.string.isRequired,
  setConsultMessage: PropTypes.func.isRequired,
  selectedDate: PropTypes.instanceOf(Date),
  setSelectedDate: PropTypes.func.isRequired,
  selectedTime: PropTypes.string.isRequired,
  setSelectedTime: PropTypes.func.isRequired,
  isSubmitting: PropTypes.bool.isRequired,
  
  // Props para chat
  userQuestion: PropTypes.string.isRequired,
  setUserQuestion: PropTypes.func.isRequired,
  isProcessing: PropTypes.bool.isRequired,
  
  // Funciones
  handleSubmitConsult: PropTypes.func.isRequired,
  handleSubmitQuestion: PropTypes.func.isRequired,
  handleKeyPress: PropTypes.func.isRequired,
  handleScheduleConsult: PropTypes.func.isRequired,
  timeSlots: PropTypes.arrayOf(PropTypes.string).isRequired
};

AssistantDialog.displayName = 'AssistantDialog';

export default AssistantDialog;
