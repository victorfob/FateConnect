import { z } from 'zod';

/** Mensagens iguais às do produto. */
export const LOGIN_MESSAGES = {
  emailRequired: 'Informe o e-mail',
  emailInvalid: 'E-mail inválido',
  passwordRequired: 'Informe a senha',
};

export const loginSchema = z.object({
  email: z.string().min(1, LOGIN_MESSAGES.emailRequired).pipe(z.email(LOGIN_MESSAGES.emailInvalid)),
  password: z.string().min(1, LOGIN_MESSAGES.passwordRequired),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
