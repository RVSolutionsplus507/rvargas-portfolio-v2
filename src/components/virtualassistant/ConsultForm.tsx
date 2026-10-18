import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { enUS, es } from "react-day-picker/locale";
import { FiAlertCircle, FiArrowLeft, FiCheckCircle, FiLoader, FiMail } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Whatsapp from "@/components/whatsapp";
import { cn } from "@/lib/utils";
import { CONTACT_EMAIL, EMAIL_PATTERN, PHONE_PATTERN } from "@/lib/contact";
import { isCoolingDown, saveLastSent } from "@/lib/sendCooldown";
import { resolveChatLang } from "@/services/assistantService";
import { sendCustomEmail } from "@/services/emailService";

interface ConsultFormValues {
  name: string;
  email: string;
  phone: string;
  message: string;
  date: Date | undefined;
  time: string;
  hp_site: string;
}

type ConsultStatus = "idle" | "sending" | "sent" | "error" | "limited";

const MAX_DAYS_AHEAD = 30;
const MESSAGE_MAX = 1000;
const WEEKEND = [0, 6];
// Franjas de 30 min en horario de Panamá
const TIME_SLOTS = Array.from({ length: 18 }, (_, i) => {
  const minutes = 9 * 60 + i * 30;
  return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${minutes % 60 === 0 ? "00" : "30"}`;
});

const CONTROL = "h-11 text-base focus-visible:ring-2";
// Alto de la fila del mes; el nav usa el mismo para centrar las flechas de 44 px sobre el título
const CAPTION_ROW = "h-[29px]";
const NAV_BUTTON =
  "flex h-11 w-11 items-center justify-center rounded-md border border-input bg-transparent p-0 text-foreground opacity-100 hover:bg-accent";
const CALENDAR_CLASSES = {
  months: "relative flex flex-col",
  month: "space-y-2",
  month_caption: cn("flex items-center justify-center", CAPTION_ROW),
  caption_label: "text-meta font-semibold capitalize",
  nav: cn("absolute inset-x-0 top-0 flex items-center justify-between", CAPTION_ROW),
  button_previous: NAV_BUTTON,
  button_next: NAV_BUTTON,
  month_grid: "w-full border-collapse",
  weekdays: "flex",
  weekday: "w-11 p-px text-center text-caption font-normal capitalize text-muted-foreground",
  week: "mt-1 flex w-full",
  day: "group h-11 w-11 p-0 text-center text-sm",
  day_button:
    "h-11 w-11 rounded-md p-0 text-sm font-normal text-foreground hover:bg-accent disabled:cursor-not-allowed disabled:text-muted-foreground disabled:opacity-40 disabled:hover:bg-transparent group-aria-selected:bg-primary group-aria-selected:text-primary-foreground hover:group-aria-selected:bg-primary group-data-[today=true]:border group-data-[today=true]:border-primary group-data-[today=true]:font-semibold",
  outside: "invisible",
};

interface FieldProps {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: ReactNode;
}

function Field({ id, label, required, error, hint, children }: FieldProps) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-meta">
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </label>
      {children}
      {hint && <p className="mt-1.5 text-caption text-muted-foreground">{hint}</p>}
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-1.5 text-meta text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

interface ConsultFormProps {
  onBack: () => void;
}

const ConsultForm = ({ onBack }: ConsultFormProps) => {
  const { t, i18n } = useTranslation("virtualassistant");
  const lang = resolveChatLang(i18n.language);
  const dateLocale = lang === "en" ? enUS : es;
  const {
    register,
    control,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm<ConsultFormValues>({ defaultValues: { name: "", email: "", phone: "", message: "", date: undefined, time: "", hp_site: "" } });
  const [status, setStatus] = useState<ConsultStatus>("idle");
  const [sentTo, setSentTo] = useState({ name: "", email: "" });
  const noticeRef = useRef<HTMLDivElement>(null);

  const { today, lastDay } = useMemo(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + MAX_DAYS_AHEAD);
    return { today: start, lastDay: end };
  }, []);

  const showNotice = status === "sent" || status === "error" || status === "limited";
  useEffect(() => {
    if (showNotice) noticeRef.current?.focus();
  }, [showNotice, status]);

  const onSubmit = async (data: ConsultFormValues): Promise<void> => {
    if (status === "sending") return;
    // Honeypot: un humano no ve este campo; se simula el cierre sin enviar nada
    if (data.hp_site) {
      setSentTo({ name: data.name, email: data.email });
      setStatus("sent");
      reset();
      return;
    }
    // La regla required de "date" ya lo garantiza; esto solo estrecha el tipo
    if (!data.date) return;
    if (isCoolingDown()) {
      setStatus("limited");
      return;
    }
    setStatus("sending");
    try {
      // El correo llega al buzón de Roberto: siempre en español. source y subject los arma emailService
      await sendCustomEmail({
        name: data.name,
        email: data.email,
        phone: data.phone,
        message: [
          "SOLICITUD DE CONSULTA (desde Ambar)",
          `Fecha preferida: ${format(data.date, "PPPP", { locale: es })}`,
          `Hora preferida (hora de Panamá): ${data.time}`,
          `Idioma del visitante: ${lang}`,
          "",
          `Detalles: ${data.message || "Sin detalles"}`,
        ].join("\n"),
      });
      saveLastSent();
      setSentTo({ name: data.name, email: data.email });
      setStatus("sent");
      reset();
    } catch {
      setStatus("error");
    }
  };

  const sending = status === "sending";
  const selectedDate = useWatch({ control, name: "date" });
  // Los ids llevan prefijo: el diálogo puede estar abierto sobre /contact, que ya usa #name y #email
  const fieldProps = (field: keyof ConsultFormValues) => ({
    id: `consult-${field}`,
    "aria-invalid": Boolean(errors[field]),
    "aria-describedby": errors[field] ? `consult-${field}-error` : undefined,
    className: cn(CONTROL, errors[field] && "border-destructive"),
  });

  const noticeTitle: Record<"sent" | "error" | "limited", string> = { sent: t("consult.sentTitle"), error: t("consult.errorTitle"), limited: t("consult.limitedTitle") };
  const noticeBody: Record<"sent" | "error" | "limited", string> = {
    sent: t("consult.sentBody", { name: sentTo.name || "-", email: sentTo.email || "-" }),
    error: t("consult.errorBody"),
    limited: t("consult.limited"),
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3 scrollbar-green">
        <Button type="button" variant="ghost" onClick={onBack} className="-ml-2 min-h-11 gap-2 px-2 text-sm">
          <FiArrowLeft className="h-4 w-4" aria-hidden="true" />
          {t("consult.back")}
        </Button>

        <h3 className="mt-1 text-layer-sm font-semibold">{t("consult.title")}</h3>
        {status !== "sent" && (
          <p className="mt-1 text-meta text-muted-foreground">
            {t("consult.lead")} {t("consult.requiredNote")}
          </p>
        )}

        {showNotice && (
          <div
            ref={noticeRef}
            tabIndex={-1}
            role={status === "sent" ? "status" : "alert"}
            className={cn(
              "mt-4 space-y-3 rounded-xl border p-4 focus:outline-hidden",
              status === "sent" ? "border-primary bg-primary/10" : "border-destructive bg-destructive/10"
            )}
          >
            <div className="flex items-start gap-3">
              {status === "sent" ? (
                <FiCheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
              ) : (
                <FiAlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" aria-hidden="true" />
              )}
              <div className="space-y-1">
                <p className="text-layer-sm font-semibold">{noticeTitle[status]}</p>
                <p className="text-meta">{noticeBody[status]}</p>
              </div>
            </div>
            {status === "sent" ? (
              <Button type="button" variant="outline" onClick={onBack} className="min-h-11 text-sm">
                {t("consult.back")}
              </Button>
            ) : (
              <div className="flex flex-wrap gap-2">
                <Button asChild variant="outline" className="min-h-11 px-4 text-sm">
                  <a href={`mailto:${CONTACT_EMAIL}`}>
                    <FiMail className="mr-2 h-4 w-4" aria-hidden="true" />
                    {t("consult.emailLink")}
                  </a>
                </Button>
                <Whatsapp className="h-auto min-h-11 gap-2 px-4 text-sm">{t("errors.whatsapp")}</Whatsapp>
              </div>
            )}
          </div>
        )}

        {status !== "sent" && (
          <form
            id="consult-form"
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            aria-busy={sending}
            className="mt-4"
          >
            <fieldset disabled={sending} className="flex flex-col gap-4">
              <Field id="consult-name" label={t("consult.name")} required error={errors.name?.message}>
                <Input
                  type="text"
                  autoComplete="name"
                  {...fieldProps("name")}
                  aria-required="true"
                  {...register("name", { required: t("consult.errName") })}
                />
              </Field>
              <Field id="consult-email" label={t("consult.email")} required error={errors.email?.message}>
                <Input
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  {...fieldProps("email")}
                  aria-required="true"
                  {...register("email", {
                    required: t("consult.errEmail"),
                    pattern: { value: EMAIL_PATTERN, message: t("consult.errEmailInvalid") },
                  })}
                />
              </Field>
              <Field id="consult-phone" label={t("consult.phone")} error={errors.phone?.message}>
                <Input
                  type="tel"
                  autoComplete="tel"
                  inputMode="tel"
                  {...fieldProps("phone")}
                  {...register("phone", { pattern: { value: PHONE_PATTERN, message: t("consult.errPhoneInvalid") } })}
                />
              </Field>
              <Field id="consult-message" label={t("consult.message")} error={errors.message?.message}>
                <Textarea
                  rows={3}
                  autoComplete="off"
                  {...fieldProps("message")}
                  className={cn("min-h-20 text-base focus-visible:ring-2", errors.message && "border-destructive")}
                  {...register("message", { maxLength: { value: MESSAGE_MAX, message: t("consult.errMessageLong") } })}
                />
              </Field>

              <div role="group" aria-labelledby="consult-date-label">
                <p id="consult-date-label" className="mb-1 text-meta">
                  {t("consult.date")}
                  <span aria-hidden="true"> *</span>
                </p>
                <p className="text-caption text-muted-foreground">{t("consult.dateHint")}</p>
                <Controller
                  name="date"
                  control={control}
                  rules={{ required: t("consult.errDate") }}
                  render={({ field }) => (
                    <div className="mt-1 flex justify-center rounded-xl border border-input">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        defaultMonth={today}
                        startMonth={today}
                        endMonth={lastDay}
                        disabled={[{ before: today }, { after: lastDay }, { dayOfWeek: WEEKEND }]}
                        locale={dateLocale}
                        weekStartsOn={1}
                        showOutsideDays={false}
                        classNames={CALENDAR_CLASSES}
                        labels={{ labelPrevious: () => t("consult.prevMonth"), labelNext: () => t("consult.nextMonth") }}
                      />
                    </div>
                  )}
                />
                <p aria-live="polite" className="mt-1.5 min-h-5 text-meta font-semibold">
                  {selectedDate ? t("consult.dateChosen", { date: format(selectedDate, "PPPP", { locale: dateLocale }) }) : ""}
                </p>
                {errors.date && (
                  <p role="alert" className="mt-1 text-meta text-destructive">
                    {errors.date.message}
                  </p>
                )}
              </div>

              <Field id="consult-time" label={t("consult.time")} required error={errors.time?.message} hint={t("consult.timezone")}>
                <select
                  {...fieldProps("time")}
                  aria-required="true"
                  className={cn(
                    "h-11 w-full rounded-md border border-input bg-background px-3 text-base text-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50",
                    errors.time && "border-destructive"
                  )}
                  {...register("time", { required: t("consult.errTime") })}
                >
                  <option value="">{t("consult.timePlaceholder")}</option>
                  {TIME_SLOTS.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
              </Field>

              {/* Honeypot: fuera de pantalla y oculto a lectores de pantalla; los humanos no lo llenan */}
              <div aria-hidden="true" className="sr-only">
                <label>
                  {t("consult.honeypot")}
                  <input type="text" tabIndex={-1} autoComplete="off" {...register("hp_site")} />
                </label>
              </div>
            </fieldset>
          </form>
        )}
      </div>

      {status !== "sent" && (
        <div className="flex shrink-0 justify-end gap-2 border-t border-border px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3">
          <Button type="button" variant="ghost" onClick={onBack} disabled={sending} className="min-h-11 px-4 text-sm">
            {t("consult.cancel")}
          </Button>
          <Button type="submit" form="consult-form" disabled={sending} className="min-h-11 px-5 text-sm">
            {sending ? (
              <>
                <FiLoader className="mr-2 h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />
                {t("consult.sending")}
              </>
            ) : (
              t("consult.submit")
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default ConsultForm;
