import { useEffect, useRef, useState } from "react"
import type { ReactNode } from "react"
import { useForm } from "react-hook-form"
import { m, useReducedMotion } from "motion/react"
import { FaEnvelope, FaPhone, FaMapMarkerAlt } from "react-icons/fa"
import { FiAlertCircle, FiCheckCircle, FiLoader } from "react-icons/fi"
import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import Whatsapp from "@/components/whatsapp"
import { sendCustomEmail } from "@/services/emailService"
import { cn } from "@/lib/utils"
import { CONTACT_EMAIL, EMAIL_PATTERN, PHONE_PATTERN } from "@/lib/contact"
import { isCoolingDown, saveLastSent } from "@/lib/sendCooldown"

interface ContactFormValues {
  name: string
  email: string
  phone: string
  message: string
  // Honeypot anti-bots
  hp_site: string
  source: string
}

type ContactStatus = "idle" | "sending" | "sent" | "error" | "limited"

const CONTACT_PHONE = { label: "+507 6108-3193", href: "tel:+50761083193" }
const SOURCE = "rvargas.dev"
const MESSAGE_MAX = 2000

const CARD = "rounded-2xl bg-card p-5 md:p-7"
const CONTROL = "h-11 text-base focus-visible:ring-2"

interface FieldProps {
  id: string
  label: string
  error?: string
  children: ReactNode
}

function Field({ id, label, error, children }: FieldProps) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-meta">
        {label}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-1.5 text-meta text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}

// Salida alternativa cuando el envío falla o está limitado
function Alternatives({ whatsappLabel }: { whatsappLabel: string }) {
  return (
    <div className="flex flex-wrap gap-3">
      <Button asChild variant="outline" size="lg" className="min-h-11">
        <a href={`mailto:${CONTACT_EMAIL}`}>
          <FaEnvelope className="mr-2 h-4 w-4" aria-hidden="true" />
          {CONTACT_EMAIL}
        </a>
      </Button>
      <Whatsapp>{whatsappLabel}</Whatsapp>
    </div>
  )
}

