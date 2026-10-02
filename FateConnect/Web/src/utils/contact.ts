type ContactOwner = { phone: string | null; contactEmail: string | null };

/** Contato completo são os dois: sem qualquer um, carona, item e denúncia sem sigilo ficam fechados. */
export function hasContact({ phone, contactEmail }: ContactOwner): boolean {
  return Boolean(phone) && Boolean(contactEmail);
}
