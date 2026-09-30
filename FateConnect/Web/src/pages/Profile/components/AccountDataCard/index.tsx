import { FormGrid, SectionCard } from '@design-system';
import { PersonIcon } from '@design-system/icons';

import { ContactSection } from '@app/pages/Signup/components/ContactSection';

import { CardSubsection } from '../CardSubsection';
import { PersonalDataFields } from '../PersonalDataFields';
import * as C from './constants';

export type AccountDataCardProps = Readonly<{ fatecEmail: string }>;

export function AccountDataCard({ fatecEmail }: AccountDataCardProps) {
  return (
    <SectionCard title={C.ACCOUNT_DATA_TITLE} icon={<PersonIcon fontSize="small" />} grow>
      <CardSubsection title={C.ACCOUNT_DATA_SUBSECTIONS.personal}>
        <PersonalDataFields fatecEmail={fatecEmail} />
      </CardSubsection>

      <CardSubsection title={C.ACCOUNT_DATA_SUBSECTIONS.contact}>
        <FormGrid>
          <ContactSection />
        </FormGrid>
      </CardSubsection>
    </SectionCard>
  );
}
