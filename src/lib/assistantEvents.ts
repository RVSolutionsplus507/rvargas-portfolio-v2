// Evento mínimo para abrir a Ambar desde cualquier parte del sitio (p. ej. la CTA de la capa de IA)
export const OPEN_ASSISTANT_EVENT = "rvs:open-assistant";

export interface OpenAssistantDetail {
  /** Elemento que dispara la apertura: recibe el foco al cerrar el diálogo. */
  opener?: Element | null;
}

export type OpenAssistantEvent = CustomEvent<OpenAssistantDetail>;

// Registro global para que addEventListener(OPEN_ASSISTANT_EVENT, …) reciba el evento ya tipado
declare global {
  interface WindowEventMap {
    [OPEN_ASSISTANT_EVENT]: OpenAssistantEvent;
  }
}

// `opener` es el elemento que dispara la apertura: recibe el foco al cerrar el diálogo
export const openAssistant = (opener?: Element | null): void => {
  window.dispatchEvent(new CustomEvent<OpenAssistantDetail>(OPEN_ASSISTANT_EVENT, { detail: { opener } }));
};
