import { REGISTER_CONTACTS_LABEL } from '@app/components/ContactRequiredDialog/constants';
import { InlineLink } from '@app/components/InlineLink';
import { RoutePathEnum } from '@app/routes/paths';

import { MISSING_CONTACT_NOTE } from './constants';
import * as S from './styles';

export function MissingContactNote() {
  return (
    <S.NoteText variant="caption" component="p">
      {MISSING_CONTACT_NOTE}{' '}
      <InlineLink to={RoutePathEnum.PROFILE}>{REGISTER_CONTACTS_LABEL}</InlineLink>
    </S.NoteText>
  );
}
