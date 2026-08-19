import { Typography } from '@design-system';

import { DESCRIPTION_HIGHLIGHTS, DESCRIPTION_LEAD, DESCRIPTION_TITLE } from './constants';
import * as S from './styles';

export function LandingDescription() {
  return (
    <S.DescriptionRoot>
      <S.TitleContainer>
        <Typography variant="h1">{DESCRIPTION_TITLE}</Typography>
      </S.TitleContainer>

      <S.Lead component="p">
        <Typography variant="subtitle">{DESCRIPTION_LEAD}</Typography>
      </S.Lead>

      <S.HighlightList component="ul" aria-label="Destaques do FateConnect">
        {DESCRIPTION_HIGHLIGHTS.map(({ label, Icon }) => (
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
