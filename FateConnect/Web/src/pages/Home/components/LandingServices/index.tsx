import { Typography } from '@design-system';

import { LandingSectionEnum } from '@app/routes/paths';

import { SERVICE_CARDS, SERVICES_TITLE } from './constants';
import * as S from './styles';

const HEADING_ID = 'servicos-heading';

export function LandingServices() {
  return (
    <S.ServicesSection
      component="section"
      id={LandingSectionEnum.SERVICES}
      aria-labelledby={HEADING_ID}
    >
      <S.SectionTitle>
        <Typography variant="h1" id={HEADING_ID}>
          {SERVICES_TITLE}
        </Typography>
      </S.SectionTitle>

      <S.CardsGrid>
        {SERVICE_CARDS.map(({ title, description, Icon }) => (
          <S.ServiceCardRoot component="article" key={title}>
            <S.IconContainer aria-hidden="true">
              <Icon />
            </S.IconContainer>
            <S.CardTitle>
              <Typography variant="h2">{title}</Typography>
            </S.CardTitle>
            <S.CardBody>
              <Typography variant="subtitle">{description}</Typography>
            </S.CardBody>
          </S.ServiceCardRoot>
        ))}
      </S.CardsGrid>
    </S.ServicesSection>
  );
}
