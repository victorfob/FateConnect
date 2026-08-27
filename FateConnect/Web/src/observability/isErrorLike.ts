/**
 * `instanceof Error` falha para erro nascido em outro realm — um iframe, ou um
 * cliente que substituiu o `Error` global. Ali o erro cairia no ramo de "não
 * serializável" e perderia tipo, mensagem e stacktrace, que é exatamente o que
 * precisamos preservar.
 */
export function isErrorLike(value: unknown): value is Error {
  if (value instanceof Error) return true;

  return typeof value === 'object' && value !== null && 'message' in value && 'stack' in value;
}
