import SvgIcon from '@mui/material/SvgIcon';

import IncognitoArt from './assets/incognito.svg?react';

/**
 * Desenhado aqui porque o conjunto do Material não tem símbolo de anonimato:
 * chapéu e óculos são a convenção que a web usa para ele. O `SvgIcon` é o que
 * faz o desenho aceitar `fontSize` e `color` como os outros ícones.
 */
export function IncognitoIcon() {
  return <SvgIcon component={IncognitoArt} inheritViewBox />;
}
