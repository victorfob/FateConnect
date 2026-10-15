const BASE64_BLOCK = 4;
const ONLY_CHARACTER_INDEX = 0;
const NUL_BYTE = 0;

/** O token e a chave do push chegam em base64url; `atob` devolve bytes, não texto. */
export function base64UrlToBytes(value: string): Uint8Array<ArrayBuffer> {
  const base64 = value.replaceAll('-', '+').replaceAll('_', '/');
  const padding = (BASE64_BLOCK - (base64.length % BASE64_BLOCK)) % BASE64_BLOCK;

  return Uint8Array.from(
    atob(base64.padEnd(base64.length + padding, '=')),
    (character) => character.codePointAt(ONLY_CHARACTER_INDEX) ?? NUL_BYTE,
  );
}
