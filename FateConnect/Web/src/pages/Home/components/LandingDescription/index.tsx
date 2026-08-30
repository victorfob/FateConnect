import { Typography } from '@design-system';

import * as C from './constants';
import * as S from './styles';

export function LandingDescription() {
  return (
    <S.DescriptionRoot>
      <S.TitleContainer>
        <Typography variant="h1">{C.DESCRIPTION_TITLE}</Typography>
      </S.TitleContainer>

      <S.Lead component="p">
        <Typography variant="subtitle">{C.DESCRIPTION_LEAD}</Typography>
      </S.Lead>

      <S.HighlightList component="ul" aria-label={C.HIGHLIGHT_LIST_LABEL}>
        {C.DESCRIPTION_HIGHLIGHTS.map(({ label, Icon }) => (
          <S.HighlightItem component="li" key={label}>
            <S.IconDisc component="span" aria-hidden="true">
              <Icon />
            </S.IconDisc>
            <Typography variant="subtitleBold">{label}</Typography>
          </S.HighlightItem>
        ))}
      </S.HighlightList>
    </S.DescriptionRoot>
  );
}
