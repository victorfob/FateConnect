const URL_STARTS: readonly string[] = ['http://', 'https://', '/'];
const QUERY_MARK = '?';
const WORD_SEPARATOR = ' ';
/** O trecho guarda a query também solta, sem o `?` que a denuncia no texto. */
const QUERY_ATTRIBUTES: ReadonlySet<string> = new Set(['url.query', 'http.query']);

function withoutQuery(word: string): string {
  if (word.startsWith(QUERY_MARK)) return '';
  if (!URL_STARTS.some((start) => word.startsWith(start))) return word;

  const [beforeQuery] = word.split(QUERY_MARK);

  return beforeQuery ?? word;
}

function stripText(text: string): string {
  return text.split(WORD_SEPARATOR).map(withoutQuery).join(WORD_SEPARATOR);
}

function stripNode(node: unknown, visited: WeakSet<object>): void {
  if (typeof node !== 'object' || node === null || visited.has(node)) return;
  visited.add(node);

  for (const [key, value] of Object.entries(node)) {
    if (QUERY_ATTRIBUTES.has(key)) Reflect.deleteProperty(node, key);
    else if (typeof value === 'string') Reflect.set(node, key, stripText(value));
    else stripNode(value, visited);
  }
}

/**
 * O link do e-mail leva o token e o e-mail institucional na query, e o SDK do
 * Sentry grava a URL em evento, rastro, trecho e gravação de sessão. A busca
 * percorre o objeto inteiro porque cada um desses guarda a URL num lugar.
 */
export function stripUrlQueries<T>(payload: T): T {
  stripNode(payload, new WeakSet());

  return payload;
}
