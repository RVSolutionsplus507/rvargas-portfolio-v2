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
    <form onSubmit={handleSubmitConsult} className="space-y-2 pr-1 overflow-y-auto max-h-[360px] scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600 scrollbar-track-transparent">

      {/* Título del formulario */}
      <div className="flex items-center gap-2 mb-3">
        <div className="h-5 w-1 rounded-full bg-gradient-to-b from-green-600 to-emerald-600" />
        <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 uppercase tracking-wide">
          Agendar Consultoría
        </p>
      </div>

      <Input
        type="text"
        placeholder="Tu nombre completo"
        value={userName}
        onChange={(e) => setUserName(e.target.value)}
        required
        className="h-8 text-xs bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus-visible:ring-green-500"
      />
      <Input
        type="email"
        placeholder="tu@correo.com"
        value={userEmail}
        onChange={(e) => setUserEmail(e.target.value)}
        required
        className="h-8 text-xs bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus-visible:ring-green-500"
      />
      <Input
        type="tel"
        placeholder="Teléfono (opcional)"
        value={userPhone}
        onChange={(e) => setUserPhone(e.target.value)}
        className="h-8 text-xs bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus-visible:ring-green-500"
      />
      <Textarea
        placeholder="¿Qué tipo de consultoría necesitas?"
        rows={2}
        value={consultMessage}
        onChange={(e) => setConsultMessage(e.target.value)}
        className="text-xs bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus-visible:ring-green-500 resize-none"
      />

      {/* Selector de fecha y hora */}
      <div className="space-y-2">
        {/* Selector de fecha */}
        <div>
          <h4 className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 flex items-center gap-1 mb-1">
            <CalendarIcon className="h-3 w-3 text-green-500" />
            Fecha de la consulta
          </h4>
          <div className="border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 overflow-hidden shadow-sm">
            {selectedDate && (
              <div className="px-2 py-1 border-b border-slate-200 dark:border-slate-700 bg-green-50 dark:bg-green-950/30 flex justify-center">
                <span className="text-xs font-medium text-green-700 dark:text-green-300">
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
                nav_button: "h-5 w-5 bg-gradient-to-br from-green-600 to-emerald-600 text-white hover:from-green-500 hover:to-emerald-500 rounded-sm flex items-center justify-center transition-all",
                nav_button_previous: "absolute left-1",
                nav_button_next: "absolute right-1",
                table: "w-full border-collapse mt-2",
                head_row: "flex justify-between py-1",
                head_cell: "text-slate-400 dark:text-slate-500 w-7 h-5 text-[0.6rem] font-medium",
                row: "flex justify-between w-full mt-0",
                cell: "text-center text-xs p-0 relative h-6 w-6",
                day: "h-6 w-6 p-0 flex items-center justify-center text-[0.65rem] rounded-sm hover:bg-green-50 dark:hover:bg-green-950/40 transition-colors",
                day_selected: "bg-gradient-to-br from-green-600 to-emerald-600 text-white hover:from-green-500 hover:to-emerald-500 rounded-sm",
                day_outside: "opacity-50",
                day_disabled: "opacity-30 hover:bg-transparent cursor-not-allowed",
                day_today: "border border-green-500 text-green-600 dark:text-green-400 font-semibold"
              }}
            />
          </div>
        </div>

        {/* Selector de hora */}
        <div>
          <h4 className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 flex items-center gap-1 mb-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
            Hora preferida
          </h4>
          <Select value={selectedTime} onValueChange={setSelectedTime}>
            <SelectTrigger className="w-full h-8 text-xs bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:ring-green-500">
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
      <div className="flex justify-end gap-2 pt-2">
        <Button
          type="button"
          onClick={() => setShowConsultForm(false)}
          variant="ghost"
          size="sm"
          className="h-8 text-xs px-3 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting || !selectedDate || !selectedTime}
          size="sm"
          className="h-8 text-xs px-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white border-0 shadow-md shadow-green-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-1.5">
              <span className="flex gap-0.5">
                <span className="w-1 h-1 rounded-full bg-white/80 animate-bounce [animation-delay:0ms]" />
                <span className="w-1 h-1 rounded-full bg-white/80 animate-bounce [animation-delay:150ms]" />
                <span className="w-1 h-1 rounded-full bg-white/80 animate-bounce [animation-delay:300ms]" />
              </span>
              Enviando...
            </span>
          ) : (
            "Confirmar consulta"
          )}
        </Button>
      </div>
    </form>
  );
};

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
