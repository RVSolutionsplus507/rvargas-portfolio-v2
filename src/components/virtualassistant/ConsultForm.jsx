import { memo } from 'react';
import PropTypes from 'prop-types';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "@radix-ui/react-icons";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const ConsultForm = ({
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
  handleSubmitConsult,
  setShowConsultForm,
  timeSlots
}) => {
  return (
    <form onSubmit={handleSubmitConsult} className="space-y-2 pr-1">
      <Input
        type="text"
        placeholder="Tu nombre"
        value={userName}
        onChange={(e) => setUserName(e.target.value)}
        required
      />
      <Input
        type="email"
        placeholder="Tu correo electrónico"
        value={userEmail}
        onChange={(e) => setUserEmail(e.target.value)}
        required
      />
      <Input
        type="tel"
        placeholder="Tu teléfono (opcional)"
        value={userPhone}
        onChange={(e) => setUserPhone(e.target.value)}
      />
      <Textarea
        placeholder="¿Qué tipo de consultoría necesitas?"
        rows={2}
        value={consultMessage}
        onChange={(e) => setConsultMessage(e.target.value)}
      />
      
      {/* Selector de fecha y hora */}
      <div className="mt-2 space-y-2">
        {/* Selector de fecha */}
        <div>
          <h4 className="text-xs font-medium flex items-center gap-1 mb-1">
            <CalendarIcon className="h-3 w-3 text-gray-500" />
            Selecciona una fecha:
          </h4>
          <div className="border border-gray-200 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-800 overflow-hidden">
            {selectedDate && (
              <div className="px-2 py-1 border-b border-gray-200 dark:border-zinc-700 flex justify-center">
                <span className="text-xs font-medium">
                  {format(selectedDate, "d 'de' MMMM, yyyy", { locale: es })}
                </span>
              </div>
            )}
            
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              defaultMonth={new Date()}
              fromDate={new Date()}
              disabled={(date) => {
                if (!date) return true;
                const day = date.getDay();
                return day === 0 || day === 6 || date > new Date(new Date().setDate(new Date().getDate() + 30));
              }}
              locale={es}
              classNames={{
                months: "space-y-1",
                month: "space-y-2",
                caption: "flex justify-center relative items-center gap-1 py-2",
                caption_label: "text-xs font-medium",
                nav: "flex items-center gap-1",
                nav_button: "h-5 w-5 bg-green-600 text-white hover:bg-green-500 rounded-sm flex items-center justify-center",
                nav_button_previous: "absolute left-1",
                nav_button_next: "absolute right-1",
                table: "w-full border-collapse mt-2",
                head_row: "flex justify-between py-1",
                head_cell: "text-gray-500 dark:text-gray-400 w-7 h-5 text-[0.6rem] font-medium",
                row: "flex justify-between w-full mt-0",
                cell: "text-center text-xs p-0 relative h-6 w-6",
                day: "h-6 w-6 p-0 flex items-center justify-center text-[0.65rem] rounded-sm hover:bg-gray-100 dark:hover:bg-zinc-700",
                day_selected: "bg-green-600 text-white hover:bg-green-600",
                day_outside: "opacity-50",
                day_disabled: "opacity-30 hover:bg-transparent",
                day_today: "border border-green-600"
              }}
            />
          </div>
        </div>
        
        {/* Selector de hora */}
        <div>
          <h4 className="text-xs font-medium flex items-center gap-1 mb-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
            Selecciona una hora:
          </h4>
          <Select value={selectedTime} onValueChange={setSelectedTime}>
            <SelectTrigger className="w-full h-8 text-xs">
              <SelectValue placeholder="Selecciona una hora" />
            </SelectTrigger>
            <SelectContent className="max-h-[150px]">
              {timeSlots.map((time) => (
                <SelectItem key={time} value={time} className="text-xs">
                  {time}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Botones de acción */}
      <div className="flex justify-end gap-2 pt-1">
        <Button 
          type="button" 
          onClick={() => setShowConsultForm(false)}
          className="bg-red-600 hover:bg-red-500 text-white h-8 text-xs px-3"
          size="sm"
        >
          Cancelar
        </Button>
        <Button 
          type="submit" 
          disabled={isSubmitting || !selectedDate || !selectedTime} 
          className="bg-green-600 hover:bg-green-500 text-white h-8 text-xs px-3"
          size="sm"
        >
          {isSubmitting ? "Procesando..." : "Confirmar consulta"}
        </Button>
      </div>
    </form>
  );
};

// Definición de PropTypes para validación
ConsultForm.propTypes = {
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
  handleSubmitConsult: PropTypes.func.isRequired,
  setShowConsultForm: PropTypes.func.isRequired,
  timeSlots: PropTypes.arrayOf(PropTypes.string).isRequired
};

const MemoizedConsultForm = memo(ConsultForm);
MemoizedConsultForm.displayName = 'ConsultForm';

export default MemoizedConsultForm;
