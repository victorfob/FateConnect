import { z } from 'zod';

import { signupSchema } from '@app/pages/Signup/schema';
import { ProfileTypeEnum } from '@app/services/auth/types';

/** As regras de cada campo são as do cadastro, para a gestão não aceitar o que ele recusa. */
export const userFormSchema = signupSchema
  .pick({ fullName: true, fatecEmail: true, phone: true, contactEmail: true })
  .extend({ profileType: z.enum(ProfileTypeEnum) });

export type UserFormValues = z.infer<typeof userFormSchema>;
