import { LandingSectionEnum } from '@app/routes/paths';

import { LandingDescription } from './components/LandingDescription';
import { LandingHowItWorks } from './components/LandingHowItWorks';
import { LandingLoginCard } from './components/LandingLoginCard';
import { LandingServices } from './components/LandingServices';
import * as C from './constants';
import * as S from './styles';

export function Home() {
  return (
    <S.HomeRoot>
      <S.DescriptionContainer component="section" aria-label={C.DESCRIPTION_SECTION_LABEL}>
        <LandingDescription />
        <S.LoginAnchor id={LandingSectionEnum.LOGIN}>
          <LandingLoginCard />
        </S.LoginAnchor>
      </S.DescriptionContainer>

      <S.ServicesContainer component="section" aria-label={C.SERVICES_SECTION_LABEL}>
        <LandingServices />
      </S.ServicesContainer>

      <LandingHowItWorks />
    </S.HomeRoot>
  );
}