export default function ContactPage() {
  const { t } = useTranslation("contact")
  const reduceMotion = useReducedMotion()
  const {
    register,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm<ContactFormValues>({ defaultValues: { name: "", email: "", phone: "", message: "", hp_site: "", source: SOURCE } })
  const [status, setStatus] = useState<ContactStatus>("idle")
  const noticeRef = useRef<HTMLDivElement>(null)

  const showNotice = status === "sent" || status === "error" || status === "limited"
  useEffect(() => {
    if (showNotice) noticeRef.current?.focus()
  }, [showNotice, status])

  const onSubmit = async (data: ContactFormValues): Promise<void> => {
    if (status === "sending") return
    // Honeypot: un humano no ve este campo; se simula el cierre sin enviar nada
    if (data.hp_site) {
      setStatus("sent")
      reset()
      return
    }
    if (isCoolingDown()) {
      setStatus("limited")
      return
    }
    setStatus("sending")
    try {
      await sendCustomEmail({
        name: data.name,
        email: data.email,
        phone: data.phone,
        message: data.message,
        source: data.source,
      })
      saveLastSent()
      setStatus("sent")
      reset()
    } catch {
      setStatus("error")
    }
  }

  const sending = status === "sending"
  const errorId = (field: keyof ContactFormValues) => (errors[field] ? `${field}-error` : undefined)
  const fieldProps = (field: keyof ContactFormValues) => ({
    id: field,
    "aria-invalid": Boolean(errors[field]),
    "aria-describedby": errorId(field),
    "aria-required": true,
    className: cn(CONTROL, errors[field] && "border-destructive"),
  })

  return (
    <div className="mx-auto space-y-12 p-2 pb-28 md:space-y-14 lg:p-6 lg:pb-28">
      <m.header
        initial={reduceMotion ? false : { y: 16 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
        className="space-y-4"
      >
        <p className="mono-label text-muted-foreground">{t("eyebrow")}</p>
        <h1 tabIndex={-1} className="max-w-3xl text-display-sm focus:outline-hidden">{t("contact")}</h1>
        <p className="max-w-prose text-body text-muted-foreground">{t("lead")}</p>
      </m.header>

      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <section aria-labelledby="form-title" className={CARD}>
          <h2 id="form-title" className="text-title">
            {t("touch")}
          </h2>
          <p className="mt-2 text-meta text-muted-foreground">
            {t("description")} {t("requiredNote")}
          </p>

          {showNotice && (
            <div
              ref={noticeRef}
              tabIndex={-1}
              role={status === "sent" ? "status" : "alert"}
              className={cn(
                "mt-6 space-y-4 rounded-xl border p-4",
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
                  <p className="text-layer-sm font-semibold">
                    {status === "sent" ? t("thanks") : status === "limited" ? t("limitedTitle") : t("errorTitle")}
                  </p>
                  <p className="text-meta">
                    {status === "sent" ? t("messagedelivered") : status === "limited" ? t("limited") : t("errorBody")}
                  </p>
                </div>
              </div>
              {status === "sent" ? (
                <Button type="button" variant="outline" size="lg" className="min-h-11" onClick={() => setStatus("idle")}>
                  {t("sendAnother")}
                </Button>
              ) : (
                <Alternatives whatsappLabel={t("whatsappButton")} />
              )}
            </div>
          )}

          {status !== "sent" && (
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-6 space-y-5" aria-busy={sending}>
              <fieldset disabled={sending} className="space-y-5">
                <Field id="name" label={t("name")} error={errors.name?.message}>
                  <Input
                    type="text"
                    autoComplete="name"
                    {...fieldProps("name")}
                    {...register("name", { required: t("namerequired") })}
                  />
                </Field>
                <Field id="email" label={t("email")} error={errors.email?.message}>
                  <Input
                    type="email"
                    autoComplete="email"
                    inputMode="email"
                    {...fieldProps("email")}
                    {...register("email", {
                      required: t("emailrequired"),
                      pattern: { value: EMAIL_PATTERN, message: t("invalidemail") },
                    })}
                  />
                </Field>
                <Field id="phone" label={t("cellphone")} error={errors.phone?.message}>
                  <Input
                    type="tel"
                    autoComplete="tel"
                    inputMode="tel"
                    {...fieldProps("phone")}
                    {...register("phone", {
                      required: t("cellphonerequired"),
                      pattern: { value: PHONE_PATTERN, message: t("invalidphone") },
                    })}
                  />
                </Field>
                <Field id="message" label={t("message")} error={errors.message?.message}>
                  <Textarea
                    rows={5}
                    autoComplete="off"
                    {...fieldProps("message")}
                    className={cn("min-h-32 text-base focus-visible:ring-2", errors.message && "border-destructive")}
                    {...register("message", {
                      required: t("messagerequired"),
                      maxLength: { value: MESSAGE_MAX, message: t("messagetoolong") },
                    })}
                  />
                </Field>

                <input type="hidden" {...register("source")} />
                {/* Honeypot: fuera de pantalla y oculto a lectores de pantalla; los humanos no lo llenan */}
                <div aria-hidden="true" className="sr-only">
                  <label>
                    {t("honeypot")}
                    <input type="text" tabIndex={-1} autoComplete="off" {...register("hp_site")} />
                  </label>
                </div>

                <Button type="submit" size="lg" className="min-h-11 w-full sm:w-auto" disabled={sending}>
                  {sending ? (
                    <>
                      <FiLoader className="mr-2 h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />
                      {t("sending")}
                    </>
                  ) : (
                    t("send")
                  )}
                </Button>
              </fieldset>
            </form>
          )}
        </section>

        <div className="space-y-6">
          <section aria-labelledby="whatsapp-title" className={CARD}>
            <h2 id="whatsapp-title" className="text-layer-sm font-semibold md:text-layer">
              {t("whatsappTitle")}
            </h2>
            <p className="mt-2 text-meta text-muted-foreground">{t("whatsappText")}</p>
            <div className="mt-4">
              <Whatsapp>{t("whatsappButton")}</Whatsapp>
            </div>
          </section>

          <section aria-labelledby="info-title" className={CARD}>
            <h2 id="info-title" className="text-layer-sm font-semibold md:text-layer">
              {t("contactinfo")}
            </h2>
            <p className="mt-2 text-meta text-muted-foreground">{t("contactdescription")}</p>
            <ul className="mt-4 space-y-1">
              <li>
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="flex min-h-11 items-center gap-3 rounded-lg px-2 text-meta transition-colors hover:bg-accent"
                >
                  <FaEnvelope className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                  {CONTACT_EMAIL}
                </a>
              </li>
              <li>
                <a
                  href={CONTACT_PHONE.href}
                  className="flex min-h-11 items-center gap-3 rounded-lg px-2 text-meta transition-colors hover:bg-accent"
                >
                  <FaPhone className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                  {CONTACT_PHONE.label}
                </a>
              </li>
              <li className="flex min-h-11 items-center gap-3 px-2 text-meta">
                <FaMapMarkerAlt className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                {t("location")}
              </li>
            </ul>
          </section>
        </div>
      </div>

      <section aria-labelledby="map-title" className="space-y-4">
        <h2 id="map-title" className="text-title">
          {t("locationTitle")}
        </h2>
        <div className="h-[320px] overflow-hidden rounded-2xl md:h-[400px]">
          <iframe
            title={t("mapTitle")}
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d126916.70954660845!2d-79.58598449454697!3d8.983333025592013!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8faca8f1dbe80363%3A0xaba25df1f042c10e!2sPanama%20City%2C%20Panama!5e0!3m2!1sen!2sus!4v1685389171961!5m2!1sen!2sus"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
            loading="lazy"
            referrerPolicy="no-referrer"
          ></iframe>
        </div>
      </section>
    </div>
  )
}
