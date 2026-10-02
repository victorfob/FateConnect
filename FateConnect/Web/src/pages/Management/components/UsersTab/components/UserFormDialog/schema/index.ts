import { z } from 'zod';

import { checkContact, contactFieldsSchema } from '@app/components/ContactFields/schema';
import { signupSchema } from '@app/pages/Signup/schema';
import { ProfileTypeEnum } from '@app/services/auth/types';

/** As regras de cada campo são as do cadastro, para a gestão não aceitar o que ele recusa. */
export const userFormSchema = signupSchema
  .pick({ fullName: true, fatecEmail: true })
  .extend(contactFieldsSchema.shape)
  .extend({ profileType: z.enum(ProfileTypeEnum) })
  .superRefine(checkContact);

export type UserFormValues = z.infer<typeof userFormSchema>;
