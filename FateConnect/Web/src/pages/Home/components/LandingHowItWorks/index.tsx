import { Typography } from '@design-system';

import { LandingSectionEnum } from '@app/routes/paths';

import { HOW_IT_WORKS_STEPS, HOW_IT_WORKS_TITLE } from './constants';
import * as S from './styles';

const HEADING_ID = 'como-funciona-heading';

export function LandingHowItWorks() {
  return (
    <S.HowSection
      component="section"
      id={LandingSectionEnum.HOW_IT_WORKS}
      aria-labelledby={HEADING_ID}
    >
      <S.SectionTitle>
        <Typography variant="h1" id={HEADING_ID}>
          {HOW_IT_WORKS_TITLE}
        </Typography>
      </S.SectionTitle>

      <S.StepsGrid>
        {HOW_IT_WORKS_STEPS.map(({ number, title, description }) => (
          <S.StepCard component="article" key={number}>
            <S.StepBadge component="span" aria-hidden="true">
              {number}
            </S.StepBadge>
            <S.StepBody>
              <S.StepTitle>
                <Typography variant="h2">{title}</Typography>
              </S.StepTitle>
              <S.StepDescription>
                <Typography variant="subtitle">{description}</Typography>
              </S.StepDescription>
            </S.StepBody>
          </S.StepCard>
        ))}
      </S.StepsGrid>
    </S.HowSection>
  );
}
