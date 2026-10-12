import { z } from 'zod';

import { loginSchema } from '@app/pages/Home/components/LandingLoginCard/schema';

export const forgotPasswordSchema = z.object({ email: loginSchema.shape.email });

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;
