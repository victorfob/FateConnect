const AUTOFILL_OFF = 'off';

export function autoCompleteFor(autoFill: boolean, token: string): string {
  if (autoFill) return token;

  return AUTOFILL_OFF;
}
