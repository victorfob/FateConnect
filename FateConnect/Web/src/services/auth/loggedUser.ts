import { tokenStorage } from './tokenStorage';

/** O payload do JWT é a parte do meio, separada por ponto. */
const PAYLOAD_INDEX = 1;
const BASE64_BLOCK = 4;
const ONLY_CHARACTER_INDEX = 0;
const NUL_BYTE = 0;

/**
 * `unique_name`, e não `name`: o .NET traduz `ClaimTypes.Name` ao escrever o
 * token, e ler `name` devolveria `undefined` sem erro nenhum.
 */
const NAME_CLAIM = 'unique_name';

function decodePayload(token: string): unknown {
  const encoded = token.split('.')[PAYLOAD_INDEX];
  if (!encoded) return null;

  const base64 = encoded.replaceAll('-', '+').replaceAll('_', '/');
  const padding = (BASE64_BLOCK - (base64.length % BASE64_BLOCK)) % BASE64_BLOCK;

  // `atob` devolve bytes, não texto: sem o `TextDecoder` um nome acentuado
  // volta corrompido.
  const bytes = Uint8Array.from(
    atob(base64.padEnd(base64.length + padding, '=')),
    (character) => character.codePointAt(ONLY_CHARACTER_INDEX) ?? NUL_BYTE,
  );

  return JSON.parse(new TextDecoder().decode(bytes));
}

/**
 * O nome de quem está logado. Vem do token porque o login não guarda mais nada
 * além dele — token e nome guardados à parte podiam discordar.
 */
export function loggedUserName(): string | null {
  const token = tokenStorage.getToken();
  if (!token) return null;

  try {
    const payload = decodePayload(token);

    if (typeof payload !== 'object' || payload === null) return null;
    if (!(NAME_CLAIM in payload)) return null;

    const name = payload[NAME_CLAIM];
    if (typeof name !== 'string') return null;

    return name;
  } catch {
    return null;
  }
}
