import Typography from '@mui/material/Typography';

import { PageContainer } from './styles';

/**
 * Placeholder da aplicação enquanto as telas não são migradas (#50 em diante).
 * Serve também de conferência visual da escala tipográfica do tema.
 */
export function App() {
  return (
    <PageContainer>
      <Typography variant="h1">FateConnect</Typography>
      <Typography variant="h2">Front React em construção</Typography>
      <Typography variant="subtitle">Migração acompanhada pela issue #47.</Typography>
      <Typography variant="subtitleBold">Escala tipográfica do design system</Typography>
      <Typography variant="caption">Legenda em peso normal</Typography>
      <Typography variant="captionBold">Legenda em peso forte</Typography>
      <Typography variant="logo">FateConnect</Typography>
    </PageContainer>
  );
}
