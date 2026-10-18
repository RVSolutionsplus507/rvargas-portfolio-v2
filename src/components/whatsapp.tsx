import type { ReactNode } from "react";
import { FaWhatsapp } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

// Número público del sitio; el mensaje precargado llega traducido desde el namespace "whatsapp"
const WHATSAPP_NUMBER = "50761083193";

interface WhatsappProps {
  children?: ReactNode;
  className?: string;
}

function Whatsapp({ children, className }: WhatsappProps) {
  const [t] = useTranslation("whatsapp");
  const href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(t("message"))}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(buttonVariants({ variant: "outline", size: "lg" }), "min-h-11 gap-2", className)}
    >
      <FaWhatsapp className="h-5 w-5" aria-hidden="true" />
      {children ?? t("cta")}
      <span className="sr-only"> ({t("newTab")})</span>
    </a>
  );
}

export default Whatsapp;
