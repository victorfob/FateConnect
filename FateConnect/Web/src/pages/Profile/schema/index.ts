import { z } from 'zod';

import { checkContact, contactFieldsSchema } from '@app/components/ContactFields/schema';
import { photoSchema } from '@app/components/PhotoField/schema';
import { maxLengthMessage, signupSchema } from '@app/pages/Signup/schema';

/** O limite do `UpdateUserDto`. */
export const MAX_NEIGHBORHOOD_LENGTH = 100;

export const PASSWORD_MESSAGES = {
  currentRequired: 'Informe a senha atual',
  newRequired: 'Informe a nova senha',
};

/** Com um dos dois preenchidos a troca foi pedida, e aí os dois valem; em branco, a senha fica. */
function checkPasswordChange(
  values: { currentPassword: string; newPassword: string },
  context: z.RefinementCtx,
) {
  const { currentPassword, newPassword } = values;
  if (currentPassword === '' && newPassword === '') return;

  if (currentPassword === '')
    context.addIssue({
      code: 'custom',
      path: ['currentPassword'],
      message: PASSWORD_MESSAGES.currentRequired,
    });

  if (newPassword === '') {
    context.addIssue({
      code: 'custom',
      path: ['newPassword'],
      message: PASSWORD_MESSAGES.newRequired,
    });
    return;
  }

  const [newPasswordIssue] = signupSchema.shape.password.safeParse(newPassword).error?.issues ?? [];
  if (newPasswordIssue)
    context.addIssue({ code: 'custom', path: ['newPassword'], message: newPasswordIssue.message });
}

/** Os campos que o cadastro também pede seguem as mesmas regras dele. */
export const profileSchema = signupSchema
  .pick({ fullName: true, birthDate: true, gender: true })
  .extend(contactFieldsSchema.shape)
  .extend({
    neighborhood: z
      .string()
      .trim()
      .max(MAX_NEIGHBORHOOD_LENGTH, maxLengthMessage(MAX_NEIGHBORHOOD_LENGTH)),
    photo: photoSchema,
    removeStoredPhoto: z.boolean(),
    currentPassword: z.string(),
    newPassword: z.string(),
  })
  .superRefine((values, context) => {
    checkPasswordChange(values, context);
    checkContact(values, context);
  });

export type ProfileFormInput = z.input<typeof profileSchema>;
export type ProfileFormValues = z.output<typeof profileSchema>;
