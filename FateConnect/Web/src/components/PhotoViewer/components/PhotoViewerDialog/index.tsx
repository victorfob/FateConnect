import { Dialog } from '@design-system';

import type { PhotoSource } from '../../@types/photoSource';
import { OriginalPhoto } from './OriginalPhoto';

export type PhotoViewerDialogProps = Readonly<{
  open: boolean;
  onClose: VoidFunction;
  title: string;
  source: PhotoSource;
  alt: string;
}>;

export function PhotoViewerDialog({ open, onClose, title, source, alt }: PhotoViewerDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} title={title}>
      <Dialog.Body>
        {/* Montada só com o diálogo aberto: a original é buscada ao abrir e devolvida ao fechar. */}
        <OriginalPhoto source={source} alt={alt} />
      </Dialog.Body>
    </Dialog>
  );
}
