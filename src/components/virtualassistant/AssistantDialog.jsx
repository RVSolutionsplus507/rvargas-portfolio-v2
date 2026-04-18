import { memo } from 'react';
import PropTypes from 'prop-types';
import { Dialog, DialogContent, DialogDescription } from "@/components/ui/dialog";
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
      <DialogContent className="
        p-0 gap-0 overflow-hidden border-0 shadow-2xl
        w-full h-[100dvh] max-w-full rounded-none
        md:w-96 md:h-[600px] md:max-w-md md:rounded-2xl md:bottom-6 md:right-6
        md:top-auto md:left-auto md:translate-x-0 md:translate-y-0
        md:[inset:auto_1.5rem_1.5rem_auto]
        bg-white/80 dark:bg-slate-900/90 backdrop-blur-xl
        border border-white/20 dark:border-slate-700/50
        flex flex-col
        [&>button]:top-3 [&>button]:right-3 [&>button]:z-10
        [&>button]:bg-white/50 dark:[&>button]:bg-slate-700/50
        [&>button]:rounded-full [&>button]:p-1
        [&>button]:backdrop-blur-sm
      ">
        <DialogDescription className="sr-only">
          Asistente virtual IA para responder preguntas sobre Roberto Vargas y agendar citas
        </DialogDescription>

        {/* Header glassmorphism */}
        <div className="relative flex items-center gap-3 px-4 py-3.5 bg-gradient-to-r from-green-700 via-green-600 to-emerald-600 flex-shrink-0">
          {/* Overlay de textura sutil */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.15)_0%,_transparent_60%)]" />

          <div className="relative flex items-center gap-3 flex-1 min-w-0">
            {/* Avatar con anillo de estado */}
            <div className="relative flex-shrink-0">
              <Avatar className="h-9 w-9 ring-2 ring-white/40 shadow-lg">
                <AvatarImage src={assistentImage} alt="Ambar, asistente de RVSolutions Plus" />
                <AvatarFallback className="bg-green-700 text-white text-xs font-bold">AM</AvatarFallback>
              </Avatar>
              {/* Indicador activo */}
              <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-400 ring-2 ring-white" />
              </span>
            </div>

            {/* Nombre y estado */}
            <div className="min-w-0">
              <p className="text-white font-semibold text-sm leading-tight truncate">
                Ambar
              </p>
              <p className="text-green-100 text-xs">
                {isProcessing ? (
                  <span className="flex items-center gap-1">
                    <span className="inline-flex gap-0.5">
                      <span className="w-1 h-1 rounded-full bg-green-200 animate-bounce [animation-delay:0ms]" />
                      <span className="w-1 h-1 rounded-full bg-green-200 animate-bounce [animation-delay:150ms]" />
                      <span className="w-1 h-1 rounded-full bg-green-200 animate-bounce [animation-delay:300ms]" />
                    </span>
                    Escribiendo...
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 inline-block" />
                    En línea · Portafolio de Roberto
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Cuerpo del chat */}
        <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
          {/* Historial de mensajes */}
          <div className="flex-1 min-h-0 overflow-hidden">
            <ChatHistory
              chatHistory={chatHistory}
              setChatHistory={setChatHistory}
              handleScheduleConsult={handleScheduleConsult}
              isProcessing={isProcessing}
            />
          </div>

          {/* Input o formulario */}
          <div className="flex-shrink-0 border-t border-slate-200/80 dark:border-slate-700/60 bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm px-4 py-3">
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
        </div>
      </DialogContent>
    </Dialog>
  );
});

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
  userQuestion: PropTypes.string.isRequired,
  setUserQuestion: PropTypes.func.isRequired,
  isProcessing: PropTypes.bool.isRequired,
  handleSubmitConsult: PropTypes.func.isRequired,
  handleSubmitQuestion: PropTypes.func.isRequired,
  handleKeyPress: PropTypes.func.isRequired,
  handleScheduleConsult: PropTypes.func.isRequired,
  timeSlots: PropTypes.arrayOf(PropTypes.string).isRequired
};

AssistantDialog.displayName = 'AssistantDialog';

export default AssistantDialog;
