import { CheckCircleIcon, SearchIcon, type SvgIconComponent } from '@design-system/icons';

import { ReportStatusEnum } from '@app/services/reports/types';

type AdvanceAction = Readonly<{ label: string; Icon: SvgIconComponent }>;

/** Pela situação de destino: nomeia o botão e intitula o diálogo que o confirma. */
export const ADVANCE_ACTIONS: Readonly<Partial<Record<ReportStatusEnum, AdvanceAction>>> = {
  [ReportStatusEnum.IN_REVIEW]: { label: 'Iniciar análise', Icon: SearchIcon },
  [ReportStatusEnum.RESOLVED]: { label: 'Marcar como resolvida', Icon: CheckCircleIcon },
};
