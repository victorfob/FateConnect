import type { PageQuery } from '../types';

/** Valores canônicos alinhados à serialização do backend, na lista e no hub. */
export enum InAppNotificationTypeEnum {
  REPORT_RECEIVED = 'ReportReceived',
  RIDE_TO_NEIGHBORHOOD = 'RideToNeighborhood',
  ITEM_ARCHIVED = 'ItemArchived',
  PUBLICATION_REMOVED = 'PublicationRemoved',
}

export type InAppNotification = {
  id: number;
  type: InAppNotificationTypeEnum;
  /** O texto é gravado pela API no momento do aviso; o front só o exibe. */
  content: string;
  /** O identificador da denúncia, da carona ou do item. */
  referenceId: string | null;
  isRead: boolean;
  createdAt: string;
};

export interface InAppNotificationFilter extends PageQuery {
  isRead?: boolean;
  type?: InAppNotificationTypeEnum;
}

/** O que a API guarda de cada aparelho: o endereço do serviço de push e as chaves dele. */
export type PushSubscriptionKeys = { endpoint: string; p256dh: string; auth: string };
