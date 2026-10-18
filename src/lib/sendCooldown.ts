// Tope de 1 envío por minuto y sesión. La misma clave que usa contact.tsx: el límite es de la sesión, no de cada formulario.
export const COOLDOWN_MS = 60_000;
export const COOLDOWN_KEY = "contact:lastSentAt";

// sessionStorage puede no estar disponible (modo privado): en ese caso no se limita
export const readLastSent = (): number => {
  try {
    return Number(sessionStorage.getItem(COOLDOWN_KEY)) || 0;
  } catch {
    return 0;
  }
};

export const saveLastSent = (): void => {
  try {
    sessionStorage.setItem(COOLDOWN_KEY, String(Date.now()));
  } catch {
    // sin almacenamiento no hay límite en cliente
  }
};

export const isCoolingDown = (): boolean => Date.now() - readLastSent() < COOLDOWN_MS;
