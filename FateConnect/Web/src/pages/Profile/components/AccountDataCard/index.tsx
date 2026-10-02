import { FormGrid, SectionCard } from '@design-system';
import { PersonIcon } from '@design-system/icons';

import { ContactFields } from '@app/components/ContactFields';

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
          <ContactFields />
        </FormGrid>
      </CardSubsection>
    </SectionCard>
  );
}
