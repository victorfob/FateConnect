type LoginPrefillState = Readonly<{ email: string }>;

/** O e-mail viaja no estado da navegação, e não na URL do login. */
export function loginPrefillState(email: string): LoginPrefillState {
  return { email };
}

export function prefilledEmailOf(state: unknown): string | undefined {
  if (typeof state !== 'object' || state === null) return undefined;

  const email: unknown = Reflect.get(state, 'email');
  if (typeof email !== 'string' || email === '') return undefined;

  return email;
}
