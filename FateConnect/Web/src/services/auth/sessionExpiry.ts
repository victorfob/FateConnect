type SessionExpiryListener = VoidFunction;

const listeners = new Set<SessionExpiryListener>();

/**
 * O interceptor é um módulo, não um componente: não alcança o roteador nem o
 * estado do React. Em vez de expor um deles, ele avisa aqui.
 */
export function notifySessionExpired(): void {
  listeners.forEach((listener) => listener());
}

export function subscribeToSessionExpiry(listener: SessionExpiryListener): VoidFunction {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}
