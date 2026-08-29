/**
 * Token de mentira no formato que o front lê. Só o payload importa: nada aqui
 * valida assinatura, e a chave é a mesma que o backend escreve.
 */
export function tokenWithName(name: string): string {
  const json = JSON.stringify({ unique_name: name });
  const bytes = new TextEncoder().encode(json);
  const payload = btoa(String.fromCodePoint(...bytes))
    .replaceAll('+', '-')
    .replaceAll('/', '_')
    .replaceAll('=', '');

  return `cabecalho.${payload}.assinatura`;
}
