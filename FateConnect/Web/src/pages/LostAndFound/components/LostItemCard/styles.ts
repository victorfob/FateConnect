import {
  Box,
  compactMedia,
  iconSizeTokens,
  radius,
  radiusScale,
  shadowTokens,
  spacing,
  spacingScale,
  Stack,
  styled,
  type PolymorphicProps,
} from '@design-system';

const { xxs, sm, md } = spacingScale;

/** Espaço entre as informações do item, em unidade de viewport como no produto. */
const INFO_ROW_GAP = '5vw';
const PHOTO_SIZE_PX = 96;

export const CardRoot = styled(Stack)<PolymorphicProps>(({ theme }) => ({
  flexDirection: 'row',
  alignItems: 'flex-start',
  gap: spacing(md),
  width: '100%',
  marginBottom: spacing(md),
  padding: spacing(md),
  borderRadius: radius(radiusScale.component),
  boxShadow: shadowTokens.component,
  background: theme.palette.background.paper,
  color: theme.palette.text.primary,

  [compactMedia]: { flexDirection: 'column' },
}));

export const Photo = styled('img')({
  width: `${PHOTO_SIZE_PX}px`,
  height: `${PHOTO_SIZE_PX}px`,
  flexShrink: 0,
  objectFit: 'cover',
  borderRadius: radius(radiusScale.md),
});

/** Sem foto o espaço continua ocupado, para o cartão não mudar de altura. */
export const PhotoPlaceholder = styled(Stack)<PolymorphicProps>(({ theme }) => ({
  width: `${PHOTO_SIZE_PX}px`,
  height: `${PHOTO_SIZE_PX}px`,
  flexShrink: 0,
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: radius(radiusScale.md),
  background: theme.palette.background.default,

  '& svg': {
    color: theme.palette.text.secondary,
    fontSize: `${iconSizeTokens.lg}px`,
  },
}));

export const CardBody = styled(Stack)<PolymorphicProps>({
  flexDirection: 'column',
  flexGrow: 1,
  minWidth: 0,
});

export const HeaderRow = styled(Stack)<PolymorphicProps>({
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: spacing(sm),
  marginBottom: spacing(sm),
});

export const InfoRow = styled(Stack)<PolymorphicProps>(({ theme }) => ({
  flexDirection: 'row',
  gap: INFO_ROW_GAP,
  marginBottom: spacing(sm),
  color: theme.palette.text.secondary,
}));

export const InfoItem = styled(Stack)<PolymorphicProps>(({ theme }) => ({
  flexDirection: 'row',
  alignItems: 'center',
  gap: spacing(xxs),

  '& svg': {
    color: theme.palette.secondary.main,
    fontSize: `${iconSizeTokens.sm}px`,
  },
}));

export const Description = styled(Box)<PolymorphicProps>(({ theme }) => ({
  color: theme.palette.text.secondary,
}));

/** As etiquetas acompanham o cabeçalho no desktop e descem no estreito. */
export const WideOnlyTags = styled(Box)<PolymorphicProps>({
  display: 'block',

  [compactMedia]: { display: 'none' },
});

export const CompactOnlyTags = styled(Box)<PolymorphicProps>({
  display: 'none',

  [compactMedia]: {
    display: 'flex',
    justifyContent: 'flex-end',
    paddingTop: spacing(sm),
  },
});
