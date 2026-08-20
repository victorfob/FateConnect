import {
  Box,
  desktopMedia,
  radius,
  radiusScale,
  shadowTokens,
  spacing,
  spacingScale,
  Stack,
  styled,
  Typography,
} from '@design-system';
import type { PolymorphicProps } from '@design-system';
import type { FormHTMLAttributes } from 'react';

const { none, md, xl, xxl } = spacingScale;

/** Grade de seis colunas no desktop: combina metades, terços e a linha rua + número. */
const DESKTOP_COLUMNS = 6;
const SUBMIT_HEIGHT_PX = 40;
const SUBMIT_MAX_WIDTH_REM = 20;
const CARD_MAX_WIDTH_MOBILE = '90%';
const CARD_MAX_WIDTH_DESKTOP = '80%';
const HAIRLINE = '1px';
/** 2.5rem — sem token equivalente na escala, que salta de 32px para 48px. */
const PAGE_BOTTOM_PADDING_PX = 40;
/** Espaço entre a pergunta e o link de login, como no produto. */
const LOGIN_ROW_GAP = '0.35rem';

export const PageRoot = styled(Stack)<PolymorphicProps>({
  flexDirection: 'row',
  flex: 1,
  justifyContent: 'center',
  padding: spacing(xl, md, PAGE_BOTTOM_PADDING_PX),
  width: '100%',
  boxSizing: 'border-box',
});

export const SignupCard = styled(Stack)<PolymorphicProps>(({ theme }) => ({
  flexDirection: 'column',
  gap: spacing(md),
  width: '100%',
  maxWidth: CARD_MAX_WIDTH_MOBILE,
  padding: spacing(xl),
  background: theme.palette.background.paper,
  borderRadius: radius(radiusScale.component),
  boxShadow: shadowTokens.component,
  boxSizing: 'border-box',

  [desktopMedia]: {
    padding: spacing(xl, xxl),
    maxWidth: CARD_MAX_WIDTH_DESKTOP,
  },
}));

export const CardTitle = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.primary,
  textAlign: 'center',
}));

export const SectionTitle = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.primary,
}));

export const SignupForm = styled(Stack)<PolymorphicProps & FormHTMLAttributes<HTMLFormElement>>({
  flexDirection: 'column',
});

export const SectionDivider = styled(Box)<PolymorphicProps>(({ theme }) => ({
  width: '100%',
  height: HAIRLINE,
  backgroundColor: theme.palette.divider,
  margin: spacing(xl, none, md),
}));

export const FieldGrid = styled(Box)<PolymorphicProps>(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: '1fr',
  gap: spacing(md),
  marginTop: spacing(md),
  // Impede que campos da mesma linha estiquem quando o vizinho exibe erro.
  alignItems: 'start',

  '& .MuiInputAdornment-root svg': { color: theme.palette.text.secondary },

  [desktopMedia]: {
    gridTemplateColumns: `repeat(${DESKTOP_COLUMNS}, minmax(0, 1fr))`,
  },
}));

/** Ocupa a linha inteira, em qualquer largura. */
export const FullWidthCell = styled(Box)<PolymorphicProps>({
  gridColumn: '1 / -1',
  width: '100%',
});

/** Metade da linha no desktop: 3 de 6 colunas. */
export const HalfWidthCell = styled(Box)<PolymorphicProps>({
  width: '100%',

  [desktopMedia]: { gridColumn: 'span 3' },
});

/** Um terço da linha no desktop: 2 de 6 colunas. */
export const ThirdWidthCell = styled(Box)<PolymorphicProps>({
  width: '100%',

  [desktopMedia]: { gridColumn: 'span 2' },
});

/** Logradouro ocupa 4 de 6 colunas; o número fica ao lado. */
export const StreetCell = styled(Box)<PolymorphicProps>({
  width: '100%',

  [desktopMedia]: { gridColumn: '1 / span 4' },
});

export const StreetNumberCell = styled(Box)<PolymorphicProps>({
  width: '100%',

  [desktopMedia]: { gridColumn: '5 / span 2' },
});

export const SubmitContainer = styled(Stack)<PolymorphicProps>({
  marginTop: spacing(md),
  flexDirection: 'column',
  gap: spacing(md),

  '& .MuiButton-root': {
    width: '100%',
    maxWidth: `${SUBMIT_MAX_WIDTH_REM}rem`,
    alignSelf: 'center',
    height: `${SUBMIT_HEIGHT_PX}px`,
    borderRadius: radius(radiusScale.component),
  },
});

export const LoginRow = styled(Stack)<PolymorphicProps>(({ theme }) => ({
  flexDirection: 'row',
  flexWrap: 'wrap',
  gap: LOGIN_ROW_GAP,
  justifyContent: 'center',
  textAlign: 'center',
  color: theme.palette.text.secondary,

  '& a': {
    // Sem `inline-flex` a âncora impõe a entrelinha do corpo (24px) e a linha
    // fica mais alta que a do produto, que segue a altura do próprio texto.
    display: 'inline-flex',
    color: theme.palette.secondary.main,
    textDecoration: 'none',
  },
  '& a:hover': {
    textDecoration: 'underline',
    textDecorationColor: theme.palette.secondary.main,
  },
}));
