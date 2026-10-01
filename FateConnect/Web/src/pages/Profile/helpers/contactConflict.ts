import { SignupConflictFieldEnum } from '@app/pages/Signup/@types';
import { conflictFieldOf } from '@app/pages/Signup/helpers/conflictField';
import { ApiError } from '@app/services/httpClient';

type ContactConflictField = SignupConflictFieldEnum.PHONE | SignupConflictFieldEnum.CONTACT_EMAIL;

const CONTACT_CONFLICT_FIELDS: ReadonlySet<SignupConflictFieldEnum> = new Set([
  SignupConflictFieldEnum.PHONE,
  SignupConflictFieldEnum.CONTACT_EMAIL,
]);

function isContactConflictField(field: SignupConflictFieldEnum): field is ContactConflictField {
  return CONTACT_CONFLICT_FIELDS.has(field);
}

/** O e-mail Fatec não se edita no perfil: só o conflito de contato aponta um campo da tela. */
export function contactConflictFieldOf(error: unknown): ContactConflictField | null {
  if (!(error instanceof ApiError)) return null;

  const field = conflictFieldOf(error);
  if (!field || !isContactConflictField(field)) return null;

  return field;
}
