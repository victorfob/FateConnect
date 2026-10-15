import { apiClient } from '../httpClient';
import type { PushSubscriptionKeys } from './types';

const PUSH_PATH = '/inappnotifications/push';

const INVALID_KEY_PAYLOAD_MESSAGE = 'A API de push respondeu algo que não é uma chave.';

export async function getPushPublicKey(): Promise<string> {
  const { data } = await apiClient.get<{ publicKey: string }>(`${PUSH_PATH}/public-key`);

  // Sem endereço de API a requisição cai no dev server, que responde HTML com 200.
  if (typeof data?.publicKey !== 'string') throw new Error(INVALID_KEY_PAYLOAD_MESSAGE);

  return data.publicKey;
}

export async function savePushSubscription(subscription: PushSubscriptionKeys): Promise<void> {
  await apiClient.put(`${PUSH_PATH}/subscriptions`, subscription);
}
