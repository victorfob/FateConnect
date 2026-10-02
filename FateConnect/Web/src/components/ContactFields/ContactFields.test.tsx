import type { ReactNode } from 'react';
import { FormGrid } from '@design-system';
import { FormProvider, useForm } from 'react-hook-form';

import { render, screen } from '@app/test/testing-library';
import { declarationsFor, sheetRules } from '@app/test/utils/styleSheetRules';

import { CONTACT_FIELD_LABELS } from './constants';
import { ContactFields, type ContactFieldsProps } from '.';

const COMPANION_LABEL = 'Perfil';
const WHOLE_LINE = 'grid-column:1/-1';

function ContactForm({ children }: Readonly<{ children: ReactNode }>) {
  const form = useForm({
    defaultValues: { phone: '', contactEmail: '', contactIsRequired: false },
  });

  return (
    <FormProvider {...form}>
      <FormGrid>{children}</FormGrid>
    </FormProvider>
  );
}

const DEFAULT_PROPS: ContactFieldsProps = {};

const renderComponent = (props = DEFAULT_PROPS) =>
  render(
    <ContactForm>
      <ContactFields {...props} />
    </ContactForm>,
  );

function cellOf(field: HTMLElement): HTMLElement {
  const cell = field.closest('.MuiFormControl-root')?.parentElement;
  if (!cell) throw new Error('Não renderizou a célula do campo.');

  return cell;
}

function cellDeclarationsOf(field: HTMLElement): string {
  return declarationsFor(sheetRules(), cellOf(field));
}

function contactEmail() {
  return screen.getByRole('textbox', { name: CONTACT_FIELD_LABELS.contactEmail });
}

function phone() {
  return screen.getByRole('textbox', { name: CONTACT_FIELD_LABELS.phone });
}

describe('ContactFields', () => {
  it('should put the e-mail first, on a line of its own', () => {
    renderComponent();

    expect(contactEmail().compareDocumentPosition(phone())).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    expect(cellDeclarationsOf(contactEmail())).toContain(WHOLE_LINE);
  });

  it('should give the phone the whole line when nothing goes beside it', () => {
    renderComponent();

    expect(cellDeclarationsOf(phone())).toContain(WHOLE_LINE);
  });

  it('should share the phone line with what goes beside it', () => {
    renderComponent({ phoneCompanion: <input aria-label={COMPANION_LABEL} /> });

    const companion = screen.getByRole('textbox', { name: COMPANION_LABEL });

    expect(cellDeclarationsOf(phone())).not.toContain(WHOLE_LINE);
    expect(cellOf(phone())).toBe(companion.parentElement);
    expect(phone().compareDocumentPosition(companion)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
  });

  it('should let the browser fill the contact of whoever is logged in', () => {
    renderComponent();

    expect(contactEmail()).toHaveAttribute('autocomplete', 'home email');
    expect(phone()).toHaveAttribute('autocomplete', 'home tel');
  });

  it('should keep the browser from filling a contact that belongs to someone else', () => {
    renderComponent({ autoFill: false });

    expect(contactEmail()).toHaveAttribute('autocomplete', 'off');
    expect(phone()).toHaveAttribute('autocomplete', 'off');
  });
});
