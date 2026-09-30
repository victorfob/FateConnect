import { Button, spacingScale, styled } from '@design-system';

const { xxs } = spacingScale;

/** Escolher a foto é um controle do formulário: a borda é a dos campos ao lado. */
export const PhotoPickButton = styled(Button)(({ theme }) => ({
  gap: theme.space(xxs),
  borderColor: theme.palette.inputOutline,
}));

export const PhotoRemoveButton = styled(Button)(({ theme }) => ({
  gap: theme.space(xxs),
}));
